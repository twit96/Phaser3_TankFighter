/*global Phaser*/
export default class GameOverScene extends Phaser.Scene {
  constructor () {
    super('GameOverScene');
  }

  init (data) {
    // Initialization code goes here
    this.score = data.score;
  }

  preload () {

    // Declare variables for center of the scene
    this.centerX = this.cameras.main.width / 2;
    this.centerY = this.cameras.main.height / 2;
  }

  create (data) {
    //Create the scene
    var text = this.add.bitmapText(this.centerX - 140, this.centerY - 100, "pixelFont", 'Game Over', 72);
    text.setTint(0x808000);

    var scoreFormated = this.zeroPad(this.score, 6);
    var scoreLabel = this.add.bitmapText(this.centerX - 150, this.centerY - 50, "pixelFont", "SCORE " + scoreFormated  , 60);

    var text1 = this.add.bitmapText(this.centerX - 150, 525, "pixelFont", "Click Anywhere to Continue", 32)

    //When pointer is down, run function shoot
    this.input.on("pointerdown", this.goHome, this);
  }

  update (time, delta) {
    // Update the scene
  }

  goHome() {
    this.scene.start('Boot');
  }

  zeroPad(number, size){
    var stringNumber = String(number);
    while(stringNumber.length < (size || 2)){
      stringNumber = "0" + stringNumber;
    }
    return stringNumber;
  }

}
