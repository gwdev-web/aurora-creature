import type { Wave } from './tracks';

/** Um pedaço de som: tom (com deslize de frequência) ou ruído. */
export interface SfxPart { wave: Wave; from: number; to?: number; dur: number; at?: number; vol?: number; }

export type SfxId =
  | 'cursor' | 'confirm' | 'cancel' | 'bump' | 'door' | 'hit' | 'super' | 'weak' | 'faint'
  | 'throw' | 'shake' | 'caught' | 'heal' | 'levelup' | 'encounter' | 'buy' | 'save' | 'exclaim' | 'badge';

/** Arpejo rápido: várias notas em sequência. */
const arp = (wave: Wave, freqs: number[], step: number, vol = 0.18): SfxPart[] =>
  freqs.map((f, i) => ({ wave, from: f, dur: step * 1.1, at: i * step, vol }));

/** Efeitos sonoros originais, sintetizados na hora. */
export const SFX: Record<SfxId, SfxPart[]> = {
  cursor: [{ wave: 'square', from: 1200, dur: 0.03, vol: 0.08 }],
  confirm: [{ wave: 'square', from: 880, dur: 0.04, vol: 0.12 }, { wave: 'square', from: 1320, dur: 0.06, at: 0.04, vol: 0.12 }],
  cancel: [{ wave: 'square', from: 520, to: 300, dur: 0.08, vol: 0.12 }],
  bump: [{ wave: 'square', from: 110, to: 80, dur: 0.08, vol: 0.15 }],
  door: [{ wave: 'noise', from: 0, dur: 0.08, vol: 0.2 }, { wave: 'triangle', from: 220, to: 440, dur: 0.15, at: 0.05, vol: 0.3 }],
  hit: [{ wave: 'noise', from: 0, dur: 0.12, vol: 0.35 }, { wave: 'square', from: 220, to: 70, dur: 0.12, vol: 0.15 }],
  super: [{ wave: 'noise', from: 0, dur: 0.2, vol: 0.45 }, { wave: 'sawtooth', from: 400, to: 50, dur: 0.22, vol: 0.18 }],
  weak: [{ wave: 'noise', from: 0, dur: 0.06, vol: 0.2 }, { wave: 'square', from: 160, to: 110, dur: 0.1, vol: 0.12 }],
  faint: [{ wave: 'square', from: 700, to: 60, dur: 0.7, vol: 0.15 }],
  throw: [{ wave: 'triangle', from: 300, to: 1000, dur: 0.3, vol: 0.3 }],
  shake: [{ wave: 'square', from: 240, dur: 0.05, vol: 0.12 }, { wave: 'square', from: 180, dur: 0.05, at: 0.08, vol: 0.12 }],
  caught: arp('square', [1047, 1319, 1568, 2093], 0.08, 0.14),
  heal: arp('triangle', [523, 659, 784, 1047, 784, 1047, 1319], 0.11, 0.35),
  levelup: arp('square', [784, 1047, 1319, 1568], 0.07, 0.13),
  encounter: [...arp('square', [1568, 1175, 1568, 1175, 1568, 1175], 0.05, 0.1), { wave: 'sawtooth', from: 200, to: 800, dur: 0.3, at: 0.3, vol: 0.1 }],
  buy: [{ wave: 'square', from: 1200, dur: 0.05, vol: 0.1 }, { wave: 'square', from: 1800, dur: 0.1, at: 0.06, vol: 0.1 }],
  save: arp('triangle', [1047, 1568], 0.1, 0.3),
  exclaim: [{ wave: 'square', from: 1400, to: 1800, dur: 0.12, vol: 0.14 }],
  badge: arp('square', [523, 659, 784, 1047, 1319, 1568, 2093], 0.09, 0.14),
};
