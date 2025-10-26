// ========================================
// PART 5: MAP CORE MODULE
// ========================================

let map;
let coneMarkers = [];
let workZones = [];
let currentLocationMarker = null;
let drawControl = null;
let drawnItems = null;

function initMap() {
    // Initialize map
    map = L.map('map', {
        center: [39.8283, -98.5795], // Center of USA
        zoom: 4,
        zoomControl: true
    });
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    // Initialize drawn items layer
    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);
    
    // Initialize draw control
    drawControl = new L.Control.Draw({
        position: 'topright',
        draw: {
            polyline: {
                shapeOptions: {
                    color: '#ff6b6b',
                    weight: 3
                },
                metric: false,
                feet: true
            },
            polygon: {
                shapeOptions: {
                    color: '#ff6b6b',
                    fillColor: '#ff6b6b',
                    fillOpacity: 0.3
                }
            },
            rectangle: false,
            circle: false,
            circlemarker: false,
            marker: false
        },
        edit: {
            featureGroup: drawnItems,
            remove: true
        }
    });
    
    map.addControl(drawControl);
    
    // Handle drawing completion
    map.on(L.Draw.Event.CREATED, function(e) {
        const type = e.layerType;
        const layer = e.layer;
        
        if (type === 'polyline') {
            handleLineDrawing(layer);
        } else if (type === 'polygon') {
            workZones.push(layer);
            drawnItems.addLayer(layer);
            saveToLocalStorage();
        }
        
        updateStats();
    });
    
    // Handle editing
    map.on(L.Draw.Event.EDITED, function(e) {
        saveToLocalStorage();
    });
    
    // Handle deletion
    map.on(L.Draw.Event.DELETED, function(e) {
        const layers = e.layers;
        layers.eachLayer(function(layer) {
            // Remove from cones array
            const index = coneMarkers.indexOf(layer);
            if (index > -1) {
                coneMarkers.splice(index, 1);
            }
            
            // Remove from work zones array
            const zoneIndex = workZones.indexOf(layer);
            if (zoneIndex > -1) {
                workZones.splice(zoneIndex, 1);
            }
        });
        
        updateStats();
        saveToLocalStorage();
    });
    
    // Click to place cone
    map.on('click', function(e) {
        if (document.getElementById('placeConeMode')?.checked) {
            placeConeMarker(e);
        }
    });
    
    console.log('Map initialized');
}

function handleLineDrawing(layer) {
    const latlngs = layer.getLatLngs();
    const speed = parseInt(document.getElementById('workZoneSpeed')?.value || 45);
    const zoneType = document.getElementById('zoneType')?.value || 'highway';
    
    const spacing = calculateMUTCDSpacing(speed, zoneType);
    const spacingFt = spacing.taperSpacing;
    
    // Calculate total line length
    let totalDistance = 0;
    for (let i = 0; i < latlngs.length - 1; i++) {
        totalDistance += latlngs[i].distanceTo(latlngs[i + 1]);
    }
    
    // Convert meters to feet
    const totalDistanceFt = totalDistance * 3.28084;
    
    // Calculate number of cones needed
    const numCones = Math.ceil(totalDistanceFt / spacingFt);
    
    // Place cones along the line
    for (let i = 0; i <= numCones; i++) {
        const fraction = i / numCones;
        const point = getPointAlongLine(latlngs, fraction);
        
        if (point) {
            const marker = L.marker(point, {
                icon: L.divIcon({
                    className: 'cone-marker',
                    html: '<div style="background: orange; width: 20px; height: 20px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
                    iconSize: [20, 20],
                    iconAnchor: [10, 10]
                }),
                draggable: true
            }).addTo(map);
            
            marker.on('dragend', saveToLocalStorage);
            coneMarkers.push(marker);
        }
    }
    
    // Don't add the line itself to the map
    updateStats();
    saveToLocalStorage();
    
    showNotification(`Placed ${numCones + 1} cones along line (${spacingFt}ft spacing)`, 'success');
}

function getPointAlongLine(latlngs, fraction) {
    if (fraction === 0) return latlngs[0];
    if (fraction === 1) return latlngs[latlngs.length - 1];
    
    // Calculate total line length
    let totalDistance = 0;
    const segments = [];
    
    for (let i = 0; i < latlngs.length - 1; i++) {
        const segmentDist = latlngs[i].distanceTo(latlngs[i + 1]);
        segments.push({
            start: latlngs[i],
            end: latlngs[i + 1],
            distance: segmentDist
        });
        totalDistance += segmentDist;
    }
    
    // Find target distance
    const targetDistance = totalDistance * fraction;
    
    // Find which segment contains the target point
    let accumulatedDistance = 0;
    for (let segment of segments) {
        if (accumulatedDistance + segment.distance >= targetDistance) {
            const distanceIntoSegment = targetDistance - accumulatedDistance;
            const segmentFraction = distanceIntoSegment / segment.distance;
            
            const lat = segment.start.lat + (segment.end.lat - segment.start.lat) * segmentFraction;
            const lng = segment.start.lng + (segment.end.lng - segment.start.lng) * segmentFraction;
            
            return L.latLng(lat, lng);
        }
        accumulatedDistance += segment.distance;
    }
    
    return latlngs[latlngs.length - 1];
}

function placeConeMarker(e) {
    const marker = L.marker(e.latlng, {
        icon: L.divIcon({
            className: 'cone-marker',
            html: '<div style="background: orange; width: 20px; height: 20px; border-radius: 50%; border: 2px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
        }),
        draggable: true
    }).addTo(map);
    
    marker.on('dragend', saveToLocalStorage);
    marker.on('click', function() {
        if (confirm('Remove this cone?')) {
            map.removeLayer(marker);
            const index = coneMarkers.indexOf(marker);
            if (index > -1) {
                coneMarkers.splice(index, 1);
            }
            updateStats();
            saveToLocalStorage();
        }
    });
    
    coneMarkers.push(marker);
    updateStats();
    saveToLocalStorage();
}

async function searchAddress() {
    const address = document.getElementById('addressInput')?.value;
    if (!address) {
        showNotification('Please enter an address', 'warning');
        return;
    }
    
    showNotification('Searching...', 'info');
    
    try {
        // Use Nominatim (OpenStreetMap) geocoding API
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'WorkZonePlanner/1.0'
            }
        });
        
        if (!response.ok) {
            throw new Error('Search failed');
        }
        
        const results = await response.json();
        
        if (results.length === 0) {
            showNotification('Address not found', 'error');
            return;
        }
        
        const result = results[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        // Zoom to location
        map.setView([lat, lng], 16);
        
        // Add temporary marker
        if (currentLocationMarker) {
            map.removeLayer(currentLocationMarker);
        }
        
        currentLocationMarker = L.marker([lat, lng], {
            icon: L.divIcon({
                className: 'location-marker',
                html: '<div style="background: #3b82f6; width: 30px; height: 30px; border-radius: 50%; border: 3px solid #fff; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            })
        }).addTo(map);
        
        currentLocationMarker.bindPopup(result.display_name).openPopup();
        
        // Fetch weather for this location
        if (typeof fetchWeather === 'function') {
            fetchWeather(lat, lng);
        }
        
        showNotification('Location found!', 'success');
    } catch (error) {
        console.error('Search error:', error);
        showNotification('Search failed - please try again', 'error');
    }
}

function centerOnLocation(lat, lng, zoom = 16) {
    map.setView([lat, lng], zoom);
}

function addWorkZone(latlngs) {
    const polygon = L.polygon(latlngs, {
        color: '#ff6b6b',
        fillColor: '#ff6b6b',
        fillOpacity: 0.3,
        weight: 2
    }).addTo(map);
    
    workZones.push(polygon);
    drawnItems.addLayer(polygon);
    updateStats();
    saveToLocalStorage();
}
