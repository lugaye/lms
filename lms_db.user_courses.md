CREATE TABLE user_courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userID INT,
    courseID INT,
    FOREIGN KEY (userID) REFERENCES users(id),
    FOREIGN KEY (courseID) REFERENCES courses(id)
);
