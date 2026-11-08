import type { GameMap, MapPosition } from './GameMap';
import { VILA_AURORA } from './maps/vilaAurora';
import { CIDADE_CORAL } from './maps/cidadeCoral';
import { ROTA_2 } from './maps/rota2';
import { VILA_BRASA } from './maps/vilaBrasa';
import { ROTA_3 } from './maps/rota3';
import { PICO_GELADO } from './maps/picoGelado';
import { GINASIO_BRASA, GINASIO_CORAL, GINASIO_PICO } from './maps/ginasios';

/** Todos os mapas do mundo, por id. */
export class MapRegistry {
  private static readonly maps = new Map<string, GameMap>(
    [VILA_AURORA, CIDADE_CORAL, ROTA_2, VILA_BRASA, ROTA_3, PICO_GELADO, GINASIO_CORAL, GINASIO_BRASA, GINASIO_PICO].map((m) => [m.id, m]),
  );

  /** Onde o jogo novo começa: na frente do laboratório. */
  static readonly NEW_GAME: MapPosition = { map: 'vila-aurora', x: 10, y: 6, dir: 'down' };
  /** Ponto de retorno padrão: na frente do Abrigo da Vila Aurora. */
  static readonly DEFAULT_RESPAWN: MapPosition = { map: 'vila-aurora', x: 18, y: 6, dir: 'down' };

  static get(id: string): GameMap {
    return this.maps.get(id) ?? VILA_AURORA;
  }

  static register(map: GameMap) { this.maps.set(map.id, map); }

  static all(): GameMap[] { return [...this.maps.values()]; }
}
