// server.js
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const { check, validationResult } = require('express-validator');
const app = express();

// Create Express app
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
    password: 'root',
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

// Define a Course representation
const Course = {
    tableName: 'courses',
    getAllCourses: function(callback) {
        connection.query('SELECT * FROM ' + this.tableName, callback);
    }
};

// Route to retrieve available courses
app.get('/courses', (req, res) => {
    Course.getAllCourses((error, results) => {
        if (error) {
            console.error('Error fetching courses:', error);
            return res.status(500).json({ error: 'Failed to fetch courses' });
        }
        res.json(results);
    });
});

// Route to save selected courses for the logged-in user
app.post('/save-course-selection', (req, res) => {
    const selectedCourses = req.body.courses;
    // Save selected courses for the user
    // Here you would typically update the database with the selected courses for the current user
    // Assuming you have a logged-in user stored in req.session.user
    // Example code to update the database is not provided here as it depends on your database schema
    res.sendStatus(200); // Send success status
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

  // Route to handle course selection
app.post('/select-course', (req, res) => {
    const userId = req.session.user.id; // Assuming user ID is stored in session
    const courseId = req.body.courseId; // Assuming course ID is sent in the request body

    // Insert selected course into user_courses table
    const sql = 'INSERT INTO user_courses (user_id, course_id) VALUES (?, ?)';
    connection.query(sql, [userId, courseId], (err, result) => {
        if (err) {
            console.error('Error selecting course:', err);
            return res.status(500).json({ error: 'An error occurred while selecting course' });
        }
        res.status(200).json({ message: 'Course selected successfully' });
    });
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Route to display selected courses for the logged-in user
app.get('/selected-courses', (req, res) => {
    const userId = req.session.user.id; // Assuming user ID is stored in session

    // Retrieve selected courses for the user from user_courses table
    const sql = 'SELECT courses.* FROM courses INNER JOIN user_courses ON courses.id = user_courses.course_id WHERE user_courses.user_id = ?';
    connection.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error retrieving selected courses:', err);
            return res.status(500).json({ error: 'An error occurred while retrieving selected courses' });
        }
        res.render('selected-courses', { courses: results }); // Render the page with selected courses
    });
});
