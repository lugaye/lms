CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(255)
);

CREATE TABLE courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255)
);

INSERT INTO
    courses (name)
VALUES ('Introduction to HTML'),
    ('CSS Fundamentals'),
    ('JavaScript Basics');

CREATE TABLE leaderboard (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    score INT
);

INSERT INTO
    leaderboard (name, score)
VALUES ('John Doe', 100),
    ('Jane Smith', 90),
    ('Michael Brown', 85),
    ('Emily Jones', 80);