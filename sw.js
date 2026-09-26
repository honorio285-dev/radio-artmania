// Service worker da Rádio Artmania
// Guarda só os arquivos do próprio site. O áudio da rádio, o Firebase e o YouTube passam direto.
var CACHE = "artmania-v1";
var ARQUIVOS = ["./", "./index.html", "./manifest.json", "./icon-192-3.png", "./icon-512-2.png", "./icon-maskable-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ARQUIVOS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  // Sempre tenta a versão mais nova; sem internet, usa a guardada
  e.respondWith(fetch(req).then(function (res) {
    var copia = res.clone();
    caches.open(CACHE).then(function (c) { c.put(req, copia); });
    return res;
  }).catch(function () {
    return caches.match(req).then(function (r) { return r || caches.match("./index.html"); });
  }));
});
