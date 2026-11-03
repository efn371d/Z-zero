// 앱 상태 저장소 — 폰(localStorage)에 자동 저장
const KEY = 'degree-app-v1';

export const DEFAULTS = {
  onboarded: false,
  profile: { name: '야옹이' },
  sleeves: {
    L: { paired: false, battery: 92 },
    R: { paired: false, battery: 89 },
    firmware: 'v1.2.0', size: 'M', calfCm: 36, zeroed: false,
  },
  settings: {
    lang: 'ko',            // 'ko' | 'en'
    threshold: 60,         // 경고 기준 (부하 %)
    sensitivity: 'normal', // 'low' | 'normal' | 'high'
    vibration: 'normal',   // 'off' | 'low' | 'normal' | 'high'
    pressureCap: 30,       // 압박 상한 mmHg
    camera: true,          // 발 카메라
    reminders: true,       // 운동 알림
    demoSpeed: 10,         // 데모 시간 배속
    weeklyGoal: 5,
  },
  plan: { sport: 'futsal', mode: 'match' }, // 다음 운동
  sessions: [],          // 저장된 운동 기록
  live: null,            // 진행 중인 운동
};

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw);
      const st = { ...structuredClone(DEFAULTS), ...s, settings: { ...DEFAULTS.settings, ...s.settings }, sleeves: { ...DEFAULTS.sleeves, ...s.sleeves } };
      if (st.profile && st.profile.name === '디그리') st.profile.name = '야옹이'; // 예전 기본 이름 → 새 기본 이름
      return st;
    }
  } catch (e) { /* 저장소 사용 불가 → 기본값 */ }
  return null;
}

let state = load();
const subs = new Set();
let saveT;

export const store = {
  isFresh: state === null,
  get: () => state,
  init(seed) { if (!state) state = seed; },
  /** 부분 갱신: store.set(s => { s.settings.threshold = 65 }) */
  set(fn, { silent = false } = {}) {
    fn(state);
    clearTimeout(saveT);
    saveT = setTimeout(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }, 150);
    if (!silent) subs.forEach((f) => f(state));
  },
  subscribe(f) { subs.add(f); return () => subs.delete(f); },
  reset() { try { localStorage.removeItem(KEY); } catch (e) {} location.hash = ''; location.reload(); },
};
