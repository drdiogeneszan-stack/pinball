let CLOCK=0; const step=()=>{CLOCK+=1000/60; frame(CLOCK); flushTimers(CLOCK);};
function drop(sx, vy, held) {
  resetTimers(); newGame(); G.mode='play';
  ball.x=sx; ball.y=480; ball.vx=(sx%7-3)*20; ball.vy=vy; ball.trail.length=0;
  let naZona=0, lento=0;
  for(let i=0;i<10*60;i++){
    FLIPPERS[0].held=held; FLIPPERS[1].held=false;
    step();
    if(ball.y>615){ naZona++; if(Math.hypot(ball.vx,ball.vy)<80) lento++; }
    if(ball.y>740||G.mode!=='play') break;
  }
  return {naZona:naZona/60, lento:lento/60};
}
let somaLento=0, somaZona=0, pior=0, n=0, travadas=0;
for(const sx of [136,142,148,154,160,166,172,178,184,190,196,202,208,214,220,226]){
  for(const vy of [260, 500, 820]){
    const r = drop(sx, vy, false);
    somaLento+=r.lento; somaZona+=r.naZona; pior=Math.max(pior,r.lento); n++;
    if(r.lento>0.6) travadas++;
  }
}
REPORT('  amostras: '+n);
REPORT('  media quase parada: '+(somaLento/n).toFixed(3)+'s');
REPORT('  media na zona:      '+(somaZona/n).toFixed(3)+'s');
REPORT('  pior caso:          '+pior.toFixed(3)+'s');
REPORT('  quedas com >0.6s travada: '+travadas+'/'+n);
