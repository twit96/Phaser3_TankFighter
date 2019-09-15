/*global Phaser*/
export default class BattleScene extends Phaser.Scene {
  constructor () {
    super('Battle');
  }

  init (data) {
  // Initialization code goes here
  }

  preload () {
    // Declare variables for center of the scene
    this.centerX = this.cameras.main.width / 2;
    this.centerY = this.cameras.main.height / 2;
  }

  create (data) {

    var turret, bullets, enemy, bullet, enemyGroup;
    this.nextFire = 0;
    this.fireRate = 200;
    this.bulletSpeed = 1000;
    this.enemySpeed = 0;

    this.score;
    this.lives;
    this.gameOver = false;

    this.cameras.main.setBackgroundColor(0x708000);

    //Create Player Tank
    this.player = this.physics.add.sprite(this.centerX, this.centerY, 'base');
    this.player.setScale(3);
    this.turret = this.physics.add.sprite(this.centerX, this.centerY, 'turret');
    this.turret.setScale(3);

    this.player.setCollideWorldBounds(true);
    this.turret.setCollideWorldBounds(true);


    //Add bullet group with a max of 10 bullets
    this.bullets = this.physics.add.group({
      defaultKey: "bullet",
      maxSize: 10
    });

    //Add event listener for esc key
    this.input.keyboard.on("keydown_ESC", this.mainMenu, this);

    //Add event lisener for movement of the mouse pointer
    this.input.on(
      "pointermove",
      function(pointer) {
        var betweenPoints = Phaser.Math.Angle.BetweenPoints;
        var angle = Phaser.Math.RAD_TO_DEG * betweenPoints(this.turret, pointer);
        this.turret.setAngle(angle);
      }, this
    );

    //When pointer is down, run function shoot
    this.input.on("pointerdown", this.shoot, this);

    //Add Enemies
    this.enemy1 = this.physics.add.sprite(100, 100, "enemy");
    this.enemy2 = this.physics.add.sprite(700, 100, "enemy");
    this.enemy3 = this.physics.add.sprite(100, 500, "enemy");
    this.enemy4 = this.physics.add.sprite(700, 500, "enemy");

    this.enemies = this.physics.add.group();
    this.enemies.add(this.enemy1);
    this.enemies.add(this.enemy2);
    this.enemies.add(this.enemy3);
    this.enemies.add(this.enemy4);

    this.enemies.children.iterate(function(child) {
      child.setScale(3.2);
      child.play("enemy_anim");
      child.setInteractive();
    });

    this.enemies.children.each(
      function (e) {
        this.physics.add.overlap(
          e,
          this.player,
          this.hurtPlayer,
          null, this
        );
      }.bind(this)
    );

    //Player Scoreboard
    var graphics = this.add.graphics();
    graphics.fillStyle(0x000000, 1);
    graphics.beginPath();
    graphics.moveTo(0, 600);
    graphics.lineTo(this.centerX * 2, 600);
    graphics.lineTo(this.centerX * 2, 568);
    graphics.lineTo(0, 568);
    graphics.lineTo(0, 600);

    graphics.closePath();
    graphics.fillPath();

    this.score = 0;
    var scoreFormated = this.zeroPad(this.score, 6);
    this.scoreLabel = this.add.bitmapText(10, 575, "pixelFont", "SCORE " + scoreFormated  , 32);

    this.lives = 5;
    var livesFormatted = this.zeroPad(this.lives, 2);
    this.livesLabel = this.add.bitmapText(this.centerX - 30, 575, "pixelFont", "LIVES " + livesFormatted , 32);

    this.kills = 0;
    var killsFormatted = this.zeroPad(this.kills, 3);
    this.killsLabel = this.add.bitmapText(675, 575, "pixelFont", "KILLS " + killsFormatted , 32);

  }

  update (time, delta) {
    if (this.gameOver) {
      this.scene.start('GameOverScene', { score: this.score });
      return;
    }

    var speed = 150;

    this.moveEnemyVertical(this.enemy1, 1);
    this.moveEnemyHorizontal(this.enemy2, 1);
    this.moveEnemyVertical(this.enemy3, -1);
    this.moveEnemyHorizontal(this.enemy4, -1);


    var cursors = this.input.keyboard.addKeys({
      up:Phaser.Input.Keyboard.KeyCodes.W,
      down:Phaser.Input.Keyboard.KeyCodes.S,
      left:Phaser.Input.Keyboard.KeyCodes.A,
      right:Phaser.Input.Keyboard.KeyCodes.D
    });

    // Stop any previous movement from the last frame
    this.player.body.setVelocity(0);
    this.turret.body.setVelocity(0);

    // Horizontal movement
    if (cursors.left.isDown) {
      this.player.setAngle(270);
      this.player.body.setVelocityX(-100);
      this.turret.body.setVelocityX(-100);
    } else if (cursors.right.isDown) {
      this.player.setAngle(90);
      this.player.body.setVelocityX(100);
      this.turret.body.setVelocityX(100);
    }

    // Vertical movement
    if (cursors.up.isDown) {
      this.player.setAngle(0);
      this.player.body.setVelocityY(-100);
      this.turret.body.setVelocityY(-100);
    } else if (cursors.down.isDown) {
      this.player.setAngle(180);
      this.player.body.setVelocityY(100);
      this.turret.body.setVelocityY(100);
    }

    // Normalize and scale the velocity so that player can't move faster along a diagonal
    this.player.body.velocity.normalize().scale(speed);
    this.turret.body.velocity.normalize().scale(speed);

    //Bullet Firing
    this.bullets.children.each(
      function (b) {
        if (b.active) {
          this.physics.add.overlap(
            b,
            this.enemies,
            this.hitEnemy,
            null,
            this
          );
          //deactivate bullets once they leave the screen
          if (b.y < 0) {
            b.setActive(false)
          } else if (b.y > this.cameras.main.height) {
            b.setActive(false)
          } else if (b.x < 0) {
            b.setActive(false)
          } else if (b.x > this.cameras.main.width) {
            b.setActive(false)
          }
        }
      }.bind(this)  //binds the function to each of the children. scope of function
    );
  }

  shoot (pointer) {
    var betweenPoints = Phaser.Math.Angle.BetweenPoints;
    var angle = betweenPoints(this.turret, pointer);
    var velocityFromRotation = this.physics.velocityFromRotation;
    //Create a variable called velocity from a vector2
    var velocity = new Phaser.Math.Vector2();
    velocityFromRotation(angle, this.bulletSpeed, velocity);
    //Get the bullet group
    var bullet = this.bullets.get();
    bullet.setAngle(Phaser.Math.RAD_TO_DEG * angle);
    bullet
      .enableBody(true, this.turret.x, this.turret.y, true, true)
      .setVelocity(velocity.x, velocity.y);
  }

  hurtPlayer(enemy) {
    console.log('enemy hit player');
    var explosion = new Explosion(this, enemy.x, enemy.y, 6.0);

    this.lives -= 1;
    var livesFormated = this.zeroPad(this.lives, 2);
    this.livesLabel.text = "LIVES " + livesFormated;
    if (this.lives == 0) {
      this.playerDied();
    }

    this.kills += 1;
    var killsFormated = this.zeroPad(this.kills, 3);
    this.killsLabel.text = "KILLS " + killsFormated;

    if (this.kills % 10 == 0) {
      this.lives += 1;
      var livesFormated = this.zeroPad(this.lives, 2);
      this.livesLabel.text = "LIVES " + livesFormated;
    }

    this.resetPos(enemy);

  }
  playerDied() {
    this.physics.pause();
    this.gameOver = true;
  }
  mainMenu() {
    this.physics.pause();
    this.scene.start('Boot');
  }

  hitEnemy(bullet, enemy) {
    console.log('bullet hit enemy');
    bullet.disableBody(true, true);

    var explosion = new Explosion(this, enemy.x, enemy.y, 4.0);
    this.enemySpeed += 0.2;

    this.score += 100;
    var scoreFormated = this.zeroPad(this.score, 6);
    this.scoreLabel.text = "SCORE " + scoreFormated;

    this.kills += 1;
    var killsFormated = this.zeroPad(this.kills, 3);
    this.killsLabel.text = "KILLS " + killsFormated;

    if (this.kills % 10 == 0) {
      this.lives += 1;
      var livesFormated = this.zeroPad(this.lives, 2);
      this.livesLabel.text = "LIVES " + livesFormated;
    }

    this.resetPos(enemy);
  }

  resetPos(ship) {

    //Generate random coordinates to respawn enemy
    //DOES NOT SPAWN IN OUTER 100 PIXELS. This allows adjusting spawn if needed
    var randomX = Phaser.Math.Between(200, this.centerX * 2);
    randomX -= 100;
    var randomY = Phaser.Math.Between(200, this.centerY * 2);
    randomY -= 100;

    //Make sure enemy doesn't overlap with player
    var toleranceX = Math.abs(this.player.x - randomX);
    var toleranceY = Math.abs(this.player.y - randomY);

    if ((toleranceX < 100) && (toleranceY < 100)) {
      console.log('random spawn too close to player. adjusting:')

      if (this.player.x < randomX) {
        console.log('shifted X coordinate right of player');
        randomX += 95;
      } else if (this.player.x > randomX) {
        console.log('shifted X coordinate left of player');
        randomX -= 95;
      }

      if (this.player.y < randomY) {
        console.log('shifted Y coordinate below player');
        randomY += 95;
      } else if (this.player.y > randomY) {
        console.log('shifted Y coordinate above player');
        randomY -= 95;
      }
    }

    //Set enemy's coordinates
    ship.x = randomX;
    ship.y = randomY;

  }

  moveEnemyVertical(enemy, direction) {
    enemy.y += (this.enemySpeed * direction);
    if ((enemy.y > this.centerY * 2) || (enemy.y < 0)) {
      this.resetPos(enemy);
    }
  }
  moveEnemyHorizontal(enemy, direction) {
    enemy.x += (this.enemySpeed * direction);
    if ((enemy.x > this.centerX * 2) || (enemy.x < 0)) {
      this.resetPos(enemy);
    }
  }

  zeroPad(number, size){
      var stringNumber = String(number);
      while(stringNumber.length < (size || 2)){
        stringNumber = "0" + stringNumber;
      }
      return stringNumber;
  }

}

class Explosion extends Phaser.GameObjects.Sprite {
  constructor(scene,x,y, scale){
    super(scene, x, y, "explosion");
    scene.add.existing(this);
    this.setScale(scale);
    this.play("explode");
  }
}
