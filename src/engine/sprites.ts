import { Bestiary } from '../data/creatures';
import { TYPE_INFO, type TypeId } from '../data/types';
import { Random } from '../core/random';
import type { Painter } from './ui';

/** Tamanho da grade de cada sprite, em pixels. */
export const SPRITE_SIZE = 32;
const N = SPRITE_SIZE;
const HALF = N / 2;

/** Códigos dos pixels da grade. */
export enum Px { Empty, Body, Light, Dark, Belly, Accent, Accent2, Eye, Pupil, Outline }

export type SpriteGrid = Px[][];
export type SpriteMode = 'normal' | 'white' | 'black';

interface Shape { cx: number; cy: number; rx: number; ry: number; hx: number; hy: number; hr: number; top: number; }

/**
 * Gera a grade de pixels de uma criatura. A semente é a forma básica da linha evolutiva,
 * então as evoluções mantêm o "jeito" da família e só crescem e ganham detalhes.
 */
export class CreatureSpriteBuilder {
  private grid: SpriteGrid = [];
  private shape!: Shape;
  private stage = 0;

  build(speciesId: number, back = false): SpriteGrid {
    const sp = Bestiary.get(speciesId);
    this.stage = sp.legendary ? 2.5 : sp.stage;
    this.grid = Array.from({ length: N }, () => Array<Px>(N).fill(Px.Empty));
    const rng = new Random(sp.root * 7919 + 101);
    this.buildBody(rng);
    const accRng = new Random(sp.root * 31 + 7);
    this.accent(sp.types[0], accRng, Px.Accent);
    if (sp.types[1]) this.accent(sp.types[1], accRng, Px.Accent2);
    if (!back) this.belly();
    this.shade();
    if (!back) this.eyes(rng);
    this.outline();
    return this.grid;
  }

  /** Pinta um pixel na metade esquerda e no espelho da direita. */
  private sym(x: number, y: number, v: Px) {
    const xi = Math.round(x), yi = Math.round(y);
    if (yi < 1 || yi >= N - 1 || xi < 1 || xi >= HALF) return;
    this.grid[yi][xi] = v;
    this.grid[yi][N - 1 - xi] = v;
  }

  private static ellipse(x: number, y: number, cx: number, cy: number, rx: number, ry: number) {
    const dx = (x - cx) / rx, dy = (y - cy) / ry;
    return dx * dx + dy * dy;
  }

  private buildBody(rng: Random) {
    const stage = this.stage;
    const cx = HALF - 0.5;
    const rx = 5.5 + stage * 1.8 + rng.next() * 2;
    const tall = rng.chance(0.35);
    const ry = (5 + stage * 1.6 + rng.next() * 1.5) * (tall ? 1.25 : 1);
    const bottom = N - 4;
    const cy = bottom - ry;
    const hasHead = rng.chance(0.7);
    let hr = hasHead ? 3.8 + stage * 0.9 + rng.next() * 1.5 : 0;
    let hy = hasHead ? cy - ry - hr * 0.35 : cy - ry * 0.35;
    if (hasHead && hy - hr < 7) { hr = Math.max(3, hy - 7 + hr * 0.5); hy = 7 + hr; }
    const noise = 0.25 + rng.next() * 0.25;
    for (let y = 1; y < N - 1; y++) {
      for (let x = 1; x < HALF; x++) {
        const body = CreatureSpriteBuilder.ellipse(x + 0.5, y + 0.5, cx + 0.5, cy, rx, ry);
        const head = hasHead ? CreatureSpriteBuilder.ellipse(x + 0.5, y + 0.5, cx + 0.5, hy, hr, hr * 0.92) : 9;
        const d = Math.min(body, head);
        if (d < 0.82 || (d < 1.12 && rng.chance(noise))) this.sym(x, y, Px.Body);
      }
    }
    const footX = cx - rx * 0.55;
    for (let y = bottom - 1; y <= bottom + 1; y++) for (let x = footX - 1; x <= footX + 1; x++) this.sym(x, y, Px.Body);
    this.shape = {
      cx, cy, rx, ry, hx: cx, hy: hasHead ? hy : cy - ry * 0.35, hr: hasHead ? hr : ry * 0.6,
      top: hasHead ? hy - hr : cy - ry,
    };
  }

  /** Enfeites de cada tipo (crista, barbatana, folha, orelhas, asas...). */
  private accent(type: TypeId, rng: Random, v: Px) {
    const s = this.shape;
    const big = 1 + this.stage * 0.5;
    const topY = Math.max(2, s.top);
    switch (type) {
      case 'chama': {
        const h = Math.round(3 * big + rng.next() * 2);
        for (let i = 0; i < h; i++) {
          const w = Math.max(0, Math.round((h - i) / 2.2));
          for (let dx = 0; dx <= w; dx++) this.sym(HALF - 1 - dx, topY - i + 1, v);
        }
        break;
      }
      case 'agua': {
        const len = Math.round(2 + big * 2);
        for (let i = 0; i < len; i++) for (let j = 0; j <= len - i; j++) this.sym(s.cx - s.rx - i + 1, s.cy - j + 1, v);
        break;
      }
      case 'planta': {
        const stem = Math.round(1 + big);
        for (let i = 0; i < stem; i++) this.sym(HALF - 1, topY - i, v);
        const ly = topY - stem;
        const lw = Math.round(2 + big * 1.5);
        for (let i = 0; i < lw; i++) {
          this.sym(HALF - 2 - i, ly - Math.floor(i / 2), v);
          this.sym(HALF - 2 - i, ly - Math.floor(i / 2) + 1, v);
        }
        break;
      }
      case 'faisca': {
        let x = s.hx - s.hr * 0.6, y = topY + 1;
        const steps = Math.round(3 + big * 2);
        for (let i = 0; i < steps; i++) { this.sym(x, y, v); this.sym(x - 1, y, v); y--; x += i % 2 ? 1 : -1.5; }
        break;
      }
      case 'pedra': {
        for (let i = 0; i < 3 + this.stage * 2; i++) {
          const x = s.cx - rng.next() * s.rx * 0.8, y = s.cy - s.ry * 0.6 + rng.next() * s.ry * 1.2;
          if (this.grid[Math.round(y)]?.[Math.round(x)] === Px.Body) { this.sym(x, y, Px.Dark); this.sym(x + 1, y, Px.Dark); }
        }
        for (let i = 0; i < 2 + this.stage; i++) this.sym(s.hx - 1 - i * 2, topY - (i % 2), v);
        break;
      }
      case 'vento': {
        const span = Math.round(3 + big * 2.5);
        for (let i = 0; i < span; i++) for (let j = 0; j < span - i; j++) this.sym(s.cx - s.rx * 0.6 - i, s.cy - s.ry * 0.3 - j, v);
        break;
      }
      case 'inseto': {
        const len = Math.round(3 + big * 1.5);
        const ax = s.hx - s.hr * 0.4;
        for (let i = 0; i < len; i++) this.sym(ax - i * 0.6, topY - i, Px.Outline);
        this.sym(ax - len * 0.6, topY - len, v);
        this.sym(ax - len * 0.6 - 1, topY - len, v);
        break;
      }
      case 'sombra': {
        const len = Math.round(2 + big);
        for (let i = 0; i < len; i++) this.sym(s.hx - s.hr * 0.5 - i * 0.5, topY - i + 1, v);
        break;
      }
      case 'gelo': {
        [HALF - 1, HALF - 1 - Math.round(s.hr * 0.6)].forEach((px, k) => {
          const h = Math.round((k === 0 ? 4 : 3) * big);
          for (let i = 0; i < h; i++) this.sym(px, topY - i + 1, v);
          this.sym(px - 1, topY, v);
        });
        break;
      }
      case 'comum': {
        const ex = s.hx - s.hr * 0.65;
        const r = 1.2 + big * 0.6;
        for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r) this.sym(ex + x, topY + y, v);
        break;
      }
    }
  }

  private belly() {
    const s = this.shape;
    for (let y = 0; y < N; y++) for (let x = 1; x < HALF; x++) {
      if (this.grid[y][x] !== Px.Body) continue;
      if (CreatureSpriteBuilder.ellipse(x + 0.5, y + 0.5, s.cx + 0.5, s.cy + s.ry * 0.2, s.rx * 0.55, s.ry * 0.55) < 1) this.sym(x, y, Px.Belly);
    }
  }

  private shade() {
    const g = this.grid;
    for (let y = 1; y < N - 1; y++) for (let x = 1; x < HALF; x++) {
      if (g[y][x] !== Px.Body) continue;
      if (g[y + 1][x] === Px.Empty) this.sym(x, y, Px.Dark);
      else if (g[y - 1][x] === Px.Empty && x < HALF - 2) this.sym(x, y, Px.Light);
    }
  }

  private eyes(rng: Random) {
    const s = this.shape;
    const ey = Math.round(s.hy - s.hr * 0.05);
    const ex = Math.round(s.hx - Math.max(1.5, s.hr * 0.45));
    const tall = rng.chance(0.5);
    this.sym(ex, ey, Px.Eye);
    this.sym(ex - 1, ey, Px.Eye);
    this.sym(ex, ey + 1, Px.Pupil);
    this.sym(ex - 1, ey + 1, tall ? Px.Pupil : Px.Eye);
  }

  private outline() {
    const copy = this.grid.map((r) => [...r]);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      if (copy[y][x] !== Px.Empty) continue;
      const near = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
        const v = copy[y + dy]?.[x + dx];
        return v !== undefined && v !== Px.Empty && v !== Px.Outline;
      });
      if (near) this.grid[y][x] = Px.Outline;
    }
  }
}

/** Transforma as grades em canvas (com cache) e desenha as criaturas na tela. */
export class CreatureSprites {
  private static cache = new Map<string, HTMLCanvasElement>();
  private static builder = new CreatureSpriteBuilder();

  private static palette(types: TypeId[], back: boolean): Record<Px, string | null> {
    const a = TYPE_INFO[types[0]];
    const b = TYPE_INFO[types[1] ?? types[0]];
    return {
      [Px.Empty]: null,
      [Px.Body]: back ? a.dark : a.color,
      [Px.Light]: back ? a.color : a.light,
      [Px.Dark]: a.dark,
      [Px.Belly]: '#f4ecd0',
      [Px.Accent]: types[0] === 'chama' ? '#f8d048' : a.light,
      [Px.Accent2]: types[1] ? b.color : b.light,
      [Px.Eye]: '#f8f8f8',
      [Px.Pupil]: types.includes('sombra') ? '#e03040' : '#202428',
      [Px.Outline]: '#1c2024',
    };
  }

  static canvas(speciesId: number, back = false, mode: SpriteMode = 'normal'): HTMLCanvasElement {
    const key = `${speciesId}:${back ? 'b' : 'f'}:${mode}`;
    const cached = this.cache.get(key);
    if (cached) return cached;
    const grid = this.builder.build(speciesId, back);
    const pal = this.palette(Bestiary.get(speciesId).types, back);
    const c = document.createElement('canvas');
    c.width = N;
    c.height = N;
    const ctx = c.getContext('2d')!;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const color = pal[grid[y][x]];
      if (!color) continue;
      ctx.fillStyle = mode === 'white' ? '#f8f8f8' : mode === 'black' ? '#1c2024' : color;
      ctx.fillRect(x, y, 1, 1);
    }
    this.cache.set(key, c);
    return c;
  }

  /** Desenha a criatura ancorada pelo centro da base. */
  static draw(p: Painter, speciesId: number, cx: number, bottom: number, opts: { back?: boolean; scale?: number; mode?: SpriteMode; alpha?: number } = {}) {
    const scale = opts.scale ?? 2;
    const size = N * scale;
    const ctx = p.ctx;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    if (opts.alpha !== undefined) ctx.globalAlpha = opts.alpha;
    ctx.drawImage(this.canvas(speciesId, opts.back, opts.mode), Math.round(cx - size / 2), Math.round(bottom - size), size, size);
    ctx.restore();
  }
}
