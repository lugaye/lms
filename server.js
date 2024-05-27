const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
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
    user: 'root',
    password: 'lex',
    database: 'learning_management'
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

// Define a Course representation for clarity
const Course = {
    tableName: 'courses',
    getAllCourses: function(callback) {
        connection.query('SELECT * FROM ' + this.tableName, callback);
    }
};

// Registration route
app.post('/register', [
    check('email').isEmail(),
    check('username').isAlphanumeric().withMessage('Username must be alphanumeric'),
    check('email').custom((value, { req }) => {
        return new Promise((resolve, reject) => {
            User.getUserByEmail(value, (err, user) => {
                if (err) throw err;
                if (user.length > 0) {
                    reject(new Error('Email already exists'));
                } else {
                    resolve(true);
                }
            });
        });
    }),
    check('username').custom((value, { req }) => {
        return new Promise((resolve, reject) => {
            User.getUserByUsername(value, (err, user) => {
                if (err) throw err;
                if (user.length > 0) {
                    reject(new Error('Username already exists'));
                } else {
                    resolve(true);
                }
            });
        });
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
    User.getUserByUsername(username, (err, results) => {
        if (err) throw err;
        if (results.length === 0) {
            return res.status(401).send('Invalid username or password');
        }
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
    });
});

// Logout route
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.send('Logout successful');
});

// Route to fetch user full name for dashboard
app.get('/get-fullname', (req, res) => {
    if (req.session.user) {
        res.json({ fullName: req.session.user.full_name });
    } else {
        res.status(401).send('Unauthorized');
    }
});

// Route to save selected courses for a user
app.post('/select-courses', (req, res) => {
    const userId = req.session.user.id;
    const courses = req.body.courses;

    const sql = 'INSERT INTO user_courses (user_id, course_id) VALUES ?';
    const values = courses.map(courseId => [userId, courseId]);
    connection.query(sql, [values], (err, result) => {
        if (err) {
            console.error('Error inserting selected courses:', err);
            return res.status(500).send('Error saving course selection');
        }
        res.send('Course selection saved successfully');
    });
});

// Route to fetch selected courses for a user
app.get('/get-selected-courses', (req, res) => {
    const userId = req.session.user.id;
    const sql = `
        SELECT c.name
        FROM user_courses uc
        JOIN courses c ON uc.course_id = c.id
        WHERE uc.user_id = ?
    `;
    connection.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching selected courses:', err);
            return res.status(500).send('Error fetching selected courses');
        }
        const courses = results.map(row => row.name);
        res.json({ courses });
    });
});

// Route to retrieve course content
app.get('/course/:id', (req, res) => {
    const courseId = req.params.id;
    const sql = 'SELECT * FROM courses WHERE id = ?';
    connection.query(sql, [courseId], (err, result) => {
        if (err) {
            throw err;
        }
        res.json(result);
    });
});

// Route to fetch leaderboard data
app.get('/leaderboard', (req, res) => {
    const sql = `
        SELECT u.username AS name, SUM(score) AS score
        FROM user_courses uc
        JOIN users u ON uc.user_id = u.id
        GROUP BY u.id
        ORDER BY score DESC
        LIMIT 10
    `;
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching leaderboard data:', err);
            return res.status(500).send('Error fetching leaderboard data');
        }
        res.json(results);
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
