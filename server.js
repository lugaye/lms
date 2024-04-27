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

app.set('view engine', 'ejs'); // Set EJS as the templating engine
app.set('views', __dirname + '/views'); // Set the correct views directory
// Serving static files
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/public', {
    setHeaders: (res, path) => {
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css'); // Ensure correct MIME type
        }
    }
}));



// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'learning_management'
});

// Connect to MySQL
connection.connect((err) => {
    if (err) {
      console.error('Error connecting to MySQL:', err);
    } else {
      console.log('Connected to MySQL');
    }
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

app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/'); // Redirect to home if not authenticated
    }

    // Render the dashboard and pass the full name
    res.render('dashboard', { fullName: req.session.user.full_name });
});

app.get('/course-content', (req, res) => {
    const sql = 'SELECT * FROM courses'; // Retrieve all courses from the database
    connection.query(sql, (err, results) => {
        if (err) {
            return res.status(500).send('Error retrieving course content.');
        }

        // Render the EJS template and pass the courses as a variable
        res.render('course-content', { courses: results });
    });
});


app.post('/select-courses', (req, res) => {
    const userId = req.session.user ? req.session.user.id : null; // Validate session data
    const courseIds = req.body.courseIds; // Ensure this is an array of course IDs

    if (!userId) {
        return res.status(401).send('User not authenticated.'); // Handle missing session data
    }

    if (!courseIds || courseIds.length === 0) {
        return res.status(400).send('No courses selected.'); // Handle missing course selections
    }

    const values = courseIds.map(courseId => [userId, courseId]); // Prepare the values

    const query = 'INSERT INTO usercourses (user_id, course_id) VALUES ?';

    connection.query(query, [values], (err, results) => {
        if (err) {
            console.error('Error storing course selections:', err);
            return res.status(500).send('Error storing course selections.');
        }

        res.status(200).send('Courses selected successfully.');
    });
});

app.get('/user-courses', (req, res) => {
    const userId = req.session.user ? req.session.user.id : null; // Validate session data

    if (!userId) {
        return res.status(401).send('User not authenticated.');
    }

    const query = `
        SELECT Courses.id, Courses.name
        FROM usercourses
        JOIN Courses ON usercourses.course_id = Courses.id
        WHERE usercourses.user_id = ?;
    `;

    connection.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error retrieving user courses:', err);
            return res.status(500).send('Error retrieving user courses.');
        }

        res.json(results); // Return the selected courses for this user
    });
});

app.delete('/delete-course/:id', (req, res) => {
    const courseId = req.params.id;
    const userId = req.session.user.id; // Ensure user ID is in the session

    const query = `
        DELETE FROM usercourses
        WHERE user_id = ? AND course_id = ?;
    `;

    connection.query(query, [userId, courseId], (err, results) => {
        if (err) {
            console.error('Error deleting course:', err);
            return res.status(500).send('Error deleting course.');
        }

        if (results.affectedRows === 0) {
            return res.status(404).send('Course not found.');
        }

        res.status(200).send('Course deleted successfully.');
    });
});



app.get('/leaderboard', (req, res) => {
    const query = `
        SELECT name, score
        FROM leaderboard
        ORDER BY score DESC
    `;

    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error retrieving leaderboard data:', err);
            return res.status(500).send('Error retrieving leaderboard data.');
        }

        res.json(results); // Return the leaderboard data as JSON
    });
});





// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});