import { H, W, Scene } from '../engine/Game';
import { I18n } from '../i18n/I18n';
import { CreatureSprites } from '../engine/sprites';
import { COLORS, Menu, type Painter } from '../engine/ui';
import { Regions } from '../data/regions';
import { StarterScene } from './StarterScene';
import { TitleScene } from './TitleScene';

/** Escolha da região de origem: define o trio inicial e a fauna da grama. */
export class RegionSelectScene extends Scene {
  private menu = new Menu();

  onEnter() { void this.flow(); }

  private async flow() {
    const regions = Regions.all();
    const i = await this.menu.open(regions.map((r) => r.name), { x: 4, y: 24, w: 104 });
    if (i < 0) {
      this.game.setScene(new TitleScene(this.game));
      return;
    }
    this.game.setScene(new StarterScene(this.game, regions[i].id));
  }

  update() { this.menu.update(this.game.input); }

  render(p: Painter) {
    TitleScene.drawSky(p, this.game.time);
    p.box(0, 0, W, 20, 'menu');
    p.text('DE ONDE VÊM SUAS CRIATURAS?', W / 2, 7, undefined, undefined, 6, 'center');
    const region = Regions.all()[this.menu.index];
    p.box(112, 24, 124, 116, 'menu');
    p.text(region.name, 174, 32, COLORS.accent, COLORS.inkShadow, 6, 'center');
    region.starters.forEach((id, k) => CreatureSprites.draw(p, id, 134 + k * 40, 92, { scale: 1.2 }));
    p.wrap(I18n.t(region.description), 108, 5).forEach((ln, k) => p.textRaw(ln, 174, 104 + k * 9, undefined, undefined, 5, 'center'));
    this.menu.render(p);
    p.text('A: escolher   B: voltar', W / 2, H - 9, COLORS.light, null, 5, 'center');
  }
}
