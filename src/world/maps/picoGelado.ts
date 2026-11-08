import { GameMap } from '../GameMap';
import { GymFactory } from '../GymFactory';
import type { Palette } from '../Character';

const pal = (hat: string, shirt: string, pants = '#404858', hair = '#583818', skin = '#f0c8a0'): Palette => ({ hat, hair, shirt, pants, skin });

/** Pico Gelado: vila no alto da montanha com o terceiro ginásio. */
export const PICO_GELADO = new GameMap({
  id: 'pico-gelado',
  name: 'PICO GELADO',
  theme: 'neve',
  music: 'vila',
  tiles: [
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', // 0
    'T............................T', // 1
    'T.r........................r.T', // 2
    'T............................T', // 3
    'T............................T', // 4
    'T............................T', // 5
    'T............................T', // 6
    'T............===.............T', // 7
    'T............===.............T', // 8
    'T............===.............T', // 9
    'T............===.............T', // 10
    'T............===.............T', // 11
    'T.==========================.T', // 12
    'T............===.............T', // 13
    'T............===.............T', // 14
    'T..........r.===.............T', // 15
    'T..~~~~~~~...===.............T', // 16
    'T..~~~~~~~...===.....rrrrrr..T', // 17
    'T..~~~~~~~...===.....rrrrrr..T', // 18
    'T..~~~~~~~...===.....rrrrrr..T', // 19
    'T............===.............T', // 20
    'T............===..r..........T', // 21
    'T............===.............T', // 22
    'TTTTTTTTTTTTT===TTTTTTTTTTTTTT', // 23
  ],
  buildings: [
    { kind: 'abrigo', x: 3, y: 3, w: 6, h: 4, door: { x: 5, y: 6 } },
    { kind: 'ginasio', x: 10, y: 1, w: 9, h: 5, door: { x: 14, y: 5 }, label: 'GINÁSIO', to: GymFactory.entrance('ginasio-pico') },
    { kind: 'mercado', x: 21, y: 3, w: 5, h: 4, door: { x: 23, y: 6 } },
  ],
  warps: [
    ...GameMap.passage([13, 14, 15], 23, { map: 'rota-3', dx: 0, y: 1, dir: 'down' }),
  ],
  npcs: [
    {
      id: 'pico-sabia', name: 'SÁBIA NAIR', x: 18, y: 14, dir: 'left', pal: pal('#8858c8', '#c8b8e8', '#483868', '#e8e8e8'),
      lines: ['SÁBIA NAIR: Dizem que AURORIS pinta o céu do norte com as asas...', 'Quem conquistar as 3 insígnias talvez um dia a encontre.'],
    },
  ],
});
