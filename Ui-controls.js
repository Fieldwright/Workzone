// ========================================
// PART 9: UI CONTROLS MODULE
// ========================================

function setupUIControls() {
    // Speed input handler
    const speedInput = document.getElementById('workZoneSpeed');
    if (speedInput) {
        speedInput.addEventListener('input', function() {
            const speed = parseInt(this.value);
            const zoneType = document.getElementById('zoneType')?.value || 'highway';
            updateCalculationDisplay(speed, zoneType, null);
        });
    }
    
    // Zone type handler
    const zoneTypeSelect = document.getElementById('zoneType');
    if (zoneTypeSelect) {
        zoneTypeSelect.addEventListener('change', function() {
            const speed = parseInt(document.getElementById('workZoneSpeed')?.value || 45);
            updateCalculationDisplay(speed, this.value, null);
        });
    }
    
    // Clear all button
    const clearBtn = document.getElementById('clearAll');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAllMarkers);
    }
    
    // Export button
    const exportBtn = document.getElementById('exportData');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportGeoJSON);
    }
    
    // GPS button
    const gpsBtn = document.getElementById('gpsBtn');
    if (gpsBtn) {
        gpsBtn.addEventListener('click', toggleGPS);
    }
    
    // Field mode button
    const fieldModeBtn = document.getElementById('fieldModeBtn');
    if (fieldModeBtn) {
        fieldModeBtn.addEventListener('click', toggleFieldView);
    }
    
    // Address search
    const searchBtn = document.getElementById('searchAddress');
    const addressInput = document.getElementById('addressInput');
    
    if (searchBtn && addressInput) {
        searchBtn.addEventListener('click', searchAddress);
        addressInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchAddress();
            }
        });
    }
}

function togglePanel(panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) return;
    
    if (panel.style.display === 'none') {
        panel.style.display = 'block';
    } else {
        panel.style.display = 'none';
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function clearAllMarkers() {
    if (!confirm('Clear all cones and work zones?')) return;
    
    coneMarkers.forEach(marker => map.removeLayer(marker));
    workZones.forEach(zone => map.removeLayer(zone));
    
    coneMarkers = [];
    workZones = [];
    
    updateStats();
    saveToLocalStorage();
    showNotification('All markers cleared', 'success');
}

function updateStats() {
    const statsDiv = document.getElementById('stats');
    if (!statsDiv) return;
    
    statsDiv.innerHTML = `
        <div><strong>Cones:</strong> ${coneMarkers.length}</div>
        <div><strong>Work Zones:</strong> ${workZones.length}</div>
    `;
}
