// 공용 UI 조각: 번역(t), 상태바, 하단 탭, 아이콘, 숫자 포맷
import en from './lang-en.js';
import { store } from './store.js';

export const AC = '#D4EE3B';      // 라임 포인트
export const BG = '#0D0E0F';      // 배경
export const FG = '#EDEDEB';      // 글자
export const T2 = 'rgba(237,237,235,0.62)';
export const WARN = '#F0803A';    // 경고 주황

/** 번역. 키는 한국어 원문. "{n}" 같은 자리표시는 vars로 채움. 키 끝의 "@화면"은 구분용. */
export function t(key, vars) {
  const lang = store.get().settings.lang;
  let s = lang === 'en' ? (en[key] ?? key.split('@')[0]) : key.split('@')[0];
  if (vars) for (const k in vars) s = s.split('{' + k + '}').join(vars[k]);
  return s;
}
export const lang = () => store.get().settings.lang;

export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

/** 초 → "m:ss" (1시간 넘으면 "h:mm:ss") */
export function fmt(sec) {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0');
}

/** 상태바 — 실제 폰(앱 모드)에서는 CSS로 숨김. 시간은 실제 시각 */
export function statusBar() {
  const d = new Date();
  const time = d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
  return `<div class="statusbar" style="position: absolute; left: 0; right: 0; top: 0; height: 50px; padding: 0 30px; box-sizing: border-box; display: flex; justify-content: space-between; align-items: center; font-size: 15px; font-weight: 700; z-index: 5">
  <span style="font-variant-numeric: tabular-nums" data-clock>${time}</span>
  <span aria-hidden="true" style="display: flex; gap: 6px; align-items: center"><svg width="17" height="11" viewBox="0 0 17 11"><rect x="0" y="7" width="3" height="4" rx="1" fill="#EDEDEB"></rect><rect x="4.5" y="5" width="3" height="6" rx="1" fill="#EDEDEB"></rect><rect x="9" y="2.5" width="3" height="8.5" rx="1" fill="#EDEDEB"></rect><rect x="13.5" y="0" width="3" height="11" rx="1" fill="#EDEDEB"></rect></svg><svg width="15" height="11" viewBox="0 0 15 11"><path d="M7.5 10.5l2.2-2.6a3 3 0 00-4.4 0z" fill="#EDEDEB"></path><path d="M3.6 6.2a5.6 5.6 0 017.8 0" fill="none" stroke="#EDEDEB" stroke-width="1.5" stroke-linecap="round"></path><path d="M1.2 3.6a9 9 0 0112.6 0" fill="none" stroke="#EDEDEB" stroke-width="1.5" stroke-linecap="round"></path></svg><svg width="25" height="12" viewBox="0 0 25 12"><rect x="0.5" y="0.5" width="21" height="11" rx="3" fill="none" stroke="#EDEDEB" stroke-opacity="0.4"></rect><rect x="2" y="2" width="16" height="8" rx="1.8" fill="#EDEDEB"></rect><rect x="23" y="4" width="1.6" height="4" rx="0.8" fill="#EDEDEB" fill-opacity="0.4"></rect></svg></span>
</div>`;
}

const TABS = [
  { id: 'Main', label: '오늘', icon: (c) => `<path d="M3.5 9.5L10 4l6.5 5.5V16a1 1 0 01-1 1H12v-4.5H8V17H4.5a1 1 0 01-1-1z"/>` },
  { id: 'Select', label: '운동', icon: (c) => `<circle cx="10" cy="10" r="7.2"/><path d="M8.5 7l4.5 3-4.5 3z" fill="${c}"/>` },
  { id: 'History', label: '기록', icon: (c) => `<path d="M4 16.5V11M8 16.5V4.5M12 16.5V8.5M16 16.5V12"/>` },
  { id: 'Settings', label: '설정', icon: (c) => `<circle cx="10" cy="10" r="2.6"/><path d="M10 2.8v2M10 15.2v2M2.8 10h2M15.2 10h2M4.9 4.9l1.4 1.4M13.7 13.7l1.4 1.4M4.9 15.1l1.4-1.4M13.7 6.3l1.4-1.4"/>` },
];
const TAB_OF = { Main: 'Main', Select: 'Select', Summary: 'History', History: 'History', Settings: 'Settings' };

/** 하단 탭바. screenId에 맞는 탭이 켜짐 */
export function tabBar(screenId) {
  const active = TAB_OF[screenId];
  return `<nav aria-label="${t('탭')}" class="tabbar" style="position: absolute; left: 42px; right: 42px; bottom: 24px; height: 66px; box-sizing: border-box; padding: 0 8px; border-radius: 33px; background: #EDEDEB; box-shadow: 0 12px 30px rgba(0,0,0,0.45); display: flex; justify-content: space-between; align-items: center; z-index: 6">
  ${TABS.map((tb) => {
    const on = tb.id === active, c = on ? AC : '#5E6163';
    return `<a href="#${tb.id}"${on ? ' aria-current="page"' : ''} aria-label="${t(tb.label)}" style="width: 50px; height: 50px;${on ? ' border-radius: 25px; background: #0D0E0F;' : ''} display: flex; align-items: center; justify-content: center"><svg width="22" height="22" viewBox="0 0 20 20" fill="none" stroke="${c}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${tb.icon(c)}</svg></a>`;
  }).join('')}
</nav>`;
}

/** 다리 아이콘 (side: 'L' | 'R'), 원본 디자인의 종아리 실루엣 */
export function legIcon(side, color = FG, w = 12.8, h = 20) {
  const flip = side === 'L' ? ' transform="translate(16,0) scale(-1,1)"' : '';
  return `<svg width="${w}" height="${h}" viewBox="0 0 16 25" aria-hidden="true"><g${flip}><path d="M2.6 1h7.2l.4 7.2-.5 7.6.6 3.1 4.6 1.9c.9.4 1 1.9.1 2.4l-.5.3H4.2c-.8 0-1.3-.6-1.2-1.4l.6-3.4C1.8 14.6.9 10.4 1.6 6.4z" fill="${color}"></path></g></svg>`;
}

/** 공용 버튼 스타일 (시트·대화상자용) */
export const btnPrimary = 'height: 56px; width: 100%; border: 0; border-radius: 28px; background: #D4EE3B; color: #0D0E0F; font: 700 16px/1 \'Wanted Sans\', system-ui, sans-serif; cursor: pointer';
export const btnGhost = 'height: 56px; width: 100%; border: 1px solid rgba(255,255,255,0.12); border-radius: 28px; background: rgba(255,255,255,0.05); color: #EDEDEB; font: 600 16px/1 \'Wanted Sans\', system-ui, sans-serif; cursor: pointer';

/** 선택지 칩 (시트 안에서 사용) */
export function choiceList(name, options, value) {
  return `<div style="display: flex; flex-direction: column; gap: 8px">${options.map((o) => {
    const on = String(o.value) === String(value);
    return `<button type="button" data-act="${name}" data-v="${esc(o.value)}" style="height: 54px; padding: 0 18px; border-radius: 18px; border: 1px solid ${on ? AC : 'rgba(255,255,255,0.09)'}; background: ${on ? 'rgba(212,238,59,0.12)' : 'rgba(255,255,255,0.05)'}; color: ${on ? AC : FG}; font: 600 15px/1 'Wanted Sans', system-ui, sans-serif; display: flex; align-items: center; justify-content: space-between; cursor: pointer"><span>${o.label}</span>${on ? `<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="${AC}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 10.5l3.5 3.5 7.5-8"/></svg>` : ''}</button>`;
  }).join('')}</div>`;
}

/** 슬리브 일러스트 (연결·시작 화면). on=false면 다이얼 표시가 회색 */
export function sleeveSvg(side, { w = 125, h = 250, id = 'sv' + side, opacity = 1, on = true, label = '' } = {}) {
  const shape = 'M16 6 H46 C47.5 18 51 28 51.5 42 C52 58 45 74 41.5 88 L40.5 100 C40 103 37.5 104 31 104 C24.5 104 22 103 21.5 100 L20.5 88 C17 74 11.5 58 12 42 C12.5 28 14.5 18 16 6 Z';
  const lines = Array.from({ length: 24 }, (_, i) => `<line x1="${14 + i * 4}" y1="0" x2="${-16 + i * 4}" y2="128" stroke="#55595E" stroke-width="0.8"></line>`).join('');
  return `<svg width="${w}" height="${h}" viewBox="0 0 64 128" role="img" aria-label="${label}" style="opacity: ${opacity}; transition: opacity .6s"><defs><clipPath id="c${id}"><path d="${shape}"></path></clipPath></defs><g${side === 'L' ? ' transform="translate(64,0) scale(-1,1)"' : ''}>
<path d="${shape}" fill="#2B2D30"></path>
<g clip-path="url(#c${id})">
<rect x="0" y="6" width="64" height="9" fill="#1F2123"></rect>
<path d="M0 62 L64 30 L64 58 L0 90 Z" fill="#45484C"></path>
<g clip-path="url(#c${id})" opacity="0.5"><clipPath id="p${id}"><path d="M0 62 L64 30 L64 58 L0 90 Z"></path></clipPath><g clip-path="url(#p${id})">${lines}</g></g>
<path d="M0 62 L64 30" stroke="#8C9096" stroke-width="1.4"></path>
<path d="M0 90 L64 58" stroke="#8C9096" stroke-width="1.4"></path>
<path d="M39 31 L37 96" stroke="#3D4044" stroke-width="1.2"></path>
</g>
<path d="M23.5 101 C23.5 112 27 119 31 119 C35 119 38.5 112 38.5 101" fill="none" stroke="#2B2D30" stroke-width="5" stroke-linecap="round"></path>
<circle cx="39" cy="24" r="8.5" fill="#141517" stroke="#55595E" stroke-width="1.6"></circle>
<path d="M39 17.5 V22.5" stroke="${on ? AC : '#6B6F74'}" stroke-width="2" stroke-linecap="round"></path>
<circle cx="39" cy="29" r="1.3" fill="#55595E"></circle>
</g></svg>`;
}

/** 브랜드 서체 (Teko) — 로고 글자와 큰 숫자에 사용 */
export const DISPLAY = "'Zero Display', 'Wanted Sans', system-ui, sans-serif";

/** Z-zero 로고 (사선으로 잘린 Z 마크). 원본 로고 이미지를 따라 그린 도형 */
export function logoSvg(h = 64, color = AC) {
  const w = (h * 170) / 250;
  return `<svg width="${w.toFixed(1)}" height="${h}" viewBox="0 0 170 250" role="img" aria-label="Z-zero"><path fill="${color}" d="M0 0V158L41 116V43H128L0 172V250H170V83L126 127V207H42L170 70V0Z"/></svg>`;
}

/** 로고 + 글자 (가로형) */
export function wordmark(size = 40, color = '#EDEDEB') {
  return `<span style="display: inline-flex; align-items: center; gap: ${Math.round(size * 0.32)}px">${logoSvg(size * 1.05)}<span style="font-family: ${DISPLAY}; font-weight: 700; font-size: ${size * 1.25}px; line-height: 0.8; letter-spacing: 0.06em; color: ${color}; padding-top: ${Math.round(size * 0.12)}px">Z-ZERO</span></span>`;
}

/** 카메라 클립 영상: 클립 종류(label) → 영상·썸네일 */
const CLIP_MEDIA = {
  '턴': 'clip-cut', '급정지': 'clip-stop', '착지': 'clip-landing',
  '인사이드 터치': 'clip-inside', '아웃사이드 터치': 'clip-outside', '킥': 'clip-kick',
};
export function clipMedia(label) {
  const n = CLIP_MEDIA[label] || 'clip-inside';
  return { video: `assets/video/${n}.mp4`, poster: `assets/video/${n}.jpg` };
}

/** 자동재생 반복 영상 (소리 없음) */
export const loopVideo = (name, style = '', extra = '') =>
  `<video src="assets/video/${name}.mp4" poster="assets/video/${name}.jpg" autoplay muted loop playsinline preload="auto" ${extra} style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; ${style}"></video>`;
