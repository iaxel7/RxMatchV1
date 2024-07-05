const form = document.getElementById("form");
const fullName = document.getElementById("Name");
const email = document.getElementById("email");
const message = document.getElementById("message");

form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (validateForm()) {
        const formData = new FormData();
        formData.append("name", Name.value);
        formData.append("email", email.value);
        formData.append("message", message.value);

        fetch('/api/contact', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                console.log('Contact form submitted successfully!');
                // You can add any additional logic or UI updates here
            } else {
                console.error('Failed to submit contact form');
            }
        })
        .catch(error => console.error('Error:', error));
    }
});

function validateForm() {
    let valid = true;

    if (fullName.value.trim() === '') {
        valid = false;
        setErrorFor(fullName, 'Name cannot be empty');
    } else {
        setSuccessFor(fullName);
    }

    if (email.value.trim() === '') {
        valid = false;
        setErrorFor(email, 'Email cannot be empty');
    } else if (!isValidEmail(email.value)) {
        valid = false;
        setErrorFor(email, 'Enter a valid email address');
    } else {
        setSuccessFor(email);
    }

    if (message.value.trim() === '') {
        valid = false;
        setErrorFor(message, 'Message cannot be empty');
    } else {
        setSuccessFor(message);
    }

    return valid;
}

function setErrorFor(input, message) {
    const formControl = input.parentElement;
    const small = formControl.querySelector('small');
    small.innerText = message;
    formControl.classList.add('error');
}

function setSuccessFor(input) {
    const formControl = input.parentElement;
    formControl.classList.remove('error');
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
