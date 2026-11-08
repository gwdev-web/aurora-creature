import type { TypeId } from './types';

export type MoveCategory = 'fisico' | 'especial';

export interface MoveData {
  id: string;
  name: string;
  type: TypeId;
  power: number;
  accuracy: number;
  pp: number;
  category: MoveCategory;
  priority?: number;
}

const m = (id: string, name: string, type: TypeId, power: number, accuracy: number, pp: number, category: MoveCategory, priority = 0): MoveData =>
  ({ id, name, type, power, accuracy, pp, category, priority });

/** Todos os golpes são de dano, para manter a batalha simples. */
export const MOVES: Record<string, MoveData> = Object.fromEntries([
  m('investida', 'INVESTIDA', 'comum', 40, 100, 35, 'fisico'),
  m('arranhao', 'ARRANHÃO', 'comum', 40, 100, 35, 'fisico'),
  m('bote', 'BOTE', 'comum', 40, 100, 30, 'fisico', 1),
  m('pancada', 'PANCADA', 'comum', 70, 100, 20, 'fisico'),
  m('brasa', 'TIÇÃO', 'chama', 40, 100, 25, 'especial'),
  m('labareda', 'LABAREDA', 'chama', 65, 100, 15, 'especial'),
  m('fogareu', 'FOGARÉU', 'chama', 90, 100, 15, 'especial'),
  m('jato', 'JATO', 'agua', 40, 100, 25, 'especial'),
  m('bolhas', 'BOLHAS', 'agua', 55, 100, 25, 'especial'),
  m('maremoto', 'MAREMOTO', 'agua', 90, 100, 15, 'especial'),
  m('cipo', 'CIPÓ', 'planta', 45, 100, 25, 'fisico'),
  m('folha-navalha', 'FOLHA CORTE', 'planta', 60, 95, 25, 'fisico'),
  m('seiva-solar', 'SEIVA SOLAR', 'planta', 90, 100, 15, 'especial'),
  m('choque', 'CHOQUE', 'faisca', 40, 100, 30, 'especial'),
  m('centelha', 'CENTELHA', 'faisca', 65, 100, 20, 'fisico'),
  m('relampago', 'RELÂMPAGO', 'faisca', 90, 100, 15, 'especial'),
  m('pedrada', 'PEDRADA', 'pedra', 50, 90, 15, 'fisico'),
  m('avalanche', 'AVALANCHE', 'pedra', 75, 90, 10, 'fisico'),
  m('lufada', 'LUFADA', 'vento', 40, 100, 35, 'especial'),
  m('asa-corte', 'ASA CORTE', 'vento', 60, 100, 30, 'fisico'),
  m('ciclone', 'CICLONE', 'vento', 85, 95, 15, 'especial'),
  m('ferroada', 'FERROADA', 'inseto', 40, 100, 35, 'fisico'),
  m('zumbido', 'ZUMBIDO', 'inseto', 70, 100, 20, 'especial'),
  m('mordida-breu', 'DENTE BREU', 'sombra', 60, 100, 25, 'fisico'),
  m('pulso-breu', 'PULSO BREU', 'sombra', 80, 100, 15, 'especial'),
  m('vulto', 'VULTO', 'sombra', 40, 100, 30, 'fisico', 1),
  m('garoa-gelada', 'GAROA FRIA', 'gelo', 40, 100, 25, 'especial'),
  m('cristal', 'CRISTAL', 'gelo', 65, 95, 20, 'especial'),
  m('nevasca', 'NEVASCA', 'gelo', 90, 90, 10, 'especial'),
].map((mv) => [mv.id, mv]));

/** Catálogo de golpes. */
export class MoveBook {
  static get(id: string): MoveData {
    const mv = MOVES[id];
    if (!mv) throw new Error(`Golpe desconhecido: ${id}`);
    return mv;
  }
}
