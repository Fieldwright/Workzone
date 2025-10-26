// ========================================
// PART 6: WEATHER MODULE
// ========================================

let currentWeatherData = null;

async function fetchWeather(lat, lng) {
    const apiKey = '95c03627df054baa8bb200222252210';
    const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lng}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Weather fetch failed');
        
        currentWeatherData = await response.json();
        updateWeatherDisplay();
        return currentWeatherData;
    } catch (error) {
        console.error('Weather error:', error);
        showNotification('Weather unavailable - check connection', 'warning');
        return null;
    }
}

function updateWeatherDisplay() {
    if (!currentWeatherData) return;
    
    const { current, location } = currentWeatherData;
    const weatherDiv = document.getElementById('weatherInfo');
    
    if (!weatherDiv) return;
    
    const tempF = Math.round(current.temp_f);
    const windMph = Math.round(current.wind_mph);
    const condition = current.condition.text;
    const icon = current.condition.icon;
    
    weatherDiv.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <img src="https:${icon}" alt="${condition}" style="width: 40px; height: 40px;">
            <div>
                <div style="font-weight: 600; font-size: 1.1em;">${tempF}°F</div>
                <div style="font-size: 0.85em; color: #666;">${condition}</div>
                <div style="font-size: 0.85em; color: #666;">Wind: ${windMph} mph ${current.wind_dir}</div>
            </div>
        </div>
    `;
}

function getWeatherWarnings() {
    if (!currentWeatherData) return [];
    
    const { current } = currentWeatherData;
    const warnings = [];
    
    if (current.temp_f < 32) {
        warnings.push('⚠️ Freezing conditions - check cone stability');
    }
    if (current.temp_f > 95) {
        warnings.push('⚠️ Extreme heat - ensure crew hydration');
    }
    if (current.wind_mph > 25) {
        warnings.push('⚠️ High winds - secure all equipment');
    }
    if (current.precip_in > 0) {
        warnings.push('⚠️ Precipitation - reduced visibility');
    }
    if (current.vis_miles < 0.5) {
        warnings.push('⚠️ Poor visibility - use extra caution');
    }
    
    return warnings;
}
