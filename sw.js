// Service worker for the Receipt Scanner PWA.
//
// IMPORTANT: bump CACHE_NAME on every deploy that changes index.html (or any
// other app-shell file). The version string is what makes the browser treat
// this as a new service worker and actually replace what it has cached -
// without it, a phone that already has the app installed/visited can keep
// serving an old cached copy indefinitely, even after a new version is live
// on GitHub Pages. (This bit us once already: a UI change shipped but a
// previously-visited phone kept showing the old screen.)
var CACHE_NAME = "receipt-scanner-v2";

var APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./firebase-config.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-192.png",
  "./icons/icon-maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/favicon-32.png"
];

self.addEventListener("install", function(event){
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache){ return cache.addAll(APP_SHELL); })
      .then(function(){ return self.skipWaiting(); }) // activate this version immediately, don't wait for old tabs to close
  );
});

self.addEventListener("activate", function(event){
  event.waitUntil(
    caches.keys()
      .then(function(keys){
        // Drop every cache that isn't this version - this is what actually
        // discards a stale app shell once the new service worker takes over.
        return Promise.all(keys.filter(function(k){ return k !== CACHE_NAME; }).map(function(k){ return caches.delete(k); }));
      })
      .then(function(){ return self.clients.claim(); }) // take control of already-open tabs right away
  );
});

self.addEventListener("fetch", function(event){
  var req = event.request;
  if (req.method !== "GET") return; // never touch uploads/writes

  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // let Firebase/CDN requests pass straight through

  // Navigations (loading the page itself) are network-FIRST: always try to
  // get the latest index.html, only falling back to the cached copy if
  // there's no connection. This is what makes a new deploy show up the
  // moment you reopen the app, instead of only after it happens to have
  // refreshed a background cache from a previous visit.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).then(function(res){
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE_NAME).then(function(cache){ cache.put(req, copy); });
        }
        return res;
      }).catch(function(){
        return caches.match(req).then(function(cached){ return cached || caches.match("./index.html"); });
      })
    );
    return;
  }

  // Everything else in the app shell (icons, manifest, config): stale-while-
  // revalidate is fine here - these rarely change and instant-from-cache
  // keeps the app feeling fast and working offline.
  event.respondWith(
    caches.match(req).then(function(cached){
      var network = fetch(req).then(function(res){
        if (res && res.ok) {
          var copy = res.clone();
          caches.open(CACHE_NAME).then(function(cache){ cache.put(req, copy); });
        }
        return res;
      }).catch(function(){ return cached; });
      return cached || network;
    })
  );
});
