import { Bag } from './Bag';
import { Creature, type CreatureData } from './Creature';
import type { ItemId } from './items';

export type Dir = 'up' | 'down' | 'left' | 'right';
export interface Position { x: number; y: number; dir: Dir; }

/** Posição salva: inclui o mapa (saves antigos sem mapa caem na Vila Aurora). */
export interface SavedPosition extends Position { map?: string; }

/** Formato salvo no localStorage. */
export interface GameStateData {
  version: 1;
  region: string;
  /** Espécie da criatura inicial (o rival escolhe a que tem vantagem sobre ela). */
  starter: number;
  party: CreatureData[];
  box: CreatureData[];
  bag: Record<ItemId, number>;
  money: number;
  pos: SavedPosition;
  /** Onde o jogador volta depois de uma derrota (último Abrigo usado). */
  respawn?: SavedPosition;
  defeated: string[];
  caught: number[];
  seen: number[];
  /** Insígnias de ginásio conquistadas. */
  badges?: string[];
  /** Momento do último save (ms desde 1970). */
  savedAt?: number;
}

/** Tudo o que pertence a uma partida: time, caixa, bolsa, dinheiro, posição e progresso. */
export class GameState {
  static readonly MAX_PARTY = 6;

  region: string;
  starter: number;
  party: Creature[];
  box: Creature[];
  bag: Bag;
  money: number;
  pos: SavedPosition;
  respawn: SavedPosition | null;
  /** IDs dos treinadores já vencidos. */
  defeated: Set<string>;
  caught: Set<number>;
  seen: Set<number>;
  badges: Set<string>;

  private constructor(data: GameStateData) {
    this.region = data.region;
    this.starter = data.starter ?? data.party[0]?.species;
    this.party = data.party.map((c) => Creature.fromJSON(c));
    this.box = data.box.map((c) => Creature.fromJSON(c));
    this.bag = new Bag(data.bag);
    this.money = data.money;
    this.pos = { ...data.pos };
    this.respawn = data.respawn ? { ...data.respawn } : null;
    this.defeated = new Set(data.defeated);
    this.caught = new Set(data.caught);
    this.seen = new Set(data.seen);
    this.badges = new Set(data.badges ?? []);
  }

  static newGame(region: string, starter: Creature, pos: SavedPosition): GameState {
    return new GameState({
      version: 1, region, starter: starter.species, party: [starter.toJSON()], box: [],
      bag: { capsula: 5, supercapsula: 0, tonico: 3, supertonico: 0 },
      money: 3000, pos, defeated: [], caught: [starter.species], seen: [starter.species],
    });
  }

  static fromJSON(data: GameStateData): GameState { return new GameState(data); }

  toJSON(): GameStateData {
    return {
      version: 1, region: this.region, starter: this.starter,
      party: this.party.map((c) => c.toJSON()), box: this.box.map((c) => c.toJSON()),
      bag: this.bag.toJSON(), money: this.money, pos: { ...this.pos }, respawn: this.respawn ? { ...this.respawn } : undefined,
      defeated: [...this.defeated], caught: [...this.caught], seen: [...this.seen], badges: [...this.badges],
    };
  }

  /** Coloca a criatura no time ou, se estiver cheio, na caixa. */
  addCreature(c: Creature): 'party' | 'box' {
    this.registerCaught(c.species);
    if (this.party.length < GameState.MAX_PARTY) {
      this.party.push(c);
      return 'party';
    }
    this.box.push(c);
    return 'box';
  }

  registerCaught(species: number) {
    this.caught.add(species);
    this.seen.add(species);
  }

  registerSeen(species: number) { this.seen.add(species); }

  get lead(): Creature | undefined { return this.party.find((c) => !c.isFainted); }
  get hasHealthy() { return this.party.some((c) => !c.isFainted); }

  healParty() { for (const c of this.party) c.heal(); }
}
