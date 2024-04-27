// scripts.js
document.addEventListener('DOMContentLoaded', () => {
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
                window.location.pathname = '/dashboard';
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
    if (window.location.pathname === '/course-content') {
        // Call the fetchCourseContent function
        fetchCourseContent();
    }

     // Check if the current page is the course content page
    if (window.location.pathname === '/leader-board') {
        // Fetch course content from server
        fetchLeaderboardData();
    }

    // Check if the current page is the course content page
    if (window.location.pathname === '/dashboard') {
        //fetch Logged in user's full name
        fetchFullName();
    }
});

// function fetchCourseContent() {
//     // Get course ID from URL parameter (assuming course ID is passed in the URL)
//     const urlParams = new URLSearchParams(window.location.search);
//     const courseId = urlParams.get('id');

//     // Make AJAX request to fetch course content from server
//     fetch(`/course/${courseId}`)
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             return response.json();
//         })
//         .then(data => {
//             // Display course content on the page
//             displayCourseContent(data);
//         })
//         .catch(error => {
//             console.error('Error fetching course content:', error);
//         });
// }

function fetchCourseContent() {
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id'); // Get the ID from the query string

    const endpoint = courseId ? `/course-content/${courseId}` : '/course-content'; // Check if there's an ID

    fetch(endpoint) // Make the correct request based on the ID
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            displayCourseContent(data); // Process the data
        })
        .catch(error => {
            console.error('Error fetching course content:', error);
        });
}

// Fetch selected courses and add delete button
function fetchSelectedCourses() {
    fetch('/user-courses') // Fetch the selected courses from the server
        .then(response => response.json())
        .then(data => {
            const selectedCoursesElement = document.getElementById('selected-courses');
            selectedCoursesElement.innerHTML = ''; // Clear any existing content

            // Add a flex layout for each course and its delete button
            data.forEach(course => {
                const courseItem = document.createElement('div');
                courseItem.className = 'course-item'; // Class for styling with Flexbox

                courseItem.innerHTML = `
                    <span>${course.name}</span> <!-- Course name -->
                    <button class="delete-course" data-course-id="${course.id}">Delete</button> <!-- Delete button -->
                `;

                selectedCoursesElement.appendChild(courseItem);
            });

            // Add event listeners to delete buttons
            const deleteButtons = document.querySelectorAll('.delete-course');
            deleteButtons.forEach(button => {
                button.addEventListener('click', deleteCourse); // Event handler for deleting course
            });
        })
        .catch(error => console.error('Error fetching selected courses:', error));
}

function deleteCourse(event) {
    const courseId = event.target.getAttribute('data-course-id'); // Get the course ID

    fetch(`/delete-course/${courseId}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            event.target.parentElement.remove(); // Remove the course item from the DOM
            console.log('Course deleted successfully.');
        } else {
            console.error('Failed to delete course.');
        }
    })
    .catch(error => console.error('Error deleting course:', error));
}


function deleteCourse(event) {
    const courseId = event.target.getAttribute('data-course-id'); // Get the course ID from the data attribute

    fetch(`/delete-course/${courseId}`, { // Send DELETE request
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            // Remove the course from the DOM
            event.target.parentElement.remove();
            alert('Course deleted successfully.');
        } else {
            console.error('Failed to delete course.');
        }
    })
    .catch(error => console.error('Error deleting course:', error));
}

// Ensure the function is called when the DOM is ready
document.addEventListener('DOMContentLoaded', fetchSelectedCourses); // Call on DOM load


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

function fetchLeaderboardData() {
    fetch('/leaderboard') // Fetch data from the server
        .then(response => {
            if (!response.ok) {
                console.error('Failed to fetch leaderboard data:', response.status); // Log the status
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched leaderboard data:', data); // Ensure the data is correct
            displayLeaderboardData(data); // Display the data on the page
        })
        .catch(error => {
            console.error('Error fetching leaderboard data:', error); // Log any errors
        });
}

function displayLeaderboardData(leaderboardData) {
    console.log('Displaying leaderboard data:', leaderboardData); // Ensure the data is correct

    const leaderboardElement = document.getElementById('leaderboard');
    leaderboardElement.innerHTML = ''; // Clear previous content

    const table = document.createElement('table');
    table.innerHTML = `
        <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Score</th>
        </tr>
    `;

    leaderboardData.forEach((entry, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${entry.name}</td>
            <td>${entry.score}</td>
        `;
        table.appendChild(row);
    });

    leaderboardElement.appendChild(table); // Append the table to the leaderboard element
}


function displayFullName(fullName) {
    const fullNameElement = document.getElementById('user-fullname');
    fullNameElement.textContent = fullName; // Update the content with the full name
}



document.getElementById('course-selection-form').addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent default form behavior

    const courseIds = [...document.querySelectorAll('input[type="checkbox"]:checked')].map(checkbox => checkbox.value);

    fetch('/select-courses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ courseIds })
    })
    .then(response => {
        if (response.ok) {
            // Clear the form
            document.getElementById('course-selection-form').reset();

            // Create a success message
            const successMessage = document.createElement('div');
            successMessage.textContent = 'Courses selected successfully!';
            successMessage.className = 'success-message'; // Optional: Add a CSS class for styling

            // Get the submit button
            const submitButton = document.querySelector('#course-selection-form button[type="submit"]');

            // Insert the success message after the submit button
            submitButton.insertAdjacentElement('afterend', successMessage);

            // Remove the success message after a delay (optional)
            setTimeout(() => {
                successMessage.remove();
            }, 3000); // 3 seconds delay
        } else {
            console.error('Error storing course selections.');
        }
    })
    .catch(error => console.error('Error sending course selections:', error));
});



document.getElementById('logout-form').addEventListener('submit', (e) => {
    e.preventDefault(); // Prevent the form's default action

    fetch('/logout', { // Send POST request to logout endpoint
        method: 'POST'
    })
    .then(response => {
        if (response.ok) {
            // Redirect to the login or home page after successful logout
            window.location.href = '/'; // Redirect to home or login
        } else {
            console.error('Logout failed.');
        }
    })
    .catch(error => {
        console.error('Error during logout:', error);
    });
});



