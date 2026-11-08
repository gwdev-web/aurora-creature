import type { Palette } from './Character';
import { GameMap, type MapPosition } from './GameMap';
import type { NpcDef, TrainerDef } from './Npc';

export interface GymSpec {
  id: string;
  name: string;
  /** Cor do ginásio (faixas das paredes, pilastras e tapete). */
  accent: string;
  /** Para onde o tapete de saída leva (na frente da porta, na cidade). */
  exit: MapPosition;
  leader: { name: string; pal: Palette; trainer: TrainerDef };
  /** Dois treinadores no caminho até o líder. */
  trainers: [Omit<NpcDef, 'x' | 'y' | 'dir' | 'lines'>, Omit<NpcDef, 'x' | 'y' | 'dir' | 'lines'>];
}

/** Monta o interior de um ginásio: salão com pilastras, dois treinadores e o líder no fundo. */
export class GymFactory {
  private static readonly TILES = [
    'WWWWWWWWWWWW',
    'WFFFFFFFFFFW',
    'WFFFFFFFFFFW',
    'WFPFFFFFFPFW',
    'WFFFFFFFFFFW',
    'WFPFFFFFFPFW',
    'WFFFFFFFFFFW',
    'WFPFFFFFFPFW',
    'WFFFFFFFFFFW',
    'WFPFFFFFFPFW',
    'WFFFFFFFFFFW',
    'WFPFFFFFFPFW',
    'WFFFFFFFFFFW',
    'WFFFFFFFFFFW',
    'WFFFFFFFFFFW',
    'WWWWWEEWWWWW',
  ];

  /** Onde o jogador aparece ao entrar. */
  static entrance(id: string): MapPosition { return { map: id, x: 5, y: 14, dir: 'up' }; }

  static build(spec: GymSpec): GameMap {
    const [t1, t2] = spec.trainers;
    return new GameMap({
      id: spec.id,
      name: spec.name,
      theme: 'ginasio',
      accent: spec.accent,
      music: 'ginasio',
      tiles: GymFactory.TILES,
      warps: [5, 6].map((x) => ({ x, y: 15, to: spec.exit })),
      npcs: [
        { ...t1, x: 8, y: 10, dir: 'left', lines: [] },
        { ...t2, x: 3, y: 6, dir: 'right', lines: [] },
        { id: `${spec.id}-lider`, name: spec.leader.name, x: 5, y: 2, dir: 'down', pal: spec.leader.pal, lines: [], trainer: spec.leader.trainer },
      ],
    });
  }
}
