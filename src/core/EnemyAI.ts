import { MoveBook } from '../data/moves';
import { TypeChart } from '../data/types';
import type { Creature } from './Creature';
import { Random } from './random';

/** IA simples: escolhe entre os golpes com PP, com peso maior no dano esperado. */
export class EnemyAI {
  constructor(private readonly rng: Random = Random.shared) {}

  chooseMove(self: Creature, target: Creature): string | null {
    const usable = self.moves.filter((m) => m.pp > 0);
    if (!usable.length) return null;
    const weights = usable.map((slot) => {
      const mv = MoveBook.get(slot.id);
      const eff = TypeChart.effect(mv.type, target.types);
      const stab = self.types.includes(mv.type) ? 1.5 : 1;
      return Math.max(0.1, mv.power * eff * stab * (mv.accuracy / 100)) ** 1.5;
    });
    let r = this.rng.next() * weights.reduce((s, w) => s + w, 0);
    for (let i = 0; i < usable.length; i++) {
      r -= weights[i];
      if (r <= 0) return usable[i].id;
    }
    return usable[usable.length - 1].id;
  }
}
