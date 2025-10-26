// ========================================
// PART 10: DATA PERSISTENCE MODULE
// ========================================

function saveToLocalStorage() {
    try {
        const data = {
            cones: coneMarkers.map(marker => ({
                lat: marker.getLatLng().lat,
                lng: marker.getLatLng().lng
            })),
            workZones: workZones.map(zone => ({
                latlngs: zone.getLatLngs()[0].map(ll => ({
                    lat: ll.lat,
                    lng: ll.lng
                }))
            })),
            settings: {
                speed: document.getElementById('workZoneSpeed')?.value || 45,
                zoneType: document.getElementById('zoneType')?.value || 'highway'
            },
            deviceInfo: getDeviceInfo(),
            timestamp: Date.now()
        };
        
        localStorage.setItem('workZoneData', JSON.stringify(data));
    } catch (error) {
        console.error('Error saving data:', error);
        showNotification('Error saving data', 'error');
    }
}

function loadFromLocalStorage() {
    try {
        const dataStr = localStorage.getItem('workZoneData');
        if (!dataStr) return;
        
        const data = JSON.parse(dataStr);
        
        // Restore cones
        if (data.cones) {
            data.cones.forEach(cone => {
                placeConeMarker({ latlng: L.latLng(cone.lat, cone.lng) });
            });
        }
        
        // Restore work zones
        if (data.workZones) {
            data.workZones.forEach(zone => {
                const latlngs = zone.latlngs.map(ll => L.latLng(ll.lat, ll.lng));
                const polygon = L.polygon(latlngs, {
                    color: '#ff6b6b',
                    fillColor: '#ff6b6b',
                    fillOpacity: 0.3,
                    weight: 2
                }).addTo(map);
                workZones.push(polygon);
            });
        }
        
        // Restore settings
        if (data.settings) {
            const speedInput = document.getElementById('workZoneSpeed');
            const zoneTypeSelect = document.getElementById('zoneType');
            
            if (speedInput) speedInput.value = data.settings.speed;
            if (zoneTypeSelect) zoneTypeSelect.value = data.settings.zoneType;
            
            updateCalculationDisplay(data.settings.speed, data.settings.zoneType, null);
        }
        
        updateStats();
        showNotification('Previous session restored', 'success');
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function clearLocalStorage() {
    if (!confirm('Clear all saved data?')) return;
    
    localStorage.removeItem('workZoneData');
    showNotification('Saved data cleared', 'success');
}

// Auto-save every 30 seconds
setInterval(saveToLocalStorage, 30000);

// Save before page unload
window.addEventListener('beforeunload', saveToLocalStorage);
