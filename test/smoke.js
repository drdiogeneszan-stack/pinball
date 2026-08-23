let fails = 0;
const check = (n, ok, d) => { REPORT((ok ? '  OK   ' : '  FALHA') + '  ' + n + (d ? '  (' + d + ')' : '')); if (!ok) fails++; };
let CLOCK = 0;
const step = () => { CLOCK += 1000 / 60; frame(CLOCK); flushTimers(CLOCK); };

REPORT('=== o jogo carrega ===');
check('deck assado', deck !== null, deck ? deck.width + 'x' + deck.height : '-');
check('logo IMCELER embutido', logoImg !== null);
check('paleta da marca', BR.navy === '#232752' && BR.cyan === '#57C2E0');

REPORT('');
REPORT('=== fisica ===');
let err = null;
try {
  resetTimers(); newGame(); ball.vy = -(LAUNCH_MIN + LAUNCH_RANGE * 0.6);
  for (let i = 0; i < 40 * 60; i++) { step(); if (G.mode === 'over') break; }
} catch (e) { err = e.stack; }
check('40s sem excecao', err === null, err || '');

let dr = 0;
for (let k = 0; k < 40; k++) {
  resetTimers(); newGame();
  ball.vy = -(LAUNCH_MIN + LAUNCH_RANGE * ((k % 20) / 19)); ball.vx = 0;
  for (let i = 0; i < 90 * 60; i++) { step(); if (G.mode !== 'play') { dr++; break; } }
}
check('40/40 bolas drenam', dr === 40, dr + '/40');

resetTimers(); newGame();
const seen = []; ball.vy = -(LAUNCH_MIN + LAUNCH_RANGE * 0.7);
for (let i = 0; i < 200 * 60; i++) {
  if (G.mode === 'play' && ball.x > 348 && ball.y > 640 && Math.hypot(ball.vx, ball.vy) < 8) {
    ball.vy = -(LAUNCH_MIN + LAUNCH_RANGE * 0.7); ball.vx = 0;
  }
  step(); if (!seen.includes(G.ball)) seen.push(G.ball);
  if (G.mode === 'over') break;
}
// a escada do hyperspace pode conceder bolas extras, entao o total e >= 3
const consecutivas = seen.every((b, i) => b === i + 1);
check('partida completa ate FIM DE JOGO', consecutivas && seen.length >= 3 && G.mode === 'over',
      'bolas=' + seen.join(',') + '  total=' + G.ballsTotal);

REPORT('');
REPORT(fails === 0 ? '>>> TUDO OK' : '>>> ' + fails + ' FALHA(S)');
