// Function to fetch location key from AccuWeather API
async function getLocationKey(location) {
    const apiKey = 'MxAqOsOAdZMHmpVmSFE6Af2a3HJhoT4a'; // Your AccuWeather API key
    const locationUrl = `https://dataservice.accuweather.com/locations/v1/cities/search?apikey=${apiKey}&q=${location}`;

    try {
        const response = await fetch(locationUrl);
        const data = await response.json();
        if (data && data.length > 0) {
            return data[0].Key; // Get the first location key
        } else {
            throw new Error('Location not found');
        }
    } catch (error) {
        throw new Error(`Error fetching location key: ${error.message}`);
    }
}

// Function to fetch weather data from AccuWeather API
async function getWeatherData(locationKey) {
    const apiKey = 'MxAqOsOAdZMHmpVmSFE6Af2a3HJhoT4a'; // Your AccuWeather API key
    const weatherUrl = `https://dataservice.accuweather.com/currentconditions/v1/${locationKey}?apikey=${apiKey}`;

    try {
        const response = await fetch(weatherUrl);
        const data = await response.json();
        if (response.ok) {
            return data[0]; // Return the first weather condition object
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
    const weatherDescription = weatherData.WeatherText; // Weather condition
    const temperature = weatherData.Temperature.Metric.Value; // Temperature
    const windSpeed = weatherData.Wind.Speed.Metric.Value; // Wind speed
    const humidity = weatherData.RelativeHumidity; // Humidity

    // Display weather info
    weatherInfoElement.innerHTML = `
        <h2 style="text-align: center;">${location}</h2>
        <p style="font-size: 20px;">Temperature: ${temperature}°C</p>
        <p>Weather: ${weatherDescription}</p>
        <p>Wind Speed: ${windSpeed} km/h</p>
        <p>Humidity: ${humidity}%</p>
    `;

    // Send data to CleverTap
    clevertap.event.push("Weather Check", {
        "Location": location,
        "Weather Description": weatherDescription,
        "Is Cloudy": weatherDescription.includes('Cloud') // Boolean: whether it's cloudy or not
    });

    // Handle weather animation (optional)
    const weatherAnimationElement = document.getElementById('weatherAnimation');
    weatherAnimationElement.className = '';

    if (weatherDescription.includes('Cloud')) {
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
            const locationKey = await getLocationKey(location); // Get location key
            const weatherData = await getWeatherData(locationKey); // Get weather data
            showWeatherInfo(weatherData, location); // Show weather info
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
