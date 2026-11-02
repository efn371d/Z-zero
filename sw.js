// 오프라인 지원: 앱 파일을 저장해 두고 인터넷 없이도 열리게 함
// 파일을 수정해서 다시 올릴 때는 VERSION 숫자를 하나 올려 주세요 (그래야 폰에서 새 버전을 받아요)
const VERSION = 'z-zero-v5';
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
  'assets/fonts/teko-latin-600-normal.woff2',
  'assets/fonts/teko-latin-700-normal.woff2',
  'assets/icons/apple-touch-icon.png',
  'assets/icons/icon-192.png',
  'assets/icons/icon-512.png',
  'assets/icons/icon-maskable-512.png',
  'assets/img/cam-lens.jpg',
  'assets/img/dial-on-sleeve.jpg',
  'assets/img/dial-turn.jpg',
  'assets/img/dial.jpg',
  'assets/img/fit-sleeve.jpg',
  'assets/img/hero-main.jpg',
  'assets/img/live-bg.jpg',
  'assets/img/recovery.jpg',
  'assets/img/settings-sleeve.jpg',
  'assets/img/sport-basketball.jpg',
  'assets/img/sport-futsal.jpg',
  'assets/img/sport-generic.jpg',
  'assets/img/sport-running.jpg',
  'assets/img/sport-soccer.jpg',
  'assets/img/sport-tennis.jpg',
  'assets/video/cam-moving.jpg',
  'assets/video/cam-moving.mp4',
  'assets/video/cam-standing.jpg',
  'assets/video/cam-standing.mp4',
  'assets/video/clip-cut.jpg',
  'assets/video/clip-cut.mp4',
  'assets/video/clip-inside.jpg',
  'assets/video/clip-inside.mp4',
  'assets/video/clip-kick.jpg',
  'assets/video/clip-kick.mp4',
  'assets/video/clip-landing.jpg',
  'assets/video/clip-landing.mp4',
  'assets/video/clip-outside.jpg',
  'assets/video/clip-outside.mp4',
  'assets/video/clip-stop.jpg',
  'assets/video/clip-stop.mp4',
  'assets/video/feed.jpg',
  'assets/video/feed.mp4',
  'assets/video/welcome.jpg',
  'assets/video/welcome.mp4',
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
    // cache: 'no-cache' → 폰 브라우저 캐시를 건너뛰고 항상 서버에 최신인지 확인
    fetch(e.request, { cache: 'no-cache' }).then((res) => {
      const copy = res.clone();
      caches.open(VERSION).then((c) => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
