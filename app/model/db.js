// /app/model/db.js
import details from '../config/mysql.js';
import mysql from 'mysql2';

export function selectUsers(callback) {
    const con = mysql.createConnection(details);

    con.connect(function (err) {
        if (err) throw err;
        con.query(
          'SELECT username, address FROM users',
          function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            callback(result);
          }
        );
    });
}

export function selectUser(id, callback) {
    const con = mysql.createConnection(details);

    con.connect(function (err) {
        if (err) throw err;
        con.execute(
          'SELECT username, address FROM users WHERE idusers=?',
          [id],
          function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            callback(result);
          }
        );
    });
}

export function selectUserPwd(username, callback) {
    const con = mysql.createConnection(details);

    con.connect(function (err) {
        if (err) {
            console.error("Database connection error:", err);
            callback(null);
            return;
        }
        con.execute(
          'SELECT password FROM users WHERE username=?',
          [username],
          function (err, result, fields) {
            if (err) {
                console.error("Database query error:", err);
                callback(null);
                return;
            }
            console.log("From DB: " + JSON.stringify(result));
            callback(result);
            con.end(); // Close the connection
          }
        );
    });
    
    // Handle connection errors
    con.on('error', function(err) {
        console.error("Database connection error:", err);
        callback(null);
    });
}

export function insertUser(username, hashedPwd, address, callback) {
    const con = mysql.createConnection(details);

    con.connect(function (err) {
        if (err) throw err;
        con.execute(
          'INSERT INTO users (username, password, address) VALUES (?, ?, ?)',
          [username, hashedPwd, address],
          function (err, result, fields) {
            if (err) throw err;
            console.log("Inserted user with id:", result.insertId);
            callback(result);
          }
        );
    });
}

export function deleteUser(username, callback) {
    const con = mysql.createConnection(details);

    con.connect(function (err) {
        if (err) throw err;
        con.execute(
          'DELETE FROM users WHERE username=?',
          [username],
          function (err, result, fields) {
            if (err) throw err;
            console.log("Deleted user:", username);
            callback(result);
          }
        );
    });
}

export function selectUserByUsername(username, callback) {
    const con = mysql.createConnection(details);

    con.connect(function (err) {
        if (err) throw err;
        con.execute(
          'SELECT username, address FROM users WHERE username=?',
          [username],
          function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            callback(result);
          }
        );
    });
}

export function updateUser(username, newUsername, address, callback) {
    const con = mysql.createConnection(details);

    con.connect(function (err) {
        if (err) throw err;
        con.execute(
          'UPDATE users SET username=?, address=? WHERE username=?',
          [newUsername, address, username],
          function (err, result, fields) {
            if (err) throw err;
            console.log("Updated user:", username, "->", newUsername);
            callback(result);
          }
        );
    });
}

// ============================================
// REVIEWS MODEL FUNCTIONS
// ============================================

// Select all reviews (public)
export function selectReviews(callback) {
    const con = mysql.createConnection(details);
    con.connect(function (err) {
        if (err) throw err;
        con.query(
            "SELECT * FROM reviews ORDER BY created_at DESC",
            function (err, result) {
                if (err) throw err;
                callback(result);
            }
        );
    });
}

// Insert a new review (private)
export function insertReview(review, callback) {
    const con = mysql.createConnection(details);
    const sql =
        "INSERT INTO reviews (league_name, reviewer, rating, comment) VALUES (?, ?, ?, ?)";

    con.connect(function (err) {
        if (err) throw err;
        con.query(
            sql,
            Object.values(review),
            function (err, result) {
                if (err) throw err;
                callback(result.insertId);
            }
        );
    });
}

// Update a review (private)
export function updateReview(id, review, callback) {
    const con = mysql.createConnection(details);
    const sql =
        "UPDATE reviews SET league_name=?, rating=?, comment=? WHERE id=?";

    con.connect(function (err) {
        if (err) throw err;
        con.query(
            sql,
            [...Object.values(review), id],
            function (err, result) {
                if (err) throw err;
                callback(result);
            }
        );
    });
}

// Delete a review (private)
export function deleteReview(id, callback) {
    const con = mysql.createConnection(details);
    con.connect(function (err) {
        if (err) throw err;
        con.query(
            "DELETE FROM reviews WHERE id=?",
            [id],
            function (err, result) {
                if (err) throw err;
                callback(result);
            }
        );
    });
}

export default {
    selectUsers,
    selectUser,
    selectUserPwd,
    insertUser,
    deleteUser,
    selectUserByUsername,
    updateUser,
    selectReviews,
    insertReview,
    updateReview,
    deleteReview,
};