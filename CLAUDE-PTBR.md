# CLAUDE.md (PT-BR)

[English](CLAUDE.md) | **Português**

**Aurora Creature**: jogo 2D de captura e batalha por turnos em TypeScript e Canvas 2D. Projeto de estudo, no ar em https://gwdev-web.github.io/aurora-creature/.

## Regras

- Todo o conteúdo é original e feito por código. Nunca adicione nomes, assets ou dados de jogos ou franquias existentes.
- Sem anúncios, doações ou fins comerciais.
- Sem arquivo `LICENSE` ou menções a licença, a menos que o dono peça. Mantenha o crédito da fonte Press Start 2P nos READMEs e na página Sobre.

## Comandos

Use pnpm (`corepack pnpm` se não estiver instalado globalmente).

```bash
pnpm install
pnpm dev
pnpm build       # tsc --noEmit + vite build
pnpm i18n:check  # todo texto do jogo precisa de tradução
```

## Código

Orientado a objetos: uma responsabilidade por classe; módulos exportam classes, tipos e tabelas de dados constantes. As dependências vão de `scenes` → `world`/`engine` → `core` → `data`, e o `core` não acessa o DOM. Mapa das classes em [docs/ARCHITECTURE-PTBR.md](docs/ARCHITECTURE-PTBR.md).

- Os textos do jogo são escritos em português no código, com a tradução em `src/i18n/en.ts`. Textos com valores usam `I18n.t('... {nome} ...', { nome })`.
- Todo painel usa `Painter.box` com 4 px de margem interna.
- Menus usam `Menu`; preços e quantidades vão na coluna `values`, nunca com espaços de preenchimento.
- Linhas de ajuda em telas cheias: tamanho 5, cor clara, em `H - 9`.
- Nomes de golpes: no máximo 11 caracteres nos dois idiomas.
- No `pnpm dev`, o `LayoutCheck` avisa quando um texto sai da caixa ou da tela; deixe-o sem avisos.

## Idioma

Commits, PRs, nomes de branch e comentários no código em português, com Conventional Commits. A documentação é bilíngue (`*.md` em inglês, `*-PTBR.md` em português); altere as duas juntas.

## Branches e releases

- `develop`: base para novos trabalhos, com branches `feature/*`, `fix/*`, `chore/*`, `docs/*`, `refactor/*` e `ci/*`. Abra as PRs para ela, pois a `main` ainda é a branch padrão do repositório.
- `main`: produção. Todo push publica no GitHub Pages pelo `deploy.yml`.
- O `ci.yml` roda o build e a checagem de traduções nas PRs para `develop` e `main`.
- Registre as mudanças em "Unreleased" / "Não lançado" nos dois changelogs.
- Release: atualize o `package.json`, date os changelogs, faça o merge da `develop` na `main` e crie a tag `vX.Y.Z` e a release no GitHub.
