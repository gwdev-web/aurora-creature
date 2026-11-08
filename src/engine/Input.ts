export type Btn = 'up' | 'down' | 'left' | 'right' | 'a' | 'b' | 'start';

const KEYMAP: Record<string, Btn> = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right',
  z: 'a', Z: 'a', ' ': 'a',
  x: 'b', X: 'b', Escape: 'b', Backspace: 'b',
  Enter: 'start',
};

/** Teclado e botões de toque. `justPressed` vale só no frame em que o botão foi apertado. */
export class Input {
  private held = new Set<Btn>();
  private queued = new Set<Btn>();
  private pressed = new Set<Btn>();

  constructor() {
    window.addEventListener('keydown', (e) => {
      const b = KEYMAP[e.key];
      if (!b) return;
      e.preventDefault();
      this.press(b);
    });
    window.addEventListener('keyup', (e) => {
      const b = KEYMAP[e.key];
      if (b) this.release(b);
    });
    window.addEventListener('blur', () => this.held.clear());

    // Botões de toque (START, A, B). O direcional é tratado à parte, como uma peça só.
    document.querySelectorAll<HTMLButtonElement>('[data-btn]').forEach((el) => {
      if (el.closest('.dpad')) return;
      const b = el.dataset.btn as Btn;
      const down = (e: PointerEvent) => {
        e.preventDefault();
        el.setPointerCapture?.(e.pointerId);
        el.classList.add('on');
        Input.haptic();
        this.press(b);
      };
      const up = (e: Event) => { e.preventDefault(); el.classList.remove('on'); this.release(b); };
      el.addEventListener('pointerdown', down);
      el.addEventListener('pointerup', up);
      el.addEventListener('pointercancel', up);
      el.addEventListener('lostpointercapture', up);
      el.addEventListener('contextmenu', (e) => e.preventDefault());
    });
    const dpad = document.querySelector<HTMLElement>('.dpad');
    if (dpad) this.bindDpad(dpad);
  }

  /** Direcional: o dedo pode deslizar entre as direções sem soltar; vale a direção dominante a partir do centro. */
  private bindDpad(dpad: HTMLElement) {
    let current: Btn | null = null;
    const set = (next: Btn | null) => {
      if (next === current) return;
      if (current) {
        this.release(current);
        dpad.querySelector(`[data-btn="${current}"]`)?.classList.remove('on');
      }
      current = next;
      if (next) {
        this.press(next);
        dpad.querySelector(`[data-btn="${next}"]`)?.classList.add('on');
        Input.haptic();
      }
    };
    const track = (e: PointerEvent) => {
      const r = dpad.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      if (Math.hypot(dx, dy) < r.width * 0.12) return set(null);
      set(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
    };
    dpad.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      dpad.setPointerCapture?.(e.pointerId);
      track(e);
    });
    dpad.addEventListener('pointermove', (e) => { if (current || e.buttons) track(e); });
    const end = () => set(null);
    dpad.addEventListener('pointerup', end);
    dpad.addEventListener('pointercancel', end);
    dpad.addEventListener('lostpointercapture', end);
    dpad.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  /** Vibração curta ao tocar num botão (quando o aparelho suporta). */
  private static haptic() {
    try { navigator.vibrate?.(8); } catch { /* sem vibração */ }
  }

  press(b: Btn) {
    if (!this.held.has(b)) this.queued.add(b);
    this.held.add(b);
  }

  release(b: Btn) { this.held.delete(b); }

  /** Chamado no início de cada frame. */
  beginFrame() {
    this.pressed = this.queued;
    this.queued = new Set();
  }

  isDown(b: Btn) { return this.held.has(b); }
  justPressed(b: Btn) { return this.pressed.has(b); }
  /** Descarta os toques do frame atual (evita que um "A" acione duas coisas). */
  consume() { this.pressed.clear(); }
}
