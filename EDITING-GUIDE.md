# Quick Edit Reference Guide

## Common Editing Tasks

### 🎨 **Change Colors or Styling**
**File:** `styles.css`
- Lines 10-17: Color theme variables (dark mode)
- Lines 11-42: Light mode overrides
- Lines 51-58: Section styling
- Lines 67-72: Button styles

### 🗺️ **Modify Map Settings**
**File:** `map-core.js`
- Line 1: Change default map center and zoom
- Lines 3-19: Add/remove base layer options
- Lines 36-38: Add custom map controls

### 📐 **Adjust MUTCD Calculations**
**File:** `calculations.js`
- Lines 6-14: Buffer spacing rules by speed
- Lines 15-17: Station interval calculations
- Lines 18-25: Advance warning distances
- Lines 94-250: Cone placement algorithm

### 🚧 **Add New Sign Types**
**File:** `ui-template.js`
- Lines 140-160: Sign palette (add new sign-pill divs)

**File:** `config.js`
- Lines 68-75: DEVICE_COSTS (add pricing for new signs)

**File:** `device-management.js`
- Search for "ROAD WORK AHEAD" to see sign placement logic

### 📱 **Modify GPS/Field Mode**
**File:** `field-view.js`
- Lines 1-100: GPS tracking setup
- Lines 200-300: Navigation panel updates
- Lines 400-500: AR mode functionality
- Lines 600-700: Device placement logic

### 💾 **Change Save/Export Format**
**File:** `data-persistence.js`
- Lines 1-100: Save/load functions
- Lines 200-300: GeoJSON export
- Lines 300-400: KML export
- Lines 400-500: CSV export

### 🌤️ **Customize Weather Display**
**File:** `weather.js`
- Lines 1-30: Weather API fetch
- Lines 31-50: Weather display update
- Lines 51-70: Weather icon mapping

### 🎯 **Modify UI Controls**
**File:** `ui-controls.js`
- Lines 1-100: Button click handlers
- Lines 100-200: Search functionality
- Lines 200-300: Phase management
- Lines 300-400: Material tracking

## Feature Locations

| Feature | Primary File | Supporting Files |
|---------|-------------|------------------|
| Map Display | map-core.js | styles.css |
| Cone Placement | device-management.js | calculations.js |
| Sign Placement | device-management.js | ui-template.js |
| GPS Navigation | field-view.js | utilities.js |
| Save/Load | data-persistence.js | config.js |
| Weather | weather.js | ui-template.js |
| Theme Toggle | config.js | styles.css |
| Calculations | calculations.js | - |
| UI Layout | ui-template.js | styles.css |
| Export Data | data-persistence.js | - |
| Print/Report | ui-controls.js | data-persistence.js |

## Variable Reference

### Global Variables (accessible across files)

**Map Related:**
- `map` - Leaflet map instance
- `line` - Current polyline
- `coneLayer` - Cone markers layer
- `signLayer` - Sign markers layer
- `drawnItems` - Drawn polylines

**State Variables:**
- `measureMode` - Boolean for measure tool
- `currentWeatherData` - Weather API data
- `lastTaperSpacingFt` - Last calculated taper spacing
- `lastBufferSpacingFt` - Last calculated buffer spacing

**DOM Elements:**
- `speedEl` - Speed limit input
- `spacingEl` - Taper spacing input
- `bufferSpacingEl` - Buffer spacing input
- `scaleEl` - Icon scale input

## Testing After Edits

1. **Test locally:** Open `index.html` in a browser
2. **Check console:** Look for JavaScript errors (F12)
3. **Test all modes:**
   - Draw a line
   - Place cones
   - Add signs
   - Test GPS mode
   - Try save/load
4. **Test responsive:** Resize window to test mobile layout

## Debugging Tips

- Use browser DevTools (F12) to inspect elements
- Check Console for errors
- Use Network tab to monitor API calls
- Add `console.log()` statements to track execution
- Test in multiple browsers (Chrome, Firefox, Safari)

## Performance Optimization

**If the app feels slow:**
- Reduce map animation in `map-core.js`
- Limit number of cones in `calculations.js`
- Optimize marker creation in `device-management.js`
- Reduce auto-save frequency in `data-persistence.js`

## Security Notes

- Never commit API keys to version control
- Use HTTPS for production deployment
- Sanitize user inputs in search and forms
- Review third-party library versions regularly
