// Function to fetch weather data from OpenWeatherMap API
async function getWeatherData(location) {
  const apiKey = '3e64bb558c78b52d3cfbdcb7306f2e73';
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
function showWeatherInfo(weatherData) {
  const weatherInfoElement = document.getElementById('weatherInfo');
  weatherInfoElement.innerHTML = `
    <h2 style="text-align: center;">${weatherData.name}</h2>
    <p style="font-size: 20px;">Temperature: ${weatherData.main.temp}°C</p>
    <p>Weather: ${weatherData.weather[0].description}</p>
    <p>Wind Speed: ${weatherData.wind.speed} km/h</p>
    <p>Humidity: ${weatherData.main.humidity}%</p>
    <p>Visibility: ${weatherData.visibility / 1000} km</p>
  `;
}

// Send location event to CleverTap
function sendLocationToCleverTap(location) {
  clevertap.event.push("LocationEntered", { "Location": location });
  console.log(`Location '${location}' sent to CleverTap.`);
}

// Event listener for the "Get Weather" button
document.getElementById('getWeatherBtn').addEventListener('click', () => {
  const locationInput = document.getElementById('locationInput');
  const location = locationInput.value.trim();

  if (location !== '') {
    // Send location to CleverTap
    sendLocationToCleverTap(location);

    getWeatherData(location)
      .then((weatherData) => {
        showWeatherInfo(weatherData);
      })
      .catch((error) => {
        const weatherInfoElement = document.getElementById('weatherInfo');
        weatherInfoElement.innerHTML = `<p>${error.message}</p>`;
      });
  }
});

// Event listener for the geolocation button
document.getElementById('geolocationBtn').addEventListener('click', fetchWeatherByGeolocation);

// Function to handle geolocation
function fetchWeatherByGeolocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const location = `${latitude},${longitude}`;

        // Send geolocation to CleverTap
        sendLocationToCleverTap(location);

        getWeatherData(location)
          .then((weatherData) => {
            showWeatherInfo(weatherData);
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
}

// Autocomplete for location input
$(function () {
  const locationInput = document.getElementById('locationInput');

  $(locationInput).autocomplete({
    source: function (request, response) {
      const apiKey = '3e64bb558c78b52d3cfbdcb7306f2e73';
      const autocompleteUrl = `https://api.openweathermap.org/data/2.5/find?q=${request.term}&appid=${apiKey}`;

      $.ajax({
        url: autocompleteUrl,
        method: 'GET',
        success: function (data) {
          response(data.list.map((item) => item.name));
        },
      });
    },
    select: function (event, ui) {
      locationInput.value = ui.item.name;
      return false;
    },
  });
});
