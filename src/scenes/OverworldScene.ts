import { H, W, Scene, type Game } from '../engine/Game';
import { I18n } from '../i18n/I18n';
import { COLORS, Dialog, Menu, type Painter } from '../engine/ui';
import type { GameState } from '../core/GameState';
import { WildEncounters } from '../core/WildEncounters';
import type { TrackId } from '../engine/audio/tracks';
import type { Creature } from '../core/Creature';
import { BattleScene, type BattleResult } from './BattleScene';
import { PartyScene } from './PartyScene';
import { EvolutionScene } from './EvolutionScene';
import { DIRS, GameMap, type Building, type MapPosition } from '../world/GameMap';
import { MapRegistry } from '../world/MapRegistry';
import { ShopScene } from './ShopScene';
import { TrainerCardScene } from './TrainerCardScene';
import { TitleScene } from './TitleScene';
import { TrainerTeams } from '../core/TrainerTeams';
import { TrainerBattleScene } from './TrainerBattleScene';
import { Npc } from '../world/Npc';
import { Player } from '../world/Player';
import { WorldRenderer } from '../world/WorldRenderer';

const T = GameMap.TILE;
const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' } as const;

/** Exploração do mundo: movimento em grade, colisão, NPCs, prédios e troca de mapas. */
export class OverworldScene extends Scene {
  protected map: GameMap;
  protected readonly state: GameState;
  protected readonly player: Player;
  protected npcs: Npc[];
  protected readonly dialog = new Dialog();
  protected readonly menu = new Menu();
  private readonly world: WorldRenderer;
  private readonly encounters: WildEncounters;
  /** Enquanto um evento (diálogo, batalha) roda, o jogador não anda. */
  protected busy = false;
  private waits: { t: number; resolve: () => void }[] = [];
  /** Mostra o dinheiro enquanto o menu START está aberto. */
  private showMoney = false;
  /** Evita repetir o som de esbarrão a cada frame. */
  private bumpCooldown = 0;
  /** Clarão branco ao curar o time. */
  private healFlash = 0;
  /** Treinador com o balão "!" na cabeça. */
  private exclaimNpc: Npc | null = null;
  /** Escurecimento da tela ao trocar de mapa (0 a 1). */
  private fade = 0;
  private readonly teams: TrainerTeams;

  constructor(game: Game) {
    super(game);
    if (!game.state) throw new Error('OverworldScene precisa de um GameState');
    this.state = game.state;
    this.map = MapRegistry.get(this.state.pos.map ?? MapRegistry.NEW_GAME.map);
    this.player = new Player(this.state.pos);
    this.npcs = this.createNpcs();
    this.world = new WorldRenderer(game.painter);
    this.encounters = new WildEncounters(this.state.region);
    this.teams = new TrainerTeams(this.state.region, this.state.starter);
  }

  /** Ao entrar no mapa (início do jogo ou CONTINUAR), a partida já fica salva. */
  onEnter() { this.autosave(); }

  /** Música da área onde o jogador está. */
  protected areaMusic(): TrackId { return this.map.musicAt(this.player.y); }

  private createNpcs() { return this.map.npcs.map((def) => new Npc(def)); }

  /** Troca o mapa sem transição (usado ao carregar e depois de uma derrota). */
  protected loadMap(to: MapPosition) {
    this.map = MapRegistry.get(to.map);
    this.npcs = this.createNpcs();
    this.player.teleport(to);
    this.state.pos = { ...this.player.position, map: this.map.id };
  }

  /** Troca de mapa com a tela escurecendo e clareando. */
  protected async changeMap(to: MapPosition) {
    for (let i = 1; i <= 8; i++) { this.fade = i / 8; await this.wait(0.025); }
    this.loadMap(to);
    for (let i = 7; i >= 0; i--) { this.fade = i / 8; await this.wait(0.025); }
    this.autosave();
  }

  protected wait(seconds: number) { return new Promise<void>((resolve) => this.waits.push({ t: seconds, resolve })); }

  protected say(msg: string, linger = false) { return this.dialog.show(this.game.painter, msg, { linger }); }

  /** Roda um evento bloqueando o movimento até ele terminar. */
  protected async run(event: () => Promise<void>) {
    this.busy = true;
    try {
      await event();
    } finally {
      this.busy = false;
      this.player.resetHold();
      this.game.input.consume();
    }
  }

  protected npcAt(x: number, y: number) { return this.npcs.find((n) => n.x === x && n.y === y); }

  protected canWalk(x: number, y: number) { return !this.map.isSolid(x, y) && !this.npcAt(x, y); }

  update(dt: number) {
    const input = this.game.input;
    this.game.audio.music(this.areaMusic());
    this.bumpCooldown = Math.max(0, this.bumpCooldown - dt);
    this.dialog.update(dt, input);
    this.menu.update(input);
    this.healFlash = Math.max(0, this.healFlash - dt * 1.5);
    for (const n of this.npcs) n.updateMove(dt);
    for (const w of [...this.waits]) {
      w.t -= dt;
      if (w.t <= 0) {
        this.waits.splice(this.waits.indexOf(w), 1);
        w.resolve();
      }
    }
    if (this.player.moving) {
      if (this.player.updateMove(dt)) {
        this.state.pos = { ...this.player.position, map: this.map.id };
        void this.onStep();
      }
      return;
    }
    if (this.busy) return;
    if (input.justPressed('a')) {
      input.consume();
      void this.run(() => this.interact());
      return;
    }
    if (input.justPressed('start')) {
      input.consume();
      void this.run(() => this.openStartMenu());
      return;
    }
    const dir = this.player.wantedMove(dt, input);
    if (!dir) return;
    this.player.dir = dir;
    const { x, y } = this.player.facing;
    const door = dir === 'up' ? this.map.doorAt(x, y) : undefined;
    if (door) {
      void this.run(() => this.enterBuilding(door));
      return;
    }
    if (this.canWalk(x, y)) this.player.startMove(dir);
    else if (this.bumpCooldown <= 0) {
      this.game.audio.sfx('bump');
      this.bumpCooldown = 0.3;
    }
  }

  /** Salva a partida com a posição atual. */
  protected autosave() {
    this.state.pos = { ...this.player.position, map: this.map.id };
    return this.game.saves.save(this.game.slot, this.state);
  }

  /** Entrar num prédio: casa e Abrigo curam, Mercado abre a loja, laboratório mostra o registro. */
  private async enterBuilding(b: Building) {
    this.game.audio.sfx('door');
    switch (b.kind) {
      case 'casa':
        await this.say('MÃE: Você parece cansado! Descanse um pouco.');
        await this.healEffect();
        await this.say('Suas criaturas descansaram e estão em plena forma!');
        break;
      case 'abrigo': {
        await this.say('ATENDENTE: Bem-vindo ao ABRIGO! Quer que eu cuide das suas criaturas?', true);
        const ok = await this.menu.open(['SIM', 'NÃO'], { w: 56 });
        this.dialog.clear();
        if (ok !== 0) {
          await this.say('ATENDENTE: Volte quando precisar!');
          break;
        }
        await this.healEffect();
        this.state.respawn = { map: this.map.id, x: b.door.x, y: b.door.y + 1, dir: 'down' };
        await this.say('ATENDENTE: Pronto! Suas criaturas estão em plena forma. Volte sempre!');
        break;
      }
      case 'mercado':
        await this.game.push(new ShopScene(this.game));
        break;
      case 'ginasio':
        if (b.to) {
          await this.changeMap(b.to);
          return;
        }
        await this.say('O GINÁSIO está fechado para preparar os desafios. Volte em breve!');
        break;
      case 'laboratorio':
        await this.say(I18n.t('ASSISTENTE: O PROF. IPÊ está lá fora. Seu registro tem {caught} criaturas capturadas e {seen} vistas.', { caught: this.state.caught.size, seen: this.state.seen.size }));
        break;
    }
    this.autosave();
  }

  private async healEffect() {
    this.state.healParty();
    this.game.audio.sfx('heal');
    this.healFlash = 1;
    await this.wait(1);
  }

  /** Menu START: time, bolsa, salvar, voltar ao título. */
  protected async openStartMenu() {
    const options = ['CRIATURAS', 'BOLSA', 'FICHA', 'SALVAR', 'TÍTULO', 'FECHAR'];
    let start = 0;
    for (;;) {
      this.showMoney = true;
      const i = await this.menu.open(options, { x: W - 84, y: 2, w: 84 }, start);
      this.showMoney = false;
      start = Math.max(0, i);
      if (i === 0) await this.game.push<number>(new PartyScene(this.game, 'view'));
      else if (i === 1) await this.openBag();
      else if (i === 2) await this.game.push(new TrainerCardScene(this.game));
      else if (i === 3) {
        const ok = this.autosave();
        if (ok) this.game.audio.sfx('save');
        await this.say(ok ? 'Jogo salvo!' : 'Não foi possível salvar neste navegador.');
      } else if (i === 4) {
        await this.say('Voltar ao título? O progresso que não foi salvo será perdido.', true);
        const yes = await this.menu.open(['SIM', 'NÃO'], { w: 56 }, 1);
        this.dialog.clear();
        if (yes === 0) {
          this.game.setScene(new TitleScene(this.game));
          return;
        }
      } else return;
    }
  }

  /** Bolsa fora da batalha: tônicos curam uma criatura do time. */
  private async openBag() {
    for (;;) {
      const entries = this.state.bag.entries();
      if (!entries.length) {
        await this.say('A bolsa está vazia!');
        return;
      }
      const i = await this.menu.open(entries.map(({ item, count }) => `${I18n.t(item.name)} x${count}`), { x: 64, y: 2, w: 176 });
      if (i < 0) return;
      const { item } = entries[i];
      if (!item.heal) {
        await this.say('Não dá para usar isso agora.');
        continue;
      }
      const target = await this.game.push<number>(new PartyScene(this.game, 'pick', { prompt: 'Usar em qual criatura?' }));
      if (target < 0) continue;
      const c = this.state.party[target];
      if (c.isFainted || c.hp >= c.stats.hp) {
        await this.say('Não vai ter efeito.');
        continue;
      }
      this.state.bag.use(item.id);
      await this.say(I18n.t('{name} recuperou {hp} de HP!', { name: c.name, hp: c.restoreHp(item.heal) }));
    }
  }

  /** Chamado quando o jogador termina um passo: um treinador pode avistá-lo, ou uma criatura surgir da grama. */
  protected async onStep(): Promise<void> {
    if (this.busy) return;
    const warp = this.map.warpAt(this.player.x, this.player.y);
    if (warp) {
      await this.run(() => this.changeMap(warp.to));
      return;
    }
    const watcher = this.npcs.find((n) => this.canSee(n));
    if (watcher) {
      await this.run(() => this.trainerEncounter(watcher, true));
      return;
    }
    if (!this.map.isTallGrass(this.player.x, this.player.y)) return;
    const wild = this.encounters.roll(this.map, this.player.y);
    if (wild) {
      this.game.audio.sfx('encounter');
      await this.run(() => this.wildBattle(wild));
    }
  }

  private async wildBattle(wild: Creature) {
    const result = await this.game.push<BattleResult>(new BattleScene(this.game, [wild]));
    if (result === 'lose') await this.blackout();
    else await this.checkEvolutions();
    this.autosave();
  }

  /** Depois da batalha, evolui quem alcançou o nível. */
  protected async checkEvolutions() {
    for (const c of this.state.party) {
      if (c.evolutionTarget() !== null) await this.game.push(new EvolutionScene(this.game, c));
    }
  }

  /** Derrota: perde metade do dinheiro e volta para a frente do Abrigo com o time curado. */
  protected async blackout() {
    const lost = Math.floor(this.state.money / 2);
    this.state.money -= lost;
    await this.say(I18n.t('Você perdeu ${money} na correria...', { money: lost }));
    this.state.healParty();
    const r = this.state.respawn ?? MapRegistry.DEFAULT_RESPAWN;
    this.loadMap({ map: r.map ?? MapRegistry.DEFAULT_RESPAWN.map, x: r.x, y: r.y, dir: r.dir });
    await this.say('Você correu para o ABRIGO, e suas criaturas foram curadas.');
  }

  protected async interact() {
    const { x, y } = this.player.facing;
    const npc = this.npcAt(x, y);
    if (!npc) return;
    npc.dir = OPPOSITE[this.player.dir];
    if (npc.trainer) {
      if (this.state.defeated.has(npc.id)) await this.say(`${I18n.t(npc.name)}: ${I18n.t(npc.trainer.after)}`);
      else await this.trainerEncounter(npc, false);
      return;
    }
    for (const line of npc.lines) await this.say(line);
  }

  /** O treinador vê o jogador se ele está na linha do olhar, dentro do alcance e sem obstáculos no meio. */
  protected canSee(npc: Npc): boolean {
    if (!npc.trainer || this.state.defeated.has(npc.id)) return false;
    const d = DIRS[npc.dir];
    for (let i = 1; i <= npc.trainer.range; i++) {
      const x = npc.x + d.dx * i, y = npc.y + d.dy * i;
      if (x === this.player.x && y === this.player.y) return true;
      if (this.map.isSolid(x, y) || this.npcAt(x, y)) return false;
    }
    return false;
  }

  /** "!" sobre o treinador, ele anda até o jogador, fala e começa a batalha. */
  private async trainerEncounter(npc: Npc, spotted: boolean) {
    const trainer = npc.trainer!;
    if (spotted) {
      this.exclaimNpc = npc;
      this.game.audio.sfx('exclaim');
      await this.wait(0.7);
      this.exclaimNpc = null;
      const d = DIRS[npc.dir];
      while (npc.x + d.dx !== this.player.x || npc.y + d.dy !== this.player.y) {
        npc.startMove(npc.dir);
        while (npc.moving) await this.wait(0.016);
      }
      this.player.dir = OPPOSITE[npc.dir];
    }
    await this.say(`${I18n.t(npc.name)}: ${I18n.t(trainer.intro)}`);
    const team = this.teams.build({ id: npc.id, levels: trainer.levels, count: trainer.count, rival: trainer.rival, species: trainer.species, team: trainer.team });
    const result = await this.game.push<BattleResult>(new TrainerBattleScene(this.game, team, { name: npc.name, defeat: trainer.defeat, reward: trainer.reward }));
    if (result === 'win') {
      this.state.defeated.add(npc.id);
      if (trainer.badge && !this.state.badges.has(trainer.badge.id)) {
        this.state.badges.add(trainer.badge.id);
        this.game.audio.sfx('badge');
        await this.say(I18n.t('Você recebeu a {badge} de {name}!', { badge: I18n.t(trainer.badge.name), name: I18n.t(npc.name) }));
        await this.say(`${I18n.t(npc.name)}: ${I18n.t(trainer.after)}`);
      }
      await this.checkEvolutions();
    } else await this.blackout();
    this.autosave();
  }

  /** Canto superior esquerdo da câmera, presa às bordas do mapa. */
  private camera() {
    const px = this.player.pixel;
    // Mapas menores que a tela ficam centralizados.
    const axis = (size: number, view: number, pos: number) =>
      size <= view ? -Math.round((view - size) / 2) : Math.round(Math.max(0, Math.min(size - view, pos + T / 2 - view / 2)));
    return { cx: axis(this.map.pixelWidth, W, px.x), cy: axis(this.map.pixelHeight, H, px.y) };
  }

  render(p: Painter) {
    const { cx, cy } = this.camera();
    p.rect(0, 0, W, H, '#101418');
    const x0 = Math.max(0, Math.floor(cx / T)), y0 = Math.max(0, Math.floor(cy / T));
    const x1 = Math.min(this.map.width - 1, Math.floor((cx + W) / T)), y1 = Math.min(this.map.height - 1, Math.floor((cy + H) / T));
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        this.world.tile(this.map.tileAt(tx, ty), tx * T - cx, ty * T - cy, tx, ty, this.game.time, this.map);
      }
    }
    for (const b of this.map.buildings) this.world.building(b, cx, cy);
    const chars = [...this.npcs, this.player].sort((a, b) => a.pixel.y - b.pixel.y);
    for (const c of chars) {
      const px = c.pixel;
      const sx = Math.round(px.x - cx), sy = Math.round(px.y - cy) - 2;
      this.world.character(c, sx, sy);
      if (!c.moving && this.map.isTallGrass(c.x, c.y)) this.world.grassOver(sx, sy + 2, this.map.theme);
    }
    this.renderOverlay(p, cx, cy);
    if (this.fade > 0) p.rect(0, 0, W, H, `rgba(0,0,0,${this.fade})`);
    this.dialog.render(p, this.game.time);
    this.menu.render(p);
  }

  /** Ganchos para desenhar por cima do mapa (balões, menus). */
  protected renderOverlay(p: Painter, cx: number, cy: number) {
    if (this.healFlash > 0) p.rect(0, 0, W, H, `rgba(248,248,248,${Math.min(0.8, this.healFlash)})`);
    if (this.showMoney && this.menu.active) {
      p.box(0, 2, 84, 22, 'menu');
      p.text('$' + this.state.money, 76, 10, COLORS.ink, COLORS.inkShadow, 6, 'right');
    }
    if (!this.exclaimNpc) return;
    const px = this.exclaimNpc.pixel;
    this.renderer.exclaim(Math.round(px.x - cx), Math.round(px.y - cy) - 2);
  }

  protected get renderer() { return this.world; }
}
