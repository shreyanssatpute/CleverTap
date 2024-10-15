// Function to fetch weather data from OpenWeatherMap API
async function getWeatherData(location) {
  const apiKey = '3e64bb558c78b52d3cfbdcb7306f2e73'; // Replace 'YOUR_API_KEY' with your OpenWeatherMap API key
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

  const weatherAnimationElement = document.getElementById('weatherAnimation');
  weatherAnimationElement.className = '';

  if (weatherData.weather[0].main === 'Clear') {
    // Clear Sky
    weatherAnimationElement.classList.add('clear-sky');
  } else if (
    weatherData.weather[0].main === 'Clouds' ||
    weatherData.weather[0].main === 'Mist' ||
    weatherData.weather[0].main === 'Haze'
  ) {
    // Cloudy
    weatherAnimationElement.classList.add('cloudy');
  } else if (
    weatherData.weather[0].main === 'Rain' ||
    weatherData.weather[0].main === 'Drizzle'
  ) {
    // Rain
    weatherAnimationElement.classList.add('rain');
  } else {
    // Other conditions
    weatherAnimationElement.classList.add('default');
  }
}

// Function to handle geolocation success
function handleGeolocationSuccess(position) {
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  getWeatherData(`${latitude},${longitude}`)
    .then((weatherData) => {
      showWeatherInfo(weatherData);
    })
    .catch((error) => {
      const weatherInfoElement = document.getElementById('weatherInfo');
      weatherInfoElement.innerHTML = `<p>${error.message}</p>`;
    });
}

// Function to handle geolocation error
function handleGeolocationError(error) {
  console.log('Geolocation error:', error);
}

// Function to fetch weather data based on geolocation
function fetchWeatherByGeolocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const location = `${latitude},${longitude}`;

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

// Event listener for the geolocation button
document.getElementById('geolocationBtn').addEventListener('click', fetchWeatherByGeolocation);

// Event listener for the "Get Weather" button
document.getElementById('getWeatherBtn').addEventListener('click', () => {
  const locationInput = document.getElementById('locationInput');
  const location = locationInput.value.trim();

  if (location !== '') {
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

// Autocomplete for location input
$(function () {
  const locationInput = document.getElementById('locationInput');

  $(locationInput).autocomplete({
    source: function (request, response) {
      const apiKey = '3e64bb558c78b52d3cfbdcb7306f2e73'; // Replace 'YOUR_API_KEY' with your OpenWeatherMap API key
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
