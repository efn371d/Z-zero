import { t, statusBar, tabBar, fmt, esc, AC } from '../ui.js';
import { SPORTS, sportById, sportIcon, MORE_ICON, topSport, analyze } from '../data.js';

// 종목별 대표 사진
const HERO = { futsal: 'sport-futsal', soccer: 'sport-soccer', basketball: 'sport-basketball', running: 'sport-running', tennis: 'sport-tennis', badminton: 'sport-tennis', volleyball: 'sport-tennis' };
const heroImg = (id) => `assets/img/${HERO[id] || 'sport-generic'}.jpg`;

// 운동 선택: 필터(전체/경기/훈련/회복), 가장 많이 한 종목 카드, 종목 타일, 검색
let filter = 'all';
const FILTERS = [['all', '전체@Select'], ['match', '경기'], ['training', '훈련'], ['recovery', '회복']];

const glass = 'background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);';
const chipDark = 'height: 30px; padding: 0 12px; box-sizing: border-box; border-radius: 15px; background: rgba(13,14,15,0.45); border: 1px solid rgba(255,255,255,0.14); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); color: #EDEDEB; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; flex: none';
const ic = (d, c = '#EDEDEB', fill = false) => `<svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

/** 종목별 통계: 마지막 운동 시간, 평균 경고 횟수, 평균 최고 부하 */
function stats(s, id) {
  const list = s.sessions.filter((x) => x.sport === id);
  if (!list.length) return null;
  const last = list[list.length - 1];
  const alerts = list.reduce((a, x) => a + x.alerts.length, 0) / list.length;
  const peak = list.reduce((a, x) => a + analyze(x, s.settings.threshold).peak, 0) / list.length;
  return { n: list.length, last, alerts: Math.round(alerts * 10) / 10, load: peak >= 58 ? '부하 높음' : peak >= 45 ? '부하 보통' : '부하 낮음' };
}

function tile(s, sp) {
  const st = stats(s, sp.id);
  return `<button type="button" data-act="pick" data-sport="${sp.id}" style="height: 86px; box-sizing: border-box; border-radius: 24px; ${glass} color: #EDEDEB; font-family: inherit; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; padding: 12px; text-align: left; min-width: 0"><span style="width: 36px; height: 36px; border-radius: 18px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center">${sportIcon(sp)}</span><span style="display: flex; justify-content: space-between; align-items: baseline; width: 100%; gap: 4px"><span style="font-size: 13.5px; font-weight: 700; white-space: nowrap; overflow: hidden; text-overflow: ellipsis">${t(sp.name)}</span>${st ? `<span style="font-size: 11.5px; font-weight: 600; color: rgba(237,237,235,0.62); font-variant-numeric: tabular-nums">${fmt(st.last.duration)}</span>` : ''}</span></button>`;
}

function listRow(s, sp) {
  const on = s.plan.sport === sp.id;
  return `<button type="button" data-act="pickSheet" data-sport="${sp.id}" style="height: 58px; padding: 0 14px; border-radius: 18px; border: 1px solid ${on ? AC : 'rgba(255,255,255,0.09)'}; background: rgba(255,255,255,0.05); color: #EDEDEB; font: 600 15px/1 'Wanted Sans', system-ui, sans-serif; display: flex; align-items: center; gap: 12px; cursor: pointer; text-align: left"><span style="width: 36px; height: 36px; border-radius: 18px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center">${sportIcon(sp)}</span>${t(sp.name)}</button>`;
}

export default {
  id: 'Select',
  render: (s) => {
    const top = sportById(topSport(s)), ts = stats(s, top.id);
    const tiles = SPORTS.filter((sp) => sp.id !== top.id && (filter === 'all' || sp.tags.includes(filter)));
    const heroShown = filter === 'all' || top.tags.includes(filter);
    return `
<div class="root">
<div aria-hidden="true" style="position: absolute; left: -120px; top: -160px; width: 520px; height: 420px; border-radius: 50%; background: radial-gradient(closest-side, rgba(212,238,59,0.09), rgba(0,0,0,0))"></div>
${statusBar()}<div style="position: absolute; inset: 0; padding: 58px 20px 34px; display: flex; flex-direction: column; gap: 16px">

  <div style="display: flex; justify-content: space-between; align-items: flex-end"><div style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 12px; font-weight: 500; color: rgba(237,237,235,0.62)">${t("1/2 · 종목 고르기")}</span><h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.035em; line-height: 1.1">${t("운동")}</h1></div><button type="button" data-act="search" aria-label="${t("검색")}" style="width: 44px; height: 44px; flex: none; box-sizing: border-box; border-radius: 22px; ${glass} display: flex; align-items: center; justify-content: center; padding: 0; font-family: inherit"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="9" cy="9" r="5.5"/><path d="M13 13l4 4"/></svg></button></div>
  <div style="display: flex; gap: 8px">${FILTERS.map(([k, label]) => k === filter
    ? `<button type="button" data-act="filter" data-f="${k}" aria-pressed="true" style="height: 36px; padding: 0 16px; flex: none; box-sizing: border-box; border-radius: 18px; background: #D4EE3B; color: #0D0E0F; font-weight: 700; border: 0; font-family: inherit; font-size: 13px; display: flex; align-items: center; gap: 6px">${ic('<path d="M4.5 10.5l3.5 3.5 7.5-8"/>', '#0D0E0F')}${t(label)}</button>`
    : `<button type="button" data-act="filter" data-f="${k}" aria-pressed="false" style="height: 36px; padding: 0 16px; flex: none; box-sizing: border-box; border-radius: 18px; ${glass} color: rgba(237,237,235,0.62); font-weight: 500; font-family: inherit; font-size: 13px; display: flex; align-items: center; gap: 6px">${t(label)}</button>`).join('')}</div>

  <div style="flex: 1; min-height: 0; overflow-y: auto; margin: 0 -20px; padding: 0 20px 110px; display: flex; flex-direction: column; gap: 16px; scrollbar-width: none">
  ${heroShown ? `<a href="#Setup" data-act="pick" data-sport="${top.id}" style="display: block; flex: none"><div style="position: relative; height: 218px; border-radius: 28px; overflow: hidden; background: #1A1B1C; flex: none">
<img src="${heroImg(top.id)}" alt="${t(top.name)}" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 60% 50%">
<div style="position: absolute; inset: 0; background: linear-gradient(90deg, rgba(13,14,15,0.92) 0%, rgba(13,14,15,0.4) 55%, rgba(13,14,15,0) 100%)"></div>
<div style="position: absolute; left: 18px; right: 18px; top: 18px; bottom: 18px; display: flex; flex-direction: column; justify-content: space-between">
  <div style="display: flex; justify-content: space-between"><span style="height: 30px; padding: 0 12px; box-sizing: border-box; border-radius: 15px; background: #EDEDEB; color: #0D0E0F; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; flex: none">${ic('<path d="M10 3l2.1 4.4 4.8.6-3.5 3.3.9 4.7L10 13.8 5.7 16l.9-4.7L3.1 8l4.8-.6z" fill="#0D0E0F"/>', '#0D0E0F')}${t(ts ? "가장 많이 함" : "추천")}</span><span style="width: 44px; height: 44px; border-radius: 22px; background: #D4EE3B; display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#0D0E0F" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 14L14 6M7.5 6H14v6.5"/></svg></span></div>
  <div style="display: flex; flex-direction: column; gap: 8px">
    <span style="display: flex; align-items: center; gap: 10px"><span style="width: 36px; height: 36px; border-radius: 18px; background: #D4EE3B; display: flex; align-items: center; justify-content: center">${sportIcon(top, '#0D0E0F')}</span><span style="font-size: 30px; font-weight: 800; letter-spacing: -0.035em; line-height: 1">${t(top.name)}</span></span>
    ${ts ? `<div style="display: flex; gap: 6px"><span style="${chipDark}">${ic('<path d="M7 4.5l9 5.5-9 5.5z" fill="#EDEDEB"/>')}${fmt(ts.last.duration)}</span><span style="${chipDark}" title="${t('평균 경고 횟수')}">${ic('<path d="M5 14V9a5 5 0 0110 0v5l1.5 1.5h-13z"/><path d="M8.3 17.5a2 2 0 003.4 0"/>')}${t('경고 평균 {n}회', { n: ts.alerts })}</span><span style="${chipDark}">${ic('<path d="M11 2.5L4.5 11H10l-1 6.5L15.5 9H10z"/>')}${t(ts.load)}</span></div>` : ''}
  </div>
</div>
</div></a>` : ''}

  <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">
    ${tiles.map((sp) => tile(s, sp)).join('')}
    <button type="button" data-act="more" style="height: 86px; box-sizing: border-box; border-radius: 24px; ${glass} color: #EDEDEB; font-family: inherit; display: flex; flex-direction: column; justify-content: space-between; align-items: flex-start; padding: 12px; text-align: left; min-width: 0"><span style="width: 36px; height: 36px; border-radius: 18px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MORE_ICON}</svg></span><span style="font-size: 13.5px; font-weight: 700; white-space: nowrap">${t("더보기")}</span></button>
  </div>
  </div>

</div>${tabBar('Select')}
</div>
`;
  },
  actions: {
    filter: (b, app) => { filter = b.dataset.f; app.refresh(); },
    pick: (b, app) => {
      app.store.set((s) => { s.plan.sport = b.dataset.sport; });
      if (app.s.live) { app.toast(t('진행 중인 운동이 있어요')); app.go('Live'); return; }
      app.go('Setup');
    },
    more: (b, app) => openList(app, ''),
    search: (b, app) => openList(app, '', true),
  },
};

function openList(app, q, focus) {
  const render = (q) => {
    const list = SPORTS.filter((sp) => !q || t(sp.name).toLowerCase().includes(q.toLowerCase()) || sp.name.includes(q) || sp.id.includes(q.toLowerCase()));
    return list.length ? list.map((sp) => listRow(app.s, sp)).join('') : `<p style="text-align:center;padding:20px 0">${t('찾는 종목이 없어요')}</p>`;
  };
  const el = app.sheet({
    title: t('종목 선택'),
    body: `<input type="search" placeholder="${t('종목 검색')}" value="${esc(q)}" style="margin-bottom: 12px"><div data-list style="display: flex; flex-direction: column; gap: 8px">${render(q)}</div>`,
    on: {
      pickSheet: (b) => { app.store.set((s) => { s.plan.sport = b.dataset.sport; }); app.closeSheet(); app.go('Setup'); },
    },
  });
  const inp = el.querySelector('input');
  inp.addEventListener('input', () => { el.querySelector('[data-list]').innerHTML = render(inp.value.trim()); });
  if (focus) setTimeout(() => inp.focus(), 320);
}
