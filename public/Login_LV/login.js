// -----------------NAV BAR JS------------------
const toggleButton = document.getElementsByClassName('toggle-button')[0]
const navbarLinks = document.getElementsByClassName('navbar-links')[0]


toggleButton.addEventListener('click', () => {
 navbarLinks.classList.toggle('active')
})
// --------------END NAV BAR JS------------------

document.getElementById('signup').addEventListener('click', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
 
    if (!username || !password) {
        alert('Please enter valid email and name');
        return;
    }
 
    fetch('/api/users/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(data => {
        alert('Sign up successful');
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        window.location.href = '/HomePage-Diana/index.html'; // Corrected redirection
    })
    .catch(error => {
        console.error('Error:', error);
        alert(error.error || 'Sign up failed');
    });
 });
 
document.getElementById('subscription').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    let isValid = true;

    // Updated validation for username to allow one space
    const username = formData.get('username');
    if (!/^([A-Za-z\s]{1,20})$/.test(username)) {
        document.getElementById('usernameError').innerHTML = '<span style="color:red;">Enter valid name</span>';
        isValid = false;
    } else {
        document.getElementById('usernameError').innerHTML = ''; // Clear any existing error message
    }

    // Validate password as an email
    const password = formData.get('password');
    if (!/^\S+@\S+\.\S+$/.test(password)) {
        document.getElementById('passwordError').innerHTML = '<span style="color:red;">Enter valid email</span>';
        isValid = false;
    } else {
        document.getElementById('passwordError').innerHTML = ''; // Clear any existing error message
    }
});
