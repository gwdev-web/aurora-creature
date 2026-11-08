/** Regiões de origem: cada uma tem seu trio inicial e sua fauna preferida na grama. */
export interface Region {
  id: string;
  name: string;
  description: string;
  /** Iniciais na ordem planta, chama, água. */
  starters: [number, number, number];
  /** Criaturas selvagens (formas básicas) mais comuns nesta região. */
  wild: number[];
}

export const REGIONS: Region[] = [
  { id: 'vale', name: 'VALE AURORA', description: 'Campos verdes e rios calmos.', starters: [1, 3, 5], wild: [19, 21, 23, 34, 36, 26] },
  { id: 'costa', name: 'COSTA CORAL', description: 'Praias, recifes e ventos fortes.', starters: [7, 9, 11], wild: [21, 34, 32, 28, 38, 19] },
  { id: 'serra', name: 'SERRA BRASA', description: 'Montanhas quentes e noites escuras.', starters: [13, 15, 17], wild: [28, 30, 26, 19, 36, 32] },
];

/** Consulta das regiões de origem. */
export class Regions {
  static all(): readonly Region[] { return REGIONS; }

  static get(id: string): Region {
    return REGIONS.find((r) => r.id === id) ?? REGIONS[0];
  }
}
