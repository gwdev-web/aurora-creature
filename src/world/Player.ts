import type { Dir, Position } from '../core/GameState';
import type { Input } from '../engine/Input';
import { Character, type Palette } from './Character';

const PLAYER_PALETTE: Palette = { hat: '#d8783a', hair: '#3c2818', shirt: '#2f8f7f', pants: '#30384c', skin: '#f0c8a0' };
const ORDER: Dir[] = ['up', 'down', 'left', 'right'];

/** O jogador: lê o direcional, vira no lugar com toque rápido e anda segurando. */
export class Player extends Character {
  /** Tempo segurando a direção depois de virar; passa de TURN_DELAY e começa a andar. */
  private holdTime = 0;
  private static readonly TURN_DELAY = 0.09;
  /** Depois de um evento, só volta a andar quando o jogador solta a direção. */
  private needRelease = false;

  constructor(pos: Position) {
    super(pos.x, pos.y, pos.dir, PLAYER_PALETTE);
  }

  /** Direção que o jogador quer andar neste frame, ou null. Vira no lugar se for uma direção nova. */
  wantedMove(dt: number, input: Input): Dir | null {
    const held = ORDER.find((d) => input.isDown(d));
    if (!held) {
      this.holdTime = 0;
      this.needRelease = false;
      return null;
    }
    if (this.needRelease) return null;
    if (held !== this.dir) {
      this.dir = held;
      this.holdTime = 0;
      return null;
    }
    this.holdTime += dt;
    return this.holdTime >= Player.TURN_DELAY ? held : null;
  }

  /** Reinicia o atraso de virar e espera soltar a direção (depois de um diálogo ou evento). */
  resetHold() {
    this.holdTime = 0;
    this.needRelease = true;
  }

  /** Coloca o jogador numa posição (por exemplo, ao voltar para o Abrigo). */
  teleport(pos: Position) {
    this.x = pos.x;
    this.y = pos.y;
    this.dir = pos.dir;
    this.moving = false;
  }

  get position(): Position { return { x: this.x, y: this.y, dir: this.dir }; }
}
