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
  private activeDpadPointerId: number | null = null;
  private player!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private music?: Phaser.Sound.BaseSound;
  private readonly speed = 220;

  preload() {
    this.load.audio("theme", ["assets/audio/theme.mp3"]);

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

    this.music = this.sound.add("theme", { loop: true, volume: 0.5 });
    this.tryStartMusic();
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
    const dpad = document.querySelector<HTMLElement>(".dpad");
    if (!dpad) return;

    const resetDpad = () => {
      this.dpadState = { up: false, down: false, left: false, right: false };
      this.activeDpadPointerId = null;
    };

    const updateFromPoint = (x: number, y: number) => {
      const rect = dpad.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = x - cx;
      const dy = y - cy;

      const deadZone = Math.min(rect.width, rect.height) * 0.18;
      const next = { up: false, down: false, left: false, right: false };

      if (Math.abs(dx) < deadZone && Math.abs(dy) < deadZone) {
        this.dpadState = next;
        return;
      }

      if (dx <= -deadZone) next.left = true;
      if (dx >= deadZone) next.right = true;
      if (dy <= -deadZone) next.up = true;
      if (dy >= deadZone) next.down = true;

      this.dpadState = next;
    };

    dpad.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      if (this.activeDpadPointerId !== null) return;
      this.activeDpadPointerId = event.pointerId;
      updateFromPoint(event.clientX, event.clientY);
    });

    dpad.addEventListener("pointermove", (event) => {
      if (event.pointerId !== this.activeDpadPointerId) return;
      event.preventDefault();
      updateFromPoint(event.clientX, event.clientY);
    });

    dpad.addEventListener("pointerup", (event) => {
      if (event.pointerId !== this.activeDpadPointerId) return;
      event.preventDefault();
      resetDpad();
    });

    dpad.addEventListener("pointercancel", (event) => {
      if (event.pointerId !== this.activeDpadPointerId) return;
      event.preventDefault();
      resetDpad();
    });

    dpad.addEventListener("pointerleave", (event) => {
      if (event.pointerId !== this.activeDpadPointerId) return;
      event.preventDefault();
      resetDpad();
    });

    window.addEventListener("blur", resetDpad);
  }

  private tryStartMusic() {
    if (!this.music || this.music.isPlaying) return;
    this.sound.unlock();

    if (this.sound.locked) {
      const unlock = () => {
        this.sound.unlock();
        if (!this.sound.locked && this.music && !this.music.isPlaying) {
          this.music.play();
        }
      };
      this.input.once("pointerdown", unlock);
      this.input.keyboard.once("keydown", unlock);
      return;
    }

    this.music.play();
  }
}

const GAME_WIDTH = 540;
const GAME_HEIGHT = 960;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: "#1b1f2a",
  parent: "game",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT
  },
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
