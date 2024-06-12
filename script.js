document.addEventListener("DOMContentLoaded", () => {
    const userId = 1; // Example user ID
    
    fetch(`/api/user/courses?userId=${userId}`)
        .then(response => response.json())
        .then(data => {
            const coursesContainer = document.querySelector('.courses-container');
            
            data.courses.forEach(course => {
                const courseElement = document.createElement('div');
                courseElement.classList.add('course');
                
                courseElement.innerHTML = `
                    <h2>${course.title}</h2>
                    <p>${course.description}</p>
                    <button onclick="window.location.href='course-content.html?id=${course.id}'">View Course</button>
                `;
                
                coursesContainer.appendChild(courseElement);
            });
        })
        .catch(error => console.error('Error fetching user courses:', error));
});
