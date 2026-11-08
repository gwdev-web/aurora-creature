import type { Input } from './Input';
import { I18n } from '../i18n/I18n';
import type { SfxId } from './audio/sfx';

/** Ponte entre os componentes de interface e o áudio (o Game liga na inicialização). */
export class UiSound {
  static play: (id: SfxId) => void = () => {};
}
import { W } from './Game';
import { LayoutCheck } from './debug/LayoutCheck';

export const FONT = '"Press Start 2P", monospace';
export const FONT_SIZE = 6;

export const COLORS = {
  ink: '#30383c',
  inkShadow: '#c8d4d0',
  light: '#f8f8f0',
  lightShadow: '#506068',
  accent: '#d8783a',
};

export type BoxStyle = 'dialog' | 'menu' | 'battle';

const BOX: Record<BoxStyle, [string, string, string]> = {
  dialog: ['#244850', '#7ec8b8', '#f8f8f0'],
  menu: ['#244850', '#a8d8e0', '#f8f8f0'],
  battle: ['#18282c', '#d8783a', '#244850'],
};

/** Desenha os elementos básicos da interface (texto, caixas, barras, setas) num contexto 2D. */
export class Painter {
  constructor(readonly ctx: CanvasRenderingContext2D) {}

  setFont(size = FONT_SIZE) {
    this.ctx.font = `${size}px ${FONT}`;
    this.ctx.textBaseline = 'top';
  }

  /**
   * A fonte pixelada encolhe as maiúsculas acentuadas para caber o acento na célula. Por isso a letra
   * é desenhada sem acento (`fixCaps`) e o acento é desenhado à parte, em pixels, por cima dela.
   */
  static fixCaps(str: string) {
    return str.replace(/[À-ÖØ-Þ]/g, (c) => c.normalize('NFD')[0]);
  }

  /** Pixels de cada acento, em unidades da fonte (1/8 do tamanho), relativos ao topo da letra. */
  private static readonly ACCENTS: Record<string, [number, number][]> = {
    '\u0301': [[4, -3], [3, -2]],
    '\u0300': [[2, -3], [3, -2]],
    '\u0302': [[3, -3], [2, -2], [4, -2]],
    '\u0303': [[1, -2], [2, -3], [3, -3], [4, -2], [5, -3]],
    '\u0308': [[1, -2], [5, -2]],
    '\u0327': [[3, 7], [4, 8], [2, 9], [3, 9]],
  };

  /** Desenha os acentos das maiúsculas acentuadas de `str`, que começa em `left`. */
  private accents(str: string, left: number, y: number, size: number, color: string) {
    const unit = size / 8;
    [...str].forEach((c, i) => {
      if (!/[À-ÖØ-Þ]/.test(c)) return;
      const pixels = Painter.ACCENTS[c.normalize('NFD')[1] ?? ''];
      if (!pixels) return;
      this.ctx.fillStyle = color;
      for (const [px, py] of pixels) this.ctx.fillRect(left + i * size + px * unit, y + py * unit, unit, unit);
    });
  }

  /** Texto com sombra de 1 pixel lógico (2/3 na escala interna). Passa pelo catálogo de traduções. */
  text(raw: string, x: number, y: number, color = COLORS.ink, shadow: string | null = COLORS.inkShadow, size = FONT_SIZE, align: CanvasTextAlign = 'left') {
    this.textRaw(I18n.t(raw), x, y, color, shadow, size, align);
  }

  /** Igual a `text`, mas sem traduzir (para texto que já vem traduzido, como o do diálogo). */
  textRaw(str: string, x: number, y: number, color = COLORS.ink, shadow: string | null = COLORS.inkShadow, size = FONT_SIZE, align: CanvasTextAlign = 'left') {
    const ctx = this.ctx;
    const s = Painter.fixCaps(str);
    this.setFont(size);
    const width = ctx.measureText(s).width;
    const left = align === 'center' ? x - width / 2 : align === 'right' || align === 'end' ? x - width : x;
    const marked = s !== str;
    ctx.textAlign = align;
    if (shadow) {
      ctx.fillStyle = shadow;
      ctx.fillText(s, x + 0.67, y + 0.67);
      if (marked) this.accents(str, left + 0.67, y + 0.67, size, shadow);
    }
    ctx.fillStyle = color;
    ctx.fillText(s, x, y);
    if (marked) this.accents(str, left, y, size, color);
    ctx.textAlign = 'left';
    if (LayoutCheck.enabled && ctx.getTransform().e === 0 && ctx.getTransform().f === 0) LayoutCheck.text(s, x, y, width, size, align);
  }

  measure(str: string, size = FONT_SIZE) {
    return this.measureRaw(I18n.t(str), size);
  }

  /** Largura sem traduzir (usada na quebra de linha, que recebe o texto já traduzido). */
  private measureRaw(str: string, size = FONT_SIZE) {
    this.setFont(size);
    return this.ctx.measureText(Painter.fixCaps(str)).width;
  }

  /** Quebra o texto em linhas que cabem em `maxWidth`. `\n` força nova linha. */
  wrap(str: string, maxWidth: number, size = FONT_SIZE): string[] {
    const out: string[] = [];
    for (const paragraph of str.split('\n')) {
      let line = '';
      for (const word of paragraph.split(' ')) {
        const test = line ? `${line} ${word}` : word;
        if (this.measureRaw(test, size) > maxWidth && line) {
          out.push(line);
          line = word;
        } else line = test;
      }
      out.push(line);
    }
    return out;
  }

  rect(x: number, y: number, w: number, h: number, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, w, h);
  }

  /** Caixa com borda arredondada em pixel art. */
  box(x: number, y: number, w: number, h: number, style: BoxStyle = 'menu') {
    const [outer, mid, inner] = BOX[style];
    LayoutCheck.box(x, y, w, h);
    this.rect(x + 1, y, w - 2, h, outer);
    this.rect(x, y + 1, w, h - 2, outer);
    this.rect(x + 2, y + 1, w - 4, h - 2, mid);
    this.rect(x + 1, y + 2, w - 2, h - 4, mid);
    this.rect(x + 3, y + 3, w - 6, h - 6, inner);
  }

  static hpColor(ratio: number) {
    return ratio > 0.5 ? '#58d888' : ratio > 0.2 ? '#f0c828' : '#f05838';
  }

  /** Barra de progresso (HP, EXP). */
  bar(x: number, y: number, w: number, ratio: number, color: string, label?: string) {
    if (label) this.text(label, x - 13, y - 1, COLORS.accent, null, 5);
    this.rect(x - 1, y - 1, w + 2, 5, '#3c5058');
    this.rect(x, y, w, 3, '#f8f8f0');
    this.rect(x, y, Math.max(0, Math.round(w * Math.max(0, Math.min(1, ratio)))), 3, color);
  }

  /** Seta de seleção apontando para a direita. */
  arrow(x: number, y: number, color = COLORS.ink) {
    for (let i = 0; i < 4; i++) this.rect(x + i, y + i, 1, 7 - i * 2, color);
  }

  /** Seta de seleção apontando para baixo. */
  arrowDown(x: number, y: number, color = COLORS.ink) {
    for (let i = 0; i < 4; i++) this.rect(x + i, y + i, 7 - i * 2, 1, color);
  }
}

/** Caixa de diálogo com efeito de digitação e páginas de 2 linhas. `show` resolve quando o jogador confirma. */
export class Dialog {
  active = false;
  /** Mantém o texto visível depois de fechar (por exemplo, enquanto um menu está aberto). */
  lingering = false;
  private pages: string[][] = [];
  private page = 0;
  private chars = 0;
  private resolve?: () => void;
  private autoClose = 0;
  private timer = 0;

  show(p: Painter, msg: string, opts: { auto?: number; linger?: boolean; width?: number } = {}): Promise<void> {
    const lines = p.wrap(I18n.t(msg), opts.width ?? W - 30);
    this.pages = [];
    for (let i = 0; i < lines.length; i += 2) this.pages.push(lines.slice(i, i + 2));
    this.page = 0;
    this.chars = 0;
    this.active = true;
    this.lingering = !!opts.linger;
    this.autoClose = opts.auto ?? 0;
    this.timer = 0;
    return new Promise((r) => { this.resolve = r; });
  }

  update(dt: number, input: Input) {
    if (!this.active) return;
    const total = this.pages[this.page].join('').length;
    if (this.chars < total) {
      this.chars += dt * 70;
      if (input.justPressed('a') || input.justPressed('b')) {
        this.chars = total;
        input.consume();
      }
      return;
    }
    if (this.autoClose) {
      this.timer += dt;
      if (this.timer < this.autoClose) return;
    } else if (!(input.justPressed('a') || input.justPressed('b'))) return;
    input.consume();
    if (this.page < this.pages.length - 1) {
      this.page++;
      this.chars = 0;
      this.timer = 0;
      return;
    }
    this.active = false;
    const r = this.resolve;
    this.resolve = undefined;
    r?.();
  }

  /** Esconde o texto que estava "pendurado" com `linger`. */
  clear() { this.lingering = false; }

  render(p: Painter, time: number, style: BoxStyle = 'dialog') {
    if ((!this.active && !this.lingering) || !this.pages.length) return;
    const y = 112;
    p.box(0, y, W, 48, style);
    const lines = this.pages[this.page];
    let left = this.active ? Math.floor(this.chars) : Infinity;
    const color = style === 'battle' ? COLORS.light : COLORS.ink;
    const shadow = style === 'battle' ? COLORS.lightShadow : COLORS.inkShadow;
    lines.forEach((ln, i) => {
      const shown = ln.slice(0, Math.max(0, left));
      left -= ln.length;
      p.textRaw(shown, 12, y + 12 + i * 14, color, shadow);
    });
    const total = lines.join('').length;
    if (this.active && !this.autoClose && this.chars >= total && Math.floor(time * 3) % 2 === 0) {
      const c = style === 'battle' ? COLORS.light : COLORS.accent;
      p.rect(W - 18, y + 36, 6, 2, c);
      p.rect(W - 17, y + 38, 4, 1, c);
      p.rect(W - 16, y + 39, 2, 1, c);
    }
  }
}

export interface MenuOpts {
  x?: number; y?: number; w?: number; cols?: number; cancelable?: boolean; rowH?: number;
  /** Valores alinhados à direita em cada linha (preço, quantidade). */
  values?: string[];
}

/** Menu navegável. `open` resolve com o índice escolhido (ou -1 se cancelado com B). */
export class Menu {
  active = false;
  options: string[] = [];
  index = 0;
  opts: Required<MenuOpts> = { x: 0, y: 0, w: 100, cols: 1, cancelable: true, rowH: 14, values: [] };
  private resolve?: (i: number) => void;

  open(options: string[], opts: MenuOpts = {}, start = 0): Promise<number> {
    this.options = options;
    this.index = Math.max(0, Math.min(start, options.length - 1));
    const cols = opts.cols ?? 1;
    const rowH = opts.rowH ?? 14;
    const rows = Math.ceil(options.length / cols);
    const w = opts.w ?? 100;
    this.opts = {
      x: opts.x ?? W - w, y: opts.y ?? Math.max(0, 112 - (rows * rowH + 14)), w, cols,
      cancelable: opts.cancelable ?? true, rowH, values: opts.values ?? [],
    };
    this.active = true;
    return new Promise((r) => { this.resolve = r; });
  }

  get height() { return Math.ceil(this.options.length / this.opts.cols) * this.opts.rowH + 14; }

  update(input: Input) {
    if (!this.active) return;
    const { cols } = this.opts;
    const n = this.options.length;
    const before = this.index;
    if (input.justPressed('up') && this.index - cols >= 0) this.index -= cols;
    else if (input.justPressed('down') && this.index + cols < n) this.index += cols;
    else if (cols > 1 && input.justPressed('left') && this.index % cols > 0) this.index--;
    else if (cols > 1 && input.justPressed('right') && this.index % cols < cols - 1 && this.index + 1 < n) this.index++;
    else if (input.justPressed('a')) { UiSound.play('confirm'); this.finish(this.index, input); }
    else if (input.justPressed('b') && this.opts.cancelable) { UiSound.play('cancel'); this.finish(-1, input); }
    if (this.index !== before) UiSound.play('cursor');
  }

  private finish(i: number, input: Input) {
    input.consume();
    this.active = false;
    const r = this.resolve;
    this.resolve = undefined;
    r?.(i);
  }

  render(p: Painter, drawBox = true, color = COLORS.ink) {
    if (!this.active) return;
    const { x, y, w, cols, rowH, values } = this.opts;
    if (drawBox) p.box(x, y, w, this.height, 'menu');
    const colW = (w - 16) / cols;
    this.options.forEach((opt, i) => {
      const cx = x + 10 + (i % cols) * colW;
      const cy = y + 8 + Math.floor(i / cols) * rowH;
      if (i === this.index) p.arrow(cx, cy - 0.5, color);
      const shadow = color === COLORS.ink ? COLORS.inkShadow : COLORS.lightShadow;
      p.text(opt, cx + 7, cy, color, shadow);
      if (values[i]) p.text(values[i], cx + colW - 6, cy, color, shadow, FONT_SIZE, 'right');
    });
  }
}
