/**
 * Changa Asta (Ashta Chamma / Chowka Bara) - Core Game Engine
 * Features:
 * - Dynamic 5x5 and 7x7 grid path generation
 * - Turn-based multiplayer state machine
 * - Smart evaluation-based AI Bot
 * - Web Audio API synthesized sound effects
 * - Custom rules toggles (Gatti pairing, Spawn requirement)
 */

// Sound Synthesizer Class
class SoundSynth {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.rattleInterval = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  startRattle() {
    if (this.muted) return;
    this.init();
    if (this.rattleInterval) return;
    
    const playClick = () => {
      if (this.muted || !this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180 + Math.random() * 320, now);
      
      gain.gain.setValueAtTime(0.05 + Math.random() * 0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.05);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now);
      osc.stop(now + 0.06);
    };

    playClick();
    this.rattleInterval = setInterval(playClick, 75);
  }

  stopRattle() {
    if (this.rattleInterval) {
      clearInterval(this.rattleInterval);
      this.rattleInterval = null;
    }
    // Play the final clatter clack
    this.playRoll();
  }

  playRoll() {
    if (this.muted) return;
    this.init();
    
    // Simulate rattling cowrie shells
    const now = this.ctx.currentTime;
    for (let i = 0; i < 5; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(100 + Math.random() * 400, now + i * 0.05);
      
      gain.gain.setValueAtTime(0.15, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.1);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.1);
    }
  }

  playMove() {
    if (this.muted) return;
    this.init();
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
    
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playCapture() {
    if (this.muted) return;
    this.init();
    
    const now = this.ctx.currentTime;
    
    // Explosion sound
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(150, now);
    osc1.frequency.linearRampToValueAtTime(40, now + 0.3);
    
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(180, now);
    osc2.frequency.linearRampToValueAtTime(30, now + 0.3);
    
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.3);
    osc2.stop(now + 0.3);
  }

  playWin() {
    if (this.muted) return;
    this.init();
    
    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C E G C arpeggio
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);
      
      gain.gain.setValueAtTime(0.15, now + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.15 + 0.4);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 0.45);
    });
  }

  playVictory() {
    this.playWin();
  }

  playToggle() {
    if (this.muted) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  }
}

const synth = new SoundSynth();
window.synth = synth;

// --- SOTA Cowrie Physics & Probability Engine ---
const CowriePhysicsEngine = {
  // Base probability of landing mouth UP
  // Cowries naturally tend to land mouth up because the back is heavy and rounded, while the mouth is flat.
  baseBiasUp: 0.58, 
  
  generateRoll(cowrieCount, throwStrength = null) {
    const results = [];
    const positions = [];
    let mouthsUp = 0;
    
    // 1. Determine Throw Strength (0.0 to 1.0)
    const finalStrength = throwStrength !== null ? throwStrength : Math.random(); 
    
    // Detect mobile viewport
    const isMobile = window.innerWidth <= 850;
    
    // Use layout spacing columns to prevent clustering and overlap
    const gap = isMobile ? 22 : 60; // Spacing between columns
    const startX = -((cowrieCount - 1) * gap) / 2;
    
    for (let i = 0; i < cowrieCount; i++) {
      // 2. Adjust probability based on throw strength
      const currentProb = this.baseBiasUp - (finalStrength * 0.08); 
      
      const isUp = Math.random() < currentProb;
      if (isUp) mouthsUp++;
      
      // Calculate column base X coordinate
      const baseX = startX + i * gap;
      
      // Jitter within column to maintain organic scatter look
      const maxJitterX = gap * 0.25; // Keep separation safe
      const jitterX = (Math.random() - 0.5) * maxJitterX;
      
      // Vertical scatter (Y axis) - height scales with throw strength
      const maxJitterY = isMobile ? (3 + finalStrength * 3) : (8 + finalStrength * 6);
      const jitterY = (Math.random() - 0.5) * maxJitterY * 2;
      
      const x = baseX + jitterX;
      const y = jitterY;
      const rot = (Math.random() - 0.5) * 180; // Random rotation
      
      positions.push({ x, y, rot, isUp });
      results.push(isUp);
    }
    
    return {
      mouthsUp,
      states: results,
      positions,
      throwStrength: finalStrength
    };
  }
};

// Game Configuration & Math Module
const GameEngine = {
  // Generate coordinates for a ring perimeter
  // returns array of {r, c}
  getRingCoordinates(gridSize, ringIndex) {
    const r1 = 1 + ringIndex;
    const r2 = gridSize - ringIndex;
    const c1 = 1 + ringIndex;
    const c2 = gridSize - ringIndex;
    
    const coords = [];
    
    // Bottom row: right-to-left
    for (let c = c2; c >= c1 + 1; c--) coords.push({ r: r2, c });
    // Left column: bottom-to-top
    for (let r = r2; r >= r1 + 1; r--) coords.push({ r, c: c1 });
    // Top row: left-to-right
    for (let c = c1; c <= c2 - 1; c++) coords.push({ r: r1, c });
    // Right column: top-to-bottom
    for (let r = r1; r <= r2 - 1; r++) coords.push({ r, c: c2 });
    
    // Outer ring (index 0) is Anti-clockwise, ALL inner rings are Clockwise
    if (ringIndex === 0) {
      coords.reverse();
      const last = coords.pop();
      coords.unshift(last);
    }
    return coords;
  },

  getInwardCell(gridSize, cell) {
    const k = Math.min(cell.r - 1, gridSize - cell.r, cell.c - 1, gridSize - cell.c);
    const r1 = 1 + k;
    const r2 = gridSize - k;
    const c1 = 1 + k;
    const c2 = gridSize - k;
    
    let nr = cell.r;
    let nc = cell.c;
    
    if (cell.r === r2) nr--; // Bottom edge, move up
    else if (cell.c === c1) nc++; // Left edge, move right
    else if (cell.r === r1) nr++; // Top edge, move down
    else if (cell.c === c2) nc--; // Right edge, move left
    
    return { r: nr, c: nc };
  },

  // Generate full 25-step or 49-step path for a player
  generatePath(gridSize, color) {
    const numRings = Math.floor(gridSize / 2);
    const center = Math.ceil(gridSize / 2);
    
    // Determine player starting coordinates
    let startCell;
    if (color === 'red') startCell = { r: gridSize, c: center };       // South
    else if (color === 'green') startCell = { r: center, c: 1 };      // West
    else if (color === 'yellow') startCell = { r: 1, c: center };     // North
    else startCell = { r: center, c: gridSize };                     // East

    let fullPath = [];
    let currentEntry = startCell;

    for (let k = 0; k < numRings; k++) {
      const ringCoords = this.getRingCoordinates(gridSize, k);
      
      // Find starting index in this ring
      const entryIdx = ringCoords.findIndex(cell => cell.r === currentEntry.r && cell.c === currentEntry.c);
      
      // Rotate ring array to start with entry cell
      const rotatedRing = [
        ...ringCoords.slice(entryIdx),
        ...ringCoords.slice(0, entryIdx)
      ];
      
      // If 7x7 board and it is the innermost ring (k === 2), repeat the entry cell
      // so the transition to the center HOME square is orthogonal.
      if (gridSize === 7 && k === numRings - 1) {
        rotatedRing.push(rotatedRing[0]);
      }
      
      fullPath = fullPath.concat(rotatedRing);
      
      // The last element of this ring determines the next inward cell
      const transitionCell = rotatedRing[rotatedRing.length - 1];
      currentEntry = this.getInwardCell(gridSize, transitionCell);
    }
    
    // Finally, add the center home square
    fullPath.push({ r: center, c: center });
    return fullPath;
  },

  // Verify if a coordinate cell is safe
  isSafeCell(gridSize, r, c) {
    const center = Math.ceil(gridSize / 2);
    if (r === center && c === center) return true; // Center Home
    
    // Starting bases
    if (r === gridSize && c === center) return true;
    if (r === center && c === 1) return true;
    if (r === 1 && c === center) return true;
    if (r === center && c === gridSize) return true;
    
    // Additional safes for 7x7 board (Corners of Ring 1)
    if (gridSize === 7) {
      if ((r === 2 && c === 2) || (r === 2 && c === 6) || (r === 6 && c === 2) || (r === 6 && c === 6)) {
        return true;
      }
    }
    
    return false;
  }
};

function adjustBoardScale() {
  // Logic removed. Board scaling is now entirely handled by CSS (100vw) on mobile.
}

window.addEventListener('resize', adjustBoardScale);

// Main Game State Object
const GameState = {
  gridSize: 5,
  players: [],
  currentPlayerIndex: 0,
  rollQueue: [],
  selectedRollIndex: null,
  consecutiveHighRolls: 0,
  gamePhase: 'setup', // 'setup', 'rolling', 'moving', 'ended'
  winner: null,
  logs: [],
  
  // Custom toggles
  rules: {
    gattiEnabled: true,
    spawnRequired: false
  },

  // Paths database
  paths: {},

  initGame(playersList, size, rules) {
    this.gridSize = size;
    this.rules = { ...rules };
    this.winner = null;
    this.logs = [];
    this.currentPlayerIndex = 0;
    this.rollQueue = [];
    this.selectedRollIndex = null;
    this.consecutiveHighRolls = 0;
    this.isRollingAnim = false;
    
    // Pre-calculate paths
    const colors = ['red', 'green', 'yellow', 'blue'];
    this.paths = {};
    colors.forEach(col => {
      this.paths[col] = GameEngine.generatePath(size, col);
    });

    // Setup players
    const numPawns = size === 5 ? 4 : 6;
    this.players = playersList.map((p, idx) => {
      const pawns = [];
      for (let i = 0; i < numPawns; i++) {
        pawns.push({
          id: i,
          color: p.color,
          pathIndex: -1, // -1 means in yard / inactive
          isGatti: false
        });
      }
      return {
        name: p.name,
        color: p.color,
        isBot: p.isBot,
        hasKilled: false, // Must be true to enter inner rings
        pawns: pawns
      };
    });

    this.gamePhase = 'rolling';
    this.addLog('System', `Khel ${size}x${size} board par shuru ho gaya hai!`);
    this.addLog('System', `Ab ${this.getCurrentPlayer().name} ki baari hai.`);
    
    // If the first player is a bot, trigger their roll
    if (this.getCurrentPlayer().isBot) {
      setTimeout(() => {
        if (this.gamePhase === 'rolling') this.rollCowries();
      }, 1200);
    }
    
    // Set initial shell visibility based on board size
    const cowrieCount = size === 5 ? 4 : 6;
    const shells = document.querySelectorAll('.cowrie-shell');
    const isMobile = window.innerWidth <= 850;
    const gap = isMobile ? 22 : 44; // spacing between shells
    const startX = -((cowrieCount - 1) * gap) / 2;

    shells.forEach((s, idx) => {
      if (idx < cowrieCount) {
        s.style.display = 'block';
        s.className = 'cowrie-shell mouth-up';
        
        // Initial layout: side-by-side row centered
        const initialX = startX + idx * gap;
        s.style.setProperty('--tx', `${initialX}px`);
        s.style.setProperty('--ty', '0px');
        s.style.setProperty('--rand-rot', '0deg');
        s.style.setProperty('--end-ry', '0deg');
      } else {
        s.style.display = 'none';
      }
    });
  },

  getCurrentPlayer() {
    return this.players[this.currentPlayerIndex];
  },

  addLog(sender, message) {
    const color = this.players.find(p => p.name === sender)?.color || 'system';
    this.logs.push({ sender, message, color });
    
    // UI Render update
    const logBox = document.getElementById('log-box');
    if (logBox) {
      const item = document.createElement('div');
      item.className = `log-item ${color}`;
      item.innerHTML = `<strong>${sender}:</strong> ${message}`;
      logBox.appendChild(item);
      logBox.scrollTop = logBox.scrollHeight;
    }
  },

  // Calculate cowrie rolls
  rollCowries(throwStrength = null) {
    if (this.gamePhase !== 'rolling' || this.isRollingAnim) return;
    
    // Redirect bot rolls to simulateBotChargeAndRoll if no strength is specified
    const player = this.getCurrentPlayer();
    if (player.isBot && throwStrength === null) {
      this.simulateBotChargeAndRoll();
      return;
    }
    
    this.isRollingAnim = true;
    
    // Set custom animation speed based on throw strength
    const finalStrength = throwStrength !== null ? throwStrength : (0.3 + Math.random() * 0.5);
    const animDuration = 0.45 + (1 - finalStrength) * 0.4; // 0.45s to 0.85s
    
    // Play rattle stop and roll clatter
    synth.stopRattle(); 
    
    // Animate rolling shells in DOM
    const shells = document.querySelectorAll('.cowrie-shell');
    shells.forEach(s => {
      s.style.setProperty('--roll-duration', `${animDuration}s`);
      s.classList.add('rolling');
    });

    setTimeout(() => {
      if (this.gamePhase !== 'rolling') return;
      this.isRollingAnim = false;
      shells.forEach(s => s.classList.remove('rolling'));

      const cowrieCount = this.gridSize === 5 ? 4 : 6;
      
      // Use SOTA Cowrie Physics Engine
      const rollData = CowriePhysicsEngine.generateRoll(cowrieCount, finalStrength);
      const mouthsUp = rollData.mouthsUp;
      const shellStates = rollData.states;
      
      this.lastShellStates = shellStates;

      // Render shell visuals
      shells.forEach((s, idx) => {
        if (idx < cowrieCount) {
          const isUp = shellStates[idx];
          const pos = rollData.positions[idx];
          
          s.className = `cowrie-shell ${isUp ? 'mouth-up' : 'mouth-down'}`;
          
          // Apply physics positioning via CSS custom properties
          s.style.setProperty('--rand-rot', `${pos.rot}deg`);
          s.style.setProperty('--tx', `${pos.x}px`);
          s.style.setProperty('--ty', `${pos.y}px`);
          s.style.setProperty('--end-ry', isUp ? '0deg' : '180deg');
          
          s.style.display = 'block';
        } else {
          s.style.display = 'none';
        }
      });

      // Compute roll value
      let rollValue = 0;
      let extraRoll = false;

      if (this.gridSize === 5) {
        // 5x5: 4 shells
        if (mouthsUp === 0) { rollValue = 4; extraRoll = true; }
        else if (mouthsUp === 4) { rollValue = 8; extraRoll = true; }
        else { rollValue = mouthsUp; }
      } else {
        // 7x7: 6 shells
        if (mouthsUp === 0) { rollValue = 6; extraRoll = true; }
        else if (mouthsUp === 6) { rollValue = 12; extraRoll = true; }
        else { rollValue = mouthsUp; }
      }

      const player = this.getCurrentPlayer();
      this.addLog(player.name, `Aapko ${rollValue} mila!`);

      if (extraRoll) {
        this.consecutiveHighRolls++;
        if (this.consecutiveHighRolls >= 3) {
          // Three strikes penalty
          this.addLog('System', `Lagatar 3 badi sankhya aayi! Baari khatam.`);
          this.endTurn();
          return;
        }
        
        this.rollQueue.push(rollValue);
        this.updateRollQueueUI();

        // Let bot trigger next roll if applicable
        if (player.isBot) {
          setTimeout(() => {
            if (this.gamePhase !== 'gameover') this.rollCowries();
          }, 1200);
        }
      } else {
        this.rollQueue.push(rollValue);
        this.consecutiveHighRolls = 0;
        this.gamePhase = 'moving';
        this.selectedRollIndex = 0; // Default to first roll selection
        this.updateRollQueueUI();
        
        // Auto check if any valid moves exist
        if (!this.hasAnyValidMoves()) {
          this.addLog('System', `Koi chalne layak goti nahi hai.`);
          setTimeout(() => {
            // Guard: don't call endTurn if game ended while timer was pending
            if (this.gamePhase !== 'gameover') this.endTurn();
          }, 1500);
        } else if (player.isBot) {
          setTimeout(() => {
            if (this.gamePhase === 'moving') this.makeBotMove();
          }, 1200);
        }
      }
    }, 600);
  },

  updateRollQueueUI() {
    const queuePanel = document.getElementById('roll-queue');
    if (!queuePanel) return;

    if (this.gamePhase === 'moving' && this.rollQueue.length > 0 && this.selectedRollIndex !== null) {
      const currentVal = this.rollQueue[this.selectedRollIndex];
      const player = this.getCurrentPlayer();
      const canMoveCurrent = player.pawns.some(p => this.isValidPawnMove(p, currentVal));
      
      if (!canMoveCurrent) {
        const validIdx = this.rollQueue.findIndex(val => 
          player.pawns.some(p => this.isValidPawnMove(p, val))
        );
        if (validIdx !== -1) {
          this.selectedRollIndex = validIdx;
        }
      }
    }

    queuePanel.innerHTML = '';
    
    if (this.rollQueue.length === 0) {
      queuePanel.classList.add('hidden');
    } else {
      queuePanel.classList.remove('hidden');
    }
    
    this.rollQueue.forEach((val, idx) => {
      const badge = document.createElement('div');
      badge.className = `queue-badge ${idx === this.selectedRollIndex ? 'selected' : ''}`;
      badge.innerText = val;
      badge.onclick = () => {
        if (this.gamePhase === 'moving' && !this.getCurrentPlayer().isBot) {
          synth.playToggle();
          this.selectedRollIndex = idx;
          this.updateRollQueueUI();
          this.highlightValidPawns();
        }
      };
      queuePanel.appendChild(badge);
    });

    this.highlightValidPawns();
  },

  // Highlight pawns that have valid moves for the selected roll value
  highlightValidPawns() {
    // Clear highlights
    document.querySelectorAll('.pawn').forEach(p => p.classList.remove('active-move'));
    document.querySelectorAll('.cell').forEach(c => c.classList.remove('valid-target'));

    if (this.gamePhase !== 'moving' || this.selectedRollIndex === null) return;
    
    const value = this.rollQueue[this.selectedRollIndex];
    const player = this.getCurrentPlayer();
    
    player.pawns.forEach(pawn => {
      if (this.isValidPawnMove(pawn, value)) {
        const pawnEl = document.querySelector(`.pawn[data-player-index="${this.currentPlayerIndex}"][data-pawn-id="${pawn.id}"]`);
        if (pawnEl) pawnEl.classList.add('active-move');
      }
    });
  },

  isValidPawnMove(pawn, value) {
    // Yard to board spawn check
    if (pawn.pathIndex === -1) {
      if (this.rules.spawnRequired) {
        // Must roll 4 or 8 (on 5x5) or 6 or 12 (on 7x7) to spawn
        const isSpawnRoll = this.gridSize === 5 ? (value === 4 || value === 8) : (value === 6 || value === 12);
        return isSpawnRoll;
      }
      return true; // Can move directly out on any roll
    }

    const player = this.getCurrentPlayer();
    const path = this.paths[pawn.color];
    const firstInnerIndex = this.gridSize === 5 ? 16 : 24;
    let nextIndex = pawn.pathIndex + value;

    // Apply outer-ring wrap BEFORE the overshoot check, so it matches executeMove behaviour
    if (!player.hasKilled && nextIndex >= firstInnerIndex) {
      nextIndex = nextIndex % firstInnerIndex;
    }

    // Past center goal check — block overshooting after wrap is applied
    if (nextIndex >= path.length) return false;

    // Gatti pairing blockade checks
    if (this.rules.gattiEnabled) {
      // Check intermediate path blocks
      for (let step = 1; step <= value; step++) {
        let idx = pawn.pathIndex + step;

        // Wrap around logic if haven't killed
        if (!player.hasKilled && idx >= firstInnerIndex) {
          idx = idx % firstInnerIndex;
        }

        // Bounds guard: intermediate step must not exceed path array
        if (idx >= path.length) break;

        const cell = path[idx];
        const isLast = step === value;

        // A Gatti on a safe cell does NOT create a blockade (safe cells are neutral ground)
        if (GameEngine.isSafeCell(this.gridSize, cell.r, cell.c)) continue;

        // Find if there is an opponent Gatti on this cell
        const gattiPawn = this.getOpponentGattiOnCell(cell.r, cell.c, pawn.color);
        if (gattiPawn) {
          // Gatti acts as blockade - cannot land on it or pass it unless landing exactly to cut it with another Gatti
          if (isLast && pawn.isGatti) {
            return true; // Opponent Gatti can be cut by our Gatti landing on it
          }
          return false; // Blocks path
        }
      }
    }

    return true;
  },

  getOpponentGattiOnCell(r, c, myColor) {
    for (let p of this.players) {
      if (p.color === myColor) continue;
      const gatti = p.pawns.find(pawn => pawn.isGatti && pawn.pathIndex !== -1 && this.paths[pawn.color][pawn.pathIndex].r === r && this.paths[pawn.color][pawn.pathIndex].c === c);
      if (gatti) return gatti;
    }
    return null;
  },

  hasAnyValidMoves() {
    if (this.rollQueue.length === 0) return false;
    return this.rollQueue.some(val => 
      this.players[this.currentPlayerIndex].pawns.some(p => this.isValidPawnMove(p, val))
    );
  },

  // Triggered when pawn is clicked
  selectPawn(playerIdx, pawnId) {
    if (this.gamePhase !== 'moving' || playerIdx !== this.currentPlayerIndex) return;
    if (this.getCurrentPlayer().isBot) return;
    // BUG-K guard: selectedRollIndex could be null if queue is empty
    if (this.selectedRollIndex === null || this.selectedRollIndex >= this.rollQueue.length) return;

    const player = this.getCurrentPlayer();
    const pawn = player.pawns.find(p => p.id === pawnId);
    const value = this.rollQueue[this.selectedRollIndex];
    if (value === undefined) return;

    if (!this.isValidPawnMove(pawn, value)) return;

    // Execute move immediately upon pawn selection
    this.executeMove(pawn, value);
  },

  executeMove(pawn, value) {
    synth.playMove();
    const player = this.getCurrentPlayer();
    
    // De-register click handlers
    document.querySelectorAll('.cell').forEach(c => {
      c.classList.remove('valid-target');
      c.onclick = null;
    });

    let originalPathIndex = pawn.pathIndex;
    let nextIndex = pawn.pathIndex === -1 ? 0 : pawn.pathIndex + value;
    const firstInnerIndex = this.gridSize === 5 ? 16 : 24;
    
    if (pawn.pathIndex !== -1 && !player.hasKilled && nextIndex >= firstInnerIndex) {
      nextIndex = nextIndex % firstInnerIndex;
    }
    // Store old DOM rects for WAAPI animation
    this.animatingPawns = [];
    let partner = null;
    if (pawn.isGatti && originalPathIndex !== -1) {
      partner = player.pawns.find(other =>
        other.id !== pawn.id &&
        other.isGatti &&
        other.pathIndex === originalPathIndex
      );
    }
    const movingPawns = partner ? [pawn, partner] : [pawn];
    
    movingPawns.forEach(p => {
      const pEl = document.querySelector(`.pawn[data-player-index="${this.currentPlayerIndex}"][data-pawn-id="${p.id}"]`);
      if (pEl) {
        this.animatingPawns.push({
          playerIdx: this.currentPlayerIndex,
          pawnId: p.id,
          oldRect: pEl.getBoundingClientRect()
        });
      }
    });
    
    // Handle Pawn movement
    pawn.pathIndex = nextIndex;

    // BUG-F guard: only move Gatti partner when not spawning from yard (originalPathIndex=-1
    // would match other yard pawns with isGatti=true, teleporting them accidentally)
    if (pawn.isGatti && originalPathIndex !== -1) {
      const partner = player.pawns.find(other =>
        other.id !== pawn.id &&
        other.isGatti &&
        other.pathIndex === originalPathIndex
      );
      if (partner) {
        partner.pathIndex = nextIndex;
      }
    }

    const targetCell = this.paths[pawn.color][nextIndex];

    // Logging
    this.addLog(player.name, `Goti ${pawn.id + 1} ko (${targetCell.r}, ${targetCell.c}) par chalaya`);

    // BUG-B: Clear isGatti when a pawn reaches the final goal cell
    const goalIdx = this.paths[pawn.color].length - 1;
    if (nextIndex === goalIdx && pawn.isGatti) {
      pawn.isGatti = false;
      // Also clear the partner so no ghost Gatti flag lingers
      const gattiPartnerAtGoal = player.pawns.find(other =>
        other.id !== pawn.id && other.isGatti && other.pathIndex === goalIdx
      );
      if (gattiPartnerAtGoal) {
        gattiPartnerAtGoal.isGatti = false;
      }
    }

    // Check Gatti creation (pairing)
    if (this.rules.gattiEnabled && !pawn.isGatti && pawn.pathIndex !== -1 && pawn.pathIndex < goalIdx) {
      // Look for another single pawn of same color on the same cell
      const partner = player.pawns.find(other =>
        other.id !== pawn.id &&
        !other.isGatti &&
        other.pathIndex === pawn.pathIndex
      );

      if (partner) {
        // Merge into a Gatti
        pawn.isGatti = true;
        partner.isGatti = true;
        this.addLog(player.name, `Gatti ban gayi!`);
      }
    }

    // Check Capturing / Collision
    const isSafe = GameEngine.isSafeCell(this.gridSize, targetCell.r, targetCell.c);
    let extraRollGained = false;

    if (!isSafe) {
      // Check if there is an opponent pawn on this cell
      this.players.forEach((opp, oppIdx) => {
        if (oppIdx === this.currentPlayerIndex) return;

        // BUG-A fix: use a flag so we break after the first confirmed capture per opponent
        // (prevents double-capture sound/extraRoll when Gatti rule is OFF and 2 singles share a cell)
        let capturedThisOpp = false;
        for (const oppPawn of opp.pawns) {
          if (capturedThisOpp) break;
          if (oppPawn.pathIndex === -1) continue;

          const oppCell = this.paths[oppPawn.color][oppPawn.pathIndex];
          if (oppCell.r === targetCell.r && oppCell.c === targetCell.c) {

            // If Gatti rule is enabled, single pawn cannot cut Gatti
            if (this.rules.gattiEnabled && oppPawn.isGatti && !pawn.isGatti) {
              continue; // Cannot capture — skip this pawn
            }

            // Capture event!
            synth.playCapture();
            // Reset captured pawn — and its Gatti partner — to yard
            const wasGatti = oppPawn.isGatti;
            if (wasGatti) {
              const gattiPartner = opp.pawns.find(pp =>
                pp.id !== oppPawn.id &&
                pp.isGatti &&
                pp.pathIndex !== -1 &&
                this.paths[opp.color][pp.pathIndex].r === targetCell.r &&
                this.paths[opp.color][pp.pathIndex].c === targetCell.c
              );
              if (gattiPartner) {
                gattiPartner.pathIndex = -1;
                gattiPartner.isGatti = false;
              }
            }
            oppPawn.pathIndex = -1;
            oppPawn.isGatti = false;

            player.hasKilled = true;
            extraRollGained = true;
            capturedThisOpp = true;

            this.addLog(player.name, `${opp.name} ki goti kaat di! Andar jane ka rasta khul gaya.`);

            // Trigger ripple particles on UI
            this.triggerCaptureEffects(targetCell.r, targetCell.c, opp.color);
          }
        }
      });
    }

    // Remove this move value from queue
    this.rollQueue.splice(this.selectedRollIndex, 1);
    this.selectedRollIndex = this.rollQueue.length > 0 ? 0 : null;

    // Check Victory
    if (this.checkWinCondition(player)) {
      this.triggerVictory(player);
      return;
    }

    // If extra roll gained via capture, add roll state
    if (extraRollGained) {
      this.gamePhase = 'rolling';
      this.consecutiveHighRolls = 0;
      this.selectedRollIndex = null;
      this.updateRollQueueUI();
      this.addLog('System', `${player.name} ko ek aur mauka mila!`);

      this.renderBoard();
      this.triggerMoveAnimations();

      if (player.isBot) {
        setTimeout(() => {
          if (this.gamePhase === 'rolling') this.rollCowries();
        }, 1200);
      }
      return;
    }

    this.renderBoard();
    this.triggerMoveAnimations();

    // Check next phase
    if (this.rollQueue.length > 0) {
      this.updateRollQueueUI();
      if (!this.hasAnyValidMoves()) {
        this.addLog('System', `Ab koi chalne layak goti nahi hai.`);
        setTimeout(() => {
          if (this.gamePhase === 'moving') this.endTurn();
        }, 1200);
      } else if (player.isBot) {
        setTimeout(() => {
          if (this.gamePhase === 'moving') this.makeBotMove();
        }, 1000);
      }
    } else {
      this.endTurn();
    }
  },

  endTurn() {
    // Guard: never advance turn if the game is already over or setup
    if (this.gamePhase !== 'moving') return;

    this.rollQueue = [];
    this.selectedRollIndex = null;
    this.consecutiveHighRolls = 0;
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    this.gamePhase = 'rolling';

    this.renderBoard();
    this.updateRollQueueUI();

    const nextPlayer = this.getCurrentPlayer();
    this.addLog('System', `Ab ${nextPlayer.name} ki baari hai.`);

    // Handle bot action
    if (nextPlayer.isBot) {
      setTimeout(() => {
        if (this.gamePhase === 'rolling') this.rollCowries();
      }, 1200);
    }
  },

  checkWinCondition(player) {
    // All 4 pawns must reach the final cell of path
    const goalIdx = this.paths[player.color].length - 1;
    return player.pawns.every(p => p.pathIndex === goalIdx);
  },

  triggerVictory(player) {
    this.gamePhase = 'gameover';
    this.winner = player;
    this.addLog('System', `🏆 ${player.name} jeet gaya!`);
    
    synth.playVictory();
    
    setTimeout(() => {
      if (this.gamePhase !== 'gameover') return;
      document.getElementById('victory-overlay').classList.remove('hidden');
      const banner = document.getElementById('victory-banner');
      if (banner) {
        banner.innerText = `${player.name} Jeet Gaya!`;
        banner.style.color = `var(--color-${player.color})`;
      }
      const desc = document.querySelector('#victory-overlay p');
      if (desc) {
        desc.innerText = `Sabhi ${player.pawns.length} gotiyan center (Ghar) pahunch gayi!`;
      }
    }, 1000);
  },

  // Apply FLIP animations to pawns that just moved
  triggerMoveAnimations() {
    if (!this.animatingPawns || this.animatingPawns.length === 0) return;
    
    requestAnimationFrame(() => {
      this.animatingPawns.forEach(anim => {
        const newEl = document.querySelector(`.pawn[data-player-index="${anim.playerIdx}"][data-pawn-id="${anim.pawnId}"]`);
        if (newEl && anim.oldRect) {
          const newRect = newEl.getBoundingClientRect();
          const dx = anim.oldRect.left - newRect.left;
          const dy = anim.oldRect.top - newRect.top;
          
          if (dx !== 0 || dy !== 0) {
            if (typeof newEl.animate === 'function') {
              newEl.animate([
                { transform: `translate(${dx}px, ${dy}px) scale(1.3)` },
                { transform: 'translate(0, 0) scale(1)' }
              ], {
                duration: 400,
                easing: 'cubic-bezier(0.25, 1, 0.5, 1)'
              });
            }
          }
        }
      });
      this.animatingPawns = [];
    });
  },

  // Trigger capture ripple particle animation
  triggerCaptureEffects(r, c, capturedColor) {
    const cellEl = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
    if (!cellEl) return;
    
    for (let i = 0; i < 12; i++) {
      const particle = document.createElement('div');
      particle.style.position = 'absolute';
      particle.style.width = '6px';
      particle.style.height = '6px';
      particle.style.borderRadius = '50%';
      particle.style.backgroundColor = `var(--color-${capturedColor})`;
      particle.style.pointerEvents = 'none';
      particle.style.zIndex = '50';
      
      const angle = Math.random() * Math.PI * 2;
      const velocity = 2 + Math.random() * 4;
      let x = 0;
      let y = 0;
      
      cellEl.appendChild(particle);
      
      let frame = 0;
      const anim = () => {
        frame++;
        x += Math.cos(angle) * velocity;
        y += Math.sin(angle) * velocity;
        particle.style.transform = `translate(${x}px, ${y}px)`;
        particle.style.opacity = (1 - frame / 30).toString();
        
        if (frame < 30) {
          requestAnimationFrame(anim);
        } else {
          particle.remove();
        }
      };
      requestAnimationFrame(anim);
    }
  },

  // Smart Evaluation-based AI Bot Decision Maker
  makeBotMove() {
    if (this.gamePhase !== 'moving') return;
    
    const player = this.getCurrentPlayer();
    
    // Deep clone state for simulation
    const getInitialSimState = () => {
      return {
        pawns: player.pawns.map(p => ({ id: p.id, pathIndex: p.pathIndex, isGatti: p.isGatti })),
        hasKilled: player.hasKilled,
        opponents: this.players
          .filter((_, idx) => idx !== this.currentPlayerIndex)
          .map(opp => ({
            color: opp.color,
            pawns: opp.pawns.map(p => ({ id: p.id, pathIndex: p.pathIndex, isGatti: p.isGatti }))
          }))
      };
    };

    const firstInnerIndex = this.gridSize === 5 ? 16 : 24;
    const goalIndex = this.paths[player.color].length - 1;

    // Simulated check for opponent Gatti blockade
    const getOpponentGattiOnCellSim = (simState, r, c) => {
      for (let opp of simState.opponents) {
        const oppPath = this.paths[opp.color];
        const gatti = opp.pawns.find(oppP => 
          oppP.isGatti && oppP.pathIndex !== -1 &&
          oppPath[oppP.pathIndex].r === r && oppPath[oppP.pathIndex].c === c
        );
        if (gatti) return gatti;
      }
      return null;
    };

    // Simulated validity check
    const isValidPawnMoveSim = (simState, pawn, value) => {
      if (pawn.pathIndex === -1) {
        if (this.rules.spawnRequired) {
          const isSpawnRoll = this.gridSize === 5 ? (value === 4 || value === 8) : (value === 6 || value === 12);
          return isSpawnRoll;
        }
        return true;
      }

      let nextIndex = pawn.pathIndex + value;

      // Apply outer-ring wrap BEFORE overshoot check — matches simulateMove behaviour
      if (!simState.hasKilled && nextIndex >= firstInnerIndex) {
        nextIndex = nextIndex % firstInnerIndex;
      }

      const path = this.paths[player.color];

      // Always block overshooting after wrap is applied
      if (nextIndex >= path.length) return false;

      if (this.rules.gattiEnabled) {
        for (let step = 1; step <= value; step++) {
          let idx = pawn.pathIndex + step;
          if (!simState.hasKilled && idx >= firstInnerIndex) {
            idx = idx % firstInnerIndex;
          }

          // Bounds guard: intermediate step must not exceed path array
          if (idx >= path.length) break;

          const cell = path[idx];
          const isLast = step === value;

          // A Gatti on a safe cell does NOT create a blockade
          if (GameEngine.isSafeCell(this.gridSize, cell.r, cell.c)) continue;

          const oppGatti = getOpponentGattiOnCellSim(simState, cell.r, cell.c);
          if (oppGatti) {
            if (isLast && pawn.isGatti) return true; // Can land on Gatti with Gatti
            return false; // Blocked
          }
        }
      }
      return true;
    };

    // Simulated move execution
    const simulateMove = (simState, pawnId, value) => {
      const nextState = {
        pawns: simState.pawns.map(p => ({ ...p })),
        hasKilled: simState.hasKilled,
        opponents: simState.opponents.map(opp => ({
          color: opp.color,
          pawns: opp.pawns.map(p => ({ ...p }))
        }))
      };

      const pawn = nextState.pawns.find(p => p.id === pawnId);
      const originalPathIndex = pawn.pathIndex;
      
      let nextIndex = pawn.pathIndex === -1 ? 0 : pawn.pathIndex + value;
      if (pawn.pathIndex !== -1 && !nextState.hasKilled && nextIndex >= firstInnerIndex) {
        nextIndex = nextIndex % firstInnerIndex;
      }

      // Move the pawn (and its partner if Gatti)
      // Guard: only move partner when not spawning from yard (originalPathIndex=-1 would match yard pawns)
      pawn.pathIndex = nextIndex;
      if (pawn.isGatti && originalPathIndex !== -1) {
        const partner = nextState.pawns.find(other =>
          other.id !== pawn.id && other.isGatti && other.pathIndex === originalPathIndex
        );
        if (partner) partner.pathIndex = nextIndex;
      }

      // Clear isGatti when a pawn reaches the final goal cell
      if (nextIndex === goalIndex && pawn.isGatti) {
        pawn.isGatti = false;
        const gattiPartnerAtGoal = nextState.pawns.find(other =>
          other.id !== pawn.id && other.isGatti && other.pathIndex === goalIndex
        );
        if (gattiPartnerAtGoal) {
          gattiPartnerAtGoal.isGatti = false;
        }
      }

      const targetCell = this.paths[player.color][nextIndex];
      const isSafe = GameEngine.isSafeCell(this.gridSize, targetCell.r, targetCell.c);
      let captureOccurred = false;

      // Handle captures — break after first capture per opponent (mirrors executeMove fix)
      if (!isSafe) {
        nextState.opponents.forEach(opp => {
          const oppPath = this.paths[opp.color];
          let capturedThisOppSim = false;
          for (const oppP of opp.pawns) {
            if (capturedThisOppSim) break;
            if (oppP.pathIndex === -1) continue;
            const oppCell = oppPath[oppP.pathIndex];
            if (oppCell.r === targetCell.r && oppCell.c === targetCell.c) {
              if (this.rules.gattiEnabled && oppP.isGatti && !pawn.isGatti) {
                continue; // Cannot capture Gatti with single
              }
              // Reset captured pawn — and its Gatti partner — to yard
              const wasGattiSim = oppP.isGatti;
              if (wasGattiSim) {
                const simPartner = opp.pawns.find(pp =>
                  pp.id !== oppP.id &&
                  pp.isGatti &&
                  pp.pathIndex !== -1 &&
                  oppPath[pp.pathIndex].r === targetCell.r &&
                  oppPath[pp.pathIndex].c === targetCell.c
                );
                if (simPartner) {
                  simPartner.pathIndex = -1;
                  simPartner.isGatti = false;
                }
              }
              oppP.pathIndex = -1;
              oppP.isGatti = false;
              nextState.hasKilled = true;
              captureOccurred = true;
              capturedThisOppSim = true;
            }
          }
        });
      }

      // Handle Gatti creation
      if (this.rules.gattiEnabled && !pawn.isGatti && pawn.pathIndex !== -1 && pawn.pathIndex < goalIndex) {
        const partner = nextState.pawns.find(other => 
          other.id !== pawn.id && !other.isGatti && other.pathIndex === pawn.pathIndex
        );
        if (partner) {
          pawn.isGatti = true;
          partner.isGatti = true;
        }
      }

      return { nextState, captureOccurred };
    };

    // Position evaluation
    const evaluateSimState = (simState) => {
      let score = 0;
      
      simState.pawns.forEach(pawn => {
        if (pawn.pathIndex === goalIndex) {
          score += 1500; // Finished goal is top priority
        } else if (pawn.pathIndex === -1) {
          score += 0;
        } else {
          // Goal progression
          if (simState.hasKilled) {
            score += pawn.pathIndex * 35;
          } else {
            // Encourage moving forward to chase or hunt opponents
            score += pawn.pathIndex * 15;
          }

          // Safety house
          const cell = this.paths[player.color][pawn.pathIndex];
          if (GameEngine.isSafeCell(this.gridSize, cell.r, cell.c)) {
            score += 250;
          }

          // Gatti blockade bonus
          if (this.rules.gattiEnabled && pawn.isGatti) {
            score += 450;
          }

          // Danger checks: check if any opponent can hit us
          simState.opponents.forEach(opp => {
            const oppPath = this.paths[opp.color];
            opp.pawns.forEach(oppP => {
              if (oppP.pathIndex !== -1) {
                const oppCell = oppPath[oppP.pathIndex];
                const cellIdxOnOppPath = oppPath.findIndex(c => c.r === cell.r && c.c === cell.c);
                
                if (cellIdxOnOppPath !== -1) {
                  const stepDiff = cellIdxOnOppPath - oppP.pathIndex;
                  if (stepDiff > 0 && stepDiff <= (this.gridSize === 5 ? 8 : 12)) {
                    const isSafe = GameEngine.isSafeCell(this.gridSize, cell.r, cell.c);
                    if (!isSafe) {
                      const canCapture = !pawn.isGatti || oppP.isGatti;
                      if (canCapture) {
                        score -= oppP.isGatti ? 400 : 250;
                      }
                    }
                  }
                }
              }
            });
          });
        }
      });

      return score;
    };

    // Recursive search over permutations of remaining rolls in this turn
    const searchBestSequence = (simState, remainingRolls) => {
      if (remainingRolls.length === 0) {
        return { score: evaluateSimState(simState), sequence: [] };
      }

      let bestScore = -Infinity;
      let bestSeq = [];

      // Try using each roll in the remaining queue
      for (let i = 0; i < remainingRolls.length; i++) {
        const value = remainingRolls[i];
        
        simState.pawns.forEach(pawn => {
          if (!isValidPawnMoveSim(simState, pawn, value)) return;
          
          const { nextState, captureOccurred } = simulateMove(simState, pawn.id, value);
          const nextRolls = remainingRolls.filter((_, idx) => idx !== i);
          
          const result = searchBestSequence(nextState, nextRolls);
          const score = result.score + (captureOccurred ? 1800 : 0); // Capture bonus in transition
          
          if (score > bestScore) {
            bestScore = score;
            bestSeq = [{ pawnId: pawn.id, value: value, rollIdx: i }].concat(result.sequence);
          }
        });
      }

      if (bestScore === -Infinity) {
        // No moves possible with any of the rolls
        return { score: evaluateSimState(simState), sequence: [] };
      }

      return { score: bestScore, sequence: bestSeq };
    };

    const initialSimState = getInitialSimState();
    const searchResult = searchBestSequence(initialSimState, this.rollQueue);

    if (searchResult.sequence.length > 0) {
      const bestStep = searchResult.sequence[0];
      const pawnToMove = player.pawns.find(p => p.id === bestStep.pawnId);
      
      const val = bestStep.value;
      // Use the exact tracked roll index — indexOf() fails for duplicate values
      const actualIdx = bestStep.rollIdx;

      if (actualIdx !== -1) {
        setTimeout(() => {
          // Guard: verify game is still in moving phase before executing
          if (this.gamePhase !== 'moving') return;
          this.selectedRollIndex = actualIdx;
          this.updateRollQueueUI(); // Visual highlight
          setTimeout(() => {
            if (this.gamePhase === 'moving') this.executeMove(pawnToMove, val);
          }, 300);
        }, 500);
      } else {
        this.endTurn();
      }
    } else {
      this.endTurn();
    }
  },

  getManhattanDistance(cellA, cellB) {
    return Math.abs(cellA.r - cellB.r) + Math.abs(cellA.c - cellB.c);
  },

  // Dynamic Board Renderer
  renderBoard() {
    const boardGrid = document.getElementById('board');
    if (!boardGrid) return;
    
    boardGrid.className = `board-grid size-${this.gridSize}`;
    boardGrid.innerHTML = '';
    
    // Update active player badge overlay
    const curPlayer = this.getCurrentPlayer();
    const avatar = document.getElementById('turn-avatar');
    const labelName = document.getElementById('turn-name');
    const labelPhase = document.getElementById('turn-phase');
    const rollBtn = document.getElementById('btn-roll');

    if (avatar) avatar.style.color = `var(--color-${curPlayer.color})`;
    if (labelName) labelName.innerText = curPlayer.name;
    if (labelPhase) labelPhase.innerText = this.gamePhase === 'rolling' ? 'PASA FEKNE KI BAARI' : 'GOTI CHALNE KI BAARI';
    
    if (rollBtn) {
      rollBtn.disabled = this.gamePhase !== 'rolling' || curPlayer.isBot;
    }

    // Build Cell Map
    for (let r = 1; r <= this.gridSize; r++) {
      for (let c = 1; c <= this.gridSize; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.setAttribute('data-r', r);
        cell.setAttribute('data-c', c);

        // Safe Square styling
        const isSafe = GameEngine.isSafeCell(this.gridSize, r, c);
        const centerIdx = Math.ceil(this.gridSize / 2);
        
        if (r === centerIdx && c === centerIdx) {
          cell.classList.add('home-center');
          cell.classList.add('safe');
          const starEl = document.createElement('div');
          starEl.innerText = '★';
          starEl.className = 'home-star';
          cell.appendChild(starEl);
        } else if (isSafe) {
          cell.classList.add('safe');
          
          // Color indicator for specific player safe start squares
          if (r === this.gridSize && c === centerIdx) cell.classList.add('player-home-red');
          else if (r === centerIdx && c === 1) cell.classList.add('player-home-green');
          else if (r === 1 && c === centerIdx) cell.classList.add('player-home-yellow');
          else if (r === centerIdx && c === this.gridSize) cell.classList.add('player-home-blue');
        }

        // Add entry mark indicator
        const firstInnerIndex = this.gridSize === 5 ? 16 : 24;
        this.players.forEach(p => {
          const path = this.paths[p.color];
          if (path && path.length > firstInnerIndex) {
            const entryCell = path[firstInnerIndex - 1]; // Cell before moving inward
            if (entryCell.r === r && entryCell.c === c) {
              cell.classList.add(`entry-mark-${p.color}`);
            }
          }
        });

        // Draw Pawns in this Cell
        const pawnsInCell = [];
        
        this.players.forEach((p, pIdx) => {
          p.pawns.forEach(pawn => {
            if (pawn.pathIndex !== -1) {
              const pathCell = this.paths[pawn.color][pawn.pathIndex];
              if (pathCell.r === r && pathCell.c === c) {
                pawnsInCell.push({ pawn, playerIdx: pIdx });
              }
            }
          });
        });

        // Group same-player pawns or stack multiple pawns
        if (pawnsInCell.length > 0) {
          const renderedItems = [];
          
          // Separate into Gattis and Singles
          const gattis = pawnsInCell.filter(item => item.pawn.isGatti);
          const singles = pawnsInCell.filter(item => !item.pawn.isGatti);
          
          // Add one element per Gatti pair
          for (let i = 0; i < gattis.length; i += 2) {
            if (gattis[i]) {
              renderedItems.push({ pawn: gattis[i].pawn, playerIdx: gattis[i].playerIdx, isGatti: true });
            }
          }
          
          // Add all singles
          singles.forEach(single => {
            renderedItems.push({ pawn: single.pawn, playerIdx: single.playerIdx, isGatti: false });
          });
          
          renderedItems.forEach((item, index) => {
            const pEl = this.createPawnElement(item.pawn, item.playerIdx, item.isGatti);
            if (renderedItems.length > 1) {
              pEl.style.transform = `translate(${index * 4 - (renderedItems.length * 2)}px, ${index * 4 - (renderedItems.length * 2)}px)`;
              pEl.style.position = 'absolute';
            }
            
            // If there are multiple Gattis (e.g., 2 Gattis = 4 pawns), we could add a badge.
            // But visually, rendering them stacked works fine. 
            
            cell.appendChild(pEl);
          });
        }

        boardGrid.appendChild(cell);
      }
    }

    // Render starting yards (off-board tokens list)
    this.renderYards();
    
    // Explicitly adjust scale for mobile view
    if (typeof adjustBoardScale === 'function') {
      adjustBoardScale();
    }
  },

  createPawnElement(pawn, playerIdx, isGatti) {
    const pEl = document.createElement('div');
    pEl.className = `pawn ${pawn.color} ${isGatti ? 'gatti' : ''}`;
    pEl.setAttribute('data-player-index', playerIdx);
    pEl.setAttribute('data-pawn-id', pawn.id);
    
    // Add inner dot
    const inner = document.createElement('div');
    inner.className = 'pawn-inner';
    pEl.appendChild(inner);

    pEl.onmouseenter = () => {
      if (this.gamePhase !== 'moving' || playerIdx !== this.currentPlayerIndex || this.getCurrentPlayer().isBot) return;
      if (this.selectedRollIndex === null) return;
      const value = this.rollQueue[this.selectedRollIndex];
      if (!this.isValidPawnMove(pawn, value)) return;

      let targetCell;
      if (pawn.pathIndex === -1) {
        targetCell = this.paths[pawn.color][0];
      } else {
        let targetIdx = pawn.pathIndex + value;
        const firstInnerIndex = this.gridSize === 5 ? 16 : 24;
        if (!this.getCurrentPlayer().hasKilled && targetIdx >= firstInnerIndex) {
          targetIdx = targetIdx % firstInnerIndex;
        }
        targetCell = this.paths[pawn.color][targetIdx];
      }
      
      const cellEl = document.querySelector(`.cell[data-r="${targetCell.r}"][data-c="${targetCell.c}"]`);
      if (cellEl) cellEl.classList.add('valid-target');
    };

    pEl.onmouseleave = () => {
      document.querySelectorAll('.valid-target').forEach(c => c.classList.remove('valid-target'));
    };

    pEl.onclick = (e) => {
      document.querySelectorAll('.valid-target').forEach(c => c.classList.remove('valid-target'));
      if (pEl.parentElement && pEl.parentElement.classList.contains('valid-target')) return;
      e.stopPropagation();
      this.selectPawn(playerIdx, pawn.id);
    };

    return pEl;
  },

  // Draw inactive pawns in their respective player panels/yards
  renderYards() {
    const colors = ['red', 'green', 'yellow', 'blue'];
    colors.forEach(col => {
      const yardEl = document.getElementById(`yard-${col}`);
      if (!yardEl) return;
      yardEl.innerHTML = '';

      const playerIdx = this.players.findIndex(p => p.color === col);
      if (playerIdx === -1) {
        // Hide unused yards visually
        yardEl.style.display = 'none';
        return;
      } else {
        yardEl.style.display = 'flex';
      }

      const player = this.players[playerIdx];
      player.pawns.forEach(pawn => {
        if (pawn.pathIndex === -1) {
          const pEl = this.createPawnElement(pawn, playerIdx, false);
          yardEl.appendChild(pEl);
        }
      });
    });
  },

  setupRollButtonEvents() {
    const btnRoll = document.getElementById('btn-roll');
    if (!btnRoll) return;

    let isCharging = false;
    let chargeValue = 0;
    let chargeDirection = 1;
    let chargeTimer = null;
    let clickStart = 0;

    const startCharge = (e) => {
      if (e) e.preventDefault();
      
      // Only allow charging if it's the rolling phase, not already rolling, and current player is a human
      if (this.gamePhase !== 'rolling' || this.isRollingAnim || this.getCurrentPlayer().isBot) return;
      if (isCharging) return;
      
      isCharging = true;
      chargeValue = 10;
      chargeDirection = 1;
      clickStart = Date.now();

      // Show power meter
      const powerMeter = document.getElementById('power-meter-container');
      const powerBar = document.getElementById('power-bar');
      const powerText = document.getElementById('power-text');
      if (powerMeter) powerMeter.classList.remove('hidden');
      if (powerBar) powerBar.style.width = '10%';
      if (powerText) powerText.innerText = '10%';

      // Start rattle sound
      synth.startRattle();

      // Add shaking class to visible cowries
      const shells = document.querySelectorAll('.cowrie-shell');
      shells.forEach(s => s.classList.add('shaking'));

      // Oscillation loop for the power bar
      chargeTimer = setInterval(() => {
        chargeValue += chargeDirection * 5; // Change by 5% every 20ms
        if (chargeValue >= 100) {
          chargeValue = 100;
          chargeDirection = -1; // Reverse direction
        } else if (chargeValue <= 10) {
          chargeValue = 10;
          chargeDirection = 1; // Reverse direction
        }
        
        if (powerBar) powerBar.style.width = `${chargeValue}%`;
        if (powerText) powerText.innerText = `${chargeValue}%`;
      }, 20);
    };

    const stopCharge = (e) => {
      if (!isCharging) return;
      isCharging = false;
      
      if (chargeTimer) {
        clearInterval(chargeTimer);
        chargeTimer = null;
      }

      // Remove shake class
      const shells = document.querySelectorAll('.cowrie-shell');
      shells.forEach(s => s.classList.remove('shaking'));

      const holdDuration = Date.now() - clickStart;
      let finalStrength = chargeValue / 100;

      // If it was a quick click, give a randomized medium throw strength
      if (holdDuration < 150) {
        finalStrength = 0.3 + Math.random() * 0.4;
      }

      // Perform the roll!
      this.rollCowries(finalStrength);

      // Hide power meter after a small delay to let user see their power
      setTimeout(() => {
        if (!isCharging) {
          const powerMeter = document.getElementById('power-meter-container');
          if (powerMeter) powerMeter.classList.add('hidden');
        }
      }, 1000);
    };

    // Attach both touch and mouse events
    btnRoll.addEventListener('mousedown', startCharge);
    btnRoll.addEventListener('touchstart', startCharge, { passive: false });

    // Global release handlers so it registers release even if mouse drifts away from the button
    window.addEventListener('mouseup', stopCharge);
    window.addEventListener('touchend', stopCharge);
    
    // Fallback if cursor leaves the page
    document.addEventListener('mouseleave', stopCharge);
  },

  simulateBotChargeAndRoll() {
    this.isRollingAnim = true; // Block double rolls
    
    const powerMeter = document.getElementById('power-meter-container');
    const powerBar = document.getElementById('power-bar');
    const powerText = document.getElementById('power-text');
    
    if (powerMeter) powerMeter.classList.remove('hidden');
    
    // Start bot rattle sound
    synth.startRattle();
    
    // Shaking shells
    const shells = document.querySelectorAll('.cowrie-shell');
    shells.forEach(s => s.classList.add('shaking'));
    
    // Simulated charge curve
    let botPower = 10;
    const targetPower = 40 + Math.floor(Math.random() * 55); // Bot shoots for 40% to 95%
    
    let botChargeTimer = setInterval(() => {
      botPower += 4;
      if (botPower >= targetPower) {
        botPower = targetPower;
        clearInterval(botChargeTimer);
        
        // Wait a small moment at peak, then roll
        setTimeout(() => {
          // Clean up bot shake
          shells.forEach(s => s.classList.remove('shaking'));

          this.isRollingAnim = false; // Reset so rollCowries runs
          // Guard: only roll if still in rolling phase (game could have ended)
          if (this.gamePhase === 'rolling') {
            this.rollCowries(botPower / 100);
          }

          // Hide power meter
          setTimeout(() => {
            if (powerMeter) powerMeter.classList.add('hidden');
          }, 1000);
        }, 150);
      }
      
      if (powerBar) powerBar.style.width = `${botPower}%`;
      if (powerText) powerText.innerText = `${botPower}%`;
    }, 20);
  }
};

// Global handlers to connect HTML to the JavaScript logic
window.rollDice = function() {
  GameState.rollCowries();
};

window.toggleMute = function() {
  synth.muted = !synth.muted;
  const volIcon = document.getElementById('volume-icon');
  if (volIcon) {
    volIcon.innerText = synth.muted ? '🔇' : '🔊';
  }
};

window.restartGame = function(fromBackButton = false) {
  GameState.gamePhase = 'setup';
  if (window.synth && typeof window.synth.playToggle === 'function') synth.playToggle();
  document.getElementById('victory-overlay').classList.add('hidden');
  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('setup-screen').classList.remove('hidden');
  
  // If restarted manually via button, clean up the history state
  if (!fromBackButton && window.location.hash === '#game') {
    window.isIntentionalRestart = true;
    history.back();
  }
};

window.selectPlayerType = function(color, type) {
  if (window.synth && typeof window.synth.playToggle === 'function') {
    window.synth.playToggle();
  }
  
  // Update hidden input
  document.getElementById(`type-${color}`).value = type;
  
  // Update active state of segmented buttons
  const container = document.getElementById(`seg-${color}`);
  if (container) {
    container.querySelectorAll('.seg-btn').forEach(btn => btn.classList.remove('active'));
    container.querySelector(`.seg-btn[data-val="${type}"]`).classList.add('active');
  }
};

window.selectPlayerCount = function(count) {
  if (window.synth && typeof window.synth.playToggle === 'function') {
    window.synth.playToggle();
  }
  
  document.getElementById('select-count').value = count;
  
  // Update UI toggles
  const container = document.getElementById('toggle-count-container');
  if (container) {
    container.querySelectorAll('.btn-toggle').forEach(btn => btn.classList.remove('active'));
    container.querySelector(`.btn-toggle[data-val="${count}"]`).classList.add('active');
  }

  // Show/Hide player setup cards
  const allCards = document.querySelectorAll('.player-setup-card');
  const cardRed = document.querySelector('.card-red');
  const cardYellow = document.querySelector('.card-yellow');
  const cardGreen = document.querySelector('.card-green');
  const cardBlue = document.querySelector('.card-blue');

  allCards.forEach(c => c.style.display = 'none');

  if (count === 2) {
    if (cardRed) cardRed.style.display = 'flex';
    if (cardYellow) cardYellow.style.display = 'flex';
  } else if (count === 3) {
    if (cardRed) cardRed.style.display = 'flex';
    if (cardGreen) cardGreen.style.display = 'flex';
    if (cardYellow) cardYellow.style.display = 'flex';
  } else {
    allCards.forEach(c => c.style.display = 'flex');
  }
};

window.selectGameMode = function(mode) {
  if (window.synth && typeof window.synth.playToggle === 'function') {
    window.synth.playToggle();
  }
  
  document.getElementById('select-mode').value = mode;
  
  // Update UI toggles
  const container = document.getElementById('toggle-mode-container');
  if (container) {
    container.querySelectorAll('.btn-toggle').forEach(btn => btn.classList.remove('active'));
    container.querySelector(`.btn-toggle[data-val="${mode}"]`).classList.add('active');
  }

  // Show/Hide the individual player bot toggles
  const wrappers = document.querySelectorAll('.bot-toggle-wrapper');
  if (mode === 'bot') {
    wrappers.forEach(w => w.style.display = 'flex');
  } else {
    wrappers.forEach(w => w.style.display = 'none');
  }
};

window.startGame = function() {
  // Capture inputs
  const size = parseInt(document.getElementById('select-size').getAttribute('data-value') || '5');
  const count = parseInt(document.getElementById('select-count').value || '4');
  const mode = document.getElementById('select-mode').value || 'local';
  
  const rules = {
    gattiEnabled: document.getElementById('rule-gatti').classList.contains('active'),
    spawnRequired: document.getElementById('rule-spawn')?.classList.contains('active') || false
  };

  const playersList = [];
  
  let colorsToUse = ['red', 'green', 'yellow', 'blue'];
  if (count === 2) {
    colorsToUse = ['red', 'yellow'];
  } else if (count === 3) {
    colorsToUse = ['red', 'green', 'yellow'];
  }
  
  colorsToUse.forEach(col => {
    const input = document.getElementById(`name-${col}`);
    const botSelect = document.getElementById(`type-${col}`);
    if (input) {
      playersList.push({
        name: input.value.trim() || `${col.toUpperCase()} Player`,
        color: col,
        isBot: (mode === 'local') ? false : (botSelect.value === 'bot')
      });
    }
  });

  // Init Engine
  GameState.initGame(playersList, size, rules);
  
  // Transitions
  document.getElementById('setup-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  
  // Add History State for mobile back button handling
  history.pushState({ page: 'game' }, '', '#game');
  
  // Render
  GameState.renderBoard();
};

// DOM init scripts for toggle buttons
document.addEventListener('DOMContentLoaded', () => {
  // Handle mobile hardware back button
  window.addEventListener('popstate', (event) => {
    if (window.isIntentionalRestart) {
      window.isIntentionalRestart = false;
      return;
    }
    
    // If the game screen is visible and user clicked back
    if (!document.getElementById('game-screen').classList.contains('hidden')) {
      if (confirm("Kya aap sach mein khel chhodna chahte hain? (Are you sure you want to quit the game?)")) {
        window.restartGame(true); // true = called from back button, don't re-trigger history.back()
      } else {
        // User cancelled, push state again to stay in game
        history.pushState({ page: 'game' }, '', '#game');
      }
    }
  });

  // Rule selectors
  const toggles = document.querySelectorAll('.btn-toggle');
  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      // If it's board size toggle, handle exclusive active
      if (btn.parentNode.id === 'toggle-size-container') {
        synth.playToggle();
        btn.parentNode.querySelectorAll('.btn-toggle').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('select-size').setAttribute('data-value', btn.getAttribute('data-val'));
      } 
      // If it's a generic rule toggle (Niyam Chunein)
      else if (btn.parentNode.id !== 'toggle-mode-container' && btn.parentNode.id !== 'toggle-count-container') {
        synth.playToggle();
        btn.classList.toggle('active');
      }
      // Note: toggle-mode-container and toggle-count-container have their own onclick handlers in HTML
      // which already play the sound and manage the active state.
    });
  });

  // Setup the SOTA click-and-hold/touch-and-hold events for cowrie rolling
  GameState.setupRollButtonEvents();
});
