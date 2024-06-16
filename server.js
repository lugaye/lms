const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const { check, validationResult } = require('express-validator');
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
    user: 'admin',
    password: 'CHidozie12@',
    database: 'LMS'
});

// Connect to MySQL
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL as id ' + connection.threadId);
});

// Serve static files from the default directory
app.use(express.static(__dirname));

// Set up middleware to parse incoming JSON data
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// Define routes

// Root route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Define a User representation for clarity
const User = {
    tableName: 'users',
    createUser: function(newUser, callback) {
        connection.query('INSERT INTO ' + this.tableName + ' SET ?', newUser, callback);
    },
    getUserByEmail: function(email, callback) {
        connection.query('SELECT * FROM ' + this.tableName + ' WHERE email = ?', email, callback);
    },
    getUserByUsername: function(username, callback) {
        connection.query('SELECT * FROM ' + this.tableName + ' WHERE username = ?', username, callback);
    }
};

// Registration route
app.post('/register', [
    check('email').isEmail(),
    check('username').isAlphanumeric().withMessage('Username must be alphanumeric'),
    check('email').custom(async (value) => {
        const user = await new Promise((resolve, reject) => {
            User.getUserByEmail(value, (err, results) => {
                if (err) reject(err);
                resolve(results[0]);
            });
        });
        if (user) {
            throw new Error('Email already exists');
        }
    }),
    check('username').custom(async (value) => {
        const user = await new Promise((resolve, reject) => {
            User.getUserByUsername(value, (err, results) => {
                if (err) reject(err);
                resolve(results[0]);
            });
        });
        if (user) {
            throw new Error('Username already exists');
        }
    }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    const newUser = {
        email: req.body.email,
        username: req.body.username,
        password: hashedPassword,
        full_name: req.body.full_name
    };

    User.createUser(newUser, (error, results, fields) => {
        if (error) {
            console.error('Error inserting user: ' + error.message);
            return res.status(500).json({ error: error.message });
        }
        console.log('Inserted a new user with id ' + results.insertId);
        res.status(201).json(newUser);
    });
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    connection.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
            res.status(401).send('Invalid username or password');
        } else {
            const user = results[0];
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
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

// Route to serve the dashboard HTML file
app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('You must log in to view this page.');
    }
    res.sendFile(__dirname + '/dashboard.html');
});

// Route to serve the course content HTML file
app.get('/course-content', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('You must log in to view this page.');
    }
    res.sendFile(__dirname + '/course-content.html');
});

// Route to retrieve course content
app.get('/course/:id', (req, res) => {
    const courseId = req.params.id;
    const sql = 'SELECT * FROM courses WHERE id = ?';
    connection.query(sql, [courseId], (err, result) => {
        if (err) {
            throw err;
        }
        res.json(result[0]); // Assuming courses table has a single row per ID
    });
});

// Route to fetch leaderboard data
app.get('/leaderboard', (req, res) => {
    // Replace with actual leaderboard fetching logic
    const leaderboardData = [
        { name: 'John Doe', score: 100 },
        { name: 'Jane Smith', score: 95 },
        { name: 'Michael Johnson', score: 90 }
    ];
    res.json(leaderboardData);
});

// Route to fetch user's full name
app.get('/get-fullname', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('You must log in to view this page.');
    }
    const fullName = req.session.user.full_name;
    res.json({ fullName });
});

// Route to handle user course selection
app.post('/select-course', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('You must log in to select a course.');
    }

    const { courseId } = req.body;
    const userId = req.session.user.id;

    // Assuming a table `user_courses` with columns `user_id` and `course_id`
    const sql = 'INSERT INTO user_courses (user_id, course_id) VALUES (?, ?)';
    connection.query(sql, [userId, courseId], (err, result) => {
        if (err) {
            console.error('Error selecting course:', err);
            return res.status(500).send('Failed to select course.');
        }
        res.send('Course selected successfully.');
    });
});

// Route to fetch user's selected courses
app.get('/my-courses', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('You must log in to view your courses.');
    }

    const userId = req.session.user.id;

    // Assuming a join between `user_courses` and `courses` tables to fetch course details
    const sql = `
        SELECT courses.*
        FROM courses
        INNER JOIN user_courses ON user_courses.course_id = courses.id
        WHERE user_courses.user_id = ?
    `;
    connection.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching user courses:', err);
            return res.status(500).send('Failed to fetch user courses.');
        }
        res.json(results);
    });
});

// Start server
const PORT = process.env.PORT || 30011;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});