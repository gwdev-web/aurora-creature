import { H, W, Scene, type Game } from '../engine/Game';
import { I18n } from '../i18n/I18n';
import { CreatureSprites } from '../engine/sprites';
import { Dialog, type Painter } from '../engine/ui';
import { MoveBook } from '../data/moves';
import type { Creature } from '../core/Creature';

/** Animação de evolução: silhuetas alternando cada vez mais rápido até a forma nova aparecer. */
export class EvolutionScene extends Scene {
  private readonly dialog = new Dialog();
  private readonly from: number;
  private readonly to: number;
  /** 0 = antes, 1 = alternando, 2 = forma nova. */
  private phase = 0;
  private t = 0;
  private flash = 0;

  constructor(game: Game, private readonly creature: Creature) {
    super(game);
    this.from = creature.species;
    this.to = creature.evolutionTarget() ?? creature.species;
  }

  onEnter() {
    this.game.audio.music('evolucao');
    void this.flow();
  }

  private say(msg: string) { return this.dialog.show(this.game.painter, msg); }

  private async flow() {
    const oldName = this.creature.name;
    await this.say(I18n.t('O quê? {name} está evoluindo!', { name: oldName }));
    this.phase = 1;
    this.t = 0;
    await new Promise<void>((resolve) => { this.done = resolve; });
    this.creature.evolve();
    this.game.audio.sfx('caught');
    this.phase = 2;
    this.flash = 0.5;
    await this.say(I18n.t('Parabéns! {name} evoluiu para {evo}!', { name: oldName, evo: this.creature.name }));
    for (const id of this.creature.newMovesAt()) {
      const result = this.creature.learnMove(id);
      const name = I18n.t(MoveBook.get(id).name);
      if (result === true) await this.say(I18n.t('{name} aprendeu {move}!', { name: this.creature.name, move: name }));
      else if (typeof result === 'string') await this.say(I18n.t('{name} esqueceu {old} e aprendeu {move}!', { name: this.creature.name, old: I18n.t(result), move: name }));
    }
    this.game.pop();
  }

  private done?: () => void;

  update(dt: number) {
    this.dialog.update(dt, this.game.input);
    this.flash = Math.max(0, this.flash - dt);
    if (this.phase !== 1) return;
    this.t += dt;
    if (this.t >= 3.2 && this.done) {
      const d = this.done;
      this.done = undefined;
      d();
    }
  }

  render(p: Painter) {
    p.rect(0, 0, W, H, '#14303a');
    const t = this.game.time;
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2 + t * 0.5;
      p.rect(W / 2 + Math.cos(a) * 70, 62 + Math.sin(a) * 40, 2, 2, i % 2 ? '#7ef0c8' : '#f8d870');
    }
    let species = this.phase === 2 ? this.to : this.from;
    let mode: 'normal' | 'white' = 'normal';
    if (this.phase === 1) {
      // Alterna entre a forma antiga e a nova, cada vez mais rápido.
      const freq = 1.5 + this.t * this.t * 1.6;
      species = Math.floor(this.t * freq) % 2 ? this.to : this.from;
      mode = 'white';
    }
    CreatureSprites.draw(p, species, W / 2, 100, { scale: 2.5, mode });
    this.dialog.render(p, t);
    if (this.flash > 0) p.rect(0, 0, W, H, `rgba(248,248,248,${this.flash * 2})`);
  }
}
