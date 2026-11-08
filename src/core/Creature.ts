import { Bestiary, type BaseStats, type Species } from '../data/creatures';
import { MoveBook } from '../data/moves';
import type { TypeId } from '../data/types';
import { Random } from './random';

export type Stats = BaseStats;

export interface MoveSlot { id: string; pp: number; maxPp: number; }

/** Formato salvo no localStorage. */
export interface CreatureData {
  uid: string;
  species: number;
  level: number;
  exp: number;
  hp: number;
  ivs: Stats;
  moves: MoveSlot[];
}

let uidCounter = 0;
const newUid = () => `${Date.now().toString(36)}-${(uidCounter++).toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;

/** Uma criatura do jogador ou de um adversário. */
export class Creature {
  static readonly MAX_LEVEL = 100;
  static readonly MAX_MOVES = 4;

  readonly uid: string;
  species: number;
  level: number;
  /** Experiência total acumulada. */
  exp: number;
  hp: number;
  readonly ivs: Stats;
  moves: MoveSlot[];
  stats: Stats;

  private constructor(data: CreatureData) {
    this.uid = data.uid;
    this.species = data.species;
    this.level = data.level;
    this.exp = data.exp;
    this.ivs = { ...data.ivs };
    this.moves = data.moves.map((m) => ({ ...m }));
    this.stats = this.computeStats();
    this.hp = Math.min(data.hp, this.stats.hp);
  }

  /** Cria uma criatura nova com IVs sorteados e os golpes do nível. */
  static create(speciesId: number, level: number, rng: Random = Random.shared): Creature {
    const sp = Bestiary.get(speciesId);
    const iv = () => rng.int(0, 31);
    const ivs: Stats = { hp: iv(), atk: iv(), def: iv(), spa: iv(), spd: iv(), spe: iv() };
    const c = new Creature({
      uid: newUid(), species: sp.id, level, exp: Creature.expForLevel(level), hp: Infinity, ivs,
      moves: Creature.movesAt(sp, level),
    });
    c.hp = c.stats.hp;
    return c;
  }

  /** Cria a criatura já na forma certa para o nível (segue a linha evolutiva). */
  static createEvolved(speciesId: number, level: number, rng: Random = Random.shared): Creature {
    let id = speciesId;
    for (let evo = Bestiary.get(id).evolvesTo; evo && level >= evo.level; evo = Bestiary.get(id).evolvesTo) id = evo.id;
    return Creature.create(id, level, rng);
  }

  static fromJSON(data: CreatureData): Creature { return new Creature(data); }

  toJSON(): CreatureData {
    return { uid: this.uid, species: this.species, level: this.level, exp: this.exp, hp: this.hp, ivs: { ...this.ivs }, moves: this.moves.map((m) => ({ ...m })) };
  }

  /** Curva de experiência cúbica: o nível n precisa de n³ pontos no total. */
  static expForLevel(level: number) { return level ** 3; }

  /** Os últimos 4 golpes que a espécie aprende até o nível dado. */
  static movesAt(sp: Species, level: number): MoveSlot[] {
    const ids = sp.learnset.filter(([lv]) => lv <= level).map(([, id]) => id);
    return ids.slice(-Creature.MAX_MOVES).map((id) => Creature.slot(id));
  }

  static slot(id: string): MoveSlot {
    const pp = MoveBook.get(id).pp;
    return { id, pp, maxPp: pp };
  }

  get data(): Species { return Bestiary.get(this.species); }
  get name(): string { return this.data.name; }
  get types(): TypeId[] { return this.data.types; }
  get isFainted() { return this.hp <= 0; }
  get hpRatio() { return this.hp / this.stats.hp; }
  get hasUsableMoves() { return this.moves.some((m) => m.pp > 0); }

  /** Fórmula de atributos a partir da base, dos IVs e do nível. */
  private computeStats(): Stats {
    const b = this.data.base;
    const ivs = this.ivs;
    const level = this.level;
    const other = (base: number, iv: number) => Math.floor(((2 * base + iv) * level) / 100) + 5;
    return {
      hp: Math.floor(((2 * b.hp + ivs.hp) * level) / 100) + level + 10,
      atk: other(b.atk, ivs.atk),
      def: other(b.def, ivs.def),
      spa: other(b.spa, ivs.spa),
      spd: other(b.spd, ivs.spd),
      spe: other(b.spe, ivs.spe),
    };
  }

  /** Recalcula os atributos (depois de subir de nível ou evoluir) mantendo o dano sofrido. */
  recalcStats() {
    const lost = this.stats.hp - this.hp;
    this.stats = this.computeStats();
    this.hp = this.hp <= 0 ? 0 : Math.max(1, this.stats.hp - lost);
  }

  takeDamage(amount: number) { this.hp = Math.max(0, this.hp - amount); }

  /** Recupera HP e devolve quanto curou. */
  restoreHp(amount: number): number {
    const before = this.hp;
    this.hp = Math.min(this.stats.hp, this.hp + amount);
    return this.hp - before;
  }

  /** Cura total de HP e PP. */
  heal() {
    this.hp = this.stats.hp;
    for (const mv of this.moves) mv.pp = mv.maxPp;
  }

  /** Experiência que falta para o próximo nível. */
  get expToNext() { return this.level >= Creature.MAX_LEVEL ? 0 : Creature.expForLevel(this.level + 1) - this.exp; }

  /** Fração da barra de EXP preenchida no nível atual (0 a 1). */
  expRatio(exp = this.exp) {
    if (this.level >= Creature.MAX_LEVEL) return 1;
    const lo = Creature.expForLevel(this.level), hi = Creature.expForLevel(this.level + 1);
    return Math.max(0, Math.min(1, (exp - lo) / (hi - lo)));
  }

  /** Soma experiência e sobe quantos níveis couberem. Devolve os níveis alcançados. */
  gainExp(amount: number): number[] {
    const levels: number[] = [];
    this.exp += amount;
    while (this.level < Creature.MAX_LEVEL && this.exp >= Creature.expForLevel(this.level + 1)) {
      this.level++;
      levels.push(this.level);
      // Ao subir de nível, o HP máximo cresce e o ganho também entra no HP atual.
      const before = this.stats.hp;
      this.recalcStats();
      if (!this.isFainted) this.hp = Math.min(this.stats.hp, this.hp + Math.max(0, this.stats.hp - before));
    }
    return levels;
  }

  /** Golpes que a espécie aprende exatamente neste nível e que ainda não conhece. */
  newMovesAt(level = this.level): string[] {
    return this.data.learnset.filter(([lv, id]) => lv === level && !this.moves.some((m) => m.id === id)).map(([, id]) => id);
  }

  /** Índice do golpe mais fraco (menor poder). */
  weakestMoveIndex(): number {
    let idx = 0;
    this.moves.forEach((m, i) => { if (MoveBook.get(m.id).power < MoveBook.get(this.moves[idx].id).power) idx = i; });
    return idx;
  }

  /**
   * Aprende um golpe. Com 4 golpes, troca o mais fraco se o novo for mais forte.
   * Devolve o nome do golpe esquecido, `true` se só aprendeu, ou `false` se não aprendeu.
   */
  learnMove(id: string): string | boolean {
    if (this.moves.some((m) => m.id === id)) return false;
    if (this.moves.length < Creature.MAX_MOVES) {
      this.moves.push(Creature.slot(id));
      return true;
    }
    const weakest = this.weakestMoveIndex();
    const old = MoveBook.get(this.moves[weakest].id);
    if (MoveBook.get(id).power <= old.power) return false;
    this.moves[weakest] = Creature.slot(id);
    return old.name;
  }

  /** Espécie para a qual a criatura pode evoluir agora, ou null. */
  evolutionTarget(): number | null {
    const evo = this.data.evolvesTo;
    return evo && this.level >= evo.level && !this.isFainted ? evo.id : null;
  }

  /** Evolui para a próxima forma, recalculando os atributos. */
  evolve(): boolean {
    const target = this.evolutionTarget();
    if (target === null) return false;
    const before = this.stats.hp;
    this.species = target;
    this.recalcStats();
    this.hp = Math.min(this.stats.hp, this.hp + Math.max(0, this.stats.hp - before));
    return true;
  }

  usePp(moveId: string) {
    const slot = this.moves.find((m) => m.id === moveId);
    if (slot && slot.pp > 0) slot.pp--;
  }
}
