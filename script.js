const game = document.getElementById("game");
const player = document.getElementById("player");

const scoreText = document.getElementById("score");
const timeText = document.getElementById("time");
const speedText = document.getElementById("speed");

const finalScore = document.getElementById("finalScore");

const gameOverScreen = document.getElementById("gameOver");

const countdownText = document.getElementById("countdown");

const startButton = document.getElementById("startButton");

const COLORS = [
  "#ff004c",
  "#00e5ff",
  "#ffea00",
  "#7dff00",
  "#ff7b00",
  "#d400ff"
];

const difficulties = {
  easy: {
    startCoins: 50,
    speed: 1
  },

  normal: {
    startCoins: 50,
    speed: 1.3
  },

  hard: {
    startCoins: 100,
    speed: 1.7
  },

  hell: {
    startCoins: -200,
    speed: 2.3
  },

  impossible: {
    startCoins: -500,
    speed: 3
  }
};

let playerLane = 2;

let speed = 1;

let score = 0;

let timeAlive = 0;

let countdown = 10;

let alive = false;

let platforms = [];

let gameLoop;
let timerLoop;
let countdownLoop;

startButton.onclick = startGame;

function startGame() {

  document.getElementById("menu").classList.add("hidden");

  game.classList.remove("hidden");

  document.getElementById("hud").classList.remove("hidden");

  countdownText.classList.remove("hidden");

  const difficulty =
    document.getElementById("difficulty").value;

  speed = difficulties[difficulty].speed;

  score = difficulties[difficulty].startCoins;

  alive = true;

  timeAlive = 0;

  platforms = [];

  updateHUD();

  movePlayer();

  generatePlatforms();

  startLoops();
}

function startLoops() {

  gameLoop = setInterval(updateGame, 16);

  timerLoop = setInterval(() => {

    timeAlive++;

    if (timeAlive === 5) {
      score += 50;
    }

    if (timeAlive % 10 === 0) {
      score += 50;
      countdown = 10;
    }

    if (timeAlive % 2 === 0) {

      speed += 0.12;

      document.body.style.background =
        COLORS[Math.floor(Math.random() * COLORS.length)];
    }

    updateHUD();

  }, 1000);

  countdownLoop = setInterval(() => {

    countdown--;

    if (countdown <= 0) {
      countdown = 10;
    }

    countdownText.innerText = countdown;

  }, 1000);
}

function generatePlatforms() {

  document.querySelectorAll(".platform").forEach(p => p.remove());

  for (let i = 0; i < 8; i++) {

    const lane = Math.floor(Math.random() * 5);

    const platform = document.createElement("div");

    platform.classList.add("platform");

    platform.classList.add(
      Math.random() > 0.25 ? "safe" : "danger"
    );

    platform.style.bottom = `${i * 150}px`;

    platform.dataset.lane = lane;

    document
      .querySelectorAll(".lane")[lane]
      .appendChild(platform);

    platforms.push(platform);
  }
}

function updateGame() {

  if (!alive) return;

  platforms.forEach(platform => {

    let bottom =
      parseFloat(platform.style.bottom);

    bottom -= speed * 4;

    platform.style.bottom = `${bottom}px`;

    if (bottom < -120) {

      platform.remove();

      platforms =
        platforms.filter(p => p !== platform);

      createPlatform();
    }

    if (bottom < 120 && bottom > 40) {

      const lane =
        parseInt(platform.dataset.lane);

      if (lane !== playerLane) {

        if (Math.abs(lane - playerLane) === 1) {

          player.classList.add("nearMiss");

          setTimeout(() => {
            player.classList.remove("nearMiss");
          }, 120);
        }

        endGame();
      }
    }
  });
}

function createPlatform() {

  const lane = Math.floor(Math.random() * 5);

  const platform = document.createElement("div");

  platform.classList.add("platform");

  platform.classList.add(
    Math.random() > 0.25 ? "safe" : "danger"
  );

  platform.style.bottom = "1000px";

  platform.dataset.lane = lane;

  document
    .querySelectorAll(".lane")[lane]
    .appendChild(platform);

  platforms.push(platform);
}

function movePlayer() {

  const laneWidth = 130;

  player.style.left =
    `${window.innerWidth / 2 - 325 + playerLane * laneWidth + 25}px`;
}

window.addEventListener("keydown", e => {

  if (!alive) return;

  if (e.key === "ArrowLeft" || e.key === "a") {

    playerLane--;

    if (playerLane < 0) {
      playerLane = 0;
    }

    movePlayer();
  }

  if (e.key === "ArrowRight" || e.key === "d") {

    playerLane++;

    if (playerLane > 4) {
      playerLane = 4;
    }

    movePlayer();
  }
});

function updateHUD() {

  scoreText.innerText = score;

  timeText.innerText = timeAlive;

  speedText.innerText =
    speed.toFixed(1);
}

function endGame() {

  alive = false;

  clearInterval(gameLoop);

  clearInterval(timerLoop);

  clearInterval(countdownLoop);

  finalScore.innerText = score;

  gameOverScreen.classList.remove("hidden");
}

function restartGame() {

  location.reload();
}
