/****************************************
 * PART 7 - CALCULATIONS & MUTCD COMPLIANCE
 * START
 * 
 * MUTCD calculation functions:
 * - Speed-based buffer spacing
 * - Station interval calculations
 * - Advance warning distances
 * - Speed limit change handlers
 * - Taper length calculations
 * - Cone placement algorithms
 * - Statistics updates
 * - Badge generation
 * - Distance measurements
 * - Station labeling
 ****************************************/

let lastTaperSpacingFt = null;
let lastBufferSpacingFt = null;
let lastTaperCones = 0;
let lastBufferCones = 0;

let lastTaperSpacingFt = null;
let lastBufferSpacingFt = null;
let lastTaperCones = 0;
let lastBufferCones = 0;

function getMutcdBufferSpacingFt(speed){
  const s = Math.max(10, Math.min(85, +speed||0));
  if (s <= 25) return 25;
  if (s <= 60) return Math.round(s/5)*5;
  return 65;
}
function getStationIntervalFt(speed){
  return (+speed <= 35 ? 25 : 50);
}
function getAdvanceWarningDistance(speed){
  const s = +speed || 0;
  if (s <= 25) return 100;
  if (s <= 35) return 350;
  if (s <= 45) return 500;
  if (s <= 55) return 750;
  return 1000;
}
function handleSpeedChange(){
  const s = +speedEl.value || 0;
  if (autoFromSpeedEl.checked){
    bufferSpacingEl.value = getMutcdBufferSpacingFt(s);
    stationStepEl.value = getStationIntervalFt(s);
  }
  updateBadges();
  updateStats();
}
speedEl.addEventListener('input', handleSpeedChange);
autoFromSpeedEl.addEventListener('input', handleSpeedChange);
modeSingleEl.addEventListener('input', () => { updateBadges(); updateStats(); });
modeDoubleEl.addEventListener('input', () => { updateBadges(); updateStats(); });

function fmtFt(ft){ return ft ? `${Math.round(ft).toLocaleString()} ft` : '—'; }
function fmtCurrency(val){ return val ? `$${Math.round(val).toLocaleString()}` : '—'; }

function updateStats(){
  let buffer=0, totalLength=0;
  if (line){
    const gj = line.toGeoJSON();
    const C = gj.geometry.coordinates;
    totalLength = turf.length(gj, {units:'meters'})/FT_TO_M;
    
    if (C.length >= 2){
      if (C.length > 2){
        if (modeDoubleEl.checked && C.length >= 3){
          if (C.length > 3){
            const bufferCoords = C.slice(1, C.length-1);
            if (bufferCoords.length >= 2){
              const lsBuf = {type:'Feature', geometry:{type:'LineString', coordinates: bufferCoords}};
              buffer = turf.length(lsBuf,{units:'meters'})/FT_TO_M;
            }
          }
        } else {
          const lsBuf = {type:'Feature', geometry:{type:'LineString', coordinates: C.slice(1)}};
          buffer = turf.length(lsBuf,{units:'meters'})/FT_TO_M;
        }
      }
    }
  }
  
  const coneCount = coneLayer.getLayers().length;
  const signCount = countSignItems();
  const speed = +speedEl.value || 35;
  const reqAdvWarning = getAdvanceWarningDistance(speed);
  
  let progress = 0;
  if (line) {
    const hasLine = 1;
    const hasCones = coneCount > 0 ? 1 : 0;
    const hasSigns = signCount > 0 ? 1 : 0;
    progress = Math.round((hasLine + hasCones + hasSigns) / 3 * 100);
  }
  
  document.getElementById('progressFill').style.width = `${progress}%`;
  document.getElementById('progressText').textContent = `${progress}%`;
  document.getElementById('progressPercent').textContent = `${progress}%`;
  
  document.getElementById('statProjectLength').innerHTML = `Project Length: <strong>${fmtFt(totalLength)}</strong>`;
  document.getElementById('statBuffer').innerHTML = `Buffer: <strong>${fmtFt(buffer)}</strong>`;
  document.getElementById('statCones').innerHTML = `Cones: <strong>${coneCount}</strong>`;
  document.getElementById('statSigns').innerHTML = `Signs: <strong>${signCount}</strong>`;
  document.getElementById('statAdvWarning').innerHTML = `Adv. Warning: <strong>${reqAdvWarning} ft</strong> required`;
  document.getElementById('signCount').textContent = signCount;
  
  const coneCost = coneCount * DEVICE_COSTS['Cone'];
  let signCost = 0;
  const signCounts = getSignCounts();
  for (const [name, count] of Object.entries(signCounts)){
    signCost += count * (DEVICE_COSTS[name] || DEVICE_COSTS['default']);
  }
  const totalCost = coneCost + signCost;
  document.getElementById('statEstCost').innerHTML = `Est. Cost: <strong>${fmtCurrency(totalCost)}</strong>`;
  
  updateMaterialList();
  autoSave();
}

function placeCones(){
  if (!line){ alert('Draw the polyline first.'); return; }

  coneLayer.clearLayers();
  labelLayer.clearLayers();

  const spacingFt = +spacingEl.value || 35;
  const bufferSpacingFt = +bufferSpacingEl.value || spacingFt;
  const scale = +scaleEl.value || 1;
  const stationStep = +stationStepEl.value || 50;
  const doubleTaper = modeDoubleEl.checked;

  lastBufferSpacingFt = bufferSpacingFt;
  lastTaperSpacingFt = null;
  lastTaperCones = 0;
  lastBufferCones = 0;

  const gj = line.toGeoJSON();
  const C = gj.geometry.coordinates;
  if (C.length < 2){ alert('Polyline needs at least two points.'); return; }

  function addCone(latlng, title){
    const icon = L.divIcon({html:`<div class="cone" style="transform:translate(-8px,-20px) scale(${scale});"></div>`,iconSize:[0,0]});
    const m = L.marker(latlng, {icon, title});
    m.on('click', ()=>{ if (chkDeleteEl.checked) { coneLayer.removeLayer(m); updateStats(); } });
    coneLayer.addLayer(m);
  }

  function placeTaper(ls, titlePrefix){
    const Lm = turf.length(ls,{units:'meters'});
    const Lft = Lm/FT_TO_M;
    if (Lm <= 0) return;
    const maxSpacingForFiveFt = Lft/4;
    const useOverride = spacingFt > maxSpacingForFiveFt;
    const spacingM = (useOverride ? (Lft/4) : spacingFt) * FT_TO_M;

    let pts = [];
    if (useOverride){
      for (let i=0;i<5;i++){ pts.push(turf.along(ls, (i/4)*Lm,{units:'meters'})); }
      lastTaperSpacingFt = maxSpacingForFiveFt;
    } else {
      const n = Math.floor(Lm/spacingM);
      for (let i=0;i<=n;i++){
        const d = Math.min(i*spacingM,Lm);
        pts.push(turf.along(ls, d, {units:'meters'}));
      }
      if (pts.length < 5){
        pts = [];
        for (let i=0;i<5;i++){ pts.push(turf.along(ls, (i/4)*Lm, {units:'meters'})); }
        lastTaperSpacingFt = maxSpacingForFiveFt;
      } else {
        lastTaperSpacingFt = spacingFt;
      }
    }
    pts.forEach((pt, idx)=> addCone(L.latLng(pt.geometry.coordinates[1], pt.geometry.coordinates[0]), `${titlePrefix} ${idx+1}`));
    lastTaperCones += pts.length;
  }

  function placeBuffer(coords){
    const spacingM = bufferSpacingFt*FT_TO_M;
    for (let i=0;i<coords.length-1;i++){
      const seg = {type:'Feature', geometry:{type:'LineString', coordinates:[coords[i], coords[i+1]]}};
      const Lm = turf.length(seg,{units:'meters'});
      if (Lm <= 0) continue;
      const n = Math.floor(Lm/spacingM);
      for (let k=1;k<=n;k++){
        const d = k*spacingM;
        if (d >= Lm) break;
        const pt = turf.along(seg, d, {units:'meters'});
        addCone(L.latLng(pt.geometry.coordinates[1], pt.geometry.coordinates[0]), `Buffer ${i+1}-${k}`);
        lastBufferCones++;
      }
    }
  }

  const lsA = {type:'Feature', geometry:{type:'LineString', coordinates:[C[0], C[1]]}};
  placeTaper(lsA, 'Taper A');

  if (C.length > 2){
    if (doubleTaper && C.length >= 3){
      const lsB = {type:'Feature', geometry:{type:'LineString', coordinates:[C[C.length-2], C[C.length-1]]}};
      placeTaper(lsB, 'Taper B');
      if (C.length > 3){
        const bufferCoords = C.slice(1, C.length-1);
        if (bufferCoords.length >= 2) placeBuffer(bufferCoords);
      }
    } else {
      placeBuffer(C.slice(1));
    }
  }

  const totalLenM = turf.length(gj, {units:'meters'});
  for (let d=stationStep*FT_TO_M; d<totalLenM; d+=stationStep*FT_TO_M){
    const pt = turf.along(gj, d, {units:'meters'});
    const latlng = L.latLng(pt.geometry.coordinates[1], pt.geometry.coordinates[0]);
    const lbl=L.divIcon({className:'',html:`<div class="station-label">${Math.round(d/FT_TO_M)} ft</div>`});
    const m = L.marker(latlng,{icon:lbl});
    m.on('click', ()=>{ if (chkDeleteEl.checked) { labelLayer.removeLayer(m); updateStats(); } });
    labelLayer.addLayer(m);
  }

  updateStats();
  updateBadges();
}

function toggleMeasure(){
  measureMode = !measureMode;
  const btn = document.getElementById('btn-measure');
  if (measureMode){
    btn.style.background = 'var(--success)';
    btn.textContent = '✓ Measuring';
    map.getContainer().style.cursor = 'crosshair';
    measurePoints = [];
  } else {
    btn.style.background = '';
    btn.textContent = '📏 Measure';
    map.getContainer().style.cursor = '';
    measureLayer.clearLayers();
    measurePoints = [];
  }
}

map.on('click', (e) => {
  if (!measureMode) return;
  measurePoints.push(e.latlng);
  
  if (measurePoints.length === 1){
    L.circleMarker(e.latlng, {radius:5, color:'#22c55e', fillColor:'#22c55e', fillOpacity:1}).addTo(measureLayer);
  } else if (measurePoints.length === 2){
    const p1 = measurePoints[0];
    const p2 = measurePoints[1];
    const line = L.polyline([p1, p2], {color:'#22c55e', weight:3, dashArray:'5,5'}).addTo(measureLayer);
    
    const gj = {type:'Feature', geometry:{type:'LineString', coordinates:[[p1.lng, p1.lat], [p2.lng, p2.lat]]}};
    const distM = turf.length(gj, {units:'meters'});
    const distFt = distM / FT_TO_M;
    
    const midpoint = L.latLng((p1.lat + p2.lat)/2, (p1.lng + p2.lng)/2);
    const lbl = L.divIcon({className:'', html:`<div class="measure-label">${Math.round(distFt)} ft</div>`});
    L.marker(midpoint, {icon: lbl}).addTo(measureLayer);
    
    L.circleMarker(p2, {radius:5, color:'#22c55e', fillColor:'#22c55e', fillOpacity:1}).addTo(measureLayer);
    
    measurePoints = [];
  }
});

function createBarricade(centerLL, options={}){
  let angle = options.angle || 0;
  const lenM = 8 * FT_TO_M;
  const widthM = 0.5 * FT_TO_M;

  function build(center, angDeg){
    function dest(from, distM, bearingDeg){
      return turf.rhumbDestination(from, distM/1000, bearingDeg, {units:'kilometers'}).geometry.coordinates;
    }
    const centerPt = turf.point([center.lng, center.lat]);
    const A = dest(centerPt,  lenM/2, angDeg);
    const B = dest(centerPt, -lenM/2, angDeg);
    const left = angDeg - 90, right = angDeg + 90;
    const A_left  = dest(turf.point(A),  widthM/2, left);
    const A_right = dest(turf.point(A),  widthM/2, right);
    const B_left  = dest(turf.point(B),  widthM/2, left);
    const B_right = dest(turf.point(B),  widthM/2, right);
    const ring = [A_left, A_right, B_right, B_left, A_left];
    return ring.map(c=>[c[1],c[0]]);
  }

  const ringLL = build(centerLL, angle);
  const poly = L.polygon(ringLL, {color:'#111827', weight:2, fill:true, fillColor:'#f97316', fillOpacity:0.9}).addTo(signLayer);

  const handle = L.marker(centerLL, {draggable:true, icon: L.divIcon({className:'', html:'<div class="handle">8ft</div>', iconSize:[0,0]})}).addTo(signLayer);
  handle.on('dragend', ()=>{
    const ll = handle.getLatLng();
    poly.setLatLngs(build(ll, angle));
  });

  const rotIcon = L.divIcon({className:'', html:'<div class="rot-toolbar"><button class="rot-btn" data-d="-15">⟲ 15°</button><button class="rot-btn" data-d="15">⟳ 15°</button></div>'});
  const toolbar = L.marker(centerLL, {icon: rotIcon, draggable:false}).addTo(signLayer);

  function syncToolbar(){ toolbar.setLatLng(handle.getLatLng()); }
  handle.on('drag', syncToolbar);
  syncToolbar();

  toolbar.on('click', (e)=>{
    const target = e.originalEvent.target;
    if (target && target.classList && target.classList.contains('rot-btn')){
      const delta = parseFloat(target.getAttribute('data-d'));
      angle = (angle + delta) % 360;
      poly.setLatLngs(build(handle.getLatLng(), angle));
    }
  });

  const del = ()=>{ if (chkDeleteEl.checked){ signLayer.removeLayer(poly); signLayer.removeLayer(handle); signLayer.removeLayer(toolbar); updateStats(); } };
  poly.on('click', del); handle.on('click', del);

  updateStats();
}

function countSignItems(){
  let count = 0;
  signLayer.eachLayer(l => {
    if (l instanceof L.Marker){
      const el = l.getElement && l.getElement();
      if (el && (el.querySelector('.sign-pill') || el.querySelector('.flagger-icon') || el.querySelector('.arrow-board'))) count++;
    } else if (l instanceof L.Polygon) count++;
    else if (l instanceof L.Circle) count++;
  });
  return count;
}

function getSignCounts(){
  const counts = {};
  signLayer.eachLayer(l => {
    if (l instanceof L.Marker){
      const el = l.getElement && l.getElement();
      if (el && el.querySelector('.sign-pill')){
        const text = el.innerText.trim();
        counts[text] = (counts[text]||0)+1;
      } else if (el && el.querySelector('.flagger-icon')){
        counts['FLAGGER'] = (counts['FLAGGER']||0)+1;
      } else if (el && el.querySelector('.arrow-board')){
        counts['ARROW BOARD'] = (counts['ARROW BOARD']||0)+1;
      }
    } else if (l instanceof L.Polygon){
      counts['BARRICADE 8 FT'] = (counts['BARRICADE 8 FT']||0)+1;
    } else if (l instanceof L.Circle){
      counts['ADVANCE WARNING AREA'] = (counts['ADVANCE WARNING AREA']||0)+1;
    }
  });
  return counts;
}

let draggedSignText = null;
document.getElementById('palette').addEventListener('dragstart', (e)=>{
  const t = e.target.closest('.sign-pill');
  if (!t) return;
  draggedSignText = t.getAttribute('data-sign');
  e.dataTransfer.setData('text/plain', draggedSignText);
});
document.getElementById('map').addEventListener('dragover', (e)=> e.preventDefault());
document.getElementById('map').addEventListener('drop', (e)=>{
  e.preventDefault();
  const text = e.dataTransfer.getData('text/plain') || draggedSignText;
  if (!text) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const latlng = map.containerPointToLatLng([x,y]);

  if (text === 'BARRICADE 8 FT'){
    createBarricade(latlng, {angle:0});
    return;
  }

  if (text === 'ARROW BOARD'){
    const html = '<div class="arrow-board"><div class="arrow-segment"></div><div class="arrow-segment"></div><div class="arrow-segment"></div></div>';
    const icon = L.divIcon({className:'', html, iconSize:[0,0]});
    const m = L.marker(latlng, {icon, draggable:true});
    m.on('click', ()=>{ if (chkDeleteEl.checked) { signLayer.removeLayer(m); updateStats(); } });
    signLayer.addLayer(m);
    updateStats();
    return;
  }

  if (text === 'CHANGEABLE MESSAGE'){
    const html = '<div style="background:#000;border:3px solid #f59e0b;padding:4px 8px;border-radius:4px;color:#f59e0b;font-weight:bold;font-size:10px;font-family:monospace">MESSAGE<br>SIGN</div>';
    const icon = L.divIcon({className:'', html, iconSize:[0,0]});
    const m = L.marker(latlng, {icon, draggable:true});
    m.on('click', ()=>{ if (chkDeleteEl.checked) { signLayer.removeLayer(m); updateStats(); } });
    signLayer.addLayer(m);
    updateStats();
    return;
  }

  if (text === 'FLAGGER'){
    const scale = +scaleEl.value || 1;
    const html = `
      <div class="flagger-icon" style="display:flex;align-items:center;gap:6px;transform:scale(${scale});">
        <div style="width:14px;height:14px;background:#ef4444;border:2px solid #fff;clip-path:polygon(30% 0,70% 0,100% 30%,100% 70%,70% 100%,30% 100%,0 70%,0 30%);box-shadow:0 0 0 1px #000"></div>
        <div style="position:relative;width:2px;height:22px;background:#000;margin-left:-2px"></div>
        <div style="width:10px;height:18px;background:#000;border-radius:2px;margin-left:6px;position:relative;">
          <div style="position:absolute;top:-8px;left:2px;width:6px;height:6px;background:#000;border-radius:50%"></div>
          <div style="position:absolute;top:6px;left:-6px;width:6px;height:2px;background:#000"></div>
          <div style="position:absolute;top:6px;right:-6px;width:6px;height:2px;background:#000"></div>
        </div>
      </div>`;
    const icon = L.divIcon({className:'', html, iconSize:[0,0]});
    const m = L.marker(latlng, {icon, draggable:true});
    m.on('click', ()=>{ if (chkDeleteEl.checked) { signLayer.removeLayer(m); updateStats(); } });
    signLayer.addLayer(m);
    updateStats();
    return;
  }

  const icon = L.divIcon({className:'',html:`<div class="sign-pill" style="cursor:move">${text}</div>`});
  const m = L.marker(latlng, {icon, draggable:true});

  let circle = null;
  if (text === 'ROAD WORK AHEAD'){
    const speed = +speedEl.value || 35;
    const radiusFt = getAdvanceWarningDistance(speed);
    const radiusM = radiusFt * FT_TO_M;
    circle = L.circle(latlng, {
      radius: radiusM,
      color:'#f97316',
      fillColor:'#f97316',
      fillOpacity:0.25,
      weight:1
    }).addTo(signLayer);
    m._rwCircle = circle;
    m.on('drag', () => {
      if (m._rwCircle) m._rwCircle.setLatLng(m.getLatLng());
    });
  }

  m.on('click', ()=>{ 
    if (chkDeleteEl.checked) { 
      if (m._rwCircle) signLayer.removeLayer(m._rwCircle);
      signLayer.removeLayer(m); 
      updateStats(); 
    } 
  });

  signLayer.addLayer(m);
  updateStats();
});

function calcRequiredTaperLength(speed){
  const s = +speed || 0;
  if (s < 40) return (LANE_WIDTH_FT * s) / 60;
  return (LANE_WIDTH_FT * (s * s)) / 60;
}

function createBadge(latlng, text, status, formulaText){
  const className = status === 'good' ? '' : (status === 'warning' ? 'warning' : 'short');
  const el = L.divIcon({className:'', html:`<div class="taper-badge ${className}">${text}</div>`});
  const m = L.marker(latlng, {icon: el});
  m.on('click', ()=>{
    const color = status === 'good' ? '#22c55e' : (status === 'warning' ? '#f59e0b' : '#ef4444');
    const symbol = status === 'good' ? '✓' : (status === 'warning' ? '⚠' : '✗');
    const label = status === 'good' ? 'MUTCD Compliant' : (status === 'warning' ? 'Warning' : 'Not Compliant');
    const popupText = `<div style="font-size:12px;">
      <div style="font-weight:bold;color:${color}">${symbol} ${label}</div>
      ${formulaText}
    </div>`;
    m.bindPopup(popupText, {className:'dark-popup', autoClose:true, closeOnClick:true}).openPopup();
  });
  return m;
}

function updateBadges(){
  badgeLayer.clearLayers();
  if (!line) {
    document.getElementById('statTaperA').innerHTML = 'Taper A: —';
    document.getElementById('statTaperB').innerHTML = 'Taper B: —';
    return;
  }
  const speed = +speedEl.value || 0;
  const required = calcRequiredTaperLength(speed);
  const C = line.toGeoJSON().geometry.coordinates;
  if (C.length < 2) return;

  const segA = {type:'Feature', geometry:{type:'LineString', coordinates:[C[0],C[1]]}};
  const LmA = turf.length(segA, {units:'meters'});
  const LftA = LmA/FT_TO_M;
  const midA = turf.along(segA, LmA/2, {units:'meters'});
  const goodA = LftA >= required;
  const warningA = LftA >= required * 0.9 && LftA < required;
  const status = goodA ? 'good' : (warningA ? 'warning' : 'bad');
  const diffA = Math.round(Math.abs(LftA - required));
  const badgeTextA = goodA ? `✓ ${Math.round(LftA)} ft` : (warningA ? `⚠ ${Math.round(LftA)} ft` : `✗ Short ${diffA} ft`);
  const formulaTextA = `<div>Required: ${Math.round(required)} ft<br>Actual: ${Math.round(LftA)} ft<br>W=12 ft, S=${speed} mph</div>`;
  badgeLayer.addLayer(createBadge(L.latLng(midA.geometry.coordinates[1], midA.geometry.coordinates[0]), badgeTextA, status, formulaTextA));
  document.getElementById('statTaperA').innerHTML = `Taper A: <strong>${Math.round(LftA)} ft</strong> ${goodA ? '(✓ MUTCD)' : warningA ? '(⚠ Close)' : '(✗ -' + diffA + ' ft)'}`;

  if (modeDoubleEl.checked && C.length >= 3){
    const segB = {type:'Feature', geometry:{type:'LineString', coordinates:[C[C.length-2], C[C.length-1]]}};
    const LmB = turf.length(segB, {units:'meters'});
    const LftB = LmB/FT_TO_M;
    const midB = turf.along(segB, LmB/2, {units:'meters'});
    const goodB = LftB >= required;
    const warningB = LftB >= required * 0.9 && LftB < required;
    const statusB = goodB ? 'good' : (warningB ? 'warning' : 'bad');
    const diffB = Math.round(Math.abs(LftB - required));
    const badgeTextB = goodB ? `✓ ${Math.round(LftB)} ft` : (warningB ? `⚠ ${Math.round(LftB)} ft` : `✗ Short ${diffB} ft`);
    const formulaTextB = `<div>Required: ${Math.round(required)} ft<br>Actual: ${Math.round(LftB)} ft<br>W=12 ft, S=${speed} mph</div>`;
    badgeLayer.addLayer(createBadge(L.latLng(midB.geometry.coordinates[1], midB.geometry.coordinates[0]), badgeTextB, statusB, formulaTextB));
    document.getElementById('statTaperB').innerHTML = `Taper B: <strong>${Math.round(LftB)} ft</strong> ${goodB ? '(✓ MUTCD)' : warningB ? '(⚠ Close)' : '(✗ -' + diffB + ' ft)'}`;
  } else {
    document.getElementById('statTaperB').innerHTML = 'Taper B: —';
  }
}

function exportGeoJSON(){
  const features = [];
  if (line) features.push(line.toGeoJSON());
  coneLayer.eachLayer(m => features.push({
    type:'Feature', properties:{name:m.options.title||'Cone', type:'cone'},
    geometry:{type:'Point', coordinates:[m.getLatLng().lng, m.getLatLng().lat]}
  }));
  labelLayer.eachLayer(m => {
    const text = m.getElement() ? m.getElement().innerText : 'Station';
    features.push({ type:'Feature', properties:{name:text, type:'label'},
      geometry:{type:'Point', coordinates:[m.getLatLng().lng, m.getLatLng().lat]} });
  });
  signLayer.eachLayer(l => {
    if (l instanceof L.Marker){
      const el = l.getElement && l.getElement();
      let name = 'Sign';
      if (el && el.querySelector('.sign-pill')) name = el.innerText.trim();
      else if (el && el.querySelector('.flagger-icon')) name = 'FLAGGER';
      else if (el && el.querySelector('.arrow-board')) name = 'ARROW BOARD';
      features.push({
        type:'Feature', properties:{name, type:'sign'},
        geometry:{type:'Point', coordinates:[l.getLatLng().lng, l.getLatLng().lat]}
      });
    } else if (l instanceof L.Polygon || l instanceof L.Polyline){
      features.push(l.toGeoJSON());
    } else if (l instanceof L.Circle){
      const c = l.getLatLng();
      features.push({
        type:'Feature',
        properties:{name:'ADVANCE WARNING', radius_m:l.getRadius(), type:'circle'},
        geometry:{type:'Point', coordinates:[c.lng, c.lat]}
      });
    }
  });
  
  const data = {
    type:'FeatureCollection',
    properties: {
      project: document.getElementById('projectName').value || 'Untitled',
      location: document.getElementById('projectLocation').value || '',
      date: document.getElementById('projectDate').value || '',

/****************************************
 * PART 7 - CALCULATIONS & MUTCD COMPLIANCE
 * END
 ****************************************/
