/** Gerador de números aleatórios. Sem semente usa `Math.random`; com semente (mulberry32) repete a mesma sequência. */
export class Random {
  /** Instância compartilhada sem semente. */
  static readonly shared = new Random();

  private state: number;
  private readonly seededMode: boolean;

  constructor(seed?: number) {
    this.seededMode = seed !== undefined;
    this.state = (seed ?? 0) >>> 0;
  }

  /** Número em [0, 1). */
  next(): number {
    if (!this.seededMode) return Math.random();
    this.state = (this.state + 0x6d2b79f5) >>> 0;
    let t = this.state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Inteiro entre min e max (inclusive). */
  int(min: number, max: number) { return min + Math.floor(this.next() * (max - min + 1)); }
  chance(p: number) { return this.next() < p; }
  pick<T>(list: readonly T[]): T { return list[Math.floor(this.next() * list.length)]; }

  /** Transforma um texto numa semente numérica estável. */
  static hash(str: string): number {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
    return h >>> 0;
  }
}
