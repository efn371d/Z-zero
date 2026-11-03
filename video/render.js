// node video/render.js <html> <outdir> [query] [fps] [onlyTimes,comma]
// 그래픽 HTML의 draw(t)를 프레임마다 호출해 PNG로 저장
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const [html, out, query = '', fps = '30', only = ''] = process.argv.slice(2);
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 1080 } });
  await p.goto((process.env.BASE || 'file://' + path.resolve('.') + '/') + html + '?render=1&' + query);
  await p.evaluate(() => window.READY || null);
  const dur = await p.evaluate(() => window.DUR);
  const times = only ? only.split(',').map(Number) : [...Array(Math.round(dur * fps) + 1).keys()].map(i => i / fps);
  for (let i = +(process.env.START || 0); i < times.length; i++) {
    const url = await p.evaluate(async ([t, jpg]) => { if (window.prep) await window.prep(t); draw(t); return document.getElementById('c').toDataURL(jpg ? 'image/jpeg' : 'image/png', 0.95); }, [times[i], !!process.env.JPG]);
    fs.writeFileSync(path.join(out, `f${String(i).padStart(4, '0')}.${process.env.JPG ? 'jpg' : 'png'}`), Buffer.from(url.split(',')[1], 'base64'));
  }
  await b.close();
})();
