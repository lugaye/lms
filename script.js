// const { header } = require("express-validator");

// EXECUTE JAVASCRIPT AFTER THE DOCUMENT  IS FULLY LOADED
document.addEventListener('DOMContentLoaded', () => {

    // // Landing Page
    // // The welcome container and its content
    // // const welcomeContainer = document.querySelector('.welcomeContainer');
    // const typewritten = document.getElementById('typewritten');
    // // const welcomeCont = document.getElementById('welcomeCont');

    // // Store the text to be typewritten
    // const text = typewritten.textContent;

    // // Clear the content in the first place because it is going to be typewriten
    // typewritten.textContent = '';

    // // Set the initial index
    // let index = 0;
    // let interval;

    // // Delay the start of the typewritting for 3 seconds
    // setTimeout(() => {
    //     // Create an interval that adds one character at a time
    //     interval = setInterval(() => {
    //         typewritten.textContent += text[index]; // Add one character from the text("life changing quotes")
    //         // Move to the next character(index)
    //         index++;

    //         // Clear the interval from continuing to add characters to the typewrittenParagraph
    //         if (index >= text.length) {
    //             clearInterval(interval);
    //         }
    //     }, 200); // Type each character after each 0.2 second
    // }, 3000); // Wait for 3 seconds before starting the typewritten code


    
    // WORK ON THE FORMS
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    // const logoutForm = document.getElementById('logout-form');

// Form to register a new user
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
            } 
            else {
                alert('Registration failed');
            }
        } catch (error) {
            console.error('An Error occured:', error);
        }
    });

        // Login form for a regestered user
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
                    // Redirect the user to the page when login is succesful
                    window.location.href = '/my_courses.html';
                } else {
                    alert('Invalid username or password');
                }
            } catch (error) {
                console.error('An Error Occured:', error);
            }
        });
    });


    // FETCHING THE USER'S ENROLLED COURSES
    async function fetchEnrolledCourses() {
        try {
            const response = await fetch('/my_courses');
            const courses = await response.json();
            const container = document.getElementById('courses_container');

            courses.forEach(course => {
                const card = document.createElement('div');
                card.className = 'course-card';
                card.innerHTML = `
                    <img src="${course.icon}" alt="${course.name}" class="course-icon">
                    <h3>${course.name}</h3>
                `;
                container.appendChild(card);
            });
        } catch (error) {
            console.error('Error fetching courses', error);
        }
    }
    // Call the fetchEnrolledCourses function 
    fetchEnrolledCourses();


    // FETCH THE LIST OF ALL COURSES
    async function fetchCourses() {
        try {
            const response = await fetch('/courses');
            const courses = await response.json();
            const container = document.getElementById('courses_offered');

            courses.forEach(course => {
                const courseItem = document.createElement('li');
                courseItem.innerHTML = `
                    <img src="${course.icon}" alt="${course.name}" class="course-icon">
                    <span><b>${course.name}</b></span>
                    <button onclick="enroll(${course.course_id})">Enroll</button>
                `;
                container.appendChild(courseItem);
            });
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    }
    // Call fetchCourses
    fetchCourses();


    // FUNCTION TO HANDLE COURSE ENROLLMENT
    async function enroll(courseId)  {
        try {
            const response = await fetch(`/enroll/${courseId}`);
            
            if (response.status === 401) { // Check for unauthorized status
                window.location.href = '/login.html';
                return;
            }

            const message = await response.text();

            alert(message); // Show enrollmet status
            if(message === 'Enrollment successful.') {
                window.location.href = '/my_courses.html'; // Redirect to my_courses page
            }
        } catch (error) {
            console.error('Error enrolling course:', error);
        }
    }
    window.enroll = enroll;


// // The container where the registered courses(MY COURSES) will be displayed
// const my_courses_container = document.getElementById('my_courses_container');



//     // Logout form for a loged in user
//     logoutForm.addEventListener('submit', async (e) => {
//         e.preventDefault();
//         try {
//             const response = await fetch('/logout', {
//                 method: 'POST'
//             });
//             if (response.ok) {
//                 alert('Logout successful');
//             } else {
//                 alert('Logout failed');
//             }
//         } catch (error) {
//             console.error('Error:', error);
//         }
//     });

//     // Check if the current page is the course content page
//     if (window.location.pathname === '/course-content') {
//         // Call the fetchCourseContent function
//         fetchCourseContent();
//     }

//      // Check if the current page is the course content page
//     if (window.location.pathname === '/leader-board') {
//         // Fetch course content from server
//         fetchLeaderboardData();
//     }

//     // Check if the current page is the course content page
//     if (window.location.pathname === '/dashboard') {
//         //fetch Logged in user's full name
//         fetchFullName();
//     }
// });

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

// function displayCourseContent(courseContent) {
//     // Get the course name element
//     const courseNameElement = document.getElementById('course-name');
//     // Set the course name
//     courseNameElement.textContent = courseContent.name;

//     // Get the course content element
//     const courseContentElement = document.getElementById('course-content');
//     // Clear previous content
//     courseContentElement.innerHTML = '';

//     // Loop through the modules and display them
//     courseContent.modules.forEach(module => {
//         const moduleSection = document.createElement('section');
//         moduleSection.innerHTML = `
//             <h2>${module.title}</h2>
//             <p>${module.description}</p>
//             <!-- Add more elements as needed (e.g., videos, quizzes) -->
//         `;
//         courseContentElement.appendChild(moduleSection);
//     });
// }

// function fetchLeaderboardData() {
//     // Make AJAX request to fetch leaderboard data from server
//     fetch('/leaderboard')
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             return response.json();
//         })
//         .then(data => {
//             // Display leaderboard data on the page
//             displayLeaderboardData(data);
//         })
//         .catch(error => {
//             console.error('Error fetching leaderboard data:', error);
//         });
// }

// function displayLeaderboardData(leaderboardData) {
//     // Get the leaderboard element
//     const leaderboardElement = document.getElementById('leaderboard');
//     // Clear previous content
//     leaderboardElement.innerHTML = '';

//     // Create a table to display leaderboard data
//     const table = document.createElement('table');
//     table.innerHTML = `
//         <tr>
//             <th>Rank</th>
//             <th>Name</th>
//             <th>Score</th>
//         </tr>
//     `;

//     // Loop through the leaderboard data and add rows to the table
//     leaderboardData.forEach((entry, index) => {
//         const row = document.createElement('tr');
//         row.innerHTML = `
//             <td>${index + 1}</td>
//             <td>${entry.name}</td>
//             <td>${entry.score}</td>
//         `;
//         table.appendChild(row);
//     });

//     // Append the table to the leaderboard element
//     leaderboardElement.appendChild(table);
// }

// function fetchFullName() {
//     // Make AJAX request to fetch the user's full name from the server
//     fetch('/get-fullname')
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//             return response.json();
//         })
//         .then(data => {
//             // Display the user's full name on the dashboard
//             displayFullName(data.fullName);
//         })
//         .catch(error => {
//             console.error('Error fetching user full name:', error);
//         });
// }

// function displayFullName(fullName) {
//     // Get the element where the full name will be displayed
//     const fullNameElement = document.getElementById('user-fullname');
//     // Set the inner HTML of the element to the user's full name
//     fullNameElement.textContent = fullName;
// }