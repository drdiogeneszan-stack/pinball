let CLOCK=0; const step=()=>{CLOCK+=1000/60; frame(CLOCK); flushTimers(CLOCK);};
const f=FLIPPERS[0];
const tip=()=>[f.px+Math.cos(f.a)*f.len, f.py+Math.sin(f.a)*f.len];

function run(sx, sy, vy, held, secs) {
  resetTimers(); newGame(); G.mode='play';
  ball.x=sx; ball.y=sy; ball.vx=0; ball.vy=vy; ball.trail.length=0;
  let vmin=1e9, parou=0;
  for(let i=0;i<secs*60;i++){
    FLIPPERS[0].held = held; FLIPPERS[1].held = false;
    step();
    const v=Math.hypot(ball.vx,ball.vy);
    if(ball.y>620) vmin=Math.min(vmin,v);
    if(v<25) parou++; else parou=0;
    if(ball.y>740||G.mode!=='play') return {caiu:true, t:i/60, vmin};
  }
  return {caiu:false, x:ball.x, y:ball.y, v:Math.hypot(ball.vx,ball.vy), vmin, parou:parou/60};
}

REPORT('=== flipper LEVANTADO: a bola chega e para? ===');
REPORT('  x    vy inicial   resultado');
for (const sx of [120,135,150,160,170,180]) {
  for (const vy of [300, 700]) {
    const r = run(sx, 560, vy, true, 8);
    const [tx,ty] = tip();
    REPORT('  '+String(sx).padStart(3)+String(vy).padStart(12)+'   '+
      (r.caiu ? 'caiu em '+r.t.toFixed(1)+'s'
              : 'PAROU em '+Math.round(r.x)+','+Math.round(r.y)+' a '+Math.round(r.v)+
                ' px/s  (ponta do flipper em '+Math.round(tx)+','+Math.round(ty)+
                ', dist '+Math.round(Math.hypot(r.x-tx,r.y-ty))+'px)'));
  }
}

REPORT('');
REPORT('=== flipper em repouso, bola vindo rapido de cima ===');
REPORT('  x    resultado');
for (const sx of [150,158,165,172,180,190]) {
  const r = run(sx, 480, 500, false, 8);
  REPORT('  '+String(sx).padStart(3)+'   '+(r.caiu?'caiu em '+r.t.toFixed(1)+'s  (menor v perto do flipper: '+Math.round(r.vmin)+')'
    : 'PAROU em '+Math.round(r.x)+','+Math.round(r.y)+' a '+Math.round(r.v)+' px/s, parada ha '+r.parou.toFixed(1)+'s'));
}
