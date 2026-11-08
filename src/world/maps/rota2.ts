import { GameMap } from '../GameMap';
import type { Palette } from '../Character';

const pal = (hat: string, shirt: string, pants = '#404858', hair = '#583818', skin = '#f0c8a0'): Palette => ({ hat, hair, shirt, pants, skin });

/** Rota 2: liga a Cidade Coral (oeste) à Vila Brasa (leste). */
export const ROTA_2 = new GameMap({
  id: 'rota-2',
  name: 'ROTA 2',
  music: 'rota',
  tiles: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', // 0
    'T...........TT.............TT..............T', // 1
    'T..,,,,,,,..TT.............TT.,,,,,,,,,....T', // 2
    'T..,,,,,,,..TT..~~~~~~~~...TT.,,,,,,,,,....T', // 3
    'T..,,,,,,,..TT..~~~~~~~~...TT.,,,,,,,,,....T', // 4
    'T..,,,,,,,..TT..~~~~~~~~...TT.,,,,,,,,,....T', // 5
    'T..,,,,,,,..TT..~~~~~~~~...TT.,,,,,,,,,....T', // 6
    'T...........TT.............TT.,,,,,,,,,....T', // 7
    'T.*......................*.................T', // 8
    '============================================', // 9
    '============================================', // 10
    'T..............*..,,,,,,,,..............*..T', // 11
    'T...........TT................TTTT.,,,,,,,.T', // 12
    'T..,,,,,,,..TT..,,,,,,,,,,,...TTTT.,,,,,,,.T', // 13
    'T..,,,,,,,..TT..,,,,,,,,,,,...TTTT.,,,,,,,.T', // 14
    'T..,,,,,,,..TT..,,,,,,,,,,,...TTTT.,,,,,,,.T', // 15
    'T..,,,,,,,..TT..,,,,,,,,,,,...TTTT.,,,,,,,.T', // 16
    'T..,,,,,,,..TT..,,,,,,,,,,,...TTTT.,,,,,,,.T', // 17
    'T...........TT................TTTT.........T', // 18
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', // 19
  ],
  wild: { levels: [10, 15], extra: [41, 47, 26, 21] },
  warps: [
    ...GameMap.sidePassage(0, [9, 10], { map: 'cidade-coral', x: 28, dy: 6, dir: 'left' }),
    ...GameMap.sidePassage(43, [9, 10], { map: 'vila-brasa', x: 1, dy: 3, dir: 'right' }),
  ],
  npcs: [
    {
      id: 'r2-t1', name: 'NADADOR LUCAS', x: 6, y: 8, dir: 'down', pal: pal('#3878c8', '#f8f8f0', '#3878c8'), lines: [],
      trainer: { range: 2, levels: [11, 13], count: 2, reward: 440, intro: 'A praia ficou pra trás, mas a batalha não!', defeat: 'Fiquei sem fôlego...', after: 'Vou nadar um pouco para relaxar.' },
    },
    {
      id: 'r2-t2', name: 'CAMPISTA DUDA', x: 18, y: 11, dir: 'up', pal: pal('#58a050', '#c8a060', '#585030'), lines: [],
      trainer: { range: 2, levels: [12, 14], count: 2, reward: 480, intro: 'Montei minha barraca aqui só para batalhar!', defeat: 'Acampamento desmontado...', after: 'A VILA BRASA fica a leste.' },
    },
    {
      id: 'r2-t3', name: 'OBSERVADORA LU', x: 29, y: 8, dir: 'down', pal: pal('#e8e8e8', '#a8d8f0', '#506878'), lines: [],
      trainer: { range: 2, levels: [12, 14], count: 2, reward: 520, intro: 'Estava observando você desde a lagoa!', defeat: 'Anotado: você é forte.', after: 'Os ventos aqui trazem BRISINHAS.' },
    },
    {
      id: 'r2-t4', name: 'MOTOQUEIRO ZÉ', x: 38, y: 11, dir: 'up', pal: pal('#202020', '#383838', '#202020'), lines: [],
      trainer: { range: 2, levels: [13, 15], count: 3, reward: 640, intro: 'Ninguém passa sem me enfrentar!', defeat: 'Que velocidade!', after: 'Cuidado com a lava na VILA BRASA.' },
    },
  ],
});
