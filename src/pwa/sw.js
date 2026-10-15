/* Service worker do Must Guide (PWA). Gerado no build por vite/swPlugin.js, que coloca no topo:
 *   self.__SW_VERSION = '<hash do build>';  self.__SW_ASSETS = ['/assets/…', …];
 * Assim cada deploy muda o arquivo → o navegador instala a versão nova e apaga os caches antigos.
 *
 * Estratégias:
 * - App (index.html + /assets do build): guardado na instalação → abre sem internet.
 * - Navegação: rede primeiro; sem internet, o index.html guardado (o roteador do app resolve a página).
 * - /api (jogos e troféus, GET): rede primeiro; sem internet, a última resposta guardada.
 * - Imagens (capas, ícones dos troféus, artes) e fontes: do cache primeiro (mudam raramente), até 400 itens.
 * - Firestore e o resto: direto na rede (os guias lidos ficam no navegador — useGuide).
 */
const VERSION = self.__SW_VERSION || 'dev';
const SHELL = `mg-shell-${VERSION}`;
const API = 'mg-api';
const MEDIA = 'mg-media';
const MAX_MEDIA = 400;
const STATIC = ['/', '/index.html', '/manifest.webmanifest', '/favicon.svg', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL)
      .then((cache) => cache.addAll([...STATIC, ...(self.__SW_ASSETS || [])]))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('mg-shell-') && k !== SHELL).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const isMedia = (req, url) =>
  req.destination === 'image' || req.destination === 'font' || url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';

async function networkFirst(req, cacheName, fallbackUrl) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(req);
    if (res.ok) cache.put(fallbackUrl ?? req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(fallbackUrl ?? req);
    if (hit) return hit;
    throw err;
  }
}

async function cacheFirst(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok || res.type === 'opaque') {
    cache.put(req, res.clone());
    trim(cache);
  }
  return res;
}

// Mantém o cache de imagens no limite (sai o mais antigo)
async function trim(cache) {
  const keys = await cache.keys();
  for (const key of keys.slice(0, Math.max(0, keys.length - MAX_MEDIA))) await cache.delete(key);
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;

  if (req.mode === 'navigate') {
    event.respondWith(networkFirst(req, SHELL, '/index.html'));
  } else if (sameOrigin && url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(req, SHELL));
  } else if (sameOrigin && url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(req, API));
  } else if (isMedia(req, url)) {
    event.respondWith(cacheFirst(req, MEDIA));
  }
});
