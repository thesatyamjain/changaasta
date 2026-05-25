# 👑 Changa Asta (Chowka Bara / Ashta Chamma)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML5-supported-orange.svg)](#)
[![CSS3](https://img.shields.io/badge/CSS3-vanilla-blue.svg)](#)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow.svg)](#)

A premium, modern web implementation of the ancient Indian board game **Changa Asta** (also popularly known as *Chowka Bara*, *Ashta Chamma*, *Chakka*, *Katte Mane*, or *Gatta Mane*). This digital adaptation features a majestic **Royal Gold & Slate** aesthetic, rich glassmorphic styling, Web Audio API sound synthesis, and an evaluation-based smart AI bot.

![Changa Asta Preview](preview.png)

---

## 📖 About the Game

Changa Asta is a classic race game for 2 to 4 players, dating back thousands of years. Players roll cowrie shells (*kaudi*) to move their four pawns along a spiral grid, starting from their respective yards, navigating the outer ring, moving into the inner ring, and finally reaching the center home (*Ghar*). 

The game combines luck (probability of rolling shells) with tactical decisions (blocking opponents, creating barriers, and safety square management).

---

## ✨ Features

- **🎮 Board Configurations:**
  - **5x5 Grid:** Classic game played with **4 cowrie shells** (possibilities: 1, 2, 3, 4, or 8).
  - **7x7 Grid:** Extended board played with **6 cowrie shells** (possibilities: 1, 2, 3, 4, 5, 6, or 12).
- **🤖 Game Modes:**
  - **Pass & Play (Local Multiplayer):** Game night with friends on a single device (2, 3, or 4 players).
  - **Vs Computer:** Play against our smart, evaluation-based AI bots. Custom configurations allow blending humans and bots in any combination.
- **⚙️ Custom Rules Configuration:**
  - **Gatti Banana (Blockades):** Form a double-pawn blockade (*Gatti*) on a square. Opponents cannot pass or land on your Gatti unless they land exactly on it with their own Gatti!
  - **Ghar Se Nikalna (Spawn Requirement):** Choose whether pawns require rolling a maximum value (4/8 for 5x5 grid or 6/12 for 7x7 grid) to enter the board.
- **🎨 Premium Visual & Audio Experience:**
  - **Royal Aesthetics:** Gold accents, deep charcoal panels, and neon indicators.
  - **Interactive 3D Shells:** Animated rolling shells with realistic scattering physics.
  - **Web Audio API Synth:** Pure synthesized sound effects (roll rattle, pawn hop, capturing explosions, and arpeggiated victory theme) with a built-in mute option.
  - **Responsive Design:** Auto-scaling board layouts designed for desktop screens and mobile tap gestures alike.
  - **Move Preview:** Hovering over your active pawns dynamically highlights their destination square.
  - **Logging Console:** A scrollable match logging system (*Khel Ka Vivaran*) detailing all game events.

---

## 🗂️ Project Structure

The project is built entirely on vanilla web standards (no bulky libraries or compilation steps):

- [index.html](file:///d:/changaasta/index.html): The markup structure of the setup lobby, main game screen, sidebar controls, logging console, and victory overlay.
- [styles.css](file:///d:/changaasta/styles.css): Complete style declarations containing custom properties (variables), card layouts, grid systems, custom fonts, glassmorphism filters, animations, and responsive media queries.
- [game.js](file:///d:/changaasta/game.js): The core engine, handling:
  - `SoundSynth`: Web Audio API sound generator.
  - `GameEngine`: Mathematical grid generation and path computations.
  - `GameState`: Finite state machine for tracking turns, roll queues, validity checks, collision logic, and win evaluation.
  - `Bot Decision Engine`: Multi-factor heuristics rating movement options (captures, safety, distance tracking).
- [gen_paths.py](file:///d:/changaasta/gen_paths.py): Helper python script for generating player path arrays.
- [paths_output.md](file:///d:/changaasta/paths_output.md): Reference markdown listing the coordinate sequences for all four players on the 5x5 board.
- [favicon.js](file:///d:/changaasta/favicon.js): Generates a custom procedural canvas favicon for the page.

---

## 🎲 Core Rules & Mechanics

### Movement Coordinates & Paths
Every player starts at their home base located on the outer border:
- 🔴 **South Player:** Starts at `(5, 3)` (Red)
- 🟢 **West Player:** Starts at `(3, 1)` (Green)
- 🟡 **North Player:** Starts at `(1, 3)` (Yellow)
- 🔵 **East Player:** Starts at `(3, 5)` (Blue)

Pawns move in an **anti-clockwise direction** around the outer ring. Once a player successfully captures (cuts) at least one opponent pawn, their path extends into the **clockwise inner ring**, leading straight to the center cell `(3, 3)` (the Goal).

### Cowrie Shell Rolls (Pasa)
The roll values are computed by counting how many shells land with their "mouth" facing upwards:

| Grid Size | 0 Mouths Up | 1 Up | 2 Up | 3 Up | 4 Up | 5 Up | 6 Up |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **5x5 (4 Shells)** | **4** *(extra roll)* | **1** | **2** | **3** | **8** *(extra roll)* | — | — |
| **7x7 (6 Shells)** | **6** *(extra roll)* | **1** | **2** | **3** | **4** | **5** | **12** *(extra roll)* |

- **Extra Rolls:** Rolling a maximum value (4/8 or 6/12) grants an immediate extra roll.
- **Three Strikes Penalty:** Rolling an extra roll three consecutive times cancels all accumulated moves for that turn, passing the play to the next player.

---

## 🚀 How to Run Locally

Since this application is built with vanilla HTML, CSS, and JS, you can run it directly:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/changaasta.git
   cd changaasta
   ```
2. **Open index.html:**
   Double click the [index.html](file:///d:/changaasta/index.html) file to run it in any modern browser, or run a local lightweight server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npm install -g serve
   serve .
   ```
3. Navigate to `http://localhost:8000` (or the respective port) to play!

---

## ⚙️ AI Bot Behavior (Heuristics)

The computer opponent makes intelligent decisions using a custom evaluation scoring function:
1. **Kill Priority (1500 pts):** Captures opponent tokens whenever possible.
2. **Goal Attraction (1000 pts):** Lands directly in the center goal to finalize a pawn's journey.
3. **Safety Attraction (250 pts):** Prefers landing on cross-marked safe cells.
4. **Aggression & Spawning (200 pts):** Encourages spawning and moving active tokens forward to hunt down opponents.
5. **Escape Threat (180 pts):** Detects nearby trailing opponents and moves endangered tokens out of range.

---

## 📝 License

This project is open-source and licensed under the [MIT License](https://opensource.org/licenses/MIT).
