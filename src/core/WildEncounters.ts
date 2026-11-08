import { Bestiary } from '../data/creatures';
import { Regions } from '../data/regions';
import { Creature } from './Creature';
import { Random } from './random';

/** O que o sorteio precisa saber do mapa (o core não depende da camada world). */
export interface EncounterArea {
  id: string;
  wild?: {
    levels?: [number, number];
    rowScale?: { startRow: number; base: number; every: number };
    extra?: number[];
  };
}

/** Sorteia encontros na grama alta: fauna da região + espécies típicas do mapa, sem iniciais e sem lendárias. */
export class WildEncounters {
  static readonly CHANCE = 0.1;

  private readonly regional: number[];
  private readonly others: number[];
  private readonly pools = new Map<string, number[]>();

  constructor(regionId: string, private readonly rng: Random = Random.shared) {
    this.regional = Regions.get(regionId).wild;
    this.others = Bestiary.all()
      .filter((s) => s.id > 18 && s.stage === 0 && !s.legendary && !this.regional.includes(s.id))
      .map((s) => s.id);
  }

  private pool(area: EncounterArea): number[] {
    let pool = this.pools.get(area.id);
    if (!pool) {
      const extra = area.wild?.extra ?? [];
      // Região e espécies do mapa aparecem 3 vezes mais que as demais.
      pool = [...this.regional, ...this.regional, ...this.regional, ...extra, ...extra, ...extra, ...this.others];
      this.pools.set(area.id, pool);
    }
    return pool;
  }

  levelFor(area: EncounterArea, row: number) {
    const w = area.wild;
    if (w?.levels) return this.rng.int(w.levels[0], w.levels[1]);
    const scale = w?.rowScale ?? { startRow: 0, base: 2, every: 6 };
    const base = scale.base + Math.floor(Math.max(0, row - scale.startRow) / scale.every);
    return Math.max(2, base + this.rng.int(-1, 1));
  }

  /** Devolve uma criatura selvagem ou null (sem encontro neste passo). */
  roll(area: EncounterArea, row: number): Creature | null {
    if (!this.rng.chance(WildEncounters.CHANCE)) return null;
    const level = this.levelFor(area, row);
    const species = this.rng.pick(this.pool(area));
    // Em níveis altos, metade das criaturas já aparece evoluída.
    return this.rng.chance(0.5) ? Creature.createEvolved(species, level, this.rng) : Creature.create(species, level, this.rng);
  }
}
