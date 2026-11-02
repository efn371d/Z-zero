import { t, statusBar, AC, DISPLAY, logoSvg, loopVideo } from '../ui.js';

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
${loopVideo('welcome', 'opacity: 0.55; filter: saturate(0.9)')}
<div aria-hidden="true" style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(13,14,15,0.85) 0%, rgba(13,14,15,0.25) 38%, rgba(13,14,15,0.35) 60%, #0D0E0F 88%)"></div>
${statusBar()}<div style="position: absolute; inset: 0; padding: 58px 20px 34px; display: flex; flex-direction: column; gap: 16px">

  <div style="display: flex; justify-content: flex-end; height: 44px; align-items: center">
    
  </div>

  <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 22px; padding-bottom: 20px">
    <span class="rise" style="filter: drop-shadow(0 0 40px rgba(212,238,59,0.35))">${logoSvg(132)}</span>
    <span class="rise" style="animation-delay: .15s; font-family: ${DISPLAY}; font-weight: 700; font-size: 76px; line-height: 0.8; letter-spacing: 0.08em; margin-right: -0.08em; padding-top: 8px">Z-ZERO</span>
    <span class="rise" style="animation-delay: .3s; font-size: 14px; font-weight: 600; color: rgba(237,237,235,0.72); letter-spacing: -0.01em">${t("쥐 오기 전에, 다이얼이 먼저.")}</span>
  </div>

  <div style="margin-top: auto; display: flex; flex-direction: column; align-items: center; gap: 10px">
    <a href="#Connect" data-act="spin" data-dial aria-label="${t("다이얼을 돌려 시작")}" style="touch-action: none"><span style="position: relative; width: 96px; height: 96px; display: block">
<svg width="96" height="96" viewBox="0 0 96 96" aria-hidden="true" style="position: absolute; inset: 0">${ticks(12)}</svg>
<span data-knob style="position: absolute; left: 14px; top: 14px; width: 68px; height: 68px; border-radius: 50%; background: #D4EE3B; box-shadow: 0 0 40px rgba(212,238,59,0.25); transform: rotate(90deg)">
<span style="position: absolute; left: 50%; top: 7px; width: 3px; height: 14px; margin-left: -1.5px; border-radius: 2px; background: #0D0E0F"></span>
</span>
</span></a>
    <span style="font-size: 13px; font-weight: 700; color: rgba(237,237,235,0.62)">${t("돌리거나 탭해서 시작")}</span>
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
