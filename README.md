# Work Zone Planner Pro - Modular Code Structure

## Overview
The original single-file HTML application has been broken down into separate, manageable modules for easier editing and maintenance.

## File Structure

### Core Files
- **index.html** - Main HTML file that imports all modules
- **styles.css** - All CSS styling (extracted from `<style>` tag)

### JavaScript Modules (loaded in order)

1. **config.js**
   - Service worker for offline support
   - Theme management (dark/light mode)
   - Constants (FT_TO_M, LANE_WIDTH_FT, DEVICE_COSTS)
   - URL-safe Base64 encoding/decoding utilities

2. **ui-template.js**
   - HTML template for sidebar and modals
   - Injects UI structure into the DOM

3. **ui-setup.js**
   - DOM element references
   - Collapsible section handlers
   - Mobile menu toggle

4. **map-core.js**
   - Leaflet map initialization
   - Base layers (Satellite, Hybrid, Street, Topo)
   - Map controls (zoom, scale, layers)
   - Drawing controls
   - Map event handlers

5. **weather.js**
   - Weather data fetching from Open-Meteo API
   - Weather display widget
   - Weather icon mapping

6. **calculations.js**
   - MUTCD spacing calculations
   - Speed limit handlers
   - Taper and buffer calculations
   - Station interval calculations
   - Stats and badge updates

7. **device-management.js**
   - Cone placement functions
   - Sign placement and drag-drop
   - Device clearing functions
   - Layer management
   - Device popups and markers

8. **ui-controls.js**
   - Button event handlers
   - Search functionality
   - Phase management
   - Material tracking
   - Modal controls

9. **data-persistence.js**
   - Project save/load functionality
   - Export functions (GeoJSON, KML, CSV)
   - Auto-save
   - History management
   - Cloud sync and sharing
   - QR code generation

10. **field-view.js**
    - GPS-guided field placement mode
    - Distance tracking
    - Navigation panel
    - AR mode
    - Device placement tracking
    - Progress monitoring

11. **utilities.js**
    - Quick notifications
    - Confetti animation
    - Success sounds
    - Helper functions

12. **app-init.js**
    - Application startup code
    - Initial data loading
    - Feature logging

## How to Reassemble

### Option 1: Use the Modular Structure (Recommended)
Simply open `index.html` in a web browser. All modules will be loaded automatically in the correct order.

### Option 2: Create a Single File Again
To recreate the original single-file structure:

```bash
# Combine all files into one HTML file
cat > work-zone-planner-combined.html << 'EOF'
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Work Zone Planner Pro - Enhanced Edition</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<link rel="stylesheet" href="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css">
<style>
EOF

# Append CSS
cat styles.css >> work-zone-planner-combined.html

# Close style tag and add body content
cat >> work-zone-planner-combined.html << 'EOF'
</style>
</head>
<body>
<!-- Body content from ui-template.js -->
<!-- External library scripts -->
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js"></script>
<script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
<script>
EOF

# Append all JavaScript modules in order
for file in config.js ui-template.js ui-setup.js map-core.js weather.js calculations.js device-management.js ui-controls.js data-persistence.js field-view.js utilities.js app-init.js; do
  cat "$file" >> work-zone-planner-combined.html
done

# Close script and body tags
cat >> work-zone-planner-combined.html << 'EOF'
</script>
</body>
</html>
EOF
```

## Editing Guide

### To modify styling:
Edit `styles.css`

### To change UI layout:
Edit `ui-template.js`

### To adjust calculations:
Edit `calculations.js`

### To modify device placement:
Edit `device-management.js`

### To change map behavior:
Edit `map-core.js`

### To update GPS/field mode:
Edit `field-view.js`

## Benefits of Modular Structure

1. **Easier Navigation** - Find specific functionality quickly
2. **Isolated Testing** - Test individual modules independently
3. **Team Collaboration** - Multiple developers can work on different modules
4. **Code Reusability** - Import modules into other projects
5. **Maintainability** - Easier to update and debug
6. **Version Control** - Better Git diffs and merge conflict resolution

## Dependencies

### External Libraries (loaded via CDN):
- Leaflet 1.9.4 (mapping)
- Leaflet Draw 1.0.4 (drawing tools)
- QRCode.js 1.0.0 (QR code generation)

### APIs Used:
- Open-Meteo API (weather data)
- OpenStreetMap tiles
- ArcGIS/Esri tiles (satellite imagery)

## Notes

- All modules must be loaded in the specified order for proper dependency resolution
- The application uses modern JavaScript (ES6+)
- Service worker requires HTTPS in production for full offline support
- GPS features require user permission and HTTPS

## Support

For questions or issues, refer to the inline code comments in each module.
