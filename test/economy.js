let CLOCK = 0;
const step = () => { CLOCK += 1000 / 60; frame(CLOCK); flushTimers(CLOCK); };
const dist = (px,py,ax,ay,bx,by)=>{const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;let t=L2?((px-ax)*dx+(py-ay)*dy)/L2:0;t=t<0?0:t>1?1:t;return Math.hypot(px-(ax+dx*t),py-(ay+dy*t));};
function bot(){ for(let i=0;i<2;i++){ const f=FLIPPERS[i];
  const tx=f.px+Math.cos(f.a)*f.len, ty=f.py+Math.sin(f.a)*f.len;
  f.held = ball.vy>0 && dist(ball.x,ball.y,f.px,f.py,tx,ty)<20 && ((i===0&&ball.x<184)||(i===1&&ball.x>176)); } }

REPORT('=== quantas bolas uma partida dura de verdade? ===');
REPORT('  partida   bolas   hyperspace   bolas extras   duracao   pontos');
let infinitas = 0, totalBolas = 0;
for (let g = 0; g < 12; g++) {
  resetTimers(); newGame();
  let hyper = 0, frames = 0, acabou = false;
  const hyper0 = enterHyperspace;
  for (let i = 0; i < 600 * 60; i++) {           // teto de 10 minutos
    bot();
    if (G.mode === 'play' && ball.x > 348 && ball.y > 640 && Math.hypot(ball.vx, ball.vy) < 8) {
      ball.vy = -(LAUNCH_MIN + LAUNCH_RANGE * (0.3 + (g % 7) * 0.1)); ball.vx = 0;
    }
    const antes = G.hyperStep;
    step(); frames++;
    if (G.hyperStep !== antes) hyper++;
    if (G.mode === 'over') { acabou = true; break; }
  }
  if (!acabou) infinitas++;
  totalBolas += G.ballsTotal;
  REPORT('  ' + String(g + 1).padStart(5) + String(G.ballsTotal).padStart(9) +
         String(hyper).padStart(12) + String(G.ballsTotal - 3).padStart(14) +
         (Math.round(frames / 60) + 's').padStart(10) + String(G.score).padStart(10) +
         (acabou ? '' : '   <<< NAO ACABOU'));
}
REPORT('');
REPORT('  partidas que nao terminaram em 10 min: ' + infinitas + '/12');
REPORT('  media de bolas por partida: ' + (totalBolas / 12).toFixed(1) + '  (o projeto pede 3)');
