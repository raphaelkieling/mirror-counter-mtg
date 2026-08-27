const CACHE_VERSION = 'v1'
const CACHE_NAME = `counters-${CACHE_VERSION}`
const RUNTIME_CACHE = `counters-runtime-${CACHE_VERSION}`

const ASSETS_TO_CACHE = [
  '/',
  '/32.png',
  '/1024.png',
  '/manifest.json'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE)
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('counters-') && name !== CACHE_NAME && name !== RUNTIME_CACHE)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const { destination, method, url } = request

  // Only handle GET requests
  if (method !== 'GET') {
    return
  }

  // Network first for documents, cache first for assets
  if (destination === 'document') {
    event.respondWith(networkFirst(request))
  } else {
    event.respondWith(cacheFirst(request))
  }
})

async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    const cached = await caches.match(request)
    if (cached) {
      return cached
    }
    // Return offline page if available
    return caches.match('/')
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) {
    return cached
  }

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    return new Response('Not available offline', {
      status: 503,
      statusText: 'Service Unavailable'
    })
  }
}
