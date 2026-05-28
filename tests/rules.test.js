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
  getBoundingClientRect: () => ({ left: 0, top: 0 }),
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
    AudioContext: function AudioContext() {},
    webkitAudioContext: function AudioContext() {}
  },
  document: {
    addEventListener: noop,
    createElement: () => ({ ...fakeElement }),
    getElementById: () => ({ ...fakeElement }),
    querySelector: () => ({ ...fakeElement }),
    querySelectorAll: () => []
  }
};

sandbox.globalThis = sandbox;
vm.createContext(sandbox);
vm.runInContext(`${gameSource}\nglobalThis.__GameEngine = GameEngine;`, sandbox, {
  filename: 'game.js'
});

const { __GameEngine: GameEngine } = sandbox;

function cellKey(cell) {
  return `${cell.r},${cell.c}`;
}

function plainCell(cell) {
  return { r: cell.r, c: cell.c };
}

function assertPath(gridSize, color, expectedStart, expectedLength) {
  const pathCells = GameEngine.generatePath(gridSize, color);
  assert.equal(pathCells.length, expectedLength, `${gridSize} ${color} path length`);
  assert.deepEqual(plainCell(pathCells[0]), expectedStart, `${gridSize} ${color} start cell`);
  assert.deepEqual(plainCell(pathCells[pathCells.length - 1]), {
    r: Math.ceil(gridSize / 2),
    c: Math.ceil(gridSize / 2)
  }, `${gridSize} ${color} center goal`);
}

assertPath(5, 'red', { r: 5, c: 3 }, 25);
assertPath(5, 'green', { r: 3, c: 1 }, 25);
assertPath(5, 'yellow', { r: 1, c: 3 }, 25);
assertPath(5, 'blue', { r: 3, c: 5 }, 25);

assertPath(7, 'red', { r: 7, c: 4 }, 50);
assertPath(7, 'green', { r: 4, c: 1 }, 50);
assertPath(7, 'yellow', { r: 1, c: 4 }, 50);
assertPath(7, 'blue', { r: 4, c: 7 }, 50);

assert.equal(GameEngine.isSafeCell(5, 3, 3), true, '5x5 center safe');
assert.equal(GameEngine.isSafeCell(5, 5, 3), true, '5x5 red start safe');
assert.equal(GameEngine.isSafeCell(5, 2, 2), false, '5x5 inner corner not safe');
assert.equal(GameEngine.isSafeCell(7, 2, 2), true, '7x7 inner corner safe');
assert.equal(GameEngine.isSafeCell(7, 3, 3), false, '7x7 non-safe regular cell');

const red5 = GameEngine.generatePath(5, 'red').map(cellKey);
assert.equal(new Set(red5).size, 25, '5x5 red path visits every cell once');

const red7 = GameEngine.generatePath(7, 'red').map(cellKey);
assert.equal(red7.length, 50, '7x7 red path includes center transition repeat');
assert.equal(red7[red7.length - 1], '4,4', '7x7 red path ends at center');

console.log('rules.test.js: all tests passed');
