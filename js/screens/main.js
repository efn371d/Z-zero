import { t, statusBar, tabBar, lang, fmt, legIcon, AC, WARN, DISPLAY } from '../ui.js';
import { readiness, weekCount, analyze } from '../data.js';

export function dateLabel(d = new Date(), withDay = true) {
  return d.toLocaleDateString(lang() === 'en' ? 'en-US' : 'ko-KR', withDay ? { month: lang() === 'en' ? 'short' : 'long', day: 'numeric', weekday: 'long' } : { month: 'long', day: 'numeric' });
}

function view(s) {
  const last = s.sessions[s.sessions.length - 1];
  const a = last ? analyze(last, s.settings.threshold) : null;
  const ready = readiness(s);
  // 다리별 컨디션: 지난 운동에서 더 지친 다리일수록 낮게
  const legs = a ? { L: Math.round(Math.min(99, ready + (a.peak - a.peakL) * 0.3)), R: Math.round(Math.min(99, ready + (a.peak - a.peakR) * 0.3)) } : { L: ready, R: ready };
  const paired = s.sleeves.L.paired && s.sleeves.R.paired;
  const wk = weekCount(s), goal = s.settings.weeklyGoal;
  const today0 = new Date(); today0.setHours(0, 0, 0, 0);
  const doneToday = last && last.start >= today0.getTime();
  const bars = Array.from({ length: goal }, (_, i) => (i < wk ? '#EDEDEB' : i === wk && !doneToday ? AC : 'rgba(255,255,255,0.16)'));
  return { last, a, ready, legs, paired, wk, goal, bars };
}

export default {
  id: 'Main',
  render: (s, _app, v = view(s)) => `
<div class="root has-tab">
<div aria-hidden="true" style="position: absolute; left: -120px; top: -160px; width: 520px; height: 420px; border-radius: 50%; background: radial-gradient(closest-side, rgba(212,238,59,0.09), rgba(0,0,0,0))"></div>
${statusBar()}<div style="position: absolute; inset: 0; padding: 58px 20px 34px; display: flex; flex-direction: column; gap: 16px">

  <div style="display: flex; justify-content: space-between; align-items: flex-end"><div style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 12px; font-weight: 500; color: rgba(237,237,235,0.62)">${dateLabel()}</span><h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.035em; line-height: 1.1">${t("오늘")}</h1></div><a href="#Settings" aria-label="${t("프로필")}" style="width: 44px; height: 44px; border-radius: 22px; background: #EDEDEB; color: #0D0E0F; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700">${(s.profile.name || 'D').slice(0, 1)}</a></div>

  <div style="position: relative; height: 328px; border-radius: 28px; overflow: hidden; background: #1A1B1C; flex: none">
<img src="assets/img/hero-main.jpg" alt="Z-zero 카프 슬리브" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 70% 40%">

<div style="position: absolute; inset: 0; background: linear-gradient(90deg, rgba(13,14,15,0.88) 0%, rgba(13,14,15,0.35) 58%, rgba(13,14,15,0) 100%), linear-gradient(180deg, rgba(13,14,15,0) 55%, rgba(13,14,15,0.7) 100%)"></div>
<div style="position: absolute; left: 18px; right: 18px; top: 18px; bottom: 18px; display: flex; flex-direction: column">
  <div style="display: flex; justify-content: space-between"><span ${v.paired ? '' : 'data-act="pair" '}style="height: 30px; padding: 0 12px; box-sizing: border-box; border-radius: 15px; background: ${v.paired ? 'rgba(212,238,59,0.14)' : 'rgba(240,128,58,0.16)'}; color: ${v.paired ? '#D4EE3B' : WARN}; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; flex: none"><svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${v.paired ? '<path d="M4.5 10.5l3.5 3.5 7.5-8"/>' : '<path d="M6 6.5l8 7-4 3.5V3l4 3.5-8 7"/>'}</svg>${t(v.paired ? "준비 완료" : "슬리브 연결하기")}</span><a href="#Summary" aria-label="${t("지난 분석")}" style="width: 44px; height: 44px; flex: none; box-sizing: border-box; border-radius: 22px; background: rgba(13,14,15,0.45); border: 1px solid rgba(255,255,255,0.14); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 14L14 6M7.5 6H14v6.5"/></svg></a></div>
  <span style="margin-top: 26px; display: flex; align-items: baseline; gap: 6px"><span style="font-family: ${DISPLAY}; font-size: 120px; font-weight: 600; line-height: 0.78; font-variant-numeric: tabular-nums; letter-spacing: 0">${v.ready}</span><span style="font-size: 15px; font-weight: 600; color: rgba(237,237,235,0.62)">/100</span></span>
  <span style="font-size: 14px; font-weight: 600; color: rgba(237,237,235,0.62)">${t("종아리 컨디션")} · ${t("지난 운동 후 회복 정도")}</span>
  <div style="margin-top: auto; display: flex; flex-direction: column; gap: 8px"><div style="display: flex; gap: 6px">${v.bars.map((c) => `<span style="flex: 1; height: 4px; border-radius: 2px; background: ${c}"></span>`).join('')}</div><span style="font-size: 12px; font-weight: 600; color: rgba(237,237,235,0.62); font-variant-numeric: tabular-nums">${t("이번 주 {n} / {g}", { n: v.wk, g: v.goal })}</span></div>
</div>
</div>

  <a href="#${s.live ? 'Live' : 'Select'}" style="height: 56px; box-sizing: border-box; padding: 0 22px 0 6px; border-radius: 28px; background: #D4EE3B; color: #0D0E0F; display: flex; align-items: center; font-size: 16px; font-weight: 700"><span style="width: 44px; height: 44px; flex: none; border-radius: 22px; background: #0D0E0F; display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#D4EE3B" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4.5l9 5.5-9 5.5z" fill="#D4EE3B"/></svg></span><span style="flex: 1; text-align: center; padding: 0 0px 0 0px">${t(s.live ? "운동 이어가기" : "운동 시작")}</span></a>

  <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">
    <div data-act="last" style="height: 112px; box-sizing: border-box; border-radius: 24px; background: ${v.last && v.last.cramps ? 'linear-gradient(160deg, #F7A066 0%, #F0803A 60%, #C9611F 100%)' : 'linear-gradient(160deg, #E2F55E 0%, #C6E02C 55%, #9DB51C 100%)'}; color: #0D0E0F; padding: 12px 14px 14px; display: flex; flex-direction: column; justify-content: space-between; min-width: 0"><span style="width: 36px; height: 36px; border-radius: 18px; background: rgba(13,14,15,0.12); display: flex; align-items: center; justify-content: center"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#0D0E0F" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 10.5l3.5 3.5 7.5-8"/></svg></span><span style="display: flex; flex-direction: column"><span style="font-size: 24px; font-weight: 700; line-height: 1.1; font-variant-numeric: tabular-nums; letter-spacing: -0.03em; white-space: nowrap">${v.last ? v.last.cramps : 0}</span><span style="font-size: 12px; font-weight: 500; color: rgba(13,14,15,0.66)">${t("지난 운동 쥐")}</span></span></div>
    <div data-act="last" style="height: 112px; box-sizing: border-box; border-radius: 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); color: #EDEDEB; padding: 12px 14px 14px; display: flex; flex-direction: column; justify-content: space-between; min-width: 0"><span style="width: 36px; height: 36px; border-radius: 18px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4.5l9 5.5-9 5.5z" fill="#EDEDEB"/></svg></span><span style="display: flex; flex-direction: column"><span style="font-size: 24px; font-weight: 700; line-height: 1.1; font-variant-numeric: tabular-nums; letter-spacing: -0.03em; white-space: nowrap">${v.last ? fmt(v.last.duration) : '–'}</span><span style="font-size: 12px; font-weight: 500; color: rgba(237,237,235,0.62)">${t("지난 운동")}</span></span></div>
    <div data-act="legs" style="height: 112px; box-sizing: border-box; border-radius: 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); color: #EDEDEB; padding: 12px 12px 14px; display: flex; flex-direction: column; justify-content: space-between; min-width: 0"><span style="display: flex; justify-content: space-between; align-items: center"><span style="width: 36px; height: 36px; border-radius: 18px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 2.5L4.5 11H10l-1 6.5L15.5 9H10z"/></svg></span><span style="font-size: 11.5px; font-weight: 600; color: rgba(237,237,235,0.62)">${t("다리별")}</span></span><span style="display: flex; justify-content: space-between"><span style="display: flex; align-items: flex-end; gap: 4px"><svg width="12.8" height="20" viewBox="0 0 16 25" aria-hidden="true"><g transform="translate(16,0) scale(-1,1)"><path d="M2.6 1h7.2l.4 7.2-.5 7.6.6 3.1 4.6 1.9c.9.4 1 1.9.1 2.4l-.5.3H4.2c-.8 0-1.3-.6-1.2-1.4l.6-3.4C1.8 14.6.9 10.4 1.6 6.4z" fill="#EDEDEB"></path></g></svg><span style="font-size: 20px; font-weight: 700; line-height: 1; font-variant-numeric: tabular-nums; letter-spacing: -0.03em">${v.legs.L}</span></span><span style="display: flex; align-items: flex-end; gap: 4px"><svg width="12.8" height="20" viewBox="0 0 16 25" aria-hidden="true"><g><path d="M2.6 1h7.2l.4 7.2-.5 7.6.6 3.1 4.6 1.9c.9.4 1 1.9.1 2.4l-.5.3H4.2c-.8 0-1.3-.6-1.2-1.4l.6-3.4C1.8 14.6.9 10.4 1.6 6.4z" fill="#EDEDEB"></path></g></svg><span style="font-size: 20px; font-weight: 700; line-height: 1; font-variant-numeric: tabular-nums; letter-spacing: -0.03em">${v.legs.R}</span></span></span></div>
  </div>

</div>${tabBar('Main')}
</div>
`,
  actions: {
    last: (b, app) => { const l = app.s.sessions[app.s.sessions.length - 1]; if (l) app.go('Summary', { params: { sid: l.id } }); else app.toast(t('아직 운동 기록이 없어요')); },
    legs: (b, app) => {
      const v = view(app.s);
      app.sheet({ title: t('다리별 컨디션'), body: `<p>${t('지난 운동에서 더 지친 다리일수록 점수가 낮아요. 점수가 낮은 쪽은 운동 전에 다이얼을 ½바퀴 먼저 조여 두세요.')}</p><div style="display:flex;gap:10px">${['L', 'R'].map((sd) => `<div style="flex:1;border-radius:24px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);padding:16px;display:flex;flex-direction:column;gap:6px"><span style="display:flex;gap:6px;align-items:center;color:rgba(237,237,235,0.62);font-size:13px;font-weight:600">${legIcon(sd, AC)}${t(sd === 'L' ? '왼쪽' : '오른쪽')}</span><span style="font-size:34px;font-weight:700;letter-spacing:-0.03em">${v.legs[sd]}</span></div>`).join('')}</div>`, actions: [{ label: t('확인'), primary: true }] });
    },
    pair: (b, app) => app.go('Connect'),
  },
};
