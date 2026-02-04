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
  private enemy!: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  private bullets!: Phaser.Physics.Arcade.Group;
  private music?: Phaser.Sound.BaseSound;
  private readonly speed = 880;
  private readonly enemySpeed = 180;
  private readonly bulletSpeed = 720;
  private lastEnemyHitAt = 0;
  private enemyHp = 20;
  private enemyHpText!: Phaser.GameObjects.Text;
  private gameStarted = false;
  private startOverlay?: HTMLElement;
  private fireReady = true;
  private fireButton?: HTMLButtonElement;

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

    gfx.clear();
    gfx.fillStyle(0xef5350, 1);
    gfx.fillRect(0, 0, 36, 36);
    gfx.fillStyle(0x5d0000, 1);
    gfx.fillRect(6, 6, 24, 24);
    gfx.generateTexture("enemy", 36, 36);

    gfx.clear();
    gfx.fillStyle(0xfff59d, 1);
    gfx.fillRect(0, 0, 10, 4);
    gfx.generateTexture("bullet", 10, 4);
    gfx.destroy();
  }

  create() {
    this.cameras.main.setBackgroundColor("#000");

    this.add.text(24, 24, "Roboman", {
      fontFamily: "sans-serif",
      fontSize: "32px",
      color: "#e6f3ff"
    });

    this.add.text(GAME_WIDTH - 12, 18, "v0.1.7", {
      fontFamily: "sans-serif",
      fontSize: "12px",
      color: "#a9b6c8"
    }).setOrigin(1, 0);

    this.enemyHpText = this.add.text(GAME_WIDTH - 12, 36, "HP: 20", {
      fontFamily: "sans-serif",
      fontSize: "12px",
      color: "#ffb0b0"
    }).setOrigin(1, 0);

    this.player = this.physics.add
      .sprite(120, 120, "player_idle")
      .setCollideWorldBounds(true);
    this.player.setVisible(false);
    this.player.setActive(false);
    this.player.body.enable = false;

    this.enemy = this.physics.add
      .sprite(420, 240, "enemy")
      .setCollideWorldBounds(true);
    this.enemy.setVisible(false);
    this.enemy.setActive(false);
    this.enemy.body.enable = false;

    this.bullets = this.physics.add.group({
      defaultKey: "bullet",
      maxSize: 40
    });

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
    this.setupStartOverlay();

    this.physics.add.overlap(this.player, this.enemy, () => {
      const now = this.time.now;
      if (now - this.lastEnemyHitAt < 750) return;
      this.lastEnemyHitAt = now;

      this.cameras.main.flash(120, 255, 60, 60);
      this.player.setPosition(120, 120);
      this.enemy.setPosition(420, 240);
      this.enemy.setVelocity(0, 0);
    });

    this.physics.add.overlap(
      this.bullets,
      this.enemy,
      (bulletObj, enemyObj) => {
        const bullet = bulletObj as Phaser.Physics.Arcade.Image;
        const enemy = enemyObj as Phaser.Physics.Arcade.Sprite;
        if (!bullet.active) return;
        bullet.disableBody(true, true);

        this.enemyHp = Math.max(0, this.enemyHp - 1);
        this.enemyHpText.setText(`HP: ${this.enemyHp}`);
        if (this.enemyHp > 0) {
          enemy.setVisible(true);
          enemy.setActive(true);
          enemy.body.enable = true;
          return;
        }

        this.enemyHp = 20;
        this.enemyHpText.setText(`HP: ${this.enemyHp}`);
        this.cameras.main.shake(180, 0.01);
        this.cameras.main.flash(200, 255, 120, 80);

        enemy.setVelocity(0, 0);
        enemy.setScale(1.3);
        this.tweens.add({
          targets: enemy,
          scale: 1,
          duration: 220,
          ease: "Back.Out"
        });

        enemy.setPosition(
          Phaser.Math.Between(60, 480),
          Phaser.Math.Between(80, 880)
        );
        enemy.setVisible(true);
        enemy.setActive(true);
        enemy.body.enable = true;
      }
    );

    this.physics.world.on("worldbounds", (body: Phaser.Physics.Arcade.Body) => {
      const gameObject = body.gameObject as Phaser.GameObjects.GameObject | undefined;
      if (!gameObject) return;
      if (gameObject.texture?.key === "bullet") {
        (gameObject as Phaser.Physics.Arcade.Image).disableBody(true, true);
      }
    });
  }

  update() {
    if (!this.gameStarted) return;

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

    const toPlayer = new Phaser.Math.Vector2(
      this.player.x - this.enemy.x,
      this.player.y - this.enemy.y
    );
    const wander = new Phaser.Math.Vector2(
      Math.cos(this.time.now / 900),
      Math.sin(this.time.now / 700)
    );
    toPlayer.add(wander.scale(70));

    if (toPlayer.lengthSq() > 0.001) {
      toPlayer.normalize().scale(this.enemySpeed);
      this.enemy.setVelocity(toPlayer.x, toPlayer.y);
    } else {
      this.enemy.setVelocity(0, 0);
    }

    if (this.enemyHp > 0 && (!this.enemy.visible || !this.enemy.active)) {
      this.enemy.setVisible(true);
      this.enemy.setActive(true);
      this.enemy.body.enable = true;
    }
  }

  private setupStartOverlay() {
    this.startOverlay = document.querySelector<HTMLElement>(".start-overlay") || undefined;
    const startButton =
      this.startOverlay?.querySelector<HTMLButtonElement>(".start-button") ||
      undefined;

    if (!startButton) {
      this.startGame();
      return;
    }

    startButton.addEventListener("click", () => this.startGame(), { once: true });
    startButton.addEventListener("touchstart", () => this.startGame(), { once: true });
  }

  private startGame() {
    if (this.gameStarted) return;
    this.gameStarted = true;

    if (this.startOverlay) {
      this.startOverlay.style.display = "none";
    }

    this.cameras.main.setBackgroundColor("#1b1f2a");
    this.player.setActive(true);
    this.player.setVisible(true);
    this.player.body.enable = true;

    this.enemy.setActive(true);
    this.enemy.setVisible(true);
    this.enemy.body.enable = true;
    this.enemyHp = 20;

    this.fireButton =
      document.querySelector<HTMLButtonElement>(".action-btn") || undefined;
    if (this.fireButton) {
      this.fireButton.onclick = () => this.fireBullet();
      this.fireButton.ontouchstart = () => this.fireBullet();
    }

    this.input.on(
      "pointerdown",
      (pointer: Phaser.Input.Pointer) => {
        if (pointer.event) {
          const target = pointer.event.target as HTMLElement | null;
          if (target?.closest(".start-overlay")) return;
          if (this.fireButton && target && this.fireButton.contains(target)) return;
        }

        const isMouse =
          pointer.pointerType === "mouse" ||
          (pointer.event && "pointerType" in pointer.event
            ? (pointer.event as PointerEvent).pointerType === "mouse"
            : false);
        const button =
          pointer.button ??
          (pointer.event && "button" in pointer.event
            ? (pointer.event as MouseEvent).button
            : 0);
        if (isMouse && button === 0) {
          this.fireBullet();
        }
      },
      this
    );

    if (this.music && !this.music.isPlaying) {
      this.sound.unlock();

      if (this.sound.locked) {
        this.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
          if (!this.music || this.music.isPlaying) return;
          this.music.play();
        });
        return;
      }

      this.music.play();
    }
  }

  private fireBullet() {
    if (!this.gameStarted) return;
    if (!this.fireReady) return;
    this.fireReady = false;
    this.time.delayedCall(150, () => {
      this.fireReady = true;
    });

    const bullet = this.bullets.get(
      this.player.x,
      this.player.y,
      "bullet"
    ) as Phaser.Physics.Arcade.Image | null;
    if (!bullet) return;

    bullet.setActive(true);
    bullet.setVisible(true);
    bullet.body.enable = true;
    bullet.setCollideWorldBounds(true);
    bullet.body.onWorldBounds = true;

    const toEnemy = new Phaser.Math.Vector2(
      this.enemy.x - this.player.x,
      this.enemy.y - this.player.y
    );
    if (toEnemy.lengthSq() === 0) {
      toEnemy.set(1, 0);
    }
    toEnemy.normalize().scale(this.bulletSpeed);

    bullet.setVelocity(toEnemy.x, toEnemy.y);
    bullet.setRotation(Math.atan2(toEnemy.y, toEnemy.x));

    this.time.delayedCall(900, () => {
      if (bullet.active) bullet.disableBody(true, true);
    });
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
