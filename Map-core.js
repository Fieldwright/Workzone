/****************************************
 * PART 5 - MAP CORE
 * START
 * 
 * Leaflet map initialization:
 * - Map instance creation
 * - Base layers (Satellite, Hybrid, Street, Topo)
 * - Street labels overlay
 * - Layer control
 * - Scale control
 * - Feature groups (drawn items, cones, signs, etc.)
 * - Drawing controls
 * - Map event handlers
 ****************************************/

const map = L.map('map', { minZoom: 3, maxZoom: 22 }).setView([39.5,-98.35], 5);

const baseLayers = {
  'Satellite': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri',
    maxZoom: 22
  }),
  'Hybrid (Labels)': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri',
    maxZoom: 22
  }),
  'Street Map': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }),
  'Topo Map': L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles © Esri',
    maxZoom: 19
  })
};

const streetLabels = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}', {
  attribution: '',
  maxZoom: 22
});

baseLayers['Satellite'].addTo(map);

const layerControl = L.control.layers(baseLayers, null, {
  position: 'topright',
  collapsed: false
}).addTo(map);

L.control.scale({
  position: 'bottomleft',
  imperial: true,
  metric: true
}).addTo(map);

map.on('baselayerchange', function(e) {
  if (e.name === 'Hybrid (Labels)') {
    streetLabels.addTo(map);
  } else {
    if (map.hasLayer(streetLabels)) {
      map.removeLayer(streetLabels);
    }
  }
});

const drawnItems = new L.FeatureGroup().addTo(map);
const coneLayer  = new L.FeatureGroup().addTo(map);
const labelLayer = new L.FeatureGroup().addTo(map);
const signLayer  = new L.FeatureGroup().addTo(map);
const badgeLayer = new L.FeatureGroup().addTo(map);
const measureLayer = new L.FeatureGroup().addTo(map);

let line = null;
let measureMode = false;
let measurePoints = [];

const drawControl = new L.Control.Draw({
  edit: { featureGroup: drawnItems },
  draw: { polygon:false, rectangle:false, circle:false, marker:false, circlemarker:false,
    polyline:{shapeOptions:{color:'#22d3ee',weight:4}}
  }
});
map.addControl(drawControl);

map.on(L.Draw.Event.CREATED, e => {
  if (e.layerType === 'polyline') {
    if (line) drawnItems.removeLayer(line);
    line = e.layer;
    drawnItems.addLayer(line);
    map.fitBounds(line.getBounds(), {padding:[20,20]});
    updateStats();
    updateBadges();
  }
});
map.on('draw:edited', () => { updateStats(); updateBadges(); });

/****************************************
 * PART 5 - MAP CORE
 * END
 ****************************************/
