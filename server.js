const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const mysql = require('mysql2'); // Use mysql2
const { check, validationResult } = require('express-validator');
const app = express();

// Session configuration (for login/logout)
app.use(session({
    secret: 'your_secret_key', 
    resave: false,
    saveUninitialized: true
}));

// MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Ashtek@255', // Replace with your actual password
    database: 'userauth' // Replace with your database name
});

connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err.message);
        return;
    }
    console.log('Connected to MySQL as id ' + connection.threadId);
});

// Middleware
app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// User model (for database interactions)
const User = {
    tableName: 'users',
    createUser: (newUser, callback) => {
        connection.query('INSERT INTO users SET ?', newUser, callback);
    },
    getUserByEmail: (email, callback) => {
        connection.query('SELECT * FROM users WHERE email = ?', email, callback);
    },
    getUserByUsername: (username, callback) => {
        connection.query('SELECT * FROM users WHERE username = ?', username, callback);
    }
};

// ... (Rest of your registration and login routes - same as before)

// Dashboard route (updated)
app.get('/dashboard', (req, res) => {
    if (req.session.user) { // Check if user is logged in
        const fullName = req.session.user.fullName;
        res.json({ fullName });
    } else {
        res.status(401).json({ error: 'Unauthorized' }); // User not logged in
    }
});

// Course content route (updated)
app.get('/course/:id', (req, res) => {
    const courseId = req.params.id;
    const sql = 'SELECT * FROM courses WHERE courseID = ?';
    connection.query(sql, [courseId], (err, results) => {
        if (err) throw err;
        res.json(results); // Send the results as JSON
    });
});

// Leaderboard route (implementation needed)
app.get('/leaderboard', (req, res) => {
    // Fetch leaderboard data from your database here
    // Replace the placeholder with your actual leaderboard data
    const leaderboardData = [
        { rank: 1, name: 'John Doe', score: 150 },
        { rank: 2, name: 'Jane Smith', score: 120 },
        // ... more leaderboard entries
    ];
    res.json(leaderboardData);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
