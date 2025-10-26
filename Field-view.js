// ========================================
// PART 11: FIELD VIEW MODULE
// ========================================

let fieldViewMode = false;
let arMode = false;

function checkFieldViewMode() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isSmallScreen = window.innerWidth < 768;
    return isMobile || isSmallScreen;
}

function toggleFieldView() {
    fieldViewMode = !fieldViewMode;
    isFieldMode = fieldViewMode;
    
    const fieldModeBtn = document.getElementById('fieldModeBtn');
    const controlPanel = document.getElementById('controlPanel');
    const map = document.getElementById('map');
    
    if (fieldViewMode) {
        // Enter field mode
        if (fieldModeBtn) {
            fieldModeBtn.textContent = '🖥️ Desktop Mode';
            fieldModeBtn.style.background = '#ef4444';
        }
        
        if (controlPanel) {
            controlPanel.style.display = 'none';
        }
        
        if (map) {
            map.style.height = '100vh';
            map.style.width = '100vw';
        }
        
        // Enable AR if available
        if ('geolocation' in navigator) {
            startGPS();
        }
        
        showNotification('Field Mode activated', 'success');
    } else {
        // Exit field mode
        if (fieldModeBtn) {
            fieldModeBtn.textContent = '📱 Field Mode';
            fieldModeBtn.style.background = '#3b82f6';
        }
        
        if (controlPanel) {
            controlPanel.style.display = 'block';
        }
        
        if (map) {
            map.style.height = 'calc(100vh - 60px)';
            map.style.width = 'calc(100% - 320px)';
        }
        
        showNotification('Desktop Mode activated', 'success');
    }
    
    // Refresh map
    if (window.map) {
        window.map.invalidateSize();
    }
}

function enableARMode() {
    if (!navigator.geolocation) {
        showNotification('Geolocation not available', 'error');
        return;
    }
    
    arMode = true;
    fieldViewMode = true;
    
    // Request device orientation permission on iOS
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof DeviceOrientationEvent.requestPermission === 'function') {
        DeviceOrientationEvent.requestPermission()
            .then(permissionState => {
                if (permissionState === 'granted') {
                    window.addEventListener('deviceorientation', handleOrientation);
                }
            })
            .catch(console.error);
    } else {
        window.addEventListener('deviceorientation', handleOrientation);
    }
    
    showNotification('AR Mode enabled - point device at ground', 'success');
}

function handleOrientation(event) {
    if (!arMode) return;
    
    const alpha = event.alpha; // Z-axis rotation (compass)
    const beta = event.beta;   // X-axis rotation (front-to-back tilt)
    const gamma = event.gamma; // Y-axis rotation (left-to-right tilt)
    
    // Update map rotation based on device orientation
    if (window.map && alpha !== null) {
        map.setBearing(alpha);
    }
}

function disableARMode() {
    arMode = false;
    window.removeEventListener('deviceorientation', handleOrientation);
    showNotification('AR Mode disabled', 'info');
}

// Initialize field view check on load
window.addEventListener('load', function() {
    if (checkFieldViewMode()) {
        const fieldModeBtn = document.getElementById('fieldModeBtn');
        if (fieldModeBtn) {
            fieldModeBtn.style.display = 'block';
        }
    }
});
