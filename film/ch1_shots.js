'use strict';
// ---------------------------------------------------------------------------
// Chapter One, full film: every shot beyond the pilot. Loaded by pilot.html?film=1
// and spliced into SHOTS by window.CH1. Draw code runs later, so it can use the
// pilot's helpers (ctx, font, textC, card, strike, fade, ramp, KIT.*, ...).
// Narration text = SCRIPT v2 (see SCRIPT-v2-CHANGES.md).
// ---------------------------------------------------------------------------
(function () {
  const wt = (S, li, wi) => S.cues[li] + wi * S.spw[li];             // time of word wi in line li
  const lineEnd = (S, li) => S.cues[li] + S.durs[li];
  const AV = {
    study: { tint: '#c9a27a', tintA: .4, rim: 'rgba(255,200,130,.9)', rimSide: -1 },
    lab: { tint: '#9fb4c8', tintA: .35, rim: 'rgba(180,220,255,.8)', rimSide: 1 },
    warm: { tint: '#e0b48a', tintA: .35, rim: 'rgba(255,200,140,.9)', rimSide: 1 },
    dusk: { tint: '#e4a58a', tintA: .5, rim: 'rgba(255,170,90,1)', rimSide: 1 },
    night: { tint: '#8a93b8', tintA: .5, rim: 'rgba(255,190,120,.8)', rimSide: -1 },
    dark: { tint: '#a89a8a', tintA: .45, rim: 'rgba(255,215,160,.9)', rimSide: 1 },
  };
  const avatar = (t, x, look, opts = {}, popAt = .3, h = 780, flip = false) =>
    KIT.avatar(ctx, x, 1110, h, t, Object.assign({ flip, pop: ramp(t, popAt, popAt + 1) }, AV[look], opts));
  const finish = (t, v = .7) => { KIT.vignette(ctx, v); KIT.filmGrain(ctx, t, .3); };
  const txt = (s, x, y, size, col, a = 1, style = 'normal', weight = 400, fam = SERIF) => { if (a <= 0) return; font(size, fam, weight, style); textC(s, x, y, col, a); };
  const glowText = (s, x, y, size, col, a = 1, weight = 400, style = 'normal') => { if (a <= 0) return; ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 26; txt(s, x, y, size, col, a, style, weight); ctx.restore(); };
  const quoteCard = (t, S, q, src, li = 0) => {
    ctx.fillStyle = '#070606'; ctx.fillRect(0, 0, W, H);
    font(52, SERIF, 400, 'italic'); const lines = wrap(q, 1400); const n = lines.length;
    lines.forEach((l, i) => textC(l, W / 2, 540 - (n - 1) * 36 + i * 72, C.text, fade(t, S.cues[li] + i * .5, .7)));
    txt(src, W / 2, 540 + (n + 1) * 36 + 40, 28, C.dim, fade(t, S.cues[li] + .8, .6), 'italic');
  };

  // ---- environments --------------------------------------------------------
  const ENV = {};
  ENV.study = (t, cam = 0) => {  // a scholar's study, 1910s–20s, lamp-lit
    const wall = ctx.createLinearGradient(0, 0, 0, H); wall.addColorStop(0, '#1f1712'); wall.addColorStop(1, '#2d2016'); ctx.fillStyle = wall; ctx.fillRect(0, 0, W, H);
    const r = rng(41); const ox = -cam * .3;
    for (let row = 0; row < 4; row++) { const y = 120 + row * 150; ctx.fillStyle = '#3a2718'; ctx.fillRect(0, y + 118, W, 14);
      let x = ox % 40 - 40; while (x < W) { const w = 16 + r() * 22, h = 70 + r() * 45; ctx.fillStyle = ['#5a2d22', '#2f3b33', '#3b3150', '#6a5230', '#4a3a28', '#2a2a3a'][Math.floor(r() * 6)]; ctx.fillRect(x, y + 118 - h, w - 2, h); x += w; } }
    ctx.fillStyle = 'rgba(10,6,4,.55)'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#2a1c12'; ctx.fillRect(0, 760, W, H - 760); ctx.fillStyle = '#3b2819'; ctx.fillRect(0, 760, W, 16);
    KIT.glow(ctx, 1500 - cam * .2, 640, 700, 'rgba(255,190,110,A)', .38);
    ctx.fillStyle = '#1a120c'; ctx.beginPath(); ctx.moveTo(1440 - cam * .2, 700); ctx.lineTo(1560 - cam * .2, 700); ctx.lineTo(1530 - cam * .2, 640); ctx.lineTo(1470 - cam * .2, 640); ctx.fill();
    ctx.fillRect(1495 - cam * .2, 700, 10, 60);
    KIT.dust(ctx, t, 44, 70, [0, 0, W, H], .35);
  };
  ENV.lab = t => {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#16202a'); g.addColorStop(1, '#0c1117'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#1e2a35'; ctx.fillRect(0, 700, W, 30); ctx.fillStyle = '#121a22'; ctx.fillRect(0, 730, W, H - 730);
    const r = rng(52); for (let i = 0; i < 14; i++) { const x = 60 + i * 135, h = 60 + r() * 90; ctx.fillStyle = 'rgba(150,190,220,.18)'; ctx.beginPath(); ctx.roundRect(x, 700 - h, 40 + r() * 30, h, 8); ctx.fill(); }
    for (let i = 0; i < 3; i++) { ctx.fillStyle = 'rgba(200,230,255,.05)'; ctx.fillRect(0, 150 + i * 150, W, 4); }
    KIT.glow(ctx, 960, 380, 800, 'rgba(120,190,255,A)', .14);
  };
  ENV.brewery = (t, cam = 0) => {  // warm 1980s brewhouse: copper kettles, pipes
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a1a10'); g.addColorStop(1, '#402414'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (const [x, s] of [[300, 1.1], [760, 1.3], [1640, 1]]) { const X = x - cam * .3; const k = ctx.createLinearGradient(X - 200 * s, 0, X + 200 * s, 0); k.addColorStop(0, '#6e3a1c'); k.addColorStop(.4, '#d88a4a'); k.addColorStop(.55, '#f3b07a'); k.addColorStop(1, '#5a2e16');
      ctx.fillStyle = k; ctx.beginPath(); ctx.ellipse(X, 520, 200 * s, 150 * s, 0, Math.PI, 0); ctx.lineTo(X + 200 * s, 760); ctx.lineTo(X - 200 * s, 760); ctx.fill();
      ctx.fillStyle = '#b8683a'; ctx.fillRect(X - 14, 520 - 150 * s - 160, 28, 170); }
    ctx.strokeStyle = '#8a4a26'; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(0, 180); ctx.lineTo(W, 180); ctx.stroke();
    ctx.fillStyle = '#23150c'; ctx.fillRect(0, 760, W, H - 760);
    KIT.glow(ctx, 960, 300, 900, 'rgba(255,180,100,A)', .16); KIT.dust(ctx, t, 61, 60, [0, 0, W, H], .3);
  };
  ENV.dig = (t, cam = 0) => {  // excavation seen from above: ochre soil, string grid
    ctx.fillStyle = '#8a6a44'; ctx.fillRect(0, 0, W, H);
    const r = rng(71); for (let i = 0; i < 260; i++) { ctx.fillStyle = `rgba(${60 + r() * 60},${40 + r() * 40},${20 + r() * 20},.25)`; ctx.beginPath(); ctx.ellipse(r() * W, r() * H, 20 + r() * 80, 10 + r() * 40, r() * 3, 0, 6.28); ctx.fill(); }
    ctx.strokeStyle = 'rgba(245,235,210,.55)'; ctx.lineWidth = 2; for (let x = -cam % 160; x < W; x += 160) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y < H; y += 160) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(0, 0, W, H);
  };
  ENV.giza = t => pyramidDusk(t, 1);
  ENV.london = (t, cam = 0) => {  // 1730s street at night: timber-framed gables, lamplight, fog
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#05060c'); g.addColorStop(1, '#0e0e14'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#e8e4d0'; ctx.beginPath(); ctx.arc(1600, 150, 44, 0, 6.28); ctx.fill(); KIT.glow(ctx, 1600, 150, 200, 'rgba(220,220,255,A)', .2);
    const r = rng(81);
    for (let i = 0; i < 9; i++) { const x = i * 230 - 40 - cam * .4, w = 200 + r() * 40, h = 380 + r() * 180, top = 820 - h;
      ctx.fillStyle = ['#2a2630', '#252230', '#2e2a2a'][i % 3]; ctx.beginPath(); ctx.moveTo(x, 820); ctx.lineTo(x, top + 80); ctx.lineTo(x + w / 2, top); ctx.lineTo(x + w, top + 80); ctx.lineTo(x + w, 820); ctx.fill();
      ctx.strokeStyle = 'rgba(60,50,40,.6)'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, top + 200); ctx.lineTo(x + w, top + 200); ctx.moveTo(x + w / 2, top + 80); ctx.lineTo(x + w / 2, 820); ctx.stroke();
      for (let k = 0; k < 3; k++) if (r() < .55) { ctx.fillStyle = 'rgba(255,190,100,.75)'; ctx.fillRect(x + 30 + k * 55, top + 240 + (k % 2) * 120, 30, 44); } }
    ctx.fillStyle = '#0d0d12'; ctx.fillRect(0, 820, W, H - 820);
    for (let i = 0; i < 40; i++) { ctx.fillStyle = 'rgba(80,80,90,.25)'; ctx.beginPath(); ctx.ellipse((i * 97 - cam) % W, 860 + (i % 5) * 45, 40, 10, 0, 0, 6.28); ctx.fill(); }
    KIT.glow(ctx, 520, 640, 300, 'rgba(255,190,110,A)', .5);
    ctx.save(); ctx.globalAlpha = .18; for (let i = 0; i < 5; i++) { ctx.fillStyle = '#9aa0b0'; ctx.beginPath(); ctx.ellipse(((i * 500 + t * 20) % (W + 800)) - 400, 760 + i * 30, 500, 60, 0, 0, 6.28); ctx.fill(); } ctx.restore();
  };
  ENV.paper = t => { ground(t, '#1a1512'); };

  // ---- props -------------------------------------------------------------------
  function figure(x, y, s, t, seed, pose = 'desk', col = '#0e0a08') {   // faceless silhouette
    const [bx, by] = boil(t, seed, .8); ctx.save(); ctx.translate(x + bx, y + by); ctx.scale(s, s); ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(0, -150, 32, 0, 6.28); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-48, -110); ctx.quadraticCurveTo(0, -128, 48, -110); ctx.lineTo(56, pose === 'stand' ? 60 : 0); ctx.lineTo(-56, pose === 'stand' ? 60 : 0); ctx.fill();
    if (pose === 'desk') { ctx.fillRect(-110, 0, 260, 18); ctx.fillRect(-100, 18, 14, 90); ctx.fillRect(120, 18, 14, 90); ctx.beginPath(); ctx.moveTo(30, -70); ctx.lineTo(110, -10); ctx.lineTo(96, 2); ctx.lineTo(24, -52); ctx.fill(); }
    if (pose === 'bend') { ctx.rotate(.3); }
    if (pose === 'stand') { ctx.fillRect(-40, 60, 30, 150); ctx.fillRect(10, 60, 30, 150); }
    if (pose === 'sit') { ctx.fillRect(-56, 0, 130, 40); ctx.fillRect(40, 40, 30, 70); }
    ctx.restore();
  }
  function linkCard(x, y, w, h, date, title, seed, a, hi = false) {
    if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; card(x, y, w, h, seed, hi ? '#f1e6cc' : C.paper, .45);
    txt(date, x + w / 2, y + 46, 34, C.red, 1, 'normal', 600); font(26, SERIF, 400, 'italic'); wrap(title, w - 30).forEach((l, i) => textC(l, x + w / 2, y + 86 + i * 32, C.ink)); ctx.restore();
  }
  function chainLinks(xs, y, a) { ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = '#b89a6a'; ctx.lineWidth = 6; for (let i = 0; i < xs.length - 1; i++) { ctx.beginPath(); ctx.ellipse((xs[i] + xs[i + 1]) / 2, y, 34, 16, 0, 0, 6.28); ctx.stroke(); } ctx.restore(); }
  function book(x, y, s, open, t, seed = 5) {  // open: 0 closed → 1 open
    const [bx, by] = boil(t, seed, .6); ctx.save(); ctx.translate(x + bx, y + by); ctx.scale(s, s);
    ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.filter = 'blur(12px)'; ctx.fillRect(-250, 150, 500, 40); ctx.filter = 'none';
    if (open < .5) { const k = 1 - open * 2; ctx.save(); ctx.scale(1, 1); roughRect(-170, -230, 340, 460, seed); paperFill('#5a1f18', .6);
      ctx.globalAlpha = k; font(46, SERIF, 600); textC('Vice & Versa', 0, -60, '#efe0c0'); font(24, SERIF, 400, 'italic'); textC('A History of Addiction', 0, -18, '#d8c6a0');
      ctx.fillStyle = '#A32A1E'; ctx.fillRect(-90, 20, 180, 4); ctx.restore(); }
    else { const k = (open - .5) * 2; roughRect(-340 * k, -230, 340 * k, 460, seed + 1); paperFill('#efe4cb', .4); roughRect(0, -230, 340, 460, seed + 2); paperFill('#f3e9d2', .4);
      ctx.globalAlpha = k; font(22, SERIF, 400, 'italic'); textC('Chapter One', 170, -120, '#6a5a48'); font(44, SERIF, 600); textC('The Joy Plant', 170, -60, C.ink);
      ctx.fillStyle = 'rgba(42,33,26,.25)'; for (let i = 0; i < 9; i++) ctx.fillRect(50, -10 + i * 22, 240 - (i === 8 ? 90 : 0), 5); }
    ctx.restore();
  }
  function bubble(x, y, w, h, a, popP = 0) {
    if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a * (1 - popP); const s = 1 + popP * .6; ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = '#f4ecd8'; ctx.beginPath(); ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, 6.28); ctx.fill(); ctx.beginPath(); ctx.moveTo(-30, h / 2 - 10); ctx.lineTo(-70, h / 2 + 60); ctx.lineTo(10, h / 2 - 6); ctx.fill();
    font(30, SERIF, 400, 'italic'); textC('“personal communication”', 0, 10, C.ink); ctx.restore();
    if (popP > 0 && popP < 1) { const r = rng(9); ctx.save(); ctx.globalAlpha = 1 - popP; ctx.fillStyle = '#f4ecd8'; for (let i = 0; i < 14; i++) { const a2 = r() * 6.28, d = popP * (120 + r() * 160); ctx.beginPath(); ctx.arc(x + Math.cos(a2) * d, y + Math.sin(a2) * d, 6 + r() * 8, 0, 6.28); ctx.fill(); } ctx.restore(); }
  }
  function seedHead(x, y, s, t) {  // dried poppy seed capsule (no incisions)
    const [bx, by] = boil(t, 13, .7); ctx.save(); ctx.translate(x + bx, y + by); ctx.scale(s, s);
    ctx.strokeStyle = '#7a6a48'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, 60); ctx.quadraticCurveTo(10, 200, -6, 320); ctx.stroke();
    const g = ctx.createRadialGradient(-20, -10, 10, 0, 0, 90); g.addColorStop(0, '#d8c69a'); g.addColorStop(1, '#8c7446'); ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, 70, 78, 0, 0, 6.28); ctx.fill();
    ctx.fillStyle = '#6a5634'; for (let i = 0; i < 10; i++) { ctx.save(); ctx.translate(0, -78); ctx.rotate(-1.2 + i * .27); ctx.fillRect(-4, -4, 8, 34); ctx.restore(); }
    ctx.fillStyle = '#5a4428'; ctx.beginPath(); ctx.ellipse(0, -80, 44, 12, 0, 0, 6.28); ctx.fill(); ctx.restore();
  }
  function spectrum(x, y, w, h, p, t) {  // stylised mass-spectrometer trace
    ctx.save(); ctx.fillStyle = 'rgba(8,16,24,.85)'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = 'rgba(140,200,255,.25)'; ctx.lineWidth = 1; for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(x, y + i * h / 5); ctx.lineTo(x + w, y + i * h / 5); ctx.stroke(); }
    const r = rng(3); const peaks = [[.22, .5], [.37, .95], [.52, .35], [.64, .8], [.8, .45]];
    ctx.strokeStyle = '#8fd0ff'; ctx.lineWidth = 3; ctx.beginPath();
    for (let i = 0; i <= 400 * p; i++) { const k = i / 400; let v = .04 + r() * .03; for (const [c, a] of peaks) v += a * Math.exp(-(((k - c) / .008) ** 2)); const X = x + k * w, Y = y + h - v * h * .85; i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }
    ctx.stroke(); ctx.restore();
  }
  function mapPin(x, y, label, a, col = C.red) { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, 12, 0, 6.28); ctx.fill(); ctx.strokeStyle = '#f4ecd8'; ctx.lineWidth = 3; ctx.stroke(); font(30, SERIF, 600); textL(label, x + 22, y + 10, '#f4ecd8'); ctx.restore(); }
  function dotted(x0, y0, x1, y1, p, col = '#f4ecd8') { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 4; ctx.setLineDash([2, 14]); ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(lerp(x0, x1, p), lerp(y0, y1, p)); ctx.stroke(); ctx.restore(); }
  function loaf(x, y, s, burnt) { ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = burnt ? '#6a3a1a' : '#c98a4a'; ctx.beginPath(); ctx.ellipse(0, 0, 50, 26, 0, Math.PI, 0); ctx.lineTo(50, 8); ctx.lineTo(-50, 8); ctx.fill(); ctx.strokeStyle = 'rgba(60,30,10,.5)'; ctx.lineWidth = 3; for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * 18 - 6, -18); ctx.lineTo(i * 18 + 6, -4); ctx.stroke(); } ctx.restore(); }
  function strawJar(x, y, s, t, seed) { jar(x, y, s, t, seed); ctx.save(); ctx.strokeStyle = '#d8b060'; ctx.lineWidth = 5 * s; for (const d of [-1, 1]) { ctx.beginPath(); ctx.moveTo(x + d * 10 * s, y - 110 * s); ctx.lineTo(x + d * 70 * s, y - 330 * s); ctx.stroke(); } ctx.restore(); }
  function vignetteCard(x, y, w, h, label, kind, t, seed, a) {
    if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; card(x, y, w, h, seed, '#241d18', .3);
    ctx.save(); ctx.beginPath(); ctx.rect(x + 10, y + 10, w - 20, h - 60); ctx.clip(); ctx.translate(x + w / 2, y + h - 60); ctx.fillStyle = '#0b0807';
    const r = rng(seed);
    if (kind === 'gin') { ctx.fillStyle = '#3a2a1a'; ctx.fillRect(-w / 2, -h, w, h); ctx.fillStyle = '#0b0807'; for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.ellipse(-80 + i * 80, -30, 30, 36, 0, 0, 6.28); ctx.fill(); } }
    if (kind === 'port') { ctx.fillStyle = '#1b2638'; ctx.fillRect(-w / 2, -h, w, h); ctx.fillStyle = '#0b0807'; ctx.beginPath(); ctx.moveTo(-120, -20); ctx.lineTo(120, -20); ctx.lineTo(90, 0); ctx.lineTo(-90, 0); ctx.fill(); ctx.fillRect(-4, -170, 8, 150); ctx.beginPath(); ctx.moveTo(4, -160); ctx.lineTo(90, -40); ctx.lineTo(4, -40); ctx.fill(); }
    if (kind === 'speak') { ctx.fillStyle = '#2a1a2a'; ctx.fillRect(-w / 2, -h, w, h); ctx.fillStyle = '#0b0807'; ctx.fillRect(-60, -170, 120, 170); ctx.fillStyle = 'rgba(255,200,120,.8)'; ctx.fillRect(-14, -140, 28, 16); }
    if (kind === 'army') { ctx.fillStyle = '#2a2a22'; ctx.fillRect(-w / 2, -h, w, h); ctx.fillStyle = '#0b0807'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(-120 + i * 60, -110, 14, 0, 6.28); ctx.fill(); ctx.fillRect(-134 + i * 60, -96, 28, 96); } }
    if (kind === 'board') { ctx.fillStyle = '#1e2430'; ctx.fillRect(-w / 2, -h, w, h); ctx.fillStyle = '#0b0807'; ctx.fillRect(-140, -50, 280, 16); for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.arc(-105 + i * 70, -80, 16, 0, 6.28); ctx.fill(); } ctx.strokeStyle = '#6a8a6a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(-120, -150); ctx.lineTo(-40, -130); ctx.lineTo(30, -170); ctx.lineTo(120, -190); ctx.stroke(); }
    ctx.restore(); font(24, SERIF, 400, 'italic'); textC(label, x + w / 2, y + h - 22, C.text); ctx.restore();
  }
  const PATTERN = ['arrives', 'ruins', 'profit · panic', 'ban', 'distance'];

  // ---- shots -------------------------------------------------------------------
  const SH = [];
  const add = (after, shot) => SH.push([after, shot]);

  // SCENE 2 — WHY START HERE
  add('title', { id: 'why', scene: 'Scene 2 — Why start here', pad: .8,
    lines: ["This is the first chapter of my book, Vice & Versa: A History of Addiction. The book spends 20 chapters taking numbers apart.",
      "I start here, on page one, because I'd rather show you the method than describe it. If the very oldest fact in the field doesn't survive being checked, you should want to know what else doesn't."],
    sfx(S) { return [{ t: .4, type: 'pop' }, { t: S.cues[1] - .2, type: 'whoosh' }]; },
    draw(t, S) { ENV.study(t, t * 5); book(760, 520, 1.15, ease(ramp(t, S.cues[1] - .3, S.cues[1] + 1)), t); avatar(t, 1560, 'study', {}, .4, 760, true); finish(t); } });

  // SCENE 4 — WHERE IT CAME FROM
  const CH = [['1916', 'Haupt: an Akkadian plant word might mean “poppy”'], ['c. 1924', 'Campbell Thompson: Assyrian medical texts, Nineveh'], ['1927', 'Neligan, The Opium Question, with Special Reference to Persia']];
  const chainX = [180, 700, 1220];
  function drawChain(t, S, upto, hiIdx) {
    chainLinks([chainX[0] + 240, chainX[1] + 240, chainX[2] + 240].slice(0, upto), 250, 1);
    for (let i = 0; i < upto; i++) linkCard(chainX[i], 170, 480, 160, CH[i][0], CH[i][1], 200 + i, 1, i === hiIdx);
  }
  add('resolve', { id: 'chain', scene: 'Scene 4 — Where it came from', pad: .6,
    lines: ["This is the part I find most useful, because the chain is short, you can trace every link of it, and at no point does anybody lie.",
      "In 1916 a scholar named Haupt floated the idea that a particular Akkadian plant word might mean poppy."],
    sfx(S) { return [{ t: .5, type: 'pop' }, { t: S.cues[1], type: 'thud' }]; },
    draw(t, S) { ENV.study(t, t * 4); if (t > S.cues[1]) { ctx.save(); ctx.globalAlpha = fade(t, S.cues[1], .6); linkCard(chainX[0], 170, 480, 160, CH[0][0], CH[0][1], 200, 1, true); ctx.restore(); figure(420, 760, 1.1, t, 21, 'desk'); }
      avatar(t, 1600, 'study', {}, .5, 720, true); finish(t); } });
  add('chain', { id: 'thompson', pad: .8,
    lines: ["Reginald Campbell Thompson, a British Assyriologist, worked on that identification.",
      "And it's worth being precise about what Thompson was working on: seventh-century BC Assyrian medical texts from the library at Nineveh.",
      "Not Sumerian. Not 3400 BC. Some 2,700 years later than the claim that now carries his name."],
    sfx(S) { return [{ t: S.cues[0], type: 'thud' }, { t: wt(S, 2, 1) + .2, type: 'scratch' }, { t: wt(S, 2, 4) + .2, type: 'scratch' }]; },
    draw(t, S) { ENV.study(t, 20 + t * 4); drawChain(t, S, 2, 1); figure(940, 760, 1.1, t, 22, 'desk');
      const c2 = S.cues[2]; if (t > c2 - .5) { ctx.save(); ctx.globalAlpha = fade(t, c2 - .5, .6); card(260, 430, 1400, 250, 230, '#241d18', .3);
        const X = yr => lerp(340, 1580, (3500 - yr) / 3000); ctx.strokeStyle = '#cbbda6'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(340, 590); ctx.lineTo(1580, 590); ctx.stroke();
        font(24, SERIF); [3500, 3000, 2500, 2000, 1500, 1000, 500].forEach(y => { ctx.fillStyle = '#cbbda6'; ctx.fillRect(X(y) - 1, 580, 2, 20); textC(y + ' BC', X(y), 630, '#cbbda6'); });
        mapPin(X(3400), 560, 'the claim: 3400 BC', 1); mapPin(X(650), 560, 'Nineveh texts', 1, '#d8b060');
        ctx.fillStyle = 'rgba(163,42,30,.35)'; ctx.fillRect(X(3400), 520, (X(650) - X(3400)) * ease(ramp(t, wt(S, 2, 6), wt(S, 2, 9))), 14);
        txt('≈ 2,700 years', (X(3400) + X(650)) / 2, 505, 34, '#f4ecd8', fade(t, wt(S, 2, 8), .5), 'normal', 600); ctx.restore(); }
      finish(t); } });
  add('thompson', { id: 'neligan', pad: .4,
    lines: ["In 1927 a British colonial physician called A. R. Neligan published a book on the opium question in Persia. In it he reported the identification, and the source he gave was a personal communication from Thompson."],
    sfx(S) { return [{ t: S.cues[0], type: 'thud' }, { t: wt(S, 0, 30), type: 'pop' }]; },
    draw(t, S) { ENV.study(t, 40 + t * 4); drawChain(t, S, 3, 2); bubble(1460, 470, 520, 150, fade(t, wt(S, 0, 30), .4)); finish(t); } });
  add('neligan', { id: 'bubble', pad: 1,
    lines: ["A private conversation. That's what the whole thing rests on.",
      "Not a text edition, not a published argument, not a tablet anybody can go and look at. A conversation, reported secondhand, in a book about a different country in a different century."],
    sfx(S) { return [{ t: .5, type: 'hit' }, { t: .5, type: 'pop' }]; },
    draw(t, S) { ENV.study(t, 50 + t * 3); const wob = Math.sin(t * 9) * 8 * Math.exp(-Math.max(0, t - .5) * 1.2) * (t > .5 ? 1 : 0);
      ctx.save(); ctx.translate(0, wob); ctx.rotate(wob * .001); drawChain(t, S, 3, -1); ctx.restore(); bubble(1460, 470, 520, 150, 1, ramp(t, .5, 1.3));
      const items = ['text edition', 'published argument', 'tablet'];
      items.forEach((s, i) => { const x = 520 + i * 440, tt = wt(S, 1, [2, 5, 8][i]); txt(s, x, 640, 40, '#e9dcc4', fade(t, tt, .4), 'italic'); strike(x - 150, 628, x + 150, 624, ramp(t, tt + .3, tt + .8), 500 + i, 6); });
      avatar(t, 1650, 'study', { sway: 1.3 }, .6, 640, true); finish(t); } });
  const CASCADE = ['The Opium Problem (1928)', 'pharmacognosy textbooks', 'Harper’s', 'PBS', 'DEA website'];
  add('bubble', { id: 'cascade', pad: 1,
    lines: ["From there it moved into The Opium Problem, and out of that into pharmacognosy textbooks, and out of those into Harper's, and onto PBS, and onto the DEA's own website, where it sits today.",
      "Remember that book, The Opium Problem. It's going to come back later in this series."],
    sfx(S) { return [4, 13, 20, 23, 28].map(w => ({ t: wt(S, 0, w), type: 'tick' })).concat([{ t: S.cues[1] + .3, type: 'scratch' }]); },
    draw(t, S) { ENV.paper(t); const ws = [4, 13, 20, 23, 28]; let x = 120;
      CASCADE.forEach((s, i) => { const w = 420 - i * 55, h = 120 - i * 12, a = fade(t, wt(S, 0, ws[i]) - .2, .3); if (i) { ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#b89a6a'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x - 50, 420); ctx.lineTo(x - 10, 420); ctx.stroke(); ctx.restore(); }
        if (a > 0) { ctx.save(); ctx.globalAlpha = a; card(x, 420 - h / 2, w, h, 300 + i, i === 0 ? '#f1e6cc' : C.paper, .4); font(Math.round(30 - i * 2), SERIF, 600); textC(s, x + w / 2, 430, C.ink); ctx.restore(); }
        if (i === 0) { const fa = fade(t, S.cues[1] + .2, .5); if (fa > 0) { ctx.save(); ctx.globalAlpha = fa; ctx.fillStyle = C.red; ctx.beginPath(); ctx.moveTo(x + w - 30, 420 - h / 2 - 50); ctx.lineTo(x + w - 30, 420 - h / 2 + 10); ctx.lineWidth = 4; ctx.strokeStyle = '#ddd'; ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + w - 30, 420 - h / 2 - 50); ctx.lineTo(x + w + 30, 420 - h / 2 - 36); ctx.lineTo(x + w - 30, 420 - h / 2 - 22); ctx.fill(); ctx.restore(); } }
        x += w + 60; });
      txt('remember this one', 330, 620, 36, C.red, fade(t, S.cues[1] + .4, .5), 'italic'); finish(t); } });
  add('cascade', { id: 'journals', pad: .8,
    lines: ["It was challenged in print in 1975 by Abraham Krikorian, in the Journal of the History of Biology, in a paper asking outright whether the opium poppy was known in the ancient Near East at all.",
      "It was challenged again in 2022 by Paolo Nencini, in The Social History of Alcohol and Drugs, in a paper aimed directly at what he called the supposed Sumerian plant of joy.",
      "47 years apart, in peer-reviewed journals, two scholars said this isn't true. And a museum run by a federal law enforcement agency still publishes it."],
    sfx(S) { return [{ t: S.cues[0], type: 'whoosh' }, { t: S.cues[1], type: 'whoosh' }, { t: S.cues[2] + 1, type: 'thud' }]; },
    draw(t, S) { ENV.paper(t);
      const j = (x0, x1, t0, title, sub, seed) => { const k = easeOut(ramp(t, t0, t0 + .8)); if (k <= 0) return; const x = lerp(x0, x1, k); card(x, 250, 520, 360, seed, '#e9e0cc', .45); ctx.fillStyle = '#2a3a4a'; ctx.fillRect(x + 20, 270, 480, 90); txt(title, x + 260, 330, 30, '#f4ecd8', 1, 'normal', 600); font(28, SERIF, 400, 'italic'); wrap(sub, 460).forEach((l, i) => textC(l, x + 260, 430 + i * 38, C.ink)); };
      j(-600, 300, S.cues[0], 'J. Hist. Biology · 1975', 'Krikorian: “Were the opium poppy and opium known in the ancient Near East?”', 401);
      j(W + 100, 1100, S.cues[1], 'Soc. Hist. Alcohol & Drugs · 2022', 'Nencini: the supposed Sumerian “plant of joy”', 402);
      glowText('47 years apart', W / 2, 760, 70, '#f4ecd8', fade(t, S.cues[2], .6), 600);
      lowerThird('Krikorian, Journal of the History of Biology, 1975', t, S.cues[0] + .5, S.cues[1]);
      lowerThird('Nencini, The Social History of Alcohol and Drugs, 2022', t, S.cues[1] + .5, S.cues[2]);
      finish(t); } });
  add('journals', { id: 'factsheet', pad: 1.2,
    lines: ["There's a small postscript, and I'm offering it as suggestive, not proven. The DEA's own drug fact sheets now list \"Joy Plant\" among the street names for opium. A phrase invented by a mistranslation, published by an enforcement agency, seems to have gone all the way round and come back as intelligence about what dealers call it."],
    sfx(S) { return [{ t: wt(S, 0, 22), type: 'scratch' }]; },
    draw(t, S) { ENV.paper(t); card(560, 120, 800, 760, 410, '#efe8d8', .35); txt('Opium: common street names', 960, 200, 36, C.ink, 1, 'normal', 600);
      const names = ['Big O', 'Black Stuff', 'Chandoo', 'Dover’s Powder', 'Dream Stick', 'God’s Medicine', 'Joy Plant', 'Midnight Oil', 'O.P.', 'Ope', 'Toys', 'Zero'];
      names.forEach((n, i) => { const x = 700 + (i % 2) * 330, y = 290 + Math.floor(i / 2) * 80; const hi = n === 'Joy Plant'; if (hi) { const a = fade(t, wt(S, 0, 22), .5); ctx.fillStyle = `rgba(255,214,90,${.55 * a})`; ctx.fillRect(x - 20, y - 36, 260, 50); } font(32, SERIF, hi ? 600 : 400); textL(n, x, y, C.ink); });
      txt('(selection, from the DEA fact sheet: text only)', 960, 840, 22, 'rgba(42,33,26,.6)', 1, 'italic');
      const lp = ease(ramp(t, wt(S, 0, 40), wt(S, 0, 52))); if (lp > 0) { ctx.save(); ctx.strokeStyle = C.red; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(1480, 520, 200, -1.8, -1.8 + lp * 5.2); ctx.stroke(); ctx.restore(); txt('mistranslation → agency → “street name”', 1500, 800, 26, '#e9dcc4', lp, 'italic'); }
      finish(t); } });

  // SCENE 5 — WHAT IS ACTUALLY TRUE
  add('factsheet', { id: 'yehud', scene: 'Scene 5 — What is actually true', pad: .8,
    lines: ["So what is actually true about early opium? Something, and it's more interesting than the myth.",
      "In 2022, a team analysing residues inside ceramic vessels from Canaanite burials at Tel Yehud, in Israel, found opium. It was chemically confirmed, in 8 vessels, some made locally and some imported from Cyprus. The burials date to the 14th century BC.",
      "That is the earliest chemically established use of opium anywhere in the world."],
    sfx(S) { return [{ t: .5, type: 'pop' }, { t: S.cues[1], type: 'whoosh' }, { t: S.cues[2], type: 'hit' }]; },
    draw(t, S) { ENV.lab(t); const c1 = S.cues[1];
      for (let i = 0; i < 8; i++) { const a = fade(t, wt(S, 1, 24) + i * .15, .4); if (a <= 0) continue; ctx.save(); ctx.globalAlpha = a; jar(260 + i * 120, 660, .55 + (i % 3) * .08, t, 600 + i, i % 3 === 1 ? '#c9a27a' : C.clay); ctx.restore(); }
      if (t > c1) spectrum(260, 150, 900, 260, ramp(t, c1 + .5, c1 + 6), t);
      txt('opium alkaloids detected', 710, 130, 30, '#8fd0ff', fade(t, c1 + 5, .5), 'italic');
      glowText('14th century BC', 710, 470, 60, '#f4ecd8', fade(t, wt(S, 1, 40), .6), 600);
      avatar(t, 1620, 'lab', {}, .5, 760, true);
      lowerThird('Linares et al., Archaeometry, 2022', t, c1 + 1, S.dur); finish(t); } });
  add('yehud', { id: 'europe', pad: 1.4,
    lines: ["And the poppy itself seems to have been domesticated not in Mesopotamia but in Neolithic Europe, quite possibly for its seeds rather than its latex.",
      "So the real story is later, further west, and harder to romanticise. It arrives through a mass spectrometer rather than a beautiful phrase, and it will never open a documentary.",
      "That's going to be a recurring problem."],
    sfx(S) { return [{ t: .3, type: 'whoosh' }, { t: S.cues[2], type: 'thud' }]; },
    draw(t, S) { ENV.paper(t); card(160, 120, 1100, 700, 700, '#d9ccae', .5); txt('schematic map, not to scale', 710, 800, 22, 'rgba(42,33,26,.55)', 1, 'italic');
      const P = { meso: [1100, 560], yehud: [930, 600], cyprus: [880, 520], europe: [420, 330] };
      mapPin(...P.meso, 'Mesopotamia', 1, '#7a6a58'); const k = ease(ramp(t, .6, 2.4)); const sx = lerp(P.meso[0], P.europe[0], k), sy = lerp(P.meso[1], P.europe[1], k);
      KIT.glow(ctx, sx, sy, 180, 'rgba(255,230,160,A)', .45); mapPin(...P.yehud, 'Tel Yehud', 1); mapPin(...P.cyprus, 'Cyprus', 1, '#d8b060');
      mapPin(...P.europe, 'Neolithic Europe', fade(t, 1.8, .6), '#4f7a3a'); seedHead(1560, 440, 1.2, t); txt('dried seed head', 1560, 820, 28, C.dim, 1, 'italic');
      glowText('That’s going to be a recurring problem.', 960, 960, 44, '#f4ecd8', fade(t, S.cues[2], .5), 400, 'italic'); finish(t); } });

  // MID-VIDEO BREAK
  add('europe', { id: 'break', scene: 'Mid-video break', pad: 1,
    lines: ["Quick break. Everything in this film comes from chapter one of my book, Vice & Versa: A History of Addiction. Every factual claim in it was checked against a source, and the sources are listed chapter by chapter at the back.",
      "If you'd rather read it than watch it, the link is in the description and the pinned comment, and so are the sources for this video.",
      "All right, back to it."],
    sfx(S) { return [{ t: .4, type: 'pop' }, { t: S.cues[2] + .4, type: 'whoosh' }]; },
    draw(t, S) { ENV.study(t, 0); KIT.glow(ctx, 760, 480, 500, 'rgba(255,220,160,A)', .35); book(760, 520, 1.15, 0, t);
      const r = rng(4); for (let i = 0; i < 6; i++) { const a = fade(t, 3 + i * .6, .5) * (1 - fade(t, 6 + i * .6, .5)); if (a > 0) { ctx.save(); ctx.globalAlpha = a * .5; card(200 + r() * 200, 200 + r() * 500, 260, 60, 800 + i, C.paper, .4); font(20, SERIF, 400, 'italic'); textL('Sources · Chapter ' + (i + 1), 220 + r() * 0, 240 + 0, C.ink); ctx.restore(); } }
      txt('link in the description + pinned comment', 760, 900, 34, '#f4ecd8', fade(t, S.cues[1], .5), 'italic');
      avatar(t, 1580, 'study', {}, .4, 780, true); finish(t); } });

  // SCENE 6 — NINKASI
  add('break', { id: 'ninkasi', scene: 'Scene 6 — The oldest beer recipe, which is not a recipe', pad: .6,
    lines: ["Let's try another one.",
      "The Hymn to Ninkasi is a Sumerian hymn to the goddess of beer. You'll have seen it described as the world's oldest beer recipe: brewing instructions in verse, memorised by people who couldn't read the method any other way."],
    sfx(S) { return [{ t: .3, type: 'whoosh' }]; },
    draw(t, S) { ENV.paper(t); const lab = ['Louvre', 'Istanbul', 'Berlin'];
      lab.forEach((l, i) => { const k = ease(ramp(t, .2 + i * .3, 2 + i * .3)); const x = lerp([-300, W / 2, W + 300][i], 620 + i * 340, k), y = lerp([300, -300, 300][i], 500, k);
        ctx.save(); ctx.globalAlpha = k; tablet(x, y, 300, 380, t, 900 + i, { rows: 6, rot: (i - 1) * .06 }); txt(l, x, y + 250, 30, C.dim, k, 'italic'); ctx.restore(); });
      txt('“the world’s oldest beer recipe”', W / 2, 180, 50, '#f4ecd8', fade(t, wt(S, 1, 25), .5), 'italic'); finish(t); } });
  add('ninkasi', { id: 'ninkasi_real', pad: .8,
    lines: ["Here the news is better. The text is entirely real. It survives on 3 fragmentary tablets from Nippur and the area around it, which are now in the Louvre, in Istanbul and in Berlin. Miguel Civil published the standard edition in 1964. It is a hymn, and it does describe making beer.",
      "Two corrections, and then a complication."],
    sfx(S) { return [{ t: wt(S, 0, 50), type: 'thud' }]; },
    draw(t, S) { ENV.paper(t); ['Louvre', 'Istanbul', 'Berlin'].forEach((l, i) => { tablet(620 + i * 340, 480, 300, 380, t, 900 + i, { rows: 6, rot: (i - 1) * .06 }); txt(l, 620 + i * 340, 730, 30, C.dim, 1, 'italic'); });
      glowText('real', W / 2, 180, 90, '#bfe3a0', fade(t, wt(S, 0, 6), .5), 600);
      lowerThird('Civil, “A Hymn to the Beer Goddess and a Drinking Song”, 1964', t, wt(S, 0, 40), S.cues[1]);
      txt('2 corrections + 1 complication', W / 2, 900, 44, '#f4ecd8', fade(t, S.cues[1], .5), 'italic'); finish(t); } });
  add('ninkasi_real', { id: 'ninkasi_date', pad: .8,
    lines: ["The date isn't 3000 BC.",
      "The tablets are Old Babylonian, from around 1800 BC. They were written in Sumerian by scribes whose everyday language was probably Akkadian, more than a century after the last Sumerian dynasty had fallen. They may well be school exercises. That makes the hymn a contemporary of Hammurabi, not a relic of the dawn of civilisation."],
    sfx(S) { return [{ t: lineEnd(S, 0) - .2, type: 'hit' }, { t: S.cues[1] + 1, type: 'thud' }]; },
    draw(t, S) { ENV.paper(t); const X = yr => lerp(200, 1720, (3200 - yr) / 1600);
      ctx.strokeStyle = '#cbbda6'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(200, 620); ctx.lineTo(1720, 620); ctx.stroke(); font(26, SERIF); [3200, 2800, 2400, 2000, 1600].forEach(y => { ctx.fillStyle = '#cbbda6'; ctx.fillRect(X(y) - 1, 610, 2, 20); textC(y + ' BC', X(y), 665, '#cbbda6'); });
      const k = ease(ramp(t, S.cues[1], S.cues[1] + 1.5)); const x = lerp(X(3000), X(1800), k);
      mapPin(x, 590, k < .5 ? '“3000 BC”' : 'c. 1800 BC', 1, k < .5 ? '#7a6a58' : C.red); if (k < .5) strike(X(3000) - 20, 590, X(3000) + 200, 586, ramp(t, lineEnd(S, 0) - .3, lineEnd(S, 0) + .3), 950, 8);
      const ha = fade(t, wt(S, 1, 48), .6); if (ha > 0) { ctx.save(); ctx.globalAlpha = ha; ctx.fillStyle = '#0e0a08'; ctx.beginPath(); ctx.moveTo(X(1760) - 50, 580); ctx.lineTo(X(1760) - 40, 330); ctx.quadraticCurveTo(X(1760), 290, X(1760) + 40, 330); ctx.lineTo(X(1760) + 50, 580); ctx.fill(); txt('Hammurabi', X(1760), 280, 30, '#e9dcc4', 1, 'italic'); ctx.restore(); }
      txt('Old Babylonian · written by scribes whose language was probably Akkadian', W / 2, 820, 30, '#e9dcc4', fade(t, wt(S, 1, 8), .5), 'italic'); finish(t); } });
  add('ninkasi_date', { id: 'ninkasi_memory', pad: .8,
    lines: ["The \"memory aid for people who couldn't read\" is unsourced.",
      "I went looking for the scholarship behind it and couldn't find any, in either direction. And it's odd on its own terms: these tablets came out of a scribal school. They're products of literacy, not a substitute for it."],
    sfx(S) { return [{ t: lineEnd(S, 0) - .3, type: 'scratch' }]; },
    draw(t, S) { ENV.paper(t); ctx.fillStyle = '#5a4430'; ctx.fillRect(0, 0, W, 780); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, 0, W, 780); ctx.fillStyle = '#3a2a1c'; ctx.fillRect(0, 780, W, H);
      for (let i = 0; i < 6; i++) { figure(260 + i * 280, 780, .95, t, 60 + i, 'sit', '#120c08'); tablet(330 + i * 280, 700, 70, 50, t, 70 + i, { rows: 2 }); }
      txt('“a memory aid for people who couldn’t read”', W / 2, 180, 44, '#f4ecd8', 1, 'italic'); strike(W / 2 - 440, 168, W / 2 + 440, 160, ramp(t, lineEnd(S, 0) - .3, lineEnd(S, 0) + .4), 960, 8);
      txt('products of literacy', W / 2, 300, 56, '#bfe3a0', fade(t, wt(S, 1, 32), .5), 'normal', 600); finish(t); } });
  add('ninkasi_memory', { id: 'damerow', pad: .8,
    lines: ["Now the complication, which is the good part.",
      "Calling it a recipe is a considerable stretch, and the specialists say so. Peter Damerow, in a 2012 paper on Sumerian brewing, points out that reading the hymn as a series of brewing steps depends on assumptions and needs what he calls considerable flexibility. He also says Civil's translation is influenced to a substantial degree by knowledge of modern brewing."],
    sfx(S) { return [{ t: .3, type: 'pop' }, { t: wt(S, 1, 36), type: 'tick' }]; },
    draw(t, S) { ENV.paper(t); tablet(760, 480, 420, 520, t, 901, { rows: 8 });
      const steps = ['step 1?', 'step 2?', 'step 3?']; steps.forEach((s, i) => { const a = fade(t, wt(S, 1, 22) + i * .4, .4); txt(s, 1080 + (i % 2) * 40, 360 + i * 120, 36, '#e9dcc4', a, 'italic'); });
      glowText('“considerable flexibility”', 760, 880, 50, '#f4ecd8', fade(t, wt(S, 1, 36), .5), 400, 'italic');
      avatar(t, 1640, 'dark', {}, .3, 740, true); lowerThird('Damerow, Cuneiform Digital Library Journal, 2012', t, S.cues[1] + 1, S.dur); finish(t); } });
  add('damerow', { id: 'terms', pad: .8,
    lines: ["3 leading Sumerologists, Civil in English, Sallaberger in German and Afanasieva in Russian, translate the key technical terms in ways that can't all be right. The central ingredient, bappir, still hasn't been translated. Beer bread? Sourdough? Malt loaf? Nobody knows."],
    sfx(S) { return [30, 31, 32].map(w => ({ t: wt(S, 0, w), type: 'tick' })); },
    draw(t, S) { ENV.paper(t); card(160, 380, 360, 200, 970, '#c9a27a', .6); txt('one term', 340, 490, 36, C.ink, 1, 'italic');
      [['Civil', 'English'], ['Sallaberger', 'Deutsch'], ['Afanasieva', 'Русский']].forEach(([n, l], i) => { const a = fade(t, wt(S, 0, 4 + i * 3), .4); if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; const y = 260 + i * 200; card(700, y, 560, 150, 971 + i, C.paper, .4); txt(n + ' · ' + l, 980, y + 55, 32, C.ink, 1, 'normal', 600);
        ctx.fillStyle = 'rgba(42,33,26,.3)'; ctx.fillRect(760, y + 85 + i * 6, 440 - i * 90, 12); ctx.restore(); ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = '#b89a6a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(520, 480); ctx.lineTo(700, y + 75); ctx.stroke(); ctx.restore(); });
      ['beer bread?', 'sourdough?', 'malt loaf?'].forEach((s, i) => txt(s, 1560, 330 + i * 150, 44, '#f4ecd8', fade(t, wt(S, 0, 30 + i), .3), 'italic'));
      glowText('bappir = ?', 1560, 880, 60, '#f4d060', fade(t, wt(S, 0, 22), .5), 600); finish(t); } });
  add('terms', { id: 'dquote', pad: 2,
    lines: ["And Damerow's conclusion is the sentence I'd put on the wall:",
      "We do not even know for sure that the resulting product had any alcohol content at all."],
    sfx(S) { return [{ t: S.cues[1], type: 'hit' }]; },
    draw(t, S) { if (t < S.cues[1] - .3) { ENV.paper(t); txt('the sentence I’d put on the wall', W / 2, 540, 44, C.dim, fade(t, .3, .5), 'italic'); }
      else quoteCard(t, S, '“We do not even know for sure that the resulting product had any alcohol content at all.”', '— Peter Damerow, Cuneiform Digital Library Journal, 2012', 1); finish(t, .6); } });

  // SCENE 7 — ANCHOR BREWING
  add('dquote', { id: 'anchor', scene: 'Scene 7 — How to make a “five-thousand-year-old” beer', pad: .6,
    lines: ["In the late 1980s Fritz Maytag, who owned the Anchor Brewing Company in San Francisco, decided to brew it. He worked with the anthropologist Solomon Katz, and he consulted Civil himself."],
    sfx(S) { return [{ t: .3, type: 'whoosh' }]; },
    draw(t, S) { ENV.brewery(t, t * 6); card(700, 420, 520, 320, 1001, '#efe4cb', .4); ctx.fillStyle = 'rgba(42,33,26,.25)'; for (let i = 0; i < 8; i++) ctx.fillRect(740, 470 + i * 30, 440 - (i % 3) * 60, 8);
      figure(560, 780, 1.1, t, 31, 'stand'); figure(1370, 780, 1.1, t, 32, 'stand');
      ['Fritz Maytag · brewer', 'Solomon Katz · anthropologist', 'Miguel Civil · Sumerologist'].forEach((s, i) => txt(s, 960, 180 + i * 60, 34, '#f4ecd8', fade(t, wt(S, 0, [2, 23, 30][i]), .5), 'italic')); finish(t); } });
  add('anchor', { id: 'loaves', pad: .6,
    lines: ["They guessed that bappir involved dates. They ended up sweetening it with honey as well. They baked more than a hundred loaves, which refused to dry, so they baked them again into something like biscotti."],
    sfx(S) { return [{ t: wt(S, 0, 20), type: 'thud' }]; },
    draw(t, S) { ENV.brewery(t, 20 + t * 6); const tw = wt(S, 0, 22);
      for (let r2 = 0; r2 < 3; r2++) for (let c = 0; c < 8; c++) { const a = fade(t, wt(S, 0, 17) + (r2 * 8 + c) * .05, .3); if (a <= 0) continue; ctx.save(); ctx.globalAlpha = a; loaf(420 + c * 150, 520 + r2 * 110, 1, t > tw && (r2 * 8 + c) % 2 === 0); ctx.restore(); }
      txt('100+ loaves', 960, 260, 70, '#f4ecd8', fade(t, wt(S, 0, 17), .5), 'normal', 600); txt('baked twice → “biscotti”', 960, 340, 40, '#e9dcc4', fade(t, tw, .5), 'italic'); finish(t); } });
  add('loaves', { id: 'rewrite', pad: .6,
    lines: ["And when the translation produced instructions that made no brewing sense, they went back to Civil. The hymn said something about watering malt that was covered with earth, and no brewer buries sprouting malt. So they had him re-translate the problem passages, and the line duly changed to malt set on the ground."],
    sfx(S) { return [{ t: wt(S, 0, 44), type: 'scratch' }]; },
    draw(t, S) { ENV.brewery(t, 40 + t * 4); card(360, 380, 1200, 260, 1010, '#efe4cb', .4);
      const k = ramp(t, wt(S, 0, 44), wt(S, 0, 48)); font(54, SERIF, 400, 'italic');
      textC('“…malt covered with earth…”', 960, 490, C.ink, 1 - k); textC('“…malt set on the ground…”', 960, 490, '#6a2a1a', k);
      if (k > 0 && k < 1) { ctx.fillStyle = `rgba(163,42,30,${.4 * Math.sin(k * Math.PI)})`; ctx.fillRect(420, 440, 1080, 70); }
      txt('re-translated', 960, 590, 34, C.dim, fade(t, wt(S, 0, 36), .5), 'italic'); finish(t); } });
  add('rewrite', { id: 'freeze', pad: 1.2,
    lines: ["Read that again. The text was revised to fit the practice, and the resulting practice was then presented as evidence of what the text meant."],
    sfx(S) { return [{ t: .3, type: 'hit' }, { t: .3, type: 'scratch' }]; },
    draw(t, S) { ENV.brewery(t, 60); ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(0, 0, W, H); card(360, 380, 1200, 260, 1010, '#efe4cb', .4); font(54, SERIF, 400, 'italic'); textC('“…malt set on the ground…”', 960, 490, '#6a2a1a');
      ring(960, 470, 470, 110, ramp(t, .3, 1.1), 17);
      txt('text → practice → “evidence” for the text', 960, 780, 40, '#f4ecd8', fade(t, wt(S, 0, 10), .5), 'italic'); finish(t, .8); } });
  add('freeze', { id: 'conference', pad: .6,
    lines: ["The beer came out at 3.5% and reportedly tasted of cider. They served it in jars, through straws, at a microbrewers' conference."],
    sfx(S) { return [{ t: .3, type: 'tick' }]; },
    draw(t, S) { ctx.fillStyle = '#1e1a22'; ctx.fillRect(0, 0, W, H); KIT.glow(ctx, 960, 200, 900, 'rgba(255,220,170,A)', .2); ctx.fillStyle = '#2a2420'; ctx.fillRect(0, 700, W, H - 700);
      for (let i = 0; i < 9; i++) figure(150 + i * 210, 700, .8, t, 80 + i, 'stand', '#0c0a0a');
      for (let i = 0; i < 4; i++) strawJar(460 + i * 330, 760, .9, t, 90 + i);
      txt('3.5%', 480, 220, 90, '#f4ecd8', fade(t, wt(S, 0, 5), .5), 'normal', 600); txt('“tasted of cider”', 1300, 220, 50, '#e9dcc4', fade(t, wt(S, 0, 9), .5), 'italic'); finish(t); } });
  add('conference', { id: 'moral', pad: 1,
    lines: ["I like this story enormously, and I'm not telling it to mock anybody. Maytag and Katz were doing something imaginative, and they were open about their guesses.",
      "I tell it because it's the cleanest small example I know of something that happens throughout this book on a much bigger scale: evidence being quietly shaped to fit the answer, by people acting in good faith, who don't notice they're doing it."],
    sfx(S) { return [{ t: .4, type: 'pop' }]; },
    draw(t, S) { ENV.brewery(t, 80 + t * 3); const z = 1 - ease(ramp(t, 0, S.dur)) * .25; ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
      for (let i = 0; i < 3; i++) strawJar(500 + i * 300, 780, .8, t, 95 + i); ctx.restore();
      glowText('evidence shaped to fit the answer', 760, 300, 52, '#f4ecd8', fade(t, wt(S, 1, 28), .6), 400, 'italic');
      avatar(t, 1600, 'warm', {}, .4, 760, true); finish(t); } });

  // SCENE 8 — THE PYRAMIDS
  add('moral', { id: 'giza', scene: 'Scene 8 — The pyramids', pad: .6,
    lines: ["One more, and this one mostly survives.",
      "You'll have read that the workers who built the pyramids were paid in beer, usually with a figure attached. A gallon a day. 3 or 4 loaves and 2 jugs. The numbers vary, and they're always specific."],
    sfx(S) { return [{ t: .3, type: 'whoosh' }, { t: .8, type: 'pop' }]; },
    draw(t, S) { ENV.giza(t); for (let i = 0; i < 5; i++) figure(300 + i * 90 + t * 8, 860, .6, t, 110 + i, 'stand', '#120a08');
      ctx.fillStyle = '#2a1a12'; ctx.fillRect(250 + t * 8, 800, 90, 60);
      txt('“a gallon a day”', 1250, 260, 56, '#fff1dc', fade(t, wt(S, 1, 19), .5), 'italic'); txt('“3 or 4 loaves and 2 jugs”', 1250, 350, 48, '#fff1dc', fade(t, wt(S, 1, 23), .5), 'italic');
      avatar(t, 330, 'dusk', {}, .8, 700); finish(t); } });
  add('giza', { id: 'site', pad: .8,
    lines: ["The general claim is true and well evidenced. Bread and beer were the ration currency of Egyptian state labour. The institution that produced them, the per shena, combined a bakery, a brewery and a granary.",
      "Mark Lehner's excavation of the settlement beside the Giza pyramids has turned up grain silos, workshops, bakeries with hundreds of thousands of bread-mould fragments, and enough cattle, sheep, goat and fish bone to feed thousands. Beer jars are the second most common pot on the site. The workforce was fed, housed and buried nearby, and it wasn't enslaved."],
    sfx(S) { return [9, 13, 17].map(w => ({ t: wt(S, 1, w), type: 'tick' })); },
    draw(t, S) { ENV.dig(t, t * 6); const items = [['grain silos', 9], ['workshops', 11], ['bakeries', 13], ['bread moulds', 17], ['animal bone', 25], ['beer jars', 38]];
      items.forEach(([s, w], i) => { const a = fade(t, wt(S, 1, w), .4); if (a <= 0) return; const x = 240 + (i % 3) * 520, y = 300 + Math.floor(i / 3) * 360; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(255,230,170,.18)'; ctx.fillRect(x - 60, y - 120, 400, 240);
        if (s === 'beer jars') for (let k = 0; k < 4; k++) jar(x + 20 + k * 80, y + 60, .35, t, 120 + k); else if (s === 'bakeries' || s === 'bread moulds') for (let k = 0; k < 5; k++) loaf(x + k * 70, y + 20, .8, false); else { ctx.fillStyle = '#5a4028'; ctx.beginPath(); ctx.arc(x + 140, y, 70, 0, 6.28); ctx.fill(); }
        txt(s, x + 140, y + 110, 32, '#fff1dc', 1, 'italic'); ctx.restore(); });
      glowText('fed · housed · buried nearby · not enslaved', W / 2, 1000, 40, '#fff1dc', fade(t, wt(S, 1, 50), .5), 400, 'italic');
      lowerThird('Mark Lehner, Ancient Egypt Research Associates', t, S.cues[1] + .5, S.dur); finish(t); } });
  add('site', { id: 'gang', pad: 1,
    lines: ["There's even a work gang whose name is recorded as the Drunkards of Menkaure. That's either the best fact in this chapter or a formal title that meant something more sober than it sounds, and I can't tell you which."],
    sfx(S) { return [{ t: wt(S, 0, 10), type: 'thud' }]; },
    draw(t, S) { ENV.giza(t); ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, 0, W, H); card(560, 300, 800, 300, 1100, '#c9a27a', .7);
      txt('work-gang name, painted on stone', 960, 380, 30, 'rgba(42,33,26,.7)', 1, 'italic'); txt('“Drunkards of Menkaure”', 960, 490, 64, C.ink, fade(t, wt(S, 0, 10), .6), 'normal', 600);
      txt('(translation)', 960, 560, 26, 'rgba(42,33,26,.6)', fade(t, wt(S, 0, 12), .5), 'italic'); txt('best fact · or formal title?', 960, 760, 44, '#fff1dc', fade(t, wt(S, 0, 17), .5), 'italic'); finish(t); } });
  add('gang', { id: 'fail', pad: .9,
    lines: ["But every precise figure fails."],
    sfx(S) { return [{ t: .5, type: 'hit' }, { t: .5, type: 'scratch' }, { t: 1.1, type: 'scratch' }]; },
    draw(t, S) { ENV.giza(t); ctx.fillStyle = 'rgba(0,0,0,.4)'; ctx.fillRect(0, 0, W, H);
      txt('“a gallon a day”', 960, 400, 72, '#fff1dc', 1, 'italic'); KIT.strike(ctx, 640, 380, 1280, 372, ramp(t, .5, 1), 21, 14);
      txt('“3 or 4 loaves and 2 jugs”', 960, 560, 60, '#fff1dc', 1, 'italic'); KIT.strike(ctx, 600, 542, 1320, 534, ramp(t, 1.1, 1.6), 22, 12);
      avatar(t, 320, 'dusk', {}, .2, 720); finish(t); } });
  add('fail', { id: 'rations', pad: .8,
    lines: ["The ration numbers come from the wrong millennium.",
      "The genuine texts are Middle Kingdom, Second Intermediate Period, and, for the most-quoted ones, Deir el-Medina in the Ramesside period, around 1188 to 1069 BC. That's roughly 1,400 years after Khufu. They describe a privileged community of royal tomb craftsmen, not construction labour. And they're allocations for households of about 10 people, which popular accounts hand to a single worker without dividing them at all."],
    sfx(S) { return [{ t: wt(S, 1, 26), type: 'whoosh' }, { t: wt(S, 1, 56), type: 'thud' }]; },
    draw(t, S) { ENV.paper(t); const X = yr => lerp(200, 1720, (2700 - yr) / 1700);
      ctx.strokeStyle = '#cbbda6'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(200, 520); ctx.lineTo(1720, 520); ctx.stroke(); font(26, SERIF); [2600, 2200, 1800, 1400, 1000].forEach(y => { ctx.fillStyle = '#cbbda6'; ctx.fillRect(X(y) - 1, 510, 2, 20); textC(y + ' BC', X(y), 565, '#cbbda6'); });
      mapPin(X(2570), 490, 'Khufu', 1, '#d8b060'); const k = ease(ramp(t, wt(S, 1, 12), wt(S, 1, 26)));
      if (k > 0) { ctx.fillStyle = 'rgba(163,42,30,.4)'; ctx.fillRect(X(2570), 450, (X(1130) - X(2570)) * k, 16); mapPin(X(1130), 490, 'Deir el-Medina', k, C.red); txt('≈ 1,400 years', (X(2570) + X(1130)) / 2, 430, 36, '#f4ecd8', k, 'normal', 600); }
      const h = fade(t, wt(S, 1, 50), .5); if (h > 0) { ctx.save(); ctx.globalAlpha = h; for (let i = 0; i < 10; i++) figure(560 + i * 80, 900, .45, t, 130 + i, 'stand', '#e9dcc4'); txt('1 allocation = a household of ~10', 960, 1000, 36, '#f4ecd8', 1, 'italic'); ctx.restore(); }
      txt('royal tomb craftsmen, not pyramid builders', 960, 700, 36, '#e9dcc4', fade(t, wt(S, 1, 38), .5), 'italic'); finish(t); } });
  add('rations', { id: 'gallon', pad: .8,
    lines: ["The gallon a day has no traceable source.",
      "I found it printed, uncited, on the British Museum's blog. I couldn't trace it to any Egyptological publication from any period."],
    sfx(S) { return [{ t: wt(S, 1, 5), type: 'tick' }]; },
    draw(t, S) { ENV.paper(t); card(460, 180, 1000, 640, 1200, '#e8e4dc', .3); ctx.fillStyle = '#8a857c'; ctx.fillRect(470, 190, 980, 30);
      ctx.fillStyle = 'rgba(42,33,26,.25)'; for (let i = 0; i < 10; i++) ctx.fillRect(520, 280 + i * 44, 860 - (i % 4) * 80, 12);
      ctx.fillStyle = 'rgba(255,214,90,.5)'; ctx.fillRect(515, 492, 480, 36); font(30, SERIF, 600); textL('…a gallon of beer a day…', 525, 520, C.ink);
      txt('no footnote · no source', 960, 900, 44, '#f4ecd8', fade(t, wt(S, 1, 3), .5), 'italic'); txt('(museum blog: text only, not the page)', 960, 790, 22, 'rgba(42,33,26,.6)', 1, 'italic'); finish(t); } });
  add('gallon', { id: 'strength', pad: .8,
    lines: ["The strength is a guess.",
      "Nobody has directly measured ancient Egyptian beer. Every figure in circulation is an analogy with a modern drink, and the choice matters enormously. Assume modern strength and a gallon a day is organised mass drunkenness. Assume a thick, weak, nourishing mash and it's lunch. The evidence doesn't let you choose. Most accounts pick the exciting one without saying so."],
    sfx(S) { return [{ t: wt(S, 1, 28), type: 'thud' }, { t: wt(S, 1, 43), type: 'thud' }]; },
    draw(t, S) { ENV.paper(t); jar(560, 620, 1.3, t, 140); jar(1360, 620, 1.3, t, 141, '#c9a27a');
      txt('modern strength?', 560, 250, 44, '#f4ecd8', fade(t, wt(S, 1, 22), .5), 'italic'); txt('thick, weak mash?', 1360, 250, 44, '#f4ecd8', fade(t, wt(S, 1, 36), .5), 'italic');
      txt('→ mass drunkenness', 560, 900, 36, '#e9a0a0', fade(t, wt(S, 1, 30), .5), 'italic'); txt('→ lunch', 1360, 900, 36, '#bfe3a0', fade(t, wt(S, 1, 44), .5), 'italic');
      glowText('the evidence doesn’t let you choose', 960, 1010, 40, '#f4ecd8', fade(t, wt(S, 1, 46), .5), 400, 'italic'); finish(t); } });
  add('strength', { id: 'lehner', pad: .6,
    lines: ["And then there's the detail I keep coming back to, because it comes from the excavator himself. Asked what he hadn't found at Giza, Mark Lehner said:",
      "We have so much evidence of baking… So we have scores of bakeries, and bread molds are our most common type of pot. Our second most common type of pot is the beer jar. But so far the breweries have eluded us."],
    sfx(S) { return [{ t: .3, type: 'pop' }, { t: wt(S, 1, 36), type: 'hit' }]; },
    draw(t, S) { if (t < S.cues[1] - .3) { ENV.dig(t, 100); const qa = fade(t, 1, .6); ctx.save(); ctx.globalAlpha = qa; ctx.fillStyle = 'rgba(20,12,6,.55)'; ctx.fillRect(800, 380, 320, 320); ctx.restore(); txt('?', 960, 600, 200, '#fff1dc', qa, 'normal', 600); avatar(t, 320, 'warm', {}, .3, 720); }
      else quoteCard(t, S, '“We have so much evidence of baking… So we have scores of bakeries, and bread molds are our most common type of pot. Our second most common type of pot is the beer jar. But so far the breweries have eluded us.”', '— Mark Lehner, “Excavating the Lost City”, NOVA, PBS, 2010', 1);
      if (t > S.cues[1]) lowerThird('Lehner, “Excavating the Lost City,” NOVA, PBS, 2010', t, S.cues[1] + .5, S.dur); finish(t, .6); } });
  add('lehner', { id: 'nobrewery', pad: .8,
    lines: ["No brewery has ever been excavated at Giza. The bakeries are there. The beer jars are there. The building where the beer was made isn't, and the man who has spent decades digging the site says so plainly, while his work is cited worldwide as proof of the very thing he says he hasn't found."],
    sfx(S) { return [{ t: wt(S, 0, 17), type: 'scratch' }]; },
    draw(t, S) { ENV.dig(t, 120 + t * 4); const cells = [['bakeries', 8], ['beer jars', 12], ['brewery', 17]];
      cells.forEach(([s, w], i) => { const x = 420 + i * 540; const a = fade(t, wt(S, 0, w), .4); if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = i < 2 ? 'rgba(255,230,170,.2)' : 'rgba(0,0,0,.35)'; ctx.fillRect(x - 200, 340, 400, 400);
        if (i === 0) for (let k = 0; k < 5; k++) loaf(x - 120 + k * 60, 540, .7, false); if (i === 1) for (let k = 0; k < 3; k++) jar(x - 90 + k * 90, 600, .45, t, 150 + k); if (i === 2) txt('?', x, 600, 160, '#fff1dc', 1, 'normal', 600);
        txt(s, x, 800, 40, '#fff1dc', 1, 'italic'); ctx.restore(); if (i < 2) txt('✓', x + 150, 380, 50, '#bfe3a0', a); else strike(x - 110, 790, x + 110, 786, ramp(t, wt(S, 0, 17) + .3, wt(S, 0, 17) + .8), 1300, 7); });
      finish(t); } });
  add('nobrewery', { id: 'abydos', pad: 1.2,
    lines: ["A real industrial brewery has been found in Egypt, at Abydos, from around 3000 BC. It had 8 installations that could make perhaps 22,000 litres a batch.",
      "But it's roughly 450 years older than the Giza pyramids and about 270 miles away, and it was almost certainly built to supply the funeral cult of the first kings, not to pay anybody."],
    sfx(S) { return [{ t: wt(S, 1, 12), type: 'whoosh' }]; },
    draw(t, S) { ENV.paper(t); card(560, 60, 800, 960, 1400, '#d9ccae', .5);
      ctx.strokeStyle = '#3a6a8a'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(900, 150); ctx.bezierCurveTo(920, 400, 1000, 600, 1060, 900); ctx.stroke(); ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(900, 150); ctx.lineTo(820, 100); ctx.moveTo(900, 150); ctx.lineTo(980, 100); ctx.stroke();
      const giza = [880, 220], aby = [1050, 840]; mapPin(...giza, 'Giza', 1, '#d8b060'); dotted(giza[0], giza[1], aby[0], aby[1], ease(ramp(t, wt(S, 1, 10), wt(S, 1, 14))));
      mapPin(...aby, 'Abydos', fade(t, .5, .5)); for (let i = 0; i < 8; i++) { const a = fade(t, wt(S, 0, 17) + i * .12, .3); ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#7a5a3a'; ctx.beginPath(); ctx.ellipse(700 + (i % 4) * 60, 700 + Math.floor(i / 4) * 60, 24, 16, 0, 0, 6.28); ctx.fill(); ctx.restore(); }
      txt('≈ 270 miles', 1180, 540, 40, C.ink, fade(t, wt(S, 1, 14), .4), 'normal', 600); txt('≈ 450 years before Giza', 1180, 600, 32, C.ink, fade(t, wt(S, 1, 5), .4), 'italic');
      txt('c. 3000 BC · 8 installations · ~22,000 L a batch', 960, 990, 32, '#f4ecd8', fade(t, wt(S, 0, 17), .5), 'italic');
      lowerThird('Adams & Vischak, Abydos brewery, 2021', t, S.cues[0] + 1, S.dur); finish(t); } });

  // SCENE 10 — WHAT THIS IS  (Scene 9, the personal aside, is cut from this version)
  const VIGS = [['gin', 'a London gin cellar'], ['port', 'a Chinese port'], ['speak', 'a speakeasy'], ['army', 'a German army'], ['board', 'a boardroom']];
  add('abydos', { id: 'series', scene: 'Scene 10 — What this is', pad: .6,
    lines: ["This is a history of vice, and it has an argument.",
      "The argument is that this subject has been written about almost entirely by people looking at it from outside, and that the view from outside produces a particular, consistent set of mistakes: numbers nobody ever counted, origin stories assembled backwards, explanations that flatter whoever is doing the explaining. Every generation produces a figure that is more useful than it is true, and then that figure goes to work on somebody.",
      "A substance arrives. Some people are ruined by it. The powerful profit from it and then panic about it, often the same people within the same decade. A ban is imposed and doesn't do what it was meant to do. And what actually changes the toll is never the sermon. It's whatever puts distance between a person and the substance: usually price, sometimes availability, occasionally respectability. Every one of those levers has a cost."],
    sfx(S) { return VIGS.map((_, i) => ({ t: S.cues[1] + i * 3, type: 'tick' })).concat([{ t: .4, type: 'pop' }]); },
    draw(t, S) { ENV.paper(t); const c1 = S.cues[1], c2 = S.cues[2]; const pan = ease(ramp(t, c1, c2 + 10)) * 600;
      ctx.save(); ctx.translate(-pan, 0); ctx.strokeStyle = '#cbbda6'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(100, 700); ctx.lineTo(100 + 2400 * ease(ramp(t, c1 - 1, c1 + 3)), 700); ctx.stroke();
      VIGS.forEach(([k, l], i) => vignetteCard(140 + i * 480, 330, 400, 320, l, k, t, 1500 + i, fade(t, c1 + i * 3, .5)));
      VIGS.forEach((_, i) => { if (t < c2) return; PATTERN.forEach((p, j) => { const a = fade(t, wt(S, 2, [0, 5, 11, 29, 50][j]), .3); ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = j === 4 ? '#bfe3a0' : '#e9dcc4'; ctx.beginPath(); ctx.arc(190 + i * 480 + j * 75, 740, 12, 0, 6.28); ctx.fill(); ctx.restore(); }); });
      ctx.restore();
      PATTERN.forEach((p, j) => txt(p, 300 + j * 330, 900, 34, j === 4 ? '#bfe3a0' : '#f4ecd8', fade(t, wt(S, 2, [0, 5, 11, 29, 50][j]), .4), 'italic'));
      if (t < c1) glowText('This is a history of vice, and it has an argument.', W / 2, 540, 52, '#f4ecd8', fade(t, .3, .6), 400, 'italic');
      avatar(t, 1720, 'dark', {}, .4, 600, true); finish(t); } });
  add('series', { id: 'chair', pad: 1,
    lines: ["About halfway through, that pattern stops working, and I haven't forced it. It describes what societies do about substances. It has nothing to say about what happens inside one person who can't stop, or what one such person can do for another. Most of what follows is about nothing else."],
    sfx(S) { return [{ t: wt(S, 0, 5), type: 'hit' }]; },
    draw(t, S) { ENV.paper(t); const br = ramp(t, wt(S, 0, 5), wt(S, 0, 5) + .8);
      ctx.strokeStyle = '#cbbda6'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(100, 600); ctx.lineTo(900 - br * 40, 600 + br * 30); ctx.moveTo(1020 + br * 40, 600 - br * 20); ctx.lineTo(1820, 600); ctx.stroke();
      const a = fade(t, wt(S, 0, 20), .8); if (a > 0) { ctx.save(); ctx.globalAlpha = a; KIT.glow(ctx, 1400, 560, 300, 'rgba(255,220,170,A)', .3); ctx.fillStyle = '#0d0a08'; ctx.fillRect(1340, 440, 16, 200); ctx.fillRect(1340, 540, 130, 16); ctx.fillRect(1454, 540, 16, 100); ctx.fillRect(1344, 600, 12, 40); ctx.restore(); }
      txt('one person', 1400, 760, 40, '#f4ecd8', a, 'italic'); finish(t); } });
  add('chair', { id: 'promise', pad: 1.4,
    lines: ["One promise. There's no method detail anywhere in this series. No doses, no combinations, no routes, no acquisition. Nothing here teaches anybody anything they could use."],
    sfx(S) { return [8, 10, 12, 15].map(w => ({ t: wt(S, 0, w), type: 'thud' })); },
    draw(t, S) { ctx.fillStyle = '#070606'; ctx.fillRect(0, 0, W, H); ['No doses.', 'No combinations.', 'No routes.', 'No acquisition.'].forEach((s, i) => txt(s, W / 2, 380 + i * 90, 60, '#f4ecd8', fade(t, wt(S, 0, [8, 10, 12, 15][i]) - .1, .3), 'normal', 600));
      txt('One promise', W / 2, 250, 36, C.dim, fade(t, .2, .5), 'italic'); avatar(t, 1680, 'dark', {}, .3, 640, true); finish(t, .5); } });

  // OUTRO
  add('promise', { id: 'outro', scene: 'Outro', pad: .6,
    lines: ["Next, we go to London in the 1730s, to a city drinking something new, and to a sign everybody knows and almost nobody can source: Drunk for a penny. Dead drunk for twopence. Clean straw for nothing."],
    sfx(S) { return [{ t: .3, type: 'whoosh' }, { t: wt(S, 0, 26), type: 'thud' }]; },
    draw(t, S) { ENV.london(t, t * 12); const [bx, by] = boil(t, 7, .8); ctx.save(); ctx.translate(520 + bx, 470 + by); ctx.rotate(Math.sin(t * 1.3) * .03); ctx.strokeStyle = '#1a120c'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-110, -90); ctx.lineTo(-110, -40); ctx.moveTo(110, -90); ctx.lineTo(110, -40); ctx.stroke();
      card(-190, -40, 380, 170, 1600, '#3a2a1c', .6); ctx.restore(); txt('? ? ?', 520, 560, 40, 'rgba(255,220,170,.25)', 1, 'italic');
      ['Drunk for a penny.', 'Dead drunk for twopence.', 'Clean straw for nothing.'].forEach((s, i) => glowText(s, 1300, 360 + i * 90, 48, '#fff1dc', fade(t, wt(S, 0, [26, 30, 34][i]), .5), 400, 'italic'));
      avatar(t, 1680, 'night', {}, .3, 640, true); finish(t); } });
  add('outro', { id: 'endcard', pad: 6,
    lines: ["If you want to know where that sign really came from, and why the straw gives the whole game away, that's the next film. Subscribe so you don't miss it."],
    sfx(S) { return [{ t: S.cues[0] + S.durs[0] + .3, type: 'hit' }]; },
    draw(t, S) { ENV.london(t, 200); ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, 0, W, H);
      card(1060, 300, 700, 400, 1700, '#241d18', .3); txt('Next · Chapter Two', 1410, 440, 36, C.dim, 1, 'italic'); txt('Drunk for a Penny', 1410, 520, 58, '#f4ecd8', 1, 'normal', 600); txt('(end-screen video slot)', 1410, 650, 22, C.dim, 1, 'italic');
      ctx.save(); ctx.globalAlpha = fade(t, S.cues[0] + 3, .5); ctx.fillStyle = C.red; ctx.beginPath(); ctx.roundRect(260, 440, 460, 120, 60); ctx.fill(); txt('Subscribe', 490, 520, 50, '#fff', 1, 'normal', 600); ctx.restore();
      txt('VICE & VERSA', W / 2, 150, 34, C.dim, 1, 'normal', 600); const a = fade(t, S.dur - 1.2, .8); if (a > 0) { ctx.fillStyle = `rgba(0,0,0,${a})`; ctx.fillRect(0, 0, W, H); } finish(t); } });

  window.CH1 = SHOTS => {
    const endIdx = SHOTS.findIndex(s => s.id === 'end'); if (endIdx >= 0) SHOTS.splice(endIdx, 1);
    for (const [after, shot] of SH) { const i = SHOTS.findIndex(s => s.id === after); SHOTS.splice(i + 1, 0, shot); }
  };
})();
