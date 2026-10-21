/* Tappable front/back body map. Regions carry data-area keys from LIB.AREAS. */
(function () {
  'use strict';

  // Rounded capsule between two points.
  function capsule(x1, y1, x2, y2, w) {
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
    const nx = (-dy / len) * (w / 2), ny = (dx / len) * (w / 2), r = w / 2;
    const f = n => Math.round(n * 10) / 10;
    return `M${f(x1 + nx)} ${f(y1 + ny)}L${f(x2 + nx)} ${f(y2 + ny)}` +
      `A${r} ${r} 0 0 1 ${f(x2 - nx)} ${f(y2 - ny)}L${f(x1 - nx)} ${f(y1 - ny)}A${r} ${r} 0 0 1 ${f(x1 + nx)} ${f(y1 + ny)}Z`;
  }
  const ellipse = (cx, cy, rx, ry) =>
    `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${rx * 2} 0a${rx} ${ry} 0 1 0 ${-rx * 2} 0z`;
  const both = (fn) => fn(1) + fn(-1);
  const mirror = (x, s) => (s > 0 ? x : 120 - x);

  function region(area, d, sel) {
    const on = sel.has(area);
    return `<path d="${d}" class="bm-r${on ? ' on' : ''}" data-act="bm" data-area="${area}"/>`;
  }
  const neutral = d => `<path d="${d}" class="bm-n"/>`;

  function figure(side, sel) {
    let s = '';
    // head + hands + feet (not selectable)
    s += `<ellipse cx="60" cy="19" rx="12" ry="14" class="bm-n"/>`;
    s += both(k => `<circle cx="${mirror(21, k)}" cy="149" r="5.5" class="bm-n"/>`);
    s += both(k => neutral(capsule(mirror(47, k), 238, mirror(42, k), 241, 8)));

    s += region('neck', 'M53 32h14v12a3 3 0 0 1-3 3h-8a3 3 0 0 1-3-3z', sel);
    if (side === 'front') {
      s += neutral('M43 82h34a3 3 0 0 1 3 3v21a3 3 0 0 1-3 3H43a3 3 0 0 1-3-3V85a3 3 0 0 1 3-3z');
      s += region('chest', 'M45 46h30q8 0 8 8v17q0 9-9 9H46q-9 0-9-9V54q0-8 8-8z', sel);
      s += region('hipflexors', 'M41 111h38l-4 16H45z', sel);
      s += both(k => region('quads', capsule(mirror(50, k), 133, mirror(48, k), 182, 19), sel));
      s += both(k => region('adductors', capsule(mirror(57, k), 134, mirror(56, k), 170, 6.5), sel));
      s += both(k => region('calves', capsule(mirror(48, k), 192, mirror(47, k), 232, 12), sel));
    } else {
      s += region('upperback', 'M44 46h32q8 0 7.5 8l-2.5 26q-1 7-8 7H47q-7 0-8-7l-2.5-26Q36 46 44 46z', sel);
      s += region('lowerback', 'M45 90h30a3 3 0 0 1 3 3v15a3 3 0 0 1-3 3H45a3 3 0 0 1-3-3V93a3 3 0 0 1 3-3z', sel);
      s += both(k => region('hamstrings', capsule(mirror(50, k), 140, mirror(48, k), 184, 17), sel));
      s += both(k => region('glutes', ellipse(mirror(51, k), 124, 10.5, 11), sel));
      s += both(k => region('calves', capsule(mirror(48, k), 192, mirror(47, k), 232, 14), sel));
    }
    s += both(k => region('shoulders', ellipse(mirror(36, k), 54, 10.5, 10.5), sel));
    s += both(k => region('arms', capsule(mirror(30, k), 66, mirror(26, k), 99, 12), sel));
    s += both(k => region('wrists', capsule(mirror(25, k), 106, mirror(22, k), 140, 10.5), sel));
    return `<svg class="bm" viewBox="0 0 120 250" role="group" aria-label="${side} of body">${s}</svg>`;
  }

  window.BodyMap = { figure };
})();
