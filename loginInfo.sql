CREATE SCHEMA userAuth;
USE userAuth;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,  
    fullName VARCHAR(255),
    username VARCHAR(255) ,  
    email VARCHAR(255) ,  
    password_hash VARCHAR(255) 
);

INSERT INTO  users (id, fullName, username, email, password_hash)
VALUES (1, 'ashrafu hussein', 'ashtek', 'ashtek@gmail.com', 'ash12');

CREATE TABLE Courses (
courseID INT PRIMARY KEY,
courseName VARCHAR(255),
credit VARCHAR(255)
);

INSERT INTO Courses (courseID,courseName,credit)
VALUES (1, 'computer fundamentals', 12),
(2, 'networking', 15);
