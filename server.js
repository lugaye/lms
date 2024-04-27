// server.js
const express = require('express');
const path = require('path');
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


// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Specify the directory where your view files are located
app.set('views', path.join(__dirname, 'views'));


// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '39021886',
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
// Registration route
app.post('/register', [
    // Validation middleware...

], async (req, res) => {
    // Registration logic...

    // Redirect to dashboard after successful registration
    res.redirect('/dashboard');
});


// Login route
// GET route for rendering the login form
app.get('/login', (req, res) => {
    res.render('login'); // Assuming you have a login.ejs or login.html file for the login form
});


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
                    // Redirect to dashboard
                    res.redirect('/dashboard');
                } else {
                    res.status(401).send('Invalid username or password');
                }
            });
        }
    });
});

// Assuming you have already configured your Express app and set up routes


// Dashboard route
app.get('/dashboard', (req, res) => {
    // Check if user is authenticated
    if (!req.session.user) {
        // If user is not authenticated, redirect to login page
        res.redirect('/login');
        return;
    }
    // Assuming you have middleware to handle user authentication and store user information in req.user
    const userFullName = req.session.user.full_name;
    res.render('dashboard', { fullName: userFullName });
});


// Logout route
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.send('Logout successful');
});




// Dashboard route
app.get('/dashboard', (req, res) => {
    // Check if user is authenticated
    if (req.session.user) {
        // Retrieve user data from session and extract full name
        const userFullName = req.user.full_name;
        console.log("userFullName:", userFullName);

        // Render dashboard with user information
        res.render('dashboard', { userFullName });
    } else {
        // Redirect to login page if not authenticated
        res.redirect('/login');
    }
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

  // API endpoint to handle course selection
app.post('/select-courses', (req, res) => {
    const userId = req.session.user.id; // Assuming user information is stored in the session
    const selectedCourses = req.body.selectedCourses; // Assuming selected courses are sent in the request body

    // Store selected courses in the database
    const insertions = selectedCourses.map(courseId => {
        return new Promise((resolve, reject) => {
            connection.query('INSERT INTO user_courses (user_id, course_id) VALUES (?, ?)', [userId, courseId], (err, result) => {
                if (err) {
                    console.error('Error selecting courses:', err);
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    });

    // Wait for all insertions to complete
    Promise.all(insertions)
        .then(() => {
            res.send('Courses selected successfully');
        })
        .catch(error => {
            res.status(500).send('Error selecting courses');
        });
});


// Start server
const PORT = process.env.PORT || 3008;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});