"use strict";

// ---------- setup ----------
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");
let W, H, DPR, cx, cy, bowlR;

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth;
  H = window.innerHeight;
  canvas.width = W * DPR;
  canvas.height = H * DPR;
  canvas.style.width = W + "px";
  canvas.style.height = H + "px";
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  cx = W > 900 ? W * 0.62 : W / 2;

  if (W > 760) {
    cy = H * 0.53;
    bowlR = Math.min(W, H) * 0.34;
  } else {
    const controls = document.querySelector(".bar");
    const controlsHeight = controls ? controls.offsetHeight : 0;
    const controlsClearance = controlsHeight + 28;

    bowlR = Math.min(W, Math.max(260, H - controlsClearance)) * 0.28;
    cy = Math.min(H * 0.48, H - controlsClearance - bowlR - 12);
  }

  buildGridStorage();
}

// ---------- adjustable state (driven by the buttons) ----------
let sizeScale = 0.1;      // particle size multiplier, 0.1x – 2.0x
let count = 12000;        // live particle count
let colorCount = 2;       // active liquids, 1 – 6
let mode3D = false;       // 2D / 3D toggle
let viewAngle = 0;        // camera orbit angle in 3D mode

const MIN_SIZE_SCALE = 0.1;
const MAX_SIZE_SCALE = 2.0;
const MIN_PARTICLES = 100;
const MAX = 12000;
const CHUNK = 1000;

const PR = () => Math.max(1, bowlR * 0.030 * sizeScale);

// ---------- simulation parameters ----------
const GRAVITY = 1400;
const STIFFNESS = 2200;
const VISCOSITY = 14;
const DAMPING = 0.9985;
const WALL_BOUNCE = 0.25;

// palette of liquids; first two match the original video
const LIQUIDS = [
  { hue: 32,  sat: 95, light: 52 },   // amber / orange
  { hue: 176, sat: 80, light: 46 },   // teal
  { hue: 265, sat: 75, light: 58 },   // violet
  { hue: 330, sat: 80, light: 56 },   // pink
  { hue: 110, sat: 70, light: 48 },   // green
  { hue: 210, sat: 85, light: 55 },   // blue
];

// ---------- particles (flat typed arrays, capacity MAX) ----------
const px = new Float32Array(MAX);
const py = new Float32Array(MAX);
const pz = new Float32Array(MAX);
const vx = new Float32Array(MAX);
const vy = new Float32Array(MAX);
const vz = new Float32Array(MAX);
const kind = new Uint8Array(MAX);
const speed = new Float32Array(MAX);
const order = new Int32Array(MAX);   // draw order for 3D depth sort

function assignColors() {
  for (let i = 0; i < MAX; i++) kind[i] = i % colorCount;
}

function seedParticle(i) {
  const a = Math.random() * Math.PI * 2;
  const r = Math.sqrt(Math.random()) * bowlR * 0.55;
  px[i] = cx + Math.cos(a) * r * 0.9;
  py[i] = cy + Math.abs(Math.sin(a)) * r * 0.5 + bowlR * 0.15;
  pz[i] = mode3D ? (Math.random() - 0.5) * bowlR * 0.8 : 0;
  vx[i] = 0; vy[i] = 0; vz[i] = 0;
}

function seedAll() {
  for (let i = 0; i < MAX; i++) seedParticle(i);
  assignColors();
}

// ---------- spatial hash grid (2D cells + z bucket in 3D) ----------
let cellSize, depthCellSize, gridW, gridH, gridD, gridHeads, gridNext;
function buildGridStorage() {
  cellSize = Math.max(2, PR() * 2);
  depthCellSize = Math.max(cellSize, bowlR * 0.08);
  gridW = Math.ceil(W / cellSize) + 1;
  gridH = Math.ceil(H / cellSize) + 1;
  gridD = mode3D ? Math.ceil((bowlR * 2) / depthCellSize) + 1 : 1;
  gridHeads = new Int32Array(gridW * gridH * gridD);
  gridNext = new Int32Array(MAX);
}

function cellOf(i) {
  const gx = Math.max(0, Math.min(gridW - 1, (px[i] / cellSize) | 0));
  const gy = Math.max(0, Math.min(gridH - 1, (py[i] / cellSize) | 0));
  const gz = Math.max(0, Math.min(gridD - 1, ((pz[i] + bowlR) / depthCellSize) | 0));
  return (gz * gridH + gy) * gridW + gx;
}

function hashInsert() {
  gridHeads.fill(-1);
  for (let i = 0; i < count; i++) {
    const c = cellOf(i);
    gridNext[i] = gridHeads[c];
    gridHeads[c] = i;
  }
}

resize();
window.addEventListener("resize", resize);
seedAll();

// ---------- interaction ----------
let tilt = 0, tiltTarget = 0, swirlPulse = 0;
let dragging = false, lastX = 0, downTime = 0;

canvas.addEventListener("pointerdown", e => {
  dragging = true;
  lastX = e.clientX;
  downTime = performance.now();
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener("pointermove", e => {
  if (!dragging) return;
  tiltTarget += (e.clientX - lastX) * 0.004;
  tiltTarget = Math.max(-0.8, Math.min(0.8, tiltTarget));
  lastX = e.clientX;
});
canvas.addEventListener("pointerup", () => {
  dragging = false;
  if (performance.now() - downTime < 180) shake();
  tiltTarget = 0;
});
window.addEventListener("keydown", e => {
  if (e.key === "s" || e.key === "S") swirlPulse = 1;
});

function shake() {
  for (let i = 0; i < count; i++) {
    vx[i] += (Math.random() - 0.5) * 900;
    vy[i] -= Math.random() * 700;
    if (mode3D) vz[i] += (Math.random() - 0.5) * 900;
  }
}

// ---------- buttons ----------
const $ = id => document.getElementById(id);

$("szUp").onclick = () => { sizeScale = Math.min(MAX_SIZE_SCALE, sizeScale * 1.25); sizeChanged(); };
$("szDn").onclick = () => { sizeScale = Math.max(MIN_SIZE_SCALE, sizeScale / 1.25); sizeChanged(); };
function sizeChanged() {
  $("szV").textContent = sizeScale.toFixed(1) + "×";
  buildGridStorage();
}

$("pcUp").onclick = () => {
  const from = count;
  count = Math.min(MAX, count + CHUNK);
  for (let i = from; i < count; i++) {
    seedParticle(i);
    py[i] = cy - bowlR * 0.4;                      // pour new ones in from the top
    vy[i] = 300 + Math.random() * 200;
    px[i] = cx + (Math.random() - 0.5) * bowlR * 0.5;
  }
  $("pcV").textContent = count;
};
$("pcDn").onclick = () => {
  count = Math.max(MIN_PARTICLES, count - CHUNK);
  $("pcV").textContent = count;
};

$("ccUp").onclick = () => { colorCount = Math.min(LIQUIDS.length, colorCount + 1); colorChanged(); };
$("ccDn").onclick = () => { colorCount = Math.max(1, colorCount - 1); colorChanged(); };
function colorChanged() {
  $("ccV").textContent = colorCount;
  assignColors();
}

$("dim").onclick = () => {
  mode3D = !mode3D;
  $("dim").textContent = "3D: " + (mode3D ? "on" : "off");
  $("dim").classList.toggle("on", mode3D);
  buildGridStorage();
  if (!mode3D) {
    // collapse depth back to the 2D plane
    for (let i = 0; i < MAX; i++) { pz[i] = 0; vz[i] = 0; }
    viewAngle = 0;
  } else {
    // give particles some depth so the sphere fills naturally
    for (let i = 0; i < MAX; i++) pz[i] = (Math.random() - 0.5) * bowlR * 0.8;
  }
};

// ---------- physics ----------
function step(dt) {
  tilt += (tiltTarget - tilt) * Math.min(1, dt * 6);
  swirlPulse *= Math.pow(0.15, dt);
  if (mode3D) viewAngle += dt * 0.25;              // slow camera orbit

  const gX = Math.sin(tilt) * GRAVITY;
  const gY = Math.cos(tilt) * GRAVITY;
  const h = PR() * 2;
  const h2 = h * h;

  hashInsert();

  for (let i = 0; i < count; i++) {
    const gx = Math.max(0, Math.min(gridW - 1, (px[i] / cellSize) | 0));
    const gy = Math.max(0, Math.min(gridH - 1, (py[i] / cellSize) | 0));
    const gz = Math.max(0, Math.min(gridD - 1, ((pz[i] + bowlR) / depthCellSize) | 0));
    const zLo = mode3D ? -1 : 0, zHi = mode3D ? 1 : 0;

    for (let oz = zLo; oz <= zHi; oz++) {
      const zz = gz + oz;
      if (zz < 0 || zz >= gridD) continue;
      for (let oy = -1; oy <= 1; oy++) {
        const yy = gy + oy;
        if (yy < 0 || yy >= gridH) continue;
        for (let ox = -1; ox <= 1; ox++) {
          const xx = gx + ox;
          if (xx < 0 || xx >= gridW) continue;
          let j = gridHeads[(zz * gridH + yy) * gridW + xx];
          while (j !== -1) {
            if (j > i) {
              const dx = px[j] - px[i];
              const dy = py[j] - py[i];
              const dz = pz[j] - pz[i];
              const d2 = dx * dx + dy * dy + dz * dz;
              if (d2 < h2 && d2 > 0.0001) {
                const d = Math.sqrt(d2);
                const q = 1 - d / h;
                const push = STIFFNESS * q * q * dt;
                const nx = dx / d, ny = dy / d, nz = dz / d;
                vx[i] -= nx * push; vy[i] -= ny * push; vz[i] -= nz * push;
                vx[j] += nx * push; vy[j] += ny * push; vz[j] += nz * push;
                const visc = VISCOSITY * q * dt;
                const vdx = vx[j] - vx[i], vdy = vy[j] - vy[i], vdz = vz[j] - vz[i];
                vx[i] += vdx * visc; vy[i] += vdy * visc; vz[i] += vdz * visc;
                vx[j] -= vdx * visc; vy[j] -= vdy * visc; vz[j] -= vdz * visc;
              }
            }
            j = gridNext[j];
          }
        }
      }
    }
  }

  for (let i = 0; i < count; i++) {
    vx[i] += gX * dt;
    vy[i] += gY * dt;

    if (swirlPulse > 0.01) {
      const rx = px[i] - cx, ry = py[i] - cy;
      const rl = Math.hypot(rx, ry) + 0.001;
      vx[i] += (-ry / rl) * swirlPulse * 2600 * dt;
      vy[i] += ( rx / rl) * swirlPulse * 2600 * dt;
    }

    vx[i] *= DAMPING; vy[i] *= DAMPING; vz[i] *= DAMPING;
    px[i] += vx[i] * dt;
    py[i] += vy[i] * dt;
    if (mode3D) pz[i] += vz[i] * dt;

    // container: circle in 2D, sphere in 3D
    const rx = px[i] - cx, ry = py[i] - cy, rz = mode3D ? pz[i] : 0;
    const dist = Math.sqrt(rx * rx + ry * ry + rz * rz);
    const inner = bowlR - PR() * 1.2;
    if (dist > inner) {
      const nx = rx / dist, ny = ry / dist, nz = rz / dist;
      px[i] = cx + nx * inner;
      py[i] = cy + ny * inner;
      if (mode3D) pz[i] = nz * inner;
      const vn = vx[i] * nx + vy[i] * ny + vz[i] * nz;
      if (vn > 0) {
        vx[i] -= (1 + WALL_BOUNCE) * vn * nx;
        vy[i] -= (1 + WALL_BOUNCE) * vn * ny;
        vz[i] -= (1 + WALL_BOUNCE) * vn * nz;
      }
    }

    speed[i] = Math.sqrt(vx[i] * vx[i] + vy[i] * vy[i] + vz[i] * vz[i]);
  }
}

// ---------- rendering ----------
const FOCAL = 900;   // perspective strength in 3D

function draw() {
  drawAtmosphere();
  drawStars();

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, bowlR - 2, 0, Math.PI * 2);
  ctx.clip();

  const cosA = Math.cos(viewAngle), sinA = Math.sin(viewAngle);
  const r1 = PR() * 2.4;
  const r2 = PR() * 1.1;

  // depth sort (back to front) in 3D so nearer blobs draw on top
  for (let i = 0; i < count; i++) order[i] = i;
  if (mode3D) {
    const depth = i => -(px[i] - cx) * sinA + pz[i] * cosA;
    const arr = order.subarray(0, count);
    Array.prototype.sort.call(arr, (a, b) => depth(a) - depth(b));
  }

  ctx.globalCompositeOperation = "lighter";
  for (let k = 0; k < count; k++) {
    const i = order[k];
    const L = LIQUIDS[kind[i]];

    // color reacts to movement: slow = deep, fast = bright and hue-shifted
    const s = Math.min(1, speed[i] / 900);
    const hue = L.hue + s * 28;
    const sat = L.sat - s * 30;
    const light = L.light + s * 34;

    let sx = px[i], sy = py[i], scale = 1, depthFade = 1;
    if (mode3D) {
      const dx = px[i] - cx;
      const rxv = dx * cosA + pz[i] * sinA;
      const rzv = -dx * sinA + pz[i] * cosA;
      scale = FOCAL / (FOCAL + rzv);
      sx = cx + rxv * scale;
      sy = cy + (py[i] - cy) * scale;
      depthFade = 0.55 + 0.45 * Math.min(1, Math.max(0, scale - 0.6) / 0.8);
    }

    ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light * 0.55 * depthFade}%, 0.30)`;
    ctx.beginPath();
    ctx.arc(sx, sy, r1 * scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light * depthFade}%, 0.85)`;
    ctx.beginPath();
    ctx.arc(sx, sy, r2 * scale, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
  ctx.restore();

  // glass outline
  const glassGlow = ctx.createRadialGradient(cx - bowlR * 0.3, cy - bowlR * 0.4, bowlR * 0.15, cx, cy, bowlR * 1.15);
  glassGlow.addColorStop(0, "rgba(255, 255, 255, 0.18)");
  glassGlow.addColorStop(0.62, "rgba(125, 211, 252, 0.06)");
  glassGlow.addColorStop(1, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = glassGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, bowlR, 0, Math.PI * 2);
  ctx.fill();

  ctx.lineWidth = 3;
  ctx.strokeStyle = "rgba(236, 248, 255, 0.68)";
  ctx.beginPath();
  ctx.arc(cx, cy, bowlR, Math.PI * 0.02, Math.PI * 0.98);
  ctx.stroke();
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(220, 225, 235, 0.18)";
  ctx.beginPath();
  ctx.arc(cx, cy, bowlR, Math.PI * 1.02, Math.PI * 1.98);
  ctx.stroke();

  // in 3D, an equator ellipse sells the sphere
  if (mode3D) {
    ctx.strokeStyle = "rgba(220, 225, 235, 0.10)";
    ctx.beginPath();
    ctx.ellipse(cx, cy, bowlR, bowlR * 0.22, 0, 0, Math.PI * 2);
    ctx.stroke();
  }

  // specular highlight
  ctx.lineWidth = 5;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.beginPath();
  ctx.arc(cx, cy, bowlR - 7, Math.PI * 0.60, Math.PI * 0.82);
  ctx.stroke();
}

const stars = Array.from({ length: 90 }, () => ({
  x: Math.random(), y: Math.random(), r: Math.random() * 1.3 + 0.3,
  a: Math.random() * 0.5 + 0.15
}));
function drawAtmosphere() {
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#030712");
  bg.addColorStop(0.48, "#07111f");
  bg.addColorStop(1, "#020617");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const halo = ctx.createRadialGradient(cx, cy, bowlR * 0.1, cx, cy, bowlR * 1.9);
  halo.addColorStop(0, "rgba(103, 232, 249, 0.16)");
  halo.addColorStop(0.58, "rgba(245, 158, 11, 0.05)");
  halo.addColorStop(1, "rgba(0, 0, 0, 0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, W, H);
}

function drawStars() {
  ctx.fillStyle = "#fff";
  for (const s of stars) {
    ctx.globalAlpha = s.a;
    ctx.fillRect(s.x * W, s.y * H, s.r, s.r);
  }
  ctx.globalAlpha = 1;
}

// ---------- main loop ----------
let last = performance.now();
function frame(now) {
  let dt = Math.min(0.032, (now - last) / 1000);
  last = now;
  const sub = 3;
  for (let k = 0; k < sub; k++) step(dt / sub);
  draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
