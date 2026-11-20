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

// Flat-topped buttes and mesas on the horizon, with ragged ledges and scree.
function mesas(ctx, w, h, base, colour, rand, count = 4) {
  ctx.save();
  ctx.fillStyle = colour;
  for (let i = 0; i < count; i++) {
    const cx = w * (i + 0.15 + rand() * 0.7) / count;
    const tw = w * (0.08 + rand() * 0.16), mh = h * (0.035 + rand() * 0.07);
    const scree = tw * (0.35 + rand() * 0.4);
    const L = cx - tw / 2, R = cx + tw / 2, T = base - mh;
    const pts = [[L - scree, base]];
    // left face: steep with a ledge or two
    pts.push([L - scree * 0.45, base - mh * (0.25 + rand() * 0.1)]);
    pts.push([L - tw * 0.02, base - mh * (0.55 + rand() * 0.15)]);
    pts.push([L + tw * 0.03, base - mh * (0.62 + rand() * 0.1)]);
    pts.push([L + tw * 0.01, T + mh * 0.08]);
    // ragged flat top
    const n = 6 + Math.floor(rand() * 4);
    for (let k = 0; k <= n; k++) pts.push([L + tw * 0.04 + (tw * 0.92 * k) / n, T + mh * (rand() * 0.09)]);
    pts.push([R, T + mh * (0.15 + rand() * 0.1)]);
    pts.push([R + tw * 0.03, base - mh * (0.5 + rand() * 0.15)]);
    pts.push([R + scree * 0.4, base - mh * (0.22 + rand() * 0.1)]);
    pts.push([R + scree, base]);
    ctx.beginPath();
    pts.forEach(([x, y], k) => (k ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fill();
    // shaded face for depth
    ctx.save();
    ctx.clip();
    ctx.fillStyle = 'rgba(40,18,10,0.18)';
    ctx.fillRect(cx + tw * (0.1 + rand() * 0.2), T, tw, mh + 2);
    ctx.restore();
  }
  ctx.restore();
}

// Destroyed high-rises far away: jagged broken tops, gutted floors, leaning.
function brokenTowers(ctx, w, h, base, colour, hole, rand, count = 6) {
  ctx.save();
  for (let i = 0; i < count; i++) {
    const tw = w * (0.035 + rand() * 0.045);
    const x = w * (0.05 + rand() * 0.9) - tw / 2;
    const th = h * (0.1 + rand() * 0.16);
    const lean = (rand() - 0.5) * tw * 0.5;
    const top = base - th;
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.moveTo(x, base);
    ctx.lineTo(x + lean * 0.6, top + th * (0.1 + rand() * 0.25));
    // jagged broken crown
    const steps = 4 + Math.floor(rand() * 3);
    for (let k = 1; k <= steps; k++) {
      const px = x + lean + (tw * k) / steps;
      ctx.lineTo(px, top + th * rand() * 0.3);
    }
    ctx.lineTo(x + tw, base);
    ctx.closePath();
    ctx.fill();
    // gutted floors: irregular holes showing sky
    ctx.fillStyle = hole;
    const floors = Math.floor(th / (h * 0.018));
    for (let f = 2; f < floors; f++) {
      if (rand() < 0.55) continue;
      const fy = base - f * h * 0.018;
      const hx = x + tw * (0.15 + rand() * 0.4);
      ctx.fillRect(hx, fy, tw * (0.15 + rand() * 0.35), h * 0.008);
    }
    // exposed girders on one side
    if (rand() > 0.5) {
      ctx.strokeStyle = colour; ctx.lineWidth = Math.max(1, w * 0.003);
      ctx.beginPath();
      const gx = x + tw + lean * 0.3, gy = top + th * 0.25;
      ctx.moveTo(gx, gy); ctx.lineTo(gx + tw * 0.35, gy - th * 0.08);
      ctx.moveTo(gx, gy + th * 0.1); ctx.lineTo(gx + tw * 0.25, gy + th * 0.06);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// Big sunlit cumulus clouds.
function cumulus(ctx, w, h, rand, count = 4, top = 0.08, band = 0.25) {
  ctx.save();
  // Landscape backs carry the header lower down, so keep clouds under it.
  if (w > h) { top = Math.max(top, 0.4); band = Math.min(band, 0.1); count += 1; }
  for (let i = 0; i < count; i++) {
    const cx = w * rand(), cy = h * (top + rand() * band);
    const cw = Math.min(w, h) * (0.28 + rand() * 0.22);
    const puffs = 6 + Math.floor(rand() * 4);
    for (let pass = 0; pass < 2; pass++) {
      ctx.fillStyle = pass ? 'rgba(255,250,240,0.92)' : 'rgba(170,150,140,0.45)';
      for (let k = 0; k < puffs; k++) {
        const px = cx - cw / 2 + (cw * k) / (puffs - 1);
        const pr = cw * (0.09 + rand() * 0.09) * (1 - Math.abs(k / (puffs - 1) - 0.5));
        ctx.beginPath();
        ctx.arc(px, cy - pr * (pass ? 0.35 : 0) + (pass ? 0 : pr * 0.25), pr * 1.4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  ctx.restore();
}

// Elevated highway with a collapsed span.
function highway(ctx, w, h, base, colour, rand) {
  ctx.save();
  ctx.fillStyle = colour;
  const deckY = base - h * 0.08, deckH = h * 0.014;
  const gapA = w * (0.45 + rand() * 0.15), gapB = gapA + w * 0.14;
  ctx.fillRect(-w * 0.02, deckY, gapA, deckH);
  ctx.fillRect(gapB, deckY + h * 0.004, w, deckH);
  // fallen slab
  ctx.beginPath();
  ctx.moveTo(gapA - w * 0.01, deckY + deckH); ctx.lineTo(gapA + w * 0.02, deckY);
  ctx.lineTo(gapA + w * 0.12, base - h * 0.005); ctx.lineTo(gapA + w * 0.09, base);
  ctx.closePath(); ctx.fill();
  for (let x = w * 0.04; x < w; x += w * 0.11) {
    if (x > gapA - w * 0.02 && x < gapB + w * 0.02) continue;
    ctx.fillRect(x, deckY, w * 0.018, base - deckY);
  }
  // railing stubs and hanging rebar
  ctx.strokeStyle = colour; ctx.lineWidth = Math.max(1, w * 0.002);
  ctx.beginPath();
  for (let k = 0; k < 6; k++) { const rx = gapA - w * 0.005 * k; ctx.moveTo(rx, deckY + deckH); ctx.lineTo(rx + w * 0.004, deckY + deckH + h * (0.01 + rand() * 0.02)); }
  ctx.stroke();
  ctx.restore();
}

function haze(ctx, w, h, y0, y1, colour) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  g.addColorStop(0, colour.replace('A', '0'));
  g.addColorStop(1, colour.replace('A', '0.55'));
  ctx.fillStyle = g;
  ctx.fillRect(0, y0, w, y1 - y0);
}

// Low desert wreckage: shacks, leaning poles, a water tower, wrecked vehicles.
function wreckage(ctx, w, h, base, colour, rand, scale = 1) {
  ctx.save();
  ctx.fillStyle = colour;
  ctx.strokeStyle = colour;
  const u = Math.min(w, h) * scale;
  let x = w * rand() * 0.08;
  while (x < w) {
    const pick = rand();
    if (pick < 0.35) {
      // shack with a slanted roof
      const sw = u * (0.1 + rand() * 0.1), sh = u * (0.05 + rand() * 0.05);
      ctx.beginPath();
      ctx.moveTo(x, base); ctx.lineTo(x, base - sh); ctx.lineTo(x + sw * 0.5, base - sh - u * 0.03 * rand()); ctx.lineTo(x + sw, base - sh * 0.8); ctx.lineTo(x + sw, base);
      ctx.closePath(); ctx.fill();
      x += sw + u * (0.05 + rand() * 0.15);
    } else if (pick < 0.55) {
      // leaning utility pole
      const ph = u * (0.12 + rand() * 0.08), lean = (rand() - 0.5) * u * 0.06;
      ctx.lineWidth = Math.max(1, u * 0.008);
      ctx.beginPath(); ctx.moveTo(x, base); ctx.lineTo(x + lean, base - ph);
      ctx.moveTo(x + lean - u * 0.025, base - ph * 0.9); ctx.lineTo(x + lean + u * 0.025, base - ph * 0.92); ctx.stroke();
      x += u * (0.08 + rand() * 0.15);
    } else if (pick < 0.7) {
      // water tower on legs
      const tw = u * 0.06, th = u * 0.12;
      ctx.lineWidth = Math.max(1, u * 0.006);
      ctx.beginPath(); ctx.moveTo(x, base); ctx.lineTo(x + tw * 0.2, base - th); ctx.moveTo(x + tw, base); ctx.lineTo(x + tw * 0.8, base - th); ctx.stroke();
      ctx.fillRect(x, base - th - u * 0.045, tw, u * 0.045);
      x += tw + u * (0.1 + rand() * 0.15);
    } else {
      // wrecked vehicle hull, half buried
      const vw = u * (0.12 + rand() * 0.08), vh = u * 0.035;
      ctx.beginPath();
      ctx.moveTo(x, base); ctx.lineTo(x + vw * 0.08, base - vh); ctx.lineTo(x + vw * 0.35, base - vh); ctx.lineTo(x + vw * 0.45, base - vh * 1.8);
      ctx.lineTo(x + vw * 0.75, base - vh * 1.8); ctx.lineTo(x + vw * 0.85, base - vh); ctx.lineTo(x + vw, base - vh * 0.7); ctx.lineTo(x + vw, base);
      ctx.closePath(); ctx.fill();
      x += vw + u * (0.08 + rand() * 0.18);
    }
  }
  ctx.restore();
}

// Rusted trestle bridge, low and broken.
function trestle(ctx, w, h, base, colour, rand) {
  ctx.save();
  ctx.strokeStyle = colour; ctx.lineWidth = Math.max(1, Math.min(w, h) * 0.006);
  const x0 = w * (0.05 + rand() * 0.3), span = w * (0.35 + rand() * 0.2), top = base - Math.min(w, h) * 0.09;
  ctx.beginPath(); ctx.moveTo(x0, top); ctx.lineTo(x0 + span * 0.82, top); ctx.lineTo(x0 + span * 0.9, top + Math.min(w, h) * 0.03);
  for (let i = 0; i <= 8; i++) {
    const bx = x0 + (span * 0.8 / 8) * i;
    ctx.moveTo(bx, top); ctx.lineTo(bx, base);
    if (i < 8) { ctx.moveTo(bx, top); ctx.lineTo(bx + span * 0.1, base); }
  }
  ctx.stroke();
  ctx.restore();
}

const PRESETS = {
  dunes(ctx, w, h, r) {
    sky(ctx, w, h, [[0, '#3a2a3f'], [0.35, '#b5583a'], [0.6, '#e9a45a'], [1, '#f3cf8a']]);
    sun(ctx, w * (0.55 + r() * 0.25), h * 0.44, Math.min(w, h) * 0.07, '#fff1cf', 'rgba(255,214,150,0.55)');
    mesas(ctx, w, h, h * 0.6, 'rgba(120,62,44,0.85)', r, 3);
    ridge(ctx, w, h, h * 0.62, h * 0.06, '#8e4a33', r);
    ridge(ctx, w, h, h * 0.7, h * 0.1, '#6b3626', r);
    ridge(ctx, w, h, h * 0.82, h * 0.12, '#45241b', r);
  },
  wasteland(ctx, w, h, r) {
    sky(ctx, w, h, [[0, '#3f78b5'], [0.35, '#9cc2e0'], [0.58, '#f1e2c4'], [1, '#e2b679']]);
    sun(ctx, w * (0.2 + r() * 0.2), h * 0.34, Math.min(w, h) * 0.05, '#fffbea', 'rgba(255,250,220,0.5)');
    cumulus(ctx, w, h, r, 3, 0.3, 0.16);
    mesas(ctx, w, h, h * 0.6, 'rgba(176,112,70,0.7)', r, 4);
    ridge(ctx, w, h, h * 0.62, h * 0.04, '#d9a868', r);
    wreckage(ctx, w, h, h * 0.7, 'rgba(92,62,42,0.85)', r, 0.9);
    ridge(ctx, w, h, h * 0.76, h * 0.07, '#c48f52', r);
    ridge(ctx, w, h, h * 0.88, h * 0.06, '#9a6a38', r);
  },
  highway(ctx, w, h, r) {
    sky(ctx, w, h, [[0, '#4a7fb3'], [0.4, '#b9cfe0'], [0.6, '#efdcbc'], [1, '#d8ad72']]);
    cumulus(ctx, w, h, r, 4, 0.3, 0.18);
    mesas(ctx, w, h, h * 0.63, 'rgba(150,110,80,0.55)', r, 3);
    ridge(ctx, w, h, h * 0.66, h * 0.03, '#d3a46a', r);
    highway(ctx, w, h, h * 0.7, '#5e4a3c', r);
    ridge(ctx, w, h, h * 0.74, h * 0.05, '#c18b50', r);
    wreckage(ctx, w, h, h * 0.8, 'rgba(70,50,36,0.9)', r, 0.7);
    ridge(ctx, w, h, h * 0.88, h * 0.06, '#8f6335', r);
  },
  ruins(ctx, w, h, r) {
    sky(ctx, w, h, [[0, '#4a3b36'], [0.45, '#c27a46'], [0.75, '#efc07a'], [1, '#e9b56f']]);
    sun(ctx, w * (0.25 + r() * 0.5), h * 0.34, Math.min(w, h) * 0.08, '#fff4d8', 'rgba(255,220,160,0.6)');
    brokenTowers(ctx, w, h, h * 0.62, 'rgba(110,70,50,0.75)', 'rgba(239,192,122,0.8)', r, 7);
    haze(ctx, w, h, h * 0.4, h * 0.64, 'rgba(239,192,122,A)');
    ridge(ctx, w, h, h * 0.64, h * 0.05, '#8e4a33', r);
    wreckage(ctx, w, h, h * 0.7, '#5a3527', r);
    ridge(ctx, w, h, h * 0.8, h * 0.08, '#3a2219', r);
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
    sky(ctx, w, h, [[0, '#3b1208'], [0.35, '#b8361a'], [0.6, '#f08a2c'], [1, '#c55a20']]);
    sun(ctx, w * 0.5, h * 0.32, Math.min(w, h) * 0.11, '#fffbe8', 'rgba(255,220,140,0.85)');
    // flare streaks
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 26; i++) {
      const a = r() * Math.PI * 2, len = Math.min(w, h) * (0.15 + r() * 0.5);
      ctx.strokeStyle = `rgba(255,${150 + Math.floor(r() * 80)},60,${0.15 + r() * 0.25})`;
      ctx.lineWidth = Math.max(1, Math.min(w, h) * (0.003 + r() * 0.01));
      ctx.beginPath();
      ctx.moveTo(w * 0.5, h * 0.32);
      ctx.quadraticCurveTo(w * 0.5 + Math.cos(a + 0.4) * len * 0.6, h * 0.32 + Math.sin(a + 0.4) * len * 0.6, w * 0.5 + Math.cos(a) * len, h * 0.32 + Math.sin(a) * len);
      ctx.stroke();
    }
    ctx.restore();
    mesas(ctx, w, h, h * 0.7, 'rgba(90,30,15,0.8)', r, 3);
    ridge(ctx, w, h, h * 0.72, h * 0.07, 'rgba(110,40,18,0.9)', r);
    ridge(ctx, w, h, h * 0.84, h * 0.08, '#3a160b', r);
  },
  night(ctx, w, h, r) {
    sky(ctx, w, h, [[0, '#0b1020'], [0.6, '#22304d'], [1, '#4a3a3a']]);
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 120; i++) {
      ctx.globalAlpha = 0.3 + r() * 0.7;
      const sz = r() * Math.min(w, h) * 0.004 + 0.5;
      ctx.fillRect(w * r(), h * r() * 0.6, sz, sz);
    }
    ctx.globalAlpha = 1;
    sun(ctx, w * 0.72, h * 0.22, Math.min(w, h) * 0.05, '#e8ecf5', 'rgba(180,200,255,0.25)');
    brokenTowers(ctx, w, h, h * 0.66, 'rgba(30,32,48,0.9)', 'rgba(60,70,100,0.6)', r, 4);
    ridge(ctx, w, h, h * 0.68, h * 0.06, '#1c1a24', r);
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
