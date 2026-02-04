Progress Log

- Created `CONTEXT.md` with project goals, stack, scope, and constraints.
- Installed Git Bash.
- Installed Node.js.
- Initialized npm project and installed dependencies: `phaser`, `typescript`, and `vite`.
- Added `tsconfig.json` and `.gitignore`.
- Created `index.html`, `src/main.ts`, and `src/style.css` for a minimal Phaser + Vite setup.
- Added Vite scripts to `package.json` (`dev`, `build`, `preview`).
- Implemented basic player movement (arrow keys + WASD) with a simple 2-frame walk animation.
- Added `vite.config.ts` with a GitHub Pages base path and a Pages workflow for automated deploys.
- GitHub Pages deployed successfully at `https://janachron.github.io/roboman/`.
- Added a mobile-only on-screen D-pad for movement controls.
- Added diagonal D-pad buttons and responsive canvas scaling for better mobile fit.
- Improved mobile D-pad input to support sliding between directions.
- Moved mobile controls into a bottom control bar so gameplay fills the top 4/5 of the screen.
- Switched game canvas to a portrait resolution with fit scaling for mobile.
- Overlayed the mobile control bar on top of the game canvas to avoid scrolling.
