# Aurora Creature

[English](README.md) | **Português**

Jogo 2D de exploração, captura e batalha por turnos com **criaturas originais**, feito em **TypeScript** e **Canvas 2D**. Projeto de estudo, sem fins comerciais ([sobre](https://gwdev-web.github.io/aurora-creature/sobre.html)).

Toda a arte é desenhada por código, e as músicas e os efeitos sonoros são sintetizados no navegador.

**Jogar:** https://gwdev-web.github.io/aurora-creature/

## O jogo

- Escolha uma de 3 regiões e uma das 3 criaturas iniciais dela.
- Explore vilas e rotas; a grama alta esconde criaturas selvagens.
- Batalhas por turnos com 10 tipos, precisão, PP, golpes críticos e eficácia.
- Capture criaturas, monte um time de até 6, ganhe experiência, aprenda golpes e evolua.
- Enfrente treinadores, um rival e 3 líderes de ginásio.
- Abrigo, Mercado, menu START e save automático em 3 slots.
- Jogável em português e inglês, no teclado ou no toque.

## Como rodar

Requisitos: Node 22+ e [pnpm](https://pnpm.io) (com o corepack, rode `corepack enable`).

```bash
pnpm install
pnpm dev         # servidor local em http://localhost:5173
pnpm build       # checa os tipos e gera a pasta dist/
pnpm preview     # serve o build
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

## Documentação

- [Arquitetura](docs/ARCHITECTURE-PTBR.md)
- [Changelog](CHANGELOG-PTBR.md)
- [Convenções do repositório](CLAUDE-PTBR.md)

## Créditos

Fonte [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P), de CodeMan38, sob a SIL Open Font License, via `@fontsource`.

## Licença e aviso legal

Licenciado sob a [PolyForm Noncommercial License 1.0.0](LICENSE): livre para estudo e qualquer outro uso não comercial. Componentes de terceiros, como a fonte acima, mantêm as próprias licenças.

O Aurora Creature é um projeto de estudo independente. Não tem afiliação, endosso ou patrocínio de nenhuma empresa, editora ou franquia de jogos. Todas as marcas pertencem aos respectivos donos. Para pedir a remoção de qualquer conteúdo, [abra uma issue](https://github.com/gwdev-web/aurora-creature/issues).
