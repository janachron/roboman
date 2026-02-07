import Phaser from "phaser";

export type Direction = "down" | "left" | "right" | "up";

export class Player {
  public readonly sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  public lastDir: Direction = "down";

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.sprite = scene.physics.add
      .sprite(x, y, "roboman")
      .setCollideWorldBounds(true);
    this.sprite.setDepth(2);
    this.sprite.setVisible(false);
    this.sprite.setActive(false);
    this.sprite.body.enable = false;
  }

  createAnims(scene: Phaser.Scene) {
    const framesPerRow = 4;
    const rowFrames = (row: number) =>
      scene.anims.generateFrameNumbers("roboman", {
        start: row * framesPerRow,
        end: row * framesPerRow + framesPerRow - 1
      });

    scene.anims.create({
      key: "walk_down",
      frames: rowFrames(0),
      frameRate: 8,
      repeat: -1
    });
    scene.anims.create({
      key: "walk_left",
      frames: rowFrames(1),
      frameRate: 8,
      repeat: -1
    });
    scene.anims.create({
      key: "walk_right",
      frames: rowFrames(2),
      frameRate: 8,
      repeat: -1
    });
    scene.anims.create({
      key: "walk_up",
      frames: rowFrames(3),
      frameRate: 8,
      repeat: -1
    });
  }

  setActiveVisible(active: boolean) {
    this.sprite.setActive(active);
    this.sprite.setVisible(active);
    this.sprite.body.enable = active;
  }

  updateMovement(vx: number, vy: number) {
    this.sprite.setVelocity(vx, vy);

    if (vx !== 0 || vy !== 0) {
      const dir: Direction =
        Math.abs(vx) >= Math.abs(vy)
          ? vx < 0
            ? "left"
            : "right"
          : vy < 0
            ? "up"
            : "down";
      this.lastDir = dir;
      this.sprite.anims.play(`walk_${dir}`, true);
    } else {
      this.sprite.anims.stop();
      this.sprite.setFrame(this.getIdleFrame(this.lastDir));
    }
  }

  setPosition(x: number, y: number) {
    this.sprite.setPosition(x, y);
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
