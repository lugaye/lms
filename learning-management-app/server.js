const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const { check, validationResult } = require('express-validator');
const path = require('path'); // Import the path module

const app = express();


// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from the default directory
app.use(express.static(__dirname));
app.set('views', path.join(__dirname, 'views'));


// Configure session middleware
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// Create SQLite database connection
const db = new sqlite3.Database('learning_management.db');

// Create users table if not exists
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            username TEXT UNIQUE,
            password TEXT,
            email TEXT UNIQUE,
            full_name TEXT
        )
    `);
});

//create courses table
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS courses (
            id INTEGER PRIMARY KEY,
            name TEXT
        )
    `)
});

//create table leaderboard
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS leaderboard (
            id INTEGER PRIMARY KEY,
            name TEXT,
            score INTEGER
        )
    `)
});

//selected_courses
db.serialize(() => {
    db.run(`
    CREATE TABLE IF NOT EXISTS selected_courses (
        id INTEGER PRIMARY KEY,
        user_id INTEGER,
        course_id INTEGER,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (course_id) REFERENCES courses(id)
    )
    `)
});


// Set up middleware to parse incoming JSON data
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));



// Define routes
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


app.get('/styles.css', (req, res) => {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(__dirname + '/style.css');
});



// Helper functions to interact with SQLite database
function getUserByEmail(email) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function getUserByUsername(username) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row);
            }
        });
    });
}

function getFullName(userId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT full_name FROM users WHERE id = ?', [userId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row.full_name);
            }
        });
    });
}





// Registration route
app.post('/register', [
    // Validate email and username fields
    check('email').isEmail(),
    check('username').isAlphanumeric().withMessage('Username must be alphanumeric'),

    // Custom validation to check if email and username are unique
    check('email').custom(async (value) => {
        const user = await getUserByEmail(value);
        if (user) {
            throw new Error('Email already exists');
        }
    }),
    check('username').custom(async (value) => {
        const user = await getUserByUsername(value);
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

    // Insert user into SQLite
    const newUser = {
        email: req.body.email,
        username: req.body.username,
        password: hashedPassword,
        full_name: req.body.full_name
    };

    db.run(`INSERT INTO users (email, username, password, full_name) VALUES (?, ?, ?, ?)`,
        [newUser.email, newUser.username, newUser.password, newUser.full_name],
        function(err) {
            if (err) {
                console.error('Error inserting user: ' + err.message);
                return res.status(500).json({ error: err.message });
            }
            console.log('Inserted a new user with id ' + this.lastID);
            res.status(201).json(newUser);
        });
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    // Retrieve user from database
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) throw err;
        if (!user) {
            res.status(401).send('Invalid username or password');
        } else {
            // Compare passwords
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    // Store user information in session
                    req.session.user = user;
                    // Redirect to dashboard upon successful login
                    res.redirect('/dashboard');
                } else {
                    res.status(401).send('Invalid username or password');
                }
            });
        }
    });
});


// Dashboard route
app.get('/dashboard', (req, res) => {
    // Check if the user is authenticated (logged in)
    if (!req.session.user) {
        // If not logged in, redirect to login page
        res.redirect('/');
    } else {
        // If logged in, render the dashboard page
        res.sendFile(__dirname + '/dashboard.html');
    }
});

// Logout route
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.send('Logout successful');
});


// Endpoint to fetch course content
app.get('/courses', (req, res) => {
    db.all('SELECT * FROM courses', (err, rows) => {
        if (err) {
            console.error('Error fetching course content:', err);
            res.status(500).json({ error: 'Internal server error' });
        } else {
            res.json(rows); // Assuming you want to send JSON data
        }
    });
});


// Endpoint to retrieve leaderboard data
app.get('/leaderboard', (req, res) => {
    // SQL query to select data from leaderboard table sorted by score in descending order
    const sql = 'SELECT * FROM leaderboard ORDER BY score DESC';

    // Execute the query
    db.all(sql, (err, rows) => {
        if (err) {
            // Handle errors
            console.error('Error retrieving leaderboard data:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            // Send the leaderboard data as a response
            res.json(rows);
        }
    });
});


// Endpoint to select a course for a user
app.post('/select-course/:userId/:courseId', (req, res) => {
    const userId = req.params.userId;
    const courseId = req.params.courseId;

    // Insert the selected course into the database for the user
    db.run('INSERT INTO selected_courses (user_id, course_id) VALUES (?, ?)', [userId, courseId], (err) => {
        if (err) {
            console.error('Error selecting course:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            res.status(200).json({ message: 'Course selected successfully' });
        }
    });
});





// Endpoint to fetch the full name of the logged-in user
app.get('/get-fullname', async (req, res) => {
    try {
        // Check if the user is logged in
        if (!req.session.user || !req.session.user.id) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Retrieve user ID from the session
        const userId = req.session.user.id;
        
        // Query the database to fetch the full name using the user ID
        const fullName = await getFullName(userId);
        
        // Send the full name as JSON response
        res.json({ fullName });
    } catch (error) {
        console.error('Error fetching full name:', error);
    }
});


// Endpoint to render the selected-courses.html page
app.get('/selected-courses.html', (req, res) => {
    // Render the selected-courses.ejs file located in the views directory
    res.render('selected-courses');
});


// Endpoint to fetch selected courses data and render selected-courses.html page
app.get('/selected-courses', (req, res) => {
    // Query the database to fetch selected courses data
    db.all('SELECT * FROM selected_courses', (err, rows) => {
      if (err) {
        console.error('Error fetching selected courses:', err);
        res.status(500).send('Internal Server Error');
      } else {
        // Render the selected-courses.ejs page and pass the selected courses data
        res.render('selected-courses', { courses: rows });  // Pass courses data to the template
      }
    });
  });
  


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});


