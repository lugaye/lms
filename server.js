// server.js
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const { check, validationResult } = require('express-validator');
const app = express();

// Configure session middleware
app.use(session({
    secret: '@jfwe940-42h4#nu24t/-223/1t9$413%',
    resave: false,
    saveUninitialized: true
}));

// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '#1mysqlKalama',
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

// Set up middleware to parse incoming JSON request
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
    createUser: (newUser, callback) => {
        connection.query(`INSERT INTO ${User.tableName} SET ?`, [newUser], callback);
    },
    getUserByEmail: (email, callback) => {
        connection.query(`SELECT * FROM ${User.tableName} WHERE email = ?`, [email], callback);
    },
    getUserByUsername: (username, callback) => {
        connection.query(`SELECT * FROM ${User.tableName} WHERE username = ?`, [username], callback);
    }
};


// REGISTRATION ROUTE
app.post('/register', [
    // Validate email and username fields
    check('email').isEmail(),
    check('username').trim().notEmpty().isAlphanumeric().withMessage('Username must be alphanumeric'),

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
        if(error) {
            console.error(`Error inserting user: ${error.message}`);
            return res.status(500).json({ error: error.message });
        }
        console.log(`Inserted a new user with id ${results.insertId}`);
        res.status(201).json(newUser);
    });
});


// LOGIN ROUTE
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
                    req.session.userId = user.id;
                    res.redirect('/my_courses.html'); // Redirecting to the page on successful login
                } else {
                    res.status(401).send('Invalid username or password');
                }
            });
        }
    });
}); // The end of the login logic


// ROUTE TO HANDLE COURSE SELECTION, CHECKS IF USER IS LOGGED IN 
app.get('/course/:id', (req, res) => {
    if(!req.session.userId) { // If the user is not logged in
        return res.redirect('/login.html'); // Redirect to log in page
    }
    res.redirect(`/enroll/${req.params.id}`); // Redirect to enrollment page
});


// ROUTE TO HANDLE COURSE ENROLLMENT
app.get('/enroll/:courseId', (req, res) => {
    if(!req.session.userId){
        return res.status(401).send('Unauthorized'); // Respond with 401 Unauthorized status
    }

    const userId = req.session.userId;
    const courseId = req.params.courseId;

    // Query to check if  the user is already enrolled in the course
    connection.query('SELECT * FROM enrollments WHERE id = ? AND course_id = ?', [userId, courseId], (err, results) => { // Retrive courseId of a user if it exist
        if(err) throw err;
        if(results.length > 0) {
            res.send('You are already enrolled to this course.');
        } else {
            // Enroll the user in the course
            connection.query('INSERT INTO enrollments (id, course_id) VALUES (?, ?)', [userId, courseId], (err, results) => {
                if(err) throw err;
                res.send('Enrollment successful.');
            });
        }

    });
});


// ROUTE TO GET THE USER'S ENROLLED COURSES IN ORDER TO DISPLAY IN THE MY_COURSE PAGE
app.get('/my_courses', (req, res) => {
    if(!req.session.userId) { 
        return res.redirect('/login.html');
    }

    const userId = req.session.userId;

    // Query to fetch courses that the user is enrolled in
    const getCourseQuery = `
    SELECT courses.course_id, courses.name 
    FROM courses
    JOIN enrollments ON courses.course_id = enrollments.course_id
    WHERE enrollments.id = ?
    `;
    connection.query(getCourseQuery, [userId], (err, results) => {
        if(err) throw err;
        res.json(results); // Return the result as JSON
    });
});


// ROUTE TO GET THE LIST OF ALL COURSES IN FROM THE DATABASE
app.get('/courses', (req, res) => {
    connection.query('SELECT * FROM courses', (err, results) => {
        if(err) throw err;
        res.json(results); // Return the reslut as JSON
    });
});


// LOGOUT ROUTE
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
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
