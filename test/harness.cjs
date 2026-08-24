/* Headless harness for IMCELER Pinball.
 *
 * Stubs just enough DOM to run the real game loop under Node, so the physics
 * and the whole draw path can be exercised without a browser. The canvas
 * context is a Proxy that answers every unknown method with a no-op, which is
 * enough for drawing code — but a genuinely undefined variable still throws,
 * so the render path is really being checked, not just skipped.
 *
 *   node test/harness.cjs test/<file>.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const GAME = path.join(ROOT, 'space-cadet.html');

// ---- canvas -------------------------------------------------------------
const stubCtx = new Proxy({}, {
  get(t, k) {
    if (k === 'createLinearGradient' || k === 'createRadialGradient')
      return () => ({ addColorStop() {} });
    if (k === 'measureText') return (s) => ({ width: String(s).length * 6 });
    if (k === 'toDataURL') return () => 'data:image/png;base64,AAAA';
    if (k === 'canvas') return { width: 480, height: 900 };
    if (k in t) return t[k];
    return () => {};
  },
  set(t, k, v) { t[k] = v; return true; },
});

const LISTENERS = { canvas: {}, win: {}, doc: {} };
const rec = (bag) => (type, fn) => { (bag[type] = bag[type] || []).push(fn); };

const THE_CANVAS = {
  width: 480, height: 900,
  getContext: () => stubCtx,
  toDataURL: () => 'data:image/png;base64,AAAA',
  addEventListener: rec(LISTENERS.canvas),
  // BOX simula a caixa CSS real do elemento, que no iOS pode divergir da janela
  getBoundingClientRect: () => ({ left: 0, top: 0,
    width: globalThis.BOX ? globalThis.BOX.w : globalThis.innerWidth,
    height: globalThis.BOX ? globalThis.BOX.h : globalThis.innerHeight }),
  style: {},
};

function mkCanvas() {
  return {
    width: 400, height: 760,
    getContext: () => stubCtx,
    toDataURL: () => 'data:image/png;base64,AAAA',
    addEventListener() {},
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 400, height: 760 }),
    style: {},
  };
}

const ELS = {};
const HEAD = [];
function mkEl(id) {
  return {
    _id: id, textContent: '', innerHTML: '', hidden: id === 'sheet',
    offsetLeft: 0, firstChild: null, style: {}, dataset: {},
    classList: {
      _s: new Set(),
      add(c) { this._s.add(c); }, remove(c) { this._s.delete(c); },
      toggle(c, v) { if (v === undefined) v = !this._s.has(c); v ? this._s.add(c) : this._s.delete(c); },
      contains(c) { return this._s.has(c); },
    },
    addEventListener: rec(LISTENERS[id] = LISTENERS[id] || {}),
    appendChild() {}, setAttribute() {}, focus() {}, click() {},
    value: '', querySelector: () => mkEl(), querySelectorAll: () => [], closest: () => null,
  };
}

const document = {
  head: { appendChild: (el) => HEAD.push(el) },
  documentElement: { requestFullscreen() {} },
  querySelector: () => null,
  querySelectorAll: () => [],
  addEventListener: rec(LISTENERS.doc),
  createElement: (t) => (t === 'canvas' ? mkCanvas() : mkEl()),
  getElementById: (id) => (id === 'table' ? THE_CANVAS : (ELS[id] = ELS[id] || mkEl(id))),
};

// ---- timers driven by the simulation clock ------------------------------
// The game uses setTimeout for the hyperspace eject, the target-bank reset and
// the drain -> next-ball hand-off. A no-op stub would simulate a different game.
let timerQ = [], timerNow = 0, timerId = 1;
const setTimeoutStub = (fn, ms) => { timerQ.push({ id: timerId++, t: timerNow + (ms || 0), fn }); return timerId; };
function flushTimers(now) {
  timerNow = now;
  timerQ.sort((a, b) => a.t - b.t || a.id - b.id);
  while (timerQ.length && timerQ[0].t <= now) timerQ.shift().fn();
}
const resetTimers = () => { timerQ.length = 0; };

// ---- image loads synchronously so boot() completes during the call -------
function ImageStub() {
  this.width = 1356; this.height = 567; this.onload = null; this.onerror = null;
  Object.defineProperty(this, 'src', {
    set(v) { this._src = v; if (this.onload) this.onload(); },
    get() { return this._src; },
  });
}

let COARSE = false;
function fire(where, type, ev) {
  const hs = LISTENERS[where][type] || [];
  ev.preventDefault = ev.preventDefault || (() => {});
  hs.forEach(h => h(ev));
  return hs.length;
}

// real in-memory localStorage so persistence can actually be tested
const LSDATA = {};
const LS = {
  getItem: (k) => (k in LSDATA ? LSDATA[k] : null),
  setItem: (k, v) => { LSDATA[k] = String(v); },
  removeItem: (k) => { delete LSDATA[k]; },
  clear: () => { for (const k in LSDATA) delete LSDATA[k]; },
};

globalThis.ResizeObserver = undefined;
globalThis.BOX = null;
globalThis.innerWidth = 480;
globalThis.innerHeight = 900;

// ---- run ----------------------------------------------------------------
const html = fs.readFileSync(GAME, 'utf8');
const src = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));
const testFile = process.argv[2];
const test = testFile ? fs.readFileSync(testFile, 'utf8') : '';

const out = [];
const REPORT = (s) => out.push(String(s));

const fn = new Function(
  'document', 'window', 'localStorage', 'requestAnimationFrame', 'addEventListener',
  'setInterval', 'setTimeout', 'clearTimeout', 'console', 'REPORT',
  'flushTimers', 'resetTimers', 'Image', 'matchMedia', 'LISTENERS', 'fire', 'ELS', 'HEAD',
  'location', 'setCoarse', 'LS',
  src + '\n;(function(){' + test + '})();'
);

try {
  fn(document,
    { devicePixelRatio: 1, AudioContext: undefined, webkitAudioContext: undefined },
    LS,
    () => {}, rec(LISTENERS.win), () => 0, setTimeoutStub, () => {},
    { log: (s) => out.push(String(s)) },
    REPORT, flushTimers, resetTimers, ImageStub,
    (q) => ({ matches: /coarse/.test(q) ? COARSE : false }),
    LISTENERS, fire, ELS, HEAD,
    { href: 'https://example.com/pinball/' },
    (v) => { COARSE = v; }, LS);
} catch (e) {
  process.stdout.write(out.join('\n') + '\n');
  console.error('\nEXCECAO:', e && e.stack ? e.stack : e);
  process.exit(1);
}
process.stdout.write(out.join('\n') + '\n');
