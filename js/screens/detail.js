import { t, statusBar, fmt, legIcon, esc, clipMedia, AC, WARN } from '../ui.js';
import { analyze } from '../data.js';

// 종아리 상세: 부하 그래프(전체/전반/후반), 경고 순간 클립, 방향 전환·뒤꿈치 착지 지표
let range = 'full';
const legs = (weak, on, off, w = 12.8, h = 20) => (weak === 'L' ? legIcon('L', on, w, h) + legIcon('R', off, w, h) : legIcon('L', off, w, h) + legIcon('R', on, w, h));

/** 부하 그래프 SVG. 세로축: 부하 % (80→위, 20→아래), 가로축: 시간 */
function chart(ses, a, th) {
  const half = ses.duration / 2;
  const [t0, t1] = range === 'first' ? [0, half] : range === 'second' ? [half, ses.duration] : [0, ses.duration];
  const X = (tt) => 22 + (298 * (tt - t0)) / Math.max(1, t1 - t0);
  const Y = (v) => Math.max(4, Math.min(146, 168 - 2 * v));
  const pts = ses.series.filter((p) => p.t >= t0 && p.t <= t1);
  const line = (k) => pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.t).toFixed(1)} ${Y(p[k]).toFixed(1)}`).join(' ');
  const weak = a.weak, strong = weak === 'L' ? 'R' : 'L';
  const alerts = ses.alerts.filter((x) => x.t >= t0 && x.t <= t1);
  const first = a.firstOver && a.firstOver.t >= t0 && a.firstOver.t <= t1 ? a.firstOver : null;
  const tipX = first ? Math.max(24, Math.min(200, X(first.t) - 60)) : 0;
  return `<svg width="320" height="150" viewBox="0 0 320 150" role="img" aria-label="${t('종아리 부하 그래프')}" style="overflow: visible">
        <g font-family="Wanted Sans, sans-serif" font-size="10" fill="rgba(237,237,235,0.40)"><text x="0" y="12">80</text><text x="0" y="52">60</text><text x="0" y="92">40</text><text x="0" y="132">20</text></g>
        <g stroke="rgba(255,255,255,0.06)"><line x1="22" x2="320" y1="8" y2="8"></line><line x1="22" x2="320" y1="48" y2="48"></line><line x1="22" x2="320" y1="88" y2="88"></line><line x1="22" x2="320" y1="128" y2="128"></line></g>
        <line x1="22" x2="320" y1="${Y(th)}" y2="${Y(th)}" stroke="rgba(237,237,235,0.40)" stroke-dasharray="3 5"></line>
        <path d="${line(strong)}" fill="none" stroke="#D4EE3B" stroke-opacity="0.75" stroke-width="1.8" stroke-linejoin="round"></path>
        <path d="${line(weak)}" fill="none" stroke="#EDEDEB" stroke-width="2" stroke-linejoin="round"></path>
        ${first ? `<line x1="${X(first.t)}" x2="${X(first.t)}" y1="${Y(first.load)}" y2="146" stroke="#D4EE3B" stroke-width="1.5" stroke-dasharray="3 3"></line>` : ''}
        ${alerts.map((x) => (first && x.t === first.t ? '' : `<circle cx="${X(x.t)}" cy="${Y(x.load)}" r="4" fill="#0D0E0F" stroke="#F0803A" stroke-width="2"></circle>`)).join('')}
        ${first ? `<circle cx="${X(first.t)}" cy="${Y(first.load)}" r="5" fill="#0D0E0F" stroke="#EDEDEB" stroke-width="2"></circle>` : ''}
      </svg>
      ${first ? `<span style="position: absolute; left: ${tipX}px; top: 2px; padding: 6px 10px; border-radius: 12px; background: rgba(13,14,15,0.45); border: 1px solid rgba(255,255,255,0.14); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); display: flex; flex-direction: column"><span style="font-size: 13px; font-weight: 700; font-variant-numeric: tabular-nums">${fmt(first.t)} · ${first.load}</span><span style="font-size: 10.5px; color: rgba(237,237,235,0.62)">${t(first.action === 'dial' ? '경고 · 다이얼 +½' : '기준선 초과')}</span></span>` : ''}`;
}

/** 첫 과부하 시점에 가장 가까운 클립 3개 */
function clipsNear(ses, a) {
  const c = ses.clips || [];
  if (!c.length) return [];
  const at = a.firstOver ? a.firstOver.t : ses.duration / 2;
  return [...c].sort((x, y) => Math.abs(x.t - at) - Math.abs(y.t - at)).slice(0, 3).sort((x, y) => x.t - y.t);
}
const PLAY = '<svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="#0D0E0F" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4.5l9 5.5-9 5.5z" fill="#0D0E0F"/></svg>';
function clipBtn(c, i) {
  return `<button type="button" data-act="play" data-i="${i}" style="position: relative; height: 112px; padding: 0; border: 0; border-radius: 24px; overflow: hidden; background: #1A1B1C; font-family: inherit; color: #EDEDEB; text-align: left"><img src="${clipMedia(c.label).poster}" alt="" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 40% 50%"><span style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(13,14,15,0) 40%, rgba(13,14,15,0.82))"></span><span style="position: absolute; right: 8px; top: 8px; width: 28px; height: 28px; border-radius: 14px; background: #EDEDEB; display: flex; align-items: center; justify-content: center">${PLAY}</span><span style="position: absolute; left: 10px; bottom: 8px; display: flex; flex-direction: column"><span style="font-size: 12.5px; font-weight: 700">${esc(t(c.label))}</span><span style="font-size: 11px; color: rgba(237,237,235,0.62); font-variant-numeric: tabular-nums">${fmt(c.t)}</span></span></button>`;
}
const pill = (k, label, on) => on
  ? `<button type="button" data-act="range" data-r="${k}" aria-pressed="true" style="height: 30px; padding: 0 12px; flex: none; box-sizing: border-box; border-radius: 18px; background: #EDEDEB; color: #0D0E0F; font-weight: 700; border: 0; font-family: inherit; font-size: 13px; display: flex; align-items: center; gap: 6px">${t(label)}</button>`
  : `<button type="button" data-act="range" data-r="${k}" aria-pressed="false" style="height: 30px; padding: 0 12px; flex: none; box-sizing: border-box; border-radius: 18px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); color: rgba(237,237,235,0.62); font-weight: 500; font-family: inherit; font-size: 13px; display: flex; align-items: center; gap: 6px">${t(label)}</button>`;

export default {
  id: 'Detail',
  render: (s, app, ses = app.sessionById(app.params.sid), a = ses && analyze(ses, s.settings.threshold), th = s.settings.threshold) => !ses ? '<div class="root"></div>' : `
<div class="root">
<div aria-hidden="true" style="position: absolute; left: -120px; top: -160px; width: 520px; height: 420px; border-radius: 50%; background: radial-gradient(closest-side, rgba(212,238,59,0.09), rgba(0,0,0,0))"></div>
${statusBar()}<div style="position: absolute; inset: 0; padding: 58px 20px 34px; display: flex; flex-direction: column; gap: 16px">

  <div style="display: flex; align-items: center; justify-content: space-between"><a href="#Summary" data-act="back" aria-label="${t("뒤로")}" style="width: 44px; height: 44px; flex: none; box-sizing: border-box; border-radius: 22px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.5 4.5L7 10l5.5 5.5"/></svg></a><span style="font-size: 16px; font-weight: 700">${t("종아리@Detail")}</span><span style="display: flex; gap: 8px"><button type="button" data-act="save" aria-label="${t("저장")}" style="width: 44px; height: 44px; flex: none; box-sizing: border-box; border-radius: 22px; background: ${ses.saved ? 'rgba(212,238,59,0.2)' : 'rgba(255,255,255,0.05)'}; border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); display: flex; align-items: center; justify-content: center; padding: 0; font-family: inherit"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h8v14l-4-3-4 3z"/></svg></button></span></div>

  <div style="display: flex; align-items: center; gap: 12px">
    <span style="width: 56px; height: 56px; flex: none; border-radius: 28px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); display: flex; align-items: center; justify-content: center"><span role="img" aria-label="${t(a.weak === 'L' ? "왼쪽 다리" : "오른쪽 다리")}" style="display: inline-flex; gap: 3px; align-items: flex-end">${legs(a.weak, '#EDEDEB', 'rgba(237,237,235,0.22)')}</span></span>
    <span style="flex: 1; display: flex; flex-direction: column"><span style="font-size: 22px; font-weight: 800; letter-spacing: -0.02em; font-variant-numeric: tabular-nums">${a.firstOver ? fmt(a.firstOver.t) : '–'}</span><span style="font-size: 12px; color: rgba(237,237,235,0.62)">${t(a.firstOver ? "첫 과부하" : "과부하 없음")}</span></span>
    <span style="display: flex; flex-direction: column; align-items: flex-end"><span style="font-size: 20px; font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: -0.03em">${a.firstOver ? a.firstOver.load : a.peak}</span><span style="font-size: 11.5px; font-weight: 600; color: #D4EE3B; font-variant-numeric: tabular-nums">${a.drop ? t("조인 뒤 {n}", { n: '−' + Math.abs(a.drop) }) : t("최고 부하")}</span></span>
  </div>

  <section style="border-radius: 28px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); padding: 14px 14px 12px; display: flex; flex-direction: column; gap: 10px">
    <div style="position: relative; height: 150px">
      ${chart(ses, a, th)}
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center">
      <div style="display: flex; gap: 4px">${pill('full', '전체@Detail', range === 'full')}${pill('first', '전반', range === 'first')}${pill('second', '후반', range === 'second')}</div>
      <span style="display: flex; gap: 10px; align-items: center">${legIcon(a.weak, '#EDEDEB', 11.5, 18)}${legIcon(a.weak === 'L' ? 'R' : 'L', AC, 11.5, 18)}</span>
    </div>
  </section>

  <div style="display: flex; flex-direction: column; gap: 8px">
    <div style="display: flex; justify-content: space-between; align-items: baseline"><span style="font-size: 15px; font-weight: 700">${t("경고 순간의 발")}</span><span style="font-size: 12px; font-weight: 500; color: rgba(237,237,235,0.62)">${t("3초 클립")}</span></div>
    <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px">
      ${clipsNear(ses, a).map(clipBtn).join('') || `<span style="grid-column: 1 / -1; color: rgba(237,237,235,0.62); font-size: 13px; padding: 12px 0">${t('저장된 클립이 없어요 (발 카메라 꺼짐)')}</span>`}
    </div>
  </div>

  <ul style="margin: 0; padding: 0 16px 0 12px; list-style: none; border-radius: 28px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px)"><li data-act="metric" data-k="cuts" style="border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; gap: 12px; min-height: 56px"><span style="display: flex; gap: 12px; align-items: center"><span style="width: 36px; height: 36px; flex: none; border-radius: 18px; background: rgba(255,255,255,0.07); display: flex; align-items: center; justify-content: center"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 15c2-6 6-9 12-10"/><path d="M12 4h4.5v4.5"/></svg></span><span style="display: flex; flex-direction: column"><span style="font-size: 14.5px; font-weight: 600">${t("방향 전환")}</span></span></span><span style="display: flex; gap: 10px; align-items: center"><span role="img" aria-label="${t(a.push.hi === 'L' ? "왼쪽 다리" : "오른쪽 다리")}" style="display: inline-flex; gap: 3px; align-items: flex-end">${legs(a.push.hi, AC, 'rgba(237,237,235,0.22)', 11.5, 18)}</span><span style="display: flex; gap: 6px; align-items: center; color: rgba(237,237,235,0.62); font-size: 13.5px; font-weight: 500; font-variant-numeric: tabular-nums">${a.push.ratio}×<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="rgba(237,237,235,0.40)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.5 5l5 5-5 5"/></svg></span></span></li><li data-act="metric" data-k="heel" style="display: flex; justify-content: space-between; align-items: center; gap: 12px; min-height: 56px"><span style="display: flex; gap: 12px; align-items: center"><span style="width: 36px; height: 36px; flex: none; border-radius: 18px; background: rgba(255,255,255,0.07); display: flex; align-items: center; justify-content: center"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3v7l-2 6h6l1-3-2-3V3"/></svg></span><span style="display: flex; flex-direction: column"><span style="font-size: 14.5px; font-weight: 600">${t("후반 뒤꿈치 착지")}</span></span></span><span style="display: flex; gap: 6px; align-items: center; color: rgba(237,237,235,0.62); font-size: 13.5px; font-weight: 500; font-variant-numeric: tabular-nums">+${a.heelLate}%<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="rgba(237,237,235,0.40)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7.5 5l5 5-5 5"/></svg></span></li></ul>

</div>
</div>
`,
  actions: {
    range: (b, app) => { range = b.dataset.r; app.refresh(); },
    play: (b, app) => {
      const ses = app.sessionById(app.params.sid), a = analyze(ses, app.s.settings.threshold);
      const c = clipsNear(ses, a)[+b.dataset.i];
      app.playClip(clipMedia(c.label).video, `${esc(t(c.label))}<small>${fmt(c.t)} · ${t('부하')} ${c.load}</small>`);
    },
    save: (b, app) => {
      const id = app.sessionById(app.params.sid).id;
      app.store.set((s) => { const x = s.sessions.find((y) => y.id === id); x.saved = !x.saved; });
      app.toast(t(app.sessionById(id).saved ? '기록을 보관했어요' : '보관 해제'));
      app.refresh();
    },
    metric: (b, app) => {
      const ses = app.sessionById(app.params.sid), a = analyze(ses, app.s.settings.threshold);
      const side = t(a.push.hi === 'L' ? '왼쪽' : '오른쪽');
      const info = b.dataset.k === 'cuts'
        ? { title: t('방향 전환'), body: t('방향을 바꿀 때 {side} 다리에 실린 부하가 반대쪽보다 {r}배 컸어요. 다이얼 안 압력 센서(FMG)가 종아리 근육이 부푸는 정도를 재고, 다이얼 속 움직임 센서(IMU)가 방향 전환 순간을 잡아 그 순간의 좌우 값을 비교해요. 전환 {n}회 기준이에요.', { side, r: a.push.ratio, n: ses.transitions }) }
        : { title: t('후반 뒤꿈치 착지'), body: t('후반에는 앞꿈치 대신 뒤꿈치로 착지한 비율이 전반보다 {n}% 늘었어요. 종아리가 지치면 발목을 덜 펴서 뒤꿈치가 먼저 닿게 돼요. 다이얼 카메라로 착지 순간 발 각도를 보고 전반과 후반을 비교한 값이에요.', { n: a.heelLate }) };
      app.sheet({ title: info.title, body: `<p>${info.body}</p>`, actions: [{ label: t('확인'), primary: true }] });
    },
  },
  mount() { range = 'full'; },
};
