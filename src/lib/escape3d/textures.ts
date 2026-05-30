import * as THREE from "three";

// ─────────────────────────────────────────────────────────────────
// Toutes les textures sont générées procéduralement (canvas 2D).
// Aucun fichier externe requis.
// ─────────────────────────────────────────────────────────────────

/** Plâtre marocain avec micro-bruit + motif géométrique en relief */
export function makeStucco(repeat = 4): THREE.CanvasTexture {
  const s = 512;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;

  // Base crème
  ctx.fillStyle = "#EDE5D0";
  ctx.fillRect(0, 0, s, s);

  // Bruit de plâtre
  const img = ctx.getImageData(0, 0, s, s);
  const d   = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n  = (Math.random() - 0.5) * 22;
    d[i]   = Math.max(0, Math.min(255, d[i]   + n));
    d[i+1] = Math.max(0, Math.min(255, d[i+1] + n * 0.9));
    d[i+2] = Math.max(0, Math.min(255, d[i+2] + n * 0.7));
  }
  ctx.putImageData(img, 0, 0);

  // Motif zouak : étoiles à 8 branches très subtiles
  const tile = s / 8;
  ctx.strokeStyle = "rgba(155,130,85,0.13)";
  ctx.lineWidth = 0.7;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cx = col * tile + tile / 2;
      const cy = row * tile + tile / 2;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI) / 4;
        const r = i % 2 === 0 ? tile * 0.36 : tile * 0.15;
        const x = cx + Math.cos(a) * r;
        const y = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeat, repeat);
  return tex;
}

/** Marbre blanc aux veines naturelles */
export function makeMarble(): THREE.CanvasTexture {
  const s = 512;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;

  ctx.fillStyle = "#EAE6DE";
  ctx.fillRect(0, 0, s, s);

  // Veines sinueuses
  for (let v = 0; v < 14; v++) {
    let x = Math.random() * s, y = Math.random() * s;
    const angle = Math.random() * Math.PI;
    const alpha = 0.07 + Math.random() * 0.18;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let j = 0; j < 10; j++) {
      x += Math.cos(angle + (Math.random() - 0.5)) * 48;
      y += Math.sin(angle + (Math.random() - 0.5)) * 48;
      ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `rgba(175,158,132,${alpha})`;
    ctx.lineWidth = 0.7 + Math.random() * 1.8;
    ctx.stroke();
  }

  // Bruit léger
  const img = ctx.getImageData(0, 0, s, s);
  const d   = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const n = (Math.random() - 0.5) * 10;
    d[i]   = Math.max(0, Math.min(255, d[i]   + n));
    d[i+1] = Math.max(0, Math.min(255, d[i+1] + n));
    d[i+2] = Math.max(0, Math.min(255, d[i+2] + n));
  }
  ctx.putImageData(img, 0, 0);

  return new THREE.CanvasTexture(c);
}

/** Bois sombre aux veines */
export function makeWood(): THREE.CanvasTexture {
  const w = 128, h = 512;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;

  ctx.fillStyle = "#2A1408";
  ctx.fillRect(0, 0, w, h);

  // Veines de bois
  for (let y = 0; y < h; y++) {
    const wave = Math.sin(y * 0.18 + Math.random() * 0.05) * 6;
    const alpha = 0.03 + (y % 12 < 2 ? 0.08 : 0);
    ctx.fillStyle = `rgba(${y % 20 < 3 ? "90,50,15" : "180,110,50"},${alpha})`;
    ctx.fillRect(0 + wave, y, w, 1);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(1, 3);
  return tex;
}

/** Carrelage terre cuite */
export function makeTerracotta(): THREE.CanvasTexture {
  const s = 512;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d")!;

  const tile = s / 6;
  for (let r = 0; r < 6; r++) {
    for (let col = 0; col < 6; col++) {
      const br = 0.82 + Math.random() * 0.18;
      ctx.fillStyle = `rgb(${Math.floor(180*br)},${Math.floor(72*br)},${Math.floor(22*br)})`;
      ctx.fillRect(col*tile+1.5, r*tile+1.5, tile-3, tile-3);
      // Variation de surface
      const img2 = ctx.getImageData(col*tile+2, r*tile+2, tile-4, tile-4);
      const dd = img2.data;
      for (let i = 0; i < dd.length; i += 4) {
        const n = (Math.random()-0.5)*18;
        dd[i]   = Math.max(0, Math.min(255, dd[i]+n));
        dd[i+1] = Math.max(0, Math.min(255, dd[i+1]+n*0.8));
        dd[i+2] = Math.max(0, Math.min(255, dd[i+2]+n*0.5));
      }
      ctx.putImageData(img2, col*tile+2, r*tile+2);
    }
  }
  // Joints
  ctx.fillStyle = "#7A4A28";
  for (let i = 0; i <= 6; i++) {
    ctx.fillRect(i*tile-1, 0, 3, s);
    ctx.fillRect(0, i*tile-1, s, 3);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.5, 2.5);
  return tex;
}

/** Bois clair (plafond, poutres claires) */
export function makeLightWood(): THREE.CanvasTexture {
  const w = 64, h = 256;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#C8A060";
  ctx.fillRect(0, 0, w, h);
  for (let y = 0; y < h; y++) {
    const alpha = 0.04 + (y % 8 < 1 ? 0.1 : 0) + Math.random() * 0.04;
    ctx.fillStyle = `rgba(80,40,10,${alpha})`;
    ctx.fillRect(0, y, w, 1);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 6);
  return tex;
}
