(function () {
  'use strict';

  const { STRETCHES, AREAS, POS, POS_ORDER, byId } = window.LIB;
  const VERSION = '2.3.0';

  // ───────────────────────── helpers
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clone = o => JSON.parse(JSON.stringify(o));
  const pad = n => String(n).padStart(2, '0');
  const dayKey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const fmtClock = s => `${Math.floor(s / 60)}:${pad(Math.max(0, s % 60))}`;
  const fmtMin = s => `${Math.max(1, Math.round(s / 60))} min`;
  const areaName = k => (AREAS.find(a => a.key === k) || {}).name || k;
  const holdLabel = it => `${it.hold}s${it.sides ? ' each side' : ''}`;

  function pick(arr, weight) {
    const ws = arr.map(weight);
    let r = Math.random() * ws.reduce((a, b) => a + b, 0);
    for (let i = 0; i < arr.length; i++) { r -= ws[i]; if (r <= 0) return arr[i]; }
    return arr[arr.length - 1];
  }

  // ───────────────────────── storage (per device)
  const KEY = 'stretch.v2';
  const DEFAULTS = {
    log: [], favs: [], recent: {}, plans: {},
    settings: { minutes: 10, holdScale: 1, ready: 5, sound: true, haptics: true },
    body: { sel: [], minutes: 10, where: 'any' },
    week: null, // { 0..6 (Sun..Sat): routine key } — kept on this device only
  };
  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(KEY)) || {};
      const out = Object.assign(clone(DEFAULTS), d);
      out.settings = Object.assign({}, DEFAULTS.settings, d.settings);
      out.body = Object.assign({}, DEFAULTS.body, d.body);
      return out;
    } catch (e) { return clone(DEFAULTS); }
  }
  let DB = load();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(DB)); } catch (e) { /* private mode */ } };

  // ───────────────────────── icons
  const I = d => `<svg class="ic" viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const S2 = 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"';
  const STAR = 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z';
  const ICON = {
    play: I('<path d="M8 5.2v13.6c0 .8.9 1.3 1.6.9l11-6.8c.6-.4.6-1.4 0-1.8l-11-6.8C8.9 3.9 8 4.4 8 5.2z" fill="currentColor"/>'),
    pause: I('<rect x="6" y="4.5" width="4.2" height="15" rx="1.4" fill="currentColor"/><rect x="13.8" y="4.5" width="4.2" height="15" rx="1.4" fill="currentColor"/>'),
    next: I('<path d="M5 6.3v11.4c0 .8.9 1.2 1.5.8l8.6-5.7c.6-.4.6-1.2 0-1.6L6.5 5.5C5.9 5.1 5 5.5 5 6.3z" fill="currentColor"/><rect x="16.5" y="5" width="2.8" height="14" rx="1.2" fill="currentColor"/>'),
    prev: I('<path d="M19 6.3v11.4c0 .8-.9 1.2-1.5.8l-8.6-5.7c-.6-.4-.6-1.2 0-1.6l8.6-5.7c.6-.4 1.5 0 1.5.8z" fill="currentColor"/><rect x="4.7" y="5" width="2.8" height="14" rx="1.2" fill="currentColor"/>'),
    close: I(`<path d="M6.5 6.5l11 11M17.5 6.5l-11 11" ${S2} stroke-width="2.2"/>`),
    shuffle: I(`<path d="M3 7h3.2c2 0 3.2.9 4.3 2.6l2.6 4.8c1.1 1.7 2.3 2.6 4.3 2.6H21M3 17h3.2c1.4 0 2.4-.5 3.3-1.4M14.4 8.4c.9-.9 1.9-1.4 3.3-1.4H21M18.2 4.2L21 7l-2.8 2.8M18.2 14.2L21 17l-2.8 2.8" ${S2}/>`),
    list: I(`<path d="M9 6h11M9 12h11M9 18h11" ${S2}/><circle cx="4.5" cy="6" r="1.4" fill="currentColor"/><circle cx="4.5" cy="12" r="1.4" fill="currentColor"/><circle cx="4.5" cy="18" r="1.4" fill="currentColor"/>`),
    sliders: I(`<path d="M4 7h8.5M17.5 7H20M4 17h2.5M11.5 17H20" ${S2}/><circle cx="15" cy="7" r="2.5" ${S2}/><circle cx="9" cy="17" r="2.5" ${S2}/>`),
    flame: I('<path d="M12.3 2.5c.6 3-1.6 4.6-1.6 7 0 1.3.9 2.3 2.1 2.3 1.4 0 2-1.1 2-2.4 1.9 1.5 2.9 3.6 2.9 5.8a5.7 5.7 0 0 1-11.4 0c0-4.4 4.6-7 6-12.7z" fill="currentColor"/>'),
    check: I(`<path d="M5 12.5l4.5 4.5L19 7.5" ${S2} stroke-width="2.4"/>`),
    star: I(`<path d="${STAR}" ${S2} stroke-width="1.8"/>`),
    starFill: I(`<path d="${STAR}" fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>`),
    search: I(`<circle cx="11" cy="11" r="6.5" ${S2}/><path d="M16 16l4 4" ${S2}/>`),
    chevL: I(`<path d="M14.5 5.5L8 12l6.5 6.5" ${S2} stroke-width="2.2"/>`),
    chevR: I(`<path d="M9.5 5.5L16 12l-6.5 6.5" ${S2} stroke-width="2.2"/>`),
    plus: I(`<path d="M12 5v14M5 12h14" ${S2} stroke-width="2.2"/>`),
    today: I(`<circle cx="12" cy="12" r="4" ${S2}/><path d="M12 2.8v1.9M12 19.3v1.9M5.5 5.5l1.3 1.3M17.2 17.2l1.3 1.3M2.8 12h1.9M19.3 12h1.9M5.5 18.5l1.3-1.3M17.2 6.8l1.3-1.3" ${S2}/>`),
    body: I(`<circle cx="12" cy="4.6" r="2.3" fill="currentColor"/><path d="M5 8.6c2.3.6 4.6.9 7 .9s4.7-.3 7-.9M12 9.5v5.2M12 14.7l-3 6.3M12 14.7l3 6.3" ${S2} stroke-width="2.2"/>`),
    library: I(`<rect x="4" y="4" width="7" height="7" rx="2" ${S2}/><rect x="13" y="4" width="7" height="7" rx="2" ${S2}/><rect x="4" y="13" width="7" height="7" rx="2" ${S2}/><rect x="13" y="13" width="7" height="7" rx="2" ${S2}/>`),
    progress: I(`<path d="M5 20V13M10 20V8M15 20v-5M20 20V5" ${S2} stroke-width="2.4"/>`),
    share: I(`<path d="M12 3.5v11M8 7l4-3.5L16 7M6 11v7.5a1.5 1.5 0 0 0 1.5 1.5h9a1.5 1.5 0 0 0 1.5-1.5V11" ${S2}/>`),
  };

  // ───────────────────────── routines
  const SPLITS = [
    { key: 'upper', name: 'Upper', title: 'Upper day', tint: '#8f9dff',
      slots: ['chest', 'upperback', 'frontdelt', 'reardelt', 'triceps', 'biceps', 'wrists', 'neck', 'upperback', 'chest', 'shoulders'] },
    { key: 'lower', name: 'Lower', title: 'Lower day', tint: '#4fd6c0', avoidWith: ['legs'],
      slots: ['hamstrings', 'glutes', 'hipflexors', 'adductors', 'lowerback', 'quads', 'calves', 'glutes', 'hamstrings'] },
    { key: 'push', name: 'Push', title: 'Push day', tint: '#ff9a6b',
      slots: ['chest', 'frontdelt', 'triceps', 'chest', 'wrists', 'upperback', 'neck', 'shoulders'] },
    { key: 'pull', name: 'Pull', title: 'Pull day', tint: '#5fbaff',
      slots: ['upperback', 'reardelt', 'biceps', 'wrists', 'upperback', 'neck', 'shoulders', 'lowerback'] },
    { key: 'legs', name: 'Legs', title: 'Leg day', tint: '#a8e063', avoidWith: ['lower'],
      slots: ['quads', 'hipflexors', 'hamstrings', 'glutes', 'calves', 'adductors', 'lowerback', 'quads'] },
  ];
  const MIX = { key: 'mix', name: 'Rest', title: 'Rest day mix', tint: '#7cf0c5', shuffle: true,
    slots: ['hipflexors', 'upperback', 'hamstrings', 'chest', 'glutes', 'neck', 'lowerback', 'wrists', 'quads', 'shoulders', 'adductors', 'calves'] };
  const DAY_TYPES = [...SPLITS, MIX];
  const DAY_KEYS = DAY_TYPES.map(s => s.key);
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Monday first
  const dayType = d => (DB.week && DB.week[d]) || 'mix';
  const QUICK = [
    { key: 'desk', name: 'Desk reset', title: 'Desk reset', sub: 'Neck, wrists and back. No floor needed.', tint: '#ffc861',
      minutes: 4, where: 'desk', holdCap: 30, icon: 'desk-lat',
      slots: ['neck', 'wrists', 'chest', 'upperback', 'hipflexors', 'shoulders', 'lowerback', 'wrists', 'neck'] },
    { key: 'wind', name: 'Wind down', title: 'Wind down', sub: 'Slow floor stretches before bed.', tint: '#b8a1ff',
      minutes: 12, where: 'floor', calm: true, holdBonus: 15, ready: 8, icon: 'childs-pose',
      slots: ['lowerback', 'hipflexors', 'glutes', 'hamstrings', 'adductors', 'upperback', 'lowerback', 'glutes'] },
    { key: 'wrists', name: 'Wrists', title: 'Wrists & forearms', sub: 'For long typing days.', tint: '#ff8fbd',
      minutes: 3, where: 'any', icon: 'prayer', slots: ['wrists'] },
  ];
  const WHERE = {
    any: () => true,
    desk: s => s.pos === 'stand' || s.pos === 'chair',
    floor: s => s.pos === 'kneel' || s.pos === 'sit' || s.pos === 'lie',
  };
  const SWITCH_SECS = 5;
  const defByKey = k => DAY_TYPES.find(s => s.key === k) || QUICK.find(q => q.key === k) || (k === 'body' ? bodyDef() : null);

  function bodyDef() {
    const order = AREAS.map(a => a.key);
    const sel = DB.body.sel.slice().sort((a, b) => order.indexOf(a) - order.indexOf(b));
    return { key: 'body', name: 'Your areas', title: sel.length === 1 ? areaName(sel[0]) : 'Your areas',
      tint: '#7cf0c5', where: DB.body.where, slots: sel };
  }

  function holdFor(s, def) {
    let h = Math.round((s.hold * DB.settings.holdScale) / 5) * 5;
    if (def.holdBonus) h += def.holdBonus;
    if (def.holdCap) h = Math.min(h, def.holdCap);
    return Math.max(15, h);
  }
  const readyFor = def => def.ready || DB.settings.ready;
  const itemSecs = (it, ready) => ready + (it.sides ? it.hold * 2 + SWITCH_SECS : it.hold);

  function build(def, minutes, extraAvoid) {
    const ready = readyFor(def);
    const target = minutes * 60;
    const pool = STRETCHES.filter(s => WHERE[def.where || 'any'](s) && (!def.calm || s.calm));
    const favs = new Set(DB.favs);
    const avoid = new Set([...(DB.recent[def.key] || []), ...(extraAvoid || [])]);
    (def.avoidWith || []).forEach(k => (DB.recent[k] || []).forEach(id => avoid.add(id)));
    const slots = def.shuffle ? def.slots.slice().sort(() => Math.random() - 0.5) : def.slots;
    const items = [];
    let total = 0, i = 0, misses = 0;
    while (slots.length && misses < slots.length) {
      const area = slots[i++ % slots.length];
      const cands = pool.filter(s => s.areas.includes(area) && !items.some(it => it.id === s.id));
      if (!cands.length) { misses++; continue; }
      const s = pick(cands, c => (c.areas[0] === area ? 3 : 1) * (avoid.has(c.id) ? 0.15 : 1) * (favs.has(c.id) ? 2.5 : 1));
      const it = { id: s.id, hold: holdFor(s, def), sides: s.sides };
      const d = itemSecs(it, ready);
      if (total + d > target + 40 && items.length >= 2) { misses++; continue; }
      items.push(it); total += d; misses = 0;
      if (total >= target - 25) break;
    }
    items.sort((a, b) => POS_ORDER[byId[a.id].pos] - POS_ORDER[byId[b.id].pos]);
    return { key: def.key, title: def.title, tint: def.tint, ready, minutes, items, day: dayKey() };
  }

  function planFor(def, minutes) {
    const p = DB.plans[def.key];
    if (p && p.day === dayKey() && p.minutes === minutes && p.items.length && p.items.every(it => byId[it.id])) {
      p.title = def.title; p.tint = def.tint;
      return p;
    }
    return regen(def, minutes);
  }
  function regen(def, minutes, extraAvoid) {
    const p = build(def, minutes, extraAvoid);
    DB.plans[def.key] = p; save();
    return p;
  }
  function single(s) {
    return { key: 'single', title: s.name, tint: '#7cf0c5', ready: 5, minutes: 0,
      items: [{ id: s.id, hold: holdFor(s, {}), sides: s.sides }] };
  }

  function swapItem(r, idx) {
    const cur = byId[r.items[idx].id];
    const def = defByKey(r.key) || { where: 'any' };
    const used = new Set(r.items.map(it => it.id));
    const pool = STRETCHES.filter(s => !used.has(s.id) && WHERE[def.where || 'any'](s) && (!def.calm || s.calm));
    let cands = pool.filter(s => s.areas.includes(cur.areas[0]));
    if (!cands.length) cands = pool.filter(s => s.areas.some(a => cur.areas.includes(a)));
    if (!cands.length) return false;
    const s = pick(cands, c => (c.pos === cur.pos ? 2 : 1));
    r.items[idx] = { id: s.id, hold: holdFor(s, def), sides: s.sides };
    return true;
  }

  // ───────────────────────── history
  const daysSet = () => new Set(DB.log.map(l => l.day));
  function streak() {
    const days = daysSet();
    const d = new Date();
    if (!days.has(dayKey(d))) { d.setDate(d.getDate() - 1); if (!days.has(dayKey(d))) return 0; }
    let n = 0;
    while (days.has(dayKey(d))) { n++; d.setDate(d.getDate() - 1); }
    return n;
  }
  function bestStreak() {
    const days = [...daysSet()].sort();
    let best = 0, run = 0, prev = null;
    for (const k of days) {
      const d = new Date(k + 'T12:00:00');
      if (prev && (d - prev) / 864e5 < 1.5) run++; else run = 1;
      best = Math.max(best, run); prev = d;
    }
    return best;
  }
  function weekStart(d = new Date()) {
    const s = new Date(d); s.setHours(0, 0, 0, 0);
    s.setDate(s.getDate() - ((s.getDay() + 6) % 7));
    return s;
  }
  function weekSecs() {
    const ws = weekStart().getTime();
    return DB.log.filter(l => l.ts >= ws).reduce((t, l) => t + l.secs, 0);
  }

  // ───────────────────────── sound + haptics + screen
  const Sound = (() => {
    let ctx = null;
    function ensure() {
      if (!ctx) {
        const C = window.AudioContext || window.webkitAudioContext;
        if (!C) return null;
        ctx = new C();
      }
      if (ctx.state === 'suspended') ctx.resume();
      return ctx;
    }
    function tone(freq, at, dur, vol) {
      const c = ensure(); if (!c) return;
      const t = c.currentTime + at;
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g); g.connect(c.destination);
      o.start(t); o.stop(t + dur + 0.05);
    }
    const bell = (f, at, v = 0.16) => { tone(f, at, 1.3, v); tone(f * 2.01, at, 0.7, v * 0.25); tone(f * 3.02, at, 0.35, v * 0.08); };
    return {
      unlock() {
        const c = ensure(); if (!c) return;
        const b = c.createBuffer(1, 1, 22050), src = c.createBufferSource();
        src.buffer = b; src.connect(c.destination); src.start(0);
      },
      play(name) {
        if (!DB.settings.sound) return;
        if (name === 'tick') tone(1046.5, 0, 0.14, 0.05);
        if (name === 'go') { bell(659.25, 0); bell(987.77, 0.12); }
        if (name === 'switch') { bell(783.99, 0, 0.13); bell(783.99, 0.2, 0.13); }
        if (name === 'rest') bell(587.33, 0, 0.1);
        if (name === 'finish') { bell(523.25, 0); bell(659.25, 0.15); bell(783.99, 0.3); bell(1046.5, 0.45, 0.14); }
      },
    };
  })();

  function haptic() {
    if (!DB.settings.haptics) return;
    if (navigator.vibrate) { navigator.vibrate(18); return; }
    const l = document.getElementById('haptic'); // iOS: toggling a switch control taps the Taptic Engine
    if (l) l.click();
  }

  let wakeLock = null;
  async function keepAwake(on) {
    try {
      if (on && 'wakeLock' in navigator && document.visibilityState === 'visible') {
        if (!wakeLock) { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener('release', () => { wakeLock = null; }); }
      } else if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
    } catch (e) { /* not supported or denied */ }
  }

  // ───────────────────────── small UI builders
  const thumb = (id, cls = '', pad) => `<div class="thumb ${cls}">${Figure.svg(byId[id].pose, { fit: true, pad })}</div>`;
  const seg = (act, cur, opts, extra = '') =>
    `<div class="seg" role="radiogroup" ${extra}>${opts.map(o =>
      `<button role="radio" aria-checked="${o.v === cur}" class="${o.v === cur ? 'on' : ''}" data-act="${act}" data-v="${o.v}">${o.l}</button>`).join('')}</div>`;
  const LEN_OPTS = [{ v: 5, l: 'Quick' }, { v: 10, l: 'Balanced' }, { v: 15, l: 'Deep' }];

  let toastTimer = 0;
  function toast(msg) {
    let t = $('#toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; t.setAttribute('role', 'status'); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  // ───────────────────────── views
  const UI = { tab: 'today', day: null, dayStamp: null, libFilter: 'all', libQuery: '', calOffset: 0, scroll: {} };


  function header(title, sub, right = '') {
    return `<header class="lt"><div class="lt-row"><div><div class="lt-eyebrow">${sub}</div><h1>${title}</h1></div><div class="lt-actions">${right}</div></div></header>`;
  }

  function vToday() {
    const todayIdx = new Date().getDay();
    if (UI.dayStamp !== dayKey()) { UI.day = null; UI.dayStamp = dayKey(); }
    const selIdx = UI.day == null ? todayIdx : UI.day;
    const def = defByKey(dayType(selIdx));
    const plan = planFor(def, DB.settings.minutes);
    const doneToday = DB.log.some(l => l.day === dayKey() && l.key === def.key);
    const date = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
    const n = streak();
    const right = `<button class="pill-btn streak${n ? ' lit' : ''}" data-act="tab" data-tab="progress" aria-label="${n} day streak">${ICON.flame}<b>${n}</b></button>
      <button class="icon-btn" data-act="settings" aria-label="Settings">${ICON.sliders}</button>`;
    const eyebrow = selIdx !== todayIdx ? DAY_NAMES[selIdx]
      : doneToday ? `${ICON.check} Done today` : `Today · ${DAY_NAMES[todayIdx]}`;
    const title = def.key === 'mix' && !DB.week ? 'Full-body mix' : def.title;
    const shown = plan.items.slice(0, 6);
    const more = plan.items.length - shown.length;


    const ws = weekStart();
    const days = daysSet();
    const strip = DAY_ORDER.map((d, i) => {
      const date = new Date(ws); date.setDate(ws.getDate() + i);
      const done = days.has(dayKey(date));
      const t = defByKey(dayType(d));
      const cls = (d === selIdx ? ' on' : '') + (d === todayIdx ? ' now' : '') + (done ? ' done' : '');
      return `<button class="day${cls}" style="--tint:${t.tint}" data-act="day" data-d="${d}" aria-pressed="${d === selIdx}"
        aria-label="${DAY_NAMES[d]}: ${DB.week ? t.name : 'not set'}${done ? ', stretched' : ''}">
        <span>${DAY_NAMES[d].slice(0, 3)}</span><b>${DB.week ? t.name : '–'}</b><i>${done ? ICON.check : ''}</i></button>`;
    }).join('');
    const setup = DB.week ? '' : `<button class="setup" data-act="week">
        <div><b>Set up your gym week</b><span>Pick what you train each day and the matching stretch routine will be waiting when you get home.</span></div>${ICON.chevR}</button>`;

    return header('Today', esc(date), right) + `
      <section class="sec">
        <div class="sec-h"><h2>Coming home</h2><button class="link" data-act="week">${DB.week ? 'Edit week' : 'Set up'}</button></div>
        ${setup}
        <div class="days">${strip}</div>
        <article class="hero" style="--tint:${def.tint}">
          <div class="hero-eyebrow">${eyebrow}</div>
          <h3>${title}</h3>
          <div class="hero-meta">${plan.items.length} stretches</div>
          <div class="seg-wide">${seg('len', DB.settings.minutes, LEN_OPTS, 'aria-label="Session size"')}</div>
          <button class="hero-strip" data-act="preview" data-key="${def.key}" aria-label="See all stretches">
            ${shown.map(it => thumb(it.id)).join('')}${more > 0 ? `<div class="thumb more">+${more}</div>` : ''}
          </button>
          <div class="hero-actions">
            <button class="btn-start" data-act="start" data-key="${def.key}">${ICON.play}<span>Start</span></button>
            <button class="btn-round" data-act="shuffle" data-key="${def.key}" aria-label="Shuffle stretches">${ICON.shuffle}</button>
            <button class="btn-round" data-act="preview" data-key="${def.key}" aria-label="See the list">${ICON.list}</button>
          </div>
        </article>
      </section>

      <section class="sec">
        <div class="sec-h"><h2>Quick sessions</h2></div>
        <div class="quick-grid">
          ${QUICK.map(q => {
            return `<article class="quick" style="--tint:${q.tint}">
              <button class="quick-main" data-act="preview" data-key="${q.key}">
                ${thumb(q.icon, 'lg', 20)}
                <b>${q.name}</b><span>${esc(q.sub)}</span>
              </button>
              <button class="quick-play" data-act="start" data-key="${q.key}" aria-label="Start ${q.name}">${ICON.play}</button>
            </article>`;
          }).join('')}
          <article class="quick body-card" style="--tint:#7cf0c5">
            <button class="quick-main" data-act="tab" data-tab="body">
              <div class="thumb lg bm-mini">${BodyMap.figure('front', new Set(['neck', 'lowerback', 'hipflexors', 'wrists']))}</div>
              <b>Pick areas</b><span>Tap what feels tight, get a routine for it.</span>
            </button>
          </article>
        </div>
      </section>
`;
  }

  function vBody() {
    const sel = new Set(DB.body.sel);
    const count = STRETCHES.filter(s => WHERE[DB.body.where](s) && s.areas.some(a => sel.has(a))).length;
    return header('Body', 'Tap where you feel tight') + `
      <div class="where">${seg('body-where', DB.body.where, [{ v: 'any', l: 'Anywhere' }, { v: 'desk', l: 'At my desk' }, { v: 'floor', l: 'On the floor' }], 'aria-label="Where are you?"')}</div>
      <div class="bm-wrap card">
        <figure>${BodyMap.figure('front', sel)}<figcaption>Front</figcaption></figure>
        <figure>${BodyMap.figure('back', sel)}<figcaption>Back</figcaption></figure>
      </div>
      <div class="chips wrap">${AREAS.map(a =>
        `<button class="chip${sel.has(a.key) ? ' on' : ''}" data-act="bm" data-area="${a.key}" aria-pressed="${sel.has(a.key)}">${a.name}</button>`).join('')}</div>
      <div class="cta-bar">
        <div class="cta-meta">${sel.size ? `${sel.size} area${sel.size > 1 ? 's' : ''} · ${count} stretches to pick from` : 'Pick at least one area'}</div>
        <div class="seg-wide">${seg('body-len', DB.body.minutes, LEN_OPTS, 'aria-label="Session size"')}</div>
        <div class="cta-row">
          <button class="btn-ghost" data-act="body-preview" ${sel.size ? '' : 'disabled'}>Preview</button>
          <button class="btn-start" data-act="body-start" ${sel.size ? '' : 'disabled'}>${ICON.play}<span>Start</span></button>
        </div>
      </div>`;
  }

  function libMatches() {
    const q = UI.libQuery.trim().toLowerCase();
    const f = UI.libFilter;
    return STRETCHES.filter(s =>
      (f === 'all' || (f === 'fav' ? DB.favs.includes(s.id) : s.areas.includes(f))) &&
      (!q || (s.name + ' ' + s.focus.join(' ') + ' ' + s.areas.map(areaName).join(' ')).toLowerCase().includes(q)));
  }
  function libGrid() {
    const list = libMatches();
    if (!list.length) return `<div class="empty">${UI.libFilter === 'fav' ? 'Tap the star on any stretch to save it here.' : 'No stretches match.'}</div>`;
    return list.map(s => `<button class="lib-card" data-act="detail" data-id="${s.id}">
      ${thumb(s.id)}
      <div class="lib-tx"><b>${esc(s.name)}</b><span>${esc(s.focus.join(' · '))}</span>
      <small>${s.hold}s${s.sides ? ' each side' : ''} · ${POS[s.pos]}</small></div>
      ${DB.favs.includes(s.id) ? `<i class="fav-dot">${ICON.starFill}</i>` : ''}
    </button>`).join('');
  }
  function vLibrary() {
    const filters = [{ k: 'all', n: 'All' }, { k: 'fav', n: 'Favorites' }, ...AREAS.map(a => ({ k: a.key, n: a.name }))];
    return header('Library', `${STRETCHES.length} stretches`) + `
      <label class="search">${ICON.search}<input id="lib-q" type="search" placeholder="Search stretches or muscles" value="${esc(UI.libQuery)}" autocomplete="off"></label>
      <div class="chips scroll">${filters.map(f =>
        `<button class="chip${UI.libFilter === f.k ? ' on' : ''}" data-act="lib-filter" data-k="${f.k}">${f.k === 'fav' ? ICON.starFill : ''}${f.n}</button>`).join('')}</div>
      <div class="lib-grid" id="lib-grid">${libGrid()}</div>`;
  }

  function vProgress() {
    const days = daysSet();
    const base = new Date(); base.setDate(1); base.setMonth(base.getMonth() + UI.calOffset);
    const y = base.getFullYear(), m = base.getMonth();
    const first = (new Date(y, m, 1).getDay() + 6) % 7;
    const nDays = new Date(y, m + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < first; i++) cells.push('<i></i>');
    for (let d = 1; d <= nDays; d++) {
      const k = dayKey(new Date(y, m, d));
      cells.push(`<i class="${days.has(k) ? 'done' : ''}${k === dayKey() ? ' now' : ''}"><span>${d}</span></i>`);
    }
    const monthSecs = DB.log.filter(l => l.day.startsWith(`${y}-${pad(m + 1)}`)).reduce((t, l) => t + l.secs, 0);
    const recent = DB.log.slice(-12).reverse();
    const totalMin = Math.round(DB.log.reduce((t, l) => t + l.secs, 0) / 60);
    return header('Progress', 'Stored on this device') + `
      <div class="stats">
        <div class="stat hero-stat"><span>${ICON.flame} Current streak</span><b>${streak()}</b><small>days</small></div>
        <div class="stat"><span>Best streak</span><b>${bestStreak()}</b></div>
        <div class="stat"><span>This week</span><b>${Math.round(weekSecs() / 60)}</b><small>min</small></div>
        <div class="stat"><span>Sessions</span><b>${DB.log.length}</b></div>
        <div class="stat"><span>All time</span><b>${totalMin}</b><small>min</small></div>
      </div>
      <div class="card cal">
        <div class="cal-h">
          <button class="icon-btn sm" data-act="cal" data-d="-1" aria-label="Previous month">${ICON.chevL}</button>
          <div><b>${base.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</b><span>${Math.round(monthSecs / 60)} min</span></div>
          <button class="icon-btn sm" data-act="cal" data-d="1" aria-label="Next month" ${UI.calOffset >= 0 ? 'disabled' : ''}>${ICON.chevR}</button>
        </div>
        <div class="cal-g">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => `<em>${d}</em>`).join('')}${cells.join('')}</div>
      </div>
      <div class="sec-h"><h2>Recent</h2></div>
      ${recent.length ? `<ul class="card rows">${recent.map(l => {
        const d = new Date(l.ts);
        const tint = (defByKey(l.key) || {}).tint || '#7cf0c5';
        return `<li><i class="dot" style="background:${tint}"></i><div><b>${esc(l.name)}</b><span>${d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · ${l.n} stretches${l.done ? '' : ' · ended early'}</span></div><em>${fmtMin(l.secs)}</em></li>`;
      }).join('')}</ul>` : '<div class="empty card">Your sessions will show up here.</div>'}`;
  }

  const VIEWS = { today: vToday, body: vBody, library: vLibrary, progress: vProgress };

  function render() {
    const v = $('#view');
    v.innerHTML = VIEWS[UI.tab]();
    v.dataset.tab = UI.tab;
    $$('.tabbar button').forEach(b => {
      const on = b.dataset.tab === UI.tab;
      b.classList.toggle('on', on);
      if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
  }

  function go(tab) {
    if (tab === UI.tab) { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    UI.scroll[UI.tab] = window.scrollY;
    UI.tab = tab;
    render();
    window.scrollTo(0, UI.scroll[tab] || 0);
    const v = $('#view'); v.classList.remove('enter'); void v.offsetWidth; v.classList.add('enter');
  }

  // ───────────────────────── sheets
  const sheets = [];
  function openSheet(html, opts = {}) {
    const root = document.createElement('div');
    root.className = 'sheet-wrap';
    root.innerHTML = `<div class="sheet-backdrop" data-act="sheet-close"></div>
      <div class="sheet ${opts.cls || ''}" role="dialog" aria-modal="true" ${opts.tint ? `style="--tint:${opts.tint}"` : ''}>
        <div class="sheet-grab" aria-hidden="true"><i></i></div>
        <button class="icon-btn sm sheet-x" data-act="sheet-close" aria-label="Close">${ICON.close}</button>
        <div class="sheet-body">${html}</div>
      </div>`;
    document.body.appendChild(root);
    const entry = { root, opts };
    sheets.push(entry);
    document.documentElement.classList.add('sheet-open');
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('open')));
    dragToClose(entry);
    if (opts.onOpen) opts.onOpen(root);
    return entry;
  }
  function closeSheet(entry) {
    entry = entry || sheets[sheets.length - 1];
    if (!entry || entry.closing) return;
    entry.closing = true;
    sheets.splice(sheets.indexOf(entry), 1);
    if (entry.opts.onClose) entry.opts.onClose();
    entry.root.classList.remove('open');
    setTimeout(() => entry.root.remove(), 380);
    if (!sheets.length) document.documentElement.classList.remove('sheet-open');
  }
  const closeAllSheets = () => { while (sheets.length) closeSheet(); };

  function dragToClose(entry) {
    const sheet = $('.sheet', entry.root);
    const body = $('.sheet-body', entry.root);
    let y0 = null, dy = 0;
    sheet.addEventListener('touchstart', e => {
      const fromTop = e.target.closest('.sheet-grab') || body.scrollTop <= 0;
      y0 = fromTop ? e.touches[0].clientY : null; dy = 0;
    }, { passive: true });
    sheet.addEventListener('touchmove', e => {
      if (y0 == null) return;
      dy = Math.max(0, e.touches[0].clientY - y0);
      if (dy > 4) { sheet.style.transition = 'none'; sheet.style.transform = `translateY(${dy}px)`; }
    }, { passive: true });
    sheet.addEventListener('touchend', () => {
      if (y0 == null) return;
      sheet.style.transition = ''; sheet.style.transform = '';
      if (dy > 110) closeSheet(entry);
      y0 = null;
    });
  }

  // Routine preview
  let preview = null;
  function previewHTML(r) {
    return `<div class="sh-head">
        <div class="sh-eyebrow">${r.items.length} stretches</div>
        <h2>${esc(r.title)}</h2>
      </div>
      <ol class="rlist">${r.items.map((it, i) => {
        const s = byId[it.id];
        return `<li>
          <button class="rl-main" data-act="detail" data-id="${s.id}" data-from="preview">
            ${thumb(s.id)}
            <div class="rl-tx"><b>${esc(s.name)}</b><span>${holdLabel(it)} · ${esc(s.focus[0])}</span></div>
          </button>
          <button class="icon-btn sm" data-act="swap" data-i="${i}" aria-label="Swap for a different stretch">${ICON.shuffle}</button>
        </li>`;
      }).join('')}</ol>
      <div class="sh-foot">
        ${r.key !== 'single' ? `<button class="btn-ghost" data-act="pv-shuffle">${ICON.shuffle}<span>Shuffle all</span></button>` : ''}
        <button class="btn-start" data-act="pv-start">${ICON.play}<span>Start</span></button>
      </div>`;
  }
  function openPreview(r) {
    preview = { r };
    preview.entry = openSheet(previewHTML(r), { tint: r.tint, cls: 'tall', onClose: () => { preview = null; } });
  }
  function refreshPreview() {
    if (!preview) return;
    $('.sheet-body', preview.entry.root).innerHTML = previewHTML(preview.r);
    if (preview.r.key !== 'body' && DB.plans[preview.r.key] === preview.r) save();
    if (UI.tab === 'today') render();
  }

  // Stretch detail
  function openDetail(id) {
    const s = byId[id];
    const it = single(s).items[0];
    const fav = DB.favs.includes(id);
    let fig = null;
    openSheet(`
      <div class="dt-fig"></div>
      <div class="sh-head">
        <div class="sh-eyebrow">${POS[s.pos]} · ${holdLabel(it)}</div>
        <h2>${esc(s.name)}</h2>
        <div class="tags">${s.focus.map(f => `<span>${esc(f)}</span>`).join('')}</div>
      </div>
      <h4>How to</h4>
      <ol class="steps">${s.steps.map(t => `<li>${esc(t)}</li>`).join('')}</ol>
      <div class="callout feel"><b>Feel it</b><p>${esc(s.feel)}</p></div>
      <div class="callout avoid"><b>Avoid</b><p>${esc(s.avoid)}</p></div>
      <div class="sh-foot">
        <button class="btn-round fav${fav ? ' on' : ''}" data-act="fav" data-id="${id}" aria-pressed="${fav}" aria-label="Favorite">${fav ? ICON.starFill : ICON.star}</button>
        <button class="btn-start" data-act="start-one" data-id="${id}">${ICON.play}<span>Do this one</span></button>
      </div>`, {
      cls: 'tall detail',
      onOpen: root => { fig = Figure.mount($('.dt-fig', root), s, { animate: true }); },
      onClose: () => fig && fig.stop(),
    });
  }

  function openSettings() {
    const st = DB.settings;
    const html = () => `<div class="sh-head"><div class="sh-eyebrow">Stretch ${VERSION}</div><h2>Settings</h2></div>
      <div class="set-list card">
        <div class="set stack"><div><b>Session size</b><span>How much your coming-home routine includes</span></div>${seg('set-minutes', st.minutes, LEN_OPTS)}</div>
        <div class="set"><div><b>Hold times</b><span>Applies to every stretch</span></div>${seg('set-hold', st.holdScale, [{ v: 0.75, l: 'Shorter' }, { v: 1, l: 'Normal' }, { v: 1.25, l: 'Longer' }])}</div>
        <div class="set"><div><b>Get-ready time</b><span>Before each stretch</span></div>${seg('set-ready', st.ready, [{ v: 3, l: '3s' }, { v: 5, l: '5s' }, { v: 8, l: '8s' }])}</div>
        <div class="set"><div><b>Chimes</b><span>Plays through the ringer. Silent mode mutes them.</span></div>${seg('set-sound', st.sound, [{ v: true, l: 'On' }, { v: false, l: 'Off' }])}</div>
        <div class="set"><div><b>Haptics</b><span>Taps on button presses where supported</span></div>${seg('set-haptics', st.haptics, [{ v: true, l: 'On' }, { v: false, l: 'Off' }])}</div>
      </div>
      <div class="sec-h"><h2>Your gym week</h2><button class="link" data-act="week">Edit</button></div>
      <div class="card week-sum">${DAY_ORDER.map(d => {
        const t = defByKey(dayType(d));
        return `<span style="--tint:${t.tint}"><em>${DAY_NAMES[d].slice(0, 3)}</em>${DB.week ? t.name : '–'}</span>`;
      }).join('')}</div>
      <div class="sec-h"><h2>Data</h2></div>
      <div class="card set-list">
        <div class="set"><div><b>Move your data</b><span>Copy your week, history and favorites here, then paste them into Stretch on another device or browser.</span></div>
        <div class="btn-pair"><button class="btn-small" data-act="data-copy">Copy</button><button class="btn-small" data-act="data-paste">Paste</button></div></div>
        <div class="set"><div><b>History</b><span>${DB.log.length} sessions, saved only on this device</span></div>
        <button class="btn-danger" data-act="reset">Reset</button></div>
      </div>`;
    const entry = openSheet(html(), { cls: 'tall' });
    entry.refresh = () => { $('.sheet-body', entry.root).innerHTML = html(); };
    settingsEntry = entry;
  }
  let settingsEntry = null;

  function openWeek() {
    const opts = d => DAY_TYPES.map(t =>
      `<option value="${t.key}"${DB.week && dayType(d) === t.key ? ' selected' : ''}>${t.key === 'mix' ? 'Rest day (random mix)' : t.name}</option>`).join('');
    const html = () => `<div class="sh-head"><div class="sh-eyebrow">Saved only on this device</div><h2>Your gym week</h2></div>
      <div class="card set-list">${DAY_ORDER.map(d => `<label class="set week-row" style="--tint:${DB.week ? defByKey(dayType(d)).tint : 'transparent'}">
        <b>${DAY_NAMES[d]}</b>
        <div class="select">${DB.week ? '' : '<em>Choose</em>'}<select data-week="${d}" aria-label="${DAY_NAMES[d]}">${DB.week ? '' : '<option value="" selected disabled hidden></option>'}${opts(d)}</select>${ICON.chevR}</div>
      </label>`).join('')}</div>
      <p class="note">Your coming-home routine follows this week. Rest days get a random full-body mix. Your week is stored on this device, not on the website, so nobody else can see it. Set it once on each device you use.</p>
      <div class="sh-foot"><button class="btn-start" data-act="sheet-close"><span>Done</span></button></div>`;
    const entry = openSheet(html(), { cls: 'tall' });
    entry.refresh = () => { $('.sheet-body', entry.root).innerHTML = html(); };
    weekEntry = entry;
  }
  let weekEntry = null;

  // ───────────────────────── moving data between browsers / devices
  const DATA_TAG = 'STRETCH1:';
  function exportCode() {
    const d = { log: DB.log, favs: DB.favs, week: DB.week, settings: DB.settings, body: DB.body, recent: DB.recent };
    return DATA_TAG + btoa(unescape(encodeURIComponent(JSON.stringify(d))));
  }
  function importCode(text) {
    const m = new RegExp(DATA_TAG + '([A-Za-z0-9+/=]+)').exec(String(text || '').replace(/\s+/g, ''));
    let d = null;
    try { d = m && JSON.parse(decodeURIComponent(escape(atob(m[1])))); } catch (e) { d = null; }
    if (!d || typeof d !== 'object') { toast("That doesn't look like copied Stretch data."); return false; }
    const seen = new Set(DB.log.map(l => l.ts));
    const added = (Array.isArray(d.log) ? d.log : []).filter(l => l && l.ts && l.day && !seen.has(l.ts));
    DB.log = DB.log.concat(added).sort((a, b) => a.ts - b.ts);
    DB.favs = [...new Set([...DB.favs, ...(Array.isArray(d.favs) ? d.favs : [])])].filter(id => byId[id]);
    if (d.week && typeof d.week === 'object') DB.week = d.week;
    if (d.settings) DB.settings = Object.assign({}, DB.settings, d.settings);
    if (d.body) DB.body = Object.assign({}, DB.body, d.body);
    if (d.recent) DB.recent = Object.assign({}, d.recent, DB.recent);
    DB.plans = {};
    save(); render();
    if (settingsEntry && settingsEntry.root.isConnected) settingsEntry.refresh();
    toast(added.length ? `Added ${added.length} session${added.length > 1 ? 's' : ''} and your week` : 'Your week and settings are in. No new sessions to add.');
    return true;
  }
  function openPasteSheet() {
    const entry = openSheet(`<div class="sh-head"><div class="sh-eyebrow">Move your data</div><h2>Paste your data</h2></div>
      <p class="note">On the other device or browser, open Settings and tap Copy. Then paste here.</p>
      <textarea id="data-in" class="paste" rows="5" placeholder="STRETCH1:…" autocomplete="off" autocapitalize="off" spellcheck="false"></textarea>
      <div class="sh-foot"><button class="btn-start" data-act="data-import"><span>Add my data</span></button></div>`);
    pasteEntry = entry;
  }
  let pasteEntry = null;

  // ───────────────────────── player
  let PL = null;

  function buildSteps(r) {
    const steps = [];
    r.items.forEach((it, i) => {
      steps.push({ type: 'ready', i, side: 0, dur: i === 0 ? Math.max(r.ready, 5) : r.ready });
      steps.push({ type: 'hold', i, side: 0, dur: it.hold });
      if (it.sides) {
        steps.push({ type: 'switch', i, side: 1, dur: SWITCH_SECS });
        steps.push({ type: 'hold', i, side: 1, dur: it.hold });
      }
    });
    return steps;
  }

  function startRoutine(r) {
    if (!r || !r.items.length) { toast('No stretches match. Try different areas or settings.'); return; }
    Sound.unlock(); haptic();
    closeAllSheets();
    PL = { r, steps: buildSteps(r), k: -1, paused: false, endsAt: 0, left: 0, raf: 0, fig: null, lastSec: null, cueAt: 0, cueIdx: 0, done: false, heldMs: 0 };
    renderPlayer();
    keepAwake(true);
    goStep(0, Date.now(), true);
    loop();
  }

  function renderPlayer() {
    const r = PL.r;
    const root = $('#player');
    root.style.setProperty('--tint', r.tint);
    root.innerHTML = `
      <header class="pl-top">
        <button class="icon-btn" data-act="pl-close" aria-label="End session">${ICON.close}</button>
        <div class="pl-progress">
          <div class="pl-segs">${r.items.map(() => '<i><b></b></i>').join('')}</div>
          <div class="pl-meta"><span class="pl-count"></span></div>
        </div>
        <button class="icon-btn" data-act="pl-list" aria-label="See all stretches">${ICON.list}</button>
      </header>
      <div class="pl-stage">
        <svg class="pl-ring" viewBox="0 0 100 100" aria-hidden="true"><circle class="trk" cx="50" cy="50" r="47"/><circle class="prg" cx="50" cy="50" r="47" pathLength="100"/></svg>
        <div class="pl-fig"></div>
        <div class="pl-badge"></div>
      </div>
      <div class="pl-info">
        <div class="pl-phase"></div>
        <h2 class="pl-name"></h2>
        <div class="pl-focus"></div>
        <div class="pl-time-row"><div class="pl-time" aria-live="off"></div><button class="pl-plus" data-act="pl-plus">+15s</button></div>
        <p class="pl-cue"></p>
      </div>
      <div class="pl-controls">
        <button class="pl-btn" data-act="pl-prev" aria-label="Previous">${ICON.prev}</button>
        <button class="pl-btn main" data-act="pl-toggle" aria-label="Pause">${ICON.pause}</button>
        <button class="pl-btn" data-act="pl-next" aria-label="Skip">${ICON.next}</button>
      </div>
      <div class="pl-upnext"></div>`;
    root.hidden = false;
    document.documentElement.classList.add('playing');
    requestAnimationFrame(() => root.classList.add('open'));
  }

  function cuesFor(s) {
    return [`Feel it: ${s.feel}`, ...s.steps, `Avoid: ${s.avoid}`, 'Breathe slowly. Relax a little deeper each time you breathe out.'];
  }

  function paintStep(st) {
    const root = $('#player');
    const it = PL.r.items[st.i], s = byId[it.id];
    const n = PL.r.items.length;
    root.dataset.phase = st.type;
    if (PL.fig) PL.fig.stop();
    PL.fig = Figure.mount($('.pl-fig', root), s, { mirror: st.side === 1, animate: st.type === 'hold' });
    const phase = st.type === 'ready' ? (st.i === 0 ? 'Get into position' : 'Next up')
      : st.type === 'switch' ? 'Switch sides' : 'Hold';
    $('.pl-phase', root).textContent = phase;
    $('.pl-name', root).textContent = s.name;
    $('.pl-focus', root).textContent = s.focus.join(' · ');
    $('.pl-badge', root).textContent = it.sides ? `Side ${st.side + 1} of 2` : '';
    $('.pl-badge', root).hidden = !it.sides;
    $('.pl-count', root).textContent = `${st.i + 1} of ${n}`;
    const nx = PL.r.items[st.i + 1];
    $('.pl-upnext', root).innerHTML = nx ? `Then <b>${esc(byId[nx.id].name)}</b>` : 'Last one';
    const cue = st.type === 'ready' ? s.steps[0] : st.type === 'switch' ? 'Ease out and set up on the other side.' : cuesFor(s)[0];
    setCue(cue);
    PL.cueIdx = 0; PL.cueAt = Date.now();
    $('.pl-plus', root).hidden = st.type !== 'hold';
    $$('.pl-segs i', root).forEach((el, i) => el.classList.toggle('cur', i === st.i));
    paintToggle();
  }

  function setCue(text) {
    const el = $('#player .pl-cue');
    if (!el || el.textContent === text) return;
    el.classList.add('fade');
    setTimeout(() => { el.textContent = text; el.classList.remove('fade'); }, 180);
  }
  function paintToggle() {
    const b = $('#player [data-act="pl-toggle"]');
    if (!b) return;
    b.innerHTML = PL.paused ? ICON.play : ICON.pause;
    b.setAttribute('aria-label', PL.paused ? 'Resume' : 'Pause');
    $('#player').classList.toggle('paused', PL.paused);
  }

  // Credit time actually spent holding the current step (skips don't count).
  function bank(full) {
    const st = PL.steps[PL.k];
    if (!st || st.type !== 'hold') return;
    const left = full ? 0 : Math.max(0, PL.paused ? PL.left : PL.endsAt - Date.now());
    PL.heldMs += st.dur * 1000 - left;
  }

  function goStep(k, t0, quiet, banked) {
    if (!banked) bank(false);
    if (k >= PL.steps.length) { PL.k = k; finish(true); return; }
    PL.k = k;
    const st = PL.steps[k];
    PL.endsAt = t0 + st.dur * 1000;
    PL.left = st.dur * 1000;
    PL.lastSec = null;
    paintStep(st);
    if (quiet) return;
    if (st.type === 'hold') { Sound.play('go'); haptic(); }
    else if (st.type === 'switch') { Sound.play('switch'); haptic(); }
    else if (st.type === 'ready') Sound.play('rest');
  }

  function loop() {
    if (!PL || PL.done) return;
    const now = Date.now();
    if (!PL.paused && now >= PL.endsAt) {
      // Catch up if the phone was locked or the app was in the background.
      let k = PL.k, t = PL.endsAt, hops = 0;
      bank(true);
      while (k < PL.steps.length && now >= t) {
        k++; hops++;
        if (k < PL.steps.length) {
          t += PL.steps[k].dur * 1000;
          if (now >= t && PL.steps[k].type === 'hold') PL.heldMs += PL.steps[k].dur * 1000;
        }
      }
      goStep(k, t - (k < PL.steps.length ? PL.steps[k].dur * 1000 : 0), hops > 1, true);
      if (!PL || PL.done) return;
    }
    paintTime(now);
    PL.raf = requestAnimationFrame(loop);
  }

  function paintTime(now) {
    const root = $('#player');
    const st = PL.steps[PL.k];
    const left = Math.max(0, PL.paused ? PL.left : PL.endsAt - now);
    const frac = 1 - left / (st.dur * 1000);
    $('.prg', root).style.strokeDashoffset = String(100 - frac * 100);
    const sec = Math.ceil(left / 1000);
    if (sec !== PL.lastSec) {
      PL.lastSec = sec;
      $('.pl-time', root).textContent = st.type === 'hold' ? fmtClock(sec) : String(sec);
      if (!PL.paused && sec > 0 && sec <= 3 && st.type !== 'switch') Sound.play('tick');
    }
    // segment bars
    const steps = PL.steps;
    let a = PL.k; while (a > 0 && steps[a - 1].i === st.i) a--;
    let tot = 0, done = 0;
    for (let k = a; k < steps.length && steps[k].i === st.i; k++) {
      tot += steps[k].dur;
      if (k < PL.k) done += steps[k].dur;
    }
    done += st.dur * frac;
    $$('.pl-segs i', root).forEach((el, i) => {
      el.firstChild.style.transform = `scaleX(${i < st.i ? 1 : i > st.i ? 0 : done / tot})`;
    });
    // rotate coaching cues during a hold
    if (st.type === 'hold' && !PL.paused && now - PL.cueAt > 8000) {
      const cues = cuesFor(byId[PL.r.items[st.i].id]);
      PL.cueIdx = (PL.cueIdx + 1) % cues.length; PL.cueAt = now;
      setCue(cues[PL.cueIdx]);
    }
  }

  function heldSecs() {
    if (!PL) return 0;
    let ms = PL.heldMs;
    const st = PL.steps[PL.k];
    if (st && st.type === 'hold') ms += st.dur * 1000 - Math.max(0, PL.paused ? PL.left : PL.endsAt - Date.now());
    return Math.round(ms / 1000);
  }

  const P = {
    toggle() {
      if (!PL || PL.done) return;
      const now = Date.now();
      if (PL.paused) { PL.endsAt = now + PL.left; PL.paused = false; PL.cueAt = now; keepAwake(true); }
      else { PL.left = Math.max(0, PL.endsAt - now); PL.paused = true; }
      haptic(); paintToggle(); PL.lastSec = null;
    },
    next() {
      if (!PL || PL.done) return;
      const st = PL.steps[PL.k];
      haptic();
      if (st.type !== 'hold') return goStep(PL.k + 1, Date.now());
      let k = PL.k + 1;
      while (k < PL.steps.length && PL.steps[k].type !== 'ready') k++;
      goStep(k, Date.now(), true);
    },
    prev() {
      if (!PL || PL.done) return;
      const st = PL.steps[PL.k];
      const elapsed = st.dur * 1000 - (PL.paused ? PL.left : PL.endsAt - Date.now());
      let k = PL.k;
      while (k > 0 && PL.steps[k].type !== 'ready') k--;
      if (k === PL.k && elapsed < 2500 && k > 0) { k--; while (k > 0 && PL.steps[k].type !== 'ready') k--; }
      haptic();
      goStep(k, Date.now(), true);
    },
    plus() {
      if (!PL) return;
      const st = PL.steps[PL.k];
      if (st.type !== 'hold') return;
      st.dur += 15;
      if (PL.paused) PL.left += 15000; else PL.endsAt += 15000;
      PL.lastSec = null; haptic();
    },
  };

  function finish(completed) {
    if (!PL || PL.done) return;
    const secs = heldSecs();
    PL.done = true;
    cancelAnimationFrame(PL.raf);
    if (PL.fig) PL.fig.stop();
    keepAwake(false);
    const r = PL.r;
    const cur = PL.steps[PL.k];
    const n = completed || !cur ? r.items.length : cur.i + (cur.type === 'hold' ? 1 : 0);
    if (completed || secs >= 30) {
      DB.log.push({ ts: Date.now(), day: dayKey(), key: r.key, name: r.title, secs, n, done: completed,
        split: DAY_KEYS.includes(r.key) ? r.key : null });
      if (r.key !== 'single') DB.recent[r.key] = r.items.map(it => it.id);
      if (completed && DAY_KEYS.includes(r.key)) { UI.day = null; delete DB.plans[r.key]; }
      save();
    }
    if (!completed) { closePlayer(); render(); if (secs >= 30) toast(`Saved ${fmtMin(secs)}`); return; }
    Sound.play('finish'); haptic();
    const root = $('#player');
    root.dataset.phase = 'done';
    root.innerHTML = `<div class="finish">
      <div class="done-badge">${ICON.check}</div>
      <h2>Nice work</h2>
      <p>${esc(r.title)}</p>
      <div class="done-stats">
        <div><b>${Math.max(1, Math.round(secs / 60))}</b><span>minutes</span></div>
        <div><b>${r.items.length}</b><span>stretches</span></div>
        <div><b>${streak()}</b><span>day streak</span></div>
      </div>
      <button class="btn-start" data-act="pl-done"><span>Done</span></button>
    </div>`;
  }

  let pendingReload = false;
  function closePlayer() {
    if (pendingReload) { location.reload(); return; }
    const root = $('#player');
    if (PL) { cancelAnimationFrame(PL.raf); if (PL.fig) PL.fig.stop(); }
    PL = null;
    keepAwake(false);
    root.classList.remove('open');
    document.documentElement.classList.remove('playing');
    setTimeout(() => { if (!PL) { root.hidden = true; root.innerHTML = ''; } }, 350);
  }

  function confirmEnd() {
    if (!PL) return;
    if (!PL.paused) P.toggle();
    const secs = heldSecs();
    const root = $('#player');
    const d = document.createElement('div');
    d.className = 'pl-confirm';
    d.innerHTML = `<div class="pl-dialog" role="alertdialog" aria-label="End session">
      <b>End this session?</b>
      <span>${secs >= 30 ? `You've stretched for ${fmtMin(secs)}. That still counts toward your streak.` : 'Less than 30 seconds in, so nothing will be saved.'}</span>
      <button class="btn-start" data-act="pl-end">${secs >= 30 ? 'End and save' : 'End session'}</button>
      <button class="btn-ghost" data-act="pl-keep">Keep going</button>
    </div>`;
    root.appendChild(d);
  }

  function showPlayerList() {
    if (!PL) return;
    const r = PL.r, cur = PL.steps[PL.k].i;
    const d = document.createElement('div');
    d.className = 'pl-confirm';
    d.innerHTML = `<div class="pl-dialog list"><b>${esc(r.title)}</b>
      <ol class="rlist compact">${r.items.map((it, i) => `<li class="${i < cur ? 'past' : i === cur ? 'cur' : ''}">
        <button class="rl-main" data-act="pl-jump" data-i="${i}">${thumb(it.id)}<div class="rl-tx"><b>${esc(byId[it.id].name)}</b><span>${holdLabel(it)}</span></div></button></li>`).join('')}</ol>
      <button class="btn-ghost" data-act="pl-keep">Close</button></div>`;
    $('#player').appendChild(d);
  }

  // ───────────────────────── actions
  const startKey = key => {
    const def = defByKey(key);
    const minutes = DAY_KEYS.includes(key) ? DB.settings.minutes : key === 'body' ? DB.body.minutes : def.minutes;
    startRoutine(key === 'body' ? build(def, minutes) : planFor(def, minutes));
  };
  const toggleBody = area => {
    const sel = new Set(DB.body.sel);
    if (sel.has(area)) sel.delete(area); else sel.add(area);
    DB.body.sel = [...sel]; save();
    haptic();
    const y = window.scrollY; render(); window.scrollTo(0, y);
  };

  const ACTIONS = {
    tab: el => go(el.dataset.tab),
    day: el => { UI.day = Number(el.dataset.d); UI.dayStamp = dayKey(); haptic(); render(); },
    week: () => openWeek(),
    len: el => { DB.settings.minutes = Number(el.dataset.v); save(); render(); },
    start: el => startKey(el.dataset.key),
    shuffle: el => {
      const def = defByKey(el.dataset.key);
      const cur = planFor(def, DB.settings.minutes);
      regen(def, DB.settings.minutes, cur.items.map(it => it.id));
      haptic(); render();
      const strip = $('.hero-strip'); if (strip) { strip.classList.remove('pop'); void strip.offsetWidth; strip.classList.add('pop'); }
    },
    preview: el => {
      const key = el.dataset.key, def = defByKey(key);
      openPreview(planFor(def, DAY_KEYS.includes(key) ? DB.settings.minutes : def.minutes));
    },
    settings: () => openSettings(),

    bm: el => toggleBody(el.dataset.area),
    'body-len': el => { DB.body.minutes = Number(el.dataset.v); save(); render(); },
    'body-where': el => { DB.body.where = el.dataset.v; save(); render(); },
    'body-preview': () => openPreview(build(bodyDef(), DB.body.minutes)),
    'body-start': () => startKey('body'),

    'lib-filter': el => { UI.libFilter = el.dataset.k; render(); },
    detail: el => openDetail(el.dataset.id),
    fav: el => {
      const id = el.dataset.id, i = DB.favs.indexOf(id);
      if (i >= 0) DB.favs.splice(i, 1); else DB.favs.push(id);
      save(); haptic();
      const on = i < 0;
      el.classList.toggle('on', on); el.innerHTML = on ? ICON.starFill : ICON.star; el.setAttribute('aria-pressed', on);
      if (on) toast('Added to favorites. It will come up more often.');
      if (UI.tab === 'library') { const g = $('#lib-grid'); if (g) g.innerHTML = libGrid(); }
    },
    'start-one': el => startRoutine(single(byId[el.dataset.id])),

    swap: el => { if (preview && swapItem(preview.r, Number(el.dataset.i))) { haptic(); refreshPreview(); } },
    'pv-shuffle': () => {
      if (!preview) return;
      const r = preview.r, def = defByKey(r.key);
      const fresh = build(def, r.minutes || DB.settings.minutes, r.items.map(it => it.id));
      if (r.key !== 'body') DB.plans[r.key] = fresh;
      preview.r = fresh; haptic(); refreshPreview();
    },
    'pv-start': () => preview && startRoutine(preview.r),
    'sheet-close': () => closeSheet(),

    cal: el => { UI.calOffset = Math.min(0, UI.calOffset + Number(el.dataset.d)); render(); },

    'set-minutes': el => { DB.settings.minutes = Number(el.dataset.v); save(); settingsEntry.refresh(); render(); },
    'set-hold': el => { DB.settings.holdScale = Number(el.dataset.v); DB.plans = {}; save(); settingsEntry.refresh(); render(); },
    'set-ready': el => { DB.settings.ready = Number(el.dataset.v); DB.plans = {}; save(); settingsEntry.refresh(); render(); },
    'set-sound': el => { DB.settings.sound = el.dataset.v === 'true'; save(); settingsEntry.refresh(); if (DB.settings.sound) { Sound.unlock(); Sound.play('go'); } },
    'set-haptics': el => { DB.settings.haptics = el.dataset.v === 'true'; save(); settingsEntry.refresh(); haptic(); },
    'data-copy': async () => {
      const code = exportCode();
      try { await navigator.clipboard.writeText(code); toast('Copied. Now open Stretch where you want it and tap Paste.'); }
      catch (e) {
        openSheet(`<div class="sh-head"><div class="sh-eyebrow">Move your data</div><h2>Copy this</h2></div>
          <p class="note">Select all of it and copy, then paste it into Stretch on the other device or browser.</p>
          <textarea class="paste" rows="6" readonly>${code}</textarea>`);
      }
    },
    'data-paste': async () => {
      try { const t = await navigator.clipboard.readText(); if (t && t.includes(DATA_TAG)) { importCode(t); return; } } catch (e) { /* no clipboard access */ }
      openPasteSheet();
    },
    'data-import': () => { if (importCode($('#data-in') && $('#data-in').value) && pasteEntry) closeSheet(pasteEntry); },
    reset: el => {
      if (el.dataset.armed) { DB.log = []; DB.recent = {}; DB.plans = {}; save(); settingsEntry.refresh(); render(); toast('History cleared'); return; }
      el.dataset.armed = '1'; el.textContent = 'Tap again to erase';
    },

    'pl-toggle': () => P.toggle(),
    'pl-next': () => P.next(),
    'pl-prev': () => P.prev(),
    'pl-plus': () => P.plus(),
    'pl-close': () => confirmEnd(),
    'pl-list': () => showPlayerList(),
    'pl-end': () => finish(false),
    'pl-keep': el => { el.closest('.pl-confirm').remove(); },
    'pl-jump': el => {
      const i = Number(el.dataset.i);
      el.closest('.pl-confirm').remove();
      const k = PL.steps.findIndex(s => s.i === i && s.type === 'ready');
      if (k >= 0) goStep(k, Date.now(), true);
    },
    'pl-done': () => { closePlayer(); UI.tab = 'today'; render(); window.scrollTo(0, 0); },
  };

  document.addEventListener('click', e => {
    const el = e.target.closest('[data-act]');
    if (!el || el.disabled) return;
    const fn = ACTIONS[el.dataset.act];
    if (fn) { e.preventDefault(); fn(el, e); }
  });
  document.addEventListener('change', e => {
    const d = e.target.dataset && e.target.dataset.week;
    if (d == null || !e.target.value) return;
    if (!DB.week) DB.week = { 0: 'mix', 1: 'mix', 2: 'mix', 3: 'mix', 4: 'mix', 5: 'mix', 6: 'mix' };
    DB.week[d] = e.target.value;
    save(); haptic();
    if (weekEntry) weekEntry.refresh();
    if (settingsEntry && settingsEntry.root.isConnected) settingsEntry.refresh();
    UI.day = null; render();
  });
  document.addEventListener('input', e => {
    if (e.target.id === 'lib-q') { UI.libQuery = e.target.value; $('#lib-grid').innerHTML = libGrid(); }
  });
  document.addEventListener('keydown', e => {
    if (PL && !PL.done) {
      if ($('#player .pl-confirm')) { if (e.key === 'Escape') $('#player .pl-confirm').remove(); return; }
      if (e.key === ' ') { e.preventDefault(); P.toggle(); }
      else if (e.key === 'ArrowRight') P.next();
      else if (e.key === 'ArrowLeft') P.prev();
      else if (e.key === 'Escape') confirmEnd();
    } else if (PL && PL.done && (e.key === 'Enter' || e.key === 'Escape')) ACTIONS['pl-done']();
    else if (e.key === 'Escape' && sheets.length) closeSheet();
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      if (PL && !PL.done) keepAwake(true);
      if (!PL && UI.tab === 'today') render(); // the day may have rolled over
    }
  });

  // ───────────────────────── boot
  if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
  document.addEventListener('gesturestart', e => e.preventDefault()); // Safari pinch-zoom
  render();
  requestAnimationFrame(() => document.documentElement.classList.add('ready'));
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    // When a new version takes over, reload once so it shows right away
    // (not mid-session, and not on the very first visit).
    const hadController = !!navigator.serviceWorker.controller;
    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || reloading) return;
      if (PL) { pendingReload = true; return; }
      reloading = true; location.reload();
    });
    window.addEventListener('load', () => navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' })
      .then(reg => reg.update()).catch(() => {}));
  }
})();
