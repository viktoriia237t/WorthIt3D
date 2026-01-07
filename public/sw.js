// Service Worker for WorthIt3D PWA
// Version: Update this on each deployment
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `worthit3d-${CACHE_VERSION}`;
const BASE_PATH = ''; // Base path is now / (empty string)

// Static assets to precache during installation
const PRECACHE_URLS = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/manifest.json`,
  `${BASE_PATH}/web-app-manifest-192x192.png`,
  `${BASE_PATH}/web-app-manifest-512x512.png`,
  `${BASE_PATH}/favicon-96x96.png`,
  `${BASE_PATH}/apple-touch-icon.png`,
  `${BASE_PATH}/favicon.svg`,
  `${BASE_PATH}/favicon.ico`,
];

// Install event: Precache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker:', CACHE_VERSION);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching static assets');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Installation complete');
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Precache failed:', error);
      })
  );
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker:', CACHE_VERSION);

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete, claiming clients');
        // Take control of all clients immediately
        return self.clients.claim();
      })
  );
});

// Fetch event: Implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(handleFetch(request));
});

// Message event: Handle skip waiting command
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Received SKIP_WAITING message');
    self.skipWaiting();
  }
});

// Fetch handler with routing logic
async function handleFetch(request) {
  const url = new URL(request.url);

  // Strategy 1: Cache-first for static assets (JS/CSS)
  if (url.pathname.match(/\/assets\/.*\.(js|css)$/)) {
    return cacheFirst(request);
  }

  // Strategy 2: Cache-first for images and icons
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|ico|webp)$/)) {
    return cacheFirst(request);
  }

  // Strategy 3: Network-first for HTML and navigation requests
  if (request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/') {
    return networkFirst(request);
  }

  // Default: Network-first with cache fallback
  return networkFirst(request);
}

// Cache-first strategy: Serve from cache, fallback to network
async function cacheFirst(request) {
  try {
    // Try to find in cache
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Not in cache, fetch from network and cache it
    const response = await fetch(request);

    // Only cache successful responses
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.error('[SW] Cache-first failed:', error);

    // Try cache as last resort
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Return offline fallback
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Network-first strategy: Try network, fallback to cache
async function networkFirst(request) {
  try {
    // Try network first
    const response = await fetch(request);

    // Cache the response for offline use
    if (response && response.status === 200) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    console.log('[SW] Network failed, falling back to cache:', request.url);

    // Network failed, try cache
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // For navigation requests, return cached index.html as fallback
    if (request.mode === 'navigate') {
      const indexCache = await caches.match('/index.html');
      if (indexCache) {
        return indexCache;
      }
    }

    // No cache available
    return new Response('Offline - No cached version available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}
