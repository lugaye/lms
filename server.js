const express = require('express');
const mysql = require('mysql');
const app = express();
const PORT = process.env.PORT || 3000;

// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'geofrey',
    password: '1234',
    database: 'learning management system'
});

// Connect to MySQL
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Serve static files from the "public" directory
app.use(express.static('public'));

// Example endpoint to fetch user courses from MySQL
app.get('/api/user/courses', (req, res) => {
    // Example query to fetch user courses from MySQL
    const userId = req.query.userId; // Assuming userId is passed as a query parameter
    const query = `SELECT * FROM courses WHERE user_id = ${userId}`;
    
    // Execute the query
    connection.query(query, (err, results) => {
        if (err) {
            console.error('Error executing MySQL query:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json({ courses: results });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
