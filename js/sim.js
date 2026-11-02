// 데모 시뮬레이터 — 실제 슬리브 대신 종아리 부하·압박·카메라 수치를 만들어냄
//
// 부하 모델 (1초마다):
//   부하 += 기본속도 0.017 × 종목계수 × 운동강도 × 컨디션 × 좌우계수 × 다이얼계수 × (1 + 경과시간/1시간) × 랜덤(0.6~1.4)
//   좌우계수: 약한 다리 1.15~1.35, 반대쪽 0.72 (세션마다 다름)
//   → 풋살 경기 기준 약한 다리가 30분 안팎에 60% 도달
//   다이얼 ½바퀴 조임: 그쪽 부하 −18, 이후 상승속도 ×0.6, 압박 +5 mmHg (상한까지)
//   부하 88% 도달 = 쥐 발생 (쥐 +1, 부하 70으로)
//   일시정지 중에는 초당 −0.03씩 회복
// 경고: max(왼, 오) ≥ 경고 기준 + 민감도 보정(낮음 +5 / 보통 0 / 높음 −5)

export const CLIP_LABELS = ['턴', '급정지', '착지', '인사이드 터치', '아웃사이드 터치', '킥'];
export const CLIP_IMGS = ['assets/img/cam-dribble.jpg', 'assets/img/cam-live-turf.jpg', 'assets/img/cam-standing.jpg'];
const SENS = { low: 5, normal: 0, high: -5 };
const FACTOR = { futsal: 1, running: 0.85, soccer: 1, basketball: 1.05, tennis: 0.95, badminton: 0.9, volleyball: 0.85, hiking: 0.7, cycling: 0.6 };
const INTENSITY = { match: 1, interval: 1.2, drills: 0.7 };

/** 재현 가능한 난수 */
export function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export function newLive({ sport = 'futsal', mode = 'match', seed = Date.now() } = {}) {
  const r = rng(seed);
  // 세션마다 컨디션(0.85~1.15)과 좌우 불균형(약한 쪽 1.15~1.35배)이 다름
  const cond = 0.85 + r() * 0.3, asym = 1.15 + r() * 0.2, weak = r() < 0.75 ? 'L' : 'R';
  return {
    cond, legMul: { L: weak === 'L' ? asym : 0.72, R: weak === 'R' ? asym : 0.72 },
    sport, mode, seed, startedAt: Date.now(), t: 0, running: true,
    L: 15, R: 14, p: { L: 14, R: 13 }, rateMul: { L: 1, R: 1 },
    transitions: 0, touches: 0, clips: [], ankle: 34, lastTouch: '인사이드 터치',
    series: [{ t: 0, L: 15, R: 14 }], alerts: [], dialTurns: 0, cramps: 0,
    snoozeUntil: 0, alertActive: null, lastClipT: -999, camSide: 'R', camOn: true, recPaused: false,
  };
}

export const effThreshold = (settings) => settings.threshold + (SENS[settings.sensitivity] ?? 0);

/** 시뮬레이션 dt초 진행 (dt는 1초 단위로 쪼개서 계산) */
export function stepModel(live, dt, settings, rand = Math.random) {
  let left = dt;
  while (left > 0) {
    const d = Math.min(1, left); left -= d;
    if (!live.running) {
      live.L = Math.max(12, live.L - 0.03 * d); live.R = Math.max(12, live.R - 0.03 * d);
      continue;
    }
    live.t += d;
    const base = 0.017 * (FACTOR[live.sport] ?? 1) * (INTENSITY[live.mode] ?? 1) * live.cond * (1 + live.t / 3600);
    live.L += base * live.legMul.L * live.rateMul.L * (0.6 + rand() * 0.8) * d;
    live.R += base * live.legMul.R * live.rateMul.R * (0.6 + rand() * 0.8) * d;
    for (const side of ['L', 'R']) {
      if (live[side] >= 88) { live.cramps++; live[side] = 70; live.crampFlag = side; }
    }
    // 방향 전환 · 터치 · 클립 (카메라)
    if (rand() < (0.75 / 60) * d * (INTENSITY[live.mode] ?? 1)) {
      live.transitions++;
      if (live.camOn && !live.recPaused && live.t - live.lastClipT > 90) {
        live.lastClipT = live.t;
        const i = Math.floor(rand() * CLIP_LABELS.length);
        live.clips.push({ t: Math.round(live.t), label: CLIP_LABELS[i], img: CLIP_IMGS[i % CLIP_IMGS.length], side: live.camSide, load: Math.round(Math.max(live.L, live.R)) });
      }
    }
    if (live.camOn && !live.recPaused && rand() < (2.2 / 60) * d) {
      live.touches++; live.ankle = Math.round(20 + rand() * 25);
      live.lastTouch = rand() < 0.6 ? '인사이드 터치' : '아웃사이드 터치';
    }
    const last = live.series[live.series.length - 1];
    // 그래프용 기록 (15초마다, 센서 흔들림 ±1 포함)
    if (live.t - last.t >= 15) live.series.push({ t: Math.round(live.t), L: Math.round((live.L + (rand() - 0.5) * 2) * 10) / 10, R: Math.round((live.R + (rand() - 0.5) * 2) * 10) / 10 });
    // 경고 판정
    const mx = Math.max(live.L, live.R);
    if (!live.alertActive && live.t >= live.snoozeUntil && mx >= effThreshold(settings)) {
      live.alertActive = { t: Math.round(live.t), load: Math.round(mx), side: live.L >= live.R ? 'L' : 'R' };
    }
  }
}

/** 경고 대응: 다이얼 ½바퀴 조임 */
export function applyDial(live, settings) {
  const a = live.alertActive || { t: Math.round(live.t), load: Math.round(Math.max(live.L, live.R)), side: live.L >= live.R ? 'L' : 'R' };
  live.alerts.push({ ...a, action: 'dial', dialT: Math.round(live.t) });
  live.dialTurns++;
  live[a.side] = Math.max(15, live[a.side] - 18);
  live.p[a.side] = Math.min(settings.pressureCap, live.p[a.side] + 5);
  live.rateMul[a.side] *= 0.6;
  live.snoozeUntil = live.t + 120;
  live.alertActive = null;
  return a;
}

/** 경고 미루기 (2분) / 닫기 (1분) */
export function snooze(live, sec = 120, action = 'snooze') {
  if (live.alertActive) live.alerts.push({ ...live.alertActive, action });
  live.snoozeUntil = live.t + sec;
  live.alertActive = null;
}
