
document.addEventListener('DOMContentLoaded',()=>{
    const registerForm=document.getElementById('register-form');
    registerForm.addEventListener('submit',async (e)=>{
        e.preventDefault();

        const formData=new FormData(registerForm);
        const username=formData.get('username');
        const password=formData.get('password');
        const email=formData.get('email');
        const full_name=formData.get('full_name');

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
                const errorData = await response.json();
                alert('Registration failed'+ errorData.errors.map(err => err.msg).join(', '));
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
    const loginForm = document.getElementById('login-form');
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
                alert('Login Successful');
                //window.location.href='/dashboard';
            } else {
                const errorText = await response.text();
                alert('Invalid Username or Password: ' + errorText);
            }
        }catch (error) {
            console.error('Error:', error);
        }
    });
    const logoutForm=document.getElementById('logout-form');
    logoutForm.addEventListener('submit',async(e)=>{
        e.preventDefault();
        try{
            const response=await  fetch('/logout',{
                method:'POST'
            });
            if(response.ok){
                alert('Logout Successful');
            }else{
                alert('Logout was not successful')
            }
        }catch(error){
            console.log('Error:',error);
        }
        
    });
    if(window.location.pathname==="/course-content"){
        fetchCourseContent();
    }
    if(window.location.pathname==="/leader-board"){
        fetchLeaderBoardData();
    }
    if(window.location.pathname==="/dashboard"){
        fetchFullName();
    }
});
function fetchCourseContent(){
    const urlParams=new URLSearchParams(window.location.search);
    const courseId=urlParams.get('id');

    fetch(`/course/${courseId}`)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        
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
            <button onclick="selectCourse(${courseContent.id})">Select Course</button>
            <!-- Add more elements as needed (e.g., videos, quizzes) -->
        `;
        courseContentElement.appendChild(moduleSection);
    });
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
        })
        .catch(error => {
            console.error('Error fetching user full name:', error);
        });
}

function displayFullName(fullName) {
    // Get the element where the full name will be displayed
    const fullNameElement = document.getElementById('user-fullname');
    // Set the inner HTML of the element to the user's full name
    fullNameElement.textContent = fullName;
}
async function selectCourse(courseId) {
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
            const errorData = await response.json();
            alert('Failed to select course: ' + errorData.error);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

async function fetchSelectedCourses() {
    try {
        const response = await fetch('/selected-courses');
        if (response.ok) {
            const courses = await response.json();
            displaySelectedCourses(courses);
        } else {
            alert('Failed to fetch selected courses');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

function displaySelectedCourses(courses) {
    const selectedCoursesElement = document.getElementById('selected-courses');
    selectedCoursesElement.innerHTML = '';

    courses.forEach(course => {
        const courseItem = document.createElement('div');
        courseItem.innerHTML = `
            <h3>${course.name}</h3>
        `;
        selectedCoursesElement.appendChild(courseItem);
    });
}
