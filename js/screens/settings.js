import { t, statusBar, tabBar, esc, legIcon, choiceList, AC, WARN } from '../ui.js';
import { switchEl } from './setup.js';

// 설정: 슬리브 상태, 경고 기준, 진동, 압박 상한, 알림, 언어, 데모 배속, 초기화
const ROW_IC = {
  bolt: '<path d="M11 2.5L4.5 11H10l-1 6.5L15.5 9H10z"/>',
  vib: '<circle cx="10" cy="10" r="7"/><path d="M10 3v5"/>',
  lock: '<rect x="4.5" y="9" width="11" height="8" rx="2"/><path d="M7 9V6.5a3 3 0 016 0V9"/>',
  bell: '<path d="M5 14V9a5 5 0 0110 0v5l1.5 1.5h-13z"/><path d="M8.3 17.5a2 2 0 003.4 0"/>',
  globe: '<circle cx="10" cy="10" r="7.5"/><path d="M2.5 10h15M10 2.5c2.2 2.4 2.2 12.6 0 15M10 2.5c-2.2 2.4-2.2 12.6 0 15"/>',
  speed: '<path d="M3.5 13a6.5 6.5 0 1113 0"/><path d="M10 13l3.2-4"/>',
  target: '<circle cx="10" cy="10" r="7"/><circle cx="10" cy="10" r="3.5"/>',
  user: '<circle cx="10" cy="7" r="3.2"/><path d="M4 17c.8-3.2 3.2-5 6-5s5.2 1.8 6 5"/>',
  reset: '<path d="M4.5 10a5.5 5.5 0 101.6-3.9"/><path d="M5.5 2.8v3.6h3.6"/>',
  info: '<circle cx="10" cy="10" r="7.5"/><path d="M10 9v5M10 6.2v.3"/>',
};
const CHEV = '<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="rgba(237,237,235,0.40)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.5 5l5 5-5 5"/></svg>';
const VIB = { off: '끔', low: '약하게', normal: '보통', high: '세게' };
function row(act, icon, label, value, last, right) {
  return `<li data-act="${act}" style="${last ? '' : 'border-bottom: 1px solid rgba(255,255,255,0.08); '}display: flex; justify-content: space-between; align-items: center; gap: 12px; min-height: 56px; cursor: pointer"><span style="display: flex; gap: 12px; align-items: center"><span style="width: 36px; height: 36px; flex: none; border-radius: 18px; background: rgba(255,255,255,0.07); display: flex; align-items: center; justify-content: center"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ROW_IC[icon]}</svg></span><span style="display: flex; flex-direction: column"><span style="font-size: 14.5px; font-weight: 600">${label}</span></span></span>${right || `<span style="display: flex; gap: 6px; align-items: center; color: rgba(237,237,235,0.62); font-size: 13.5px; font-weight: 500; font-variant-numeric: tabular-nums">${value}${CHEV}</span>`}</li>`;
}
const UL = 'margin: 0; padding: 0 16px 0 12px; list-style: none; border-radius: 28px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); flex: none';

export default {
  id: 'Settings',
  render: (s, _app, paired = s.sleeves.L.paired && s.sleeves.R.paired) => `
<div class="root">
<div aria-hidden="true" style="position: absolute; left: -120px; top: -160px; width: 520px; height: 420px; border-radius: 50%; background: radial-gradient(closest-side, rgba(212,238,59,0.09), rgba(0,0,0,0))"></div>
${statusBar()}<div style="position: absolute; inset: 0; padding: 58px 20px 34px; display: flex; flex-direction: column; gap: 16px">

  <div style="display: flex; justify-content: space-between; align-items: flex-end"><div style="display: flex; flex-direction: column; gap: 2px"><span data-act="name" style="font-size: 12px; font-weight: 500; color: rgba(237,237,235,0.62); cursor: pointer">${esc(s.profile.name)}</span><h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.035em; line-height: 1.1">${t("설정")}</h1></div><button type="button" data-act="notif" aria-label="${t("알림")}" style="width: 44px; height: 44px; flex: none; box-sizing: border-box; border-radius: 22px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); display: flex; align-items: center; justify-content: center; padding: 0; font-family: inherit"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 14V9a5 5 0 0110 0v5l1.5 1.5h-13z"/><path d="M8.3 17.5a2 2 0 003.4 0"/></svg></button></div>

  <div style="flex: 1; min-height: 0; overflow-y: auto; margin: 0 -20px; padding: 0 20px 110px; display: flex; flex-direction: column; gap: 16px; scrollbar-width: none">
  <section style="border-radius: 28px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); padding: 12px; display: flex; flex-direction: column; gap: 12px; flex: none">
    <div style="display: flex; gap: 14px; align-items: stretch">
      <img src="assets/img/settings-sleeve.jpg" alt="Z-zero 카프 슬리브" style="width: 100px; height: 132px; border-radius: 20px; object-fit: cover; object-position: 50% 35%">
      <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between; padding: 2px 0">
        <span style="display: flex; flex-direction: column; gap: 4px"><span style="font-size: 16px; font-weight: 700; white-space: nowrap">${t("Z-zero 슬리브")}</span>${paired ? `<span style="height: 30px; padding: 0 12px; box-sizing: border-box; border-radius: 15px; background: rgba(212,238,59,0.14); color: #D4EE3B; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; flex: none; align-self: flex-start"><span style="width: 6px; height: 6px; border-radius: 3px; background: #D4EE3B"></span>${t("연결됨")}</span>` : `<span data-act="repair" style="height: 30px; padding: 0 12px; box-sizing: border-box; border-radius: 15px; background: rgba(240,128,58,0.16); color: ${WARN}; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; flex: none; align-self: flex-start; cursor: pointer"><span style="width: 6px; height: 6px; border-radius: 3px; background: ${WARN}"></span>${t("연결 안 됨")}</span>`}</span>
        <span style="font-size: 12px; color: rgba(237,237,235,0.62)">${s.sleeves.firmware} · ${t('사이즈')} ${s.sleeves.size}</span>
      </div>
      <div style="display: flex; gap: 8px; align-items: flex-end">${['L', 'R'].map((sd) => { const b = s.sleeves[sd].battery, on = s.sleeves[sd].paired; return `<span style="display: flex; flex-direction: column; align-items: center; gap: 6px; opacity: ${on ? 1 : 0.4}"><span style="position: relative; width: 32px; height: 96px; border-radius: 16px; background: rgba(255,255,255,0.10); overflow: hidden"><span style="position: absolute; left: 0; right: 0; bottom: 0; height: ${b}%; border-radius: 16px; background: ${b < 20 ? WARN : 'linear-gradient(160deg, #E2F55E 0%, #C6E02C 55%, #9DB51C 100%)'}"></span><span style="position: absolute; left: 0; right: 0; bottom: 8px; display: flex; justify-content: center">${legIcon(sd, '#0D0E0F')}</span></span><span style="font-size: 11.5px; font-weight: 700; color: #EDEDEB; font-variant-numeric: tabular-nums">${b}%</span></span>`; }).join('')}</div>
    </div>
    <div style="display: flex; padding: 12px 0 4px; border-top: 1px solid rgba(255,255,255,0.08)"><button type="button" data-act="zero" style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; border: 0; background: transparent; padding: 0; font-family: inherit"><span style="width: 44px; height: 44px; flex: none; border-radius: 22px; background: #EDEDEB; display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#0D0E0F" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15.5 10a5.5 5.5 0 11-1.6-3.9"/><path d="M14.5 2.8v3.6h-3.6"/></svg></span><span style="font-size: 12px; font-weight: 600; color: #EDEDEB">${t("영점")}</span></button><a href="#CamGuide" data-act="camtest" style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px"><span style="width: 44px; height: 44px; flex: none; border-radius: 22px; background: #EDEDEB; display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#0D0E0F" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="5.5" width="15" height="10.5" rx="2.6"/><circle cx="10" cy="10.75" r="2.8"/><path d="M7 5.5l1.2-2h3.6l1.2 2"/></svg></span><span style="font-size: 12px; font-weight: 600; color: #EDEDEB">${t("카메라")}</span></a><button type="button" data-act="find" style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; border: 0; background: transparent; padding: 0; font-family: inherit"><span style="width: 44px; height: 44px; flex: none; border-radius: 22px; background: #EDEDEB; display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#0D0E0F" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="9" r="5.5"/><path d="M13 13l4 4"/></svg></span><span style="font-size: 12px; font-weight: 600; color: #EDEDEB">${t("슬리브 찾기")}</span></button><a href="#Connect" data-act="repair" style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px"><span style="width: 44px; height: 44px; flex: none; border-radius: 22px; background: #EDEDEB; display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#0D0E0F" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 6.5l8 7-4 3.5V3l4 3.5-8 7"/></svg></span><span style="font-size: 12px; font-weight: 600; color: #EDEDEB">${t("다시 연결")}</span></a></div>
  </section>

  <ul style="${UL}">${row('thr', 'bolt', t("경고 기준@Settings"), s.settings.threshold + '%')}${row('vib', 'vib', t("다이얼 진동"), t(VIB[s.settings.vibration]))}${row('cap', 'lock', t("압박 상한"), s.settings.pressureCap + ' mmHg')}${row('rem', 'bell', t("운동 알림"), '', true, switchEl(s.settings.reminders, 'rem'))}</ul>
  <ul style="${UL}">${row('lang', 'globe', t("언어"), s.settings.lang === 'en' ? 'English' : '한국어')}${row('goal', 'target', t("주간 목표"), t('{n}회', { n: s.settings.weeklyGoal }))}${row('speed', 'speed', t("데모 시간 배속"), s.settings.demoSpeed + '×')}${row('name', 'user', t("이름"), esc(s.profile.name), true)}</ul>
  <ul style="${UL}">${row('about', 'info', t("앱 정보"), 'v1.0.0')}${row('reset', 'reset', `<span style="color: ${WARN}">${t("데모 데이터 초기화")}</span>`, '', true)}</ul>
  </div>

</div>${tabBar('Settings')}
</div>
`,
  actions: {
    name(b, app) {
      const el = app.sheet({ title: t('이름'), body: `<input type="text" maxlength="12" value="${esc(app.s.profile.name)}">`, actions: [{ label: t('저장'), primary: true, onClick: () => { const v = el.querySelector('input').value.trim(); if (v) { app.store.set((s) => { s.profile.name = v; }); app.refresh(); } } }, { label: t('취소') }] });
      setTimeout(() => el.querySelector('input').focus(), 320);
    },
    async notif(b, app) {
      const perm = 'Notification' in window ? Notification.permission : 'unsupported';
      app.sheet({ title: t('알림'), body: `<p>${t('새 알림이 없어요.')}</p><p>${t(perm === 'granted' ? '폰 알림이 켜져 있어요.' : '경고를 폰 알림으로도 받으려면 알림을 허용해 주세요.')}</p>`,
        actions: perm === 'granted' || perm === 'unsupported' ? [{ label: t('확인'), primary: true }] : [{ label: t('폰 알림 허용'), primary: true, onClick: () => { Notification.requestPermission().then((r) => app.toast(t(r === 'granted' ? '알림이 켜졌어요' : '알림이 꺼져 있어요'))); } }, { label: t('닫기') }] });
    },
    zero(b, app) {
      app.sheet({ title: t('다이얼 영점'), body: `<p>${t('양쪽 다이얼을 뒤로 2번 딸깍 돌려 압박을 0으로 풀어 주세요. 다 돌렸으면 아래 버튼을 눌러요.')}</p>`,
        actions: [{ label: t('2번 돌렸어요'), primary: true, onClick: () => { app.store.set((s) => { s.sleeves.zeroed = true; }); app.vibrate([30, 60, 30]); app.toast(t('양쪽 다이얼 영점 완료')); } }, { label: t('취소') }] });
    },
    find(b, app) {
      app.vibrate([300, 150, 300, 150, 300]);
      app.sheet({ title: t('슬리브 찾는 중'), body: `<div style="display:flex;justify-content:center;padding:20px 0"><span class="blink" style="width:96px;height:96px;border-radius:48px;background:rgba(212,238,59,0.16);display:flex;align-items:center;justify-content:center"><svg width="40" height="40" viewBox="0 0 20 20" fill="none" stroke="${AC}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 14V9a5 5 0 0110 0v5l1.5 1.5h-13z"/><path d="M8.3 17.5a2 2 0 003.4 0"/></svg></span></div><p style="text-align:center">${t('양쪽 다이얼에서 소리와 불빛이 나고 있어요.')}</p>`, actions: [{ label: t('찾았어요'), primary: true }] });
    },
    repair(b, app) { app.store.set((s) => { s.sleeves.L.paired = false; s.sleeves.R.paired = false; }); app.go('Connect'); },
    thr(b, app) {
      app.sheet({ title: t('경고 기준'), body: `<p>${t('종아리 부하(%)가 이 값을 넘으면 알려줘요.')}</p>` + choiceList('pick', [40, 45, 50, 55, 60, 65, 70, 75, 80].map((v) => ({ value: v, label: v + (v === 60 ? ' · ' + t('기본') : '') })), app.s.settings.threshold),
        on: { pick: (x) => { app.store.set((s) => { s.settings.threshold = +x.dataset.v; }); app.closeSheet(); app.refresh(); } } });
    },
    vib(b, app) {
      app.sheet({ title: t('다이얼 진동'), body: choiceList('pick', Object.entries(VIB).map(([k, v]) => ({ value: k, label: t(v) })), app.s.settings.vibration),
        on: { pick: (x) => { app.store.set((s) => { s.settings.vibration = x.dataset.v; }); app.vibrate(200); app.closeSheet(); app.refresh(); } } });
    },
    cap(b, app) {
      app.sheet({ title: t('압박 상한'), body: `<p>${t('다이얼을 아무리 조여도 이 압력을 넘지 않게 막아요. 일정 압력 이상에서는 효과가 더 늘지 않고 혈류만 방해하기 때문이에요.')}</p>` + choiceList('pick', [20, 25, 30, 35, 40].map((v) => ({ value: v, label: v + ' mmHg' + (v === 30 ? ' · ' + t('기본') : '') })), app.s.settings.pressureCap),
        on: { pick: (x) => { app.store.set((s) => { s.settings.pressureCap = +x.dataset.v; }); app.closeSheet(); app.refresh(); } } });
    },
    rem(b, app) { app.store.set((s) => { s.settings.reminders = !s.settings.reminders; }); app.refresh(); },
    lang(b, app) {
      app.sheet({ title: t('언어'), body: choiceList('pick', [{ value: 'ko', label: '한국어' }, { value: 'en', label: 'English' }], app.s.settings.lang),
        on: { pick: (x) => { app.closeSheet(); app.store.set((s) => { s.settings.lang = x.dataset.v; }); } } });
    },
    goal(b, app) {
      app.sheet({ title: t('주간 목표'), body: choiceList('pick', [2, 3, 4, 5, 6, 7].map((v) => ({ value: v, label: t('{n}회', { n: v }) })), app.s.settings.weeklyGoal),
        on: { pick: (x) => { app.store.set((s) => { s.settings.weeklyGoal = +x.dataset.v; }); app.closeSheet(); app.refresh(); } } });
    },
    speed(b, app) {
      app.sheet({ title: t('데모 시간 배속'), body: `<p>${t('실제 슬리브 없이 시연할 때 운동 시간을 빠르게 흘려요. 10×면 1분에 10분이 지나요.')}</p>` + choiceList('pick', [1, 10, 30, 60].map((v) => ({ value: v, label: v + '×' + (v === 1 ? ' · ' + t('실제 시간') : '') })), app.s.settings.demoSpeed),
        on: { pick: (x) => { app.store.set((s) => { s.settings.demoSpeed = +x.dataset.v; }); app.closeSheet(); app.refresh(); } } });
    },
    about(b, app) {
      app.sheet({ title: 'Z-zero', body: `<p>${t('종아리 부하를 미리 감지해 쥐를 막고, 다이얼 카메라로 발 움직임을 분석하는 스마트 카프 슬리브 앱이에요.')}</p><p>${t('지금은 데모 모드예요. 센서 값은 시뮬레이터가 만들고, 기록은 이 폰에만 저장돼요.')}</p>`, actions: [{ label: t('확인'), primary: true }] });
    },
    reset(b, app) {
      app.sheet({ title: t('데모 데이터 초기화'), body: `<p>${t('운동 기록과 설정을 지우고 처음 화면부터 다시 시작해요.')}</p>`, actions: [{ label: t('초기화'), primary: true, onClick: () => app.store.reset() }, { label: t('취소') }] });
    },
  },
};
