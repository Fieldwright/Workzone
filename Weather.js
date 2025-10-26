/****************************************
 * PART 6 - WEATHER INTEGRATION
 * START
 * 
 * Weather functionality:
 * - Current weather data storage
 * - Fetch weather from Open-Meteo API
 * - Update weather display widget
 * - Weather code to icon/description mapping
 * - Wind speed warnings
 ****************************************/

let currentWeatherData = null;

let currentWeatherData = null;

async function fetchWeather(lat, lng) {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weathercode,windspeed_10m&temperature_unit=fahrenheit&windspeed_unit=mph&timezone=auto`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data.current) {
      currentWeatherData = data.current;
      updateWeatherDisplay(data.current);
    }
  } catch (error) {
    console.error('Weather fetch error:', error);
  }
}

function updateWeatherDisplay(weather) {
  const widget = document.getElementById('weatherWidget');
  widget.style.display = 'flex';
  
  const temp = Math.round(weather.temperature_2m);
  const windSpeed = Math.round(weather.windspeed_10m);
  const code = weather.weathercode;
  
  const weatherInfo = getWeatherInfo(code);
  
  document.getElementById('weatherIcon').textContent = weatherInfo.icon;
  document.getElementById('weatherTemp').textContent = `${temp}°F`;
  document.getElementById('weatherDesc').textContent = weatherInfo.description;
  document.getElementById('weatherWind').textContent = `Wind: ${windSpeed} mph`;
  
  if (windSpeed > 25 || code > 80) {
    document.getElementById('weatherDesc').innerHTML += ' <span style="color:var(--warn)">⚠️ Caution</span>';
  }
}

function getWeatherInfo(code) {
  if (code === 0) return { icon: '☀️', description: 'Clear sky' };
  if (code <= 3) return { icon: '⛅', description: 'Partly cloudy' };
  if (code <= 48) return { icon: '🌫️', description: 'Foggy' };
  if (code <= 67) return { icon: '🌧️', description: 'Rainy' };
  if (code <= 77) return { icon: '🌨️', description: 'Snowy' };
  if (code <= 82) return { icon: '🌧️', description: 'Rain showers' };
  if (code <= 86) return { icon: '🌨️', description: 'Snow showers' };
  if (code <= 99) return { icon: '⛈️', description: 'Thunderstorm' };
  return { icon: '🌤️', description: 'Variable' };
}

/****************************************
 * PART 6 - WEATHER INTEGRATION
 * END
 ****************************************/
