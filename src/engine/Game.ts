import { Input } from './Input';
import { Painter, UiSound } from './ui';
import { LayoutCheck } from './debug/LayoutCheck';
import { AudioManager } from './audio/AudioManager';
import { I18n } from '../i18n/I18n';
import type { GameState } from '../core/GameState';
import { SaveManager } from '../core/SaveManager';

/** Resolução lógica da tela. */
export const W = 240;
export const H = 160;
/** Escala interna do canvas, para o texto ficar nítido. */
export const SCALE = 3;

/** Base de todas as telas: cada cena atualiza a lógica e se desenha a cada frame. */
export abstract class Scene {
  constructor(protected readonly game: Game) {}
  abstract update(dt: number): void;
  abstract render(p: Painter): void;
  /** Chamado quando a cena entra na pilha. */
  onEnter(): void {}
}

interface StackEntry { scene: Scene; resolve?: (value: unknown) => void; }

/** Loop principal e pilha de cenas. `push` devolve uma Promise resolvida quando a cena sai com `pop`. */
export class Game {
  readonly ctx: CanvasRenderingContext2D;
  readonly painter: Painter;
  readonly input = new Input();
  state: GameState | null = null;
  readonly saves = new SaveManager();
  readonly audio = new AudioManager();
  /** Slot de save da partida atual (1 a 3). */
  slot = 1;
  private stack: StackEntry[] = [];
  /** Tempo total em segundos, usado nas animações. */
  time = 0;

  constructor(canvas: HTMLCanvasElement) {
    canvas.width = W * SCALE;
    canvas.height = H * SCALE;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D indisponível');
    ctx.imageSmoothingEnabled = false;
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    this.ctx = ctx;
    this.painter = new Painter(ctx);
    UiSound.play = (id) => this.audio.sfx(id);
    // O navegador só libera o som depois de uma interação.
    const unlock = () => this.audio.unlock();
    window.addEventListener('keydown', unlock);
    window.addEventListener('pointerdown', unlock);
    // M liga e desliga o som; o botão da página faz o mesmo.
    const muteBtn = document.getElementById('mute');
    const touchMute = document.querySelectorAll<HTMLElement>('[data-mute]');
    const syncMute = () => {
      if (muteBtn) muteBtn.textContent = I18n.t(this.audio.muted ? 'SOM: DESLIGADO' : 'SOM: LIGADO');
      touchMute.forEach((el) => { el.textContent = I18n.t('SOM'); el.classList.toggle('off', this.audio.muted); });
    };
    const toggle = () => { this.audio.unlock(); this.audio.toggleMute(); syncMute(); };
    touchMute.forEach((el) => el.addEventListener('pointerdown', (e) => { e.preventDefault(); toggle(); }));
    window.addEventListener('keydown', (e) => { if (e.key === 'm' || e.key === 'M') toggle(); });
    muteBtn?.addEventListener('click', toggle);
    syncMute();
    I18n.onChange(syncMute);
    // Textos da página (ajuda e rodapé) seguem o idioma do jogo.
    I18n.onChange(() => I18n.applyDom());
    I18n.applyDom();
  }

  /** Troca toda a pilha por uma cena nova. */
  setScene(scene: Scene) {
    this.stack = [{ scene }];
    this.input.consume();
    scene.onEnter();
  }

  push<T>(scene: Scene): Promise<T> {
    return new Promise<T>((resolve) => {
      this.stack.push({ scene, resolve: resolve as (v: unknown) => void });
      this.input.consume();
      scene.onEnter();
    });
  }

  pop(result?: unknown) {
    const top = this.stack.pop();
    this.input.consume();
    top?.resolve?.(result);
  }

  get top(): Scene | undefined { return this.stack[this.stack.length - 1]?.scene; }

  start() {
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000);
      last = t;
      this.time += dt;
      this.input.beginFrame();
      this.top?.update(dt);
      LayoutCheck.beginFrame();
      this.painter.rect(0, 0, W, H, '#000');
      this.top?.render(this.painter);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}
