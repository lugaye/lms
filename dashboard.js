document.getElementById('courseForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const course = document.getElementById('course').value;
    // Redirect user to course-content.html with selected course
    window.location.href = 'course-content.html?course=' + course;
});
// Sample data of chosen courses (replace with actual data from server if available)

// Function to display chosen courses
function displayCourses() {
    const coursesContainer = document.getElementById('courses');
    coursesContainer.innerHTML = '<h2>Your Chosen Courses:</h2>';
    const ul = document.createElement('ul');
    chosenCourses.forEach(course => {
        const li = document.createElement('li');
        li.textContent = course;
        ul.appendChild(li);
    });
    coursesContainer.appendChild(ul);
}

// Call the function to display courses when the page loads
window.addEventListener('load', displayCourses);
// Sample data of chosen courses (replace with actual data from server if available)
const chosenCourses = [];

// Function to display chosen courses
function displayCourses() {
    const coursesContainer = document.getElementById('courses');
    coursesContainer.innerHTML = '<h2>Your Chosen Courses:</h2>';
    const ul = document.createElement('ul');
    chosenCourses.forEach(course => {
        const li = document.createElement('li');
        li.textContent = course;
        ul.appendChild(li);
    });
    coursesContainer.appendChild(ul);
}

// Function to list chosen courses when button is clicked
document.getElementById('listCoursesBtn').addEventListener('click', function() {
    alert('Chosen Courses:\n' + chosenCourses.join('\n'));
});

// Call the function to display courses when the page loads
window.addEventListener('load', displayCourses);

// Event listener for form submission
document.getElementById('courseForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const selectedCourse = document.getElementById('course').value;
    // Add the selected course to the list of chosen courses
    chosenCourses.push(selectedCourse);
    // Call the function to display courses
    displayCourses();
});
