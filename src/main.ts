import Phaser from "phaser";
import "./style.css";

class MainScene extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keys!: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };
  private dpadState = {
    up: false,
    down: false,
    left: false,
    right: false
  };
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private readonly speed = 220;

  preload() {
    const gfx = this.add.graphics();
    gfx.fillStyle(0x4dd0e1, 1);
    gfx.fillRect(0, 0, 32, 32);
    gfx.generateTexture("player_idle", 32, 32);
    gfx.clear();
    gfx.fillStyle(0x26a69a, 1);
    gfx.fillRect(0, 0, 32, 32);
    gfx.fillStyle(0xffffff, 1);
    gfx.fillRect(6, 6, 6, 6);
    gfx.fillRect(20, 6, 6, 6);
    gfx.generateTexture("player_step", 32, 32);
    gfx.destroy();
  }

  create() {
    this.add.text(24, 24, "Roboman", {
      fontFamily: "sans-serif",
      fontSize: "32px",
      color: "#e6f3ff"
    });

    this.player = this.physics.add
      .sprite(120, 120, "player_idle")
      .setCollideWorldBounds(true);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    }) as MainScene["keys"];

    this.anims.create({
      key: "walk",
      frames: [{ key: "player_idle" }, { key: "player_step" }],
      frameRate: 6,
      repeat: -1
    });

    this.registerDpadControls();
  }

  update() {
    let vx = 0;
    let vy = 0;

    const left =
      this.cursors.left?.isDown || this.keys.left.isDown || this.dpadState.left;
    const right =
      this.cursors.right?.isDown ||
      this.keys.right.isDown ||
      this.dpadState.right;
    const up =
      this.cursors.up?.isDown || this.keys.up.isDown || this.dpadState.up;
    const down =
      this.cursors.down?.isDown || this.keys.down.isDown || this.dpadState.down;

    if (left) vx = -this.speed;
    else if (right) vx = this.speed;

    if (up) vy = -this.speed;
    else if (down) vy = this.speed;

    this.player.setVelocity(vx, vy);

    if (vx !== 0 || vy !== 0) {
      if (!this.player.anims.isPlaying) this.player.anims.play("walk");
    } else {
      this.player.anims.stop();
      this.player.setTexture("player_idle");
    }
  }

  private registerDpadControls() {
    const buttons = document.querySelectorAll<HTMLButtonElement>(".dpad-btn");
    const setDir = (dir: keyof MainScene["dpadState"], pressed: boolean) => {
      this.dpadState[dir] = pressed;
    };

    buttons.forEach((btn) => {
      const dir = btn.dataset.dir as keyof MainScene["dpadState"] | undefined;
      if (!dir) return;

      const onDown = (event: Event) => {
        event.preventDefault();
        setDir(dir, true);
      };
      const onUp = (event: Event) => {
        event.preventDefault();
        setDir(dir, false);
      };

      btn.addEventListener("pointerdown", onDown);
      btn.addEventListener("pointerup", onUp);
      btn.addEventListener("pointercancel", onUp);
      btn.addEventListener("pointerleave", onUp);
      btn.addEventListener("touchend", onUp);
    });

    window.addEventListener("blur", () => {
      this.dpadState = { up: false, down: false, left: false, right: false };
    });
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  backgroundColor: "#1b1f2a",
  parent: "game",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: [MainScene]
};

new Phaser.Game(config);
