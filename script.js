document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const logoutForm = document.getElementById('logout-form'); 

    if (window.location.pathname === '/dashboard') {
        fetchFullName();
    }

    function handlePageLoad() {
        if (window.location.pathname === '/dashboard.html') {
            fetchFullName();
        }
    }
    
    document.addEventListener('DOMContentLoaded', handlePageLoad);
    window.addEventListener('load', handlePageLoad);

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(registerForm);
        const username = formData.get('username');
        const password = formData.get('password');
        const email = formData.get('email');
        const full_name = formData.get('full_name');
        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password, email, full_name })
            });
            if (response.ok) {
                alert('Registration successful');
            } else {
                alert('Registration failed');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const username = formData.get('username');
        const password = formData.get('password');
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            if (response.ok) {
                // Redirect to the dashboard page
                window.location.href = '/dashboard';
            } else {
                alert('Invalid username or password');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    logoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/logout', {
                method: 'POST'
            });
            if (response.ok) {
                alert('Logout successful');
            } else {
                alert('Logout failed');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    

    // Check if the current page is the course content page
    if (window.location.pathname === '/course-content.html') {
        fetchCourseContent();
        fetchAvailableCourses();
    }

    // Check if the current page is the leader board page
    if (window.location.pathname === '/leader-board') {
        // Fetch course content from server
        fetchLeaderboardData();
    }

    // Check if the current page is the "My Courses" page
    if (window.location.pathname === '/my-courses.html') {
        fetchUserCourses();
    }
});

function fetchCourseContent() {
    // Get course ID from URL parameter (assuming course ID is passed in the URL)
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');

    // Make AJAX request to fetch course content from server
    fetch(`/course/${courseId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Display course content on the page
            displayCourseContent(data);
        })
        .catch(error => {
            console.error('Error fetching course content:', error);
        });
}

function displayCourseContent(courseContent) {
    // Get the course name element
    const courseNameElement = document.getElementById('course-name');
    // Set the course name
    courseNameElement.textContent = courseContent.name;

    // Get the course content element
    const courseContentElement = document.getElementById('course-content');
    // Clear previous content
    courseContentElement.innerHTML = '';

    // Loop through the modules and display them
    courseContent.modules.forEach(module => {
        const moduleSection = document.createElement('section');
        moduleSection.innerHTML = `
            <h2>${module.title}</h2>
            <p>${module.description}</p>
            <!-- Add more elements as needed (e.g., videos, quizzes) -->
        `;
        courseContentElement.appendChild(moduleSection);
    });
}

function fetchAvailableCourses() {
    fetch('/courses')
        .then(response => response.json())
        .then(data => {
            displayAvailableCourses(data);
        })
        .catch(error => {
            console.error('Error fetching available courses:', error);
        });
}

function displayAvailableCourses(courses) {
    const courseListElement = document.getElementById('course-list');
    courseListElement.innerHTML = '';

    courses.forEach(course => {
        const listItem = document.createElement('li');
        listItem.textContent = course.name;
        const selectButton = document.createElement('button');
        selectButton.textContent = 'Select';
        selectButton.addEventListener('click', () => {
            selectCourse(course.id);
        });
        listItem.appendChild(selectButton);
        courseListElement.appendChild(listItem);
    });
}

function selectCourse(courseId) {
    fetch('/select-course', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ courseId })
    })
    .then(response => {
        if (response.ok) {
            alert('Course selected successfully');
        } else {
            alert('Failed to select course');
        }
    })
    .catch(error => {
        console.error('Error selecting course:', error);
    });
}

function fetchUserCourses() {
    fetch('/my-courses')
        .then(response => response.json())
        .then(data => {
            displayUserCourses(data);
        })
        .catch(error => {
            console.error('Error fetching user courses:', error);
        });
}

function displayUserCourses(courses) {
    const selectedCoursesElement = document.getElementById('selected-courses');
    selectedCoursesElement.innerHTML = '';

    if (courses.length === 0) {
        selectedCoursesElement.innerHTML = '<p>You have not selected any courses yet.</p>';
    } else {
        const courseList = document.createElement('ul');
        courses.forEach(course => {
            const listItem = document.createElement('li');
            listItem.textContent = course.name;
            courseList.appendChild(listItem);
        });
        selectedCoursesElement.appendChild(courseList);
    }
}

function fetchLeaderboardData() {
    // Make AJAX request to fetch leaderboard data from server
    fetch('/leaderboard')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Display leaderboard data on the page
            displayLeaderboardData(data);
        })
        .catch(error => {
            console.error('Error fetching leaderboard data:', error);
        });
}

function displayLeaderboardData(leaderboardData) {
    // Get the leaderboard element
    const leaderboardElement = document.getElementById('leaderboard');
    // Clear previous content
    leaderboardElement.innerHTML = '';

    // Create a table to display leaderboard data
    const table = document.createElement('table');
    table.innerHTML = `
        <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Score</th>
        </tr>
    `;

    // Loop through the leaderboard data and add rows to the table
    leaderboardData.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${entry.name}</td>
            <td>${entry.score}</td>
        `;
        table.appendChild(row);
    });

    // Append the table to the leaderboard element
    leaderboardElement.appendChild(table);
}

function fetchFullName() {
    fetch('/get-fullname')
        .then(response => response.json())
        .then(data => {
            displayFullName(data.fullName);
        })
        .catch(error => {
            console.error('Error fetching user full name:', error);
        });
}

function displayFullName(fullName) {
    const fullNameElement = document.getElementById('user-fullname');
    fullNameElement.textContent = fullName;
}

// Check if the current page is the "My Courses" page
if (window.location.pathname === '/my-courses.html') {
    fetchUserCourses();
}

// Check if the current page is the course content page
if (window.location.pathname === '/course-content.html') {
    fetchCourseContent();
    fetchAvailableCourses();
}