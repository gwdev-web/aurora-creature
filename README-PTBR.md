# Aurora Creature

[English](README.md) | **Português**

Jogo 2D de exploração, captura e batalha por turnos com **criaturas originais**, feito em **TypeScript** e **Canvas 2D**. **Projeto feito exclusivamente para fins de estudo**, sem nenhum fim comercial ([sobre o projeto](https://gwdev-web.github.io/aurora-creature/sobre.html)).

Toda a arte (criaturas, personagens, cenário e interface) é desenhada por código, e todos os sons e músicas são sintetizados no navegador. O jogo não usa imagens, sons, nomes ou personagens de nenhuma franquia existente.

**Jogar:** https://gwdev-web.github.io/aurora-creature/

## O jogo

- Escolha uma de 3 regiões e uma das 3 criaturas iniciais dela no laboratório do Prof. Ipê.
- Explore 6 áreas (Vila Aurora, Rota 1, Cidade Coral, Rota 2, Vila Brasa, Rota 3 e Pico Gelado); a grama alta esconde criaturas selvagens.
- Batalhas por turnos com 10 tipos, prioridade, precisão, PP, golpes críticos e eficácia.
- Capture criaturas com cápsulas, monte um time de até 6 e troque durante a batalha.
- Experiência, novos golpes e evolução por nível.
- Treinadores com campo de visão e o rival Kauã no fim da Rota 1.
- 3 ginásios com líderes (MARINA/ÁGUA, IARA/CHAMA, BÓREAS/GELO) e suas insígnias; ficha do treinador no menu START.
- Jogo em **português e inglês** (opção IDIOMA/LANGUAGE na tela de título; o padrão segue o idioma do navegador).
- Trilha sonora e efeitos sonoros originais, sintetizados no navegador (tecla M liga/desliga).
- Abrigo para curar, Mercado com quantidades x1/x5/x10, menu START e save automático no navegador em 3 slots.

## Como rodar

Requisitos: Node 22+ e [pnpm](https://pnpm.io) (a versão está fixada em `packageManager`; com o corepack, basta `corepack enable`).

```bash
pnpm install
pnpm dev       # servidor local em http://localhost:5173
pnpm build     # checa os tipos e gera a pasta dist/
pnpm preview   # serve o build
pnpm i18n:check  # confere se todo texto do jogo tem tradução em inglês
```

## Controles

| Ação | Teclado | Toque |
| --- | --- | --- |
| Mover | Setas ou WASD | Direcional |
| Confirmar / falar | Z ou Espaço | A |
| Voltar / cancelar | X ou Esc | B |
| Menu | Enter | START |
| Ligar/desligar som | M | botão SOM |

No celular e no tablet os controles de toque aparecem sozinhos: embaixo da tela com o aparelho em pé e dos dois lados dela (como um console portátil) com ele deitado. Dá para deslizar o dedo pelo direcional sem soltar.

## Arquitetura

| Camada | Tecnologia | Pasta |
| --- | --- | --- |
| Build e servidor local | Vite + TypeScript (strict) + pnpm | raiz |
| Renderização | Canvas 2D, tela 240×160 em escala 3× | `src/engine` |
| Dados | bestiário, golpes e tabela de tipos próprios (`Bestiary`, `MoveBook`, `TypeChart`) | `src/data` |
| Regras do jogo | `Creature`, `BattleRules`, `GameState`, `Bag`, `SaveManager` | `src/core` |
| Mapa | mapa em texto, pixel art desenhada por código | `src/world` |
| Telas | cenas com update/render e fluxo com async/await | `src/scenes` |
| Idiomas | `I18n` e o catálogo em inglês | `src/i18n` |
| CI/CD | GitHub Actions: build nas PRs, deploy no Pages pelo `main` | `.github/workflows` |

## Fluxo de trabalho

O projeto segue o **Git Flow** com Pull Requests:

- `main`: só recebe releases e hotfixes, e é o que vai para o GitHub Pages;
- `develop`: recebe uma PR por feature (merge com squash);
- `feature/*`, `chore/*`, `fix/*`, `docs/*`: saem da `develop` e voltam para ela;
- `release/x.y.z` e `hotfix/x.y.z`: vão para o `main` com merge commit e tag `vX.Y.Z`.

A arquitetura é orientada a objetos; o mapa das classes está em [docs/ARCHITECTURE-PTBR.md](docs/ARCHITECTURE-PTBR.md).

Commits e títulos de PR seguem o [Conventional Commits](https://www.conventionalcommits.org/pt-br/), em português. O roteiro completo das 14 PRs e dos passos de release está em [docs/ROADMAP-PTBR.md](docs/ROADMAP-PTBR.md).

## Créditos

- Fonte [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P), de CodeMan38, sob a SIL Open Font License, via `@fontsource`.

## Uso

Projeto de estudo e portfólio, sem fins comerciais. O código está público para consulta.

Para agentes e colaboradores, as convenções do repositório estão no [CLAUDE-PTBR.md](CLAUDE-PTBR.md).
