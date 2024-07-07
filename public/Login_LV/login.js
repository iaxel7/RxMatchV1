// -----------------NAV BAR JS------------------
const toggleButton = document.getElementsByClassName('toggle-button')[0]
const navbarLinks = document.getElementsByClassName('navbar-links')[0]


toggleButton.addEventListener('click', () => {
 navbarLinks.classList.toggle('active')
})
// --------------END NAV BAR JS------------------
document.getElementById('log-in').addEventListener('submit', function(event) {
   event.preventDefault();
   const formData = new FormData(this);
   const username = formData.get('username');
   const password = formData.get('password');


   fetch('/api/users/login', {
       method: 'POST',
       body: JSON.stringify({ username, password }),
       headers: {
           'Content-Type': "application/json"
       }
   })
   .then(response => {
       if (!response.ok) {
           return response.json().then(err => { throw err; });
       }
       return response.json();
   })
   .then(data => {
       if (data.message === 'Logged in successfully'){
           alert('Login successful');
           window.location.href = '/HomePage-Diana/index.html';
       } else {
           alert('Unexpected response from server');
       }
   })
   .catch(error => {
       console.error('Error:', error);
       alert(error.error || 'Login failed');
   });
});
// ---- sign up
document.getElementById('signup').addEventListener('click', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
 
    if (!username || !password) {
        alert('Please enter both username and password');
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
 
