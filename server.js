const express = require('express');
const path = require('path');
const mysql = require('mysql');
const ejs = require('ejs');

const app = express();

// Define the path to the directory containing static files (e.g., HTML, CSS, JavaScript)
const publicDirectoryPath = path.join(__dirname);

// Set up static directory to serve
app.use(express.static(publicDirectoryPath));

// MySQL database connection configuration
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Ladyauggie@1.',
    database: 'learning_management'
});

// Connect to MySQL database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        process.exit(1); // Terminate the application if unable to connect to the database
    }
    console.log('Connected to MySQL database');
});

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Middleware to parse JSON request bodies
app.use(express.json());

// Error handling middleware for JSON parsing errors
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        res.status(400).send('Bad Request: Invalid JSON');
    } else {
        next();
    }
});

// Route to handle requests to the root path ("/")
app.get('/', (req, res) => {
    res.send('Welcome to the Learning Management System!');
});

// Route to handle fetching selected courses from the database and rendering the HTML file
app.get('/selected-courses', (req, res) => {
    const sql = 'SELECT * FROM selected_courses';
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching selected courses from database:', err);
            res.status(500).send('Internal server error');
            return;
        }
        res.sendFile(path.join(__dirname, 'selected-courses.html')); // Render the HTML file
    });
});

// Route to handle course submission
app.post('/submit-courses', (req, res) => {
    const { course1, course2, course3 } = req.body;

    const sql = 'INSERT INTO selected_courses (course1, course2, course3) VALUES (?, ?, ?)';
    connection.query(sql, [course1, course2, course3], (err, result) => {
        if (err) {
            console.error('Error inserting courses into database:', err);
            res.status(500).json({ success: false });
            return;
        }
        console.log('Courses inserted into database successfully');
        res.json({ success: true });
    });
});

// Start server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
