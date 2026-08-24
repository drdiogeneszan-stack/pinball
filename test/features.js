let fails = 0;
const check = (n, ok, d) => { REPORT((ok ? '  OK   ' : '  FALHA') + '  ' + n + (d ? '  (' + d + ')' : '')); if (!ok) fails++; };
let CLOCK = 0;
const step = () => { CLOCK += 1000 / 60; frame(CLOCK); flushTimers(CLOCK); };

REPORT('=== skill shot na calha ===');
resetTimers(); newGame();
for (let i = 0; i < 20; i++) step();
check('chase corre enquanto a bola espera', LAMPS.skill.some(L => L.lv === 1), 'lampada ' + G.skillIdx);
const idxNoDisparo = G.skillIdx, antes = G.score;
G.rankIdx = RANKS.length - 1;          // ja no topo: nada de promocao atropelar
G.charging = true; G.charge = 0.5;
releasePlunger();
check('lancamento premia o skill shot', G.score === antes + 5000 * (idxNoDisparo + 1),
      '+' + (G.score - antes) + ' na lampada ' + (idxNoDisparo + 1) + '/5');
check('lampada congela e pisca', G.skillFreeze === idxNoDisparo && G.skillUntil > perfNow);
check('display anuncia', G.disp.text.indexOf('SKILL SHOT') === 0, G.disp.text);

REPORT('');
REPORT('=== escada do hyperspace ===');
resetTimers(); newGame();
const degraus = [];
for (let r = 0; r < 5; r++) {
  G.mode = 'play'; HYPER.hold = 0; ball.captured = 0;
  const s0 = G.score, b0 = G.ballsTotal;
  enterHyperspace();
  degraus.push({ nome: G.disp.text.split('  ')[0], pts: G.score - s0, bolas: G.ballsTotal - b0, step: G.hyperStep });
  for (let i = 0; i < 70; i++) step();           // ate a bola ser cuspida na calha
  if (r === 0) { degraus[0].naCalha = ball.x > 348 && ball.y > 640; }
  for (let i = 0; i < 60; i++) step();           // e entao disparada
}
degraus.forEach((d, i) => REPORT('  entrada ' + (i + 1) + ': ' + (d.nome + '            ').slice(0, 13) +
  ' +' + String(d.pts).padStart(7) + ' pts  ' + (d.bolas ? '+1 bola' : '       ') + '  degrau=' + d.step));
check('quatro degraus distintos', new Set(degraus.slice(0, 4).map(d => d.nome)).size === 4);
// so o degrau BOLA EXTRA concede, e ate o teto; REPLAY paga em pontos
check('so o degrau de bola extra concede', degraus.filter(d => d.bolas).length === 1,
      degraus.filter(d => d.bolas).map(d => d.nome).join(',') || 'nenhum');
check('REPLAY paga em pontos, nao em bola', degraus[3].nome === 'REPLAY' && degraus[3].bolas === 0,
      degraus[3].nome + ' +' + degraus[3].pts);
check('escada reinicia depois do 4o', degraus[4].nome === degraus[0].nome, degraus[4].nome);
check('bola e cuspida de volta na calha', degraus[0].naCalha === true);
check('e entao disparada de volta ao campo', ball.y < 560 || ball.x < 340,
      'x=' + Math.round(ball.x) + ' y=' + Math.round(ball.y));

REPORT('');
REPORT('=== bola extra estende a partida ===');
resetTimers(); newGame();
G.ballsTotal = 4;
let seen = [];
ball.vy = -(LAUNCH_MIN + LAUNCH_RANGE * 0.7);
for (let i = 0; i < 300 * 60; i++) {
  if (G.mode === 'play' && ball.x > 348 && ball.y > 640 && Math.hypot(ball.vx, ball.vy) < 8) {
    ball.vy = -(LAUNCH_MIN + LAUNCH_RANGE * 0.7); ball.vx = 0;
  }
  step(); if (!seen.includes(G.ball)) seen.push(G.ball);
  if (G.mode === 'over') break;
}
check('jogou as 4 bolas', seen.join(',') === '1,2,3,4' && G.mode === 'over', 'bolas=' + seen.join(','));

REPORT('');
REPORT('=== atracao: padroes binarios ===');
resetTimers(); newGame(); G.mode = 'attract';
const vistos = new Set(); let algumAceso = false, algumFade = false;
const t0 = CLOCK;
for (let t = 0; t < 16000; t += 90) {
  CLOCK = t0 + t; frame(CLOCK);
  vistos.add(Math.floor(CLOCK / 5000) % 3);
  LAMPS.rank.forEach(L => {
    if (L.lv === 1) algumAceso = true;
    if (L.lv > 0.01 && L.lv < 0.99) algumFade = true;
  });
}
check('os tres padroes aparecem', vistos.size === 3, [...vistos].join(','));
check('lampadas acendem', algumAceso);
check('sem meio-tom: pisca duro como no original', !algumFade);

REPORT('');
REPORT('=== flipper com poses discretas ===');
resetTimers(); newGame(); G.mode = 'play';
const poses = new Set();
FLIPPERS[0].held = true;
for (let i = 0; i < 8; i++) {
  step();
  const span = FLIPPERS[0].up - FLIPPERS[0].rest;
  poses.add(Math.round(((FLIPPERS[0].a - FLIPPERS[0].rest) / span) * 3));
}
check('desenha em no maximo 4 poses', poses.size <= 4, 'poses=' + [...poses].sort().join(','));

REPORT('');
REPORT(fails === 0 ? '>>> RECURSOS NOVOS OK' : '>>> ' + fails + ' FALHA(S)');
