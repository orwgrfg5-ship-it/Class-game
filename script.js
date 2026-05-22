let speed = 6;
let score = 0;
let time = 0;
let alive = false;

let playerY = 0;
let velocity = 0;
let jumping = false;

let obstacles = [];

let loopId = null;

const colors = ["#ff004c","#00e5ff","#ffea00","#7dff00","#ff7b00"];

const diff = {
  easy: 50,
  normal: 50,
  hard: 100,
  hell: -200,
  impossible: -500
};

function startGame() {

  // hide menu, show game
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("game").classList.remove("hidden");
  document.getElementById("hud").classList.remove("hidden");
  document.getElementById("gameOver").classList.add("hidden");

  let d = document.getElementById("difficulty").value;

  score = diff[d];
  speed = 6;
  time = 0;
  alive = true;

  playerY = 0;
  velocity = 0;
  jumping = false;

  obstacles = [];

  document.querySelectorAll(".obstacle").forEach(o => o.remove());

  requestAnimationFrame(loop);
}

/* MENU RETURN ON GAME OVER (important fix) */
function endGame() {

  alive = false;

  document.getElementById("gameOver").classList.remove("hidden");

  document.getElementById("finalScore").innerText = Math.floor(score);

  setTimeout(() => {
    document.getElementById("menu").classList.remove("hidden");
  }, 1500);
}

/* INPUT */
window.addEventListener("keydown", e => {
  if (!alive) return;

  if (e.code === "Space" && !jumping) {
    velocity = -12;
    jumping = true;
  }
});

/* MAIN LOOP */
let last = 0;

function loop(t) {

  if (!alive) return;

  if (!last) last = t;
  let dt = (t - last) / 16;
  last = t;

  update(dt);

  requestAnimationFrame(loop);
}

function update(dt) {

  time += dt * 0.016;

  if (Math.floor(time) % 2 === 0) speed += 0.02;

  if (Math.floor(time) === 5) score += 50;
  if (Math.floor(time) % 10 === 0) score += 50;

  if (Math.random() < 0.01) {
    document.body.style.background =
      colors[Math.floor(Math.random() * colors.length)];
  }

  // physics
  velocity += 0.6;
  playerY -= velocity;

  if (playerY < 0) {
    playerY = 0;
    jumping = false;
  }

  document.getElementById("player").style.bottom =
    (120 + playerY) + "px";

  if (Math.random() < 0.03) createObstacle();

  obstacles.forEach(o => {

    let x = parseFloat(o.style.left);
    x -= speed;

    o.style.left = x + "px";

    if (x < 170 && x > 110 && playerY < 50) {
      endGame();
    }

    if (x < -100) {
      o.remove();
      obstacles = obstacles.filter(e => e !== o);
    }
  });

  updateHUD();
}

/* OBSTACLES */
function createObstacle() {

  let o = document.createElement("div");

  o.classList.add("obstacle");
  o.classList.add(Math.random() > 0.5 ? "spike" : "block");

  o.style.left = "100vw";

  document.getElementById("game").appendChild(o);

  obstacles.push(o);
}

/* HUD */
function updateHUD() {
  document.getElementById("score").innerText = score.toFixed(0);
  document.getElementById("time").innerText = Math.floor(time);
  document.getElementById("speed").innerText = speed.toFixed(2);
}
