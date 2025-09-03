// Service Worker for Offline Functionality
const CACHE_NAME = 'ilc-institut-v1.0.0';
const STATIC_CACHE = 'ilc-static-v1.0.0';
const DYNAMIC_CACHE = 'ilc-dynamic-v1.0.0';

// Files to cache immediately
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/styles/main.css',
    '/styles/themes.css',
    '/js/app.js',
    '/js/database.js',
    '/js/components/dashboard.js',
    '/js/components/students.js',
    '/js/components/payments.js',
    '/js/components/settings.js',
    '/js/utils/translations.js',
    '/js/utils/helpers.js',
    '/assets/logo.svg',
    '/assets/icons.svg'
];

// Files to cache on request
const CACHE_ON_REQUEST = [
    '/manifest.json'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('Service Worker: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('Service Worker: Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Service Worker: Static assets cached');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('Service Worker: Failed to cache static assets', error);
            })
    );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Service Worker: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker: Activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-HTTP requests
    if (!request.url.startsWith('http')) {
        return;
    }
    
    // Skip external requests
    if (url.origin !== location.origin) {
        return;
    }

    event.respondWith(
        handleRequest(request)
    );
});

async function handleRequest(request) {
    const url = new URL(request.url);
    
    try {
        // For navigation requests (HTML pages)
        if (request.mode === 'navigate') {
            return await handleNavigationRequest(request);
        }
        
        // For static assets
        if (isStaticAsset(url.pathname)) {
            return await handleStaticRequest(request);
        }
        
        // For dynamic content
        return await handleDynamicRequest(request);
        
    } catch (error) {
        console.error('Service Worker: Request failed', error);
        return await handleOfflineRequest(request);
    }
}

async function handleNavigationRequest(request) {
    try {
        // Try network first for navigation
        const networkResponse = await fetch(request);
        
        // Cache successful responses
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // Fallback to cached version or offline page
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        // Return cached index.html as fallback for SPA
        const indexResponse = await caches.match('/index.html');
        if (indexResponse) {
            return indexResponse;
        }
        
        // Return basic offline response
        return new Response(
            createOfflineHTML(),
            {
                status: 200,
                statusText: 'OK',
                headers: {
                    'Content-Type': 'text/html'
                }
            }
        );
    }
}

async function handleStaticRequest(request) {
    // Cache first strategy for static assets
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
    } catch (error) {
        // For missing static assets, return a placeholder or error response
        if (request.url.includes('.svg')) {
            return createPlaceholderSVG();
        }
        
        throw error;
    }
}

async function handleDynamicRequest(request) {
    try {
        // Network first for dynamic content
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            // Only cache GET requests
            if (request.method === 'GET') {
                cache.put(request, networkResponse.clone());
            }
        }
        
        return networkResponse;
    } catch (error) {
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

async function handleOfflineRequest(request) {
    // Return cached version if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // Return appropriate offline response based on request type
    const url = new URL(request.url);
    
    if (request.headers.get('accept')?.includes('text/html')) {
        // HTML request - return offline page
        const offlineResponse = await caches.match('/index.html');
        return offlineResponse || new Response(createOfflineHTML(), {
            headers: { 'Content-Type': 'text/html' }
        });
    }
    
    if (url.pathname.includes('.svg')) {
        return createPlaceholderSVG();
    }
    
    // Generic offline response
    return new Response('Offline', {
        status: 503,
        statusText: 'Service Unavailable'
    });
}

function isStaticAsset(pathname) {
    return pathname.endsWith('.css') ||
           pathname.endsWith('.js') ||
           pathname.endsWith('.svg') ||
           pathname.endsWith('.png') ||
           pathname.endsWith('.jpg') ||
           pathname.endsWith('.jpeg') ||
           pathname.endsWith('.gif') ||
           pathname.endsWith('.webp') ||
           pathname.endsWith('.ico') ||
           pathname.endsWith('.woff') ||
           pathname.endsWith('.woff2') ||
           pathname.endsWith('.ttf') ||
           pathname.endsWith('.otf');
}

function createOfflineHTML() {
    return `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>I.L.C Institut - Mode Hors Ligne</title>
            <style>
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    margin: 0;
                    padding: 20px;
                    background: #f8fafc;
                    color: #1e293b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                }
                .offline-container {
                    text-align: center;
                    max-width: 400px;
                    padding: 40px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .offline-icon {
                    font-size: 48px;
                    margin-bottom: 20px;
                }
                h1 {
                    color: #2563eb;
                    margin-bottom: 10px;
                }
                p {
                    color: #64748b;
                    line-height: 1.6;
                }
                .retry-btn {
                    background: #2563eb;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    cursor: pointer;
                    margin-top: 20px;
                }
                .retry-btn:hover {
                    background: #1d4ed8;
                }
            </style>
        </head>
        <body>
            <div class="offline-container">
                <div class="offline-icon">📱</div>
                <h1>Mode Hors Ligne</h1>
                <p>Vous êtes actuellement hors ligne. L'application I.L.C Institut fonctionne en mode hors ligne avec vos données locales.</p>
                <button class="retry-btn" onclick="window.location.reload()">
                    Réessayer
                </button>
            </div>
        </body>
        </html>
    `;
}

function createPlaceholderSVG() {
    const svg = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" fill="#e2e8f0"/>
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#64748b" stroke-width="2" stroke-linejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="#64748b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
    `;
    
    return new Response(svg, {
        headers: {
            'Content-Type': 'image/svg+xml',
            'Cache-Control': 'max-age=86400'
        }
    });
}

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync triggered', event.tag);
    
    if (event.tag === 'data-sync') {
        event.waitUntil(syncData());
    }
});

async function syncData() {
    try {
        console.log('Service Worker: Syncing data...');
        // In a real application, this would sync local changes to a server
        // For now, just log that sync would happen
        console.log('Service Worker: Data sync completed');
    } catch (error) {
        console.error('Service Worker: Data sync failed', error);
    }
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push notification received');
    
    const options = {
        body: event.data ? event.data.text() : 'Notification from I.L.C Institut',
        icon: '/assets/logo.svg',
        badge: '/assets/logo.svg',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'explore',
                title: 'Ouvrir l\'application',
                icon: '/assets/logo.svg'
            },
            {
                action: 'close',
                title: 'Fermer',
                icon: '/assets/logo.svg'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification('I.L.C Institut', options)
    );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification clicked', event.action);
    
    event.notification.close();
    
    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handling for communication with the main application
self.addEventListener('message', (event) => {
    console.log('Service Worker: Message received', event.data);
    
    if (event.data && event.data.type) {
        switch (event.data.type) {
            case 'SKIP_WAITING':
                self.skipWaiting();
                break;
            case 'GET_VERSION':
                event.ports[0].postMessage({ version: CACHE_NAME });
                break;
            case 'CLEAR_CACHE':
                clearAllCaches()
                    .then(() => event.ports[0].postMessage({ success: true }))
                    .catch((error) => event.ports[0].postMessage({ error: error.message }));
                break;
        }
    }
});

async function clearAllCaches() {
    const cacheNames = await caches.keys();
    return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
    );
}

// Periodic cache cleanup
self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'cache-cleanup') {
        event.waitUntil(cleanupOldCache());
    }
});

async function cleanupOldCache() {
    try {
        const cache = await caches.open(DYNAMIC_CACHE);
        const requests = await cache.keys();
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        const now = Date.now();
        
        for (const request of requests) {
            const response = await cache.match(request);
            const dateHeader = response.headers.get('date');
            
            if (dateHeader) {
                const responseDate = new Date(dateHeader).getTime();
                if (now - responseDate > maxAge) {
                    await cache.delete(request);
                    console.log('Service Worker: Cleaned up old cache entry', request.url);
                }
            }
        }
    } catch (error) {
        console.error('Service Worker: Cache cleanup failed', error);
    }
}

console.log('Service Worker: Loaded successfully');
