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

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('Redis Client Connected');
});

redisClient.connect().catch((err) => {
  console.error('Failed to connect to Redis:', err);
  console.error('WARNING: Sessions may not persist without Redis!');
});

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
    name: 'sessionId', // Custom session cookie name
    cookie: {
      secure: false, // Set to true if using HTTPS
      httpOnly: true, // Prevent XSS attacks
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax' // CSRF protection
    }
  }),
);

// Handle uncaught exceptions to prevent crashes
process.on('uncaughtException', function(err) {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', function(reason, promise) {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

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

let users = [];

const cb1 = function (req, res, next) {
  console.log('Handler 1');
  if (req.session.user == null){
      res.json({msg: "Please Log In First"});
  } else next();
};

// Authentication middleware for private routes
const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ msg: "Please Log In First" });
  }
  next();
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
      return res.status(400).json({msg: "Please provide username and password"});
  }

  // sanitize username
  user = validator.blacklist(user, '/\\{}:;');

  console.log("=== LOGIN ATTEMPT ===");
  console.log("user: " + user);

  // Track if response has been sent to avoid multiple responses
  let responseSent = false;
  
  // Set a timeout to prevent hanging requests (10 seconds)
  const timeout = setTimeout(() => {
    if (!responseSent) {
      responseSent = true;
      console.error("Login request timed out");
      return res.status(500).json({msg: "Request timeout. Please try again."});
    }
  }, 10000);

  // Helper function to send response safely
  const sendResponse = (statusCode, data) => {
    if (!responseSent) {
      clearTimeout(timeout);
      responseSent = true;
      return res.status(statusCode).json(data);
    }
  };

  // Fetch stored hashed password for that user
  // Wrap in try-catch to handle any synchronous errors
  try {
    console.log("Querying database for user:", user);
    model.selectUserPwd(user, function(response){
        console.log("Database callback received");
        // Handle potential database errors that weren't caught
        if (responseSent) return;
        
        if (!response || response.length === 0) {
            console.log("User not found or no password");
            return sendResponse(401, {msg: "Invalid username or password"});
        }

        const mySavedPwd = response[0].password;
        if (!mySavedPwd) {
            console.log("No password in database response");
            return sendResponse(401, {msg: "Invalid username or password"});
        }

        console.log("Password found, comparing...");

        bcrypt.compare(pwd, mySavedPwd, function(err, result){
            if (responseSent) return;
            
            if (err) {
                console.error("Bcrypt compare error:", err);
                return sendResponse(500, {msg: "Error during authentication"});
            }

            if(result) {
                // Passwords match
                console.log("=== LOGIN SUCCESS ===");
                console.log("Setting session user to:", user);
                
                req.session.user = user;
                console.log("Session ID:", req.sessionID);
                console.log("Session user set to:", req.session.user);
                
                // Save session with timeout protection
                const saveTimeout = setTimeout(() => {
                  if (!responseSent) {
                    console.error("Session save timed out");
                    // Still send response even if session save fails
                    responseSent = true;
                    clearTimeout(timeout);
                    return res.status(200).json({msg: "Welcome, " + user + " (session may not persist)"});
                  }
                }, 3000);
                
                // Save session explicitly to ensure it's persisted
                req.session.save(function(err) {
                    clearTimeout(saveTimeout);
                    if (responseSent) return;
                    
                    if (err) {
                        console.error("Error saving session:", err);
                        // Still allow login even if session save fails
                        console.log("Allowing login despite session save error");
                        return sendResponse(200, {msg: "Welcome, " + user + " (session may not persist)"});
                    }
                    console.log("Session saved successfully");
                    return sendResponse(200, {msg: "Welcome, " + user});
                });
            }
            else {
                // Passwords don't match
                console.log("Password mismatch");
                return sendResponse(401, {msg: "Invalid username or password"});
            }
        });
    });
  } catch (error) {
    console.error("Login error:", error);
    clearTimeout(timeout);
    if (!responseSent) {
      responseSent = true;
      return res.status(500).json({msg: "Error during authentication"});
    }
  }
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

// Diagnostic endpoint to check session
app.get("/session-test", function (req, res) {
  console.log("=== SESSION TEST ===");
  console.log("Session ID:", req.sessionID);
  console.log("Session:", JSON.stringify(req.session, null, 2));
  console.log("Session user:", req.session.user);
  res.json({
    sessionID: req.sessionID,
    session: req.session,
    hasUser: !!req.session.user,
    user: req.session.user || null
  });
});

// Get current user info (requires session)
app.get("/current-user", function (req, res) {
  console.log("=== /current-user request ===");
  console.log("Session ID:", req.sessionID);
  console.log("Session user:", req.session.user);
  console.log("Session:", JSON.stringify(req.session));
  
  // Track if response has been sent to avoid multiple responses
  let responseSent = false;

  // Helper function to send response safely
  const sendResponse = (statusCode, data) => {
    if (!responseSent) {
      responseSent = true;
      console.log("Sending response:", statusCode, data);
      return res.status(statusCode).json(data);
    }
  };

  if (req.session.user == null || req.session.user === undefined) {
    console.log("No session user found");
    return sendResponse(401, { msg: "Not logged in" });
  }

  const username = req.session.user;
  console.log("Looking up user:", username);
  
  try {
    model.selectUserByUsername(username, function (response) {
      if (responseSent) return;

      console.log("Database response:", response);

      // Handle database errors that weren't caught
      if (!response) {
        console.error("Database returned null/undefined response");
        return sendResponse(500, { msg: "Error retrieving user data" });
      }

      if (response.length === 0) {
        console.log("User not found in database:", username);
        return sendResponse(404, { msg: "User not found" });
      }

      if (!response[0] || !response[0].username) {
        console.error("Invalid user data structure:", response);
        return sendResponse(500, { msg: "Error retrieving user data" });
      }

      console.log("Successfully retrieved user data");
      return sendResponse(200, { 
        username: response[0].username, 
        address: response[0].address || null 
      });
    });
  } catch (error) {
    console.error("Error in /current-user:", error);
    return sendResponse(500, { msg: "Error retrieving user data" });
  }
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

// ============================================
// REVIEWS ROUTES - Public vs Private
// ============================================

// PRIVATE ROUTE: Get all reviews (login required)
app.get("/leagues/reviews", requireLogin, function (req, res) {
  model.selectReviews(function (dbResponse) {
    res.json(dbResponse);
  });
});

// PRIVATE ROUTE: Create a new review (requires login)
app.post("/leagues/reviews", requireLogin, function (req, res) {
  const username = req.session.user;
  const { league_name, rating, comment } = req.body;

  if (!league_name || !rating || !comment) {
    return res.status(400).json({ msg: "Please provide league_name, rating, and comment" });
  }

  // Sanitize inputs
  const sanitizedLeagueName = validator.escape(league_name);
  const sanitizedComment = validator.escape(comment);
  const ratingNum = parseInt(rating);

  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ msg: "Rating must be a number between 1 and 5" });
  }

  const review = {
    league_name: sanitizedLeagueName,
    reviewer: username,
    rating: ratingNum,
    comment: sanitizedComment
  };

  model.insertReview(review, function (id) {
    res.json({ msg: "Review added", id });
  });
});

// PRIVATE ROUTE: Update a review (requires login)
app.put("/leagues/reviews/:id", requireLogin, function (req, res) {
  const { league_name, rating, comment } = req.body;

  if (!league_name || !rating || !comment) {
    return res.status(400).json({ msg: "Please provide league_name, rating, and comment" });
  }

  // Sanitize inputs
  const sanitizedLeagueName = validator.escape(league_name);
  const sanitizedComment = validator.escape(comment);
  const ratingNum = parseInt(rating);

  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ msg: "Rating must be a number between 1 and 5" });
  }

  model.updateReview(
    req.params.id,
    { league_name: sanitizedLeagueName, rating: ratingNum, comment: sanitizedComment },
    function () {
      res.json({ msg: "Review updated" });
    }
  );
});

// PRIVATE ROUTE: Delete a review (requires login)
app.delete("/leagues/reviews/:id", requireLogin, function (req, res) {
  model.deleteReview(req.params.id, function () {
    res.json({ msg: "Review deleted" });
  });
});

// Error handling middleware - must be after all routes
app.use(function(err, req, res, next) {
  console.error('Error:', err);
  // Ensure JSON response even for errors
  if (!res.headersSent) {
    res.status(err.status || 500).json({
      msg: err.message || 'Internal server error'
    });
  }
});

