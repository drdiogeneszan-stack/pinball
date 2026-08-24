let CLOCK = 0;
const step = () => { CLOCK += 1000 / 60; frame(CLOCK); flushTimers(CLOCK); };

// envolve cada resolvedor de colisao para registrar quem tira energia de quem
const log = [];
const wrap = (nome, fn) => function (...a) {
  const v0 = Math.hypot(ball.vx, ball.vy);
  const r = fn.apply(this, a);
  const v1 = Math.hypot(ball.vx, ball.vy);
  if (Math.abs(v1 - v0) > 1) log.push({ nome, y: Math.round(ball.y), x: Math.round(ball.x), v0, v1, args: a });
  return r;
};
segCollide = wrap('parede', segCollide);
circCollide = wrap('poste/bumper', circCollide);
polyCollide = wrap('SLINGSHOT', polyCollide);
flipperCollide = wrap('flipper', flipperCollide);

REPORT('=== quem tira a velocidade da bola caindo em x=130 ===');
resetTimers(); newGame(); G.mode = 'play';
ball.x = 130; ball.y = 500; ball.vx = 0; ball.vy = 0; ball.trail.length = 0;
log.length = 0;
for (let i = 0; i < 150; i++) { step(); if (ball.y > 700 || G.mode !== 'play') break; }

const agg = {};
log.forEach(e => {
  const k = e.nome + (e.nome === 'parede' ? ' [' + e.args.slice(1, 5).map(Math.round).join(',') + ']' : '');
  agg[k] = agg[k] || { n: 0, perdeu: 0, ganhou: 0 };
  agg[k].n++;
  if (e.v1 < e.v0) agg[k].perdeu += e.v0 - e.v1; else agg[k].ganhou += e.v1 - e.v0;
});
REPORT('  objeto                              toques   perdeu   ganhou');
Object.entries(agg).sort((a, b) => b[1].perdeu - a[1].perdeu).forEach(([k, v]) => {
  REPORT('  ' + (k + '                                    ').slice(0, 36) +
    String(v.n).padStart(6) + String(Math.round(v.perdeu)).padStart(9) + String(Math.round(v.ganhou)).padStart(9));
});

REPORT('');
REPORT('  primeiros 14 eventos, em ordem:');
log.slice(0, 14).forEach(e => REPORT('    y=' + String(e.y).padStart(3) + ' x=' + String(e.x).padStart(3) +
  '  ' + (e.nome + '        ').slice(0, 13) + String(Math.round(e.v0)).padStart(5) + ' -> ' +
  String(Math.round(e.v1)).padStart(5) + (e.v1 < e.v0 ? '   (-' + Math.round(e.v0 - e.v1) + ')' : '   (+' + Math.round(e.v1 - e.v0) + ')')));
