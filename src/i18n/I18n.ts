import { EN } from './en';

export type Lang = 'pt' | 'en';

/**
 * Traduções no estilo gettext: o texto em português é a chave e o catálogo `EN` traz a versão em inglês.
 * Parâmetros usam `{nome}`: `I18n.t('Você recebeu {name}!', { name })`.
 */
export class I18n {
  private static readonly KEY = 'aurora-creature:idioma';
  private static current: Lang = I18n.detect();
  private static listeners: (() => void)[] = [];

  private static detect(): Lang {
    try {
      const saved = localStorage.getItem(I18n.KEY);
      if (saved === 'pt' || saved === 'en') return saved;
    } catch {
      // localStorage indisponível.
    }
    return typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en';
  }

  static get lang(): Lang { return this.current; }

  static set(lang: Lang) {
    this.current = lang;
    try { localStorage.setItem(I18n.KEY, lang); } catch { /* sem persistência */ }
    for (const fn of this.listeners) fn();
  }

  static toggle() { this.set(this.current === 'pt' ? 'en' : 'pt'); }

  /** Avisa quando o idioma muda (para atualizar a página HTML). */
  static onChange(fn: () => void) { this.listeners.push(fn); }

  /** Traduz um texto (com parâmetros opcionais). Sem tradução, mantém o português. */
  static t(pt: string, params?: Record<string, string | number>): string {
    let s = this.current === 'en' ? EN[pt] ?? pt : pt;
    if (params) for (const [k, v] of Object.entries(params)) s = s.split(`{${k}}`).join(String(v));
    return s;
  }

  /** Traduz os elementos da página marcados com `data-i18n` (o texto original fica em `data-pt`). */
  static applyDom(root: ParentNode = document) {
    document.documentElement.lang = this.current === 'pt' ? 'pt-BR' : 'en';
    root.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
      el.dataset.pt ??= el.textContent?.trim() ?? '';
      el.textContent = this.t(el.dataset.pt);
    });
  }

  /** Verdadeiro se o texto tem tradução no catálogo (usado no script de verificação). */
  static has(pt: string) { return pt in EN; }
}

