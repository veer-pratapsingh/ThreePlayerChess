### What this project is
A complete Three‑Player Chess app with:
- Frontend: React (routing, contexts, custom hooks), SVG board, piece images, sounds.
- Backend: Java + Spring Boot exposing endpoints to start a game, click on board cells, query board state and current player.
- Communication: Simple HTTP (JSON for most responses; plain text request on clicks). In development, the React dev server proxies API calls to the backend.

Below is a thorough, end‑to‑end walkthrough of the codebase: which files do what, how data flows from the UI to the backend and back, and how to run/troubleshoot.

---

### High‑level architecture
- Frontend lives at `Coding-Ninjas-Chess/frontend`.
- Backend lives at `Coding-Ninjas-Chess/backend` (Spring Boot app with Java classes under `backend/src/main/java`).
- Dev workflow: run backend on `http://localhost:8080`, run frontend dev server (usually `http://localhost:3000`). The frontend uses relative URLs (like `/board`, `/onClick`) and relies on the CRA proxy in `frontend/package.json` so you don’t hit CORS during development.

---

### Frontend: entry, routing, and providers
- `frontend/src/index.js`
  - Standard React bootstrap. Creates a root and renders `<App />` inside `React.StrictMode`.
  ```js
  // src/index.js
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  ```

- `frontend/src/App.js`
  - Sets up React Router and wraps the whole app in three providers:
    - `PlayerProvider` (player names)
    - `GameProvider` (board, current player, selection/highlights, captures, game over)
    - `ThemeProvider` (theme switching)
  - Routes:
    - `/` → `LandingPage`
    - `/game` → `GamePage`
  ```jsx
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

### Frontend: API layer
- `frontend/src/services/api.js`
  - An `axios` instance with JSON headers and a 10s timeout.
  - Uses relative URLs; the CRA dev proxy handles forwarding to `http://localhost:8080`.

- `frontend/src/services/gameService.js`
  - Wraps the HTTP calls used by the UI:
    - `GET /newGame` → ensures a fresh game instance on the backend.
    - `POST /onClick` with a `text/plain` body (the polygon id string) → returns the updated `GameState`.
    - `GET /currentPlayer` → returns the current player’s color (`"R"|"G"|"B"`).
    - `GET /board` → returns the current board map `{ [polygonId]: pieceCode }`.
  ```js
  // Example from gameService.js
  const sendClick = async (polygonId) => {
    const res = await apiClient.post('/onClick', polygonId, { headers: { 'Content-Type': 'text/plain' } });
    return res.data; // { board, highlightedPolygons, gameOver?, winner? }
  };
  ```

---

### Frontend: contexts (shared state)
- `frontend/src/context/PlayerContext.jsx`
  - Holds player names for the three colors, persists them in `localStorage`, exposes helpers to update/clear and to check if all are set.

- `frontend/src/context/GameContext.jsx`
  - Central game state shared by the game page:
    - `boardState: { [polygonId]: pieceCode }`
    - `currentPlayer: 'B' | 'G' | 'R'`
    - `highlightedMoves: string[]` (polygon ids to highlight)
    - `selectedPiece: string | null`
    - `capturedPieces: { B: string[], G: string[], R: string[] }`
    - `gameOver: boolean` and `winner: 'B' | 'G' | 'R' | null`
  - Provides setters like `updateBoardState`, `updateCurrentPlayer`, `updateHighlightedMoves`, `selectPiece`, `clearSelection`, `endGame`, `resetGame`, `addCapturedPiece`.

- `frontend/src/context/ThemeContext.jsx`
  - Provides theme settings consumed by `ThemeSelector`.

---

### Frontend: the stateful hook that orchestrates everything
- `frontend/src/hooks/useGameState.js` (referenced throughout the codebase)
  - Connects user interactions to `gameService` and updates `GameContext`.
  - Two primary flows:
    - `initializeGame()`
      - Defensive `newGame()`
      - `getBoard()` to seed the board
      - `getCurrentPlayer()` to set the first player
      - Clears selection/highlights
    - `handlePolygonClick(polygonId)`
      - `sendClick(polygonId)`
      - Backend returns: `board`, `highlightedPolygons`, and possibly `gameOver/winner`
      - The hook detects captures by comparing previous and new board maps; adds captured piece(s) to `capturedPieces` and plays sounds via `soundManager`
      - Updates `boardState`, `highlightedMoves`, `selectedPiece`
      - If not game over, fetches `currentPlayer` again and updates it
  - Tracks `loading` and `error` for UI feedback.

---

### Frontend: UI components and board rendering
- Board layout and SVG shapes
  - `frontend/src/components/game/ChessBoard/boardConfig.js`
    - Defines the set of triangular polygon cells with ids, coordinates, and colors/shades.
  - `frontend/src/components/game/ChessBoard/ChessBoard.jsx`
    - Renders an SVG and maps over `BOARD_POLYGONS` to draw each cell.
    - Checks `isPolygonHighlighted(id, highlightedMoves)` to paint highlights.
    - On click of a polygon, calls `handlePolygonClick(id)` from `useGameState`.

- Individual polygon component
  - `frontend/src/components/game/Polygon/Polygon.jsx`
    - Presentational component for an SVG `<polygon>` with hover/active styles and highlight support.

- Piece rendering
  - `frontend/src/components/game/Piece/Piece.jsx`
    - Receives a `pieceCode` like `BR` (Blue Rook). Splits into color and type.
    - Maps to an SVG asset: e.g., `rook-blue.svg`, `king-green.svg`, etc., under `frontend/src/assets/pieces`.
    - Computes the center of the polygon using its points and positions a 40×40 image at that center.
    ```jsx
    // key parts
    const colorMap = { R: 'red', G: 'green', B: 'blue' };
    const pieceMap = { R: 'rook', N: 'knight', B: 'bishop', Q: 'queen', K: 'king', P: 'pawn', J: 'pawn', W: 'pawn' };
    const img = require(`../../../assets/pieces/${piece}-${color}.svg`);
    ```

- Status panel and modals
  - `frontend/src/components/game/GameStatus/GameStatus.jsx`
    - Shows current player (with a color‑appropriate king image), list of captured pieces, and actions:
      - Toggle Sound (`soundManager.toggle()`)
      - End Game (resets context, clears players, navigates back)
  - `frontend/src/components/game/CapturedPieces/CapturedPieces.jsx`
    - Renders captured piece icons for each player using the `capturedPieces` map.
  - `frontend/src/components/game/GameOverModal/GameOverModal.jsx`
    - Pops up when `gameOver` is true; shows the winner.

- Landing page
  - `frontend/src/pages/LandingPage/LandingPage.jsx`
    - Hosts `PlayerForm`; on “Start Game”, calls `gameService.newGame()` then routes to `/game`.
  - `frontend/src/components/landing/PlayerForm/PlayerForm.jsx` and `PlayerInput/PlayerInput.jsx`
    - Collect and validate three names, store them in `PlayerContext` before enabling the start button.

- Utilities and assets
  - `frontend/src/utils/boardHelpers.js`: highlight helpers such as `isPolygonHighlighted(id, highlightedMoves)`.
  - `frontend/src/utils/constants.js`: shared constants (e.g., label maps).
  - `frontend/src/utils/sounds.js`: wraps move/capture audio and enable/disable state.
  - CSS Modules under each component directory (e.g., `Piece.module.css`).

---

### Backend: controller (HTTP API surface)
- `backend/src/main/java/application/controller/GameController.java`
  - Spring `@RestController` with endpoints:
    - `GET /newGame` → creates a new `GameMain` instance and stores it in a controller field.
    - `POST /onClick` (body: polygon label as plain text) → delegates to `game.onClick(label)` and returns a `GameState` JSON.
    - `GET /currentPlayer` → `game.getTurn().toString()` (returns a single letter `"R"|"G"|"B"`).
    - `GET /board` → returns `game.getBoard()` (a map of `{ polygonId: pieceCode }`).
  - `@CrossOrigin(origins = "http://localhost:3001")` is configured, but in development the CRA proxy avoids CORS entirely by forwarding requests server‑side. If you access the API directly from a different origin, adjust this origin list.

### Backend: core game class and models
- `backend/src/main/java/main/GameMain.java`
  - Implements the app’s game interface and holds the main game logic orchestrator.
  - Fields: `Board board; Position moveStartPos, moveEndPos; Set<Position> highlightPolygons`.
  - Key methods:
    - Constructor: creates a new `Board` with initial positions.
    - `getBoard()` → `board.getWebViewBoard()`: returns the board as the frontend needs it (string keys/values).
    - `onClick(String polygonLabel)`
      1. Converts the polygon label text to an internal index with `BoardAdapter.calculatePolygonId()`.
      2. If the clicked position contains the current player’s piece → mark it as `moveStartPos` and compute `highlightPolygons = board.getPossibleMoves(moveStartPos)`.
      3. Else if `moveStartPos` was already chosen → treat current click as `moveEndPos` and perform `board.move(moveStartPos, moveEndPos)`.
      4. On `InvalidMoveException` or `InvalidPositionException`, reset selection/highlights.
      5. Convert `highlightPolygons` to view format with `BoardAdapter.convertHighlightPolygonsToViewBoard()`.
      6. Build and return a `GameState` (board map + highlight list). If the board says the game is over, attach `winner` via `setGameOver`.
    - `getTurn()` → returns whose turn it is as a `Colour` enum.

- `backend/src/main/java/common/GameState.java`
  - The DTO returned to the frontend on clicks:
    - `board: Map<String, String>` — e.g., `{ "Ba1": "BR", ... }` (keys are polygon ids; values are two‑char piece codes)
    - `highlightedPolygons: List<String>`
    - `isGameOver: boolean` and `winner: String` (set only when game ends)

- Other notable backend pieces (representative examples from your recent files):
  - `backend/src/main/java/common/Position.java` — internal position representation and factory (`Position.get(int)`), used by board logic.
  - `backend/src/main/java/common/Direction.java` — likely enumerates directions for piece movement over the triangular grid.
  - `backend/src/main/java/common/InvalidMoveException.java` — thrown when a move violates rules.
  - `backend/src/main/java/utility/BoardAdapter.java` — translates between internal board indices/sets and the frontend’s polygon labels; also converts highlight sets to string ids.
  - `backend/src/main/java/model/Board.java` — the engine that knows piece placement, turn order, legal moves for 3‑player chess, detects captures and checkmate/stalemate (referenced from `GameMain`).
  - `backend/src/main/java/utility/Log.java` — lightweight logging wrapper used across classes.

---

### Data contracts between frontend and backend
- Piece codes (values in the board map): two characters → first is color, second is type.
  - Colors: `B` (Blue), `G` (Green), `R` (Red).
  - Types: `K` King, `Q` Queen, `R` Rook, `B` Bishop, `N` Knight, `P` Pawn. The frontend also maps `J` and `W` to pawns to be tolerant.

- Example shapes:
  - `GET /board`
    ```json
    {
      "Ba1": "BR",
      "Bb2": "BP",
      "Gd4": "GK",
      "Re3": "RN"
    }
    ```
  - `GET /currentPlayer`
    ```json
    "B"
    ```
  - `POST /onClick` with body (text/plain):
    ```
    Ba1
    ```
    Response:
    ```json
    {
      "highlightedPolygons": ["Bb2", "Bc3"],
      "board": { "Ba1": "BR", ... },
      "gameOver": false,
      "winner": null
    }
    ```

---

### End‑to‑end interaction flow
1. Landing page
   - User enters three player names.
   - Clicking “Start Game” triggers `gameService.newGame()` (backend builds a fresh `GameMain` with a new `Board`), then router navigates to `/game`.

2. Game initialization
   - `GamePage` mounts and calls `useGameState.initializeGame()`:
     - Fetch `GET /board` to seed `boardState` in `GameContext`.
     - Fetch `GET /currentPlayer` to set the initial `currentPlayer`.
     - Clear any prior selection/highlights.

3. Selecting and moving
   - User clicks a cell on the SVG board (a polygon). `handlePolygonClick(polygonId)` posts to `POST /onClick`.
   - Backend logic in `GameMain.onClick` either (a) selects a piece and returns its legal `highlightedPolygons`, or (b) if a piece was already selected, attempts a move, updates the board and turn, and returns the new board with no highlights.
   - Frontend updates:
     - Compares old vs new board map to detect captures; updates `capturedPieces` and plays sound.
     - Stores `highlightedMoves`, updates `boardState` and clears/sets `selectedPiece` accordingly.
     - If the game continues, calls `GET /currentPlayer` and updates the turn display.
     - If backend sets `gameOver/winner`, `GameOverModal` is shown.

4. Status and controls
   - `GameStatus` displays the current player and captured pieces per color; provides sound toggle and an action to end/reset the game and return home.

---

### How the board is drawn and pieces are placed
- The board is an SVG whose cells are triangular polygons listed in `BOARD_POLYGONS` (id + 3 points each). The app renders each polygon as an SVG `<polygon>`.
- For each polygon id present in `boardState`, a `Piece` component overlays an `<image>` at that polygon’s computed center (`getPolygonCenter` averages the 1st and 3rd points).
- Highlights are applied by checking whether a polygon id is in `highlightedMoves`; highlighted polygons are colored/styled differently in the SVG.

---

### Running locally
1. Backend
   - From `Coding-Ninjas-Chess/backend`, run:
     - `java -jar backend\build\libs\backend.jar`
   - Expected on: `http://localhost:8080`.

2. Frontend
   - From `Coding-Ninjas-Chess/frontend`:
     - `npm install`
     - `npm start`
   - Open `http://localhost:3000`. The dev proxy forwards `/newGame`, `/onClick`, `/board`, `/currentPlayer` to `http://localhost:8080`.

Notes:
- The controller is annotated with `@CrossOrigin(origins = "http://localhost:3001")`. Because the CRA proxy is used, browser requests go to `:3000` and are proxied server‑side to `:8080`, so CORS doesn’t trigger in development. If you ever hit the backend directly from a web page at `:3000`, update the `@CrossOrigin` accordingly or keep using the proxy.

---

### Troubleshooting tips
- Backend not running → all API calls fail.
  - Symptom: Landing/Game pages alert errors; browser console shows network failures.
  - Fix: start the backend JAR on port 8080.

- Proxy/CORS issues
  - Ensure `frontend/package.json` has `"proxy": "http://localhost:8080"`.
  - Use relative URLs in the frontend (the project already does). If you hardcode absolute URLs, you’ll bypass the proxy and may hit CORS.

- Missing assets
  - If pieces or king images don’t render, confirm the SVGs exist in `frontend/src/assets/pieces/` and that `Piece.jsx`’s color/type maps match filenames.

- Capture logic discrepancies
  - The frontend infers captures by comparing board maps. If the backend later exposes explicit capture info, prefer that to avoid edge cases (promotions, simultaneous interactions).

---

### Where to look for specific behaviors
- Routing and providers: `frontend/src/App.js`, `frontend/src/index.js`
- API calls: `frontend/src/services/api.js`, `frontend/src/services/gameService.js`
- Global game state: `frontend/src/context/GameContext.jsx`
- Orchestration of API ↔ UI: `frontend/src/hooks/useGameState.js`
- Board rendering: `frontend/src/components/game/ChessBoard/*`, `frontend/src/components/game/Polygon/Polygon.jsx`
- Piece rendering: `frontend/src/components/game/Piece/Piece.jsx`
- Status, captures, and controls: `frontend/src/components/game/GameStatus/*`, `frontend/src/components/game/CapturedPieces/*`
- Landing and name inputs: `frontend/src/pages/LandingPage/*`, `frontend/src/components/landing/*`
- Backend HTTP surface: `backend/src/main/java/application/controller/GameController.java`
- Backend core logic: `backend/src/main/java/main/GameMain.java` → `model/Board`, `common/*`, `utility/*`

---

### Mental model/cheat‑sheet of the request/response loop
- Select a piece
  - UI: click polygon `X` → POST `/onClick` body=`X` → Response has `highlightedPolygons=[Y,Z,...]` and same `board` → UI highlights Y/Z.
- Make a move
  - UI: click polygon `Y` → POST `/onClick` body=`Y` → Response has updated `board`, no highlights; maybe `gameOver/winner`.
  - UI: compares old vs new board to find captures, updates state, fetches `/currentPlayer`.

If you want, I can also open and annotate any specific files (e.g., `GameContext.jsx`, `ChessBoard.jsx`, `useGameState.js`, or backend `Board`/`BoardAdapter`) and add inline comments and diagrams showing exactly how props/state move across components and how the engine computes possible moves for the triangular grid.