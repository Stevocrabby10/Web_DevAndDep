// /app/controller/api.js
import express from 'express';
import http from 'http';
import * as model from '../model/db.js';
import validator from 'validator';
import bcrypt from 'bcrypt';
import { RedisStore } from 'connect-redis';
import session from 'express-session';
import { createClient } from 'redis';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const saltRounds = 10;

// emulate __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// static files (index.html, login_logout.js, etc.)
app.use(express.static(path.join(__dirname, "..", "view")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- Redis client + Store ----
let redisClient = createClient();
redisClient.connect().catch(console.error);

let redisStore = new RedisStore({
  client: redisClient,
  prefix: "myapp:",
});

// ---- Session middleware ----
app.use(
  session({
    store: redisStore,
    resave: false,
    saveUninitialized: false,
    secret: "keyboard cat",
  }),
);

http.createServer(app).listen(3000, function () {
  console.log("Server running on http://localhost:3000/");
});

// Home route (served by express.static anyway)
app.get("/", function (req, res) {
  // res.sendFile(path.join(__dirname, "..", "view", "index.html"));
});

// Serve HTML pages for clean URLs
app.get("/register", function (req, res) {
  res.sendFile(path.join(__dirname, "..", "view", "register.html"));
});

app.get("/profile", function (req, res) {
  res.sendFile(path.join(__dirname, "..", "view", "profile.html"));
});

app.get("/leagues", function (req, res) {
  res.sendFile(path.join(__dirname, "..", "view", "leagues.html"));
});

app.get("/rankings", function (req, res) {
  res.sendFile(path.join(__dirname, "..", "view", "rankings.html"));
});

let users = [];

const cb1 = function (req, res, next) {
  console.log('Handler 1');
  if (req.session.user == null){
      res.json({msg: "Please Log In First"});
  } else next();
};

const cb2 = function (req, res) {
  console.log('Handler 2');
  model.selectUsers(function(response){
      console.log("From server:" + JSON.stringify(response));
      users = response;
      res.json(users);
  });
};

const cb3 = function (req, res) {
  console.log('Handler 3');
  model.selectUser(req.params.userId, function(response){
      console.log("From server:" + JSON.stringify(response));
      users = response;
      res.json(users);
  });
};

app.get('/users', [cb1, cb2]);
app.get('/users/:userId', [cb1, cb3]);

app.post("/login", function (req, res) {
  let user = req.body.user || req.body.username;
  let pwd  = req.body.pwd || req.body.password;

  if (!user || !pwd){
      res.status(400).send({msg: "Please provide username and password"});
      return;
  }

  // sanitize username
  user = validator.blacklist(user, '/\\{}:;');

  console.log("user: " + user + " pwd: " + pwd);

  // Fetch stored hashed password for that user
  model.selectUserPwd(user, function(response){
      if (!response || response.length === 0) {
          res.status(401).send({msg: "Invalid username or password"});
          return;
      }

      const mySavedPwd = response[0].password;
      console.log("Saved pwd: " + mySavedPwd);

      bcrypt.compare(pwd, mySavedPwd, function(err, result){
          if(result) {
              // Passwords match
              console.log("Logged In.");
              req.session.user = user;

              console.log("req.session.user: " + req.session.user);
              res.send({msg: "Welcome, " + user});
          }
          else {
              // Passwords don't match
              console.log("Sorry.");
              res.status(401).send({msg: "Invalid username or password"});
          }
      });
  });
});

app.get("/logout", function (req, res){
  req.session.destroy(function (err) {
      if (err) {
          return console.log(err);
      }
      res.send({msg: "You have been logged out."});
  });
});

app.post("/register", function (req, res) {
  let user    = req.body.user || req.body.username;
  let pwd     = req.body.pwd || req.body.password;
  let address = req.body.address;

  if (!user || !pwd) {
    res.send({ msg: "Please provide username and password" });
    return;
  }

  // sanitize inputs
  user    = validator.blacklist(user, '/\{}:;');
  address = address ? validator.escape(address) : null;

  // Check if username already exists
  model.selectUserPwd(user, function (existing) {
    if (existing && existing.length > 0) {
      res.send({ msg: "Username already taken" });
      return;
    }

    // hash and insert
    bcrypt.hash(pwd, saltRounds, function (err, hash) {
      if (err) {
        console.error(err);
        res.status(500).send({ msg: "Error registering user" });
        return;
      }

      model.insertUser(user, hash, address, function () {
        // Automatically log in the user after registration
        req.session.user = user;
        res.send({ msg: "Registration successful. Welcome, " + user + "!" });
      });
    });
  });
});

// Get current user info (requires session)
app.get("/current-user", function (req, res) {
  if (req.session.user == null) {
    res.status(401).send({ msg: "Not logged in" });
    return;
  }

  const username = req.session.user;
  model.selectUserByUsername(username, function (response) {
    if (!response || response.length === 0) {
      res.status(404).send({ msg: "User not found" });
      return;
    }
    res.json({ username: response[0].username, address: response[0].address });
  });
});

// Delete user account (requires session)
app.delete("/delete-account", function (req, res) {
  if (req.session.user == null) {
    res.status(401).send({ msg: "Please log in first" });
    return;
  }

  const username = req.session.user;
  
  model.deleteUser(username, function (result) {
    req.session.destroy(function (err) {
      if (err) {
        console.error(err);
        res.status(500).send({ msg: "Error deleting account" });
        return;
      }
      res.send({ msg: "Account deleted successfully" });
    });
  });
});

// Update user profile (requires session)
app.put("/profile", function (req, res) {
  if (req.session.user == null) {
    res.status(401).send({ msg: "Please log in first" });
    return;
  }

  const currentUsername = req.session.user;
  let newUsername = req.body.username || req.body.newUsername;
  let address = req.body.address;

  if (!newUsername) {
    res.status(400).send({ msg: "Username is required" });
    return;
  }

  // sanitize inputs
  newUsername = validator.blacklist(newUsername, '/\\{}:;');
  address =
    typeof address === "string" && address.length > 0
      ? validator.escape(address)
      : null;

  const performUpdate = () => {
    model.updateUser(currentUsername, newUsername, address, function () {
      req.session.user = newUsername;
      res.send({ msg: "Profile updated successfully" });
    });
  };

  if (newUsername !== currentUsername) {
    // Ensure new username is not taken
    model.selectUserPwd(newUsername, function (existing) {
      if (existing && existing.length > 0) {
        res.status(409).send({ msg: "Username already taken" });
        return;
      }
      performUpdate();
    });
  } else {
    performUpdate();
  }
});

