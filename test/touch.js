let fails = 0;
const check = (n, ok, d) => { REPORT((ok ? '  OK   ' : '  FALHA') + '  ' + n + (d ? '  (' + d + ')' : '')); if (!ok) fails++; };
let CLOCK = 0;
const step = () => { CLOCK += 1000 / 60; frame(CLOCK); flushTimers(CLOCK); };

// um alvo de toque falso que se comporta como o botao real
const mkPad = (role) => ({ dataset: { pad: role }, _cls: new Set(),
  classList: { add(c){this._o._cls.add(c);}, remove(c){this._o._cls.delete(c);}, contains(c){return this._o._cls.has(c);} },
  setPointerCapture(){}, closest(){ return this; } });
const pad = (role) => { const p = mkPad(role); p.classList._o = p; return p; };
const L = pad('L'), R = pad('R'), P = pad('P');
const down = (el, id) => fire('pads', 'pointerdown', { target: el, pointerId: id, pointerType: 'touch' });
const up   = (el, id) => fire('pads', 'pointerup',   { target: el, pointerId: id });

REPORT('=== pads na tela ===');
check('pads registraram pointerdown', (LISTENERS.pads && LISTENERS.pads.pointerdown || []).length > 0);
resetTimers(); newGame(); step();

down(L, 1);
check('pad ESQ segura o flipper esquerdo', FLIPPERS[0].held === true && FLIPPERS[1].held === false);
check('pad marca estado visual', L.classList.contains('down') === true);
down(R, 2);
check('os dois pads juntos', FLIPPERS[0].held && FLIPPERS[1].held);
up(L, 1);
check('soltar um pad nao solta o outro', !FLIPPERS[0].held && FLIPPERS[1].held);
check('estado visual limpo', !L.classList.contains('down') && R.classList.contains('down'));
up(R, 2);
check('ambos soltos', !FLIPPERS[0].held && !FLIPPERS[1].held);

REPORT('');
REPORT('=== pad de lancamento ===');
resetTimers(); newGame();
for (let i = 0; i < 10; i++) step();
down(P, 5);
check('segurar carrega o embolo', G.charging === true);
for (let i = 0; i < 40; i++) step();
up(P, 5);
check('soltar lanca', ball.vy < -1000, 'vy=' + Math.round(ball.vy));

REPORT('');
REPORT('=== tocar a mesa continua funcionando ===');
resetTimers(); newGame(); step();
const at = (tx, ty) => ({ clientX: (projX(tx, ty) + VIEW_OX) * VIEW_SCALE, clientY: (projY(ty) + VIEW_OY) * VIEW_SCALE });
const p1 = at(130, 600);
fire('canvas', 'pointerdown', { pointerId: 9, pointerType: 'touch', clientX: p1.clientX, clientY: p1.clientY });
check('metade esquerda da mesa ainda aciona', FLIPPERS[0].held === true);
fire('win', 'pointerup', { pointerId: 9 });
check('e solta', FLIPPERS[0].held === false);

REPORT('');
REPORT('=== teto de bolas ===');
check('constante de bolas extras existe', typeof MAX_EXTRA_BALLS === 'number', 'max=' + MAX_EXTRA_BALLS);
resetTimers(); newGame();
for (let r = 0; r < 8; r++) {
  G.mode = 'play'; HYPER.hold = 0; ball.captured = 0;
  enterHyperspace();
  for (let i = 0; i < 130; i++) step();
}
check('nunca passa de 3 + ' + MAX_EXTRA_BALLS + ' bolas', G.ballsTotal === 3 + MAX_EXTRA_BALLS,
      G.ballsTotal + ' bolas apos 8 hyperspaces');

REPORT('');
REPORT(fails === 0 ? '>>> CONTROLES DE TOQUE OK' : '>>> ' + fails + ' FALHA(S)');
