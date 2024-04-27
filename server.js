// server.js
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
    user: 'root',
    password: '',
    database: 'lms_app'
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

// Registration route
app.post('/register', [
    // Validate email and username fields
    check('email').isEmail(),
    check('username').isAlphanumeric().withMessage('Username must be alphanumeric'),

    // Custom validation to check if email and username are unique
    check('email').custom(async (value) => {
        const user = await User.getUserByEmail(value);
        if (user) {
            throw new Error('Email already exists');
        }
    }),
    check('username').custom(async (value) => {
        const user = await User.getUserByUsername(value);
        if (user) {
            throw new Error('Username already exists');
        }
    }),
], async (req, res) => {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

    // Create a new user object
    const newUser = {
        email: req.body.email,
        username: req.body.username,
        password: hashedPassword,
        full_name: req.body.full_name
    };

    // Insert user into MySQL
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

//Dashboard route
app.get('/dashboard', (req, res) => {
    // Assuming you have middleware to handle user authentication and store user information in req.user
    const userFullName = req.user.full_name;
    res.render('dashboard', { fullName: userFullName });
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


// Route to retrieve courses
app.get('/courses', (req, res) => {
    const sql = 'SELECT id, name FROM courses'; // Adjust the query based on your database schema
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching courses: ' + err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Route to retrieve user data (user ID) based on username
app.get('/user-data/:username', async (req, res) => {
    try {
        const { username } = req.params;

        // Assuming you have a "users" table with columns (id, username)
        const [rows] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
        if (rows.length > 0) {
            res.status(200).json({ userId: rows[0].id });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error fetching user data:', error.message);
        res.status(500).json({ error: error.message });
    }
});


// Route to save selected courses
app.post('/selected-courses', async (req, res) => {
    try {
        const { userId, selectedCourses } = req.body;

        // Assuming you have a "selected_courses" table with columns (user_id, course_id)
        const insertSql = 'INSERT INTO selected_courses (user_id, course_id) VALUES (?, ?)';
        const values = selectedCourses.map(courseId => [userId, courseId]);

        connection.query(insertSql, [values], (err, results) => {
            if (err) {
                console.error('Error saving selected courses: ' + err.message);
                return res.status(500).json({ error: err.message });
            }
            console.log('Selected courses saved successfully');
            res.sendStatus(200);
        });
    } catch (error) {
        console.error('Error saving selected courses:', error.message);
        res.status(500).json({ error: error.message });
    }
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});