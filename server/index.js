const express = require('express');
const app = express();
const cors = require('cors');
const mysql = require('mysql');
const bcrypt = require('bcrypt');

app.use(cors());
app.use(express.json());

// make database connection
const db = mysql.createConnection({
  user: 'root',
  host: 'localhost',
  password: '',
  database: 'learning_management'
});

// Check if username or email already exists
const checkExistingUser = (username, email) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [username, email],
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          if (result.length > 0) {
            resolve(true); // User exists
          } else {
            resolve(false); // User does not exist
          }
        }
      }
    );
  });
};

app.post('/api/register', async (req, res) => {
  // get data sent from frontend
  const fullName = req.body.fullName;
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;

  // CUSTOM HOOK - $2a$10$SjxkK4s60Q8qZ2RmBS57Y.gKEdOakedjfzAuWc.Jy1IOO5q3wGPnK

  try {
    const userExists = await checkExistingUser(username, email);

    if (userExists) {
      return res.status(400).json({ error: "Username / Email Exists" });
    }

    // Hash the password with salt rounds = 10
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user
    db.query(
      "INSERT INTO users (username, password, email, full_name) VALUES (?, ?, ?, ?)",
      [username, hashedPassword, email, fullName],
      (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).json({ error: "Error Inserting Values" });
        } else {
          res.status(200).json({ message: "Registered Successfully" });
        }
      }
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});


app.post('/api/login', async (req, res) => {
  // get data sent from frontend
  const username = req.body.username;
  const password = req.body.password;

  try {
    db.query(
      "SELECT * FROM users WHERE username = ?",
      [username],
      async (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Server Error" });
        }

        if (result.length > 0) {
          const userData = result[0];
          const hashedPassword = userData.password;

          const passwordMatch = await bcrypt.compare(password, hashedPassword);

          if (passwordMatch) {
            // You got it buddy
            const { email, full_name } = userData;
            return res.status(200).json({ message: "Login Successful", userData: { email, fullName: full_name } });
          } else {
            // Nope thats dumb
            return res.status(400).json({ error: "Wrong Username or Password" });
          }
        } else {
          // User not found
          return res.status(400).json({ error: "User Not Found" });
        }
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server Error" });
  }
});

app.get('/api/leaderboard', (req, res) => {
  try {
    db.query(
      "SELECT * FROM leaderboard ORDER BY score DESC",
      (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Server Error" });
        }
        return res.status(200).json({ users: result });
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server Error" });
  }
});

app.get('/api/courses', (req, res) => {
  try {
    db.query(
      "SELECT * FROM courses",
      (err, result) => {
        if (err){ 
          console.log(err);
          return res.status(500).json({ error: "Server error" });
        }
        return res.status(200).json({ courses: result });
      }
    );
  } catch (error){
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});

app.post('/api/new-course', (req, res) => {
  const email = req.body.email;
  const courseId = req.body.courseId;

  try {
    db.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
      (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Server error" });
        }

        // Check if the result array is empty
        if (result.length === 0) {
          return res.status(404).json({ error: "User not found" });
        }

        const userId = result[0].id;

        try {
          db.query(
            "INSERT INTO usercourses (user_id, course_id) VALUES (?, ?)",
            [userId, courseId],
            (err, result) => {
              if (err) {
                console.log(err);
                return res.status(500).json({ error: "Server error" });
              }
              return res.status(200).json({ message: "Course Registered" });
            }
          );
        } catch (error) {
          console.error(error);
          return res.status(500).json({ error: "Server error" });
        }
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
    // CUSTOM HOOK - $2a$10$SjxkK4s60Q8qZ2RmBS57Y.gKEdOakedjfzAuWc.Jy1IOO5q3wGPnK
  }
});

app.post('/api/dropout', (req, res) => {
  const email = req.body.email;
  const courseId = req.body.courseId;

  try {
    db.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
      (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Server error" });
        }

        // Check if the result array is empty
        if (result.length === 0) {
          return res.status(404).json({ error: "User not found" });
        }

        const userId = result[0].id;

        try {
          db.query(
            "DELETE FROM usercourses WHERE user_id = ? AND course_id = ?",
            [userId, courseId],
            (err, result) => {
              if (err) {
                console.log(err);
                return res.status(500).json({ error: "Server error" });
              }
              return res.status(200).json({ message: "Achievement Dropout" });
            }
          );
        } catch (error) {
          console.error(error);
          return res.status(500).json({ error: "Server error" });
        }
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});



app.post('/api/courses/user', (req, res) => {
  const email = req.body.email;
  console.log(email);

  try {
    db.query(
      "SELECT id FROM users WHERE email = ?",
      [email],
      (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Server error" });
        }

        // Check if the result array is empty
        if (result.length === 0) {
          return res.status(404).json({ error: "User not found" });
        }

        const userId = result[0].id;

        try {
          db.query(
            "SELECT course_id FROM usercourses WHERE user_id = ?",
            [userId],
            (err, result) => {
              if (err) {
                console.log(err);
                return res.status(500).json({ error: "Server error" });
              }
              return res.status(200).json({ courses: result });
            }
          );
        } catch (error) {
          console.error(error);
          return res.status(500).json({ error: "Server error" });
        }
      }
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
});


app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
