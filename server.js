// Importing required modules
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const { check, validationResult } = require('express-validator');

// Creating an Express application
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
  password: '@Jwg2024m', // Add your MySQL password here
  database: 'lms_app' // Add your database name here
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err.stack);
    return;
  }
  console.log("Connected to MySQL as id", connection.threadId);
});

// Serve static files from the default directory
app.use(express.static(__dirname));

// Set up middleware to parse incoming JSON data
app.use(express.json());
app.use(bodyParser.json());

// Set up middleware to parse incoming form data
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
  // Custom validation to check if email and usernames are unique
  check('email').custom(async (value, { req }) => {
    if (!value) {
      throw new Error('Email is required');
    }

    try {
      const user = await User.getUserByEmail(value);
      if (user && user.length > 0) { // Check if user is defined and has length property
        throw new Error('Email already exists');
      }
    } catch (error) {
      throw new Error('Database error');
    }
  }),
  check('username').custom(async (value, { req }) => {
    if (!value) {
      throw new Error('Username is required');
    }

    try {
      const user = await User.getUserByUsername(value);
      if (user && user.length > 0) { // Check if user is defined and has length property
        throw new Error('Username already exists');
      }
    } catch (error) {
      throw new Error('Database error');
    }
  })
], async (req, res) => {
  // Handle registration logic
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(400).json({ errors: errors.array() });
  }

  try {
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
        console.error('Error inserting user:', error.message);
        return res.status(500).json({ error: error.message });
      }
      console.log("Inserted a new user with id:", results.insertId);
      res.status(201).json(newUser);
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

// Login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Retrieve user from database
  connection.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (results.length === 0) {
      return res.status(401).send("Invalid username or password");
    }

    const user = results[0];
    try {
      // Compare passwords
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        // Store user in session
        req.session.user = user;
        return res.send("Login successful");
      } else {
        return res.status(401).send("Invalid username or password");
      }
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: 'An error occurred' });
    }
  });
});

// Logout route
app.post("/logout", (req, res) => {
  req.session.destroy();
  res.send("Logout successful");
});

// Dashboard route
app.get("/dashboard", (req, res) => {
  // Assuming you have middleware to handle user authentication and store user information in req
  if (!req.session.user) {
    return res.status(401).send("Unauthorized");
  }

  const userFullName = req.session.user.full_name;
  res.send(`Welcome to the dashboard, ${userFullName}!`);
});

// Route to retrieve course content
app.get('/course/:id', (req, res) => {
  const courseId = req.params.id;
  const sql = "SELECT * FROM courses WHERE id = ?";
  connection.query(sql, [courseId], (err, result) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
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
