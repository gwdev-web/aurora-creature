# Roteiro de implementação

[English](ROADMAP.md) | **Português**

O jogo é construído em 14 PRs de feature, cada uma com merge na `develop`, e chega ao `main` em 3 releases (v0.1.0, v0.2.0 e v1.0.0). A cada release, o GitHub Pages publica uma versão jogável.

## Fluxo Git Flow

| Branch | Sai de | Volta para | Nome | Merge |
| --- | --- | --- | --- | --- |
| `main` | — | — | fixo | só por PR de release ou hotfix |
| `develop` | `main` | `main` (via release) | fixo | só por PR |
| `feature/*` | `develop` | `develop` | `feature/nome-curto` (ou `chore/`, `fix/`, `docs/`) | squash |
| `release/*` | `develop` | `main` e `develop` | `release/0.1.0` | merge commit + tag |
| `hotfix/*` | `main` | `main` e `develop` | `hotfix/0.1.1` | merge commit + tag |

Regras de cada PR (também no `pull_request_template.md`):

- uma feature por PR, com base `develop`, título no padrão Conventional Commits;
- descrição com o que muda e como testar;
- check **build** verde antes do merge;
- toda arte, nome e personagem são originais;
- branch apagada depois do merge.

## Configuração do repositório

- Branch padrão: `develop`.
- Rulesets em `main` e `develop`: PR obrigatória, check **build** obrigatório, sem force push e sem apagar a branch.
- GitHub Pages com origem em **GitHub Actions**.
- Squash merge e merge commit ligados; branches apagadas automaticamente depois do merge.

## Features

| PR | Branch | Entrega | Release |
| --- | --- | --- | --- |
| 1 | `chore/setup-projeto` | Vite, TS, pnpm, CI, deploy, documentação | |
| 2 | `feature/bestiario` | criaturas, golpes e tabela de tipos | |
| 3 | `feature/modelo-criatura` | atributos, golpes, dano, captura, XP | |
| 4 | `feature/engine` | loop, pilha de cenas, teclado e toque | |
| — | `refactor/arquitetura-poo` | dados e regras convertidos para classes | |
| 5 | `feature/ui-dialogos-menus` | fonte, caixas, Dialog, Menu, barras, sprites | |
| 6 | `feature/titulo-e-regiao` | tela de título e escolha da região | |
| 7 | `feature/escolha-inicial` | os 3 iniciais e o início do jogo | |
| 8 | `feature/mapa` | vila, rota, movimento e colisão | v0.1.0 |
| 9 | `feature/batalha-selvagem` | encontros na grama, LUTAR e FUGIR | |
| 10 | `feature/captura-e-bolsa` | cápsulas, tônicos, animação da captura | |
| 11 | `feature/time-e-troca` | tela do time, resumo e troca em batalha | v0.2.0 |
| 12 | `feature/xp-e-evolucao` | subir de nível, aprender golpes, evoluir | |
| 13 | `feature/treinadores-e-rival` | campo de visão, batalhas, rival | |
| 14 | `feature/centro-loja-save` | cura, loja, menu, save e derrota | v1.0.0 |

### Commits de cada PR

1. `chore: configura projeto vite + typescript e ci`
2. `feat(data): bestiario, golpes e tabela de tipos`
3. `feat(core): modelo de criatura e formulas de batalha`
4. `feat(engine): loop, pilha de cenas e input`
- `refactor: arquitetura orientada a objetos` (entre a PR 4 e a PR 5)
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

A versão segue o SemVer: enquanto o jogo não estiver completo, fica em 0.x. O v1.0.0 sai quando o ciclo completo funciona (escolher, explorar, capturar, batalhar e salvar).

| Versão | Sai depois da | O que dá para fazer no site |
| --- | --- | --- |
| v0.1.0 | PR 8 | escolher a região e o inicial e andar pelo mapa |
| v0.2.0 | PR 11 | batalhar, capturar e montar o time |
| v1.0.0 | PR 14 | jogo completo: evolução, treinadores, rival, loja e save |

Passos de cada release:

```bash
git switch develop && git pull
git switch -c release/0.1.0
# atualiza version no package.json e os changelogs (CHANGELOG.md e CHANGELOG-PTBR.md)
git commit -am "chore(release): 0.1.0"
git push -u origin release/0.1.0
gh pr create --base main --title "chore(release): 0.1.0"
gh pr merge --merge                # merge commit, sem squash
git switch main && git pull
git tag -a v0.1.0 -m "v0.1.0" && git push origin v0.1.0
gh release create v0.1.0 --notes-file <trecho do changelog>
# traz o main de volta para a develop por PR (main -> develop)
gh pr create --base develop --head main --title "chore: sincroniza main na develop"
```

O deploy de produção (`deploy.yml`) roda **somente** quando o `main` recebe um merge; não há gatilho manual. O merge da release dispara o `deploy.yml`, e o site atualiza em https://gwdev-web.github.io/aurora-creature/.

Correção urgente no que já está publicado: crie `hotfix/0.1.1` a partir do `main`, abra a PR para o `main`, crie a tag `v0.1.1` e depois leve o `main` de volta para a `develop`.

## Conteúdo original

- Criaturas, golpes, tipos, personagens, cidades e rotas têm nomes próprios.
- As sprites das criaturas são geradas por código a partir de uma semente, sem arquivos de imagem.
- Nada de anúncios, doações ou venda.
