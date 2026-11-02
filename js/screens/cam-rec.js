import { t, statusBar, fmt, AC } from '../ui.js';

// 촬영 중: 다이얼 카메라 화면. 수치는 시뮬레이터(live)에서 0.25초마다 갱신

export default {
  id: 'CamRec',
  render: (s, _app, L = s.live || { t: 0, ankle: 34, touches: 0, clips: [], lastTouch: '인사이드 터치', recPaused: false }) => `
<div class="root">
<div aria-hidden="true" style="position: absolute; left: -120px; top: -160px; width: 520px; height: 420px; border-radius: 50%; background: radial-gradient(closest-side, rgba(212,238,59,0.09), rgba(0,0,0,0))"></div>

<video src="assets/video/feed.mp4" poster="assets/video/feed.jpg" autoplay muted loop playsinline alt="${t('다이얼 카메라 실시간 화면')}" data-b="feed" style="transition: transform .4s ease; position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 38% 50%"></video>
<div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(13,14,15,0.55) 0%, rgba(13,14,15,0) 22%, rgba(13,14,15,0) 50%, rgba(13,14,15,0.85) 100%)"></div>
${statusBar()}
<div style="position: absolute; left: 20px; right: 20px; top: 58px; display: flex; justify-content: space-between; align-items: center">
  <span style="display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 16px; box-sizing: border-box; border-radius: 22px; background: rgba(13,14,15,0.45); border: 1px solid rgba(255,255,255,0.14); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); font-size: 13px; font-weight: 700"><span data-b="dot" class="${L.recPaused ? '' : 'blink'}" style="width: 8px; height: 8px; border-radius: 4px; background: ${L.recPaused ? 'rgba(237,237,235,0.62)' : '#F0803A'}"></span><span data-b="recl">${L.recPaused ? 'II' : 'REC'}</span> <span data-b="time" style="font-variant-numeric: tabular-nums; font-weight: 600">${fmt(L.t)}</span></span>
  <span style="display: flex; gap: 8px"><button type="button" data-act="lock" aria-label="${t("화면 잠금")}" style="width: 44px; height: 44px; flex: none; box-sizing: border-box; border-radius: 22px; background: rgba(13,14,15,0.45); border: 1px solid rgba(255,255,255,0.14); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); display: flex; align-items: center; justify-content: center; padding: 0; font-family: inherit"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4.5" y="9" width="11" height="8" rx="2"/><path d="M7 9V6.5a3 3 0 016 0V9"/></svg></button><a href="#Live" data-act="close" aria-label="${t("카메라 닫기")}" style="width: 44px; height: 44px; flex: none; box-sizing: border-box; border-radius: 22px; background: rgba(13,14,15,0.45); border: 1px solid rgba(255,255,255,0.14); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15"/></svg></a></span>
</div>

<div data-b="box" style="position: absolute; left: 92px; top: 300px; width: 150px; height: 150px; transition: left 1.2s ease, top 1.2s ease">
  <span style="position: absolute; left: 0; top: 0; width: 22px; height: 22px; border-left: 2px solid #D4EE3B; border-top: 2px solid #D4EE3B; border-top-left-radius: 8px"></span>
  <span style="position: absolute; right: 0; top: 0; width: 22px; height: 22px; border-right: 2px solid #D4EE3B; border-top: 2px solid #D4EE3B; border-top-right-radius: 8px"></span>
  <span style="position: absolute; left: 0; bottom: 0; width: 22px; height: 22px; border-left: 2px solid #D4EE3B; border-bottom: 2px solid #D4EE3B; border-bottom-left-radius: 8px"></span>
  <span style="position: absolute; right: 0; bottom: 0; width: 22px; height: 22px; border-right: 2px solid #D4EE3B; border-bottom: 2px solid #D4EE3B; border-bottom-right-radius: 8px"></span>
  <span style="position: absolute; left: 0; top: -38px"><span style="height: 30px; padding: 0 12px; box-sizing: border-box; border-radius: 15px; background: #D4EE3B; color: #0D0E0F; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; flex: none"><span data-b="tag">${t(L.lastTouch)} · ${L.ankle}°</span></span></span>
</div>

<div style="position: absolute; left: 16px; right: 16px; bottom: 34px; display: flex; flex-direction: column; gap: 10px">
  <div style="border-radius: 28px; background: rgba(13,14,15,0.45); border: 1px solid rgba(255,255,255,0.14); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); padding: 14px 16px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr))">
    <span style="display: flex; flex-direction: column; border-right: 1px solid rgba(255,255,255,0.12)"><span style="font-size: 11.5px; color: rgba(237,237,235,0.62)">${t("발목")}</span><span style="font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: -0.03em" data-b="ankle">${L.ankle}°</span></span>
    <span style="display: flex; flex-direction: column; padding-left: 14px; border-right: 1px solid rgba(255,255,255,0.12)"><span style="font-size: 11.5px; color: rgba(237,237,235,0.62)">${t("터치")}</span><span style="font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: -0.03em" data-b="touch">${L.touches}</span></span>
    <span style="display: flex; flex-direction: column; padding-left: 14px"><span style="font-size: 11.5px; color: rgba(237,237,235,0.62)">${t("클립")}</span><span style="font-size: 22px; font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: -0.03em" data-b="clips">${L.clips.length}</span></span>
  </div>
  <div style="display: flex; gap: 10px; align-items: center"><button type="button" data-act="flip" aria-label="${t("카메라 다리 전환")}" style="width: 56px; height: 56px; flex: none; box-sizing: border-box; border-radius: 28px; background: rgba(13,14,15,0.45); border: 1px solid rgba(255,255,255,0.14); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); display: flex; align-items: center; justify-content: center; padding: 0; font-family: inherit"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8a6 6 0 0110.5-2.5L16 7"/><path d="M16 3.5V7h-3.5"/><path d="M16 12a6 6 0 01-10.5 2.5L4 13"/><path d="M4 16.5V13h3.5"/></svg></button><button type="button" data-act="pause" aria-label="${t("촬영 일시정지")}" style="width: 56px; height: 56px; flex: none; box-sizing: border-box; border-radius: 28px; background: rgba(13,14,15,0.45); border: 1px solid rgba(255,255,255,0.14); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); display: flex; align-items: center; justify-content: center; padding: 0; font-family: inherit"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.5 5v10M12.5 5v10"/></svg></button><a href="#Live" data-act="stop" style="flex: 1; height: 56px; box-sizing: border-box; padding: 0 22px 0 6px; border-radius: 28px; background: #EDEDEB; color: #0D0E0F; display: flex; align-items: center; font-size: 16px; font-weight: 700"><span style="width: 44px; height: 44px; flex: none; border-radius: 22px; background: #0D0E0F; display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5.5" y="5.5" width="9" height="9" rx="2" fill="#EDEDEB"/></svg></span><span style="flex: 1; text-align: center; padding: 0 0px 0 0px">${t("촬영 끝")}</span></a></div>
</div>

</div>
`,
  actions: {
    lock: (b, app) => app.lock(),
    close: (b, app) => app.go('Live', { replace: true }),
    flip: (b, app) => {
      app.store.set((s) => { s.live.camSide = s.live.camSide === 'R' ? 'L' : 'R'; });
      const sd = app.s.live.camSide;
      const img = b.closest('.screen').querySelector('[data-b="feed"]'); img.style.transform = sd === 'L' ? 'scaleX(-1)' : '';
      app.toast(t(sd === 'L' ? '왼쪽 다리 카메라' : '오른쪽 다리 카메라'));
    },
    pause: (b, app) => {
      app.store.set((s) => { s.live.recPaused = !s.live.recPaused; });
      const p = app.s.live.recPaused, el = b.closest('.screen');
      const dot = el.querySelector('[data-b="dot"]'); dot.classList.toggle('blink', !p); dot.style.background = p ? 'rgba(237,237,235,0.62)' : '#F0803A';
      el.querySelector('[data-b="recl"]').textContent = p ? 'II' : 'REC';
      b.innerHTML = p ? '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4.5l9 5.5-9 5.5z" fill="#EDEDEB"/></svg>' : '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4.5v11M13 4.5v11"/></svg>';
      const v = el.querySelector('video'); if (v) { if (p) v.pause(); else v.play().catch(() => {}); }
      app.toast(t(p ? '촬영 일시정지' : '촬영 재개'));
    },
    stop: (b, app) => {
      app.store.set((s) => { s.live.camOn = false; });
      app.toast(t('클립 {n}개 저장됨', { n: app.s.live.clips.length }));
      app.go('Live', { replace: true });
    },
  },
  mount(el, app) {
    if (!app.s.live) app.startWorkout();
    app.store.set((s) => { s.live.camOn = true; }, { silent: true });
    if (app.s.live.camSide === 'L') el.querySelector('[data-b="feed"]').style.transform = 'scaleX(-1)';
  },
  tick(el, s) {
    const L = s.live; if (!L) return;
    const set = (k, v) => { const e = el.querySelector(`[data-b="${k}"]`); if (e && e.textContent !== String(v)) e.textContent = v; };
    set('time', fmt(L.t)); set('ankle', L.ankle + '°'); set('touch', L.touches); set('clips', L.clips.length);
    set('tag', t(L.lastTouch) + ' · ' + L.ankle + '°');
    // 발 추적 박스가 발 따라 조금씩 움직임
    if (!L.recPaused && Math.random() < 0.05) {
      const box = el.querySelector('[data-b="box"]');
      box.style.left = 80 + Math.round(Math.random() * 30) + 'px'; box.style.top = 286 + Math.round(Math.random() * 34) + 'px';
    }
  },
};
