import { MoveBook, type MoveData } from '../data/moves';
import { TypeChart } from '../data/types';
import type { Creature } from './Creature';
import { Random } from './random';

export interface DamageResult { damage: number; mult: number; crit: boolean; }
export interface CatchResult { caught: boolean; shakes: number; }

/** Regras de batalha: dano, precisão, ordem dos turnos, captura e experiência. */
export class BattleRules {
  /** Golpe usado quando a criatura não tem mais PP. */
  static readonly STRUGGLE = 'investida';

  constructor(private readonly rng: Random = Random.shared) {}

  /** Nível, poder, ataque/defesa, mesmo tipo (×1,5), eficácia, crítico (×2) e variação de 85% a 100%. */
  damage(attacker: Creature, defender: Creature, moveId: string, force?: { crit?: boolean; roll?: number }): DamageResult {
    const move = MoveBook.get(moveId);
    const mult = TypeChart.effect(move.type, defender.types);
    if (mult === 0) return { damage: 0, mult, crit: false };
    const physical = move.category === 'fisico';
    const atk = physical ? attacker.stats.atk : attacker.stats.spa;
    const def = physical ? defender.stats.def : defender.stats.spd;
    const crit = force?.crit ?? this.rng.chance(1 / 16);
    const roll = force?.roll ?? this.rng.int(85, 100);
    let dmg = Math.floor(Math.floor((Math.floor((2 * attacker.level) / 5 + 2) * move.power * atk) / def) / 50) + 2;
    if (attacker.types.includes(move.type)) dmg = Math.floor(dmg * 1.5);
    dmg = Math.floor(dmg * mult);
    if (crit) dmg *= 2;
    dmg = Math.floor((dmg * roll) / 100);
    return { damage: Math.max(1, dmg), mult, crit };
  }

  hits(move: MoveData) { return this.rng.next() * 100 < move.accuracy; }

  /** Quem age primeiro: prioridade do golpe, depois velocidade (empate no sorteio). Sem golpe = troca/item, que vem antes. */
  firstToAct(a: Creature, aMove: string | null, b: Creature, bMove: string | null): 'a' | 'b' {
    const pa = aMove ? MoveBook.get(aMove).priority ?? 0 : 6;
    const pb = bMove ? MoveBook.get(bMove).priority ?? 0 : 6;
    if (pa !== pb) return pa > pb ? 'a' : 'b';
    if (a.stats.spe !== b.stats.spe) return a.stats.spe > b.stats.spe ? 'a' : 'b';
    return this.rng.chance(0.5) ? 'a' : 'b';
  }

  /** Captura: quanto menor o HP e maior a taxa da espécie, mais fácil. Até 3 balanços antes de prender. */
  tryCatch(target: Creature, ballBonus: number): CatchResult {
    const max = target.stats.hp;
    const a = Math.floor(((3 * max - 2 * target.hp) * target.data.catchRate * ballBonus) / (3 * max));
    if (a >= 255) return { caught: true, shakes: 3 };
    const b = Math.floor(1048560 / Math.sqrt(Math.sqrt(16711680 / Math.max(1, a))));
    let shakes = 0;
    for (let i = 0; i < 4; i++) {
      if (this.rng.next() * 65536 >= b) return { caught: false, shakes: Math.min(3, shakes) };
      shakes++;
    }
    return { caught: true, shakes: 3 };
  }

  /** Chance de fugir de uma batalha selvagem. */
  canEscape(runner: Creature, enemy: Creature, attempts: number) {
    const odds = Math.floor((runner.stats.spe * 128) / Math.max(1, enemy.stats.spe)) + 30 * attempts;
    return odds > 255 || this.rng.int(0, 255) < odds;
  }

  /** Experiência ganha ao derrotar uma criatura (×1,5 contra treinador). */
  expGain(defeated: Creature, trainer: boolean): number {
    const base = Math.floor((defeated.data.baseExp * defeated.level) / 7);
    return Math.max(1, Math.floor(base * (trainer ? 1.5 : 1)));
  }
}
