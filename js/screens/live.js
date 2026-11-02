import { t, statusBar, fmt, legIcon, AC, WARN, DISPLAY } from '../ui.js';
import { sportById, MODES } from '../data.js';
import { effThreshold } from '../sim.js';

// 운동 중: 시뮬레이터 값이 0.25초마다 tick()으로 갱신됨
const EMPTY = { t: 0, L: 15, R: 14, p: { L: 14, R: 13 }, transitions: 0, running: true, sport: 'futsal', mode: 'match' };
function calc(s) {
  const L = s.live || { ...EMPTY, sport: s.plan.sport, mode: s.plan.mode };
  const th = effThreshold(s.settings), load = Math.round(Math.max(L.L, L.R));
  const m = MODES[L.mode] || MODES.match;
  const prog = Math.min(0.999, L.t / m.plan);
  const segs = Array.from({ length: 4 }, (_, i) => (i < Math.floor(prog * 4) ? '#EDEDEB' : i === Math.floor(prog * 4) ? AC : 'rgba(255,255,255,0.16)'));
  const phase = m.halves === 2 ? (L.t < m.plan / 2 ? '전반' : '후반') : m.name;
  const st = load >= th ? ['위험', WARN] : load >= th - 8 ? ['주의', '#F5C04A'] : ['안정@Live', AC];
  return { L, th, load, segs, phase, st, ring: (251.3 * Math.min(load, 100) / 100).toFixed(1), rc: load >= th - 5 ? WARN : AC };
}
const PAUSE_IC = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#D4EE3B" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4.5v11M13 4.5v11"/></svg>';
const PLAY_IC = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#D4EE3B" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4.5l9 5.5-9 5.5z" fill="#D4EE3B"/></svg>';

export default {
  id: 'Live',
  render: (s, _app, v = calc(s)) => `
<div class="root">
<div aria-hidden="true" style="position: absolute; left: -120px; top: -160px; width: 520px; height: 420px; border-radius: 50%; background: radial-gradient(closest-side, rgba(212,238,59,0.09), rgba(0,0,0,0))"></div>

<img src="assets/img/live-bg.jpg" alt="" aria-hidden="true" style="position: absolute; right: -130px; top: 30px; width: 400px; height: 520px; object-fit: cover; object-position: 50% 18%; opacity: 0.3">
<div style="position: absolute; inset: 0; background: linear-gradient(90deg, #0D0E0F 28%, rgba(13,14,15,0.15) 100%), linear-gradient(180deg, rgba(13,14,15,0) 40%, #0D0E0F 64%)"></div>
${statusBar()}<div style="position: absolute; inset: 0; padding: 58px 20px 34px; display: flex; flex-direction: column; gap: 16px">

  <div style="display: flex; gap: 6px" data-b="segs">${v.segs.map((c) => `<span style="flex: 1; height: 4px; border-radius: 2px; background: ${c}"></span>`).join('')}</div>
  <div style="display: flex; margin-top: -10px; font-size: 10.5px; font-weight: 600; color: rgba(237,237,235,0.45)">${(MODES[v.L.mode] || MODES.match).halves === 2 ? `<span style="flex: 1">${t('전반')} 0–${Math.round((MODES[v.L.mode] || MODES.match).plan / 120)}′</span><span style="flex: 1">${t('후반')} –${Math.round((MODES[v.L.mode] || MODES.match).plan / 60)}′</span>` : `<span>${t('목표 {m}분', { m: Math.round((MODES[v.L.mode] || MODES.match).plan / 60) })}</span>`}</div>
  <div style="display: flex; justify-content: space-between; align-items: center">
    <span style="height: 30px; padding: 0 12px; box-sizing: border-box; border-radius: 15px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); color: #EDEDEB; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; flex: none"><span class="${v.L.running ? 'blink' : ''}" data-b="pdot" style="width: 6px; height: 6px; border-radius: 3px; background: #D4EE3B"></span><span data-b="phase">${t(sportById(v.L.sport).name)} · ${t(v.phase)}</span></span>
    <span style="display: flex; gap: 8px"><a href="#CamRec" data-act="cam" aria-label="${t("카메라 열기")}" style="width: 44px; height: 44px; flex: none; box-sizing: border-box; border-radius: 22px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="5.5" width="15" height="10.5" rx="2.6"/><circle cx="10" cy="10.75" r="2.8"/><path d="M7 5.5l1.2-2h3.6l1.2 2"/></svg></a><button type="button" data-act="lock" aria-label="${t("화면 잠금")}" style="width: 44px; height: 44px; flex: none; box-sizing: border-box; border-radius: 22px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); display: flex; align-items: center; justify-content: center; padding: 0; font-family: inherit"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4.5" y="9" width="11" height="8" rx="2"/><path d="M7 9V6.5a3 3 0 016 0V9"/></svg></button></span>
  </div>

  <div style="margin-top: 52px; display: flex; flex-direction: column; gap: 4px">
    <span style="font-size: 12px; font-weight: 500; color: rgba(237,237,235,0.62)">${t("경과")}</span>
    <span style="font-family: ${DISPLAY}; font-size: 136px; font-weight: 600; line-height: 0.78; font-variant-numeric: tabular-nums; letter-spacing: 0; margin-top: 10px" data-b="time">${fmt(v.L.t)}</span>
    <span style="font-size: 22px; font-weight: 700; letter-spacing: -0.02em; margin-top: 10px">${t("종아리@Live")} <span data-b="st" style="color: ${v.st[1]}">${t(v.st[0])}</span></span>
  </div>

  <section style="border-radius: 28px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); padding: 16px; display: flex; align-items: center; gap: 16px">
    <span style="position: relative; width: 88px; height: 88px; flex: none"><svg width="88" height="88" viewBox="0 0 88 88" aria-hidden="true" style="position: absolute; inset: 0; transform: rotate(-90deg)"><circle cx="44.0" cy="44.0" r="40.0" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="8"></circle><circle cx="44.0" cy="44.0" r="40.0" fill="none" data-b="ring" stroke="${v.rc}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${v.ring} 251.3" style="transition: stroke-dasharray .25s linear"></circle><circle cx="44.0" cy="44.0" r="40.0" fill="none" stroke="#EDEDEB" stroke-width="12" stroke-dasharray="2 251.3" stroke-dashoffset="${(-251.3 * v.th / 100).toFixed(1)}"></circle></svg><span style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center"><span style="font-size: 26px; font-weight: 700; line-height: 1; font-variant-numeric: tabular-nums; letter-spacing: -0.03em"><span data-b="load">${v.load}</span><span style="font-size: 14px">%</span></span><span style="font-size: 10.5px; color: rgba(237,237,235,0.62)">${t("부하")}</span></span></span>
    <span style="flex: 1; display: flex; flex-direction: column; gap: 4px"><span style="font-size: 15px; font-weight: 700">${t("종아리 부하")}</span><span style="font-size: 12.5px; font-weight: 600; color: rgba(237,237,235,0.62)">${t("더 지친 다리 기준")}</span><span style="font-size: 12.5px; font-weight: 600; color: rgba(237,237,235,0.62); display: flex; align-items: center; gap: 6px"><span style="width: 3px; height: 12px; border-radius: 2px; background: #EDEDEB"></span>${t("경고 기준 {n}%", { n: v.th })}</span></span>
    <a href="#Live" data-act="loadInfo" aria-label="${t("종아리 부하란?")}" style="align-self: flex-start; padding: 4px"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="rgba(237,237,235,0.40)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.5 5l5 5-5 5"/></svg></a>
  </section>

  <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">
    <div style="height: 112px; box-sizing: border-box; border-radius: 24px; background: #EDEDEB; color: #0D0E0F; padding: 12px 12px 14px; display: flex; flex-direction: column; justify-content: space-between; min-width: 0"><span style="display: flex; justify-content: space-between; align-items: center"><span style="width: 36px; height: 36px; border-radius: 18px; background: rgba(13,14,15,0.08); display: flex; align-items: center; justify-content: center"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#0D0E0F" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3v7l-2 6h6l1-3-2-3V3"/></svg></span><span style="font-size: 11.5px; font-weight: 600; color: rgba(13,14,15,0.62)">${t("부하 %")}</span></span><span style="display: flex; justify-content: space-between"><span style="display: flex; align-items: flex-end; gap: 2px">${legIcon('L', '#0D0E0F', 10.4, 16, true)}<span style="font-size: 18px; font-weight: 700; line-height: 1; font-variant-numeric: tabular-nums; letter-spacing: -0.03em" data-b="lL">${Math.round(v.L.L)}</span></span><span style="display: flex; align-items: flex-end; gap: 2px">${legIcon('R', '#0D0E0F', 10.4, 16, true)}<span style="font-size: 18px; font-weight: 700; line-height: 1; font-variant-numeric: tabular-nums; letter-spacing: -0.03em" data-b="lR">${Math.round(v.L.R)}</span></span></span></div>
    <div style="height: 112px; box-sizing: border-box; border-radius: 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); color: #EDEDEB; padding: 12px 12px 14px; display: flex; flex-direction: column; justify-content: space-between; min-width: 0"><span style="display: flex; justify-content: space-between; align-items: center"><span style="width: 36px; height: 36px; border-radius: 18px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4.5" y="9" width="11" height="8" rx="2"/><path d="M7 9V6.5a3 3 0 016 0V9"/></svg></span><span style="font-size: 11.5px; font-weight: 600; color: rgba(237,237,235,0.62)">mmHg</span></span><span style="display: flex; justify-content: space-between"><span style="display: flex; align-items: flex-end; gap: 2px">${legIcon('L', '#EDEDEB', 10.4, 16, true)}<span style="font-size: 18px; font-weight: 700; line-height: 1; font-variant-numeric: tabular-nums; letter-spacing: -0.03em" data-b="pL">${v.L.p.L}</span></span><span style="display: flex; align-items: flex-end; gap: 2px">${legIcon('R', '#EDEDEB', 10.4, 16, true)}<span style="font-size: 18px; font-weight: 700; line-height: 1; font-variant-numeric: tabular-nums; letter-spacing: -0.03em" data-b="pR">${v.L.p.R}</span></span></span></div>
    <div style="height: 112px; box-sizing: border-box; border-radius: 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); color: #EDEDEB; padding: 12px 14px 14px; display: flex; flex-direction: column; justify-content: space-between; min-width: 0"><span style="width: 36px; height: 36px; border-radius: 18px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 15c2-6 6-9 12-10"/><path d="M12 4h4.5v4.5"/></svg></span><span style="display: flex; flex-direction: column"><span style="font-size: 24px; font-weight: 700; line-height: 1.1; font-variant-numeric: tabular-nums; letter-spacing: -0.03em; white-space: nowrap" data-b="tr">${v.L.transitions}</span><span style="font-size: 12px; font-weight: 500; color: rgba(237,237,235,0.62)">${t("방향 전환")}</span></span></div>
  </div>

  <div style="margin-top: auto; display: flex; gap: 10px"><button type="button" data-act="pause" style="flex: 1; height: 56px; box-sizing: border-box; padding: 0 22px 0 6px; border-radius: 28px; background: #EDEDEB; color: #0D0E0F; display: flex; align-items: center; font-size: 16px; font-weight: 700; border: 0; font-family: inherit"><span style="width: 44px; height: 44px; flex: none; border-radius: 22px; background: #0D0E0F; display: flex; align-items: center; justify-content: center"><span data-b="pic" style="display: contents">${v.L.running ? PAUSE_IC : PLAY_IC}</span></span><span style="flex: 1; text-align: center; padding: 0 0px 0 0px"><span data-b="plab">${t(v.L.running ? "일시정지" : "재개")}</span></span></button><a href="#Summary" data-act="end" style="flex: 1; height: 56px; box-sizing: border-box; padding: 0 22px 0 6px; border-radius: 28px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); color: #EDEDEB; display: flex; align-items: center; font-size: 16px; font-weight: 700"><span style="width: 44px; height: 44px; flex: none; border-radius: 22px; background: rgba(255,255,255,0.12); display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5.5" y="5.5" width="9" height="9" rx="2" fill="#EDEDEB"/></svg></span><span style="flex: 1; text-align: center; padding: 0 0px 0 0px">${t("종료")}</span></a></div>

</div>
</div>
`,
  actions: {
    cam: (b, app) => { if (!app.s.settings.camera) app.store.set((s) => { s.settings.camera = true; }); app.go('CamRec'); },
    lock: (b, app) => app.lock(),
    loadInfo: (b, app) => {
      const th = effThreshold(app.s.settings);
      app.sheet({
        title: t('종아리 부하란?'),
        body: `<p>${t('다이얼 속 압력 센서가 종아리 근육이 다이얼을 미는 압력을 재요. 착용 체크 때 잰 기준값을 0%로 두고, 근육이 지쳐 부풀수록 %가 올라가요.')}</p><p>${t('왼쪽·오른쪽 중 더 높은 쪽을 크게 보여주고, {n}%에 닿으면 다이얼이 진동하며 경고가 떠요.', { n: th })}</p>`,
        actions: [
          { label: t('확인'), primary: true },
          // 시연용: 실제 운동 없이 경고 화면을 바로 보여줌 (그 순간 부하를 기준 +4로 올림)
          { label: t('데모: 경고 바로 띄우기'), onClick: () => {
            app.store.set((s) => { const L = s.live; if (!L) return; const sd = L.L >= L.R ? 'L' : 'R'; L[sd] = Math.max(L[sd], effThreshold(s.settings) + 4); L.alertActive = { t: Math.round(L.t), load: Math.round(L[sd]), side: sd, preview: true }; });
          } },
        ],
      });
    },
    pause: (b, app) => {
      app.store.set((s) => { s.live.running = !s.live.running; });
      const r = app.s.live.running, el = b.closest('.screen');
      el.querySelector('[data-b="pic"]').innerHTML = r ? PAUSE_IC : PLAY_IC;
      el.querySelector('[data-b="plab"]').textContent = t(r ? '일시정지' : '재개');
      el.querySelector('[data-b="pdot"]').classList.toggle('blink', r);
    },
    end: (b, app) => {
      app.sheet({
        title: t('운동을 끝낼까요?'),
        body: `<p>${t('지금까지 기록이 저장되고 분석 화면으로 넘어가요.')}</p>`,
        actions: [
          { label: t('끝내고 분석 보기'), primary: true, onClick: () => { const id = app.endWorkout(); if (id) app.go('Summary', { replace: true, params: { sid: id } }); else { app.toast(t('기록이 너무 짧아 저장하지 않았어요')); app.go('Main', { replace: true }); } } },
          { label: t('계속하기') },
        ],
      });
    },
  },
  mount(el, app) { if (!app.s.live) { app.startWorkout(); app.refresh(); } },
  tick(el, s) {
    if (!s.live) return;
    const v = calc(s);
    const set = (k, x) => { const e = el.querySelector(`[data-b="${k}"]`); if (e && e.textContent !== String(x)) e.textContent = x; };
    set('time', fmt(v.L.t)); set('load', v.load); set('lL', Math.round(v.L.L)); set('lR', Math.round(v.L.R));
    set('pL', v.L.p.L); set('pR', v.L.p.R); set('tr', v.L.transitions);
    set('phase', t(sportById(v.L.sport).name) + ' · ' + t(v.phase));
    const st = el.querySelector('[data-b="st"]'); st.textContent = t(v.st[0]); st.style.color = v.st[1];
    const ring = el.querySelector('[data-b="ring"]'); ring.setAttribute('stroke-dasharray', v.ring + ' 251.3'); ring.setAttribute('stroke', v.rc);
    [...el.querySelector('[data-b="segs"]').children].forEach((c, i) => (c.style.background = v.segs[i]));
  },
};
