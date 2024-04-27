document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const selectCoursesForm = document.getElementById('select-courses-form');
    const logoutForm = document.getElementById('logout-form'); // Define logoutForm variable
    const registerPasswordInput = document.getElementById('register-password');
    const showRegisterPasswordCheckbox = document.getElementById('show-register-password');
    const loginPasswordInput = document.getElementById('login-password');
    const showLoginPasswordCheckbox = document.getElementById('show-login-password');

    // Register form
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

    //Login form
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
                window.location.href = '/dashboard'; // Redirect to the dashboard
            } else {
                alert('Invalid username or password');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // course selection
    selectCoursesForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(selectCoursesForm);
        const userId = formData.get('userId');
        const selectedCourses = formData.getAll('courseId');

        try {
            const response = await fetch('/select-courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId, selectedCourses })
            });
            if (response.ok) {
                alert('Courses selected successfully');
                fetchSelectedCourses(userId); // Fetch and display selected courses after selection
            } else {
                alert('Failed to select courses');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    //  fetch and display selected courses
    function fetchSelectedCourses(userId) {
        fetch(`/selected_courses?userId=${userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                displaySelectedCourses(data);
            })
            .catch(error => {
                console.error('Error fetching selected courses:', error);
            });
    }

    function displaySelectedCourses(courses) {
        const selectedCoursesList = document.getElementById('selected-courses-list');
        selectedCoursesList.innerHTML = '';
        courses.forEach(course => {
            const listItem = document.createElement('li');
            listItem.textContent = course.name;
            selectedCoursesList.appendChild(listItem);
        });
    }

    // Logout form
    logoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/logout', {
                method: 'POST'
            });
            if (response.ok) {
                alert('Logout successful');
                window.location.href = '/'; // Redirect to the home page after logout
            } else {
                alert('Logout failed');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    // Show/hide password for register form
    if (registerPasswordInput && showRegisterPasswordCheckbox) {
        showRegisterPasswordCheckbox.addEventListener('change', () => {
            if (showRegisterPasswordCheckbox.checked) {
                registerPasswordInput.type = 'text';
            } else {
                registerPasswordInput.type = 'password';
            }
        });
    }

    // Show/hide password for login form
    if (loginPasswordInput && showLoginPasswordCheckbox) {
        showLoginPasswordCheckbox.addEventListener('change', () => {
            if (showLoginPasswordCheckbox.checked) {
                loginPasswordInput.type = 'text';
            } else {
                loginPasswordInput.type = 'password';
            }
        });
    }

    // Check if the current page is the course content page
    if (window.location.pathname === '/course-content') {
        // Call the fetchCourseContent function
        fetchCourseContent();
    }

    // Check if the current page is the leaderboard page
    if (window.location.pathname === '/leaderboard') {
        // Fetch leaderboard data from server
        fetchLeaderboardData();
    }

    // Check if the current page is the dashboard page
    if (window.location.pathname === '/dashboard') {
        // Fetch user's full name
        fetchFullName();
    }

    // Check if the current page is the selected courses page
    if (window.location.pathname === '/selected-courses') {
        // Fetch and display selected courses
        const userId = document.getElementById('user-id').value;
        fetchSelectedCourses(userId);
    }
});

function fetchFullName() {
    console.log("Fetching full name...");
    // Make AJAX request to fetch the user's full name from the server
    fetch('/get-fullname')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Display the user's full name and current date and time on the dashboard
            const fullName = data.fullName;
            const currentDate = new Date().toLocaleDateString();
            const currentTime = new Date().toLocaleTimeString();
            displayFullName(fullName, currentDate, currentTime);
        })
        .catch(error => {
            console.error('Error fetching user full name:', error);
        });
}

function displayFullName(fullName, currentDate, currentTime) {
    console.log("Full Name:", fullName);
    console.log("Current Date:", currentDate);
    console.log("Current Time:", currentTime);

    // Get the element where the full name and date and time will be displayed
    const fullNameElement = document.getElementById('user-fullname');
    const dateTimeElement = document.getElementById('date-time');
    
    // Set the inner HTML of the element to the user's full name, current date, and current time
    fullNameElement.textContent = fullName;
    dateTimeElement.textContent = `Date: ${currentDate} | Time: ${currentTime}`;
}

// Fetch leaderboard data
function fetchLeaderboardData() {
    fetch('/leader-board')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayLeaderboardData(data);
        })
        .catch(error => {
            console.error('Error fetching leaderboard data:', error);
        });
}

function displayLeaderboardData(data) {
    const leaderboardTable = document.querySelector('#leader-board table tbody');
    leaderboardTable.innerHTML = ''; // Clear the table body before populating new data

    // Loop through the data and create table rows
    data.forEach(entry => {
        const row = `
            <tr>
                <td>${entry.rank}</td>
                <td>${entry.username}</td>
                <td>${entry.score}</td>
            </tr>
        `;
        leaderboardTable.innerHTML += row; // Append each row to the table body
    });
}
