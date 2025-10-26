// ========================================
// PART 12: APP INITIALIZATION MODULE
// ========================================

// Wait for all modules to load
window.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Work Zone Planner...');
    
    // Check if we're in field view mode
    if (typeof checkFieldViewMode === 'function') {
        checkFieldViewMode();
    }
    
    // Initialize device
    if (typeof initializeDevice === 'function') {
        initializeDevice();
    }
    
    // Initialize map
    if (typeof initMap === 'function') {
        initMap();
    }
    
    // Setup UI controls
    if (typeof setupUIControls === 'function') {
        setupUIControls();
    }
    
    // Initialize GPS
    if (typeof initGPS === 'function') {
        initGPS();
    }
    
    // Load saved data
    if (typeof loadFromLocalStorage === 'function') {
        loadFromLocalStorage();
    }
    
    // Initialize calculations
    const speedInput = document.getElementById('workZoneSpeed');
    const zoneTypeSelect = document.getElementById('zoneType');
    if (speedInput && zoneTypeSelect && typeof updateCalculationDisplay === 'function') {
        updateCalculationDisplay(
            parseInt(speedInput.value) || 45,
            zoneTypeSelect.value || 'highway',
            null
        );
    }
    
    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service Worker registered:', reg))
            .catch(err => console.log('Service Worker registration failed:', err));
    }
    
    console.log('Work Zone Planner initialized successfully!');
});

// Handle visibility changes (save data when tab becomes hidden)
document.addEventListener('visibilitychange', function() {
    if (document.hidden && typeof saveToLocalStorage === 'function') {
        saveToLocalStorage();
    }
});

// Handle window resize
window.addEventListener('resize', function() {
    if (window.map) {
        map.invalidateSize();
    }
});
