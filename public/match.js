// Adding an event listener to the form to handle the submit event
document.getElementById('illnessForm').addEventListener('submit', function(event) {
    event.preventDefault();  // Prevent the form from submitting in the traditional way

    // Get the value entered by the user
    const illness = document.getElementById('illness').value;
    const resultsDiv = document.getElementById('results');

    // Fetch medication data from the FDA API using the entered illness
    fetch(`https://api.fda.gov/drug/label.json?search=indications_and_usage:${illness}`)
        .then(response => response.json())  // Parse the JSON response
        .then(data => {
            resultsDiv.innerHTML = '';  // Clear previous results
            if (data.results && data.results.length > 0) {  // Check if there are any results
                data.results.forEach(medication => {  // Iterate over each medication
                    const medDiv = document.createElement('div');  // Create a div for each medication
                    const medName = medication.openfda.brand_name ? medication.openfda.brand_name.join(', ') : 'Unknown';  // Get the brand name
                    const medDescription = medication.description ? medication.description[0] : 'No description available';  // Get the description
                    
                    // Set the HTML content for each medication div
                    medDiv.innerHTML = `
                        <h2>${medName}</h2>
                        <p>${medDescription}</p>
                        <button onclick="saveMedication('${medName}', '${medDescription}')">Save Medication</button>
                    `;
                    resultsDiv.appendChild(medDiv);  // Append the medication div to the results div
                });
            } else {
                // If no results, display a message
                resultsDiv.innerHTML = '<p>No medications found for this illness.</p>';
            }
        })
        .catch(error => {
            // If there's an error with the fetch, display an error message
            resultsDiv.innerHTML = '<p>An error occurred while fetching data.</p>';
            console.error('Error:', error);
        });
});

// Function to save the medication
function saveMedication(name, description) {
    const token = localStorage.getItem('token');  // Get the token from local storage
    if (!token) {  // Check if the user is logged in
        alert('You need to be logged in to save medications');  // Alert the user if not logged in
        return;
    }

    // Send a POST request to save the medication
    fetch('/save_medication', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`  // Include the token in the Authorization header
        },
        body: JSON.stringify({ name, description })  // Send the medication data in the request body
    })
    .then(response => response.json())  // Parse the JSON response
    .then(data => {
        alert(data.message || data.error);  // Display a message based on the response
    })
    .catch(error => {
        // If there's an error with the fetch, log it to the console
        console.error('Error:', error);
    });
}
