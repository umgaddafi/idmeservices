const APP_PREFIX = "ninofficialcheck"
const SHELL_CACHE = `${APP_PREFIX}-shell-v1`
const RUNTIME_CACHE = `${APP_PREFIX}-runtime-v1`

const appScopePath = new URL(self.registration.scope).pathname
const appOrigin = self.location.origin
const normalizedScopePath = appScopePath.endsWith("/") ? appScopePath : `${appScopePath}/`
const apiPathPrefix = `${normalizedScopePath}api/`.replace(/\/{2,}/g, "/")
const apiExactPath = `${normalizedScopePath}api`.replace(/\/{2,}/g, "/")
const appShellUrls = [
  appScopePath,
  `${appScopePath}index.html`,
  `${appScopePath}manifest.webmanifest`,
  `${appScopePath}ninofficialcheck-logo.svg`,
  `${appScopePath}pwa-icons/icon.svg`,
  `${appScopePath}pwa-icons/icon-maskable.svg`,
  `${appScopePath}pwa-icons/apple-touch-icon.svg`,
]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(appShellUrls))
      .then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter((cacheName) => cacheName.startsWith(APP_PREFIX) && ![SHELL_CACHE, RUNTIME_CACHE].includes(cacheName))
            .map((cacheName) => caches.delete(cacheName))
        )
      )
      .then(() => self.clients.claim())
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  if (request.method !== "GET") return

  const requestUrl = new URL(request.url)
  if (requestUrl.origin !== appOrigin || !requestUrl.pathname.startsWith(appScopePath)) return
  if (requestUrl.pathname === apiExactPath || requestUrl.pathname.startsWith(apiPathPrefix)) return

  if (request.mode === "navigate") {
    event.respondWith(handleNavigationRequest(request))
    return
  }

  event.respondWith(handleStaticRequest(request))
})

async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const shellCache = await caches.open(SHELL_CACHE)
      await shellCache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) return cachedResponse

    const cachedShell = await caches.match(`${appScopePath}index.html`)
    if (cachedShell) return cachedShell

    return new Response("Offline", {
      status: 503,
      statusText: "Offline",
      headers: { "Content-Type": "text/plain; charset=UTF-8" },
    })
  }
}

async function handleStaticRequest(request) {
  const runtimeCache = await caches.open(RUNTIME_CACHE)
  const cachedResponse = await runtimeCache.match(request)
  const networkResponsePromise = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse.ok) {
        await runtimeCache.put(request, networkResponse.clone())
      }
      return networkResponse
    })
    .catch(() => null)

  if (cachedResponse) return cachedResponse

  const networkResponse = await networkResponsePromise
  if (networkResponse) return networkResponse

  return new Response(null, { status: 504, statusText: "Gateway Timeout" })
}
