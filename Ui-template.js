/****************************************
 * PART 3 - UI TEMPLATE
 * START
 * 
 * HTML structure for:
 * - Sidebar with all control panels
 * - Location search section
 * - Project information inputs
 * - Speed & spacing controls
 * - Tools buttons
 * - Signs & devices palette
 * - Statistics display
 * - Phase management
 * - Material tracking
 * - History
 * - Print panel
 * - Field view (GPS mode)
 * - Modals (QR, Share)
 ****************************************/

document.getElementById("app").innerHTML = `
<div id="app">
  <aside id="sidebar">
    <div class="topline">
      <h1>Work Zone Planner <span class="badge">PRO</span></h1>
      <div class="inline-btns">
        <button id="btn-place" title="Place Cones">Place</button>
        <button id="btn-print" class="secondary" title="Generate & Print Plan">Print</button>
      </div>
    </div>
    <div class="sub">Professional work zone planning with MUTCD compliance, advanced features, and comprehensive reporting.</div>

    <div class="section">
      <div class="section-header" data-section="search">
        <div class="section-title">🔍 Location Search</div>
        <span class="section-icon">▼</span>
      </div>
      <div class="section-content" data-section="search">
        <label>Search Address or Place</label>
        <div style="display:flex;gap:6px">
          <input id="addressSearch" type="text" placeholder="e.g., 123 Main St, Portland ME" style="flex:1">
          <button id="btnSearch" class="secondary" style="width:60px;padding:6px">Go</button>
        </div>
        <div id="searchResults" style="margin-top:6px;font-size:11px;color:var(--muted)"></div>
        
        <div id="weatherWidget" class="weather-widget" style="display:none">
          <div class="weather-icon" id="weatherIcon">☀️</div>
          <div class="weather-info">
            <div class="weather-temp" id="weatherTemp">—</div>
            <div class="weather-desc" id="weatherDesc">Loading weather...</div>
            <div class="weather-wind" id="weatherWind"></div>
          </div>
        </div>
        
        <div style="margin-top:8px;padding:6px;background:#1e293b;border-radius:6px;font-size:10px;color:var(--muted)">
          💡 <strong>Tip:</strong> Use the layer switcher (top right) to choose between Satellite, Hybrid (with labels), Street, or Topo maps. Zoom up to level 22 for detailed views.
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header" data-section="project">
        <div class="section-title">📋 Project Information</div>
        <span class="section-icon">▼</span>
      </div>
      <div class="section-content" data-section="project">
        <label>Prepared by</label>
        <input id="preparedBy" type="text" placeholder="e.g., John Smith">
        <label style="margin-top:6px">Project Name</label>
        <input id="projectName" type="text" placeholder="e.g., Main St Repairs">
        <label style="margin-top:6px">Location</label>
        <input id="projectLocation" type="text" placeholder="e.g., SR-123, Mile Marker 45">
        <label style="margin-top:6px">Date</label>
        <input id="projectDate" type="text" value="">
      </div>
    </div>

    <div class="section">
      <div class="section-header" data-section="speed">
        <div class="section-title">⚡ Speed & Spacing</div>
        <span class="section-icon">▼</span>
      </div>
      <div class="section-content" data-section="speed">
        <div class="row">
          <div>
            <label>Speed Limit (mph) <span class="tooltip" title="Posted speed limit">ℹ️</span></label>
            <input id="speedLimit" type="number" value="35" min="10" max="80" step="5">
          </div>
          <div class="chk-row" style="align-self:end;justify-content:flex-start;padding-bottom:6px">
            <input type="checkbox" id="autoFromSpeed" checked>
            <label for="autoFromSpeed" style="margin:0">Auto buffer</label>
          </div>
        </div>

        <div class="radio-row">
          <label><input type="radio" name="taperMode" id="modeSingle" value="single" checked> Single</label>
          <label><input type="radio" name="taperMode" id="modeDouble" value="double"> Double</label>
          <span class="chk-row" style="margin-left:auto">
            <input type="checkbox" id="chk-delete">
            <label for="chk-delete" style="margin:0">Delete</label>
          </span>
        </div>

        <div class="row">
          <div>
            <label>Taper spacing (ft)</label>
            <input id="spacing" type="number" value="35" min="5" step="1">
          </div>
          <div>
            <label>Buffer spacing (ft)</label>
            <input id="bufferSpacing" type="number" value="70" min="10" step="5">
          </div>
        </div>
        <div class="row">
          <div>
            <label>Icon scale</label>
            <input id="scale" type="number" value="1" min="0.5" max="2" step="0.1">
          </div>
          <div>
            <label>Station step (ft)</label>
            <input id="stationStep" type="number" value="50" min="25" step="25">
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header" data-section="tools">
        <div class="section-title">🛠️ Tools</div>
        <span class="section-icon">▼</span>
      </div>
      <div class="section-content" data-section="tools">
        <div class="btns3">
          <button id="btn-save" class="secondary" title="Save Project">💾 Save</button>
          <button id="btn-load" class="secondary" title="Load Project">📂 Load</button>
          <button id="btn-share" class="secondary" title="Share Project">🔗 Share</button>
        </div>
        <div class="btns3" style="margin-top:6px">
          <button id="btn-measure" class="secondary" title="Measure Distance">📏 Measure</button>
          <button id="btn-clear-cones" class="secondary">Clear Cones</button>
          <button id="btn-clear-all" class="danger">Reset All</button>
        </div>
        <div class="btns3" style="margin-top:6px">
          <button id="btn-export-geojson" class="secondary">GeoJSON</button>
          <button id="btn-export-kml" class="secondary">KML</button>
          <button id="btn-export-csv" class="secondary">CSV</button>
        </div>
        <div style="margin-top:6px">
          <button id="btn-preview-qr" class="secondary" style="width:100%">📱 Preview Field QR</button>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header" data-section="signs">
        <div class="section-title">🚧 Signs & Devices <span class="badge" id="signCount">0</span></div>
        <span class="section-icon">▼</span>
      </div>
      <div class="section-content" data-section="signs">
        <div id="palette" class="sign-palette">
          <div class="sign-pill" draggable="true" data-sign="ROAD WORK AHEAD">ROAD WORK AHEAD</div>
          <div class="sign-pill" draggable="true" data-sign="ONE LANE ROAD AHEAD">ONE LANE ROAD</div>
          <div class="sign-pill" draggable="true" data-sign="FLAGGER AHEAD">FLAGGER AHEAD</div>
          <div class="sign-pill" draggable="true" data-sign="FLAGGER">FLAGGER</div>
          <div class="sign-pill" draggable="true" data-sign="BE PREPARED TO STOP">PREP TO STOP</div>
          <div class="sign-pill" draggable="true" data-sign="DETOUR">DETOUR</div>
          <div class="sign-pill" draggable="true" data-sign="END ROAD WORK">END ROAD WORK</div>
          <div class="sign-pill" draggable="true" data-sign="LEFT LANE CLOSED">LEFT CLOSED</div>
          <div class="sign-pill" draggable="true" data-sign="RIGHT LANE CLOSED">RIGHT CLOSED</div>
          <div class="sign-pill" draggable="true" data-sign="MERGE LEFT">MERGE LEFT</div>
          <div class="sign-pill" draggable="true" data-sign="MERGE RIGHT">MERGE RIGHT</div>
          <div class="sign-pill" draggable="true" data-sign="SHOULDER WORK">SHOULDER WORK</div>
          <div class="sign-pill" draggable="true" data-sign="UTILITY WORK">UTILITY WORK</div>
          <div class="sign-pill" draggable="true" data-sign="ROAD CLOSED">ROAD CLOSED</div>
          <div class="sign-pill" draggable="true" data-sign="PED XING">PED XING</div>
          <div class="sign-pill" draggable="true" data-sign="SPEED LIMIT 25">SPEED 25</div>
          <div class="sign-pill" draggable="true" data-sign="SPEED LIMIT 35">SPEED 35</div>
          <div class="sign-pill" draggable="true" data-sign="SPEED LIMIT 45">SPEED 45</div>
          <div class="sign-pill" draggable="true" data-sign="BARRICADE 8 FT">BARRICADE 8FT</div>
          <div class="sign-pill" draggable="true" data-sign="ARROW BOARD">ARROW BOARD</div>
          <div class="sign-pill" draggable="true" data-sign="CHANGEABLE MESSAGE">MSG SIGN</div>
        </div>
        <button id="btn-clear-signs" class="secondary" style="margin-top:6px;width:100%">Clear All Signs</button>
      </div>
    </div>

    <div class="section">
      <div class="section-header" data-section="traffic">
        <div class="section-title">🚗 Traffic Analysis</div>
        <span class="section-icon">▼</span>
      </div>
      <div class="section-content collapsed" data-section="traffic">
        <label>Average Daily Traffic (ADT)</label>
        <input id="trafficADT" type="number" placeholder="e.g., 5000" min="0">
        <label style="margin-top:6px">Work Duration (hours)</label>
        <input id="trafficDuration" type="number" value="8" min="1" max="24">
        <button id="btn-calc-traffic" class="secondary" style="margin-top:6px;width:100%">Calculate Impact</button>
        <div id="trafficResults" style="display:none">
          <div class="traffic-result">
            <div class="traffic-result-value" id="trafficImpacted">—</div>
            <div class="traffic-result-label">Vehicles Impacted</div>
          </div>
          <div style="margin-top:6px;font-size:11px;color:var(--muted)" id="trafficRecommendation"></div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header" data-section="materials">
        <div class="section-title">📦 Material Order List</div>
        <span class="section-icon">▼</span>
      </div>
      <div class="section-content collapsed" data-section="materials">
        <div class="material-list" id="materialList">
          <div style="color:var(--muted);font-size:12px;text-align:center;padding:20px">
            Place devices to generate material list
          </div>
        </div>
        <button id="btn-export-materials" class="secondary" style="margin-top:6px;width:100%">📋 Copy to Clipboard</button>
      </div>
    </div>

    <div class="section">
      <div class="section-header" data-section="phases">
        <div class="section-title">📅 Multi-Day Phases</div>
        <span class="section-icon">▼</span>
      </div>
      <div class="section-content collapsed" data-section="phases">
        <button id="btn-add-phase" style="width:100%;margin-bottom:6px">+ Add Phase</button>
        <div class="phase-list" id="phaseList">
          <div style="color:var(--muted);font-size:12px;text-align:center;padding:20px">
            No phases yet. Click "Add Phase" to create work phases.
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-header" data-section="history">
        <div class="section-title">📚 Project History</div>
        <span class="section-icon">▼</span>
      </div>
      <div class="section-content collapsed" data-section="history">
        <div class="history-list" id="historyList">
          <div style="color:var(--muted);font-size:12px;text-align:center;padding:20px">
            No saved projects yet
          </div>
        </div>
        <button id="btn-clear-history" class="danger" style="margin-top:6px;width:100%">Clear All History</button>
      </div>
    </div>

    <div class="section">
      <div class="section-header" data-section="stats">
        <div class="section-title">📊 Statistics & Compliance</div>
        <span class="section-icon">▼</span>
      </div>
      <div class="section-content" data-section="stats">
        <div style="margin-bottom:8px">
          <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:11px">
            <span>Setup Progress</span>
            <span id="progressPercent">0%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" id="progressFill" style="width:0%">
              <span id="progressText">0%</span>
            </div>
          </div>
        </div>
        <div class="stat" id="statProjectLength">Project Length: —</div>
        <div class="stat" id="statTaperA">Taper A: —</div>
        <div class="stat" id="statTaperB">Taper B: —</div>
        <div class="stat" id="statBuffer">Buffer: —</div>
        <div class="stat" id="statAdvWarning">Adv. Warning: —</div>
        <div class="stat" id="statCones">Cones: <strong>0</strong></div>
        <div class="stat" id="statSigns">Signs: <strong>0</strong></div>
        <div class="stat" id="statEstCost" style="margin-top:8px;background:#1e293b">Est. Cost: <strong>—</strong></div>
      </div>
    </div>

  </aside>

  <div id="map"></div>
</div>

<div class="print-panel" id="printPanel">
  <h2>Traffic Management Plan</h2>
  <div style="margin-bottom:12px;font-size:13px">
    <div><strong>Prepared by:</strong> <span id="ppPreparedBy">—</span></div>
    <div><strong>Project:</strong> <span id="ppProjectName">—</span></div>
    <div><strong>Location:</strong> <span id="ppLocation">—</span></div>
    <div><strong>Date:</strong> <span id="ppDate">—</span></div>
    <div><strong>Speed Limit:</strong> <span id="ppSpeed">—</span> mph</div>
  </div>

  <div class="cols">
    <div>
      <h3>Device Inventory</h3>
      <table id="printDeviceTable">
        <thead><tr><th>Device</th><th>Quantity</th></tr></thead>
        <tbody id="printDevices"></tbody>
      </table>
    </div>
    <div>
      <h3>Cone Placement Details</h3>
      <table>
        <tr><th>Taper Spacing</th><td id="ppTaperSpacing">—</td></tr>
        <tr><th>Taper Cones</th><td id="ppTaperCones">0</td></tr>
        <tr><th>Buffer Spacing</th><td id="ppBufferSpacing">—</td></tr>
        <tr><th>Buffer Cones</th><td id="ppBufferCones">0</td></tr>
        <tr><th>Total Cones</th><td id="ppTotalCones">0</td></tr>
      </table>
    </div>
  </div>

  <h3>MUTCD Compliance Summary</h3>
  <div id="ppCompliance" style="font-size:12px;line-height:1.6"></div>

  <h3>Project Measurements</h3>
  <div id="ppMeasurements" style="font-size:12px"></div>

  <h3>Work Zone Overview</h3>
  <div style="text-align:center;margin:16px 0">
    <img id="screenshot1" style="max-width:100%;height:auto;border:2px solid #000" />
    <p style="font-size:11px;margin-top:4px;color:#666">Overview centered on work zone midpoint</p>
  </div>

  <h3>Full Work Zone Layout</h3>
  <div style="text-align:center;margin:16px 0">
    <img id="screenshot2" style="max-width:100%;height:auto;border:2px solid #000" />
    <p style="font-size:11px;margin-top:4px;color:#666">Complete view from first taper to last cone</p>
  </div>

  <div class="qr-section">
    <h3>📱 GPS-Guided Field Setup</h3>
    <div style="margin:10px 0">
      <div id="qrcode" style="display:inline-block"></div>
    </div>
    <p style="font-size:13px;margin:8px 0;max-width:500px;margin-left:auto;margin-right:auto;line-height:1.5">
      <strong>Scan this QR code</strong> with your mobile device for GPS-guided placement:
    </p>
    <ul style="font-size:12px;text-align:left;max-width:500px;margin:8px auto;line-height:1.6">
      <li><strong>Real-time navigation:</strong> Turn-by-turn directions to each device</li>
      <li><strong>Distance tracking:</strong> Live distance updates in feet</li>
      <li><strong>Compass guidance:</strong> Visual arrow pointing to target location</li>
      <li><strong>Arrival alerts:</strong> Vibration and notification when within 10 feet</li>
      <li><strong>Progress tracking:</strong> Mark devices as placed, auto-advance to next</li>
    </ul>
  </div>
</div>

<div id="fieldView">
  <div class="field-header">
    <h2 id="fieldProjectName">Work Zone Setup</h2>
    <div class="info" id="fieldProjectInfo">Loading project information...</div>
  </div>
  
  <div class="filter-bar">
    <button class="filter-btn active" data-filter="all">🎯 All Devices</button>
    <button class="filter-btn taper" data-filter="taper">🟢 Taper Cones</button>
    <button class="filter-btn buffer" data-filter="buffer">🟠 Buffer Cones</button>
    <button class="filter-btn sign" data-filter="sign">🟡 Signs</button>
  </div>
  
  <div id="fieldViewMap">
    <div id="navPanel" class="nav-panel hidden">
      <div class="nav-distance" id="navDistance">—</div>
      <div class="nav-direction" id="navDirection">
        <span id="navArrowText">⬆️</span>
        <span id="navDirectionText">Calculating route...</span>
      </div>
      <div class="nav-device" id="navDevice">
        Target: <strong id="navDeviceName">—</strong>
      </div>
    </div>
    
    <div id="compassContainer" class="compass-container" style="display:none">
      <div class="compass-arrow" id="compassArrow">⬆️</div>
      <div class="compass-accuracy" id="compassAccuracy">Calculating...</div>
    </div>
  </div>
  <div class="field-controls">
    <button id="btnLocateMe" class="secondary">📍 Start GPS</button>
    <button id="btnARMode" class="secondary">📷 AR Mode</button>
    <button id="btnNextDevice" style="background:var(--accent)">→ Next Device</button>
    <button id="btnExitField" class="secondary">Exit Setup</button>
    <div class="field-legend">
      <div class="field-legend-item">
        <div class="field-legend-dot" style="background:#22c55e"></div>
        <span>Taper</span>
      </div>
      <div class="field-legend-item">
        <div class="field-legend-dot" style="background:#f59e0b"></div>
        <span>Buffer</span>
      </div>
      <div class="field-legend-item">
        <div class="field-legend-dot" style="background:#facc15"></div>
        <span>Sign</span>
      </div>
      <div class="field-legend-item">
        <div class="field-legend-dot" style="background:#6b7280"></div>
        <span>Placed</span>
      </div>
    </div>
  </div>
  
  <div id="arView">
    <video id="arCamera" autoplay playsinline></video>
    <div class="ar-overlay">
      <div class="ar-hud">
        <div class="ar-distance" id="arDistance">—</div>
        <div class="ar-direction" id="arDirection">Initializing...</div>
        <div class="ar-tip">Point camera around to see all devices</div>
      </div>
      <div id="arDeviceContainer"></div>
      <div class="ar-reticle"></div>
      <div class="ar-arrow" id="arArrow">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color:#22c55e;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#10b981;stop-opacity:1" />
            </linearGradient>
          </defs>
          <path d="M 50 10 L 70 40 L 58 40 L 58 90 L 42 90 L 42 40 L 30 40 Z" 
                fill="url(#arrowGrad)" stroke="#fff" stroke-width="2"/>
        </svg>
      </div>
      <div id="arSnap" class="ar-snap" style="display:none">✓ PERFECT!</div>
    </div>
    <div class="ar-controls">
      <button id="btnARPlace">✓ Place Here</button>
      <button id="btnARClose">Exit AR</button>
    </div>
  </div>
</div>

<div id="qrModal" class="modal">
  <div class="modal-content">
    <div class="modal-header">📱 GPS-Guided Field Setup</div>
    <div class="modal-body">
      <div id="qrPreview"></div>
      <p style="font-size:12px;margin:12px 0;color:var(--muted);line-height:1.5">
        Scan this QR code with your mobile device to launch GPS-guided navigation. The field crew will get turn-by-turn directions, real-time distance tracking, and arrival notifications for every cone and sign placement location.
      </p>
    </div>
    <div class="modal-footer">
      <button id="btnCloseModal" class="secondary">Close</button>
    </div>
  </div>
</div>

<div id="shareModal" class="modal">
  <div class="modal-content">
    <div class="modal-header">🔗 Share Project</div>
    <div class="modal-body">
      <p style="font-size:12px;color:var(--muted);margin-bottom:12px">
        Share this work zone plan with your team:
      </p>
      <div class="share-options">
        <div class="share-btn" id="shareCopyLink">
          <div class="share-btn-icon">🔗</div>
          Copy Link
        </div>
        <div class="share-btn" id="shareQRCode">
          <div class="share-btn-icon">📱</div>
          Show QR
        </div>
        <div class="share-btn" id="shareEmail">
          <div class="share-btn-icon">📧</div>
          Email
        </div>
        <div class="share-btn" id="shareDownload">
          <div class="share-btn-icon">💾</div>
          Download
        </div>
      </div>
      <div id="shareLinkContainer" style="display:none">
        <label style="margin-top:12px;display:block;font-size:12px;color:var(--muted)">Share Link:</label>
        <div class="share-link" id="shareLink"></div>
        <button id="btnCopyShareLink" style="margin-top:8px;width:100%">📋 Copy to Clipboard</button>
      </div>
    </div>
    <div class="modal-footer">
      <button id="btnCloseShare" class="secondary">Close</button>
    </div>
  </div>
</div>

<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js"></script>
<script src="https://unpkg.com/@turf/turf@6.5.0/turf.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/tokml/0.4.0/tokml.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/qrious@4.0.2/dist/qrious.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/dom-to-image/2.6.0/dom-to-image.min.js"></script>

`;

/****************************************
 * PART 3 - UI TEMPLATE
 * END
 ****************************************/
