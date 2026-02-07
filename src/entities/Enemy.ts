import Phaser from "phaser";
import type { Direction } from "./Player";

export class Enemy {
  public readonly sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  public lastDir: Direction = "down";
  public entering = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add
      .sprite(x, y, "badguy1")
      .setCollideWorldBounds(true);
    this.sprite.setDepth(1);
    this.sprite.setVisible(false);
    this.sprite.setActive(false);
    this.sprite.body.enable = false;
  }

  createAnims(scene: Phaser.Scene) {
    const framesPerRow = 4;
    const enemyRowFrames = (row: number) =>
      scene.anims.generateFrameNumbers("badguy1", {
        start: row * framesPerRow,
        end: row * framesPerRow + framesPerRow - 1
      });

    scene.anims.create({
      key: "enemy_walk_down",
      frames: enemyRowFrames(0),
      frameRate: 6,
      repeat: -1
    });
    scene.anims.create({
      key: "enemy_walk_left",
      frames: enemyRowFrames(1),
      frameRate: 6,
      repeat: -1
    });
    scene.anims.create({
      key: "enemy_walk_right",
      frames: enemyRowFrames(2),
      frameRate: 6,
      repeat: -1
    });
    scene.anims.create({
      key: "enemy_walk_up",
      frames: enemyRowFrames(3),
      frameRate: 6,
      repeat: -1
    });
  }

  setActiveVisible(active: boolean) {
    this.sprite.setActive(active);
    this.sprite.setVisible(active);
    this.sprite.body.enable = active;
  }

  updateChase(scene: Phaser.Scene, targetX: number, targetY: number, speed: number) {
    const toTarget = new Phaser.Math.Vector2(
      targetX - this.sprite.x,
      targetY - this.sprite.y
    );
    const wander = new Phaser.Math.Vector2(
      Math.cos(scene.time.now / 900),
      Math.sin(scene.time.now / 700)
    );
    toTarget.add(wander.scale(70));

    if (toTarget.lengthSq() > 0.001) {
      toTarget.normalize().scale(speed);
      this.sprite.setVelocity(toTarget.x, toTarget.y);

      const dir: Direction =
        Math.abs(toTarget.x) >= Math.abs(toTarget.y)
          ? toTarget.x < 0
            ? "left"
            : "right"
          : toTarget.y < 0
            ? "up"
            : "down";
      this.lastDir = dir;
      const enemyAnimKey = `enemy_walk_${dir}`;
      const enemyAnim = scene.anims.get(enemyAnimKey);
      if (enemyAnim && enemyAnim.frames.length > 0) {
        this.sprite.anims.play(enemyAnimKey, true);
      }
    } else {
      this.sprite.setVelocity(0, 0);
    }
  }

  setIdleFrame() {
    this.sprite.anims.stop();
    this.sprite.setFrame(this.getIdleFrame(this.lastDir));
  }

  private getIdleFrame(dir: Direction) {
    switch (dir) {
      case "down":
        return 0;
      case "left":
        return 4;
      case "right":
        return 8;
      case "up":
        return 12;
      default:
        return 0;
    }
  }
}
