// 오프라인 지원: 앱 파일을 저장해 두고 인터넷 없이도 열리게 함
// 파일을 수정해서 다시 올릴 때는 VERSION 숫자를 하나 올려 주세요 (그래야 폰에서 새 버전을 받아요)
const VERSION = 'z-zero-v2';
const FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'css/app.css',
  'js/app.js',
  'js/data.js',
  'js/lang-en.js',
  'js/screens/alert.js',
  'js/screens/cam-guide.js',
  'js/screens/cam-rec.js',
  'js/screens/connect.js',
  'js/screens/detail.js',
  'js/screens/fit.js',
  'js/screens/history.js',
  'js/screens/insight.js',
  'js/screens/live.js',
  'js/screens/main.js',
  'js/screens/select.js',
  'js/screens/settings.js',
  'js/screens/setup.js',
  'js/screens/summary.js',
  'js/screens/welcome.js',
  'js/sim.js',
  'js/store.js',
  'js/ui.js',
  'assets/fonts/WantedSans-Variable.woff2',
  'assets/icons/apple-touch-icon.png',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/icon-maskable-512.png',
  'assets/img/cam-dribble.jpg',
  'assets/img/cam-lens.jpg',
  'assets/img/cam-live-turf.jpg',
  'assets/img/cam-standing.jpg',
  'assets/img/dial.jpg',
  'assets/img/sleeve-back.jpg',
  'assets/img/sleeve-hero.jpg',
  'assets/img/sleeve-outer.jpg',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
// 네트워크 우선, 실패하면 저장본 (수정 사항이 바로 반영되도록)
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(VERSION).then((c) => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
