const CACHE_NAME = 'flix-v1.0.0'
const STATIC_CACHE = 'flix-static-v1.0.0'
const DYNAMIC_CACHE = 'flix-dynamic-v1.0.0'
const IMAGE_CACHE = 'flix-images-v1.0.0'

// Files to cache immediately
const STATIC_FILES = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  '/offline.html'
]

// API endpoints to cache
const API_CACHE_PATTERNS = [
  /^https:\/\/api\.themoviedb\.org\/3\//,
  /^https:\/\/image\.tmdb\.org\/t\/p\//
]

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static files')
        return cache.addAll(STATIC_FILES)
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static files', error)
      })
  )
  
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== IMAGE_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
  )
  
  self.clients.claim()
})

// Fetch event - serve cached content when offline
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Handle different types of requests
  if (request.method === 'GET') {
    // Handle image requests
    if (request.destination === 'image' || url.pathname.includes('/t/p/')) {
      event.respondWith(handleImageRequest(request))
      return
    }

    // Handle API requests
    if (API_CACHE_PATTERNS.some(pattern => pattern.test(request.url))) {
      event.respondWith(handleAPIRequest(request))
      return
    }

    // Handle navigation requests
    if (request.mode === 'navigate') {
      event.respondWith(handleNavigationRequest(request))
      return
    }

    // Handle other requests
    event.respondWith(handleOtherRequests(request))
  }
})

// Handle image requests with caching
async function handleImageRequest(request) {
  try {
    const cache = await caches.open(IMAGE_CACHE)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Service Worker: Image request failed', error)
    // Return a placeholder image
    return new Response(
      '<svg width="300" height="450" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" fill="#9ca3af">No Image</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    )
  }
}

// Handle API requests with network-first strategy
async function handleAPIRequest(request) {
  try {
    const cache = await caches.open(DYNAMIC_CACHE)
    
    // Try network first
    try {
      const networkResponse = await fetch(request)
      
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone())
      }
      
      return networkResponse
    } catch (networkError) {
      // Network failed, try cache
      const cachedResponse = await cache.match(request)
      
      if (cachedResponse) {
        return cachedResponse
      }
      
      // Return offline response for API calls
      return new Response(
        JSON.stringify({
          error: 'Offline',
          message: 'You are currently offline. Some content may not be available.',
          offline: true
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
  } catch (error) {
    console.error('Service Worker: API request failed', error)
    return new Response('Service Unavailable', { status: 503 })
  }
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request)
    return networkResponse
  } catch (error) {
    // Network failed, serve cached page or offline page
    const cache = await caches.open(STATIC_CACHE)
    const cachedResponse = await cache.match('/') || await cache.match('/offline.html')
    
    return cachedResponse || new Response('Offline', { status: 503 })
  }
}

// Handle other requests
async function handleOtherRequests(request) {
  try {
    const cache = await caches.open(STATIC_CACHE)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }

    const networkResponse = await fetch(request)
    
    if (networkResponse.ok) {
      const dynamicCache = await caches.open(DYNAMIC_CACHE)
      dynamicCache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('Service Worker: Request failed', error)
    return new Response('Service Unavailable', { status: 503 })
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag)
  
  if (event.tag === 'watchlist-sync') {
    event.waitUntil(syncWatchlist())
  }
})

// Sync watchlist changes when back online
async function syncWatchlist() {
  try {
    // Get pending watchlist changes from IndexedDB
    const pendingChanges = await getPendingWatchlistChanges()
    
    for (const change of pendingChanges) {
      // Sync each change with server (if you have a backend)
      console.log('Syncing watchlist change:', change)
      // await syncChangeWithServer(change)
    }
    
    // Clear pending changes after successful sync
    await clearPendingWatchlistChanges()
  } catch (error) {
    console.error('Service Worker: Failed to sync watchlist', error)
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received')
  
  const options = {
    body: 'New movies are trending! Check them out.',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/icons/explore-action.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/close-action.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('FLIX - Movie Discovery', options)
  )
})

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked')
  
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/trending')
    )
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Helper functions for IndexedDB operations
async function getPendingWatchlistChanges() {
  // Implementation would depend on your IndexedDB setup
  return []
}

async function clearPendingWatchlistChanges() {
  // Implementation would depend on your IndexedDB setup
}

// Message handling from main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
