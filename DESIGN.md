# Ddong-man (Poop-Man) Game: Design Specification

## 1. Overview

This document outlines the component-based design and implemented features of the Ddong-man Game. It is a single-page web application built with vanilla JavaScript, operating on an HTML Canvas. The game aims to be a 'reverse Pac-Man' where the player (a toilet) drops 'poop' and enemies (plungers) try to clean it up.

## 2. Core Architecture

The game operates on a state-driven main loop (`gameLoop`) orchestrated by the `Game` class. All game logic and rendering are handled within this loop, with `deltaTime` used to ensure frame-rate independent movement. The game's state machine manages transitions between different screens and gameplay phases.

## 3. Game States

-   **`PRE_GAME_OVERLAY`**: Initial state, displays a 'Click to Start' message to handle mobile audio autoplay policies.
-   **`CONTROL_SELECTION`**: After the initial click, presents options for 'PC (Keyboard)' or 'Mobile (Touch D-pad)' controls.
-   **`PLAYING`**: Active gameplay state. Player moves, poops are dropped, enemies chase, collisions are handled.
-   **`ENTERING_NAME`**: Game Over state. Player enters a 3-character name using an on-screen virtual keyboard.
-   **`LEADERBOARD`**: Displays the top 5 high scores saved in local storage.

## 4. Component Breakdown

### 4.1. `Game` Class (Main Controller)
-   **Purpose**: Manages the overall game flow, state transitions, main loop, input handling, and drawing orchestration.
-   **Key Properties**: `canvas`, `ctx`, `player`, `poops`, `enemies`, `gameState`, `score`, `startTime`, `poopMap`, `keys`, `keyboard`, `dpad`, `bgmNormal`, `bgmFast`, `sfxGameOver`, `muteButton`, `isMuted`, `lastFrameTime`.
-   **Key Methods**: `constructor()`, `init()`, `setupEventListeners()`, `gameLoop()`, `update()`, `handleCollisions()`, `draw()`, `drawMap()`, `drawUI()`, `drawDpad()`, `drawNameEntryScreen()`, `drawLeaderboard()`, `getScores()`, `saveScore()`, `playSound()`, `toggleMute()`, `submitScore()`, `getKeyFromMousePos()`, `createEnemies()`, `increaseDifficulty()`.

### 4.2. `Character` Class (Base Class)
-   **Purpose**: Provides common properties and methods for all moving entities (Player, Enemy).
-   **Key Properties**: `x`, `y`, `speed`, `width`, `height`.
-   **Key Methods**: `constructor()`, `isWall(x, y)` (checks if a given point is inside a wall tile).

### 4.3. `Player` Class
-   **Purpose**: Represents the main player character (toilet).
-   **Inherits From**: `Character`.
-   **Key Properties**: `currentMoveDirection` (for touch input).
-   **Key Methods**: 
    -   `constructor()`
    -   `update(keys, currentMoveDirection, deltaTime)`: Calculates player's next position based on keyboard or touch input, applying `deltaTime` for frame-rate independence. Handles wall collisions.
    -   `draw(ctx)`: Renders the toilet character on the canvas.
    -   `dropPoop(poopMap)`: Creates a new `Poop` object if the current tile is empty (checked via `poopMap`).

### 4.4. `Enemy` Class
-   **Purpose**: Represents enemy characters (plungers) that chase and clean up poop.
-   **Inherits From**: `Character`.
-   **Key Properties**: `state` (`CHASING`, `EATING`), `stateTimer`, `targetPoop`, `path`.
-   **Key Methods**: 
    -   `constructor()`
    -   `update(poops, player, allEnemies, deltaTime)`: Implements enemy AI using a state machine.
        -   **CHASING**: Finds the most desirable poop (considering distance and if other enemies are targeting it) or the player, then uses `findPath()` to get a path and follows it.
        -   **EATING**: Pauses briefly after eating a poop to ensure all overlapping poops are cleared.
    -   `draw(ctx)`: Renders the plunger character on the canvas.
    -   `findPath(end)`: Uses Breadth-First Search (BFS) to find the shortest path to a target on the map grid.
    -   `onPoopEaten()`: Called by `Game` when the enemy eats a poop, triggers state change to `EATING`.

### 4.5. `Poop` Class
-   **Purpose**: Represents a single 'poop' object dropped by the player.
-   **Key Properties**: `x`, `y`, `width`, `height`, `tileX`, `tileY`.
-   **Key Methods**: `constructor()`, `draw(ctx)`.

## 5. Implemented Features

-   **Core Gameplay**: Player movement, automatic poop dropping, enemy movement and poop cleaning.
-   **Graphics**: Canvas-based rendering of map, player (toilet), enemies (plungers), and poops.
-   **Controls**: Keyboard input (PC) and touch-based D-pad (mobile) for player movement.
-   **Game States**: `PRE_GAME_OVERLAY`, `CONTROL_SELECTION`, `PLAYING`, `ENTERING_NAME`, `LEADERBOARD`.
-   **Difficulty Scaling**: Enemy speed and BGM playback rate increase over time.
-   **Audio**: Dynamic BGM (normal/fast) and game over sound effect, with mute/unmute functionality.
-   **UI**: Score display (survival time), on-screen virtual keyboard for name entry, and top 5 leaderboard.
-   **Persistence**: High scores saved in browser's `localStorage`.
-   **Bug Fixes**: Numerous fixes for character sticking, wall collisions, and game initialization/rendering issues.

## 6. Design Improvement Suggestions

-   **File Separation**: For larger projects, splitting `game.js` into multiple files (e.g., `main.js`, `player.js`, `enemy.js`, `constants.js`, `utils.js`) would improve modularity and organization.
-   **More Robust Error Handling**: While basic error handling is present, more comprehensive error logging and user feedback could be implemented.
-   **Code Readability**: The code in `game.js` is currently quite condensed. Improving formatting and adding comments would make it easier to maintain.
-   **Performance Optimization**: For smoother gameplay, especially on lower-end devices, consider optimizing the pathfinding algorithm or reducing unnecessary calculations in the game loop.

## 7. Future Enhancements (To-Do List)

-   **Power-ups**: Introduce items that can temporarily slow down enemies or make the player invincible.
-   **Multiple Levels**: Design different maps with increasing complexity.
-   **Improved Graphics**: Replace simple rectangles with sprite-based graphics for characters and environment.
-   **Sound Effects**: Add more sound effects for actions like dropping poop or enemy movements.
-   **Mobile Responsiveness**: Further optimize the touch controls and UI for various mobile screen sizes.

---

*This document serves as a comprehensive overview of the Ddong-man Game's design and implemented features, intended to facilitate further development or re-implementation.*