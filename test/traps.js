let fails=0; const check=(n,ok,d)=>{REPORT((ok?'  OK   ':'  FALHA')+'  '+n+(d?'  ('+d+')':'')); if(!ok)fails++;};
let CLOCK=0; const step=()=>{CLOCK+=1000/60; frame(CLOCK); flushTimers(CLOCK);};
const d2=(px,py,ax,ay,bx,by)=>{const dx=bx-ax,dy=by-ay,L2=dx*dx+dy*dy;let t=L2?((px-ax)*dx+(py-ay)*dy)/L2:0;t=t<0?0:t>1?1:t;return Math.hypot(px-(ax+dx*t),py-(ay+dy*t));};
const FIELD=[[36,80],[100,46],[300,46],[346,120],[346,470],[304,566],[304,620],[244,648],[116,648],[56,620],[56,566],[16,470],[16,140]];
const inField=(x,y)=>{let o=false;for(let i=0,j=FIELD.length-1;i<FIELD.length;j=i++){const xi=FIELD[i][0],yi=FIELD[i][1],xj=FIELD[j][0],yj=FIELD[j][1];
  if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)o=!o;} return o;};
const onFlip=(x,y)=>FLIPPERS.some(f=>{const tx=f.px+Math.cos(f.a)*f.len,ty=f.py+Math.sin(f.a)*f.len;return d2(x,y,f.px,f.py,tx,ty)<=BALL_R+f.r+3;});
let seed=20260823; const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff;};

REPORT('=== varredura da mesa apos a mudanca de atrito ===');
const c={}; const traps=[]; let n=0;
for(let gx=30;gx<=370;gx+=25) for(let gy=60;gy<=640;gy+=45){
  if(!inField(gx,gy)) continue;
  for(let v=0;v<2;v++){
    resetTimers(); newGame(); G.mode='play';
    ball.x=gx; ball.y=gy; ball.vx=(rnd()-0.5)*800; ball.vy=(rnd()-0.5)*600; ball.trail.length=0;
    const hist=[]; let st;
    for(let i=0;i<25*60;i++){ step(); hist.push([ball.x,ball.y]); if(G.mode!=='play') break; }
    n++;
    if(G.mode!=='play') st='drenou';
    else { let span=0; for(let q=Math.max(0,hist.length-180);q<hist.length;q++) span=Math.max(span,Math.hypot(hist[q][0]-ball.x,hist[q][1]-ball.y));
      st = span>40?'viva' : onFlip(ball.x,ball.y)?'berco' : (ball.x>348&&ball.y>620)?'calha':'ARMADILHA';
      if(st==='ARMADILHA') traps.push(gx+','+gy+' -> @'+Math.round(ball.x)+','+Math.round(ball.y)); }
    c[st]=(c[st]||0)+1;
    if(ball.x<-20||ball.x>420||ball.y<-20||ball.y>880) traps.push('FORA '+gx+','+gy);
  }
}
REPORT('  '+n+' quedas: '+Object.entries(c).map(([k,v])=>k+'='+v).join('  '));
traps.slice(0,10).forEach(t=>REPORT('     '+t));
check('nenhuma armadilha nova', traps.length===0, traps.length+' encontradas');

REPORT('');
REPORT('=== a bola ainda sempre drena ===');
let dr=0;
for(let k=0;k<40;k++){
  resetTimers(); newGame();
  ball.vy=-(LAUNCH_MIN+LAUNCH_RANGE*((k%20)/19)); ball.vx=0;
  for(let i=0;i<120*60;i++){ step(); if(G.mode!=='play'){dr++;break;} }
}
check('40/40 bolas drenam', dr===40, dr+'/40');
REPORT('');
REPORT(fails===0?'>>> FISICA SA':'>>> '+fails+' FALHA(S)');
