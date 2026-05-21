let speed = 1;
let score = 0;
let time = 0;
let alive = false;

let playerLane = 2;

let platforms = [];

let bgColors = ["#ff004c","#00e5ff","#ffea00","#7dff00","#ff7b00"];

const difficultyData = {
  easy: { start: 50, mult: 1 },
  normal: { start: 50, mult: 1.3 },
  hard: { start: 100, mult: 1.7 },
  hell: { start: -200, mult: 2.2 },
  impossible: { start: -500, mult: 3 }
};

let rigMode = false;

function startGame() {

  document.getElementById("menu").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");
  document.getElementById("hud").classList.remove("hidden");
  document.getElementById("countdown").classList.remove("hidden");

  let diff = document.getElementById("difficulty").value;

  score = difficultyData[diff].start;
  speed = difficultyData[diff].mult;

  alive = true;
  time = 0;
  platforms = [];

  spawnPlatforms();
  loops();
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

  p.classList.add(Math.random() > 0.25 ? "safe" : "danger");

  p.style.bottom = y + "px";

  p.dataset.lane = lane;

  document.querySelectorAll(".lane")[lane].appendChild(p);

  platforms.push(p);
}

function loops() {

  setInterval(gameLoop, 16);

  setInterval(() => {

    if (!alive) return;

    time++;

    // SPEED SCALING
    if (time % 2 === 0) speed += 0.1;

    // SURVIVAL BONUS
    if (time === 5) score += 50;

    // TIMED REWARD
    if (time % 10 === 0) score += 50;

    // FLASH COLORS
    document.body.style.background =
      bgColors[Math.floor(Math.random()*bgColors.length)];

    updateHUD();

    // RIG SYSTEM (natural difficulty spikes)
    if (time > 20 && Math.random() < 0.15) {
      rigMode = true;
      setTimeout(() => rigMode = false, 1500);
    }

  }, 1000);

  setInterval(() => {
    let c = document.getElementById("countdown");
    let v = parseInt(c.innerText);
    v--;
    if (v <= 0) v = 10;
    c.innerText = v;
  }, 1000);
}

function gameLoop() {

  if (!alive) return;

  platforms.forEach(p => {

    let y = parseFloat(p.style.bottom);

    let finalSpeed = speed;

    if (rigMode) finalSpeed *= 1.6;

    y -= finalSpeed * 4;

    p.style.bottom = y + "px";

    // remove + respawn
    if (y < -120) {
      p.remove();
      platforms = platforms.filter(x => x !== p);
      createPlatform(1000);
    }

    // collision zone
    if (y < 120 && y > 40) {

      let lane = parseInt(p.dataset.lane);

      if (lane !== playerLane) {

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

  p.style.left = (center - 300 + playerLane * 130) + "px";
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
}
