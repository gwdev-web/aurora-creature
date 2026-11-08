import { H, W } from '../Game';

/**
 * Verificador de layout (só em desenvolvimento): guarda as caixas desenhadas no frame e avisa
 * quando um texto sai da caixa em que começa ou da tela. Os avisos ficam em `window.__layout`.
 */
export class LayoutCheck {
  static enabled = import.meta.env.DEV;
  private static boxes: [number, number, number, number][] = [];
  private static seen = new Set<string>();

  static beginFrame() { LayoutCheck.boxes = []; }

  /** Desenha sem verificar (cenário que pode sair da tela de propósito). */
  static skip(draw: () => void) {
    const was = LayoutCheck.enabled;
    LayoutCheck.enabled = false;
    try { draw(); } finally { LayoutCheck.enabled = was; }
  }

  static box(x: number, y: number, w: number, h: number) {
    if (LayoutCheck.enabled) LayoutCheck.boxes.push([x, y, w, h]);
  }

  static text(str: string, x: number, y: number, width: number, size: number, align: CanvasTextAlign) {
    if (!LayoutCheck.enabled || !str.trim()) return;
    const left = align === 'center' ? x - width / 2 : align === 'right' ? x - width : x;
    const right = left + width;
    // Texto totalmente fora da tela (por exemplo, placas do mapa longe da câmera) não aparece.
    if (right <= 0 || left >= W || y + size <= 0 || y >= H) return;
    const problems: string[] = [];
    if (left < 0 || right > W || y < 0 || y + size > H) problems.push('fora da tela');
    for (let i = LayoutCheck.boxes.length - 1; i >= 0; i--) {
      const [bx, by, bw, bh] = LayoutCheck.boxes[i];
      if (x < bx || x > bx + bw || y < by || y > by + bh) continue;
      if (left < bx + 4 || right > bx + bw - 4) problems.push(`largura (caixa ${bx},${by} ${bw}x${bh}, texto ${Math.round(left)}..${Math.round(right)})`);
      if (y + size > by + bh - 3) problems.push(`altura (caixa ${bx},${by} ${bw}x${bh}, texto y=${y})`);
      break;
    }
    if (!problems.length) return;
    const msg = `[layout] "${str}" em ${Math.round(x)},${Math.round(y)}: ${problems.join('; ')}`;
    if (LayoutCheck.seen.has(msg)) return;
    LayoutCheck.seen.add(msg);
    console.warn(msg);
    ((window as unknown as { __layout?: string[] }).__layout ??= []).push(msg);
  }
}
