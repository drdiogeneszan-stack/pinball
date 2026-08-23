let fails = 0;
const check = (n, ok, d) => { REPORT((ok ? '  OK   ' : '  FALHA') + '  ' + n + (d ? '  (' + d + ')' : '')); if (!ok) fails++; };
let CLOCK = 0;
const step = () => { CLOCK += 1000 / 60; frame(CLOCK); flushTimers(CLOCK); };

REPORT('=== contagem de bonus no fim da bola ===');
resetTimers(); newGame();
TARGETS[0].down = TARGETS[1].down = true; LANES[0].lit = true; G.bumperCount = 12; G.mult = 3;
const antes = G.score;
G.mode = 'play'; drain();
check('sequencia montada', G.seq !== null && G.seq.steps.length >= 4, G.seq ? G.seq.steps.length + ' linhas' : '-');
const linhas = [];
let bola2 = -1;
for (let i = 0; i < 400; i++) {
  step();
  if (G.disp.text && !linhas.includes(G.disp.text)) linhas.push(G.disp.text);
  if (G.ball === 2 && bola2 < 0) bola2 = i;
}
REPORT('  linhas exibidas: ' + linhas.filter(Boolean).join(' | '));
check('placar somou os bonus', G.score > antes, antes + ' -> ' + G.score);
check('passou para a bola 2 ao terminar', G.ball === 2, 'apos ' + (bola2 / 60).toFixed(1) + 's');
check('sequencia encerrada', G.seq === null);

REPORT('');
REPORT('=== reiniciar no meio da contagem nao quebra a bola nova ===');
resetTimers(); newGame(); G.mode = 'play'; drain();
step(); step();
check('contagem rodando', G.seq !== null);
newGame();
check('F2 aborta a contagem', G.seq === null);
ball.vy = -(LAUNCH_MIN + LAUNCH_RANGE * 0.7);
let drenou = false;
for (let i = 0; i < 90 * 60; i++) { step(); if (G.mode !== 'play') { drenou = true; break; } }
check('a bola nova joga normalmente', drenou);

REPORT('');
REPORT('=== tilt e um blecaute, nao um dimmer ===');
resetTimers(); newGame(); G.mode = 'play';
for (let i = 0; i < 30; i++) step();
const aceso = LAMPS.rank[0].lv;
nudge(1, 0); nudge(1, 0); nudge(1, 0); nudge(1, 0);
step();
check('tilt disparado', G.tilted === true);
check('lampadas apagam no mesmo frame (sem fade)', LAMPS.rank[0].lv === 0,
      'antes=' + aceso.toFixed(2) + ' depois=' + LAMPS.rank[0].lv.toFixed(2));
check('display fixo em TILT', G.disp.text === 'TILT', G.disp.text);
FLIPPERS[0].held = true; stepFlipper(FLIPPERS[0], 1 / 60);
check('flippers mortos', Math.abs(FLIPPERS[0].a - FLIPPERS[0].rest) < 1e-6);

REPORT('');
REPORT('=== display de texto tem prioridade ===');
resetTimers(); newGame(); step();
check('novo jogo limpa o TILT anterior', G.disp.text === '' || G.disp.prio < 9, 'texto="' + G.disp.text + '" prio=' + G.disp.prio);
G.disp = { text: '', until: 0, prio: 0, blinkUntil: 0 };
say('PONTOS', 3, 0);
say('MAIS PONTOS', 3, 0);
check('entre iguais, a mais recente vence', G.disp.text === 'MAIS PONTOS', G.disp.text);
say('PROMOVIDO A ENSIGN', 3, 6, 1.5);
check('evento importante atropela os pontos', G.disp.text === 'PROMOVIDO A ENSIGN', G.disp.text);
say('pontinhos', 3, 0);
check('pontos NAO atropelam o evento importante', G.disp.text === 'PROMOVIDO A ENSIGN', G.disp.text);

REPORT('');
REPORT('=== audio: banco completo e mudo no tilt ===');
const nomes = Object.keys(SFX);
REPORT('  sons: ' + nomes.join(', '));
check('todos os sons sao funcoes', nomes.every(k => typeof SFX[k] === 'function'), nomes.length + ' sons');
G.tilted = false; check('gate aberto fora do tilt', gated() === true);
G.tilted = true;
check('gate fecha no tilt', gated() === false);
check('mas o proprio tilt e a contagem passam', gated(true) === true);
G.tilted = false;

REPORT('');
REPORT(fails === 0 ? '>>> IMERSAO OK' : '>>> ' + fails + ' FALHA(S)');
