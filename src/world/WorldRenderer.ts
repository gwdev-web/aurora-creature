import { LayoutCheck } from '../engine/debug/LayoutCheck';
import type { Painter } from '../engine/ui';
import type { Character } from './Character';
import { GameMap, type Building, type MapTheme } from './GameMap';

const T = GameMap.TILE;

/** Cores de cada tema: o mesmo tile muda de visual conforme o lugar. */
interface ThemeColors {
  ground: string; groundDark: string; groundLight: string;
  tall: string; tallDark: string; tallLight: string;
  path: string; pathDark: string;
  liquid: string; liquidLight: string; liquidDark: string;
  trunk: string; leaf: string; leafLight: string; leafDark: string;
}

const THEMES: Record<Exclude<MapTheme, 'ginasio'>, ThemeColors> = {
  campo: {
    ground: '#78c068', groundDark: '#58a050', groundLight: '#98d880',
    tall: '#3c9048', tallDark: '#287038', tallLight: '#60b058',
    path: '#e0c890', pathDark: '#c8ac70',
    liquid: '#4898e0', liquidLight: '#90c8f8', liquidDark: '#3070b8',
    trunk: '#7c5030', leaf: '#2f7a40', leafLight: '#48a058', leafDark: '#1c5028',
  },
  vulcao: {
    ground: '#a88868', groundDark: '#887058', groundLight: '#c0a080',
    tall: '#a07838', tallDark: '#785420', tallLight: '#c89848',
    path: '#d0b088', pathDark: '#b09068',
    liquid: '#e85820', liquidLight: '#f8c040', liquidDark: '#a02810',
    trunk: '#504038', leaf: '#6c4838', leafLight: '#8c6048', leafDark: '#40281c',
  },
  neve: {
    ground: '#e8f0f8', groundDark: '#c8d8e8', groundLight: '#f8fcff',
    tall: '#a8c8d8', tallDark: '#7898b0', tallLight: '#d0e8f0',
    path: '#c8ccd8', pathDark: '#a8acb8',
    liquid: '#a8d8f0', liquidLight: '#e0f4ff', liquidDark: '#78b0d0',
    trunk: '#604030', leaf: '#2c6048', leafLight: '#f0f8ff', leafDark: '#1c4030',
  },
};

const OUTLINE = '#1c2024';

const ROOFS: Record<BuildingKind, { roof: string; roofDark: string; wall: string; sign?: string; signColor?: string }> = {
  casa: { roof: '#c85040', roofDark: '#903028', wall: '#f0e0c0' },
  laboratorio: { roof: '#8898a8', roofDark: '#586878', wall: '#f8f8f0', sign: 'LAB', signColor: '#586878' },
  abrigo: { roof: '#2f8f7f', roofDark: '#1d5a63', wall: '#f8f0e8', sign: 'ABRIGO', signColor: '#d84858' },
  mercado: { roof: '#3878c8', roofDark: '#204c88', wall: '#f8f0e8', sign: 'MERCADO', signColor: '#3878c8' },
  ginasio: { roof: '#c89830', roofDark: '#8c6818', wall: '#e8e0d0', sign: 'GINÁSIO', signColor: '#8c6818' },
};

type BuildingKind = Building['kind'];

/** Desenha o cenário e os personagens em pixel art, tudo com retângulos. */
export class WorldRenderer {
  constructor(private readonly p: Painter) {}

  private colors(theme: MapTheme): ThemeColors {
    return THEMES[theme === 'ginasio' ? 'campo' : theme];
  }

  tile(ch: string, x: number, y: number, tx: number, ty: number, time: number, map: GameMap) {
    const p = this.p;
    const theme = map.theme;
    if (theme === 'ginasio') {
      this.gymTile(ch, x, y, tx, ty, map.accent);
      return;
    }
    const c = this.colors(theme);
    const odd = (tx * 7 + ty * 13) % 5;
    switch (ch) {
      case '=':
        p.rect(x, y, T, T, c.path);
        if (odd === 1) p.rect(x + 4, y + 9, 2, 1, c.pathDark);
        if (odd === 3) p.rect(x + 11, y + 4, 2, 1, c.pathDark);
        break;
      case 's':
        p.rect(x, y, T, T, '#f0dca0');
        if (odd === 0) p.rect(x + 5, y + 6, 1, 1, '#d8c080');
        if (odd === 2) p.rect(x + 11, y + 11, 2, 1, '#d8c080');
        if (odd === 4) p.rect(x + 3, y + 12, 1, 1, '#f8f0d0');
        break;
      case '~': {
        p.rect(x, y, T, T, c.liquid);
        const speed = theme === 'neve' ? 0.4 : theme === 'vulcao' ? 3 : 2;
        const wave = Math.floor(time * speed + tx + ty) % 4;
        p.rect(x + 2 + wave, y + 4, 5, 1, c.liquidLight);
        p.rect(x + 9 - wave, y + 11, 4, 1, c.liquidLight);
        p.rect(x, y + 15, T, 1, c.liquidDark);
        if (theme === 'vulcao' && odd === 2) p.rect(x + 7, y + 7, 2, 2, '#f8e070');
        break;
      }
      case 'r':
        this.ground(x, y, odd, c);
        p.rect(x + 2, y + 4, 12, 11, '#787878');
        p.rect(x + 3, y + 3, 10, 12, '#909090');
        p.rect(x + 4, y + 4, 5, 3, '#b0b0b0');
        p.rect(x + 2, y + 13, 12, 2, '#585858');
        if (theme === 'neve') p.rect(x + 3, y + 3, 10, 2, '#f8fcff');
        break;
      case 'T':
        p.rect(x, y, T, T, c.groundDark);
        p.rect(x + 6, y + 11, 4, 5, c.trunk);
        if (theme === 'neve') {
          // Pinheiro com neve.
          for (let i = 0; i < 3; i++) p.rect(x + 5 - i * 2, y + 1 + i * 3, 6 + i * 4, 4, c.leaf);
          p.rect(x + 6, y + 1, 4, 2, c.leafLight);
          p.rect(x + 3, y + 5, 3, 1, c.leafLight);
          p.rect(x + 10, y + 8, 3, 1, c.leafLight);
        } else {
          p.rect(x + 2, y + 2, 12, 10, c.leaf);
          p.rect(x + 1, y + 4, 14, 6, c.leaf);
          p.rect(x + 4, y + 1, 8, 2, c.leaf);
          p.rect(x + 4, y + 3, 4, 3, c.leafLight);
          p.rect(x + 2, y + 10, 12, 2, c.leafDark);
        }
        break;
      case ',':
        p.rect(x, y, T, T, c.tall);
        for (let i = 0; i < 4; i++) {
          const bx = x + 1 + i * 4, by = y + 3 + (i % 2) * 6;
          p.rect(bx, by, 1, 5, c.tallLight);
          p.rect(bx + 2, by + 1, 1, 4, c.tallDark);
        }
        break;
      case '*':
        this.ground(x, y, odd, c);
        [[3, 3, '#f8f8f8'], [10, 9, '#f8d048'], [6, 11, '#e86878']].forEach(([fx, fy, fc]) => {
          p.rect(x + (fx as number), y + (fy as number), 2, 2, fc as string);
          p.rect(x + (fx as number) + 0.5, y + (fy as number) + 0.5, 1, 1, '#f8a030');
        });
        break;
      default:
        this.ground(x, y, odd, c);
    }
  }

  private ground(x: number, y: number, odd: number, c: ThemeColors) {
    this.p.rect(x, y, T, T, c.ground);
    if (odd === 0) this.p.rect(x + 3, y + 5, 1, 2, c.groundDark);
    if (odd === 2) this.p.rect(x + 11, y + 10, 1, 2, c.groundDark);
    if (odd === 4) this.p.rect(x + 7, y + 2, 1, 2, c.groundLight);
  }

  /** Piso, paredes, pilastras e tapete de saída dos ginásios, na cor do líder. */
  private gymTile(ch: string, x: number, y: number, tx: number, ty: number, accent: string) {
    const p = this.p;
    switch (ch) {
      case 'W':
        p.rect(x, y, T, T, '#38404c');
        p.rect(x, y + 12, T, 4, accent);
        p.rect(x, y + 11, T, 1, '#202630');
        break;
      case 'P':
        p.rect(x, y, T, T, (tx + ty) % 2 ? '#d8d0c0' : '#e8e0d0');
        p.rect(x + 3, y + 1, 10, 14, '#a8a098');
        p.rect(x + 4, y + 1, 3, 14, '#c8c0b8');
        p.rect(x + 2, y, 12, 2, accent);
        p.rect(x + 2, y + 14, 12, 2, '#787068');
        break;
      case 'E':
        p.rect(x, y, T, T, accent);
        p.rect(x + 2, y + 2, 12, 12, '#f8f0e0');
        p.rect(x + 4, y + 4, 8, 8, accent);
        break;
      default:
        p.rect(x, y, T, T, (tx + ty) % 2 ? '#d8d0c0' : '#e8e0d0');
        p.rect(x, y, T, 1, '#c8c0b0');
    }
  }

  /** Folhas de grama alta por cima das pernas do personagem. */
  grassOver(x: number, y: number, theme: MapTheme = 'campo') {
    const c = this.colors(theme);
    this.p.rect(x, y + 10, T, 6, c.tall);
    for (let i = 0; i < 4; i++) this.p.rect(x + 1 + i * 4, y + 8 + (i % 2), 1, 4, c.tallLight);
  }

  building(b: Building, ox: number, oy: number) {
    const p = this.p;
    const s = ROOFS[b.kind];
    const x = b.x * T - ox, y = b.y * T - oy, w = b.w * T, h = b.h * T;
    const roofH = Math.floor(h * 0.45);
    p.rect(x + 2, y + roofH, w - 4, h - roofH, s.wall);
    p.rect(x + 2, y + h - 2, w - 4, 2, '#a89880');
    p.rect(x, y + 2, w, roofH, s.roofDark);
    p.rect(x + 2, y, w - 4, roofH, s.roof);
    for (let i = 4; i < roofH; i += 5) p.rect(x + 2, y + i, w - 4, 1, s.roofDark);
    if (b.kind === 'ginasio') {
      // Colunas na fachada.
      for (let cx = x + 6; cx < x + w - 8; cx += 16) p.rect(cx, y + roofH, 4, h - roofH - 2, '#c8c0b0');
    }
    const winY = y + roofH + 6;
    for (const wx of [x + 8, x + w - 20]) {
      p.rect(wx, winY, 12, 9, '#506878');
      p.rect(wx + 1, winY + 1, 10, 7, '#a8d8f0');
      p.rect(wx + 6, winY + 1, 1, 7, '#506878');
    }
    const dx = b.door.x * T - ox, dy = b.door.y * T - oy;
    p.rect(dx + 3, dy + 2, 10, 14, '#604028');
    p.rect(dx + 4, dy + 3, 8, 13, '#906038');
    p.rect(dx + 10, dy + 9, 1, 2, '#f8d048');
    const sign = b.label ?? s.sign;
    if (sign) {
      const sw = Math.max(26, p.measure(sign, 5) + 8);
      p.rect(x + w / 2 - sw / 2, y + roofH - 9, sw, 9, '#f8f8f0');
      p.rect(x + w / 2 - sw / 2, y + roofH - 1, sw, 1, '#a89880');
      // Placas fazem parte do cenário: podem ficar cortadas na borda da tela.
      LayoutCheck.skip(() => p.text(sign, x + w / 2, y + roofH - 7, s.signColor, null, 5, 'center'));
    }
  }

  /** Personagem 16×16 visto de cima, com 4 direções e 2 quadros de passo. */
  character(c: Character, x: number, y: number) {
    const p = this.p;
    const pal = c.palette;
    const f = c.frame;
    const bob = f ? -1 : 0;
    y += bob;
    p.rect(x + 3, y + 15 - bob, 10, 1, 'rgba(0,0,0,0.25)');
    const legL = f === 1 ? -1 : 0, legR = f === 2 ? -1 : 0;
    if (c.dir === 'left' || c.dir === 'right') {
      p.rect(x + 5 + (f === 1 ? -1 : 0), y + 12, 3, 3, pal.pants);
      p.rect(x + 8 + (f === 2 ? 1 : 0), y + 12, 3, 3, pal.pants);
    } else {
      p.rect(x + 4, y + 12 + legL, 3, 3 - legL, pal.pants);
      p.rect(x + 9, y + 12 + legR, 3, 3 - legR, pal.pants);
    }
    p.rect(x + 3, y + 7, 10, 6, pal.shirt);
    p.rect(x + 3, y + 12, 10, 1, OUTLINE);
    if (c.dir !== 'up') p.rect(x + 7, y + 7, 2, 5, 'rgba(255,255,255,0.25)');
    if (c.dir === 'left') p.rect(x + 7 + (f ? 1 : 0), y + 8, 3, 4, pal.skin);
    else if (c.dir === 'right') p.rect(x + 6 - (f ? 1 : 0), y + 8, 3, 4, pal.skin);
    else {
      p.rect(x + 2, y + 8 + (f === 1 ? -1 : 0), 2, 4, pal.skin);
      p.rect(x + 12, y + 8 + (f === 2 ? -1 : 0), 2, 4, pal.skin);
    }
    p.rect(x + 3, y + 1, 10, 7, pal.skin);
    p.rect(x + 3, y + 1, 10, 3, pal.hair);
    p.rect(x + 2, y, 12, 3, pal.hat);
    if (c.dir === 'down') {
      p.rect(x + 3, y + 3, 10, 1, pal.hat);
      p.rect(x + 5, y + 5, 1, 2, OUTLINE);
      p.rect(x + 10, y + 5, 1, 2, OUTLINE);
    } else if (c.dir === 'up') {
      p.rect(x + 3, y + 3, 10, 4, pal.hair);
    } else {
      const left = c.dir === 'left';
      p.rect(left ? x : x + 12, y + 2, 4, 1, pal.hat);
      p.rect(left ? x + 8 : x + 3, y + 2, 5, 4, pal.hair);
      p.rect(left ? x + 4 : x + 11, y + 5, 1, 2, OUTLINE);
    }
  }

  /** Balão de "!" sobre o personagem. */
  exclaim(x: number, y: number) {
    const p = this.p;
    p.rect(x + 3, y - 14, 10, 12, OUTLINE);
    p.rect(x + 4, y - 13, 8, 10, '#f8f8f0');
    p.rect(x + 7, y - 12, 2, 5, '#d84858');
    p.rect(x + 7, y - 6, 2, 2, '#d84858');
  }
}
