document.addEventListener('DOMContentLoaded', function() {
    const courseForm = document.getElementById('course-form');
    const courseList = document.getElementById('course-list');

    courseForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        const courseInput = document.getElementById('course-name');
        const courseName = courseInput.value;

        if (courseName.trim() === '') {
            alert('Please select preferred courses');
            return;
        }

        addCourse(courseName);
        courseInput.value = '';
    });

    function addCourse(courseName) {
        const li = document.createElement('li');
        li.textContent = courseName;
        
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete';
        deleteButton.addEventListener('click', function() {
            li.remove();
        });

        li.appendChild(deleteButton);
        courseList.appendChild(li);
    }
});

document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault(); 
    alert("Login Successful!");
    window.location.href = "course-content.html"; 
});

document.getElementById("registerForm").addEventListener("submit", function(event) {
    event.preventDefault(); 
    alert("Registration Successful!");
    
});

document.addEventListener("DOMContentLoaded", function() {
   
    const selectedCourses = [
        { id: 1, name: "Introduction to HTML" },
        { id: 2, name: "CSS Fundamentals" },
        { id: 3, name: "javascript fundamentals" }
    ];

    // Display the selected courses
    const courseList = document.getElementById("courseList");
    selectedCourses.forEach(course => {
        const listItem = document.createElement("li");
        listItem.textContent = course.name;
        courseList.appendChild(listItem);
    });
})

document.addEventListener("DOMContentLoaded", function() {
    
    const leaderboardData = [
        { rank: 1, username: "John Doe", score: 100 },
        { rank: 2, username: "Jane Smith", score: 90 },
        { rank: 3, username: "Michael Brown", score: 85 },
        { rank: 4, username: "Emily Jones", score: 80 },
        
    ];

    // Display the leaderboard data
    const leaderboardBody = document.getElementById("leaderboardBody");
    leaderboardData.forEach(entry => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${entry.rank}</td>
            <td>${entry.username}</td>
            <td>${entry.score}</td>
        `;
        leaderboardBody.appendChild(row);
    });
});
