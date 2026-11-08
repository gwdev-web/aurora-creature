# Architecture

**English** | [Português](ARCHITECTURE-PTBR.md)

The game is **object-oriented**: each responsibility lives in a class, and modules only export classes, types and constant data tables.

## Layers

```
src/
├── data/      data tables + lookup classes
├── core/      game rules and state (no DOM, testable in Node)
├── engine/    loop, input, drawing, audio and UI components
├── i18n/      languages (Portuguese and English)
├── world/     maps and scenery pixel art
└── scenes/    game screens (each one is a Scene subclass)
```

Dependencies always flow downwards: `scenes` → `world`/`engine` → `core` → `data`. `core` knows nothing about the canvas.

## Main classes

| Class | Folder | Responsibility |
| --- | --- | --- |
| `Bestiary` | `data` | species lookup (`get`, `all`, `count`) |
| `MoveBook` | `data` | move lookup |
| `TypeChart` | `data` | type effectiveness and messages |
| `Regions` | `data` | home regions, starter trios and wildlife |
| `Random` | `core` | random numbers, seeded or not |
| `Creature` | `core` | a creature: stats, HP, moves, EXP, evolution, serialization |
| `BattleRules` | `core` | damage, accuracy, turn order, escape, catching and EXP |
| `EnemyAI` | `core` | move choice for opponents |
| `Bag` | `core` | the player's items |
| `GameState` | `core` | team, box, bag, money, position and progress |
| `SaveManager` | `core` | saving and loading in `localStorage` (3 slots) |
| `WildEncounters` | `core` | per-map encounter rolls |
| `TrainerTeams` | `core` | seeded trainer teams |
| `GameMap` | `world` | tile grid, buildings, NPCs, warps, theme, music and encounters of a map |
| `MapRegistry` | `world` | all maps by id, new-game start and default respawn point |
| `GymFactory` | `world` | builds gym interiors (hall, trainers, leader, exit) |
| `WorldRenderer` | `world` | pixel art for tiles (per theme), buildings and characters |
| `Game` | `engine` | main loop and scene stack (`setScene`, `push`, `pop`) |
| `Scene` | `engine` | abstract screen class (`update`, `render`, `onEnter`) |
| `Input` | `engine` | keyboard and touch controls (sliding D-pad, A, B, START) |
| `Painter` | `engine` | text (with pixel accents on capitals), boxes, bars and arrows on the canvas |
| `LayoutCheck` | `engine/debug` | dev-only warning when a text overflows its box or the screen |
| `Dialog` / `Menu` | `engine` | dialog box and menu, both `Promise`-based |
| `CreatureSpriteBuilder` / `CreatureSprites` | `engine` | procedural sprite generation and cache |
| `AudioManager` | `engine/audio` | audio context, mute, music and effects |
| `Sequencer` | `engine/audio` | reads the music notation (`tracks.ts`) and schedules notes in a loop |
| `UiSound` | `engine` | bridge between menus and audio |
| `I18n` | `i18n` | current language (pt/en), gettext-style translation and HTML page texts |

## Screen flow

Every screen is a `Scene` subclass. Screens that return a result (battle, team, shop) are pushed with `game.push<T>(scene)`, which returns a `Promise<T>` resolved when the scene calls `game.pop(result)`. This way an event script is written sequentially with `async/await`:

```ts
await this.dialog.show(this.game.painter, 'Uma criatura selvagem apareceu!');
const result = await this.game.push<BattleResult>(new BattleScene(this.game, enemies));
```

## Languages

The game is written in Portuguese, and the Portuguese text is the translation key (gettext style). The `src/i18n/en.ts` catalog holds the English version.

- `Painter.text`, `Dialog.show` and `Menu` translate automatically; texts with values use `I18n.t('Você recebeu {name}!', { name })`.
- HTML elements with `data-i18n` (help, footer) are translated by `I18n.applyDom()`.
- `pnpm i18n:check` (also in CI) fails if any displayed text has no translation.

## Persistence

`GameState.toJSON()` produces a plain object (`GameStateData`), and `GameState.fromJSON()` rebuilds the `Creature` and `Bag` instances. `SaveManager` only deals with `localStorage`, one key per slot.
