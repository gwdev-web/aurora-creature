# CLAUDE.md

**English** | [Português](CLAUDE-PTBR.md)

Guide for agents (and people) working in this repository.

## Project

**Aurora Creature**: a 2D exploration, catching and turn-based battle game built with TypeScript and Canvas 2D, for study and portfolio purposes. Published at https://gwdev-web.github.io/aurora-creature/.

- All content is **original**: creatures, moves, types, characters, towns, art (drawn by code), sounds and music (synthesized by code).
- Never add names, images, sounds, data or characters from existing games or franchises, nor integrate APIs that serve that kind of content.
- No ads, donations or any commercial purpose.

## Commands

Use **pnpm** (version pinned in `packageManager`). If there is no global `pnpm`, use `corepack pnpm`.

```bash
pnpm install
pnpm dev         # local server
pnpm build       # tsc --noEmit + vite build (this is the CI "build" check)
pnpm preview
pnpm i18n:check  # checks the in-game translations
```

## Architecture

**Object-oriented end to end**: one responsibility per class; modules export classes, types and constant data tables. Do not mix loose functions with classes. Class map in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

- `src/data`: tables + lookup classes (`Bestiary`, `MoveBook`, `TypeChart`, `Regions`).
- `src/core`: rules and state, no DOM (`Creature`, `BattleRules`, `EnemyAI`, `GameState`, `Bag`, `SaveManager`...).
- `src/engine`: `Game`, `Scene` (abstract), `Input`, `Painter`, `Dialog`, `Menu`, sprites and audio.
- `src/world`: maps, characters and scenery pixel art.
- `src/scenes`: screens (`Scene` subclasses); flows use `async/await` and `game.push<T>()`.
- `src/i18n`: `I18n` and the English catalog.

The pixel font draws accented capital letters too small, so `Painter` draws the plain letter and paints the accent (´ ` ^ ~ ¨ ¸) as pixels above it.

### UI conventions

- Use `Painter.box` for every panel, with 4 px of inner padding; text never touches a border.
- Menus use `Menu` (arrow + label); prices and quantities go in the right-aligned `values` column, never padded with spaces.
- Help lines at the bottom of full screens: `A: escolher   B: voltar`, size 5, light color, at `H - 9`.
- In dev (`pnpm dev`), `LayoutCheck` warns in the console (and in `window.__layout`) whenever a text leaves its box or the screen; keep it silent before opening a PR.
- Move names must fit the battle menu: at most 11 characters in both languages.

## Language

Commit messages, PR titles and bodies, branch names and code comments are in **Portuguese**. Documentation is bilingual: the main file is in **English** (`README.md`, `CHANGELOG.md`, `CLAUDE.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`) and the Portuguese version has the `-PTBR` suffix (`README-PTBR.md` etc.); when you change one, change the other.

The **game** is bilingual (Portuguese and English): write in-game texts in Portuguese in the code and add the translation to `src/i18n/en.ts`; texts with values use `I18n.t('... {name} ...', { name })`. Run `pnpm i18n:check` before opening a PR (CI runs it too).

Commits follow Conventional Commits (`feat(scope): ...`, `fix:`, `chore:`, `docs:`, `refactor:`, `ci:`).

## Git Flow

- `main`: production; only receives PRs from `release/x.y.z` or `hotfix/x.y.z` (merge commit + `vX.Y.Z` tag + GitHub release).
- `develop`: default branch; receives PRs from `feature/*`, `fix/*`, `chore/*`, `docs/*`, `refactor/*`, `ci/*` with **squash**.
- After each release, open a `main` → `develop` PR (merge commit).
- Rulesets on `main` and `develop`: PR required, green **build** check, no force push. Never commit directly to them.
- Update both changelogs in every PR: `CHANGELOG.md` (English, "Unreleased" section) and `CHANGELOG-PTBR.md` ("Não lançado" section).
- Full step-by-step in [docs/ROADMAP.md](docs/ROADMAP.md).

## Deploy

GitHub Pages uses the **GitHub Actions** source. `deploy.yml` runs **only** when `main` receives a merge (no manual trigger). `ci.yml` runs the build and the translation check on every PR to `develop` and `main`.

## Use

Study project with no license file on purpose (all rights reserved by default) and no commercial purpose. Do not add a `LICENSE` file or license mentions unless the owner asks. Third-party credits (the Press Start 2P font, SIL Open Font License) must stay in the README and on the About page.
