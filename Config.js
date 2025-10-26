/****************************************
 * PART 2 - CONFIGURATION & CONSTANTS
 * START
 * 
 * Contains:
 * - Service Worker for offline support
 * - Online/Offline detection
 * - Theme management (dark/light mode)
 * - Application constants (FT_TO_M, LANE_WIDTH_FT)
 * - Device costs
 * - URL-safe Base64 encoding/decoding
 ****************************************/

if ('serviceWorker' in navigator) {
  const swCode = `
    const CACHE_NAME = 'work-zone-v1';
    const urlsToCache = ['/'];
    
    self.addEventListener('install', event => {
      event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
      );
    });
    
    self.addEventListener('fetch', event => {
      event.respondWith(
        caches.match(event.request).then(response => response || fetch(event.request))
      );
    });
  `;
  
  const blob = new Blob([swCode], { type: 'application/javascript' });
  const swUrl = URL.createObjectURL(blob);
  
  navigator.serviceWorker.register(swUrl).catch(() => {
    console.log('Service worker registration failed - offline mode limited');
  });
}

window.addEventListener('online', () => {
  document.getElementById('offlineBanner').classList.remove('show');
});

window.addEventListener('offline', () => {
  document.getElementById('offlineBanner').classList.add('show');
});

function initTheme() {
  const saved = localStorage.getItem('theme') || 'dark';
  if (saved === 'light') {
    document.body.classList.add('light-mode');
    document.getElementById('themeToggle').textContent = '☀️';
  }
}

document.getElementById('themeToggle').addEventListener('click', () => {
  const isLight = document.body.classList.toggle('light-mode');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  document.getElementById('themeToggle').textContent = isLight ? '☀️' : '🌙';
});

initTheme();

const FT_TO_M = 0.3048;
const LANE_WIDTH_FT = 12;

const DEVICE_COSTS = {
  'Cone': 15,
  'ROAD WORK AHEAD': 150,
  'FLAGGER': 0,
  'BARRICADE 8 FT': 75,
  'ARROW BOARD': 2500,
  'CHANGEABLE MESSAGE': 8000,
  'default': 100
};

// URL-safe Base64 encoding/decoding
function toUrlSafeBase64(str) {
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromUrlSafeBase64(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return atob(str);
}


/****************************************
 * PART 2 - CONFIGURATION & CONSTANTS
 * END
 ****************************************/
