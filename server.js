// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const router = require('./src/routes');
const session = require('express-session');
const connectdb = require('./src/dbconnection');

const app = express();

// Configure session middleware
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

//connectdb();

// Serve static files from the default directory
app.use('public', express.static('/src/public'));
app.use(express.static(path.join(__dirname, 'src/public')));

// Set up middleware to parse incoming JSON data
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', './src/views')

// Define routes
app.use(router);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});