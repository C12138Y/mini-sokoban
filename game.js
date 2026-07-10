"use strict";

const levels = [
  [
    "  #####",
    "###   #",
    "# @$  #",
    "### $.#",
    "#.$  ##",
    "#  .  #",
    "#######"
  ],
  [
    " ######",
    "##    #",
    "#  $$ #",
    "# #  .#",
    "# @ #.#",
    "#     #",
    "#######"
  ],
  [
    "  #####",
    "###   ##",
    "# . $  #",
    "# #$## #",
    "# . $  #",
    "# .@   #",
    "########"
  ]
];

const vectors = {
  up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1]
};
const keyMap = {
  ArrowUp: "up", w: "up", W: "up",
  ArrowDown: "down", s: "down", S: "down",
  ArrowLeft: "left", a: "left", A: "left",
  ArrowRight: "right", d: "right", D: "right"
};

const boardEl = document.querySelector("#board");
const levelEl = document.querySelector("#level");
const movesEl = document.querySelector("#moves");
const boxesEl = document.querySelector("#boxes");
const undoButton = document.querySelector("#undo");
const winPanel = document.querySelector("#win-panel");
const winTitle = document.querySelector("#win-title");
const nextButton = document.querySelector("#next");

let levelIndex = 0;
let state;
let history = [];

function loadLevel(index) {
  levelIndex = index;
  history = [];
  const rows = levels[index];
  const width = Math.max(...rows.map(row => row.length));
  const walls = new Set();
  const goals = new Set();
  const boxes = new Set();
  let player = null;

  rows.forEach((row, y) => {
    row.padEnd(width).split("").forEach((cell, x) => {
      const key = positionKey(y, x);
      if (cell === "#") walls.add(key);
      if (cell === "." || cell === "+" || cell === "*") goals.add(key);
      if (cell === "$" || cell === "*") boxes.add(key);
      if (cell === "@" || cell === "+") player = [y, x];
    });
  });

  state = { width, height: rows.length, walls, goals, boxes, player, moves: 0 };
  winPanel.hidden = true;
  render();
}

function positionKey(y, x) { return `${y},${x}`; }

function snapshot() {
  return { player: [...state.player], boxes: new Set(state.boxes), moves: state.moves };
}

function move(direction) {
  if (!winPanel.hidden) return;
  const [dy, dx] = vectors[direction];
  const [y, x] = state.player;
  const next = [y + dy, x + dx];
  const nextKey = positionKey(...next);
  if (state.walls.has(nextKey)) return;

  if (state.boxes.has(nextKey)) {
    const beyond = [next[0] + dy, next[1] + dx];
    const beyondKey = positionKey(...beyond);
    if (state.walls.has(beyondKey) || state.boxes.has(beyondKey)) return;
    history.push(snapshot());
    state.boxes.delete(nextKey);
    state.boxes.add(beyondKey);
  } else {
    history.push(snapshot());
  }

  state.player = next;
  state.moves += 1;
  render();

  if ([...state.boxes].every(box => state.goals.has(box))) showWin();
}

function undo() {
  const previous = history.pop();
  if (!previous) return;
  state.player = previous.player;
  state.boxes = previous.boxes;
  state.moves = previous.moves;
  winPanel.hidden = true;
  render();
}

function render() {
  boardEl.replaceChildren();
  boardEl.style.gridTemplateColumns = `repeat(${state.width}, 1fr)`;
  for (let y = 0; y < state.height; y += 1) {
    for (let x = 0; x < state.width; x += 1) {
      const key = positionKey(y, x);
      const tile = document.createElement("div");
      tile.className = "tile";
      tile.setAttribute("role", "gridcell");
      if (state.walls.has(key)) tile.classList.add("wall");
      if (state.goals.has(key)) tile.classList.add("goal");
      if (state.boxes.has(key)) tile.classList.add("box");
      if (state.boxes.has(key) && state.goals.has(key)) tile.classList.add("box-on-goal");
      if (state.player[0] === y && state.player[1] === x) tile.classList.add("player");
      boardEl.append(tile);
    }
  }

  const completed = [...state.boxes].filter(box => state.goals.has(box)).length;
  levelEl.textContent = `${levelIndex + 1} / ${levels.length}`;
  movesEl.textContent = state.moves;
  boxesEl.textContent = `${completed} / ${state.boxes.size}`;
  undoButton.disabled = history.length === 0;
}

function showWin() {
  const isLast = levelIndex === levels.length - 1;
  winTitle.textContent = isLast ? "全部通关！" : "关卡完成！";
  nextButton.textContent = isLast ? "再玩一次" : "下一关";
  winPanel.hidden = false;
}

document.addEventListener("keydown", event => {
  const direction = keyMap[event.key];
  if (!direction) return;
  event.preventDefault();
  move(direction);
});

document.querySelectorAll("[data-direction]").forEach(button => {
  button.addEventListener("click", () => move(button.dataset.direction));
});
document.querySelector("#restart").addEventListener("click", () => loadLevel(levelIndex));
undoButton.addEventListener("click", undo);
nextButton.addEventListener("click", () => loadLevel((levelIndex + 1) % levels.length));

let touchStart = null;
boardEl.addEventListener("pointerdown", event => { touchStart = [event.clientX, event.clientY]; });
boardEl.addEventListener("pointerup", event => {
  if (!touchStart) return;
  const dx = event.clientX - touchStart[0];
  const dy = event.clientY - touchStart[1];
  touchStart = null;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
  move(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up"));
});

loadLevel(0);
