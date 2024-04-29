//server.js
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
const connection = mysql.createConnection({//connecting to our database,variable connection will hold the database connection
    host: 'localhost',
    user: 'root',
    password: 'Dunya@Riek2027',
    database: 'learning_management'
});


// Connect to MySQL
connection.connect((err) => { //this is to check if our db(database) is connected using connect method and throw in an error in not
    if (err) {
        console.error('Error connecting to MySQL: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL as id ' + connection.threadId);// this will show at our console if there is no error and db is connected.
});

// Serve static files from the default directory
app.use(express.static(__dirname));//fetching the static files(are script.js and style.css),using directory name to reference the static files.



//setting up the middleware to parse each and every incoming JSON data by using the app via the method express.json
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));// taking in to account any url that may occur in our application

app.use(bodyParser.urlencoded({ extended: true }));

// Define routes
app.get('/', (req, res) => { /* accessing server and using 'get' method and then defining the route which is '/'
it takes two parameters(request(req) and response(re))*/
    res.sendFile(__dirname + '/index.html');
});


// Define a User representation for clarity
const User = {
    tableName: 'users', 
    createUser: function(newUser, callback) {
        connection.query('INSERT INTO ' + this.tableName + ' SET ?', newUser, callback);
    },  
    getUserByEmail: function(email, callback) {
        connection.query('SELECT * FROM ' + this.tableName + ' WHERE email = ?', email, callback);// defining a variable that will hold our query,by selecting all from the table search by email.
    },
    getUserByUsername: function(username, callback) {
        connection.query('SELECT * FROM ' + this.tableName + ' WHERE username = ?', username, callback);// defining a variable that will hold our query,by selecting all from the student table,search by username
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
    })
],  async (req, res) => { // Ensure this function is declared as async
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
                console.error('Error inserting user: ' + error.message);
                return res.status(500).json({ error: error.message });
            }
            console.log('Inserted a new user with id ' + results.insertId);
            res.status(201).json(newUser);
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});