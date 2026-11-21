// PDF sheets at 100% scale. Fronts are 70 x 120 mm portrait.
// Backs are rendered landscape and rotated into the same slot,
// mirrored left to right for long-edge duplex printing.
import { renderFront, renderBack, CARD_W, CARD_H } from './render.js?v=c509c391';

export const PAPERS = {
  letter: { label: 'Letter (8.5 x 11 in)', w: 215.9, h: 279.4 },
  a4: { label: 'A4', w: 210, h: 297 }
};

export function layoutFor(paperKey, perPage) {
  const p = PAPERS[paperKey] || PAPERS.letter;
  let cols = perPage === 6 ? 3 : 2;
  if (cols * CARD_W > p.w - 1) cols = 2; // A4 cannot fit 3 across
  const rows = 2;
  const gw = cols * CARD_W, gh = rows * CARD_H;
  return { paper: p, cols, rows, ox: (p.w - gw) / 2, oy: (p.h - gh) / 2, per: cols * rows };
}

function rotateCanvas(src, clockwise) {
  const c = document.createElement('canvas');
  c.width = src.height; c.height = src.width;
  const ctx = c.getContext('2d');
  ctx.translate(c.width / 2, c.height / 2);
  ctx.rotate((clockwise ? 1 : -1) * Math.PI / 2);
  ctx.drawImage(src, -src.width / 2, -src.height / 2);
  return c;
}

function cropMarks(doc, L) {
  doc.setDrawColor(90);
  doc.setLineWidth(0.15);
  const xs = [], ys = [];
  for (let c = 0; c <= L.cols; c++) xs.push(L.ox + c * CARD_W);
  for (let r = 0; r <= L.rows; r++) ys.push(L.oy + r * CARD_H);
  const top = L.oy, bot = L.oy + L.rows * CARD_H, left = L.ox, right = L.ox + L.cols * CARD_W;
  const len = 5, off = 1;
  for (const x of xs) {
    if (top - off > 2) doc.line(x, top - off, x, Math.max(1, top - off - len));
    if (L.paper.h - bot - off > 2) doc.line(x, bot + off, x, Math.min(L.paper.h - 1, bot + off + len));
  }
  for (const y of ys) {
    if (left - off > 2) doc.line(left - off, y, Math.max(1, left - off - len), y);
    if (L.paper.w - right - off > 2) doc.line(right + off, y, Math.min(L.paper.w - 1, right + off + len), y);
  }
}

/**
 * cards: [{ mission, part }]
 * options: { paper, perPage, backs, clockwise, marks, onProgress }
 */
export async function buildPdf(cards, options) {
  const { jsPDF } = window.jspdf;
  const L = layoutFor(options.paper, options.perPage);
  const doc = new jsPDF({ unit: 'mm', format: [L.paper.w, L.paper.h], orientation: 'portrait', compress: true });
  const scale = 12; // px per mm, about 305 dpi
  let first = true, done = 0;
  for (let i = 0; i < cards.length; i += L.per) {
    const batch = cards.slice(i, i + L.per);
    if (!first) doc.addPage([L.paper.w, L.paper.h], 'portrait');
    first = false;
    for (let k = 0; k < batch.length; k++) {
      const { mission, part } = batch[k];
      const { canvas } = await renderFront(mission, part, { scale });
      const col = k % L.cols, row = Math.floor(k / L.cols);
      doc.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', L.ox + col * CARD_W, L.oy + row * CARD_H, CARD_W, CARD_H, undefined, 'FAST');
      options.onProgress && options.onProgress(++done);
    }
    if (options.marks) cropMarks(doc, L);
    if (options.backs) {
      doc.addPage([L.paper.w, L.paper.h], 'portrait');
      for (let k = 0; k < batch.length; k++) {
        const { mission, part } = batch[k];
        const { canvas } = await renderBack(mission, part, { scale });
        const rot = rotateCanvas(canvas, options.clockwise !== false);
        const col = L.cols - 1 - (k % L.cols), row = Math.floor(k / L.cols);
        doc.addImage(rot.toDataURL('image/jpeg', 0.9), 'JPEG', L.ox + col * CARD_W, L.oy + row * CARD_H, CARD_W, CARD_H, undefined, 'FAST');
        options.onProgress && options.onProgress(++done);
      }
      if (options.marks) cropMarks(doc, L);
    }
  }
  return doc;
}
