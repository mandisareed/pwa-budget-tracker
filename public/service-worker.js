//print a message to the console upon registering
console.log("Hi from your service worker!");

// create variable for the cache name
const STATIC_CACHE = "static-cache-v1";
const DATA_CACHE = "data-cache";

//create an array containing the orutes to cache
const FILES_TO_CACHE = [
    "/",
    "/db.js",
    "/index.js",
    "/index.html",
    "/manifest.webmanifest",
    "/styles.css",
    "/icons/icon-144x144.png",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css",
    "https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/fonts/fontawesome-webfont.woff2?v=4.7.0",
    "https://cdn.jsdelivr.net/npm/chart.js@2.8.0"
  ];
  
  
  
  
  //install
  // when the sw installs
  // then add all routes to cache for static assets
  // then take over (skip waiting)
  self.addEventListener("install", function (event) {
    // then add all routes to cache for static assets
    event.waitUntil(
      caches.open(STATIC_CACHE).then(function (cache) {
        console.log("Success! Your files were pre-cached!");
        return cache.addAll(FILES_TO_CACHE);
      })
    );
    // immediately take over (skip waiting)
    self.skipWaiting();
  });
  
  // The activate handler takes care of cleaning up old caches.
  // when the sw activates
  // remove any outdated caches
  self.addEventListener("activate", function (event) {
    //const currentCaches = [STATIC_CACHE, DATA_CACHE];
    event.waitUntil(
      caches.keys().then((keyList) => {
        return Promise.all(
        keyList.map((key) => {
          if (key !== STATIC_CACHE && key !== DATA_CACHE) {
            console.log("Old cache data being removed", key);
          return caches.delete(key);
        }}));
      })
    );self.clients.claim();
  });
  

  // whenever the client triggers fetch
  // respond from cache falling back to the network
  self.addEventListener("fetch", function (event) {
    if (event.request.url.includes("/api/")) {
      event.respondWith(
        caches.open(DATA_CACHE).then((cache) => {
          // if (cachedResponse) {
          //   return cachedResponse;
          // }
            return fetch(event.request).then(response => {
              if (response.status === 200) {
               cache.put(event.request.url, response.clone());
              }
                return response;
              })
              //if request to the network is not successful, fetch data from cache
              .catch((err) => {
                return cache.match(event.request);
              });
            })
            .catch((err) => {
              console.log(err);
            })
          );
          return;
        }
        // checked the cache, then do a network request
        // this way, data stored offline will be available
        event.respondWith(
          caches.open(STATIC_CACHE)
          .then((cache) => {
            return cache.match(event.request)
            .then(function (response) {
              return response || fetch(event.request);
            })
          }
        ))});