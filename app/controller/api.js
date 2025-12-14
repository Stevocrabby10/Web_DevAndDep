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

// User-specific lists: current leagues, upcoming matches, previous leagues
app.get('/user/leagues', function (req, res) {
  if (!req.session.user) {
    res.status(401).send({ msg: 'Please log in' });
    return;
  }
  const username = req.session.user;
  model.selectUserLeagues(username, function (result) {
    res.json(result || []);
  });
});

app.get('/user/next-matches', function (req, res) {
  if (!req.session.user) {
    res.status(401).send({ msg: 'Please log in' });
    return;
  }
  const username = req.session.user;
  model.selectUserNextMatches(username, function (result) {
    res.json(result || []);
  });
});

app.get('/user/previous-leagues', function (req, res) {
  if (!req.session.user) {
    res.status(401).send({ msg: 'Please log in' });
    return;
  }
  const username = req.session.user;
  model.selectUserPreviousLeagues(username, function (result) {
    res.json(result || []);
  });
});

// API: get league standings and basic info by slug
app.get('/api/league/:slug', function (req, res) {
  const slug = req.params.slug;
  if (!slug) return res.status(400).send({ msg: 'Slug required' });
  model.selectLeagueStandingsBySlug(slug, function (result) {
    if (!result) {
      console.error('selectLeagueStandingsBySlug returned null for', slug);
      return res.status(500).send({ msg: 'Error fetching standings' });
    }
    if (result.error) {
      console.error('selectLeagueStandingsBySlug error for', slug, result);
      if (result.error === 'no_league') return res.status(404).send({ msg: 'League not found' });
      return res.status(500).send({ msg: result.message || 'Error fetching standings' });
    }
    res.json(result);
  });
});

// GET reviews for a league
app.get('/api/league/:slug/reviews', function (req, res) {
  const slug = req.params.slug;
  if (!slug) return res.status(400).send({ msg: 'Slug required' });
  if (!model.selectReviewsByLeagueSlug) return res.status(501).send({ msg: 'Reviews not supported' });
  model.selectReviewsByLeagueSlug(slug, function (rows) {
    res.json(rows || []);
  });
});

// DELETE a review by id (only owner allowed)
app.delete('/api/reviews/:id', function (req, res) {
  if (!req.session.user) return res.status(401).send({ msg: 'Please log in' });
  const id = req.params.id;
  if (!id) return res.status(400).send({ msg: 'Review id required' });
  if (!model.deleteReviewByIdIfOwner) return res.status(501).send({ msg: 'Review deletion not supported' });
  const username = req.session.user;
  model.deleteReviewByIdIfOwner(username, id, function (result) {
    if (!result) return res.status(500).send({ msg: 'Error deleting review' });
    if (result.error) return res.status(500).send({ msg: result.error });
    if (result.deleted && result.deleted > 0) return res.json({ msg: 'Deleted' });
    return res.status(403).send({ msg: 'Not authorized or not found' });
  });
});

// Create a review for a league
app.post('/api/league/:slug/reviews', function (req, res) {
  if (!req.session.user) return res.status(401).send({ msg: 'Please log in' });
  const slug = req.params.slug;
  if (!slug) return res.status(400).send({ msg: 'Slug required' });
  if (!model.addReviewToLeagueBySlug) return res.status(501).send({ msg: 'Review creation not supported' });
  const username = req.session.user;
  const rating = typeof req.body.rating === 'number' ? req.body.rating : parseInt(req.body.rating, 10) || 0;
  const text = req.body.text || req.body.comment || '';
  model.addReviewToLeagueBySlug(username, slug, rating, text, function (result) {
    if (!result) return res.status(500).send({ msg: 'Error creating review' });
    if (result.error) return res.status(500).send({ msg: result.error });
    return res.status(201).json({ msg: 'Created', id: result.insertId || result.insertId });
  });
});

// Update a review (owner only)
app.put('/api/reviews/:id', function (req, res) {
  if (!req.session.user) return res.status(401).send({ msg: 'Please log in' });
  const id = req.params.id;
  if (!id) return res.status(400).send({ msg: 'Review id required' });
  if (!model.updateReviewByIdIfOwner) return res.status(501).send({ msg: 'Review update not supported' });
  const username = req.session.user;
  const rating = typeof req.body.rating === 'number' ? req.body.rating : parseInt(req.body.rating, 10) || 0;
  const text = req.body.text || req.body.comment || '';
  model.updateReviewByIdIfOwner(username, id, rating, text, function (result) {
    if (!result) return res.status(500).send({ msg: 'Error updating review' });
    if (result.error) return res.status(500).send({ msg: result.error });
    if (result.updated && result.updated > 0) return res.json({ msg: 'Updated' });
    return res.status(403).send({ msg: 'Not authorized or not found' });
  });
});

// Join a league (requires session). Accepts { slug } in the JSON body.
app.post('/user/join-league', function (req, res) {
  if (!req.session.user) {
    res.status(401).send({ msg: 'Please log in' });
    return;
  }
  const slug = req.body.slug || req.body.league;
  if (!slug) {
    res.status(400).send({ msg: 'League slug required' });
    return;
  }
  const username = req.session.user;
  model.addUserToLeagueBySlug(username, slug, function (result) {
    if (!result) {
      res.status(500).send({ msg: 'Could not join league' });
      return;
    }
    if (result.inserted) {
      res.json({ msg: 'Joined league', inserted: true, username });
      return;
    }
    if (result.alreadyJoined) {
      res.json({ msg: 'Already a member', alreadyJoined: true, username });
      return;
    }
    if (result.error === 'no_user') {
      res.status(404).send({ msg: 'User not found' });
      return;
    }
    if (result.error === 'no_league') {
      res.status(404).send({ msg: 'League not found' });
      return;
    }
    res.status(500).send({ msg: 'Could not join league' });
  });
});

// Leave a league (requires session). Accepts { slug } in JSON body.
app.post('/user/leave-league', function (req, res) {
  if (!req.session.user) {
    res.status(401).send({ msg: 'Please log in' });
    return;
  }
  const slug = req.body.slug || req.body.league;
  if (!slug) {
    res.status(400).send({ msg: 'League slug required' });
    return;
  }
  const username = req.session.user;
  model.removeUserFromLeagueBySlug(username, slug, function (result) {
    if (!result) {
      res.status(500).send({ msg: 'Could not leave league' });
      return;
    }
    if (result.deleted && result.deleted > 0) {
      res.json({ msg: 'Left league', deleted: result.deleted });
      return;
    }
    if (result.error === 'no_user') {
      res.status(404).send({ msg: 'User not found' });
      return;
    }
    if (result.error === 'no_league') {
      res.status(404).send({ msg: 'League not found' });
      return;
    }
    res.json({ msg: 'Not a member' });
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

