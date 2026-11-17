// Study for fun – service worker: the app opens even without network.
// Bump VERSION on every deploy that changes the app shell.
const VERSION = 'sff-v114';
const SHELL = [
  '/',
  '/index.html',
  '/firebase-config.js',
  '/i18n.js',
  '/kid-rest.js',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/maskable-512.png',
  '/icons/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Firebase, Firestore, Functions and Google fonts always go to the network.
  if (url.origin !== location.origin) return;
  // Page navigations: always the network (no HTTP cache); the saved copy only when really offline.
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req, { cache: 'no-store' }).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put('/index.html', copy)); }
      return r;
    }).catch(() => fetch(req).catch(() => caches.match('/index.html'))));
    return;
  }
  // The app's own code files: network first too (cache only offline), so a new version is never held back.
  if (/\.(js|json|webmanifest)$/.test(url.pathname) && !url.pathname.endsWith('/sw.js')) {
    e.respondWith(fetch(req, { cache: 'no-store' }).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
      return r;
    }).catch(() => caches.match(req)));
    return;
  }
  // Static files: cache first.
  e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return r;
  })));
});
