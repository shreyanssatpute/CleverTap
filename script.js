// Function to fetch weather data from OpenWeatherMap API
async function getWeatherData(location) {
  const apiKey = '3e64bb558c78b52d3cfbdcb7306f2e73'; // Replace with your OpenWeatherMap API key
  const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message || 'Failed to fetch weather data');
    }
  } catch (error) {
    throw new Error(`Error fetching weather data: ${error.message}`);
  }
}

// Function to display weather information
function showWeatherInfo(weatherData, location) {
  const weatherInfoElement = document.getElementById('weatherInfo');
  const weatherDescription = weatherData.weather[0].main; // Weather condition (e.g., Cloudy, Clear, etc.)
  const isCloudy = weatherDescription.includes('Cloud'); // Check if it's cloudy

  // Display weather info
  weatherInfoElement.innerHTML = `
    <h2 style="text-align: center;">${weatherData.name}</h2>
    <p style="font-size: 20px;">Temperature: ${weatherData.main.temp}°C</p>
    <p>Weather: ${weatherDescription}</p>
    <p>Wind Speed: ${weatherData.wind.speed} km/h</p>
    <p>Humidity: ${weatherData.main.humidity}%</p>
    <p>Visibility: ${weatherData.visibility / 1000} km</p>
  `;

  // Send data to CleverTap
  clevertap.event.push("Weather Check", {
    "Location": location,        // User-entered location
    "Weather Description": weatherDescription, // Weather condition
    "Is Cloudy": isCloudy        // Boolean: whether it's cloudy or not
  });

  // Handle weather animation (optional)
  const weatherAnimationElement = document.getElementById('weatherAnimation');
  weatherAnimationElement.className = '';

  if (isCloudy) {
    weatherAnimationElement.classList.add('cloudy');
  } else if (weatherDescription === 'Clear') {
    weatherAnimationElement.classList.add('clear-sky');
  } else {
    weatherAnimationElement.classList.add('default');
  }
}

// Event listener for the "Get Weather" button
document.getElementById('getWeatherBtn').addEventListener('click', () => {
  const locationInput = document.getElementById('locationInput');
  const location = locationInput.value.trim();

  if (location !== '') {
    getWeatherData(location)
      .then((weatherData) => {
        showWeatherInfo(weatherData, location);
      })
      .catch((error) => {
        const weatherInfoElement = document.getElementById('weatherInfo');
        weatherInfoElement.innerHTML = `<p>${error.message}</p>`;
      });
  }
});

// Event listener for the geolocation button
document.getElementById('geolocationBtn').addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const location = `${latitude},${longitude}`;

        getWeatherData(location)
          .then((weatherData) => {
            showWeatherInfo(weatherData, location);
          })
          .catch((error) => {
            const weatherInfoElement = document.getElementById('weatherInfo');
            weatherInfoElement.innerHTML = `<p>${error.message}</p>`;
          });
      },
      (error) => {
        console.log('Geolocation error:', error);
      }
    );
  } else {
    console.log('Geolocation is not supported by this browser.');
  }
});
