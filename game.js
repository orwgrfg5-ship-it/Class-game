// Game State
const gameState = {
    currentScreen: 'mainMenu',
    difficulty: null,
    score: 0,
    timeElapsed: 0,
    gameRunning: false,
    gamePaused: false,
    speedMultiplier: 1.0,
    playerStats: [],
    colorSchemeIndex: 0,
    colorSchemes: [
        ['#FF006E', '#00D9FF', '#FFBE0B'],
        ['#00D9FF', '#FFBE0B', '#FB5607'],
        ['#FFBE0B', '#FB5607', '#FF006E'],
        ['#FB5607', '#FF006E', '#00D9FF'],
    ],
    gameStartTime: 0,
    survivalBonusApplied: false,
    gracePeriodActive: true,
    gracePeriodDuration: 3000,
    platformMovementIntervalId: null,
};

// Difficulty Settings
const difficultySettings = {
    easy: {
        name: 'Easy',
        cost: 0,
        startScore: 50,
        maxScore: 100,
        survivalBonus: 50,
        timedReward: 0,
        speedIncrement: 0.02,
        speedIncrementInterval: 2000,
        color: '#00FF00',
    },
    normal: {
        name: 'Normal',
        cost: 0,
        startScore: 50,
        maxScore: 200,
        survivalBonus: 50,
        timedReward: 50,
        timedRewardInterval: 10000,
        speedIncrement: 0.03,
        speedIncrementInterval: 2000,
        color: '#00D9FF',
    },
    hard: {
        name: 'Hard',
        cost: 0,
        startScore: 100,
        maxScore: 300,
        survivalBonus: 0,
        timedReward: 0,
        winReward: 300,
        speedIncrement: 0.05,
        speedIncrementInterval: 2000,
        color: '#FFBE0B',
    },
    hell: {
        name: 'Hell',
        cost: 200,
        startScore: 0,
        maxScore: 500,
        survivalBonus: 0,
        timedReward: 0,
        winReward: 500,
        speedIncrement: 0.08,
        speedIncrementInterval: 2000,
        color: '#FB5607',
    },
    impossible: {
        name: 'Impossible',
        cost: 500,
        startScore: 0,
        maxScore: 1000,
        survivalBonus: 0,
        timedReward: 0,
        winReward: 1000,
        speedIncrement: 0.12,
        speedIncrementInterval: 2000,
        color: '#FF006E',
    },
};

// Game Objects (Platforms and Obstacles)
class Platform {
    constructor(x, y, width, height, type = 'normal', isStatic = false) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.color = '#00D9FF';
        this.highlighted = false;
        this.isStatic = isStatic;
        this.opacity = 1.0;
        this.moveDirection = Math.random() > 0.5 ? 1 : -1;
        this.moveSpeed = 1 + Math.random() * 2;
        this.fadeOutStartTime = null;
        this.createdAt = Date.now();
        this.lifespan = 8000 + Math.random() * 4000; // 8-12 seconds
    }

    update() {
        if (this.isStatic) return;

        // Horizontal movement
        this.x += this.moveSpeed * this.moveDirection;

        // Bounce off walls
        if (this.x < 0 || this.x + this.width > canvas.width) {
            this.moveDirection *= -1;
        }

        // Random vertical movement
        if (Math.random() < 0.02) {
            this.y += (Math.random() - 0.5) * 2;
        }

        // Keep platforms within vertical bounds
        if (this.y < 50) this.y = 50;
        if (this.y > canvas.height - 100) this.y = canvas.height - 100;

        // Fade out near end of lifespan
        const age = Date.now() - this.createdAt;
        const fadeStartTime = this.lifespan - 1500;
        
        if (age > fadeStartTime) {
            this.opacity = Math.max(0, 1 - (age - fadeStartTime) / 1500);
        }
    }

    draw(ctx) {
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.highlighted ? '#FFBE0B' : this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        if (this.highlighted) {
            ctx.strokeStyle = '#FFBE0B';
            ctx.lineWidth = 3;
            ctx.strokeRect(this.x, this.y, this.width, this.height);
        }
        ctx.globalAlpha = 1.0;
    }

    contains(x, y) {
        return x >= this.x && x <= this.x + this.width && 
               y >= this.y && y <= this.y + this.height &&
               this.opacity > 0.3; // Only collide if not too faded out
    }

    isExpired() {
        const age = Date.now() - this.createdAt;
        return age > this.lifespan;
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 20;
        this.height = 30;
        this.velocityY = 0;
        this.velocityX = 0;
        this.jumping = false;
        this.color = '#FF006E';
        this.gravity = 0.6;
        this.jumpPower = 15;
        this.isInvincible = false;
    }

    update() {
        this.velocityY += this.gravity;
        this.y += this.velocityY;
        this.x += this.velocityX;
        this.velocityX *= 0.95;
    }

    draw(ctx) {
        ctx.globalAlpha = this.isInvincible ? 0.6 : 1.0;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = '#FFBE0B';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.globalAlpha = 1.0;
    }

    jump() {
        if (!this.jumping) {
            this.velocityY = -this.jumpPower;
            this.jumping = true;
        }
    }

    moveLeft() {
        this.velocityX = -6;
    }

    moveRight() {
        this.velocityX = 6;
    }

    setInvincible(duration) {
        this.isInvincible = true;
        setTimeout(() => {
            this.isInvincible = false;
        }, duration);
    }
}

class Obstacle {
    constructor(x, y, width, height, type = 'spike') {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.type = type;
        this.color = '#FB5607';
        this.rotation = 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        ctx.restore();
    }

    contains(x, y) {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }
}

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let player = null;
let platforms = [];
let obstacles = [];
let gameLoopId = null;
let speedIntervalId = null;
let rewardIntervalId = null;
let colorChangeIntervalId = null;
let gracePeriodTimeoutId = null;

function initializeGame() {
    player = new Player(canvas.width / 2, canvas.height - 100);
    platforms = generatePlatforms();
    obstacles = generateObstacles();
    gameState.score = difficultySettings[gameState.difficulty].startScore;
    gameState.timeElapsed = 0;
    gameState.speedMultiplier = 1.0;
    gameState.survivalBonusApplied = false;
    gameState.gameRunning = true;
    gameState.gamePaused = false;
    gameState.gameStartTime = Date.now();
    gameState.colorSchemeIndex = 0;
    gameState.gracePeriodActive = true;

    // Activate grace period
    player.setInvincible(gameState.gracePeriodDuration);
    
    gracePeriodTimeoutId = setTimeout(() => {
        gameState.gracePeriodActive = false;
        updateStatusText('GRACE PERIOD OVER - STAY SHARP!');
    }, gameState.gracePeriodDuration);

    startSpeedScaling();
    startTimedRewards();
    startColorSchemeChange();
    startPlatformMovement();
    startPlatformSpawner();
    startGameLoop();
    updateStatusText('GAME STARTED - 3 SECOND GRACE PERIOD');
}

function generatePlatforms() {
    const platformList = [];
    
    // Create starting platform at bottom for safe spawn
    const startPlatform = new Platform(canvas.width / 2 - 75, canvas.height - 150, 150, 20, 'normal', true);
    startPlatform.color = '#00FF00';
    platformList.push(startPlatform);
    
    // Generate initial dynamic platforms
    for (let i = 0; i < 10; i++) {
        const x = Math.random() * (canvas.width - 100);
        const y = 100 + i * 100;
        const width = 80 + Math.random() * 60;
        const height = 15;
        
        platformList.push(new Platform(x, y, width, height, 'dynamic', false));
    }
    
    return platformList;
}

function generateObstacles() {
    const obstacleList = [];
    const count = ['easy', 'normal'].includes(gameState.difficulty) ? 5 : 10;
    
    for (let i = 0; i < count; i++) {
        let x, y, validPosition = false;
        
        while (!validPosition) {
            x = Math.random() * (canvas.width - 40);
            y = Math.random() * (canvas.height - 240) + 40;
            
            const startPlatformY = canvas.height - 150;
            const distanceFromStart = Math.abs(y - startPlatformY);
            
            if (distanceFromStart > 100) {
                validPosition = true;
            }
        }
        
        obstacleList.push(new Obstacle(x, y, 40, 40, 'spike'));
    }
    
    return obstacleList;
}

function startPlatformMovement() {
    gameState.platformMovementIntervalId = setInterval(() => {
        if (gameState.gameRunning && !gameState.gamePaused) {
            platforms.forEach(platform => {
                platform.update();
            });
        }
    }, 30);
}

function startPlatformSpawner() {
    setInterval(() => {
        if (gameState.gameRunning && !gameState.gamePaused) {
            // Remove expired platforms
            platforms = platforms.filter(p => {
                if (!p.isStatic && p.isExpired()) {
                    return false;
                }
                return true;
            });

            // Spawn new platforms to keep count consistent
            while (platforms.length < 12) {
                const x = Math.random() * (canvas.width - 100);
                const y = Math.random() * (canvas.height - 200) + 50;
                const width = 80 + Math.random() * 60;
                const height = 15;
                
                platforms.push(new Platform(x, y, width, height, 'dynamic', false));
            }
        }
    }, 1500);
}

function startGameLoop() {
    gameLoopId = requestAnimationFrame(gameLoop);
}

function gameLoop() {
    ctx.fillStyle = gameState.currentColorScheme ? gameState.currentColorScheme[2] : '#050810';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < canvas.width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
    }

    if (!gameState.gamePaused && gameState.gameRunning) {
        player.update();
        gameState.timeElapsed = Math.floor((Date.now() - gameState.gameStartTime) / 1000);

        if (gameState.timeElapsed >= 5 && !gameState.survivalBonusApplied) {
            gameState.score += difficultySettings[gameState.difficulty].survivalBonus;
            gameState.survivalBonusApplied = true;
            showNotification(`+${difficultySettings[gameState.difficulty].survivalBonus}`, 'milestone');
        }

        platforms.forEach(platform => {
            if (player.jumping && player.velocityY > 0 && 
                player.y + player.height >= platform.y &&
                player.y + player.height <= platform.y + platform.height + 10 &&
                player.x + player.width > platform.x &&
                player.x < platform.x + platform.width &&
                platform.opacity > 0.3) {
                player.velocityY = 0;
                player.jumping = false;
                player.y = platform.y - player.height;
            }
        });

        if (!gameState.gracePeriodActive && !player.isInvincible) {
            obstacles.forEach(obstacle => {
                if (player.x < obstacle.x + obstacle.width &&
                    player.x + player.width > obstacle.x &&
                    player.y < obstacle.y + obstacle.height &&
                    player.y + player.height > obstacle.y) {
                    gameOver();
                }
            });
        }

        if (player.y > canvas.height) {
            gameOver();
        }

        updateScore();
        updateTimer();
        updateSpeed();
    }

    platforms.forEach(platform => platform.draw(ctx));
    obstacles.forEach(obstacle => obstacle.draw(ctx));
    player.draw(ctx);

    gameLoopId = requestAnimationFrame(gameLoop);
}

function startSpeedScaling() {
    const difficulty = difficultySettings[gameState.difficulty];
    speedIntervalId = setInterval(() => {
        if (gameState.gameRunning && !gameState.gamePaused) {
            gameState.speedMultiplier += difficulty.speedIncrement * gameState.speedMultiplier;
            player.jumpPower = 15 + (gameState.speedMultiplier - 1) * 5;
            player.gravity = 0.6 + (gameState.speedMultiplier - 1) * 0.2;
        }
    }, difficulty.speedIncrementInterval);
}

function startTimedRewards() {
    const difficulty = difficultySettings[gameState.difficulty];
    if (difficulty.timedReward > 0) {
        rewardIntervalId = setInterval(() => {
            if (gameState.gameRunning && !gameState.gamePaused) {
                if (gameState.score < difficulty.maxScore) {
                    gameState.score = Math.min(gameState.score + difficulty.timedReward, difficulty.maxScore);
                    showNotification(`+${difficulty.timedReward}`, 'score-gain');
                }
            }
        }, difficulty.timedRewardInterval);
    }
}

function startColorSchemeChange() {
    colorChangeIntervalId = setInterval(() => {
        if (gameState.gameRunning && !gameState.gamePaused) {
            gameState.colorSchemeIndex = (gameState.colorSchemeIndex + 1) % gameState.colorSchemes.length;
            gameState.currentColorScheme = gameState.colorSchemes[gameState.colorSchemeIndex];
            
            platforms.forEach((p, i) => {
                if (!p.isStatic) {
                    p.color = gameState.currentColorScheme[i % 3];
                }
            });
            
            document.body.style.borderLeft = `5px solid ${gameState.currentColorScheme[0]}`;
        }
    }, 500);
}

function updateScore() {
    document.getElementById('scoreDisplay').textContent = gameState.score;
}

function updateTimer() {
    const seconds = gameState.timeElapsed % 60;
    const minutes = Math.floor(gameState.timeElapsed / 60);
    document.getElementById('timerDisplay').textContent = 
        `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    updateMilestones();
}

function updateMilestones() {
    const milestoneIndicator = document.getElementById('milestoneIndicator');
    const milestones = [5, 10, 15, 20, 25, 30];
    
    milestoneIndicator.innerHTML = '';
    milestones.forEach(milestone => {
        const dot = document.createElement('div');
        dot.className = 'milestone-dot';
        if (gameState.timeElapsed >= milestone) {
            dot.classList.add('active');
        }
        milestoneIndicator.appendChild(dot);
    });
}

function updateSpeed() {
    document.getElementById('speedDisplay').textContent = gameState.speedMultiplier.toFixed(2) + 'x';
}

function updateStatusText(status) {
    document.getElementById('statusText').textContent = status;
}

function showNotification(text, type = 'score-gain') {
    const container = document.getElementById('floatingNotifications');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = text;
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

function gameOver() {
    gameState.gameRunning = false;
    clearInterval(speedIntervalId);
    clearInterval(rewardIntervalId);
    clearInterval(colorChangeIntervalId);
    clearInterval(gameState.platformMovementIntervalId);
    clearTimeout(gracePeriodTimeoutId);
    cancelAnimationFrame(gameLoopId);
    
    const difficulty = difficultySettings[gameState.difficulty];
    let winnings = 0;
    
    if (gameState.timeElapsed >= 30) {
        winnings = difficulty.winReward || (difficulty.maxScore - difficulty.startScore);
    }
    
    gameState.playerStats.push({
        difficulty: difficulty.name,
        score: gameState.score,
        time: gameState.timeElapsed,
        winnings: winnings,
        date: new Date().toLocaleString(),
    });
    
    showGameOverScreen(winnings);
}

function showGameOverScreen(winnings) {
    const difficulty = difficultySettings[gameState.difficulty];
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('timeSurvived').textContent = gameState.timeElapsed + 's';
    document.getElementById('difficultyDisplay').textContent = difficulty.name;
    
    if (winnings > 0) {
        document.getElementById('winAmount').style.display = 'flex';
        document.getElementById('winningsAmount').textContent = '+' + winnings;
    } else {
        document.getElementById('winAmount').style.display = 'none';
    }
    
    switchScreen('gameOverScreen');
}

function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    gameState.currentScreen = screenId;
}

function showDifficultySelect() {
    switchScreen('difficultySelect');
}

function showRules() {
    switchScreen('rulesScreen');
}

function showStats() {
    updateStatsDisplay();
    switchScreen('statsScreen');
}

function backToMenu() {
    gameState.gameRunning = false;
    gameState.gamePaused = false;
    clearInterval(speedIntervalId);
    clearInterval(rewardIntervalId);
    clearInterval(colorChangeIntervalId);
    clearInterval(gameState.platformMovementIntervalId);
    clearTimeout(gracePeriodTimeoutId);
    cancelAnimationFrame(gameLoopId);
    switchScreen('mainMenu');
}

function selectDifficulty(difficulty) {
    gameState.difficulty = difficulty;
    switchScreen('gameScreen');
    
    const settings = difficultySettings[difficulty];
    if (settings.cost > 0) {
        updateStatusText(`ENTRY FEE: ${settings.cost}`);
    }
    
    setTimeout(() => {
        initializeGame();
    }, 500);
}

function resumeGame() {
    gameState.gamePaused = false;
    document.getElementById('pauseMenu').classList.add('hidden');
    updateStatusText('RESUMED');
}

function quitGame() {
    gameState.gameRunning = false;
    backToMenu();
}

function playAgain() {
    selectDifficulty(gameState.difficulty);
}

function changeDifficulty() {
    showDifficultySelect();
}

function updateStatsDisplay() {
    const statsGrid = document.getElementById('statsGrid');
    
    if (gameState.playerStats.length === 0) {
        statsGrid.innerHTML = '<p>No statistics yet. Play a game to see your stats!</p>';
        return;
    }
    
    statsGrid.innerHTML = gameState.playerStats.map(stat => `
        <div class="stat-card">
            <h5>${stat.difficulty}</h5>
            <p>Score: ${stat.score}</p>
            <p>Time: ${stat.time}s</p>
            <p>Winnings: ${stat.winnings > 0 ? '+' + stat.winnings : 'Lost'}</p>
            <p style="font-size: 0.8rem; margin-top: 10px;">${stat.date}</p>
        </div>
    `).join('');
}

document.addEventListener('keydown', (e) => {
    if (!gameState.gameRunning || gameState.gamePaused) return;
    
    if (e.key === 'ArrowLeft' || e.key === 'a') {
        player.moveLeft();
    } else if (e.key === 'ArrowRight' || e.key === 'd') {
        player.moveRight();
    } else if (e.key === ' ' || e.key === 'w' || e.key === 'ArrowUp') {
        player.jump();
        e.preventDefault();
    } else if (e.key === 'Escape') {
        gameState.gamePaused = true;
        document.getElementById('pauseMenu').classList.remove('hidden');
        updateStatusText('PAUSED');
    }
});

let touchStartX = 0;
let touchStartY = 0;

canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

canvas.addEventListener('touchmove', (e) => {
    if (!gameState.gameRunning || gameState.gamePaused) return;
    
    const touchX = e.touches[0].clientX;
    const diffX = touchX - touchStartX;
    
    if (diffX < -30) {
        player.moveLeft();
    } else if (diffX > 30) {
        player.moveRight();
    }
});

canvas.addEventListener('touchend', (e) => {
    if (!gameState.gameRunning || gameState.gamePaused) return;
    
    const touchY = e.changedTouches[0].clientY;
    const diffY = touchStartY - touchY;
    
    if (diffY > 30) {
        player.jump();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    switchScreen('mainMenu');
});
