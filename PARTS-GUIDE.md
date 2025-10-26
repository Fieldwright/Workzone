# 📋 CODE PARTS REFERENCE GUIDE

## Quick Part Lookup

| Part # | File | Description | Lines | Size |
|--------|------|-------------|-------|------|
| **PART 0** | styles.css | CSS Styles | ~337 | 27KB |
| **PART 2** | config.js | Configuration & Constants | ~80 | 2.2KB |
| **PART 3** | ui-template.js | HTML Structure | ~475 | 22KB |
| **PART 4** | ui-setup.js | UI Initialization | ~25 | 1.2KB |
| **PART 5** | map-core.js | Leaflet Map Setup | ~80 | 2.5KB |
| **PART 6** | weather.js | Weather Integration | ~50 | 2.1KB |
| **PART 7** | calculations.js | MUTCD Calculations | ~536 | 22KB |
| **PART 8** | device-management.js | Device Placement | ~901 | 32KB |
| **PART 9** | ui-controls.js | Event Handlers | ~501 | 13KB |
| **PART 10** | data-persistence.js | Save/Load/Export | ~401 | 15KB |
| **PART 11** | field-view.js | GPS Field Mode | ~496 | 16KB |
| **PART 12** | utilities.js | Helper Functions | ~49 | 1.5KB |
| **PART 13** | app-init.js | Application Startup | ~32 | 1KB |

---

## How to Find and Replace Code

### Method 1: Search for START/END Markers

Each file has clear markers like this:

```javascript
/****************************************
 * PART 7 - CALCULATIONS & MUTCD COMPLIANCE
 * START
 * 
 * MUTCD calculation functions:
 * - Speed-based buffer spacing
 * - Station interval calculations
 * ...
 ****************************************/

// YOUR CODE HERE

/****************************************
 * PART 7 - CALCULATIONS & MUTCD COMPLIANCE
 * END
 ****************************************/
```

**To replace code:**
1. Open the file (e.g., `calculations.js`)
2. Find the `START` marker
3. Select everything between `START` and `END`
4. Replace with your new code
5. Keep the START/END markers intact

---

## Part-by-Part Details

### PART 0 - CSS STYLES (styles.css)

**Location:** `styles.css`

**Contains:**
```
/**************************************** START ****************************************/
- CSS Variables (colors: --bg, --accent, --success, etc.)
- Light mode overrides
- Layout styles (grid, flexbox)
- Component styles (buttons, inputs, sections)
- Map customization (Leaflet controls)
- Device markers (cones, signs)
- Field view GPS mode styles
- Animations (@keyframes)
- Print styles (@media print)
- Responsive design (@media queries)
/**************************************** END ****************************************/
```

**To modify colors:**
```css
:root { 
  --bg:#0b1020;        /* Change this */
  --accent: #60a5fa;   /* Or this */
}
```

---

### PART 2 - CONFIGURATION (config.js)

**Location:** `config.js`

**Contains:**
```
/**************************************** START ****************************************/
- Service Worker setup
- Online/offline detection
- Theme toggle (dark/light)
- Constants: FT_TO_M, LANE_WIDTH_FT
- DEVICE_COSTS object
- toUrlSafeBase64() function
- fromUrlSafeBase64() function
/**************************************** END ****************************************/
```

**To add a new device cost:**
```javascript
const DEVICE_COSTS = {
  'Cone': 15,
  'YOUR NEW SIGN': 250,  // Add here
  'default': 100
};
```

---

### PART 3 - UI TEMPLATE (ui-template.js)

**Location:** `ui-template.js`

**Contains:**
```
/**************************************** START ****************************************/
- Sidebar HTML structure
- Search section
- Project info inputs
- Speed & spacing controls
- Tools buttons
- Sign palette (all draggable signs)
- Stats display
- Phase management UI
- Material tracking
- History panel
- Print panel
- Field view layout
- QR modal
- Share modal
/**************************************** END ****************************************/
```

**To add a new sign to the palette:**
Find this section and add a new line:
```html
<div class="sign-pill" draggable="true" data-sign="NEW SIGN">NEW SIGN</div>
```

---

### PART 4 - UI SETUP (ui-setup.js)

**Location:** `ui-setup.js`

**Contains:**
```
/**************************************** START ****************************************/
- DOM element references (speedEl, spacingEl, etc.)
- Collapsible section handlers
- Mobile menu toggle
- Initial date setting
/**************************************** END ****************************************/
```

**Common edit:** Add new element references
```javascript
const myNewElement = document.getElementById('myNewId');
```

---

### PART 5 - MAP CORE (map-core.js)

**Location:** `map-core.js`

**Contains:**
```
/**************************************** START ****************************************/
- L.map() initialization
- Base layers (Satellite, Hybrid, Street, Topo)
- Street labels overlay
- L.control.layers() setup
- L.control.scale() setup
- Base layer change events
- Feature groups (drawnItems, coneLayer, signLayer, etc.)
- Drawing controls
- Draw event handlers
/**************************************** END ****************************************/
```

**To change default map center:**
```javascript
const map = L.map('map', { minZoom: 3, maxZoom: 22 })
  .setView([YOUR_LAT, YOUR_LNG], ZOOM_LEVEL);
```

---

### PART 6 - WEATHER (weather.js)

**Location:** `weather.js`

**Contains:**
```
/**************************************** START ****************************************/
- currentWeatherData variable
- fetchWeather() function
- updateWeatherDisplay() function
- getWeatherInfo() function (weather codes)
/**************************************** END ****************************************/
```

**To change weather API:**
```javascript
const url = `https://YOUR-WEATHER-API.com/endpoint?...`;
```

---

### PART 7 - CALCULATIONS (calculations.js)

**Location:** `calculations.js`

**Contains:**
```
/**************************************** START ****************************************/
- lastTaperSpacingFt, lastBufferSpacingFt variables
- getMutcdBufferSpacingFt() - spacing by speed
- getStationIntervalFt() - station distances
- getAdvanceWarningDistance() - warning sign placement
- handleSpeedChange() - speed input handler
- updateStats() - statistics calculation
- updateBadges() - cone placement algorithm
- calculateTaperLength() - taper math
- Station labeling functions
/**************************************** END ****************************************/
```

**To modify MUTCD spacing rules:**
```javascript
function getMutcdBufferSpacingFt(speed){
  const s = Math.max(10, Math.min(85, +speed||0));
  if (s <= 25) return 25;  // Change these values
  if (s <= 60) return Math.round(s/5)*5;
  return 65;
}
```

---

### PART 8 - DEVICE MANAGEMENT (device-management.js)

**Location:** `device-management.js`

**Contains:**
```
/**************************************** START ****************************************/
- Cone marker creation functions
- Sign marker creation and drag-drop
- Device popup generation
- Layer management
- Clear functions (clearCones, clearSigns, clearAll)
- Device rotation tools
- Station label placement
- Arrow boards
- Device counting
/**************************************** END ****************************************/
```

**Common task:** Modify cone appearance
Search for "cone HTML creation" within this section

---

### PART 9 - UI CONTROLS (ui-controls.js)

**Location:** `ui-controls.js`

**Contains:**
```
/**************************************** START ****************************************/
- Button click handlers (btn-save, btn-load, etc.)
- Address search function
- Phase management (create, edit, delete, load)
- Material tracking calculations
- Traffic flow calculator
- Modal controls (open/close)
- Measure tool toggle
- Print/report generation
/**************************************** END ****************************************/
```

**To add a new button handler:**
```javascript
document.getElementById('btn-mynew').addEventListener('click', () => {
  // Your code here
});
```

---

### PART 10 - DATA PERSISTENCE (data-persistence.js)

**Location:** `data-persistence.js`

**Contains:**
```
/**************************************** START ****************************************/
- saveProject() - LocalStorage save
- loadProject() - LocalStorage load
- autoSave() - periodic saving
- History management functions
- exportGeoJSON() - GeoJSON export
- exportKML() - KML export
- exportCSV() - CSV export
- generateQR() - QR code creation
- Cloud sync/sharing functions
- Screenshot generation
/**************************************** END ****************************************/
```

**To modify save format:**
Find the `saveProject()` function and edit the data structure

---

### PART 11 - FIELD VIEW (field-view.js)

**Location:** `field-view.js`

**Contains:**
```
/**************************************** START ****************************************/
- checkFieldViewMode() - mode detection
- Field view initialization
- GPS tracking functions
- Distance calculations
- Navigation panel updates
- Compass/heading display
- AR mode functions
- Device placement tracking
- Filter controls (taper/buffer/signs)
- Progress monitoring
- Arrival notifications
- Completion celebrations
/**************************************** END ****************************************/
```

**To change GPS accuracy threshold:**
Search for "10 feet" or distance thresholds in this section

---

### PART 12 - UTILITIES (utilities.js)

**Location:** `utilities.js`

**Contains:**
```
/**************************************** START ****************************************/
- showQuickNotification() - toast messages
- showConfetti() - celebration animation
- Sound effect functions
- Visual feedback helpers
/**************************************** END ****************************************/
```

**To customize notifications:**
```javascript
function showQuickNotification(message) {
  // Edit the styling or duration here
}
```

---

### PART 13 - APP INITIALIZATION (app-init.js)

**Location:** `app-init.js`

**Contains:**
```
/**************************************** START ****************************************/
- Field view mode check
- updateStats() call
- updateBadges() call
- updateHistoryDisplay() call
- loadPhases() call
- loadAutoSave() call
- checkForSharedProject() call
- Auto-save interval setup
- Geolocation request
- Console logging
/**************************************** END ****************************************/
```

**To add startup code:**
Add your initialization code before the END marker

---

## 🔄 Complete Code Replacement Workflow

### Example: Updating Speed Calculation

1. **Identify the part:** Speed calculations are in PART 7
2. **Open the file:** `calculations.js`
3. **Find the section:**
   ```javascript
   /**************************************** PART 7 - START ****************************************/
   ```
4. **Locate the function:** `getMutcdBufferSpacingFt()`
5. **Make your changes:**
   ```javascript
   if (s <= 30) return 30;  // Changed from 25
   ```
6. **Verify END marker is intact:**
   ```javascript
   /**************************************** PART 7 - END ****************************************/
   ```
7. **Save and test:** Open `index.html` in browser

---

## 🎯 Quick Edit Scenarios

### Scenario 1: Change App Colors
- **File:** `styles.css` (PART 0)
- **Find:** `:root {` or `body.light-mode {`
- **Edit:** CSS variables
- **Between:** START and END markers

### Scenario 2: Add New Button
- **File 1:** `ui-template.js` (PART 3) - Add HTML
- **File 2:** `ui-controls.js` (PART 9) - Add handler
- **Both:** Between their respective START/END markers

### Scenario 3: Modify GPS Behavior
- **File:** `field-view.js` (PART 11)
- **Find:** GPS-related functions
- **Edit:** Between START and END

### Scenario 4: Change Save Format
- **File:** `data-persistence.js` (PART 10)
- **Find:** `saveProject()` function
- **Edit:** Data structure
- **Between:** START and END markers

---

## ⚠️ Important Rules

1. **NEVER delete START/END markers**
2. **Keep part numbers consistent**
3. **All edits go between START and END**
4. **Test after each change**
5. **Back up before major edits**

---

## 🔍 Search Tips

### In your editor:
- Search for: `PART 7 - START` to find beginning
- Search for: `PART 7 - END` to find end
- Search for: `function nameYouWant` within the part

### Using grep (command line):
```bash
grep -n "PART 7" calculations.js
```

---

## ✅ Verification Checklist

After editing:
- [ ] START marker still present
- [ ] END marker still present
- [ ] Part number unchanged
- [ ] Code between markers
- [ ] No syntax errors
- [ ] File saved
- [ ] Browser refreshed
- [ ] Feature tested

---

## 📞 Quick Reference Card

```
PART 0  → styles.css          → Visual appearance
PART 2  → config.js            → Settings & constants
PART 3  → ui-template.js       → HTML structure
PART 4  → ui-setup.js          → UI initialization
PART 5  → map-core.js          → Leaflet map
PART 6  → weather.js           → Weather data
PART 7  → calculations.js      → MUTCD math
PART 8  → device-management.js → Cones & signs
PART 9  → ui-controls.js       → Button handlers
PART 10 → data-persistence.js  → Save/load/export
PART 11 → field-view.js        → GPS mode
PART 12 → utilities.js         → Helper functions
PART 13 → app-init.js          → Startup
```

Print this card and keep it handy! 🎯
