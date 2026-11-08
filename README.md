# Aurora Creature

**English** | [Português](README-PTBR.md)

A 2D exploration, catching and turn-based battle game with **original creatures**, built with **TypeScript** and **Canvas 2D**. Study project with no commercial purpose ([about](https://gwdev-web.github.io/aurora-creature/sobre.html)).

All art is drawn by code, and all music and sound effects are synthesized in the browser.

**Play:** https://gwdev-web.github.io/aurora-creature/

## The game

- Pick one of 3 regions and one of its 3 starter creatures.
- Explore towns and routes; tall grass hides wild creatures.
- Turn-based battles with 10 types, accuracy, PP, critical hits and type effectiveness.
- Catch creatures, build a team of up to 6, gain experience, learn moves and evolve.
- Face trainers, a rival and 3 gym leaders.
- Shelter, Market, START menu and autosave with 3 slots.
- Playable in English and Portuguese, on keyboard or touch.

## Running locally

Requirements: Node 22+ and [pnpm](https://pnpm.io) (with corepack, run `corepack enable`).

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

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [Changelog](CHANGELOG.md)
- [Repository conventions](CLAUDE.md)

## Credits

[Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) font by CodeMan38, under the SIL Open Font License, via `@fontsource`.
