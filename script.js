// scripts.js
document.addEventListener('DOMContentLoaded', () => {
    try {
        const registerForm = document.getElementById('register-form');
        const loginForm = document.getElementById('login-form');
        const logoutForm = document.getElementById('logout-form');

        const toLogin = document.getElementById('toLogin');
        const toRegister = document.getElementById('toRegister');
        const loginContainer = document.getElementById('login-form-container')
        const registerContainer = document.getElementById('register-form-container');

        toLogin.addEventListener('click',(e) => {
            e.preventDefault();
            registerContainer.style.display = 'none';
            loginContainer.style.display = 'inline-block';
        })

        toRegister.addEventListener('click', (e) => {
            e.preventDefault();
            loginContainer.style.display = 'none';
            registerContainer.style.display = 'inline-block';
        })

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
                    // alert('Login successful');
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



    }catch (e) {
        console.log("The content is not yet loaded to the DOM");
    }

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
        fetchCourses();
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
    const title = document.getElementById('course-title');
    const description = document.getElementById('course-description');
    const overview_title = document.getElementById('overview-title');
    const overview = document.getElementById('overview');
    const cta_holder = document.getElementById('cta-holder');


    courseContent.forEach(module => {
        title.innerHTML = module.overview;
        description.innerHTML = module.description;
        overview_title.innerHTML = module.name;
        overview.innerHTML = module.content;

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/enroll';

        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'moduleId';
        input.value = module.id;

        const button = document.createElement('button');
        button.className = 'btn';
        button.textContent = 'Enroll Course';
        form.appendChild(input);
        form.appendChild(button);

        form.addEventListener('submit', function(event) {
            event.preventDefault();

            enrollCourse(module.id);
        });

        cta_holder.appendChild(form);

    })
}

function enrollCourse(id) {
    const data = {
        id: id
    };
    // Make the POST request
    fetch('/enroll', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            console.log('Enrolled in course successfully:', data);
            alert('Course added to the database');
        })
        .catch(error => {
            console.error('Error enrolling in course:', error);
        });
}

function fetchCourses() {
    fetch('/courses')
        .then(response => {
            if(!response.ok) {
                throw new Error('Unable to fetch courses');
            }
            return response.json();
        })
        .then(data => {
            displayCourses(data);
        })
        .catch(error => {
            console.log('Error fetching course content: ', error);
        })
}

function displayCourses(courses) {
    const courseList = document.getElementById('course-list');

    courses.forEach(course => {
        const courseCard = document.createElement('div');
        courseCard.classList.add('course-card');
        const courseLink = document.createElement('a');
        courseLink.href = `/course-content?id=${course.id}`;

        const courseImage = document.createElement('img');
        courseImage.src = './image.jpeg';
        courseImage.alt = 'Course Image';

        const courseTitle = document.createElement('span');
        courseTitle.classList.add('title');
        courseTitle.textContent = course.name;

        courseLink.appendChild(courseImage);
        courseLink.appendChild(courseTitle);
        courseCard.appendChild(courseLink);

        courseList.appendChild(courseCard);

    })

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
    // Make AJAX request to fetch the user's full name from the server
    fetch('/get-fullname')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            // Display the user's full name on the dashboard
            displayFullName(data.fullName);
            console.log(data.fullName);
        })
        .catch(error => {
            console.error('Error fetching user full name:', error);
        });
}

function displayFullName(fullName) {
    // Get the element where the full name will be displayed
    const fullNameElement = document.getElementById('user-fullname');
    const userDetails = document.querySelector('.user-details p');
    // Set the inner HTML of the element to the user's full name
    fullNameElement.textContent = fullName;
    userDetails.textContent = fullName;
}