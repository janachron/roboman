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
- GitHub Pages deploy configured via Actions.
- Live demo at `https://janachron.github.io/roboman/`.
- Portrait mobile layout with overlay controls (D-pad + Fire button).
- Start screen (black overlay + Start button) gates gameplay and music.
- Player movement (keyboard + D-pad), faster speed, and simple walk animation.
- Enemy seeks the player; bullets auto-aim to the enemy (tap Fire or mouse click), 20 HP per enemy.
- Audio assets in `public/assets/audio/`, theme plays on Start.
- On-screen version label for deployment verification.
- Fire only triggers from the Fire button on mobile (mouse left click on desktop).
- Canvas layout aligned to viewport on mobile.
- Enemy HP and desktop left-click firing corrected.
- On-screen enemy HP label added for debugging.
- Desktop click firing restored; canvas centered on desktop.
- Desktop click handling fixed after input error.
- Start-button taps no longer trigger firing on mobile.
- Enemy visibility reinforced during updates to prevent disappearing.
- Desktop firing uses a mouse down fallback.
- Desktop firing also listens to document pointerdown; enemy visibility reinforced.
- Desktop firing uses mouse down only (touch-guarded).
- Mobile overscroll lock enabled to prevent zoom/pan.
- Touch-action locked on game canvas; controls remain tappable with selection disabled.
- Touchmove is prevented on the game container for extra mobile stability.
- Player uses a 4x4 sprite sheet (20x20 frames) with directional animations.
- Sprite sheet filename now uses underscores (no spaces) for reliable loading.

Constraints:
- Must be free to develop and host
- Should run entirely in the browser (no installs)
- Lightweight for fast load times


Important:
- AI Agent must always remember to update PROGRESS.md before committing ( can you update these as needed without reminding me)
- AI Agent must always remember to updated CONTEXT.md if anything new has been learned ( can you update these as needed without reminding me)
