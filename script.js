// Add event listeners for selecting courses
document.addEventListener('DOMContentLoaded', () => {
    // Add event listener to the form for selecting courses
    const selectCoursesForm = document.getElementById('select-courses-form');
    selectCoursesForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(selectCoursesForm);
        const courseIds = formData.getAll('courseIds[]');
        try {
            const response = await fetch('/select-courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userId: getUserId(), courseIds })
            });
            if (response.ok) {
                alert('Courses selected successfully');
                // Optionally, redirect to a confirmation page or update UI
            } else {
                alert('Failed to select courses');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });
});

// Function to get the user ID
function getUserId() {
    // This will retrieve the user ID from session or wherever it's stored
}

// Function to retrieve and display selected courses
async function fetchSelectedCourses() {
    try {
        const response = await fetch('/selected-courses');
        if (response.ok) {
            const selectedCourses = await response.json();
            displaySelectedCourses(selectedCourses);
        } else {
            alert('Failed to fetch selected courses');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function to display selected courses
function displaySelectedCourses(selectedCourses) {
    const selectedCoursesList = document.getElementById('selected-courses-list');
    selectedCoursesList.innerHTML = ''; // Clear previous content
    selectedCourses.forEach(course => {
        const courseElement = document.createElement('div');
        courseElement.textContent = course.name; // Assuming 'name' is the property for course name
        selectedCoursesList.appendChild(courseElement);
    });
}
