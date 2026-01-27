const CACHE_VERSION = 'nexus-v1';
const urlsToCache = [
  '/', '/index.html',
  '/ai-pet.html','/space-dodger.html','/game1.html','/game2.html','/game3.html',
  '/stress-buster.html','/neon-runner.html','/orbit-rhythm.html','/galaxy-catcher.html','/air-piano.html',
  '/manifest.json','/css/global.css'
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_VERSION).then((cache) => cache.addAll(urlsToCache)));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});
self.addEventListener('fetch', (e) => {
  e.respondWith((caches.match(e.request)).then((r) => r || fetch(e.request)));
});
