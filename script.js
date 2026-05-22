let speed = 6;
let score = 0;
let time = 0;
let alive = false;

let playerY = 0;
let gravity = 0;
let jumping = false;

let obstacles = [];

let gameLoop;
let timerLoop;

function startGame() {

  document.getElementById("menu").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");
  document.getElementById("hud").classList.remove("hidden");

  let diff = document.getElementById("difficulty").value;

  score = diff === "easy" ? 50 :
          diff === "normal" ? 50 :
          diff === "hard" ? 100 :
          diff === "hell" ? -200 : -500;

  speed = 6;
  time = 0;
  alive = true;

  obstacles = [];
  playerY = 0;
  gravity = 0;
  jumping = false;

  spawnStart();

  gameLoop = setInterval(updateGame, 16);

  timerLoop = setInterval(() => {

    if (!alive) return;

    time++;

    if (time % 2 === 0) speed += 0.25;
    if (time % 10 === 0) score += 50;

    updateHUD();

    document.body.style.background =
      ["#ff004c","#00e5ff","#ffea00","#7dff00"][Math.floor(Math.random()*4)];

  }, 1000);
}

/* JUMP */
window.addEventListener("keydown", e => {

  if (!alive) return;

  if (e.code === "Space") {
    if (!jumping) {
      gravity = -12;
      jumping = true;
    }
  }
});

function updateGame() {

  if (!alive) return;

  let player = document.getElementById("player");

  /* gravity system */
  gravity += 0.6;
  playerY -= gravity;

  if (playerY < 0) {
    playerY = 0;
    jumping = false;
  }

  player.style.bottom = (120 + playerY) + "px";

  /* spawn obstacles */
  if (Math.random() < 0.03) {
    createObstacle();
  }

  obstacles.forEach(o => {

    let x = parseFloat(o.style.left);

    x -= speed;

    o.style.left = x + "px";

    /* collision */
    if (x < 170 && x > 100 && playerY < 50) {
      endGame();
    }

    if (x < -100) {
      o.remove();
      obstacles = obstacles.filter(e => e !== o);
    }
  });
}

function createObstacle() {

  let o = document.createElement("div");

  o.classList.add("obstacle");

  o.classList.add(Math.random() > 0.5 ? "spike" : "block");

  o.style.left = "100vw";

  document.getElementById("game").appendChild(o);

  obstacles.push(o);
}

function spawnStart() {
  obstacles = [];
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
}
