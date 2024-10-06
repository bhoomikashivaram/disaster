// Replace with your actual API key
const apiKey = '9b3f1fc0d153880e0f5e0c64c9c5b642';
const apiEndpoint = 'https://api.openweathermap.org/data/2.5/weather'; // Current weather endpoint

// Function to search for climate based on city name
function searchClimate() {
  const city = document.getElementById('city').value;
  const resultDiv = document.getElementById('result');

  // Clear previous results
  resultDiv.innerHTML = '';

  if (city.trim() === '') {
    alert('Please enter a city name');
    return;
  }

  // Build the API request URL
  const url = `${apiEndpoint}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`; // Use units=metric for Celsius

  // Make the API request
  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error(`City not found: ${response.statusText}`);
      }
      return response.json();
    })
    .then(data => {
      // Extract relevant data from the API response
      const temperature = data.main.temp;
      const humidity = data.main.humidity;
      const weatherCondition = data.weather[0].description;

      // Display the results
      resultDiv.innerHTML = `
        <h3>Current Weather in ${data.name}:</h3>
        <p>Temperature: ${temperature}°C</p>
        <p>Condition: ${weatherCondition}</p>
        <p>Humidity: ${humidity}%</p>
      `;

      // Fetch disaster data
      fetchDisasterData(data.coord.lat, data.coord.lon);
      // Initialize map
      initMap(data.coord.lat, data.coord.lon, data.name);
    })
    .catch(error => {
      console.error('Error fetching climate data:', error);
      resultDiv.innerHTML = `<p>Error fetching data: ${error.message}. Please try again later.</p>`;
    });
}

// Function to fetch disaster data
function fetchDisasterData(lat, lon) {
  const disasterApiUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=hourly,daily&appid=${apiKey}`;
  
  fetch(disasterApiUrl)
    .then(response => response.json())
    .then(data => {
      // Extract disaster-related data (e.g., alerts)
      const disasterAlerts = data.alerts;

      // Display disaster information
      const disasterDiv = document.createElement('div');
      disasterDiv.innerHTML = '<h4>Disaster Alerts:</h4>';
      if (disasterAlerts) {
        disasterAlerts.forEach(alert => {
          disasterDiv.innerHTML += `<p>${alert.event}: ${alert.description}</p>`;
        });
      } else {
        disasterDiv.innerHTML += '<p>No current disaster alerts.</p>';
      }
      document.getElementById('result').appendChild(disasterDiv);
    })
    .catch(error => {
      console.error('Error fetching disaster data:', error);
      document.getElementById('result').innerHTML += `<p>Error fetching disaster data: ${error.message}</p>`;
    });
}

// Function to initialize the map
function initMap(lat, lon, cityName) {
  const map = L.map('map').setView([lat, lon], 13); // Set the view to the city's latitude and longitude

  // Add OpenStreetMap tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
  }).addTo(map);

  // Add a marker for the city
  L.marker([lat, lon]).addTo(map).bindPopup(`<b>${cityName}</b>`).openPopup();
}
