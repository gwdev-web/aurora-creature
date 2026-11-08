export type ItemId = 'capsula' | 'supercapsula' | 'tonico' | 'supertonico';

export interface ItemData {
  id: ItemId;
  name: string;
  price: number;
  description: string;
  /** Multiplicador de captura (cápsulas). */
  ball?: number;
  /** HP recuperado (tônicos). */
  heal?: number;
}

export const ITEMS: Record<ItemId, ItemData> = {
  capsula: { id: 'capsula', name: 'CÁPSULA', price: 200, ball: 1, description: 'Prende uma criatura selvagem.' },
  supercapsula: { id: 'supercapsula', name: 'SUPERCÁPSULA', price: 600, ball: 1.5, description: 'Captura com mais facilidade.' },
  tonico: { id: 'tonico', name: 'TÔNICO', price: 300, heal: 20, description: 'Recupera 20 de HP.' },
  supertonico: { id: 'supertonico', name: 'SUPERTÔNICO', price: 700, heal: 50, description: 'Recupera 50 de HP.' },
};

export const ITEM_ORDER: ItemId[] = ['capsula', 'supercapsula', 'tonico', 'supertonico'];
