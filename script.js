document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    // Login event handler
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const loginUsername = document.getElementById("loginUsername").value;
        const loginPassword = document.getElementById("loginPassword").value;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: loginUsername,
                    password: loginPassword,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                // Redirect to dashboard on successful login
                window.location.href = 'dashboard.html';
            } else {
                // Display error message
                document.getElementById('loginMessage').innerText = result.error;
            }
        } catch (error) {
            console.error('Error during login:', error);
            document.getElementById('loginMessage').innerText = 'An error occurred during login. Please try again later.';
        }
    });

    // Signup event handler
    signupForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const signupUsername = document.getElementById("signupUsername").value;
        const signupFullname = document.getElementById("signupFullname").value;
        const signupEmail = document.getElementById("signupEmail").value;
        const signupPassword = document.getElementById("signupPassword").value;

        try {
            // POST request to /register with JSON data
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: signupUsername,
                    full_name: signupFullname,
                    email: signupEmail,
                    password: signupPassword,
                }),
            });

            if (response.ok) { // If the response is successful
                // Notify the user of success
                document.getElementById("signupMessage").innerText = "Signup successful. Redirecting to dashboard...";
                // Redirect to dashboard after a delay to show success message
                setTimeout(() => {
                    window.location.href = 'dashboard.html'; // Redirect to the dashboard
                }, 2000); // Delay for 2 seconds
            } else {
                // Try to read the JSON error message
                const errorResult = await response.json();
                document.getElementById("signupMessage").innerText = errorResult.error;
            }
        } catch (error) {
            console.error('Error during signup:', error); // Log the specific error
            document.getElementById("signupMessage").innerText = "An error occurred. Please try again later.";
        }
    });


    document.getElementById("showSignupButton").addEventListener("click", function() {
        document.getElementById("loginSection").style.display = "none";
        document.getElementById("signupSection").style.display = "block";
    });

    document.getElementById("backToLoginButton").addEventListener("click", function() {
        document.getElementById("signupSection").style.display = "none";
        document.getElementById("loginSection").style.display = "block";
    });
});
