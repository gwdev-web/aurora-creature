import { Bestiary } from '../data/creatures';
import { Regions } from '../data/regions';
import { GameState, type GameStateData } from './GameState';

/** Resumo de um slot para a tela de escolha. */
export interface SlotSummary {
  slot: number;
  region: string;
  lead: string;
  leadLevel: number;
  partySize: number;
  money: number;
  caught: number;
  badges: number;
  savedAt: number;
}

/** Guarda até 3 partidas no localStorage, uma por slot (1, 2 e 3). */
export class SaveManager {
  static readonly SLOTS = 3;
  /** Chave da versão antiga (um save só); é migrada para o slot 1. */
  private static readonly LEGACY_KEY = 'aurora-creature:save';

  constructor(private readonly prefix = 'aurora-creature:slot') {
    this.migrateLegacy();
  }

  private key(slot: number) { return `${this.prefix}${slot}`; }

  private static valid(slot: number) { return Number.isInteger(slot) && slot >= 1 && slot <= SaveManager.SLOTS; }

  save(slot: number, state: GameState): boolean {
    if (!SaveManager.valid(slot)) return false;
    try {
      const data = { ...state.toJSON(), savedAt: Date.now() };
      localStorage.setItem(this.key(slot), JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }

  private readData(slot: number): GameStateData | null {
    try {
      const raw = localStorage.getItem(this.key(slot));
      if (!raw) return null;
      const data = JSON.parse(raw) as GameStateData;
      return data?.version === 1 && Array.isArray(data.party) && data.party.length ? data : null;
    } catch {
      return null;
    }
  }

  load(slot: number): GameState | null {
    const data = SaveManager.valid(slot) ? this.readData(slot) : null;
    return data ? GameState.fromJSON(data) : null;
  }

  has(slot: number) { return this.readData(slot) !== null; }

  get anySaved() { return this.list().some((s) => s !== null); }

  clear(slot: number) { localStorage.removeItem(this.key(slot)); }

  /** Resumo de cada slot (null = vazio). */
  list(): (SlotSummary | null)[] {
    return Array.from({ length: SaveManager.SLOTS }, (_, i) => {
      const slot = i + 1;
      const d = this.readData(slot);
      if (!d) return null;
      const lead = d.party[0];
      return {
        slot,
        region: Regions.get(d.region).name,
        lead: Bestiary.get(lead.species).name,
        leadLevel: lead.level,
        partySize: d.party.length,
        money: d.money,
        caught: d.caught.length,
        badges: d.badges?.length ?? 0,
        savedAt: d.savedAt ?? 0,
      };
    });
  }

  /** Slot mais recente (para o CONTINUAR já vir selecionado). */
  latestSlot(): number {
    const saved = this.list().filter((s): s is SlotSummary => s !== null);
    if (!saved.length) return 1;
    return saved.reduce((a, b) => (b.savedAt > a.savedAt ? b : a)).slot;
  }

  private migrateLegacy() {
    try {
      const raw = localStorage.getItem(SaveManager.LEGACY_KEY);
      if (!raw) return;
      if (!localStorage.getItem(this.key(1))) localStorage.setItem(this.key(1), raw);
      localStorage.removeItem(SaveManager.LEGACY_KEY);
    } catch {
      // localStorage indisponível: nada a migrar.
    }
  }
}
