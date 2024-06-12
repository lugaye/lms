// // server.js
// const express = require('express');
// const session = require('express-session');
// const bcrypt = require('bcryptjs');
// const bodyParser = require('body-parser');
// const mysql = require('mysql2');
// const { check, validationResult } = require('express-validator');
// const app = express();

// // Configure session middleware
// app.use(session({
//     secret: 'secret-key',
//     resave: false,
//     saveUninitialized: true
// }));

// // Create MySQL connection
// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'kinggasine',
//     database: 'learning_management'
// });

// // Connect to MySQL
// connection.connect((err) => {
//     if (err) {
//         console.error('Error connecting to MySQL: ' + err.stack);
//         return;
//     }
//     console.log('Connected to MySQL as id ' + connection.threadId);
// });

// // Serve static files from the default directory
// app.use(express.static(__dirname));

// // Set up middleware to parse incoming JSON data
// app.use(express.json());
// app.use(bodyParser.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.urlencoded({ extended: true }));

// // Define routes
// app.get('/', (req, res) => {
//     console.log(res)
//     res.sendFile(__dirname + '/index.html');
// });


  
// // Define a User representation for clarity
// const User = {
//     tableName: 'users', 
//     createUser: function(newUser, callback) {
//         connection.query('INSERT INTO ' + this.tableName + ' SET ?', newUser, callback);
//     },  
//     getUserByEmail: function(email, callback) {
//         connection.query('SELECT * FROM ' + this.tableName + ' WHERE email = ?', email, callback);
//     },
//     getUserByUsername: function(username, callback) {
//         connection.query('SELECT * FROM ' + this.tableName + ' WHERE username = ?', username, callback);
//     }
// };

// // Registration route
// app.post('/register', [
//     // Validate email and username fields
//     check('email').isEmail(),
//     check('username').isAlphanumeric().withMessage('Username must be alphanumeric'),

//     // Custom validation to check if email and username are unique
//     check('email').custom(async (value) => {
//         const user = await User.getUserByEmail(value);
//         if (user) {
//             throw new Error('Email already exists');
//         }
//     }),
//     check('username').custom(async (value) => {
//         const user = await User.getUserByUsername(value);
//         if (user) {
//             throw new Error('Username already exists');
//         }
//     }),
// ], async (req, res) => {
//     // Check for validation errors
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({ errors: errors.array() });
//     }

//     // Hash the password
//     const saltRounds = 10;
//     const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

//     // Create a new user object
//     const newUser = {
//         email: req.body.email,
//         username: req.body.username,
//         password: hashedPassword,
//         full_name: req.body.full_name
//     };

//     // Insert user into MySQL
//     User.createUser(newUser, (error, results, fields) => {
//         if (error) {
//           console.error('Error inserting user: ' + error.message);
//           return res.status(500).json({ error: error.message });
//         }
//         console.log('Inserted a new user with id ' + results.insertId);
//         res.status(201).json(newUser);
//       });
// });

// // Login route
// app.post('/login', (req, res) => {
//     const { username, password } = req.body;
//     // Retrieve user from database
//     connection.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
//         if (err) throw err;
//         if (results.length === 0) {
//             res.status(401).send('Invalid username or password');
//         } else {
//             const user = results[0];
//             // Compare passwords
//             bcrypt.compare(password, user.password, (err, isMatch) => {
//                 if (err) throw err;
//                 if (isMatch) {
//                     // Store user in session
//                     req.session.user = user;
//                     res.send('Login successful');
//                 } else {
//                     res.status(401).send('Invalid username or password');
//                 }
//             });
//         }
//     });
// });

// // Logout route
// app.post('/logout', (req, res) => {
//     req.session.destroy();
//     res.send('Logout successful');
// });

// //Dashboard route
// app.get('/dashboard', (req, res) => {
//     // Assuming you have middleware to handle user authentication and store user information in req.user
//     const userFullName = req.user.full_name;
//     res.render('dashboard', { fullName: userFullName });
// });

// // Route to retrieve course content
// app.get('/course/:id', (req, res) => {
//     const courseId = req.params.id;
//     const sql = 'SELECT * FROM courses WHERE id = ?';
//     db.query(sql, [courseId], (err, result) => {
//       if (err) {
//         throw err;
//       }
//       // Send course content as JSON response
//       res.json(result);
//     });
//   });

// // Start server
// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });








const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const ejs = require('ejs')
const { check, validationResult } = require('express-validator');
const app = express();


// Configure session middleware
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'kinggasine',
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

// Set EJS as the view engine
app.set('view engine', 'ejs');


// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        req.user = req.session.user;
        next();
    } else {
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
        connection.query('SELECT * FROM ' + this.tableName + ' WHERE email = ?', [email], callback);
    },
    getUserByUsername: function(username, callback) {
        connection.query('SELECT * FROM ' + this.tableName + ' WHERE username = ?', [username], callback);
    }
};

// Registration route
app.post('/register', [
    // Validate email and username fields
    check('email').isEmail(),
    check('username').isAlphanumeric().withMessage('Username must be alphanumeric'),

    // Custom validation to check if email and username are unique
    check('email').custom(async (value) => {
        const user = await new Promise((resolve, reject) => {
            User.getUserByEmail(value, (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
            });
        });
        if (user) {
            throw new Error('Email already exists');
        }
    }),
    check('username').custom(async (value) => {
        const user = await new Promise((resolve, reject) => {
            User.getUserByUsername(value, (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
            });
        });
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
            return res.status(401).send('Invalid username or password');
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

// Dashboard route
app.get('/dashboard', isAuthenticated, (req, res) => {
    const userFullName = req.user.full_name;
    res.render('dashboard', { fullName: userFullName });
});

// Route to retrieve course content
app.get('/course/:id', (req, res) => {
    const courseId = req.params.id;
    const sql = 'SELECT * FROM courses WHERE id = ?';
    connection.query(sql, [courseId], (err, result) => {
        if (err) throw err;
        // Send course content as JSON response
        console.log(result)
        res.json(result);
    });
});



// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        req.user = req.session.user;
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
}

// Route to display course selection page
app.get('/select-courses', isAuthenticated, (req, res) => {
    const sql = 'SELECT * FROM courses';
    connection.query(sql, (err, results) => {
        if (err) throw err;
        res.render('select-courses', { courses: results });
    });
});

// Route to handle course selection
app.post('/select-courses', isAuthenticated, (req, res) => {
    const selectedCourses = req.body.courses; // Array of course IDs
    const userId = req.user.id;

    // Insert selected courses into user_courses table
    const values = selectedCourses.map(courseId => [userId, courseId]);
    const sql = 'INSERT INTO user_courses (user_id, course_id) VALUES ?';
    connection.query(sql, [values], (err) => {
        if (err) throw err;
        res.redirect('/my-courses');
    });
});

// Route to display selected courses for the logged-in user
app.get('/my-courses', isAuthenticated, (req, res) => {
    const userId = req.user.id;
    const sql = `
        SELECT courses.* FROM courses
        JOIN user_courses ON courses.id = user_courses.course_id
        WHERE user_courses.user_id = ?
    `;
    connection.query(sql, [userId], (err, results) => {
        if (err) throw err;
        res.render('my-courses', { courses: results });
    });
});


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
