/**
 * Trilha original do jogo, escrita em texto.
 * Cada nota é `NOTA.DURAÇÃO` (duração em semicolcheias); `-` é pausa.
 * Percussão: `K` bumbo, `S` caixa, `H` chimbal.
 */
export type Wave = 'square' | 'triangle' | 'sawtooth' | 'sine' | 'noise';

export interface Channel { wave: Wave; volume: number; notes: string; }
export interface Track { bpm: number; channels: Channel[]; loop: boolean; }

export type TrackId = 'titulo' | 'vila' | 'rota' | 'batalha' | 'treinador' | 'vitoria' | 'evolucao' | 'ginasio';

const rep = (pattern: string, times: number) => Array(times).fill(pattern).join(' ');
const drums = (bars: number) => rep('K.4 H.2 H.2 S.4 H.2 H.2', bars);
const drumsFast = (bars: number) => rep('K.2 H.2 S.2 H.2 K.2 K.2 S.2 H.2', bars);

export const TRACKS: Record<TrackId, Track> = {
  // Tema do título: calmo, em lá menor.
  titulo: {
    bpm: 84, loop: true,
    channels: [
      { wave: 'triangle', volume: 0.35, notes: 'A4.4 C5.4 E5.6 D5.2 C5.4 B4.4 G4.8 F4.4 A4.4 C5.6 E5.2 D5.4 B4.4 E5.8' },
      { wave: 'triangle', volume: 0.3, notes: 'A2.8 E3.8 G2.8 D3.8 F2.8 C3.8 E2.8 B2.8' },
      { wave: 'square', volume: 0.05, notes: rep('A3.2 C4.2 E4.2 C4.2', 2) + ' ' + rep('G3.2 B3.2 D4.2 B3.2', 2) + ' ' + rep('F3.2 A3.2 C4.2 A3.2', 2) + ' ' + rep('E3.2 G#3.2 B3.2 G#3.2', 2) },
    ],
  },
  // Vila Aurora: alegre, em dó maior.
  vila: {
    bpm: 112, loop: true,
    channels: [
      { wave: 'square', volume: 0.12, notes: 'E5.2 G5.2 C6.4 G5.2 E5.2 D5.4 F5.2 A5.2 G5.4 E5.2 C5.2 D5.4 E5.2 G5.2 C6.4 B5.2 A5.2 G5.4 F5.2 D5.2 E5.2 D5.2 C5.8' },
      { wave: 'triangle', volume: 0.35, notes: 'C3.4 G3.4 C3.4 G3.4 F2.4 C3.4 G2.4 D3.4 C3.4 G3.4 A2.4 E3.4 F2.4 G2.4 C3.8' },
      { wave: 'noise', volume: 0.04, notes: rep('H.4 H.4 H.4 H.4', 4) },
    ],
  },
  // Rota 1: aventura, em sol maior.
  rota: {
    bpm: 132, loop: true,
    channels: [
      { wave: 'square', volume: 0.12, notes: 'D5.2 G5.2 B5.2 A5.2 G5.4 D5.4 E5.2 F#5.2 G5.2 A5.2 B5.6 -.2 C6.2 B5.2 A5.2 G5.2 F#5.4 D5.4 E5.2 F#5.2 A5.2 F#5.2 G5.8' },
      { wave: 'triangle', volume: 0.35, notes: 'G2.2 G3.2 G2.2 G3.2 D2.2 D3.2 D2.2 D3.2 C3.2 C4.2 C3.2 C4.2 G2.2 G3.2 G2.2 G3.2 A2.2 A3.2 A2.2 A3.2 D3.2 D4.2 D3.2 D4.2 C3.2 C4.2 D3.2 D4.2 G2.2 G3.2 G2.4' },
      { wave: 'noise', volume: 0.06, notes: drums(4) },
    ],
  },
  // Batalha selvagem: rápida, em mi menor.
  batalha: {
    bpm: 160, loop: true,
    channels: [
      { wave: 'square', volume: 0.11, notes: 'E5.2 E5.1 -.1 G5.2 E5.2 B5.4 A5.2 G5.2 F#5.2 F#5.1 -.1 A5.2 F#5.2 D6.4 C6.2 B5.2 E5.2 G5.2 B5.2 E6.2 D6.2 B5.2 G5.2 B5.2 C6.4 B5.4 A5.4 F#5.4' },
      { wave: 'sawtooth', volume: 0.07, notes: rep('E2.1 E3.1', 8) + ' ' + rep('D2.1 D3.1', 8) + ' ' + rep('C2.1 C3.1', 8) + ' ' + rep('B1.1 B2.1', 8) },
      { wave: 'noise', volume: 0.07, notes: drumsFast(4) },
    ],
  },
  // Batalha contra treinador: ainda mais rápida, em lá menor.
  treinador: {
    bpm: 172, loop: true,
    channels: [
      { wave: 'square', volume: 0.11, notes: 'A5.2 -.1 A5.1 G5.2 A5.2 C6.4 B5.2 G5.2 A5.2 -.1 A5.1 G5.2 E5.2 D5.4 E5.4 F5.2 A5.2 C6.2 F6.2 E6.4 D6.2 C6.2 B5.2 G#5.2 E5.2 G#5.2 A5.8' },
      { wave: 'sawtooth', volume: 0.07, notes: rep('A1.1 A2.1', 8) + ' ' + rep('A1.1 A2.1', 8) + ' ' + rep('F1.1 F2.1', 8) + ' ' + rep('E1.1 E2.1', 8) },
      { wave: 'noise', volume: 0.07, notes: drumsFast(4) },
    ],
  },
  // Ginásio: marcial, em ré menor.
  ginasio: {
    bpm: 150, loop: true,
    channels: [
      { wave: 'square', volume: 0.11, notes: 'D5.4 D5.2 F5.2 A5.4 D6.4 C6.2 A5.2 G5.2 A5.2 F5.8 D5.4 D5.2 F5.2 A5.4 D6.4 E6.2 D6.2 C#6.2 A5.2 D6.8' },
      { wave: 'sawtooth', volume: 0.07, notes: rep('D2.2 D3.2', 4) + ' ' + rep('A1.2 A2.2', 4) + ' ' + rep('D2.2 D3.2', 4) + ' ' + rep('A1.2 A2.2', 2) + ' D2.4 D3.4' },
      { wave: 'noise', volume: 0.07, notes: rep('K.2 K.2 S.4 K.2 H.2 S.4', 4) },
    ],
  },
  // Vitória: fanfarra curta.
  vitoria: {
    bpm: 140, loop: true,
    channels: [
      { wave: 'square', volume: 0.12, notes: 'C5.2 E5.2 G5.2 C6.6 A5.2 B5.2 C6.8 G5.2 A5.2 B5.2 D6.6 C6.2 B5.2 C6.8' },
      { wave: 'triangle', volume: 0.35, notes: 'C3.8 F2.4 G2.4 C3.8 G2.8 G2.4 C3.4 C3.8' },
    ],
  },
  // Evolução: crescente e misteriosa.
  evolucao: {
    bpm: 100, loop: true,
    channels: [
      { wave: 'sine', volume: 0.25, notes: 'C5.2 D5.2 E5.2 G5.2 C6.4 G5.4 D5.2 E5.2 F#5.2 A5.2 D6.8 E5.2 F#5.2 G#5.2 B5.2 E6.8' },
      { wave: 'triangle', volume: 0.3, notes: 'C3.16 D3.16 E3.16' },
    ],
  },
};
