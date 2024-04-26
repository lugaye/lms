const accordionHeaders = document.querySelectorAll(".accordion-header");

accordionHeaders.forEach(function (header) {
    header.addEventListener('click', function () {
        const accordionBody = this.nextElementSibling;

        // Close all other accordion bodies
        document.querySelectorAll('.accordion-body').forEach(function(body) {
            if (body !== accordionBody) {
                body.style.display = "none";
            }
        });

        // Toggle display of clicked accordion body
        if (accordionBody.style.display === "flex") {
            accordionBody.style.display = "none";
        } else {
            accordionBody.style.display = "flex";
        }
    });
});

function fetchCourseContent() {
    // Get course ID from URL parameter (assuming course ID is passed in the URL)
    const urlParams = new URLSearchParams(window.location.search);
    const courseId = urlParams.get('id');

    // Make AJAX request to fetch course content from server
    fetch(`/courses/${courseId}`)
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
            <!-- Add more elements as needed (e.g., videos, quizzes) -->
        `;
        courseContentElement.appendChild(moduleSection);
    });
}