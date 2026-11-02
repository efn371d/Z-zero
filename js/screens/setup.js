import { t, statusBar } from '../ui.js';
import { sportById, MODES } from '../data.js';

// 운동 설정: 경고 기준(30~90, 5단위), 운동 방식, 경고 민감도, 발 카메라
const MODE_ICON = [
  (c) => `<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="${c}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="10" r="7"/><path d="M10 6.5l3 2.2-1.1 3.6H8.1L7 8.7z"/></svg>`,
  (c) => `<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="${c}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 2.5L4.5 11H10l-1 6.5L15.5 9H10z"/></svg>`,
  (c) => `<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="${c}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 15c2-6 6-9 12-10"/><path d="M12 4h4.5v4.5"/></svg>`
];
function modeBtn(k, i, on) {
  const m = MODES[k], c = on ? '#0D0E0F' : '#EDEDEB';
  return on
    ? `<button type="button" data-act="mode" data-m="${k}" aria-pressed="true" style="height: 104px; box-sizing: border-box; border-radius: 24px; background: linear-gradient(160deg, #E2F55E 0%, #C6E02C 55%, #9DB51C 100%); color: #0D0E0F; border: 0; font-family: inherit; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; padding: 12px 14px 14px; text-align: left"><span style="width: 36px; height: 36px; border-radius: 18px; background: rgba(13,14,15,0.12); display: flex; align-items: center; justify-content: center">${MODE_ICON[i](c)}</span><span style="display: flex; flex-direction: column"><span style="font-size: 14.5px; font-weight: 700">${t(m.name)}</span><span style="font-size: 11.5px; font-weight: 500; color: rgba(13,14,15,0.66)">${t(m.sub)}</span></span></button>`
    : `<button type="button" data-act="mode" data-m="${k}" aria-pressed="false" style="height: 104px; box-sizing: border-box; border-radius: 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); color: #EDEDEB; font-family: inherit; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; padding: 12px 14px 14px; text-align: left"><span style="width: 36px; height: 36px; border-radius: 18px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center">${MODE_ICON[i](c)}</span><span style="display: flex; flex-direction: column"><span style="font-size: 14.5px; font-weight: 700">${t(m.name)}</span><span style="font-size: 11.5px; font-weight: 500; color: rgba(237,237,235,0.62)">${t(m.sub)}</span></span></button>`;
}
const SENS = [['low', '낮음'], ['normal', '보통'], ['high', '높음']];
const sensBtn = (k, label, on) => on
  ? `<button type="button" data-act="sens" data-k="${k}" aria-pressed="true" style="height: 36px; padding: 0 16px; flex: none; box-sizing: border-box; border-radius: 18px; background: #D4EE3B; color: #0D0E0F; font-weight: 700; border: 0; font-family: inherit; font-size: 13px; display: flex; align-items: center; gap: 6px">${t(label)}</button>`
  : `<button type="button" data-act="sens" data-k="${k}" aria-pressed="false" style="height: 36px; padding: 0 16px; flex: none; box-sizing: border-box; border-radius: 18px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); color: rgba(237,237,235,0.62); font-weight: 500; font-family: inherit; font-size: 13px; display: flex; align-items: center; gap: 6px">${t(label)}</button>`;
export const switchEl = (on, act) => `<span role="switch" data-act="${act}" aria-checked="${on}" style="width: 48px; height: 28px; flex: none; border-radius: 14px; background: ${on ? '#D4EE3B' : 'rgba(255,255,255,0.12)'}; padding: 3px; box-sizing: border-box; display: flex; justify-content: ${on ? 'flex-end' : 'flex-start'}; transition: background .2s"><span style="width: 22px; height: 22px; border-radius: 11px; background: ${on ? '#0D0E0F' : 'rgba(237,237,235,0.62)'}"></span></span>`;

export default {
  id: 'Setup',
  render: (s) => `
<div class="root">
<div aria-hidden="true" style="position: absolute; left: -120px; top: -160px; width: 520px; height: 420px; border-radius: 50%; background: radial-gradient(closest-side, rgba(212,238,59,0.09), rgba(0,0,0,0))"></div>
${statusBar()}<div style="position: absolute; inset: 0; padding: 58px 20px 34px; display: flex; flex-direction: column; gap: 16px">

  <div style="display: flex; align-items: center; justify-content: space-between"><a href="#Select" data-act="back" aria-label="${t("뒤로")}" style="width: 44px; height: 44px; flex: none; box-sizing: border-box; border-radius: 22px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.5 4.5L7 10l5.5 5.5"/></svg></a><span style="font-size: 16px; font-weight: 700">${t("{sport} 설정", { sport: t(sportById(s.plan.sport).name) })}</span><button type="button" data-act="help" aria-label="${t("도움말")}" style="width: 44px; height: 44px; flex: none; box-sizing: border-box; border-radius: 22px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); display: flex; align-items: center; justify-content: center; padding: 0; font-family: inherit"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="10" r="7.5"/><path d="M8 8a2 2 0 113 1.7c-.7.4-1 .9-1 1.6"/><path d="M10 14.2v.3"/></svg></button></div>
  <div style="display: flex; gap: 6px"><span style="flex: 1; height: 4px; border-radius: 2px; background: #EDEDEB"></span><span style="flex: 1; height: 4px; border-radius: 2px; background: #D4EE3B"></span></div>

  <section style="border-radius: 28px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); padding: 16px; display: flex; align-items: center; gap: 18px">
    <span style="position: relative; width: 128px; height: 128px; flex: none"><svg width="128" height="128" viewBox="0 0 128 128" aria-hidden="true" style="position: absolute; inset: 0; transform: rotate(-90deg)"><circle cx="64.0" cy="64.0" r="60.0" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="8"></circle><circle cx="64.0" cy="64.0" r="60.0" fill="none" stroke="#D4EE3B" stroke-width="8" stroke-linecap="round" stroke-dasharray="${(377 * s.settings.threshold / 100).toFixed(1)} 377.0" style="transition: stroke-dasharray .3s"></circle></svg><img src="assets/img/dial.jpg" alt="${t("다이얼")}" style="position: absolute; left: 16px; top: 16px; width: 96px; height: 96px; border-radius: 48px; object-fit: cover"></span>
    <span style="flex: 1; display: flex; flex-direction: column; gap: 10px">
      <span style="display: flex; flex-direction: column"><span style="font-size: 12px; font-weight: 500; color: rgba(237,237,235,0.62)">${t("경고 기준@Setup")}</span><span style="font-size: 40px; font-weight: 700; line-height: 1.05; font-variant-numeric: tabular-nums; letter-spacing: -0.03em">${s.settings.threshold}<span style="font-size: 20px; color: rgba(237,237,235,0.62); margin-left: 2px">%</span></span><span style="font-size: 11.5px; color: rgba(237,237,235,0.62); line-height: 1.35">${t("종아리 부하가 이만큼 차면 알려줘요")}${s.settings.sensitivity !== 'normal' ? `<br><b style="color: #D4EE3B">${t('민감도 반영 → 실제 {n}%', { n: s.settings.threshold + (s.settings.sensitivity === 'high' ? -5 : 5) })}</b>` : ''}</span></span>
      <span style="display: flex; gap: 8px"><button type="button" data-act="thr" data-d="-5" aria-label="${t("기준 낮추기")}" style="width: 44px; height: 44px; flex: none; box-sizing: border-box; border-radius: 22px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); display: flex; align-items: center; justify-content: center; padding: 0; font-family: inherit"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10h12"/></svg></button><button type="button" data-act="thr" data-d="5" aria-label="${t("기준 높이기")}" style="width: 44px; height: 44px; flex: none; box-sizing: border-box; border-radius: 22px; background: #EDEDEB; display: flex; align-items: center; justify-content: center; padding: 0; font-family: inherit"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#0D0E0F" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 4v12M4 10h12"/></svg></button></span>
    </span>
  </section>

  <div style="display: flex; flex-direction: column; gap: 8px">
    <span style="font-size: 12px; font-weight: 500; color: rgba(237,237,235,0.62)">${t("운동 방식")}</span>
    <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">${['match', 'interval', 'drills'].map((k, i) => modeBtn(k, i, s.plan.mode === k)).join('')}</div>
  </div>

  <div style="display: flex; flex-direction: column; gap: 8px">
    <span style="font-size: 12px; font-weight: 500; color: rgba(237,237,235,0.62)">${t("경고 민감도")}</span>
    <div style="display: flex; gap: 8px">${SENS.map(([k, l]) => sensBtn(k, l, s.settings.sensitivity === k)).join('')}</div>
  </div>

  <ul style="margin: 0; padding: 0 16px 0 12px; list-style: none; border-radius: 28px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px)"><li style="display: flex; justify-content: space-between; align-items: center; gap: 12px; min-height: 56px"><span style="display: flex; gap: 12px; align-items: center"><span style="width: 36px; height: 36px; flex: none; border-radius: 18px; background: rgba(255,255,255,0.07); display: flex; align-items: center; justify-content: center"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="5.5" width="15" height="10.5" rx="2.6"/><circle cx="10" cy="10.75" r="2.8"/><path d="M7 5.5l1.2-2h3.6l1.2 2"/></svg></span><span style="display: flex; flex-direction: column"><span style="font-size: 14.5px; font-weight: 600">${t("발 카메라")}</span><span style="font-size: 12px; color: rgba(237,237,235,0.62)">${t(s.settings.camera ? "킥·드리블 자세 분석" : "끄면 종아리 부하만 기록")}</span></span></span>${switchEl(s.settings.camera, 'cam')}</li></ul>

  <div style="margin-top: auto"><a href="#CamGuide" data-act="go" style="height: 56px; box-sizing: border-box; padding: 0 6px; border-radius: 28px; background: #D4EE3B; color: #0D0E0F; display: flex; align-items: center; font-size: 16px; font-weight: 700"><span style="flex: 1; text-align: center; padding-left: 44px">${t("준비 완료")}</span><span style="width: 44px; height: 44px; flex: none; border-radius: 22px; background: #0D0E0F; display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#D4EE3B" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5"/></svg></span></a></div>

</div>
</div>
`,
  help: { title: '경고 기준', body: '종아리 부하가 이 값(%)을 넘으면 다이얼이 진동하고 휴대폰에 경고가 떠요. 낮출수록 일찍 알려줘요. 민감도: 낮음 +5, 보통 0, 높음 −5만큼 기준이 바뀌어요.' },
  actions: {
    thr: (b, app) => { app.store.set((s) => { s.settings.threshold = Math.max(30, Math.min(90, s.settings.threshold + +b.dataset.d)); }); app.vibrate(10); app.refresh(); },
    mode: (b, app) => { app.store.set((s) => { s.plan.mode = b.dataset.m; }); app.refresh(); },
    sens: (b, app) => { app.store.set((s) => { s.settings.sensitivity = b.dataset.k; }); app.refresh(); },
    cam: (b, app) => { app.store.set((s) => { s.settings.camera = !s.settings.camera; }); app.refresh(); },
    go: (b, app) => {
      const s = app.s;
      if (!(s.sleeves.L.paired && s.sleeves.R.paired)) {
        app.sheet({ title: t('슬리브가 연결되지 않았어요'), body: `<p>${t('데모에서는 연결 없이도 시작할 수 있어요.')}</p>`, actions: [
          { label: t('연결하기'), primary: true, onClick: () => app.go('Connect') },
          { label: t('그냥 시작'), onClick: () => start(app) },
        ] });
        return;
      }
      start(app);
    },
  },
};

function start(app) {
  if (app.s.settings.camera) { app.go('CamGuide', { params: { camTest: false } }); return; }
  app.startWorkout(); app.go('Live');
}
