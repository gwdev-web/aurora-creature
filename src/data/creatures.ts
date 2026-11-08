import type { TypeId } from './types';

export interface BaseStats { hp: number; atk: number; def: number; spa: number; spd: number; spe: number; }

export interface Species {
  id: number;
  name: string;
  types: TypeId[];
  base: BaseStats;
  /** Facilidade de captura (3 a 255). */
  catchRate: number;
  /** Experiência base dada ao ser derrotada. */
  baseExp: number;
  /** Golpes aprendidos por nível, em ordem. */
  learnset: [number, string][];
  evolvesTo?: { id: number; level: number };
  /** Primeira forma da linha evolutiva (usada como semente da sprite). */
  root: number;
  /** 0 = forma básica, 1 = primeira evolução, 2 = segunda. */
  stage: number;
  legendary?: boolean;
  /** Frase curta para a tela de resumo. */
  entry: string;
}

/** Golpes por tipo: [nível, golpe]. As formas evoluídas herdam a lista da linha. */
const BY_TYPE: Record<TypeId, [number, string][]> = {
  comum: [[1, 'investida'], [4, 'bote'], [11, 'pancada']],
  chama: [[1, 'arranhao'], [1, 'brasa'], [8, 'bote'], [12, 'labareda'], [18, 'pancada'], [24, 'fogareu']],
  agua: [[1, 'investida'], [1, 'jato'], [8, 'bote'], [12, 'bolhas'], [18, 'pancada'], [24, 'maremoto']],
  planta: [[1, 'investida'], [1, 'cipo'], [8, 'bote'], [12, 'folha-navalha'], [18, 'pancada'], [24, 'seiva-solar']],
  faisca: [[1, 'investida'], [1, 'choque'], [9, 'bote'], [13, 'centelha'], [22, 'relampago']],
  pedra: [[1, 'investida'], [5, 'pedrada'], [14, 'avalanche'], [18, 'pancada']],
  vento: [[1, 'investida'], [1, 'lufada'], [9, 'asa-corte'], [20, 'ciclone']],
  inseto: [[1, 'investida'], [1, 'ferroada'], [10, 'zumbido']],
  sombra: [[1, 'arranhao'], [1, 'vulto'], [9, 'mordida-breu'], [18, 'pulso-breu']],
  gelo: [[1, 'investida'], [1, 'garoa-gelada'], [11, 'cristal'], [22, 'nevasca']],
};

const SECOND: Record<TypeId, [string, string]> = {
  comum: ['bote', 'pancada'], chama: ['brasa', 'labareda'], agua: ['jato', 'bolhas'], planta: ['cipo', 'folha-navalha'],
  faisca: ['choque', 'centelha'], pedra: ['pedrada', 'avalanche'], vento: ['lufada', 'asa-corte'],
  inseto: ['ferroada', 'zumbido'], sombra: ['vulto', 'mordida-breu'], gelo: ['garoa-gelada', 'cristal'],
};

function learnsetFor(types: TypeId[]): [number, string][] {
  const list = [...BY_TYPE[types[0]]];
  if (types[1]) {
    const [weak, mid] = SECOND[types[1]];
    list.push([6, weak], [15, mid]);
  }
  const seen = new Set<string>();
  return list.sort((a, b) => a[0] - b[0]).filter(([, mv]) => !seen.has(mv) && !!seen.add(mv));
}

type Row = [id: number, name: string, types: TypeId[], stats: number[], catchRate: number, baseExp: number, entry: string, evo?: [number, number], legendary?: boolean];

const ROWS: Row[] = [
  // Vale Aurora
  [1, 'BROTIM', ['planta'], [45, 49, 49, 60, 60, 45], 45, 64, 'Dorme ao sol com a folha da cabeça bem aberta.', [2, 16]],
  [2, 'BROTAL', ['planta'], [65, 70, 70, 85, 85, 65], 45, 142, 'Suas raízes encontram água a metros de distância.'],
  [3, 'BRASITO', ['chama'], [39, 52, 43, 60, 50, 65], 45, 62, 'A brasa da cauda fica mais forte quando está feliz.', [4, 16]],
  [4, 'BRASARUS', ['chama'], [58, 72, 60, 85, 65, 85], 45, 142, 'Ruge faíscas quando encontra um rival à altura.'],
  [5, 'GOTINHA', ['agua'], [44, 48, 65, 50, 64, 43], 45, 63, 'Guarda gotas de orvalho na carapaça macia.', [6, 16]],
  [6, 'MARUJO', ['agua'], [64, 68, 85, 70, 84, 58], 45, 142, 'Navega rios inteiros sem se cansar.'],
  // Costa Coral
  [7, 'MUSGUIM', ['planta', 'pedra'], [50, 55, 60, 45, 55, 40], 45, 64, 'Cresce musgo nas costas enquanto descansa nas pedras.', [8, 16]],
  [8, 'MUSGORÃO', ['planta', 'pedra'], [75, 80, 90, 60, 75, 55], 45, 142, 'Parece uma rocha coberta de limo até abrir os olhos.'],
  [9, 'FAGULHO', ['chama', 'vento'], [40, 50, 40, 62, 45, 70], 45, 62, 'Pula de um lado para outro soltando fagulhas.', [10, 16]],
  [10, 'FORNALHO', ['chama', 'vento'], [60, 70, 58, 88, 62, 92], 45, 142, 'O calor das asas forma redemoinhos de ar quente.'],
  [11, 'BOLHITO', ['agua', 'gelo'], [48, 45, 58, 55, 62, 42], 45, 63, 'Sopra bolhas geladas que flutuam por horas.', [12, 16]],
  [12, 'ONDARÉU', ['agua', 'gelo'], [70, 65, 80, 78, 84, 58], 45, 142, 'Surfa nas ondas frias da costa ao amanhecer.'],
  // Serra Brasa
  [13, 'RAIZEL', ['planta', 'sombra'], [46, 54, 46, 58, 52, 52], 45, 64, 'Esconde-se na sombra das árvores durante o dia.', [14, 16]],
  [14, 'RAIZARCO', ['planta', 'sombra'], [66, 78, 64, 80, 70, 72], 45, 142, 'Seus galhos se movem mesmo sem vento.'],
  [15, 'CHAMINHO', ['chama', 'pedra'], [44, 58, 52, 50, 45, 50], 45, 62, 'Mora perto de fontes termais nas montanhas.', [16, 16]],
  [16, 'CHAMARÃO', ['chama', 'pedra'], [68, 84, 78, 66, 60, 64], 45, 142, 'A carapaça é quente o bastante para cozinhar.'],
  [17, 'ORVALHIM', ['agua', 'faisca'], [42, 44, 48, 60, 56, 58], 45, 63, 'Dá pequenos choques quando é pego de surpresa.', [18, 16]],
  [18, 'ORVALHÃO', ['agua', 'faisca'], [62, 62, 66, 88, 76, 80], 45, 142, 'Ilumina as noites de neblina com seu brilho azul.'],
  // Selvagens
  [19, 'RATU', ['comum'], [30, 56, 35, 25, 35, 72], 255, 51, 'Rói qualquer coisa e nunca para quieto.', [20, 12]],
  [20, 'RATÃO', ['comum'], [55, 81, 60, 50, 70, 97], 127, 145, 'Os dentes não param de crescer.'],
  [21, 'PIUÍ', ['comum', 'vento'], [40, 45, 40, 35, 35, 56], 255, 50, 'Canta antes de o sol nascer.', [22, 12]],
  [22, 'PIUAÇU', ['comum', 'vento'], [63, 60, 55, 50, 50, 71], 120, 122, 'Plana por quilômetros sem bater as asas.'],
  [23, 'LAGARTIM', ['inseto'], [45, 30, 35, 20, 20, 45], 255, 39, 'Come folhas o dia todo.', [24, 7]],
  [24, 'CASULÃO', ['inseto'], [50, 20, 55, 25, 25, 30], 120, 72, 'Fica imóvel esperando a transformação.', [25, 10]],
  [25, 'LUMIPOSA', ['inseto', 'vento'], [60, 45, 50, 80, 80, 70], 45, 160, 'Suas asas soltam um pó que brilha no escuro.'],
  [26, 'CHOQUITO', ['faisca'], [35, 55, 40, 50, 50, 90], 190, 82, 'Junta eletricidade estática esfregando a cauda.', [27, 14]],
  [27, 'VOLTAÇO', ['faisca'], [60, 90, 55, 90, 80, 110], 75, 160, 'Pode apagar as luzes de uma vila inteira.'],
  [28, 'SEIXINHO', ['pedra'], [40, 80, 100, 30, 30, 20], 255, 60, 'Confunde-se com as pedras do caminho.', [29, 14]],
  [29, 'ROCHEDO', ['pedra'], [65, 100, 120, 45, 45, 35], 120, 137, 'Rola morro abaixo de propósito.'],
  [30, 'SOMBRIO', ['sombra'], [35, 50, 35, 60, 40, 70], 190, 62, 'Só aparece quando ninguém está olhando.', [31, 14]],
  [31, 'BREUCÉU', ['sombra', 'vento'], [60, 75, 55, 90, 65, 95], 75, 156, 'Voa na noite sem fazer nenhum som.'],
  [32, 'GEADIM', ['gelo'], [45, 40, 50, 55, 55, 45], 190, 60, 'Deixa uma trilha de gelo por onde passa.', [33, 14]],
  [33, 'NEVASCO', ['gelo'], [75, 65, 75, 85, 80, 60], 75, 158, 'Seu sopro congela poças em segundos.'],
  [34, 'PEIXIM', ['agua'], [40, 50, 40, 40, 40, 70], 255, 52, 'Salta para fora da água para pegar insetos.', [35, 12]],
  [35, 'PEIXÃO', ['agua'], [70, 80, 65, 60, 60, 80], 90, 140, 'Os pescadores contam histórias sobre ele.'],
  [36, 'COGUMIM', ['planta'], [50, 45, 55, 50, 55, 25], 190, 58, 'Solta esporos quando alguém pisa perto.', [37, 12]],
  [37, 'COGUMELÃO', ['planta', 'sombra'], [80, 70, 80, 75, 80, 35], 75, 150, 'Cresce mais nas noites úmidas.'],
  [38, 'FAROLETA', ['faisca', 'vento'], [55, 50, 50, 75, 60, 85], 120, 112, 'Pisca como um farol em dias de tempestade.'],
  [41, 'MEDUSINHA', ['agua'], [45, 40, 45, 60, 70, 55], 190, 66, 'Flutua perto da praia brilhando no escuro.', [42, 18]],
  [42, 'MEDUSÃO', ['agua', 'sombra'], [75, 60, 70, 90, 100, 75], 60, 170, 'Seus tentáculos deixam um rastro de luz roxa.'],
  [43, 'LAVAPÉ', ['chama'], [45, 60, 50, 55, 45, 60], 120, 70, 'Anda sobre a lava sem se queimar.', [44, 22]],
  [44, 'VULCAROS', ['chama', 'pedra'], [80, 100, 85, 80, 65, 70], 45, 180, 'Dorme dentro de crateras e acorda com o calor.'],
  [45, 'CRISTALIM', ['gelo', 'pedra'], [50, 55, 85, 45, 60, 30], 120, 72, 'Seu corpo de cristal reflete a luz da neve.', [46, 24]],
  [46, 'GLACIÁRIO', ['gelo', 'pedra'], [85, 90, 120, 65, 85, 45], 45, 184, 'Move-se tão devagar quanto uma geleira.'],
  [47, 'BRISINHA', ['vento'], [40, 40, 35, 55, 45, 75], 190, 60, 'Brinca nas correntes de ar das montanhas.', [48, 20]],
  [48, 'TUFÃO', ['vento'], [70, 75, 65, 95, 70, 110], 60, 168, 'Bate as asas e levanta redemoinhos de folhas.'],
  [39, 'AURORIS', ['gelo', 'vento'], [90, 85, 100, 95, 125, 85], 3, 220, 'Dizem que pinta o céu do norte com as asas.', undefined, true],
  [40, 'BRASALÉU', ['chama', 'pedra'], [90, 110, 90, 100, 80, 90], 3, 220, 'Dorme dentro de um vulcão há séculos.', undefined, true],
];

const rootOf = new Map<number, number>();
const stageOf = new Map<number, number>();
for (const r of ROWS) {
  if (!rootOf.has(r[0])) { rootOf.set(r[0], r[0]); stageOf.set(r[0], 0); }
  if (r[7]) { rootOf.set(r[7][0], rootOf.get(r[0])!); stageOf.set(r[7][0], stageOf.get(r[0])! + 1); }
}
const lineTypes = new Map<number, TypeId[]>();
for (const r of ROWS) if (rootOf.get(r[0]) === r[0]) lineTypes.set(r[0], r[2]);

export const SPECIES: Record<number, Species> = Object.fromEntries(ROWS.map((r) => {
  const [id, name, types, s, catchRate, baseExp, entry, evo, legendary] = r;
  const root = rootOf.get(id)!;
  // A linha inteira aprende os golpes dos tipos da forma básica e da forma atual.
  const learnset = learnsetFor(types);
  for (const extra of learnsetFor(lineTypes.get(root)!)) if (!learnset.some(([, mv]) => mv === extra[1])) learnset.push(extra);
  learnset.sort((a, b) => a[0] - b[0]);
  const sp: Species = {
    id, name, types, catchRate, baseExp, entry, root, stage: stageOf.get(id)!, legendary,
    base: { hp: s[0], atk: s[1], def: s[2], spa: s[3], spd: s[4], spe: s[5] },
    learnset,
    evolvesTo: evo ? { id: evo[0], level: evo[1] } : undefined,
  };
  return [id, sp];
}));

/** Catálogo das espécies. */
export class Bestiary {
  static get(id: number): Species {
    const sp = SPECIES[id];
    if (!sp) throw new Error(`Criatura desconhecida: ${id}`);
    return sp;
  }

  static all(): Species[] { return Object.values(SPECIES); }

  static get count() { return ROWS.length; }
}
