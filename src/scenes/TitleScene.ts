import { H, W, Scene } from '../engine/Game';
import { CreatureSprites } from '../engine/sprites';
import { COLORS, Menu, type Painter } from '../engine/ui';
import { SlotScene } from './SlotScene';
import { I18n } from '../i18n/I18n';

/** Tela de título com céu de aurora animado. */
export class TitleScene extends Scene {
  private menu = new Menu();

  onEnter() {
    this.game.audio.music('titulo');
    void this.flow();
  }

  private async flow() {
    const saved = this.game.saves.anySaved;
    const language = I18n.lang === 'pt' ? 'IDIOMA: PORTUGUÊS' : 'LANGUAGE: ENGLISH';
    const options = [...(saved ? ['CONTINUAR'] : []), 'NOVO JOGO', 'SOBRE', language];
    const choice = await this.menu.open(options, { x: W / 2 - 66, y: 98 - options.length * 7, w: 132, cancelable: false });
    const option = options[choice];
    if (option === 'CONTINUAR') this.game.setScene(new SlotScene(this.game, 'load'));
    else if (option === 'NOVO JOGO') this.game.setScene(new SlotScene(this.game, 'new'));
    else if (option === language) {
      I18n.toggle();
      void this.flow();
    } else {
      window.location.href = './sobre.html';
      void this.flow();
    }
  }

  update() { this.menu.update(this.game.input); }

  render(p: Painter) {
    const t = this.game.time;
    TitleScene.drawSky(p, t);
    // Título com sombra em camadas (estilo próprio do jogo).
    const y = 22 + Math.sin(t * 1.5) * 1.5;
    p.text('AURORA', W / 2 + 2, y + 2, '#0b1620', null, 16, 'center');
    p.text('AURORA', W / 2, y, '#f8d870', '#d8783a', 16, 'center');
    p.text('CREATURE', W / 2 + 1, y + 23, '#0b1620', null, 10, 'center');
    p.text('CREATURE', W / 2, y + 22, '#7ef0c8', '#2f8f7f', 10, 'center');
    CreatureSprites.draw(p, 3, 44, 104, { scale: 1.5 });
    CreatureSprites.draw(p, 5, W - 44, 104, { scale: 1.5 });
    this.menu.render(p);
    p.text('Projeto de estudo · criaturas originais', W / 2, H - 7, COLORS.light, null, 5, 'center');
  }

  /** Céu noturno com faixas de aurora ondulando. */
  static drawSky(p: Painter, t: number) {
    p.rect(0, 0, W, H, '#0b1620');
    const bands = ['#1d5a63', '#2f8f7f', '#7ef0c8'];
    bands.forEach((color, b) => {
      for (let x = 0; x < W; x += 4) {
        const yy = 40 + b * 10 + Math.sin(x / 30 + t * (0.6 + b * 0.2) + b) * 10;
        p.rect(x, yy, 4, 6 - b, color);
      }
    });
    for (let i = 0; i < 30; i++) {
      const sx = (i * 73) % W, sy = (i * 37) % 70;
      if (Math.floor(t * 2 + i) % 5) p.rect(sx, sy, 1, 1, '#e0f4ff');
    }
    p.rect(0, 104, W, H - 104, '#14303a');
  }
}
