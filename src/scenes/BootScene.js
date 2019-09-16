/*global Phaser*/
export default class BootScene extends Phaser.Scene {
  constructor () {
    super('Boot');
  }

  preload () {
    // Preload assets
    this.load.image('base', './assets/sprites/tankBase.png');
    this.load.image('turret', './assets/sprites/tankTurret.png');
    this.load.image('bullet', './assets/sprites/bullet.png');
    this.load.spritesheet('enemy', './assets/spritesheets/enemy.png', {
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.spritesheet("explosion", "assets/spritesheets/explosion.png",{
      frameWidth: 16,
      frameHeight: 16
    });
    this.load.image('star', './assets/sprites/star.png');
    this.load.bitmapFont("pixelFont", "assets/font/font.png", "assets/font/font.xml");

    //Declare variables for center of the scene
    this.centerX = this.cameras.main.width / 2;
    this.centerY = this.cameras.main.height / 2;
  }

  create () {

    //Battle animations
    this.anims.create({
      key: "enemy_anim",
      frames: this.anims.generateFrameNumbers("enemy"),
      frameRate: 20,
      repeat: -1
    });
    this.anims.create({
      key: "explode",
      frames: this.anims.generateFrameNumbers("explosion"),
      frameRate: 20,
      repeat: 0,
      hideOnComplete: true
    });

    //Display Instructions
    var title = this.add.bitmapText(
      100,
      50,
      "pixelFont",
      'Tank Fighter: Swarm of Orbs',
      60
    );
    var text0 = this.add.bitmapText(
      85,
      175,
      "pixelFont",
      'INSTRUCTIONS',
      40
    );
    text0.setTint(0x808000);
    var text1 = this.add.bitmapText(85, 225, "pixelFont", "1.  Move the mouse to aim at the orbs and click to shoot. \n2. Use the W-A-S-D keys to move your tank around the \n     screen and dodge moving orbs. \n3. Kill 10 orbs and gain a life. Get hit by 1 orb and lose a life. \n\nGood luck, comrade.",  32);
    text1.setTint(0x808000);
    var intro2 = this.add.bitmapText(this.centerX - 150, 525, "pixelFont", "Click Anywhere to Battle", 32);

    //When pointer is down, run function shoot
    this.input.on("pointerdown", this.goFight, this);
  }

  update (time, delta) {
    // Update the scene
  }


  goFight() {
    this.scene.start("Battle");
    //this.scene.start("GameOverScene");
  }
}
