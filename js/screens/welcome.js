import { sleeveSvg, t, statusBar, AC } from '../ui.js';

/** 다이얼 눈금 48개. on개까지 라임색 */
const ticks = (on) => Array.from({ length: 48 }, (_, i) =>
  `<line x1="48.0" y1="3" x2="48.0" y2="${i % 4 ? 8 : 11}" stroke="${i < on ? AC : 'rgba(255,255,255,0.22)'}" stroke-width="1.8" stroke-linecap="round" transform="rotate(${i * 7.5} 48.0 48.0)"></line>`).join('');

// 다이얼을 돌리면(드래그 160° 이상) 또는 탭하면 → 한 바퀴 돌고 다음 화면
function spinGo(el, app) {
  if (el._spinning) return; el._spinning = true;
  const knob = el.querySelector('[data-knob]'), lines = [...el.querySelectorAll('[data-dial] line')];
  knob.style.transition = 'transform .9s cubic-bezier(.3,.7,.2,1)'; knob.style.transform = 'rotate(450deg)';
  lines.forEach((l, i) => setTimeout(() => l.setAttribute('stroke', AC), i * 18));
  app.vibrate(30);
  const s = app.s;
  const next = s.sleeves.L.paired && s.sleeves.R.paired ? (s.onboarded ? 'Main' : 'Fit') : 'Connect';
  setTimeout(() => app.go(next), 1000);
}

export default {
  id: 'Welcome',
  render: (s) => `
<div class="root">
<div aria-hidden="true" style="position: absolute; left: -120px; top: -160px; width: 520px; height: 420px; border-radius: 50%; background: radial-gradient(closest-side, rgba(212,238,59,0.09), rgba(0,0,0,0))"></div>
${statusBar()}<div style="position: absolute; inset: 0; padding: 58px 20px 34px; display: flex; flex-direction: column; gap: 16px">

  <div style="display: flex; justify-content: flex-end; height: 44px; align-items: center">
    <span aria-label="${t("1 / 3 단계")}" style="display: flex; gap: 5px"><span style="width: 22px; height: 5px; border-radius: 3px; background: #D4EE3B"></span><span style="width: 8px; height: 5px; border-radius: 3px; background: rgba(255,255,255,0.25)"></span><span style="width: 8px; height: 5px; border-radius: 3px; background: rgba(255,255,255,0.25)"></span></span>
  </div>

  <div style="position: relative; height: 380px; display: flex; align-items: center; justify-content: center; margin-top: 10px">
    <span aria-hidden="true" style="position: absolute; width: 340px; height: 340px; border-radius: 170px; border: 1px solid rgba(255,255,255,0.05)"></span>
    <span aria-hidden="true" style="position: absolute; width: 260px; height: 260px; border-radius: 130px; border: 1px solid rgba(255,255,255,0.07)"></span>
    <span aria-hidden="true" style="position: absolute; width: 180px; height: 180px; border-radius: 90px; background: radial-gradient(closest-side, rgba(212,238,59,0.16), rgba(212,238,59,0))"></span>
    <span style="position: relative; display: flex; gap: 22px; align-items: flex-end">${sleeveSvg('L', { w: 115, h: 230, id: 'wL', label: t("왼쪽 슬리브") })}${sleeveSvg('R', { w: 115, h: 230, id: 'wR', label: t("오른쪽 슬리브") })}</span>
  </div>

  <div style="display: flex; flex-direction: column; align-items: center; gap: 8px">
    <span style="font-size: 30px; font-weight: 800; letter-spacing: 0.32em; margin-right: -0.32em">Z-ZERO</span>
    <span style="display: flex; gap: 14px; color: rgba(237,237,235,0.62)"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="rgba(237,237,235,0.62)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 2.5L4.5 11H10l-1 6.5L15.5 9H10z"/></svg><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="rgba(237,237,235,0.62)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15.5 10a5.5 5.5 0 11-1.6-3.9"/><path d="M14.5 2.8v3.6h-3.6"/></svg><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="rgba(237,237,235,0.62)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="5.5" width="15" height="10.5" rx="2.6"/><circle cx="10" cy="10.75" r="2.8"/><path d="M7 5.5l1.2-2h3.6l1.2 2"/></svg></span>
  </div>

  <div style="margin-top: auto; display: flex; flex-direction: column; align-items: center; gap: 10px">
    <a href="#Connect" data-act="spin" data-dial aria-label="${t("다이얼을 돌려 시작")}" style="touch-action: none"><span style="position: relative; width: 96px; height: 96px; display: block">
<svg width="96" height="96" viewBox="0 0 96 96" aria-hidden="true" style="position: absolute; inset: 0">${ticks(12)}</svg>
<span data-knob style="position: absolute; left: 14px; top: 14px; width: 68px; height: 68px; border-radius: 50%; background: #D4EE3B; box-shadow: 0 0 40px rgba(212,238,59,0.25); transform: rotate(90deg)">
<span style="position: absolute; left: 50%; top: 7px; width: 3px; height: 14px; margin-left: -1.5px; border-radius: 2px; background: #0D0E0F"></span>
</span>
</span></a>
    <span style="font-size: 13px; font-weight: 700; color: rgba(237,237,235,0.62)">${t("돌려서 시작")}</span>
  </div>

</div>
</div>
`,
  actions: {
    spin: (b, app) => spinGo(b.closest('.screen'), app),
  },
  mount(el, app) {
    const a = el.querySelector('[data-dial]'), knob = el.querySelector('[data-knob]');
    let drag = false, last = 0, total = 0, moved = false;
    const ang = (e) => { const r = a.getBoundingClientRect(); return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI; };
    a.addEventListener('pointerdown', (e) => { drag = true; moved = false; total = 0; last = ang(e); a.setPointerCapture(e.pointerId); });
    a.addEventListener('pointermove', (e) => {
      if (!drag) return;
      let d = ang(e) - last; if (d > 180) d -= 360; if (d < -180) d += 360;
      last += d; total += d; if (Math.abs(total) > 6) moved = true;
      knob.style.transition = 'none'; knob.style.transform = `rotate(${90 + total}deg)`;
      if (Math.abs(total) > 160) { drag = false; spinGo(el, app); }
    });
    a.addEventListener('pointerup', () => { drag = false; if (moved && !el._spinning) { knob.style.transition = 'transform .4s'; knob.style.transform = 'rotate(90deg)'; } });
    // 드래그한 경우 클릭(탭) 처리는 건너뜀
    a.addEventListener('click', (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
  },
};
