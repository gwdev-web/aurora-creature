import { GameMap } from '../GameMap';
import type { Palette } from '../Character';

const pal = (hat: string, shirt: string, pants = '#404858', hair = '#583818', skin = '#f0c8a0'): Palette => ({ hat, hair, shirt, pants, skin });

/** Rota 3: subida da Vila Brasa (sul) até o Pico Gelado (norte). */
export const ROTA_3 = new GameMap({
  id: 'rota-3',
  name: 'ROTA 3',
  theme: 'neve',
  music: 'rota',
  tiles: [
    'TTTTTTTTTTTTT===TTTTTTTTTTTTTT', // 0
    'T............===.............T', // 1
    'T............===.............T', // 2
    'T..,,,,,,,,,.===.,,,,,,,,,,..T', // 3
    'T..,,,,,,,,,.===.,,,,,,,,,,..T', // 4
    'T..,,,,,,,,,.===.,,,,,,,,,,..T', // 5
    'T..,,,,,,,,,.===.,,,,,,,,,,..T', // 6
    'T............===.............T', // 7
    'T............===.............T', // 8
    'Trrrrrrrrrr..===..rrrrrrrrrrrT', // 9
    'T............===.............T', // 10
    'T............===.............T', // 11
    'T.r..........===..........r..T', // 12
    'T............===.............T', // 13
    'T,,,,,,,,,,,.===.,,,,,,,,,,,,T', // 14
    'T,,,,,,,,,,,.===.,,,,,,,,,,,,T', // 15
    'T,,,,,,,,,,,.===.,,,,,,,,,,,,T', // 16
    'T,,,,,,,,,,,.===.,,,,,,,,,,,,T', // 17
    'T............===.............T', // 18
    'T............===.............T', // 19
    'Trrrrr.......===......rrrrrrrT', // 20
    'Trrrrr.......===......rrrrrrrT', // 21
    'T......r.....===.............T', // 22
    'T............===.............T', // 23
    'T...,,,,,,,,.===.,,,,,,,,,...T', // 24
    'T...,,,,,,,,.===.,,,,,,,,,...T', // 25
    'T...,,,,,,,,.===.,,,,,,,,,...T', // 26
    'T...,,,,,,,,.===.,,,,,,,,,...T', // 27
    'T...,,,,,,,,.===.,,,,,,,,,...T', // 28
    'T............===.......r.....T', // 29
    'T............===.............T', // 30
    'Trrrrrrrrrrr.===.rrrrrrrrrrrrT', // 31
    'T............===.............T', // 32
    'T............===.............T', // 33
    'T,,,,,,,,,...===...,,,,,,,,,,T', // 34
    'T,,,,,,,,,...===...,,,,,,,,,,T', // 35
    'T,,,,,,,,,...===...,,,,,,,,,,T', // 36
    'T,,,,,,,,,...===...,,,,,,,,,,T', // 37
    'T............===.............T', // 38
    'TTTTTTTTTTTTT===TTTTTTTTTTTTTT', // 39
  ],
  wild: { levels: [17, 22], extra: [32, 45, 47, 28] },
  warps: [
    ...GameMap.passage([13, 14, 15], 39, { map: 'vila-brasa', dx: 0, y: 1, dir: 'down' }),
    ...GameMap.passage([13, 14, 15], 0, { map: 'pico-gelado', dx: 0, y: 22, dir: 'up' }),
  ],
  npcs: [
    {
      id: 'r3-t1', name: 'ALPINISTA RITA', x: 12, y: 33, dir: 'right', pal: pal('#d84858', '#f8a030', '#384050'), lines: [],
      trainer: { range: 3, levels: [17, 19], count: 2, reward: 760, intro: 'A subida é dura. A batalha, mais ainda!', defeat: 'Escorreguei...', after: 'O PICO GELADO está lá em cima.' },
    },
    {
      id: 'r3-t2', name: 'ESQUIADOR BETO', x: 16, y: 26, dir: 'left', pal: pal('#3878c8', '#e8f0f8', '#283848'), lines: [],
      trainer: { range: 3, levels: [18, 20], count: 2, reward: 820, intro: 'Desci a montanha só para te enfrentar!', defeat: 'Caí da prancha!', after: 'Na neve as criaturas de GELO ficam fortes.' },
    },
    {
      id: 'r3-t3', name: 'MONGE TOMÉ', x: 12, y: 18, dir: 'right', pal: pal('#c88830', '#e8b048', '#a06820', '#302018'), lines: [],
      trainer: { range: 3, levels: [19, 21], count: 3, reward: 900, intro: 'Meditei por dias esperando um desafio.', defeat: 'Aceito a derrota em paz.', after: 'O equilíbrio vem do treino.' },
    },
    {
      id: 'r3-t4', name: 'GUARDA-PARQUE ÍRIS', x: 16, y: 11, dir: 'left', pal: pal('#58a050', '#a8c878', '#405030'), lines: [],
      trainer: { range: 3, levels: [20, 22], count: 3, reward: 980, intro: 'Só passa quem provar que cuida bem das criaturas!', defeat: 'Você cuida bem delas.', after: 'Boa sorte com o líder BÓREAS.' },
    },
  ],
});
