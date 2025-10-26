# File Structure Overview

```
work-zone-planner/
│
├── index.html                  (Entry point - loads all modules)
│
├── styles.css                  (All styling - 27KB)
│   ├── CSS Variables (colors, spacing)
│   ├── Layout (grid, flexbox)
│   ├── Components (buttons, inputs, cards)
│   ├── Map styling (Leaflet customization)
│   ├── Device markers (cones, signs)
│   ├── Field view (GPS mode)
│   ├── Animations (keyframes)
│   └── Print styles (@media print)
│
├── config.js                   (Configuration - 2.2KB)
│   ├── Service Worker setup
│   ├── Theme management (dark/light)
│   ├── Constants (FT_TO_M, costs)
│   └── Base64 utilities
│
├── ui-template.js              (HTML template - 22KB)
│   ├── Sidebar structure
│   ├── Control panels
│   ├── Sign palette
│   ├── Modals (QR, share)
│   └── Field view layout
│
├── ui-setup.js                 (UI initialization - 1.2KB)
│   ├── DOM element references
│   ├── Collapsible sections
│   └── Mobile menu
│
├── map-core.js                 (Map setup - 2.5KB)
│   ├── Leaflet initialization
│   ├── Base layers (satellite, street, topo)
│   ├── Drawing controls
│   ├── Scale and zoom controls
│   └── Layer switching
│
├── weather.js                  (Weather integration - 2.1KB)
│   ├── API calls (Open-Meteo)
│   ├── Display widget
│   └── Icon mapping
│
├── calculations.js             (MUTCD logic - 22KB)
│   ├── Speed-based spacing
│   ├── Taper length calculation
│   ├── Buffer zone calculation
│   ├── Station labeling
│   ├── Stats updates
│   └── Badge generation
│
├── device-management.js        (Placement logic - 32KB)
│   ├── Cone placement functions
│   ├── Sign drag-and-drop
│   ├── Marker creation
│   ├── Layer management
│   ├── Popup generation
│   └── Device clearing
│
├── ui-controls.js              (Event handlers - 13KB)
│   ├── Button click handlers
│   ├── Address search
│   ├── Phase management
│   ├── Material tracking
│   ├── Traffic calculator
│   └── Modal controls
│
├── data-persistence.js         (Save/Export - 15KB)
│   ├── LocalStorage save/load
│   ├── Auto-save
│   ├── History management
│   ├── GeoJSON export
│   ├── KML export
│   ├── CSV export
│   ├── QR code generation
│   └── Cloud sync/sharing
│
├── field-view.js               (GPS mode - 16KB)
│   ├── GPS tracking
│   ├── Distance calculation
│   ├── Navigation panel
│   ├── Compass guidance
│   ├── AR mode
│   ├── Device placement tracking
│   ├── Progress monitoring
│   └── Filters (taper/buffer/signs)
│
├── utilities.js                (Helpers - 1.5KB)
│   ├── Notifications
│   ├── Confetti animation
│   └── Sound effects
│
├── app-init.js                 (Startup - 1KB)
│   ├── Initialize stats
│   ├── Load auto-save
│   ├── Check shared projects
│   ├── Request geolocation
│   └── Console logging
│
├── README.md                   (Main documentation)
│   ├── File structure explanation
│   ├── How to reassemble
│   ├── Editing guide
│   └── Dependencies
│
└── EDITING-GUIDE.md           (Quick reference)
    ├── Common editing tasks
    ├── Feature locations
    ├── Variable reference
    └── Debugging tips
```

## Module Dependencies

```
index.html
  └── loads in order:
      1. config.js (no dependencies)
      2. ui-template.js (uses: config)
      3. ui-setup.js (uses: ui-template)
      4. map-core.js (uses: config)
      5. weather.js (uses: ui-setup, map-core)
      6. calculations.js (uses: map-core, config)
      7. device-management.js (uses: map-core, calculations, config)
      8. ui-controls.js (uses: all above)
      9. data-persistence.js (uses: all above)
      10. field-view.js (uses: all above)
      11. utilities.js (no dependencies)
      12. app-init.js (uses: all above)
```

## File Size Distribution

```
Total: ~165KB (uncompressed)

Largest files:
  device-management.js    32KB  (19.4%)
  styles.css              27KB  (16.4%)
  calculations.js         22KB  (13.3%)
  ui-template.js          22KB  (13.3%)
  field-view.js           16KB  (9.7%)
  data-persistence.js     15KB  (9.1%)
  ui-controls.js          13KB  (7.9%)
  
Smaller files:
  README.md + guides      8.6KB (5.2%)
  Other JS files          9.4KB (5.7%)
```

## Code Organization Philosophy

**Separation of Concerns:**
- **config.js**: Constants and utilities only
- **map-core.js**: Pure map functionality
- **calculations.js**: Business logic (no DOM manipulation)
- **device-management.js**: Device creation and management
- **ui-controls.js**: Event handlers and user interactions
- **data-persistence.js**: Data I/O operations
- **field-view.js**: GPS/AR functionality (self-contained)

**Benefits:**
1. Easy to locate specific functionality
2. Minimal cross-file dependencies
3. Testable modules
4. Reusable code
5. Clear responsibility boundaries

## External Dependencies

**CDN Libraries (loaded in index.html):**
- Leaflet 1.9.4 (~150KB)
- Leaflet Draw 1.0.4 (~50KB)
- QRCode.js 1.0.0 (~20KB)

**Total Page Weight:** ~385KB (first load, with caching)
