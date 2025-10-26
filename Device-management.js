// ========================================
// PART 8: DEVICE MANAGEMENT MODULE
// ========================================

let deviceId = null;
let deviceName = null;
let isFieldMode = false;

function initializeDevice() {
    deviceId = localStorage.getItem('deviceId') || generateDeviceId();
    deviceName = localStorage.getItem('deviceName') || 'Device-' + deviceId.slice(0, 6);
    
    localStorage.setItem('deviceId', deviceId);
    localStorage.setItem('deviceName', deviceName);
    
    updateDeviceDisplay();
}

function generateDeviceId() {
    return 'dev-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

function updateDeviceDisplay() {
    const deviceInfo = document.getElementById('deviceInfo');
    if (deviceInfo) {
        deviceInfo.textContent = deviceName;
    }
}

function setDeviceName(name) {
    deviceName = name;
    localStorage.setItem('deviceName', name);
    updateDeviceDisplay();
}

function getDeviceInfo() {
    return {
        id: deviceId,
        name: deviceName,
        fieldMode: isFieldMode,
        timestamp: Date.now()
    };
}

function exportGeoJSON() {
    const features = [];
    
    // Export cones
    coneMarkers.forEach((marker, index) => {
        features.push({
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates: [marker.getLatLng().lng, marker.getLatLng().lat]
            },
            properties: {
                type: 'cone',
                number: index + 1,
                timestamp: Date.now()
            }
        });
    });
    
    // Export work zones
    workZones.forEach((zone, index) => {
        const coords = zone.getLatLngs()[0].map(ll => [ll.lng, ll.lat]);
        coords.push(coords[0]); // Close the polygon
        
        features.push({
            type: 'Feature',
            geometry: {
                type: 'Polygon',
                coordinates: [coords]
            },
            properties: {
                type: 'workzone',
                number: index + 1,
                timestamp: Date.now()
            }
        });
    });
    
    const geoJSON = {
        type: 'FeatureCollection',
        features: features
    };
    
    const dataStr = JSON.stringify(geoJSON, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/geo+json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `workzone-${Date.now()}.geojson`;
    link.click();
    
    URL.revokeObjectURL(url);
    showNotification('GeoJSON exported successfully!', 'success');
}
