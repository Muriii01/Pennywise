// Offline support: serve the app shell from cache, refresh it in the background.
// Bump CACHE when you want every device to drop old files.
const CACHE = 'pennywise-v7';
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/banks/amana.jpg',
  './icons/banks/boc.jpg',
  './icons/banks/boch.jpg',
  './icons/banks/cargills.jpg',
  './icons/banks/citi.jpg',
  './icons/banks/combank.jpg',
  './icons/banks/deutsche.jpg',
  './icons/banks/dfcc.jpg',
  './icons/banks/hbl.jpg',
  './icons/banks/hnb.jpg',
  './icons/banks/indianbank.jpg',
  './icons/banks/iob.jpg',
  './icons/banks/mcb.jpg',
  './icons/banks/ndb.jpg',
  './icons/banks/ntb.jpg',
  './icons/banks/pabc.jpg',
  './icons/banks/peoples.jpg',
  './icons/banks/publicbank.jpg',
  './icons/banks/sampath.jpg',
  './icons/banks/seylan.jpg',
  './icons/banks/scb.jpg',
  './icons/banks/sbi.jpg',
  './icons/banks/hsbc.jpg',
  './icons/banks/unionbank.jpg',
  './icons/banks/hdfc.jpg',
  './icons/banks/nsb.jpg',
  './icons/banks/rdb.jpg',
  './icons/banks/sdb.jpg',
  './icons/banks/smib.jpg',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((cached) => {
      const refresh = fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => cached || (req.mode === 'navigate' ? caches.match('./index.html') : undefined));
      event.waitUntil(refresh.catch(() => {}));
      return cached || refresh;
    })
  );
});
