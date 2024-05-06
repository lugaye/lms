-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(255)
);
-- Create courses table
CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)
);

-- Insert sample data into courses table
INSERT INTO courses (name) VALUES
('Introduction to HTML'),
('CSS Fundamentals'),
('JavaScript Basics');



-- Create leaderboard table
CREATE TABLE leaderboard (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    score INT
);

-- Insert sample data into leaderboard table
INSERT INTO leaderboard (name, score) VALUES
('John Doe', 100),
('Jane Smith', 90),
('Michael Brown', 85),
('Emily Jones', 80);
