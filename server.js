// server.js
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mysql = require('mysql');
const app = express();

// Configure session middleware
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'your_mysql_username',
    password: 'your_mysql_password',
    database: 'learning_management'
});

connection.connect();

// Set up middleware to parse incoming JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Define routes

// Registration route
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    // Hash the password
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) throw err;
        // Insert user into database
        connection.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], (err, results) => {
            if (err) {
                res.status(500).send('Error registering user');
            } else {
                res.status(201).send('User registered successfully');
            }
        });
    });
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Retrieve user from database
    connection.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
            res.status(401).send('Invalid username or password');
        } else {
            const user = results[0];
            // Compare passwords
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    // Store user in session
                    req.session.user = user;
                    res.send('Login successful');
                } else {
                    res.status(401).send('Invalid username or password');
                }
            });
        }
    });
});

// Logout route
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.send('Logout successful');
});

// Route to retrieve course content
app.get('/course/:id', (req, res) => {
    const courseId = req.params.id;
    const sql = 'SELECT * FROM courses WHERE id = ?';
    db.query(sql, [courseId], (err, result) => {
      if (err) {
        throw err;
      }
      // Send course content as JSON response
      res.json(result);
    });
  });

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});