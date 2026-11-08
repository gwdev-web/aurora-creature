import { H, W, Scene, type Game } from '../engine/Game';
import { I18n } from '../i18n/I18n';
import { CreatureSprites } from '../engine/sprites';
import { COLORS, Dialog, Menu, Painter } from '../engine/ui';
import { MoveBook } from '../data/moves';
import { TYPE_INFO, TypeChart } from '../data/types';
import { BattleRules } from '../core/BattleRules';
import { Creature } from '../core/Creature';
import { EnemyAI } from '../core/EnemyAI';
import type { GameState } from '../core/GameState';
import type { ItemId } from '../core/items';
import { PartyScene } from './PartyScene';

export type BattleResult = 'win' | 'lose' | 'run' | 'caught';

/** Efeito de usar a bolsa ou trocar de criatura. */
type ActionOutcome = 'cancel' | 'used' | 'caught';

type Side = 'player' | 'enemy';

/** Estado visual de cada lado: HP mostrado na barra, deslocamento e piscadas. */
interface SideView { shownHp: number; offsetY: number; alpha: number; blink: number; shake: number; }

/** Batalha por turnos contra uma criatura selvagem. */
export class BattleScene extends Scene {
  protected readonly rules = new BattleRules();
  protected readonly ai = new EnemyAI();
  protected readonly dialog = new Dialog();
  protected readonly menu = new Menu();
  /** Itens listados no menu da BOLSA (para mostrar quantidade e descrição). */
  private bagEntries: ReturnType<GameState['bag']['entries']> | null = null;
  protected readonly state: GameState;
  protected player: Creature;
  protected enemy: Creature;
  protected readonly views: Record<Side, SideView>;
  private waits: { t: number; resolve: () => void }[] = [];
  private hpWaiters: { side: Side; resolve: () => void }[] = [];
  /** EXP mostrada na barra (anima até `expTarget`). */
  private shownExp: number;
  private expTarget: number;
  private expWaiter?: () => void;
  /** Tempo restante do clarão branco da entrada. */
  private flash = 0;
  /** Progresso da entrada (0 → 1): as criaturas deslizam para o lugar. */
  private intro = 0;
  private escapeAttempts = 0;
  /** Cápsula arremessada (posição, giro e se prendeu a criatura). */
  private capsule = { visible: false, x: 0, y: 0, angle: 0, super: false, caught: false };
  /** Golpe em destaque no menu de golpes (mostra PP e tipo). */
  private showMoveInfo = false;
  /** Menu de ações fica encaixado na caixa de texto; os demais (bolsa, SIM/NÃO) têm caixa própria. */
  private actionMenu = false;

  constructor(game: Game, protected readonly enemyTeam: Creature[]) {
    super(game);
    if (!game.state) throw new Error('BattleScene precisa de um GameState');
    this.state = game.state;
    this.player = this.state.lead ?? this.state.party[0];
    this.enemy = enemyTeam[0];
    this.views = {
      player: { shownHp: this.player.hp, offsetY: 0, alpha: 1, blink: 0, shake: 0 },
      enemy: { shownHp: this.enemy.hp, offsetY: 0, alpha: 1, blink: 0, shake: 0 },
    };
    this.shownExp = this.expTarget = this.player.exp;
    this.state.registerSeen(this.enemy.species);
  }

  onEnter() {
    this.game.audio.music(this.isTrainerBattle ? 'treinador' : 'batalha');
    void this.main();
  }

  // ---------- utilitários de fluxo ----------

  protected wait(seconds: number) { return new Promise<void>((resolve) => this.waits.push({ t: seconds, resolve })); }

  protected say(msg: string, opts: { auto?: number; linger?: boolean; width?: number } = {}) {
    return this.dialog.show(this.game.painter, msg, opts);
  }

  /** Espera a barra de HP alcançar o HP real. */
  protected animateHp(side: Side) {
    return new Promise<void>((resolve) => this.hpWaiters.push({ side, resolve }));
  }

  protected creatureOf(side: Side) { return side === 'player' ? this.player : this.enemy; }

  protected label(side: Side) {
    return side === 'player' ? this.player.name : I18n.t('{name} selvagem', { name: this.enemy.name });
  }

  // ---------- roteiro da batalha ----------

  private async main() {
    this.flash = 0.6;
    await this.wait(0.6);
    while (this.intro < 1) await this.wait(0.05);
    await this.say(this.introMessage());
    await this.say(I18n.t('Vai, {name}!', { name: this.player.name }), { auto: 0.6 });
    const result = await this.loop();
    await this.onBattleEnd(result);
    this.game.pop(result);
  }

  /** Gancho chamado antes de sair da batalha (recompensa de treinador). */
  protected async onBattleEnd(_result: BattleResult): Promise<void> {}

  /** Próxima criatura do adversário; selvagens só têm uma. */
  protected async sendNextEnemy(): Promise<boolean> { return false; }

  /** Coloca uma criatura nova do lado inimigo. */
  protected setEnemy(c: Creature) {
    this.enemy = c;
    const v = this.views.enemy;
    v.shownHp = c.hp;
    v.offsetY = 0;
    v.alpha = 1;
    v.blink = 0.4;
    this.state.registerSeen(c.species);
  }

  protected introMessage() { return I18n.t('Um {name} selvagem apareceu!', { name: this.enemy.name }); }

  /** Turnos até alguém vencer, a criatura ser capturada ou o jogador fugir. */
  private async loop(): Promise<BattleResult> {
    for (;;) {
      const action = await this.chooseAction();
      if (action === 'caught') return 'caught';
      if (action === 'run') {
        if (await this.tryRun()) return 'run';
        await this.enemyTurnOnly();
      } else if (action === 'used') {
        await this.enemyTurnOnly();
      } else {
        await this.playTurn(action.move);
      }
      const end = await this.checkEnd();
      if (end) return end;
    }
  }

  /** Resultado do menu principal: um golpe, fuga, item/troca usados (gastam o turno) ou captura. */
  private async chooseAction(): Promise<{ move: string } | 'run' | Exclude<ActionOutcome, 'cancel'>> {
    for (;;) {
      await this.say(I18n.t('O que {name} vai fazer?', { name: this.player.name }), { linger: true, auto: 0.01, width: 92 });
      this.actionMenu = true;
      const i = await this.menu.open(['LUTAR', 'BOLSA', 'CRIATURA', 'FUGIR'].map((o) => I18n.t(o)), { x: 108, y: 112, w: 132, cols: 2, cancelable: false, rowH: 16 });
      this.actionMenu = false;
      this.dialog.clear();
      if (i === 0) {
        const move = await this.chooseMove();
        if (move) return { move };
      } else if (i === 3) {
        if (this.isTrainerBattle) await this.say(I18n.t('Não dá para fugir de uma batalha contra um treinador!'));
        else return 'run';
      } else {
        const outcome = i === 1 ? await this.useBag() : await this.switchCreature();
        if (outcome !== 'cancel') return outcome;
      }
    }
  }

  /** Batalhas de treinador (PR 13) bloqueiam fuga e captura. */
  protected get isTrainerBattle() { return false; }

  /** CRIATURA: troca voluntária; o inimigo ataca a que entrou. */
  protected async switchCreature(): Promise<ActionOutcome> {
    const i = await this.game.push<number>(new PartyScene(this.game, 'pick', {
      prompt: I18n.t('Trocar por qual criatura?'), activeUid: this.player.uid, requireHealthy: true,
    }));
    if (i < 0) return 'cancel';
    await this.say(I18n.t('Volte, {name}!', { name: this.player.name }), { auto: 0.5 });
    await this.sendOut(this.state.party[i]);
    return 'used';
  }

  /** BOLSA: cápsulas capturam, tônicos curam a criatura em campo. */
  private async useBag(): Promise<ActionOutcome> {
    const entries = this.state.bag.entries();
    if (!entries.length) {
      await this.say(I18n.t('A bolsa está vazia!'));
      return 'cancel';
    }
    this.bagEntries = entries;
    const i = await this.menu.open(entries.map(({ item }) => item.name), { x: 64, w: 176, values: entries.map(({ count }) => `x${count}`) });
    this.bagEntries = null;
    if (i < 0) return 'cancel';
    const { item } = entries[i];
    if (item.ball) {
      if (this.isTrainerBattle) {
        await this.say(I18n.t('O treinador bloqueou a cápsula! Não se captura a criatura dos outros!'));
        return 'cancel';
      }
      return this.throwCapsule(item.id, item.name, item.ball);
    }
    if (item.heal) {
      const target = await this.pickHealTarget();
      if (!target) return 'cancel';
      if (target.hp >= target.stats.hp || target.isFainted) {
        await this.say(I18n.t('Não vai ter efeito.'));
        return 'cancel';
      }
      this.state.bag.use(item.id);
      const healed = target.restoreHp(item.heal);
      this.game.audio.sfx('heal');
      if (target === this.player) await this.animateHp('player');
      await this.say(I18n.t('{name} recuperou {hp} de HP!', { name: target.name, hp: healed }));
      return 'used';
    }
    return 'cancel';
  }

  /** Quem recebe o tônico: abre a tela do time. */
  protected async pickHealTarget(): Promise<Creature | null> {
    const i = await this.game.push<number>(new PartyScene(this.game, 'pick', { prompt: 'Usar em qual criatura?', activeUid: this.player.uid }));
    return i < 0 ? null : this.state.party[i];
  }

  private async throwCapsule(id: ItemId, name: string, bonus: number): Promise<ActionOutcome> {
    this.state.bag.use(id);
    await this.say(I18n.t('Você jogou uma {item}!', { item: I18n.t(name) }), { auto: 0.3 });
    const cap = this.capsule;
    this.game.audio.sfx('throw');
    cap.visible = true;
    cap.super = id === 'supercapsula';
    // Arremesso em arco até o inimigo.
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      cap.x = 70 + (176 - 70) * t;
      cap.y = 96 + (30 - 96) * t - Math.sin(t * Math.PI) * 30;
      await this.wait(0.02);
    }
    // A criatura entra na cápsula.
    this.views.enemy.blink = 0.3;
    await this.wait(0.3);
    this.views.enemy.alpha = 0;
    for (let i = 0; i <= 8; i++) {
      cap.y = 30 + (60 - 30) * (i / 8);
      await this.wait(0.02);
    }
    const result = this.rules.tryCatch(this.enemy, bonus);
    for (let s = 0; s < result.shakes; s++) {
      await this.wait(0.35);
      this.game.audio.sfx('shake');
      for (const a of [-0.4, 0.4, -0.2, 0]) {
        cap.angle = a;
        await this.wait(0.06);
      }
    }
    await this.wait(0.4);
    if (result.caught) {
      cap.caught = true;
      this.game.audio.sfx('caught');
      this.game.audio.music('vitoria');
      await this.say(I18n.t('Isso! {name} foi capturado!', { name: this.enemy.name }));
      const place = this.state.addCreature(this.enemy);
      if (place === 'box') await this.say(I18n.t('O time está cheio. {name} foi enviado para a caixa.', { name: this.enemy.name }));
      return 'caught';
    }
    cap.visible = false;
    this.views.enemy.alpha = 1;
    this.views.enemy.blink = 0.3;
    const msgs = ['Ah, não! A criatura escapou!', 'Puxa! Parecia que tinha conseguido!', 'Argh! Quase!', 'Droga! Foi por muito pouco!'];
    await this.say(I18n.t(msgs[result.shakes]));
    return 'used';
  }

  /** Menu de golpes. Sem PP em nenhum golpe, usa o golpe de emergência. */
  private async chooseMove(): Promise<string | null> {
    if (!this.player.hasUsableMoves) {
      await this.say(I18n.t('{name} não tem mais PP!', { name: this.player.name }));
      return BattleRules.STRUGGLE;
    }
    for (;;) {
      this.showMoveInfo = true;
      const names = this.player.moves.map((m) => I18n.t(MoveBook.get(m.id).name));
      while (names.length < 4) names.push('-');
      const i = await this.menu.open(names, { x: 0, y: 112, w: 176, cols: 2, rowH: 16 });
      this.showMoveInfo = false;
      if (i < 0) return null;
      const slot = this.player.moves[i];
      if (!slot) continue;
      if (slot.pp <= 0) {
        await this.say(I18n.t('Esse golpe não tem mais PP!'));
        continue;
      }
      return slot.id;
    }
  }

  /** Turno completo: os dois atacam na ordem certa. */
  protected async playTurn(playerMove: string) {
    const enemyMove = this.ai.chooseMove(this.enemy, this.player) ?? BattleRules.STRUGGLE;
    const first = this.rules.firstToAct(this.player, playerMove, this.enemy, enemyMove) === 'a' ? 'player' : 'enemy';
    const order: [Side, string][] = first === 'player'
      ? [['player', playerMove], ['enemy', enemyMove]]
      : [['enemy', enemyMove], ['player', playerMove]];
    for (const [side, move] of order) {
      if (this.creatureOf(side).isFainted) continue;
      await this.attack(side, move);
      if (this.player.isFainted || this.enemy.isFainted) break;
    }
  }

  /** O inimigo ataca sozinho (depois de uma fuga falha, troca ou item). */
  protected async enemyTurnOnly() {
    const move = this.ai.chooseMove(this.enemy, this.player) ?? BattleRules.STRUGGLE;
    await this.attack('enemy', move);
  }

  protected async attack(side: Side, moveId: string) {
    const attacker = this.creatureOf(side);
    const targetSide: Side = side === 'player' ? 'enemy' : 'player';
    const target = this.creatureOf(targetSide);
    const move = MoveBook.get(moveId);
    attacker.usePp(moveId);
    await this.say(I18n.t('{name} usou {move}!', { name: this.label(side), move: I18n.t(move.name) }), { auto: 0.5 });
    if (!this.rules.hits(move)) {
      await this.say(I18n.t('{name} errou o ataque!', { name: this.label(side) }));
      return;
    }
    const result = this.rules.damage(attacker, target, moveId);
    if (result.mult > 0) {
      this.views[targetSide].blink = 0.5;
      await this.wait(0.5);
    }
    if (result.mult > 0) this.game.audio.sfx(result.mult > 1 ? 'super' : result.mult < 1 ? 'weak' : 'hit');
    target.takeDamage(result.damage);
    await this.animateHp(targetSide);
    if (result.crit && result.mult > 0) await this.say(I18n.t('Um golpe crítico!'));
    const eff = TypeChart.message(result.mult);
    if (eff) await this.say(eff);
    if (target.isFainted) await this.faint(targetSide);
  }

  protected async faint(side: Side) {
    const v = this.views[side];
    this.game.audio.sfx('faint');
    for (let i = 0; i <= 10; i++) {
      v.offsetY = i * 4;
      v.alpha = 1 - i / 10;
      await this.wait(0.03);
    }
    await this.say(I18n.t('{name} desmaiou!', { name: this.label(side) }));
  }

  private async tryRun(): Promise<boolean> {
    this.escapeAttempts++;
    if (this.rules.canEscape(this.player, this.enemy, this.escapeAttempts)) {
      await this.say(I18n.t('Você fugiu em segurança!'));
      return true;
    }
    await this.say(I18n.t('Não conseguiu fugir!'));
    return false;
  }

  /** Vitória, derrota ou próximo turno (null). */
  protected async checkEnd(): Promise<BattleResult | null> {
    if (this.enemy.isFainted) {
      if (this.enemyTeam.every((e) => e.isFainted)) this.game.audio.music('vitoria');
      await this.onEnemyFainted();
      return (await this.sendNextEnemy()) ? null : 'win';
    }
    if (this.player.isFainted) {
      if (!this.state.hasHealthy) {
        await this.say(I18n.t('Você não tem mais criaturas em condições de lutar...'));
        await this.say(I18n.t('Você desmaiou!'));
        return 'lose';
      }
      await this.onPlayerFainted();
    }
    return null;
  }

  /** A criatura em campo ganha experiência, sobe de nível e aprende golpes. A evolução acontece depois da batalha. */
  protected async onEnemyFainted(): Promise<void> {
    const c = this.player;
    if (c.level >= Creature.MAX_LEVEL) return;
    let remaining = this.rules.expGain(this.enemy, this.isTrainerBattle);
    await this.say(I18n.t('{name} ganhou {exp} de EXP!', { name: c.name, exp: remaining }));
    while (remaining > 0 && c.level < Creature.MAX_LEVEL) {
      const gain = Math.min(remaining, c.expToNext);
      remaining -= gain;
      await this.animateExp(c.exp + gain);
      const levels = c.gainExp(gain);
      this.shownExp = this.expTarget = c.exp;
      if (!levels.length) continue;
      this.views.player.shownHp = c.hp;
      this.game.audio.sfx('levelup');
      await this.say(I18n.t('{name} subiu para o nível {level}!', { name: c.name, level: c.level }));
      for (const id of c.newMovesAt()) await this.learn(c, id);
    }
  }

  private animateExp(target: number) {
    this.expTarget = target;
    return new Promise<void>((resolve) => { this.expWaiter = resolve; });
  }

  protected async learn(c: Creature, id: string) {
    const name = I18n.t(MoveBook.get(id).name);
    const result = c.learnMove(id);
    if (result === true) await this.say(I18n.t('{name} aprendeu {move}!', { name: c.name, move: name }));
    else if (typeof result === 'string') {
      await this.say(I18n.t('{name} esqueceu {move}...', { name: c.name, move: I18n.t(result) }));
      await this.say(I18n.t('...e aprendeu {move}!', { move: name }));
    } else await this.say(I18n.t('{name} não aprendeu {move}.', { name: c.name, move: name }));
  }

  /** Troca obrigatória: o jogador escolhe quem entra no lugar da que desmaiou. */
  protected async onPlayerFainted(): Promise<void> {
    const i = await this.game.push<number>(new PartyScene(this.game, 'forced', {
      prompt: I18n.t('Quem vai entrar na batalha?'), activeUid: this.player.uid, requireHealthy: true,
    }));
    await this.sendOut(this.state.party[i]);
  }

  protected async sendOut(c: Creature) {
    this.player = c;
    const v = this.views.player;
    v.shownHp = c.hp;
    this.shownExp = this.expTarget = c.exp;
    v.offsetY = 0;
    v.alpha = 1;
    await this.say(I18n.t('Vai, {name}!', { name: c.name }), { auto: 0.6 });
  }

  // ---------- quadro a quadro ----------

  update(dt: number) {
    const input = this.game.input;
    this.flash = Math.max(0, this.flash - dt);
    if (this.flash <= 0 && this.intro < 1) this.intro = Math.min(1, this.intro + dt * 1.6);
    for (const w of [...this.waits]) {
      w.t -= dt;
      if (w.t <= 0) {
        this.waits.splice(this.waits.indexOf(w), 1);
        w.resolve();
      }
    }
    if (this.shownExp < this.expTarget) {
      const c = this.player;
      const span = Math.max(1, Creature.expForLevel(c.level + 1) - Creature.expForLevel(c.level));
      this.shownExp = Math.min(this.expTarget, this.shownExp + span * dt * 0.8);
    }
    if (this.shownExp >= this.expTarget && this.expWaiter) {
      const r = this.expWaiter;
      this.expWaiter = undefined;
      r();
    }
    for (const side of ['player', 'enemy'] as Side[]) {
      const v = this.views[side];
      const c = this.creatureOf(side);
      v.blink = Math.max(0, v.blink - dt);
      if (v.shownHp !== c.hp) {
        const step = Math.max(12, c.stats.hp * 0.8) * dt;
        v.shownHp = v.shownHp > c.hp ? Math.max(c.hp, v.shownHp - step) : Math.min(c.hp, v.shownHp + step);
      }
      if (Math.abs(v.shownHp - c.hp) < 0.01) {
        v.shownHp = c.hp;
        for (const hw of this.hpWaiters.filter((h) => h.side === side)) {
          this.hpWaiters.splice(this.hpWaiters.indexOf(hw), 1);
          hw.resolve();
        }
      }
    }
    this.dialog.update(dt, input);
    this.menu.update(input);
  }

  render(p: Painter) {
    this.renderBackground(p);
    const slide = 1 - this.intro;
    const ev = this.views.enemy, pv = this.views.player;
    // Inimigo (de frente) e jogador (de costas).
    if (!(ev.blink > 0 && Math.floor(ev.blink * 16) % 2 === 0) && ev.alpha > 0) {
      CreatureSprites.draw(p, this.enemy.species, 176 + slide * 120, 70 + ev.offsetY, { scale: 2, alpha: ev.alpha });
    }
    if (!(pv.blink > 0 && Math.floor(pv.blink * 16) % 2 === 0) && pv.alpha > 0) {
      CreatureSprites.draw(p, this.player.species, 64 - slide * 120, 118 + pv.offsetY, { scale: 2.5, back: true, alpha: pv.alpha });
    }
    this.renderExtras(p);
    if (this.intro >= 1) {
      this.renderEnemyBox(p);
      this.renderPlayerBox(p);
    }
    p.box(0, 112, W, 48, 'battle');
    this.dialog.render(p, this.game.time, 'battle');
    if (this.menu.active) {
      if (this.showMoveInfo) {
        this.renderMoveInfo(p);
        this.menu.render(p, false);
      } else if (this.actionMenu) {
        p.box(108, 112, 132, 48, 'menu');
        this.menu.render(p, false);
      } else {
        this.menu.render(p, true);
        if (this.bagEntries) this.renderBagInfo(p);
      }
    }
    if (this.flash > 0 && Math.floor(this.flash * 10) % 2 === 0) p.rect(0, 0, W, H, '#f8f8f8');
  }

  /** Efeitos por cima das criaturas: a cápsula arremessada. */
  protected renderExtras(p: Painter) {
    const cap = this.capsule;
    if (!cap.visible) return;
    const ctx = p.ctx;
    ctx.save();
    ctx.translate(Math.round(cap.x), Math.round(cap.y));
    ctx.rotate(cap.angle);
    ctx.fillStyle = '#1c2024';
    ctx.beginPath();
    ctx.arc(0, 0, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = cap.super ? '#3878c8' : '#2f8f7f';
    ctx.beginPath();
    ctx.arc(0, 0, 4, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#f8f8f0';
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#1c2024';
    ctx.fillRect(-4, -0.5, 8, 1);
    ctx.fillStyle = cap.caught ? '#f8d048' : '#f8f8f0';
    ctx.fillRect(-1, -1, 2, 2);
    ctx.restore();
    if (cap.caught && Math.floor(this.game.time * 4) % 2 === 0) {
      for (const [dx, dy] of [[-9, -7], [9, -7], [0, -11]]) p.rect(cap.x + dx, cap.y + dy, 2, 2, '#f8d048');
    }
  }

  private renderBackground(p: Painter) {
    p.rect(0, 0, W, 112, '#d8f0e0');
    p.rect(0, 0, W, 30, '#c0e8f0');
    p.rect(0, 30, W, 4, '#c8ecec');
    // Plataformas de grama.
    this.platform(p, 176, 66, 52, 9);
    this.platform(p, 64, 112, 64, 10);
  }

  private platform(p: Painter, cx: number, cy: number, rx: number, ry: number) {
    const ctx = p.ctx;
    ctx.fillStyle = '#78b868';
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#98d080';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 2, rx - 6, ry - 3, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderEnemyBox(p: Painter) {
    const c = this.enemy;
    p.box(6, 8, 108, 30, 'menu');
    p.text(c.name, 13, 14);
    p.text(I18n.t('Nv{level}', { level: c.level }), 106, 14, COLORS.ink, COLORS.inkShadow, 6, 'right');
    const ratio = this.views.enemy.shownHp / c.stats.hp;
    p.bar(34, 27, 72, ratio, Painter.hpColor(ratio), 'HP');
  }

  protected renderPlayerBox(p: Painter) {
    const c = this.player;
    p.box(124, 70, 112, 40, 'menu');
    p.text(c.name, 131, 76);
    p.text(I18n.t('Nv{level}', { level: c.level }), 228, 76, COLORS.ink, COLORS.inkShadow, 6, 'right');
    const shown = Math.ceil(this.views.player.shownHp);
    const ratio = this.views.player.shownHp / c.stats.hp;
    p.bar(152, 88, 76, ratio, Painter.hpColor(ratio), 'HP');
    p.text(`${shown}/${c.stats.hp}`, 228, 95, COLORS.ink, COLORS.inkShadow, 6, 'right');
    // Barra de EXP.
    p.text('EXP', 131, 103, '#3878c8', null, 4);
    p.rect(151, 104, 78, 3, '#3c5058');
    p.rect(152, 105, 76, 1, '#f8f8f0');
    p.rect(152, 105, Math.round(76 * c.expRatio(this.shownExp)), 1, '#48a8f0');
  }

  private renderMoveInfo(p: Painter) {
    p.box(0, 112, 176, 48, 'menu');
    p.box(176, 112, 64, 48, 'menu');
    const slot = this.player.moves[this.menu.index];
    if (!slot) return;
    const mv = MoveBook.get(slot.id);
    p.text(`PP ${slot.pp}/${slot.maxPp}`, 208, 124, COLORS.ink, COLORS.inkShadow, 6, 'center');
    p.text(TYPE_INFO[mv.type].label, 208, 140, TYPE_INFO[mv.type].dark, COLORS.inkShadow, 6, 'center');
  }

  /** Descrição do item selecionado na BOLSA, na caixa de texto da batalha. */
  private renderBagInfo(p: Painter) {
    const entry = this.bagEntries?.[this.menu.index];
    if (!entry) return;
    p.wrap(I18n.t(entry.item.description), W - 24).slice(0, 2)
      .forEach((ln, i) => p.textRaw(ln, 12, 124 + i * 14, COLORS.light, COLORS.lightShadow));
  }
}
