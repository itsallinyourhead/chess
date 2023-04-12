// https://developers.google.com/codelabs/pwa-training/pwa03--going-offline#3
// Choose a cache name
const cacheName = 'cache-v1';
// List the files to precache
const precacheResources = [
  '/',
  '/css/stylesheets.css',
  '/js/body.js',
  '/js/head.js',
  '/pics/BlackBishop.svg',
  '/pics/BlackKing.svg',
  '/pics/BlackKnight.svg',
  '/pics/BlackPawn.svg',
  '/pics/BlackQueen.svg',
  '/pics/BlackRook.svg',
  '/pics/Boards.png',
  '/pics/WhiteBishop.svg',
  '/pics/WhiteKing.svg',
  '/pics/WhiteKnight.svg',
  '/pics/WhitePawn.svg',
  '/pics/WhiteQueen.svg',
  '/pics/WhiteRook.svg'
];
// When the service worker is installing, open the cache and add the precache resources to it
self.addEventListener('install', (event) => {
  console.log('Service worker install event!');
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(precacheResources)));
});
self.addEventListener('activate', (event) => {
  console.log('Service worker activate event!');
});
// When there's an incoming fetch request, try and respond with a precached resource, otherwise fall back to the network
self.addEventListener('fetch', (event) => {
  //console.log('Fetch intercepted for:', event.request.url);
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    }),
  );
});