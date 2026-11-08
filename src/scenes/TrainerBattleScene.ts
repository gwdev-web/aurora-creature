import type { Game } from '../engine/Game';
import { I18n } from '../i18n/I18n';
import type { Creature } from '../core/Creature';
import { BattleScene, type BattleResult } from './BattleScene';

export interface TrainerInfo {
  name: string;
  /** Fala ao perder. */
  defeat: string;
  reward: number;
}

/** Batalha contra um treinador: várias criaturas em sequência, sem fuga nem captura, com recompensa. */
export class TrainerBattleScene extends BattleScene {
  constructor(game: Game, team: Creature[], private readonly trainer: TrainerInfo) {
    super(game, team);
  }

  protected get isTrainerBattle() { return true; }

  protected introMessage() {
    return I18n.t('{trainer} quer batalhar! {trainer} mandou {name}!', { trainer: I18n.t(this.trainer.name), name: this.enemy.name });
  }

  protected label(side: 'player' | 'enemy') {
    return side === 'enemy' ? I18n.t('{name} inimigo', { name: this.enemy.name }) : super.label(side);
  }

  protected async sendNextEnemy(): Promise<boolean> {
    const next = this.enemyTeam.find((c) => !c.isFainted);
    if (!next) return false;
    this.setEnemy(next);
    await this.say(I18n.t('{trainer} vai mandar {name}!', { trainer: I18n.t(this.trainer.name), name: next.name }));
    return true;
  }

  protected async onBattleEnd(result: BattleResult) {
    if (result !== 'win') return;
    await this.say(I18n.t('Você venceu {trainer}!', { trainer: I18n.t(this.trainer.name) }));
    await this.say(`${I18n.t(this.trainer.name)}: ${I18n.t(this.trainer.defeat)}`);
    this.state.money += this.trainer.reward;
    await this.say(I18n.t('Você recebeu ${reward} pela vitória.', { reward: this.trainer.reward }));
  }
}
