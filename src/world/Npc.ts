import type { Dir } from '../core/GameState';
import { Character, type Palette } from './Character';

export interface TrainerDef {
  range: number;
  levels: [number, number];
  count: number;
  reward: number;
  intro: string;
  defeat: string;
  after: string;
  rival?: boolean;
  /** Espécies do time (padrão: a fauna da região). */
  species?: number[];
  /** Time fixo [espécie, nível] (líderes de ginásio). */
  team?: [number, number][];
  /** Insígnia entregue ao vencer (líderes de ginásio). */
  badge?: { id: string; name: string };
}

export interface NpcDef {
  id: string;
  name: string;
  x: number;
  y: number;
  dir: Dir;
  pal: Palette;
  lines: string[];
  trainer?: TrainerDef;
}

/** Personagem não jogável: conversa e, se for treinador, desafia o jogador. */
export class Npc extends Character {
  readonly id: string;
  readonly name: string;
  readonly lines: string[];
  readonly trainer?: TrainerDef;

  constructor(def: NpcDef) {
    super(def.x, def.y, def.dir, def.pal);
    this.id = def.id;
    this.name = def.name;
    this.lines = def.lines;
    this.trainer = def.trainer;
  }
}
