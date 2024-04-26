const signUp = document.querySelector("#sign-up");
const logIn = document.querySelector("#log-in");

const registerForm = document.querySelector("#register-form");
const loginForm = document.querySelector("#login-form");
const logOutForm = document.querySelector("#logout-form");


// toggles to the sign up page
signUp.addEventListener('click', () => {
    loginForm.style.display = 'none';
    registerForm.style.display = 'flex';
    logOutForm.style.display = 'none';
})

// toggles to the log-in page
logIn.addEventListener('click', () => {
    loginForm.style.display = 'flex';
    registerForm.style.display = 'none';
    logOutForm.style.display = 'none';
})