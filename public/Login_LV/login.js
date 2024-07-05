// -----------------NAV BAR JS------------------
const toggleButton = document.getElementsByClassName('toggle-button')[0]
const navbarLinks = document.getElementsByClassName('navbar-links')[0]

toggleButton.addEventListener('click', () => {
  navbarLinks.classList.toggle('active')
})
// --------------END NAV BAR JS------------------
document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    const formData = new FormData(this);
    const username = formData.get('username');
    const password = formData.get('password');

    fetch('/api/users/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Logged in successfully') {
            alert('Login successful');
        } else {
            alert('Login failed');
        }
    })
    .catch(error => console.error('Error:', error));
});