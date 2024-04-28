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
    key:'userloged',
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie:{secure:false,express:60000}
}));

app.set("view engine","ejs");
// Create MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Admin@4321test',
    database: 'lmsys'
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
let usercoursr;
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
                    req.session.username = results[0].id;
                                        //const courseId = 2;
                                        const sql = 'SELECT * FROM courses';
                                        connection.query(sql, (err, result) => {
                                          if (err) {
                                            throw err;
                                          }
                                          // Send course content as JSON response
                                         // console.log(result);
                                          res.render("course-content",{course: "result"});
                                        });
                    //res.send("ok");
                   
                } else {
                    res.status(401).send('Invalid username or password');
                }
            });
        }
       
    });
});

// Logout route
app.get('/logout', (req, res) => {
   req.session.destroy();
   res.redirect('/');
   // res.send('Logout successful');
});

app.get('/course-content',(req,res,next)=>{
    if(req.session.user){
        next();
    }else{
        res.redirect('/');
    }
},(req,res)=>{
    const sql = 'SELECT * FROM courses';
    connection.query(sql, (err, result) => {
      if (err) {
        throw err;
      }
      // Send course content as JSON response
      //console.log(result);
      console.log("session="+req.session.user);
      res.render("course-list",[{course: result}, {userxx: req.session.username}]);//course-content

    });
    //alert(req.session.user);
    //res.send("hi");
    //console.log(req.session.user);
});

app.post('/course-list1',(req,res,next)=>{
    if(req.session.user){
        next();
    }else{
        res.redirect('/');
    }
},(req,res,next)=>{
    if(req.session.user){
        next();
    }else{
        res.redirect('/');
    }
},(req,res)=>{


    const sql = 'SELECT * FROM courses';
    connection.query(sql, (err, result) => {
      if (err) {
        throw err;
      }
      let i=0;
      result.forEach(el => {
        result[i]={... result[i], username: req.session.username};
        i=i+1;
      });
      usercoursr=result;
      // Send course content as JSON response
      console.log(result);
      console.log(req.session.username);
      res.render("course-list",{course: usercoursr,userxx: req.session.username});//course-content
    });


    //alert(req.session.user);
    //res.send("hi");
    //console.log(req.session.user);
});

app.get('/course-list',(req,res,next)=>{
    if(req.session.user){
        next();
    }else{
        res.redirect('/');
    }
},(req,res,next)=>{
    if(req.session.user){
        next();
    }else{
        res.redirect('/');
    }
},(req,res)=>{


    const sql = 'SELECT * FROM courses';
    connection.query(sql, (err, result) => {
      if (err) {
        throw err;
      }
      let i=0;
      result.forEach(el => {
        result[i]={... result[i], username: req.session.username};
        result[i]={... result[i], mycourse: false};
        i=i+1;
      });
      // Send course content as JSON response
      console.log(result);
      console.log(req.session.username);
      res.render("course-list",{course: result,userxx: req.session.username});//course-content
    });


    //alert(req.session.user);
    //res.send("hi");
    //console.log(req.session.user);
});

app.get('/mycourse',(req,res,next)=>{
    if(req.session.user){
        next();
    }else{
        res.redirect('/');
    }
},(req,res,next)=>{
    if(req.session.user){
        next();
    }else{
        res.redirect('/');
    }
},(req,res)=>{


    const sql = 'SELECT distinct userid,courseid,name from lmsys.user_course uc, lmsys.courses c where uc.userid=1 and c.id=uc.courseid';
    connection.query(sql, (err, result) => {
      if (err) {
        throw err;
      }
      let i=0;
      result.forEach(el => {
        result[i]={... result[i], username: req.session.username};
        result[i]={... result[i], mycourse: true};
        i=i+1;
      });
      // Send course content as JSON response
      console.log("mycourse=");
      console.log(result);
      console.log(req.session.username);
      res.render("mycourse-list",{course: result,userxx: req.session.username});//course-content
    });


    //alert(req.session.user);
    //res.send("hi");
    //console.log(req.session.user);
});

//add course and user
app.post('/addcourse',(req,res,next)=>{
    console.log("add="+req.body.selectedCourse);
    if(req.session.user){
        next();
    }else{
        res.redirect('/');
    }
},(req,res,next)=>{
    connection.query('insert into user_course(userid,courseid) values(?,?)', [req.body.selectedUser,req.body.selectedCourse], (err, results) =>{
        if (err)
        { 
            throw err;
        }
        else{
            res.redirect('course-list');
           // next();
        }
        
    });
},
//(req,res)=>{

    /*const sql = 'SELECT * FROM courses';
    connection.query(sql, (err, result) => {
      if (err) {
        throw err;
      }
      /*let i=0;
      result.forEach(el => {
let newData ={username: req.session.username}
        result[i]={... result[i], username: req.session.username};
        i=i+1;
      });*/
      // Send course content as JSON response
      //console.log(result);
      //console.log(req.session.username);
      //usercoursr
      //res.render("course-list",{course: result,userxx: req.session.username});//course-content
     // res.redirect('course-list');
    //});*/


    //alert(req.session.user);
    //res.send("hi");
    //console.log(req.session.user);
//}
);

//Dashboard route
app.get('/dashboard',(req,res,next)=>{
    if(req.session.user){
        next();
    }else{
        res.redirect('/');
    }
}, (req, res) => {
    // Assuming you have middleware to handle user authentication and store user information in req.user
    const userFullName = req.user.full_name;
    res.render('dashboard', { fullName: userFullName });
});

// Route to retrieve course content
app.get('/course/:id',(req,res,next)=>{
    if(req.session.user){
        next();
    }else{
        res.redirect('/');
    }
}, (req, res) => {
    const courseId = req.params.id;
    const sql = 'SELECT * FROM courses WHERE id = ?';
    connection.query(sql, [courseId], (err, result1) => {
      if (err) {
        throw err;
      }
      let i=0;
      result1.forEach(el => {
result1[i]={... result1[i], username: req.session.username};
        i=i+1;
      });
      // Send course content as JSON response
      console.log()
      console.log(result1);
      console.log(req.session.user);
      res.render("course-content",{course:result1});
    });
  });

  app.get('/mycourse/:id',(req,res,next)=>{
    if(req.session.user){
        next();
    }else{
        res.redirect('/');
    }
}, (req, res) => {
    const courseId = req.params.id;
    const sql = 'SELECT * FROM courses WHERE id = ?';
    connection.query(sql, [courseId], (err, result1) => {
      if (err) {
        throw err;
      }
      let i=0;
      result1.forEach(el => {
result1[i]={... result1[i], username: req.session.username};
        i=i+1;
      });
      // Send course content as JSON response
      //console.log()
      //console.log(result1);
      //console.log(req.session.user);
      res.render("mycourse-content",{course:result1});
    });
  });

  app.get('/leadboard',(req,res,next)=>{
    if(req.session.user){
        next();
    }else{
        res.redirect('/');
    }
}, (req, res) => {
    const courseId = req.params.id;
    const sql = 'select * from lmsys.leaderboard order by score Desc';
    connection.query(sql,  (err, result1) => {
      if (err) {
        throw err;
      }
      let i=0;
      result1.forEach(el => {
result1[i]={... result1[i], username: req.session.username};
        i=i+1;
      });
      // Send course content as JSON response
      //console.log()
      //console.log(result1);
      //console.log(req.session.user);
      res.render("leader-board",{course:result1});
    });
  });

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});