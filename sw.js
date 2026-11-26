// ToDo の専用アプリの殻を、端末に控える（圏外でも起動できるように）。
// 控えるのはこの置き場のファイルだけ。接続先（script.google.com）とのやり取りには手を出さない。
// 殻を直したら CACHE の名前の番号を上げる（古い控えを捨てる）。
const CACHE = 'todo-app-shell-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png', './icons/icon-512.png',
               './icons/icon-maskable-512.png', './icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('todo-app-shell-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;      // よその相手はそのまま通す
  // 殻は「つながるなら新しいもの・だめなら控え」。つながったら控えも新しくする
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || caches.match('./index.html')))
  );
});
