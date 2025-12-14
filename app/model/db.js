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
      con.end();
          }
        );
    });
}

// Attempt to retrieve current leagues for a user. This function is defensive: it
// first tries a dedicated `user_leagues` table, and if that doesn't exist it
// falls back to a `leagues` column on the `users` table (comma-separated).
export function selectUserLeagues(username, callback) {
  const con = mysql.createConnection(details);
  con.connect(function (err) {
    if (err) {
      console.error(err);
      callback([]);
      return;
    }

    // Get user id first
    con.execute('SELECT idUser FROM users WHERE username = ?', [username], function (uErr, uRes) {
      if (uErr || !uRes || !uRes[0]) {
        console.error('selectUserLeagues user lookup error:', uErr);
        con.end();
        callback([]);
        return;
      }
      const userId = uRes[0].idUser;

      // Join user_leagues -> leagues for current leagues
      con.query(
        'SELECT l.idLeague, l.name, l.area, l.location, l.venue, l.next_match_date, l.slug FROM user_leagues ul JOIN leagues l ON ul.leagueId = l.idLeague WHERE ul.userId = ? AND ul.status = \'CURRENT\'',
        [userId],
        function (err, result) {
          if (err) {
            console.error('selectUserLeagues query error:', err);
            con.end();
            callback([]);
            return;
          }
          const mapped = (result || []).map(r => ({ id: r.idLeague, name: r.name, area: r.area, location: r.location, venue: r.venue, next_match_date: r.next_match_date, slug: r.slug }));
          con.end();
          callback(mapped);
        }
      );
    });
  });
}

// Attempt to retrieve upcoming matches for a user. Tries `user_matches` then
// falls back to a `next_match` column on `users` (single value).
export function selectUserNextMatches(username, callback) {
  const con = mysql.createConnection(details);
  con.connect(function (err) {
    if (err) {
      console.error(err);
      callback([]);
      return;
    }

    // Find user id
    con.execute('SELECT idUser FROM users WHERE username = ?', [username], function (uErr, uRes) {
      if (uErr || !uRes || !uRes[0]) {
        console.error('selectUserNextMatches user lookup error:', uErr);
        con.end();
        callback([]);
        return;
      }
      const userId = uRes[0].idUser;

      // Use leagues.next_match_date for current user leagues
      con.query(
        'SELECT l.name AS league, l.next_match_date AS date, l.venue FROM user_leagues ul JOIN leagues l ON ul.leagueId = l.idLeague WHERE ul.userId = ? AND ul.status = \'CURRENT\' AND l.next_match_date IS NOT NULL ORDER BY l.next_match_date LIMIT 10',
        [userId],
        function (err, result) {
          if (err) {
            console.error('selectUserNextMatches query error:', err);
            con.end();
            callback([]);
            return;
          }
          const mapped = (result || []).map(r => ({ league: r.league, date: r.date, venue: r.venue }));
          con.end();
          callback(mapped);
        }
      );
    });
  });
}

// Attempt to retrieve previous leagues for a user. Tries `user_leagues` with
// an `ended` flag or falls back to `previous_leagues` column on `users`.
export function selectUserPreviousLeagues(username, callback) {
  const con = mysql.createConnection(details);
  con.connect(function (err) {
    if (err) {
      console.error(err);
      callback([]);
      return;
    }

    // Find user id
    con.execute('SELECT idUser FROM users WHERE username = ?', [username], function (uErr, uRes) {
      if (uErr || !uRes || !uRes[0]) {
        console.error('selectUserPreviousLeagues user lookup error:', uErr);
        con.end();
        callback([]);
        return;
      }
      const userId = uRes[0].idUser;

      // Select past leagues
      con.query(
        'SELECT l.idLeague, l.name FROM user_leagues ul JOIN leagues l ON ul.leagueId = l.idLeague WHERE ul.userId = ? AND ul.status = \'PAST\'',
        [userId],
        function (err, result) {
          if (err) {
            console.error('selectUserPreviousLeagues query error:', err);
            con.end();
            callback([]);
            return;
          }
          const mapped = (result || []).map(r => ({ id: r.idLeague, name: r.name }));
          con.end();
          callback(mapped);
        }
      );
    });
  });
}

// Add a user to a league using the league's slug. Inserts into `user_leagues`
// with status 'CURRENT' and today's date as `joined_at`. If the user is
// already a member, the function returns { alreadyJoined: true }.
export function addUserToLeagueBySlug(username, slug, callback) {
  const con = mysql.createConnection(details);
  con.connect(function (err) {
    if (err) { console.error(err); callback({ error: 'db_connect' }); return; }

    // Find user id
    con.execute('SELECT idUser FROM users WHERE username = ?', [username], function (uErr, uRes) {
      if (uErr || !uRes || !uRes[0]) { con.end(); callback({ error: 'no_user' }); return; }
      const userId = uRes[0].idUser;

      // Find league id by slug
      con.execute('SELECT idLeague FROM leagues WHERE slug = ?', [slug], function (lErr, lRes) {
        if (lErr || !lRes || !lRes[0]) { con.end(); callback({ error: 'no_league' }); return; }
        const leagueId = lRes[0].idLeague;

        // Insert into user_leagues; handle duplicate (already a member)
          con.execute("INSERT INTO user_leagues (userId, leagueId, status, joined_at) VALUES (?, ?, 'CURRENT', CURDATE())", [userId, leagueId], function (iErr, iRes) {
            if (iErr) {
              // Duplicate key means user already joined
              if (iErr.code === 'ER_DUP_ENTRY' || iErr.errno === 1062) {
                con.end();
                callback({ alreadyJoined: true });
                return;
              }
              console.error('addUserToLeague insert error:', iErr);
              con.end();
              callback({ error: 'insert_error' });
              return;
            }

            // Also try to insert a stub into a detected standings table so the user's row appears.
            // This logic attempts to discover the table and column names and insert with 0 stats.
            con.query('SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = ? AND (TABLE_NAME = ? OR TABLE_NAME = ? OR TABLE_NAME LIKE ?) ORDER BY (TABLE_NAME = ?) DESC, (TABLE_NAME = ?) DESC, TABLE_NAME ASC LIMIT 1', [details.database, 'league_standings', 'leagues_standings', '%stand%', 'league_standings', 'leagues_standings'], function (tErr, tRes) {
              if (tErr || !tRes || !tRes[0]) {
                // no standings table found — continue without failing
                con.end();
                callback({ inserted: true, id: iRes.insertId });
                return;
              }
              const candidate = tRes[0] && (tRes[0].TABLE_NAME || tRes[0].table_name || Object.values(tRes[0]).find(v => typeof v === 'string'));
              if (!candidate) { con.end(); callback({ inserted: true, id: iRes.insertId }); return; }

              con.query('SHOW COLUMNS FROM ??', [candidate], function (cErr, cRes) {
                if (cErr || !cRes) { con.end(); callback({ inserted: true, id: iRes.insertId }); return; }
                const fields = (cRes || []).map(r => String(r.Field || r.field || '').toLowerCase());

                // helpers to pick columns
                const pick = (cands) => cands.find(x => fields.includes(x)) || null;
                const colLeagueId = pick(['leagueid','league_id','league']);
                const colPosition = pick(['position','pos','rank']);
                const colEntryName = pick(['entry_name','entryname','player_name','playername','username','user','name']);
                const colUserId = pick(['userid','user_id','user']);
                const colWins = pick(['wins','won']);
                const colLosses = pick(['losses','lost']);
                const colPoints = pick(['points','pts','score']);
                const colPlayed = pick(['played','games','played_games']);

                // compute next position if possible
                const computeNextPos = (done) => {
                  if (colPosition && colLeagueId) {
                    const q = `SELECT IFNULL(MAX(\`${colPosition}\`),0) + 1 AS nextPos FROM \`${candidate}\` WHERE \`${colLeagueId}\` = ?`;
                    con.query(q, [leagueId], function (pErr, pRes) {
                      const nextPos = (!pErr && pRes && pRes[0] && pRes[0].nextPos) ? pRes[0].nextPos : 1;
                      done(nextPos);
                    });
                  } else {
                    done(1);
                  }
                };

                computeNextPos(function (nextPos) {
                  // build insert columns and values
                  const cols = [];
                  const vals = [];

                  if (colLeagueId) { cols.push(colLeagueId); vals.push(leagueId); }
                  if (colUserId) { cols.push(colUserId); vals.push(userId); }
                  else if (colEntryName) { cols.push(colEntryName); vals.push(username); }
                  if (colPosition) { cols.push(colPosition); vals.push(nextPos); }
                  if (colPlayed) { cols.push(colPlayed); vals.push(0); }
                  if (colWins) { cols.push(colWins); vals.push(0); }
                  if (colLosses) { cols.push(colLosses); vals.push(0); }
                  if (colPoints) { cols.push(colPoints); vals.push(0); }

                  if (cols.length === 0) {
                    con.end();
                    callback({ inserted: true, id: iRes.insertId });
                    return;
                  }

                  const colList = cols.map(c => `\\\`${c}\\\``).join(', ');
                  const placeholders = cols.map(_ => '?').join(', ');
                  const insertSql = `INSERT INTO \`${candidate}\` (${colList}) VALUES (${placeholders})`;
                  con.query(insertSql, vals, function (sErr, sRes) {
                    if (sErr) {
                      console.warn('Could not insert into standings table:', sErr && sErr.message ? sErr.message : sErr);
                    }
                    con.end();
                    callback({ inserted: true, id: iRes.insertId });
                  });
                });
              });
            });
          });
      });
    });
  });
}

// Remove a user from a league by slug
export function removeUserFromLeagueBySlug(username, slug, callback) {
  const con = mysql.createConnection(details);
  con.connect(function (err) {
    if (err) { console.error(err); callback({ error: 'db_connect' }); return; }

    con.execute('SELECT idUser FROM users WHERE username = ?', [username], function (uErr, uRes) {
      if (uErr || !uRes || !uRes[0]) { con.end(); callback({ error: 'no_user' }); return; }
      const userId = uRes[0].idUser;

      con.execute('SELECT idLeague FROM leagues WHERE slug = ?', [slug], function (lErr, lRes) {
        if (lErr || !lRes || !lRes[0]) { con.end(); callback({ error: 'no_league' }); return; }
        const leagueId = lRes[0].idLeague;

        con.execute('DELETE FROM user_leagues WHERE userId = ? AND leagueId = ?', [userId, leagueId], function (dErr, dRes) {
          if (dErr) { console.error('removeUserFromLeague delete error:', dErr); con.end(); callback({ error: 'delete_error' }); return; }
          // Also attempt to remove from a detected standings table
          con.query('SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = ? AND (TABLE_NAME = ? OR TABLE_NAME = ? OR TABLE_NAME LIKE ?) ORDER BY (TABLE_NAME = ?) DESC, (TABLE_NAME = ?) DESC, TABLE_NAME ASC LIMIT 1', [details.database, 'league_standings', 'leagues_standings', '%stand%', 'league_standings', 'leagues_standings'], function (tErr, tRes) {
            if (tErr || !tRes || !tRes[0]) { con.end(); callback({ deleted: dRes.affectedRows }); return; }
            const candidate = tRes[0] && (tRes[0].TABLE_NAME || tRes[0].table_name || Object.values(tRes[0]).find(v => typeof v === 'string'));
            if (!candidate) { con.end(); callback({ deleted: dRes.affectedRows }); return; }

            con.query('SHOW COLUMNS FROM ??', [candidate], function (cErr, cRes) {
              if (cErr || !cRes) { con.end(); callback({ deleted: dRes.affectedRows }); return; }
              const fields = (cRes || []).map(r => String(r.Field || r.field || '').toLowerCase());
              const pick = (cands) => cands.find(x => fields.includes(x)) || null;
              const colUserId = pick(['userid','user_id','user']);
              const colEntryName = pick(['entry_name','entryname','player_name','playername','username','name']);
              const colLeagueId = pick(['leagueid','league_id','league']);

              if (colUserId && colLeagueId) {
                const q = `DELETE FROM \`${candidate}\` WHERE \`${colUserId}\` = ? AND \`${colLeagueId}\` = ?`;
                con.query(q, [userId, leagueId], function (sdErr, sdRes) {
                  if (sdErr) console.warn('Could not delete from standings table:', sdErr && sdErr.message ? sdErr.message : sdErr);
                  con.end();
                  callback({ deleted: dRes.affectedRows });
                });
                return;
              }

              if (colEntryName && colLeagueId) {
                const q = `DELETE FROM \`${candidate}\` WHERE \`${colEntryName}\` = ? AND \`${colLeagueId}\` = ?`;
                con.query(q, [username, leagueId], function (sdErr, sdRes) {
                  if (sdErr) console.warn('Could not delete from standings table:', sdErr && sdErr.message ? sdErr.message : sdErr);
                  con.end();
                  callback({ deleted: dRes.affectedRows });
                });
                return;
              }

              // Could not determine safe delete columns; skip
              con.end();
              callback({ deleted: dRes.affectedRows });
            });
          });
        });
      });
    });
  });
}

// Retrieve standings for a league identified by slug.
// Returns an object: { league: { id, name, venue, slug }, standings: [ { username, position, wins, losses, points, userId? } ] }
export function selectLeagueStandingsBySlug(slug, callback) {
  const con = mysql.createConnection(details);
  con.connect(function (err) {
    if (err) { console.error('selectLeagueStandingsBySlug db connect error:', err); callback({ error: 'db_connect', message: err && err.message ? err.message : String(err) }); return; }

    // Find league id and basic info
    con.execute('SELECT idLeague, name, venue, slug FROM leagues WHERE slug = ?', [slug], function (lErr, lRes) {
      if (lErr || !lRes || !lRes[0]) { con.end(); callback({ error: 'no_league' }); return; }
      const league = { id: lRes[0].idLeague, name: lRes[0].name, venue: lRes[0].venue, slug: lRes[0].slug };
      const leagueId = league.id;

      // Discover a candidate standings table (prefer 'league_standings' or 'leagues_standings')
      con.query('SELECT TABLE_NAME FROM information_schema.tables WHERE table_schema = ? AND (TABLE_NAME = ? OR TABLE_NAME = ? OR TABLE_NAME LIKE ?) ORDER BY (TABLE_NAME = ?) DESC, (TABLE_NAME = ?) DESC, TABLE_NAME ASC LIMIT 1', [details.database, 'league_standings', 'leagues_standings', '%stand%', 'league_standings', 'leagues_standings'], function (tErr, tRes) {
        if (tErr) { console.error('selectLeagueStandingsBySlug info schema error', tErr); con.end(); callback({ error: 'no_standings_table' }); return; }
        if (!tRes || tRes.length === 0) { console.error('selectLeagueStandingsBySlug no candidate tables'); con.end(); callback({ error: 'no_standings_table' }); return; }
          const candidate = tRes[0] && (tRes[0].TABLE_NAME || tRes[0].table_name || Object.values(tRes[0]).find(v => typeof v === 'string'));
        if (!candidate || !/^[a-zA-Z0-9_]+$/.test(candidate)) { console.error('selectLeagueStandingsBySlug invalid candidate', tRes[0]); con.end(); callback({ error: 'invalid_table_name' }); return; }

        // Inspect columns of candidate table
        con.query('SHOW COLUMNS FROM ??', [candidate], function (cErr, cRes) {
          if (cErr) { console.error('selectLeagueStandingsBySlug show columns error', cErr); con.end(); callback({ error: 'query_error', message: cErr && cErr.message ? cErr.message : String(cErr) }); return; }
          const fields = (cRes || []).map(r => String(r.Field || r.field || '').toLowerCase());

          // Candidate column name lists (expanded to catch more variants)
          const usernameCandidates = ['username','user','user_name','player','player_name','playername','member_name','membername','entry_name','entryname','name','display_name'];
          const positionCandidates = ['position','pos','rank'];
          const winsCandidates = ['wins','won'];
          const lossesCandidates = ['losses','lost'];
          const pointsCandidates = ['points','pts','score'];
          const leagueIdCandidates = ['leagueid','league_id','leagueid'];
          const leagueSlugCandidates = ['league_slug','slug','league'];

          function pick(cands){ return cands.find(x => fields.includes(x)) || null; }

          const col_username = pick(usernameCandidates);
          const col_position = pick(positionCandidates);
          const col_wins = pick(winsCandidates);
          const col_losses = pick(lossesCandidates);
          const col_points = pick(pointsCandidates);
          const col_leagueId = fields.includes('leagueid') ? 'leagueid' : (fields.includes('league_id') ? 'league_id' : (fields.includes('leagueid') ? 'leagueid' : null));
          const col_leagueSlug = pick(leagueSlugCandidates);

          const selected = [];
          if (col_username) selected.push(`\`${col_username}\` AS username`);
          if (col_position) selected.push(`\`${col_position}\` AS position`);
          if (col_wins) selected.push(`\`${col_wins}\` AS wins`);
          if (col_losses) selected.push(`\`${col_losses}\` AS losses`);
          if (col_points) selected.push(`\`${col_points}\` AS points`);

          const selectClause = selected.length ? selected.join(', ') : '*';

          // detect userId column so we can join to users for usernames
          const userIdCol = fields.includes('userid') ? 'userid' : (fields.includes('user_id') ? 'user_id' : (fields.includes('player_id') ? 'player_id' : (fields.includes('user') ? 'user' : null)));

          // Build WHERE clause and params (use table alias 'ls' when referencing columns)
          let whereSql = '';
          let params = [];
          if (col_leagueId) {
            whereSql = `WHERE ls.\`${col_leagueId}\` = ?`;
            params = [leagueId];
          } else if (col_leagueSlug) {
            whereSql = `WHERE ls.\`${col_leagueSlug}\` = ?`;
            params = [slug];
          } else if (fields.includes('league_slug') || fields.includes('slug')) {
            whereSql = `WHERE ls.league_slug = ? OR ls.slug = ?`;
            params = [slug, slug];
          } else {
            whereSql = '';
            params = [];
          }

          // If we have a userId column, LEFT JOIN users to get usernames (prefer u.username)
          let fromClause = `\`${candidate}\` ls`;
          let joinClause = '';
          let finalSelect = selectClause;
          if (userIdCol) {
            joinClause = ` LEFT JOIN users u ON u.idUser = ls.\`${userIdCol}\``;
            // ensure username selected from join; prefer u.username then any username-like column on ls
            const usernameSelect = col_username ? `COALESCE(u.username, ls.\`${col_username}\`) AS username` : `u.username AS username`;
            // remove any existing 'AS username' from selectClause to avoid duplicates
            if (selectClause.includes(' AS username') || selectClause.includes(' AS username'.toUpperCase())) {
              // replace occurrences
              finalSelect = selectClause.replace(/\s+AS\s+username/ig, '');
            }
            finalSelect = usernameSelect + (finalSelect && finalSelect !== '*' ? ', ' + finalSelect : '');
          } else if (col_username) {
            // ensure alias to username if it wasn't already
            if (!selected.find(s => s.includes(' AS username'))) finalSelect = `\`${col_username}\` AS username` + (selectClause && selectClause !== '*' ? ', ' + selectClause : '');
          }

          // build ORDER BY clause safely (avoid introducing backslashes into SQL)
          const orderSql = col_position ? `\`${col_position}\` ASC` : '1 ASC';
          const sql = `SELECT ${finalSelect} FROM ${fromClause}${joinClause} ${whereSql} ORDER BY ${orderSql}`;

          // execute
          con.query(sql, params, function (rErr, rRes) {
            if (rErr) { console.error('selectLeagueStandingsBySlug candidate query error:', rErr); con.end(); callback({ error: 'query_error', message: rErr && rErr.message ? rErr.message : String(rErr) }); return; }
            const standings = (rRes || []).map(r => ({ username: r.username || r.user || '', position: r.position || r.pos || null, wins: r.wins || 0, losses: r.losses || 0, points: r.points || 0 }));
            con.end();
            callback({ league, standings });
          });
        });
      });
    });
  });
}

// Select reviews for a league identified by slug. Matches reviews.review.league_name
// against the league's `name` (exact) and also attempts a LIKE match as fallback.
export function selectReviewsByLeagueSlug(slug, callback) {
  const con = mysql.createConnection(details);
  con.connect(function (err) {
    if (err) { console.error('selectReviewsByLeagueSlug db connect error:', err); callback([]); return; }
    con.execute('SELECT name FROM leagues WHERE slug = ?', [slug], function (lErr, lRes) {
      if (lErr || !lRes || !lRes[0]) { con.end(); callback([]); return; }
      const leagueName = lRes[0].name;
      // prefer exact match, but include LIKE fallback
      con.query('SELECT id, league_name, reviewer, rating, comment, created_at FROM reviews WHERE league_name = ? OR league_name LIKE ? ORDER BY created_at DESC LIMIT 50', [leagueName, '%' + leagueName + '%'], function (rErr, rRes) {
        if (rErr) { console.error('selectReviewsByLeagueSlug query error:', rErr); con.end(); callback([]); return; }
        const mapped = (rRes || []).map(r => ({ id: r.id, league_name: r.league_name, username: r.reviewer, rating: r.rating, text: r.comment, created_at: r.created_at }));
        con.end();
        callback(mapped);
      });
    });
  });
}

// Delete a review by id only if the reviewer matches the provided username.
export function deleteReviewByIdIfOwner(username, reviewId, callback) {
  const con = mysql.createConnection(details);
  con.connect(function (err) {
    if (err) { console.error('deleteReviewByIdIfOwner db connect error:', err); callback({ error: 'db_connect' }); return; }
    con.execute('DELETE FROM reviews WHERE id = ? AND reviewer = ?', [reviewId, username], function (dErr, dRes) {
      if (dErr) { console.error('deleteReviewByIdIfOwner error:', dErr); con.end(); callback({ error: 'delete_error' }); return; }
      con.end();
      callback({ deleted: dRes.affectedRows });
    });
  });
}

// Add a review for a league identified by slug.
export function addReviewToLeagueBySlug(username, slug, rating, text, callback) {
  const con = mysql.createConnection(details);
  con.connect(function (err) {
    if (err) { console.error('addReviewToLeagueBySlug db connect error:', err); callback({ error: 'db_connect' }); return; }
    // Lookup league name
    con.execute('SELECT name FROM leagues WHERE slug = ?', [slug], function (lErr, lRes) {
      if (lErr || !lRes || !lRes[0]) { con.end(); callback({ error: 'no_league' }); return; }
      const leagueName = lRes[0].name;
      con.execute('INSERT INTO reviews (league_name, reviewer, rating, comment) VALUES (?, ?, ?, ?)', [leagueName, username, rating, text], function (iErr, iRes) {
        if (iErr) { console.error('addReviewToLeagueBySlug insert error:', iErr); con.end(); callback({ error: 'insert_error' }); return; }
        con.end();
        callback({ inserted: true, insertId: iRes.insertId });
      });
    });
  });
}

// Update a review by id if the reviewer matches username
export function updateReviewByIdIfOwner(username, reviewId, rating, text, callback) {
  const con = mysql.createConnection(details);
  con.connect(function (err) {
    if (err) { console.error('updateReviewByIdIfOwner db connect error:', err); callback({ error: 'db_connect' }); return; }
    con.execute('UPDATE reviews SET rating = ?, comment = ? WHERE id = ? AND reviewer = ?', [rating, text, reviewId, username], function (uErr, uRes) {
      if (uErr) { console.error('updateReviewByIdIfOwner error:', uErr); con.end(); callback({ error: 'update_error' }); return; }
      con.end();
      callback({ updated: uRes.affectedRows });
    });
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
  selectUserLeagues,
  selectUserNextMatches,
  selectUserPreviousLeagues,
  addUserToLeagueBySlug,
  removeUserFromLeagueBySlug,
  selectLeagueStandingsBySlug,
  selectReviewsByLeagueSlug,
  deleteReviewByIdIfOwner,
  addReviewToLeagueBySlug,
  updateReviewByIdIfOwner,
};
