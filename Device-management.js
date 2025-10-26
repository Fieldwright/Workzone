/****************************************
 * PART 8 - DEVICE MANAGEMENT
 * START
 * 
 * Device placement and management:
 * - Cone marker creation
 * - Sign marker creation
 * - Drag and drop functionality
 * - Device popups and tooltips
 * - Layer management
 * - Clear functions (cones, signs, all)
 * - Device rotation and positioning
 * - Station labels
 * - Arrow boards and special devices
 * - Device counting and tracking
 ****************************************/

      date: document.getElementById('projectDate').value || '',
      speed: speedEl.value
    },
    features
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/geo+json'});
  const a=document.createElement('a'); 
  a.href=URL.createObjectURL(blob); 
  a.download='work_zone.geojson'; 
  a.click();
}

function exportKML(){
  const features = [];
  if (line) features.push(line.toGeoJSON());
  coneLayer.eachLayer(m => features.push({
    type:'Feature', properties:{name:m.options.title||'Cone'},
    geometry:{type:'Point', coordinates:[m.getLatLng().lng, m.getLatLng().lat]}
  }));
  signLayer.eachLayer(l => {
    if (l instanceof L.Marker){
      const el = l.getElement && l.getElement();
      let name = 'Sign';
      if (el && el.querySelector('.sign-pill')) name = el.innerText.trim();
      else if (el && el.querySelector('.flagger-icon')) name = 'FLAGGER';
      else if (el && el.querySelector('.arrow-board')) name = 'ARROW BOARD';
      features.push({
        type:'Feature', properties:{name},
        geometry:{type:'Point', coordinates:[l.getLatLng().lng, l.getLatLng().lat]}
      });
    }
  });
  const kml = tokml({type:'FeatureCollection', features}, {name:'name'});
  const blob = new Blob([kml], {type:'application/vnd.google-earth.kml+xml'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='work_zone.kml'; a.click();
}

function exportCSV(){
  let csv = 'Type,Name,Latitude,Longitude\n';
  
  coneLayer.eachLayer(m => {
    const ll = m.getLatLng();
    csv += `Cone,"${m.options.title||'Cone'}",${ll.lat},${ll.lng}\n`;
  });
  
  signLayer.eachLayer(l => {
    if (l instanceof L.Marker){
      const ll = l.getLatLng();
      const el = l.getElement && l.getElement();
      let name = 'Sign';
      if (el && el.querySelector('.sign-pill')) name = el.innerText.trim();
      else if (el && el.querySelector('.flagger-icon')) name = 'FLAGGER';
      else if (el && el.querySelector('.arrow-board')) name = 'ARROW BOARD';
      csv += `Sign,"${name}",${ll.lat},${ll.lng}\n`;
    }
  });
  
  const blob = new Blob([csv], {type:'text/csv'});
  const a=document.createElement('a'); 
  a.href=URL.createObjectURL(blob); 
  a.download='work_zone.csv'; 
  a.click();
}

function saveProject() {
  const projectData = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    project: {
      name: document.getElementById('projectName').value || 'Untitled',
      location: document.getElementById('projectLocation').value || '',
      date: document.getElementById('projectDate').value || '',
      speed: speedEl.value
    },
    settings: {
      spacing: spacingEl.value,
      bufferSpacing: bufferSpacingEl.value,
      scale: scaleEl.value,
      stationStep: stationStepEl.value,
      mode: modeDoubleEl.checked ? 'double' : 'single'
    },
    polyline: line ? line.toGeoJSON() : null,
    cones: [],
    signs: [],
    weather: currentWeatherData
  };
  
  coneLayer.eachLayer(m => {
    const ll = m.getLatLng();
    projectData.cones.push({
      lat: ll.lat,
      lng: ll.lng,
      title: m.options.title || 'Cone'
    });
  });
  
  signLayer.eachLayer(l => {
    if (l instanceof L.Marker) {
      const ll = l.getLatLng();
      const el = l.getElement && l.getElement();
      let name = 'Sign';
      if (el && el.querySelector('.sign-pill')) name = el.innerText.trim();
      else if (el && el.querySelector('.flagger-icon')) name = 'FLAGGER';
      else if (el && el.querySelector('.arrow-board')) name = 'ARROW BOARD';
      projectData.signs.push({ lat: ll.lat, lng: ll.lng, name });
    }
  });
  
  const projectId = Date.now().toString();
  localStorage.setItem(`project_${projectId}`, JSON.stringify(projectData));
  
  addToHistory(projectId, projectData);
  
  alert('✓ Project saved successfully!');
  return projectData;
}

function loadProject(data) {
  coneLayer.clearLayers();
  labelLayer.clearLayers();
  signLayer.clearLayers();
  if (line) { drawnItems.removeLayer(line); line = null; }
  
  document.getElementById('projectName').value = data.project.name || '';
  document.getElementById('projectLocation').value = data.project.location || '';
  document.getElementById('projectDate').value = data.project.date || '';
  speedEl.value = data.project.speed || 35;
  
  if (data.settings) {
    spacingEl.value = data.settings.spacing || 35;
    bufferSpacingEl.value = data.settings.bufferSpacing || 70;
    scaleEl.value = data.settings.scale || 1;
    stationStepEl.value = data.settings.stationStep || 50;
    if (data.settings.mode === 'double') {
      modeDoubleEl.checked = true;
    } else {
      modeSingleEl.checked = true;
    }
  }
  
  if (data.polyline) {
    line = L.geoJSON(data.polyline).getLayers()[0];
    drawnItems.addLayer(line);
    map.fitBounds(line.getBounds(), { padding: [20, 20] });
  }
  
  if (data.cones) {
    data.cones.forEach(cone => {
      const icon = L.divIcon({
        html: `<div class="cone" style="transform:translate(-8px,-20px) scale(${scaleEl.value});"></div>`,
        iconSize: [0, 0]
      });
      const m = L.marker([cone.lat, cone.lng], { icon, title: cone.title });
      m.on('click', () => { if (chkDeleteEl.checked) { coneLayer.removeLayer(m); updateStats(); } });
      coneLayer.addLayer(m);
    });
  }
  
  if (data.signs) {
    data.signs.forEach(sign => {
      let icon;
      if (sign.name === 'FLAGGER') {
        const html = `<div class="flagger-icon" style="display:flex;align-items:center;gap:6px;">
          <div style="width:14px;height:14px;background:#ef4444;border:2px solid #fff;clip-path:polygon(30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%);"></div>
        </div>`;
        icon = L.divIcon({ className: '', html, iconSize: [0, 0] });
      } else if (sign.name === 'ARROW BOARD') {
        const html = '<div class="arrow-board"><div class="arrow-segment"></div><div class="arrow-segment"></div><div class="arrow-segment"></div></div>';
        icon = L.divIcon({ className: '', html, iconSize: [0, 0] });
      } else {
        icon = L.divIcon({ className: '', html: `<div class="sign-pill">${sign.name}</div>` });
      }
      const m = L.marker([sign.lat, sign.lng], { icon, draggable: true });
      m.on('click', () => { if (chkDeleteEl.checked) { signLayer.removeLayer(m); updateStats(); } });
      signLayer.addLayer(m);
    });
  }
  
  updateStats();
  updateBadges();
  updateMaterialList();
}

function shareProject() {
  const data = saveProjectData();
  const json = JSON.stringify(data);
  const encoded = toUrlSafeBase64(json);
  const baseUrl = window.location.href.split('#')[0].split('?')[0];
  const shareUrl = `${baseUrl}?load=${encodeURIComponent(encoded)}`;
  
  document.getElementById('shareLink').textContent = shareUrl;
  document.getElementById('shareLinkContainer').style.display = 'block';
  document.getElementById('shareModal').classList.add('active');
  
  return shareUrl;
}

function saveProjectData() {
  return {
    v: '1.0',
    p: document.getElementById('projectName').value || 'Untitled',
    l: document.getElementById('projectLocation').value || '',
    d: document.getElementById('projectDate').value || '',
    s: speedEl.value,
    line: line ? line.toGeoJSON().geometry.coordinates : null,
    cones: coneLayer.getLayers().map(m => {
      const ll = m.getLatLng();
      return [ll.lat, ll.lng, m.options.title || 'Cone'];
    }),
    signs: signLayer.getLayers().filter(l => l instanceof L.Marker).map(m => {
      const ll = m.getLatLng();
      const el = m.getElement && m.getElement();
      let name = 'Sign';
      if (el && el.querySelector('.sign-pill')) name = el.innerText.trim();
      else if (el && el.querySelector('.flagger-icon')) name = 'FLAGGER';
      else if (el && el.querySelector('.arrow-board')) name = 'ARROW BOARD';
      return [ll.lat, ll.lng, name];
    })
  };
}

function addToHistory(projectId, data) {
  const history = JSON.parse(localStorage.getItem('projectHistory') || '[]');
  
  history.unshift({
    id: projectId,
    name: data.project.name,
    location: data.project.location,
    date: data.project.date,
    timestamp: data.timestamp,
    cones: data.cones.length,
    signs: data.signs.length
  });
  
  if (history.length > 20) history.pop();
  
  localStorage.setItem('projectHistory', JSON.stringify(history));
  updateHistoryDisplay();
}

function updateHistoryDisplay() {
  const history = JSON.parse(localStorage.getItem('projectHistory') || '[]');
  const container = document.getElementById('historyList');
  
  if (history.length === 0) {
    container.innerHTML = '<div style="color:var(--muted);font-size:12px;text-align:center;padding:20px">No saved projects yet</div>';
    return;
  }
  
  container.innerHTML = history.map(item => `
    <div class="history-item" data-id="${item.id}">
      <div class="history-header">${item.name || 'Untitled'}</div>
      <div class="history-meta">
        <span>📅 ${new Date(item.timestamp).toLocaleDateString()}</span>
        <span>📍 ${item.location || 'No location'}</span>
      </div>
      <div class="history-stats">
        🚧 ${item.cones} cones • 🚸 ${item.signs} signs
      </div>
    </div>
  `).join('');
  
  container.querySelectorAll('.history-item').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.getAttribute('data-id');
      const data = JSON.parse(localStorage.getItem(`project_${id}`));
      if (data) {
        if (confirm('Load this project? Current work will be replaced.')) {
          loadProject(data);
        }
      }
    });
  });
}

function updateMaterialList() {
  const container = document.getElementById('materialList');
  const counts = { 'Traffic Cone': coneLayer.getLayers().length };
  
  signLayer.eachLayer(l => {
    if (l instanceof L.Marker) {
      const el = l.getElement && l.getElement();
      let name = 'Sign';
      if (el && el.querySelector('.sign-pill')) name = el.innerText.trim();
      else if (el && el.querySelector('.flagger-icon')) name = 'FLAGGER';
      else if (el && el.querySelector('.arrow-board')) name = 'ARROW BOARD';
      counts[name] = (counts[name] || 0) + 1;
    }
  });
  
  if (Object.keys(counts).length === 0 || counts['Traffic Cone'] === 0) {
    container.innerHTML = '<div style="color:var(--muted);font-size:12px;text-align:center;padding:20px">Place devices to generate material list</div>';
    return;
  }
  
  let html = '';
  Object.keys(counts).sort().forEach(name => {
    const qty = counts[name];
    html += `
      <div class="material-item">
        <span>${name}</span>
        <span class="material-qty">${qty}x</span>
      </div>
    `;
  });
  
  container.innerHTML = html;
}

function calculateTraffic() {
  const adt = parseInt(document.getElementById('trafficADT').value) || 0;
  const duration = parseInt(document.getElementById('trafficDuration').value) || 8;
  
  if (adt === 0) {
    alert('Please enter Average Daily Traffic (ADT)');
    return;
  }
  
  const hourlyRate = adt / 24;
  const impacted = Math.round(hourlyRate * duration);
  
  document.getElementById('trafficImpacted').textContent = impacted.toLocaleString();
  document.getElementById('trafficResults').style.display = 'block';
  
  let recommendation = '';
  if (impacted < 500) {
    recommendation = '✓ Low traffic volume. Standard signage should be sufficient.';
  } else if (impacted < 2000) {
    recommendation = '⚠️ Moderate traffic. Consider advance warning signs and arrow boards.';
  } else if (impacted < 5000) {
    recommendation = '⚠️ High traffic volume. Recommend multiple advance warnings, arrow boards, and possibly flaggers.';
  } else {
    recommendation = '🚨 Very high traffic. Strongly recommend law enforcement, multiple flaggers, changeable message signs, and possible lane restrictions during off-peak hours.';
  }
  
  document.getElementById('trafficRecommendation').innerHTML = recommendation;
}

let phases = [];
let activePhaseIndex = 0;

function addPhase() {
  const phaseName = prompt('Enter phase name:', `Phase ${phases.length + 1}`);
  if (!phaseName) return;
  
  const phaseDate = prompt('Enter date (optional):', new Date().toLocaleDateString());
  
  const phase = {
    id: Date.now(),
    name: phaseName,
    date: phaseDate || '',
    data: saveProjectData()
  };
  
  phases.push(phase);
  activePhaseIndex = phases.length - 1;
  updatePhaseDisplay();
  savePhases();
}

function updatePhaseDisplay() {
  const container = document.getElementById('phaseList');
  
  if (phases.length === 0) {
    container.innerHTML = '<div style="color:var(--muted);font-size:12px;text-align:center;padding:20px">No phases yet. Click "Add Phase" to create work phases.</div>';
    return;
  }
  
  container.innerHTML = phases.map((phase, idx) => `
    <div class="phase-item ${idx === activePhaseIndex ? 'active' : ''}" data-idx="${idx}">
      <div class="phase-header">
        <span class="phase-name">${phase.name}</span>
        <span class="phase-date">${phase.date || 'No date'}</span>
      </div>
      <div class="phase-stats">
        🚧 ${phase.data.cones.length} cones • 🚸 ${phase.data.signs.length} signs
      </div>
      <div class="phase-controls">
        <button class="secondary phase-load">Load</button>
        <button class="danger phase-delete">Delete</button>
      </div>
    </div>
  `).join('');
  
  container.querySelectorAll('.phase-item').forEach((el, idx) => {
    el.querySelector('.phase-load').addEventListener('click', (e) => {
      e.stopPropagation();
      loadPhase(idx);
    });
    el.querySelector('.phase-delete').addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('Delete this phase?')) {
        phases.splice(idx, 1);
        if (activePhaseIndex >= phases.length) activePhaseIndex = Math.max(0, phases.length - 1);
        updatePhaseDisplay();
        savePhases();
      }
    });
  });
}

function loadPhase(idx) {
  if (idx < 0 || idx >= phases.length) return;
  activePhaseIndex = idx;
  const data = phases[idx].data;
  
  coneLayer.clearLayers();
  labelLayer.clearLayers();
  signLayer.clearLayers();
  if (line) { drawnItems.removeLayer(line); line = null; }
  
  if (data.line) {
    const coords = data.line.map(c => [c[1], c[0]]);
    line = L.polyline(coords, { color: '#22d3ee', weight: 4 });
    drawnItems.addLayer(line);
  }
  
  data.cones.forEach(([lat, lng, title]) => {
    const icon = L.divIcon({
      html: `<div class="cone" style="transform:translate(-8px,-20px) scale(${scaleEl.value});"></div>`,
      iconSize: [0, 0]
    });
    const m = L.marker([lat, lng], { icon, title });
    m.on('click', () => { if (chkDeleteEl.checked) { coneLayer.removeLayer(m); updateStats(); } });
    coneLayer.addLayer(m);
  });
  
  data.signs.forEach(([lat, lng, name]) => {
    let icon;
    if (name === 'FLAGGER') {
      icon = L.divIcon({ className: '', html: '<div class="flagger-icon"></div>', iconSize: [0, 0] });
    } else if (name === 'ARROW BOARD') {
      icon = L.divIcon({ className: '', html: '<div class="arrow-board"><div class="arrow-segment"></div><div class="arrow-segment"></div><div class="arrow-segment"></div></div>', iconSize: [0, 0] });
    } else {
      icon = L.divIcon({ className: '', html: `<div class="sign-pill">${name}</div>` });
    }
    const m = L.marker([lat, lng], { icon, draggable: true });
    m.on('click', () => { if (chkDeleteEl.checked) { signLayer.removeLayer(m); updateStats(); } });
    signLayer.addLayer(m);
  });
  
  updateStats();
  updateBadges();
  updatePhaseDisplay();
}

function savePhases() {
  localStorage.setItem('workzone_phases', JSON.stringify(phases));
}

function loadPhases() {
  const saved = localStorage.getItem('workzone_phases');
  if (saved) {
    phases = JSON.parse(saved);
    updatePhaseDisplay();
  }
}

function updatePrintPanel(){
  document.getElementById('ppPreparedBy').textContent = document.getElementById('preparedBy').value || '—';
  document.getElementById('ppProjectName').textContent = document.getElementById('projectName').value || '—';
  document.getElementById('ppLocation').textContent = document.getElementById('projectLocation').value || '—';
  document.getElementById('ppDate').textContent = document.getElementById('projectDate').value || '—';
  document.getElementById('ppSpeed').textContent = speedEl.value;
  
  const counts = getSignCounts();
  const tbody = document.getElementById('printDevices');
  tbody.innerHTML = '';
  
  const coneCount = coneLayer.getLayers().length;
  if (coneCount > 0){
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>Traffic Cones</td><td><strong>${coneCount}</strong></td>`;
    tbody.appendChild(tr);
  }
  
  Object.keys(counts).sort().forEach(k => {
    const tr = document.createElement('tr');
    const cost = counts[k] * (DEVICE_COSTS[k] || DEVICE_COSTS['default']);
    tr.innerHTML = `<td>${k}</td><td><strong>${counts[k]}</strong> (${cost.toLocaleString()})</td>`;
    tbody.appendChild(tr);
  });
  
  if (coneCount === 0 && Object.keys(counts).length === 0){
    tbody.innerHTML = '<tr><td colspan="2">No devices placed</td></tr>';
  }
  
  document.getElementById('ppTaperSpacing').textContent = lastTaperSpacingFt ? Math.round(lastTaperSpacingFt) + ' ft' : '—';
  document.getElementById('ppTaperCones').textContent = lastTaperCones;
  document.getElementById('ppBufferSpacing').textContent = lastBufferSpacingFt ? Math.round(lastBufferSpacingFt) + ' ft' : '—';
  document.getElementById('ppBufferCones').textContent = lastBufferCones;
  document.getElementById('ppTotalCones').textContent = coneCount;
  
  const compDiv = document.getElementById('ppCompliance');
  const speed = +speedEl.value;
  const required = calcRequiredTaperLength(speed);
  let compHTML = `<div>Required taper length (${speed} mph): <strong>${Math.round(required)} ft</strong></div>`;
  compHTML += `<div>Formula: L = WS/60 (speeds < 40 mph) or L = WS²/60 (speeds ≥ 40 mph)</div>`;
  compHTML += `<div>Where W = lane width (12 ft), S = speed limit</div>`;
  
  if (currentWeatherData) {
    const weatherInfo = getWeatherInfo(currentWeatherData.weathercode);
    const temp = Math.round(currentWeatherData.temperature_2m);
    const wind = Math.round(currentWeatherData.windspeed_10m);
    compHTML += `<div style="margin-top:12px;padding:8px;background:#f3f4f6;border-radius:6px;">
      <strong>Weather Conditions:</strong><br>
      Temperature: ${temp}°F • ${weatherInfo.description} • Wind: ${wind} mph
    </div>`;
  }
  
  compDiv.innerHTML = compHTML;
  
  const measDiv = document.getElementById('ppMeasurements');
  let totalLength = 0;
  if (line){
    totalLength = turf.length(line.toGeoJSON(), {units:'meters'})/FT_TO_M;
  }
  measDiv.innerHTML = `
    <div>Total project length: <strong>${fmtFt(totalLength)}</strong></div>
    <div>Advance warning distance: <strong>${getAdvanceWarningDistance(+speedEl.value)} ft</strong></div>
  `;
  

  // Generate screenshots for print
  generateScreenshots();
  
  generateQRCode();
}

function generatePlan(){
  updatePrintPanel();
  setTimeout(() => {
    window.print();
  }, 500);
}

function searchAddress(){
  const query = document.getElementById('addressSearch').value.trim();
  const resultsDiv = document.getElementById('searchResults');
  
  if (!query){
    resultsDiv.innerHTML = '<span style="color:#ef4444">Please enter an address</span>';
    return;
  }
  
  resultsDiv.innerHTML = 'Searching...';
  document.getElementById('btnSearch').disabled = true;
  
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;
  
  fetch(url, {
    headers: {
      'User-Agent': 'WorkZonePlanner/1.0'
    }
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById('btnSearch').disabled = false;
    
    if (data && data.length > 0){
      const result = data[0];
      const lat = parseFloat(result.lat);
      const lon = parseFloat(result.lon);
      
      map.flyTo([lat, lon], 18, {
        duration: 1.5
      });
      
      const tempMarker = L.marker([lat, lon], {
        icon: L.divIcon({
          className: '',
          html: '<div style="background:#3b82f6;color:#fff;padding:4px 8px;border-radius:6px;font-weight:bold;font-size:11px;border:2px solid #fff;box-shadow:0 2px 4px rgba(0,0,0,0.5)">📍 Found</div>',
          iconSize: [0, 0]
        })
      }).addTo(map);
      
      setTimeout(() => map.removeLayer(tempMarker), 5000);
      
      resultsDiv.innerHTML = `<span style="color:var(--success)">✓ Found: ${result.display_name}</span>`;
      
      if (!document.getElementById('projectLocation').value){
        document.getElementById('projectLocation').value = result.display_name.split(',').slice(0, 2).join(',');
      }
      
      fetchWeather(lat, lon);
    } else {
      resultsDiv.innerHTML = '<span style="color:#ef4444">Location not found. Try a different address.</span>';
    }
  })
  .catch(error => {
    console.error('Search error:', error);
    document.getElementById('btnSearch').disabled = false;
    resultsDiv.innerHTML = '<span style="color:#ef4444">Search failed. Please try again.</span>';
  });
}

document.getElementById('btn-place').addEventListener('click', placeCones);
document.getElementById('btn-measure').addEventListener('click', toggleMeasure);
document.getElementById('btn-clear-cones').addEventListener('click', ()=>{ coneLayer.clearLayers(); labelLayer.clearLayers(); updateStats(); });
document.getElementById('btn-clear-signs').addEventListener('click', ()=>{ signLayer.clearLayers(); updateStats(); });
document.getElementById('btn-clear-all').addEventListener('click', ()=>{ 
  coneLayer.clearLayers(); 
  labelLayer.clearLayers(); 
  signLayer.clearLayers(); 
  measureLayer.clearLayers();
  if(line){drawnItems.removeLayer(line); line=null;} 
  updateStats(); 
  updateBadges(); 
});
document.getElementById('btn-export-geojson').addEventListener('click', exportGeoJSON);
document.getElementById('btn-export-kml').addEventListener('click', exportKML);
document.getElementById('btn-export-csv').addEventListener('click', exportCSV);
document.getElementById('btn-print').addEventListener('click', generatePlan);
document.getElementById('btn-preview-qr').addEventListener('click', showQRPreview);

document.getElementById('btn-save').addEventListener('click', saveProject);
document.getElementById('btn-load').addEventListener('click', () => {
  const history = JSON.parse(localStorage.getItem('projectHistory') || '[]');
  if (history.length === 0) {
    alert('No saved projects. Save a project first!');
    return;
  }
  const section = document.querySelector('[data-section="history"]');
  if (section.classList.contains('collapsed')) {
    section.classList.remove('collapsed');
    const header = document.querySelector('.section-header[data-section="history"] .section-icon');
    if (header) header.classList.remove('collapsed');
  }
  document.getElementById('historyList').scrollIntoView({ behavior: 'smooth' });
});
document.getElementById('btn-share').addEventListener('click', () => {
  if (coneLayer.getLayers().length === 0 && signLayer.getLayers().length === 0) {
    alert('Please create a work zone first before sharing.');
    return;
  }
  shareProject();
});
document.getElementById('btn-calc-traffic').addEventListener('click', calculateTraffic);
document.getElementById('btn-export-materials').addEventListener('click', () => {
  const list = document.getElementById('materialList').innerText;
  navigator.clipboard.writeText(list).then(() => {
    alert('✓ Material list copied to clipboard!');
  });
});
document.getElementById('btn-add-phase').addEventListener('click', addPhase);
document.getElementById('btn-clear-history').addEventListener('click', () => {
  if (confirm('Clear all project history? This cannot be undone.')) {
    localStorage.removeItem('projectHistory');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('project_')) {
        localStorage.removeItem(key);
        i--;
      }
    }
    updateHistoryDisplay();
    alert('✓ History cleared');
  }
});

document.getElementById('shareCopyLink').addEventListener('click', () => {
  const url = shareProject();
  navigator.clipboard.writeText(url).then(() => {
    alert('✓ Link copied to clipboard!');
  });
});

document.getElementById('shareQRCode').addEventListener('click', () => {
  document.getElementById('shareModal').classList.remove('active');
  showQRPreview();
});

document.getElementById('shareEmail').addEventListener('click', () => {
  const url = shareProject();
  const subject = encodeURIComponent(`Work Zone Plan: ${document.getElementById('projectName').value || 'Untitled'}`);
  const body = encodeURIComponent(`View this work zone plan:\n\n${url}`);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
});

document.getElementById('shareDownload').addEventListener('click', () => {
  const data = saveProjectData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `workzone_${Date.now()}.json`;
  a.click();
});

document.getElementById('btnCopyShareLink').addEventListener('click', () => {
  const link = document.getElementById('shareLink').textContent;
  navigator.clipboard.writeText(link).then(() => {
    alert('✓ Link copied!');
  });
});

document.getElementById('btnCloseShare').addEventListener('click', () => {
  document.getElementById('shareModal').classList.remove('active');
});

document.getElementById('btnSearch').addEventListener('click', searchAddress);
document.getElementById('addressSearch').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchAddress();
});

let lastAutoSave = null;
function autoSave() {
  const currentState = JSON.stringify({
    line: line ? line.toGeoJSON() : null,
    cones: coneLayer.getLayers().length,
    signs: signLayer.getLayers().filter(l => l instanceof L.Marker).length
  });
  
  if (currentState !== lastAutoSave) {
    lastAutoSave = currentState;
    const data = saveProjectData();
    localStorage.setItem('workzone_autosave', JSON.stringify(data));
  }
}

function loadAutoSave() {
  const saved = localStorage.getItem('workzone_autosave');
  if (saved && !window.location.hash && !window.location.search.includes('field') && !window.location.search.includes('load')) {
    try {
      const data = JSON.parse(saved);
      if (data.cones && data.cones.length > 0) {
        if (confirm('Found an auto-saved project. Load it?')) {
          loadProjectFromCompact(data);
        }
      }
    } catch (e) {
      console.error('Auto-save load error:', e);
    }
  }
}

function loadProjectFromCompact(data) {
  document.getElementById('projectName').value = data.p || '';
  document.getElementById('projectLocation').value = data.l || '';
  document.getElementById('projectDate').value = data.d || '';
  speedEl.value = data.s || 35;
  
  if (data.line) {
    const coords = data.line.map(c => [c[1], c[0]]);
    line = L.polyline(coords, { color: '#22d3ee', weight: 4 });
    drawnItems.addLayer(line);
    map.fitBounds(line.getBounds(), { padding: [20, 20] });
  }
  
  if (data.cones) {
    data.cones.forEach(([lat, lng, title]) => {
      const icon = L.divIcon({
        html: `<div class="cone" style="transform:translate(-8px,-20px) scale(${scaleEl.value});"></div>`,
        iconSize: [0, 0]
      });
      const m = L.marker([lat, lng], { icon, title });
      m.on('click', () => { if (chkDeleteEl.checked) { coneLayer.removeLayer(m); updateStats(); } });
      coneLayer.addLayer(m);
    });
  }
  
  if (data.signs) {
    data.signs.forEach(([lat, lng, name]) => {
      let html;
      if (name === 'FLAGGER') {
        html = '<div class="flagger-icon" style="display:flex;align-items:center;gap:6px;"><div style="width:14px;height:14px;background:#ef4444;border:2px solid #fff;clip-path:polygon(30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%);"></div></div>';
      } else if (name === 'ARROW BOARD') {
        html = '<div class="arrow-board"><div class="arrow-segment"></div><div class="arrow-segment"></div><div class="arrow-segment"></div></div>';
      } else {
        html = `<div class="sign-pill">${name}</div>`;
      }
      const icon = L.divIcon({ className: '', html, iconSize: [0, 0] });
      const m = L.marker([lat, lng], { icon, draggable: true });
      m.on('click', () => { if (chkDeleteEl.checked) { signLayer.removeLayer(m); updateStats(); } });
      signLayer.addLayer(m);
    });
  }
  
  updateStats();
  updateBadges();
}

function checkForSharedProject() {
  // Check for query parameter (new method)
  const urlParams = new URLSearchParams(window.location.search);
  const loadParam = urlParams.get('load');
  
  if (loadParam) {
    try {
      const decoded = fromUrlSafeBase64(decodeURIComponent(loadParam));
      const data = JSON.parse(decoded);
      loadProjectFromCompact(data);
      alert('✓ Shared project loaded successfully!');
      // Clean up URL
      window.history.replaceState(null, null, window.location.pathname);
      return;
    } catch (e) {
      console.error('Failed to load shared project from query param:', e);
      alert('Error loading shared project. The link may be invalid or corrupted.');
    }
  }
  
  // Fallback to hash method (old method for backwards compatibility)
  const hash = window.location.hash;
  if (hash.startsWith('#load=')) {
    try {
      const encoded = hash.substring(6);
      const decoded = fromUrlSafeBase64(encoded);
      const data = JSON.parse(decoded);
      loadProjectFromCompact(data);
      alert('✓ Shared project loaded successfully!');
      window.history.replaceState(null, null, window.location.pathname);
    } catch (e) {
      console.error('Failed to load shared project from hash:', e);
      alert('Error loading shared project. The link may be invalid or corrupted.');
    }
  }
}

document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  
  if ((e.ctrlKey || e.metaKey) && e.key === 's') {
    e.preventDefault();
    saveProject();
  }
  
  if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
    e.preventDefault();
    generatePlan();
  }
  
  if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
    e.preventDefault();
    exportGeoJSON();
  }
  
  if (e.key === 'm' || e.key === 'M') {
    toggleMeasure();
  }
  
  if (e.key === 'Delete' || e.key === 'Backspace') {
    chkDeleteEl.checked = !chkDeleteEl.checked;
  }
  
  if (e.key === ' ' && line) {
    e.preventDefault();
    placeCones();
  }
});

let pendingSync = [];

function queueForSync(action, data) {
  if (navigator.onLine) {
    executeSyncAction(action, data);
  } else {
    pendingSync.push({ action, data, timestamp: Date.now() });
    localStorage.setItem('pending_sync', JSON.stringify(pendingSync));
  }
}

function executeSyncAction(action, data) {
  console.log('Sync action:', action, data);
}

window.addEventListener('online', () => {
  const pending = JSON.parse(localStorage.getItem('pending_sync') || '[]');
  pending.forEach(item => {
    executeSyncAction(item.action, item.data);
  });
  localStorage.removeItem('pending_sync');
  pendingSync = [];
});

function serializeWorkZone(){
  const devices = [];
  
  coneLayer.eachLayer(m => {
    const ll = m.getLatLng();
    devices.push({
      t: 'c',
      n: m.options.title || 'Cone',
      a: parseFloat(ll.lat.toFixed(6)),
      o: parseFloat(ll.lng.toFixed(6)),
      p: false
    });
  });
  
  signLayer.eachLayer(l => {
    if (l instanceof L.Marker){
      const ll = l.getLatLng();
      const el = l.getElement && l.getElement();
      let name = 'Sign';
      if (el && el.querySelector('.sign-pill')) name = el.innerText.trim();
      else if (el && el.querySelector('.flagger-icon')) name = 'FLAGGER';
      else if (el && el.querySelector('.arrow-board')) name = 'ARROW BOARD';
      devices.push({
        t: 's',
        n: name,
        a: parseFloat(ll.lat.toFixed(6)),

/****************************************
 * PART 8 - DEVICE MANAGEMENT
 * END
 ****************************************/
