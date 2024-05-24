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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password, email, full_name })
            });

            const data = await response.json(); // Get JSON response

            if (response.ok) {
                alert('Registration successful');
                window.location.href = '/index.html'; // Redirect to login page
            } else if (data.error && (data.error.includes("Email already exists") || data.error.includes("Username already exists"))) {
                alert('User already exists. Please log in.');
                window.location.href = '/index.html'; // Redirect to homepage
            } else {
                alert('Registration failed. Please try again.'); // Generic error
            }

        } catch (error) {
            console.error('Error:', error);
        }
    });

    // ... (Login and logout event listeners - same as before)

    // ... (Fetch functions for course content, leaderboard, and full name remain the same)
});
