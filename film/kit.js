'use strict';
// ---------------------------------------------------------------------------
// Scenery + presenter kit for the Vice & Versa films. Paper-cutout style,
// deterministic, drawn on a 1920x1080 canvas context `ctx`.
// ---------------------------------------------------------------------------
const W = 1920, H = 1080;
const KIT = {};
(function () {
  const rng = seed => { let s = seed >>> 0 || 1; return () => ((s = Math.imul(s ^ (s >>> 15), 1 | s) + 0x6D2B79F5 >>> 0, s = (s ^ (s + Math.imul(s ^ (s >>> 7), 61 | s))) >>> 0), ((s ^ (s >>> 14)) >>> 0) / 4294967296); };
  const lerp = (a, b, k) => a + (b - a) * k;
  KIT.rng = rng; KIT.lerp = lerp;

  // ---- textures ----------------------------------------------------------
  function grain(w, h, seed, dens, col) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); const r = rng(seed);
    const img = g.createImageData(w, h), d = img.data;
    for (let i = 0; i < d.length; i += 4) { if (r() < dens) { d[i] = d[i + 1] = d[i + 2] = col; d[i + 3] = 40 + r() * 90; } }
    g.putImageData(img, 0, 0); return c;
  }
  KIT.GRAIN_D = grain(512, 512, 3, .18, 0);
  KIT.GRAIN_L = grain(512, 512, 4, .06, 255);
  // paper texture over whatever path is current (call after fill)
  KIT.paper = (ctx, a = .35) => { ctx.save(); ctx.clip(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = ctx.createPattern(KIT.GRAIN_D, 'repeat'); ctx.fillRect(-4000, -4000, 8000, 8000); ctx.restore(); };
  KIT.filmGrain = (ctx, t, a = .5) => { const f = Math.floor(t * 12) % 5; ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = ctx.createPattern(KIT.GRAIN_L, 'repeat'); ctx.translate(-f * 37, -f * 53); ctx.fillRect(0, 0, W + 400, H + 400); ctx.restore(); };
  KIT.vignette = (ctx, a = .75) => { const g = ctx.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, H * .95); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${a})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); };
  KIT.boil = (t, seed, amp = 1) => { const r = rng(seed * 7919 + Math.floor(t * 8)); return [(r() - .5) * 2 * amp, (r() - .5) * 2 * amp]; };

  // light shaft / glow helpers (additive)
  KIT.glow = (ctx, x, y, r, col, a) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col.replace('A', a)); g.addColorStop(1, col.replace('A', 0)); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); ctx.restore(); };
  KIT.shaft = (ctx, x0, w0, x1, w1, y0, y1, a) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, `rgba(255,226,170,${a})`); g.addColorStop(1, 'rgba(255,226,170,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x0 - w0 / 2, y0); ctx.lineTo(x0 + w0 / 2, y0); ctx.lineTo(x1 + w1 / 2, y1); ctx.lineTo(x1 - w1 / 2, y1); ctx.fill(); ctx.restore(); };
  KIT.dust = (ctx, t, seed, n, box, a = .6) => { const r = rng(seed); ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < n; i++) { const x = box[0] + ((r() * box[2] + t * (4 + r() * 10)) % box[2]), y = box[1] + ((r() * box[3] - t * (2 + r() * 6) + 9999 * box[3]) % box[3]); const s = .8 + r() * 2.2; ctx.fillStyle = `rgba(255,230,180,${a * (.3 + r() * .7)})`; ctx.beginPath(); ctx.arc(x, y, s, 0, 6.283); ctx.fill(); } ctx.restore(); };

  // the red line — hand drawn, with a hot glow for impact
  KIT.strike = (ctx, x0, y0, x1, y1, p, seed, width = 10, glow = true) => {
    if (p <= 0) return; const r = rng(seed); const n = 30, pts = [];
    for (let i = 0; i <= n; i++) { const k = i / n; pts.push([lerp(x0, x1, k) + (r() - .5) * 3, lerp(y0, y1, k) + Math.sin(k * 3 + seed) * width * .35 + (r() - .5) * 3]); }
    const m = Math.floor(n * Math.min(1, p));
    const path = () => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i <= m; i++) ctx.lineTo(pts[i][0], pts[i][1]); };
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (glow) { ctx.shadowColor = 'rgba(255,60,30,.9)'; ctx.shadowBlur = width * 3; }
    ctx.strokeStyle = '#A32A1E'; ctx.lineWidth = width; path(); ctx.stroke();
    ctx.shadowBlur = 0; ctx.strokeStyle = 'rgba(230,80,55,.8)'; ctx.lineWidth = width * .35; path(); ctx.stroke();
    ctx.restore();
  };

  // ---- PRESENTER RIG -------------------------------------------------------
  // Illustrated Jethro. Feet at (x, y). Height ≈ 780 * s.
  // Reference: short swept-back silver hair, light eyes, clean-shaven, warm smile,
  // black crew-neck sweater over a white collared shirt (cuffs showing), dark trousers.
  // pose: { face: 1 right / -1 left, head: tilt rad, look: -1..1 (eye dir), smile: 0..1,
  //         armF/armB: [shoulder, elbow] rad, legs: walk phase, mouth: 0..1 (open), hold: fn(ctx) }
  const JETHRO = { skin: '#e2b196', skinShade: '#b9826a', skinDeep: '#9c6752', hair: '#bdb7ae', hairDark: '#7f786f', iris: '#6d8fa8',
    brow: '#8a7f73', sweater: '#1d1d20', sweaterShade: '#121214', shirt: '#f1ede5', trousers: '#26262a', shoes: '#141212', rim: '#ffd199' };
  KIT.LOOK = JETHRO;

  function limb(ctx, x, y, len1, len2, a1, a2, w1, w2, col, rim, rimDx) {
    const ex = x + Math.sin(a1) * len1, ey = y + Math.cos(a1) * len1;
    const hx = ex + Math.sin(a1 + a2) * len2, hy = ey + Math.cos(a1 + a2) * len2;
    const seg = (ax, ay, bx2, by2, wa, wb, dx) => { const ang = Math.atan2(by2 - ay, bx2 - ax), nx = -Math.sin(ang), ny = Math.cos(ang);
      ctx.beginPath(); ctx.moveTo(ax + nx * wa / 2 + dx, ay + ny * wa / 2); ctx.lineTo(bx2 + nx * wb / 2 + dx, by2 + ny * wb / 2); ctx.arc(bx2 + dx, by2, wb / 2, ang + Math.PI / 2, ang - Math.PI / 2, true);
      ctx.lineTo(ax - nx * wa / 2 + dx, ay - ny * wa / 2); ctx.arc(ax + dx, ay, wa / 2, ang - Math.PI / 2, ang + Math.PI / 2, true); ctx.closePath(); ctx.fill(); };
    for (const [c, dx] of [[rim, rimDx], [col, 0]]) { ctx.fillStyle = c; seg(x, y, ex, ey, w1, w2 * 1.02, dx); seg(ex, ey, hx, hy, w2, w2 * .82, dx); }
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(ex, ey, w2 * .45, 0, 6.283); ctx.stroke();
    return [hx, hy, a1 + a2, ex, ey];
  }
  function hand(ctx, L, hx, hy, ang, open) {
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(-ang);
    ctx.fillStyle = L.shirt; ctx.beginPath(); ctx.roundRect(-20, -26, 40, 16, 5); ctx.fill(); // white cuff
    ctx.fillStyle = L.skin; ctx.beginPath(); ctx.ellipse(0, 6, 17, 22, 0, 0, 6.283); ctx.fill();
    if (open) { ctx.strokeStyle = L.skin; ctx.lineCap = 'round'; ctx.lineWidth = 8; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-10 + k * 7, 20); ctx.lineTo(-14 + k * 9, 44 - Math.abs(k - 1.5) * 4); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(14, 4); ctx.lineTo(28, 20); ctx.stroke(); }
    ctx.strokeStyle = L.skinShade; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-8, 12); ctx.lineTo(8, 14); ctx.stroke();
    ctx.restore();
  }

  KIT.presenter = (ctx, x, y, s, t, pose = {}, look = JETHRO) => {
    const P = Object.assign({ face: 1, head: 0, look: 0, smile: .6, armF: [.15, -.1], armB: [-.12, .1], legs: 0, mouth: 0, breathe: 1, rimSide: 1, openF: false }, pose);
    const L = look; const rd = 6 * P.rimSide;
    const [bx, by] = KIT.boil(t, 17, .9); const br = Math.sin(t * 1.6) * 2 * P.breathe;
    ctx.save(); ctx.translate(x + bx, y + by); ctx.scale(s * P.face, s);
    ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.filter = 'blur(10px)'; ctx.beginPath(); ctx.ellipse(0, 6, 130, 18, 0, 0, 6.283); ctx.fill(); ctx.restore();
    const hipY = -360, shY = -615 + br;
    const sw = Math.sin(P.legs) * .3;
    const leg = (dx, a, col, ph) => { const knee = Math.max(0, Math.sin(P.legs + ph)) * .4; const [fx, fy] = limb(ctx, dx, hipY, 185, 178, a + knee * .5, -knee, 62, 52, col, L.rim, rd * .5);
      ctx.fillStyle = L.shoes; ctx.beginPath(); ctx.ellipse(fx + 24, fy + 4, 44, 17, 0, 0, 6.283); ctx.fill(); };
    leg(-24, -sw, '#1f1f23', Math.PI); leg(26, sw, L.trousers, 0);
    // back arm
    const b = limb(ctx, -66, shY + 30, 158, 146, P.armB[0], P.armB[1], 46, 40, L.sweaterShade, L.rim, rd * .4); hand(ctx, L, b[0], b[1], b[2], false);
    // torso: crew-neck sweater, ribbed hem
    const torso = dx => { ctx.beginPath(); ctx.moveTo(-104 + dx, shY + 34); ctx.bezierCurveTo(-100 + dx, shY - 4, -60 + dx, shY - 14, 0 + dx, shY - 14); ctx.bezierCurveTo(60 + dx, shY - 14, 100 + dx, shY - 4, 104 + dx, shY + 34); ctx.bezierCurveTo(100 + dx, hipY - 90, 86 + dx, hipY - 20, 84 + dx, hipY + 30); ctx.quadraticCurveTo(0 + dx, hipY + 44, -82 + dx, hipY + 30); ctx.bezierCurveTo(-86 + dx, hipY - 20, -100 + dx, hipY - 90, -104 + dx, shY + 34); ctx.closePath(); };
    ctx.fillStyle = L.rim; torso(rd); ctx.fill(); ctx.fillStyle = L.sweater; torso(0); ctx.fill();
    { const g = ctx.createLinearGradient(-100, 0, 100, 0); g.addColorStop(0, 'rgba(0,0,0,.35)'); g.addColorStop(.55, 'rgba(255,255,255,.04)'); g.addColorStop(1, 'rgba(0,0,0,.1)'); ctx.fillStyle = g; torso(0); ctx.fill(); }
    torso(0); KIT.paper(ctx, .55);
    ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.lineWidth = 3; for (let k = 0; k < 9; k++) { ctx.beginPath(); ctx.moveTo(-66 + k * 16.5, hipY + 6); ctx.lineTo(-66 + k * 16.5, hipY + 28); ctx.stroke(); }
    // white shirt collar points + sweater neckline rib
    // neck + head
    ctx.save(); ctx.translate(4, shY - 16); ctx.rotate(P.head);
    ctx.fillStyle = L.skinShade; ctx.beginPath(); ctx.moveTo(-22, 8); ctx.lineTo(-20, -40); ctx.lineTo(24, -40); ctx.lineTo(24, 8); ctx.fill();
    ctx.restore();
    // shirt collar + ribbed crew neck, over the neck base
    ctx.save(); ctx.translate(4, shY - 16);
    ctx.fillStyle = L.shirt; ctx.beginPath(); ctx.moveTo(-34, 14); ctx.lineTo(-26, -20); ctx.quadraticCurveTo(0, -8, 28, -20); ctx.lineTo(38, 14); ctx.lineTo(4, 30); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,.12)'; ctx.beginPath(); ctx.moveTo(4, 30); ctx.lineTo(-10, 4); ctx.lineTo(18, 4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#2b2b30'; ctx.lineWidth = 14; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(-52, 10); ctx.quadraticCurveTo(4, 50, 58, 10); ctx.stroke();
    ctx.restore();
    ctx.save(); ctx.translate(4, shY - 16); ctx.rotate(P.head); ctx.scale(1.22, 1.22); ctx.translate(0, 8);
    const hy = -100;
    const skull = dx => { ctx.beginPath(); ctx.moveTo(dx - 46, hy - 20); ctx.bezierCurveTo(dx - 50, hy - 80, dx + 58, hy - 82, dx + 56, hy - 18); ctx.bezierCurveTo(dx + 58, hy + 26, dx + 44, hy + 58, dx + 12, hy + 66); ctx.bezierCurveTo(dx - 16, hy + 70, dx - 44, hy + 40, dx - 46, hy - 20); ctx.closePath(); };
    ctx.fillStyle = L.rim; skull(rd); ctx.fill(); ctx.fillStyle = L.skin; skull(0); ctx.fill();
    ctx.save(); skull(0); ctx.clip(); ctx.fillStyle = 'rgba(120,70,50,.22)'; ctx.fillRect(-60, hy - 90, 30, 170); // side shade
    ctx.fillStyle = 'rgba(190,110,90,.25)'; ctx.beginPath(); ctx.ellipse(40, hy + 18, 14, 9, 0, 0, 6.283); ctx.fill(); // cheek warmth
    ctx.restore();
    // ear
    ctx.fillStyle = L.skinShade; ctx.beginPath(); ctx.ellipse(-40, hy + 2, 11, 18, -.1, 0, 6.283); ctx.fill(); ctx.fillStyle = L.skinDeep; ctx.beginPath(); ctx.ellipse(-40, hy + 2, 5, 9, -.1, 0, 6.283); ctx.fill();
    // hair: short silver, volume on top, swept up and back; shorter at the sides
    const hairP = () => { ctx.beginPath(); ctx.moveTo(-50, hy + 4); ctx.bezierCurveTo(-62, hy - 50, -44, hy - 104, 6, hy - 112); ctx.bezierCurveTo(46, hy - 118, 74, hy - 90, 66, hy - 52); ctx.bezierCurveTo(62, hy - 44, 56, hy - 46, 50, hy - 50); ctx.bezierCurveTo(30, hy - 62, 4, hy - 56, -18, hy - 48); ctx.bezierCurveTo(-30, hy - 40, -34, hy - 22, -32, hy - 4); ctx.lineTo(-38, hy + 12); ctx.closePath(); };
    ctx.fillStyle = L.hairDark; ctx.beginPath(); ctx.moveTo(-50, hy - 20); ctx.lineTo(-30, hy - 30); ctx.lineTo(-30, hy + 18); ctx.lineTo(-46, hy + 20); ctx.closePath(); ctx.fill(); // short side
    ctx.fillStyle = L.hairDark; ctx.save(); ctx.translate(-2, 3); hairP(); ctx.fill(); ctx.restore();
    ctx.fillStyle = L.hair; hairP(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2.5; for (let k = 0; k < 8; k++) { ctx.beginPath(); ctx.moveTo(-34 + k * 11, hy - 52 - k * .5); ctx.quadraticCurveTo(-26 + k * 12, hy - 100, 20 + k * 7, hy - 106 + k * 5); ctx.stroke(); }
    // features, 3/4 view facing +x
    const ex = 20 + P.look * 3;
    ctx.strokeStyle = L.brow; ctx.lineCap = 'round'; ctx.lineWidth = 5.5;
    ctx.beginPath(); ctx.moveTo(4, hy - 26); ctx.quadraticCurveTo(18, hy - 33, 34, hy - 26); ctx.stroke(); ctx.beginPath(); ctx.moveTo(42, hy - 26); ctx.quadraticCurveTo(50, hy - 29, 56, hy - 24); ctx.stroke();
    const eye = (x0, w) => { ctx.fillStyle = '#f4efe8'; ctx.beginPath(); ctx.ellipse(x0, hy - 10, w, 4.5, 0, 0, 6.283); ctx.fill(); ctx.fillStyle = L.iris; ctx.beginPath(); ctx.arc(x0 + P.look * 2 + 1, hy - 10, 4.2, 0, 6.283); ctx.fill(); ctx.fillStyle = '#1b1614'; ctx.beginPath(); ctx.arc(x0 + P.look * 2 + 1, hy - 10, 2, 0, 6.283); ctx.fill();
      ctx.strokeStyle = '#5a3c30'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.ellipse(x0, hy - 10, w, 4.5, 0, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke();
      ctx.strokeStyle = 'rgba(120,70,50,.45)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x0 + w, hy - 8); ctx.lineTo(x0 + w + 6, hy - 4); ctx.stroke(); }; // smile lines at eye corner
    eye(ex, 9); eye(ex + 30, 6);
    ctx.strokeStyle = L.skinDeep; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(44, hy - 8); ctx.quadraticCurveTo(60, hy + 16, 46, hy + 20); ctx.stroke(); // nose
    ctx.strokeStyle = 'rgba(140,80,60,.45)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(22, hy + 18); ctx.quadraticCurveTo(18, hy + 36, 24, hy + 46); ctx.stroke(); // smile fold
    // mouth: warm smile, opens when speaking
    const my = hy + 40, sm = P.smile, op = P.mouth;
    ctx.fillStyle = '#6e2e28'; ctx.beginPath(); ctx.moveTo(24, my - 2 * sm); ctx.quadraticCurveTo(36, my + 6 + op * 12 + sm * 4, 50, my - 3 * sm); ctx.quadraticCurveTo(37, my + 1, 24, my - 2 * sm); ctx.fill();
    if (sm > .3 || op > .2) { ctx.fillStyle = '#f3efe6'; ctx.beginPath(); ctx.moveTo(27, my - 1); ctx.quadraticCurveTo(37, my + 3 + op * 4, 47, my - 2); ctx.quadraticCurveTo(37, my + 1, 27, my - 1); ctx.fill(); }
    ctx.restore();
    // front arm + hand + prop
    const f = limb(ctx, 66, shY + 30, 158, 146, P.armF[0], P.armF[1], 48, 42, L.sweater, L.rim, rd * .4);
    if (P.hold) { ctx.save(); ctx.translate(f[0], f[1]); P.hold(ctx); ctx.restore(); }
    hand(ctx, L, f[0], f[1], f[2], P.openF);
    ctx.restore();
  };

  // ---- SCENERY -------------------------------------------------------------
  // Uruk-period marsh at dusk: river, reed houses (as on Uruk-period seals), date palms.
  KIT.marsh = (ctx, t, cam = 0) => {
    const sky = ctx.createLinearGradient(0, 0, 0, 640); sky.addColorStop(0, '#221a33'); sky.addColorStop(.45, '#7a3b3a'); sky.addColorStop(.8, '#e08a4a'); sky.addColorStop(1, '#f5c27a');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, 660);
    KIT.glow(ctx, 1260 - cam * .1, 600, 520, 'rgba(255,190,110,A)', .55);
    ctx.fillStyle = '#ffd9a0'; ctx.beginPath(); ctx.arc(1260 - cam * .1, 610, 70, 0, 6.283); ctx.fill();
    // clouds
    const r = rng(8); ctx.fillStyle = 'rgba(60,30,40,.35)'; for (let i = 0; i < 7; i++) { const cx = (r() * W * 1.2 - cam * .15 + t * 6) % (W + 400) - 200, cy = 120 + r() * 300; ctx.beginPath(); ctx.ellipse(cx, cy, 200 + r() * 260, 14 + r() * 16, 0, 0, 6.283); ctx.fill(); }
    // far bank
    ctx.fillStyle = '#3a2230'; ctx.beginPath(); ctx.moveTo(0, 640); for (let x = 0; x <= W; x += 40) ctx.lineTo(x, 628 - Math.sin(x * .01 + 1) * 6); ctx.lineTo(W, 660); ctx.lineTo(0, 660); ctx.fill();
    // reed houses (mudhif-style arched reed halls) + palms on mid bank
    const mid = (x0) => x0 - cam * .4;
    const palm = (x, yb, h, seed) => { const rr = rng(seed); ctx.strokeStyle = '#1e1016'; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(x, yb); ctx.quadraticCurveTo(x + 20, yb - h * .5, x + 10 + rr() * 20, yb - h); ctx.stroke(); const tx = x + 16, ty = yb - h; ctx.fillStyle = '#1e1016';
      for (let k = 0; k < 9; k++) { const a = -Math.PI + k / 8 * Math.PI + Math.sin(t * .8 + k + seed) * .05; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + Math.cos(a) * 70, ty + Math.sin(a) * 70 - 20, tx + Math.cos(a) * 130, ty + Math.sin(a) * 60 + 50); ctx.quadraticCurveTo(tx + Math.cos(a) * 60, ty + Math.sin(a) * 50, tx, ty); ctx.fill(); } };
    const mudhif = (x, yb, w, h) => { ctx.fillStyle = '#26141b'; ctx.beginPath(); ctx.moveTo(x - w / 2, yb); ctx.lineTo(x - w / 2, yb - h * .55); ctx.quadraticCurveTo(x, yb - h * 1.25, x + w / 2, yb - h * .55); ctx.lineTo(x + w / 2, yb); ctx.fill();
      ctx.strokeStyle = 'rgba(255,170,110,.18)'; ctx.lineWidth = 3; for (let k = 1; k < 6; k++) { const xx = x - w / 2 + k * w / 6; ctx.beginPath(); ctx.moveTo(xx, yb); ctx.lineTo(xx, yb - h * .75); ctx.stroke(); }
      ctx.fillStyle = 'rgba(255,170,90,.55)'; ctx.beginPath(); ctx.ellipse(x, yb - h * .2, w * .07, h * .2, 0, Math.PI, 0); ctx.fill(); };
    palm(mid(180), 690, 300, 1); palm(mid(420), 690, 360, 2); mudhif(mid(640), 690, 260, 170); mudhif(mid(900), 690, 200, 130); palm(mid(1560), 690, 330, 3); palm(mid(1780), 690, 280, 4); mudhif(mid(1640), 690, 180, 120);
    ctx.fillStyle = '#2a1520'; ctx.fillRect(0, 684, W, 20);
    // river with reflection
    const wat = ctx.createLinearGradient(0, 700, 0, H); wat.addColorStop(0, '#c9784a'); wat.addColorStop(.4, '#5c2f36'); wat.addColorStop(1, '#1a1020'); ctx.fillStyle = wat; ctx.fillRect(0, 700, W, H - 700);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < 26; i++) { const yy = 710 + i * i * .55; const w2 = 300 - i * 9; ctx.fillStyle = `rgba(255,200,130,${.35 - i * .012})`; ctx.fillRect(1260 - cam * .1 - w2 / 2 + Math.sin(t * 2 + i) * 12, yy, w2, 3); } ctx.restore();
    // reed canoe with a punting silhouette (no faces)
    const bxp = 1100 - cam * .5 + Math.sin(t * .3) * 20; ctx.fillStyle = '#1b0e14'; ctx.beginPath(); ctx.moveTo(bxp - 120, 760); ctx.quadraticCurveTo(bxp, 790, bxp + 120, 748); ctx.quadraticCurveTo(bxp, 772, bxp - 120, 760); ctx.fill();
    ctx.fillRect(bxp - 8, 690, 16, 70); ctx.beginPath(); ctx.arc(bxp, 680, 13, 0, 6.283); ctx.fill(); ctx.strokeStyle = '#1b0e14'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(bxp + 30, 620); ctx.lineTo(bxp - 40, 800); ctx.stroke();
  };
  // foreground reeds (drawn after presenter for depth)
  KIT.reedsFG = (ctx, t, cam = 0, blur = 4) => {
    ctx.save(); ctx.filter = `blur(${blur}px)`; const r = rng(21); ctx.strokeStyle = '#0d0709'; ctx.fillStyle = '#0d0709';
    for (let i = 0; i < 70; i++) { const x = (r() * (W + 600) - cam * 1.3) % (W + 600) - 300; const side = x < 520 || x > 1500; if (!side) continue; const h = 200 + r() * 360; const sway = Math.sin(t * 1.3 + i) * 10; ctx.lineWidth = 5 + r() * 6; ctx.beginPath(); ctx.moveTo(x, H + 10); ctx.quadraticCurveTo(x + sway * .5, H - h * .6, x + sway + (r() - .5) * 40, H - h); ctx.stroke();
      if (r() < .35) { ctx.beginPath(); ctx.ellipse(x + sway + (r() - .5) * 40, H - h - 10, 9, 34, (r() - .5) * .5, 0, 6.283); ctx.fill(); } }
    ctx.restore();
  };

  // Night archive hall: receding columns, high windows, light shafts, a wall for projected text.
  KIT.hall = (ctx, t, cam = 0) => {
    ctx.fillStyle = '#0b0a0c'; ctx.fillRect(0, 0, W, H);
    const vx = W / 2 - cam * .2, vy = 470;
    const wall = ctx.createLinearGradient(0, 120, 0, 760); wall.addColorStop(0, '#15131a'); wall.addColorStop(1, '#231d1c'); ctx.fillStyle = wall; ctx.fillRect(vx - 620, 120, 1240, 640);
    // floor
    const fl = ctx.createLinearGradient(0, 760, 0, H); fl.addColorStop(0, '#2a211c'); fl.addColorStop(1, '#0c0908'); ctx.fillStyle = fl; ctx.beginPath(); ctx.moveTo(vx - 620, 760); ctx.lineTo(vx + 620, 760); ctx.lineTo(W + 400, H); ctx.lineTo(-400, H); ctx.fill();
    ctx.strokeStyle = 'rgba(255,220,170,.05)'; ctx.lineWidth = 2; for (let i = -8; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(vx + i * 78, 760); ctx.lineTo(vx + i * 320, H); ctx.stroke(); }
    // columns receding on both sides
    for (let side of [-1, 1]) for (let k = 4; k >= 0; k--) {
      const d = 1 / (1 + k * .55); const cx = vx + side * (700 * d + 60), w = 120 * d, top = vy - 560 * d, bot = vy + 420 * d;
      const g = ctx.createLinearGradient(cx - w / 2, 0, cx + w / 2, 0); g.addColorStop(0, side < 0 ? '#3b322c' : '#16121a'); g.addColorStop(1, side < 0 ? '#16121a' : '#3b322c');
      ctx.fillStyle = g; ctx.fillRect(cx - w / 2, top, w, bot - top); ctx.fillStyle = '#2a231f'; ctx.fillRect(cx - w * .65, top, w * 1.3, 26 * d); ctx.fillRect(cx - w * .65, bot - 26 * d, w * 1.3, 26 * d);
    }
    // high windows + shafts
    for (const [wx, a] of [[vx - 360, .16], [vx + 360, .12]]) { ctx.fillStyle = 'rgba(160,180,210,.25)'; ctx.fillRect(wx - 50, 150, 100, 160); KIT.shaft(ctx, wx, 100, wx + 260, 420, 230, 1000, a); }
    KIT.dust(ctx, t, 5, 140, [vx - 300, 200, 900, 800], .5);
  };

  // Desert at golden hour with colocynth vines on the sand.
  KIT.desert = (ctx, t, cam = 0) => {
    const sky = ctx.createLinearGradient(0, 0, 0, 600); sky.addColorStop(0, '#3d5a73'); sky.addColorStop(.6, '#d9a066'); sky.addColorStop(1, '#f3cf8e'); ctx.fillStyle = sky; ctx.fillRect(0, 0, W, 640);
    KIT.glow(ctx, 360 - cam * .1, 470, 600, 'rgba(255,220,150,A)', .6); ctx.fillStyle = '#fff1c8'; ctx.beginPath(); ctx.arc(360 - cam * .1, 470, 80, 0, 6.283); ctx.fill();
    const dune = (base, amp, f, ph, col, par) => { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, base - Math.sin((x + cam * par) * f + ph) * amp - Math.sin((x + cam * par) * f * 2.7 + ph) * amp * .3); ctx.lineTo(W, H); ctx.fill(); };
    dune(600, 30, .004, 1, '#c98d5b', .15); dune(680, 45, .003, 3, '#b8774a', .35);
    // heat shimmer band
    ctx.save(); ctx.globalAlpha = .12; ctx.fillStyle = '#fff'; for (let i = 0; i < 6; i++) ctx.fillRect(0, 590 + i * 9 + Math.sin(t * 3 + i) * 2, W, 2); ctx.restore();
    dune(820, 60, .0022, 5, '#a2643c', .7);
    const sand = ctx.createLinearGradient(0, 820, 0, H); sand.addColorStop(0, 'rgba(0,0,0,0)'); sand.addColorStop(1, 'rgba(40,18,10,.6)'); ctx.fillStyle = sand; ctx.fillRect(0, 700, W, H - 700);
    // vines + gourds scattered on the sand
    const r = rng(33); for (let i = 0; i < 7; i++) { const x = 200 + i * 260 + r() * 100 - cam * .8, y = 880 + r() * 120; ctx.strokeStyle = '#4a5a24'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - 140, y + 10); ctx.bezierCurveTo(x - 60, y - 30, x + 40, y + 40, x + 150, y - 5); ctx.stroke();
      for (let k = 0; k < 3; k++) { ctx.fillStyle = '#556b2a'; const lx = x - 100 + k * 90, ly = y - 8 + (k % 2) * 16; ctx.beginPath(); for (let j = 0; j <= 20; j++) { const th = j / 20 * 6.283, rr = 26 * (.55 + .45 * Math.abs(Math.cos(th * 2.5))); ctx.lineTo(lx + Math.cos(th) * rr, ly + Math.sin(th) * rr * .6); } ctx.fill(); }
      KIT.gourd(ctx, x + 40 + r() * 40, y + 6, .5 + r() * .25, t, 50 + i); }
  };

  KIT.gourd = (ctx, x, y, s, t, seed, rot = 0) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s); const R = 60, r = rng(seed);
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 8; ctx.fillStyle = '#6f8a3a'; ctx.beginPath(); ctx.ellipse(0, 0, R * 1.04, R, 0, 0, 6.283); ctx.fill(); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.ellipse(0, 0, R * 1.04, R, 0, 0, 6.283); ctx.clip();
    for (let i = 0; i < 9; i++) { const a = -1.2 + i * .3; ctx.strokeStyle = 'rgba(226,220,160,.55)'; ctx.lineWidth = 7 + r() * 5; ctx.beginPath(); for (let k = 0; k <= 12; k++) { const yy = -R + k / 12 * 2 * R; const xx = Math.sin(a) * Math.sqrt(Math.max(0, R * R - yy * yy)) * 1.04 + (r() - .5) * 5; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); }
    const hl = ctx.createRadialGradient(-22, -26, 4, -10, -10, R * 1.3); hl.addColorStop(0, 'rgba(255,255,220,.4)'); hl.addColorStop(1, 'rgba(0,0,0,.4)'); ctx.fillStyle = hl; ctx.fillRect(-R * 1.2, -R * 1.2, R * 2.4, R * 2.4); ctx.restore();
    ctx.strokeStyle = '#5a4a2a'; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, -R + 4); ctx.quadraticCurveTo(6, -R - 14, 18, -R - 20); ctx.stroke(); ctx.restore();
  };
  KIT.poppy = (ctx, x, y, s, grey = 0) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); const petal = grey ? '#6d625a' : '#c0392b', petal2 = grey ? '#5b514a' : '#9e2a1f';
    ctx.strokeStyle = grey ? '#4e5a45' : '#4f7a3a'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(0, 20); ctx.bezierCurveTo(10, 120, -18, 200, 6, 300); ctx.stroke();
    const pet = (a, c) => { ctx.save(); ctx.rotate(a); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(-70, -20, -80, -110, -10, -118); ctx.bezierCurveTo(50, -120, 75, -30, 0, 0); ctx.fill(); ctx.restore(); };
    pet(-.9, petal2); pet(.9, petal2); pet(-.35, petal); pet(.35, petal); ctx.fillStyle = '#1b1411'; ctx.beginPath(); ctx.arc(0, -8, 22, 0, 6.283); ctx.fill(); ctx.restore();
  };
})();

// ---- AVATAR (image-based presenter) ------------------------------------------
// Cut-out bust with a paper "sticker" edge, relit per scene.
// opts: { flip, tint (multiply colour), rim (rgba colour), rimSide: -1 left / 1 right, sway, pop 0..1 }
(function () {
  const load = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = src; });
  KIT.avatarReady = Promise.all([load('assets/avatar_cut.png'), load('assets/avatar_border.png')]).then(([a, b]) => { KIT.AV = a; KIT.AVB = b; });
  let off = null, msk = null;
  KIT.avatar = (ctx, cx, bottom, h, t, o = {}) => {
    const O = Object.assign({ flip: false, tint: '#ffffff', tintA: .35, rim: 'rgba(255,210,150,.9)', rimSide: 1, sway: 1, pop: 1 }, o);
    const img = KIT.AV, bor = KIT.AVB; if (!img) return;
    const s = h / img.height, w = img.width * s;
    if (!off) { off = document.createElement('canvas'); msk = document.createElement('canvas'); }
    msk.width = Math.ceil(w); msk.height = Math.ceil(h); const mg = msk.getContext('2d'); mg.clearRect(0, 0, w, h); mg.drawImage(bor, 0, 0, w, h); mg.drawImage(img, 0, 0, w, h);
    off.width = Math.ceil(w); off.height = Math.ceil(h); const g = off.getContext('2d');
    g.clearRect(0, 0, off.width, off.height);
    g.drawImage(bor, 0, 0, w, h); g.drawImage(img, 0, 0, w, h);
    // relight: multiply tint, rim light from one side, paper grain
    g.globalCompositeOperation = 'source-atop';
    g.globalAlpha = O.tintA; g.fillStyle = O.tint; g.globalCompositeOperation = 'multiply'; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'source-atop'; g.globalAlpha = 1;
    const lx = O.rimSide > 0 ? w : 0; const rg = g.createLinearGradient(lx, 0, w / 2, 0); rg.addColorStop(0, O.rim); rg.addColorStop(.35, 'rgba(0,0,0,0)');
    g.globalCompositeOperation = 'soft-light'; g.fillStyle = rg; g.fillRect(0, 0, w, h);
    g.globalCompositeOperation = 'source-atop'; g.globalAlpha = .25; g.fillStyle = g.createPattern(KIT.GRAIN_D, 'repeat'); g.fillRect(0, 0, w, h);
    g.globalAlpha = 1; g.globalCompositeOperation = 'destination-in'; g.drawImage(msk, 0, 0); g.globalCompositeOperation = 'source-over';
    // place: idle breathing + sway, optional pop-in bounce
    const br = 1 + Math.sin(t * 1.7) * .006 * O.sway, rot = Math.sin(t * .9) * .012 * O.sway;
    const k = Math.min(1, Math.max(0, O.pop)); const bounce = k < 1 ? 1 - Math.pow(1 - k, 3) * Math.cos(k * 9) : 1;
    ctx.save(); ctx.translate(cx, bottom + (1 - bounce) * h * .4); ctx.rotate(rot * (O.flip ? -1 : 1)); ctx.scale((O.flip ? -1 : 1) * br, br);
    ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 40; ctx.shadowOffsetX = 14 * (O.flip ? 1 : -1); ctx.shadowOffsetY = 10;
    ctx.drawImage(off, -w / 2, -h, w, h); ctx.restore();
  };
})();
