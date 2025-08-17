# Ddong-man Game: Design Specification

## 1. Overview

This document outlines the component-based design of the Ddong-man Game. The game is a single-page web application built with vanilla JavaScript, operating on a central game loop architecture. The state of all game entities is managed within a single script (`game.js`) and rendered to an HTML Canvas.

## 2. Core Architecture

The game operates on a state-driven main loop (`gameLoop`) which is responsible for orchestrating updates, collision checks, and rendering for all game entities. The game's primary state is managed by the `gameState` variable, which can be `PLAYING`, `GAME_OVER`, or `LEADERBOARD`.

## 3. Component Breakdown

The game logic is functionally decomposed into several core components:

### 3.1. Game State Manager
- **Purpose**: Controls the overall flow of the game, from initialization to gameplay, game over, and leaderboard display.
- **Key Functions**: `init()`, `gameLoop()`
- **Managed State**: `gameState`, `difficultyTimer`, `score`, `startTime`

### 3.2. Rendering Engine
- **Purpose**: Responsible for drawing all visible elements onto the canvas.
- **Key Functions**: `drawMap()`, `drawPlayer()`, `drawEnemies()`, `drawPoops()`, `drawUI()`, `drawGameOver()`, `drawLeaderboard()`
- **Dependencies**: Reads from all entity states (`player`, `enemies`, `poops`, `score`) to render them.

### 3.3. Update Engine (`updateGame`)
- **Purpose**: Updates the state and position of all dynamic game entities in each frame.
- **Key Functions**: `updateGame()`
- **Sub-components**:
    - **Player Logic**: Handles player movement based on keyboard input (`keys`).
    - **Poop Logic**: Manages the automatic creation of `poop` objects based on a cooldown.
    - **Enemy AI Engine**: The most complex component, responsible for enemy behavior.

### 3.4. Enemy AI Engine
- **Purpose**: Governs the decision-making and movement of enemy entities.
- **Key Functions**: Logic within `updateGame()` for enemies, `findPath()`
- **Managed State**: `enemy.state` (`CHASING`, `EATING`), `enemy.path`, `enemy.targetPoop`
- **Behavioral Logic**:
    1.  **Target Selection**: Selects a target based on a desirability score (distance vs. being targeted by other enemies). Player is the default target if no poops exist.
    2.  **Pathfinding**: Uses Breadth-First Search (BFS) via `findPath()` to calculate the shortest path to the target.
    3.  **Movement**: Follows the calculated path.
    4.  **State Transitions**: Changes state to `EATING` upon collision with poop.

### 3.5. Collision Engine
- **Purpose**: Detects and resolves collisions between game entities.
- **Key Functions**: `handleCollisions()`, `checkCollision()`
- **Responsibilities**:
    - Detects enemy-poop collisions, removes the poop, and updates the enemy's state.
    - Detects player-enemy collisions and triggers the `GAME_OVER` state.

### 3.6. Leaderboard System
- **Purpose**: Manages high score persistence.
- **Key Functions**: `getScores()`, `saveScore()`
- **Technology**: Uses browser `localStorage` to store the top 5 scores as a JSON string.

## 4. Design Improvement Suggestions

The current design is a functional, single-file script. For future expansion and better maintainability, the following improvements could be considered:

- **Object-Oriented Refactoring**: The code could be restructured using JavaScript Classes (e.g., `class Player`, `class Enemy`, `class Game`). This would encapsulate state and behavior more cleanly, making the code easier to manage. For example, all enemy update logic could be moved into an `update()` method within the `Enemy` class.

- **File Separation (Modularity)**: As the game grows, `game.js` could be split into multiple files based on components (e.g., `main.js`, `player.js`, `enemy.js`, `constants.js`). This would improve code organization and make it easier to find and modify specific parts of the logic.

- **Rendering Abstraction**: All `draw...` functions could be consolidated into a single `Renderer` class, which would be responsible for all canvas drawing operations. The game loop would simply pass the game state to the renderer in each frame.
