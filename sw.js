// Guarda a app em cache para abrir sem internet. Vai sempre primeiro ao servidor para receber as atualizações,
// sem usar a cache do browser (o GitHub Pages deixa guardar as páginas 10 minutos).
const CACHE = 'dinheiro-v7';
const FICHEIROS = ['./', './index.html', './manifest.webmanifest', './icon-180.png', './icon-192.png', './icon-512.png', './fonts/manrope.woff2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHEIROS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(chaves => Promise.all(chaves.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // "no-cache": confirma sempre com o servidor. Um pedido de navegação não se pode copiar com opções, daí o URL.
  const pedido = url.origin !== location.origin ? e.request
    : e.request.mode === 'navigate' ? new Request(url.href, { cache: 'no-cache', credentials: 'same-origin' })
    : new Request(e.request, { cache: 'no-cache' });
  e.respondWith(
    fetch(pedido)
      .then(r => {
        if (r.ok) { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); }
        return r;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
