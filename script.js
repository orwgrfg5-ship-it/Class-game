let speed = 1;
let score = 0;
let time = 0;
let alive = false;

let playerLane = 2;
let platforms = [];

let gameLoop;
let timerLoop;
let countdownLoop;

const colors = ["#ff004c","#00e5ff","#ffea00","#7dff00","#ff7b00"];

const diff = {
  easy: 50,
  normal: 50,
  hard: 100,
  hell: -200,
  impossible: -500
};

let countdown = 10;
let rigSpike = false;

function startGame() {

  document.getElementById("menu").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");
  document.getElementById("hud").classList.remove("hidden");
  document.getElementById("countdown").classList.remove("hidden");

  let difficulty = document.getElementById("difficulty").value;

  score = diff[difficulty];
  speed = 1;
  time = 0;
  alive = true;

  playerLane = 2;
  countdown = 10;

  platforms = [];

  movePlayer();
  spawnPlatforms();

  startLoops();
}

function spawnPlatforms() {

  document.querySelectorAll(".platform").forEach(p => p.remove());

  for (let i = 0; i < 8; i++) {
    createPlatform(i * 140);
  }
}

function createPlatform(y) {

  let lane = Math.floor(Math.random() * 5);

  let p = document.createElement("div");

  p.classList.add("platform");

  p.classList.add(Math.random() > 0.28 ? "safe" : "danger");

  p.style.bottom = y + "px";

  p.dataset.lane = lane;

  document.querySelectorAll(".lane")[lane].appendChild(p);

  platforms.push(p);
}

function startLoops() {

  clearInterval(gameLoop);
  clearInterval(timerLoop);
  clearInterval(countdownLoop);

  gameLoop = setInterval(updateGame, 16);

  timerLoop = setInterval(() => {

    if (!alive) return;

    time++;

    // SPEED SCALING (every 2 sec)
    if (time % 2 === 0) speed += 0.12;

    // SURVIVAL BONUS
    if (time === 5) score += 50;

    // TIMED REWARD
    if (time % 10 === 0) score += 50;

    // FLASH EFFECT
    document.body.style.background =
      colors[Math.floor(Math.random() * colors.length)];

    // RIG SYSTEM (fake “impossible moment” spikes)
    if (time > 15 && Math.random() < 0.2) {
      rigSpike = true;
      setTimeout(() => rigSpike = false, 1200);
    }

    updateHUD();

  }, 1000);

  countdownLoop = setInterval(() => {

    if (!alive) return;

    countdown--;

    if (countdown <= 0) countdown = 10;

    document.getElementById("countdown").innerText = countdown;

  }, 1000);
}

function updateGame() {

  if (!alive) return;

  platforms.forEach(p => {

    let y = parseFloat(p.style.bottom);

    let finalSpeed = speed;

    if (rigSpike) finalSpeed *= 1.7;

    y -= finalSpeed * 4;

    p.style.bottom = y + "px";

    if (y < -120) {
      p.remove();
      platforms = platforms.filter(x => x !== p);
      createPlatform(900);
    }

    // collision zone
    if (y < 120 && y > 40) {

      let lane = parseInt(p.dataset.lane);

      if (lane !== playerLane) {

        // near miss detection
        if (Math.abs(lane - playerLane) === 1) {
          document.getElementById("player").classList.add("near");

          setTimeout(() => {
            document.getElementById("player").classList.remove("near");
          }, 120);
        }

        endGame();
      }
    }
  });
}

window.addEventListener("keydown", e => {

  if (!alive) return;

  if (e.key === "a" || e.key === "ArrowLeft") playerLane--;
  if (e.key === "d" || e.key === "ArrowRight") playerLane++;

  if (playerLane < 0) playerLane = 0;
  if (playerLane > 4) playerLane = 4;

  movePlayer();
});

function movePlayer() {

  let p = document.getElementById("player");

  let center = window.innerWidth / 2;
  let laneWidth = 130;

  p.style.left =
    (center - 300 + playerLane * laneWidth) + "px";
}

function updateHUD() {

  document.getElementById("score").innerText = score;
  document.getElementById("time").innerText = time;
  document.getElementById("speed").innerText = speed.toFixed(1);
}

function endGame() {

  alive = false;

  document.getElementById("gameOver").classList.remove("hidden");

  document.getElementById("finalScore").innerText = score;

  clearInterval(gameLoop);
  clearInterval(timerLoop);
  clearInterval(countdownLoop);
}
