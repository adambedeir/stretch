/* Pose illustrations.
 *
 * Every figure is built from joint angles (forward kinematics), so limbs always
 * keep the same proportions and any two poses can be blended for animation.
 *
 * Angles are in degrees: 0 = straight down, 90 = forward (right), 180 = up,
 * -90 = back (left). The figure faces right in side view.
 *
 * Pose fields
 *   x, y      hip position (viewBox is 200 x 160, floor at y = 150)
 *   t         torso angle (hip -> neck), c = spine curve (+ rounds the back)
 *   ts        torso length scale (negative folds toward the viewer in front view)
 *   h / hr    head angle (absolute) or offset from the spine
 *   a1, a2    arms  [upper, fore, hand?]   a1 = near / screen-left arm
 *   l1, l2    legs  [thigh, shin, foot?]   l1 = near / screen-left leg
 *   sa1.. sl2 per-segment length scales (foreshortening)
 *   view      'side' | 'front' | 'top'
 *   hl        highlighted parts: a1u a1l a1h l1u l1l l1f (and 2), torso, upper,
 *             lower, neck, chest, upperback, lowerback, glute, hipfront, side1
 *   props     [{k:'wall'|'chair'|'desk'|'seat', x, y, w, bh}]
 */
(function () {
  'use strict';

  const L = { torso: 44, upper: 25, fore: 23, hand: 8, thigh: 31, shin: 30, foot: 9 };
  const FLOOR = 150;
  const DEF = { x: 100, y: 84, t: 180, c: 0, ts: 1, view: 'side',
    a1: [8, 4], a2: [-6, -2], l1: [0, 0], l2: [0, 0] };
  const RAD = Math.PI / 180;

  const dir = (a, n) => [Math.sin(a * RAD) * n, Math.cos(a * RAD) * n];
  const mv = (p, a, n) => { const d = dir(a, n); return [p[0] + d[0], p[1] + d[1]]; };
  const ang = (p, q) => Math.atan2(q[0] - p[0], q[1] - p[1]) / RAD;
  const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
  const r1 = n => Math.round(n * 10) / 10;
  const pt = p => r1(p[0]) + ' ' + r1(p[1]);

  function limb(o, a, lens, sc, endDefault) {
    sc = sc || [];
    const j = mv(o, a[0], lens[0] * (sc[0] == null ? 1 : sc[0]));
    const e = mv(j, a[1], lens[1] * (sc[1] == null ? 1 : sc[1]));
    const ea = a[2] != null ? a[2] : endDefault(a[1]);
    const tip = mv(e, ea, lens[2] * (sc[2] == null ? 1 : sc[2]));
    return [o, j, e, tip];
  }

  function solve(pose) {
    const p = Object.assign({}, DEF, pose);
    const side = p.view === 'side';
    const H = [p.x, p.y];
    const N = mv(H, p.t, L.torso * p.ts);
    const C = mv(mid(H, N), p.t + 90, (p.c || 0) * 13);
    const top = p.c ? ang(C, N) : (p.ts < 0 ? p.t + 180 : p.t);
    const h = p.h != null ? p.h : top + (p.hr || 0);

    let S1, S2, H1, H2;
    if (side) {
      S1 = S2 = mv(N, top + 180, 3);
      H1 = H2 = H;
    } else {
      const sc = mv(N, top + 180, 3);
      S1 = mv(sc, p.t + 90, 12); S2 = mv(sc, p.t - 90, 12);
      H1 = mv(H, p.t + 90, 7); H2 = mv(H, p.t - 90, 7);
    }
    const armEnd = a => a;
    const legEnd1 = side ? a => a + 90 : a => a - 90;
    const legEnd2 = side ? a => a + 90 : a => a + 90;
    const footSc = side ? 1 : 0.6;
    const sl = (s) => { s = (s || []).slice(); if (s[2] == null) s[2] = footSc; return s; };

    return {
      p, side, H, N, C, h, S1, S2, H1, H2,
      head: mv(N, h, 12.5), neckEnd: mv(N, h, 4.5),
      a1: limb(S1, p.a1, [L.upper, L.fore, L.hand], p.sa1, armEnd),
      a2: limb(S2, p.a2, [L.upper, L.fore, L.hand], p.sa2, armEnd),
      l1: limb(H1, p.l1, [L.thigh, L.shin, L.foot], sl(p.sl1), legEnd1),
      l2: limb(H2, p.l2, [L.thigh, L.shin, L.foot], sl(p.sl2), legEnd2),
    };
  }

  // quadratic bezier helpers for the spine
  const qAt = (P0, P1, P2, u) => [
    (1 - u) * (1 - u) * P0[0] + 2 * (1 - u) * u * P1[0] + u * u * P2[0],
    (1 - u) * (1 - u) * P0[1] + 2 * (1 - u) * u * P1[1] + u * u * P2[1]];
  const qTan = (P0, P1, P2, u) => ang([0, 0], [
    2 * (1 - u) * (P1[0] - P0[0]) + 2 * u * (P2[0] - P1[0]),
    2 * (1 - u) * (P1[1] - P0[1]) + 2 * u * (P2[1] - P1[1])]);

  function seg(d, w, cls, hl) {
    let s = '';
    if (hl) s += `<path d="${d}" class="fg-glow" stroke-width="${w + 9}"/>`;
    s += `<path d="${d}" class="${hl ? 'fg-hl' : cls}" stroke-width="${w}"/>`;
    return s;
  }

  // A background-coloured outline drawn first so overlapping parts stay readable.
  const gap = (d, w) => `<path d="${d}" class="fg-gap" stroke-width="${w + 4}"/>`;

  function drawLimb(pts, key, kind, cls, hl, w, outline) {
    const [o, j, e, tip] = pts;
    const hs = hl.has(key + 'u'), hd = hl.has(key + 'l'), he = hl.has(key + (kind === 'a' ? 'h' : 'f'));
    const ew = w * (kind === 'a' ? 0.72 : 0.78);
    const endD = `M${pt(e)}L${pt(tip)}`, mainD = `M${pt(o)}L${pt(j)}L${pt(e)}`;
    let s = '';
    if (outline) s += gap(endD, ew) + gap(mainD, w);
    s += seg(endD, ew, cls, he);
    if (hs === hd) s += seg(mainD, w, cls, hs);
    else s += seg(`M${pt(o)}L${pt(j)}`, w, cls, hs) + seg(`M${pt(j)}L${pt(e)}`, w, cls, hd);
    return s;
  }

  function spot(p) {
    return `<circle cx="${r1(p[0])}" cy="${r1(p[1])}" r="12" class="fg-glow-fill"/>` +
      `<circle cx="${r1(p[0])}" cy="${r1(p[1])}" r="6.5" class="fg-hl-fill"/>`;
  }

  function drawProps(props) {
    let s = '';
    for (const pr of props || []) {
      const x = pr.x, y = pr.y, w = pr.w || 34;
      if (pr.k === 'wall') s += `<path d="M${x} 12V${FLOOR}" class="fg-prop" stroke-width="4"/>`;
      if (pr.k === 'chair') {
        const bh = pr.bh == null ? 40 : pr.bh;
        s += `<path d="M${x + 2} ${y}V${FLOOR}M${x + w - 2} ${y}V${FLOOR}" class="fg-prop" stroke-width="3.5"/>`;
        s += `<path d="M${x} ${y - bh}V${y}H${x + w}" class="fg-prop" stroke-width="5"/>`;
      }
      if (pr.k === 'desk') {
        s += `<path d="M${x + 5} ${y}V${FLOOR}M${x + w - 5} ${y}V${FLOOR}" class="fg-prop" stroke-width="3.5"/>`;
        s += `<path d="M${x} ${y}H${x + w}" class="fg-prop" stroke-width="5"/>`;
      }
      if (pr.k === 'seat') {
        s += `<path d="M${x + 4} ${y}V${FLOOR}M${x + w - 4} ${y}V${FLOOR}" class="fg-prop" stroke-width="3.5"/>`;
        s += `<path d="M${x} ${y}H${x + w}" class="fg-prop" stroke-width="7"/>`;
      }
    }
    return s;
  }

  function draw(pose) {
    const F = solve(pose);
    const p = F.p;
    const hl = new Set(p.hl || []);
    let s = '';

    if (p.view === 'top') s += `<rect x="28" y="6" width="144" height="148" rx="16" class="fg-mat"/>`;
    s += drawProps(p.props);
    if (p.view !== 'top') s += `<path d="M10 ${FLOOR + 1}H190" class="fg-floor" stroke-width="2"/>`;

    const W = 9;
    if (F.side) {
      s += drawLimb(F.l2, 'l2', 'l', 'fg-far', hl, W - 0.5);
      s += drawLimb(F.a2, 'a2', 'a', 'fg-far', hl, W - 1);
    } else {
      s += drawLimb(F.l2, 'l2', 'l', 'fg-near', hl, W, true);
      s += drawLimb(F.l1, 'l1', 'l', 'fg-near', hl, W, true);
    }

    // torso
    const P0 = F.H, P1 = F.C, P2 = F.N;
    if (F.side) {
      const A = mid(P0, P1), B = mid(P1, P2), M = mid(A, B);
      s += gap(`M${pt(P0)}Q${pt(P1)} ${pt(P2)}`, 15);
      if (hl.has('torso')) s += seg(`M${pt(P0)}Q${pt(P1)} ${pt(P2)}`, 15, 'fg-near', true);
      else if (hl.has('upper') || hl.has('lower')) {
        s += seg(`M${pt(P0)}Q${pt(A)} ${pt(M)}`, 15, 'fg-near', hl.has('lower'));
        s += seg(`M${pt(M)}Q${pt(B)} ${pt(P2)}`, 15, 'fg-near', hl.has('upper'));
      } else s += seg(`M${pt(P0)}Q${pt(P1)} ${pt(P2)}`, 15, 'fg-near', false);
    } else {
      const poly = `M${pt(F.S1)}L${pt(F.S2)}L${pt(F.H2)}L${pt(F.H1)}Z`;
      if (hl.has('torso')) s += `<path d="${poly}" class="fg-glow" stroke-width="16"/>`;
      s += `<path d="${poly}" class="${hl.has('torso') ? 'fg-hl fg-fill-hl' : 'fg-near fg-fill'}" stroke-width="7"/>`;
    }

    // neck + head
    s += seg(`M${pt(F.N)}L${pt(F.neckEnd)}`, 7, 'fg-near', false);
    s += `<circle cx="${r1(F.head[0])}" cy="${r1(F.head[1])}" r="11.5" class="fg-gap-fill"/>`;
    s += `<circle cx="${r1(F.head[0])}" cy="${r1(F.head[1])}" r="9.5" class="fg-head"/>`;
    if (hl.has('neck')) s += spot(F.side ? mv(mv(F.N, F.h, 3), F.h + 90, 4) : mid(mid(F.N, F.S1), F.N));

    // muscle spots
    if (F.side) {
      const front = u => qTan(P0, P1, P2, u) - 90;
      const back = u => qTan(P0, P1, P2, u) + 90;
      if (hl.has('chest')) s += spot(mv(qAt(P0, P1, P2, 0.78), front(0.78), 5));
      if (hl.has('upperback')) s += spot(mv(qAt(P0, P1, P2, 0.74), back(0.74), 5));
      if (hl.has('lowerback')) s += spot(mv(qAt(P0, P1, P2, 0.28), back(0.28), 5));
      if (hl.has('glute')) s += spot(mv(F.H, back(0), 5));
      if (hl.has('hipfront')) s += spot(mv(qAt(P0, P1, P2, 0.1), front(0.1), 5));
    } else {
      const c = mid(mid(F.S1, F.S2), mid(F.H1, F.H2));
      if (hl.has('chest') || hl.has('upperback')) s += spot(mid(mid(F.S1, F.S2), c));
      if (hl.has('lowerback') || hl.has('hipfront') || hl.has('glute')) s += spot(mid(mid(F.H1, F.H2), c));
      if (hl.has('side1')) s += spot(mid(mid(F.S1, F.H1), c));
    }

    if (F.side) {
      s += drawLimb(F.l1, 'l1', 'l', 'fg-near', hl, W, true);
      s += drawLimb(F.a1, 'a1', 'a', 'fg-near', hl, W - 0.5, true);
    } else {
      s += drawLimb(F.a2, 'a2', 'a', 'fg-near', hl, W - 0.5, true);
      s += drawLimb(F.a1, 'a1', 'a', 'fg-near', hl, W - 0.5, true);
    }
    return s;
  }

  function lerpPose(a, b, k) {
    const out = Object.assign({}, b);
    for (const key in b) {
      const va = a[key], vb = b[key];
      if (typeof vb === 'number' && typeof va === 'number') out[key] = va + (vb - va) * k;
      else if (Array.isArray(vb) && Array.isArray(va) && typeof vb[0] === 'number') {
        out[key] = vb.map((v, i) => (v != null && va[i] != null ? va[i] + (v - va[i]) * k : v));
      }
    }
    return out;
  }

  function wrap(inner, mirror, cls, vb) {
    const g = mirror ? `<g transform="translate(200 0) scale(-1 1)">` : '<g>';
    return `<svg class="fg ${cls || ''}" viewBox="${vb || '0 0 200 160'}" aria-hidden="true">${g}${inner}</g></svg>`;
  }

  // Tight viewBox around the figure (for small thumbnails), keeping a 5:4 frame.
  function fitBox(pose, pad) {
    const F = solve(pose);
    const pts = [F.H, F.N, ...F.a1, ...F.a2, ...F.l1, ...F.l2];
    let x0 = Math.min(...pts.map(p => p[0]), F.head[0] - 10), x1 = Math.max(...pts.map(p => p[0]), F.head[0] + 10);
    let y0 = Math.min(...pts.map(p => p[1]), F.head[1] - 10), y1 = Math.max(...pts.map(p => p[1]), F.head[1] + 10);
    if (F.p.view !== 'top') y1 = Math.max(y1, FLOOR + 2);
    const m = pad == null ? 9 : pad;
    x0 -= m; x1 += m; y0 -= m; y1 += 4;
    let w = x1 - x0, h = y1 - y0;
    if (w / h < 1.25) { const nw = h * 1.25; x0 -= (nw - w) / 2; w = nw; }
    else { const nh = w / 1.25; y0 -= (nh - h); h = nh; }
    return [x0, y0, w, h].map(r1).join(' ');
  }

  function svg(pose, opts) {
    opts = opts || {};
    let vb = opts.fit ? fitBox(pose, opts.pad) : null;
    if (vb && opts.mirror) { const b = vb.split(' ').map(Number); b[0] = 200 - b[0] - b[2]; vb = b.join(' '); }
    return wrap(draw(pose), opts.mirror, opts.cls, vb);
  }

  // Ease into the stretch, hold, ease out — like breathing into it.
  function cycle(u) {
    u = u % 1;
    const ease = x => 0.5 - 0.5 * Math.cos(Math.PI * x);
    if (u < 0.35) return ease(u / 0.35);
    if (u < 0.75) return 1;
    return 1 - ease((u - 0.75) / 0.25);
  }

  const reduceMotion = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Renders an animated figure into `el`. Returns a controller.
  function mount(el, stretch, opts) {
    opts = opts || {};
    let mirror = !!opts.mirror, raf = 0, running = true;
    const pose = stretch.pose;
    const from = stretch.from ? Object.assign({}, pose, stretch.from) : null;
    const dur = stretch.dur || 6500;
    const t0 = performance.now();
    el.innerHTML = wrap('', mirror, opts.cls);
    const root = () => el.querySelector('svg > g');

    function paint(k) {
      const g = root(); if (!g) return;
      g.setAttribute('transform', mirror ? 'translate(200 0) scale(-1 1)' : '');
      g.innerHTML = draw(from ? lerpPose(from, pose, k) : pose);
    }
    function frame(now) {
      if (!running) return;
      paint(cycle((now - t0) / dur));
      raf = requestAnimationFrame(frame);
    }
    if (from && opts.animate !== false && !reduceMotion()) raf = requestAnimationFrame(frame);
    else paint(1);

    return {
      setMirror(m) { mirror = !!m; if (!raf) paint(1); },
      stop() { running = false; cancelAnimationFrame(raf); },
    };
  }

  window.Figure = { svg, mount, draw, solve, FLOOR };
})();
