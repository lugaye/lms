// scripts.js
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const logoutForm = document.getElementById('logout-form');
    const courseSelectionForm = document.getElementById('course-selection-form');

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
                alert('Login successful');
                // Redirect to dashboard after successful login
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
                // Redirect to index.html after logout
                window.location.href = '/';
            } else {
                alert('Logout failed');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Course Selection Form Submission
    courseSelectionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(courseSelectionForm);
        const selectedCourses = formData.getAll('course'); // Assuming checkboxes with name 'course'

        try {
            const response = await fetch('/select-courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ courses: selectedCourses })
            });
            if (response.ok) {
                alert('Courses selected successfully');
                // Refresh selected courses display
                displaySelectedCourses();
            } else {
                alert('Failed to select courses');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Function to display selected courses for the logged-in user
    function displaySelectedCourses() {
        fetch('/get-selected-courses')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const selectedCoursesList = document.getElementById('selected-courses-list');
                selectedCoursesList.innerHTML = ''; // Clear previous list

                data.forEach(course => {
                    const li = document.createElement('li');
                    li.textContent = course.name;
                    selectedCoursesList.appendChild(li);
                });
            })
            .catch(error => {
                console.error('Error fetching selected courses:', error);
            });
    }

    // Check if the current page is the course content page
    if (window.location.pathname === '/course-content') {
        // Call the fetchCourseContent function
        fetchCourseContent();
    }

    // Check if the current page is the leaderboard page
    if (window.location.pathname === '/leaderboard') {
        // Call the fetchLeaderboardData function
        fetchLeaderboardData();
    }

    // Check if the current page is the dashboard page
    if (window.location.pathname === '/dashboard') {
        // Call the fetchFullName function
        fetchFullName();
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
    courseContent.modules.forEach}
