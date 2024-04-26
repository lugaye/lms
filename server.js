// server.js
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const { check, validationResult } = require('express-validator');
const dotenv = require('dotenv');
dotenv.config();

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
    password: process.env.DB_PASSWORD,
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

// Serve static files from the default directory
app.use(express.static(__dirname));

// Define a route for styles.css
app.get('/styles.css', (req, res) => {
    res.sendFile(__dirname + '/style.css', {
        headers: {
            'Content-Type': 'text/css'
        }
    });
});

// Define a route for course-content.html
app.get('/course-content', (req, res) => {
    res.sendFile(__dirname + '/course-content.html');
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
    if (!req.session.user || !req.session.user.full_name) {
        // Handle case where user is not logged in or full_name is not set
        res.status(401).send('Unauthorized');
        return;
    }
    const userFullName = req.session.user.full_name;
    res.render(__dirname + '/dashboard.ejs', { fullName: userFullName });
});



// Route to retrieve course content
app.get('/course/:id', (req, res) => {
    const courseId = req.params.id;
    const sql = 'SELECT * FROM courses WHERE id = ?';
    connection.query(sql, [courseId], (err, result) => {
      if (err) {
        console.error('Error fetching vourse content:', err);
        return res.status(500).json({error: 'Failed to fetch course content'});
        
      }
      if (result.length === 0){
        return res.status(404).json({error: 'Course not found'});
      }
      // Send course content as JSON response
      res.json(result);
    });
  });
  // Add a route to handle course selection by the user
app.post('/select-course', (req, res) => {
    const userId = req.session.user.id;
    const courseId = req.body.courseId; // Assuming courseId is sent in the request body
    const sql = 'INSERT INTO user_courses (user_id, course_id) VALUES (?, ?)';
    connection.query(sql, [userId, courseId], (err, result) => {
        if (err) {
            console.error('Error selecting course:', err);
            return res.status(500).json({ error: 'Failed to select course' });
        }
        res.status(200).json({ message: 'Course selected successfully' });
    });
});

// Create a route to display the selected courses for the logged-in user
app.get('/selected-courses', (req, res) => {
    const userId = req.session.user.id;
    const sql = `
        SELECT courses.id, courses.name
        FROM user_courses
        JOIN courses ON user_courses.course_id = courses.id
        WHERE user_id = ?
    `;
    connection.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching selected courses:', err);
            return res.status(500).json({ error: 'Failed to fetch selected courses' });
        }
        res.status(200).json(results);
    });
});
// Define a route for course-content.html
app.get('/course-content', async (req, res) => {
    // Check if user is logged in
    if (!req.session.user) {
        return res.status(401).send('Unauthorized');
    }

    // Fetch selected courses for the logged-in user
    const userId = req.session.user.id;
    const sql = `
        SELECT courses.id, courses.name
        FROM user_courses
        JOIN courses ON user_courses.course_id = courses.id
        WHERE user_id = ?
    `;
    connection.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching selected courses:', err);
            return res.status(500).json({ error: 'Failed to fetch selected courses' });
        }

        // Pass the selected courses to the course-content.html file for rendering
        res.sendFile(__dirname + '/course-content.html', { selectedCourses: results });
    });
});



// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});