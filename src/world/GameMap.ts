import type { Dir, Position } from '../core/GameState';
import type { TrackId } from '../engine/audio/tracks';
import type { NpcDef } from './Npc';

export type BuildingKind = 'casa' | 'laboratorio' | 'abrigo' | 'mercado' | 'ginasio';

export interface Building {
  kind: BuildingKind;
  x: number;
  y: number;
  w: number;
  h: number;
  door: { x: number; y: number };
  /** Nome na placa (ginásios). */
  label?: string;
  /** Mapa interno para onde a porta leva (ginásios). */
  to?: MapPosition;
}

/** Posição num mapa específico. */
export interface MapPosition extends Position { map: string; }

/** Tile que leva para outro mapa quando o jogador pisa nele. */
export interface Warp { x: number; y: number; to: MapPosition; }

/** Visual do cenário: o mesmo tile muda de cor e forma conforme o tema. */
export type MapTheme = 'campo' | 'vulcao' | 'neve' | 'ginasio';

/** Encontros na grama alta deste mapa. */
export interface WildDef {
  /** Faixa de níveis fixa... */
  levels?: [number, number];
  /** ...ou nível crescendo com a linha do mapa (usado na Rota 1). */
  rowScale?: { startRow: number; base: number; every: number };
  /** Espécies típicas do mapa, além das da região. */
  extra?: number[];
}

export interface MapDef {
  id: string;
  name: string;
  theme?: MapTheme;
  /** Cor dominante do interior (ginásios). */
  accent?: string;
  music: TrackId;
  /** Trocas de música a partir de uma linha (por exemplo, da vila para a rota). */
  musicZones?: { fromY: number; music: TrackId }[];
  tiles: string[];
  buildings?: Building[];
  npcs?: NpcDef[];
  warps?: Warp[];
  wild?: WildDef;
}

export const DIRS: Record<Dir, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 }, down: { dx: 0, dy: 1 }, left: { dx: -1, dy: 0 }, right: { dx: 1, dy: 0 },
};

/**
 * Mapa em grade de tiles. Legenda:
 *  T árvore   ~ água/lava/gelo   r rocha   W parede   P pilastra   (sólidos)
 *  . chão   , grama alta (encontros)   = caminho   * flores   s areia   F piso   E tapete de saída
 * Os prédios são desenhados por cima (lista `buildings`) e também são sólidos.
 */
export class GameMap {
  static readonly TILE = 16;
  private static readonly SOLID = new Set(['T', '~', 'r', 'W', 'P']);

  readonly id: string;
  readonly name: string;
  readonly theme: MapTheme;
  readonly accent: string;
  readonly width: number;
  readonly height: number;
  readonly tiles: string[];
  readonly buildings: Building[];
  readonly npcs: NpcDef[];
  readonly warps: Warp[];
  readonly wild?: WildDef;
  private readonly music: TrackId;
  private readonly musicZones: { fromY: number; music: TrackId }[];

  constructor(def: MapDef) {
    this.id = def.id;
    this.name = def.name;
    this.theme = def.theme ?? 'campo';
    this.accent = def.accent ?? '#2f8f7f';
    this.width = Math.max(...def.tiles.map((r) => r.length));
    this.height = def.tiles.length;
    this.tiles = def.tiles.map((r) => r.padEnd(this.width, 'T'));
    this.buildings = def.buildings ?? [];
    this.npcs = def.npcs ?? [];
    this.warps = def.warps ?? [];
    this.wild = def.wild;
    this.music = def.music;
    this.musicZones = [...(def.musicZones ?? [])].sort((a, b) => b.fromY - a.fromY);
  }

  get pixelWidth() { return this.width * GameMap.TILE; }
  get pixelHeight() { return this.height * GameMap.TILE; }

  musicAt(y: number): TrackId {
    return this.musicZones.find((z) => y >= z.fromY)?.music ?? this.music;
  }

  tileAt(x: number, y: number) { return this.tiles[y]?.[x] ?? 'T'; }

  buildingAt(x: number, y: number) {
    return this.buildings.find((b) => x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h);
  }

  /** Prédio cuja porta fica neste tile. */
  doorAt(x: number, y: number) { return this.buildings.find((b) => b.door.x === x && b.door.y === y); }

  /** Abrigo do mapa (para virar ponto de retorno ao curar). */
  get shelter() { return this.buildings.find((b) => b.kind === 'abrigo'); }

  warpAt(x: number, y: number) { return this.warps.find((w) => w.x === x && w.y === y); }

  isSolid(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return true;
    return GameMap.SOLID.has(this.tileAt(x, y)) || !!this.buildingAt(x, y);
  }

  isTallGrass(x: number, y: number) { return this.tileAt(x, y) === ','; }

  /** Gera os warps de uma passagem de vários tiles (mesmo deslocamento para todos). */
  static passage(xs: number[], y: number, to: { map: string; dx: number; y: number; dir: Dir }): Warp[] {
    return xs.map((x) => ({ x, y, to: { map: to.map, x: x + to.dx, y: to.y, dir: to.dir } }));
  }

  /** Passagem vertical (borda esquerda/direita). */
  static sidePassage(x: number, ys: number[], to: { map: string; x: number; dy: number; dir: Dir }): Warp[] {
    return ys.map((y) => ({ x, y, to: { map: to.map, x: to.x, y: y + to.dy, dir: to.dir } }));
  }
}
