const express=require('express');
const session=require('express-session');
const bcrypt=require('bcryptjs');
const bodyParser=require('body-parser');
const mysql=require('mysql');
const {check,validationResult}=require('express-validator');
const { render } = require('ejs');
const app=express();

app.use(session({
    secret:'cdyyf-c3457-l88uiguel',
    resave:false,
    saveUninitialized:true

}));

const connection=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'MySql04@axa#',
    database:'learning_management'
});
connection.connect((err)=>{
    if(err){
        console.error('Error connecting to mysql:'+err.stack);
        return;
    }
    console.log('Connected to Mysql')
});
app.use(express.static(__dirname));

app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}));
app.use(bodyParser.urlencoded({extended:true}));

app.get('/',(req,res)=>{
    res.sendFile(__dirname + '/index.html');
});
const User= {
    tablename:'Users',
    createUser:function(newUser,callback){
        connection.query('INSERT INTO '+ this.tablename + ' SET ?',newUser,callback);
    },
    getUserByEmail:function(email,callback){
        connection.query('SELECT * FROM '+ this.tablename + ' WHERE email = ?',email,callback);
    },
    getUserByUserName:function(username,callback){
        connection.query('SELECT * FROM '+ this.tablename + ' WHERE username = ?',username,callback);
    }
};

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
        console.log('User object:', User);
        const user = await User.getUserByUserName(value);
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

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    connection.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Server error');
        }
        if (results.length === 0) {
            return res.status(401).send('Invalid username or password');
        }
        const user = results[0];
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                req.session.user = user;
                res.json({ message: 'Login Successful', redirect: '/dashboard' }); // Send JSON response with redirect URL
            } else {
                res.status(401).send('Invalid username or password');
            }
        });
    });
});
app.post('/logout',(req,res)=>{
    req.session.destroy();
    res.send('Logout Successful')
});
app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.status(401).redirect('/'); // Redirect to login if not authenticated
    }

    // Read the dashboard.html file and replace the placeholder with the user's full name
    const fs = require('fs');
    const filePath = path.join(__dirname, 'dashboard.html');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.log(err);
            return res.status(500).send('Server error');
        }

        // Replace placeholder with user's full name
        const userFullName = req.session.user.full_name;
        const result = data.replace('<%= fullName %>', userFullName);

        // Send the modified HTML file
        res.send(result);
    });
});
app.get('/course/:id',(req,res)=>{
    const courseId=req.params.id;
    const sql='SELECT * FROM courses WHERE id = ?';
    db.query(sql,[courseId],(err,result)=>{
        if(err){
            throw err;
        }
        res.json(result);
    });
});
app.post('/select-course', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Unauthorized');
    }
    const userId = req.session.user.id;
    const courseId = req.body.courseId;

    connection.query('INSERT INTO user_courses (user_id, course_id) VALUES (?, ?)', [userId, courseId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to select course' });
        }
        res.json({ success: true });
    });
});

app.get('/selected-courses', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Unauthorized');
    }
    const userId = req.session.user.id;

    connection.query(`
        SELECT c.id, c.name
        FROM courses c
        JOIN user_courses uc ON c.id = uc.course_id
        WHERE uc.user_id = ?`, [userId], (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch selected courses' });
        }
        res.json(results);
    });
});


const PORT=3000;
app.listen(PORT,()=>{
    console.log(`Server is running on port: ${PORT}`);
});