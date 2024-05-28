// Route to select a course
app.post('/select-course', (req, res) => {
    const userId = req.user.id;
    const courseId = req.body.courseId;
    const query = 'INSERT INTO user_courses (user_id, course_id) VALUES (?, ?)';
    db.query(query, [userId, courseId], (err) => {
        if (err) throw err;
        res.redirect('/courses');
    });
});

// Route to display selected courses
app.get('/my-courses', (req, res) => {
    const userId = req.user.id;
    const query = 'SELECT * FROM courses WHERE id IN (SELECT course_id FROM user_courses WHERE user_id = ?)';
    db.query(query, [userId], (err, results) => {
        if (err) throw err;
        res.render('courses', { courses: results });
    });
});