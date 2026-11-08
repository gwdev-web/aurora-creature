# Implementation roadmap

**English** | [Português](ROADMAP-PTBR.md)

The game was built in 14 feature PRs, each merged into `develop`, and reached `main` in 3 releases (v0.1.0, v0.2.0 and v1.0.0). Every release publishes a playable version on GitHub Pages. Later versions (v1.1.0 onwards) follow the same flow; see the [CHANGELOG](../CHANGELOG.md).

## Git Flow

| Branch | Branches off | Merges into | Name | Merge |
| --- | --- | --- | --- | --- |
| `main` | — | — | fixed | only via release or hotfix PR |
| `develop` | `main` | `main` (via release) | fixed | only via PR |
| `feature/*` | `develop` | `develop` | `feature/short-name` (or `chore/`, `fix/`, `docs/`) | squash |
| `release/*` | `develop` | `main` and `develop` | `release/0.1.0` | merge commit + tag |
| `hotfix/*` | `main` | `main` and `develop` | `hotfix/0.1.1` | merge commit + tag |

Rules for every PR (also in `pull_request_template.md`):

- one feature per PR, based on `develop`, with a Conventional Commits title (written in Portuguese);
- a description of what changes and how to test it;
- green **build** check before merging;
- all art, names and characters are original;
- branch deleted after the merge.

## Repository setup

- Default branch: `develop`.
- Rulesets on `main` and `develop`: PR required, **build** check required, no force push and no branch deletion.
- GitHub Pages with the **GitHub Actions** source.
- Squash merge and merge commits enabled; branches deleted automatically after merging.

## Features

| PR | Branch | Delivers | Release |
| --- | --- | --- | --- |
| 1 | `chore/setup-projeto` | Vite, TS, pnpm, CI, deploy, documentation | |
| 2 | `feature/bestiario` | creatures, moves and type chart | |
| 3 | `feature/modelo-criatura` | stats, moves, damage, catching, EXP | |
| 4 | `feature/engine` | loop, scene stack, keyboard and touch | |
| — | `refactor/arquitetura-poo` | data and rules converted to classes | |
| 5 | `feature/ui-dialogos-menus` | font, boxes, Dialog, Menu, bars, sprites | |
| 6 | `feature/titulo-e-regiao` | title screen and region choice | |
| 7 | `feature/escolha-inicial` | the 3 starters and the start of the game | |
| 8 | `feature/mapa` | town, route, movement and collision | v0.1.0 |
| 9 | `feature/batalha-selvagem` | grass encounters, FIGHT and RUN | |
| 10 | `feature/captura-e-bolsa` | capsules, tonics, catching animation | |
| 11 | `feature/time-e-troca` | team screen, summary and switching in battle | v0.2.0 |
| 12 | `feature/xp-e-evolucao` | leveling up, learning moves, evolving | |
| 13 | `feature/treinadores-e-rival` | line of sight, battles, rival | |
| 14 | `feature/centro-loja-save` | healing, shop, menu, save and defeat | v1.0.0 |

### Commit of each PR

1. `chore: configura projeto vite + typescript e ci`
2. `feat(data): bestiario, golpes e tabela de tipos`
3. `feat(core): modelo de criatura e formulas de batalha`
4. `feat(engine): loop, pilha de cenas e input`
- `refactor: arquitetura orientada a objetos` (between PR 4 and PR 5)
5. `feat(ui): dialogos, menus, fonte pixelada e sprites`
6. `feat(scenes): tela de titulo e escolha de regiao`
7. `feat(scenes): escolha da criatura inicial`
8. `feat(world): mapa, movimento e colisao`
9. `feat(battle): batalhas contra criaturas selvagens`
10. `feat(battle): captura e uso de itens`
11. `feat(party): tela do time e troca em batalha`
12. `feat(core): experiencia, novos golpes e evolucao`
13. `feat(trainers): treinadores com campo de visao e rival`
14. `feat(world): abrigo, mercado, menu e save`

## Releases

Versions follow SemVer: while the game was incomplete it stayed at 0.x; v1.0.0 shipped when the full loop worked (choose, explore, catch, battle and save).

| Version | Shipped after | What you can do on the site |
| --- | --- | --- |
| v0.1.0 | PR 8 | choose a region and a starter and walk around the map |
| v0.2.0 | PR 11 | battle, catch and build a team |
| v1.0.0 | PR 14 | full game: evolution, trainers, rival, shop and save |

Steps for each release:

```bash
git switch develop && git pull
git switch -c release/0.1.0
# bump version in package.json and update both changelogs (CHANGELOG.md and CHANGELOG-PTBR.md)
git commit -am "chore(release): 0.1.0"
git push -u origin release/0.1.0
gh pr create --base main --title "chore(release): 0.1.0"
gh pr merge --merge                # merge commit, no squash
git switch main && git pull
git tag -a v0.1.0 -m "v0.1.0" && git push origin v0.1.0
gh release create v0.1.0 --notes-file <changelog excerpt>
# bring main back into develop through a PR (main -> develop)
gh pr create --base develop --head main --title "chore: sincroniza main na develop"
```

The production deploy (`deploy.yml`) runs **only** when `main` receives a merge; there is no manual trigger. Merging the release triggers `deploy.yml` and the site updates at https://gwdev-web.github.io/aurora-creature/.

Urgent fix to what is already published: create `hotfix/0.1.1` from `main`, open the PR to `main`, create the `v0.1.1` tag and then bring `main` back into `develop`.

## Original content

- Creatures, moves, types, characters, towns and routes have their own names.
- Creature sprites are generated by code from a seed, with no image files.
- No ads, donations or sales.
