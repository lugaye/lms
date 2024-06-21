document.addEventListener('DOMContentLoaded', () => {
    const courseSelectionForm = document.getElementById('course-selection-form');

    courseSelectionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(courseSelectionForm);
        const selectedCourses = formData.getAll('course');
        try {
            const response = await fetch('/save-selected-courses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ selectedCourses })
            });
            if (response.ok) {
                alert('Selected courses saved successfully');
                fetchSelectedCourses();
            } else {
                alert('Failed to save selected courses');
            }
        } catch (error) {
            console.error('Error saving selected courses:', error);
            alert('Failed to save selected courses');
        }
    });

    function fetchSelectedCourses() {
        fetch('/get-selected-courses')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                displaySelectedCourses(data.selectedCourses);
            })
            .catch(error => {
                console.error('Error fetching selected courses:', error);
            });
    }

    function displaySelectedCourses(selectedCourses) {
        const selectedCoursesElement = document.getElementById('selected-courses');
        selectedCoursesElement.innerHTML = '';

        selectedCourses.forEach(course => {
            const courseElement = document.createElement('div');
            courseElement.textContent = course.name;
            selectedCoursesElement.appendChild(courseElement);
        });
    }

    if (window.location.pathname === '/dashboard') {
        fetchSelectedCourses();
    }
});
