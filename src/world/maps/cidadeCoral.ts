import { GameMap } from '../GameMap';
import { GymFactory } from '../GymFactory';
import type { Palette } from '../Character';

const pal = (hat: string, shirt: string, pants = '#404858', hair = '#583818', skin = '#f0c8a0'): Palette => ({ hat, hair, shirt, pants, skin });

/** Cidade Coral: cidade de praia ao sul da Rota 1, com o primeiro ginásio. */
export const CIDADE_CORAL = new GameMap({
  id: 'cidade-coral',
  name: 'CIDADE CORAL',
  music: 'vila',
  tiles: [
    'TTTTTTTTTTTTT===TTTTTTTTTTTTTT', // 0
    'T............===.............T', // 1
    'T.*..........===...........*.T', // 2
    'T............===.............T', // 3
    'T............===.............T', // 4
    'T............===.............T', // 5
    'T............===.............T', // 6
    'T............===.............T', // 7
    'T.==========================.T', // 8
    'T............===.............T', // 9
    'T............................T', // 10
    'T........*...................T', // 11
    'T....................*.......T', // 12
    'T............................T', // 13
    'T............................T', // 14
    'T.============================', // 15
    'T............................T', // 16
    'T............................T', // 17
    'T............................T', // 18
    'T.*........................*.T', // 19
    'T............................T', // 20
    'T...........*................T', // 21
    'T............................T', // 22
    'TssssssssssssssssssssssssssssT', // 23
    'TssssssssssssssssssssssssssssT', // 24
    'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~T', // 25
    'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~T', // 26
    'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~T', // 27
    'T~~~~~~~~~~~~~~~~~~~~~~~~~~~~T', // 28
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', // 29
  ],
  buildings: [
    { kind: 'abrigo', x: 3, y: 3, w: 6, h: 4, door: { x: 5, y: 6 } },
    { kind: 'mercado', x: 20, y: 3, w: 5, h: 4, door: { x: 22, y: 6 } },
    { kind: 'ginasio', x: 10, y: 10, w: 9, h: 5, door: { x: 14, y: 14 }, label: 'GINÁSIO', to: GymFactory.entrance('ginasio-coral') },
    { kind: 'casa', x: 3, y: 17, w: 5, h: 4, door: { x: 5, y: 20 } },
    { kind: 'casa', x: 21, y: 17, w: 5, h: 4, door: { x: 23, y: 20 } },
  ],
  warps: [
    ...GameMap.passage([13, 14, 15], 0, { map: 'vila-aurora', dx: 0, y: 46, dir: 'up' }),
    ...GameMap.sidePassage(29, [15], { map: 'rota-2', x: 1, dy: -6, dir: 'right' }),
  ],
  npcs: [
    {
      id: 'coral-pescador', name: 'PESCADOR', x: 8, y: 23, dir: 'down', pal: pal('#3868a8', '#d8c890', '#384868'),
      lines: ['PESCADOR: O mar de CORAL é calmo, mas as criaturas daqui adoram ÁGUA.'],
    },
    {
      id: 'coral-moca', name: 'CAMILA', x: 24, y: 10, dir: 'left', pal: pal('#58c8d8', '#f8f0a8', '#4868a8', '#c08040'),
      lines: ['CAMILA: A líder MARINA treina criaturas de ÁGUA. Leve algo de PLANTA ou FAÍSCA!', 'A ROTA 2 fica a leste, depois da cidade.'],
    },
  ],
});
