// 앱 본체: 화면 전환(라우터), 버튼 처리, 시뮬레이터 구동, 토스트·시트
import { store, DEFAULTS } from './store.js';
import { t, esc, btnPrimary, btnGhost } from './ui.js';
import { seedSessions, finalize, MODES } from './data.js';
import { stepModel, newLive, applyDial, snooze } from './sim.js';

import Welcome from './screens/welcome.js';
import Connect from './screens/connect.js';
import Fit from './screens/fit.js';
import Main from './screens/main.js';
import Select from './screens/select.js';
import Setup from './screens/setup.js';
import CamGuide from './screens/cam-guide.js';
import CamRec from './screens/cam-rec.js';
import Live from './screens/live.js';
import Alert from './screens/alert.js';
import Summary from './screens/summary.js';
import Detail from './screens/detail.js';
import Insight from './screens/insight.js';
import History from './screens/history.js';
import Settings from './screens/settings.js';

const SCREENS = { Welcome, Connect, Fit, Main, Select, Setup, CamGuide, CamRec, Live, Alert, Summary, Detail, Insight, History, Settings };
const GROUPS = [
  ['시작하기', ['Welcome', 'Connect', 'Fit']],
  ['운동', ['Main', 'Select', 'Setup', 'CamGuide', 'CamRec', 'Live', 'Alert']],
  ['리뷰', ['Summary', 'Detail', 'Insight', 'History', 'Settings']],
];
const NAMES = { Welcome: '시작', Connect: '연결', Fit: '착용 체크', Main: '오늘', Select: '운동 선택', Setup: '운동 설정', CamGuide: '카메라 안내', CamRec: '촬영 중', Live: '운동 중', Alert: '종아리 경고', Summary: '분석', Detail: '분석 상세', Insight: 'AI 인사이트', History: '기록', Settings: '설정' };

// 첫 실행: 데모 기록 생성
store.init({ ...structuredClone(DEFAULTS), sessions: seedSessions() });

const phone = document.getElementById('phone');
let cur = null, curEl = null, cleanup = null, navDepth = 0;
const params = {}; // 화면 간 전달값 (예: 어떤 기록을 볼지)

// ---------------- 앱 API (화면에서 사용) ----------------
export const app = {
  store, t,
  get s() { return store.get(); },
  params,
  /** 화면 이동. opts.replace: 뒤로가기 기록에 안 남김 */
  go(id, opts = {}) {
    Object.assign(params, opts.params || {});
    if (opts.replace) { history.replaceState(null, '', '#' + id); show(id, opts); }
    else if (location.hash === '#' + id) show(id, { ...opts, force: true });
    else location.hash = id;
  },
  back(fallback = 'Main') { if (navDepth > 0) { backing = true; history.back(); } else app.go(fallback, { replace: true }); },
  /** 현재 화면 다시 그리기 (스크롤 유지) */
  refresh() { if (cur) show(cur, { force: true, keep: true }); },
  toast,
  sheet,
  closeSheet,
  playClip,
  lock,
  vibrate(pattern) {
    const v = store.get().settings.vibration;
    if (v === 'off' || !navigator.vibrate) return;
    const k = { low: 0.5, normal: 1, high: 1.6 }[v] || 1;
    try { navigator.vibrate((Array.isArray(pattern) ? pattern : [pattern]).map((x) => Math.round(x * k))); } catch (e) {}
  },
  // ----- 운동 세션 -----
  startWorkout() {
    const { plan } = store.get();
    store.set((s) => { s.live = newLive({ sport: plan.sport, mode: plan.mode, seed: Date.now() }); s.live.camOn = s.settings.camera; const r = s.sleeves.restMmHg; if (r) s.live.p = { L: r, R: r }; });
  },
  endWorkout() {
    const s = store.get();
    if (!s.live) return null;
    const rec = finalize(s.live);
    store.set((st) => { if (rec.duration >= 5) st.sessions.push(rec); st.live = null; });
    return rec.duration >= 5 ? rec.id : null;
  },
  dial() { let a; store.set((s) => { if (s.live) a = applyDial(s.live, s.settings); }); return a; },
  snooze(sec, action) { store.set((s) => { if (s.live) snooze(s.live, sec, action); }); },
  sessionById(id) { const ss = store.get().sessions; return ss.find((x) => x.id === id) || ss[ss.length - 1]; },
};
window.app = app; // 디버깅용

// ---------------- 라우터 ----------------
function initialScreen() {
  const s = store.get();
  if (s.live) return s.live.alertActive ? 'Alert' : 'Live';
  return s.onboarded ? 'Main' : 'Welcome';
}

function show(id, opts = {}) {
  const S = SCREENS[id];
  if (!S) return show(initialScreen(), { replace: true });
  if (id === cur && !opts.force) return;
  const scroll = opts.keep && curEl ? [...curEl.querySelectorAll('*')].filter((e) => e.scrollTop > 0).map((e) => e.scrollTop) : null;
  if (cleanup) { try { cleanup(!!opts.keep && id === cur); } catch (e) {} cleanup = null; } // 인자: 같은 화면 새로고침이면 true
  closeSheet(true);
  const el = document.createElement('div');
  el.className = 'screen';
  el.dataset.id = id;
  el.innerHTML = S.render(store.get(), app);
  phone.appendChild(el);
  const old = curEl;
  cur = id; curEl = el;
  if (opts.keep) { el.classList.add('on'); el.style.transition = 'none'; }
  else requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('on')));
  if (old) { old.style.pointerEvents = 'none'; setTimeout(() => old.remove(), opts.keep ? 0 : 300); }
  if (S.mount) cleanup = S.mount(el, app) || null;
  if (scroll) { const sc = [...el.querySelectorAll('*')]; let i = 0; sc.forEach((e) => { if (e.scrollHeight > e.clientHeight && scroll[i] != null) e.scrollTop = scroll[i++]; }); }
  document.querySelectorAll('#jump a').forEach((a) => a.classList.toggle('cur', a.dataset.nav === id));
  document.title = 'Z-zero · ' + t(NAMES[id]);
}
// navDepth: 앱 안에서 이동한 횟수 (뒤로가기 버튼이 앱 밖으로 나가지 않게)
window.addEventListener('hashchange', () => { navDepth = Math.max(0, navDepth + (backing ? -1 : 1)); backing = false; show(location.hash.slice(1) || initialScreen()); });
let backing = false;

// ---------------- 버튼 처리 ----------------
// 화면 안의 data-act="이름" → 그 화면 모듈의 actions.이름(버튼, app, 이벤트)
phone.addEventListener('click', (e) => {
  const sheetEl = e.target.closest('.sheet');
  const btn = e.target.closest('[data-act]');
  if (sheetEl) {
    if (btn && sheetHandlers[btn.dataset.act]) { e.preventDefault(); sheetHandlers[btn.dataset.act](btn, e); }
    return;
  }
  if (!btn || !curEl || !curEl.contains(btn)) return;
  const S = SCREENS[cur];
  const name = btn.dataset.act;
  const fn = (S.actions && S.actions[name]) || GLOBAL_ACTS[name];
  if (fn) { e.preventDefault(); fn(btn, app, e); }
});

const GLOBAL_ACTS = {
  back: () => app.back(),
  help: () => {
    const h = SCREENS[cur].help;
    sheet({ title: t(h?.title || '도움말'), body: `<p>${t(h?.body || '이 화면에 대한 도움말이 없어요.')}</p>`, actions: [{ label: t('알겠어요'), primary: true }] });
  },
};

// ---------------- 토스트 ----------------
const toastEl = document.createElement('div');
toastEl.className = 'toast'; phone.appendChild(toastEl);
let toastT;
function toast(msg, ms = 1600) {
  toastEl.textContent = msg; toastEl.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove('on'), ms);
}

// ---------------- 바텀 시트 ----------------
// sheet({ title, body(html), actions:[{label, primary, onClick}], on:{ actName: fn } })
let sheetBg = null, sheetEl = null, sheetHandlers = {};
function sheet({ title = '', body = '', actions = [], on = {}, onClose } = {}) {
  closeSheet(true);
  sheetBg = document.createElement('div'); sheetBg.className = 'sheet-bg';
  sheetEl = document.createElement('div'); sheetEl.className = 'sheet';
  sheetEl.setAttribute('role', 'dialog');
  sheetEl.innerHTML = `<div class="grip"></div>${title ? `<h3>${title}</h3>` : ''}<div class="sheet-body">${body}</div>${actions.length ? `<div class="acts">${actions.map((a, i) => `<button type="button" data-act="__a${i}" style="${a.primary ? btnPrimary : btnGhost}">${esc(a.label)}</button>`).join('')}</div>` : ''}`;
  sheetHandlers = { ...on };
  actions.forEach((a, i) => (sheetHandlers['__a' + i] = () => { if (a.onClick) { if (a.onClick() === false) return; } closeSheet(); }));
  sheetBg.onclick = () => { closeSheet(); onClose && onClose(); };
  phone.append(sheetBg, sheetEl);
  requestAnimationFrame(() => requestAnimationFrame(() => { sheetBg.classList.add('on'); sheetEl.classList.add('on'); }));
  return sheetEl;
}
function closeSheet(instant) {
  if (!sheetEl) return;
  const a = sheetBg, b = sheetEl; sheetBg = sheetEl = null; sheetHandlers = {};
  if (instant) { a.remove(); b.remove(); return; }
  a.classList.remove('on'); b.classList.remove('on');
  setTimeout(() => { a.remove(); b.remove(); }, 300);
}

// ---------------- 클립 재생 ----------------
const clipEl = document.createElement('div');
clipEl.className = 'clipov';
clipEl.innerHTML = '<div class="media"></div><div class="bar"><i></i></div><div class="cap"></div><button type="button" aria-label="Close">×</button>';
phone.appendChild(clipEl);
let clipT;
const closeClip = () => { clipEl.classList.remove('on'); clipEl.querySelector('.media').innerHTML = ''; };
clipEl.querySelector('button').onclick = closeClip;
/** 클립 재생: .mp4면 영상(3초), 아니면 사진 */
function playClip(src, caption = '') {
  const isVideo = /\.mp4$/.test(src);
  clipEl.querySelector('.media').innerHTML = isVideo
    ? `<video src="${src}" poster="${src.replace(/\.mp4$/, '.jpg')}" autoplay muted playsinline style="position:absolute;inset:0"></video>`
    : `<img src="${src}" alt="" style="position:absolute;inset:0">`;
  clipEl.querySelector('.cap').innerHTML = caption;
  clipEl.classList.remove('on'); void clipEl.offsetWidth; clipEl.classList.add('on');
  clearTimeout(clipT); clipT = setTimeout(closeClip, 3200);
}

// ---------------- 화면 잠금 (길게 눌러 해제) ----------------
function lock() {
  const el = document.createElement('div');
  el.className = 'lockov';
  el.innerHTML = `<div class="ring"><svg width="34" height="34" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4.5" y="9" width="11" height="8" rx="2"/><path d="M7 9V6.5a3 3 0 016 0V9"/></svg></div><span>${t('길게 눌러 잠금 해제')}</span>`;
  let hold;
  const ring = el.querySelector('.ring');
  const start = () => { ring.style.transition = 'border-color 1s, transform 1s'; ring.style.borderColor = '#D4EE3B'; ring.style.transform = 'scale(1.1)'; hold = setTimeout(() => el.remove(), 900); };
  const stop = () => { clearTimeout(hold); ring.style.borderColor = ''; ring.style.transform = ''; };
  el.addEventListener('pointerdown', start); el.addEventListener('pointerup', stop); el.addEventListener('pointerleave', stop);
  phone.appendChild(el);
}

// ---------------- 시뮬레이터 루프 (0.25초마다) ----------------
let lastAlertKey = null;
setInterval(() => {
  const s = store.get();
  if (s.live) {
    const dt = 0.25 * (s.settings.demoSpeed || 1);
    store.set((st) => stepModel(st.live, dt, st.settings), { silent: true });
    const L = store.get().live;
    if (L.crampFlag) {
      store.set((st) => { st.live.crampFlag = null; }, { silent: true });
      app.vibrate([400, 100, 400]); toast(t('쥐 감지 · 잠시 쉬어요'), 2400);
    }
    // 경기 시간 안내: 전반 끝 / 정해진 시간 끝
    const m = MODES[L.mode] || MODES.match;
    if (m.halves === 2 && !L.halfNote && L.t >= m.plan / 2) {
      store.set((st) => { st.live.halfNote = true; }, { silent: true });
      app.vibrate([100, 60, 100]); toast(t('전반 끝 · 이제 후반이에요'), 2600);
    }
    if (!L.endNote && L.t >= m.plan && !L.alertActive && (cur === 'Live' || cur === 'CamRec')) {
      store.set((st) => { st.live.endNote = true; }, { silent: true });
      app.vibrate([100, 60, 100, 60, 100]);
      sheet({ title: t('정해둔 운동 시간이 끝났어요'), body: `<p>${t('{m} 운동을 마쳤어요. 여기서 끝내고 분석을 볼까요?', { m: t(m.sub) })}</p>`, actions: [
        { label: t('끝내고 분석 보기'), primary: true, onClick: () => { const id = app.endWorkout(); if (id) app.go('Summary', { replace: true, params: { sid: id } }); } },
        { label: t('더 할래요') },
      ] });
    }
    // 인사이트에서 켠 '미리 알림': 지난번 지쳤던 시간 4분 전에 다이얼 미리 조이라고 알려줌
    const pre = store.get().settings.preAlert;
    if (pre && !L.preNote && L.t >= pre.min * 60) {
      store.set((st) => { st.live.preNote = true; }, { silent: true });
      app.vibrate([150, 80, 150]); toast(t('{side} 다이얼 ½바퀴 미리 조일 시간이에요', { side: t(pre.side === 'L' ? '왼쪽' : '오른쪽') }), 3200);
    }
    if (L.alertActive) {
      const key = L.alertActive.t;
      if (key !== lastAlertKey) {
        lastAlertKey = key;
        app.vibrate([200, 80, 200, 80, 200]);
        if (cur !== 'Alert') app.go('Alert');
      }
    }
  }
  const S = SCREENS[cur];
  if (S && S.tick && curEl) S.tick(curEl, store.get(), app);
}, 250);
// 상태바 시계
setInterval(() => { const d = new Date(); document.querySelectorAll('[data-clock]').forEach((e) => (e.textContent = d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0'))); }, 15000);

// 언어가 바뀌면 다시 그리기
let lastLang = store.get().settings.lang;
store.subscribe((s) => { if (s.settings.lang !== lastLang) { lastLang = s.settings.lang; document.documentElement.lang = lastLang; buildJump(); app.refresh(); } });
document.documentElement.lang = lastLang;

// ---------------- 화면 크기 맞추기 ----------------
const isMobile = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone || (window.innerWidth <= 600 && 'ontouchstart' in window) || window.innerWidth <= 500;
function fit() {
  const dev = document.getElementById('device');
  if (isMobile()) {
    document.body.classList.add('mobile');
    // 디자인 기준 390 × 최소 760. 화면이 짧은 폰(브라우저 주소창 포함)은 전체를 조금 줄여서 다 들어가게 함
    const vw = window.innerWidth, vh = window.innerHeight;
    const sc = Math.min(vw / 390, vh / 760);
    phone.style.transform = `scale(${sc})`;
    phone.style.width = vw / sc + 'px';
    phone.style.height = vh / sc + 'px';
    dev.style.transform = '';
    dev.style.width = vw + 'px'; dev.style.height = vh + 'px';
  } else {
    document.body.classList.remove('mobile');
    phone.style.transform = ''; phone.style.height = ''; phone.style.width = '';
    dev.style.width = ''; dev.style.height = '';
    const sc = Math.min(1, (window.innerHeight * 0.94) / 864, (window.innerWidth - 20) / 410);
    dev.style.transform = `scale(${sc})`;
  }
}
window.addEventListener('resize', fit); window.addEventListener('orientationchange', () => setTimeout(fit, 300)); fit();

// ---------------- 데스크톱 바로가기 ----------------
// 화면 바로가기는 발표·시연용: 주소 끝에 ?demo 를 붙였을 때만 보임 (예: .../Z-zero/?demo)
const DEMO_NAV = new URLSearchParams(location.search).has('demo');
function buildJump() {
  const j = document.getElementById('jump');
  if (!DEMO_NAV) { j.style.display = 'none'; return; }
  j.innerHTML = `<h1>Z-zero</h1><p>${t('데모 · 화면 바로가기')}</p>` +
    GROUPS.map(([g, ids]) => `<div class="ng">${t(g)}</div>` + ids.map((id) => `<a href="#${id}" data-nav="${id}">${t(NAMES[id])}</a>`).join('')).join('') +
    `<div class="tools"><button type="button" data-tool="lang">${t('English로 보기')}</button><button type="button" data-tool="reset">${t('데모 처음부터')}</button></div>`;
  j.querySelectorAll('a').forEach((a) => a.classList.toggle('cur', a.dataset.nav === cur));
}
document.getElementById('jump').addEventListener('click', (e) => {
  const b = e.target.closest('[data-tool]'); if (!b) return;
  if (b.dataset.tool === 'lang') store.set((s) => { s.settings.lang = s.settings.lang === 'ko' ? 'en' : 'ko'; });
  if (b.dataset.tool === 'reset') store.reset();
});
buildJump();

// ---------------- 시작 ----------------
show(location.hash.slice(1) || initialScreen(), { replace: true });
if (!location.hash) history.replaceState(null, '', '#' + cur);

// 오프라인·설치 지원
// 새 버전 자동 반영: 앱을 열 때마다 새 버전이 있는지 확인하고, 있으면 한 번 새로고침
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  const hadController = !!navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then((reg) => {
    reg.update().catch(() => {});
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
  }).catch(() => {});
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloaded) return;
    reloaded = true; location.reload();
  });
}
