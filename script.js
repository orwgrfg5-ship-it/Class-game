let speed = 6;
let score = 0;
let time = 0;
let alive = false;

let playerY = 0;
let velocity = 0;
let jumping = false;

let obstacles = [];

const colors = ["#ff004c","#00e5ff","#ffea00","#7dff00","#ff7b00"];

let last = 0;

/* ---------------- MENU ---------------- */

function showPlay() {
  hideAllMenus();
  document.getElementById("playMenu").classList.remove("hidden");
}

function showRules() {
  hideAllMenus();
  document.getElementById("rulesMenu").classList.remove("hidden");
}

function showLeaderboard() {
  hideAllMenus();
  document.getElementById("leaderboardMenu").classList.remove("hidden");
  loadLeaderboard();
}

function backMenu() {
  hideAllMenus();
  document.getElementById("menu").classList.remove("hidden");
}

function hideAllMenus() {
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("playMenu").classList.add("hidden");
  document.getElementById("rulesMenu").classList.add("hidden");
  document.getElementById("leaderboardMenu").classList.add("hidden");
}

/* ---------------- GAME START ---------------- */

function startGame() {

  hideAllMenus();

  document.getElementById("game").classList.remove("hidden");
  document.getElementById("hud").classList.remove("hidden");

  score = 0;
  speed = 6;
  time = 0;
  alive = true;

  playerY = 0;
  velocity = 0;
  jumping = false;

  obstacles = [];

  requestAnimationFrame(loop);
}

/* ---------------- GAME LOOP ---------------- */

function loop(t) {

  if (!alive) return;

  if (!last) last = t;
  let dt = (t - last) / 16;
  last = t;

  update(dt);

  requestAnimationFrame(loop);
}

/* ---------------- UPDATE ---------------- */

function update(dt) {

  time += dt * 0.016;

  if (Math.floor(time) % 2 === 0) speed += 0.02;
  if (Math.floor(time) === 5) score += 50;
  if (Math.floor(time) % 10 === 0) score += 50;

  if (Math.random() < 0.01) {
    document.body.style.background =
      colors[Math.floor(Math.random() * colors.length)];
  }

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

/* ---------------- OBSTACLES ---------------- */

function createObstacle() {

  let o = document.createElement("div");

  o.classList.add("obstacle");
  o.classList.add(Math.random() > 0.5 ? "spike" : "block");

  o.style.left = "100vw";

  document.getElementById("game").appendChild(o);

  obstacles.push(o);
}

/* ---------------- INPUT ---------------- */

window.addEventListener("keydown", e => {
  if (!alive) return;

  if (e.code === "Space" && !jumping) {
    velocity = -12;
    jumping = true;
  }
});

/* ---------------- HUD ---------------- */

function updateHUD() {
  document.getElementById("score").innerText = score.toFixed(0);
  document.getElementById("time").innerText = Math.floor(time);
  document.getElementById("speed").innerText = speed.toFixed(2);
}

/* ---------------- GAME OVER + NAME INPUT ---------------- */

function endGame() {

  alive = false;

  document.getElementById("gameOver").classList.remove("hidden");

  let name = prompt("Enter your name for leaderboard:");

  if (name) saveScore(name, Math.floor(score));

  setTimeout(() => {
    location.reload();
  }, 2000);
}

/* ---------------- LEADERBOARD ---------------- */

function saveScore(name, score) {

  let board = JSON.parse(localStorage.getItem("leaderboard") || "[]");

  board.push({ name, score });

  board.sort((a,b) => b.score - a.score);

  board = board.slice(0, 10);

  localStorage.setItem("leaderboard", JSON.stringify(board));
}

function loadLeaderboard() {

  let board = JSON.parse(localStorage.getItem("leaderboard") || "[]");

  let div = document.getElementById("leaderboard");

  div.innerHTML = "";

  board.forEach((p, i) => {
    div.innerHTML += `${i+1}. ${p.name} - ${p.score}<br>`;
  });
}
