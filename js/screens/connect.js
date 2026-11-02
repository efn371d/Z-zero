import { sleeveSvg, legIcon, t, statusBar, AC } from '../ui.js';

// 연결 화면: 왼쪽 → 오른쪽 순서로 블루투스 연결 (데모: 각 3초)
const PAIR_SEC = 3;
const ready = (s) => s.sleeves.L.paired && s.sleeves.R.paired;
let pairing = null;   // 연결 중인 쪽 'L' | 'R'
let left = PAIR_SEC;  // 남은 초

function battery(pct) {
  return `<svg width="22" height="12" viewBox="0 0 22 12" aria-hidden="true"><rect x="0.75" y="0.75" width="18" height="10.5" rx="3" fill="none" stroke="rgba(237,237,235,0.62)" stroke-width="1.3"></rect><rect x="2.5" y="2.5" width="${(14.5 * pct / 100).toFixed(1)}" height="7" rx="1.6" fill="${pct < 20 ? '#F0803A' : AC}"></rect><rect x="20" y="4" width="1.6" height="4" rx="0.8" fill="rgba(237,237,235,0.62)"></rect></svg>`;
}

function side(sd, s) {
  const sl = s.sleeves[sd], on = sl.paired, busy = pairing === sd;
  const C = 128.8, prog = busy ? C * (1 - left / PAIR_SEC) : 0;
  // 다이얼 위치: 왼쪽 슬리브는 x≈61, 오른쪽은 x≈89 → 빛·전파 그림 위치를 맞춤
  const shift = (html, dx) => html.replace(/left: (-?\d+)px/g, (m, v) => `left: ${+v + dx}px`);
  let status = on
    ? `<span aria-hidden="true" style="position: absolute; left: 1px; top: -13px; width: 120px; height: 120px; border-radius: 60px; background: radial-gradient(closest-side, rgba(212,238,59,0.22), rgba(212,238,59,0))"></span>`
    : busy ? `<span class="blink" style="position:absolute;inset:0;pointer-events:none"><span aria-hidden="true" style="position: absolute; left: 59px; top: 17px; width: 60px; height: 60px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.3)"></span><span aria-hidden="true" style="position: absolute; left: 41px; top: -1px; width: 96px; height: 96px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.16)"></span><span aria-hidden="true" style="position: absolute; left: 23px; top: -19px; width: 132px; height: 132px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.08)"></span></span>` : '';
  if (on && sd === 'R') status = shift(status, 28);
  if (busy && sd === 'L') status = shift(status, -28);
  const badge = on
    ? `<span style="width: 44px; height: 44px; border-radius: 22px; background: #D4EE3B; display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#0D0E0F" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 10.5l3.5 3.5 7.5-8"/></svg></span>`
    : `<button type="button" data-act="pair" data-side="${sd}" aria-label="${t('연결')}" style="position: relative; width: 44px; height: 44px; border-radius: 22px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); box-sizing: border-box; padding: 0"><svg width="44" height="44" viewBox="0 0 44 44" aria-hidden="true" style="position: absolute; inset: -1px; transform: rotate(-90deg)"><circle cx="22.0" cy="22.0" r="20.5" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="3"></circle><circle data-ring cx="22.0" cy="22.0" r="20.5" fill="none" stroke="#D4EE3B" stroke-width="3" stroke-linecap="round" stroke-dasharray="${prog.toFixed(1)} ${C}" style="transition: stroke-dasharray .25s linear"></circle></svg><span style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6.5l8 7-4 3.5V3l4 3.5-8 7"/></svg></span></button>`;
  const meta = on
    ? `<span style="display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 700; font-variant-numeric: tabular-nums">${battery(sl.battery)}${sl.battery}</span>`
    : `<span style="display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 700; color: rgba(237,237,235,0.62)"><svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="rgba(237,237,235,0.62)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="M10 3v5"/></svg><span data-left>${busy ? t('{n}초', { n: Math.ceil(left) }) : t('대기')}</span></span>`;
  return `<div style="position: relative; width: 150px; display: flex; flex-direction: column; align-items: center; gap: 14px">
  ${status}
  <span style="position: relative">${sleeveSvg(sd, { w: 125, h: 250, id: 'c' + sd, label: t(sd === 'L' ? '왼쪽 슬리브' : '오른쪽 슬리브'), opacity: on ? 1 : 0.45, on })}</span>
  ${badge}
  <span style="display: flex; align-items: center; gap: 8px">${legIcon(sd, on ? AC : 'rgba(237,237,235,0.40)')}${meta}</span>
</div>`;
}

function nextToPair(s) { return !s.sleeves.L.paired ? 'L' : !s.sleeves.R.paired ? 'R' : null; }

export default {
  id: 'Connect',
  help: { title: '슬리브 연결', body: '다이얼을 3초 길게 누르면 다이얼 불빛이 깜빡이며 연결 모드가 돼요. 왼쪽부터 차례로 연결돼요. (데모에서는 자동으로 연결돼요)' },
  render: (s) => `
<div class="root">
<div aria-hidden="true" style="position: absolute; left: -120px; top: -160px; width: 520px; height: 420px; border-radius: 50%; background: radial-gradient(closest-side, rgba(212,238,59,0.09), rgba(0,0,0,0))"></div>
${statusBar()}<div style="position: absolute; inset: 0; padding: 58px 20px 34px; display: flex; flex-direction: column; gap: 16px">

  <div style="display: flex; align-items: center; justify-content: space-between"><a href="#Welcome" data-act="back" aria-label="${t("뒤로")}" style="width: 44px; height: 44px; flex: none; box-sizing: border-box; border-radius: 22px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.5 4.5L7 10l5.5 5.5"/></svg></a><span style="font-size: 16px; font-weight: 700">${t("연결")}</span><button type="button" data-act="help" aria-label="${t("도움말")}" style="width: 44px; height: 44px; flex: none; box-sizing: border-box; border-radius: 22px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); display: flex; align-items: center; justify-content: center; padding: 0; font-family: inherit"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="10" r="7.5"/><path d="M8 8a2 2 0 113 1.7c-.7.4-1 .9-1 1.6"/><path d="M10 14.2v.3"/></svg></button></div>
  <div style="display: flex; justify-content: center; gap: 10px; margin-top: 6px"><span style="height: 30px; padding: 0 12px; box-sizing: border-box; border-radius: 15px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); color: #EDEDEB; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; flex: none"><svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="M10 3v5"/></svg>${t("다이얼 길게 누르기")}</span><span style="height: 30px; padding: 0 12px; box-sizing: border-box; border-radius: 15px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); color: #EDEDEB; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; flex: none"><svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6.5l8 7-4 3.5V3l4 3.5-8 7"/></svg>${t("3초@Connect")}</span></div>


  <div style="display: flex; justify-content: center; gap: 24px; margin-top: 24px">
    ${side('L', s)}
    ${side('R', s)}
  </div>


  <div style="margin-top: auto"><a href="#Fit" data-act="next" style="height: 56px; box-sizing: border-box; padding: 0 6px; border-radius: 28px; background: #D4EE3B; transition: opacity .3s; opacity: ${ready(s) ? 1 : 0.35}; color: #0D0E0F; display: flex; align-items: center; font-size: 16px; font-weight: 700"><span style="flex: 1; text-align: center; padding-left: 44px">${t("계속")}</span><span style="width: 44px; height: 44px; flex: none; border-radius: 22px; background: #0D0E0F; display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#D4EE3B" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5"/></svg></span></a></div>

</div>
</div>
</div>
`,
  actions: {
    pair: (b, app) => { if (!pairing) start(app, b.dataset.side); },
    next: (b, app) => {
      const s = app.s;
      if (!ready(s)) { app.toast(t('양쪽 슬리브를 먼저 연결해 주세요')); return; }
      app.go(s.onboarded && s.sleeves.zeroed ? 'Main' : 'Fit');
    },
  },
  mount(el, app) {
    const sd = nextToPair(app.s);
    if (sd && !pairing) setTimeout(() => start(app, sd), 500);
    return (refresh) => { if (!refresh) { clearInterval(timer); pairing = null; } };
  },
};

let timer;
function start(app, sd) {
  pairing = sd; left = PAIR_SEC; app.refresh();
  clearInterval(timer);
  timer = setInterval(() => {
    left -= 0.25;
    const ring = document.querySelector('.screen.on [data-act="pair"][data-side="' + sd + '"] [data-ring]');
    const lab = document.querySelector('.screen.on [data-act="pair"][data-side="' + sd + '"]')?.parentElement.querySelector('[data-left]');
    if (ring) ring.setAttribute('stroke-dasharray', (128.8 * (1 - left / PAIR_SEC)).toFixed(1) + ' 128.8');
    if (lab) lab.textContent = t('{n}초', { n: Math.max(1, Math.ceil(left)) });
    if (left <= 0) {
      clearInterval(timer); pairing = null;
      app.store.set((s) => { s.sleeves[sd].paired = true; });
      app.vibrate(40);
      app.toast(t(sd === 'L' ? '왼쪽 연결됨' : '오른쪽 연결됨'));
      app.refresh();
      const nx = nextToPair(app.s);
      if (nx) setTimeout(() => start(app, nx), 600);
    }
  }, 250);
}
