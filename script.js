// Function to fetch the location key from AccuWeather API
async function getLocationKey(location) {
  const apiKey = 'MxAqOsOAdZMHmpVmSFE6Af2a3HJhoT4a'; // Your AccuWeather API Key
  const locationUrl = `http://dataservice.accuweather.com/locations/v1/cities/search?apikey=${apiKey}&q=${location}`;

  try {
    const response = await fetch(locationUrl);
    const data = await response.json();

    if (response.ok && data.length > 0) {
      return data[0].Key; // Return the location key
    } else {
      throw new Error('Location not found');
    }
  } catch (error) {
    throw new Error(`Error fetching location key: ${error.message}`);
  }
}

// Function to fetch weather data using AccuWeather API
async function getWeatherData(location) {
  const apiKey = 'MxAqOsOAdZMHmpVmSFE6Af2a3HJhoT4a'; // Your AccuWeather API Key

  try {
    // First, get the location key
    const locationKey = await getLocationKey(location);

    // Then, fetch the weather data using the location key
    const weatherUrl = `http://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${apiKey}`;
    const response = await fetch(weatherUrl);
    const data = await response.json();

    if (response.ok && data.length > 0) {
      return data[0]; // Return weather data for the location
    } else {
      throw new Error('Failed to fetch weather data');
    }
  } catch (error) {
    throw new Error(`Error fetching weather data: ${error.message}`);
  }
}

// Function to display weather information
function showWeatherInfo(weatherData, location) {
  const weatherInfoElement = document.getElementById('weatherInfo');
  const weatherDescription = weatherData.WeatherText; // AccuWeather provides a weather text description
  const isCloudy = weatherDescription.includes('Cloud'); // Check if it's cloudy

  // Display weather info
  weatherInfoElement.innerHTML = `
    <h2 style="text-align: center;">${location}</h2>
    <p style="font-size: 20px;">Temperature: ${weatherData.Temperature.Metric.Value}°C</p>
    <p>Weather: ${weatherDescription}</p>
    
    <p>Humidity: ${weatherData.RelativeHumidity}%</p>
    
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
