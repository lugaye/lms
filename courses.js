$(document).ready(function() {
    $('#courseForm').submit(function(event) {
        event.preventDefault();
        var selectedCourses = $('input[name="course"]:checked').map(function(){
            return $(this).val();
        }).get();
        $.ajax({
            type: 'POST',
            url: 'save_courses.php',
            data: { courses: selectedCourses },
            success: function(response) {
                alert('Courses saved successfully!');
            },
            error: function(xhr, status, error) {
                console.error('Error:', error);
            }
        });
    });
});
