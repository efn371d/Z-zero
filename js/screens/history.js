import { t, statusBar, tabBar, fmt, lang, AC, WARN } from '../ui.js';
import { analyze, sportById, MODES } from '../data.js';

// 기록: 달력(월/주), 날짜를 누르면 그날 운동 카드. 점 색: 흰색=운동, 주황=쥐 또는 경고 3회 이상
let view = null;     // { y, m } 보고 있는 달
let sel = null;      // 선택한 날짜 (자정 기준 ms)
let mode = 'month';  // 'month' | 'week'

const GL = 'background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);';
const ic = (d, c = '#0D0E0F', sz = 16) => `<svg width="${sz}" height="${sz}" viewBox="0 0 20 20" fill="none" stroke="${c}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const I = {
  play: '<path d="M7 4.5l9 5.5-9 5.5z" fill="#0D0E0F"/>',
  bell: '<path d="M5 14V9a5 5 0 0110 0v5l1.5 1.5h-13z"/><path d="M8.3 17.5a2 2 0 003.4 0"/>',
  dial: '<path d="M15.5 10a5.5 5.5 0 11-1.6-3.9"/><path d="M14.5 2.8v3.6h-3.6"/>',
  bolt: '<path d="M11 2.5L4.5 11H10l-1 6.5L15.5 9H10z"/>',
  go: '<path d="M6 14L14 6M7.5 6H14v6.5"/>',
  prev: '<path d="M12.5 4.5L7 10l5.5 5.5"/>',
  next: '<path d="M7.5 5l5 5-5 5"/>',
};
const day0 = (ms) => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime(); };
const loc = () => (lang() === 'en' ? 'en-US' : 'ko-KR');
const monthName = (y, m) => new Date(y, m, 1).toLocaleDateString(loc(), { month: lang() === 'en' ? 'long' : 'long' });
const WEEK = ['월', '화', '수', '목', '금', '토', '일'];

function byDay(s) {
  const map = {};
  s.sessions.forEach((x) => { (map[day0(x.start)] ||= []).push(x); });
  return map;
}

function cell(d, ses, today) {
  const ms = d.getTime(), isSel = ms === sel, isToday = ms === today, future = ms > today;
  const hot = ses && ses.some((x) => x.cramps > 0 || x.alerts.length >= 4);
  const dot = ses ? `<span style="width: 4px; height: 4px; border-radius: 2px; background: ${isSel ? '#0D0E0F' : hot ? WARN : '#EDEDEB'}"></span>` : '<span style="width: 4px; height: 4px"></span>';
  let st;
  if (isSel) st = 'background: #D4EE3B; color: #0D0E0F; font-weight: 700;';
  else if (isToday) st = 'border: 1.5px dashed #D4EE3B; font-weight: 600;';
  else st = `color: ${future ? 'rgba(237,237,235,0.40)' : '#EDEDEB'}; font-weight: 500;`;
  return `<button type="button" data-act="day" data-d="${ms}" style="width: 40px; height: 40px; box-sizing: border-box; justify-self: center; border-radius: 20px; ${st} display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; font-size: 14px; font-variant-numeric: tabular-nums; border-width: ${isToday && !isSel ? '1.5px' : '0'}; background-color: ${isSel ? '#D4EE3B' : 'transparent'}; font-family: inherit; padding: 0; color: ${isSel ? '#0D0E0F' : future ? 'rgba(237,237,235,0.40)' : '#EDEDEB'}">${d.getDate()}${dot}</button>`;
}

function grid(s) {
  const map = byDay(s), today = day0(Date.now());
  const cells = [];
  if (mode === 'week') {
    const d = new Date(sel); d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    for (let i = 0; i < 7; i++) { cells.push(cell(new Date(d), map[d.getTime()], today)); d.setDate(d.getDate() + 1); }
  } else {
    const first = new Date(view.y, view.m, 1), lead = (first.getDay() + 6) % 7, n = new Date(view.y, view.m + 1, 0).getDate();
    for (let i = 0; i < lead; i++) cells.push('<span></span>');
    for (let i = 1; i <= n; i++) { const d = new Date(view.y, view.m, i); cells.push(cell(d, map[d.getTime()], today)); }
  }
  return cells.join('');
}

function card(s, x) {
  const a = analyze(x, s.settings.threshold), d = new Date(x.start);
  const when = d.toLocaleDateString(loc(), { day: 'numeric', weekday: 'short' }) + ' · ' + d.toLocaleTimeString(loc(), { hour: 'numeric', minute: '2-digit' });
  return `<a href="#Summary" data-act="open" data-id="${x.id}" style="position: relative; border-radius: 28px; background: #EDEDEB; color: #0D0E0F; padding: 16px; display: flex; flex-direction: column; gap: 10px; flex: none">
    <span style="display: flex; gap: 6px; align-items: center"><span style="height: 30px; padding: 0 12px; border-radius: 15px; background: rgba(13,14,15,0.08); font-size: 12px; font-weight: 600; font-variant-numeric: tabular-nums; display: flex; align-items: center">${when}</span>${x.saved ? `<span style="height: 30px; padding: 0 10px; border-radius: 15px; background: #D4EE3B; font-size: 12px; font-weight: 700; display: flex; align-items: center">${t('보관')}</span>` : ''}</span>
    <span style="display: flex; flex-direction: column"><span style="font-size: 20px; font-weight: 700; letter-spacing: -0.02em">${t(sportById(x.sport).name)} · ${t((MODES[x.mode] || MODES.match).name)}</span><span style="display: flex; gap: 14px; margin-top: 6px; font-size: 13px; font-weight: 700; font-variant-numeric: tabular-nums"><span style="display: flex; align-items: center; gap: 5px" title="${t('운동 시간')}">${ic(I.play)}${fmt(x.duration)}</span><span style="display: flex; align-items: center; gap: 5px" title="${t('경고')}">${ic(I.bell)}${x.alerts.length}</span><span style="display: flex; align-items: center; gap: 5px" title="${t('다이얼 조임')}">${ic(I.dial)}${x.dialTurns}</span><span style="display: flex; align-items: center; gap: 5px" title="${t('종아리 점수')}">${ic(I.bolt)}${a.score}</span></span></span>
    <span style="position: absolute; right: 14px; top: 14px"><span style="width: 44px; height: 44px; flex: none; border-radius: 22px; background: #0D0E0F; display: flex; align-items: center; justify-content: center">${ic(I.go, AC, 20)}</span></span>
  </a>`;
}

function weekStats(s) {
  const d = new Date(sel); d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  const a = d.getTime(), b = a + 7 * 864e5;
  const list = s.sessions.filter((x) => x.start >= a && x.start < b);
  const total = list.reduce((m, x) => m + x.duration, 0);
  const avg = list.length ? Math.round(list.reduce((m, x) => m + analyze(x, s.settings.threshold).score, 0) / list.length) : '–';
  const box = (v, l) => `<span style="flex: 1; display: flex; flex-direction: column; padding: 12px 14px; border-radius: 22px; ${GL}"><span style="font-size: 22px; font-weight: 700; letter-spacing: -0.03em; font-variant-numeric: tabular-nums">${v}</span><span style="font-size: 12px; color: rgba(237,237,235,0.62)">${l}</span></span>`;
  return `<div style="display: flex; gap: 8px">${box(list.length + ' / ' + s.settings.weeklyGoal, t('이번 주 운동'))}${box(fmt(total), t('총 시간'))}${box(avg, t('평균 점수'))}</div>`;
}

export default {
  id: 'History',
  render: (s) => {
    if (!view) { const now = new Date(); view = { y: now.getFullYear(), m: now.getMonth() }; }
    if (!sel) { const last = s.sessions[s.sessions.length - 1]; sel = last ? day0(last.start) : day0(Date.now()); const d = new Date(sel); view = { y: d.getFullYear(), m: d.getMonth() }; }
    const list = (byDay(s)[sel] || []).slice().reverse();
    const selD = new Date(sel);
    const tog = (k, label) => k === mode
      ? `<button type="button" data-act="mode" data-m="${k}" aria-pressed="true" style="width: 36px; height: 36px; border: 0; border-radius: 18px; background: #EDEDEB; color: #0D0E0F; font-family: inherit; font-size: 13px; font-weight: 700">${t(label)}</button>`
      : `<button type="button" data-act="mode" data-m="${k}" aria-pressed="false" style="width: 36px; height: 36px; border: 0; border-radius: 18px; background: transparent; color: rgba(237,237,235,0.62); font-family: inherit; font-size: 13px; font-weight: 600">${t(label)}</button>`;
    const navBtn = (act, label, d) => `<button type="button" data-act="${act}" aria-label="${t(label)}" style="width: 44px; height: 44px; flex: none; box-sizing: border-box; border-radius: 22px; ${GL} display: flex; align-items: center; justify-content: center; padding: 0; font-family: inherit">${ic(d, '#EDEDEB', 20)}</button>`;
    return `
<div class="root">
<div aria-hidden="true" style="position: absolute; left: -120px; top: -160px; width: 520px; height: 420px; border-radius: 50%; background: radial-gradient(closest-side, rgba(212,238,59,0.09), rgba(0,0,0,0))"></div>
${statusBar()}<div style="position: absolute; inset: 0; padding: 58px 20px 34px; display: flex; flex-direction: column; gap: 16px">

  <div style="display: flex; justify-content: space-between; align-items: flex-end"><div style="display: flex; flex-direction: column; gap: 2px"><span style="font-size: 12px; font-weight: 500; color: rgba(237,237,235,0.62)">${monthName(view.y, view.m)}</span><h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.035em; line-height: 1.1">${t("기록")}</h1></div><div style="display: flex; padding: 3px; border-radius: 22px; ${GL}">${tog('week', '주')}${tog('month', '월')}</div></div>

  <div style="flex: 1; min-height: 0; overflow-y: auto; margin: 0 -20px; padding: 0 20px 110px; display: flex; flex-direction: column; gap: 16px; scrollbar-width: none">
  <section style="border-radius: 28px; ${GL} padding: 14px 10px 10px; display: flex; flex-direction: column; gap: 8px; flex: none">
    <div style="display: flex; justify-content: space-between; align-items: center; padding: 0 6px">
      <span style="display: flex; align-items: baseline; gap: 6px"><span style="font-size: 20px; font-weight: 700; letter-spacing: -0.02em">${mode === 'week' ? t('{m}월 {w}주', { m: selD.getMonth() + 1, w: Math.ceil((selD.getDate() + ((new Date(selD.getFullYear(), selD.getMonth(), 1).getDay() + 6) % 7)) / 7) }) : monthName(view.y, view.m)}</span><span style="font-size: 14px; font-weight: 500; color: rgba(237,237,235,0.40); font-variant-numeric: tabular-nums">${view.y}</span></span>
      <span style="display: flex; gap: 8px">${navBtn('prev', mode === 'week' ? '이전 주' : '이전 달', I.prev)}${navBtn('next', mode === 'week' ? '다음 주' : '다음 달', I.next)}</span>
    </div>
    <div style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr))">${WEEK.map((w) => `<span style="text-align: center; font-size: 11px; font-weight: 600; color: rgba(237,237,235,0.40)">${t(w)}</span>`).join('')}</div>
    <div style="display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); row-gap: 4px">${grid(s)}</div>
  </section>
  ${mode === 'week' ? weekStats(s) : ''}
  ${list.length ? list.map((x) => card(s, x)).join('') : `<div style="border-radius: 28px; ${GL} padding: 22px; display: flex; flex-direction: column; align-items: center; gap: 12px; flex: none"><span style="color: rgba(237,237,235,0.62); font-size: 14px">${t('이 날은 운동 기록이 없어요')}</span>${sel === day0(Date.now()) ? `<a href="#Select" style="height: 44px; padding: 0 20px; border-radius: 22px; background: #D4EE3B; color: #0D0E0F; display: flex; align-items: center; font-weight: 700">${t('운동 시작')}</a>` : ''}</div>`}
  </div>

</div>${tabBar('History')}
</div>
`;
  },
  actions: {
    day: (b, app) => { sel = +b.dataset.d; app.refresh(); },
    mode: (b, app) => { mode = b.dataset.m; app.refresh(); },
    prev: (b, app) => move(app, -1),
    next: (b, app) => move(app, 1),
    open: (b, app) => app.go('Summary', { params: { sid: b.dataset.id } }),
  },
};

function move(app, dir) {
  if (mode === 'week') {
    sel += dir * 7 * 864e5; const d = new Date(sel); view = { y: d.getFullYear(), m: d.getMonth() };
  } else {
    let { y, m } = view; m += dir; if (m < 0) { m = 11; y--; } if (m > 11) { m = 0; y++; }
    view = { y, m }; sel = new Date(y, m, 1).getTime();
    const list = Object.keys(byDay(app.s)).map(Number).filter((d) => new Date(d).getMonth() === m && new Date(d).getFullYear() === y);
    if (list.length) sel = Math.max(...list);
  }
  app.refresh();
}
