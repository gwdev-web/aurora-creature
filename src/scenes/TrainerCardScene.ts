import { H, W, Scene, type Game } from '../engine/Game';
import { I18n } from '../i18n/I18n';
import { COLORS, type Painter } from '../engine/ui';
import { Bestiary } from '../data/creatures';
import { Regions } from '../data/regions';
import type { GameState } from '../core/GameState';

/** Insígnias do jogo, na ordem dos ginásios. */
export const BADGES: { id: string; name: string; leader: string; color: string }[] = [
  { id: 'onda', name: 'ONDA', leader: 'MARINA', color: '#3878c8' },
  { id: 'brasa', name: 'BRASA', leader: 'IARA', color: '#e85820' },
  { id: 'geada', name: 'GEADA', leader: 'BÓREAS', color: '#58a8d8' },
];

/** Ficha do treinador: região, dinheiro, registro de criaturas e insígnias. */
export class TrainerCardScene extends Scene {
  private readonly state: GameState;

  constructor(game: Game) {
    super(game);
    if (!game.state) throw new Error('TrainerCardScene precisa de um GameState');
    this.state = game.state;
  }

  update() {
    const input = this.game.input;
    if (input.justPressed('a') || input.justPressed('b') || input.justPressed('start')) {
      this.game.audio.sfx('cancel');
      this.game.pop();
    }
  }

  render(p: Painter) {
    p.rect(0, 0, W, H, '#14303a');
    p.box(8, 6, W - 16, H - 12, 'menu');
    p.rect(11, 9, W - 22, 16, '#2f8f7f');
    p.text('FICHA DO TREINADOR', W / 2, 14, '#f8f8f0', '#1d5a63', 6, 'center');
    const s = this.state;
    const rows: [string, string][] = [
      ['REGIÃO', Regions.get(s.region).name],
      ['DINHEIRO', '$' + s.money],
      ['CAPTURADAS', I18n.t('{n} de {total}', { n: s.caught.size, total: Bestiary.count })],
      ['VISTAS', I18n.t('{n} de {total}', { n: s.seen.size, total: Bestiary.count })],
      ['TIME', I18n.t('{party} no time, {box} na caixa', { party: s.party.length, box: s.box.length })],
      ['TREINADORES', I18n.t('{n} vencidos', { n: s.defeated.size })],
    ];
    rows.forEach(([k, v], i) => {
      p.text(k, 18, 30 + i * 10, COLORS.accent, null, 5);
      p.text(v, 84, 30 + i * 10, COLORS.ink, null, 5);
    });
    p.text('INSÍGNIAS', W / 2, 96, COLORS.ink, COLORS.inkShadow, 6, 'center');
    BADGES.forEach((b, i) => {
      const cx = W / 2 - 60 + i * 60;
      const has = s.badges.has(b.id);
      this.badge(p, cx, 118, has ? b.color : '#c8c8c0', has);
      p.text(has ? b.name : '???', cx, 132, has ? COLORS.ink : '#a0a098', null, 5, 'center');
      p.text(b.leader, cx, 140, '#808878', null, 4, 'center');
    });
  }

  /** Insígnia em forma de losango, com brilho quando conquistada. */
  private badge(p: Painter, cx: number, cy: number, color: string, shine: boolean) {
    for (let i = 0; i < 9; i++) {
      const w = (i < 5 ? i : 8 - i) * 2 + 2;
      p.rect(cx - w / 2, cy - 9 + i * 2, w, 2, color);
    }
    if (shine && Math.floor(this.game.time * 2) % 2 === 0) p.rect(cx - 3, cy - 5, 2, 2, '#f8f8f0');
  }
}
