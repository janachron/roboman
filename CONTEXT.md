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
- Basic player movement (arrow keys + WASD) and a simple 2-frame walk animation.
- GitHub Pages deploy configured via Actions.
- Live demo deployed at `https://janachron.github.io/roboman/`.
- Mobile-only on-screen D-pad for movement controls.
- Diagonal D-pad buttons and responsive canvas scaling for mobile screens.
- D-pad supports sliding between directions without lifting.
- Mobile layout uses a bottom control bar (1/5 screen) and gameplay in top 4/5.
- Game canvas uses a portrait resolution with fit scaling for mobile screens.
- Control bar is overlayed on the bottom of the game canvas to avoid scrolling.
- Game canvas includes bottom buffer for mobile browser UI.
- Bottom buffer is adaptive (viewport + safe-area); control bar gradient removed.
- Mobile layout tweaks to keep controls visible and allow pull-to-refresh.
- Audio assets live in `public/assets/audio/`.
- Background music (`theme.mp3`) plays after first user interaction.
- Added iOS-friendly touch unlock hooks for background music.
- Background music unlocks on any user input (keyboard or pointer).
- Audio unlock flow improved to start on the first gesture.
- Player movement speed doubled.
- Start screen with centered button gates gameplay and music.
- Player movement speed doubled again.
- Enemy entity added that slowly seeks the player and triggers a hit flash on contact.

Constraints:
- Must be free to develop and host
- Should run entirely in the browser (no installs)
- Lightweight for fast load times


Important:
- AI Agent must always remember to update PROGRESS.md before committing ( can you update these as needed without reminding me)
- AI Agent must always remember to updated CONTEXT.md if anything new has been learned ( can you update these as needed without reminding me)
