let CLOCK = 0;
const step = () => { CLOCK += 1000 / 60; frame(CLOCK); flushTimers(CLOCK); };
const d2seg = (px,py,ax,ay,bx,by)=>{const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;let t=L2?((px-ax)*dx+(py-ay)*dy)/L2:0;t=t<0?0:t>1?1:t;return Math.hypot(px-(ax+dx*t),py-(ay+dy*t));};
function flipDist(i){const f=FLIPPERS[i];const tx=f.px+Math.cos(f.a)*f.len,ty=f.py+Math.sin(f.a)*f.len;
  return d2seg(ball.x,ball.y,f.px,f.py,tx,ty);}
function nearestWall(){let best=1e9,w=null;
  for(const W of WALLS){const d=d2seg(ball.x,ball.y,W[0],W[1],W[2],W[3]); if(d<best){best=d;w=W;}}
  return {d:best,w};}

REPORT('=== queda livre sobre o flipper esquerdo, sem acionar ===');
REPORT('   y     |v|    dv     dist flipper   parede mais perto');
resetTimers(); newGame(); G.mode='play';
ball.x=132; ball.y=430; ball.vx=0; ball.vy=0; ball.trail.length=0;
let prev=0;
for(let i=0;i<120;i++){
  step();
  const v=Math.hypot(ball.vx,ball.vy);
  if(i%4===0 && ball.y>470){
    const nw=nearestWall();
    REPORT('  '+String(Math.round(ball.y)).padStart(4)+String(Math.round(v)).padStart(7)+
      (prev?String(Math.round(v-prev)).padStart(7):'      -')+
      String(Math.round(flipDist(0))).padStart(15)+
      '        '+Math.round(nw.d)+'px  ['+nw.w.join(',')+']');
  }
  prev=v;
  if(ball.y>700||G.mode!=='play') break;
}

REPORT('');
REPORT('=== queda em varios pontos: onde a bola perde velocidade? ===');
REPORT('   x    v ao passar y=560   v ao passar y=640   perda   causa provavel');
for(const sx of [110,125,140,155,170,185,200,215,230,245,260]){
  resetTimers(); newGame(); G.mode='play';
  ball.x=sx; ball.y=420; ball.vx=0; ball.vy=0; ball.trail.length=0;
  let v560=null,v640=null,tocou=null;
  for(let i=0;i<200;i++){
    const yb=ball.y; step(); const v=Math.hypot(ball.vx,ball.vy);
    if(v560===null && yb<560 && ball.y>=560) v560=v;
    if(v640===null && yb<640 && ball.y>=640) v640=v;
    if(tocou===null && (flipDist(0)<17||flipDist(1)<17)) tocou=Math.round(ball.y);
    if(ball.y>700||G.mode!=='play') break;
  }
  const perda = (v560&&v640)? Math.round((1-v640/v560)*100) : null;
  REPORT('  '+String(sx).padStart(4)+String(v560?Math.round(v560):'-').padStart(18)+
    String(v640?Math.round(v640):'-').padStart(20)+
    (perda!==null?(perda+'%').padStart(8):'       -')+
    '   '+(tocou?('encostou no flipper em y='+tocou):'sem contato'));
}
