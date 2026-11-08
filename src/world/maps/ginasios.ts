import type { Palette } from '../Character';
import { GymFactory } from '../GymFactory';

const pal = (hat: string, shirt: string, pants = '#404858', hair = '#583818', skin = '#f0c8a0'): Palette => ({ hat, hair, shirt, pants, skin });

/** Ginásio da Cidade Coral: líder MARINA, criaturas de ÁGUA. */
export const GINASIO_CORAL = GymFactory.build({
  id: 'ginasio-coral',
  name: 'GINÁSIO CORAL',
  accent: '#3878c8',
  exit: { map: 'cidade-coral', x: 14, y: 15, dir: 'down' },
  trainers: [
    { id: 'ginasio-coral-t1', name: 'NADADORA BEL', pal: pal('#3878c8', '#80c0f8', '#3878c8'),
      trainer: { range: 4, levels: [12, 13], count: 2, reward: 500, species: [34, 41], intro: 'Para chegar até a MARINA, tem que passar por mim!', defeat: 'Afundei...', after: 'A MARINA é muito forte. Boa sorte!' } },
    { id: 'ginasio-coral-t2', name: 'MERGULHADOR TÉO', pal: pal('#204c88', '#58a8d8', '#204c88'),
      trainer: { range: 4, levels: [13, 14], count: 2, reward: 560, species: [34, 41], intro: 'Prenda a respiração: lá vamos nós!', defeat: 'Subi rápido demais...', after: 'Pode ir, a líder está logo ali.' } },
  ],
  leader: {
    name: 'LÍDER MARINA', pal: pal('#58c8d8', '#3878c8', '#204c88', '#2c3c78'),
    trainer: {
      range: 0, levels: [14, 17], count: 3, reward: 1600, team: [[35, 14], [41, 15], [42, 17]],
      badge: { id: 'onda', name: 'INSÍGNIA ONDA' },
      intro: 'Sou MARINA, líder do GINÁSIO CORAL. Minhas criaturas são calmas como o mar... até a tempestade chegar!',
      defeat: 'Que maré boa a sua! Você merece esta insígnia.',
      after: 'Siga pela ROTA 2 até a VILA BRASA. A IARA espera por você.',
    },
  },
});

/** Ginásio da Vila Brasa: líder IARA, criaturas de CHAMA e PEDRA. */
export const GINASIO_BRASA = GymFactory.build({
  id: 'ginasio-brasa',
  name: 'GINÁSIO BRASA',
  accent: '#e85820',
  exit: { map: 'vila-brasa', x: 21, y: 21, dir: 'down' },
  trainers: [
    { id: 'ginasio-brasa-t1', name: 'FERREIRO RAUL', pal: pal('#605040', '#c87838', '#403028'),
      trainer: { range: 4, levels: [18, 19], count: 2, reward: 700, species: [43, 28], intro: 'O ferro só fica forte no fogo!', defeat: 'Esfriei...', after: 'A IARA forja as melhores estratégias.' } },
    { id: 'ginasio-brasa-t2', name: 'MALABARISTA FLOR', pal: pal('#e85820', '#f8c040', '#a02810'),
      trainer: { range: 4, levels: [19, 20], count: 2, reward: 760, species: [43, 28], intro: 'Malabares de fogo! Cuidado para não se queimar!', defeat: 'Deixei cair tudo!', after: 'Fique longe da lava lá fora.' } },
  ],
  leader: {
    name: 'LÍDER IARA', pal: pal('#a02810', '#e85820', '#402018', '#c83020'),
    trainer: {
      range: 0, levels: [20, 23], count: 3, reward: 2200, team: [[43, 20], [29, 21], [44, 23]],
      badge: { id: 'brasa', name: 'INSÍGNIA BRASA' },
      intro: 'Eu sou IARA! O calor deste ginásio só perde para a minha vontade de vencer!',
      defeat: 'Você apagou meu fogo... mas acendeu o meu respeito.',
      after: 'O último ginásio fica no PICO GELADO, subindo a ROTA 3.',
    },
  },
});

/** Ginásio do Pico Gelado: líder BÓREAS, criaturas de GELO e VENTO. */
export const GINASIO_PICO = GymFactory.build({
  id: 'ginasio-pico',
  name: 'GINÁSIO PICO',
  accent: '#58a8d8',
  exit: { map: 'pico-gelado', x: 14, y: 6, dir: 'down' },
  trainers: [
    { id: 'ginasio-pico-t1', name: 'PATINADORA ELA', pal: pal('#a8d8f0', '#e8f0f8', '#5878a8'),
      trainer: { range: 4, levels: [23, 24], count: 2, reward: 900, species: [32, 45, 47], intro: 'Deslizo no gelo e nas batalhas!', defeat: 'Escorreguei feio...', after: 'O BÓREAS nunca perdeu uma batalha... até hoje?' } },
    { id: 'ginasio-pico-t2', name: 'ALPINISTA DIO', pal: pal('#d84858', '#5878a8', '#283848'),
      trainer: { range: 4, levels: [24, 25], count: 3, reward: 980, species: [32, 45, 47], intro: 'Cheguei ao topo da montanha. Agora quero o topo da batalha!', defeat: 'Avalanche de derrotas...', after: 'Vá em frente, o líder espera.' } },
  ],
  leader: {
    name: 'LÍDER BÓREAS', pal: pal('#e8f0f8', '#58a8d8', '#283848', '#e8e8e8'),
    trainer: {
      range: 0, levels: [25, 28], count: 3, reward: 3000, team: [[33, 25], [48, 26], [46, 28]],
      badge: { id: 'geada', name: 'INSÍGNIA GEADA' },
      intro: 'Sou BÓREAS. O vento do norte e o gelo eterno lutam ao meu lado. Está preparado?',
      defeat: 'O gelo derreteu... Você é digno da última insígnia.',
      after: 'Com as 3 insígnias, você é um verdadeiro treinador de AURORA!',
    },
  },
});
