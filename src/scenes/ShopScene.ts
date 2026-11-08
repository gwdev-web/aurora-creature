import { H, W, Scene, type Game } from '../engine/Game';
import { I18n } from '../i18n/I18n';
import { COLORS, Dialog, Menu, type Painter } from '../engine/ui';
import { ITEMS, ITEM_ORDER, type ItemData } from '../core/items';
import type { GameState } from '../core/GameState';

/** Mercado: compra de itens com quantidade (x1, x5, x10) e mostrador de dinheiro. */
export class ShopScene extends Scene {
  private readonly state: GameState;
  private readonly dialog = new Dialog();
  private readonly menu = new Menu();
  /** Item em destaque (mostra a descrição). */
  private highlight: ItemData | null = null;

  constructor(game: Game) {
    super(game);
    if (!game.state) throw new Error('ShopScene precisa de um GameState');
    this.state = game.state;
  }

  onEnter() { void this.flow(); }

  private say(msg: string, linger = false) { return this.dialog.show(this.game.painter, msg, { linger }); }

  private async flow() {
    await this.say('VENDEDOR: Olá! Posso ajudar?', true);
    for (;;) {
      const i = await this.menu.open(['COMPRAR', 'SAIR'], { x: W - 80, y: 34, w: 80 });
      this.dialog.clear();
      if (i !== 0) break;
      await this.buyLoop();
      await this.say('VENDEDOR: Mais alguma coisa?', true);
    }
    await this.say('VENDEDOR: Volte sempre!');
    this.game.pop();
  }

  private async buyLoop() {
    for (;;) {
      const items = ITEM_ORDER.map((id) => ITEMS[id]);
      this.highlight = items[0];
      const i = await this.menu.open(items.map((it) => it.name), { x: 64, y: 24, w: 176, values: items.map((it) => `$${it.price}`) }, 0);
      if (i < 0) {
        this.highlight = null;
        return;
      }
      this.highlight = items[i];
      await this.buy(items[i]);
    }
  }

  private async buy(item: ItemData) {
    const options = [1, 5, 10];
    const q = await this.menu.open(options.map((n) => `x${n}`), { x: W - 100, y: 54, w: 100, values: options.map((n) => `$${n * item.price}`) });
    if (q < 0) return;
    const qty = options[q];
    const total = qty * item.price;
    if (total > this.state.money) {
      await this.say('VENDEDOR: Você não tem dinheiro suficiente.');
      return;
    }
    await this.say(I18n.t('{item} x{qty} custa ${total}. Tudo bem?', { item: I18n.t(item.name), qty, total }), true);
    const ok = await this.menu.open(['SIM', 'NÃO'], { w: 56 });
    this.dialog.clear();
    if (ok !== 0) return;
    this.state.money -= total;
    this.state.bag.add(item.id, qty);
    this.game.audio.sfx('buy');
    await this.say('VENDEDOR: Aqui está. Obrigado!');
  }

  update(dt: number) {
    const input = this.game.input;
    this.dialog.update(dt, input);
    this.menu.update(input);
    if (this.highlight && this.menu.active && this.menu.options.length === ITEM_ORDER.length) {
      this.highlight = ITEMS[ITEM_ORDER[this.menu.index]];
    }
  }

  render(p: Painter) {
    // Interior do mercado: piso, prateleiras e balcão.
    p.rect(0, 0, W, H, '#e8e0c8');
    for (let x = 0; x < W; x += 16) p.rect(x, 0, 1, H, '#d8d0b8');
    p.rect(0, 0, W, 20, '#3878c8');
    for (let i = 0; i < 4; i++) {
      p.rect(8 + i * 58, 24, 50, 30, '#a07848');
      for (let k = 0; k < 6; k++) p.rect(12 + i * 58 + k * 7, 28 + (k % 2) * 12, 5, 8, ['#d84858', '#f8d048', '#48a8f0', '#58b048'][(i + k) % 4]);
    }
    p.box(0, 0, 80, 20, 'menu');
    p.text(`$${this.state.money}`, 72, 7, COLORS.ink, COLORS.inkShadow, 6, 'right');
    if (this.highlight) {
      p.box(0, 112, W, 48, 'dialog');
      const owned = this.state.bag.count(this.highlight.id);
      p.text(this.highlight.description, 12, 124);
      p.text(I18n.t('NA BOLSA: {n}', { n: owned }), 12, 138, COLORS.accent);
    }
    this.dialog.render(p, this.game.time);
    this.menu.render(p);
  }
}
