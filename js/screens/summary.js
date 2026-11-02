import { t, statusBar, tabBar, fmt, lang, esc, clipMedia, AC, WARN, DISPLAY } from '../ui.js';
import { analyze, sportById } from '../data.js';

export function sessionTitle(ses) {
  const d = new Date(ses.start);
  return t(sportById(ses.sport).name) + ' · ' + d.toLocaleDateString(lang() === 'en' ? 'en-US' : 'ko-KR', { month: lang() === 'en' ? 'short' : 'long', day: 'numeric' });
}
const STATUS_C = { '안정': AC, '주의': '#F5C04A', '위험': WARN };

// 10분별 부하 막대: 첫 과부하가 있었던 구간을 밝게
function bars(a) {
  const max = Math.max(1, ...a.buckets.map((b) => Math.max(b.L, b.R)));
  const hot = a.firstOver ? Math.floor(a.firstOver.t / 600) : -1;
  return a.buckets.map((b, i) => {
    const on = i === hot;
    return `<span style="display: flex; flex-direction: column; align-items: center; gap: 8px"><span style="height: 88px; display: flex; align-items: flex-end; gap: 4px"><span style="width: 12px; height: ${Math.max(6, Math.round(88 * b.L / max))}px; border-radius: 6px; background: ${on ? '#EDEDEB' : 'rgba(237,237,235,0.28)'}"></span><span style="width: 12px; height: ${Math.max(6, Math.round(88 * b.R / max))}px; border-radius: 6px; background: ${on ? '#D4EE3B' : 'rgba(212,238,59,0.32)'}"></span></span><span style="font-size: 11px; font-weight: 500; color: ${on ? '#EDEDEB' : 'rgba(237,237,235,0.62)'}; font-variant-numeric: tabular-nums">${b.t}</span></span>`;
  }).join('');
}

export default {
  id: 'Summary',
  render: (s, app, ses = app.sessionById(app.params.sid), a = ses ? analyze(ses, s.settings.threshold) : null) => !ses ? empty() : `
<div class="root">
<div aria-hidden="true" style="position: absolute; left: -120px; top: -160px; width: 520px; height: 420px; border-radius: 50%; background: radial-gradient(closest-side, rgba(212,238,59,0.09), rgba(0,0,0,0))"></div>
${statusBar()}<div style="position: absolute; inset: 0; padding: 58px 20px 34px; display: flex; flex-direction: column; gap: 16px">

  <div style="display: flex; align-items: center; justify-content: space-between"><a href="#Main" data-act="back" aria-label="${t("뒤로")}" style="width: 44px; height: 44px; flex: none; box-sizing: border-box; border-radius: 22px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.5 4.5L7 10l5.5 5.5"/></svg></a><span style="font-size: 16px; font-weight: 700">${sessionTitle(ses)}</span><button type="button" data-act="share" aria-label="${t("공유")}" style="width: 44px; height: 44px; flex: none; box-sizing: border-box; border-radius: 22px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); display: flex; align-items: center; justify-content: center; padding: 0; font-family: inherit"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 3v10M6 7l4-4 4 4"/><path d="M4 11v5h12v-5"/></svg></button></div>
  <div style="display: flex; gap: 8px"><button type="button" aria-pressed="true" style="height: 36px; padding: 0 16px; flex: none; box-sizing: border-box; border-radius: 18px; background: #D4EE3B; color: #0D0E0F; font-weight: 700; border: 0; font-family: inherit; font-size: 13px; display: flex; align-items: center; gap: 6px"><svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="#0D0E0F" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 16.5V11M8 16.5V4.5M12 16.5V8.5M16 16.5V12"/></svg>${t("요약")}</button><button type="button" data-act="calf" aria-pressed="false" style="height: 36px; padding: 0 16px; flex: none; box-sizing: border-box; border-radius: 18px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); color: rgba(237,237,235,0.62); font-weight: 500; font-family: inherit; font-size: 13px; display: flex; align-items: center; gap: 6px"><svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="rgba(237,237,235,0.62)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3v7l-2 6h6l1-3-2-3V3"/></svg>${t("종아리@Summary")}</button><button type="button" data-act="clips" aria-pressed="false" style="height: 36px; padding: 0 16px; flex: none; box-sizing: border-box; border-radius: 18px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); color: rgba(237,237,235,0.62); font-weight: 500; font-family: inherit; font-size: 13px; display: flex; align-items: center; gap: 6px"><svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="rgba(237,237,235,0.62)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="5.5" width="15" height="10.5" rx="2.6"/><circle cx="10" cy="10.75" r="2.8"/><path d="M7 5.5l1.2-2h3.6l1.2 2"/></svg>${t("클립")}</button></div>

  <section style="border-radius: 28px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); padding: 18px; display: flex; flex-direction: column; gap: 14px">
    <div style="display: flex; justify-content: space-between; align-items: flex-start">
      <span style="display: flex; flex-direction: column"><span style="font-size: 12px; font-weight: 500; color: rgba(237,237,235,0.62)">${t("종아리 점수")}</span><span style="display: flex; align-items: center; gap: 8px"><span style="font-family: ${DISPLAY}; font-size: 76px; font-weight: 600; line-height: 0.85; font-variant-numeric: tabular-nums; padding-top: 6px">${a.score}</span><span style="height: 30px; padding: 0 12px; box-sizing: border-box; border-radius: 15px; background: rgba(255,255,255,0.08); color: ${STATUS_C[a.status]}; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; flex: none">${t(a.status === "안정" ? "안정@Summary" : a.status)}</span></span></span>
      <a href="#Detail" data-act="detail" aria-label="${t("상세 보기")}" style="width: 44px; height: 44px; flex: none; box-sizing: border-box; border-radius: 22px; background: #D4EE3B; display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#0D0E0F" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 14L14 6M7.5 6H14v6.5"/></svg></a>
    </div>
    <div style="display: flex; justify-content: space-between; align-items: center"><span style="font-size: 12px; font-weight: 500; color: rgba(237,237,235,0.62)">${t("10분별 부하")}</span><span style="display: flex; gap: 10px; align-items: center"><svg width="11.5" height="18" viewBox="0 0 16 25" aria-hidden="true"><g transform="translate(16,0) scale(-1,1)"><path d="M2.6 1h7.2l.4 7.2-.5 7.6.6 3.1 4.6 1.9c.9.4 1 1.9.1 2.4l-.5.3H4.2c-.8 0-1.3-.6-1.2-1.4l.6-3.4C1.8 14.6.9 10.4 1.6 6.4z" fill="#EDEDEB"></path></g></svg><svg width="11.5" height="18" viewBox="0 0 16 25" aria-hidden="true"><g><path d="M2.6 1h7.2l.4 7.2-.5 7.6.6 3.1 4.6 1.9c.9.4 1 1.9.1 2.4l-.5.3H4.2c-.8 0-1.3-.6-1.2-1.4l.6-3.4C1.8 14.6.9 10.4 1.6 6.4z" fill="#D4EE3B"></path></g></svg></span></div>
    <div style="display: flex; justify-content: space-between; padding: 0 2px">${bars(a)}</div>
  </section>

  <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px">
    <div style="height: 112px; box-sizing: border-box; border-radius: 24px; background: #EDEDEB; color: #0D0E0F; padding: 12px 14px 14px; display: flex; flex-direction: column; justify-content: space-between; min-width: 0"><span style="width: 36px; height: 36px; border-radius: 18px; background: rgba(13,14,15,0.08); display: flex; align-items: center; justify-content: center"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#0D0E0F" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4.5 10.5l3.5 3.5 7.5-8"/></svg></span><span style="display: flex; flex-direction: column"><span style="font-size: 24px; font-weight: 700; line-height: 1.1; font-variant-numeric: tabular-nums; letter-spacing: -0.03em; white-space: nowrap">${t(a.risk)}</span><span style="font-size: 12px; font-weight: 500; color: rgba(13,14,15,0.62)">${t("쥐 위험")}</span></span></div>
    <div style="height: 112px; box-sizing: border-box; border-radius: 24px; background: linear-gradient(160deg, #E2F55E 0%, #C6E02C 55%, #9DB51C 100%); color: #0D0E0F; padding: 12px 14px 14px; display: flex; flex-direction: column; justify-content: space-between; min-width: 0"><span style="width: 36px; height: 36px; border-radius: 18px; background: rgba(13,14,15,0.12); display: flex; align-items: center; justify-content: center"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#0D0E0F" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3v7l-2 6h6l1-3-2-3V3"/></svg></span><span style="display: flex; flex-direction: column"><span style="font-size: 24px; font-weight: 700; line-height: 1.1; font-variant-numeric: tabular-nums; letter-spacing: -0.03em; white-space: nowrap">${a.ankleROM}°</span><span style="font-size: 12px; font-weight: 500; color: rgba(13,14,15,0.66)">${t("발목 가동 범위")}</span></span></div>
  </div>

  <a href="#Insight" data-act="insight" style="display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 28px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px)">
    <img src="assets/img/recovery.jpg" alt="" style="width: 56px; height: 56px; border-radius: 18px; object-fit: cover">
    <span style="flex: 1; display: flex; flex-direction: column"><span style="font-size: 15px; font-weight: 700">${t("회복 플랜")}</span><span style="font-size: 12px; color: rgba(237,237,235,0.62); font-variant-numeric: tabular-nums">${t("{n}단계 · {m}분", { n: a.plan.length, m: a.planMin })}</span></span>
    <span style="width: 44px; height: 44px; flex: none; border-radius: 22px; background: #EDEDEB; display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#0D0E0F" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5"/></svg></span>
  </a>

</div>${tabBar('Summary')}
</div>
`,
  actions: {
    detail: (b, app) => app.go('Detail'),
    calf: (b, app) => app.go('Detail'),
    insight: (b, app) => app.go('Insight'),
    clips: (b, app) => openClips(app, app.sessionById(app.params.sid)),
    async share(b, app) {
      const ses = app.sessionById(app.params.sid), a = analyze(ses, app.s.settings.threshold);
      const text = `Z-zero · ${sessionTitle(ses)}\n${t('종아리 점수')} ${a.score} (${t(a.status)})\n${t('운동 시간')} ${fmt(ses.duration)} · ${t('경고')} ${ses.alerts.length} · ${t('쥐')} ${ses.cramps}`;
      try { if (navigator.share) { await navigator.share({ title: 'Z-zero', text }); return; } } catch (e) { return; }
      try { await navigator.clipboard.writeText(text); app.toast(t('요약을 복사했어요')); } catch (e) { app.toast(t('공유를 지원하지 않는 브라우저예요')); }
    },
  },
  mount(el, app) { if (!app.params.sid) { const l = app.s.sessions[app.s.sessions.length - 1]; if (l) app.params.sid = l.id; } },
};

function empty() {
  return `<div class="root">${statusBar()}<div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:40px;text-align:center"><span style="font-size:22px;font-weight:700">${t('아직 운동 기록이 없어요')}</span><span style="color:rgba(237,237,235,0.62)">${t('운동을 한 번 하면 여기에 분석이 나와요.')}</span><a href="#Select" style="margin-top:12px;height:52px;padding:0 24px;border-radius:26px;background:#D4EE3B;color:#0D0E0F;display:flex;align-items:center;font-weight:700">${t('운동 시작')}</a></div>${tabBar('Summary')}</div>`;
}

/** 클립 목록 시트 (Detail에서도 사용) */
export function openClips(app, ses) {
  const clips = ses.clips || [];
  app.sheet({
    title: t('클립 {n}개', { n: clips.length }),
    body: clips.length ? `<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${clips.map((c, i) => `<button type="button" data-act="play" data-i="${i}" style="position:relative;height:110px;border-radius:18px;overflow:hidden;border:0;padding:0;background:#000"><img src="${clipMedia(c.label).poster}" alt="" style="width:100%;height:100%;object-fit:cover;opacity:.85"><span style="position:absolute;inset:auto 0 0 0;padding:16px 8px 6px;background:linear-gradient(180deg,transparent,rgba(0,0,0,.7));color:#fff;font:700 12px/1.2 'Wanted Sans',system-ui;text-align:left">${esc(t(c.label))}<br><span style="font-weight:500;opacity:.7">${fmt(c.t)}</span></span></button>`).join('')}</div>` : `<p>${t('이 운동에는 저장된 클립이 없어요.')}</p>`,
    on: { play: (b) => { const c = clips[+b.dataset.i]; app.playClip(clipMedia(c.label).video, `${esc(t(c.label))}<small>${fmt(c.t)} · ${t('부하')} ${c.load}</small>`); } },
    actions: [{ label: t('닫기') }],
  });
}
