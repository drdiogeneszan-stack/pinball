let fails=0; const check=(n,ok,d)=>{REPORT((ok?'  OK   ':'  FALHA')+'  '+n+(d?'  ('+d+')':'')); if(!ok)fails++;};
let CLOCK=0; const step=()=>{CLOCK+=1000/60; frame(CLOCK); flushTimers(CLOCK);};
const el=(id)=>document.getElementById(id);

REPORT('=== partida completa de verdade, ate o fim ===');
LS.clear(); resetTimers(); newGame();
let vistas=[];
ball.vy=-(LAUNCH_MIN+LAUNCH_RANGE*0.7);
for(let i=0;i<300*60;i++){
  if(G.mode==='play'&&ball.x>348&&ball.y>640&&Math.hypot(ball.vx,ball.vy)<8){ball.vy=-(LAUNCH_MIN+LAUNCH_RANGE*0.7);ball.vx=0;}
  step(); if(!vistas.includes(G.ball)) vistas.push(G.ball);
  if(G.mode==='over') break;
}
check('a partida terminou', G.mode==='over', 'bolas '+vistas.join(','));
const pontos = G.score;
for(let i=0;i<200;i++) step();          // deixa o timer de 1.9s abrir o painel
check('o painel de ranking abriu sozinho', el('board').hidden===false);
check('pedindo o nome', el('nameForm').hidden===false);
el('nameInput').value='ZAN';
fire('nameForm','submit',{});
check('gravou', loadScores().length===1 && loadScores()[0].score===pontos,
      JSON.stringify(loadScores().map(r=>r.name+':'+r.score)));
check('sobrevive a uma releitura', JSON.parse(LS.getItem('imcelerPinballScores')).length===1);

REPORT('');
REPORT('=== e quando o armazenamento nao funciona? ===');
const real = { get: LS.getItem, set: LS.setItem };
LS.setItem = () => { throw new Error('QuotaExceededError'); };
LS.getItem = () => { throw new Error('SecurityError'); };
let quebrou=false;
try {
  el('nameInput').value='BOB';
  G.score = 5000;
  fire('nameForm','submit',{});
} catch(e) { quebrou=true; }
check('o jogo nao quebra', !quebrou);
check('mas AVISA que nao deu para salvar',
      /n[aã]o|falh|indispon/i.test(el('boardSub').textContent),
      'mensagem exibida: "'+el('boardSub').textContent+'"');
LS.getItem = real.get; LS.setItem = real.set;

REPORT('');
REPORT(fails===0?'>>> ARMAZENAMENTO OK':'>>> '+fails+' FALHA(S)');

REPORT('');
REPORT('=== tocar a tela logo apos o fim de jogo nao pode engolir a pontuacao ===');
LS.clear(); resetTimers(); newGame();
G.score = 77000; G.ball = G.ballsTotal; G.mode = 'play';
drain();
for (let i=0;i<600;i++) step();
check('fim de jogo', G.mode==='over');
check('o painel ja esta aberto no mesmo instante', el('board').hidden===false);
check('pedindo o nome', el('nameForm').hidden===false);
// agora simula o toque impaciente
const at=(tx,ty)=>({clientX:(projX(tx,ty)+VIEW_OX)*VIEW_SCALE, clientY:(projY(ty)+VIEW_OY)*VIEW_SCALE});
const p=at(180,400);
fire('canvas','pointerdown',{pointerId:1,pointerType:'touch',clientX:p.clientX,clientY:p.clientY});
check('o toque e ignorado enquanto o nome nao foi dado',
      G.mode==='over' && el('nameForm').hidden===false,
      'modo='+G.mode+'  form escondido='+el('nameForm').hidden);
el('nameInput').value='TESTE';
fire('nameForm','submit',{});
check('a pontuacao foi gravada', loadScores().some(r=>r.score===77000+1000),
      JSON.stringify(loadScores().map(r=>r.name+':'+r.score)));
