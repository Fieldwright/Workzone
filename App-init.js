/****************************************
 * PART 13 - APPLICATION INITIALIZATION
 * START
 * 
 * Startup sequence:
 * - Check if in field view mode
 * - Update initial stats
 * - Update badges
 * - Load project history
 * - Load phases
 * - Load auto-saved data
 * - Check for shared projects
 * - Setup auto-save interval
 * - Request geolocation for weather
 * - Console logging
 ****************************************/

if (!checkFieldViewMode()){
  updateStats();
  updateBadges();
  updateHistoryDisplay();
  loadPhases();
  loadAutoSave();
  checkForSharedProject();
  
  setInterval(autoSave, 30000);
  
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        fetchWeather(position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        console.log('Location permission denied, weather unavailable');
      },
      { timeout: 5000 }
    );
  }
  
  console.log('🚧 Work Zone Planner Pro - Enhanced Edition');
  console.log('✓ Offline support enabled');
  console.log('✓ Dark/Light mode available');
  console.log('✓ Cloud sync & sharing ready');
  console.log('✓ AR Mode with distance markers');
  console.log('✓ Multi-phase planning');
  console.log('✓ Traffic analysis tools');
  console.log('✓ QR Code fixed for iPhone scanning');
  console.log('✓ All features loaded');
}

/****************************************
 * PART 13 - APPLICATION INITIALIZATION
 * END
 ****************************************/
