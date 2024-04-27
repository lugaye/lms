// server.js
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const { check, validationResult } = require('express-validator');
const ejs = require('ejs');
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
app.set('view engine', ejs);

function isAuthenticated(req, res, next) {
    if(req.session.user) {
        next()
    }else {
        res.status(401).send('Unauthorized');
    }
}

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
                    // res.send('Login successful');
                    res.redirect('/dashboard');
                } else {
                    res.status(401).send('Invalid username or password');
                }
            });
        }
    });
});

app.get('/get-fullname', isAuthenticated, (req, res) => {
    if(req.session.user) {
        const fullName = req.session.user.full_name;
        res.json({fullName: fullName});
    }else {
        res.status(401).send('User not logged in');
    }
})

app.get('/leaderboard',isAuthenticated, (req, res) => {
    connection.query('SELECT * FROM leaderboard', (err, result) => {
        if (err) throw err;
        if(result.length===0) {
            console.log("No data in the leaderboard");
        }else {
            res.json(result);
        }
    })
})

// Logout route
app.post('/logout', (req, res) => {
    req.session.destroy();
    res.send('Logout successful');
});

//Dashboard route
app.get('/dashboard', isAuthenticated, (req, res) => {
    // Assuming you have middleware to handle user authentication and store user information in req.user
    const userFullName = req.session.user.full_name;
    // res.render('dashboard', { fullName: userFullName });
    res.sendFile(__dirname + '/dashboard.html');
});

app.get('/leader-board',isAuthenticated, (req, res) => {
    res.sendFile(__dirname + '/leader-board.html');
})


// Route to retrieve course content
app.get('/course/:id', (req, res) => {
    const courseId = req.params.id;
    const sql = 'SELECT * FROM courses WHERE id = ?';
    connection.query(sql, [courseId], (err, result) => {
      if (err) {
        throw err;
      }
      // Send course content as JSON response
      res.json(result);
    });
  });

app.get('/courses', (req, res) => {
    connection.query('SELECT `id`, `name` FROM `courses`', (err, results) => {
        if(err) throw err
        if(results.length===0) {
            console.log("No data in the courses");
        }else {
            console.log(results);
            res.json(results);
        }
    })
})

app.post('/enroll', (req, res) => {
    const id = req.body.id;
    const userId = req.session.user.id;

    const sql = 'INSERT INTO user_courses (user_id, course_id) VALUES (?, ?)';
    connection.query(sql, [userId, id], (err, result) => {
        if (err) {
            console.error('Error enrolling user in course:', err);
            res.status(500).send('Internal server error');
            return;
        }
        console.log('User enrolled in course successfully');
        res.status(200).send('Enrolled in course successfully');
    });

})

app.get('/course-content', (req, res) => {
    res.sendfile(__dirname +  '/course-content.html');
})

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});