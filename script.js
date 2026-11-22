(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var slides = [].slice.call(document.querySelectorAll('.slide')), total = slides.length, cur = 0;
  var counter = $('counter'), titleEl = $('slideTitle'), fill = $('progressFill'), notes = $('notes');
  var prevBtn = $('prevBtn'), nextBtn = $('nextBtn'), fsBtn = $('fsBtn'), notesBtn = $('notesBtn');
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };

  /* ---------- typed-text helper (used by hover and click) ---------- */
  function typeStart(el) {
    el._t = el._t || [];
    var t = 400;
    [].forEach.call(el.querySelectorAll('[data-t]'), function (n) {
      var txt = n.getAttribute('data-t');
      el._t.push(setTimeout(function () { n.classList.add('typing'); }, t));
      for (var i = 1; i <= txt.length; i++) (function (i) { el._t.push(setTimeout(function () { n.textContent = txt.slice(0, i); }, t + i * 24)); })(i);
      t += txt.length * 24 + 150;
      el._t.push(setTimeout(function () { n.classList.remove('typing'); }, t));
    });
  }
  function typeStop(el) {
    (el._t || []).forEach(clearTimeout); el._t = [];
    [].forEach.call(el.querySelectorAll('[data-t]'), function (n) { n.textContent = ''; n.classList.remove('typing'); });
  }
  [].forEach.call(document.querySelectorAll('[data-hover="type"]'), function (el) {
    el.addEventListener('mouseenter', function () { typeStop(el); typeStart(el); });
    el.addEventListener('mouseleave', function () { typeStop(el); });
  });

  /* ---------- slide 1: hover a component ---------- */
  var comps = [].slice.call(document.querySelectorAll('[data-comp]')), compBox = document.querySelector('.comps');
  function closeComp(c) { c.classList.remove('open'); typeStop(c); }
  function closeAll() { comps.forEach(closeComp); compBox.classList.remove('has-open'); }
  comps.forEach(function (c) {
    c.addEventListener('mouseenter', function () { closeAll(); c.classList.add('open'); compBox.classList.add('has-open'); typeStart(c); });
    c.addEventListener('mouseleave', function () { closeComp(c); compBox.classList.remove('has-open'); });
  });

  /* ---------- cover: terminal + code rain ---------- */
  var termBody = $('termBody'), termT = [], rainRaf = 0;
  var script = [
    { t: '$ uname -a', type: true },
    { t: 'Linux earth 6.x GNU/Linux', type: false },
    { t: '$ ls /everything', type: true },
    { t: 'servers  phones  routers  supercomputers  mars', type: false },
    { t: '[  OK  ] Started the open-source revolution.', type: false, ok: true }
  ];
  function coverStop() {
    termT.forEach(clearTimeout); termT = []; termBody.textContent = ''; cancelAnimationFrame(rainRaf);
  }
  function coverStart() {
    coverStop();
    var out = '', t = 700;
    function show(extra) { termBody.innerHTML = out + (extra || '') + '<span class="cur"></span>'; }
    script.forEach(function (line) {
      var html = line.ok ? '<span class="ok">' + line.t + '</span>' : line.t;
      if (line.type) {
        for (var i = 1; i <= line.t.length; i++) (function (i) { termT.push(setTimeout(function () { show(line.t.slice(0, i)); }, t + i * 70)); })(i);
        t += line.t.length * 70 + 250;
        termT.push(setTimeout(function () { out += line.t + '\n'; show(''); }, t));
      } else {
        t += 300;
        termT.push(setTimeout(function () { out += html + '\n'; show(''); }, t));
        t += 450;
      }
    });
    termT.push(setTimeout(function () { show(''); }, 100));
    rain();
  }
  function rain() {
    var cv = $('rain'), ctx = cv.getContext('2d');
    cv.width = cv.clientWidth; cv.height = cv.clientHeight;
    var size = 16, cols = Math.floor(cv.width / size), drops = [], chars = '01{}<>/;$#LINUXTUX';
    for (var i = 0; i < cols; i++) drops[i] = Math.random() * -50;
    var last = 0;
    (function frame(now) {
      if (now - last > 55) {
        last = now;
        ctx.fillStyle = 'rgba(5,8,16,.12)'; ctx.fillRect(0, 0, cv.width, cv.height);
        ctx.font = size + 'px Consolas,monospace';
        for (var i = 0; i < cols; i++) {
          ctx.fillStyle = Math.random() > .97 ? '#ffc61a' : '#3da5ff';
          ctx.fillText(chars.charAt(Math.floor(Math.random() * chars.length)), i * size, drops[i] * size);
          if (drops[i] * size > cv.height && Math.random() > .975) drops[i] = 0;
          drops[i]++;
        }
      }
      rainRaf = requestAnimationFrame(frame);
    })(0);
  }

  /* ---------- slide 5: lines-of-code counter ---------- */
  var locNum = $('locNum'), locFill = $('locFill'), locRaf = 0;
  function locStop() { cancelAnimationFrame(locRaf); locNum.textContent = '0'; locFill.style.width = '0'; }
  function locStart() {
    locStop();
    var from = 0, to = 3300000, dur = 3500, t0 = performance.now() + 300;
    (function frame(now) {
      var p = Math.max(0, Math.min(1, (now - t0) / dur)), e = 1 - Math.pow(1 - p, 3);
      var v = Math.round(from + (to - from) * e);
      locNum.textContent = v.toLocaleString('en-US') + (p === 1 ? '+' : '');
      locFill.style.width = (e * 100) + '%';
      if (p < 1) locRaf = requestAnimationFrame(frame);
    })(performance.now());
  }

  var reportCard = document.querySelector('[data-loc]');
  reportCard.addEventListener('mouseenter', locStart);
  reportCard.addEventListener('mouseleave', locStop);

  /* ---------- slide 3: kernel diagram (built in JS, animated on hover) ---------- */
  var NS = 'http://www.w3.org/2000/svg', ksvg = $('kSvg');
  function mk(tag, attrs, parent, text) { var e = document.createElementNS(NS, tag); for (var k in attrs) e.setAttribute(k, attrs[k]); (parent || ksvg).appendChild(e); if (text) e.textContent = text; return e; }
  var SW = ['Browser', 'Terminal', 'Editor', 'Games'], HW = ['CPU', 'RAM', 'Disk', 'Mouse'], YS = [108, 188, 268, 348];
  var kPaths = [], kNodes = [], kPackets = [], kCore, kRaf = 0;
  function buildKernel() {
    var defs = mk('defs');
    var rg = mk('radialGradient', { id: 'kg' }, defs);
    mk('stop', { offset: '0', 'stop-color': '#ffc61a', 'stop-opacity': '.5' }, rg); mk('stop', { offset: '1', 'stop-color': '#0b1426' }, rg);
    [['SOFTWARE', 20], ['HARDWARE', 750]].forEach(function (p) {
      mk('rect', { x: p[1], y: 20, width: 230, height: 400, rx: 22, fill: 'rgba(61,165,255,.07)', stroke: '#3da5ff', 'stroke-opacity': .55, 'stroke-width': 1.5 });
      mk('text', { x: p[1] + 115, y: 56, 'text-anchor': 'middle', fill: '#3da5ff', 'font-size': 20, 'font-weight': 700, 'letter-spacing': 4 }, null, p[0]);
    });
    YS.forEach(function (y, i) {
      var l = mk('path', { d: 'M220,' + y + ' C320,' + y + ' 300,220 400,220', fill: 'none', stroke: '#3da5ff', 'stroke-width': 2.5, 'stroke-opacity': .7, class: 'kflow' });
      var r = mk('path', { d: 'M600,220 C700,220 680,' + y + ' 780,' + y, fill: 'none', stroke: '#3da5ff', 'stroke-width': 2.5, 'stroke-opacity': .7, class: 'kflow' });
      kPaths.push({ el: l, len: l.getTotalLength(), side: 0, i: i }, { el: r, len: r.getTotalLength(), side: 1, i: i });
    });
    [[SW, 50, 0], [HW, 780, 1]].forEach(function (g) {
      g[0].forEach(function (name, i) {
        var n = mk('g', { class: 'knode' });
        mk('rect', { x: g[1], y: YS[i] - 28, width: 170, height: 56, rx: 14, fill: 'rgba(9,15,28,.95)', stroke: '#3da5ff', 'stroke-width': 1.8 }, n);
        mk('text', { x: g[1] + 85, y: YS[i] + 7, 'text-anchor': 'middle', fill: '#eef3fb', 'font-size': 20 }, n, name);
        kNodes.push({ g: n, side: g[2], i: i });
      });
    });
    mk('circle', { cx: 500, cy: 220, r: 158, fill: 'none', stroke: '#3da5ff', 'stroke-opacity': .35, 'stroke-dasharray': '3 12', 'stroke-width': 2, class: 'kring' });
    mk('circle', { cx: 500, cy: 220, r: 132, fill: 'none', stroke: '#ffc61a', 'stroke-opacity': .45, 'stroke-dasharray': '30 18', 'stroke-width': 2, class: 'kring r2' });
    kCore = mk('g', { id: 'kCore' });
    mk('circle', { cx: 500, cy: 220, r: 104, fill: 'url(#kg)', stroke: '#ffc61a', 'stroke-width': 3 }, kCore);
    mk('text', { x: 500, y: 226, 'text-anchor': 'middle', fill: '#ffc61a', 'font-size': 38, 'font-weight': 800, 'letter-spacing': 3 }, kCore, 'KERNEL');
    mk('text', { x: 500, y: 256, 'text-anchor': 'middle', fill: '#eef3fb', 'font-size': 15 }, kCore, 'the bridge');
    mk('text', { x: 310, y: 150, 'text-anchor': 'middle', fill: '#8a9ab4', 'font-size': 15 }, null, 'commands');
    mk('text', { x: 690, y: 150, 'text-anchor': 'middle', fill: '#8a9ab4', 'font-size': 15 }, null, 'requests');
    kPaths.forEach(function (p) { p.dot = mk('circle', { r: 8, fill: '#ffc61a', opacity: 0 }); p.dot.style.filter = 'drop-shadow(0 0 8px #ffc61a)'; });
  }
  var CYC = 3.4;
  function kStart() {
    var t0 = performance.now();
    (function frame(now) {
      var t = ((now - t0) / 1000) % CYC;
      kPaths.forEach(function (p) {
        var start = (p.side ? 1.7 : 0) + p.i * 0.15, q = (t - start) / 1.0;
        if (q >= 0 && q <= 1) { var pt = p.el.getPointAtLength(q * p.len); p.dot.setAttribute('cx', pt.x); p.dot.setAttribute('cy', pt.y); p.dot.setAttribute('opacity', 1); }
        else p.dot.setAttribute('opacity', 0);
      });
      kNodes.forEach(function (n) {
        var start = (n.side ? 1.7 : 0) + n.i * 0.15;
        n.g.classList.toggle('glow', n.side ? (t >= start + .95 && t < start + 1.7) : (t >= start && t < start + .9));
      });
      var pulse = t > 1.15 && t < 1.65;
      if (pulse && !kCore.classList.contains('pulse')) kCore.classList.add('pulse');
      if (!pulse) kCore.classList.remove('pulse');
      kRaf = requestAnimationFrame(frame);
    })(t0);
  }
  function kStop() {
    cancelAnimationFrame(kRaf);
    kPaths.forEach(function (p) { p.dot.setAttribute('opacity', 0); });
    kNodes.forEach(function (n) { n.g.classList.remove('glow'); }); kCore.classList.remove('pulse');
  }
  buildKernel();
  var kcard = document.querySelector('.kcard');
  kcard.addEventListener('mouseenter', function () { kStop(); kStart(); });
  kcard.addEventListener('mouseleave', kStop);
  var ENTER = { cover: [coverStart, coverStop] };
  function runHook(slide, idx) { var k = slide.getAttribute('data-enter'); if (k && ENTER[k]) ENTER[k][idx](); }
  function resetAll() {
    closeAll(); locStop(); kStop();
    [].forEach.call(document.querySelectorAll('[data-hover="type"]'), typeStop);
  }

  /* ---------- navigation ---------- */
  function updateUI() {
    var s = slides[cur];
    counter.textContent = pad(cur + 1) + ' / ' + pad(total);
    titleEl.textContent = s.getAttribute('data-title');
    fill.style.width = ((cur + 1) / total * 100) + '%';
    $('notesTitle').textContent = pad(cur + 1) + ' — ' + s.getAttribute('data-title');
    $('notesBody').textContent = s.getAttribute('data-notes') || '';
    prevBtn.disabled = cur === 0; nextBtn.disabled = cur === total - 1;
  }
  function go(n) {
    n = Math.max(0, Math.min(total - 1, n)); if (n === cur) return;
    resetAll(); runHook(slides[cur], 1);
    slides[cur].classList.remove('active'); cur = n; slides[cur].classList.add('active');
    runHook(slides[cur], 0); updateUI();
  }
  prevBtn.addEventListener('click', function () { go(cur - 1); });
  nextBtn.addEventListener('click', function () { go(cur + 1); });
  function toggleNotes(f) { notes.classList.toggle('open', typeof f === 'boolean' ? f : !notes.classList.contains('open')); }
  notesBtn.addEventListener('click', function () { toggleNotes(); });

  function isFs() { return !!(document.fullscreenElement || document.webkitFullscreenElement); }
  function fsFail() { alert('Full screen was blocked by the browser. Press F11 instead.'); }
  function toggleFs() {
    var el = document.documentElement;
    try {
      var p = isFs() ? (document.exitFullscreen || document.webkitExitFullscreen).call(document) : (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
      if (p && p.catch) p.catch(fsFail);
    } catch (e) { fsFail(); }
  }
  function fsUpdate() { fsBtn.textContent = isFs() ? 'Exit full screen' : 'Full Screen'; }
  fsBtn.addEventListener('click', toggleFs);
  document.addEventListener('fullscreenchange', fsUpdate); document.addEventListener('webkitfullscreenchange', fsUpdate);

  document.addEventListener('keydown', function (e) {
    var t = e.target, tag = t && t.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || (t && t.isContentEditable) || e.ctrlKey || e.metaKey || e.altKey) return;
    var k = e.key;
    if (k === 'ArrowRight' || k === ' ' || k === 'PageDown') { e.preventDefault(); go(cur + 1); }
    else if (k === 'ArrowLeft' || k === 'PageUp') { e.preventDefault(); go(cur - 1); }
    else if (k === 'Home') { e.preventDefault(); go(0); }
    else if (k === 'End') { e.preventDefault(); go(total - 1); }
    else if (k === 'f' || k === 'F') toggleFs();
    else if (k === 'n' || k === 'N') toggleNotes();
    else if (k === 'Escape') toggleNotes(false);
  });
  window.addEventListener('resize', function () { if (cur === 0) coverStart(); });

  slides[0].classList.add('active'); updateUI(); fsUpdate(); runHook(slides[0], 0);
})();
