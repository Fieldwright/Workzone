/****************************************
 * PART 11 - FIELD VIEW (GPS MODE)
 * START
 * 
 * GPS-guided device placement:
 * - Field view mode initialization
 * - GPS location tracking
 * - Distance calculations
 * - Navigation panel updates
 * - Compass/heading display
 * - AR (Augmented Reality) mode
 * - Device placement tracking
 * - Progress monitoring
 * - Filter controls (taper/buffer/signs)
 * - Arrival notifications
 * - Completion celebrations
 ****************************************/

    distEl.textContent = `${Math.round(distFt / 5) * 5} ft`;
  }
  
  const dirText = getDirectionText(bearing, distFt);
  document.getElementById('navDirectionText').textContent = dirText.text;
  document.getElementById('navArrowText').textContent = dirText.arrow;
  
  document.getElementById('navDeviceName').textContent = deviceName;
}

function getDirectionText(bearing, distFt){
  let relativeBearing = bearing - userHeading;
  if (relativeBearing < 0) relativeBearing += 360;
  if (relativeBearing > 360) relativeBearing -= 360;
  
  let cardinalDir = '';
  if (relativeBearing >= 337.5 || relativeBearing < 22.5) cardinalDir = 'ahead';
  else if (relativeBearing >= 22.5 && relativeBearing < 67.5) cardinalDir = 'ahead and right';
  else if (relativeBearing >= 67.5 && relativeBearing < 112.5) cardinalDir = 'to your right';
  else if (relativeBearing >= 112.5 && relativeBearing < 157.5) cardinalDir = 'behind and right';
  else if (relativeBearing >= 157.5 && relativeBearing < 202.5) cardinalDir = 'behind you';
  else if (relativeBearing >= 202.5 && relativeBearing < 247.5) cardinalDir = 'behind and left';
  else if (relativeBearing >= 247.5 && relativeBearing < 292.5) cardinalDir = 'to your left';
  else cardinalDir = 'ahead and left';
  
  let arrow = '⬆️';
  if (relativeBearing >= 22.5 && relativeBearing < 67.5) arrow = '↗️';
  else if (relativeBearing >= 67.5 && relativeBearing < 112.5) arrow = '➡️';
  else if (relativeBearing >= 112.5 && relativeBearing < 157.5) arrow = '↘️';
  else if (relativeBearing >= 157.5 && relativeBearing < 202.5) arrow = '⬇️';
  else if (relativeBearing >= 202.5 && relativeBearing < 247.5) arrow = '↙️';
  else if (relativeBearing >= 247.5 && relativeBearing < 292.5) arrow = '⬅️';
  else if (relativeBearing >= 292.5 && relativeBearing < 337.5) arrow = '↖️';
  
  let text = '';
  if (distFt <= 10) text = 'You have arrived';
  else if (distFt <= 30) text = `${cardinalDir}, ${distFt} feet`;
  else if (distFt <= 100) text = `Continue ${cardinalDir}`;
  else text = `Head ${cardinalDir}`;
  
  return {text, arrow};
}

function updateCompass(bearing){
  const arrow = document.getElementById('compassArrow');
  const rotation = bearing - userHeading;
  arrow.style.transform = `rotate(${rotation}deg)`;
}

function drawGuidanceLine(userCoords, deviceCoords){
  if (guidanceLine){
    fieldMap.removeLayer(guidanceLine);
  }
  
  guidanceLine = L.polyline([userCoords, deviceCoords], {
    color: '#22c55e',
    weight: 3,
    dashArray: '8,8',
    opacity: 0.8,
    className: 'guidance-line'
  }).addTo(fieldMap);
}

function showArrivalNotification(deviceName){
  const banner = document.createElement('div');
  banner.className = 'arrival-banner';
  banner.textContent = `✓ Arrived: ${deviceName}`;
  document.getElementById('fieldViewMap').appendChild(banner);
  
  if (navigator.vibrate){
    navigator.vibrate([200, 100, 200]);
  }
  
  setTimeout(() => banner.remove(), 3000);
}

function handleGPSError(error){
  console.error('GPS error:', error);
  const btn = document.getElementById('btnLocateMe');
  btn.style.background = 'var(--danger)';
  btn.textContent = '⚠️ GPS Error';
  
  setTimeout(() => {
    btn.style.background = '';
    btn.textContent = '📍 Start GPS';
  }, 3000);
}

function handleOrientation(event){
  if (event.alpha !== null){
    userHeading = event.alpha;
    deviceOrientation = event.alpha;
  }
  
  if (event.beta !== null){
    devicePitch = event.beta;
  }
  
  if (event.gamma !== null){
    deviceRoll = event.gamma;
  }
  
  if (event.webkitCompassHeading !== undefined){
    userHeading = event.webkitCompassHeading;
    deviceOrientation = event.webkitCompassHeading;
  }
}

function getDistanceToUser(device){
  if (!userMarker) return '—';
  
  const userLL = userMarker.getLatLng();
  
  const deviceLat = device.a || device.lat;
  const deviceLng = device.o || device.lng;
  
  const devicePt = turf.point([deviceLng, deviceLat]);
  const userPt = turf.point([userLL.lng, userLL.lat]);
  const distM = turf.distance(devicePt, userPt, {units: 'meters'});
  const distFt = Math.round(distM / FT_TO_M);
  
  return distFt.toLocaleString();
}

async function toggleARMode(){
  if (arActive){
    stopARMode();
  } else {
    await startARMode();
  }
}

async function startARMode(){
  if (currentDeviceIndex < 0 || currentDeviceIndex >= fieldDevices.length){
    alert('Please select a device first using "Next Device"');
    return;
  }
  
  const device = fieldDevices[currentDeviceIndex];
  const placed = device.p !== undefined ? device.p : (device.placed || false);
  if (placed){
    alert('This device is already placed. Use "Next Device" to find the next one.');
    return;
  }
  
  if (!userMarker){
    alert('Please start GPS tracking first (📍 Start GPS button)');
    return;
  }
  
  try {
    arStream = await navigator.mediaDevices.getUserMedia({
      video: { 
        facingMode: 'environment',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    });
    
    const video = document.getElementById('arCamera');
    video.srcObject = arStream;
    
    document.getElementById('arView').classList.add('active');
    arActive = true;
    
    if (deviceOrientation === 0 && devicePitch === 0) {
      deviceOrientation = 0;
      devicePitch = 60;
    }
    
    arUpdateInterval = setInterval(updateARDisplay, 100);
    
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function'){
      try {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== 'granted'){
          console.log('Device orientation permission denied');
        }
      } catch (e) {
        console.error('Orientation permission error:', e);
      }
    }
    
    console.log('AR Mode started. Devices:', fieldDevices.length);
    console.log('User location:', userMarker.getLatLng());
    
  } catch (error){
    console.error('Camera access error:', error);
    alert('Could not access camera. Make sure you granted camera permission.');
    stopARMode();
  }
}

function stopARMode(){
  if (arStream){
    arStream.getTracks().forEach(track => track.stop());
    arStream = null;
  }
  
  if (arUpdateInterval){
    clearInterval(arUpdateInterval);
    arUpdateInterval = null;
  }
  
  document.getElementById('arView').classList.remove('active');
  arActive = false;
}

function updateARDisplay(){
  if (!arActive || !userMarker) return;
  
  const userLL = userMarker.getLatLng();
  const userPt = turf.point([userLL.lng, userLL.lat]);
  
  const container = document.getElementById('arDeviceContainer');
  container.innerHTML = '';
  
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  const fovHorizontal = 70;
  const fovVertical = 50;
  
  const eyeHeight = 5;
  
  let devicesRendered = 0;
  
  fieldDevices.forEach((device, idx) => {
    const deviceLat = device.a || device.lat;
    const deviceLng = device.o || device.lng;
    const deviceName = device.n || device.name || 'Device';
    const deviceType = device.t || device.type;
    const placed = device.p !== undefined ? device.p : (device.placed || false);
    
    const devicePt = turf.point([deviceLng, deviceLat]);
    
    const distM = turf.distance(userPt, devicePt, {units: 'meters'});
    const distFt = distM / FT_TO_M;
    
    if (distFt > 200) return;
    
    const bearing = turf.bearing(userPt, devicePt);
    
    let relativeBearing = bearing - deviceOrientation;
    if (relativeBearing < -180) relativeBearing += 360;
    if (relativeBearing > 180) relativeBearing -= 360;
    
    const halfFovH = fovHorizontal / 2;
    if (Math.abs(relativeBearing) > halfFovH) return;
    
    const xPercent = relativeBearing / fovHorizontal;
    const xPos = (screenWidth / 2) + (xPercent * screenWidth);
    
    const pitchDeg = Math.max(30, Math.min(90, devicePitch));
    const distanceToDevice = Math.max(distFt, 1);
    
    const angleToGround = Math.atan(eyeHeight / distanceToDevice) * (180 / Math.PI);
    const cameraLookAngle = 90 - pitchDeg;
    const objectAngleFromCenter = cameraLookAngle - angleToGround;
    const yPercent = objectAngleFromCenter / fovVertical;
    const yPos = (screenHeight / 2) - (yPercent * screenHeight);
    
    if (yPos < -100 || yPos > screenHeight + 100) return;
    
    const baseScale = 1.0;
    const scaleFactor = (100 / Math.max(distFt, 5)) * baseScale;
    const scale = Math.max(0.3, Math.min(scaleFactor, 2.5));
    
    const deviceDiv = document.createElement('div');
    deviceDiv.className = 'ar-device';
    if (idx === currentDeviceIndex) deviceDiv.classList.add('current');
    if (placed) deviceDiv.classList.add('placed');
    
    const isCone = deviceType === 'c' || deviceType === 'cone';
    const isTaper = deviceName.toLowerCase().includes('taper');
    const isBuffer = deviceName.toLowerCase().includes('buffer');
    
    if (isTaper) deviceDiv.classList.add('taper');
    if (isBuffer) deviceDiv.classList.add('buffer');
    
    deviceDiv.style.left = `${xPos}px`;
    deviceDiv.style.top = `${yPos}px`;
    deviceDiv.style.transform = `translate(-50%, -100%) scale(${scale})`;
    deviceDiv.style.zIndex = Math.round(1000 - distFt);
    
    const showDist = distFt >= 5;
    
    if (isCone){
      deviceDiv.innerHTML = `
        <div class="ar-cone-3d">
          <div class="cone-shadow"></div>
          <div class="cone-base-3d"></div>
          <div class="cone-body"></div>
          <div class="cone-stripe"></div>
          ${showDist ? `<div class="ar-device-label">${Math.round(distFt)}ft</div>` : ''}
        </div>
      `;
    } else {
      deviceDiv.innerHTML = `
        <div class="ar-sign-3d">
          <div class="sign-shadow"></div>
          <div class="sign-post"></div>
          <div class="sign-panel">🚸</div>
          ${showDist ? `<div class="ar-device-label">${Math.round(distFt)}ft</div>` : ''}
        </div>
      `;
    }
    
    container.appendChild(deviceDiv);
    devicesRendered++;
  });
  
  const device = fieldDevices[currentDeviceIndex];
  if (!device) return;
  
  const deviceLat = device.a || device.lat;
  const deviceLng = device.o || device.lng;
  
  const devicePt = turf.point([deviceLng, deviceLat]);
  
  const distM = turf.distance(userPt, devicePt, {units: 'meters'});
  const distFt = Math.round(distM / FT_TO_M);
  
  const bearing = turf.bearing(userPt, devicePt);
  
  document.getElementById('arDistance').textContent = `${distFt} ft`;
  
  let relativeBearing = bearing - deviceOrientation;
  if (relativeBearing < -180) relativeBearing += 360;
  if (relativeBearing > 180) relativeBearing -= 360;
  
  const dirText = getARDirectionText(relativeBearing, distFt);
  document.getElementById('arDirection').innerHTML = `${dirText}<br><span style="font-size:10px;opacity:0.7">${devicesRendered} devices visible</span>`;
  
  const arrow = document.getElementById('arArrow');
  arrow.style.transform = `rotate(${relativeBearing}deg)`;
  
  const snapIndicator = document.getElementById('arSnap');
  if (distFt <= 3){
    snapIndicator.style.display = 'block';
    if (navigator.vibrate && distFt <= 2){
      navigator.vibrate(50);
    }
  } else {
    snapIndicator.style.display = 'none';
  }
  
  if (distFt <= 10){
    arrow.style.opacity = '1';
  } else if (distFt <= 30){
    arrow.style.opacity = '0.8';
  } else {
    arrow.style.opacity = '0.6';
  }
  
  if (devicesRendered === 0) {
    console.log('AR Debug: No devices rendered. Total devices:', fieldDevices.length);
    console.log('User position:', userLL.lat, userLL.lng);
    console.log('Device orientation:', deviceOrientation, 'Pitch:', devicePitch);
  }
}

function getARDirectionText(bearing, distFt){
  const absBearing = Math.abs(bearing);
  
  if (distFt <= 3){
    return '✓ Perfect position!';
  } else if (distFt <= 10){
    if (absBearing < 15){
      return 'Straight ahead';
    } else if (bearing > 0){
      return `Turn right ${Math.round(absBearing)}°`;
    } else {
      return `Turn left ${Math.round(absBearing)}°`;
    }
  } else {
    if (absBearing < 20){
      return `Go straight ${distFt} ft`;
    } else if (bearing > 0){
      return `Turn right and go ${distFt} ft`;
    } else {
      return `Turn left and go ${distFt} ft`;
    }
  }
}

function placeFromAR(){
  if (!userMarker) {
    alert('GPS not active. Start GPS tracking first.');
    return;
  }
  
  const device = fieldDevices[currentDeviceIndex];
  if (!device) return;
  
  const deviceLat = device.a || device.lat;
  const deviceLng = device.o || device.lng;
  
  const userLL = userMarker.getLatLng();
  const userPt = turf.point([userLL.lng, userLL.lat]);
  const devicePt = turf.point([deviceLng, deviceLat]);
  
  const distM = turf.distance(userPt, devicePt, {units: 'meters'});
  const distFt = Math.round(distM / FT_TO_M);
  
  if (distFt > 10){
    if (!confirm(`You're ${distFt} ft away from target. Place here anyway?`)){
      return;
    }
  }
  
  markDevicePlaced(currentDeviceIndex);
  
  stopARMode();
}

window.markDevicePlaced = function(idx){
  if (idx >= 0 && idx < fieldDevices.length){
    fieldDevices[idx].p = true;
    fieldDevices[idx].placed = true;
    
    if (fieldDevices[idx]._marker){
      const el = fieldDevices[idx]._marker.getElement();
      if (el){
        const markerDiv = el.querySelector('.field-cone, .field-sign');
        if (markerDiv) markerDiv.classList.add('placed');
      }
      fieldDevices[idx]._marker.closePopup();
    }
    
    const totalDevices = fieldDevices.length;
    const placedDevices = fieldDevices.filter(d => d.p || d.placed).length;
    const progressPercent = Math.round((placedDevices / totalDevices) * 100);
    
    updateNextButton();
    updateFilterInfo();
    
    saveFieldProgress();
    
    playSuccessSound();
    if (navigator.vibrate){
      navigator.vibrate(200);
    }
    
    const deviceName = fieldDevices[idx].n || fieldDevices[idx].name || 'Device';
    showQuickNotification(`✓ ${deviceName} placed! (${progressPercent}% complete)`);
    
    setTimeout(() => {
      const visibleRemaining = fieldDevices.filter(d => {
        const placed = d.p !== undefined ? d.p : (d.placed || false);
        return !placed && isDeviceVisible(d);
      }).length;
      
      const totalRemaining = fieldDevices.filter(d => {
        const placed = d.p !== undefined ? d.p : (d.placed || false);
        return !placed;
      }).length;
      
      if (visibleRemaining > 0){
        nextDevice();
      } else if (totalRemaining > 0){
        const filterName = activeFilter === 'taper' ? 'taper cones' :
                           activeFilter === 'buffer' ? 'buffer cones' : 
                           activeFilter === 'sign' ? 'signs' : 'devices in this category';
        const banner = document.createElement('div');
        banner.className = 'arrival-banner';
        banner.innerHTML = `✓ All ${filterName} placed!<br><span style="font-size:14px">Switch filter for more</span>`;
        document.getElementById('fieldViewMap').appendChild(banner);
        
        playSuccessSound();
        if (navigator.vibrate){
          navigator.vibrate([200, 100, 200]);
        }
        
        setTimeout(() => banner.remove(), 3000);
      } else {
        stopGPSTracking();
        const banner = document.createElement('div');
        banner.className = 'arrival-banner';
        banner.innerHTML = `🎉 Work Zone Complete!<br><span style="font-size:14px">All ${totalDevices} devices placed</span>`;
        document.getElementById('fieldViewMap').appendChild(banner);
        
        playCompletionSound();
        if (navigator.vibrate){
          navigator.vibrate([200, 100, 200, 100, 200]);
        }
        
        setTimeout(() => {
          showConfetti();
        }, 500);
        
        setTimeout(() => banner.remove(), 5000);
      }
    }, 800);
  }
};


/****************************************
 * PART 11 - FIELD VIEW (GPS MODE)
 * END
 ****************************************/
