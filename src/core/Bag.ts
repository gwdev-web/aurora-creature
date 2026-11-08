import { ITEMS, ITEM_ORDER, type ItemData, type ItemId } from './items';

/** Bolsa do jogador: quantidade de cada item. */
export class Bag {
  private readonly counts: Record<ItemId, number>;

  constructor(initial: Partial<Record<ItemId, number>> = {}) {
    this.counts = { capsula: 0, supercapsula: 0, tonico: 0, supertonico: 0, ...initial };
  }

  count(id: ItemId) { return this.counts[id] ?? 0; }

  add(id: ItemId, amount = 1) { this.counts[id] = this.count(id) + amount; }

  /** Gasta um item; devolve false se não houver. */
  use(id: ItemId): boolean {
    if (this.count(id) <= 0) return false;
    this.counts[id]--;
    return true;
  }

  /** Itens com quantidade maior que zero, opcionalmente filtrados. */
  entries(filter: (item: ItemData) => boolean = () => true): { item: ItemData; count: number }[] {
    return ITEM_ORDER.filter((id) => this.count(id) > 0 && filter(ITEMS[id])).map((id) => ({ item: ITEMS[id], count: this.count(id) }));
  }

  toJSON(): Record<ItemId, number> { return { ...this.counts }; }
}
