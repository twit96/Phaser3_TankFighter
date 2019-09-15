/*global Phaser, window*/
import BootScene from './scenes/BootScene.js';
import BattleScene from './scenes/BattleScene.js';
import GameOverScene from './scenes/GameOverScene.js';
import Config from './config/config.js';

class Game extends Phaser.Game {
  constructor () {
    super(Config);
    this.scene.add('Boot', BootScene);
    this.scene.add('GameOverScene', GameOverScene);
    this.scene.add('Battle', BattleScene);
    this.scene.start('Boot');
  }
}

window.game = new Game();
