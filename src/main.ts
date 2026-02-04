import Phaser from "phaser";
import "./style.css";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 450,
  backgroundColor: "#1b1f2a",
  parent: "game",
  scene: {
    preload() {
      // Load assets here.
    },
    create() {
      this.add.text(24, 24, "Roboman", {
        fontFamily: "sans-serif",
        fontSize: "32px",
        color: "#e6f3ff"
      });
    },
    update() {
      // Game loop.
    }
  }
};

new Phaser.Game(config);
