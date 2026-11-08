// Verifica se todo texto exibido no jogo tem tradução em inglês (src/i18n/en.ts). Uso: pnpm i18n:check
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
const { I18n } = await import(`${ROOT}/i18n/I18n.ts`);
const { TYPE_INFO } = await import(`${ROOT}/data/types.ts`);
const { MOVES } = await import(`${ROOT}/data/moves.ts`);
const { Bestiary } = await import(`${ROOT}/data/creatures.ts`);
const { REGIONS } = await import(`${ROOT}/data/regions.ts`);
const { ITEMS } = await import(`${ROOT}/core/items.ts`);
const { MapRegistry } = await import(`${ROOT}/world/MapRegistry.ts`);
const { BADGES } = await import(`${ROOT}/scenes/TrainerCardScene.ts`).catch(() => ({ BADGES: [] }));

const found = new Set<string>();
const add = (s?: string) => { if (s && /[A-Za-zÀ-ú]/.test(s)) found.add(s); };

for (const t of Object.values(TYPE_INFO) as { label: string }[]) add(t.label);
for (const m of Object.values(MOVES) as { name: string }[]) add(m.name);
for (const sp of Bestiary.all()) add(sp.entry);
for (const r of REGIONS) { add(r.name); add(r.description); }
for (const it of Object.values(ITEMS) as { name: string; description: string }[]) { add(it.name); add(it.description); }
for (const b of BADGES as { name: string }[]) add(b.name);
for (const m of MapRegistry.all()) {
  add(m.name);
  for (const n of m.npcs) {
    add(n.name);
    n.lines.forEach(add);
    if (n.trainer) { add(n.trainer.intro); add(n.trainer.defeat); add(n.trainer.after); add(n.trainer.badge?.name); }
  }
  for (const b of m.buildings) add(b.label);
}
for (const s of ['LAB', 'ABRIGO', 'MERCADO', 'GINÁSIO']) add(s);

// Textos literais nas cenas e na interface.
const files = ['scenes', 'engine'].flatMap((d) => readdirSync(join(ROOT, d)).filter((f) => f.endsWith('.ts')).map((f) => join(ROOT, d, f)));
for (const f of files) {
  const src = readFileSync(f, 'utf8').split('\n').filter((l) => !/^\s*(import|\/\/|\*|\/\*\*)/.test(l) && !l.includes('throw new Error')).join('\n');
  for (const m of src.matchAll(/'((?:[^'\\\n]|\\.)*)'|`([^`$\n]*)`/g)) {
    const s = m[1] ?? m[2];
    if (!s || s.startsWith('\\u') || s.startsWith('#') || s.startsWith('rgba') || s.includes('/') && !s.includes(' ')) continue;
    if (/^[a-z0-9_.:\-]+$/.test(s)) continue; // identificadores
    if (/[(){};=]/.test(s) && !/[.!?]$/.test(s)) continue; // pedaços de código
    if (/^(ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Escape|Backspace|Enter|Press Start 2P)$/.test(s)) continue;
    add(s);
  }
}
// Nomes próprios e siglas iguais nos dois idiomas, e falsos positivos do extrator.
const SAME = new Set(['IDIOMA: PORTUGUÊS', 'LANGUAGE: ENGLISH', 'HP', 'EXP', 'M', 'NFD', 'LAB', 'PROF. IPÊ', 'KAUÃ', 'LIA', 'CAMILA', 'MARINA', 'IARA', 'BÓREAS', '[data-btn]', '[data-mute]', '\\n', '"Press Start 2P", monospace']);
const missing = [...found].filter((s) => !I18n.has(s) && !SAME.has(s) && !s.startsWith('], [')).sort();
if (missing.length) {
  console.error(`Textos sem tradução em inglês (${missing.length}):`);
  for (const s of missing) console.error(`  - ${s}`);
  process.exit(1);
}
console.log(`i18n ok: ${found.size} textos verificados.`);
