<?php
// Establish database connection
$servername = "localhost";
$username = "username";
$password = "password";
$dbname = "lms_db";

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get selected courses from POST data
$courses = isset($_POST['courses']) ? $_POST['courses'] : [];

// Insert selected courses into database for logged-in user (assuming user ID is stored in session)
$userID = $_SESSION['userID'];
foreach ($courses as $courseID) {
    $sql = "INSERT INTO user_courses (userID, courseID) VALUES ('$userID', '$courseID')";
    if ($conn->query($sql) !== TRUE) {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }
}

$conn->close();
?>
