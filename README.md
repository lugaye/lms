# Learning Managment System

## Step 1: Project Setup

### Create a new directory for your project and navigate into it.
```bash
mkdir learning-management-app
cd learning-management-app
```
### Initialize and Install  Node.js dependencies.
```bash
npm install
```


## Step 2: Set up the Backend

### Create a `server.js` file in your project directory.

### Create a MySQL database named `learning_management` 

#### Create users table
```bash
-- Create users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(255)
);
```

#### Create courses table
```bash
-- CREATE TABLE `courses` (
  `id` int(11) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `content` text DEFAULT NULL,
  `overview` text DEFAULT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;


-- INSERT INTO `courses` (`id`, `name`, `content`, `overview`, `description`) VALUES
(13, 'JavaScript Mastery', '<p><strong>What You\'ll Cover:</strong></p>\r\n <ul>\r\n     <li>Introduction to JavaScript: Understand the basics of JavaScript, including variables, data types, and operators.</li>\r\n     <li>Control Flow: Learn about conditionals and loops to control the flow of your JavaScript code.</li>\r\n     <li>Functions and Scope: Dive into functions and scope in JavaScript, including function expressions and closures.</li>\r\n     <li>Arrays and Objects: Explore arrays and objects in JavaScript, and learn how to manipulate them effectively.</li>\r\n     <li>DOM Manipulation: Master the Document Object Model (DOM) and learn how to manipulate HTML elements dynamically.</li>\r\n     <li>Asynchronous JavaScript: Understand asynchronous programming in JavaScript, including callbacks, promises, and async/await.</li>\r\n </ul>\r\n \r\n <p><strong>What You\'ll Be Able to Do:</strong></p>\r\n <ul>\r\n     <li>Build Dynamic Web Pages: Use JavaScript to add interactivity and dynamic behavior to your web pages.</li>\r\n     <li>Handle User Input: Capture and process user input using event listeners and DOM manipulation.</li>\r\n     <li>Create Interactive Web Applications: Build interactive web applications with asynchronous JavaScript.</li>\r\n     <li>Utilize Third-Party APIs: Integrate third-party APIs to fetch data and enhance your web applications.</li>\r\n     <li>Develop Games: Develop simple games using JavaScript and the HTML5 canvas element.</li>\r\n     <li>Troubleshoot JavaScript Errors: Learn techniques to debug and fix common JavaScript errors.</li>\r\n </ul>', '<p>This course focuses on mastering JavaScript, from basic syntax to advanced concepts.</p>', '<p>Become proficient in JavaScript and build dynamic, interactive web applications.</p>'),
(14, 'Frontend Development Fundamentals', '<p><strong>What You\'ll Cover:</strong></p>\r\n <ul>\r\n     <li>HTML Essentials: Learn the fundamentals of HTML, including tags, attributes, and document structure.</li>\r\n     <li>CSS Basics: Understand CSS syntax, selectors, and properties to style your HTML documents.</li>\r\n     <li>Responsive Web Design: Master techniques for creating responsive and mobile-friendly web designs.</li>\r\n     <li>CSS Flexbox and Grid: Dive into CSS Flexbox and Grid layout models for building complex web layouts.</li>\r\n     <li>CSS Preprocessors: Explore CSS preprocessors like Sass and Less to enhance your CSS workflow.</li>\r\n     <li>Introduction to JavaScript: Get started with JavaScript, covering basic syntax and concepts.</li>\r\n </ul>\r\n \r\n <p><strong>What You\'ll Be Able to Do:</strong></p>\r\n <ul>\r\n     <li>Create Static Web Pages: Build static web pages using HTML and CSS.</li>\r\n     <li>Design Responsive Websites: Design websites that adapt to different screen sizes and devices.</li>\r\n     <li>Use Modern CSS Techniques: Apply modern CSS techniques like Flexbox and Grid for layout design.</li>\r\n     <li>Enhance CSS Workflow: Improve your CSS workflow using preprocessors like Sass and Less.</li>\r\n     <li>Understand JavaScript Basics: Gain a solid understanding of JavaScript basics to add interactivity to your web pages.</li>\r\n </ul>', '<p>This course provides a comprehensive introduction to frontend web development.</p>', '<p>Master frontend development fundamentals and build stunning websites.</p>'),
(15, 'Full Stack Web Development', '<p><strong>What You\'ll Cover:</strong></p>\r\n <ul>\r\n     <li>Backend Basics: Learn about backend development fundamentals, including server-side programming languages like Node.js and databases like MongoDB.</li>\r\n     <li>Express.js: Dive into Express.js, a popular web application framework for Node.js, to build robust and scalable backend APIs.</li>\r\n     <li>Database Management: Explore database management using MongoDB, a NoSQL database, and learn to perform CRUD operations.</li>\r\n     <li>Authentication and Authorization: Implement user authentication and authorization using JSON Web Tokens (JWT) and Passport.js.</li>\r\n     <li>Frontend Development: Review frontend development concepts, including HTML, CSS, and JavaScript, to build interactive user interfaces.</li>\r\n     <li>Integration with Frontend: Integrate the frontend and backend to create full-stack web applications.</li>\r\n </ul>\r\n \r\n <p><strong>What You\'ll Be Able to Do:</strong></p>\r\n <ul>\r\n     <li>Build Backend APIs: Create RESTful APIs using Express.js and MongoDB for database interaction.</li>\r\n     <li>Implement Authentication: Add user authentication and authorization to your web applications.</li>\r\n     <li>Develop Full-Stack Web Applications: Build full-stack web applications from scratch using modern technologies.</li>\r\n     <li>Deploy Web Applications: Deploy your web applications to production servers using platforms like Heroku.</li>\r\n     <li>Optimize Web Performance: Optimize web applications for performance and scalability.</li>\r\n     <li>Collaborate on Projects: Work collaboratively on real-world projects to gain practical experience.</li>\r\n </ul>', '<p>This course covers the complete stack of web development, from frontend to backend.</p>', '<p>Become a full-stack web developer and build powerful web applications.</p>'),
(16, 'Advanced Web Development', '<p><strong>What You\'ll Cover:</strong></p>\r\n <ul>\r\n     <li>Advanced JavaScript: Master advanced JavaScript concepts like closures, prototypes, and ES6 features.</li>\r\n     <li>Asynchronous JavaScript: Dive deep into asynchronous JavaScript programming, including promises, async/await, and event loop.</li>\r\n     <li>Modern JavaScript Frameworks: Explore modern JavaScript frameworks like React.js and Vue.js for building dynamic web applications.</li>\r\n     <li>State Management: Learn state management techniques using Redux for React.js and Vuex for Vue.js.</li>\r\n     <li>Server-Side Rendering: Understand server-side rendering (SSR) with React.js and Vue.js for improved performance and SEO.</li>\r\n     <li>RESTful APIs: Create RESTful APIs using Node.js and Express.js, and consume them in frontend frameworks.</li>\r\n </ul>\r\n \r\n <p><strong>What You\'ll Be Able to Do:</strong></p>\r\n <ul>\r\n     <li>Master Advanced JavaScript: Become proficient in advanced JavaScript concepts and ES6 features.</li>\r\n     <li>Build Dynamic Web Applications: Use modern JavaScript frameworks like React.js and Vue.js to build dynamic and interactive web applications.</li>\r\n     <li>Implement State Management: Manage application state effectively using Redux for React.js and Vuex for Vue.js.</li>\r\n     <li>Improve Web Performance: Implement server-side rendering (SSR) to improve web performance and SEO.</li>\r\n     <li>Create Scalable Web Applications: Build scalable web applications with RESTful APIs using Node.js and Express.js.</li>\r\n     <li>Develop Real-World Projects: Work on real-world projects to apply your advanced web development skills.</li>\r\n </ul>', '<p>This course focuses on advanced topics in web development, including modern JavaScript frameworks and server-side rendering.</p>', '<p>Take your web development skills to the next level with advanced techniques and frameworks.</p>');

```

#### Create leaderboard table
```bash
-- Create leaderboard table
CREATE TABLE leaderboard (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    score INT
);

-- Insert sample data into leaderboard table
INSERT INTO leaderboard (name, score) VALUES
('John Doe', 100),
('Jane Smith', 90),
('Michael Brown', 85),
('Emily Jones', 80);
```

### Run the server.
```bash
node server.js
```

## Step 3: Frontend Setup

### Create an `index.html` file for the frontend.

### Create a `course-content.html` file for the course content.

### Create a `leader-board.html` file for the leader board.

### Create a `style.css` file to style your HTML.

### Create a `script.js` file to handle frontend interactions.

## Step 4: Testing
Open your web browser and navigate to http://localhost:3000.

# Hackathon Instructions
Finish up the project by: 
1. creating functionality for the logged in user to select their preferred courses.
2. store the selection in the database
3. create a page where the selected courses for each specific logged in user is displayed.
   
## Submission Guidelines
Fork this repository and clone it to your local machine. 
Create a new branch with your GitHub username (git checkout -b username). 
Complete the tasks. 
Commit your changes and push them to your forked repository. 
Submit a pull request to the main repository for review.

Happy hacking! 🚀
