# CLAUDE.md

**English** | [Português](CLAUDE-PTBR.md)

**Aurora Creature**: 2D creature-catching and turn-based battle game in TypeScript and Canvas 2D. Study project, live at https://gwdev-web.github.io/aurora-creature/.

## Rules

- All content is original and made by code. Never add names, assets or data from existing games or franchises.
- No ads, donations or commercial purpose.
- No `LICENSE` file or license mentions unless the owner asks. Keep the Press Start 2P credit in the READMEs and on the About page.

## Commands

Use pnpm (`corepack pnpm` if it is not installed globally).

```bash
pnpm install
pnpm dev
pnpm build       # tsc --noEmit + vite build
pnpm i18n:check  # every in-game text needs a translation
```

## Code

Object-oriented: one responsibility per class; modules export classes, types and constant data tables. Dependencies flow `scenes` → `world`/`engine` → `core` → `data`, and `core` has no DOM access. Class map in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

- In-game texts are written in Portuguese in the code, with the translation in `src/i18n/en.ts`. Texts with values use `I18n.t('... {name} ...', { name })`.
- Every panel uses `Painter.box` with 4 px of inner padding.
- Menus use `Menu`; prices and quantities go in the `values` column, never padded with spaces.
- Help lines on full screens: size 5, light color, at `H - 9`.
- Move names: at most 11 characters in both languages.
- In `pnpm dev`, `LayoutCheck` warns when a text leaves its box or the screen; keep it silent.

## Language

Commits, PRs, branch names and code comments are in Portuguese, using Conventional Commits. Docs are bilingual (`*.md` in English, `*-PTBR.md` in Portuguese); change both together.

## Branches and releases

- `develop`: base for new work, through `feature/*`, `fix/*`, `chore/*`, `docs/*`, `refactor/*` and `ci/*` branches. Open PRs against it, since `main` is still the repository's default branch.
- `main`: production. Every push deploys to GitHub Pages through `deploy.yml`.
- `ci.yml` runs the build and the translation check on PRs to `develop` and `main`.
- Note changes under "Unreleased" / "Não lançado" in both changelogs.
- Release: bump `package.json`, date the changelogs, merge `develop` into `main`, then create the `vX.Y.Z` tag and GitHub release.
