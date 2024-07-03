document.addEventListener('DOMContentLoaded', () => {
    fetchLikedMedications();
  });
  
  function fetchLikedMedications() {
    // This function should fetch liked medications from your backend.
    // For demonstration, we'll use dummy data.
    const likedMedications = [
      { name: "Medication 1", price: "$20.00", image: "img1.jpg" },
      { name: "Medication 2", price: "$30.00", image: "img2.jpg" },
      { name: "Medication 3", price: "$40.00", image: "img3.jpg" },
    ];
  
    const medicationList = document.getElementById('medicationList');
    likedMedications.forEach(medication => {
      const medItem = document.createElement('div');
      medItem.className = 'medication-item';
  
      medItem.innerHTML = `
        <div class="medication-info">
          <img src="${medication.image}" alt="${medication.name}" width="50" height="50">
          <div>
            <h4>${medication.name}</h4>
            <p>${medication.price}</p>
          </div>
        </div>
        <button onclick="removeLike('${medication.name}')">Remove</button>
      `;
      medicationList.appendChild(medItem);
    });
  }
  
  function removeLike(medicationName) {
    // Logic to remove medication from liked list
    alert(`Removed ${medicationName} from liked medications`);
  }
  
  function searchMedications() {
    const input = document.getElementById('searchInput');
    const filter = input.value.toLowerCase();
    const medicationList = document.getElementById('medicationList');
    const items = medicationList.getElementsByClassName('medication-item');
  
    Array.from(items).forEach(item => {
      const name = item.querySelector('.medication-info h4').textContent;
      if (name.toLowerCase().indexOf(filter) > -1) {
        item.style.display = "";
      } else {
        item.style.display = "none";
      }
    });
  }
  