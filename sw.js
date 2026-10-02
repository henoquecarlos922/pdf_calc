const CACHE = 'pdfcalc-v1';
const B = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/';
const ASSETS = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg',
  B + 'build/pdf.min.js', B + 'build/pdf.worker.min.js', B + 'build/pdf.sandbox.min.js',
  B + 'web/pdf_viewer.js', B + 'web/pdf_viewer.css'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.allSettled(ASSETS.map(u => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin && !url.href.startsWith(B)) return;
  e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(hit => hit || fetch(e.request).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return r;
  }).catch(() => caches.match('index.html'))));
});
