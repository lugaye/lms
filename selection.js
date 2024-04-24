const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

// Example database (in-memory)
let selectedCourses = [];

app.use(bodyParser.json());

app.post('/storecourses', (req, res) => {
    const courses = req.body;
    selectedCourses = courses;
    console.log('Selected courses:', selectedCourses);
    // Here you would typically store the selected courses in your database

    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
