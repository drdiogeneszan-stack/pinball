let CLOCK=0; const step=()=>{CLOCK+=1000/60; frame(CLOCK); flushTimers(CLOCK);};
const f = FLIPPERS[0];
const tipX = () => f.px + Math.cos(f.a) * f.len, tipY = () => f.py + Math.sin(f.a) * f.len;

REPORT('=== onde a bola para no flipper esquerdo (repouso, sem acionar) ===');
REPORT('  solta em x   parou em      dist da ponta   |v|    normal do contato   componente da gravidade');
for (const sx of [115, 125, 135, 145, 155, 162, 168]) {
  resetTimers(); newGame(); G.mode = 'play';
  ball.x = sx; ball.y = 600; ball.vx = 0; ball.vy = 0; ball.trail.length = 0;
  for (let i = 0; i < 420; i++) { step(); if (ball.y > 740 || G.mode !== 'play') break; }
  const caiu = (G.mode !== 'play' || ball.y > 720);
  const tx = tipX(), ty = tipY();
  const dTip = Math.hypot(ball.x - tx, ball.y - ty);
  // normal do contato com a capsula do flipper, no ponto onde parou
  const dx = tx - f.px, dy = ty - f.py, L2 = dx*dx + dy*dy;
  let t = ((ball.x - f.px) * dx + (ball.y - f.py) * dy) / L2; t = t < 0 ? 0 : t > 1 ? 1 : t;
  const qx = f.px + dx*t, qy = f.py + dy*t;
  let nx = ball.x - qx, ny = ball.y - qy; const d = Math.hypot(nx, ny) || 1; nx/=d; ny/=d;
  // quanto da gravidade sobra na tangente: se ~0, a bola esta em equilibrio
  const tanG = Math.abs(1 * nx);   // g=(0,1); componente tangencial = |g x n| = |nx|
  REPORT('  ' + String(sx).padStart(10) +
    (caiu ? '   CAIU          ' : ('   ' + Math.round(ball.x) + ',' + Math.round(ball.y) + '        ').slice(0, 17)) +
    (caiu ? '' :
      String(Math.round(dTip)).padStart(9) + String(Math.round(Math.hypot(ball.vx, ball.vy))).padStart(7) +
      '   (' + nx.toFixed(2) + ',' + ny.toFixed(2) + ')' +
      '        ' + tanG.toFixed(3) + (tanG < 0.08 ? '   <<< EQUILIBRIO' : '')));
}

REPORT('');
REPORT('=== a bola sai da ponta se chegar rolando? ===');
for (const vx0 of [0, 30, 60, 120]) {
  resetTimers(); newGame(); G.mode = 'play';
  ball.x = 140; ball.y = 655; ball.vx = vx0; ball.vy = 0; ball.trail.length = 0;
  let caiu = false, t = 0;
  for (let i = 0; i < 480; i++) { step(); t = i; if (ball.y > 730 || G.mode !== 'play') { caiu = true; break; } }
  REPORT('  chegando a ' + String(vx0).padStart(3) + ' px/s  ->  ' +
    (caiu ? 'caiu em ' + (t/60).toFixed(1) + 's' : 'PAROU em ' + Math.round(ball.x) + ',' + Math.round(ball.y) +
      '  (ponta em ' + Math.round(tipX()) + ',' + Math.round(tipY()) + ')'));
}
