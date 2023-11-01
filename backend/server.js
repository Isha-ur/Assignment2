const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const mysql = require('mysql2');
const app = express();

const port = 8000; 

// middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(cors());

// database connection

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Isha@2004maurya',
    database: 'user'
  });
  
  // Establish the database connection
  db.connect((err) => {
    if (err) {
      console.error('Error connecting to the database:', err);
      return;
    }
    console.log('Connected to the database');
  });

  app.set('db', db);

// admin route:-

// admin login route
app.post('/admin/login', (req, res) => {
    const { adminId, password } = req.body;

    // Check if the user exist
    const query = 'SELECT * FROM `user`.`admin` WHERE `adminId` = ? AND `password` = ?';
    db.query(query, [adminId, password], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Login failed' });
        } else {
            if (results.length === 1) {
                res.status(200).json({ message: 'Login successful' });
            } else {
                // No user found 
                res.status(401).json({ message: 'Invalid credentials' });
            }
        }
    });
});


// Admin route: Create a new user
app.post('/admin/create-user', (req, res) => {
    try {
      const { userID, userName, password, uniqueKey } = req.body;
  
      // Insert a new user into the database
      const query = 'INSERT INTO `user`.`userdata` (`userID`, `userName`, `password`, `uniqueKey`) VALUES (?, ?, ?, ?)';
      db.query(query, [userID, userName, password, uniqueKey], (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).json({ message: 'Error creating user' });
        } else {
          res.status(201).json({ message: 'User created successfully' });
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error creating user' });
    }
});
  
// Admin route: Delete user
app.delete('/admin/delete-user', (req, res) => {
    try {
      const { userId } = req.body;
  
      if (!userId) {
        return res.status(400).json({ message: 'Missing userId in the request body' });
      }
  
      // Delete the user from the database
      const query = 'DELETE FROM `user`.`userdata` WHERE `userID` = ?';
      db.query(query, [userId], (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: 'Error deleting user' });
        } else {
          if (result.affectedRows === 0) {
            // No user with the given userId found
            return res.status(404).json({ message: 'User not found' });
          } else {
            return res.status(200).json({ message: 'User deleted successfully' });
          }
        }
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error deleting user' });
    }
});


// Admin Route: Edit user

app.put('/admin/update-user', (req, res) => {
    try {
      const { userID, userName, password, uniqueKey } = req.body;
  
      if (!userID) {
        return res.status(400).json({ message: 'Missing userID in the request body' });
      }
  
      // Update user information in the database
      const query = 'UPDATE `user`.`userdata` SET `userName` = ?, `password` = ?, `uniqueKey` = ? WHERE `userID` = ?';
      db.query(query, [userName, password, uniqueKey, userID], (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).json({ message: 'Error updating user' });
        } else {
          if (result.affectedRows === 0) {
            res.status(404).json({ message: 'User not found' });
          } else {
            res.status(200).json({ message: 'User updated successfully' });
          }
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating user' });
    }
});

// Admin Route: Get all users
app.get('/admin/get-all-users', (req, res) => {
    try {
      // Retrieve all users from the database
      const query = 'SELECT * FROM `user`.`userdata`';
      db.query(query, (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).json({ message: 'Error retrieving users' });
        } else {
          res.status(200).json(results);
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error retrieving users' });
    }
});

// Admin Route: Change any User Password
app.put('/admin/change-user-password', (req, res) => {
    try {
      const { userID, newPassword } = req.body;
  
      if (!userID || !newPassword) {
        return res.status(400).json({ message: 'Missing userID or newPassword in the request body' });
      }
  
      // Update the user's password in the database
      const query = 'UPDATE `user`.`userdata` SET `password` = ? WHERE `userID` = ?';
      db.query(query, [newPassword, userID], (err, result) => {
        if (err) {
          console.error(err);
          res.status(500).json({ message: 'Error changing user password' });
        } else {
          if (result.affectedRows === 0) {
            res.status(404).json({ message: 'User not found' });
          } else {
            res.status(200).json({ message: 'User password changed successfully' });
          }
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error changing user password' });
    }
});
  
// User Route

// User Raoute: login 

app.post('/users/login', (req, res) => {
    const { userID, password } = req.body;
    const userIP = req.ip; // Express automatically captures the user's IP
  
    // Check if the user exists in the database
    const query = 'SELECT * FROM `user`.`userdata` WHERE `userID` = ? AND `password` = ?';
    db.query(query, [userID, password], (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ message: 'Login failed' });
      } else {
        if (results.length === 1) {
          // User with the provided userID and password was found in the database
          const logQuery = 'INSERT INTO `user`.`user_logs` (user_id, event_type, timestamp, user_ip) VALUES (?, ?, NOW(), ?)';
          db.query(logQuery, [userID, 'login', userIP], (logErr) => {
            if (logErr) {
              console.error(logErr);
            }
            return res.status(200).send({ message: 'Login successful' ,
            userData:{
                userName: results[0].userName,
                userId: userID
            }
        });
          });
        } else {
          // No matching user found in the database
          return res.status(500).send({ message: 'Invalid credentials' });
        }
      }
    });
  });
  

// User Raoute: logout

app.post('/users/logout', (req, res) => {
    const { userID } = req.body;
    const userIP = req.ip; // Express automatically captures the user's IP
  
    const logQuery = 'INSERT INTO `user`.`user_logs` (user_id, event_type, timestamp, user_ip) VALUES (?, ?, NOW(), ?)';
    db.query(logQuery, [userID, 'logout', userIP], (logErr) => {
      if (logErr) {
        console.error(logErr);
        res.status(500).json({ message: 'Logout failed' });
      } else {
        res.status(200).json({ message: 'Logout successful' });
      }
    });
  });



// User Route: Change password
app.post('/users/change-password', (req, res) => {
    const { userID, currentPassword, newPassword } = req.body;
    const userIP = req.ip;
  
    // Check if the user exists in the database
    const checkQuery = 'SELECT * FROM `user`.`userdata` WHERE `userID` = ? AND `password` = ?';
    db.query(checkQuery, [userID, currentPassword], (checkErr, checkResults) => {
      if (checkErr) {
        console.error(checkErr);
        res.status(500).json({ message: 'Password change failed' });
      } else if (checkResults.length === 1) {
        // User with the provided userID and current password was found in the database
        const updateQuery = 'UPDATE `user`.`userdata` SET `password` = ? WHERE `userID` = ?';
        db.query(updateQuery, [newPassword, userID], (updateErr, updateResult) => {
          if (updateErr) {
            console.error(updateErr);
            res.status(500).json({ message: 'Password change failed' });
          } else if (updateResult.affectedRows === 1) {
            // Password changed successfully
            const logQuery = 'INSERT INTO `user`.`user_logs` (user_id, event_type, timestamp, user_ip) VALUES (?, ?, NOW(), ?)';
            db.query(logQuery, [userID, 'password_change', userIP], (logErr) => {
              if (logErr) {
                console.error(logErr);
              }
              res.status(200).json({ message: 'Password changed successfully' });
            });
          } else {
            res.status(500).json({ message: 'Password change failed' });
          }
        });
      } else {
        // No matching user found in the database
        res.status(401).json({ message: 'Invalid credentials' });
      }
    });
  });
  
// User Route: Get all logs of a specific user
app.post('/user/user-logs', (req, res) => {
    const { userID } = req.body;

    if (!userID) {
        return res.status(400).json({ message: 'Missing userID in the request body' });
    }

    // Fetch all logs of the specified user from the database
    const query = 'SELECT * FROM `user`.`user_logs` WHERE `user_id` = ?';
    db.query(query, [userID], (err, results) => {
        if (err) {
            console.error(err);
            res.status(500).json({ message: 'Error retrieving user logs' });
        } else {
            res.status(200).json(results);
        }
    });
});

// Start the Express app
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
