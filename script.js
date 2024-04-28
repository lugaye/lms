document.addEventListener('DOMContentLoaded', () => {
    const courseList = document.getElementById("courseList"); // Section for course cards
    const courseDetails = document.getElementById("courseDetails"); // Section for course details

    // Function to fetch all courses
    function fetchCourses() {
        fetch('/courses')
            .then(response => response.json())
            .then(courses => {
                displayCourses(courses); // Display all courses
            })
            .catch(error => {
                console.error('Error fetching courses:', error);
                courseList.innerHTML = "<p>Could not load courses. Try again later.</p>"; // Error handling
            });
    }

    // Function to display the list of courses
    function displayCourses(courses) {
        courseList.innerHTML = ""; // Clear existing content

        courses.forEach(course => {
            const courseCard = document.createElement("div"); // Create a card for each course
            courseCard.classList.add("course-card");

            courseCard.innerHTML = `
                <h4>${course.name}</h4>
                
            `;

            // Event listener to fetch course details on click
            courseCard.addEventListener("click", () => {
                fetch(`/courses/${course.id}`) // Fetch course details by ID
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`Error fetching course details: ${response.status}`);
                        }
                        return response.json(); // Convert to JSON
                    })
                    .then(courseDetail => {
                        displayCourseDetails(courseDetail); // Display course details
                    })
                    .catch(error => {
                        console.error('Error fetching course details:', error);
                        courseDetails.innerHTML = "<p>Could not load course details. Try again later.</p>"; // Error handling
                    });
            });

            courseList.appendChild(courseCard); // Add the course card to the list
        });
    }

    // Function to display course details
    function displayCourseDetails(course) {
        courseDetails.innerHTML = `
            <h2>${course.name}</h2>
            <p>${course.description}</p>
            <button onclick="selectCourse(${course.id})">SELECT</button>
            <button>DROP</button>
        `;
    }

    fetchCourses(); // Fetch all courses when the page loads


});

 ///--------------------------------------------------------------------------------------------//
 document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('.sidebar'); // Sidebar element
    const toggleButton = document.querySelector('#toggle-sidebar'); // The button to toggle the sidebar

    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            sidebar.classList.toggle('expanded');
            sidebar.classList.toggle('collapsed');
        });
    }
});






//-----------------------------------------------------------------------------------------------//
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const showSignupButton = document.getElementById("showSignupButton");
    const backToLoginButton = document.getElementById("backToLoginButton");

    // Check if loginForm exists before adding event listener
    if (loginForm) {
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
    }

    // Check if signupForm exists before adding event listener
    if (signupForm) {
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
                    document.getElementById("signupMessage").innerText = "Signup successful. Redirecting to dashboard...";
                    setTimeout(() => {
                        window.location.href = 'dashboard.html'; // Redirect to the dashboard after 2 seconds
                    }, 2000);
                } else {
                    const errorResult = await response.json();
                    document.getElementById("signupMessage").innerText = errorResult.error;
                }
            } catch (error) {
                console.error('Error during signup:', error); // Log the specific error
                document.getElementById("signupMessage").innerText = "An error occurred. Please try again later.";
            }
        });
    }

    // Add event listeners for switching between login and signup sections
    if (showSignupButton) {
        showSignupButton.addEventListener("click", () => {
            const loginSection = document.getElementById("loginSection");
            const signupSection = document.getElementById("signupSection");

            if (loginSection) {
                loginSection.style.display = "none";
            }

            if (signupSection) {
                signupSection.style.display = "block";
            }
        });
    } 

    if (backToLoginButton) {
        backToLoginButton.addEventListener("click", () => {
            const signupSection = document.getElementById("signupSection");
            const loginSection = document.getElementById("loginSection");

            if (signupSection) {
                signupSection.style.display = "none";
            }

            if (loginSection) {
                loginSection.style.display = "block";
            }
        });
    }
});

//-----------------------------------------------------------//
//-- Get user info -- //
document.addEventListener('DOMContentLoaded', () => {
    // Fetch the user's information and update the dashboard
    function fetchUserInfo() {
        fetch('/get-user-info') // Fetch user information from the server
            .then(response => response.json())
            .then(user => {
                // Update the welcome message with the user's full name
                const userFullNameSpan = document.getElementById("user-fullname");
                if (userFullNameSpan) {
                    userFullNameSpan.innerText = user.full_name || user.username; // Display the full name or username
                }
            })
            .catch(error => {
                console.error('Error fetching user info:', error);
            });
    }

    fetchUserInfo(); // Fetch user information when the page loads
});

//------------------------------------------------------------//
// profile //
document.addEventListener('DOMContentLoaded', () => {
    const profileDropdownToggle = document.getElementById("profile-dropdown-toggle");
    const profileDropdownMenu = document.getElementById("profile-dropdown-menu");

    if (profileDropdownToggle) {
        profileDropdownToggle.addEventListener('click', () => {
            const isHidden = profileDropdownMenu.style.display === "none" || !profileDropdownMenu.style.display;
            profileDropdownMenu.style.display = isHidden ? "block" : "none"; // Toggle visibility
        });
    }

    // Hide the dropdown menu when clicking outside
    document.addEventListener('click', (event) => {
        if (!profileDropdownToggle.contains(event.target) && !profileDropdownMenu.contains(event.target)) {
            profileDropdownMenu.style.display = "none"; // Hide the dropdown
        }
    });
});
