const CACHE_VERSION = "formcheck-v1";

const APP_SHELL = [
  "/",
  "/dashboard",
  "/workouts",
  "/body",
  "/videos",
  "/capture",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

function isApiOrSupabase(url) {
  return (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/auth/") ||
    url.hostname.includes("supabase")
  );
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/_next/static/")
  );
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== "GET") return;

  if (isApiOrSupabase(url)) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  event.respondWith(networkFirst(event.request));
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || offlineFallback();
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return offlineFallback();
  }
}

function offlineFallback() {
  return new Response(
    '<!DOCTYPE html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>オフライン - FormCheck</title><style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100dvh;margin:0;background:#f9fafb;color:#111827;text-align:center}div{padding:2rem}h1{font-size:1.5rem;margin-bottom:.5rem}p{color:#6b7280}</style></head><body><div><h1>オフラインです</h1><p>インターネット接続を確認して、もう一度お試しください。</p></div></body></html>',
    { status: 503, headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}
