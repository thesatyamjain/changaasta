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
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
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
    
    // Even rings are standard loop, odd rings are reversed
    if (ringIndex % 2 === 1) {
      coords.reverse();
      // Adjust standard rotation after reversing to keep it continuous
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
    
    // Additional safes for 7x7 board
    if (gridSize === 7) {
      if (r === 1 && c === 1) return true;
      if (r === 1 && c === 7) return true;
      if (r === 7 && c === 7) return true;
      if (r === 7 && c === 1) return true;
    }
    
    return false;
  }
};

function adjustBoardScale() {
  const container = document.querySelector('.board-outer-container');
  if (!container) return;
  
  // Calculate maximum available width based on viewport
  const maxWidth = Math.min(window.innerWidth - 20, 750);
  const scale = maxWidth / 750;
  
  if (scale < 1) {
    container.style.transform = `scale(${scale})`;
    container.style.transformOrigin = 'top center';
    // Offset the lost height to prevent large empty space below the board
    const lostHeight = 750 * (1 - scale);
    container.style.marginBottom = `-${lostHeight}px`;
  } else {
    container.style.transform = 'none';
    container.style.marginBottom = '0px';
  }
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
    spawnRequired: true
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
    this.players = playersList.map((p, idx) => {
      const pawns = [];
      for (let i = 0; i < 4; i++) {
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
  rollCowries() {
    if (this.gamePhase !== 'rolling' || this.isRollingAnim) return;
    this.isRollingAnim = true;
    
    synth.playRoll();
    
    // Animate rolling shells in DOM
    const shells = document.querySelectorAll('.cowrie-shell');
    shells.forEach(s => s.classList.add('rolling'));

    setTimeout(() => {
      this.isRollingAnim = false;
      shells.forEach(s => s.classList.remove('rolling'));

      const cowrieCount = this.gridSize === 5 ? 4 : 6;
      let mouthsUp = 0;
      const shellStates = [];
      
      for (let i = 0; i < cowrieCount; i++) {
        const up = Math.random() < 0.5;
        if (up) mouthsUp++;
        shellStates.push(up);
      }
      
      this.lastShellStates = shellStates;

      // Render shell visuals
      shells.forEach((s, idx) => {
        if (idx < cowrieCount) {
          s.className = `cowrie-shell ${shellStates[idx] ? 'mouth-up' : 'mouth-down'}`;
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
        if (mouthsUp === 0) { rollValue = 8; extraRoll = true; }
        else if (mouthsUp === 4) { rollValue = 4; extraRoll = true; }
        else { rollValue = mouthsUp; }
      } else {
        // 7x7: 6 shells
        if (mouthsUp === 0) { rollValue = 12; extraRoll = true; }
        else if (mouthsUp === 6) { rollValue = 6; extraRoll = true; }
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
          setTimeout(() => this.rollCowries(), 1200);
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
          setTimeout(() => this.endTurn(), 1500);
        } else if (player.isBot) {
          setTimeout(() => this.makeBotMove(), 1200);
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
    const nextIndex = pawn.pathIndex + value;

    // Past center goal check
    if (nextIndex >= path.length) return false;

    // Entry to inner loops requires at least one cut (capture)
    const firstInnerIndex = this.gridSize === 5 ? 16 : 24;
    if (pawn.pathIndex < firstInnerIndex && nextIndex >= firstInnerIndex) {
      if (!player.hasKilled) return false;
    }

    // Gatti pairing blockade checks
    if (this.rules.gattiEnabled) {
      // Check intermediate path blocks
      for (let idx = pawn.pathIndex + 1; idx <= nextIndex; idx++) {
        const cell = path[idx];
        const isLast = idx === nextIndex;
        
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

    const player = this.getCurrentPlayer();
    const pawn = player.pawns.find(p => p.id === pawnId);
    const value = this.rollQueue[this.selectedRollIndex];

    if (!this.isValidPawnMove(pawn, value)) return;

    // Highlight target cell
    document.querySelectorAll('.cell').forEach(c => c.classList.remove('valid-target'));
    
    let targetCell;
    if (pawn.pathIndex === -1) {
      // Spawn at index 0
      targetCell = this.paths[pawn.color][0];
    } else {
      const targetIdx = pawn.pathIndex + value;
      targetCell = this.paths[pawn.color][targetIdx];
    }

    const cellEl = document.querySelector(`.cell[data-r="${targetCell.r}"][data-c="${targetCell.c}"]`);
    if (cellEl) {
      cellEl.classList.add('valid-target');
      cellEl.onclick = () => this.executeMove(pawn, value);
    }
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
    
    // Handle Pawn movement
    pawn.pathIndex = nextIndex;

    if (pawn.isGatti) {
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

    // Check Gatti creation (pairing)
    if (this.rules.gattiEnabled && !pawn.isGatti && pawn.pathIndex !== -1 && pawn.pathIndex < this.paths[pawn.color].length - 1) {
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

        opp.pawns.forEach(oppPawn => {
          if (oppPawn.pathIndex !== -1) {
            const oppCell = this.paths[oppPawn.color][oppPawn.pathIndex];
            if (oppCell.r === targetCell.r && oppCell.c === targetCell.c) {
              
              // If Gatti rule is enabled, single pawn cannot cut Gatti
              if (this.rules.gattiEnabled && oppPawn.isGatti && !pawn.isGatti) {
                return; // Cannot capture
              }

              // Capture event!
              synth.playCapture();
              oppPawn.pathIndex = -1; // Reset to yard
              oppPawn.isGatti = false;
              
              player.hasKilled = true;
              extraRollGained = true;
              
              this.addLog(player.name, `${opp.name} ki goti kaat di! Andar jane ka rasta khul gaya.`);
              
              // Trigger ripple particles on UI
              this.triggerCaptureEffects(targetCell.r, targetCell.c, opp.color);
            }
          }
        });
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
      
      if (player.isBot) {
        setTimeout(() => this.rollCowries(), 1200);
      }
      return;
    }

    this.renderBoard();

    // Check next phase
    if (this.rollQueue.length > 0) {
      this.updateRollQueueUI();
      if (!this.hasAnyValidMoves()) {
        this.addLog('System', `Ab koi chalne layak goti nahi hai.`);
        setTimeout(() => this.endTurn(), 1200);
      } else if (player.isBot) {
        setTimeout(() => this.makeBotMove(), 1000);
      }
    } else {
      this.endTurn();
    }
  },

  endTurn() {
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
      setTimeout(() => this.rollCowries(), 1200);
    }
  },

  checkWinCondition(player) {
    // All 4 pawns must reach the final cell of path
    const goalIdx = this.paths[player.color].length - 1;
    return player.pawns.every(p => p.pathIndex === goalIdx);
  },

  triggerVictory(player) {
    synth.playWin();
    this.gamePhase = 'ended';
    this.winner = player.color;
    
    // Render victory modal
    const overlay = document.getElementById('victory-overlay');
    const banner = document.getElementById('victory-banner');
    
    if (overlay && banner) {
      banner.className = `winner-banner ${player.color}`;
      banner.innerText = `${player.name} (${player.color.toUpperCase()}) Jeet Gaya!`;
      overlay.classList.remove('hidden');
    }
    
    this.addLog('System', `Badhai ho! ${player.name} khel jeet gaya.`);
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
    const value = this.rollQueue[this.selectedRollIndex];
    
    let bestMove = null;
    let maxScore = -9999;
    
    player.pawns.forEach(pawn => {
      if (!this.isValidPawnMove(pawn, value)) return;
      
      let score = 0;
      const currentIdx = pawn.pathIndex;
      const nextIdx = currentIdx === -1 ? 0 : currentIdx + value;
      const targetCell = this.paths[pawn.color][nextIdx];
      const isTargetSafe = GameEngine.isSafeCell(this.gridSize, targetCell.r, targetCell.c);
      
      // 1. Capture/Kill opportunity (Highest priority)
      if (!isTargetSafe) {
        this.players.forEach((opp, oppIdx) => {
          if (oppIdx === this.currentPlayerIndex) return;
          opp.pawns.forEach(oppP => {
            if (oppP.pathIndex !== -1) {
              const oppCell = this.paths[oppP.color][oppP.pathIndex];
              if (oppCell.r === targetCell.r && oppCell.c === targetCell.c) {
                score += 1500; // Major reward
              }
            }
          });
        });
      }

      // 2. Unlocking inner path (Early game priority)
      if (!player.hasKilled) {
        // Reward spawns and aggressive hunting
        if (currentIdx === -1) score += 200;
        else score += (100 - currentIdx); // Value moving forward to chase captures
      } else {
        // 3. Goal progression
        score += nextIdx * 20; // Progressing pawn towards home
        
        // Check if landing directly inside home center
        if (nextIdx === this.paths[pawn.color].length - 1) {
          score += 1000; // Immediate win progression
        }
      }

      // 4. Safe house attraction
      if (isTargetSafe) {
        score += 250;
      }

      // 5. Danger avoidance (check if moving avoids an opponent who is behind us)
      this.players.forEach((opp, oppIdx) => {
        if (oppIdx === this.currentPlayerIndex) return;
        opp.pawns.forEach(oppP => {
          if (oppP.pathIndex !== -1 && currentIdx !== -1) {
            const oppCell = this.paths[oppP.color][oppP.pathIndex];
            const currentCell = this.paths[pawn.color][currentIdx];
            // If opponent can hit us at current pos next turn, run away!
            const dist = this.getManhattanDistance(oppCell, currentCell);
            if (dist < 8) {
              score += 180;
            }
          }
        });
      });

      if (score > maxScore) {
        maxScore = score;
        bestMove = pawn;
      }
    });

    if (bestMove) {
      setTimeout(() => {
        this.executeMove(bestMove, value);
      }, 800);
    } else {
      // Fallback
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
        } else if (isSafe) {
          cell.classList.add('safe');
          
          // Color indicator for specific player safe start squares
          if (r === this.gridSize && c === centerIdx) cell.classList.add('player-home-red');
          else if (r === centerIdx && c === 1) cell.classList.add('player-home-green');
          else if (r === 1 && c === centerIdx) cell.classList.add('player-home-yellow');
          else if (r === centerIdx && c === this.gridSize) cell.classList.add('player-home-blue');
        }

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

    pEl.onclick = (e) => {
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
      if (playerIdx === -1) return;

      const player = this.players[playerIdx];
      player.pawns.forEach(pawn => {
        if (pawn.pathIndex === -1) {
          const pEl = this.createPawnElement(pawn, playerIdx, false);
          yardEl.appendChild(pEl);
        }
      });
    });
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

window.restartGame = function() {
  synth.playToggle();
  document.getElementById('victory-overlay').classList.add('hidden');
  document.getElementById('game-screen').classList.add('hidden');
  document.getElementById('setup-screen').classList.remove('hidden');
};

window.startGame = function() {
  // Capture inputs
  const size = parseInt(document.getElementById('select-size').getAttribute('data-value') || '5');
  
  const rules = {
    gattiEnabled: document.getElementById('rule-gatti').classList.contains('active'),
    spawnRequired: document.getElementById('rule-spawn').classList.contains('active')
  };

  const playersList = [];
  const colors = ['red', 'green', 'yellow', 'blue'];
  
  colors.forEach(col => {
    const input = document.getElementById(`name-${col}`);
    const botSelect = document.getElementById(`type-${col}`);
    if (input) {
      playersList.push({
        name: input.value.trim() || `${col.toUpperCase()} Player`,
        color: col,
        isBot: botSelect.value === 'bot'
      });
    }
  });

  // Init Engine
  GameState.initGame(playersList, size, rules);
  
  // Transitions
  document.getElementById('setup-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  
  // Render
  GameState.renderBoard();
};

// DOM init scripts for toggle buttons
document.addEventListener('DOMContentLoaded', () => {
  // Rule selectors
  const toggles = document.querySelectorAll('.btn-toggle');
  toggles.forEach(btn => {
    btn.addEventListener('click', () => {
      synth.playToggle();
      
      // If it's board size toggle, handle exclusive active
      if (btn.parentNode.id === 'toggle-size-container') {
        btn.parentNode.querySelectorAll('.btn-toggle').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('select-size').setAttribute('data-value', btn.getAttribute('data-val'));
      } else {
        btn.classList.toggle('active');
      }
    });
  });
});
