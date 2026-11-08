import { H, W, Scene, type Game } from '../engine/Game';
import { I18n } from '../i18n/I18n';
import { COLORS, Dialog, Menu, type Painter } from '../engine/ui';
import { SaveManager, type SlotSummary } from '../core/SaveManager';
import { OverworldScene } from './OverworldScene';
import { RegionSelectScene } from './RegionSelectScene';
import { TitleScene } from './TitleScene';

/** load: continuar uma partida; new: escolher onde começar um jogo novo. */
export type SlotMode = 'load' | 'new';

/** Escolha entre os 3 slots de save. */
export class SlotScene extends Scene {
  private readonly dialog = new Dialog();
  private readonly menu = new Menu();
  private slots: (SlotSummary | null)[] = [];
  private index = 0;
  private busy = false;

  constructor(game: Game, private readonly mode: SlotMode) {
    super(game);
  }

  onEnter() {
    this.refresh();
    this.index = this.mode === 'load' ? this.game.saves.latestSlot() - 1 : Math.max(0, this.slots.findIndex((s) => s === null));
  }

  private refresh() { this.slots = this.game.saves.list(); }

  private say(msg: string, linger = false) { return this.dialog.show(this.game.painter, msg, { linger }); }

  private async run(event: () => Promise<void>) {
    this.busy = true;
    try { await event(); } finally { this.busy = false; this.game.input.consume(); }
  }

  update(dt: number) {
    const input = this.game.input;
    this.dialog.update(dt, input);
    this.menu.update(input);
    if (this.busy) return;
    const n = SaveManager.SLOTS;
    if (input.justPressed('up')) this.index = (this.index + n - 1) % n;
    else if (input.justPressed('down')) this.index = (this.index + 1) % n;
    else if (input.justPressed('b')) this.game.setScene(new TitleScene(this.game));
    else if (input.justPressed('a')) { input.consume(); void this.run(() => this.choose()); }
  }

  private async choose() {
    const slot = this.index + 1;
    const info = this.slots[this.index];
    if (this.mode === 'new') {
      if (info) {
        await this.say(I18n.t('Apagar o jogo salvo no SLOT {slot} e começar um novo?', { slot }), true);
        const ok = await this.menu.open(['SIM', 'NÃO'], { w: 56 }, 1);
        this.dialog.clear();
        if (ok !== 0) return;
        this.game.saves.clear(slot);
      }
      this.game.slot = slot;
      this.game.state = null;
      this.game.setScene(new RegionSelectScene(this.game));
      return;
    }
    if (!info) {
      await this.say('Este slot está vazio.');
      return;
    }
    const action = await this.menu.open(['CARREGAR', 'APAGAR', 'VOLTAR'], { x: W - 90, y: H - 60, w: 90 });
    if (action === 0) {
      const state = this.game.saves.load(slot);
      if (!state) {
        await this.say('Não foi possível carregar este save.');
        return;
      }
      this.game.slot = slot;
      this.game.state = state;
      this.game.setScene(new OverworldScene(this.game));
    } else if (action === 1) {
      await this.say(I18n.t('Apagar o jogo do SLOT {slot}? Isso não pode ser desfeito.', { slot }), true);
      const ok = await this.menu.open(['SIM', 'NÃO'], { w: 56 }, 1);
      this.dialog.clear();
      if (ok !== 0) return;
      this.game.saves.clear(slot);
      this.refresh();
      await this.say('Save apagado.');
      if (!this.game.saves.anySaved) this.game.setScene(new TitleScene(this.game));
    }
  }

  render(p: Painter) {
    TitleScene.drawSky(p, this.game.time);
    p.box(0, 0, W, 20, 'menu');
    p.text(this.mode === 'load' ? 'CONTINUAR: ESCOLHA O SLOT' : 'NOVO JOGO: ESCOLHA O SLOT', W / 2, 7, undefined, undefined, 6, 'center');
    this.slots.forEach((info, i) => this.renderSlot(p, info, i));
    if (!this.dialog.active && !this.menu.active) {
      p.text('A: escolher   B: voltar', W / 2, H - 9, COLORS.light, null, 5, 'center');
    }
    this.dialog.render(p, this.game.time);
    this.menu.render(p);
  }

  private renderSlot(p: Painter, info: SlotSummary | null, i: number) {
    const y = 24 + i * 40;
    const selected = i === this.index;
    p.box(8, y, W - 16, 36, selected ? 'dialog' : 'menu');
    if (selected) p.arrow(14, y + 15, COLORS.accent);
    p.text(`SLOT ${i + 1}`, 24, y + 8, COLORS.accent);
    if (!info) {
      p.text('VAZIO', 24, y + 20);
      return;
    }
    p.text(info.region, 72, y + 8);
    p.text(`$${info.money}`, W - 18, y + 8, COLORS.ink, COLORS.inkShadow, 6, 'right');
    p.text(`${info.lead}  ${I18n.t('Nv{level}', { level: info.leadLevel })}`, 24, y + 19, COLORS.ink, null, 5);
    if (info.savedAt) p.text(SlotScene.formatDate(info.savedAt), W - 18, y + 19, COLORS.ink, null, 5, 'right');
    p.text(I18n.t('TIME {party} · CAPTURADAS {caught} · INSÍGNIAS {badges}', { party: info.partySize, caught: info.caught, badges: info.badges }), 24, y + 27, COLORS.ink, null, 5);
  }

  /** Data no formato do idioma: 08/11 13:02 (pt) ou 11/08 13:02 (en). */
  private static formatDate(ms: number) {
    const d = new Date(ms);
    const two = (n: number) => String(n).padStart(2, '0');
    const day = two(d.getDate()), month = two(d.getMonth() + 1);
    return `${I18n.lang === 'en' ? `${month}/${day}` : `${day}/${month}`} ${two(d.getHours())}:${two(d.getMinutes())}`;
  }
}
