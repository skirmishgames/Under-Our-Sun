// Survivor log: a roguelike save card for tracking one character between missions.
// Card is 135 x 100 mm, four to a landscape Letter or A4 page.
import { ensureFonts, roundRect, hexagon } from './render.js?v=8d016490';
import { drawPreset } from './art.js?v=8d016490';
import { ICON_TOKENS } from './data/schema.js?v=8d016490';
import { PAPERS } from './print.js?v=8d016490';

export const SHEET_W = 135;
export const SHEET_H = 100;
const FONT = '"Barlow Condensed", "Arial Narrow", sans-serif';
const RUST = '#8a3b1c';
const INK = '#2a211b';

export const SHEET_TEXT = {
  en: {
    title: 'SURVIVOR LOG', subtitle: 'Under Our Sun · roguelike mode',
    character: 'CHARACTER', player: 'PLAYER', hp: 'HP', water: 'WATER', points: 'POINTS',
    conditions: 'CONDITIONS', dice: 'DICE UPGRADES', diceHint: 'skill, then mark the colour',
    item: 'ITEM', gear: 'GEAR', items: 'ITEMS / RESOURCES',
    missions: 'MISSIONS PLAYED', notes: 'NOTES', footer: 'Fan-made sheet for Under Our Sun'
  },
  de: {
    title: 'ÜBERLEBENDEN-LOGBUCH', subtitle: 'Under Our Sun · Roguelike-Modus',
    character: 'CHARAKTER', player: 'SPIELER', hp: 'HP', water: 'WASSER', points: 'PUNKTE',
    conditions: 'ZUSTÄNDE', dice: 'WÜRFEL-UPGRADES', diceHint: 'Fertigkeit, dann Farbe ankreuzen',
    item: 'GEGENSTAND', gear: 'AUSRÜSTUNG', items: 'GEGENSTÄNDE / RESSOURCEN',
    missions: 'GESPIELTE MISSIONEN', notes: 'NOTIZEN', footer: 'Fan-made Bogen für Under Our Sun'
  }
};

function star(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const rr = i % 2 ? r * 0.45 : r;
    const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  ctx.closePath();
}

/**
 * opts: { lang: 'en'|'de', scale: px per mm, preset, inkSaver, rounded, canvas }
 */
export async function renderSheet(opts = {}) {
  await ensureFonts();
  const T = SHEET_TEXT[opts.lang] || SHEET_TEXT.en;
  const s = opts.scale || 10, W = SHEET_W, H = SHEET_H;
  const c = opts.canvas || document.createElement('canvas');
  c.width = Math.round(W * s); c.height = Math.round(H * s);
  const ctx = c.getContext('2d');
  const m = v => v * s;
  ctx.save();
  if (opts.rounded) { roundRect(ctx, 0, 0, m(W), m(H), m(3)); ctx.clip(); }
  ctx.fillStyle = opts.inkSaver ? '#ffffff' : '#faf4ea';
  ctx.fillRect(0, 0, m(W), m(H));

  // header band
  const HB = 15;
  if (!opts.inkSaver) {
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 0, m(W), m(HB)); ctx.clip();
    drawPreset(ctx, opts.preset || 'dunes', m(W), m(HB * 1.75), 'sheet');
    const g = ctx.createLinearGradient(0, 0, m(W), 0);
    g.addColorStop(0, 'rgba(20,12,8,0.72)'); g.addColorStop(0.6, 'rgba(20,12,8,0.2)'); g.addColorStop(1, 'rgba(20,12,8,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, m(W), m(HB));
    ctx.restore();
    ctx.fillStyle = RUST; ctx.fillRect(0, m(HB), m(W), m(0.6));
  } else {
    ctx.fillStyle = RUST; ctx.fillRect(m(5), m(HB - 0.5), m(W - 10), m(0.35));
  }
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = opts.inkSaver ? RUST : '#f6e7c9';
  ctx.font = `700 ${m(5.6)}px ${FONT}`;
  ctx.fillText(T.title, m(6), m(8.4));
  ctx.font = `italic 400 ${m(2.7)}px ${FONT}`;
  ctx.fillStyle = opts.inkSaver ? INK : 'rgba(246,231,201,0.92)';
  ctx.fillText(T.subtitle, m(6.1), m(12.2));
  // hex badge, right
  hexagon(ctx, m(W - 10), m(HB / 2), m(5));
  ctx.fillStyle = opts.inkSaver ? '#ffffff' : 'rgba(250,244,234,0.92)'; ctx.fill();
  ctx.lineWidth = m(0.35); ctx.strokeStyle = RUST; ctx.stroke();
  ctx.fillStyle = RUST; star(ctx, m(W - 10), m(HB / 2 + 0.2), m(2.6)); ctx.fill();

  const label = (txt, x, y, w, align = 'left') => {
    ctx.font = `600 ${m(2.25)}px ${FONT}`;
    ctx.fillStyle = RUST;
    ctx.textAlign = align;
    let size = 2.25;
    while (ctx.measureText(txt).width > m(w) && size > 1.5) { size -= 0.1; ctx.font = `600 ${m(size)}px ${FONT}`; }
    ctx.fillText(txt, align === 'right' ? m(x + w) : m(x), m(y));
    ctx.textAlign = 'left';
  };
  const box = (x, y, w, h) => {
    roundRect(ctx, m(x), m(y), m(w), m(h), m(1));
    ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.lineWidth = m(0.25); ctx.strokeStyle = '#b39477'; ctx.stroke();
  };
  const field = (txt, x, y, w, h = 7) => { label(txt, x + 0.3, y, w); box(x, y + 1.2, w, h); };

  // column A
  const ax = 6, aw = 40;
  field(T.character, ax, 19.2, aw);
  field(T.player, ax, 30.2, aw);
  const mw = 12.4, mg = (aw - mw * 3) / 2;
  field(T.hp, ax, 41.2, mw);
  field(T.water, ax + mw + mg, 41.2, mw);
  // points with star
  const px = ax + (mw + mg) * 2;
  ctx.fillStyle = RUST; star(ctx, m(px + 1.3), m(40.4), m(1.25)); ctx.fill();
  label(T.points, px + 3, 41.2, mw - 3);
  box(px, 42.4, mw, 7);
  field(T.conditions, ax, 52.2, aw);
  box(ax, 61.2, aw, 7);

  // column B: dice upgrades
  const bx = 50, bw = 43;
  label(T.dice, bx + 0.3, 19.2, 22);
  ctx.font = `italic 400 ${m(2)}px ${FONT}`; ctx.fillStyle = INK; ctx.textAlign = 'right';
  ctx.fillText(T.diceHint, m(bx + bw), m(19.2)); ctx.textAlign = 'left';
  const dice = ['green', 'yellow', 'blue', 'red'];
  for (let r = 0; r < 6; r++) {
    const y = 20.4 + r * 8.1;
    box(bx, y, 24, 7);
    dice.forEach((d, k) => {
      const cx = bx + 27.6 + k * 4.75, cy = y + 3.5;
      hexagon(ctx, m(cx), m(cy), m(2.15));
      ctx.fillStyle = '#ffffff'; ctx.fill();
      ctx.lineWidth = m(0.55); ctx.strokeStyle = ICON_TOKENS[d].colour; ctx.stroke();
    });
  }

  // column C
  const cx0 = 97, cw = 32;
  field(T.item, cx0, 19.2, cw);
  field(T.gear, cx0, 30.2, cw);
  label(T.items, cx0 + 0.3, 41.2, cw);
  for (let r = 0; r < 3; r++) box(cx0, 42.4 + r * 8.2, cw, 7);

  // missions played
  label(T.missions, ax + 0.3, 73.4, 60);
  const n = 8, gap = 1.6, mwid = (W - 12 - gap * (n - 1)) / n;
  for (let i = 0; i < n; i++) {
    const x = ax + i * (mwid + gap);
    box(x, 74.6, mwid, 8);
    ctx.lineWidth = m(0.25); ctx.strokeStyle = '#b39477';
    ctx.beginPath(); ctx.arc(m(x + mwid - 2), m(76.6), m(1.1), 0, Math.PI * 2); ctx.stroke();
  }
  // notes
  label(T.notes, ax + 0.3, 86.2, 30);
  box(ax, 87.4, W - 12, 6.4);

  // footer and border
  ctx.font = `400 ${m(1.9)}px ${FONT}`; ctx.fillStyle = '#8c7a6a'; ctx.textAlign = 'right';
  ctx.fillText(T.footer, m(W - 6), m(97.3)); ctx.textAlign = 'left';
  roundRect(ctx, m(2), m(2), m(W - 4), m(H - 4), m(2.2));
  ctx.lineWidth = m(0.3); ctx.strokeStyle = opts.inkSaver ? '#b39477' : 'rgba(138,59,28,0.55)'; ctx.stroke();
  ctx.restore();
  return c;
}

export function sheetLayout(paperKey) {
  const p = PAPERS[paperKey] || PAPERS.letter;
  const pw = p.h, ph = p.w; // landscape
  const cols = 2, rows = 2;
  return { pw, ph, cols, rows, ox: (pw - cols * SHEET_W) / 2, oy: (ph - rows * SHEET_H) / 2 };
}

export async function buildSheetPdf(opts) {
  const { jsPDF } = window.jspdf;
  const L = sheetLayout(opts.paper);
  const doc = new jsPDF({ unit: 'mm', format: [L.pw, L.ph], orientation: 'landscape', compress: true });
  const pages = Math.max(1, Math.min(10, +opts.pages || 1));
  const img = (await renderSheet(Object.assign({}, opts, { scale: 12 }))).toDataURL('image/jpeg', 0.92);
  for (let pg = 0; pg < pages; pg++) {
    if (pg) doc.addPage([L.pw, L.ph], 'landscape');
    for (let r = 0; r < L.rows; r++) for (let c = 0; c < L.cols; c++) {
      doc.addImage(img, 'JPEG', L.ox + c * SHEET_W, L.oy + r * SHEET_H, SHEET_W, SHEET_H, 'sheet', 'FAST');
    }
    if (opts.marks) {
      doc.setDrawColor(90); doc.setLineWidth(0.15);
      const xs = [0, 1, 2].map(i => L.ox + i * SHEET_W), ys = [0, 1, 2].map(i => L.oy + i * SHEET_H);
      const len = 4, off = 1;
      for (const x of xs) {
        if (L.oy - off > 2) doc.line(x, L.oy - off, x, Math.max(1, L.oy - off - len));
        const b = L.oy + 2 * SHEET_H;
        if (L.ph - b - off > 2) doc.line(x, b + off, x, Math.min(L.ph - 1, b + off + len));
      }
      for (const y of ys) {
        if (L.ox - off > 2) doc.line(L.ox - off, y, Math.max(1, L.ox - off - len), y);
        const rgt = L.ox + 2 * SHEET_W;
        if (L.pw - rgt - off > 2) doc.line(rgt + off, y, Math.min(L.pw - 1, rgt + off + len), y);
      }
    }
  }
  return doc;
}
