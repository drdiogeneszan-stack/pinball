let fails = 0;
const check = (n, ok, d) => { REPORT((ok ? '  OK   ' : '  FALHA') + '  ' + n + (d ? '  (' + d + ')' : '')); if (!ok) fails++; };
let CLOCK = 0;
const step = () => { CLOCK += 1000 / 60; frame(CLOCK); flushTimers(CLOCK); };
// getElementById cria o stub sob demanda; ELS so tem o que ja foi pedido
const el = (id) => document.getElementById(id);
const submit = (nome, pontos, patente) => {
  G.score = pontos; G.rankIdx = patente || 0;
  el('nameInput').value = nome;
  fire('nameForm', 'submit', {});
};

REPORT('=== ranking local ===');
LS.clear();
check('comeca vazio', loadScores().length === 0);
check('qualquer pontuacao entra quando ha vaga', qualifies(10) === true);
check('zero nao entra', qualifies(0) === false);

submit('ZAN', 120000, 4);
let l = loadScores();
check('gravou a primeira partida', l.length === 1 && l[0].name === 'ZAN' && l[0].score === 120000,
      JSON.stringify(l[0] && { n: l[0].name, s: l[0].score, r: l[0].rank }));
check('guardou a patente', l[0].rank === RANKS[4][0], l[0].rank);

submit('ana', 300000, 6);
submit('BOB', 50000, 2);
l = loadScores();
check('ordena do maior para o menor', l.map(r => r.score).join(',') === '300000,120000,50000', l.map(r => r.score).join(','));
check('nome em maiuscula', l[0].name === 'ANA', l[0].name);

for (let i = 0; i < 12; i++) submit('P' + i, 1000 + i * 100);
l = loadScores();
check('guarda no maximo 10', l.length === 10, l.length + ' registros');
check('mantem os melhores', l[0].score === 300000 && l[9].score >= 1000, l[0].score + ' ... ' + l[9].score);
check('pontuacao baixa nao entra mais', qualifies(5) === false);

REPORT('');
REPORT('=== o nome sobrevive entre partidas ===');
check('lembra o ultimo nome usado', LS.getItem('imcelerPinballName') === 'P11', LS.getItem('imcelerPinballName'));

REPORT('');
REPORT('=== nome vazio e nome perigoso ===');
submit('', 999999);
check('vazio vira ANONIMO', loadScores()[0].name === 'ANÔNIMO', loadScores()[0].name);
submit('<img src=x onerror=alert(1)>', 999998);
const bruto = loadScores().find(r => r.score === 999998);
check('nome com markup e guardado como texto cru', bruto.name.indexOf('<IMG') === 0, bruto.name);
renderBoard(0);
check('a lista foi montada sem executar o markup',
      el('boardList').innerHTML.indexOf('onerror') === -1,
      'o nome entra por textContent, nao por innerHTML');

REPORT('');
REPORT('=== fim de jogo abre o ranking ===');
LS.clear(); resetTimers(); newGame();
G.score = 42000; G.ball = G.ballsTotal;
G.mode = 'play'; drain();
for (let i = 0; i < 600; i++) step();
check('chegou a fim de jogo', G.mode === 'over');
check('painel de ranking aberto', el('board').hidden === false);
check('pedindo o nome', el('nameForm').hidden === false);
// o placar cresce na contagem de bonus, entao confere o formato, nao o valor
check('mostra pontuacao formatada e patente',
      /\d{1,3}\.\d{3} pontos/.test(el('boardSub').textContent) &&
      el('boardSub').textContent.includes(RANKS[G.rankIdx][0]),
      el('boardSub').textContent);

REPORT('');
REPORT('=== teclas do jogo nao vazam enquanto digita ===');
FLIPPERS[0].held = false;
fire('win', 'keydown', { code: 'KeyZ' });
check('Z nao aciona o flipper com o painel aberto', FLIPPERS[0].held === false);
fire('win', 'keydown', { code: 'Escape' });
check('Escape fecha', el('board').hidden === true);

REPORT('');
REPORT(fails === 0 ? '>>> RANKING OK' : '>>> ' + fails + ' FALHA(S)');
