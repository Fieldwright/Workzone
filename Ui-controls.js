/****************************************
 * PART 9 - UI CONTROLS & EVENT HANDLERS
 * START
 * 
 * User interface controls:
 * - Button click handlers
 * - Address/location search
 * - Phase management (create, load, edit, delete)
 * - Material tracking and calculations
 * - Traffic flow calculator
 * - Modal window controls
 * - Input field handlers
 * - Measure tool
 * - Print/report generation
 ****************************************/

        a: parseFloat(ll.lat.toFixed(6)),
        o: parseFloat(ll.lng.toFixed(6)),
        p: false
      });
    }
  });
  
  let polylineCoords = null;
  if (line){
    const gj = line.toGeoJSON();
    polylineCoords = gj.geometry.coordinates.map(c => [
      parseFloat(c[0].toFixed(6)),
      parseFloat(c[1].toFixed(6))
    ]);
  }
  
  return {
    p: document.getElementById('projectName').value || 'Work Zone',
    s: speedEl.value,
    d: devices,
    l: polylineCoords
  };
}

function generateQRCode(){
  const qrContainer = document.getElementById('qrcode');
  qrContainer.innerHTML = '';
  
  if (coneLayer.getLayers().length === 0 && signLayer.getLayers().length === 0){
    qrContainer.innerHTML = '<div style="color:#666;font-size:12px">No devices to display. Place cones and signs first.</div>';
    return;
  }
  
  // Check if QRious library is loaded
  if (typeof QRious === 'undefined'){
    qrContainer.innerHTML = '<div style="color:#ef4444">QR Code library not loaded. Please refresh the page.</div>';
    console.error('QRious library not loaded');
    return;
  }
  
  const data = serializeWorkZone();
  const json = JSON.stringify(data);
  const encoded = toUrlSafeBase64(json);
  
  const baseUrl = window.location.href.split('#')[0].split('?')[0];
  const fieldUrl = `${baseUrl}?field=${encoded}`;
  
  console.log('QR URL length:', fieldUrl.length);
  console.log('QR URL:', fieldUrl.substring(0, 100) + '...');
  
  try {
    // Create QR code using QRious with higher error correction for better scanning
    const qr = new QRious({
      value: fieldUrl,
      size: 300,
      level: 'H',
      background: 'white',
      foreground: 'black'
    });
    
    // Append the canvas
    qrContainer.appendChild(qr.canvas);
    qr.canvas.style.display = 'block';
    qr.canvas.style.margin = '0 auto';
    qr.canvas.style.border = '20px solid white';
    qr.canvas.style.background = 'white';
    qr.canvas.style.maxWidth = '100%';
    qr.canvas.style.height = 'auto';
    
  } catch(e){
    console.error('QR code generation error:', e);
    qrContainer.innerHTML = `<div style="color:#ef4444">Error generating QR code: ${e.message}</div>`;
  }
  
  // Also display the URL for manual entry with copy button
  const urlDisplay = document.createElement('div');
  urlDisplay.className = 'qr-url-display';
  urlDisplay.style.cssText = 'margin-top:10px;padding:8px;background:#1e293b;border-radius:6px;word-break:break-all;font-size:10px;font-family:monospace;color:#60a5fa;max-height:100px;overflow-y:auto;cursor:pointer';
  urlDisplay.textContent = fieldUrl;
  urlDisplay.title = 'Click to copy URL';
  urlDisplay.addEventListener('click', () => {
    navigator.clipboard.writeText(fieldUrl).then(() => {
      const originalText = urlDisplay.textContent;
      urlDisplay.textContent = '✓ Copied!';
      setTimeout(() => urlDisplay.textContent = originalText, 2000);
    });
  });
  qrContainer.appendChild(urlDisplay);
}

function generateScreenshots(){
  // Get all objects (cones and signs)
  const allObjects = [];
  
  coneLayer.eachLayer(layer => {
    if (layer.getLatLng) {
      allObjects.push(layer.getLatLng());
    }
  });
  
  signLayer.eachLayer(layer => {
    if (layer.getLatLng) {
      allObjects.push(layer.getLatLng());
    }
  });
  
  if (allObjects.length < 2) {
    document.getElementById('screenshot1').style.display = 'none';
    document.getElementById('screenshot2').style.display = 'none';
    return;
  }
  
  // Store original map view to restore later
  const originalZoom = map.getZoom();
  const originalCenter = map.getCenter();
  
  // Calculate midpoint between two farthest objects
  let maxDistance = 0;
  let farthest1 = null;
  let farthest2 = null;
  
  for (let i = 0; i < allObjects.length; i++) {
    for (let j = i + 1; j < allObjects.length; j++) {
      const distance = allObjects[i].distanceTo(allObjects[j]);
      if (distance > maxDistance) {
        maxDistance = distance;
        farthest1 = allObjects[i];
        farthest2 = allObjects[j];
      }
    }
  }
  
  // Screenshot 1: Midpoint between farthest objects
  if (farthest1 && farthest2) {
    const midLat = (farthest1.lat + farthest2.lat) / 2;
    const midLng = (farthest1.lng + farthest2.lng) / 2;
    const midpoint = L.latLng(midLat, midLng);
    
    // Calculate zoom to show both farthest points nicely
    const bounds = L.latLngBounds([farthest1, farthest2]);
    const zoom = map.getBoundsZoom(bounds.pad(0.4));
    
    // Set view and capture
    map.setView(midpoint, zoom);
    
    setTimeout(() => {
      captureMapToImage('screenshot1', () => {
        // Screenshot 2: Full work zone view
        captureFullWorkZoneView(originalCenter, originalZoom);
      });
    }, 800);
  }
}

function captureFullWorkZoneView(originalCenter, originalZoom) {
  // Get all cones to find the full extent
  const allCoords = [];
  
  coneLayer.eachLayer(layer => {
    if (layer.getLatLng) {
      allCoords.push(layer.getLatLng());
    }
  });
  
  signLayer.eachLayer(layer => {
    if (layer.getLatLng) {
      allCoords.push(layer.getLatLng());
    }
  });
  
  if (line) {
    line.getLatLngs().forEach(coord => allCoords.push(coord));
  }
  
  if (allCoords.length > 1) {
    const fullBounds = L.latLngBounds(allCoords);
    map.fitBounds(fullBounds.pad(0.3));
    
    setTimeout(() => {
      captureMapToImage('screenshot2', () => {
        // Restore original view
        setTimeout(() => {
          map.setView(originalCenter, originalZoom);
        }, 300);
      });
    }, 800);
  } else {
    // Restore original view if no coordinates
    map.setView(originalCenter, originalZoom);
  }
}

function captureMapToImage(targetId, callback){
  const imgElement = document.getElementById(targetId);
  
  if (!imgElement) {
    console.error('Image element not found:', targetId);
    if (callback) callback();
    return;
  }
  
  // Check if domtoimage is available
  if (typeof domtoimage === 'undefined') {
    console.error('dom-to-image library not loaded');
    imgElement.style.display = 'none';
    if (callback) callback();
    return;
  }
  
  const mapContainer = document.getElementById('map');
  
  // Capture the map using dom-to-image
  domtoimage.toPng(mapContainer, {
    quality: 0.95,
    width: mapContainer.offsetWidth,
    height: mapContainer.offsetHeight,
    style: {
      transform: 'scale(1)',
      transformOrigin: 'top left'
    }
  })
  .then(function (dataUrl) {
    imgElement.src = dataUrl;
    imgElement.style.display = 'block';
    console.log('Screenshot captured for', targetId);
    if (callback) callback();
  })
  .catch(function (error) {
    console.error('Screenshot capture failed:', error);
    imgElement.style.display = 'none';
    if (callback) callback();
  });
}

function showQRPreview(){
  if (coneLayer.getLayers().length === 0 && signLayer.getLayers().length === 0){
    alert('Please place some cones and signs first before generating the QR code.');
    return;
  }
  
  if (typeof QRious === 'undefined'){
    alert('QR Code library failed to load. Please refresh the page and try again.');
    console.error('QRious library not loaded');
    return;
  }
  
  const modal = document.getElementById('qrModal');
  const qrContainer = document.getElementById('qrPreview');
  qrContainer.innerHTML = '';
  
  const data = serializeWorkZone();
  const json = JSON.stringify(data);
  const encoded = toUrlSafeBase64(json);
  const baseUrl = window.location.href.split('#')[0].split('?')[0];
  const fieldUrl = `${baseUrl}?field=${encoded}`;
  
  console.log('Preview QR URL length:', fieldUrl.length);
  console.log('Data size:', json.length, 'bytes');
  
  try {
    const qr = new QRious({
      value: fieldUrl,
      size: 256,
      level: 'H',
      background: 'white',
      foreground: 'black'
    });
    
    qrContainer.appendChild(qr.canvas);
    qr.canvas.style.display = 'block';
    qr.canvas.style.margin = '0 auto';
    qr.canvas.style.border = '10px solid white';
    
    // Add copy button
    const copyBtn = document.createElement('button');
    copyBtn.textContent = '📋 Copy URL';
    copyBtn.style.cssText = 'margin-top:12px;width:100%;padding:8px;background:var(--accent);border:none;border-radius:8px;font-weight:bold;cursor:pointer;font-size:13px';
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(fieldUrl).then(() => {
        copyBtn.textContent = '✓ Copied!';
        setTimeout(() => copyBtn.textContent = '📋 Copy URL', 2000);
      });
    };
    qrContainer.appendChild(copyBtn);
    
    modal.classList.add('active');
  } catch(e){
    console.error('QR code generation error:', e);
    alert('Error generating QR code: ' + e.message);
  }
}

document.getElementById('btnCloseModal').addEventListener('click', () => {
  document.getElementById('qrModal').classList.remove('active');
});

document.getElementById('qrModal').addEventListener('click', (e) => {
  if (e.target.id === 'qrModal'){
    document.getElementById('qrModal').classList.remove('active');
  }
});

[spacingEl, bufferSpacingEl, scaleEl, stationStepEl].forEach(el => el.addEventListener('input', updateStats));

// FIELD VIEW CODE
let fieldMap = null;
let fieldDevices = [];
let currentDeviceIndex = 0;
let userMarker = null;
let gpsWatchId = null;
let guidanceLine = null;
let userHeading = 0;
let lastArrivalAlert = 0;
let activeFilter = 'all';
let audioContext = null;
let arActive = false;
let arStream = null;
let arUpdateInterval = null;
let deviceOrientation = 0;
let devicePitch = 0;
let deviceRoll = 0;

function initAudio(){
  if (!audioContext){
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch(e){
      console.log('Web Audio API not supported');
    }
  }
}

function playArrivalSound(){
  if (!audioContext) return;
  
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.type = 'sine';
  
  oscillator.frequency.setValueAtTime(800, now);
  oscillator.frequency.setValueAtTime(1000, now + 0.15);
  oscillator.frequency.setValueAtTime(1200, now + 0.3);
  
  gainNode.gain.setValueAtTime(0.3, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
  
  oscillator.start(now);
  oscillator.stop(now + 0.5);
}

function playSuccessSound(){
  if (!audioContext) return;
  
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(600, now);
  oscillator.frequency.exponentialRampToValueAtTime(800, now + 0.2);
  
  gainNode.gain.setValueAtTime(0.3, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
  
  oscillator.start(now);
  oscillator.stop(now + 0.3);
}

function playCompletionSound(){
  if (!audioContext) return;
  
  const now = audioContext.currentTime;
  
  [600, 800, 1000].forEach((freq, i) => {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, now);
    
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
    
    oscillator.start(now + i * 0.1);
    oscillator.stop(now + 0.8);
  });
}

function checkFieldViewMode(){
  // Check for query parameter (new method - better for iPhone)
  const urlParams = new URLSearchParams(window.location.search);
  const fieldParam = urlParams.get('field');
  
  if (fieldParam) {
    try {
      const decoded = fromUrlSafeBase64(fieldParam);
      const fieldData = JSON.parse(decoded);
      console.log('Loading field view from query parameter');
      initFieldView(fieldData);
      return true;
    } catch(e) {
      console.error('Error loading field data from query param:', e);
      alert('Error loading field setup. The QR code may be invalid or corrupted. Error: ' + e.message);
    }
  }
  
  // Fallback to hash method (old method for backwards compatibility)
  const hash = window.location.hash;
  if (hash.startsWith('#field=')){
    try {
      const data = hash.substring(7);
      const decoded = fromUrlSafeBase64(data);
      const fieldData = JSON.parse(decoded);
      console.log('Loading field view from hash (legacy)');
      initFieldView(fieldData);
      return true;
    } catch(e){
      console.error('Error loading field data from hash:', e);
      alert('Error loading field setup. The QR code may be invalid or corrupted. Error: ' + e.message);
    }
  }
  return false;
}

function initFieldView(data){
  console.log('Initializing field view with data:', data);
  
  document.getElementById('fieldView').classList.add('active');
  document.getElementById('app').style.display = 'none';
  
  const projectName = data.p || data.project || 'Work Zone';
  const location = data.location || '';
  const dateStr = data.date || '';
  const speed = data.s || data.speed || '35';
  const devices = data.d || data.devices || [];
  
  console.log(`Field view loaded: ${devices.length} devices`);
  
  document.getElementById('fieldProjectName').textContent = projectName;
  
  const totalDevices = devices.length;
  const placedDevices = devices.filter(d => d.p || d.placed).length;
  const progressPercent = totalDevices > 0 ? Math.round((placedDevices / totalDevices) * 100) : 0;
  
  document.getElementById('fieldProjectInfo').innerHTML = `
    ${location ? location + ' • ' : ''}
    ${dateStr ? dateStr + ' • ' : ''}
    Speed: ${speed} mph • 
    <strong>${totalDevices} devices</strong> • 
    <span style="color:var(--success)">${placedDevices} placed (${progressPercent}%)</span>
  `;
  
  if (totalDevices === 0) {
    alert('Warning: No devices found in this work zone plan. Please check the QR code or share link.');
    return;
  }
  
  fieldDevices = devices;
  
  initAudio();
  
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-filter');
      updateDeviceVisibility();
      updateFilterInfo();
      focusNextVisibleDevice();
    });
  });
  
  setTimeout(() => {
    fieldMap = L.map('fieldViewMap', {
      minZoom: 10,
      maxZoom: 22,
      zoomControl: true
    }).setView([39.5, -98.35], 5);
    
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles © Esri',
      maxZoom: 22
    }).addTo(fieldMap);
    
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
      attribution: '',
      maxZoom: 22
    }).addTo(fieldMap);
    
    const polyline = data.l || data.polyline;

/****************************************
 * PART 9 - UI CONTROLS & EVENT HANDLERS
 * END
 ****************************************/
