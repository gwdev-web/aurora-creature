# Arquitetura

[English](ARCHITECTURE.md) | **Português**

O jogo é **orientado a objetos**: cada responsabilidade fica numa classe, e os módulos só exportam classes, tipos e tabelas de dados constantes.

## Camadas

```
src/
├── data/      tabelas de dados + classes de consulta
├── core/      regras e estado do jogo (sem DOM, testáveis no Node)
├── engine/    loop, entrada, desenho, áudio e componentes de interface
├── i18n/      idiomas (português e inglês)
├── world/     mapa e pixel art do cenário
└── scenes/    telas do jogo (cada uma é uma subclasse de Scene)
```

As dependências vão sempre de cima para baixo: `scenes` → `world`/`engine` → `core` → `data`. O `core` não conhece o canvas.

## Classes principais

| Classe | Pasta | Responsabilidade |
| --- | --- | --- |
| `Bestiary` | `data` | consulta das espécies (`get`, `all`, `count`) |
| `MoveBook` | `data` | consulta dos golpes |
| `TypeChart` | `data` | eficácia entre tipos e mensagens |
| `Regions` | `data` | regiões de origem, trios iniciais e fauna |
| `Random` | `core` | números aleatórios, com ou sem semente |
| `Creature` | `core` | uma criatura: atributos, HP, golpes, XP, evolução, serialização |
| `BattleRules` | `core` | dano, precisão, ordem dos turnos, fuga, captura e XP |
| `EnemyAI` | `core` | escolha de golpe dos adversários |
| `Bag` | `core` | itens do jogador |
| `GameState` | `core` | time, caixa, bolsa, dinheiro, posição e progresso |
| `SaveManager` | `core` | salvar e carregar no `localStorage` (3 slots) |
| `GameMap` | `world` | grade de tiles, prédios, NPCs, warps, tema, música e encontros de um mapa |
| `MapRegistry` | `world` | todos os mapas por id, início do jogo e ponto de retorno padrão |
| `GymFactory` | `world` | monta o interior dos ginásios (salão, treinadores, líder, saída) |
| `WorldRenderer` | `world` | pixel art dos tiles (por tema), prédios e personagens |
| `WildEncounters` | `core` | sorteio de encontros por mapa |
| `TrainerTeams` | `core` | times dos treinadores, com semente |
| `Game` | `engine` | loop principal e pilha de cenas (`setScene`, `push`, `pop`) |
| `Scene` | `engine` | classe abstrata das telas (`update`, `render`, `onEnter`) |
| `Input` | `engine` | teclado e controles de toque (direcional deslizante, A, B, START) |
| `Painter` | `engine` | texto (com acentos em pixels nas maiúsculas), caixas, barras e setas no canvas |
| `LayoutCheck` | `engine/debug` | aviso, só em desenvolvimento, quando um texto sai da caixa ou da tela |
| `Dialog` / `Menu` | `engine` | caixa de diálogo e menu, ambos com `Promise` |
| `CreatureSpriteBuilder` / `CreatureSprites` | `engine` | geração procedural e cache das sprites |
| `AudioManager` | `engine/audio` | contexto de áudio, mudo, música e efeitos |
| `Sequencer` | `engine/audio` | lê a notação das músicas (`tracks.ts`) e agenda as notas em loop |
| `UiSound` | `engine` | ponte entre menus e áudio |
| `I18n` | `i18n` | idioma atual (pt/en), tradução no estilo gettext e textos da página HTML |

## Fluxo das telas

Cada tela é uma subclasse de `Scene`. Telas que devolvem um resultado (batalha, time, loja) são empilhadas com `game.push<T>(cena)`, que devolve uma `Promise<T>` resolvida quando a cena chama `game.pop(resultado)`. Assim, o roteiro de um evento é escrito em sequência com `async/await`:

```ts
await this.dialog.show(this.game.painter, 'Uma criatura selvagem apareceu!');
const resultado = await this.game.push<BattleResult>(new BattleScene(this.game, inimigo));
```

## Idiomas

O jogo é escrito em português, e o texto em português é a chave da tradução (estilo gettext). O catálogo `src/i18n/en.ts` traz a versão em inglês.

- `Painter.text`, `Dialog.show` e `Menu` traduzem automaticamente; textos com valores usam `I18n.t('Você recebeu {name}!', { name })`.
- Elementos HTML com `data-i18n` (ajuda, rodapé) são traduzidos por `I18n.applyDom()`.
- `pnpm i18n:check` (também no CI) falha se algum texto exibido não tiver tradução.

## Persistência

`GameState.toJSON()` gera um objeto simples (`GameStateData`), e `GameState.fromJSON()` reconstrói as instâncias de `Creature` e `Bag`. O `SaveManager` só lida com o `localStorage`, uma chave por slot.
