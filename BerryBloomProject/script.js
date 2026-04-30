const pages = {
  welcome: document.getElementById("welcomePage"),
  game: document.getElementById("gamePage"),
  choice: document.getElementById("choicePage")
};

function showPage(pageName) {
  for (const key in pages) {
    pages[key].classList.remove("active");
  }

  pages[pageName].classList.add("active");
  window.scrollTo(0, 0);
}

document.getElementById("welcomeNextBtn").addEventListener("click", () => {
  showPage("game");
});

document.getElementById("gameBackBtn").addEventListener("click", () => {
  showPage("welcome");
});

document.getElementById("choiceBackBtn").addEventListener("click", () => {
  showPage("game");
});

/* CELLULAR AUTOMATON */

const canvas = document.getElementById("gardenCanvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stepBtn = document.getElementById("stepBtn");
const clearBtn = document.getElementById("clearBtn");
const resetBtn = document.getElementById("resetBtn");
const brushSelect = document.getElementById("brushSelect");
const presetSelect = document.getElementById("presetSelect");
const loadPresetBtn = document.getElementById("loadPresetBtn");
const generationCount = document.getElementById("generationCount");
const strawberryCountText = document.getElementById("strawberryCount");
const harvestMessage = document.getElementById("harvestMessage");

const ROWS = 12;
const COLS = 18;
const CELL_SIZE = 62;

canvas.width = COLS * CELL_SIZE;
canvas.height = ROWS * CELL_SIZE;

const SOIL = 0;
const SEED = 1;
const BLOSSOM = 2;
const STRAWBERRY = 3;
const WITHERED = 4;
const PEBBLE = 5;
const SUN = 6;
const WATER = 7;
const RAIN = 8;

const FALLBACK_COLORS = {
  [SOIL]: "#8b4513",
  [SEED]: "#ffd166",
  [BLOSSOM]: "#f8f9a1",
  [STRAWBERRY]: "#e63946",
  [WITHERED]: "#6c584c",
  [PEBBLE]: "#adb5bd",
  [SUN]: "#ffd60a",
  [WATER]: "#74c0fc",
  [RAIN]: "#4dabf7"
};

const IMAGE_PATHS = {
  [SOIL]: "images/soil.png",
  [SEED]: "images/seed.png",
  [BLOSSOM]: "images/blossom.png",
  [STRAWBERRY]: "images/strawberry.png",
  [WITHERED]: "images/withered.png",
  [PEBBLE]: "images/pebble.png",
  [SUN]: "images/sun.png",
  [WATER]: "images/water.png",
  [RAIN]: "images/rain.png"
};

const stateImages = {};

let grid = [];
let generation = 0;
let running = false;
let intervalId = null;

function loadImages() {
  const imagePromises = [];

  for (const state in IMAGE_PATHS) {
    const img = new Image();
    img.src = IMAGE_PATHS[state];
    stateImages[state] = img;

    imagePromises.push(
      new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      })
    );
  }

  return Promise.all(imagePromises);
}

function createEmptyGrid() {
  const newGrid = [];

  for (let r = 0; r < ROWS; r++) {
    const row = [];

    for (let c = 0; c < COLS; c++) {
      row.push(SOIL);
    }

    newGrid.push(row);
  }

  return newGrid;
}

function createRandomGrid() {
  const newGrid = [];

  for (let r = 0; r < ROWS; r++) {
    const row = [];

    for (let c = 0; c < COLS; c++) {
      const value = Math.random();

      if (value < 0.42) {
  row.push(SOIL);
} else if (value < 0.55) {
  row.push(SEED);
} else if (value < 0.65) {
  row.push(BLOSSOM);
} else if (value < 0.72) {
  row.push(STRAWBERRY);
} else if (value < 0.80) {
  row.push(PEBBLE);
} else if (value < 0.88) {
  row.push(SUN);
} else if (value < 0.94) {
  row.push(WATER);
} else {
  row.push(RAIN);
}
    }

    newGrid.push(row);
  }

  return newGrid;
}

function drawCell(state, x, y) {
  ctx.fillStyle = "#fff7dc";
  ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);

  const img = stateImages[state];
  const padding = 4;
  const imageSize = CELL_SIZE - padding * 2;

  if (img && img.complete && img.naturalWidth > 0) {
    ctx.drawImage(img, x + padding, y + padding, imageSize, imageSize);
  } else {
    ctx.fillStyle = FALLBACK_COLORS[state];
    ctx.fillRect(x + padding, y + padding, imageSize, imageSize);
  }

  ctx.lineWidth = 1;
  ctx.strokeStyle = "#f3b3c8";
  ctx.strokeRect(x, y, CELL_SIZE, CELL_SIZE);
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = c * CELL_SIZE;
      const y = r * CELL_SIZE;
      drawCell(grid[r][c], x, y);
    }
  }

  generationCount.textContent = generation;
  strawberryCountText.textContent = countAllStrawberries();
}

function getNeighborStates(r, c) {
  const neighbors = [];

  const positions = [
    [r - 1, c], // up
    [r + 1, c], // down
    [r, c - 1], // left
    [r, c + 1]  // right
  ];

  for (let i = 0; i < positions.length; i++) {
    const nr = positions[i][0];
    const nc = positions[i][1];

    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
      neighbors.push(grid[nr][nc]);
    }
  }

  return neighbors;
}

function countState(neighbors, state) {
  let count = 0;

  for (let i = 0; i < neighbors.length; i++) {
    if (neighbors[i] === state) {
      count++;
    }
  }

  return count;
}

function hasState(neighbors, state) {
  return countState(neighbors, state) > 0;
}

function hasWaterSource(neighbors) {
  return hasState(neighbors, WATER) || hasState(neighbors, RAIN);
}

function hasSunAndWater(neighbors) {
  return hasState(neighbors, SUN) && hasWaterSource(neighbors);
}

function transition(currentState, neighbors) {
  const seedCount = countState(neighbors, SEED);
  const strawberryCount = countState(neighbors, STRAWBERRY);
  const hasLifeSupport = hasSunAndWater(neighbors);

  if (currentState === SUN || currentState === WATER || currentState === RAIN || currentState === PEBBLE) {
    return currentState;
  }

  if (currentState === WITHERED) {
    if (hasLifeSupport && seedCount >= 2) {
      return SOIL;
    }

    return WITHERED;
  }

  if (currentState === SOIL) {
    if (seedCount >= 1) {
      return SEED;
    }

  }

  if (currentState === SEED) {
    if (!hasLifeSupport) {
      return WITHERED;
    }

    return BLOSSOM;
  }

  if (currentState === BLOSSOM) {
    if (!hasLifeSupport) {
      return WITHERED;
    }

    return STRAWBERRY;
  }

  if (currentState === STRAWBERRY) {
    if (!hasLifeSupport) {
      return WITHERED;
    }

    return STRAWBERRY;
  }

  return currentState;
}

function stepGeneration() {
  const oldGrid = grid;
  const newGrid = createEmptyGrid();

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const neighbors = getNeighborStates(r, c);
      newGrid[r][c] = transition(grid[r][c], neighbors);
    }
  }

  const stable = gridsAreSame(oldGrid, newGrid);

  grid = newGrid;
  generation++;
  drawGrid();

  if (stable && running) {
    running = false;
    clearInterval(intervalId);
    checkHarvest();
  }
}

function startSimulation() {
  harvestMessage.classList.add("hidden");

  if (!running) {
    running = true;

    intervalId = setInterval(() => {
      stepGeneration();
    }, 800);
  }
}

function pauseSimulation() {
  running = false;
  clearInterval(intervalId);
  checkHarvest();
}

function gridsAreSame(oldGrid, newGrid) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (oldGrid[r][c] !== newGrid[r][c]) {
        return false;
      }
    }
  }

  return true;
}

function clearGrid() {
  running = false;
  clearInterval(intervalId);
  harvestMessage.classList.add("hidden");
  grid = createEmptyGrid();
  generation = 0;
  drawGrid();
}

function resetGrid() {
  running = false;
  clearInterval(intervalId);
  harvestMessage.classList.add("hidden");
  grid = createRandomGrid();
  generation = 0;
  drawGrid();
}

function loadPreset() {
  running = false;
  clearInterval(intervalId);
  harvestMessage.classList.add("hidden");
  grid = createEmptyGrid();
  generation = 0;

  const preset = presetSelect.value;

  if (preset === "random") {
    grid = createRandomGrid();
  }

  if (preset === "balanced") {
    for (let r = 3; r < 9; r++) {
      for (let c = 5; c < 13; c++) {
        grid[r][c] = SEED;
      }
    }

    for (let c = 3; c < 16; c += 4) {
      grid[2][c] = SUN;
      grid[10][c] = WATER;
    }

    grid[5][2] = RAIN;
    grid[6][15] = RAIN;
  }

  if (preset === "dry") {
    for (let r = 4; r < 8; r++) {
      for (let c = 6; c < 12; c++) {
        grid[r][c] = SEED;
      }
    }

    grid[2][5] = SUN;
    grid[2][12] = SUN;
    grid[9][8] = THORNY_VINE;
    grid[9][9] = THORNY_VINE;
  }

  if (preset === "rainy") {
    for (let r = 3; r < 9; r++) {
      for (let c = 5; c < 13; c++) {
        grid[r][c] = BLOSSOM;
      }
    }

    grid[1][4] = SUN;
    grid[1][8] = SUN;
    grid[1][12] = SUN;
    grid[10][6] = RAIN;
    grid[10][10] = RAIN;
    grid[10][14] = WATER;
  }

  drawGrid();
}

function handleCanvasClick(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;

  const col = Math.floor(x / CELL_SIZE);
  const row = Math.floor(y / CELL_SIZE);

  if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
    grid[row][col] = Number(brushSelect.value);
    harvestMessage.classList.add("hidden");
    drawGrid();
  }
}

function countAllStrawberries() {
  let total = 0;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (grid[r][c] === STRAWBERRY) {
        total++;
      }
    }
  }

  return total;
}

function checkHarvest() {
  const total = countAllStrawberries();

  harvestMessage.classList.remove("hidden");

  if (total >= 20) {
    harvestMessage.innerHTML = `
      <h2>Yay! A Sweet Harvest!</h2>
      <p>Good job! The harvest season was very good this year.</p>
      <p>We collected <strong>${total}</strong> strawberries, so we have enough to make something delicious.</p>
      <button id="goToChoiceBtn">Next</button>
    `;

    document.getElementById("goToChoiceBtn").addEventListener("click", () => {
      showPage("choice");
    });
  } else {
    harvestMessage.innerHTML = `
      <h2>Harvest Over</h2>
      <p>Not enough strawberries were harvested this season.</p>
      <p>You collected <strong>${total}</strong> strawberries. Try next season and make sure your plants have both sunlight and water.</p>
    `;
  }
}

/* SWEET CHOICE PAGE */

const sweetData = {
  cupcake: {
    title: "Strawberry Cupcake",
    image: "images/cupcakeLeft.png",
    ingredients: [
      "Fresh strawberries",
      "Cupcake batter",
      "Pink frosting",
      "Sprinkles",
      "A little garden magic"
    ],
    steps: [
      "Wash and slice the strawberries.",
      "Bake the cupcakes until golden.",
      "Add pink frosting on top.",
      "Place strawberries and sprinkles on the frosting.",
      "Serve your sweet Berry Bloom cupcake."
    ]
  },

  birthday: {
    title: "Birthday Cake",
    image: "images/friendBirthday.png",
    ingredients: [
      "Fresh strawberries",
      "Vanilla cake layers",
      "Strawberry filling",
      "Whipped frosting",
      "Birthday decorations"
    ],
    steps: [
      "Bake soft vanilla cake layers.",
      "Spread strawberry filling between the layers.",
      "Cover the cake with frosting.",
      "Decorate with strawberries.",
      "Share it for a happy Berry Bloom birthday."
    ]
  },

  jam: {
    title: "Strawberry Jam",
    image: "images/jam.png",
    ingredients: [
      "Fresh strawberries",
      "Sugar",
      "Lemon juice",
      "A clean jar",
      "A ribbon for decoration"
    ],
    steps: [
      "Mash the strawberries gently.",
      "Cook them with sugar and lemon juice.",
      "Stir until the jam thickens.",
      "Pour it into a clean jar.",
      "Let it cool and enjoy it later."
    ]
  },

  picnic: {
    title: "Picnic with Friends",
    image: "images/picnicRight.jpg",
    ingredients: [
      "Fresh strawberries",
      "Sandwiches",
      "Juice",
      "A picnic blanket",
      "Friends to share with"
    ],
    steps: [
      "Pack the strawberries in a basket.",
      "Prepare snacks and drinks.",
      "Choose a sunny garden spot.",
      "Set up the picnic blanket.",
      "Enjoy the harvest with friends."
    ]
  },

  bigcake: {
    title: "Big Strawberry Cake",
    image: "images/Cake2Right.png",
    ingredients: [
      "Many fresh strawberries",
      "Cake layers",
      "Cream filling",
      "Strawberry slices",
      "Sweet frosting"
    ],
    steps: [
      "Bake several cake layers.",
      "Add cream and strawberry slices between layers.",
      "Stack the cake carefully.",
      "Cover it with frosting.",
      "Decorate the top with a big strawberry."
    ]
  }
};

const choiceMenu = document.getElementById("choiceMenu");
const sweetResult = document.getElementById("sweetResult");
const sweetImage = document.getElementById("sweetImage");
const sweetTitle = document.getElementById("sweetTitle");
const ingredientsList = document.getElementById("ingredientsList");
const stepsList = document.getElementById("stepsList");
const chooseAnotherBtn = document.getElementById("chooseAnotherBtn");
const restartBtn = document.getElementById("restartBtn");

document.querySelectorAll("[data-sweet]").forEach((button) => {
  button.addEventListener("click", () => {
    showSweet(button.dataset.sweet);
  });
});

function showSweet(sweetKey) {
  const sweet = sweetData[sweetKey];

  choiceMenu.classList.add("hidden");
  sweetResult.classList.remove("hidden");

  sweetImage.src = sweet.image;
  sweetImage.alt = sweet.title;
  sweetTitle.textContent = sweet.title;

  ingredientsList.innerHTML = "";
  stepsList.innerHTML = "";

  sweet.ingredients.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    ingredientsList.appendChild(li);
  });

  sweet.steps.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    stepsList.appendChild(li);
  });
}

chooseAnotherBtn.addEventListener("click", () => {
  sweetResult.classList.add("hidden");
  choiceMenu.classList.remove("hidden");
});

restartBtn.addEventListener("click", () => {
  running = false;
  clearInterval(intervalId);
  harvestMessage.classList.add("hidden");
  grid = createRandomGrid();
  generation = 0;
  drawGrid();
  sweetResult.classList.add("hidden");
  choiceMenu.classList.remove("hidden");
  showPage("welcome");
});

/* EVENT LISTENERS */

startBtn.addEventListener("click", startSimulation);
pauseBtn.addEventListener("click", pauseSimulation);
stepBtn.addEventListener("click", stepGeneration);
clearBtn.addEventListener("click", clearGrid);
resetBtn.addEventListener("click", resetGrid);
loadPresetBtn.addEventListener("click", loadPreset);
canvas.addEventListener("click", handleCanvasClick);

loadImages().then(() => {
  grid = createRandomGrid();
  drawGrid();
});