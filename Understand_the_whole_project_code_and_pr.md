### Overview
This repository contains a Three Player Chess application with a React-based frontend and a bundled backend (a Java/Kotlin/Spring JAR, based on the presence of `backend/build/libs/backend.jar`). The app renders a custom SVG chessboard for three players, manages game state via React Context + custom hooks, and communicates with the backend over HTTP for game logic (new game, clicks/moves, current player, board state).

Key goals and flows:
- Landing page collects player names, starts a backend game session, then routes to the game.
- Game page shows a three-panel layout: theme selector (left), interactive SVG board (center), and status panel with captured pieces and actions (right).
- User interactions (clicking board polygons) are sent to the backend, which returns updated board, highlighted moves, current player, and game-over status.
- Sounds play for moves and captures; player names persist in `localStorage`.

Below is a deep-dive into structure, data flow, components, and how it all works together.

---

### Tech Stack
- Frontend: React 18, React Router (`react-router-dom`), CSS Modules
- HTTP Client: `axios`
- State management: React Context + custom hooks
- Assets: PNG images for pieces/kings; SVG board rendered from polygon definitions
- Backend: A compiled JAR (likely Spring Boot) exposing endpoints used by the frontend

---

### Entry Points and Routing
- `src/index.js`: Standard React entry; renders `<App />`.
- `src/App.js`:
  - Wraps the app with providers: `PlayerProvider`, `GameProvider`, `ThemeProvider`.
  - Configures routes:
    - `/` → `LandingPage`
    - `/game` → `GamePage`

```jsx
// src/App.js
<Router>
  <PlayerProvider>
    <GameProvider>
      <ThemeProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/game" element={<GamePage />} />
        </Routes>
      </ThemeProvider>
    </GameProvider>
  </PlayerProvider>
</Router>
```

---

### Pages
#### `LandingPage`
- File: `src/pages/LandingPage/LandingPage.jsx`
- Renders a welcoming screen with `PlayerForm`.
- On "Start Game": calls `gameService.newGame()` then navigates to `/game`.
- If backend isn’t running, alerts the user.

#### `GamePage`
- File: `src/pages/GamePage/GamePage.jsx`
- Three-panel layout:
  - Left: `ThemeSelector`
  - Center: title + `ChessBoard`
  - Right: `GameStatus`
- On mount: `initializeGame()` from `useGameState` loads backend state (board/current player).
- If players are not set (via `PlayerContext`), navigates back to `/`.
- Displays `GameOverModal` when `gameOver` is true.

---

### Contexts and Shared State
#### `PlayerContext`
- File: `src/context/PlayerContext.jsx`
- Keeps player names for `Blue`, `Green`, and `Red` in state and `localStorage`.
- Exposes `players`, `updatePlayer(color, name)`, `clearPlayers()`, `areAllPlayersSet()`.

#### `GameContext`
- File: `src/context/GameContext.jsx`
- Central game state shared across the Game page:
  - `boardState`: `{ [polygonId]: pieceCode }` map
  - `currentPlayer`: `'B' | 'G' | 'R'`
  - `highlightedMoves`: array of polygon IDs
  - `selectedPiece`: currently selected polygon ID
  - `capturedPieces`: `{ B: string[], G: string[], R: string[] }`
  - `gameOver`: boolean; `winner`: `'B' | 'G' | 'R' | null`
- Exposes mutators like `updateBoardState`, `updateCurrentPlayer`, `updateHighlightedMoves`, `selectPiece`, `clearSelection`, `endGame`, `resetGame`, `addCapturedPiece`.

#### `ThemeContext`
- File referenced: `src/context/ThemeContext` (used in `App.js`). Although not shown in your Recent Files, this provider likely toggles visual themes; `ThemeSelector` consumes it.

---

### Custom Hooks
#### `useGameState`
- File: `src/hooks/useGameState.js`
- Bridges UI and backend through `gameService` and manipulates `GameContext`.
- Key API:
  - `initializeGame`: `newGame` → `getBoard` → `getCurrentPlayer` → updates context.
  - `handlePolygonClick(polygonId)`: posts click to backend `onClick`, updates board, highlighted moves, selection, current player, game-over; detects captures by comparing previous vs new board maps and pushes captured pieces into `capturedPieces`; plays move/capture sounds.
- Tracks `loading` and `error`.

---

### Services (API Layer)
#### `apiClient`
- File: `src/services/api.js`
- `axios` instance with JSON headers and a 10s timeout.
- Note: uses relative paths (e.g., `/board`, `/onClick`) to leverage the dev proxy in `package.json` (commonly `proxy: "http://localhost:8080"`).
- Response interceptor logs errors and rethrows.

#### `gameService`
- File: `src/services/gameService.js`
- Endpoints used by the frontend:
  - `GET /newGame` → start a session
  - `POST /onClick` (text/plain body = polygonId) → returns `{ board, highlightedPolygons, gameOver, winner }`
  - `GET /currentPlayer` → returns `'B' | 'G' | 'R'`
  - `GET /board` → returns `{[polygonId]: pieceCode}`

---

### Gameplay UI Components
#### `ChessBoard`
- File: `src/components/game/ChessBoard/ChessBoard.jsx`
- Renders an SVG board with a list of triangular polygons from `BOARD_POLYGONS` and overlays `Piece` elements where `boardState` indicates.
- Clicking a polygon calls `handlePolygonClick` from `useGameState`.
- Uses `isPolygonHighlighted` to render highlights.

#### `Polygon`
- File: `src/components/game/Polygon/Polygon.jsx` (not shown in Recent Files, but referenced)
- Responsible for rendering each triangular cell as an SVG `<polygon>`, managing hover/click styles, and highlighting.

#### `Piece`
- File: `src/components/game/Piece/Piece.jsx`
- Translates `pieceCode` (like `BR` = Blue Rook) into an image path:
  - Color map: `'R' → 'w'`, `'G' → 'g'`, `'B' → 'b'` (white/red team uses `w` images)
  - Piece map: `R=rook, N=knight, B=bishop, Q=queen, K=king, P=pawn`
- Computes the center of the polygon to place a 40×40 image.

#### `GameStatus`
- File: `src/components/game/GameStatus/GameStatus.jsx`
- Displays current player's name and king image, captured pieces list, and action buttons:
  - Toggle Sound: uses `soundManager.toggle()`
  - End Game: calls `resetGame`, clears players, and navigates back to `/`.

#### `CapturedPieces`
- File: `src/components/game/CapturedPieces/CapturedPieces.jsx` (not shown in Recent Files)
- Receives `capturedPieces` and renders captured piece icons by player.

#### `ThemeSelector`
- File: `src/components/game/ThemeSelector/ThemeSelector.jsx` (not shown in Recent Files)
- Adjusts board/theme appearance via `ThemeContext`.

#### `GameOverModal`
- File: `src/components/game/GameOverModal/GameOverModal.jsx` (not shown in Recent Files)
- Shows the winner and provides options to close; game state remains for review.

---

### Landing Components
#### `PlayerForm`
- File: `src/components/landing/PlayerForm/PlayerForm.jsx`
- Likely orchestrates three `PlayerInput` fields, validates names, and enables "Start Game".
- Calls `onStartGame` passed from `LandingPage` when ready.

#### `PlayerInput`
- File: `src/components/landing/PlayerInput/PlayerInput.jsx`
- Single input for a player (Blue/Green/Red). Displays a king image (`king-b.png`, `king-g.png`, `king-w.png`) if available; falls back to a styled `♔`.

---

### Board Configuration and Utilities
#### Board configuration
- File: `src/components/game/ChessBoard/boardConfig.js`
- Provides `BOARD_POLYGONS` (cells) and `SVG_CONFIG` (size, viewBox, background color). Each polygon has id/points/color/shade.

#### Utilities
- `src/utils/boardHelpers.js`: contains `isPolygonHighlighted(id, highlightedMoves)` and potentially additional helpers for selection/highlighting logic.
- `src/utils/constants.js`: includes `COLOR_MAP` for mapping `'B'|'G'|'R'` to human-readable names and other constants.
- `src/utils/sounds.js`: `soundManager` with `playMove()`, `playCapture()`, and `toggle()` to enable/disable sound.

---

### Styling and Assets
- CSS Modules per component: e.g., `GamePage.module.css`, `ChessBoard.module.css`, `Piece.module.css`, etc.
- Piece images: `src/components/images/*` (imported via `require()` calls).
- Public HTML shell: `frontend/public/index.html`.

---

### Environment and Configuration
- `frontend/package.json`: typical CRA app with `proxy` set to `http://localhost:8080` (so relative API paths redirect to the backend during development).
- `.env` in `frontend/`: may define environment variables; by default, CRA uses `REACT_APP_*` variables only in the frontend. The app currently uses relative URLs, so `.env` is likely optional.
- Backend artifacts: `backend/build/libs/backend.jar` and a `start-backend.bat` script to run the backend locally.

---

### End-to-End Data Flow
1. Landing setup
   - Player names are captured via `PlayerForm`/`PlayerInput` and stored in `PlayerContext` + `localStorage`.
   - On click "Start Game", `LandingPage` calls `gameService.newGame()` → backend prepares/returns a new game state. Then route to `/game`.

2. Game initialization
   - `GamePage` mounts → `useGameState.initializeGame()` runs:
     - Calls `newGame` (defensive), `getBoard`, `getCurrentPlayer`.
     - Updates `GameContext` with initial board/current player and clears selection/highlights.

3. Board interaction
   - User clicks a polygon on the SVG board → `handlePolygonClick(polygonId)`:
     - Sends `POST /onClick` with the polygonId as text.
     - Backend returns:
       - Updated `board` map
       - `highlightedPolygons` (e.g., potential moves after selecting a piece)
       - `gameOver` flag and `winner`
     - The hook:
       - Compares pre/post board state to detect captures; pushes captured piece into the current player’s list and plays capture sound; otherwise plays move sound.
       - Updates board/highlighted moves/selection.
       - If not game over: calls `GET /currentPlayer` and updates `currentPlayer` in context.

4. Status and controls
   - `GameStatus` reads `currentPlayer` from props and resolves human label + image; displays captured pieces; offers sound toggle/end game actions.

5. Game over
   - When `gameOver` is true, `GameOverModal` opens with the `winner`. The board remains visible for review.

---

### How to Run Locally
1. Backend
   - From `Coding-Ninjas-Chess/backend`, there is a built JAR at `build/libs/backend.jar` and a helper script `start-backend.bat`.
   - Start it (one of):
     - Double-click `start-backend.bat`, or
     - In PowerShell: `java -jar backend\build\libs\backend.jar`
   - Ensure it listens on `http://localhost:8080` (as expected by the frontend proxy).

2. Frontend
   - Navigate to `Coding-Ninjas-Chess/frontend`.
   - Install deps: `npm install`.
   - Start dev server: `npm start`.
   - Open `http://localhost:3000` in a browser. The dev proxy forwards `/board`, `/onClick`, etc. to `http://localhost:8080`.

3. Production build
   - `npm run build` to build static assets in `build/`.
   - Serve via any static server; configure API base URL appropriately if not using a proxy.

---

### Notable Implementation Details and Conventions
- Piece codes: two characters, first is color (`B/G/R`), second is type (`R/N/B/Q/K/P`). Some comments mention `J/W` but `pieceMap` only supports the standard 6 pieces; images are required for whatever types are actually used.
- Color mapping: `R → w`, `G → g`, `B → b` for image file suffixes. This is important for placing correct image assets.
- Board geometry: `getPolygonCenter` uses the 1st and 3rd points of a polygon to approximate the center; ensure `boardConfig` defines points consistently.
- Error handling: `useGameState` sets a general error string on failure; `GamePage` shows an alert to prompt restart.
- Assets loading: uses `require()` within try/catch to guard missing images; logs to console on failure.
- Sound management: centralized in `soundManager`; toggled in `GameStatus`.
- Persistence: player names (not game state) are persisted in `localStorage`.

---

### Common Pitfalls and Troubleshooting
- Backend not running → all API calls fail; you’ll see alerts from `LandingPage` or `GamePage` indicating failure. Start the backend on `:8080`.
- CORS/Proxy issues → ensure `frontend/package.json` has a `proxy` to `http://localhost:8080`, and use relative URLs (this project does).
- Missing assets → if king/piece images aren’t rendering, verify the image files exist under the referenced paths (`src/components/images/...`) and that the color mapping matches filenames.
- Capture detection → based on difference in board map lengths and missing positions. If backend also reports captures, you may want to align logic accordingly to avoid edge cases (e.g., promotions, special moves) if supported in the backend.

---

### Extending the Project
- Add new piece types: update `Piece.jsx` `pieceMap` and provide PNGs; adjust backend to use new codes.
- Add themes: extend `ThemeContext` and `ThemeSelector` to switch CSS module variables or inline styles; optionally render different board backgrounds.
- Bot/AI player: add an endpoint to trigger an AI move; add UI to toggle a player as AI; call the endpoint after `currentPlayer` updates.
- Spectator/Replay: store move history from backend; add a panel to step through moves and render board states.
- Robust errors: replace `alert` with a toasts system; add retry/backoff in `apiClient` or service layer.

---

### File Map (high level)
- `frontend/src/index.js`: React bootstrap
- `frontend/src/App.js`: Routing + Providers
- `frontend/src/pages/LandingPage/*`: Player setup and start
- `frontend/src/pages/GamePage/*`: Game UI layout
- `frontend/src/context/PlayerContext.jsx`: Player names
- `frontend/src/context/GameContext.jsx`: Main game state
- `frontend/src/context/ThemeContext.jsx`: Theme (referenced)
- `frontend/src/hooks/useGameState.js`: Backend interactions + state orchestration
- `frontend/src/services/api.js`: Axios instance
- `frontend/src/services/gameService.js`: Calls `/newGame`, `/onClick`, `/currentPlayer`, `/board`
- `frontend/src/components/game/ChessBoard/*`: Board rendering
- `frontend/src/components/game/Piece/*`: Piece rendering
- `frontend/src/components/game/GameStatus/*`: Status panel with sound/captured pieces/actions
- `frontend/src/components/landing/PlayerForm/*`, `PlayerInput/*`: Player input UI
- `frontend/src/utils/*`: Helpers, constants, sounds
- `backend/build/libs/backend.jar`: Backend server artifact
- `start-backend.bat`: Helper to run backend

---

### Quick Start Checklist
- Run backend on `http://localhost:8080`.
- `npm install` then `npm start` in `frontend`.
- Enter player names and click Start.
- Interact with the board; watch highlights, sounds, and captured pieces.

If you want, I can also generate a diagram-style data flow or list and explain additional files not covered here (e.g., `ThemeContext`, `Polygon`, `CapturedPieces`, `GameOverModal`, and `boardConfig`) by opening them and documenting their props and responsibilities in the same level of detail.