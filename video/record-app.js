// 앱 시연 녹화: 실제 앱을 자동 조작하면서 CDP 스크린캐스트로 프레임을 받아 mp4로 만듦
// node video/record-app.js <outdir>   (앱은 http://localhost:8790 에서 서빙 중이어야 함)
// 화면 780×1688 (앱 기준 390폭의 2배) — 앱의 모바일 모드를 켜려고 standalone 표시 모드로 속임
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const out = process.argv[2] || 'video/out/app';
const BASE = process.env.BASE || 'http://localhost:8790/';
(async () => {
  fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 780, height: 1688 }, hasTouch: true, serviceWorkers: 'block' });
  await ctx.addInitScript(() => {
    const mm = window.matchMedia.bind(window);
    window.matchMedia = (q) => q.includes('standalone') ? { matches: true, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} } : mm(q);
    navigator.vibrate = () => true;
    // 누르는 자리 표시 (흰 동그라미)
    addEventListener('pointerdown', (e) => {
      const d = document.createElement('div');
      d.style.cssText = `position:fixed;left:${e.clientX - 34}px;top:${e.clientY - 34}px;width:68px;height:68px;border-radius:50%;background:rgba(255,255,255,.35);border:3px solid rgba(255,255,255,.9);z-index:99999;pointer-events:none;transition:transform .45s ease-out,opacity .45s ease-out`;
      document.documentElement.appendChild(d);
      requestAnimationFrame(() => { d.style.transform = 'scale(1.5)'; d.style.opacity = '0'; });
      setTimeout(() => d.remove(), 600);
    }, true);
  });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto(BASE + 'index.html');
  await p.evaluate(() => { localStorage.clear(); });
  await p.goto(BASE + 'index.html#Welcome'); await p.waitForTimeout(800);

  // 스크린캐스트 시작
  const cdp = await ctx.newCDPSession(p); const frames = [];
  cdp.on('Page.screencastFrame', async (f) => { frames.push({ ts: f.metadata.timestamp, data: f.data }); await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }).catch(() => {}); });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, everyNthFrame: 1 });
  const marks = []; const t0 = Date.now(); const mark = (name) => marks.push([name, (Date.now() - t0) / 1000]);

  const W = (ms) => p.waitForTimeout(ms);
  const tap = async (sel, w = 700) => { await p.locator('.screen.on ' + sel).last().click({ timeout: 4000 }).catch(() => errs.push('tap fail ' + sel)); await W(w); };
  const tapAny = async (sel, w = 700) => { await p.locator(sel).last().click({ timeout: 4000 }).catch(() => errs.push('tap fail ' + sel)); await W(w); };
  const scr = async (y, w = 600) => { await p.evaluate((y) => { const el = [...document.querySelectorAll('.screen.on *')].find((e) => e.scrollHeight > e.clientHeight + 40 && getComputedStyle(e).overflowY !== 'visible'); if (el) el.scrollBy({ top: y, behavior: 'smooth' }); }, y); await W(w); };

  mark('welcome'); await W(1400); await tap('[data-act=spin]', 1200);
  mark('connect'); await p.waitForFunction(() => { try { const s = JSON.parse(localStorage.getItem('degree-app-v1')); return s.sleeves.L.paired && s.sleeves.R.paired; } catch (e) { return false; } }, null, { timeout: 15000 }).catch(() => errs.push('pair timeout')); await W(700); await tap('[data-act=next]', 900);
  mark('fit'); for (let i = 0; i < 6; i++) { const ok = await p.locator('.screen.on [data-act=next]').count(); if (!ok || !(await p.evaluate(() => location.hash === '#Fit'))) break; await tap('[data-act=next]', i === 2 ? 3600 : 900); }
  mark('main'); await W(1600); await tap('a[href="#Select"]', 1000);
  mark('select'); await W(500); await tap('[data-act=pick][data-sport=futsal]', 1000);
  mark('setup'); await W(700); await tap('[data-act=go]', 1000);
  mark('camguide'); await W(900); await tap('[data-act=rec]', 1200);
  mark('camrec'); await W(2400); await tap('[data-act=close]', 1000);
  mark('live'); await W(2600); await tap('[data-act=loadInfo]', 900); await tapAny('.sheet button:has-text("데모")', 600);
  mark('alert'); await W(2200); await tap('[data-act=done]', 1200);
  mark('live2'); await W(1800); await tap('[data-act=end]', 800); await tapAny('.sheet button:has-text("분석")', 1200);
  mark('summary'); await W(1800); await scr(500, 1500); await tap('[data-act=clips]', 1500);
  mark('end'); await W(400);

  await cdp.send('Page.stopScreencast');
  // 프레임 → 30fps로 고르게 (각 프레임을 다음 프레임까지 유지)
  const fps = 30, T0 = frames[0].ts, dur = frames[frames.length - 1].ts - T0;
  let j = 0;
  for (let i = 0; i <= Math.floor(dur * fps); i++) {
    const t = T0 + i / fps; while (j + 1 < frames.length && frames[j + 1].ts <= t) j++;
    fs.writeFileSync(path.join(out, `f${String(i).padStart(5, '0')}.jpg`), Buffer.from(frames[j].data, 'base64'));
  }
  fs.writeFileSync(path.join(out, 'marks.json'), JSON.stringify({ marks, frames: frames.length, dur }, null, 1));
  console.log('frames', frames.length, 'dur', dur.toFixed(1), errs.length ? errs : 'no errors', 'hash', await p.evaluate(() => location.hash));
  console.log(marks.map((m) => m.join('@')).join(' '));
  await b.close();
})();
