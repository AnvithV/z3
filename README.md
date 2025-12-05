<<<<<<< HEAD
## Z3 + Phaser (Vite)

Browser demo showing Z3 constraints alongside a Phaser scene. Built with Vite + vanilla JS.

### Setup
```
cd /Users/anvith/z3/web-z3-phaser
npm install
```

### Run dev server
```
npm run dev
```
Open the printed localhost URL. The page solves:
- Children/pets puzzle
- Fence constraints (inside/on/outside)
- Finite-range value sampling via model blocking
and displays a minimal Phaser scene placeholder.

### Build preview
```
npm run build
npm run preview
```
=======
## Z3 SMT Experiments (Node + Vite/Phaser)

Two entry points:
- **Node CLI**: `z3demo.js` (minimal demo) and `z3_puzzles.js` (puzzles + PCG constraints).
- **Browser**: `web-z3-phaser` (Vite app) runs the same Z3 logic in-browser with a Phaser placeholder scene.

## Prereqs
- Node 18+ (`node --version`).

## Quickstart: Node scripts (repo root)
```bash
npm install
npm run demo      # prints "sat. A valid value for x is: 9"
npm run puzzles   # children/pets, fence inside/on/outside, value sampling, PCG placements
```
Files:
- `z3demo.js` — minimal Z3 example.
- `z3_puzzles.js` — children/pets (4 int vars), fence constraints, model-blocking value sampler, PCG placements (wheelbarrow in fence, mushroom avoiding occupied tiles, 3 signs near a path, beehive on any empty tile).

## Quickstart: Browser (Vite + Phaser + Z3)
Path: `web-z3-phaser`
```bash
cd web-z3-phaser
npm install
npm run dev      # or npm run preview
# open the printed localhost URL (e.g., http://localhost:5173 or :4173)
```
What you should see:
- Children & Pets JSON solution.
- Fence constraints JSON (inside/onFence/outside).
- Value sampling JSON (all valid ints + random pick).
- Phaser placeholder canvas saying “Phaser ready + Z3 demo”.

Browser Z3 notes (SharedArrayBuffer/threads):
- COOP/COEP headers are set in `vite.config.js`.
- Z3 runtime files served from `public/z3/` (`z3-built.js`, `z3-built.wasm`).
- If you see a thread/SharedArrayBuffer error: stop the server, restart, hard-refresh (Shift+Reload). If needed, DevTools → Application → Service Workers → Unregister → reload.

### Build/preview (browser app)
```bash
cd web-z3-phaser
npm run build
npm run preview
```

## Repo layout
- `package.json` — root scripts: `demo`, `puzzles`.
- `z3demo.js` — minimal Z3 CLI demo.
- `z3_puzzles.js` — puzzles + PCG placements + value sampler.
- `web-z3-phaser/` — Vite app:
  - `src/main.js` — browser Z3 logic + Phaser placeholder.
  - `public/z3/` — Z3 wasm/js runtime copied for browser use.
  - `vite.config.js` — COOP/COEP headers for SharedArrayBuffer.
  - `README.md` — app-specific quick notes.

## Status vs. instructions
- Done: node demo, children/pets with 4 ints, fence inside/on/outside, value sampling, PCG placements, browser version with Phaser placeholder.
- Optional not done: Pathfinder tile integration, richer PCG tasks.

## Tests run
- `npm run demo`
- `npm run puzzles`
- `npm run build` (inside `web-z3-phaser`)
>>>>>>> 05ba928 (Add Z3 demos, puzzles, and Vite Phaser app)

