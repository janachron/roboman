Project: Web-based 2D game

Goal: Create a sharable browser game with graphics, animations, and sound that can be played without installing anything. The game should be lightweight, run smoothly in most browsers, and be easy to update and share via GitHub Pages.

Tech Stack:
- TypeScript for code structure and type safety
- Phaser.js for 2D game engine and rendering
- Vite for local dev server and bundling
- HTML/CSS for hosting and basic UI
- GitHub + GitHub Pages for version control and distribution

Scope:
- Core gameplay mechanics (player movement, obstacles, scoring)
- Visual assets: sprites, animations, and backgrounds
- Audio: simple music and sound effects
- Optional: start menu, pause, and restart functionality

Current State:
- GitHub Pages deploy configured via Actions; live demo at `https://janachron.github.io/roboman/`.
- Mobile-first layout with portrait canvas and overlay controls (D-pad + Fire button).
- Start screen gates gameplay and music.
- Player movement via keyboard + D-pad with directional sprite sheet (4x4, 41x50).
- Enemy uses `badguy1.png` (4x4, 40x51) with directional animations and enters from above on start (hidden off-screen before tween). Corpse now lingers on death.
- Bullets fire from mouse (desktop) and Fire button (mobile); enemy has 20 HP; HP label shown.
- Audio assets in `public/assets/audio/`, theme plays on Start (`thelast-tothefuture.mp3`), gunshot/explosion SFX wired.
- Code split into `src/scenes/MainScene.ts` plus `src/entities/Player.ts` and `src/entities/Enemy.ts`.

Constraints:
- Must be free to develop and host
- Should run entirely in the browser (no installs)
- Lightweight for fast load times


Important:
- Update `CONTEXT.md` when anything new is learned or behavior changes.
