let CLOCK = 0;
const step = () => { CLOCK += 1000 / 60; frame(CLOCK); flushTimers(CLOCK); };

let kicks = 0, hits = 0;
kick = ((orig) => function (...a) { kicks++; return orig.apply(this, a); })(kick);
hitSling = ((orig) => function (...a) { hits++; return orig.apply(this, a); })(hitSling);

REPORT('=== a bola cai na face do slingshot esquerdo ===');
REPORT('   x   v antes   v depois   chutes   hitSling   aresta atingida');
for (const sx of [100, 115, 130, 145]) {
  resetTimers(); newGame(); G.mode = 'play';
  ball.x = sx; ball.y = 500; ball.vx = 0; ball.vy = 0; ball.trail.length = 0;
  kicks = 0; hits = 0;
  let vAntes = 0, vDepois = 0, aresta = '-';
  for (let i = 0; i < 90; i++) {
    const v0 = Math.hypot(ball.vx, ball.vy);
    const k0 = kicks;
    // qual aresta o polygono acusa neste frame
    const probe = { x: ball.x, y: ball.y, vx: ball.vx, vy: ball.vy, r: ball.r };
    const h = polyCollide(probe, SLINGS[0].poly, 0.36, 0.3);
    step();
    if (h && aresta === '-') aresta = 'edge ' + h.edge + (h.edge === SLINGS[0].faceEdge ? ' (FACE)' : ' (nao e a face)');
    if (kicks > k0 && !vAntes) { vAntes = v0; vDepois = Math.hypot(ball.vx, ball.vy); }
    if (ball.y > 700 || G.mode !== 'play') break;
  }
  REPORT('  ' + String(sx).padStart(4) + String(Math.round(vAntes)).padStart(9) +
    String(Math.round(vDepois)).padStart(11) + String(kicks).padStart(9) +
    String(hits).padStart(11) + '   ' + aresta);
}

REPORT('');
REPORT('=== e quando ela chega de lado, raspando? ===');
for (const [sx, sy, vx, vy] of [[70, 520, 260, 300], [130, 480, -120, 500], [175, 500, -300, 260]]) {
  resetTimers(); newGame(); G.mode = 'play';
  ball.x = sx; ball.y = sy; ball.vx = vx; ball.vy = vy; ball.trail.length = 0;
  kicks = 0; hits = 0;
  const v0 = Math.hypot(vx, vy);
  let vmin = 1e9;
  for (let i = 0; i < 90; i++) { step(); vmin = Math.min(vmin, Math.hypot(ball.vx, ball.vy)); if (ball.y > 700) break; }
  REPORT('  de (' + sx + ',' + sy + ') a ' + Math.round(v0) + ' px/s  ->  chutes=' + kicks +
    '  hitSling=' + hits + '  menor velocidade vista=' + Math.round(vmin));
}
