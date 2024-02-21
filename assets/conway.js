// ╭───────────────╮
// │   conway.js   │
// ╰───────────────╯

/**
 * @license MIT
 * @author DanielDH179
 * @version 1.0.0
 */

// HTML elements
const table = document.querySelector("table");

// Game configuration
const boardSize = 20;
const neighbors = [
  [-1, 1],
  [0, 1],
  [1, 1],
  [-1, 0],
  [1, 0],
  [-1, -1],
  [0, -1],
  [1, -1],
];

let boardState = [];
let livingNeighbors = [];
let mouseDown = false;
let gameInstance;

document.addEventListener("DOMContentLoaded", () => {
  for (let i = 0; i < boardSize; i++) {
    let row = document.createElement("tr");
    for (let j = 0; j < boardSize; j++) {
      let cell = document.createElement("td");
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
});

function setGameTicks(gameTicks) {
  clearInterval(gameInstance);
  if (gameTicks > 0) gameInstance = setInterval(nextStep, 1000 / gameTicks);
}

table.addEventListener("mousedown", (event) => {
  let styles = event.target.classList;
  if (event.button === 0 && !styles.contains("food")) {
    styles.add("alive");
    mouseDown = true;
  }
});
table.addEventListener("mouseup", () => (mouseDown = false));
table.addEventListener("mousemove", (event) => {
  let styles = event.target.classList;
  if (mouseDown && !styles.contains("food")) styles.add("alive");
});
table.addEventListener("contextmenu", newFood);

function newCell(event) {
  event.target.classList.add("alive");
}

function newFood(event) {
  event.preventDefault();
  let styles = event.target.classList;
  if (!styles.contains("alive")) styles.add("food");
}

function nextStep() {
  boardState.length = livingNeighbors.length = 0;
  fillArrays();
  nextGeneration();
}

function fillArrays() {
  for (let cell of document.querySelectorAll("td")) {
    let [x, y] = getCoordinates(cell);
    boardState.push(cell.classList.contains("alive"));
    livingNeighbors.push(getLivingNeighbors(x, y));
  }
}

function nextGeneration() {
  for (let i = 0; i < boardSize * boardSize; i++) {
    let x = Math.floor(i / boardSize);
    let y = i % boardSize;
    let cell = table.children[x].children[y];
    switch (livingNeighbors[i]) {
      case 2:
        if (boardState[i]) cell.classList.add("alive");
        else cell.classList.remove("alive");
        break;
      case 3:
        cell.classList.add("alive");
        break;
      default:
        cell.classList.remove("alive");
    }
  }
}

function getLivingNeighbors(x, y) {
  let total = 0;
  for (let [dx, dy] of neighbors) {
    let nx = x + dx;
    let ny = y + dy;
    if (nx >= 0 && nx < boardSize && ny >= 0 && ny < boardSize) {
      let neighbor = table.children[nx].children[ny];
      if (neighbor.classList.contains("alive")) total++;
    }
  }
  return total;
}

function getCoordinates(element) {
  return [element.parentNode.rowIndex, element.cellIndex];
}

/*
┏━━━┳━━━┳━━━┳━━━┓    ┏━━━┳━━━┳━━━┳━━━┓    ┏━━━┳━━━┳━━━┳━━━┓    ┏━━━┳━━━┳━━━┳━━━┓
┃   ┃ X ┃   ┃   ┃    ┃   ┃   ┃   ┃   ┃    ┃   ┃   ┃   ┃   ┃    ┃   ┃   ┃   ┃   ┃
┣━━━╋━━━╋━━━╋━━━┫    ┣━━━╋━━━╋━━━╋━━━┫    ┣━━━╋━━━╋━━━╋━━━┫    ┣━━━╋━━━╋━━━╋━━━┫
┃   ┃ X ┃   ┃   ┃    ┃ X ┃ X ┃   ┃   ┃    ┃   ┃   ┃   ┃   ┃    ┃   ┃   ┃   ┃   ┃
┣━━━╋━━━╋━━━╋━━━┫ -> ┣━━━╋━━━╋━━━╋━━━┫ -> ┣━━━╋━━━╋━━━╋━━━┫ -> ┣━━━╋━━━╋━━━╋━━━┫
┃   ┃ X ┃   ┃ X ┃    ┃   ┃   ┃   ┃   ┃    ┃   ┃ X ┃   ┃   ┃    ┃   ┃   ┃   ┃   ┃
┣━━━╋━━━╋━━━╋━━━┫    ┣━━━╋━━━╋━━━╋━━━┫    ┣━━━╋━━━╋━━━╋━━━┫    ┣━━━╋━━━╋━━━╋━━━┫
┃   ┃   ┃   ┃ X ┃    ┃   ┃   ┃ X ┃   ┃    ┃   ┃   ┃   ┃   ┃    ┃   ┃   ┃   ┃   ┃
┗━━━┻━━━┻━━━┻━━━┛    ┗━━━┻━━━┻━━━┻━━━┛    ┗━━━┻━━━┻━━━┻━━━┛    ┗━━━┻━━━┻━━━┻━━━┛
 [ 2, 1, 2, 0,        [ 2, 2, 1, 0,        [ 0, 0, 0, 0,        [ 0, 0, 0, 0,
   3, 2, 4, 1,          0, 0, 0, 0,          1, 1, 1, 0,          0, 0, 0, 0,
   2, 1, 4, 1,          0, 3, 1, 1,          1, 0, 1, 0,          0, 0, 0, 0,
   1, 1, 3, 1 ]         0, 1, 0, 1 ]         1, 1, 1, 0 ]         0, 0, 0, 0 ]
*/
