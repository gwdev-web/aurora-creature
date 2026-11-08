import { I18n } from '../i18n/I18n';

/** Os 10 tipos elementais do jogo. */
export type TypeId =
  | 'comum' | 'chama' | 'agua' | 'planta' | 'faisca'
  | 'pedra' | 'vento' | 'inseto' | 'sombra' | 'gelo';

export const TYPES: TypeId[] = ['comum', 'chama', 'agua', 'planta', 'faisca', 'pedra', 'vento', 'inseto', 'sombra', 'gelo'];

export const TYPE_INFO: Record<TypeId, { label: string; color: string; light: string; dark: string }> = {
  comum: { label: 'COMUM', color: '#b8a888', light: '#e0d4b8', dark: '#786850' },
  chama: { label: 'CHAMA', color: '#f07030', light: '#f8b060', dark: '#a03818' },
  agua: { label: 'ÁGUA', color: '#3888e0', light: '#80c0f8', dark: '#1c4c90' },
  planta: { label: 'PLANTA', color: '#58b048', light: '#98e070', dark: '#2c6828' },
  faisca: { label: 'FAÍSCA', color: '#f0c828', light: '#f8e878', dark: '#a07c10' },
  pedra: { label: 'PEDRA', color: '#a08860', light: '#c8b490', dark: '#5c4c34' },
  vento: { label: 'VENTO', color: '#88b8d8', light: '#c8e4f4', dark: '#48708c' },
  inseto: { label: 'INSETO', color: '#98b828', light: '#c8e060', dark: '#56700c' },
  sombra: { label: 'SOMBRA', color: '#6850a0', light: '#a08cd0', dark: '#342460' },
  gelo: { label: 'GELO', color: '#78d8d8', light: '#c0f4f0', dark: '#3c8890' },
};

/** Multiplicadores fora do neutro (1): EFFECT[atacante][defensor]. */
const EFFECT: Partial<Record<TypeId, Partial<Record<TypeId, number>>>> = {
  comum: { pedra: 0.5, sombra: 0 },
  chama: { planta: 2, inseto: 2, gelo: 2, agua: 0.5, pedra: 0.5, chama: 0.5 },
  agua: { chama: 2, pedra: 2, agua: 0.5, planta: 0.5, gelo: 0.5 },
  planta: { agua: 2, pedra: 2, chama: 0.5, planta: 0.5, inseto: 0.5, vento: 0.5 },
  faisca: { agua: 2, vento: 2, planta: 0.5, faisca: 0.5, pedra: 0 },
  pedra: { chama: 2, vento: 2, inseto: 2, gelo: 2, pedra: 0.5 },
  vento: { planta: 2, inseto: 2, pedra: 0.5, faisca: 0.5 },
  inseto: { planta: 2, sombra: 2, chama: 0.5, vento: 0.5 },
  sombra: { sombra: 2, comum: 0, inseto: 0.5 },
  gelo: { planta: 2, vento: 2, chama: 0.5, agua: 0.5, gelo: 0.5 },
};

/** Consulta a tabela de eficácia entre tipos. */
export class TypeChart {
  static effect(attack: TypeId, defense: readonly TypeId[]): number {
    return defense.reduce((m, d) => m * (EFFECT[attack]?.[d] ?? 1), 1);
  }

  static message(mult: number): string | null {
    if (mult === 0) return I18n.t('Não teve efeito...');
    if (mult > 1) return I18n.t('Foi super eficaz!');
    if (mult < 1) return I18n.t('Não foi muito eficaz...');
    return null;
  }
}
