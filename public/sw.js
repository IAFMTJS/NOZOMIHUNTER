const CACHE = "nozomi-static-v1"
const PRECACHE = ["/", "/home", "/login"]

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

self.addEventListener("push", (event) => {
  if (!event.data) return
  let payload = { title: "NOZOMI HUNTER", body: "Signal detected.", href: "/home" }
  try {
    payload = { ...payload, ...event.data.json() }
  } catch {
    payload.body = event.data.text()
  }
  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      tag: "nozomi-push",
      data: { href: payload.href ?? "/home" },
      icon: "/icons/icon-192.png",
    })
  )
})

self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  const href = event.notification.data?.href ?? "/home"
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(href)
          return client.focus()
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(href)
      }
    })
  )
})

self.addEventListener("fetch", (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== "GET") return

  if (
    url.pathname.includes("/auth/") ||
    url.hostname.includes("supabase")
  ) {
    return
  }

  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const cached = await cache.match(request)
        if (cached) return cached
        const res = await fetch(request)
        if (res.ok) cache.put(request, res.clone())
        return res
      })
    )
    return
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((res) => res)
        .catch(() => caches.match("/home").then((r) => r ?? caches.match("/")))
    )
  }
})
