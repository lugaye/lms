document.addEventListener('DOMContentLoaded', async () => {
    // Fetch logged in user's full name
    await fetchFullName();
    
    // Fetch and display leaderboard data
    fetchLeaderboard();
    
    // Fetch and display course data
    fetchCourseData();
    
    // Fetch and display selected courses for the logged-in user
    fetchSelectedCourses();
    
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const logoutForm = document.getElementById('logout-form');

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
                //redirect to dashboard upon successful login
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
});

async function fetchFullName() {
    try {
        const response = await fetch('/get-fullname');
        if (response.ok) {
            const data = await response.json();
            displayFullName(data.fullName);
            // Display logout button if user is logged in
            displayLogoutButton();
        } else {
            console.error('Error fetching user full name');
        }
    } catch (error) {
        console.error('Error fetching user full name:', error);
    }
}

function displayFullName(fullName) {
    const fullNameElement = document.getElementById('user-fullname');
    fullNameElement.textContent = fullName;
}

function displayLogoutButton() {
    const userFullName = document.getElementById('user-fullname').textContent.trim();
    if (userFullName !== '') {
        const logoutLi = document.getElementById('logout-li');
        logoutLi.style.display = 'block';
    }
}

function fetchLeaderboard() {
    fetch('/leaderboard')
        .then(response => response.json())
        .then(data => {
            const leaderboardElement = document.getElementById('leaderboard');
            leaderboardElement.innerHTML = ''; // Clear existing content

            const table = document.createElement('table');
            table.innerHTML = `
                <tr>
                    <th>Rank</th>
                    <th>Name</th>
                    <th>Score</th>
                </tr>
            `;

            data.forEach((entry, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${entry.name}</td>
                    <td>${entry.score}</td>
                `;
                table.appendChild(row);
            });

            leaderboardElement.appendChild(table);
        })
        .catch(error => {
            console.error('Error fetching leaderboard data:', error);
        });
}

function fetchCourseData() {
    fetch('/courses')
        .then(response => response.json())
        .then(data => {
            const courseListElement = document.getElementById('course-list');
            courseListElement.innerHTML = '';

            data.forEach(course => {
                const courseCard = document.createElement('div');
                courseCard.classList.add('course-card');
                courseCard.innerHTML = `
                    <h2>${course.name}</h2>
                    <p>Duration: ${course.duration}</p>
                    <p>Price: $${course.price}</p>
                    <button class="select-course-btn" data-course-id="${course.name}">Select Course</button>
                `;
                courseListElement.appendChild(courseCard);
            });

            document.querySelectorAll('.select-course-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const courseId = btn.getAttribute('data-course-id');
                    const userId = getUserId(); // Retrieve user ID
                    selectCourse(userId, courseId);
                });
            });
        })
        .catch(error => {
            console.error('Error fetching course data:', error);
        });
}


function getUserId() {
    const userId = sessionStorage.getItem('userId');
    return userId;
}


async function fetchSelectedCourses() {
    try {
        const userId = getUserId();
        const response = await fetch(`/selected-courses/${userId}`);
        if (response.ok) {
            const data = await response.json();
            displaySelectedCourses(data); // Call the displaySelectedCourses function here
        } else {
            console.error('Failed to fetch selected courses:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching selected courses:', error);
    }
}

function displaySelectedCourses(courses) {
    const selectedCoursesList = document.getElementById('selected-courses-list');
    selectedCoursesList.innerHTML = '';

    courses.forEach(course => {
        const courseItem = document.createElement('div');
        courseItem.textContent = course.name;
        selectedCoursesList.appendChild(courseItem);
    });
}

function selectCourse(userId, courseId) {
    fetch(`/select-course/${userId}/${courseId}`, {
        method: 'POST'
    })
    .then(response => {
        if (response.ok) {
            alert('Course selected successfully');
            fetchSelectedCourses(); // Refresh selected courses after selection
        } else {
            alert('Failed to select course');
        }
    })
    .catch(error => {
        console.error('Error selecting course:', error);
    });
}


function getFullName(userId) {
    return new Promise((resolve, reject) => {
        db.get('SELECT full_name FROM users WHERE id = ?', [userId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row.full_name);
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    // Fetch and display selected courses for the logged-in user
    fetchSelectedCourses();
});

async function fetchSelectedCourses() {
    try {
        // Fetch the selected courses data from the server
        const response = await fetch('/selected-courses');
        if (response.ok) {
            // If the response is successful, parse the JSON data
            const data = await response.json();
            // Display the selected courses on the page
            displaySelectedCourses(data);
        } else {
            console.error('Failed to fetch selected courses:', response.statusText);
        }
    } catch (error) {
        console.error('Error fetching selected courses:', error);
    }
}

function displaySelectedCourses(courses) {
    const selectedCoursesList = document.getElementById('selected-courses-list');
    // Clear any existing content
    selectedCoursesList.innerHTML = '';

    // Loop through the fetched courses data and create HTML elements to display each course
    courses.forEach(course => {
        const courseItem = document.createElement('div');
        courseItem.textContent = course.name; // Assuming 'name' is a property of the course object
        selectedCoursesList.appendChild(courseItem);
    });
}
