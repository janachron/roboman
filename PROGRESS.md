Progress Log

- Project scaffolding complete (Phaser + TypeScript + Vite, scripts, configs).
- GitHub Pages deployment set up and live at `https://janachron.github.io/roboman/`.
- Mobile-first layout with portrait canvas, overlay controls, and D-pad support.
- Start screen implemented; gameplay begins and music starts on button press.
- Core gameplay loop: player movement, enemy that seeks the player, bullets with auto-aim.
- Audio pipeline added (assets in `public/assets/audio/`, theme music plays on start).
- Enemy now has 20 HP; bullets deal 1 damage each.
- Added on-screen version label (`v0.1.7`) for deployment verification.
- Fire now only triggers from the Fire button on mobile (mouse left click on desktop).
- Enemy death now requires 20 hits and triggers a stronger hit effect.
- Adjusted canvas layout to better align with the viewport on mobile.
