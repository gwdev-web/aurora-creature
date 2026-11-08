import { GameMap } from '../GameMap';
import { GymFactory } from '../GymFactory';
import type { Palette } from '../Character';

const pal = (hat: string, shirt: string, pants = '#404858', hair = '#583818', skin = '#f0c8a0'): Palette => ({ hat, hair, shirt, pants, skin });

/** Vila Brasa: vila vulcânica com o segundo ginásio. */
export const VILA_BRASA = new GameMap({
  id: 'vila-brasa',
  name: 'VILA BRASA',
  theme: 'vulcao',
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
    'T........*...===....*........T', // 10
    'T............===.............T', // 11
    '=============================T', // 12
    'T.~~~~~......===.......~~~~~.T', // 13
    'T.~~~~~......===.......~~~~~.T', // 14
    'T.~~~~~......===.......~~~~~.T', // 15
    'T.~~~~~......===.......~~~~~.T', // 16
    'T............===.............T', // 17
    'T............===.............T', // 18
    'T............===.............T', // 19
    'T............===.............T', // 20
    'T.==========================.T', // 21
    'T............................T', // 22
    'TTTTTTTTTTTTTTTTTTTTTTTTTTTTTT', // 23
  ],
  buildings: [
    { kind: 'abrigo', x: 3, y: 3, w: 6, h: 4, door: { x: 5, y: 6 } },
    { kind: 'mercado', x: 21, y: 3, w: 5, h: 4, door: { x: 23, y: 6 } },
    { kind: 'ginasio', x: 17, y: 17, w: 8, h: 4, door: { x: 21, y: 20 }, label: 'GINÁSIO', to: GymFactory.entrance('ginasio-brasa') },
    { kind: 'casa', x: 3, y: 17, w: 5, h: 4, door: { x: 5, y: 20 } },
  ],
  warps: [
    ...GameMap.sidePassage(0, [12], { map: 'rota-2', x: 42, dy: -3, dir: 'left' }),
    ...GameMap.passage([13, 14, 15], 0, { map: 'rota-3', dx: 0, y: 38, dir: 'up' }),
  ],
  npcs: [
    {
      id: 'brasa-velho', name: 'SEU JOAQUIM', x: 10, y: 10, dir: 'down', pal: pal('#a05030', '#d8b890', '#605040', '#d8d8d8'),
      lines: ['SEU JOAQUIM: Não chegue perto da lava! Só as criaturas de CHAMA aguentam esse calor.', 'A líder IARA é a mais esquentada da região.'],
    },
  ],
});
