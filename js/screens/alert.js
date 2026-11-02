import { t, statusBar, fmt, legIcon, WARN } from '../ui.js';
import { effThreshold } from '../sim.js';

// 종아리 경고: 다이얼 ½바퀴 조이라는 안내. 완료 → 그쪽 부하 −18, 압박 +5 mmHg (상한까지)
function calc(s) {
  const L = s.live;
  const a = (L && L.alertActive) || { t: L ? Math.round(L.t) : 1930, load: Math.max(L ? Math.round(Math.max(L.L, L.R)) : 0, effThreshold(s.settings) + 4), side: L && L.R > L.L ? 'R' : 'L' };
  const cap = s.settings.pressureCap, p0 = L ? L.p[a.side] : 14;
  return { a, th: effThreshold(s.settings), p0, p1: Math.min(cap, p0 + 5), cap, ring: (634.6 * Math.min(1, a.load / 80)).toFixed(1) };
}
const legs = (side, on, off, w, h) => (side === 'L' ? legIcon('L', on, w, h) + legIcon('R', off, w, h) : legIcon('L', off, w, h) + legIcon('R', on, w, h));
let since = 0, sinceT, vibT;

export default {
  id: 'Alert',
  render: (s, _app, v = calc(s)) => `
<div class="root">
<div aria-hidden="true" style="position: absolute; left: -120px; top: -160px; width: 520px; height: 420px; border-radius: 50%; background: radial-gradient(closest-side, rgba(240,128,58,0.10), rgba(0,0,0,0))"></div>
${statusBar()}<div style="position: absolute; inset: 0; padding: 58px 20px 34px; display: flex; flex-direction: column; gap: 16px">

  <div style="display: flex; align-items: center; justify-content: space-between"><a href="#Live" data-act="dismiss" aria-label="${t("경고 닫기")}" style="width: 44px; height: 44px; flex: none; box-sizing: border-box; border-radius: 22px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15"/></svg></a><span style="font-size: 16px; font-weight: 700">${t("종아리 경고")}</span><button type="button" data-act="mute" aria-label="${t("진동 끄기")}" style="width: 44px; height: 44px; flex: none; box-sizing: border-box; border-radius: 22px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); display: flex; align-items: center; justify-content: center; padding: 0; font-family: inherit"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 14V9a5 5 0 0110 0v5l1.5 1.5h-13z"/><path d="M8.3 17.5a2 2 0 003.4 0"/></svg></button></div>
  <div style="display: flex; justify-content: center"><span style="height: 36px; padding: 0 14px; box-sizing: border-box; border-radius: 18px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); display: inline-flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 700; font-variant-numeric: tabular-nums"><span role="img" aria-label="${t(v.a.side === 'L' ? "왼쪽 다리" : "오른쪽 다리")}" style="display: inline-flex; gap: 3px; align-items: flex-end">${legs(v.a.side, WARN, 'rgba(237,237,235,0.22)', 12.8, 20)}</span>${fmt(v.a.t)}</span></div>

  <div style="position: relative; height: 252px; display: flex; align-items: center; justify-content: center">
    <span aria-hidden="true" style="position: absolute; width: 252px; height: 252px; border-radius: 126px; border: 1px solid rgba(240,128,58,0.16)"></span>
    <span style="position: relative; width: 212px; height: 212px"><svg width="212" height="212" viewBox="0 0 212 212" aria-hidden="true" style="position: absolute; inset: 0; transform: rotate(-90deg)"><circle cx="106.0" cy="106.0" r="101.0" fill="none" stroke="rgba(255,255,255,0.10)" stroke-width="10"></circle><circle cx="106.0" cy="106.0" r="101.0" fill="none" stroke="#F0803A" stroke-width="10" stroke-linecap="round" stroke-dasharray="${v.ring} 634.6"></circle></svg><img src="assets/img/dial.jpg" alt="${t(v.a.side === 'L' ? "왼쪽 다이얼" : "오른쪽 다이얼")}" data-b="dial" style="position: absolute; left: 22px; top: 22px; width: 168px; height: 168px; border-radius: 84px; object-fit: cover; transition: transform .8s cubic-bezier(.3,.7,.2,1)"></span>
    <span style="position: absolute; right: 22px; top: 20px; display: flex; flex-direction: column; align-items: center; padding: 8px 12px; border-radius: 18px; background: rgba(13,14,15,0.45); border: 1px solid rgba(255,255,255,0.14); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px)"><span style="font-size: 22px; font-weight: 700; line-height: 1; color: #F0803A; font-variant-numeric: tabular-nums; letter-spacing: -0.03em">${v.a.load}</span><span style="font-size: 10.5px; color: rgba(237,237,235,0.62)">${t("{n} 초과", { n: v.th })}</span></span>
  </div>

  <section style="border-radius: 28px; background: #EDEDEB; color: #0D0E0F; padding: 18px; display: flex; align-items: center; justify-content: space-between; gap: 12px">
    <span style="display: flex; flex-direction: column; gap: 2px"><span style="display: flex"><span role="img" aria-label="${t(v.a.side === 'L' ? "왼쪽 다리" : "오른쪽 다리")}" style="display: inline-flex; gap: 4px; align-items: flex-end">${legs(v.a.side, '#0D0E0F', 'rgba(13,14,15,0.18)', 17.9, 28)}</span></span><span style="font-size: 38px; font-weight: 800; letter-spacing: -0.04em; line-height: 1.05">${t("½ 바퀴")}</span></span>
    <span data-act="done" role="button" aria-label="${t("완료")}" style="width: 56px; height: 56px; flex: none; border-radius: 28px; background: #D4EE3B; display: flex; align-items: center; justify-content: center"><svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="#0D0E0F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15.5 10a5.5 5.5 0 11-1.6-3.9"/><path d="M14.5 2.8v3.6h-3.6"/></svg></span>
  </section>

  <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); padding: 0 6px">
    <span style="display: flex; flex-direction: column; align-items: center"><span style="display: flex"><svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="rgba(237,237,235,0.62)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 14V9a5 5 0 0110 0v5l1.5 1.5h-13z"/><path d="M8.3 17.5a2 2 0 003.4 0"/></svg></span><span style="font-size: 17px; font-weight: 700; font-variant-numeric: tabular-nums" data-b="since">${fmt(since)}</span></span>
    <span style="display: flex; flex-direction: column; align-items: center; border-left: 1px solid rgba(255,255,255,0.08); border-right: 1px solid rgba(255,255,255,0.08)"><span style="font-size: 11.5px; color: rgba(237,237,235,0.62)">mmHg</span><span style="font-size: 17px; font-weight: 700; font-variant-numeric: tabular-nums">${v.p0} → ${v.p1}</span></span>
    <span style="display: flex; flex-direction: column; align-items: center"><span style="font-size: 11.5px; color: rgba(237,237,235,0.62)">${t("상한")}</span><span style="font-size: 17px; font-weight: 700; font-variant-numeric: tabular-nums">${v.cap}</span></span>
  </div>

  <div style="margin-top: auto; display: flex; gap: 10px"><button type="button" data-act="snooze" aria-label="${t("2분 뒤 다시 알림")}" style="width: 56px; height: 56px; flex: none; box-sizing: border-box; border-radius: 28px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); display: flex; align-items: center; justify-content: center; padding: 0; font-family: inherit"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.5 5v10M12.5 5v10"/></svg></button><a href="#Live" data-act="done" style="flex: 1; height: 56px; box-sizing: border-box; padding: 0 22px 0 6px; border-radius: 28px; background: #D4EE3B; color: #0D0E0F; display: flex; align-items: center; font-size: 16px; font-weight: 700"><span style="width: 44px; height: 44px; flex: none; border-radius: 22px; background: #0D0E0F; display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#D4EE3B" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 10.5l3.5 3.5 7.5-8"/></svg></span><span style="flex: 1; text-align: center; padding: 0 0px 0 0px">${t("완료")}</span></a></div>

</div>
</div>
`,
  actions: {
    done(b, app) {
      const el = b.closest('.screen');
      el.querySelector('[data-b="dial"]').style.transform = 'rotate(180deg)';
      app.vibrate(30);
      if (!app.s.live) { setTimeout(() => app.go('Main', { replace: true }), 600); return; }
      const a = app.dial();
      const L = app.s.live;
      setTimeout(() => { app.toast(t('다이얼 ½바퀴 · 압박 {p} mmHg', { p: L.p[a.side] })); app.go('Live', { replace: true }); }, 650);
    },
    snooze(b, app) { if (app.s.live) app.snooze(120, 'snooze'); app.toast(t('2분 뒤 다시 알려드려요')); app.go('Live', { replace: true }); },
    dismiss(b, app) { if (app.s.live) app.snooze(60, 'dismiss'); app.go('Live', { replace: true }); },
    mute(b, app) {
      app.store.set((s) => { if (s.live) s.live.mute = !s.live.mute; });
      const m = app.s.live && app.s.live.mute;
      b.style.background = m ? 'rgba(240,128,58,0.2)' : '';
      app.toast(t(m ? '진동 끔' : '진동 켬'));
    },
  },
  mount(el, app) {
    since = 0; clearInterval(sinceT); clearInterval(vibT);
    sinceT = setInterval(() => { since++; const e = el.querySelector('[data-b="since"]'); if (e) e.textContent = fmt(since); }, 1000);
    // 대응할 때까지 5초마다 다시 진동
    vibT = setInterval(() => { if (app.s.live && !app.s.live.mute) app.vibrate([200, 80, 200]); }, 5000);
    if (app.s.live && app.s.live.mute) el.querySelector('[data-act="mute"]').style.background = 'rgba(240,128,58,0.2)';
    return () => { clearInterval(sinceT); clearInterval(vibT); };
  },
};
