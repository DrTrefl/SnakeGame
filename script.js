const skins = ["lime", "cyan", "yellow", "orange", "magenta"];
let currentSkin = 0;

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const levelEl = document.getElementById("level");
const speedEl = document.getElementById("speed");
const highscoreEl = document.getElementById("highscore");
const menu = document.getElementById("menu");
const message = document.getElementById("message");
const controls = document.getElementById("controls");
const pauseBtn = document.getElementById("pauseBtn");
const restartBtn = document.getElementById("restartBtn");
const muteBtn = document.getElementById("muteBtn");
const eatSound = document.getElementById("eatSound");
const gameOverSound = document.getElementById("gameOverSound");

let snake, food, dx, dy, score, level, speed, gameLoop, isPaused = false, isMuted = false;

const gridSize = 20;
const maxCells = canvas.width / gridSize;

function resetGame(startSpeed) {
  dx = gridSize;
  dy = 0;
  score = 0;
  level = 1;
  speed = startSpeed;
  snake = [{ x: gridSize * 5, y: gridSize * 5 }];
  food = getRandomPosition();
  updateScore();
  clearInterval(gameLoop);
  gameLoop = setInterval(loop, 1000 / speed);
  message.style.display = "none";
  controls.style.display = "flex";
  currentSkin = 0;
}

function getRandomPosition() {
  return {
    x: Math.floor(Math.random() * maxCells) * gridSize,
    y: Math.floor(Math.random() * maxCells) * gridSize
  };
}

function loop() {
  if (isPaused) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let head = { x: snake[0].x + dx, y: snake[0].y + dy };

  if (head.x < 0 || head.y < 0 || head.x >= canvas.width || head.y >= canvas.height || snake.some(s => s.x === head.x && s.y === head.y)) {
    gameOver();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    if (!isMuted) eatSound.play();
    if (score % 5 === 0) {
      level++;
      speed += 1;
      currentSkin = (currentSkin + 1) % skins.length;
      clearInterval(gameLoop);
      gameLoop = setInterval(loop, 1000 / speed);
    }
    food = getRandomPosition();
  } else {
    snake.pop();
  }

  ctx.fillStyle = skins[currentSkin];
  snake.forEach((p, i) => {
    ctx.save();
    ctx.translate(p.x + gridSize / 2, p.y + gridSize / 2);
    const scale = 1 + Math.sin(Date.now() / 100 + i * 10) * 0.1;
    ctx.scale(scale, scale);
    ctx.fillRect(-gridSize / 2, -gridSize / 2, gridSize, gridSize);
    ctx.restore();
  });

  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, gridSize, gridSize);

  updateScore();
}

function updateScore() {
  scoreEl.textContent = score;
  levelEl.textContent = level;
  speedEl.textContent = speed;
  const record = Math.max(score, parseInt(localStorage.getItem("snakeHighscore") || "0"));
  highscoreEl.textContent = record;
  localStorage.setItem("snakeHighscore", record);
}

function gameOver() {
  clearInterval(gameLoop);
  message.style.display = "block";
  if (!isMuted) gameOverSound.play();
}

document.querySelectorAll("#menu button").forEach(btn => {
  btn.addEventListener("click", () => {
    menu.style.display = "none";
    resetGame(parseInt(btn.dataset.speed));
    canvas.focus();
  });
});

document.addEventListener("keydown", e => {
  if (e.key === "r" || e.key === "R") {
    resetGame(speed);
    canvas.focus();
  }
  if ((e.key === "ArrowUp" || e.key === "w") && dy === 0) {
    dx = 0;
    dy = -gridSize;
  }
  if ((e.key === "ArrowDown" || e.key === "s") && dy === 0) {
    dx = 0;
    dy = gridSize;
  }
  if ((e.key === "ArrowLeft" || e.key === "a") && dx === 0) {
    dx = -gridSize;
    dy = 0;
  }
  if ((e.key === "ArrowRight" || e.key === "d") && dx === 0) {
    dx = gridSize;
    dy = 0;
  }
});

pauseBtn.onclick = () => {
  isPaused = !isPaused;
  pauseBtn.textContent = isPaused ? "Resume" : "Pause";
};

restartBtn.onclick = () => {
  resetGame(speed);
  canvas.focus();
};

muteBtn.onclick = () => {
  isMuted = !isMuted;
  muteBtn.textContent = isMuted ? "Enable sound" : "Disable sound";
};