import { H, W, Scene, type Game } from '../engine/Game';
import { I18n } from '../i18n/I18n';
import { CreatureSprites } from '../engine/sprites';
import { COLORS, Dialog, Menu, Painter } from '../engine/ui';
import { MoveBook } from '../data/moves';
import { TYPE_INFO } from '../data/types';
import { Creature } from '../core/Creature';
import type { GameState } from '../core/GameState';

/**
 * Modos da tela do time:
 * - view: resumo e mudar a ordem (menu do mapa);
 * - pick: escolher uma criatura, B cancela (troca em batalha, alvo de item);
 * - forced: escolher uma criatura saudável depois de um desmaio, sem cancelar.
 */
export type PartyMode = 'view' | 'pick' | 'forced';

export interface PartyOptions {
  prompt?: string;
  /** Criatura em campo (não pode ser escolhida para troca). */
  activeUid?: string;
  /** Só aceita criaturas que não desmaiaram. */
  requireHealthy?: boolean;
}

/** Tela do time. `game.push<number>(new PartyScene(...))` devolve o índice escolhido ou -1. */
export class PartyScene extends Scene {
  private readonly state: GameState;
  private readonly dialog = new Dialog();
  private readonly menu = new Menu();
  private index = 0;
  /** Índice de origem durante o MOVER. */
  private moving: number | null = null;
  private summary: number | null = null;
  private busy = false;

  constructor(game: Game, private readonly mode: PartyMode, private readonly opts: PartyOptions = {}) {
    super(game);
    if (!game.state) throw new Error('PartyScene precisa de um GameState');
    this.state = game.state;
  }

  private get party() { return this.state.party; }

  private get prompt() {
    if (this.moving !== null) return 'Mover para onde?';
    return this.opts.prompt ?? 'Escolha uma criatura.';
  }

  private async run(event: () => Promise<void>) {
    this.busy = true;
    try { await event(); } finally { this.busy = false; this.game.input.consume(); }
  }

  update(dt: number) {
    const input = this.game.input;
    this.dialog.update(dt, input);
    this.menu.update(input);
    if (this.busy) return;
    const n = this.party.length;
    if (this.summary !== null) {
      if (input.justPressed('up')) this.summary = (this.summary + n - 1) % n;
      else if (input.justPressed('down')) this.summary = (this.summary + 1) % n;
      else if (input.justPressed('b') || input.justPressed('a')) this.summary = null;
      return;
    }
    if (input.justPressed('up')) this.index = (this.index + n - 1) % n;
    else if (input.justPressed('down')) this.index = (this.index + 1) % n;
    else if (input.justPressed('a')) { input.consume(); void this.run(() => this.select()); }
    else if (input.justPressed('b')) {
      if (this.moving !== null) this.moving = null;
      else if (this.mode !== 'forced') this.game.pop(-1);
    }
  }

  private async select() {
    const c = this.party[this.index];
    if (this.moving !== null) {
      const from = this.moving;
      [this.party[from], this.party[this.index]] = [this.party[this.index], this.party[from]];
      this.moving = null;
      return;
    }
    if (this.mode === 'view') {
      const i = await this.menu.open(['RESUMO', 'MOVER', 'VOLTAR'], { x: W - 84, y: H - 28 - 56, w: 84 });
      if (i === 0) this.summary = this.index;
      else if (i === 1) this.moving = this.index;
      return;
    }
    if (this.mode === 'forced' || this.opts.requireHealthy) {
      if (c.isFainted) {
        await this.dialog.show(this.game.painter, I18n.t('{name} não tem energia para lutar!', { name: c.name }));
        return;
      }
      if (c.uid === this.opts.activeUid) {
        await this.dialog.show(this.game.painter, I18n.t('{name} já está em batalha!', { name: c.name }));
        return;
      }
    }
    this.game.pop(this.index);
  }

  render(p: Painter) {
    p.rect(0, 0, W, H, '#2f6f73');
    for (let y = 0; y < H; y += 8) p.rect(0, y, W, 1, '#2a6468');
    if (this.summary !== null) {
      this.renderSummary(p, this.party[this.summary]);
      return;
    }
    this.party.forEach((c, i) => this.renderRow(p, c, i));
    if (!this.dialog.active) {
      p.box(0, H - 28, W, 28, 'dialog');
      p.text(this.prompt, 10, H - 18);
    }
    this.dialog.render(p, this.game.time);
    this.menu.render(p);
  }

  private renderRow(p: Painter, c: Creature, i: number) {
    const y = 3 + i * 21;
    const selected = i === this.index;
    const fainted = c.isFainted;
    p.rect(4, y, W - 8, 19, '#1c2024');
    p.rect(5, y + 1, W - 10, 17, fainted ? '#d8a8a8' : selected ? '#f8e8a8' : '#e8f0e8');
    if (this.moving === i) p.rect(5, y + 1, 3, 17, COLORS.accent);
    const bob = selected && !fainted ? Math.round(Math.sin(this.game.time * 10)) : 0;
    CreatureSprites.draw(p, c.species, 20, y + 19 + bob, { scale: 0.56 });
    p.text(c.name, 36, y + 4);
    p.text(I18n.t('Nv{level}', { level: c.level }), 36, y + 12, COLORS.ink, null, 5);
    const ratio = c.hp / c.stats.hp;
    p.bar(140, y + 6, 64, ratio, Painter.hpColor(ratio), 'HP');
    p.text(`${c.hp}/${c.stats.hp}`, W - 10, y + 11, COLORS.ink, null, 5, 'right');
    if (c.uid === this.opts.activeUid) p.text('EM CAMPO', 88, y + 12, COLORS.accent, null, 5);
  }

  private renderSummary(p: Painter, c: Creature) {
    const sp = c.data;
    p.box(4, 4, 96, 104, 'menu');
    CreatureSprites.draw(p, c.species, 52, 74, { scale: 2 });
    p.text(c.name, 52, 78, COLORS.ink, COLORS.inkShadow, 6, 'center');
    p.text(I18n.t('Nv{level}', { level: c.level }), 52, 87, COLORS.ink, COLORS.inkShadow, 6, 'center');
    sp.types.forEach((t, k) => {
      const x = sp.types.length === 1 ? 32 : 10 + k * 44;
      p.rect(x, 95, 40, 8, TYPE_INFO[t].color);
      p.text(TYPE_INFO[t].label, x + 20, 96.5, '#f8f8f0', TYPE_INFO[t].dark, 5, 'center');
    });
    p.box(102, 4, 134, 62, 'menu');
    const s = c.stats;
    const rows: [string, string][] = [
      ['HP', `${c.hp}/${s.hp}`], ['ATAQUE', `${s.atk}`], ['DEFESA', `${s.def}`],
      ['AT. ESP.', `${s.spa}`], ['DEF. ESP.', `${s.spd}`], ['VELOC.', `${s.spe}`],
    ];
    rows.forEach(([k, v], i) => {
      p.text(k, 110, 11 + i * 9, COLORS.ink, null, 5);
      p.text(v, 228, 11 + i * 9, COLORS.ink, null, 5, 'right');
    });
    p.box(102, 68, 134, 40, 'menu');
    c.moves.forEach((m, i) => {
      const mv = MoveBook.get(m.id);
      p.text(mv.name, 110, 75 + i * 8, TYPE_INFO[mv.type].dark, null, 5);
      p.text(`${m.pp}/${m.maxPp}`, 228, 75 + i * 8, COLORS.ink, null, 5, 'right');
    });
    p.box(4, 110, 232, 46, 'dialog');
    const toNext = c.level < Creature.MAX_LEVEL ? I18n.t('EXP: {exp}  PRÓXIMO NÍVEL: {next}', { exp: c.exp, next: Math.max(0, Creature.expForLevel(c.level + 1) - c.exp) }) : `EXP: ${c.exp}`;
    p.text(toNext, 12, 119, COLORS.ink, null, 5);
    p.wrap(I18n.t(sp.entry), 216, 5).slice(0, 3).forEach((ln, k) => p.textRaw(ln, 12, 131 + k * 8, COLORS.ink, null, 5));
  }
}
