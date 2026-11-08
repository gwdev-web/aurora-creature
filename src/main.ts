import '@fontsource/press-start-2p';
import './style.css';
import { Game } from './engine/Game';
import { FONT } from './engine/ui';
import { TitleScene } from './scenes/TitleScene';
import { Bestiary } from './data/creatures';
import { Creature } from './core/Creature';
import { BattleRules } from './core/BattleRules';

/** Ponto de entrada: espera a fonte pixelada e inicia o jogo. */
class App {
  static async boot() {
    const canvas = document.getElementById('screen') as HTMLCanvasElement;
    // Espera a fonte carregar, com limite de tempo para não travar offline.
    await Promise.race([
      document.fonts.load(`8px ${FONT}`).catch(() => undefined),
      new Promise((r) => setTimeout(r, 2500)),
    ]);
    const game = new Game(canvas);
    game.setScene(new TitleScene(game));
    game.start();
    // Expõe para depuração no console do navegador.
    Object.assign(window, { game, Bestiary, Creature, BattleRules });
  }
}

void App.boot();
