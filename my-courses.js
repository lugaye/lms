// my-courses.js

document.addEventListener("DOMContentLoaded", () => {
  fetch("/my-courses")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      displayCourses(data);
    })
    .catch((error) => {
      console.error("Error fetching user courses:", error);
    });
});

function displayCourses(courses) {
  const courseList = document.getElementById("course-list");
  courses.forEach((course) => {
    const courseItem = document.createElement("li");
    courseItem.textContent = course.name;
    courseList.appendChild(courseItem);
  });
}
