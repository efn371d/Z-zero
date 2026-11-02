import { t, statusBar, AC } from '../ui.js';

// 착용 체크: 4단계를 순서대로 진행. 마지막 '기준 측정'은 3초 동안 휴식 압박을 재서 기준값으로 저장
// 기준값이 하는 일: 다이얼 안 압력 센서(FMG)는 종아리 근육이 다이얼을 미는 힘을 mmHg로 재요.
// 가만히 서 있을 때 값(기준값)을 0%로 두고, 운동 중 근육이 지쳐 부풀며 압력이 오른 만큼을 '부하 %'로 계산해요.
const STEPS = [
  { title: '착용', sub: '뒤꿈치를 고리에 끼우기', icon: '<path d="M4.5 10.5l3.5 3.5 7.5-8"/>' },
  { title: '다이얼은 바깥쪽', sub: '복숭아뼈 위 한 뼘', icon: '<circle cx="10" cy="10" r="7"/><path d="M10 3v5"/>' },
  { title: '다이얼 영점', sub: '뒤로 돌려 딸깍 2번', icon: '<path d="M15.5 10a5.5 5.5 0 11-1.6-3.9"/><path d="M14.5 2.8v3.6h-3.6"/>' },
  { title: '기준 측정', sub: '3초간 서 있기', icon: '<path d="M11 2.5L4.5 11H10l-1 6.5L15.5 9H10z"/>' },
];
const CTA = ['착용했어요', '위치 확인', '영점 완료', '측정 시작', '측정 중…', '시작하기'];
let step = 0;          // 0~3: 진행 중인 단계, 4: 측정 중, 5: 완료
let measured = null;   // 측정된 휴식 압박
let mLeft = 3, mTimer;

const CHECK = '<path d="M4.5 10.5l3.5 3.5 7.5-8"/>';
function stepRow(st, i, s) {
  const done = step === 5 || i < Math.min(step, 3);
  const active = !done && (i === step || (i === 3 && step === 4));
  const line = i < 3 ? `<span aria-hidden="true" style="position: absolute; left: 21px; top: 48px; bottom: -4px; border-left: 1.5px dashed ${done ? 'rgba(212,238,59,0.4)' : 'rgba(255,255,255,0.18)'}"></span>` : '';
  let badge;
  if (done) badge = `<span style="width: 44px; height: 44px; border-radius: 22px; background: rgba(212,238,59,0.16); display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#D4EE3B" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${CHECK}</svg></span>`;
  else if (active && step === 4) badge = `<span style="width: 44px; height: 44px; border-radius: 22px; background: #D4EE3B; color: #0D0E0F; display: flex; align-items: center; justify-content: center; font-size: 17px; font-weight: 800; font-variant-numeric: tabular-nums" data-b="count">${mLeft}</span>`;
  else if (active) badge = `<span style="width: 44px; height: 44px; border-radius: 22px; background: #D4EE3B; display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#0D0E0F" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${st.icon}</svg></span>`;
  else badge = `<span style="width: 44px; height: 44px; box-sizing: border-box; border-radius: 22px; border: 1px solid rgba(255,255,255,0.14); display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="rgba(237,237,235,0.40)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${st.icon}</svg></span>`;
  const c1 = active ? AC : done ? '#EDEDEB' : 'rgba(237,237,235,0.62)', c2 = active || done ? 'rgba(237,237,235,0.62)' : 'rgba(237,237,235,0.40)';
  return `<li style="position: relative; display: flex; gap: 14px; align-items: center; height: 64px">${line}${badge}<span style="display: flex; flex-direction: column"><span style="font-size: 15px; font-weight: 700; color: ${c1}">${t(st.title)}</span><span style="font-size: 12.5px; color: ${c2}">${t(st.sub)}</span></span></li>`;
}

export default {
  id: 'Fit',
  render: (s) => `
<div class="root">
<div aria-hidden="true" style="position: absolute; left: -120px; top: -160px; width: 520px; height: 420px; border-radius: 50%; background: radial-gradient(closest-side, rgba(212,238,59,0.09), rgba(0,0,0,0))"></div>
${statusBar()}<div style="position: absolute; inset: 0; padding: 58px 20px 34px; display: flex; flex-direction: column; gap: 16px">

  <div style="display: flex; align-items: center; justify-content: space-between"><a href="#Connect" data-act="back" aria-label="${t("뒤로")}" style="width: 44px; height: 44px; flex: none; box-sizing: border-box; border-radius: 22px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.5 4.5L7 10l5.5 5.5"/></svg></a><span style="font-size: 16px; font-weight: 700">${t("착용 체크")}</span><button type="button" data-act="help" aria-label="${t("도움말")}" style="width: 44px; height: 44px; flex: none; box-sizing: border-box; border-radius: 22px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); display: flex; align-items: center; justify-content: center; padding: 0; font-family: inherit"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10" cy="10" r="7.5"/><path d="M8 8a2 2 0 113 1.7c-.7.4-1 .9-1 1.6"/><path d="M10 14.2v.3"/></svg></button></div>
  <div style="display: flex; justify-content: space-between; align-items: center">
    <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.035em; line-height: 1.1">${t("기준 압박")}<br><span style="color: #D4EE3B">${t("맞추기")}</span></h1>
    <img src="assets/img/fit-sleeve.jpg" alt="${t('다이얼이 달린 슬리브')}" style="width: 88px; height: 88px; border-radius: 44px; object-fit: cover; object-position: 50% 50%; border: 3px solid rgba(255,255,255,0.08)">
  </div>

  <ol style="margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 6px">
    ${STEPS.map((st, i) => stepRow(st, i, s)).join('')}
  </ol>

  <div style="border-radius: 24px; background: ${measured ? '#EDEDEB' : 'rgba(255,255,255,0.05)'}; border: 1px solid ${measured ? 'transparent' : 'rgba(255,255,255,0.09)'}; color: ${measured ? '#0D0E0F' : '#EDEDEB'}; padding: 14px 16px; display: flex; gap: 14px; align-items: center; transition: background .4s">
    <span style="display: flex; flex-direction: column; min-width: 92px"><span style="font-size: 30px; font-weight: 700; line-height: 1.1; font-variant-numeric: tabular-nums; letter-spacing: -0.03em; white-space: nowrap" data-b="rest">${step === 4 ? mLeft : measured ? measured : '8–15'}</span><span style="font-size: 12px; font-weight: 500; opacity: 0.62">${t(step === 4 ? "초 남음" : measured ? "기준값 mmHg" : "보통 범위 mmHg")}</span></span>
    <span style="font-size: 12.5px; line-height: 1.45; opacity: 0.72">${t(step === 4 ? "가만히 서 계세요. 움직이면 다시 재야 해요." : measured ? "이 값을 부하 0%로 잡아요. 운동 중 종아리가 지쳐 부풀면 다이얼을 미는 압력이 올라가고, 오른 만큼이 부하 %가 돼요." : "가만히 서 있을 때 종아리가 다이얼을 미는 압력을 재서, 운동 중 부하를 계산하는 기준으로 써요.")}</span>
  </div>

  <div style="margin-top: auto"><a href="#Main" data-act="next" style="opacity: ${step === 4 ? 0.45 : 1}; pointer-events: ${step === 4 ? 'none' : 'auto'}; height: 56px; box-sizing: border-box; padding: 0 6px; border-radius: 28px; background: #D4EE3B; color: #0D0E0F; display: flex; align-items: center; font-size: 16px; font-weight: 700"><span style="flex: 1; text-align: center; padding-left: 44px" data-b="cta">${t(CTA[step])}</span><span style="width: 44px; height: 44px; flex: none; border-radius: 22px; background: #0D0E0F; display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#D4EE3B" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5"/></svg></span></a></div>

</div>
</div>
`,
  help: { title: '착용 체크', body: '슬리브를 신고 다이얼이 다리 바깥쪽, 복숭아뼈 위 한 뼘 높이에 오게 맞춰요. 다이얼을 뒤로 2번 딸깍 돌리면 압박이 0으로 풀려요(영점). 마지막으로 3초간 가만히 서 있으면 휴식 압박을 재서 기준값(부하 0%)으로 써요.' },
  actions: {
    next(b, app) {
      if (step <= 2) { step++; app.vibrate(20); app.refresh(); return; }
      if (step === 3) { // 3초 측정
        step = 4; mLeft = 3; app.refresh();
        clearInterval(mTimer);
        mTimer = setInterval(() => {
          mLeft--;
          document.querySelectorAll('.screen.on [data-b="count"], .screen.on [data-b="rest"]').forEach((c) => (c.textContent = mLeft));
          if (mLeft <= 0) {
            clearInterval(mTimer); step = 5; measured = 11 + Math.round(Math.random() * 3);
            app.store.set((s) => { s.sleeves.zeroed = true; s.sleeves.restMmHg = measured; });
            app.vibrate([40, 60, 40]); app.refresh();
          }
        }, 1000);
        return;
      }
      if (step === 4) return;
      app.store.set((s) => { s.onboarded = true; });
      step = 0; measured = null;
      app.go('Main');
    },
  },
  mount(el, app) { return (refresh) => { if (!refresh && step === 4) { clearInterval(mTimer); step = 3; } }; },
};
