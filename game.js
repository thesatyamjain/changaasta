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
    this.volume = 1.0;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } else if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  startRattle() {
    if (this.muted || this.volume <= 0) return;
    this.init();
    if (this.rattleInterval) return;
    
    const playClick = () => {
      if (this.muted || !this.ctx || this.volume <= 0) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180 + Math.random() * 320, now);
      
      gain.gain.setValueAtTime((0.05 + Math.random() * 0.04) * this.volume, now);
      gain.gain.exponentialRampToValueAtTime(0.005 * this.volume, now + 0.05);
      
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
    if (this.muted || this.volume <= 0) return;
    this.init();
    
    // Simulate rattling cowrie shells
    const now = this.ctx.currentTime;
    for (let i = 0; i < 5; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(100 + Math.random() * 400, now + i * 0.05);
      
      gain.gain.setValueAtTime(0.15 * this.volume, now + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01 * this.volume, now + i * 0.05 + 0.1);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.1);
    }
  }

  playMove() {
    if (this.muted || this.volume <= 0) return;
    this.init();
    
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(600, now + 0.15);
    
    gain.gain.setValueAtTime(0.1 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01 * this.volume, now + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.15);
  }

  playCapture() {
    if (this.muted || this.volume <= 0) return;
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
    
    gain.gain.setValueAtTime(0.3 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01 * this.volume, now + 0.3);
    
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.3);
    osc2.stop(now + 0.3);
  }

  playWin() {
    if (this.muted || this.volume <= 0) return;
    this.init();
    
    const now = this.ctx.currentTime;
    const notes = [261.63, 329.63, 392.00, 523.25]; // C E G C arpeggio
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);
      
      gain.gain.setValueAtTime(0.15 * this.volume, now + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01 * this.volume, now + idx * 0.15 + 0.4);
      
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
    if (this.muted || this.volume <= 0) return;
    this.init();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    gain.gain.setValueAtTime(0.05 * this.volume, now);
    gain.gain.exponentialRampToValueAtTime(0.01 * this.volume, now + 0.08);
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
    const gap = isMobile ? 24 : 60; // Spacing between columns
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
  // Track C fix: accepts optional activeColors so 3-player games don't treat Blue start as safe
  isSafeCell(gridSize, r, c, activeColors = null) {
    const center = Math.ceil(gridSize / 2);
    if (r === center && c === center) return true; // Center Home
    
    // Starting bases — only mark as safe if the color is active in this game
    const colors = activeColors || ['red', 'green', 'yellow', 'blue'];
    if (colors.includes('red') && r === gridSize && c === center) return true;
    if (colors.includes('green') && r === center && c === 1) return true;
    if (colors.includes('yellow') && r === 1 && c === center) return true;
    if (colors.includes('blue') && r === center && c === gridSize) return true;
    
    // Additional safes for 7x7 board (Corners of Ring 1)
    if (gridSize === 7) {
      if ((r === 2 && c === 2) || (r === 2 && c === 6) || (r === 6 && c === 2) || (r === 6 && c === 6)) {
        return true;
      }
    }
    
    return false;
  },

  // Returns array of active player colors for isSafeCell calls
  getActiveColors() {
    if (!window.GameState || !GameState.players) return null;
    return GameState.players.map(p => p.color);
  }
};

function adjustBoardScale() {
  // Logic removed. Board scaling is now entirely handled by CSS (100vw) on mobile.
}

window.addEventListener('resize', adjustBoardScale);

const SAVE_KEY = 'changaAstaSaveV2';
const SAVE_KEY_LEGACY = 'changaAstaSaveV1';

function showToast(message, type = '') {
  const host = document.getElementById('toast-host');
  if (!host) return;

  const toast = document.createElement('div');
  toast.className = `game-toast ${type}`.trim();
  toast.textContent = message;
  host.appendChild(toast);

  setTimeout(() => toast.remove(), 2700);
}

function formatDuration(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
}

function getSavedGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn('Unable to read saved game', error);
    return null;
  }
}

function updateResumePanel() {
  const panel = document.getElementById('resume-panel');
  if (!panel) return;
  panel.classList.toggle('hidden', !getSavedGame());
}

const SETTINGS_KEY = 'changaAstaSettingsV1';

function saveSettings() {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(GameState.settings));
  } catch (error) {
    console.warn('Unable to save settings', error);
  }
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      GameState.settings = { ...GameState.settings, ...JSON.parse(raw) };
    }
  } catch (error) {
    console.warn('Unable to load settings', error);
  }
}

// Main Game State Object
const GameState = {
  gridSize: 5,
  players: [],
  currentPlayerIndex: 0,
  rollQueue: [],
  displayRolls: [],
  selectedRollIndex: null,
  consecutiveHighRolls: 0,
  gamePhase: 'setup', // 'setup', 'rolling', 'moving', 'ended'
  winner: null,
  logs: [],
  pendingGattiPawn: null,
  pendingGattiValue: null,
  botDifficulty: 'normal',
  undoSnapshot: null,   // Track C: one-step undo
  stats: {
    turns: 1,
    rolls: 0,
    moves: 0,
    captures: 0,
    startedAt: null
  },
  
  // Custom toggles
  rules: {
    gattiEnabled: true,
    spawnRequired: false
  },

  settings: {
    theme: 'dark',
    volume: 100,
    autoRoll: false,
    botSpeed: 'normal',
    colorBlind: false
  },

  autoRollTimer: null,

  getBotDelay(type) {
    const speed = this.settings.botSpeed || 'normal';
    let baseDelay = 1200;
    if (type === 'move') baseDelay = 1000;
    else if (type === 'submove') baseDelay = 300;
    
    if (speed === 'slow') return baseDelay * 1.8;
    if (speed === 'normal') return baseDelay;
    if (speed === 'fast') return baseDelay * 0.45;
    if (speed === 'instant') return 50;
    return baseDelay;
  },

  triggerAutoRoll() {
    if (this.autoRollTimer) {
      clearTimeout(this.autoRollTimer);
    }
    this.autoRollTimer = setTimeout(() => {
      if (this.gamePhase === 'rolling' && !this.getCurrentPlayer().isBot && !this.isRollingAnim && this.settings.autoRoll) {
        this.rollCowries();
      }
    }, 1000);
  },

  // Paths database
  paths: {},

  // Track C: Save undo snapshot before a move (human only)
  saveUndoSnapshot() {
    this.undoSnapshot = {
      players: JSON.parse(JSON.stringify(this.players)),
      currentPlayerIndex: this.currentPlayerIndex,
      rollQueue: [...this.rollQueue],
      displayRolls: JSON.parse(JSON.stringify(this.displayRolls)),
      selectedRollIndex: this.selectedRollIndex,
      consecutiveHighRolls: this.consecutiveHighRolls,
      gamePhase: this.gamePhase,
      stats: { ...this.stats }
    };
    const undoBtn = document.getElementById('btn-undo');
    if (undoBtn) undoBtn.disabled = false;
  },

  applyUndo() {
    if (!this.undoSnapshot) return;
    const snap = this.undoSnapshot;
    this.players = snap.players;
    this.currentPlayerIndex = snap.currentPlayerIndex;
    this.rollQueue = snap.rollQueue;
    this.displayRolls = snap.displayRolls;
    this.selectedRollIndex = snap.selectedRollIndex;
    this.consecutiveHighRolls = snap.consecutiveHighRolls;
    this.gamePhase = snap.gamePhase;
    this.stats = snap.stats;
    this.undoSnapshot = null;
    this.isRollingAnim = false;
    const undoBtn = document.getElementById('btn-undo');
    if (undoBtn) undoBtn.disabled = true;
    this.renderBoard();
    this.updateRollQueueUI();
    this.saveGame();
    showToast('Move undone', 'good');
  },

  initGame(playersList, size, rules, botDifficulty = 'normal') {
    this.gridSize = size;
    this.rules = { ...rules };
    this.botDifficulty = botDifficulty;
    this.winner = null;
    this.logs = [];
    this.currentPlayerIndex = 0;
    this.rollQueue = [];
    this.displayRolls = [];
    this.selectedRollIndex = null;
    this.consecutiveHighRolls = 0;
    this.undoSnapshot = null;
    this.isRollingAnim = false;
    this.stats = {
      turns: 1,
      rolls: 0,
      moves: 0,
      captures: 0,
      startedAt: Date.now()
    };
    
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
        botDifficulty: p.botDifficulty || botDifficulty,
        hasKilled: false, // Must be true to enter inner rings
        pawns: pawns
      };
    });

    this.gamePhase = 'rolling';
    this.addLog('System', `Khel ${size}x${size} board par shuru ho gaya hai!`);
    this.addLog('System', `Ab ${this.getCurrentPlayer().name} ki baari hai.`);
    this.saveGame();
    
    // If the first player is a bot, trigger their roll
    if (this.getCurrentPlayer().isBot) {
      setTimeout(() => {
        if (this.gamePhase === 'rolling') this.rollCowries();
      }, this.getBotDelay('roll'));
    } else if (this.settings.autoRoll) {
      this.triggerAutoRoll();
    }
    
    // Set initial shell visibility based on board size
    const cowrieCount = size === 5 ? 4 : 6;
    const shells = document.querySelectorAll('.cowrie-shell');
    const isMobile = window.innerWidth <= 850;
    const gap = isMobile ? 24 : 44; // spacing between shells
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

      const senderEl = document.createElement('strong');
      senderEl.textContent = `${sender}:`;
      item.appendChild(senderEl);
      item.appendChild(document.createTextNode(` ${message}`));

      logBox.appendChild(item);
      logBox.scrollTop = logBox.scrollHeight;
    }
  },

  saveGame() {
    if (this.gamePhase === 'setup') return;

    const payload = {
      version: 1,
      savedAt: Date.now(),
      gridSize: this.gridSize,
      players: this.players,
      currentPlayerIndex: this.currentPlayerIndex,
      rollQueue: this.rollQueue,
      displayRolls: this.displayRolls,
      selectedRollIndex: this.selectedRollIndex,
      consecutiveHighRolls: this.consecutiveHighRolls,
      gamePhase: this.gamePhase,
      rules: this.rules,
      botDifficulty: this.botDifficulty,
      stats: this.stats,
      logs: this.logs.slice(-80)
    };

    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
      updateResumePanel();
    } catch (error) {
      console.warn('Unable to save game', error);
    }
  },

  restoreGame(payload) {
    if (!payload || payload.version !== 1 || !Array.isArray(payload.players)) return false;

    this.gridSize = payload.gridSize || 5;
    this.players = payload.players;
    this.currentPlayerIndex = payload.currentPlayerIndex || 0;
    this.rollQueue = Array.isArray(payload.rollQueue) ? payload.rollQueue : [];
    this.displayRolls = Array.isArray(payload.displayRolls) ? payload.displayRolls : this.rollQueue.map(v => ({ value: v, used: false }));
    this.selectedRollIndex = payload.selectedRollIndex ?? null;
    this.consecutiveHighRolls = payload.consecutiveHighRolls || 0;
    this.gamePhase = payload.gamePhase === 'gameover' ? 'setup' : (payload.gamePhase || 'rolling');
    this.rules = payload.rules || { gattiEnabled: true, spawnRequired: false };
    this.botDifficulty = payload.botDifficulty || 'normal';
    this.stats = payload.stats || { turns: 1, rolls: 0, moves: 0, captures: 0, startedAt: Date.now() };
    this.logs = [];
    this.winner = null;
    this.isRollingAnim = false;

    const colors = ['red', 'green', 'yellow', 'blue'];
    this.paths = {};
    colors.forEach(col => {
      this.paths[col] = GameEngine.generatePath(this.gridSize, col);
    });

    document.getElementById('setup-screen').classList.add('hidden');
    document.getElementById('victory-overlay').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');

    const logBox = document.getElementById('log-box');
    if (logBox) logBox.innerHTML = '';
    (payload.logs || []).forEach(entry => this.addLog(entry.sender, entry.message));

    this.renderBoard();
    this.updateRollQueueUI();
    showToast('Saved game resumed', 'good');

    if (this.getCurrentPlayer()?.isBot) {
      setTimeout(() => {
        if (this.gamePhase === 'rolling') this.rollCowries();
        else if (this.gamePhase === 'moving') this.makeBotMove();
      }, 900);
    }

    return true;
  },

  // Calculate cowrie rolls
  rollCowries(throwStrength = null) {
    if (this.gamePhase !== 'rolling' || this.isRollingAnim) return;

    if (this.autoRollTimer) {
      clearTimeout(this.autoRollTimer);
      this.autoRollTimer = null;
    }
    
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
      this.stats.rolls++;
      showToast(`${player.name}: ${rollValue}`, extraRoll ? 'warn' : '');

      if (extraRoll) {
        this.consecutiveHighRolls++;
        if (this.consecutiveHighRolls >= 3) {
          // Three strikes penalty
          this.addLog('System', `Lagatar 3 badi sankhya aayi! Baari khatam.`);
          showToast('3 high rolls: turn skipped', 'warn');
          this.saveGame();
          this.endTurn(true);
          return;
        }
        
        this.rollQueue.push(rollValue);
        this.displayRolls.push({ value: rollValue, used: false });
        this.updateRollQueueUI();
        this.saveGame();

        // Let bot trigger next roll if applicable
        if (player.isBot) {
          setTimeout(() => {
            if (this.gamePhase !== 'gameover') this.rollCowries();
          }, this.getBotDelay('roll'));
        } else if (this.settings.autoRoll) {
          this.triggerAutoRoll();
        }
      } else {
        this.rollQueue.push(rollValue);
        this.displayRolls.push({ value: rollValue, used: false });
        this.consecutiveHighRolls = 0;
        this.gamePhase = 'moving';
        this.selectedRollIndex = 0; // Default to first roll selection
        this.updateRollQueueUI();
        
        // Auto check if any valid moves exist
        if (!this.hasAnyValidMoves()) {
          this.addLog('System', `Koi chalne layak goti nahi hai.`);
          showToast('No valid move', 'warn');
          this.saveGame();
          setTimeout(() => {
            // Guard: don't call endTurn if game ended while timer was pending
            if (this.gamePhase !== 'gameover') this.endTurn();
          }, this.getBotDelay('roll'));
        } else if (player.isBot) {
          this.saveGame();
          setTimeout(() => {
            if (this.gamePhase === 'moving') this.makeBotMove();
          }, this.getBotDelay('roll'));
        } else {
          this.saveGame();
        }
      }
    }, 600);
  },

  updateRollQueueUI() {
    const queuePanel = document.getElementById('roll-queue');

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

    if (queuePanel) {
      queuePanel.innerHTML = '';
      if (this.displayRolls.length === 0) {
        queuePanel.classList.add('hidden');
      } else {
        queuePanel.classList.remove('hidden');
      }
      
      let rqIdx = 0;
      this.displayRolls.forEach((dRoll) => {
        const badge = document.createElement('div');
        let currentRQIdx = -1;
        if (!dRoll.used) {
          currentRQIdx = rqIdx++;
        }
        badge.className = `queue-badge ${!dRoll.used && currentRQIdx === this.selectedRollIndex ? 'selected' : ''} ${dRoll.used ? 'used' : ''}`;
        badge.innerText = dRoll.value;
        if (!dRoll.used) {
          badge.onclick = () => {
            if (this.gamePhase === 'moving' && !this.getCurrentPlayer().isBot) {
              synth.playToggle();
              this.selectedRollIndex = currentRQIdx;
              this.updateRollQueueUI();
              this.highlightValidPawns();
            }
          };
        }
        queuePanel.appendChild(badge);
      });
    }

    this.highlightValidPawns();

    // Update the Score placeholders
    let slotRQIdx = 0;
    for (let i = 0; i < 3; i++) {
      const slot = document.getElementById(`score-slot-${i}`);
      if (slot) {
        const dRoll = this.displayRolls[i];
        if (dRoll !== undefined) {
          let currentRQIdx = -1;
          if (!dRoll.used) {
            currentRQIdx = slotRQIdx++;
          }
          slot.innerText = dRoll.value;
          slot.classList.add('filled');
          if (dRoll.used) {
            slot.classList.add('used');
            slot.classList.remove('selected');
            slot.onclick = null;
          } else {
            slot.classList.remove('used');
            if (currentRQIdx === this.selectedRollIndex) {
              slot.classList.add('selected');
            } else {
              slot.classList.remove('selected');
            }
            slot.onclick = () => {
              if (this.gamePhase === 'moving' && !this.getCurrentPlayer().isBot) {
                synth.playToggle();
                this.selectedRollIndex = currentRQIdx;
                this.updateRollQueueUI();
                this.highlightValidPawns();
              }
            };
          }
        } else {
          slot.innerText = '';
          slot.classList.remove('filled');
          slot.classList.remove('selected');
          slot.classList.remove('used');
          slot.onclick = null;
        }
      }
    }
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

  isValidPawnMove(pawn, value, isGroupMove = null) {
    // Yard to board spawn check
    if (pawn.pathIndex === -1) {
      if (this.rules.spawnRequired) {
        // Must roll 4 or 8 (on 5x5) or 6 or 12 (on 7x7) to spawn
        const isSpawnRoll = this.gridSize === 5 ? (value === 4 || value === 8) : (value === 6 || value === 12);
        return isSpawnRoll;
      }
      return true; // Can move directly out on any roll
    }

    if (isGroupMove === null) {
      if (pawn.isGatti) {
        const canMoveAsSingle = this.isValidPawnMove(pawn, value, false);
        const canMoveAsGroup = (value % 2 === 0) && this.isValidPawnMove(pawn, value, true);
        return canMoveAsSingle || canMoveAsGroup;
      } else {
        return this.isValidPawnMove(pawn, value, false);
      }
    }

    let steps = value;
    if (isGroupMove) {
      if (value % 2 !== 0) return false;
      steps = value / 2;
    }

    const player = this.getCurrentPlayer();
    const path = this.paths[pawn.color];
    const firstInnerIndex = this.gridSize === 5 ? 16 : 24;
    let nextIndex = pawn.pathIndex + steps;

    // Apply outer-ring wrap BEFORE the overshoot check, so it matches executeMove behaviour
    if (!player.hasKilled && nextIndex >= firstInnerIndex) {
      nextIndex = nextIndex % firstInnerIndex;
    }

    // Past center goal check — block overshooting after wrap is applied
    if (nextIndex >= path.length) return false;

    // Gatti pairing blockade checks
    if (this.rules.gattiEnabled) {
      // Check intermediate path blocks
      for (let step = 1; step <= steps; step++) {
        let idx = pawn.pathIndex + step;

        // Wrap around logic if haven't killed
        if (!player.hasKilled && idx >= firstInnerIndex) {
          idx = idx % firstInnerIndex;
        }

        // Bounds guard: intermediate step must not exceed path array
        if (idx >= path.length) break;

        const cell = path[idx];
        const isLast = step === steps;

        // A Gatti on a safe cell does NOT create a blockade (safe cells are neutral ground)
        if (GameEngine.isSafeCell(this.gridSize, cell.r, cell.c)) continue;

        // Find if there is an opponent Gatti on this cell
        const gattiPawn = this.getOpponentGattiOnCell(cell.r, cell.c, pawn.color);
        if (gattiPawn) {
          // Gatti acts as blockade - cannot land on it or pass it unless landing exactly to cut it with another Gatti
          if (isLast && isGroupMove) {
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

  hasAnyGattiOnCell(r, c) {
    for (let p of this.players) {
      const gatti = p.pawns.find(pawn => pawn.isGatti && pawn.pathIndex !== -1 && this.paths[pawn.color][pawn.pathIndex].r === r && this.paths[pawn.color][pawn.pathIndex].c === c);
      if (gatti) return true;
    }
    return false;
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

    if (this.rules.gattiEnabled && pawn.isGatti && pawn.pathIndex !== -1) {
      const canMoveSingle = this.isValidPawnMove(pawn, value, false);
      const canMoveGroup = (value % 2 === 0) && this.isValidPawnMove(pawn, value, true);

      if (canMoveSingle && canMoveGroup) {
        this.pendingGattiPawn = pawn;
        this.pendingGattiValue = value;
        document.getElementById('gatti-group-steps').innerText = value / 2;
        document.getElementById('gatti-single-steps').innerText = value;
        // Track C: Show destination cell preview in Gatti overlay
        const groupSteps = value / 2;
        const singleSteps = value;
        const path = this.paths[pawn.color];
        const firstInnerIdx = this.gridSize === 5 ? 16 : 24;
        const player = this.getCurrentPlayer();
        const calcDest = (steps) => {
          let idx = pawn.pathIndex + steps;
          if (!player.hasKilled && idx >= firstInnerIdx) idx = idx % firstInnerIdx;
          return idx < path.length ? `(${path[idx].r},${path[idx].c})` : '(Home)';
        };
        const groupDestEl = document.getElementById('gatti-group-dest');
        const singleDestEl = document.getElementById('gatti-single-dest');
        if (groupDestEl) groupDestEl.textContent = calcDest(groupSteps);
        if (singleDestEl) singleDestEl.textContent = calcDest(singleSteps);
        document.getElementById('gatti-choice-overlay').classList.remove('hidden');
        if (window.synth && typeof window.synth.playToggle === 'function') synth.playToggle();
        return;
      } else if (canMoveGroup) {
        this.executeMove(pawn, value, true);
        return;
      } else if (canMoveSingle) {
        this.executeMove(pawn, value, false);
        return;
      }
    }

    // Execute move immediately upon pawn selection
    this.executeMove(pawn, value, false);
  },

  executeMove(pawn, value, isGroupMove = false) {
    synth.playMove();
    // Track C: save undo snapshot before executing move (human players only)
    if (!this.getCurrentPlayer().isBot) {
      this.saveUndoSnapshot();
    }
    const player = this.getCurrentPlayer();
    
    // De-register click handlers
    document.querySelectorAll('.cell').forEach(c => {
      c.classList.remove('valid-target');
      c.onclick = null;
    });

    let originalPathIndex = pawn.pathIndex;
    let steps = isGroupMove ? (value / 2) : value;
    let nextIndex = pawn.pathIndex === -1 ? 0 : pawn.pathIndex + steps;
    const firstInnerIndex = this.gridSize === 5 ? 16 : 24;
    
    if (pawn.pathIndex !== -1 && !player.hasKilled && nextIndex >= firstInnerIndex) {
      nextIndex = nextIndex % firstInnerIndex;
    }
    // Store old DOM rects for WAAPI animation
    this.animatingPawns = [];
    let partner = null;
    if (pawn.isGatti && originalPathIndex !== -1 && isGroupMove) {
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

    if (pawn.isGatti && originalPathIndex !== -1) {
      const partner = player.pawns.find(other =>
        other.id !== pawn.id &&
        other.isGatti &&
        other.pathIndex === originalPathIndex
      );
      if (partner) {
        if (isGroupMove) {
          partner.pathIndex = nextIndex;
        } else {
          pawn.isGatti = false;
          partner.isGatti = false;
          this.addLog(player.name, `Gatti toot gayi! Ek goti alag ho gayi.`);
        }
      }
    }

    const targetCell = this.paths[pawn.color][nextIndex];

    // Logging
    if (isGroupMove) {
      this.addLog(player.name, `Gatti ko (${targetCell.r}, ${targetCell.c}) par ${steps} kadam chalaya`);
    } else {
      this.addLog(player.name, `Goti ${pawn.id + 1} ko (${targetCell.r}, ${targetCell.c}) par ${steps} kadam chalaya`);
    }
    this.stats.moves++;

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
        // Track B: mark for burst animation — applied after render
        this._gattiNewPawnIds = [pawn.id, partner.id];
      }
    }

    // Check Capturing / Collision
    const isSafe = GameEngine.isSafeCell(this.gridSize, targetCell.r, targetCell.c);
    let extraRollGained = false;

    if (!isSafe) {
      this.players.forEach((opp, oppIdx) => {
        if (oppIdx === this.currentPlayerIndex) return;

        let capturedThisOpp = false;
        for (const oppPawn of opp.pawns) {
          if (capturedThisOpp) break;
          if (oppPawn.pathIndex === -1) continue;

          const oppCell = this.paths[oppPawn.color][oppPawn.pathIndex];
          if (oppCell.r === targetCell.r && oppCell.c === targetCell.c) {

            // Rules check:
            if (this.rules.gattiEnabled) {
              if (isGroupMove && !oppPawn.isGatti) {
                continue; // Gatti cannot capture single pawn
              }
              if (!isGroupMove && oppPawn.isGatti) {
                continue; // Single pawn cannot capture Gatti
              }
              if (!isGroupMove && !oppPawn.isGatti && this.hasAnyGattiOnCell(targetCell.r, targetCell.c)) {
                continue; // Single pawn cannot capture single pawn if there is a Gatti on the cell (shielded)
              }
            }

            // Capture event!
            synth.playCapture();
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

            const wasFirstKill = !player.hasKilled;
            player.hasKilled = true;
            extraRollGained = true;
            capturedThisOpp = true;
            this.stats.captures++;

            // Track C: flash inner-ring entry indicator on first kill
            if (wasFirstKill) {
              this.flashInnerRingEntry(player);
            }

            this.addLog(player.name, `${opp.name} ki goti kaat di! Andar jane ka rasta khul gaya.`);
            showToast(`${player.name} captured ${opp.name}`, 'good');

            this.triggerCaptureEffects(targetCell.r, targetCell.c, opp.color);
          }
        }
      });
    }

    // Remove this move value from queue
    let unusedFound = 0;
    for (let i = 0; i < this.displayRolls.length; i++) {
      if (!this.displayRolls[i].used) {
        if (unusedFound === this.selectedRollIndex) {
          this.displayRolls[i].used = true;
          break;
        }
        unusedFound++;
      }
    }
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
      showToast('Extra roll earned', 'good');

      this.renderBoard();
      this.triggerMoveAnimations();
      this.saveGame();

      if (player.isBot) {
        setTimeout(() => {
          if (this.gamePhase === 'rolling') this.rollCowries();
        }, this.getBotDelay('roll'));
      } else if (this.settings.autoRoll) {
        this.triggerAutoRoll();
      }
      return;
    }

    this.renderBoard();
    this.triggerMoveAnimations();
    // Track B: fire Gatti burst after render
    if (this._gattiNewPawnIds) {
      const ids = this._gattiNewPawnIds;
      this._gattiNewPawnIds = null;
      requestAnimationFrame(() => {
        ids.forEach(pid => {
          const el = document.querySelector(`.pawn[data-player-index="${this.currentPlayerIndex}"][data-pawn-id="${pid}"]`);
          if (el) {
            el.classList.add('gatti-new');
            setTimeout(() => el.classList.remove('gatti-new'), 800);
          }
        });
      });
    }

    // Check next phase
    if (this.rollQueue.length > 0) {
      this.updateRollQueueUI();
      if (!this.hasAnyValidMoves()) {
        this.addLog('System', `Ab koi chalne layak goti nahi hai.`);
        showToast('No valid move', 'warn');
        this.saveGame();
        setTimeout(() => {
          if (this.gamePhase === 'moving') this.endTurn();
        }, this.getBotDelay('roll'));
      } else if (player.isBot) {
        this.saveGame();
        setTimeout(() => {
          if (this.gamePhase === 'moving') this.makeBotMove();
        }, this.getBotDelay('move'));
      } else {
        this.saveGame();
      }
    } else {
      this.saveGame();
      this.endTurn();
    }
  },

  endTurn(force = false) {
    // Guard: never advance turn if the game is already over or setup
    if (!force && this.gamePhase !== 'moving') return;
    if (this.gamePhase === 'gameover' || this.gamePhase === 'setup') return;

    this.rollQueue = [];
    this.displayRolls = [];
    this.selectedRollIndex = null;
    this.consecutiveHighRolls = 0;
    this.undoSnapshot = null; // Clear undo on turn end
    const undoBtn = document.getElementById('btn-undo');
    if (undoBtn) undoBtn.disabled = true;
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    this.gamePhase = 'rolling';
    this.stats.turns++;

    this.renderBoard();
    this.updateRollQueueUI();

    // Track B: turn-change slide animation
    const turnIndicator = document.querySelector('.player-turn-indicator');
    if (turnIndicator) {
      turnIndicator.classList.remove('turn-change');
      void turnIndicator.offsetWidth; // force reflow
      turnIndicator.classList.add('turn-change');
    }

    const nextPlayer = this.getCurrentPlayer();
    this.addLog('System', `Ab ${nextPlayer.name} ki baari hai.`);
    this.saveGame();

    // Handle bot action
    if (nextPlayer.isBot) {
      setTimeout(() => {
        if (this.gamePhase === 'rolling') this.rollCowries();
      }, this.getBotDelay('roll'));
    } else if (this.settings.autoRoll) {
      this.triggerAutoRoll();
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
    localStorage.removeItem(SAVE_KEY);
    updateResumePanel();
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
      const statsBox = document.getElementById('victory-stats');
      if (statsBox) {
        const elapsed = this.stats.startedAt ? Date.now() - this.stats.startedAt : 0;
        const stats = [
          ['Turns', this.stats.turns],
          ['Rolls', this.stats.rolls],
          ['Captures', this.stats.captures],
          ['Moves', this.stats.moves],
          ['Time', formatDuration(elapsed)],
          ['Board', `${this.gridSize}x${this.gridSize}`]
        ];
        statsBox.innerHTML = '';
        stats.forEach(([label, value]) => {
          const item = document.createElement('div');
          item.className = 'victory-stat';
          const valueEl = document.createElement('strong');
          valueEl.textContent = value;
          const labelEl = document.createElement('span');
          labelEl.textContent = label;
          item.append(valueEl, labelEl);
          statsBox.appendChild(item);
        });
      }
    }, 1000);
  },

  // Track C: Flash the inner-ring entry cell for the player who just unlocked inner access
  flashInnerRingEntry(player) {
    const firstInnerIndex = this.gridSize === 5 ? 16 : 24;
    const path = this.paths[player.color];
    if (!path || path.length <= firstInnerIndex) return;
    const entryCell = path[firstInnerIndex - 1];
    const cellEl = document.querySelector(`.cell[data-r="${entryCell.r}"][data-c="${entryCell.c}"]`);
    if (cellEl) {
      cellEl.classList.add('inner-ring-flash');
      showToast(`${player.name}: Inner ring unlocked! 🎯`, 'good');
      setTimeout(() => cellEl.classList.remove('inner-ring-flash'), 2500);
    }
  },

  // Apply FLIP animations to pawns that just moved
  triggerMoveAnimations() {
    if (!this.animatingPawns || this.animatingPawns.length === 0) return;
    const playerColor = this.getCurrentPlayer()?.color;
    
    requestAnimationFrame(() => {
      this.animatingPawns.forEach(anim => {
        const newEl = document.querySelector(`.pawn[data-player-index="${anim.playerIdx}"][data-pawn-id="${anim.pawnId}"]`);
        if (newEl && anim.oldRect) {
          const newRect = newEl.getBoundingClientRect();
          const dx = anim.oldRect.left - newRect.left;
          const dy = anim.oldRect.top - newRect.top;
          
          // Track B: spawn trail dot at old position
          if ((dx !== 0 || dy !== 0) && playerColor) {
            this.spawnMoveTrail(anim.oldRect, playerColor);
          }
          
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

  // Track B: Spawn move trail dot from old pawn position
  spawnMoveTrail(oldRect, color) {
    const boardEl = document.getElementById('board');
    if (!boardEl) return;
    const boardRect = boardEl.getBoundingClientRect();
    const dot = document.createElement('div');
    dot.className = 'move-trail';
    dot.style.background = `var(--color-${color})`;
    dot.style.boxShadow = `0 0 8px var(--color-${color})`;
    dot.style.left = `${oldRect.left - boardRect.left + oldRect.width / 2 - 5}px`;
    dot.style.top = `${oldRect.top - boardRect.top + oldRect.height / 2 - 5}px`;
    boardEl.style.position = 'relative';
    boardEl.appendChild(dot);
    setTimeout(() => dot.remove(), 600);
  },

  // Trigger capture ripple — Track B: upgraded to CSS-native ring
  triggerCaptureEffects(r, c, capturedColor) {
    const cellEl = document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);
    if (!cellEl) return;
    // Track B: CSS-native capture ring burst
    const ring = document.createElement('div');
    ring.className = 'capture-ring';
    ring.style.color = `var(--color-${capturedColor})`;
    cellEl.style.position = 'relative';
    cellEl.style.overflow = 'visible';
    cellEl.appendChild(ring);
    setTimeout(() => ring.remove(), 550);
    // Legacy particle shower (kept for richness)
    for (let i = 0; i < 8; i++) {
      const particle = document.createElement('div');
      particle.style.cssText = `position:absolute;width:5px;height:5px;border-radius:50%;background:var(--color-${capturedColor});pointer-events:none;z-index:50;`;
      const angle = (i / 8) * Math.PI * 2;
      const velocity = 3 + Math.random() * 3;
      let x = 0, y = 0, frame = 0;
      cellEl.appendChild(particle);
      const anim = () => {
        frame++;
        x += Math.cos(angle) * velocity;
        y += Math.sin(angle) * velocity;
        particle.style.transform = `translate(${x}px,${y}px)`;
        particle.style.opacity = (1 - frame / 25).toString();
        if (frame < 25) requestAnimationFrame(anim);
        else particle.remove();
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

    const hasAnyGattiOnCellSim = (simState, r, c) => {
      const myGatti = simState.pawns.find(p => p.isGatti && p.pathIndex !== -1 && this.paths[player.color][p.pathIndex].r === r && this.paths[player.color][p.pathIndex].c === c);
      if (myGatti) return true;
      for (let opp of simState.opponents) {
        const oppPath = this.paths[opp.color];
        const gatti = opp.pawns.find(oppP => 
          oppP.isGatti && oppP.pathIndex !== -1 &&
          oppPath[oppP.pathIndex].r === r && oppPath[oppP.pathIndex].c === c
        );
        if (gatti) return true;
      }
      return false;
    };

    // Simulated validity check
    const isValidPawnMoveSim = (simState, pawn, value, isGroupMove = null) => {
      if (pawn.pathIndex === -1) {
        if (this.rules.spawnRequired) {
          const isSpawnRoll = this.gridSize === 5 ? (value === 4 || value === 8) : (value === 6 || value === 12);
          return isSpawnRoll;
        }
        return true;
      }

      if (isGroupMove === null) {
        if (pawn.isGatti) {
          const canMoveAsSingle = isValidPawnMoveSim(simState, pawn, value, false);
          const canMoveAsGroup = (value % 2 === 0) && isValidPawnMoveSim(simState, pawn, value, true);
          return canMoveAsSingle || canMoveAsGroup;
        } else {
          return isValidPawnMoveSim(simState, pawn, value, false);
        }
      }

      let steps = value;
      if (isGroupMove) {
        if (value % 2 !== 0) return false;
        steps = value / 2;
      }

      let nextIndex = pawn.pathIndex + steps;

      if (!simState.hasKilled && nextIndex >= firstInnerIndex) {
        nextIndex = nextIndex % firstInnerIndex;
      }

      const path = this.paths[player.color];

      if (nextIndex >= path.length) return false;

      if (this.rules.gattiEnabled) {
        for (let step = 1; step <= steps; step++) {
          let idx = pawn.pathIndex + step;
          if (!simState.hasKilled && idx >= firstInnerIndex) {
            idx = idx % firstInnerIndex;
          }
          if (idx >= path.length) break;

          const cell = path[idx];
          const isLast = step === steps;

          if (GameEngine.isSafeCell(this.gridSize, cell.r, cell.c)) continue;

          const oppGatti = getOpponentGattiOnCellSim(simState, cell.r, cell.c);
          if (oppGatti) {
            if (isLast && isGroupMove) return true; // Can land on Gatti with Gatti
            return false; // Blocked
          }
        }
      }
      return true;
    };

    // Simulated move execution
    const simulateMove = (simState, pawnId, value, isGroupMove = false) => {
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
      
      let steps = isGroupMove ? (value / 2) : value;
      let nextIndex = pawn.pathIndex === -1 ? 0 : pawn.pathIndex + steps;
      if (pawn.pathIndex !== -1 && !nextState.hasKilled && nextIndex >= firstInnerIndex) {
        nextIndex = nextIndex % firstInnerIndex;
      }

      pawn.pathIndex = nextIndex;

      if (pawn.isGatti && originalPathIndex !== -1) {
        const partner = nextState.pawns.find(other =>
          other.id !== pawn.id && other.isGatti && other.pathIndex === originalPathIndex
        );
        if (partner) {
          if (isGroupMove) {
            partner.pathIndex = nextIndex;
          } else {
            pawn.isGatti = false;
            partner.isGatti = false;
          }
        }
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

      // Handle captures
      if (!isSafe) {
        nextState.opponents.forEach(opp => {
          const oppPath = this.paths[opp.color];
          let capturedThisOppSim = false;
          for (const oppP of opp.pawns) {
            if (capturedThisOppSim) break;
            if (oppP.pathIndex === -1) continue;
            const oppCell = oppPath[oppP.pathIndex];
            if (oppCell.r === targetCell.r && oppCell.c === targetCell.c) {
              if (this.rules.gattiEnabled) {
                if (isGroupMove && !oppP.isGatti) continue;
                if (!isGroupMove && oppP.isGatti) continue;
                if (!isGroupMove && !oppP.isGatti && hasAnyGattiOnCellSim(nextState, targetCell.r, targetCell.c)) continue;
              }
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

    // Track A — AI Brain v2: Threat-aware position evaluation
    const activeColors = this.players.map(p => p.color);
    const maxRollVal = this.gridSize === 5 ? 8 : 12;
    // firstInnerIndex already declared above

    // Build threat map: for each cell on player's path, how close is the nearest opponent?
    const buildThreatMap = (simState) => {
      const threats = {}; // pathIndex -> threat score
      const myPath = this.paths[player.color];
      myPath.forEach((cell, idx) => {
        const isSafe = GameEngine.isSafeCell(this.gridSize, cell.r, cell.c, activeColors);
        if (isSafe) return;
        let maxThreat = 0;
        simState.opponents.forEach(opp => {
          const oppPath = this.paths[opp.color];
          opp.pawns.forEach(oppP => {
            if (oppP.pathIndex === -1) return;
            const oppCell = oppPath[oppP.pathIndex];
            const idxOnOppPath = oppPath.findIndex(c => c.r === cell.r && c.c === cell.c);
            if (idxOnOppPath !== -1) {
              const steps = idxOnOppPath - oppP.pathIndex;
              if (steps > 0 && steps <= maxRollVal) {
                // Opponent can land here in one or two rolls
                const urgency = Math.max(0, maxRollVal - steps + 1);
                const threatVal = oppP.isGatti ? urgency * 60 : urgency * 35;
                if (threatVal > maxThreat) maxThreat = threatVal;
              }
            }
          });
        });
        threats[idx] = maxThreat;
      });
      return threats;
    };

    const evaluateSimState = (simState) => {
      let score = 0;
      const threatMap = buildThreatMap(simState);
      
      simState.pawns.forEach(pawn => {
        if (pawn.pathIndex === goalIndex) {
          score += 1500;
        } else if (pawn.pathIndex === -1) {
          score += 0;
        } else {
          // Track A: Inner-ring endgame urgency — ramp multiplier
          const isInner = pawn.pathIndex >= firstInnerIndex;
          const progressMul = isInner ? 60 : (simState.hasKilled ? 35 : 15);
          score += pawn.pathIndex * progressMul;

          const cell = this.paths[player.color][pawn.pathIndex];
          const isSafe = GameEngine.isSafeCell(this.gridSize, cell.r, cell.c, activeColors);
          if (isSafe) {
            score += 280;
          }

          // Track A: Threat penalty — subtract danger of current position
          if (!isSafe) {
            const danger = threatMap[pawn.pathIndex] || 0;
            score -= danger;
          }

          // Track A: Gatti strategy — reward forming Gattis more when opponent is close
          if (this.rules.gattiEnabled && pawn.isGatti) {
            // Base Gatti bonus
            score += 500;
            // Extra bonus if there's a nearby opponent (Gatti provides safety)
            const nearbyThreat = threatMap[pawn.pathIndex] || 0;
            score += nearbyThreat * 0.5; // Gatti is safer under threat
          }

          // Track A: Reward proximity to forming a Gatti (another same-color single pawn within 4 steps)
          if (this.rules.gattiEnabled && !pawn.isGatti) {
            const nearbyPartner = simState.pawns.find(other =>
              other.id !== pawn.id && !other.isGatti && other.pathIndex !== -1 &&
              other.pathIndex !== goalIndex &&
              Math.abs(other.pathIndex - pawn.pathIndex) <= maxRollVal
            );
            if (nearbyPartner) score += 80;
          }

          // Track A: Penalise if opponent Gatti is ahead blocking our path
          if (this.rules.gattiEnabled) {
            simState.opponents.forEach(opp => {
              const oppPath = this.paths[opp.color];
              opp.pawns.filter(op => op.isGatti && op.pathIndex !== -1).forEach(oppGatti => {
                const oppCell = oppPath[oppGatti.pathIndex];
                const idxOnMyPath = this.paths[player.color].findIndex(c => c.r === oppCell.r && c.c === oppCell.c);
                if (idxOnMyPath > pawn.pathIndex && idxOnMyPath - pawn.pathIndex <= maxRollVal * 2) {
                  score -= 200; // blocked path ahead
                }
              });
            });
          }
        }
      });

      // Track A: Bonus for having killed (unlocks inner ring)
      if (simState.hasKilled) score += 300;

      return score;
    };

    // Recursive search over permutations of remaining rolls in this turn
    const searchBestSequence = (simState, remainingRolls) => {
      if (remainingRolls.length === 0) {
        return { score: evaluateSimState(simState), sequence: [] };
      }

      let bestScore = -Infinity;
      let bestSeq = [];

      for (let i = 0; i < remainingRolls.length; i++) {
        const value = remainingRolls[i];
        
        simState.pawns.forEach(pawn => {
          const options = [];
          if (pawn.isGatti) {
            if (isValidPawnMoveSim(simState, pawn, value, false)) {
              options.push({ isGroupMove: false });
            }
            if ((value % 2 === 0) && isValidPawnMoveSim(simState, pawn, value, true)) {
              options.push({ isGroupMove: true });
            }
          } else {
            if (isValidPawnMoveSim(simState, pawn, value, false)) {
              options.push({ isGroupMove: false });
            }
          }

          options.forEach(opt => {
            const { nextState, captureOccurred } = simulateMove(simState, pawn.id, value, opt.isGroupMove);
            const nextRolls = remainingRolls.filter((_, idx) => idx !== i);
            
            const result = searchBestSequence(nextState, nextRolls);
            const score = result.score + (captureOccurred ? 1800 : 0);
            
            if (score > bestScore) {
              bestScore = score;
              bestSeq = [{ pawnId: pawn.id, value: value, rollIdx: i, isGroupMove: opt.isGroupMove }].concat(result.sequence);
            }
          });
        });
      }

      if (bestScore === -Infinity) {
        return { score: evaluateSimState(simState), sequence: [] };
      }

      return { score: bestScore, sequence: bestSeq };
    };

    const difficulty = player.botDifficulty || this.botDifficulty || 'normal';
    const initialSimState = getInitialSimState();

    if (difficulty === 'easy') {
      const legalMoves = [];
      this.rollQueue.forEach((value, rollIdx) => {
        player.pawns.forEach(pawn => {
          const simPawn = initialSimState.pawns.find(p => p.id === pawn.id);
          if (simPawn) {
            if (simPawn.isGatti) {
              if (isValidPawnMoveSim(initialSimState, simPawn, value, false)) {
                legalMoves.push({ pawnId: pawn.id, value, rollIdx, isGroupMove: false });
              }
              if ((value % 2 === 0) && isValidPawnMoveSim(initialSimState, simPawn, value, true)) {
                legalMoves.push({ pawnId: pawn.id, value, rollIdx, isGroupMove: true });
              }
            } else {
              if (isValidPawnMoveSim(initialSimState, simPawn, value, false)) {
                legalMoves.push({ pawnId: pawn.id, value, rollIdx, isGroupMove: false });
              }
            }
          }
        });
      });

      if (legalMoves.length > 0) {
        const chosen = legalMoves[Math.floor(Math.random() * legalMoves.length)];
        const pawnToMove = player.pawns.find(p => p.id === chosen.pawnId);
        setTimeout(() => {
          if (this.gamePhase !== 'moving') return;
          this.selectedRollIndex = chosen.rollIdx;
          this.updateRollQueueUI();
          setTimeout(() => {
            if (this.gamePhase === 'moving') this.executeMove(pawnToMove, chosen.value, chosen.isGroupMove);
          }, this.getBotDelay('submove'));
        }, this.getBotDelay('move') / 2);
      } else {
        this.endTurn();
      }
      return;
    }

    if (difficulty === 'normal') {
      let bestStep = null;
      let bestScore = -Infinity;
      this.rollQueue.forEach((value, rollIdx) => {
        initialSimState.pawns.forEach(pawn => {
          const options = [];
          if (pawn.isGatti) {
            if (isValidPawnMoveSim(initialSimState, pawn, value, false)) options.push(false);
            if ((value % 2 === 0) && isValidPawnMoveSim(initialSimState, pawn, value, true)) options.push(true);
          } else {
            if (isValidPawnMoveSim(initialSimState, pawn, value, false)) options.push(false);
          }
          
          options.forEach(isGroupMove => {
            const { nextState, captureOccurred } = simulateMove(initialSimState, pawn.id, value, isGroupMove);
            const score = evaluateSimState(nextState) + (captureOccurred ? 1200 : 0);
            if (score > bestScore) {
              bestScore = score;
              bestStep = { pawnId: pawn.id, value, rollIdx, isGroupMove };
            }
          });
        });
      });

      if (bestStep) {
        const pawnToMove = player.pawns.find(p => p.id === bestStep.pawnId);
        setTimeout(() => {
          if (this.gamePhase !== 'moving') return;
          this.selectedRollIndex = bestStep.rollIdx;
          this.updateRollQueueUI();
          setTimeout(() => {
            if (this.gamePhase === 'moving') this.executeMove(pawnToMove, bestStep.value, bestStep.isGroupMove);
          }, this.getBotDelay('submove'));
        }, this.getBotDelay('move') / 2);
      } else {
        this.endTurn();
      }
      return;
    }

    const searchResult = searchBestSequence(initialSimState, this.rollQueue);

    if (searchResult.sequence.length > 0) {
      const bestStep = searchResult.sequence[0];
      const pawnToMove = player.pawns.find(p => p.id === bestStep.pawnId);
      
      const val = bestStep.value;
      const actualIdx = bestStep.rollIdx;

      if (actualIdx !== -1) {
        setTimeout(() => {
          if (this.gamePhase !== 'moving') return;
          this.selectedRollIndex = actualIdx;
          this.updateRollQueueUI();
          setTimeout(() => {
            if (this.gamePhase === 'moving') this.executeMove(pawnToMove, val, bestStep.isGroupMove);
          }, this.getBotDelay('submove'));
        }, this.getBotDelay('move') / 2);
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
  // Track D: Build a snapshot key for a cell to detect if it needs re-render
  _cellStateKey(r, c) {
    const pawnsHere = [];
    this.players.forEach((p, pIdx) => {
      p.pawns.forEach(pawn => {
        if (pawn.pathIndex !== -1) {
          const pathCell = this.paths[pawn.color][pawn.pathIndex];
          if (pathCell.r === r && pathCell.c === c) {
            pawnsHere.push(`${pIdx}:${pawn.id}:${pawn.isGatti ? 'g' : 's'}`);
          }
        }
      });
    });
    const isValid = this.gamePhase === 'moving' && this.selectedRollIndex !== null;
    const highlights = [];
    if (isValid) {
      const value = this.rollQueue[this.selectedRollIndex];
      const player = this.getCurrentPlayer();
      if (player) {
        player.pawns.forEach(pawn => {
          if (pawn.pathIndex !== -1 && this.isValidPawnMove(pawn, value)) {
            let targetIdx = pawn.pathIndex + value;
            const firstInnerIdx = this.gridSize === 5 ? 16 : 24;
            if (!player.hasKilled && targetIdx >= firstInnerIdx) targetIdx = targetIdx % firstInnerIdx;
            if (targetIdx < this.paths[pawn.color].length) {
              const tc = this.paths[pawn.color][targetIdx];
              if (tc.r === r && tc.c === c) highlights.push(pawn.id);
            }
          }
        });
      }
    }
    return `${pawnsHere.join('|')}~${highlights.join(',')}`;
  },

  renderBoard() {
    const boardGrid = document.getElementById('board');
    if (!boardGrid) return;
    
    boardGrid.className = `board-grid size-${this.gridSize}`;
    // Track D: Only full-rebuild if grid size changed, otherwise incremental
    const sizeChanged = boardGrid.getAttribute('data-size') !== String(this.gridSize);
    if (sizeChanged) {
      boardGrid.innerHTML = '';
      boardGrid.setAttribute('data-size', this.gridSize);
    }
    
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

    const activeColors = this.players.map(p => p.color);
    const centerIdx = Math.ceil(this.gridSize / 2);
    const firstInnerIndex = this.gridSize === 5 ? 16 : 24;

    // Track D: Event delegation — single handler on board instead of per-pawn
    boardGrid.onclick = (e) => {
      const pawnEl = e.target.closest('.pawn');
      if (!pawnEl) return;
      document.querySelectorAll('.valid-target').forEach(c => c.classList.remove('valid-target'));
      const pIdx = parseInt(pawnEl.getAttribute('data-player-index'));
      const pId = parseInt(pawnEl.getAttribute('data-pawn-id'));
      this.selectPawn(pIdx, pId);
    };
    boardGrid.onmouseover = (e) => {
      const pawnEl = e.target.closest('.pawn');
      if (!pawnEl) return;
      if (this.gamePhase !== 'moving') return;
      const pIdx = parseInt(pawnEl.getAttribute('data-player-index'));
      if (pIdx !== this.currentPlayerIndex || this.getCurrentPlayer().isBot) return;
      if (this.selectedRollIndex === null) return;
      const pId = parseInt(pawnEl.getAttribute('data-pawn-id'));
      const player = this.getCurrentPlayer();
      const pawn = player.pawns.find(p => p.id === pId);
      if (!pawn) return;
      const value = this.rollQueue[this.selectedRollIndex];
      if (!this.isValidPawnMove(pawn, value)) return;
      let targetIdx = pawn.pathIndex === -1 ? 0 : pawn.pathIndex + value;
      if (!player.hasKilled && pawn.pathIndex !== -1 && targetIdx >= firstInnerIndex) {
        targetIdx = targetIdx % firstInnerIndex;
      }
      if (targetIdx < this.paths[pawn.color].length) {
        const tc = this.paths[pawn.color][targetIdx];
        const cellEl = document.querySelector(`.cell[data-r="${tc.r}"][data-c="${tc.c}"]`);
        if (cellEl) cellEl.classList.add('valid-target');
      }
    };
    boardGrid.onmouseout = (e) => {
      if (!e.target.closest('.pawn')) return;
      document.querySelectorAll('.valid-target').forEach(c => c.classList.remove('valid-target'));
    };

    // Build Cell Map — Track D incremental: only re-render changed cells
    for (let r = 1; r <= this.gridSize; r++) {
      for (let c = 1; c <= this.gridSize; c++) {
        const newKey = this._cellStateKey(r, c);
        let cell = boardGrid.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);

        if (!cell || sizeChanged) {
          // Create new cell
          cell = document.createElement('div');
          cell.className = 'cell';
          cell.setAttribute('data-r', r);
          cell.setAttribute('data-c', c);
          cell.setAttribute('data-key', newKey);

          // Safe Square styling — Track C: pass active colors
          const isSafe = GameEngine.isSafeCell(this.gridSize, r, c, activeColors);
          
          if (r === centerIdx && c === centerIdx) {
            cell.classList.add('home-center', 'safe');
            const starEl = document.createElement('div');
            starEl.innerText = '★';
            starEl.className = 'home-star';
            cell.appendChild(starEl);
          } else if (isSafe) {
            cell.classList.add('safe');
            if (r === this.gridSize && c === centerIdx && activeColors.includes('red')) cell.classList.add('player-home-red');
            else if (r === centerIdx && c === 1 && activeColors.includes('green')) cell.classList.add('player-home-green');
            else if (r === 1 && c === centerIdx && activeColors.includes('yellow')) cell.classList.add('player-home-yellow');
            else if (r === centerIdx && c === this.gridSize && activeColors.includes('blue')) cell.classList.add('player-home-blue');
          }

          // Entry mark indicators
          this.players.forEach(p => {
            const path = this.paths[p.color];
            if (path && path.length > firstInnerIndex) {
              const entryCell = path[firstInnerIndex - 1];
              if (entryCell.r === r && entryCell.c === c) {
                cell.classList.add(`entry-mark-${p.color}`);
              }
            }
          });

          boardGrid.appendChild(cell);
        } else {
          // Track D: skip re-render if state hasn't changed
          const oldKey = cell.getAttribute('data-key');
          if (oldKey === newKey) continue;
          cell.setAttribute('data-key', newKey);
          // Remove old pawn elements only
          cell.querySelectorAll('.pawn').forEach(p => p.remove());
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

        if (pawnsInCell.length > 0) {
          const renderedItems = [];
          const gattis = pawnsInCell.filter(item => item.pawn.isGatti);
          const singles = pawnsInCell.filter(item => !item.pawn.isGatti);
          for (let i = 0; i < gattis.length; i += 2) {
            if (gattis[i]) renderedItems.push({ pawn: gattis[i].pawn, playerIdx: gattis[i].playerIdx, isGatti: true });
          }
          singles.forEach(single => renderedItems.push({ pawn: single.pawn, playerIdx: single.playerIdx, isGatti: false }));
          
          renderedItems.forEach((item, index) => {
            const pEl = this.createPawnElement(item.pawn, item.playerIdx, item.isGatti);
            if (renderedItems.length > 1) {
              pEl.style.transform = `translate(${index * 4 - (renderedItems.length * 2)}px, ${index * 4 - (renderedItems.length * 2)}px)`;
              pEl.style.position = 'absolute';
            }
            cell.appendChild(pEl);
          });
        }
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
    // Track E: color-blind mode uses symbol class instead of color name
    const colorBlind = GameState.settings.colorBlind;
    const cbClass = colorBlind ? `cb-${pawn.color}` : '';
    pEl.className = `pawn ${pawn.color} ${isGatti ? 'gatti' : ''} ${cbClass}`.trim();
    pEl.setAttribute('data-player-index', playerIdx);
    pEl.setAttribute('data-pawn-id', pawn.id);
    // Track E: aria label for screen readers
    const playerName = this.players[playerIdx]?.name || pawn.color;
    pEl.setAttribute('aria-label', `${playerName} pawn${isGatti ? ' (Gatti)' : ''}`);
    pEl.setAttribute('role', 'button');
    pEl.setAttribute('tabindex', '0');
    
    // Add inner dot
    const inner = document.createElement('div');
    inner.className = 'pawn-inner';
    pEl.appendChild(inner);

    // Track E: Color-blind symbol overlay
    if (colorBlind) {
      const sym = document.createElement('span');
      sym.className = 'cb-symbol';
      const symbols = { red: '○', green: '□', yellow: '△', blue: '◇' };
      sym.textContent = symbols[pawn.color] || '?';
      pEl.appendChild(sym);
    }

    // Track D: hover/click handled by delegated handlers on boardGrid
    // (handlers are set in renderBoard)
    return pEl;
  },

  // Draw inactive pawns in their respective player panels/yards
  renderYards() {
    const colors = ['red', 'green', 'yellow', 'blue'];
    colors.forEach(col => {
      const yardEl = document.getElementById(`yard-${col}`);
      if (!yardEl) return;

      const playerIdx = this.players.findIndex(p => p.color === col);
      if (playerIdx === -1) {
        yardEl.innerHTML = '';
        yardEl.style.display = 'none';
        return;
      } else {
        yardEl.style.display = 'flex';
      }

      // Recreate the progress label placeholder dynamically
      yardEl.innerHTML = `<span class="yard-progress-label" id="yard-progress-text-${col}">0%</span>`;

      const player = this.players[playerIdx];
      player.pawns.forEach(pawn => {
        if (pawn.pathIndex === -1) {
          const pEl = this.createPawnElement(pawn, playerIdx, false);
          // Yard pawns also need click handler for spawning
          pEl.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectPawn(playerIdx, pawn.id);
          });
          yardEl.appendChild(pEl);
        }
      });
    });

    // Track B: Update player progress bars
    this.updateProgressBars();
  },

  // Track B: Update player progress percentage bars
  updateProgressBars() {
    this.players.forEach((player, idx) => {
      const goalIdx = this.paths[player.color].length - 1;
      const totalProgress = player.pawns.reduce((sum, pawn) => {
        if (pawn.pathIndex === goalIdx) return sum + 100;
        if (pawn.pathIndex === -1) return sum;
        return sum + Math.round((pawn.pathIndex / goalIdx) * 100);
      }, 0);
      const avg = Math.round(totalProgress / player.pawns.length);
      
      // Update sidebar progress bars if present
      const barEl = document.getElementById(`progress-${player.color}`);
      if (barEl) {
        barEl.style.width = `${avg}%`;
        barEl.setAttribute('aria-valuenow', avg);
      }
      const labelEl = document.getElementById(`progress-label-${player.color}`);
      if (labelEl) labelEl.textContent = `${avg}%`;

      // Update yard progress ring variables
      const yardEl = document.getElementById(`yard-${player.color}`);
      if (yardEl) {
        yardEl.style.setProperty('--progress', `${avg}%`);
      }
      const yardLabel = document.getElementById(`yard-progress-text-${player.color}`);
      if (yardLabel) {
        yardLabel.textContent = `${avg}%`;
        if (avg === 0) {
          yardLabel.style.opacity = '0';
        } else {
          yardLabel.style.opacity = '0.85';
        }
      }
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
      const powerBar = document.getElementById('power-bar');
      const powerText = document.getElementById('power-text');
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
    
    const powerBar = document.getElementById('power-bar');
    const powerText = document.getElementById('power-text');
    
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
  const volVal = synth.muted ? 0 : (GameState.settings.volume || 100);
  if (volVal === 0 && !synth.muted) {
    window.setVolume(100);
  } else {
    window.setVolume(volVal);
  }
};

window.setTheme = function(theme) {
  GameState.settings.theme = theme;
  saveSettings();
  if (theme === 'light') {
    document.body.classList.add('light-theme');
  } else {
    document.body.classList.remove('light-theme');
  }
  const btnDark = document.getElementById('setting-theme-dark');
  const btnLight = document.getElementById('setting-theme-light');
  if (btnDark && btnLight) {
    btnDark.classList.toggle('active', theme === 'dark');
    btnLight.classList.toggle('active', theme === 'light');
  }
  if (window.synth && typeof window.synth.playToggle === 'function') synth.playToggle();
};

window.setVolume = function(val) {
  const volume = parseInt(val);
  GameState.settings.volume = volume;
  saveSettings();
  synth.volume = volume / 100;
  synth.muted = (volume === 0);
  const slider = document.getElementById('setting-volume');
  const text = document.getElementById('setting-volume-value');
  const volIcon = document.getElementById('volume-icon');
  if (slider) slider.value = volume;
  if (text) text.innerText = `${volume}%`;
  if (volIcon) {
    volIcon.innerText = (volume === 0) ? '🔇' : '🔊';
  }
};

window.setAutoRoll = function(enabled) {
  GameState.settings.autoRoll = enabled;
  saveSettings();
  const checkbox = document.getElementById('setting-auto-roll');
  if (checkbox) checkbox.checked = enabled;
  if (enabled && GameState.gamePhase === 'rolling' && !GameState.getCurrentPlayer().isBot && !GameState.isRollingAnim) {
    GameState.triggerAutoRoll();
  }
};

window.setBotSpeed = function(speed) {
  GameState.settings.botSpeed = speed;
  saveSettings();
  const speeds = ['slow', 'normal', 'fast', 'instant'];
  speeds.forEach(s => {
    const btn = document.getElementById(`setting-speed-${s}`);
    if (btn) btn.classList.toggle('active', s === speed);
  });
  if (window.synth && typeof window.synth.playToggle === 'function') synth.playToggle();
};

window.openSettingsMenu = function() {
  const overlay = document.getElementById('settings-overlay');
  if (overlay) {
    overlay.classList.remove('hidden');
    const s = GameState.settings;
    window.setTheme(s.theme || 'dark');
    window.setVolume(s.volume !== undefined ? s.volume : 100);
    window.setAutoRoll(!!s.autoRoll);
    window.setBotSpeed(s.botSpeed || 'normal');
    // Track E: sync color-blind button text
    const cbBtn = document.getElementById('setting-colorblind');
    if (cbBtn) cbBtn.textContent = s.colorBlind ? 'ON' : 'OFF';
    if (cbBtn) cbBtn.classList.toggle('active', !!s.colorBlind);
  }
  if (window.synth && typeof window.synth.playToggle === 'function') synth.playToggle();
};

window.closeSettingsMenu = function() {
  const overlay = document.getElementById('settings-overlay');
  if (overlay) overlay.classList.add('hidden');
  if (window.synth && typeof window.synth.playToggle === 'function') synth.playToggle();
};

window.resolveGattiMove = function(isGroupMove) {
  const pawn = GameState.pendingGattiPawn;
  const value = GameState.pendingGattiValue;
  document.getElementById('gatti-choice-overlay').classList.add('hidden');
  GameState.pendingGattiPawn = null;
  GameState.pendingGattiValue = null;
  if (pawn && value !== undefined) {
    GameState.executeMove(pawn, value, isGroupMove);
  }
};

window.cancelGattiChoice = function() {
  document.getElementById('gatti-choice-overlay').classList.add('hidden');
  GameState.pendingGattiPawn = null;
  GameState.pendingGattiValue = null;
  if (window.synth && typeof window.synth.playToggle === 'function') synth.playToggle();
};

window.openLogOverlay = function() {
  const overlay = document.getElementById('log-overlay');
  if (overlay) overlay.classList.remove('hidden');
  if (window.synth && typeof window.synth.playToggle === 'function') synth.playToggle();
  const logBox = document.getElementById('log-box');
  if (logBox) logBox.scrollTop = logBox.scrollHeight;
};

window.closeLogOverlay = function() {
  const overlay = document.getElementById('log-overlay');
  if (overlay) overlay.classList.add('hidden');
  if (window.synth && typeof window.synth.playToggle === 'function') synth.playToggle();
};

window.openRulesGuide = function() {
  const overlay = document.getElementById('rules-overlay');
  if (overlay) overlay.classList.remove('hidden');
  if (window.synth && typeof window.synth.playToggle === 'function') synth.playToggle();
};

window.closeRulesGuide = function() {
  const overlay = document.getElementById('rules-overlay');
  if (overlay) overlay.classList.add('hidden');
  if (window.synth && typeof window.synth.playToggle === 'function') synth.playToggle();
};

window.resumeSavedGame = function() {
  const saved = getSavedGame();
  if (!saved) {
    showToast('No saved game found', 'warn');
    updateResumePanel();
    return;
  }
  GameState.restoreGame(saved);
};

window.clearSavedGame = function() {
  localStorage.removeItem(SAVE_KEY);
  updateResumePanel();
  showToast('Saved game cleared', 'warn');
};

window.showQuitWarning = function() {
  if (window.synth && typeof window.synth.playToggle === 'function') synth.playToggle();
  document.getElementById('quit-overlay').classList.remove('hidden');
};

window.confirmQuitGame = function() {
  document.getElementById('quit-overlay').classList.add('hidden');
  window.restartGame(); // cleans up state automatically
};

window.cancelQuitGame = function() {
  if (window.synth && typeof window.synth.playToggle === 'function') synth.playToggle();
  document.getElementById('quit-overlay').classList.add('hidden');
};

window.restartGame = function(fromBackButton = false) {
  GameState.gamePhase = 'setup';
  localStorage.removeItem(SAVE_KEY);
  updateResumePanel();
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

function getActivePlayerColors(count) {
  if (count === 2) return ['red', 'yellow'];
  if (count === 3) return ['red', 'green', 'yellow'];
  return ['red', 'green', 'yellow', 'blue'];
}

function setPlayerTypeUI(color, type) {
  // Update hidden input
  const typeInput = document.getElementById(`type-${color}`);
  if (typeInput) typeInput.value = type;
  
  // Update active state of segmented buttons
  const container = document.getElementById(`seg-${color}`);
  if (container) {
    container.querySelectorAll('.seg-btn').forEach(btn => btn.classList.remove('active'));
    container.querySelector(`.seg-btn[data-val="${type}"]`)?.classList.add('active');
  }
}

function applyDefaultBotPlayers() {
  const count = parseInt(document.getElementById('select-count').value || '4');
  const activeColors = getActivePlayerColors(count);
  const firstHumanColor = activeColors[0];

  ['red', 'green', 'yellow', 'blue'].forEach(color => {
    const isActive = activeColors.includes(color);
    setPlayerTypeUI(color, isActive && color !== firstHumanColor ? 'bot' : 'human');
  });
}

window.selectPlayerType = function(color, type) {
  if (window.synth && typeof window.synth.playToggle === 'function') {
    window.synth.playToggle();
  }

  setPlayerTypeUI(color, type);
};

window.selectBotDifficulty = function(difficulty) {
  if (window.synth && typeof window.synth.playToggle === 'function') {
    window.synth.playToggle();
  }

  document.getElementById('select-difficulty').value = difficulty;
  const container = document.getElementById('toggle-difficulty-container');
  if (container) {
    container.querySelectorAll('.btn-toggle').forEach(btn => btn.classList.remove('active'));
    container.querySelector(`.btn-toggle[data-val="${difficulty}"]`)?.classList.add('active');
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

  if (document.getElementById('select-mode').value === 'bot') {
    applyDefaultBotPlayers();
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
  const difficultyGroup = document.getElementById('difficulty-group');
  if (mode === 'bot') {
    wrappers.forEach(w => w.style.display = 'flex');
    difficultyGroup?.classList.remove('hidden');
    applyDefaultBotPlayers();
  } else {
    wrappers.forEach(w => w.style.display = 'none');
    difficultyGroup?.classList.add('hidden');
    ['red', 'green', 'yellow', 'blue'].forEach(color => setPlayerTypeUI(color, 'human'));
  }
};

window.startGame = function() {
  // Capture inputs
  const size = parseInt(document.getElementById('select-size').getAttribute('data-value') || '5');
  const count = parseInt(document.getElementById('select-count').value || '4');
  const mode = document.getElementById('select-mode').value || 'local';
  const botDifficulty = document.getElementById('select-difficulty')?.value || 'normal';
  
  const rules = {
    gattiEnabled: document.getElementById('rule-gatti').classList.contains('active'),
    spawnRequired: document.getElementById('rule-spawn')?.classList.contains('active') || false
  };

  const playersList = [];
  
  let colorsToUse = getActivePlayerColors(count);
  
  colorsToUse.forEach(col => {
    const input = document.getElementById(`name-${col}`);
    const botSelect = document.getElementById(`type-${col}`);
    if (input) {
      playersList.push({
        name: input.value.trim() || `${col.toUpperCase()} Player`,
        color: col,
        isBot: (mode === 'local') ? false : (botSelect.value === 'bot'),
        botDifficulty
      });
    }
  });

  // Init Engine
  GameState.initGame(playersList, size, rules, botDifficulty);
  
  // Transitions
  document.getElementById('setup-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  
  // Add History State for mobile back button handling
  history.pushState({ page: 'game' }, '', '#game');
  
  // Track B: Build progress bars for each active player
  const progressContainer = document.getElementById('progress-bars-container');
  if (progressContainer) {
    progressContainer.innerHTML = '';
    playersList.forEach(p => {
      const row = document.createElement('div');
      row.className = 'progress-player-row';
      row.innerHTML = `
        <div class="progress-player-label">
          <span class="progress-dot" style="background: var(--color-${p.color}); box-shadow: 0 0 6px var(--color-${p.color});"></span>
          <span>${p.name}</span>
          <span class="progress-pct" id="progress-label-${p.color}">0%</span>
        </div>
        <div class="progress-bar-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
          <div class="progress-bar-fill" id="progress-${p.color}" style="background: var(--color-${p.color}); width: 0%;"></div>
        </div>`;
      progressContainer.appendChild(row);
    });
  }

  // Track E: Reset undo button state
  const undoBtn = document.getElementById('btn-undo');
  if (undoBtn) undoBtn.disabled = true;

  // Render
  GameState.renderBoard();
};

// Track E: Keyboard navigation
document.addEventListener('keydown', (e) => {
  // Don't fire inside text inputs
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  
  const gs = GameState;
  
  // Space = roll
  if (e.code === 'Space' && gs.gamePhase === 'rolling' && !gs.getCurrentPlayer()?.isBot && !gs.isRollingAnim) {
    e.preventDefault();
    gs.rollCowries();
    return;
  }

  // 1–6 = select roll queue index
  if (gs.gamePhase === 'moving' && !gs.getCurrentPlayer()?.isBot) {
    const num = parseInt(e.key);
    if (num >= 1 && num <= 6) {
      const idx = num - 1;
      if (idx < gs.rollQueue.length) {
        synth.playToggle();
        gs.selectedRollIndex = idx;
        gs.updateRollQueueUI();
        gs.highlightValidPawns();
        return;
      }
    }
  }

  // U = undo
  if ((e.key === 'u' || e.key === 'U') && gs.undoSnapshot && !gs.getCurrentPlayer()?.isBot) {
    e.preventDefault();
    gs.applyUndo();
    return;
  }
});

// Track E: Color-blind mode toggle
window.setColorBlind = function(enabled) {
  GameState.settings.colorBlind = !!enabled;
  saveSettings();
  const btn = document.getElementById('setting-colorblind');
  if (btn) { btn.classList.toggle('active', !!enabled); btn.textContent = enabled ? 'ON' : 'OFF'; }
  // Re-render to apply new symbol classes
  if (GameState.gamePhase !== 'setup') {
    GameState.renderBoard();
  }
  if (window.synth && typeof window.synth.playToggle === 'function') synth.playToggle();
};

// DOM init scripts for toggle buttons
document.addEventListener('DOMContentLoaded', () => {
  // Migrate legacy save to new key
  try {
    const legacy = localStorage.getItem(SAVE_KEY_LEGACY);
    if (legacy && !localStorage.getItem(SAVE_KEY)) {
      localStorage.setItem(SAVE_KEY, legacy);
      localStorage.removeItem(SAVE_KEY_LEGACY);
    }
  } catch(e) {}

  loadSettings();
  const s = GameState.settings;
  if (s.theme === 'light') {
    document.body.classList.add('light-theme');
  }
  synth.volume = (s.volume !== undefined ? s.volume : 100) / 100;
  synth.muted = (s.volume === 0);
  // Track E: Apply color-blind setting from stored prefs
  if (s.colorBlind) {
    document.body.classList.add('color-blind-mode');
    const btn = document.getElementById('setting-colorblind');
    if (btn) btn.classList.add('active');
  }
  const volIcon = document.getElementById('volume-icon');
  if (volIcon) {
    volIcon.innerText = synth.muted ? '🔇' : '🔊';
  }

  updateResumePanel();

  const rulesOverlay = document.getElementById('rules-overlay');
  if (rulesOverlay) {
    rulesOverlay.addEventListener('click', (event) => {
      if (event.target === rulesOverlay) window.closeRulesGuide();
    });
  }

  const settingsOverlay = document.getElementById('settings-overlay');
  if (settingsOverlay) {
    settingsOverlay.addEventListener('click', (event) => {
      if (event.target === settingsOverlay) window.closeSettingsMenu();
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      window.closeRulesGuide();
      window.closeSettingsMenu();
    }
  });

  // Handle mobile hardware back button
  window.addEventListener('popstate', (event) => {
    if (window.isIntentionalRestart) {
      window.isIntentionalRestart = false;
      return;
    }
    
    const quitOverlay = document.getElementById('quit-overlay');
    if (quitOverlay && !quitOverlay.classList.contains('hidden')) {
      quitOverlay.classList.add('hidden');
      history.pushState({ page: 'game' }, '', '#game');
      return;
    }

    // If the game screen is visible and user clicked back
    if (!document.getElementById('game-screen').classList.contains('hidden')) {
      history.pushState({ page: 'game' }, '', '#game');
      if (quitOverlay) quitOverlay.classList.remove('hidden');
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
  
  // Initialize the responsive Screen Engine
  ScreenEngine.init();
});

// Screen Scaling Engine to guarantee perfect layout fitting on all devices
const ScreenEngine = {
  init() {
    this.update = this.update.bind(this);
    window.addEventListener('resize', this.update);
    window.addEventListener('orientationchange', this.update);
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', this.update);
    }
    this.update();
    setTimeout(this.update, 100);
  },

  update() {
    const vWidth = window.visualViewport ? window.visualViewport.width : window.innerWidth;
    const vHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;

    document.documentElement.style.setProperty('--vw', `${vWidth}px`);
    document.documentElement.style.setProperty('--vh', `${vHeight}px`);

    let boardSize = 0;
    
    if (vWidth <= 850) {
      // Mobile: Reserve 310px for UI and Yards
      boardSize = Math.min(vHeight - 310, vWidth * 0.92);
    } else if (vWidth <= 1200) {
      // Tablet: Reserve 200px for UI and Yards
      boardSize = Math.min(vHeight - 200, vWidth * 0.9);
    } else {
      // Desktop: Reserve 200px, max 500px wide
      boardSize = Math.min(vHeight - 200, 500);
    }

    boardSize = Math.max(250, boardSize); // Minimum bound
    document.documentElement.style.setProperty('--dynamic-board-size', `${boardSize}px`);
  }
};
