// 운동 종목 · 분석 계산 · 데모용 기록 생성
import { stepModel, newLive, applyDial, rng } from './sim.js';
export { rng };

export const SPORTS = [
  { id: 'futsal', icon: '<circle cx="10" cy="10" r="7"/><path d="M10 6.5l3 2.2-1.1 3.6H8.1L7 8.7z"/>', name: '풋살', factor: 1.0, tags: ['match'] },
  { id: 'running', icon: '<circle cx="13" cy="3.6" r="1.7"/><path d="M5 9.2l3.6-2.6 3.6 1.4-2.1 4.2 3.2 2.6-1 3.4M9.9 12.4L7.2 16.8H3.6M12.6 8.4l1.9 2.4h3"/>', name: '러닝', factor: 0.85, tags: ['training'] },
  { id: 'soccer', icon: '<circle cx="10" cy="10" r="7"/><path d="M10 6.5l3 2.2-1.1 3.6H8.1L7 8.7z"/>', name: '축구', factor: 1.0, tags: ['match'] },
  { id: 'basketball', icon: '<circle cx="10" cy="10" r="7.5"/><path d="M2.5 10h15M10 2.5v15M5 4.4c2.4 2.6 2.4 8.6 0 11.2M15 4.4c-2.4 2.6-2.4 8.6 0 11.2"/>', name: '농구', factor: 1.05, tags: ['match'] },
  { id: 'tennis', icon: '<circle cx="10" cy="10" r="7.5"/><path d="M4.6 4.8c3.2 2.8 3.2 7.6 0 10.4M15.4 4.8c-3.2 2.8-3.2 7.6 0 10.4"/>', name: '테니스', factor: 0.95, tags: ['match'] },
  { id: 'badminton', icon: '<path d="M7.2 13L4.5 3.5h11L12.8 13z"/><path d="M8.2 3.5L9 13M11.8 3.5L11 13M5.6 7.5h8.8"/><path d="M7.2 13h5.6l-.6 2.2a2.2 2.2 0 01-4.4 0z"/>', name: '배드민턴', factor: 0.9, tags: ['match'] },
  { id: 'volleyball', icon: '<circle cx="10" cy="10" r="7.5"/><path d="M10 2.5c-.4 3.6.8 6.3 3.8 8.4M2.9 12.4c3.2-.6 5.6-1.8 7.1-2.4M10 10c1.2 3 3.2 5.2 5.3 6.2M6 3.7c1.6 3.4 4.3 5.4 7.8 7.2"/>', name: '배구', factor: 0.85, tags: ['match'] },
  { id: 'hiking', icon: '<path d="M2.5 16.5l5.5-9 3.2 5 2.3-3.2 4 7.2z"/><path d="M8 7.5l1.3 2.1"/>', name: '등산', factor: 0.7, tags: ['training', 'recovery'] },
  { id: 'cycling', icon: '<circle cx="5" cy="13.5" r="3.5"/><circle cx="15" cy="13.5" r="3.5"/><path d="M5 13.5l3.3-6h5.2L15 13.5M8.3 7.5L10.5 13.5h4.5M12 4.5h2.2l-.7 3"/>', name: '사이클', factor: 0.6, tags: ['training', 'recovery'] },
];
export const MORE_ICON = '<circle cx="5" cy="10" r="1.3" fill="currentColor"/><circle cx="10" cy="10" r="1.3" fill="currentColor"/><circle cx="15" cy="10" r="1.3" fill="currentColor"/>';

/** 종목 아이콘 SVG */
export const sportIcon = (sp, color = '#EDEDEB', size = 20) => `<svg width="${size}" height="${size}" viewBox="0 0 20 20" fill="none" stroke="${color}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="color: ${color}">${sp.icon || MORE_ICON}</svg>`;
export const sportById = (id) => SPORTS.find((s) => s.id === id) || SPORTS[0];

export const MODES = {
  match: { name: '경기', sub: '20분 × 2', intensity: 1.0, halves: 2, plan: 40 * 60 },
  interval: { name: '인터벌', sub: '스프린트 세트', intensity: 1.2, halves: 1, plan: 25 * 60 },
  drills: { name: '기술 훈련', sub: '기술', intensity: 0.7, halves: 1, plan: 30 * 60 },
};

export const SENS_OFFSET = { low: 5, normal: 0, high: -5 }; // 민감도 → 경고 기준 보정

const mean = (a) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

/**
 * 운동 기록 → 분석 결과
 * 근거: 부하(%) = 종아리 근육 피로 추정치(다이얼 FMG 압력 변화 기반). 기준선 초과 시점·최고값·좌우 차이로 점수 산출
 */
export function analyze(s, threshold = 60) {
  const ser = s.series.length ? s.series : [{ t: 0, L: 0, R: 0 }];
  const peakL = Math.round(Math.max(...ser.map((p) => p.L)));
  const peakR = Math.round(Math.max(...ser.map((p) => p.R)));
  const peak = Math.max(peakL, peakR);
  // 첫 과부하: 첫 경고 시점, 경고가 없었다면 기준선을 처음 넘은 시점
  let firstOver = s.alerts[0] || null;
  if (!firstOver) {
    const p = ser.find((q) => Math.max(q.L, q.R) >= threshold);
    if (p) firstOver = { t: p.t, load: Math.round(Math.max(p.L, p.R)), side: p.L >= p.R ? 'L' : 'R' };
  }
  // 약한 다리: 먼저 기준선을 넘은 쪽 (없으면 최고 부하가 높은 쪽)
  const weak = firstOver ? firstOver.side : peakL >= peakR ? 'L' : 'R';
  const dialAlerts = s.alerts.filter((a) => a.action === 'dial');
  // 다이얼 조인 뒤 부하 감소량: 조임 직전 값 - 조임 30초 뒤 값
  let drop = 0;
  if (dialAlerts.length) {
    const a = dialAlerts[0];
    const at = a.dialT ?? a.t;
    const after = ser.find((p) => p.t >= at + 30);
    if (after) drop = Math.round(after[a.side] - a.load);
  }
  // 점수: 100 − 최고부하 초과분 − 쥐 − 경고 횟수
  const score = Math.round(clamp(100 - 0.6 * Math.max(0, peak - 40) - 12 * s.cramps - 1 * s.alerts.length, 20, 99));
  const status = score >= 75 ? '안정' : score >= 55 ? '주의' : '위험';
  const risk = score >= 75 ? '낮음' : score >= 55 ? '보통' : '높음';
  // 10분별 평균 부하
  const buckets = [];
  for (let b = 0; b * 600 < Math.max(s.duration, 1); b++) {
    const pts = ser.filter((p) => p.t >= b * 600 && p.t < (b + 1) * 600);
    buckets.push({ t: b * 10, L: Math.round(mean(pts.map((p) => p.L))), R: Math.round(mean(pts.map((p) => p.R))) });
  }
  const mL = mean(ser.map((p) => p.L)), mR = mean(ser.map((p) => p.R));
  const push = { hi: weak, ratio: Math.round(clamp(Math.max(mL, mR) / Math.max(1, Math.min(mL, mR)), 1, 1.8) * 10) / 10 };
  const half = s.duration / 2;
  const early = mean(ser.filter((p) => p.t < half).map((p) => Math.max(p.L, p.R)));
  const late = mean(ser.filter((p) => p.t >= half).map((p) => Math.max(p.L, p.R)));
  const heelLate = Math.round(clamp((late / Math.max(1, early) - 1) * 60, 0, 60));
  const ankleROM = Math.round(clamp(40 - (peak - 50) * 0.3, 25, 45));
  // 회복 플랜: 최고 부하가 높을수록 다리 올리기 시간 증가
  const legsUp = peak >= 70 ? 30 : peak >= 55 ? 30 : 20;
  const plan = [
    { key: 'stretch', name: '종아리 스트레칭', sub: '30초 × 3', sec: 5 * 60 },
    { key: 'raise', name: '까치발 들기', sub: '15 × 2', sec: 4 * 60 },
    { key: 'legsup', name: '다리 올리기', sub: '다이얼 풀기', sec: legsUp * 60 },
  ];
  const planMin = Math.round(plan.reduce((a, p) => a + p.sec, 0) / 60);
  // 다음 운동 권장: 첫 과부하 시점이 후반이면 '후반 전 ½ 바퀴'
  const firstMin = firstOver ? Math.floor(firstOver.t / 60) : null;
  return { peakL, peakR, peak, weak, firstOver, firstMin, drop, score, status, risk, buckets, push, heelLate, ankleROM, plan, planMin };
}

/** 오늘 종아리 컨디션: 마지막 운동 점수 + 쉰 시간만큼 회복 */
export function readiness(state) {
  const last = state.sessions[state.sessions.length - 1];
  if (!last) return 90;
  const a = analyze(last, state.settings.threshold);
  const hrs = (Date.now() - (last.start + last.duration * 1000)) / 3.6e6;
  return Math.round(clamp(a.score + Math.min(hrs, 48) * 0.25 - 4, 30, 99));
}

/** 이번 주(월~일) 운동 횟수 */
export function weekCount(state, now = new Date()) {
  const d = new Date(now); const day = (d.getDay() + 6) % 7; d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - day);
  return state.sessions.filter((s) => s.start >= d.getTime()).length;
}

/** 가장 많이 한 종목 */
export function topSport(state) {
  const c = {};
  state.sessions.forEach((s) => (c[s.sport] = (c[s.sport] || 0) + 1));
  return Object.keys(c).sort((a, b) => c[b] - c[a])[0] || 'futsal';
}

/** 데모 기록: 시뮬레이터를 빠르게 돌려서 생성 (경고가 오면 다이얼을 조인 것으로 처리) */
export function runOffline({ sport, mode, start, duration, seed, threshold = 60 }) {
  const live = newLive({ sport, mode, seed });
  live.startedAt = start;
  const r = rng(seed + 7);
  const settings = { threshold, sensitivity: 'normal', pressureCap: 30 };
  while (live.t < duration) {
    stepModel(live, 1, settings, r);
    // 경고 후 20~70초 뒤에 다이얼을 조인 것으로 처리 (그 사이 부하가 조금 더 오름)
    if (live.alertActive) {
      if (!live._resp) live._resp = live.t + 20 + r() * 50;
      if (live.t >= live._resp) {
        live.alertActive.load = Math.round(Math.max(live.L, live.R));
        applyDial(live, settings); live._resp = 0;
      }
    }
  }
  delete live._resp;
  return finalize(live);
}

/** 진행 중 기록 → 저장용 기록 */
export function finalize(live) {
  return {
    id: 's' + live.startedAt,
    sport: live.sport, mode: live.mode,
    start: live.startedAt, duration: Math.round(live.t),
    series: live.series, alerts: live.alerts, dialTurns: live.dialTurns, cramps: live.cramps,
    transitions: live.transitions, touches: live.touches, clips: live.clips,
    pStart: { L: 14, R: 13 }, pEnd: { ...live.p },
  };
}

/** 첫 실행용 데모 기록 (최근 4주) */
export function seedSessions() {
  const out = [];
  const now = new Date();
  const plan = [26, 24, 22, 19, 17, 15, 12, 10, 8, 5, 3]; // 며칠 전
  plan.forEach((ago, i) => {
    const d = new Date(now); d.setDate(d.getDate() - ago); d.setHours(i % 3 === 0 ? 20 : 19, 12 - (i % 4) * 3, 0, 0);
    const running = i % 4 === 1;
    const s = runOffline({ sport: running ? 'running' : 'futsal', mode: running ? 'drills' : 'match', start: d.getTime(), duration: running ? 38 * 60 + 24 : 50 * 60 + (i * 37) % 260, seed: 100 + i });
    out.push(s);
  });
  // 마지막 기록 = 디자인 기준 경기 (52:10)
  const d = new Date(now); d.setDate(d.getDate() - 1); d.setHours(20, 12, 0, 0);
  out.push(runOffline({ sport: 'futsal', mode: 'match', start: d.getTime(), duration: 52 * 60 + 10, seed: 42 }));
  return out;
}
