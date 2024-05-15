const mysql = require('mysql2');

// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '91d653!@',
    database: 'learning_management'
});
exports.connection = connection;
