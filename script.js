// Navbar functionality
// const openMenuBtn = document.querySelector("#openMenuBtn");
// const closeMenuBtn = document.querySelector("#closeMenuBtn");
// const responsiveNav = document.querySelector(".res-nav-links");

// openMenuBtn.addEventListener('click', () => {
//     alert('kdjfksjd')
//    responsiveNav.style.display = "block";
// })
// closeMenuBtn.addEventListener('click', () => {
//     responsiveNav.style.display = "none";
//  })


// scripts.js
document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const logoutForm = document.getElementById('logout-form');

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(registerForm);
        const password = formData.get('password');
        const email = formData.get('email');
        const first_name = formData.get('first_name');
        const last_name = formData.get('last_name');
        const phone_number = formData.get('phone_number');
        try {
            const response = await fetch('/register', {
                method: 'POST ',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password, email, first_name, last_name, phone_number })
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
        const password = formData.get('password');
        const email = formData.get('email');
        try {
            const response = await fetch('/login', {
                method: 'POSt',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            if (response.ok) {
                alert('Login successful');
            } else {
                alert('Invalid email or password');
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
    if (window.location.pathname === '/courses') {
        // Call the fetchCourseContent function
        fetchCourseContent();
    }

     // Check if the current page is the course content page
    if (window.location.pathname === '/leaderboard') {
        // Fetch course content from server
        fetchLeaderboardData();
    }

    // Check if the current page is the course content page
    if (window.location.pathname === '/dashboard') {
        //fetch Logged in user's full name
        fetchFullName();
    }
});




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
            const fullName = data.first_name + data.lastName;
            displayFullName(fullName);
        })
        .catch(error => {
            console.error("Error fetching user's name: ", error);
        });
}

function displayFullName(fullName) {
    // Get the element where the full name will be displayed
    const fullNameElement = document.getElementById('user-fullname');
    // Set the inner HTML of the element to the user's full name
    fullNameElement.textContent = fullName;
} 