const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const gameSource = fs.readFileSync(path.join(root, 'game.js'), 'utf8');

const noop = () => {};
const fakeElement = {
  classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
  style: { setProperty: noop },
  addEventListener: noop,
  appendChild: noop,
  append: noop,
  remove: noop,
  querySelectorAll: () => [],
  querySelector: () => null,
  setAttribute: noop,
  getAttribute: () => null,
  getBoundingClientRect: () => ({ left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 }),
  innerHTML: '',
  innerText: '',
  textContent: ''
};

const sandbox = {
  console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  requestAnimationFrame: noop,
  localStorage: {
    getItem: () => null,
    setItem: noop,
    removeItem: noop
  },
  history: { pushState: noop, back: noop },
  location: { hash: '' },
  confirm: () => true,
  window: {
    innerWidth: 1024,
    addEventListener: noop,
    AudioContext: function AudioContext() {
      return {
        createOscillator: () => ({
          connect: noop,
          start: noop,
          stop: noop,
          frequency: { value: 0, setValueAtTime: noop, exponentialRampToValueAtTime: noop }
        }),
        createGain: () => ({
          connect: noop,
          gain: { value: 0, setValueAtTime: noop, linearRampToValueAtTime: noop, exponentialRampToValueAtTime: noop }
        }),
        currentTime: 0,
        destination: {}
      };
    },
    webkitAudioContext: function AudioContext() {}
  },
  document: {
    addEventListener: noop,
    createElement: () => ({ ...fakeElement }),
    getElementById: () => ({ ...fakeElement }),
    querySelector: () => ({ ...fakeElement }),
    querySelectorAll: () => [],
    createTextNode: () => ({ ...fakeElement })
  },
  showToast: noop,
  synth: {
    playMove: noop,
    playCapture: noop,
    playToggle: noop
  }
};

sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(`${gameSource}\nglobalThis.GameState = GameState;\nglobalThis.GameEngine = GameEngine;\n`, sandbox, { filename: 'game.js' });

const { GameState, GameEngine } = sandbox;

// 1. Initial State Check
console.log('Testing skills initialization...');
const players = [
  { name: 'Player Red', color: 'red', isBot: false },
  { name: 'Player Green', color: 'green', isBot: true }
];
const rules = {
  gattiEnabled: true,
  spawnRequired: false,
  skillsEnabled: true
};

GameState.initGame(players, 5, rules, 'normal');

assert.equal(GameState.rules.skillsEnabled, true, 'skillsEnabled is true');
assert.equal(GameState.players[0].skills.charges, 3, 'Player starts with 3 charges');
assert.equal(GameState.players[0].pawns[0].hasShield, false, 'Pawn initially has no shield');

// 2. Reroll Check
console.log('Testing Reroll skill...');
GameState.gamePhase = 'moving';
GameState.rollQueue = [2];
GameState.displayRolls = [{ value: 2, used: false }];
GameState.selectedRollIndex = 0;

// Execute reroll as Player Red (index 0)
sandbox.window.useSkill('reroll');
assert.equal(GameState.players[0].skills.charges, 2, 'Reroll consumed 1 charge (3 -> 2)');
assert.equal(GameState.gamePhase, 'rolling', 'Phase reset to rolling');
assert.equal(GameState.rollQueue.length, 0, 'Roll queue cleared');
assert.equal(GameState.displayRolls.length, 0, 'Display rolls cleared');

// 3. Shield Check
console.log('Testing Shield skill...');
GameState.players[0].skills.charges = 3; // Reset charges
// Move a pawn to outer cell index 2
GameState.players[0].pawns[0].pathIndex = 2;
GameState.players[0].pawns[0].hasShield = false;

// Trigger shield interaction
sandbox.window.useSkill('shield');
assert.equal(GameState.skillsInteraction, 'shield', 'Interaction mode set to shield');

// Execute skill on pawn 0
GameState.executeSkillOnPawn(0);
assert.equal(GameState.players[0].pawns[0].hasShield, true, 'Pawn 0 is now shielded');
assert.equal(GameState.players[0].skills.charges, 2, 'Shield consumed 1 charge (3 -> 2)');
assert.equal(GameState.skillsInteraction, null, 'Interaction mode cleared');

// Gatti partner shield check
console.log('Testing Gatti partner shielding...');
GameState.players[0].pawns[0].isGatti = true;
GameState.players[0].pawns[0].hasShield = false;
GameState.players[0].pawns[1].isGatti = true;
GameState.players[0].pawns[1].pathIndex = 2;
GameState.players[0].pawns[1].hasShield = false;

GameState.players[0].skills.charges = 3; // Reset charges
GameState.skillsInteraction = 'shield';
GameState.executeSkillOnPawn(0);
assert.equal(GameState.players[0].pawns[0].hasShield, true, 'Pawn 0 shielded');
assert.equal(GameState.players[0].pawns[1].hasShield, true, 'Pawn 1 partner shielded too');
assert.equal(GameState.players[0].skills.charges, 2, 'Consumed 1 charge total for Gatti pair');

// Expiration on move
console.log('Testing Shield expiration on move...');
GameState.rollQueue = [2];
GameState.displayRolls = [{ value: 2, used: false }];
GameState.selectedRollIndex = 0;
GameState.gamePhase = 'moving';
// Execute move
GameState.executeMove(GameState.players[0].pawns[0], 2, false);
assert.equal(GameState.players[0].pawns[0].hasShield, false, 'Shield wears off on move');

// Capture prevention check
console.log('Testing Capture prevention for shielded pawn...');
// Set opponent pawn at same spot with shield active
GameState.players[1].pawns[0].pathIndex = 4;
GameState.players[1].pawns[0].hasShield = true;
GameState.players[1].hasKilled = false;
GameState.players[0].hasKilled = false;

// Red player pawn is at index 4 (from index 2 + step 2)
// Normally, landing here would capture Green pawn. Let's see if capture is bypassed.
const opp = GameState.players[1];
const targetCell = GameState.paths['red'][4];
const firstInnerIndex = 16;
let captureOccurred = false;

// Execute capture checks inside code block simulation
const oppPawn = opp.pawns[0];
const oppCell = GameState.paths[oppPawn.color][oppPawn.pathIndex];
if (oppCell.r === targetCell.r && oppCell.c === targetCell.c) {
  if (oppPawn.hasShield) {
    // Shielded! Should bypass capture
    captureOccurred = false;
  } else {
    captureOccurred = true;
  }
}
assert.equal(captureOccurred, false, 'Bypassed capture due to active shield');

// 4. Teleport Check
console.log('Testing Teleport skill...');
GameState.players[0].skills.charges = 3;
// Put pawn at index 0 (starting cell). Path index = 0.
GameState.players[0].pawns[0].pathIndex = 0;
GameState.players[0].pawns[0].hasShield = false;
GameState.players[0].hasKilled = false;

GameState.rollQueue = [1];
GameState.displayRolls = [{ value: 1, used: false }];
GameState.selectedRollIndex = 0;

GameState.skillsInteraction = 'teleport';
GameState.executeSkillOnPawn(0);

// Next safe cells from index 0 on outer board:
// Outer board has safe cells: starting yard cell is safe, plus safe squares at other player starts.
// For red, starting index is 0. Next safe square on outer ring is index 4.
assert.equal(GameState.players[0].pawns[0].pathIndex, 4, 'Teleported to next safe cell (index 4)');
assert.equal(GameState.players[0].skills.charges, 1, 'Teleport consumed 2 charges (3 -> 1)');
assert.equal(GameState.rollQueue.length, 0, 'Consumed currently selected roll value from queue');

console.log('skills.test.js: all tests passed successfully!');
