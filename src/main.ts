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
  private enemyLastDir: "down" | "left" | "right" | "up" = "down";
  private bullets!: Phaser.Physics.Arcade.Group;
  private music?: Phaser.Sound.BaseSound;
  private readonly speed = 704;
  private readonly enemySpeed = 180;
  private readonly bulletSpeed = 720;
  private lastEnemyHitAt = 0;
  private enemyHp = 200;
  private enemyAlive = true;
  private enemyHpText!: Phaser.GameObjects.Text;
  private gameStarted = false;
  private gameOver = false;
  private enemyEntering = false;
  private startOverlay?: HTMLElement;
  private fireReady = true;
  private fireButton?: HTMLButtonElement;
  private lastDir: "down" | "left" | "right" | "up" = "down";
  private countdownText?: Phaser.GameObjects.Text;
  private readonly shotSoundKey = "sfx_shot";
  private readonly hitSoundKey = "sfx_hit";
  private readonly explosionSoundKey = "sfx_explosion";
  private readonly gameOverSoundKey = "sfx_gameover";
  private smokeEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  private fireEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;
  private goodJobText?: Phaser.GameObjects.Text;
  private electroEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;

  preload() {
    this.load.audio("theme", ["assets/audio/theme.mp3"]);
    // Optional SFX (add files to public/assets/audio/).
    this.load.audio(this.shotSoundKey, ["assets/audio/shot.mp3"]);
    this.load.audio(this.hitSoundKey, ["assets/audio/hit.mp3"]);
    this.load.audio(this.explosionSoundKey, ["assets/audio/explosion.mp3"]);
    this.load.audio(this.gameOverSoundKey, ["assets/audio/gameover.mp3"]);
    this.load.spritesheet("roboman", "assets/sprites/roboman-walk.png", {
      frameWidth: 41,
      frameHeight: 50
    });
    this.load.spritesheet("badguy1", "assets/sprites/badguy1.png", {
      frameWidth: 40,
      frameHeight: 51
    });

    const gfx = this.add.graphics();
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

    gfx.clear();
    gfx.fillStyle(0xffc400, 1);
    gfx.fillCircle(3, 3, 3);
    gfx.generateTexture("spark", 6, 6);

    gfx.clear();
    gfx.fillStyle(0x9e9e9e, 1);
    gfx.fillCircle(6, 6, 6);
    gfx.generateTexture("smoke", 12, 12);

    gfx.clear();
    gfx.fillStyle(0xff7043, 1);
    gfx.fillCircle(5, 5, 5);
    gfx.generateTexture("fire", 10, 10);

    gfx.clear();
    gfx.fillStyle(0x64b5f6, 1);
    gfx.fillRect(0, 0, 8, 2);
    gfx.generateTexture("electric", 8, 2);
    gfx.destroy();
  }

  create() {
    this.cameras.main.setBackgroundColor("#000");

    const gameRoot = document.getElementById("game");
    if (gameRoot) {
      gameRoot.addEventListener(
        "touchmove",
        (event) => {
          event.preventDefault();
        },
        { passive: false }
      );
    }

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

    this.enemyHpText = this.add.text(GAME_WIDTH - 12, 36, "HP: 200", {
      fontFamily: "sans-serif",
      fontSize: "12px",
      color: "#ffb0b0"
    }).setOrigin(1, 0);

    this.player = this.physics.add
      .sprite(120, GAME_HEIGHT - 120, "roboman")
      .setCollideWorldBounds(true);
    this.player.setDepth(2);
    this.player.setVisible(false);
    this.player.setActive(false);
    this.player.body.enable = false;

    this.enemy = this.physics.add
      .sprite(420, -200, "badguy1")
      .setCollideWorldBounds(true);
    this.enemy.setDepth(1);
    this.enemy.setScale(3);
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

    const framesPerRow = 4;
    const rowFrames = (key: string, row: number) =>
      this.anims.generateFrameNumbers("roboman", {
        start: row * framesPerRow,
        end: row * framesPerRow + framesPerRow - 1
      });

    this.anims.create({
      key: "walk_down",
      frames: rowFrames("roboman", 0),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: "walk_left",
      frames: rowFrames("roboman", 1),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: "walk_right",
      frames: rowFrames("roboman", 2),
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: "walk_up",
      frames: rowFrames("roboman", 3),
      frameRate: 8,
      repeat: -1
    });

    const enemyRowFrames = (row: number) =>
      this.anims.generateFrameNumbers("badguy1", {
        start: row * framesPerRow,
        end: row * framesPerRow + framesPerRow - 1
      });

    this.anims.create({
      key: "enemy_walk_down",
      frames: enemyRowFrames(0),
      frameRate: 6,
      repeat: -1
    });
    this.anims.create({
      key: "enemy_walk_left",
      frames: enemyRowFrames(1),
      frameRate: 6,
      repeat: -1
    });
    this.anims.create({
      key: "enemy_walk_right",
      frames: enemyRowFrames(2),
      frameRate: 6,
      repeat: -1
    });
    this.anims.create({
      key: "enemy_walk_up",
      frames: enemyRowFrames(3),
      frameRate: 6,
      repeat: -1
    });

    const smokeParticles = this.add.particles(0, 0, "smoke", {
      speedY: { min: -20, max: -50 },
      speedX: { min: -10, max: 10 },
      lifespan: 800,
      scale: { start: 1.4, end: 2.6 },
      alpha: { start: 0.5, end: 0 },
      quantity: 6,
      frequency: 80
    });
    smokeParticles.setDepth(3);
    this.smokeEmitter = smokeParticles;
    this.smokeEmitter.stop();

    const fireParticles = this.add.particles(0, 0, "fire", {
      speedY: { min: -30, max: -60 },
      speedX: { min: -10, max: 10 },
      lifespan: 500,
      scale: { start: 1.6, end: 0.4 },
      alpha: { start: 0.8, end: 0 },
      quantity: 6,
      frequency: 70
    });
    fireParticles.setDepth(3);
    this.fireEmitter = fireParticles;
    this.fireEmitter.stop();

    const electroParticles = this.add.particles(0, 0, "electric", {
      speed: { min: 30, max: 120 },
      angle: { min: 0, max: 360 },
      lifespan: 350,
      quantity: 6,
      scale: { start: 1, end: 0 },
      alpha: { start: 0.9, end: 0 }
    });
    electroParticles.setDepth(4);
    this.electroEmitter = electroParticles;
    this.electroEmitter.stop();

    this.registerDpadControls();
    this.music = this.sound.add("theme", { loop: true, volume: 0.5 });
    this.setupStartOverlay();

    this.physics.add.overlap(this.player, this.enemy, () => {
      if (!this.gameStarted || this.gameOver || !this.enemyAlive) return;
      const now = this.time.now;
      if (now - this.lastEnemyHitAt < 750) return;
      this.lastEnemyHitAt = now;

      this.gameOver = true;
      this.player.setVelocity(0, 0);
      this.enemy.setVelocity(0, 0);

      this.player.setRotation(-Math.PI / 2);
      this.player.setTint(0x9ad7ff);
      this.electroEmitter?.setPosition(this.player.x, this.player.y);
      this.electroEmitter?.start();
      this.playSfx(this.gameOverSoundKey, 0.7);

      this.cameras.main.flash(120, 255, 60, 60);
      const gameOverText = this.add.text(
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2,
        "Game Over",
        {
          fontFamily: "sans-serif",
          fontSize: "36px",
          color: "#ffb0b0"
        }
      );
      gameOverText.setOrigin(0.5, 0.5);
    });

    this.physics.add.overlap(
      this.bullets,
      this.enemy,
      (bulletObj, enemyObj) => {
        if (!this.enemyAlive) return;
        const bullet = bulletObj as Phaser.Physics.Arcade.Image;
        const enemy = enemyObj as Phaser.Physics.Arcade.Sprite;
        if (!bullet.active) return;
        bullet.disableBody(true, true);

        this.playSfx(this.hitSoundKey, 0.6);
        this.spawnHitSparks(enemy.x, enemy.y);

        this.enemyHp = Math.max(0, this.enemyHp - 1);
        this.enemyHpText.setText(`HP: ${this.enemyHp}`);
        this.updateEnemyEffects();
        if (this.enemyHp > 0) {
          enemy.setVisible(true);
          enemy.setActive(true);
          enemy.body.enable = true;
          return;
        }

        this.enemyAlive = false;
        this.cameras.main.shake(240, 0.015);
        this.cameras.main.flash(220, 255, 120, 80);
        this.playSfx(this.explosionSoundKey, 0.7);

        enemy.setVelocity(0, 0);
        enemy.setScale(3);
        enemy.setRotation(-Math.PI / 2);
        enemy.setTint(0x222222);
        this.electroEmitter?.setPosition(enemy.x, enemy.y);
        this.electroEmitter?.start();
        enemy.setVisible(true);
        enemy.setActive(true);
        enemy.body.enable = false;

        this.smokeEmitter?.stop();
        this.fireEmitter?.stop();
        this.time.delayedCall(1500, () => {
          this.electroEmitter?.stop();
        });

        this.time.delayedCall(5000, () => {
          if (this.goodJobText) return;
          this.goodJobText = this.add.text(
            GAME_WIDTH / 2,
            GAME_HEIGHT / 2,
            "Good Job",
            {
              fontFamily: "sans-serif",
              fontSize: "32px",
              color: "#e6f3ff",
              backgroundColor: "#1b2333",
              padding: { x: 20, y: 12 }
            }
          );
          this.goodJobText.setOrigin(0.5, 0.5);
          this.goodJobText.setInteractive({ useHandCursor: true });
          this.goodJobText.on("pointerdown", () => this.resetGame());
        });
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
    if (!this.gameStarted || this.gameOver) return;

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
      const dir =
        Math.abs(vx) >= Math.abs(vy)
          ? vx < 0
            ? "left"
            : "right"
          : vy < 0
            ? "up"
            : "down";
      this.lastDir = dir;
      this.player.anims.play(`walk_${dir}`, true);
    } else {
      this.player.anims.stop();
      this.player.setFrame(this.getIdleFrame(this.lastDir));
    }

    if (this.enemyAlive) {
      if (this.enemyEntering) {
        this.enemy.setVelocity(0, this.enemySpeed * 0.6);
        if (this.enemy.y > 120) {
          this.enemyEntering = false;
        }
      } else {
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

          const dir =
            Math.abs(toPlayer.x) >= Math.abs(toPlayer.y)
              ? toPlayer.x < 0
                ? "left"
                : "right"
              : toPlayer.y < 0
                ? "up"
                : "down";
          this.enemyLastDir = dir;
          const enemyAnimKey = `enemy_walk_${dir}`;
          const enemyAnim = this.anims.get(enemyAnimKey);
          if (enemyAnim && enemyAnim.frames.length > 0) {
            this.enemy.anims.play(enemyAnimKey, true);
          }
        } else {
          this.enemy.setVelocity(0, 0);
        }
      }
    }

    if (this.enemyAlive && this.enemyHp > 0 && (!this.enemy.visible || !this.enemy.active)) {
      this.enemy.setVisible(true);
      this.enemy.setActive(true);
      this.enemy.body.enable = true;
      this.enemy.setAlpha(1);
      this.enemy.setScale(3);
      this.enemy.anims.stop();
      this.enemy.setFrame(this.getEnemyIdleFrame(this.enemyLastDir));
    }

    if (this.enemyAlive) {
      this.updateEnemyEffects();
    }

    this.updateBulletHoming();
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
    startButton.addEventListener("pointerdown", () => this.startGame(), { once: true });
  }

  private getIdleFrame(dir: "down" | "left" | "right" | "up") {
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

  private getEnemyIdleFrame(dir: "down" | "left" | "right" | "up") {
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

  private startGame() {
    if (this.gameStarted) return;
    this.gameStarted = false;

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
    this.enemyHp = 200;
    this.enemyAlive = true;
    this.gameOver = false;
    this.enemyHpText.setText(`HP: ${this.enemyHp}`);
    this.updateEnemyEffects();

    this.enemy.setPosition(Phaser.Math.Between(60, 480), -200);
    this.enemyEntering = true;
    this.enemy.setVelocity(0, 0);

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

    const desktopMouseFire = (event: MouseEvent) => {
      const isTouchLike =
        (event as any).sourceCapabilities?.firesTouchEvents === true;
      if (isTouchLike) return;
      if (event.button === 0) {
        this.fireBullet();
      }
    };

    document.addEventListener("mousedown", desktopMouseFire);

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

    this.startCountdown();
  }

  private resetGame() {
    this.gameOver = false;
    this.goodJobText?.destroy();
    this.goodJobText = undefined;
    this.enemyHp = 200;
    this.enemyAlive = true;
    this.enemyHpText.setText(`HP: ${this.enemyHp}`);
    this.player.setPosition(120, GAME_HEIGHT - 120);
    this.player.setRotation(0);
    this.player.clearTint();
    this.electroEmitter?.stop();
    this.enemy.setPosition(420, 240);
    this.enemy.setScale(3);
    this.enemy.setRotation(0);
    this.enemy.clearTint();
    this.enemy.setVisible(true);
    this.enemy.setActive(true);
    this.enemy.body.enable = true;
    this.updateEnemyEffects();
  }

  private fireBullet() {
    if (!this.gameStarted || this.gameOver) return;
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

    const aim = this.getAimVector();
    aim.normalize().scale(this.bulletSpeed);

    bullet.setVelocity(aim.x, aim.y);
    bullet.setRotation(Math.atan2(aim.y, aim.x));
    bullet.setData("homing", true);

    this.playSfx(this.shotSoundKey, 0.4);

    this.time.delayedCall(900, () => {
      if (bullet.active) bullet.disableBody(true, true);
    });
  }

  private getAimVector() {
    if (this.enemyAlive) {
      const toEnemy = new Phaser.Math.Vector2(
        this.enemy.x - this.player.x,
        this.enemy.y - this.player.y
      );
      if (toEnemy.lengthSq() > 0.001) return toEnemy;
    }

    switch (this.lastDir) {
      case "left":
        return new Phaser.Math.Vector2(-1, 0);
      case "right":
        return new Phaser.Math.Vector2(1, 0);
      case "up":
        return new Phaser.Math.Vector2(0, -1);
      case "down":
      default:
        return new Phaser.Math.Vector2(0, 1);
    }
  }

  private updateBulletHoming() {
    if (!this.enemyAlive) return;
    this.bullets.children.each((child) => {
      const bullet = child as Phaser.Physics.Arcade.Image;
      if (!bullet.active || !bullet.getData("homing")) return;
      const desired = new Phaser.Math.Vector2(
        this.enemy.x - bullet.x,
        this.enemy.y - bullet.y
      );
      if (desired.lengthSq() < 0.01) return;
      desired.normalize().scale(this.bulletSpeed);
      const current = new Phaser.Math.Vector2(bullet.body.velocity.x, bullet.body.velocity.y);
      const steer = current.lerp(desired, 0.05);
      bullet.setVelocity(steer.x, steer.y);
      bullet.setRotation(Math.atan2(steer.y, steer.x));
    });
  }

  private startCountdown() {
    const total = 5;
    let remaining = total;
    this.countdownText?.destroy();
    this.countdownText = this.add.text(
      GAME_WIDTH / 2,
      GAME_HEIGHT / 2,
      `${remaining}`,
      {
        fontFamily: "sans-serif",
        fontSize: "48px",
        color: "#e6f3ff"
      }
    );
    this.countdownText.setOrigin(0.5, 0.5);

    const tick = () => {
      remaining -= 1;
      if (!this.countdownText) return;
      if (remaining <= 0) {
        this.countdownText.destroy();
        this.countdownText = undefined;
        this.gameStarted = true;
        return;
      }
      this.countdownText.setText(`${remaining}`);
      this.time.delayedCall(1000, tick);
    };
    this.time.delayedCall(1000, tick);
  }

  private playSfx(key: string, volume: number) {
    if (!this.cache.audio.exists(key)) return;
    this.sound.play(key, { volume });
  }

  private spawnHitSparks(x: number, y: number) {
    const particles = this.add.particles(x, y, "spark", {
      speed: { min: 60, max: 160 },
      angle: { min: 0, max: 360 },
      lifespan: 300,
      quantity: 12,
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 }
    });
    this.time.delayedCall(320, () => particles.destroy());
  }

  private updateEnemyEffects() {
    if (!this.smokeEmitter || !this.fireEmitter) return;
    if (!this.enemyAlive) {
      this.smokeEmitter.stop();
      this.fireEmitter.stop();
      return;
    }

    this.smokeEmitter.setPosition(this.enemy.x, this.enemy.y - 40);
    this.fireEmitter.setPosition(this.enemy.x, this.enemy.y - 30);

    if (this.enemyHp <= 50) {
      this.smokeEmitter.start();
      this.fireEmitter.start();
    } else if (this.enemyHp <= 100) {
      this.smokeEmitter.start();
      this.fireEmitter.stop();
    } else {
      this.smokeEmitter.stop();
      this.fireEmitter.stop();
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
