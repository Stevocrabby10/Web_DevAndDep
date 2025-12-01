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
        if (err) throw err;
        con.execute(
          'SELECT password FROM users WHERE username=?',
          [username],
          function (err, result, fields) {
            if (err) throw err;
            console.log("From DB: " + result);
            callback(result);
          }
        );
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

export default {
    selectUsers,
    selectUser,
    selectUserPwd,
    insertUser,
    deleteUser,
    selectUserByUsername,
    updateUser,
};
