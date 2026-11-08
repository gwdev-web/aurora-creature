import type { Dir } from '../core/GameState';
import { DIRS, GameMap } from './GameMap';

export interface Palette { hat: string; hair: string; shirt: string; pants: string; skin: string; }

/** Personagem que anda em grade, um tile por vez, com animação entre os tiles. */
export class Character {
  /** Tiles por segundo. */
  speed = 4.5;
  moving = false;
  /** Progresso do passo atual, de 0 a 1. */
  progress = 0;
  /** Alterna o pé a cada passo. */
  step = 0;
  private fromX = 0;
  private fromY = 0;

  constructor(public x: number, public y: number, public dir: Dir, public palette: Palette) {}

  /** Tile à frente do personagem. */
  get facing() {
    const d = DIRS[this.dir];
    return { x: this.x + d.dx, y: this.y + d.dy };
  }

  startMove(dir: Dir) {
    this.dir = dir;
    this.fromX = this.x;
    this.fromY = this.y;
    this.x += DIRS[dir].dx;
    this.y += DIRS[dir].dy;
    this.moving = true;
    this.progress = 0;
    this.step++;
  }

  /** Avança a animação; devolve true no frame em que o passo termina. */
  updateMove(dt: number): boolean {
    if (!this.moving) return false;
    this.progress += dt * this.speed;
    if (this.progress < 1) return false;
    this.progress = 0;
    this.moving = false;
    return true;
  }

  /** Posição em pixels (interpolada durante o passo). */
  get pixel() {
    const T = GameMap.TILE;
    if (!this.moving) return { x: this.x * T, y: this.y * T };
    return {
      x: (this.fromX + (this.x - this.fromX) * this.progress) * T,
      y: (this.fromY + (this.y - this.fromY) * this.progress) * T,
    };
  }

  /** Quadro da animação: 0 parado, 1 ou 2 com um dos pés à frente. */
  get frame() {
    if (!this.moving || this.progress < 0.25 || this.progress > 0.75) return 0;
    return this.step % 2 ? 1 : 2;
  }
}
