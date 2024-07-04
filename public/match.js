// Adding an event listener to the form to handle the submit event
document.getElementById('illnessForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const illness = document.getElementById('illness').value;
    const resultsDiv = document.getElementById('results');

    console.log('Searching for medications related to:', illness); // Log the illness

    fetch(`/api/medication/search?illness=${illness}`, {
        method: 'GET'
    })
    .then(response => {
        console.log('Received response:', response); // Log the response
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Received data:', data); // Log the data
        resultsDiv.innerHTML = '';  // Clear previous results
        if (data && data.length > 0) {  // Check if there are any results
            data.forEach(medication => {  // Iterate over each medication
                const medDiv = document.createElement('div');  // Create a div for each medication
                let medName = medication.name;  // Get the medication name
                const medUsage = medication.usage;  // Get the usage information
                const medAdverseEffects = medication.adverse_effects;  // Get the adverse effects information
                
                // Check if the medication name is "Unknown" and replace it with a custom message
                if (medName === 'Unknown') {
                    medName = 'Medication name not available';
                }

                // Set the HTML content for each medication div
                medDiv.innerHTML = `
                    <h2>${medName}</h2>
                    <p><strong>Usage:</strong> ${medUsage}</p>
                    <p><strong>Adverse Effects:</strong> ${medAdverseEffects}</p>
                    <button onclick="saveMedication('${medName}', '${medUsage}', '${medAdverseEffects}')">Save Medication</button>
                `;
                resultsDiv.appendChild(medDiv);  // Append the medication div to the results div
            });
        } else {
            resultsDiv.innerHTML = '<p>No medications found for this illness.</p>';
        }
    })
    .catch(error => {
        console.error('Error fetching data:', error); // Log the error
        resultsDiv.innerHTML = '<p>An error occurred while fetching data.</p>';
    });
});

// Function to save the medication
function saveMedication(name, usage, adverseEffects) {
    console.log('Saving medication:', { name, usage, adverseEffects }); // Log the medication being saved

    fetch('/api/medication/save', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, usage, adverseEffects })
    })
    .then(response => {
        console.log('Save response:', response); // Log the save response
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        alert(data.message || data.error);
    })
    .catch(error => {
        console.error('Error saving medication:', error); // Log the error
    });
}

document.addEventListener('DOMContentLoaded', function() {
    const searchButtons = document.querySelectorAll('.search-button');
    const illnessInput = document.getElementById('illness');

    searchButtons.forEach(button => {
        button.addEventListener('click', function() {
            const searchText = this.getAttribute('data-search');
            illnessInput.value = searchText;
        });
    });
});

// Hamburger menu
const toggleButton = document.getElementsByClassName('toggle-button')[0]
const navbarLinks = document.getElementsByClassName('navbar-links')[0]

toggleButton.addEventListener('click', () => {
  navbarLinks.classList.toggle('active')
});
