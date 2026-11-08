# CLAUDE.md (PT-BR)

[English](CLAUDE.md) | **Português**

Guia para agentes (e pessoas) que trabalham neste repositório.

## Projeto

**Aurora Creature**: jogo 2D de exploração, captura e batalha por turnos, feito em TypeScript e Canvas 2D, para estudo e portfólio. Publicado em https://gwdev-web.github.io/aurora-creature/.

- Todo o conteúdo é **original**: criaturas, golpes, tipos, personagens, cidades, arte (desenhada por código), sons e músicas (sintetizados por código).
- Nunca adicione nomes, imagens, sons, dados ou personagens de jogos ou franquias existentes, nem integre APIs que sirvam esse tipo de conteúdo.
- Sem anúncios, doações ou qualquer fim comercial.

## Comandos

Use **pnpm** (versão fixada em `packageManager`). Se o `pnpm` global não existir, use `corepack pnpm`.

```bash
pnpm install
pnpm dev       # servidor local
pnpm build     # tsc --noEmit + vite build (é o check "build" do CI)
pnpm preview
pnpm i18n:check  # confere as traduções do jogo
```

## Arquitetura

**Orientada a objetos de ponta a ponta**: cada responsabilidade numa classe; módulos exportam classes, tipos e tabelas de dados constantes. Não misture funções soltas com classes. Mapa das classes em [docs/ARCHITECTURE-PTBR.md](docs/ARCHITECTURE-PTBR.md).

- `src/data`: tabelas + classes de consulta (`Bestiary`, `MoveBook`, `TypeChart`, `Regions`).
- `src/core`: regras e estado, sem DOM (`Creature`, `BattleRules`, `EnemyAI`, `GameState`, `Bag`, `SaveManager`...).
- `src/engine`: `Game`, `Scene` (abstrata), `Input`, `Painter`, `Dialog`, `Menu`, sprites e áudio.
- `src/world`: mapa, personagens e pixel art do cenário.
- `src/scenes`: telas (subclasses de `Scene`); fluxos com `async/await` e `game.push<T>()`.

A fonte pixelada desenha maiúsculas acentuadas pequenas, então o `Painter` desenha a letra sem acento e pinta o acento (´ ` ^ ~ ¨ ¸) em pixels por cima dela.

### Padrões de interface

- Use `Painter.box` em todo painel, com 4 px de margem interna; texto nunca encosta na borda.
- Menus usam `Menu` (seta + rótulo); preços e quantidades vão na coluna `values`, alinhada à direita, nunca com espaços de preenchimento.
- Linha de ajuda no rodapé das telas cheias: `A: escolher   B: voltar`, tamanho 5, cor clara, em `H - 9`.
- Em desenvolvimento (`pnpm dev`), o `LayoutCheck` avisa no console (e em `window.__layout`) quando um texto sai da caixa ou da tela; deixe-o sem avisos antes de abrir a PR.
- Nomes de golpes precisam caber no menu de batalha: no máximo 11 caracteres nos dois idiomas.

## Idioma

Mensagens de commit, títulos e corpos de PR, nomes de branch e comentários no código em **português**. A documentação é bilíngue: o arquivo principal em **inglês** (`README.md`, `CHANGELOG.md`, `CLAUDE.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`) e a versão em português com o sufixo `-PTBR` (`README-PTBR.md` etc.); ao mudar um, mude o outro. O **jogo** é bilíngue (português e inglês): escreva os textos em português no código e adicione a tradução em `src/i18n/en.ts`; textos com valores usam `I18n.t('... {nome} ...', { nome })`. Rode `pnpm i18n:check` antes de abrir a PR (o CI também roda).

Commits seguem o Conventional Commits (`feat(escopo): ...`, `fix:`, `chore:`, `docs:`, `refactor:`, `ci:`).

## Git Flow

- `main`: produção; só recebe PR de `release/x.y.z` ou `hotfix/x.y.z` (merge commit + tag `vX.Y.Z` + release no GitHub).
- `develop`: branch padrão; recebe PRs de `feature/*`, `fix/*`, `chore/*`, `docs/*`, `refactor/*`, `ci/*` com **squash**.
- Depois de cada release, abrir PR `main` → `develop` (merge commit).
- Rulesets em `main` e `develop`: PR obrigatória, check **build** verde, sem force push. Nunca faça commit direto nelas.
- Atualize os dois changelogs em cada PR: `CHANGELOG.md` (inglês, seção "Unreleased") e `CHANGELOG-PTBR.md` (seção "Não lançado").
- Passo a passo completo em [docs/ROADMAP-PTBR.md](docs/ROADMAP-PTBR.md).

## Deploy

O GitHub Pages usa a origem **GitHub Actions**. O `deploy.yml` roda **somente** quando o `main` recebe um merge (sem gatilho manual). O `ci.yml` roda o build em toda PR para `develop` e `main`.

## Uso

Projeto de estudo sem arquivo de licença, de propósito (por padrão, todos os direitos reservados), e sem fins comerciais. Não adicione arquivo `LICENSE` nem menções a licença sem o dono pedir. Os créditos de terceiros (fonte Press Start 2P, SIL Open Font License) continuam no README e na página Sobre.
