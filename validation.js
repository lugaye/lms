// Form Validation

document.addEventListener('DOMContentLoaded', () => {
    const inputUsername = document.getElementById('username');
    const inputPassword = document.getElementById('password');
    const inputConfirmPassword = document.getElementById('c-password');
    const inputEmail = document.getElementById('email');
    const fullName = document.getElementById('full_name');

    const registerForm = document.getElementById('register-form');


    const checkUsername = () => {
        let isValid = false;
        const min = 3, max = 25;
        let username = inputUsername.value.trim();
        if (!isRequired(username)) {
            showError(inputUsername, 'The Username can not be blank');
        }else if (!isBetween(username.length, min, max)) {
            showError(inputUsername, `The username must be between ${min} and ${max} characters`)
        }else {
            showSuccess(inputUsername);
            isValid = true;
        }
        return isValid;
    }

    const checkPassword = () => {
        let isSecure = false;
        let password = inputPassword.value.trim();
        if(!isRequired(password)) {
            showError(inputPassword, 'The password is required.');
        }else if (!isPasswordSecure(password)) {
            showError(inputPassword, 'Password must has at least 8 characters that include at least 1 lowercase character, 1 uppercase characters, 1 number, and 1 special character in (!@#$%^&*)')
        }else {
            isSecure = true;
            showSuccess(inputPassword)
        }
        return isSecure;
    }

    const checkConfirmPassword = () => {
        let password = inputPassword.value.trim();
        let confirmPassword = inputConfirmPassword.value.trim();

        if (!isRequired(confirmPassword)) {
            showError(inputConfirmPassword, 'This field cannot be black');
        }else if ((password !== confirmPassword)) {
            showError(inputConfirmPassword, 'Passwords does not match');
        }else {
            showSuccess(inputConfirmPassword);
        }
    }

    const checkEmail = () => {
        let isValid = false;
        let email = inputEmail.value.trim();
        if(!isRequired(inputEmail)) {
            showError(inputEmail, 'The email field is required.')
        }else if (!isEmailValid(email)) {
            showError(inputEmail, 'Email is not valid.');
        }else {
            isValid = true;
            showSuccess(inputEmail);
        }
        return isValid;
    }

    registerForm.addEventListener('input', debounce(function(e) {
        switch (e.target.id) {
            case 'username':
                checkUsername();
                break;
            case 'email':
                checkEmail();
                break;
            case 'password':
                checkPassword();
                break;
            case 'c-password':
                checkConfirmPassword()
                break;
        }
    }))

})

const isRequired = value => value !== '';
const isBetween = (length, min, max) => !(length < min || length > max);

const isEmailValid = email => {
    const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    return regex.test(email);
}

const isPasswordSecure = password => {
    const regex = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})");

    return regex.test(password);
}

const showError = (input, error) => {
    let formGroup = input.parentElement;
    let small = formGroup.querySelector('small');

    formGroup.classList.add('error');
    small.textContent = error;
}

const showSuccess = (input) => {
    let formGroup = input.parentElement;
    let small = formGroup.querySelector('small');

    formGroup.classList.remove('error');
    formGroup.classList.add('success');
    small.textContent = '';
}

const debounce = (fn, delay=500) => {
    let timeOutId ;
    return (...args) => {
        if (timeOutId) {
            clearTimeout(timeOutId);
        }

        timeOutId = setTimeout(() => {
            fn.apply(null, args)
        }, delay)
    };
}
