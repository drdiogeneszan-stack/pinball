# IMCELER Pinball — Space Cadet

Recriação do *3D Pinball for Windows – Space Cadet* em HTML5 Canvas, com a
identidade visual do IMCELER.

**Jogar:** abra `index.html` no navegador. Não precisa instalar nada, não precisa
de internet — fontes, logotipo e ícone estão todos embutidos no arquivo.

## Controles

| Teclado | Toque |
|---|---|
| `Z` / `A` — flipper esquerdo | Toque na metade esquerda |
| `/` / `L` — flipper direito | Toque na metade direita |
| `Espaço` — segure e solte para lançar | Canto inferior direito |
| `←` `↑` `→` — empurra a mesa (4 = tilt) | — |
| `P` pausa · `F1` ajuda · `F2` novo jogo | Botões no canto superior |

## Como funciona

- **Física própria:** integração por 7 substeps, atrito de Coulomb, colisão
  cápsula–círculo nos flippers e polígono convexo nos slingshots.
- **Perspectiva:** a mesa é simulada plana (400×760) e inclinada apenas na hora
  de desenhar, em fatias horizontais — a física não sabe que existe perspectiva.
- **Arquivo único:** Lato (SIL OFL) e o logotipo vão embutidos como data URI.

## Publicar uma atualização

```sh
./deploy.sh "descrição da mudança"
```
