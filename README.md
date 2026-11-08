# Aurora Creature

**English** | [Português](README-PTBR.md)

A 2D exploration, catching and turn-based battle game with **original creatures**, built with **TypeScript** and **Canvas 2D**. **This project was made exclusively for study purposes**, with no commercial intent ([about the project](https://gwdev-web.github.io/aurora-creature/sobre.html)).

All art (creatures, characters, scenery and interface) is drawn by code, and all sound effects and music are synthesized in the browser. The game does not use images, sounds, names or characters from any existing franchise.

**Play:** https://gwdev-web.github.io/aurora-creature/

## The game

- Pick one of 3 regions and one of its 3 starter creatures in Prof. Ipê's lab.
- Explore Aurora Town, Route 1, Coral City, Route 2, Ember Town, Route 3 and Frost Peak; tall grass hides wild creatures.
- Turn-based battles with 10 types, priority, accuracy, PP, critical hits and type effectiveness.
- Catch creatures with capsules, build a team of up to 6 and switch during battle.
- Experience, new moves and level-based evolution.
- Trainers with a line of sight and the rival Kauã at the end of Route 1.
- 3 gyms with leaders (MARINA/WATER, IARA/FLAME, BÓREAS/ICE) and their badges; trainer card in the START menu.
- Playable in **English and Portuguese** (LANGUAGE/IDIOMA option on the title screen; defaults to the browser language).
- Original soundtrack and sound effects synthesized in the browser (M toggles sound).
- Shelter to heal, Market with x1/x5/x10 quantities, START menu and autosave in the browser with 3 slots.

## Running locally

Requirements: Node 22+ and [pnpm](https://pnpm.io) (the version is pinned in `packageManager`; with corepack, just run `corepack enable`).

```bash
pnpm install
pnpm dev         # local server at http://localhost:5173
pnpm build       # type-checks and builds into dist/
pnpm preview     # serves the build
pnpm i18n:check  # checks that every in-game text has an English translation
```

## Controls

| Action | Keyboard | Touch |
| --- | --- | --- |
| Move | Arrows or WASD | D-pad |
| Confirm / talk | Z or Space | A |
| Back / cancel | X or Esc | B |
| Menu | Enter | START |
| Toggle sound | M | SOUND button |

On phones and tablets the touch controls appear automatically: below the screen in portrait, and on both sides of it (like a handheld console) in landscape. You can slide your finger across the D-pad without lifting it.

## Architecture

| Layer | Technology | Folder |
| --- | --- | --- |
| Build and dev server | Vite + TypeScript (strict) + pnpm | root |
| Rendering | Canvas 2D, 240×160 screen at 3× scale | `src/engine` |
| Data | original bestiary, moves and type chart (`Bestiary`, `MoveBook`, `TypeChart`) | `src/data` |
| Game rules | `Creature`, `BattleRules`, `GameState`, `Bag`, `SaveManager` | `src/core` |
| World | text-based maps, pixel art drawn by code | `src/world` |
| Screens | scenes with update/render and async/await flows | `src/scenes` |
| Languages | `I18n` and the English catalog | `src/i18n` |
| CI/CD | GitHub Actions: build on PRs, deploy to Pages from `main` | `.github/workflows` |

The architecture is object-oriented; the class map is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Workflow

The project follows **Git Flow** with Pull Requests:

- `main`: only receives releases and hotfixes, and is what gets deployed to GitHub Pages;
- `develop`: receives one PR per feature (squash merge);
- `feature/*`, `chore/*`, `fix/*`, `docs/*`: branch off `develop` and go back to it;
- `release/x.y.z` and `hotfix/x.y.z`: go to `main` with a merge commit and a `vX.Y.Z` tag.

Commits and PR titles follow [Conventional Commits](https://www.conventionalcommits.org/), written in Portuguese. The full roadmap and release steps are in [docs/ROADMAP.md](docs/ROADMAP.md).

## Credits

- [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) font by CodeMan38, under the SIL Open Font License, via `@fontsource`.

## Use

Study and portfolio project, with no commercial purpose. The code is public for reference.

Repository conventions for agents and contributors are in [CLAUDE.md](CLAUDE.md).
