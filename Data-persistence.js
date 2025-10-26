/****************************************
 * PART 10 - DATA PERSISTENCE
 * START
 * 
 * Save, load, and export functionality:
 * - LocalStorage save/load
 * - Auto-save functionality
 * - Project history management
 * - GeoJSON export
 * - KML export
 * - CSV export
 * - QR code generation
 * - Cloud sync and sharing
 * - URL-based project sharing
 * - Screenshot generation
 ****************************************/

    const polyline = data.l || data.polyline;
    if (polyline){
      const coords = polyline.map(c => [c[1], c[0]]);
      L.polyline(coords, {
        color: '#22d3ee',
        weight: 4,
        opacity: 0.7
      }).addTo(fieldMap);
      
      const bounds = L.latLngBounds(coords);
      fieldMap.fitBounds(bounds, {padding: [50, 50]});
    } else if (devices.length > 0){
      const coords = devices.map(d => {
        const lat = d.a || d.lat;
        const lng = d.o || d.lng;
        return [lat, lng];
      });
      const bounds = L.latLngBounds(coords);
      fieldMap.fitBounds(bounds, {padding: [50, 50]});
    }
    
    devices.forEach((device, idx) => {
      const deviceType = device.t || device.type;
      const deviceName = device.n || device.name || 'Device';
      const lat = device.a || device.lat;
      const lng = device.o || device.lng;
      const placed = device.p !== undefined ? device.p : (device.placed || false);
      
      const isCone = deviceType === 'c' || deviceType === 'cone';
      const isTaper = deviceName.toLowerCase().includes('taper');
      const isBuffer = deviceName.toLowerCase().includes('buffer');
      
      let colorClass = '';
      if (isCone) {
        if (isTaper) colorClass = 'field-taper';
        else if (isBuffer) colorClass = 'field-buffer';
      }
      
      const icon = L.divIcon({
        className: '',
        html: `<div class="${isCone ? 'field-cone' : 'field-sign'} ${colorClass} ${placed ? 'placed' : ''}" data-num="${idx + 1}">
          ${isCone ? '🚧' : '🚸'}
        </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });
      
      const marker = L.marker([lat, lng], {icon});
      
      marker.on('click', () => {
        showDevicePopup(marker, device, idx);
      });
      
      marker.addTo(fieldMap);
      device._marker = marker;
    });
    
    const firstUnplaced = devices.findIndex(d => !(d.p || d.placed));
    if (firstUnplaced >= 0) {
      focusDevice(firstUnplaced);
    } else if (devices.length > 0) {
      focusDevice(0);
    }
    
    updateFilterInfo();
    
    console.log('✓ Field view map initialized successfully');
  }, 100);
  
  document.getElementById('btnLocateMe').addEventListener('click', startGPSTracking);
  document.getElementById('btnARMode').addEventListener('click', toggleARMode);
  document.getElementById('btnNextDevice').addEventListener('click', nextDevice);
  document.getElementById('btnExitField').addEventListener('click', () => {
    stopGPSTracking();
    if (arActive) stopARMode();
    
    saveFieldProgress();
    
    window.location.href = window.location.pathname;
  });
  
  document.getElementById('btnARClose').addEventListener('click', stopARMode);
  document.getElementById('btnARPlace').addEventListener('click', placeFromAR);
  
  if (window.DeviceOrientationEvent){
    window.addEventListener('deviceorientation', handleOrientation);
  }
  
  if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
    console.log('Device orientation permission available');
  }
  
  setInterval(saveFieldProgress, 30000);
}

function saveFieldProgress() {
  const progressData = {
    timestamp: Date.now(),
    devices: fieldDevices.map(d => ({
      lat: d.a || d.lat,
      lng: d.o || d.lng,
      name: d.n || d.name,
      type: d.t || d.type,
      placed: d.p || d.placed || false
    }))
  };
  
  localStorage.setItem('field_progress', JSON.stringify(progressData));
  console.log('Field progress saved');
}

function getDeviceCategory(device){
  const deviceName = device.n || device.name || '';
  const deviceType = device.t || device.type;
  
  if (deviceType === 's' || deviceType === 'sign') return 'sign';
  
  const nameLower = deviceName.toLowerCase();
  if (nameLower.includes('taper')) return 'taper';
  if (nameLower.includes('buffer')) return 'buffer';
  
  return 'cone';
}

function isDeviceVisible(device){
  if (activeFilter === 'all') return true;
  return getDeviceCategory(device) === activeFilter;
}

function updateDeviceVisibility(){
  fieldDevices.forEach(device => {
    if (device._marker){
      const visible = isDeviceVisible(device);
      const el = device._marker.getElement();
      if (el){
        el.style.display = visible ? 'block' : 'none';
      }
    }
  });
}

function updateFilterInfo(){
  const visible = fieldDevices.filter(d => {
    const placed = d.p !== undefined ? d.p : (d.placed || false);
    return isDeviceVisible(d) && !placed;
  }).length;
  
  const totalVisible = fieldDevices.filter(d => isDeviceVisible(d)).length;
  const placedVisible = totalVisible - visible;
  const progressPercent = totalVisible > 0 ? Math.round((placedVisible / totalVisible) * 100) : 0;
  
  const filterName = activeFilter === 'all' ? 'All Devices' : 
                     activeFilter === 'taper' ? 'Taper Cones' :
                     activeFilter === 'buffer' ? 'Buffer Cones' : 'Signs';
  
  const progressBar = totalVisible > 0 ? 
    `<div style="display:inline-block;width:50px;height:8px;background:#374151;border-radius:4px;vertical-align:middle;margin:0 6px;overflow:hidden">
      <div style="width:${progressPercent}%;height:100%;background:var(--success);transition:width 0.3s"></div>
    </div>` : '';
  
  document.getElementById('fieldProjectInfo').innerHTML = 
    document.getElementById('fieldProjectInfo').innerHTML.split('<strong>')[0] + 
    `<strong>${visible} ${filterName} remaining</strong> ${progressBar} ${progressPercent}%`;
}

function focusNextVisibleDevice(){
  for (let i = 0; i < fieldDevices.length; i++){
    const device = fieldDevices[i];
    const placed = device.p !== undefined ? device.p : (device.placed || false);
    if (!placed && isDeviceVisible(device)){
      focusDevice(i);
      return;
    }
  }
  updateNextButton();
}

function showDevicePopup(marker, device, idx){
  const deviceType = device.t || device.type;
  const deviceName = device.n || device.name || 'Device';
  const lat = device.a || device.lat;
  const lng = device.o || device.lng;
  
  const distanceText = userMarker ? 
    `<div style="margin:8px 0;padding:8px;background:rgba(34,197,94,0.1);border-radius:6px;border:1px solid #22c55e">
      <div style="color:var(--success);font-weight:bold">📍 Distance: ${getDistanceToUser(device)} ft</div>
    </div>` : '';
  
  const isCone = deviceType === 'c' || deviceType === 'cone';
  const popup = `
    <div class="device-popup">
      <strong>${isCone ? '🚧 Cone' : '🚸 Sign'}: ${deviceName}</strong>
      <div class="coord">Lat: ${lat.toFixed(6)}<br>Lng: ${lng.toFixed(6)}</div>
      ${distanceText}
      <button onclick="markDevicePlaced(${idx})" style="margin-top:8px;width:100%;padding:8px;background:var(--success);border:none;border-radius:6px;font-weight:bold;cursor:pointer;font-size:13px">
        ✓ Mark as Placed
      </button>
    </div>
  `;
  
  marker.bindPopup(popup, {className: 'dark-popup'}).openPopup();
}

function focusDevice(idx){
  if (idx < 0 || idx >= fieldDevices.length) return;
  
  currentDeviceIndex = idx;
  const device = fieldDevices[idx];
  
  if (device._marker){
    const lat = device.a || device.lat;
    const lng = device.o || device.lng;
    fieldMap.setView([lat, lng], 20, {animate: true});
    showDevicePopup(device._marker, device, idx);
    
    if (gpsWatchId !== null && userMarker){
      const userLL = userMarker.getLatLng();
      updateNavigation(userLL.lat, userLL.lng, 10);
    }
  }
  
  updateNextButton();
}

function nextDevice(){
  let nextIdx = currentDeviceIndex + 1;
  for (let i = 0; i < fieldDevices.length; i++){
    const idx = (nextIdx + i) % fieldDevices.length;
    const device = fieldDevices[idx];
    const placed = device.p !== undefined ? device.p : (device.placed || false);
    
    if (!placed && isDeviceVisible(device)){
      focusDevice(idx);
      
      if (gpsWatchId !== null && userMarker){
        const userLL = userMarker.getLatLng();
        updateNavigation(userLL.lat, userLL.lng, 10);
      }
      return;
    }
  }
  
  const totalRemaining = fieldDevices.filter(d => {
    const placed = d.p !== undefined ? d.p : (d.placed || false);
    return !placed;
  }).length;
  
  if (totalRemaining > 0){
    const filterName = activeFilter === 'taper' ? 'taper cones' :
                       activeFilter === 'buffer' ? 'buffer cones' : 
                       activeFilter === 'sign' ? 'signs' : 'devices';
    alert(`✓ All ${filterName} placed! Switch filter to place remaining devices.`);
  } else {
    stopGPSTracking();
    alert('✓ All devices have been placed! Great work!');
  }
}

function updateNextButton(){
  const remaining = fieldDevices.filter(d => {
    const placed = d.p !== undefined ? d.p : (d.placed || false);
    return !placed && isDeviceVisible(d);
  }).length;
  const btn = document.getElementById('btnNextDevice');
  btn.innerHTML = remaining > 0 ? `→ Next (${remaining} left)` : '✓ All Placed';
}

function startGPSTracking(){
  if (!navigator.geolocation){
    alert('Geolocation is not supported by your device');
    return;
  }
  
  const btn = document.getElementById('btnLocateMe');
  
  if (gpsWatchId !== null){
    stopGPSTracking();
    return;
  }
  
  initAudio();
  
  btn.style.background = 'var(--success)';
  btn.textContent = '📍 GPS Active';
  
  document.getElementById('navPanel').classList.remove('hidden');
  document.getElementById('compassContainer').style.display = 'block';
  
  gpsWatchId = navigator.geolocation.watchPosition(
    updateUserPosition,
    handleGPSError,
    {
      enableHighAccuracy: true,
      maximumAge: 1000,
      timeout: 5000
    }
  );
}

function stopGPSTracking(){
  if (gpsWatchId !== null){
    navigator.geolocation.clearWatch(gpsWatchId);
    gpsWatchId = null;
  }
  
  const btn = document.getElementById('btnLocateMe');
  btn.style.background = '';
  btn.textContent = '📍 Start GPS';
  
  document.getElementById('navPanel').classList.add('hidden');
  document.getElementById('compassContainer').style.display = 'none';
  
  if (guidanceLine){
    fieldMap.removeLayer(guidanceLine);
    guidanceLine = null;
  }
}

function updateUserPosition(position){
  const lat = position.coords.latitude;
  const lng = position.coords.longitude;
  const accuracy = position.coords.accuracy;
  
  if (userMarker){
    userMarker.setLatLng([lat, lng]);
    if (userMarker._circle) userMarker._circle.setLatLng([lat, lng]).setRadius(accuracy);
  } else {
    const circle = L.circle([lat, lng], {
      radius: accuracy,
      color: '#3b82f6',
      fillColor: '#3b82f6',
      fillOpacity: 0.15,
      weight: 1
    }).addTo(fieldMap);
    
    userMarker = L.circleMarker([lat, lng], {
      radius: 10,
      color: '#fff',
      fillColor: '#3b82f6',
      fillOpacity: 1,
      weight: 3
    }).addTo(fieldMap);
    
    userMarker._circle = circle;
    userMarker.bindPopup('📍 Your Location');
    
    fieldMap.setView([lat, lng], 19, {animate: true});
  }
  
  if (currentDeviceIndex >= 0 && currentDeviceIndex < fieldDevices.length){
    updateNavigation(lat, lng, accuracy);
  }
  
  document.getElementById('compassAccuracy').textContent = 
    accuracy < 10 ? 'High accuracy' : 
    accuracy < 30 ? 'Good accuracy' : 
    'Low accuracy';
}

function updateNavigation(userLat, userLng, accuracy){
  const device = fieldDevices[currentDeviceIndex];
  if (!device) return;
  
  const placed = device.p !== undefined ? device.p : (device.placed || false);
  if (placed) return;
  
  const deviceLat = device.a || device.lat;
  const deviceLng = device.o || device.lng;
  const deviceName = device.n || device.name || 'Device';
  
  const userPt = turf.point([userLng, userLat]);
  const devicePt = turf.point([deviceLng, deviceLat]);
  
  const distM = turf.distance(userPt, devicePt, {units: 'meters'});
  const distFt = Math.round(distM / FT_TO_M);
  
  const bearing = turf.bearing(userPt, devicePt);
  
  updateNavigationPanel(distFt, bearing, deviceName);
  
  updateCompass(bearing);
  
  drawGuidanceLine([userLat, userLng], [deviceLat, deviceLng]);
  
  if (distFt <= 10 && Date.now() - lastArrivalAlert > 5000){
    showArrivalNotification(deviceName);
    playArrivalSound();
    lastArrivalAlert = Date.now();
    
    if (device._marker){
      showDevicePopup(device._marker, device, currentDeviceIndex);
    }
  }
}

function updateNavigationPanel(distFt, bearing, deviceName){
  const distEl = document.getElementById('navDistance');
  if (distFt < 100){
    distEl.textContent = `${distFt} ft`;
  } else {
    distEl.textContent = `${Math.round(distFt / 5) * 5} ft`;

/****************************************
 * PART 10 - DATA PERSISTENCE
 * END
 ****************************************/
