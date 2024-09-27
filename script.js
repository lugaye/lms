document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const logoutForm = document.getElementById('logout-form');

    registerForm.addEventListener('submit', async(e) => {
        e.preventDefault();
        const formData = new FormData(registerForm);
        const username = formData.get('username');
        const password = formData.get('password');
        const email = formData.get('email');
        const full_name = formData.get('full_name');
        console.log('Form Data:', { username, password, email, full_name }); // Debugging

        try {
            const response = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password, email, full_name })
            });
            console.log('Response:', response); // Debugging

            if (response.ok) {
                alert('Registration successful');
            } else {
                alert('Registration failed');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    loginForm.addEventListener('submit', async(e) => {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const username = formData.get('username');
        const password = formData.get('password');
        console.log('Login Form Data:', { username, password }); // Debugging

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            console.log('Login Response:', response); // Debugging
            const data = await response.json(); // Parse response JSON

            if (response.ok) {
                alert('Login successful');
                // Redirect to the dashboard page
                window.location.href = './dashboard'; // Update URL as needed
            } else {
                alert('Invalid username or password');
                console.error('Login Error Response:', data); // Log error response data
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    logoutForm.addEventListener('submit', async(e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:3000/logout', {
                method: 'POST'
            });
            console.log('Logout Response:', response); // Debugging

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

    // Check if the current page is the leaderboard page
    if (window.location.pathname === '/leader-board') {
        // Fetch leaderboard data from server
        fetchLeaderboardData();
    }

    // Check if the current page is the dashboard page
    if (window.location.pathname === '/dashboard') {
        // Fetch logged-in user's full name
        fetchFullName();
    }
});

// Include fetchCourseContent, fetchLeaderboardData, fetchFullName, and related functions here as needed