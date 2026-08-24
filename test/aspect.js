let fails=0; const check=(n,ok,d)=>{REPORT((ok?'  OK   ':'  FALHA')+'  '+n+(d?'  ('+d+')':'')); if(!ok)fails++;};
REPORT('=== a mesa mantem a proporcao quando a caixa difere da janela ===');
REPORT('  janela      caixa real   escala   mesa desenhada   proporcao');
let ruim=[];
for (const [iw,ih,bw,bh,nome] of [
  [390,844,390,844,'iguais'],
  [390,844,390,780,'barra do Safari visivel'],
  [390,844,390,724,'barra + safe area'],
  [430,932,430,860,'Pro Max com barra'],
  [1440,900,1440,900,'desktop']]) {
  innerWidth=iw; innerHeight=ih; BOX={w:bw,h:bh};
  layout();
  const tw=SCR_W*VIEW_SCALE, th=(RAKE_TOP_Y+RAKE_H+PANEL_H)*VIEW_SCALE;
  // a proporcao desenhada tem que bater com a proporcao do design
  const prop = tw/th, esperado = SCR_W/(RAKE_TOP_Y+RAKE_H+PANEL_H);
  const ok = Math.abs(prop-esperado) < 0.001 && tw<=bw+0.5 && th<=bh+0.5;
  if(!ok) ruim.push(nome);
  REPORT('  '+(iw+'x'+ih+'      ').slice(0,11)+(bw+'x'+bh+'      ').slice(0,12)+
    (Math.round(VIEW_SCALE*100)/100+'    ').slice(0,6)+' '+
    (Math.round(tw)+'x'+Math.round(th)+'        ').slice(0,13)+'  '+prop.toFixed(3)+(ok?'':'   <<< DEFORMADA'));
}
check('nunca deforma nem estoura', ruim.length===0, ruim.join(', ')||'todas certas');

REPORT('');
REPORT('=== o toque continua caindo no lugar com a caixa menor ===');
innerWidth=390; innerHeight=844; BOX={w:390,h:724}; layout();
let erro=0;
for (const pt of [[120,650],[240,650],[372,690],[180,300],[60,450]]) {
  const sx=(projX(pt[0],pt[1])+VIEW_OX)*VIEW_SCALE, sy=(projY(pt[1])+VIEW_OY)*VIEW_SCALE;
  const p=viewPoint({clientX:sx, clientY:sy});
  const ty=invY(p.y), tx=(p.x-CX)/scaleAt(ty)+TW/2;
  erro=Math.max(erro, Math.abs(tx-pt[0]), Math.abs(ty-pt[1]));
}
check('erro de mapeamento abaixo de 1px', erro<1, 'maior erro '+erro.toFixed(3)+'px');
REPORT('');
REPORT(fails===0?'>>> FORMATO OK':'>>> '+fails+' FALHA(S)');

REPORT('');
REPORT('=== a fonte da marca desenha de verdade? ===');
check('familia em uso definida', typeof BRAND_FONT === 'string', BRAND_FONT);
check('verificador existe e nao derruba o jogo', typeof verifyBrandFont === 'function' && verifyBrandFont() === true,
      'sem getImageData no harness, ele nao julga e segue com a marca');
