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

// Serve static files from the default directory
app.use(express.static(__dirname));

// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'shiznit1999$',
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

// Set up middleware to parse incoming JSON data
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// Set the view engine to render EJS files
app.set('view engine', 'ejs');
app.set('views', './views');


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
        if (user.length > 0) {
            throw new Error('Email already exists');
        }
    }),
    check('username').custom(async (value) => {
        const user = await User.getUserByUsername(value);
        if (user.length > 0) {
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
                    req.session.user = {
                        id: user.id,
                        email: user.email,
                        username: user.username,
                        full_name: user.full_name // Set the full_name property in the session user object
                    };
                    res.redirect('/dashboard'); // Redirect to the dashboard
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

// Dashboard route
app.get('/dashboard', (req, res) => {
    //  middleware to handle user authentication and store user information in req.session.user
    if (!req.session.user) {
        return res.redirect('/'); // Redirect to login page if not logged in
    }
    res.sendFile(__dirname + '/dashboard.html');
});

// Route to serve the course content page
app.get('/course-content', (req, res) => {
    res.sendFile(__dirname + '/course-content.html');
});

// Route to serve the selected courses page
app.get('/selected_courses.html', (req, res) => {
    res.sendFile(__dirname + '/selected_courses.html');
});

// Route to display selected courses for the logged-in user
app.get('/selected_courses', (req, res) => {
    // Check if the user is logged in
    if (!req.session.user) {
        return res.redirect('/'); // Redirect to login page if not logged in
    }

    connection.query('SELECT courses.id, courses.name FROM user_courses JOIN courses ON user_courses.course_id = courses.id WHERE user_id = ?', [req.session.user.id], (err, results) => {
        if (err) {
            console.error('Error fetching selected courses:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.render('selected_courses', { courses: results, userId: req.session.user.id }); // Pass the userId to the selected_courses.ejs template
    });
});

// Route to retrieve course content
app.get('/course/:id', (req, res) => {
    const courseId = req.params.id;
    connection.query('SELECT * FROM courses WHERE id = ?', [courseId], (err, result) => {
        if (err) {
            throw err;
        }
        // Send course content as JSON response
        res.json(result);
    });
});

// Route to get the user's full name
app.get('/get-fullname', (req, res) => {
    if (req.session.user) {
        const fullName = req.session.user.full_name;
        res.json({ fullName });
    } else {
        res.status(401).json({ message: "User not logged in" });
    }
});

// Add a new route to handle course selection
app.post('/select-courses', (req, res) => {
    const { userId, selectedCourses } = req.body;

    // Delete previously selected courses for this user
    connection.query('DELETE FROM user_courses WHERE user_id = ?', [userId], (err, result) => {
        if (err) {
            console.error('Error deleting previous selections:', err);
            return res.status(500).send('Internal Server Error');
        }

        // Insert new selected courses
        const values = selectedCourses.map(courseId => [userId, courseId]);
        connection.query('INSERT INTO user_courses (user_id, course_id) VALUES ?', [values], (err, result) => {
            if (err) {
                console.error('Error selecting courses:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.status(200).send('Courses selected successfully');
        });
    });
});

// Route to serve the leaderboard page
app.get('/leader-board', (req, res) => {
    // Dummy leaderboard data for testing
    const leaderboardData = [
        { rank: 1, username: 'John Doe', score: 100 },
        { rank: 2, username: 'Jane Smith', score: 90 },
        { rank: 3, username: 'Michael Brown', score: 85 },
        { rank: 4, username: 'Emily Jones', score: 80 }
    ];

    // Render the leaderboard page with the leaderboard data
    res.render('leader-board', { leaderboardData });
});



// Route to fetch leaderboard data
app.get('/leaderboard', (req, res) => {
    // Dummy leaderboard data for testing
    const leaderboardData = [
        { rank: 1, username: 'John Doe', score: 100 },
        { rank: 2, username: 'Jane Smith', score: 90 },
        { rank: 3, username: 'Michael Brown', score: 85 },
        { rank: 4, username: 'Emily Jones', score: 80 }
    ];

    res.json(leaderboardData);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
