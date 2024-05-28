document.addEventListener("DOMContentLoaded", function() {
    let user = {
        isLoggedIn: false,
        name: "",
        preferredCourses: []
    };

    const userNameElement = document.getElementById("userName");
    const loginButton = document.getElementById("loginButton");
    const logoutButton = document.getElementById("logoutButton");
    const saveCoursesButton = document.getElementById("saveCoursesButton");
    const courseList = document.getElementById("courseList");
    const preferredCoursesList = document.getElementById("preferredCoursesList");

    async function loginUser(name) {
        const response = await fetch('http://localhost:3000/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        const data = await response.json();
        return data;
    }

    async function logoutUser() {
        await fetch('http://localhost:3000/api/users/logout', {
            method: 'POST'
        });
    }

    async function savePreferredCourses(name, courses) {
        await fetch('http://localhost:3000/api/users/save-courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, preferredCourses: courses })
        });
    }

    async function getUserCourses(name) {
        const response = await fetch('http://localhost:3000/api/users/get-courses', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name })
        });
        const data = await response.json();
        return data.preferredCourses;
    }

    function updateUI() {
        if (user.isLoggedIn) {
            userNameElement.textContent = `Hello, ${user.name}`;
            loginButton.style.display = "none";
            logoutButton.style.display = "inline";
            if (courseList) {
                saveCoursesButton.style.display = "inline";
                const checkboxes = courseList.querySelectorAll("input[type='checkbox']");
                checkboxes.forEach(checkbox => {
                    checkbox.checked = user.preferredCourses.includes(checkbox.value);
                });
            }
            if (preferredCoursesList) {
                preferredCoursesList.innerHTML = "";
                user.preferredCourses.forEach(course => {
                    const listItem = document.createElement("li");
                    listItem.textContent = course;
                    preferredCoursesList.appendChild(listItem);
                });
            }
        } else {
            userNameElement.textContent = "";
            loginButton.style.display = "inline";
            logoutButton.style.display = "none";
            if (courseList) {
                saveCoursesButton.style.display = "none";
            }
        }
    }

    loginButton.addEventListener("click", async function() {
        const name = prompt("Enter your name:");
        if (name) {
            const data = await loginUser(name);
            user.isLoggedIn = true;
            user.name = data.name;
            user.preferredCourses = data.preferredCourses;
            updateUI();
        }
    });

    logoutButton.addEventListener("click", async function() {
        await logoutUser();
        user.isLoggedIn = false;
        user.name = "";
        user.preferredCourses = [];
        updateUI();
    });

    if (saveCoursesButton) {
        saveCoursesButton.addEventListener("click", async function() {
            if (user.isLoggedIn) {
                const selectedCourses = [];
                const checkboxes = courseList.querySelectorAll("input[type='checkbox']");
                checkboxes.forEach(checkbox => {
                    if (checkbox.checked) {
                        selectedCourses.push(checkbox.value);
                    }
                });
                user.preferredCourses = selectedCourses;
                await savePreferredCourses(user.name, selectedCourses);
                alert("Preferred courses saved successfully!");
            } else {
                alert("Please log in to save your preferred courses.");
            }
        });
    }

    if (preferredCoursesList) {
        document.addEventListener("DOMContentLoaded", async function() {
            if (user.isLoggedIn) {
                user.preferredCourses = await getUserCourses(user.name);
                updateUI();
            }
        });
    }

    const leaderboardData = [
        { name: "Alice", points: 120 },
        { name: "Bob", points: 110 },
        { name: "Charlie", points: 100 }
    ];

    function populateLeaderboard() {
        const leaderboard = document.getElementById("leaderBoard");
        if (leaderboard) {
            leaderboardData.forEach(entry => {
                const listItem = document.createElement("li");
                listItem.textContent = `${entry.name} - ${entry.points} points`;
                leaderboard.appendChild(listItem);
            });
        }
    }

    populateLeaderboard();
    updateUI();
});
