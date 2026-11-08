import { GameMap } from '../GameMap';
import type { Palette } from '../Character';

const pal = (hat: string, shirt: string, pants = '#404858', hair = '#583818', skin = '#f0c8a0'): Palette => ({ hat, hair, shirt, pants, skin });

/** Vila Aurora (norte) e Rota 1 (sul). A saída sul leva à Cidade Coral. */
export const VILA_AURORA = new GameMap({
  id: 'vila-aurora',
  name: 'VILA AURORA',
  music: 'vila',
  musicZones: [{ fromY: 12, music: 'rota' }],
  wild: { rowScale: { startRow: 14, base: 2, every: 6 } },
  tiles: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', // 0
    'T*..........................*T', // 1
    'T............................T', // 2
    'T............................T', // 3
    'T............................T', // 4
    'T............................T', // 5
    'T.==========================.T', // 6
    'T............===.........*...T', // 7
    'T..*.........===..~~~~~~.....T', // 8
    'T............===..~~~~~~.....T', // 9
    'T.......*....===..~~~~~~..*..T', // 10
    'T............===.............T', // 11
    'TTTTTTTTTTTTT===TTTTTTTTTTTTTT', // 12  início da ROTA 1
    'TTTTTTTTTTTTT===TTTTTTTTTTTTTT', // 13
    'T,,,,,,,,,...===...,,,,,,,,,,T', // 14
    'T,,,,,,,,,...===...,,,,,,,,,,T', // 15
    'T,,,,,,,,,...===...,,,,,,,,,,T', // 16
    'T............===.............T', // 17
    'T..TTTT......===.....TTTT....T', // 18
    'T..TTTT......===.....TTTT....T', // 19
    'T............===.............T', // 20
    'T.....,,,,,,,===,,,,,,,......T', // 21
    'T.....,,,,,,,===,,,,,,,......T', // 22
    'T.....,,,,,,,===,,,,,,,......T', // 23
    'T............===.............T', // 24
    'TTTTTTT......===.....TTTTTTTTT', // 25
    'T~~~~~T......===.....T,,,,,,,T', // 26
    'T~~~~~T......===.....T,,,,,,,T', // 27
    'T~~~~~.......===......,,,,,,,T', // 28
    'T............===.....T,,,,,,,T', // 29
    'T............===.....TTTTTTTTT', // 30
    'T,,,,,,,,,,,.===.............T', // 31
    'T,,,,,,,,,,,.===..TTTT.......T', // 32
    'T,,,,,,,,,,,.===..TTTT..*....T', // 33
    'T.......*....===.............T', // 34
    'TTTTT........===......TTTTTTTT', // 35
    'T............===.............T', // 36
    'T.,,,,,,,,,,,===,,,,,,,,,,,,.T', // 37
    'T.,,,,,,,,,,,===,,,,,,,,,,,,.T', // 38
    'T............===.............T', // 39
    'T..*.........===..........*..T', // 40
    'T............===.............T', // 41
    'TTTTTTTTTTTTT===TTTTTTTTTTTTTT', // 42
    'T............===.............T', // 43
    'T..........=======...........T', // 44
    'TTTTTTTTTTTTT===TTTTTTTTTTTTTT', // 45
    'TTTTTTTTTTTTT===TTTTTTTTTTTTTT', // 46
    'TTTTTTTTTTTTT===TTTTTTTTTTTTTT', // 47  saída para a CIDADE CORAL
  ],
  buildings: [
    { kind: 'casa', x: 2, y: 2, w: 5, h: 4, door: { x: 4, y: 5 } },
    { kind: 'laboratorio', x: 8, y: 2, w: 6, h: 4, door: { x: 10, y: 5 } },
    { kind: 'abrigo', x: 16, y: 2, w: 6, h: 4, door: { x: 18, y: 5 } },
    { kind: 'mercado', x: 23, y: 2, w: 5, h: 4, door: { x: 25, y: 5 } },
  ],
  warps: GameMap.passage([13, 14, 15], 47, { map: 'cidade-coral', dx: 0, y: 1, dir: 'down' }),
  npcs: [
    {
      id: 'prof', name: 'PROF. IPÊ', x: 8, y: 8, dir: 'down', pal: pal('#e8e8e8', '#f0f0f0', '#806848', '#a8a8a8'),
      lines: [
        'PROF. IPÊ: A grama alta da ROTA 1 esconde criaturas selvagens!',
        'Enfraqueça-as antes de usar uma CÁPSULA. Boa sorte!',
      ],
    },
    {
      id: 'lia', name: 'LIA', x: 22, y: 11, dir: 'left', pal: pal('#e86878', '#f8c0c8', '#6848a0', '#302018'),
      lines: ['LIA: No ABRIGO você cura seu time de graça. No MERCADO vendem CÁPSULAS e TÔNICOS.'],
    },
    {
      id: 't1', name: 'JOVEM TITO', x: 16, y: 17, dir: 'left', pal: pal('#f0a030', '#f8d048'), lines: [],
      trainer: { range: 4, levels: [3, 5], count: 1, reward: 160, intro: 'Ei! Você tem cara de quem quer batalhar!', defeat: 'Poxa, perdi...', after: 'Vou treinar mais na grama alta!' },
    },
    {
      id: 't2', name: 'ESCOTEIRA BIA', x: 10, y: 24, dir: 'right', pal: pal('#40a848', '#80c070', '#585030'), lines: [],
      trainer: { range: 4, levels: [4, 6], count: 2, reward: 240, intro: 'Escoteira sempre alerta! Prepare-se!', defeat: 'Que batalha!', after: 'Você leva jeito para isso.' },
    },
    {
      id: 't3', name: 'PESCADOR RUI', x: 6, y: 29, dir: 'right', pal: pal('#3868a8', '#d8c890', '#384868'), lines: [],
      trainer: { range: 7, levels: [6, 8], count: 2, reward: 320, intro: 'Os peixes não mordem hoje... então vamos batalhar!', defeat: 'Escapou do anzol!', after: 'Pescar exige paciência.' },
    },
    {
      id: 't4', name: 'ARTISTA NINA', x: 17, y: 34, dir: 'left', pal: pal('#d85898', '#f8a8c8', '#6838a0'), lines: [],
      trainer: { range: 4, levels: [7, 9], count: 2, reward: 400, intro: 'Minhas criaturas são obras de arte!', defeat: 'Ah, que pena!', after: 'Vou pintar essa batalha.' },
    },
    {
      id: 't5', name: 'VETERANO CAIO', x: 11, y: 40, dir: 'right', pal: pal('#303030', '#c83838', '#202020'), lines: [],
      trainer: { range: 4, levels: [9, 11], count: 3, reward: 700, intro: 'Só passa quem me vencer!', defeat: 'Impressionante...', after: 'Seu rival está logo adiante.' },
    },
    {
      id: 'rival', name: 'KAUÃ', x: 12, y: 44, dir: 'right', pal: pal('#383838', '#8858c8', '#383848', '#c08040'), lines: [],
      trainer: { range: 6, levels: [11, 13], count: 3, reward: 1500, rival: true, intro: 'Finalmente! Vamos ver quem escolheu a melhor criatura!', defeat: 'O quê?! Eu perdi?! ...Tudo bem, você venceu desta vez.', after: 'Da próxima vez eu ganho! A CIDADE CORAL fica logo ao sul.' },
    },
  ],
});
