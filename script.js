let speed = 6;
let score = 0;
let time = 0;
let alive = false;

let playerY = 0;
let velocity = 0;
let jumping = false;

let obstacles = [];

const colors = ["#ff004c","#00e5ff","#ffea00","#7dff00","#ff7b00"];

/* ---------------- MENU FLOW ---------------- */

function hideAll() {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
}

function backToMenu() {
  hideAll();
  document.getElementById("menu").classList.remove("hidden");
}

function openPlay() {
  hideAll();
  document.getElementById("playMenu").classList.remove("hidden");
}

function openRules() {
  hideAll();
  document.getElementById("rulesMenu").classList.remove("hidden");
}

function openLeaderboard() {
  hideAll();
  document.getElementById("leaderboardMenu").classList.remove("hidden");
  loadLeaderboard();
}

/* ---------------- GAME START ---------------- */

function startGame(diff) {

  hideAll();

  document.getElementById("game").classList.remove("hidden");
  document.getElementById("hud").classList.remove("hidden");

  score = diff === "easy" ? 50 :
          diff === "normal" ? 50 :
          diff === "hard" ? 100 :
          diff === "hell" ? -200 : -500;

  speed = 6;
  time = 0;
  alive = true;

  playerY = 0;
  velocity = 0;
  jumping = false;

  obstacles = [];

  requestAnimationFrame(loop);
}

/* ---------------- INPUT ---------------- */

window.addEventListener("keydown", e => {
  if (!alive) return;

  if (e.code === "Space" && !jumping) {
    velocity = -12;
    jumping = true;
  }
});

/* ---------------- LOOP ---------------- */

let last = 0;

function loop(t) {

  if (!alive) return;

  if (!last) last = t;
  let dt = (t - last) / 16;
  last = t;

  update(dt);

  requestAnimationFrame(loop);
}

/* ---------------- GAME ---------------- */

function update(dt) {

  time += dt * 0.016;

  if (Math.floor(time) % 2 === 0) speed += 0.02;
  if (Math.floor(time) === 5) score += 50;
  if (Math.floor(time) % 10 === 0) score += 50;

  if (Math.random() < 0.01) {
    document.body.style.background =
      colors[Math.floor(Math.random()*colors.length)];
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

/* ---------------- HUD ---------------- */

function updateHUD() {
  document.getElementById("score").innerText = Math.floor(score);
  document.getElementById("time").innerText = Math.floor(time);
  document.getElementById("speed").innerText = speed.toFixed(2);
}

/* ---------------- GAME OVER + LEADERBOARD ---------------- */

function endGame() {

  alive = false;

  let name = prompt("Enter name:");

  if (name) saveScore(name, Math.floor(score));

  location.reload();
}

/* ---------------- LEADERBOARD ---------------- */

function saveScore(name, score) {

  let board = JSON.parse(localStorage.getItem("board") || "[]");

  board.push({ name, score });

  board.sort((a,b) => b.score - a.score);

  board = board.slice(0, 10);

  localStorage.setItem("board", JSON.stringify(board));
}

function loadLeaderboard() {

  let board = JSON.parse(localStorage.getItem("board") || "[]");

  let div = document.getElementById("leaderboard");

  div.innerHTML = "";

  board.forEach((p,i) => {
    div.innerHTML += `${i+1}. ${p.name} - ${p.score}<br>`;
  });
}
