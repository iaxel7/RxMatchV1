document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementsByClassName('toggle-button')[0];
    const navbarLinks = document.getElementsByClassName('navbar-links')[0];

    toggleButton.addEventListener('click', () => {
        navbarLinks.classList.toggle('active');
    });

    const contactForm = document.getElementById('form');

    if (!contactForm) {
        console.error('Contact form element not found');
        return;
    }

    contactForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        console.log('Form submitted');

        const nameField = document.getElementById('name');
        const emailField = document.getElementById('email');
        const messageField = document.getElementById('message');

        const name = nameField.value.trim();
        const email = emailField.value.trim();
        const message = messageField.value.trim();

        if (!name || !email || !message) {
            alert('All fields are required');
            return;
        }

        const data = {
            name: name,
            email: email,
            message: message
        };

        console.log('Form data:', data);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('Message sent successfully!');
                contactForm.reset();
            } else {
                const errorData = await response.json();
                alert(`An error occurred: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        }
    });
});

