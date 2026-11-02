import { t, statusBar } from '../ui.js';

export default {
  id: 'CamGuide',
  render: (s) => `
<div class="root">
<div aria-hidden="true" style="position: absolute; left: -120px; top: -160px; width: 520px; height: 420px; border-radius: 50%; background: radial-gradient(closest-side, rgba(212,238,59,0.09), rgba(0,0,0,0))"></div>
${statusBar()}<div style="position: absolute; inset: 0; padding: 58px 20px 34px; display: flex; flex-direction: column; gap: 16px">

  <div style="display: flex; align-items: center; justify-content: space-between"><a href="#Setup" data-act="back" aria-label="${t("뒤로")}" style="width: 44px; height: 44px; flex: none; box-sizing: border-box; border-radius: 22px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.5 4.5L7 10l5.5 5.5"/></svg></a><span style="font-size: 16px; font-weight: 700">${t("카메라")}</span><button type="button" data-act="help" aria-label="${t("도움말")}" style="width: 44px; height: 44px; flex: none; box-sizing: border-box; border-radius: 22px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); display: flex; align-items: center; justify-content: center; padding: 0; font-family: inherit"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="10" r="7.5"/><path d="M8 8a2 2 0 113 1.7c-.7.4-1 .9-1 1.6"/><path d="M10 14.2v.3"/></svg></button></div>
  <div style="display: flex; flex-direction: column; gap: 8px">
    <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.035em; line-height: 1.1">${t("렌즈는")}<br><span style="color: #D4EE3B">${t("발 쪽으로")}</span></h1>
  </div>

  <div style="position: relative; height: 236px; border-radius: 28px; overflow: hidden; background: #1A1B1C; flex: none">
<img src="assets/img/cam-lens.jpg" alt="${t('다이얼 렌즈가 발 쪽을 향함')}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 40% 42%">
<span style="position: absolute; left: 12px; bottom: 12px; display: flex; align-items: center; gap: 10px; padding: 6px 16px 6px 6px; border-radius: 28px; background: rgba(13,14,15,0.45); border: 1px solid rgba(255,255,255,0.14); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px)"><span style="width: 44px; height: 44px; flex: none; border-radius: 22px; background: #D4EE3B; display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#0D0E0F" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="5.5" width="15" height="10.5" rx="2.6"/><circle cx="10" cy="10.75" r="2.8"/><path d="M7 5.5l1.2-2h3.6l1.2 2"/></svg></span><span style="display: flex; flex-direction: column"><span style="font-size: 17px; font-weight: 800; font-variant-numeric: tabular-nums">30–45°</span></span></span>
</div>

  <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px">
    <div data-act="preview" data-img="assets/img/cam-standing.jpg" data-cap="정지 상태" style="position: relative; height: 112px; border-radius: 24px; overflow: hidden; background: #1A1B1C; flex: none">
<img src="assets/img/cam-standing.jpg" alt="${t('서 있을 때 카메라 화면')}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 50%">
<span style="position: absolute; left: 8px; bottom: 8px"><span style="height: 30px; padding: 0 12px; box-sizing: border-box; border-radius: 15px; background: rgba(13,14,15,0.45); border: 1px solid rgba(255,255,255,0.14); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); color: #EDEDEB; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; flex: none">${t("정지 상태")}</span></span>
</div>
    <div data-act="preview" data-img="assets/img/cam-dribble.jpg" data-cap="이동 중" style="position: relative; height: 112px; border-radius: 24px; overflow: hidden; background: #1A1B1C; flex: none">
<img src="assets/img/cam-dribble.jpg" alt="${t('드리블할 때 카메라 화면')}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 50% 50%">
<span style="position: absolute; left: 8px; bottom: 8px"><span style="height: 30px; padding: 0 12px; box-sizing: border-box; border-radius: 15px; background: rgba(13,14,15,0.45); border: 1px solid rgba(255,255,255,0.14); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); color: #EDEDEB; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; flex: none">${t("이동 중")}</span></span>
</div>
  </div>
  <div style="display: flex; justify-content: center; gap: 8px"><span style="height: 30px; padding: 0 12px; box-sizing: border-box; border-radius: 15px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); color: #EDEDEB; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; flex: none"><svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="5.5" width="15" height="10.5" rx="2.6"/><circle cx="10" cy="10.75" r="2.8"/><path d="M7 5.5l1.2-2h3.6l1.2 2"/></svg>${t("3초 클립")}</span><span style="height: 30px; padding: 0 12px; box-sizing: border-box; border-radius: 15px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); color: #EDEDEB; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; flex: none"><svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4.5" y="9" width="11" height="8" rx="2"/><path d="M7 9V6.5a3 3 0 016 0V9"/></svg>${t("얼굴 X")}</span><span style="height: 30px; padding: 0 12px; box-sizing: border-box; border-radius: 15px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); color: #EDEDEB; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; flex: none"><svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 10.5l3.5 3.5 7.5-8"/></svg>${t("폰에만 저장")}</span></div>

  <div style="margin-top: auto"><a href="#CamRec" data-act="rec" style="height: 56px; box-sizing: border-box; padding: 0 22px 0 6px; border-radius: 28px; background: #D4EE3B; color: #0D0E0F; display: flex; align-items: center; font-size: 16px; font-weight: 700"><span style="width: 44px; height: 44px; flex: none; border-radius: 22px; background: #0D0E0F; display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#D4EE3B" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="5.5" width="15" height="10.5" rx="2.6"/><circle cx="10" cy="10.75" r="2.8"/><path d="M7 5.5l1.2-2h3.6l1.2 2"/></svg></span><span style="flex: 1; text-align: center; padding: 0 0px 0 0px">${t("촬영 시작")}</span></a></div>

</div>
</div>
`,
  help: { title: '발 카메라', body: '다이얼 아래 카메라가 정강이 바깥쪽에서 발을 비춰요. 렌즈를 발 쪽으로 30–45° 기울여 주세요. 터치·턴·착지 순간만 3초 클립으로 저장하고, 얼굴은 찍히지 않으며, 영상은 폰에만 저장돼요.' },
  actions: {
    preview: (b, app) => app.playClip(b.dataset.img, t(b.dataset.cap)),
    rec: (b, app) => {
      if (!app.s.live) app.startWorkout();
      app.store.set((s) => { s.live.camOn = true; s.live.recPaused = false; });
      app.go('CamRec');
    },
  },
};
