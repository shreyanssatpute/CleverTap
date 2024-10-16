async function getLocationKey(location) {
  const apiKey = 'MxAqOsOAdZMHmpVmSFE6Af2a3HJhoT4a'; 
  const locationUrl = `https://dataservice.accuweather.com/locations/v1/cities/search?apikey=${apiKey}&q=${encodeURIComponent(location)}`;

  const response = await fetch(locationUrl);
  const data = await response.json();

  if (response.ok && data.length > 0) {
    return data[0].Key; 
  } else {
    throw new Error(data.Message || 'Failed to fetch location key');
  }
}


async function getWeatherData(locationKey) {
  const apiKey = 'MxAqOsOAdZMHmpVmSFE6Af2a3HJhoT4a'; 
  const weatherUrl = `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${apiKey}`;

  const response = await fetch(weatherUrl);
  const data = await response.json();

  if (response.ok) {
    return data[0]; 
  } else {
    throw new Error(data.Message || 'Failed to fetch weather data');
  }
}


function showWeatherInfo(weatherData, location) {
  const weatherInfoElement = document.getElementById('weatherInfo');
  const weatherDescription = weatherData.WeatherText; 
  const isCloudy = weatherDescription.includes('Cloud'); 

  // Display weather info
  weatherInfoElement.innerHTML = `
    <h2 style="text-align: center;">${location}</h2>
    <p style="font-size: 20px;">Temperature: ${weatherData.Temperature.Metric.Value}°C</p>
    <p>Weather: ${weatherDescription}</p>
    <p>Humidity: ${weatherData.RelativeHumidity}%</p>
    
  `;

  // Send data to CleverTap
  clevertap.event.push("Weather Check", {
    "Location": location,
    "Weather Description": weatherDescription,
    "Is Cloudy": isCloudy
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
document.getElementById('getWeatherBtn').addEventListener('click', async () => {
  const locationInput = document.getElementById('locationInput');
  const location = locationInput.value.trim();

  if (location !== '') {
    try {
      const locationKey = await getLocationKey(location);
      const weatherData = await getWeatherData(locationKey);
      showWeatherInfo(weatherData, location);
    } catch (error) {
      const weatherInfoElement = document.getElementById('weatherInfo');
      weatherInfoElement.innerHTML = `<p>${error.message}</p>`;
    }
  }
});

// Event listener for the geolocation button
document.getElementById('geolocationBtn').addEventListener('click', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const location = `${latitude},${longitude}`;

        try {
          const locationKey = await getLocationKey(location);
          const weatherData = await getWeatherData(locationKey);
          showWeatherInfo(weatherData, location);
        } catch (error) {
          const weatherInfoElement = document.getElementById('weatherInfo');
          weatherInfoElement.innerHTML = `<p>${error.message}</p>`;
        }
      },
      (error) => {
        console.log('Geolocation error:', error);
      }
    );
  } else {
    console.log('Geolocation is not supported by this browser.');
  }
});
