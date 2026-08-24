let CLOCK=0; const step=()=>{CLOCK+=1000/60; frame(CLOCK); flushTimers(CLOCK);};
let fails=0; const check=(n,ok,d)=>{REPORT((ok?'  OK   ':'  FALHA')+'  '+n+(d?'  ('+d+')':'')); if(!ok)fails++;};
const d2=(px,py,ax,ay,bx,by)=>{const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;let t=L2?((px-ax)*dx+(py-ay)*dy)/L2:0;t=t<0?0:t>1?1:t;return Math.hypot(px-(ax+dx*t),py-(ay+dy*t));};
for (const [sx,sy,idx,lado] of [[70,520,0,'esquerdo'],[290,520,1,'direito']]) {
  resetTimers(); newGame(); G.mode='play';
  ball.x=sx; ball.y=sy; ball.vx=0; ball.vy=60; ball.trail.length=0;
  for(let i=0;i<600;i++){ FLIPPERS[idx].held = ball.y>600; step(); if(G.mode!=='play') break; }
  const f=FLIPPERS[idx];
  const tx=f.px+Math.cos(f.a)*f.len, ty=f.py+Math.sin(f.a)*f.len;
  check('flipper '+lado+' ainda berça a bola', G.mode==='play',
    G.mode==='play' ? 'parada em '+Math.round(ball.x)+','+Math.round(ball.y)+' a '+Math.round(d2(ball.x,ball.y,f.px,f.py,tx,ty))+'px do eixo' : 'drenou');
}
REPORT(fails===0?'>>> BERCO OK':'>>> '+fails+' FALHA(S)');
