document.getElementById('courseForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const course1 = document.getElementById('course1').value;
    const course2 = document.getElementById('course2').value;
    const course3 = document.getElementById('course3').value;

    fetch('/submit-courses', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ course1, course2, course3 })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('message').innerHTML = '<p>Courses submitted successfully!</p>';
        } else {
            document.getElementById('message').innerHTML = '<p>Error submitting courses. Please try again.</p>';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('message').innerHTML = '<p>An error occurred. Please try again later.</p>';
    });
});
