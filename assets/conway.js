// ╭───────────────╮
// │   conway.js   │
// ╰───────────────╯

/**
 * @license MIT
 * @author DanielDH179
 * @version 1.1.5
 */

// HTML buttons
const debugButton = document.querySelector("#debug");
const nextButton = document.querySelector("#next");
const randomButton = document.querySelector("#random");
const removeButton = document.querySelector("#remove");
const resetButton = document.querySelector("#reset");
const startButton = document.querySelector("#start");
const stopButton = document.querySelector("#stop");

// HTML elements
const ratio = document.querySelector("p");
const slider = document.querySelector("input");
const table = document.querySelector("table");
const value = document.querySelector("span");

// Game configuration
slider.min = 0;
slider.max = 30;
slider.value = 0;
const boardSize = 64;
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
let showDebug = false;
let gameInstance;

document.addEventListener("DOMContentLoaded", () => {
  resizeBoard();
  resetBoard();
  setUpMenu();
  updateSlider();
  updateTable();
  fillArrays();
});

window.addEventListener("resize", resizeBoard);

function resizeBoard() {
  table.style.height = `${table.clientWidth}px`;
}

function resetBoard() {
  table.innerHTML = "";
  for (let i = 0; i < boardSize; i++) {
    let row = document.createElement("tr");
    for (let j = 0; j < boardSize; j++) {
      let cell = document.createElement("td");
      cell.style.fontSize = `${320 / boardSize}px`;
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
  fillArrays();
}

// Button listeners
function setUpMenu() {
  debugButton.addEventListener("click", debugMode);
  nextButton.addEventListener("click", nextStep);
  randomButton.addEventListener("click", () => randomFill(0.5));
  removeButton.addEventListener("click", removeFood);
  resetButton.addEventListener("click", resetBoard);
  slider.addEventListener("mousemove", updateSlider);
  startButton.addEventListener("click", () => setFramerate(1));
  stopButton.addEventListener("click", () => setFramerate(0));
}

// Toggle debug mode
function debugMode() {
  let styles = debugButton.classList;
  showDebug = !showDebug;
  styles.toggle("on");
  fillArrays();
}

// Display slider value
function updateSlider() {
  let ratio = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
  slider.style.background = `linear-gradient(to right, #FFF ${ratio}%, #2B3137 ${ratio}%)`;
  value.innerText = slider.value;
}

// Display table
function updateTable() {
  table.addEventListener("mousedown", (event) => {
    let styles = event.target.classList;
    if (event.button === 0 && !styles.contains("food")) {
      styles.add("alive");
      fillArrays();
      mouseDown = true;
    }
  });
  table.addEventListener("mouseup", () => (mouseDown = false));
  table.addEventListener("mousemove", (event) => {
    let styles = event.target.classList;
    if (mouseDown && !styles.contains("food")) {
      styles.add("alive");
      fillArrays();
    }
  });
  table.addEventListener("contextmenu", toggleFood);
}

// Generate random living cells
function randomFill(percentage) {
  resetBoard();
  for (let cell of document.querySelectorAll("td"))
    if (Math.random() < percentage) cell.classList.add("alive");
  fillArrays();
}

// Set framerate (FPS)
function setFramerate(framerate) {
  slider.value = framerate;
  updateSlider();
  clearInterval(gameInstance);
  if (framerate > 0) gameInstance = setInterval(nextStep, 1000 / framerate);
}

// Toggle food cells
function toggleFood(event) {
  event.preventDefault();
  let styles = event.target.classList;
  if (!styles.contains("alive")) styles.toggle("food");
}

// Clear food cells
function removeFood() {
  for (let cell of document.querySelectorAll(".food"))
    cell.classList.remove("food");
}

function nextStep() {
  fillArrays();
  nextGeneration();
  fillArrays();
}

function fillArrays() {
  boardState.length = livingNeighbors.length = 0;
  for (let cell of document.querySelectorAll("td")) {
    let [x, y] = getCoordinates(cell);
    boardState.push(cell.classList.contains("alive"));
    let total = getLivingNeighbors(x, y);
    livingNeighbors.push(total);
    cell.innerText = showDebug ? total : "";
  }
  let cellRatio = document.querySelectorAll(".alive").length / boardSize ** 2;
  ratio.innerText = `${(cellRatio * 100).toFixed(2)}%`;
}

function nextGeneration() {
  for (let i = 0; i < boardSize * boardSize; i++) {
    let x = Math.floor(i / boardSize);
    let y = i % boardSize;
    let styles = table.children[x].children[y].classList;
    switch (livingNeighbors[i]) {
      case 2:
        boardState[i] ? styles.add("alive") : styles.remove("alive");
        break;
      case 3:
        styles.add("alive");
        break;
      default:
        styles.remove("alive");
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

// Manhattan distance
function findDistance(cell, food) {
  let [cx, cy] = getCoordinates(cell);
  let [fx, fy] = getCoordinates(food);
  return Math.abs(cx - fx) + Math.abs(cy - fy);
}

/*
CONWAY'S GAME OF LIFE RULES:
- Living cells die if they have less than 2 neighbors
- Living cells die if they have more than 3 neighbors
- Dead cells that have 3 neighbors become alive
- Otherwise no changes
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
    3, 2, 4, 1,          1, 1, 1, 0,          1, 1, 1, 0,          0, 0, 0, 0,
    2, 1, 4, 1,          2, 3, 2, 1,          1, 0, 1, 0,          0, 0, 0, 0,
    1, 1, 3, 1 ]         0, 1, 0, 1 ]         1, 1, 1, 0 ]         0, 0, 0, 0 ]

REPRODUCTION AND DEATH RULES WITH FOOD:
- One movement requires one energy point
- Eating food restores N energy points
- Nearest 2 cells to food engage in reproduction
- Living cells die after consuming N energy points
┏━━━┳━━━┳━━━┳━━━┓    ┏━━━┳━━━┳━━━┳━━━┓    ┏━━━┳━━━┳━━━┳━━━┓
┃   ┃   ┃ X ┃ X ┃    ┃   ┃   ┃ X ┃ X ┃    ┃   ┃ X ┃ X ┃   ┃
┣━━━╋━━━╋━━━╋━━━┫    ┣━━━╋━━━╋━━━╋━━━┫    ┣━━━╋━━━╋━━━╋━━━┫
┃ F ┃   ┃   ┃ F ┃    ┃ F ┃   ┃   ┃ X ┃    ┃ X ┃   ┃ X ┃   ┃
┣━━━╋━━━╋━━━╋━━━┫ -> ┣━━━╋━━━╋━━━╋━━━┫ -> ┣━━━╋━━━╋━━━╋━━━┫
┃   ┃ F ┃   ┃   ┃    ┃   ┃ X ┃   ┃ X ┃    ┃   ┃   ┃ X ┃   ┃
┣━━━╋━━━╋━━━╋━━━┫    ┣━━━╋━━━╋━━━╋━━━┫    ┣━━━╋━━━╋━━━╋━━━┫
┃   ┃ X ┃   ┃ X ┃    ┃   ┃   ┃   ┃   ┃    ┃   ┃   ┃   ┃   ┃
┗━━━┻━━━┻━━━┻━━━┛    ┗━━━┻━━━┻━━━┻━━━┛    ┗━━━┻━━━┻━━━┻━━━┛
  [ 1, 2, 2, 1,        [ 1, 2, 3, 4,        [ 0, 0, 0, 0,
    0, 1, 1, 0,          0, 1, 2, 3,          0, 0, 0, 0,
    1, 0, 1, 1,          1, 2, 3, 4,          0, 0, 0, 0,
    2, 1, 2, 2 ]         2, 3, 4, 5 ]         0, 0, 0, 0 ]

for (cell of board) {
  if (cell === 0) continue; // food
  else { ... } // check cells
}
*/
