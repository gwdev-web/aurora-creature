import { H, W, Scene, type Game } from '../engine/Game';
import { I18n } from '../i18n/I18n';
import { CreatureSprites } from '../engine/sprites';
import { COLORS, Dialog, Menu, type Painter } from '../engine/ui';
import { Regions, type Region } from '../data/regions';
import { TYPE_INFO } from '../data/types';
import { Bestiary } from '../data/creatures';
import { Creature } from '../core/Creature';
import { GameState } from '../core/GameState';
import { RegionSelectScene } from './RegionSelectScene';
import { OverworldScene } from './OverworldScene';
import { MapRegistry } from '../world/MapRegistry';

/** Laboratório do Prof. Ipê: o jogador escolhe uma das 3 criaturas iniciais da região. */
export class StarterScene extends Scene {
  private dialog = new Dialog();
  private menu = new Menu();
  private region: Region;
  private index = 0;
  /** Só aceita setas e A quando nenhum diálogo/menu está aberto. */
  private choosing = false;

  constructor(game: Game, regionId: string) {
    super(game);
    this.region = Regions.get(regionId);
  }

  onEnter() {
    this.game.audio.music('vila');
    void this.intro();
  }

  private say(msg: string, linger = false) { return this.dialog.show(this.game.painter, msg, { linger }); }

  private async intro() {
    await this.say(`PROF. IPÊ: Olá! Bem-vindo ao meu laboratório na VILA AURORA.`);
    await this.say(I18n.t('Estas três criaturas vieram da região {region}. Escolha uma para ser sua parceira!', { region: I18n.t(this.region.name) }));
    this.choosing = true;
  }

  private async confirm() {
    this.choosing = false;
    const sp = Bestiary.get(this.region.starters[this.index]);
    const types = sp.types.map((t) => I18n.t(TYPE_INFO[t].label)).join('/');
    await this.say(I18n.t('Você quer o {name}, do tipo {types}?', { name: sp.name, types }), true);
    const yes = await this.menu.open(['SIM', 'NÃO'], { w: 56 });
    this.dialog.clear();
    if (yes !== 0) {
      this.choosing = true;
      return;
    }
    const starter = Creature.create(sp.id, 5);
    this.game.state = GameState.newGame(this.region.id, starter, { ...MapRegistry.NEW_GAME });
    await this.say(I18n.t('Você recebeu {name}!', { name: sp.name }));
    await this.say('PROF. IPÊ: Cuide bem dela. A ROTA 1 fica ao sul da vila. Boa viagem!');
    this.game.setScene(new OverworldScene(this.game));
  }

  update(dt: number) {
    const input = this.game.input;
    this.dialog.update(dt, input);
    this.menu.update(input);
    if (!this.choosing) return;
    if (input.justPressed('left')) this.index = (this.index + 2) % 3;
    else if (input.justPressed('right')) this.index = (this.index + 1) % 3;
    else if (input.justPressed('a')) { input.consume(); void this.confirm(); }
    else if (input.justPressed('b')) this.game.setScene(new RegionSelectScene(this.game));
  }

  render(p: Painter) {
    // Laboratório: piso, parede e mesa.
    p.rect(0, 0, W, H, '#d8d0b8');
    p.rect(0, 0, W, 40, '#88b0b8');
    p.rect(0, 38, W, 2, '#58808c');
    for (let x = 0; x < W; x += 16) p.rect(x, 40, 1, H - 40, '#c8c0a8');
    p.rect(30, 68, 180, 26, '#a07848');
    p.rect(30, 68, 180, 3, '#c09868');
    p.rect(30, 94, 180, 4, '#704c28');
    const t = this.game.time;
    this.region.starters.forEach((id, k) => {
      const cx = 60 + k * 60;
      const selected = k === this.index;
      const bob = selected && this.choosing ? Math.round(Math.sin(t * 8)) : 0;
      CreatureSprites.draw(p, id, cx, 72 + bob, { scale: 1.2 });
      if (selected) p.arrowDown(cx - 3, 26 + (Math.floor(t * 3) % 2), COLORS.accent);
    });
    const sp = Bestiary.get(this.region.starters[this.index]);
    if (this.choosing) {
      p.box(0, H - 48, W, 48, 'dialog');
      p.text(sp.name, 12, H - 38);
      p.text(sp.types.map((ty) => I18n.t(TYPE_INFO[ty].label)).join('/'), W - 12, H - 38, TYPE_INFO[sp.types[0]].dark, COLORS.inkShadow, 6, 'right');
      p.wrap(I18n.t(sp.entry), W - 24, 5).slice(0, 2).forEach((ln, k) => p.textRaw(ln, 12, H - 25 + k * 9, undefined, undefined, 5));
    }
    this.dialog.render(p, t);
    this.menu.render(p);
  }
}
