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
    password: 'Tehilla@2020',
    database: 'learning_management_system'
});

// Connect to MySQL
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL ' + connection.threadId);
});

// Serve static files from the default directory
app.use(express.static(__dirname));

// Set up middleware to parse incoming JSON data
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

// Define routes
//Landing page
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
// Middleware to check if the user is logged in
function isAuthenticated(req, res, next) {
    if (!req.cookies || !req.cookies.user_id) {
      return res.redirect('/login');
    }
    next();
  }
  // Route to display available courses and allow the user to select them
app.get('/select-courses', isAuthenticated, (req, res) => {
    // Fetch available courses from the database
    connection.query('SELECT * FROM courses', (err, courses) => {
      if (err) throw err;
      
      // Render the select courses page with the available courses
      res.render('select_courses', { courses });
    });
  });

 // Route to handle form submission of selected courses
app.post('/select-courses', isAuthenticated, (req, res) => {
    const userId = req.cookies.user_id;  // Assuming user_id is stored in cookies after login
    const selectedCourses = req.body.courses;  // Array of selected course IDs from the form
    
    // Clear previous selections for the user
    connection.query('DELETE FROM user_courses WHERE user_id = ?', [userId], err => {
      if (err) throw err;
      
      // Insert new selections for the user
      selectedCourses.forEach(courseId => {
        connection.query('INSERT INTO user_courses (user_id, course_id) VALUES (?, ?)', [userId, courseId], err => {
          if (err) throw err;
        });
      });
      
      res.redirect('/my-courses');
    });
  });
  
  // Route to display the selected courses for the logged-in user
  app.get('/my-courses', isAuthenticated, (req, res) => {
    const userId = req.cookies.user_id;  // Assuming user_id is stored in cookies after login
  
    // Fetch the selected courses for the user
    connection.query(`
      SELECT c.course_id, c.course_name 
      FROM user_courses uc 
      JOIN courses c ON uc.course_id = c.course_id 
      WHERE uc.user_id = ?
    `, [userId], (err, courses) => {
      if (err) throw err; 
      // Render the my courses page with the selected courses
    res.render('my_courses', { courses });
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

// Start server
const PORT = process.env.PORT || 3200;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});