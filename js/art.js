// Card art: procedural default scenes and uploaded image handling.

function rng(seed) {
  let s = 0;
  for (const c of String(seed)) s = (s * 31 + c.charCodeAt(0)) >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function sky(ctx, w, h, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  stops.forEach(([o, c]) => g.addColorStop(o, c));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function sun(ctx, x, y, r, core, glow) {
  const g = ctx.createRadialGradient(x, y, r * 0.2, x, y, r * 4);
  g.addColorStop(0, glow);
  g.addColorStop(1, 'rgba(255,200,120,0)');
  ctx.fillStyle = g;
  ctx.fillRect(x - r * 4, y - r * 4, r * 8, r * 8);
  ctx.fillStyle = core;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function ridge(ctx, w, h, base, amp, colour, rand, steps = 9) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(0, h);
  let prev = base + (rand() - 0.5) * amp;
  ctx.lineTo(0, prev);
  for (let i = 1; i <= steps; i++) {
    const x = (w / steps) * i;
    const y = base + (rand() - 0.5) * amp;
    ctx.quadraticCurveTo(x - w / steps / 2, (prev + y) / 2 - amp * 0.25 * rand(), x, y);
    prev = y;
  }
  ctx.lineTo(w, h);
  ctx.closePath();
  ctx.fill();
}

function ruins(ctx, w, h, base, colour, rand, scale = 1) {
  ctx.fillStyle = colour;
  let x = -w * 0.02;
  while (x < w) {
    const bw = w * (0.04 + rand() * 0.07);
    const bh = h * (0.06 + rand() * 0.22) * scale;
    ctx.fillRect(x, base - bh, bw, bh + h);
    if (rand() > 0.6) ctx.fillRect(x + bw * 0.3, base - bh - h * 0.05, bw * 0.12, h * 0.05);
    x += bw + w * rand() * 0.03;
  }
}

const PRESETS = {
  dunes(ctx, w, h, r) {
    sky(ctx, w, h, [[0, '#3a2a3f'], [0.35, '#b5583a'], [0.6, '#e9a45a'], [1, '#f3cf8a']]);
    sun(ctx, w * (0.55 + r() * 0.25), h * 0.42, Math.min(w, h) * 0.07, '#fff1cf', 'rgba(255,214,150,0.55)');
    ridge(ctx, w, h, h * 0.58, h * 0.08, '#8e4a33', r);
    ridge(ctx, w, h, h * 0.68, h * 0.1, '#6b3626', r);
    ridge(ctx, w, h, h * 0.8, h * 0.12, '#45241b', r);
  },
  wasteland(ctx, w, h, r) {
    sky(ctx, w, h, [[0, '#3f78b5'], [0.35, '#8fb8dc'], [0.55, '#e8dcc4'], [1, '#d9b98a']]);
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 5; i++) { const cx = w * r(), cy = h * (0.08 + r() * 0.22); ctx.beginPath(); ctx.ellipse(cx, cy, w * (0.12 + r() * 0.12), h * 0.025, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1;
    sun(ctx, w * (0.15 + r() * 0.2), h * 0.18, Math.min(w, h) * 0.05, '#fffbea', 'rgba(255,250,220,0.5)');
    ruins(ctx, w, h, h * 0.6, 'rgba(120,110,105,0.5)', r, 0.45);
    ridge(ctx, w, h, h * 0.62, h * 0.05, '#cfa874', r);
    ruins(ctx, w, h, h * 0.72, 'rgba(92,70,52,0.85)', r, 0.35);
    ridge(ctx, w, h, h * 0.76, h * 0.07, '#b88a55', r);
    ridge(ctx, w, h, h * 0.88, h * 0.06, '#8f6538', r);
  },
  ruins(ctx, w, h, r) {
    sky(ctx, w, h, [[0, '#4a3b36'], [0.45, '#c27a46'], [0.75, '#efc07a'], [1, '#e9b56f']]);
    sun(ctx, w * (0.25 + r() * 0.5), h * 0.36, Math.min(w, h) * 0.08, '#fff4d8', 'rgba(255,220,160,0.6)');
    ruins(ctx, w, h, h * 0.6, 'rgba(92,58,42,0.75)', r);
    ruins(ctx, w, h, h * 0.66, '#5a3527', r);
    ridge(ctx, w, h, h * 0.78, h * 0.08, '#3a2219', r);
  },
  canyon(ctx, w, h, r) {
    sky(ctx, w, h, [[0, '#f6d9a3'], [0.5, '#c46a3c'], [1, '#2a140e']]);
    const light = ctx.createLinearGradient(w * 0.45, 0, w * 0.55, h);
    light.addColorStop(0, 'rgba(255,240,200,0.75)');
    light.addColorStop(1, 'rgba(255,240,200,0)');
    ctx.fillStyle = light;
    ctx.fillRect(w * 0.38, 0, w * 0.24, h);
    ctx.fillStyle = '#4a2017';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    for (let y = 0; y <= h; y += h / 10) ctx.lineTo(w * (0.3 + r() * 0.1), y);
    ctx.lineTo(0, h);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(w, 0);
    for (let y = 0; y <= h; y += h / 10) ctx.lineTo(w * (0.62 + r() * 0.1), y);
    ctx.lineTo(w, h);
    ctx.fill();
    ridge(ctx, w, h, h * 0.86, h * 0.06, '#2b130d', r);
  },
  storm(ctx, w, h, r) {
    sky(ctx, w, h, [[0, '#6e4a2c'], [0.4, '#d48a43'], [1, '#9b5a32']]);
    sun(ctx, w * 0.5, h * 0.3, Math.min(w, h) * 0.1, '#fffbe8', 'rgba(255,240,190,0.8)');
    ctx.globalAlpha = 0.18;
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = i % 2 ? '#f0c07a' : '#7a4a2a';
      ctx.fillRect(0, h * r(), w, h * 0.03 * r());
    }
    ctx.globalAlpha = 1;
    ridge(ctx, w, h, h * 0.7, h * 0.07, 'rgba(90,52,30,0.85)', r);
    ridge(ctx, w, h, h * 0.82, h * 0.08, '#4a2a1a', r);
  },
  night(ctx, w, h, r) {
    sky(ctx, w, h, [[0, '#0b1020'], [0.6, '#22304d'], [1, '#4a3a3a']]);
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 120; i++) {
      ctx.globalAlpha = 0.3 + r() * 0.7;
      const s = r() * Math.min(w, h) * 0.004 + 0.5;
      ctx.fillRect(w * r(), h * r() * 0.6, s, s);
    }
    ctx.globalAlpha = 1;
    sun(ctx, w * 0.72, h * 0.22, Math.min(w, h) * 0.05, '#e8ecf5', 'rgba(180,200,255,0.25)');
    ridge(ctx, w, h, h * 0.66, h * 0.08, '#1c1a24', r);
    ridge(ctx, w, h, h * 0.8, h * 0.1, '#110f15', r);
  }
};

export function drawPreset(ctx, name, w, h, seed = 'uos') {
  const fn = PRESETS[name] || PRESETS.dunes;
  ctx.save();
  fn(ctx, w, h, rng(seed + name));
  ctx.restore();
}

// Image cache so repeated renders do not decode the same data URL twice.
const cache = new Map();
export function loadImage(src) {
  if (!src) return Promise.resolve(null);
  if (cache.has(src)) return cache.get(src);
  const p = new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
  cache.set(src, p);
  if (cache.size > 60) cache.delete(cache.keys().next().value);
  return p;
}

// Cover-fit an image into a box with a focal point (0-100) and zoom.
export function drawCover(ctx, img, x, y, w, h, pos = { x: 50, y: 50, zoom: 1 }) {
  const zoom = Math.max(1, +pos.zoom || 1);
  const scale = Math.max(w / img.width, h / img.height) * zoom;
  const dw = img.width * scale;
  const dh = img.height * scale;
  const dx = x + (w - dw) * ((+pos.x || 0) / 100);
  const dy = y + (h - dh) * ((+pos.y || 0) / 100);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

// Downscale an uploaded file to a JPEG data URL so storage stays small.
export function fileToDataUrl(file, max = 1800, quality = 0.86) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not read that picture.'));
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * s);
        c.height = Math.round(img.height * s);
        const cx = c.getContext('2d');
        const png = /png|gif|webp/.test(file.type);
        if (!png) { cx.fillStyle = '#fff'; cx.fillRect(0, 0, c.width, c.height); }
        cx.drawImage(img, 0, 0, c.width, c.height);
        resolve(png ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
