// Canvas card renderer. All positions are in millimetres.
// Front: 70 x 120 mm portrait. Back: 120 x 70 mm landscape.
import { DIFFICULTY, MODES, BLOCK_KINDS, ICON_TOKENS, missionName, headerLabel, partLabel, partTotal } from './data/schema.js?v=c2055bae';
import { drawPreset, loadImage, drawCover } from './art.js?v=c2055bae';

export const CARD_W = 70;
export const CARD_H = 120;
const PT = 0.3528; // mm per point
const BODY_FONT = '"Barlow Condensed", "Arial Narrow", sans-serif';
const HEAD_FONT = '"Barlow Condensed", "Arial Narrow", sans-serif';
const INK = '#231a14';
const SAND = '#f2e4c8';
const RUST = '#8a3b1c';

let fontsReady = null;
export function ensureFonts() {
  if (!fontsReady) {
    const base = new URL('../assets/fonts/', import.meta.url).href;
    const faces = [
      ['400', 'normal', 'barlow-condensed-latin-400-normal.woff2'],
      ['400', 'italic', 'barlow-condensed-latin-400-italic.woff2'],
      ['600', 'normal', 'barlow-condensed-latin-600-normal.woff2'],
      ['700', 'normal', 'barlow-condensed-latin-700-normal.woff2']
    ].map(([weight, style, file]) => new FontFace('Barlow Condensed', `url(${base}${file})`, { weight, style }));
    fontsReady = Promise.all(faces.map(f => f.load().then(ff => document.fonts.add(ff)).catch(() => null)));
  }
  return fontsReady;
}

// ---------- markup ----------

// Expand {mission} and split each line into styled runs and icons.
export function parseMarkup(text, mission) {
  const src = String(text || '').replace(/\{mission\}/gi, missionName(mission)).replace(/\r/g, '')
    .replace(/\bPart (\d+) ([A-Z])\b/g, 'Part $1\u00a0$2'); // keep "Part 5 A" on one line
  return src.split('\n').map(raw => {
    const bullet = /^\s*[-•*]\s+/.test(raw);
    const line = bullet ? raw.replace(/^\s*[-•*]\s+/, '') : raw;
    const runs = [];
    const re = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\{[a-z0-9]+\})/gi;
    let last = 0, mm;
    const push = (str, bold, italic) => { if (str) runs.push({ type: 'text', str, bold, italic }); };
    while ((mm = re.exec(line))) {
      push(line.slice(last, mm.index), false, false);
      const t = mm[0];
      if (t.startsWith('**')) push(t.slice(2, -2), true, false);
      else if (t.startsWith('{')) {
        const name = t.slice(1, -1).toLowerCase();
        if (ICON_TOKENS[name]) runs.push({ type: 'icon', name });
        else push(t, false, false);
      } else push(t.slice(1, -1), false, true);
      last = re.lastIndex;
    }
    push(line.slice(last), false, false);
    return { bullet, blank: !raw.trim(), runs };
  });
}

function fontFor(run, size, weightOverride) {
  const weight = weightOverride || (run.bold ? 700 : 400);
  return `${run.italic ? 'italic ' : ''}${weight} ${size}px ${BODY_FONT}`;
}

// Break parsed lines into rows that fit a width. Returns rows and total height (px).
function layout(ctx, lines, width, size, opts = {}) {
  const lh = size * 1.17;
  const bulletIndent = size * 0.9;
  const rows = [];
  for (const line of lines) {
    if (line.blank) { rows.push({ items: [], gap: true, h: lh * 0.45 }); continue; }
    const indent = line.bullet ? bulletIndent : 0;
    const avail = width - indent;
    // tokens: words with trailing spaces, and icons
    const tokens = [];
    for (const run of line.runs) {
      if (run.type === 'icon') { tokens.push({ type: 'icon', name: run.name, w: size * 1.05 }); continue; }
      const parts = run.str.split(/([ \t]+)/).filter(s => s !== '');
      for (const p of parts) {
        ctx.font = fontFor(run, size, opts.weight);
        tokens.push({ type: 'text', str: p, bold: run.bold, italic: run.italic, space: /^[ \t]+$/.test(p), w: ctx.measureText(p).width });
      }
    }
    let cur = [], curW = 0, first = true;
    const flush = () => {
      while (cur.length && cur[cur.length - 1].space) curW -= cur.pop().w;
      rows.push({ items: cur, w: curW, indent, bullet: line.bullet && first, h: lh });
      first = false; cur = []; curW = 0;
    };
    for (const t of tokens) {
      if (t.space && !cur.length) continue;
      if (curW + t.w > avail && cur.length) flush();
      if (t.space && !cur.length) continue;
      // very long word: let it overflow its own row
      cur.push(t); curW += t.w;
    }
    flush();
  }
  const h = rows.reduce((a, r) => a + r.h, 0);
  return { rows, h, size };
}

function drawRows(ctx, lay, x, y, width, align, colour, opts = {}) {
  const { size } = lay;
  ctx.textBaseline = 'alphabetic';
  let cy = y;
  for (const row of lay.rows) {
    if (row.gap) { cy += row.h; continue; }
    const base = cy + size * 0.88;
    let cx = x + row.indent;
    // Bulleted lines stay left-aligned even in centred panels, so lists read cleanly.
    if (align === 'center' && !row.indent) cx = x + (width - row.w) / 2;
    if (row.bullet) {
      ctx.fillStyle = colour;
      ctx.beginPath();
      ctx.arc(x + size * 0.35, base - size * 0.3, size * 0.13, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const it of row.items) {
      if (it.type === 'icon') drawIcon(ctx, it.name, cx + size * 0.05, base - size * 0.78, size * 0.92);
      else if (!it.space || true) {
        ctx.font = fontFor(it, size, opts.weight);
        ctx.fillStyle = colour;
        ctx.fillText(it.str, cx, base);
      }
      cx += it.w;
    }
    cy += row.h;
  }
}

// ---------- icons ----------

function successMark(ctx, cx, cy, r, colour = '#fff') {
  ctx.save();
  ctx.strokeStyle = colour; ctx.lineWidth = r * 0.32; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(cx - r * 1.05, cy + r * 0.6); ctx.lineTo(cx + r * 1.05, cy - r * 0.6); ctx.stroke();
  ctx.restore();
}

export function drawIcon(ctx, name, x, y, s) {
  const def = ICON_TOKENS[name];
  if (!def) return;
  ctx.save();
  ctx.lineWidth = Math.max(1, s * 0.07);
  ctx.strokeStyle = 'rgba(0,0,0,0.65)';
  ctx.fillStyle = def.colour;
  const cx = x + s / 2, cy = y + s / 2;
  if (def.kind === 'die') {
    hexagon(ctx, cx, cy, s * 0.5);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.beginPath(); ctx.moveTo(cx, cy - s * 0.42); ctx.lineTo(cx + s * 0.34, cy - s * 0.2); ctx.lineTo(cx, cy); ctx.lineTo(cx - s * 0.34, cy - s * 0.2); ctx.closePath(); ctx.fill();
    if (name === 'red') {
      ctx.strokeStyle = '#fff'; ctx.lineWidth = s * 0.1; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(cx - s * 0.15, cy - s * 0.12); ctx.lineTo(cx + s * 0.15, cy + s * 0.18);
      ctx.moveTo(cx + s * 0.15, cy - s * 0.12); ctx.lineTo(cx - s * 0.15, cy + s * 0.18); ctx.stroke();
    } else successMark(ctx, cx, cy + s * 0.03, s * 0.17);
  } else if (def.kind === 'success' || def.kind === 'double') {
    ctx.beginPath(); ctx.arc(cx, cy, s * 0.47, 0, Math.PI * 2); ctx.fill();
    if (def.kind === 'success') successMark(ctx, cx, cy, s * 0.24);
    else { successMark(ctx, cx, cy - s * 0.17, s * 0.15); successMark(ctx, cx, cy + s * 0.17, s * 0.15); }
  } else if (def.kind === 'fail') {
    hexagon(ctx, cx, cy, s * 0.5); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = s * 0.12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - s * 0.17, cy - s * 0.17); ctx.lineTo(cx + s * 0.17, cy + s * 0.17);
    ctx.moveTo(cx + s * 0.17, cy - s * 0.17); ctx.lineTo(cx - s * 0.17, cy + s * 0.17); ctx.stroke();
  } else if (def.kind === 'd8') {
    hexagon(ctx, cx, cy, s * 0.5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#f2e66a'; ctx.font = `700 ${s * 0.58}px ${HEAD_FONT}`; ctx.textAlign = 'center';
    ctx.fillText('8', cx, cy + s * 0.2);
  } else if (def.kind === 'enemy') {
    ctx.beginPath();
    ctx.moveTo(x + s * 0.25, y + s * 0.12); ctx.lineTo(x + s * 0.75, y + s * 0.12); ctx.lineTo(x + s, cy);
    ctx.lineTo(x + s * 0.75, y + s * 0.88); ctx.lineTo(x + s * 0.25, y + s * 0.88); ctx.lineTo(x, cy); ctx.closePath();
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = `700 ${s * 0.62}px ${HEAD_FONT}`; ctx.textAlign = 'center';
    ctx.fillText('!', cx, cy + s * 0.22);
  } else if (def.kind === 'injury') {
    ctx.beginPath(); ctx.arc(cx, cy, s * 0.46, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = s * 0.13; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(cx - s * 0.18, cy - s * 0.18); ctx.lineTo(cx + s * 0.18, cy + s * 0.18);
    ctx.moveTo(cx + s * 0.18, cy - s * 0.18); ctx.lineTo(cx - s * 0.18, cy + s * 0.18); ctx.stroke();
  } else if (def.kind === 'infection') {
    ctx.beginPath(); ctx.arc(cx, cy, s * 0.46, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff';
    for (let i = 0; i < 3; i++) {
      const a = -Math.PI / 2 + i * 2 * Math.PI / 3;
      ctx.beginPath(); ctx.arc(cx + Math.cos(a) * s * 0.17, cy + Math.sin(a) * s * 0.17, s * 0.12, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = def.colour; ctx.beginPath(); ctx.arc(cx, cy, s * 0.07, 0, Math.PI * 2); ctx.fill();
  } else if (def.kind === 'karma') {
    ctx.beginPath(); ctx.rect(x + s * 0.08, y + s * 0.08, s * 0.84, s * 0.84); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.font = `700 ${s * 0.7}px ${HEAD_FONT}`; ctx.textAlign = 'center';
    ctx.fillText('K', cx, y + s * 0.76);
  } else if (def.kind === 'drop') {
    ctx.beginPath();
    ctx.moveTo(cx, y + s * 0.05);
    ctx.bezierCurveTo(x + s * 0.95, y + s * 0.55, x + s * 0.8, y + s, cx, y + s * 0.95);
    ctx.bezierCurveTo(x + s * 0.2, y + s, x + s * 0.05, y + s * 0.55, cx, y + s * 0.05);
    ctx.fill(); ctx.stroke();
  } else if (def.kind === 'cube') {
    const p = s * 0.12;
    ctx.beginPath(); ctx.rect(x + p, y + p * 1.6, s - p * 2.6, s - p * 2.6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.moveTo(x + p, y + p * 1.6); ctx.lineTo(x + p * 2, y + p * 0.6); ctx.lineTo(x + s - p * 0.6, y + p * 0.6); ctx.lineTo(x + s - p * 1.6, y + p * 1.6); ctx.closePath();
    ctx.fill(); ctx.stroke();
  } else if (def.kind === 'star') {
    ctx.beginPath(); ctx.arc(cx, cy, s * 0.47, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
    ctx.fillStyle = def.colour; ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? s * 0.15 : s * 0.34; ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); }
    ctx.closePath(); ctx.fill();
  } else if (def.kind === 'tag') {
    roundRect(ctx, x, y + s * 0.12, s * 1.0, s * 0.76, s * 0.18); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = `700 ${s * 0.5}px ${HEAD_FONT}`; ctx.textAlign = 'center';
    ctx.fillText(def.text, cx, y + s * 0.68);
  }
  ctx.restore();
}

// ---------- shapes ----------

export function roundRect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function hexagon(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 6 + (Math.PI / 3) * i;
    const px = cx + r * Math.cos(a), py = cy + r * Math.sin(a);
    i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
  }
  ctx.closePath();
}

// Banner with notched ends, used for pill labels.
function banner(ctx, x, y, w, h) {
  const n = h * 0.45;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w - n, y + h / 2);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + n, y + h / 2);
  ctx.closePath();
}

function fitText(ctx, str, font, maxW, startPx, minPx) {
  let size = startPx;
  ctx.font = font(size);
  while (ctx.measureText(str).width > maxW && size > minPx) { size -= 0.5; ctx.font = font(size); }
  return size;
}

// ---------- art ----------

async function paintArt(ctx, mission, part, side, W, H, s) {
  const art = mission.art || {};
  const src = side === 'front'
    ? ((part && part.art) || art.front || art.back)
    : (art.back || art.front);
  const pos = side === 'front' ? (src === art.back && !art.front ? art.backPos : art.frontPos) : (src === art.front && !art.back ? art.frontPos : art.backPos);
  const img = await loadImage(src);
  if (img) drawCover(ctx, img, 0, 0, W * s, H * s, pos);
  else drawPreset(ctx, art.preset || 'dunes', W * s, H * s, mission.id);
}

function difficultyDef(m) { return DIFFICULTY.find(d => d.value === +m.difficulty) || DIFFICULTY[1]; }

// Header bar: difficulty hexagon, mission name, part counter.
function drawHeaderBar(ctx, mission, partIdx, total, x, y, w, s) {
  const h = 6.2;
  ctx.save();
  ctx.fillStyle = 'rgba(22,15,11,0.78)';
  roundRect(ctx, (x + 4) * s, y * s, (w - 4) * s, h * s, 1.1 * s); ctx.fill();
  ctx.strokeStyle = 'rgba(242,228,200,0.55)';
  ctx.lineWidth = 0.22 * s; ctx.stroke();
  // difficulty
  const d = difficultyDef(mission);
  hexagon(ctx, (x + 4.6) * s, (y + h / 2) * s, 4.6 * s);
  ctx.fillStyle = d.colour; ctx.fill();
  ctx.strokeStyle = SAND; ctx.lineWidth = 0.35 * s; ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.font = `700 ${(d.marks.length === 3 ? 3.6 : 4.2) * s}px ${HEAD_FONT}`;
  ctx.fillText(d.marks, (x + 4.6) * s, (y + h / 2 + 1.5) * s);
  // name
  const name = headerLabel(mission).toUpperCase();
  ctx.fillStyle = SAND;
  const nameMax = w - 24;
  const size = fitText(ctx, name, px => `600 ${px}px ${HEAD_FONT}`, nameMax * s, 3.9 * s, 2.4 * s);
  ctx.font = `600 ${size}px ${HEAD_FONT}`;
  ctx.textAlign = 'left';
  ctx.fillText(name, (x + 11) * s, (y + h / 2 + 1.35) * s);
  // part
  ctx.textAlign = 'right';
  ctx.font = `600 ${2.7 * s}px ${HEAD_FONT}`;
  ctx.fillStyle = 'rgba(242,228,200,0.85)';
  ctx.fillText(`PART ${partLabel(mission, partIdx).toUpperCase()}/${total}`, (x + w - 1.6) * s, (y + h / 2 + 0.95) * s);
  ctx.restore();
  return y + h;
}

function drawTitle(ctx, mission, cx, y, maxW, s, big = 5.6) {
  const title = (mission.title || 'Untitled mission').toUpperCase();
  ctx.save();
  ctx.textAlign = 'center';
  const size = fitText(ctx, title, px => `700 ${px}px ${HEAD_FONT}`, (maxW - 8) * s, big * s, 3 * s);
  ctx.font = `700 ${size}px ${HEAD_FONT}`;
  const tw = ctx.measureText(title).width;
  ctx.shadowColor = 'rgba(0,0,0,0.75)'; ctx.shadowBlur = 1.2 * s;
  ctx.fillStyle = SAND;
  ctx.fillText(title, cx * s, (y + size / s * 0.82) * s);
  ctx.shadowBlur = 0;
  // side rules
  ctx.strokeStyle = 'rgba(242,228,200,0.8)'; ctx.lineWidth = 0.3 * s;
  const ly = (y + size / s * 0.5) * s;
  const half = tw / 2 + 1.6 * s;
  const edge = (maxW / 2) * s;
  if (edge - half > 2 * s) {
    ctx.beginPath(); ctx.moveTo(cx * s - edge, ly); ctx.lineTo(cx * s - half, ly);
    ctx.moveTo(cx * s + half, ly); ctx.lineTo(cx * s + edge, ly); ctx.stroke();
  }
  ctx.restore();
  let bottom = y + size / s * 1.02;
  const byline = [mission.community ? 'Community mission' : '', mission.author ? `by ${mission.author}` : ''].filter(Boolean).join(' ');
  if (byline) {
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = `italic 400 ${2.7 * s}px ${BODY_FONT}`;
    ctx.fillStyle = 'rgba(242,228,200,0.92)';
    ctx.shadowColor = 'rgba(0,0,0,0.8)'; ctx.shadowBlur = 0.8 * s;
    ctx.fillText(byline, cx * s, (bottom + 2.6) * s);
    ctx.restore();
    bottom += 3.4;
  }
  return bottom;
}

function frame(ctx, W, H, s) {
  ctx.save();
  ctx.strokeStyle = 'rgba(242,228,200,0.5)';
  ctx.lineWidth = 0.25 * s;
  roundRect(ctx, 2.2 * s, 2.2 * s, (W - 4.4) * s, (H - 4.4) * s, 2 * s);
  ctx.stroke();
  ctx.restore();
}

// ---------- blocks ----------

function blockIsEmpty(b) {
  if (b.kind === 'image') return !b.image;
  return !String(b.text || '').trim();
}

const PAD = 1.5; // panel padding mm
const GAP = 1.25; // gap between panels mm

// Measure every block at a font size. Returns array of measured blocks.
async function measureBlocks(ctx, mission, blocks, innerW, s, sizePt) {
  const size = sizePt * PT * s;
  const out = [];
  for (const b of blocks) {
    if (blockIsEmpty(b)) continue;
    const def = BLOCK_KINDS[b.kind] || BLOCK_KINDS.story;
    const textW = (innerW - PAD * 2) * s;
    const m = { b, def, h: 0 };
    if (b.kind === 'image') {
      const img = await loadImage(b.image);
      m.img = img;
      if (img) {
        const maxH = 48;
        let w = innerW - PAD * 2, h = w * img.height / img.width;
        if (h > maxH) { h = maxH; w = h * img.width / img.height; }
        m.iw = w; m.ih = h;
      } else { m.iw = 0; m.ih = 0; }
      m.cap = b.caption ? layout(ctx, parseMarkup(b.caption, mission), textW, size * 0.9) : null;
      m.h = PAD * 2 + m.ih + (m.cap ? m.cap.h / s + 0.8 : 0);
    } else {
      m.head = def.pill ? null : (b.kind === 'section' && b.heading ? layout(ctx, parseMarkup(String(b.heading).toUpperCase(), mission), textW, size * 1.08, { weight: 700 }) : null);
      const bodyText = b.kind === 'tip' ? String(b.text || '').split('\n').map(l => l.trim() ? '**Tip:** ' + l : l).join('\n') : b.text;
      m.body = String(b.text || '').trim() ? layout(ctx, parseMarkup(bodyText, mission), textW, size * (b.kind === 'tip' ? 0.95 : 1)) : null;
      const pillH = def.pill ? 3.6 : 0;
      m.pillH = pillH;
      m.h = (def.pill ? pillH * 0.5 + 0.7 : 0) + PAD * 2 + (m.head ? m.head.h / s + 0.3 : 0) + (m.body ? m.body.h / s : 0);
      if (def.pill && !m.body) m.h = pillH + 0.6;
    }
    out.push(m);
  }
  return out;
}

function drawBlock(ctx, m, x, y, w, s) {
  const { def, b } = m;
  const panelY = def.pill ? y + m.pillH * 0.5 : y;
  const panelH = m.h - (def.pill ? m.pillH * 0.5 : 0);
  ctx.save();
  // panel
  if (!(def.pill && !m.body)) {
    roundRect(ctx, x * s, panelY * s, w * s, panelH * s, 0.9 * s);
    ctx.fillStyle = b.kind === 'tip' ? 'rgba(226,214,194,0.92)' : 'rgba(244,236,222,0.9)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(60,40,28,0.35)'; ctx.lineWidth = 0.18 * s; ctx.stroke();
  }
  let cy = panelY + PAD + (def.pill ? 0.7 : 0);
  if (def.pill) {
    const label = def.text;
    ctx.font = `700 ${2.75 * s}px ${HEAD_FONT}`;
    const lw = ctx.measureText(label).width / s + 7;
    const bx = x + (w - lw) / 2;
    banner(ctx, bx * s, y * s, lw * s, m.pillH * s);
    ctx.fillStyle = def.colour; ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.35)'; ctx.lineWidth = 0.18 * s; ctx.stroke();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
    ctx.fillText(label, (x + w / 2) * s, (y + m.pillH * 0.74) * s);
    ctx.textAlign = 'left';
  }
  if (b.kind === 'image') {
    if (m.img) {
      const ix = x + (w - m.iw) / 2;
      ctx.drawImage(m.img, ix * s, cy * s, m.iw * s, m.ih * s);
      cy += m.ih + 0.8;
    }
    if (m.cap) drawRows(ctx, m.cap, (x + PAD) * s, cy * s, (w - PAD * 2) * s, 'center', INK);
  } else {
    if (m.head) {
      drawRows(ctx, m.head, (x + PAD) * s, cy * s, (w - PAD * 2) * s, 'left', RUST, { weight: 700 });
      cy += m.head.h / s + 0.3;
    }
    if (m.body) drawRows(ctx, m.body, (x + PAD) * s, cy * s, (w - PAD * 2) * s, def.align, INK);
  }
  ctx.restore();
}

// ---------- public ----------

/**
 * Render a card front. Returns { canvas, fit } where fit is
 * { scale: font scale used (1 = base), overflow: bool }.
 */
export async function renderFront(mission, partIdx, opts = {}) {
  await ensureFonts();
  const s = opts.scale || 10; // px per mm
  const W = CARD_W, H = CARD_H;
  const canvas = opts.canvas || document.createElement('canvas');
  canvas.width = Math.round(W * s);
  canvas.height = Math.round(H * s);
  const ctx = canvas.getContext('2d');
  ctx.save();
  if (opts.rounded) { roundRect(ctx, 0, 0, W * s, H * s, 3 * s); ctx.clip(); }
  ctx.fillStyle = '#1d1712'; ctx.fillRect(0, 0, W * s, H * s);
  const part = mission.parts[partIdx] || { blocks: [] };
  await paintArt(ctx, mission, part, 'front', W, H, s);
  // legibility gradients
  let g = ctx.createLinearGradient(0, 0, 0, 30 * s);
  g.addColorStop(0, 'rgba(15,10,7,0.65)'); g.addColorStop(1, 'rgba(15,10,7,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W * s, 30 * s);
  g = ctx.createLinearGradient(0, 45 * s, 0, H * s);
  g.addColorStop(0, 'rgba(20,13,9,0)'); g.addColorStop(1, 'rgba(20,13,9,0.8)');
  ctx.fillStyle = g; ctx.fillRect(0, 45 * s, W * s, (H - 45) * s);
  frame(ctx, W, H, s);

  const headBottom = drawHeaderBar(ctx, mission, partIdx, partTotal(mission), 4, 4, W - 8, s);
  const titleBottom = drawTitle(ctx, mission, W / 2, headBottom + 1.4, W - 8, s);

  // content, anchored to the bottom
  const x = 4.2, w = W - 8.4;
  const top = titleBottom + 2.2;
  const bottom = H - 6.2;
  const base = +opts.fontPt || 7.6;
  let sizePt = base, measured = [], total = 0;
  const minPt = base * 0.8;
  while (true) {
    measured = await measureBlocks(ctx, mission, part.blocks, w, s, sizePt);
    total = measured.reduce((a, m) => a + m.h, 0) + Math.max(0, measured.length - 1) * GAP;
    if (total <= bottom - top || sizePt <= minPt) break;
    sizePt = Math.max(minPt, sizePt - 0.2);
  }
  const overflow = total > bottom - top + 0.01;
  let y = overflow ? top : bottom - total;
  for (const m of measured) { drawBlock(ctx, m, x, y, w, s); y += m.h + GAP; }

  // footer
  ctx.font = `400 ${1.9 * s}px ${BODY_FONT}`;
  ctx.fillStyle = 'rgba(242,228,200,0.75)';
  ctx.textAlign = 'left';
  if (mission.author) ctx.fillText(`Author: ${mission.author}`, 4.4 * s, (H - 3.3) * s);
  if (overflow && opts.markOverflow) {
    ctx.fillStyle = 'rgba(200,30,30,0.9)';
    ctx.fillRect(0, (H - 1.4) * s, W * s, 1.4 * s);
  }
  ctx.restore();
  return { canvas, fit: { scale: sizePt / base, overflow, empty: !measured.length } };
}

export async function renderBack(mission, partIdx, opts = {}) {
  await ensureFonts();
  const s = opts.scale || 10;
  const W = CARD_H, H = CARD_W; // landscape
  const canvas = opts.canvas || document.createElement('canvas');
  canvas.width = Math.round(W * s);
  canvas.height = Math.round(H * s);
  const ctx = canvas.getContext('2d');
  ctx.save();
  if (opts.rounded) { roundRect(ctx, 0, 0, W * s, H * s, 3 * s); ctx.clip(); }
  ctx.fillStyle = '#1d1712'; ctx.fillRect(0, 0, W * s, H * s);
  await paintArt(ctx, mission, null, 'back', W, H, s);
  const g = ctx.createLinearGradient(0, 0, 0, 26 * s);
  g.addColorStop(0, 'rgba(15,10,7,0.6)'); g.addColorStop(1, 'rgba(15,10,7,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W * s, 26 * s);
  frame(ctx, W, H, s);
  const barW = 74;
  const hb = drawHeaderBar(ctx, mission, partIdx, partTotal(mission), (W - barW) / 2, 4, barW, s);
  drawTitle(ctx, mission, W / 2, hb + 1.3, 84, s, 5.4);

  if (partIdx === 0) {
    const pw = 70, px = (W - pw) / 2;
    const size = 7.2 * PT * s;
    const modeLabel = (MODES.find(m => m.value === mission.mode) || MODES[0]).label;
    const lines = [];
    if (mission.summary) lines.push(mission.summary);
    if (mission.playtime) lines.push(`Playing time approx. ${mission.playtime} minutes`);
    if (mission.players) lines.push(`Recommended for ${mission.players} players${mission.mode === 'comp' ? ' (competitive)' : ''}`);
    if (mission.mode !== 'comp') lines.push(modeLabel);
    const lay = layout(ctx, parseMarkup(lines.join('\n'), mission), (pw - PAD * 2) * s, size);
    const pillH = 3.6;
    const ph = lay.h / s + PAD * 2 + 0.7;
    const py = H - 5 - ph;
    roundRect(ctx, px * s, py * s, pw * s, ph * s, 0.9 * s);
    ctx.fillStyle = 'rgba(244,236,222,0.88)'; ctx.fill();
    ctx.strokeStyle = 'rgba(60,40,28,0.35)'; ctx.lineWidth = 0.18 * s; ctx.stroke();
    ctx.font = `700 ${2.75 * s}px ${HEAD_FONT}`;
    const label = 'BRIEF INFO';
    const lw = ctx.measureText(label).width / s + 7;
    banner(ctx, (W - lw) / 2 * s, (py - pillH / 2) * s, lw * s, pillH * s);
    ctx.fillStyle = '#d99a2b'; ctx.fill();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
    ctx.fillText(label, W / 2 * s, (py - pillH / 2 + pillH * 0.74) * s);
    ctx.textAlign = 'left';
    drawRows(ctx, lay, (px + PAD) * s, (py + PAD + 0.7) * s, (pw - PAD * 2) * s, 'center', INK);
  }
  ctx.restore();
  return { canvas };
}

// Fit report for every part, used by the editor.
export async function fitReport(mission) {
  const res = [];
  for (let i = 0; i < mission.parts.length; i++) {
    const { fit } = await renderFront(mission, i, { scale: 3 });
    res.push(fit);
  }
  return res;
}
