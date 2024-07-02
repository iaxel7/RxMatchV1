const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    
    const formData = new FormData(contactForm);
    
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message')
    };
    
    try {
        const response = await fetch('/submit', {
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
            alert('An error occurred. Please try again later.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again later.');
    }
});
