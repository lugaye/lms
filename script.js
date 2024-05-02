document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const logoutForm = document.getElementById('logout-form');
    const selectCourseForm = document.getElementById('select-course-form');

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

    selectCourseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(selectCourseForm);
        const courseId = formData.get('courseId');
        try {
            const response = await fetch('/select-course', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ courseId })
            });
            if (response.ok) {
                alert('Course selected successfully');
            } else {
                alert('Failed to select course');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Check if the current page is the course content page
    if (window.location.pathname === '/course-content') {
        // Call the fetchCourseContent function
        fetchCourseContent();
    }

    // Check if the current page is the leaderboard page
    if (window.location.pathname === '/leader-board') {
        // Fetch leaderboard data from server
        fetchLeaderboardData();
    }

    // Check if the current page is the dashboard
    if (window.location.pathname === '/dashboard') {
        // Fetch logged-in user's full name and selected courses
        fetchUserData();
    }
});

// Fetch user data (full name and selected courses) and display on the dashboard
async function fetchUserData() {
    try {
        const fullNameResponse = await fetch('/get-fullname');
        const coursesResponse = await fetch('/user-courses');
        if (fullNameResponse.ok && coursesResponse.ok) {
            const fullNameData = await fullNameResponse.json();
            const coursesData = await coursesResponse.json();
            displayUserData(fullNameData.fullName, coursesData);
        } else {
            console.error('Failed to fetch user data');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Display user data on the dashboard
function displayUserData(fullName, courses) {
    const fullNameElement = document.getElementById('user-fullname');
    fullNameElement.textContent = fullName;

    const coursesListElement = document.getElementById('user-courses-list');
    coursesListElement.innerHTML = '';
    courses.forEach(course => {
        const listItem = document.createElement('li');
        listItem.textContent = course.name;
        coursesListElement.appendChild(listItem);
    });
}
