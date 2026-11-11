import * as THREE from 'three';

function canvasTexture(w, h, draw, { srgb = true, repeat = null, aniso = 8 } = {}) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const g = c.getContext('2d');
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = aniso;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}

// deterministic pseudo random so the look is stable between rebuilds
function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

/** Long horizontal scratches. Used as a bump map on steel and aluminium. */
export function brushedBump(seed = 3) {
  return canvasTexture(512, 512, (g, w, h) => {
    const r = rng(seed);
    g.fillStyle = '#808080'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) {
      const y = r() * h, x = r() * w, len = 40 + r() * 260;
      const v = 100 + r() * 60;
      g.strokeStyle = `rgba(${v},${v},${v},${0.12 + r() * 0.25})`;
      g.lineWidth = 0.5 + r() * 0.9;
      g.beginPath(); g.moveTo(x, y); g.lineTo(x + len, y + (r() - 0.5) * 1.2); g.stroke();
    }
  }, { srgb: false, repeat: [3, 3] });
}

/** Fine powder-coat grain for the case body. */
export function grainBump(seed = 9) {
  return canvasTexture(256, 256, (g, w, h) => {
    const r = rng(seed);
    const img = g.createImageData(w, h);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 118 + r() * 24;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  }, { srgb: false, repeat: [6, 6] });
}

/** Alpha map of hexagonal holes. White = solid, black = hole. */
export function perforationAlpha(cols = 24, rows = 24) {
  return canvasTexture(512, 512, (g, w, h) => {
    g.fillStyle = '#fff'; g.fillRect(0, 0, w, h);
    g.fillStyle = '#000';
    const dx = w / cols, dy = h / rows;
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const cx = (i + (j % 2 ? 0.5 : 0) + 0.5) * dx, cy = (j + 0.5) * dy;
        const R = dx * 0.43;
        g.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = Math.PI / 3 * k + Math.PI / 6;
          const px = cx + Math.cos(a) * R, py = cy + Math.sin(a) * R;
          k ? g.lineTo(px, py) : g.moveTo(px, py);
        }
        g.closePath(); g.fill();
      }
    }
  }, { srgb: false });
}

/** 2x2 twill carbon weave for GPU backplates. */
export function carbonWeave() {
  return canvasTexture(256, 256, (g, w, h) => {
    g.fillStyle = '#101214'; g.fillRect(0, 0, w, h);
    const s = 16;
    for (let y = 0; y < h / s; y++) {
      for (let x = 0; x < w / s; x++) {
        const dir = (x + y) % 2;
        const grad = dir ? g.createLinearGradient(x * s, y * s, x * s + s, y * s) : g.createLinearGradient(x * s, y * s, x * s, y * s + s);
        grad.addColorStop(0, '#232629'); grad.addColorStop(0.5, '#34383c'); grad.addColorStop(1, '#17191b');
        g.fillStyle = grad; g.fillRect(x * s + 1, y * s + 1, s - 2, s - 2);
      }
    }
  }, { repeat: [3, 3] });
}

/** Printed circuit board: dark solder mask, copper traces, vias, silkscreen. */
export function pcbTexture({ base = '#10161b', trace = '#1d2a31', w = 1024, h = 1024, seed = 5, silk = true } = {}) {
  return canvasTexture(w, h, (g, W, H) => {
    const r = rng(seed);
    g.fillStyle = base; g.fillRect(0, 0, W, H);
    g.lineCap = 'round'; g.lineJoin = 'round';
    for (let i = 0; i < 380; i++) {
      let x = r() * W, y = r() * H;
      g.strokeStyle = trace; g.lineWidth = 1 + r() * 2.2;
      g.beginPath(); g.moveTo(x, y);
      const segs = 2 + Math.floor(r() * 4);
      for (let s = 0; s < segs; s++) {
        const horiz = r() > 0.5, len = 20 + r() * 120;
        if (horiz) x += (r() > 0.5 ? 1 : -1) * len; else y += (r() > 0.5 ? 1 : -1) * len;
        g.lineTo(x, y);
        if (r() > 0.55) { x += (r() > 0.5 ? 1 : -1) * 18; y += (r() > 0.5 ? 1 : -1) * 18; g.lineTo(x, y); }
      }
      g.stroke();
    }
    for (let i = 0; i < 900; i++) {
      g.fillStyle = r() > 0.85 ? '#7a6a3a' : '#2b3a40';
      g.beginPath(); g.arc(r() * W, r() * H, 1 + r() * 2, 0, 6.3); g.fill();
    }
    if (silk) {
      g.strokeStyle = 'rgba(210,220,225,0.55)'; g.fillStyle = 'rgba(210,220,225,0.5)'; g.lineWidth = 1.5;
      for (let i = 0; i < 70; i++) {
        const x = r() * W, y = r() * H, a = 8 + r() * 28, b = 5 + r() * 16;
        if (r() > 0.4) g.strokeRect(x, y, a, b); else g.fillRect(x, y, 14 + r() * 24, 3);
      }
    }
  });
}

/** Sticker label for RAM and SSDs. */
export function labelTexture(text, sub, accent = '#35e0ff', w = 256, h = 64) {
  return canvasTexture(w, h, (g, W, H) => {
    g.fillStyle = '#0b0e11'; g.fillRect(0, 0, W, H);
    g.fillStyle = accent; g.fillRect(0, 0, 6, H);
    g.fillStyle = '#e8eef2'; g.font = `700 ${H * 0.36}px Arial, sans-serif`; g.textBaseline = 'middle';
    g.fillText(text, 16, H * 0.36);
    g.fillStyle = '#8795a1'; g.font = `500 ${H * 0.22}px Arial, sans-serif`;
    g.fillText(sub, 16, H * 0.72);
  });
}

/** Vertical gradient for subtle backdrop. */
export function floorGlow() {
  return canvasTexture(512, 512, (g, w, h) => {
    const grad = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    grad.addColorStop(0, 'rgba(255,255,255,0.20)'); grad.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grad; g.fillRect(0, 0, w, h);
  });
}
