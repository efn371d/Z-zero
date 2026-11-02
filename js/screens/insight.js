import { t, statusBar, fmt, legIcon, AC, WARN } from '../ui.js';
import { analyze, MODES } from '../data.js';

// AI 인사이트: 기록 분석 결과를 문장으로 정리 + 오늘 밤 회복 루틴(타이머)
const STATUS_C = { '안정': AC, '주의': '#F5C04A', '위험': WARN };
const legs = (weak, on, off, w = 12.8, h = 20) => (weak === 'L' ? legIcon('L', on, w, h) + legIcon('R', off, w, h) : legIcon('L', off, w, h) + legIcon('R', on, w, h));
// 순서는 항상 왼쪽 → 오른쪽, 지친 다리(side)만 라임색
const pair = (side, valL, valR) => ['L', 'R'].map((sd) => `<span style="display: flex; align-items: flex-end; gap: 4px">${legIcon(sd, sd === side ? AC : '#EDEDEB', 12.8, 20, true)}<span style="font-size: 20px; font-weight: 700; line-height: 1; font-variant-numeric: tabular-nums; letter-spacing: -0.03em">${sd === 'L' ? valL : valR}</span></span>`).join('');

/** 다음 운동 권장: 첫 과부하가 후반이면 '후반 전', 아니면 그 시점 5분 전에 다이얼 ½바퀴 */
/** 다음 운동 권장: 첫 과부하 4분 전에, 지쳤던 다리 다이얼을 ½바퀴 미리 조이기 */
function adviceMin(a) { return a.firstOver ? Math.max(5, a.firstMin - 4) : null; }
function advice(ses, a) {
  if (!a.firstOver) return t('지금 압박 그대로 유지');
  return t('다음엔 {m}분쯤 {side} ½바퀴 미리', { m: adviceMin(a), side: t(a.weak === 'L' ? '왼쪽' : '오른쪽') });
}

export default {
  id: 'Insight',
  render: (s, app, ses = app.sessionById(app.params.sid), a = ses && analyze(ses, s.settings.threshold)) => !ses ? '<div class="root"></div>' : `
<div class="root">
<div aria-hidden="true" style="position: absolute; left: -120px; top: -160px; width: 520px; height: 420px; border-radius: 50%; background: radial-gradient(closest-side, rgba(212,238,59,0.09), rgba(0,0,0,0))"></div>
${statusBar()}<div style="position: absolute; inset: 0; padding: 58px 20px 34px; display: flex; flex-direction: column; gap: 16px">

  <div style="display: flex; align-items: center; justify-content: space-between"><a href="#Summary" data-act="back" aria-label="${t("뒤로")}" style="width: 44px; height: 44px; flex: none; box-sizing: border-box; border-radius: 22px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12.5 4.5L7 10l5.5 5.5"/></svg></a><span style="font-size: 16px; font-weight: 700">${t("분석 · 회복 플랜")}</span><span data-act="ai" role="button" style="height: 44px; padding: 0 16px; box-sizing: border-box; border-radius: 15px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); color: #EDEDEB; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; flex: none">${t("계산 방법")}</span></div>

  <h1 style="margin: 4px 0 0; font-size: 30px; font-weight: 800; letter-spacing: -0.035em; line-height: 1.18">${t("종아리는")} <span style="color: ${STATUS_C[a.status]}">${t(a.status === "안정" ? "안정적." : a.status === "주의" ? "조금 지쳤어요." : "많이 지쳤어요.")}</span><br><span style="color: rgba(237,237,235,0.40)">${a.firstOver ? t("{side}은 {m}분부터 지쳤어요.", { side: t(a.weak === "L" ? "왼쪽" : "오른쪽"), m: a.firstMin }) : t("끝까지 기준선 아래였어요.")}</span></h1>
  <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px"><div style="height: 112px; box-sizing: border-box; border-radius: 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); color: #EDEDEB; padding: 12px 12px 14px; display: flex; flex-direction: column; justify-content: space-between; min-width: 0"><span style="display: flex; justify-content: space-between; align-items: center"><span style="width: 36px; height: 36px; border-radius: 18px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 15c2-6 6-9 12-10"/><path d="M12 4h4.5v4.5"/></svg></span><span style="font-size: 11.5px; font-weight: 600; color: rgba(237,237,235,0.62)">${t("좌우 디딤 차이")}</span></span><span style="display: flex; justify-content: space-between">${pair(a.weak, a.push.hi === 'L' ? a.push.ratio.toFixed(1) + '×' : '1.0×', a.push.hi === 'R' ? a.push.ratio.toFixed(1) + '×' : '1.0×')}</span></div><div style="height: 112px; box-sizing: border-box; border-radius: 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); color: #EDEDEB; padding: 12px 12px 14px; display: flex; flex-direction: column; justify-content: space-between; min-width: 0"><span style="display: flex; justify-content: space-between; align-items: center"><span style="width: 36px; height: 36px; border-radius: 18px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center"><svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#EDEDEB" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 2.5L4.5 11H10l-1 6.5L15.5 9H10z"/></svg></span><span style="font-size: 11.5px; font-weight: 600; color: rgba(237,237,235,0.62)">${t("최고 부하")}</span></span><span style="display: flex; justify-content: space-between">${pair(a.weak, a.peakL, a.peakR)}</span></div></div>

  <section data-act="advice" style="border-radius: 28px; background: linear-gradient(160deg, #E2F55E 0%, #C6E02C 55%, #9DB51C 100%); color: #0D0E0F; padding: 14px 16px 14px 14px; display: flex; gap: 14px; align-items: center">
    <img src="assets/img/dial-turn.jpg" alt="${t("다이얼")}" style="width: 56px; height: 56px; flex: none; border-radius: 28px; object-fit: cover; border: 3px solid rgba(13,14,15,0.15)">
    <span style="display: flex; flex-direction: column; gap: 2px"><span style="display: flex"><span role="img" aria-label="${t(a.weak === 'L' ? "왼쪽 다리" : "오른쪽 다리")}" style="display: inline-flex; gap: 3px; align-items: flex-end">${legs(a.weak, '#0D0E0F', 'rgba(13,14,15,0.2)')}</span></span><span style="font-size: 16px; font-weight: 800; line-height: 1.3">${advice(ses, a)}</span>${a.firstOver ? `<span style="font-size: 12px; font-weight: 600; color: rgba(13,14,15,0.62)">${t(s.settings.preAlert ? "다음 운동에 알림 켜짐 · 누르면 끄기" : "누르면 다음 운동 때 그 시간에 알려줘요")}</span>` : ""}</span>
  </section>

  <div style="display: flex; flex-direction: column; gap: 8px">
    <div style="display: flex; justify-content: space-between; align-items: baseline"><span style="font-size: 15px; font-weight: 700">${t("오늘 밤 회복")}</span><span style="font-size: 12px; font-weight: 500; color: rgba(237,237,235,0.62)">${t("{m}분", { m: a.planMin })}</span></div>
    <ol style="margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 8px">${a.plan.map((p, i) => `
      <li style="display: flex; align-items: center; gap: 12px; padding: 10px 14px 10px 10px; border-radius: 24px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.09); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px);"><span style="width: 44px; height: 44px; flex: none; border-radius: 22px; background: rgba(255,255,255,0.08); display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; font-variant-numeric: tabular-nums">${i + 1}</span><span style="flex: 1; display: flex; flex-direction: column; gap: 5px"><span style="font-size: 14.5px; font-weight: 700">${t(p.name)}</span><span style="display: flex; gap: 6px"><span style="height: 24px; padding: 0 9px; border-radius: 12px; background: rgba(255,255,255,0.08); font-size: 11px; font-weight: 500; color: rgba(237,237,235,0.62); display: flex; align-items: center">${t(p.sub)}</span>${p.key === 'raise' ? `<span style="height: 24px; padding: 0 9px; border-radius: 12px; background: rgba(255,255,255,0.08); display: flex; align-items: center"><span role="img" aria-label="${t(a.weak === 'L' ? '왼쪽 다리' : '오른쪽 다리')}" style="display: inline-flex; gap: 3px; align-items: flex-end">${legs(a.weak, AC, 'rgba(237,237,235,0.22)', 9, 14)}</span></span>` : ''}</span></span><span style="font-size: 15px; font-weight: 700; color: #D4EE3B; font-variant-numeric: tabular-nums">${fmt(p.sec)}</span></li>`).join('')}
    </ol>
  </div>

  <div style="margin-top: auto"><a href="#Main" data-act="recover" style="height: 56px; box-sizing: border-box; padding: 0 22px 0 6px; border-radius: 28px; background: #D4EE3B; color: #0D0E0F; display: flex; align-items: center; font-size: 16px; font-weight: 700"><span style="width: 44px; height: 44px; flex: none; border-radius: 22px; background: #0D0E0F; display: flex; align-items: center; justify-content: center"><svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#D4EE3B" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4.5l9 5.5-9 5.5z" fill="#D4EE3B"/></svg></span><span style="flex: 1; text-align: center; padding: 0 0px 0 0px">${t("회복 시작")}</span></a></div>

</div>
</div>
`,
  actions: {
    ai: (b, app) => app.sheet({ title: t('이렇게 계산했어요'), body: `<p>${t('1. 다이얼이 15초마다 왼쪽·오른쪽 종아리 부하(%)를 기록해요.')}</p><p>${t('2. 처음으로 경고 기준을 넘은 시간과 다리가 \'몇 분부터 지쳤는지\'예요.')}</p><p>${t('3. 운동 점수는 100점에서 시작해 최고 부하가 높을수록, 쥐·경고가 많을수록 깎여요. 75점 이상은 안정, 55점 이상은 주의, 그 아래는 위험이에요.')}</p><p>${t('4. 그래서 다음 운동엔 지쳤던 시간보다 4분 먼저 그 다리 다이얼을 ½바퀴 조이라고 권해요.')}</p>`, actions: [{ label: t('확인'), primary: true }] }),
    advice: (b, app) => {
      const ses = app.sessionById(app.params.sid), a = analyze(ses, app.s.settings.threshold);
      if (!a.firstOver) { app.toast(t('지금 압박 그대로 유지하면 돼요')); return; }
      const on = !app.s.settings.preAlert;
      app.store.set((s) => { s.settings.preAlert = on ? { min: adviceMin(a), side: a.weak } : null; });
      app.toast(t(on ? '다음 운동 {m}분에 알려드릴게요' : '미리 알림을 껐어요', { m: adviceMin(a) }));
      app.refresh();
    },
    recover: (b, app) => recovery(app),
  },
};

// 회복 루틴: 단계별 타이머 (데모 배속 적용)
function recovery(app) {
  const ses = app.sessionById(app.params.sid), a = analyze(ses, app.s.settings.threshold);
  const speed = app.s.settings.demoSpeed || 1;
  let i = 0, left = a.plan[0].sec, timer, paused = false;
  const body = () => `<div style="display:flex;flex-direction:column;align-items:center;gap:6px;padding:10px 0 4px">
    <span style="font-size:12px;color:rgba(237,237,235,0.62)">${t('{n} / {m} 단계', { n: i + 1, m: a.plan.length })}</span>
    <span style="font-size:22px;font-weight:700">${t(a.plan[i].name)}</span>
    <span style="font-size:13px;color:rgba(237,237,235,0.62)">${t(a.plan[i].sub)}</span>
    <span data-rt style="font-size:64px;font-weight:700;letter-spacing:-0.04em;font-variant-numeric:tabular-nums;color:#D4EE3B">${fmt(left)}</span>
    <div style="display:flex;gap:6px;width:100%">${a.plan.map((_, k) => `<span style="flex:1;height:4px;border-radius:2px;background:${k < i ? '#EDEDEB' : k === i ? AC : 'rgba(255,255,255,0.16)'}"></span>`).join('')}</div>
  </div>`;
  const draw = () => { const el = document.querySelector('.sheet .sheet-body'); if (el) el.innerHTML = body(); };
  const next = () => {
    i++;
    if (i >= a.plan.length) { clearInterval(timer); app.closeSheet(); app.vibrate([60, 60, 60]); app.toast(t('회복 루틴 완료 👏')); app.go('Main'); return false; }
    left = a.plan[i].sec; app.vibrate(80); draw(); return false;
  };
  app.sheet({
    title: t('회복 루틴'), body: body(),
    actions: [
      { label: t('다음 단계'), primary: true, onClick: next },
      { label: t('일시정지'), onClick: () => { paused = !paused; const pb = document.querySelector('.sheet [data-act="__a1"]'); if (pb) pb.textContent = t(paused ? '계속' : '일시정지'); return false; } },
      { label: t('그만하기'), onClick: () => { clearInterval(timer); } },
    ],
    onClose: () => clearInterval(timer),
  });
  timer = setInterval(() => {
    if (paused) return;
    left = Math.max(0, left - speed);
    const e = document.querySelector('.sheet [data-rt]'); if (!e) { clearInterval(timer); return; }
    e.textContent = fmt(left);
    if (left <= 0) next();
  }, 1000);
}
