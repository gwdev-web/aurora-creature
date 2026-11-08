import { Bestiary } from '../data/creatures';
import { Regions } from '../data/regions';
import { Creature } from './Creature';
import { Random } from './random';

export interface TeamSpec {
  /** Identificador do treinador (entra na semente: o time é sempre o mesmo por região). */
  id: string;
  levels: [number, number];
  count: number;
  rival?: boolean;
  /** Espécies sorteadas para o time (padrão: a fauna da região). */
  species?: number[];
  /** Time fixo [espécie, nível], usado pelos líderes. */
  team?: [number, number][];
}

/** Monta os times dos treinadores de forma determinística, a partir de uma semente. */
export class TrainerTeams {
  constructor(private readonly regionId: string, private readonly playerStarter: number) {}

  build(spec: TeamSpec): Creature[] {
    const rng = new Random(Random.hash(`${this.regionId}:${spec.id}`));
    if (spec.team?.length) return spec.team.map(([species, level]) => Creature.create(species, level, rng));
    const pool = spec.species?.length ? spec.species : Regions.get(this.regionId).wild;
    const team: Creature[] = [];
    if (spec.rival) team.push(this.evolved(this.rivalStarter(), spec.levels[1], rng));
    while (team.length < spec.count) {
      const level = rng.int(spec.levels[0], spec.levels[1]);
      team.unshift(this.evolved(rng.pick(pool), level, rng));
    }
    return team;
  }

  /** Inicial com vantagem de tipo: chama vence planta, água vence chama, planta vence água. */
  rivalStarter(): number {
    const starters = Regions.get(this.regionId).starters;
    const root = Bestiary.get(this.playerStarter).root;
    const idx = Math.max(0, starters.indexOf(root));
    return starters[(idx + 1) % 3];
  }

  private evolved(speciesId: number, level: number, rng: Random): Creature {
    return Creature.createEvolved(speciesId, level, rng);
  }
}
