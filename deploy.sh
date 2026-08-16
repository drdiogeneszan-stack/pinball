#!/bin/sh
# Publica a versão atual do jogo no GitHub Pages.
# index.html é gerado a partir de space-cadet.html, que é o arquivo de trabalho.
set -e
cd "$(dirname "$0")"
cp space-cadet.html index.html
cp space-cadet.html "IMCELER Pinball.html"
git add -A
git commit -m "${1:-Atualiza o jogo}" || echo "nada novo para publicar"
git push
echo "publicado — pode levar ~1 minuto para o site atualizar"
