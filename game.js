// ===== Game State =====
const gameState = {
    isPlaying: false,
    isPaused: false,
    score: 0,
    lives: 3,
    highScore: localStorage.getItem('heartDodgerHighScore') || 0,
    speed: 2,
    obstacleSpawnRate: 120,
    bonusSpawnRate: 200,
    frameCount: 0,
    difficultyLevel: 1
};

// ===== Player Object =====
const player = {
    element: null,
    x: 50,
    y: 250,
    width: 40,
    height: 40,
    velocityY: 0,
    targetY: 250,
    speed: 8
};

// ===== Game Arrays =====
let obstacles = [];
let bonuses = [];
let particles = [];

// ===== DOM Elements =====
const gameCanvas = document.getElementById('gameCanvas');
const startScreen = document.getElementById('startScreen');
const startButton = document.getElementById('startButton');
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const highScoreDisplay = document.getElementById('highScoreValue');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const finalScoreDisplay = document.getElementById('finalScore');
const restartButton = document.getElementById('restartButton');
const letterOverlay = document.getElementById('letterOverlay');
const letterContent = document.getElementById('letterContent');
const closeLetterButton = document.getElementById('closeLetterButton');
const valentineOverlay = document.getElementById('valentineOverlay');
const valentineYes = document.getElementById('valentineYes');
const valentineNo = document.getElementById('valentineNo');
const clickCount = document.getElementById('clickCount');
const couplesOverlay = document.getElementById('couplesOverlay');
const couplesYes = document.getElementById('couplesYes');
const couplesNo = document.getElementById('couplesNo');
const celebrationOverlay = document.getElementById('celebrationOverlay');
const flowersContainer = document.getElementById('flowersContainer');
const backgroundMusic = document.getElementById('backgroundMusic');

// ===== Tracking Variables =====
let noClickCount = 0;
let yesClickCount = 0;
let couplesNoClickCount = 0;
let couplesYesClickCount = 0;

// ===== Initialize =====
function init() {
    highScoreDisplay.textContent = gameState.highScore;

    // Create player element
    player.element = document.createElement('div');
    player.element.className = 'player';
    player.element.textContent = '💖';
    player.element.style.left = player.x + 'px';
    player.element.style.top = player.y + 'px';
    gameCanvas.appendChild(player.element);

    // Event listeners
    startButton.addEventListener('click', startGame);
    restartButton.addEventListener('click', restartGame);
    closeLetterButton.addEventListener('click', closeLetterAndRestart);
    valentineYes.addEventListener('click', handleValentineYes);
    valentineNo.addEventListener('click', handleValentineNo);
    couplesYes.addEventListener('click', handleCouplesYes);
    couplesNo.addEventListener('click', handleCouplesNo);

    // Keyboard controls
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    // Touch controls
    let touchStartY = 0;
    gameCanvas.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    });

    gameCanvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!gameState.isPlaying) return;

        const touchY = e.touches[0].clientY;
        const canvasRect = gameCanvas.getBoundingClientRect();
        const relativeY = touchY - canvasRect.top;
        player.targetY = Math.max(0, Math.min(canvasRect.height - player.height, relativeY - player.height / 2));
    });
}

// ===== Mobile Controls Setup =====
const controlUp = document.getElementById('controlUp');
const controlDown = document.getElementById('controlDown');
const mobileControls = document.getElementById('mobileControls');

// Show/hide mobile controls functions
function showMobileControls() {
    if (mobileControls && window.innerWidth <= 768) {
        mobileControls.style.display = 'flex';
    }
}

function hideMobileControls() {
    if (mobileControls) {
        mobileControls.style.display = 'none';
    }
}

// Control button handlers
let upInterval, downInterval;

if (controlUp && controlDown) {
    // Touch events
    controlUp.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!gameState.isPlaying) return;
        player.targetY -= 15;
        upInterval = setInterval(() => {
            player.targetY -= 10;
        }, 50);
    });

    controlUp.addEventListener('touchend', (e) => {
        e.preventDefault();
        clearInterval(upInterval);
    });

    controlDown.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!gameState.isPlaying) return;
        player.targetY += 15;
        downInterval = setInterval(() => {
            player.targetY += 10;
        }, 50);
    });

    controlDown.addEventListener('touchend', (e) => {
        e.preventDefault();
        clearInterval(downInterval);
    });

    // Mouse events for testing
    controlUp.addEventListener('mousedown', (e) => {
        e.preventDefault();
        if (!gameState.isPlaying) return;
        player.targetY -= 15;
        upInterval = setInterval(() => {
            player.targetY -= 10;
        }, 50);
    });

    controlUp.addEventListener('mouseup', (e) => {
        e.preventDefault();
        clearInterval(upInterval);
    });

    controlDown.addEventListener('mousedown', (e) => {
        e.preventDefault();
        if (!gameState.isPlaying) return;
        player.targetY += 15;
        downInterval = setInterval(() => {
            player.targetY += 10;
        }, 50);
    });

    controlDown.addEventListener('mouseup', (e) => {
        e.preventDefault();
        clearInterval(downInterval);
    });
}

// ===== Keyboard Input =====
const keys = {};

function handleKeyDown(e) {
    keys[e.key] = true;
}

function handleKeyUp(e) {
    keys[e.key] = false;
}

// ===== Start Game =====
function startGame() {
    startScreen.style.display = 'none';
    gameState.isPlaying = true;
    gameState.score = 0;
    gameState.lives = 3;
    gameState.speed = 2;
    gameState.obstacleSpawnRate = 120;
    gameState.bonusSpawnRate = 200;
    gameState.frameCount = 0;
    gameState.difficultyLevel = 1;

    obstacles = [];
    bonuses = [];
    particles = [];

    player.y = 250;
    player.targetY = 250;

    updateScore();
    updateLives();

    // Show mobile controls
    showMobileControls();

    gameLoop();
}

// ===== Game Loop =====
function gameLoop() {
    if (!gameState.isPlaying) return;

    gameState.frameCount++;

    // Update player
    updatePlayer();

    // Spawn obstacles
    if (gameState.frameCount % gameState.obstacleSpawnRate === 0) {
        spawnObstacle();
    }

    // Spawn bonuses
    if (gameState.frameCount % gameState.bonusSpawnRate === 0) {
        spawnBonus();
    }

    // Update obstacles
    updateObstacles();

    // Update bonuses
    updateBonuses();

    // Update particles
    updateParticles();

    // Increase difficulty
    updateDifficulty();

    requestAnimationFrame(gameLoop);
}

// ===== Update Player =====
function updatePlayer() {
    // Keyboard controls
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        player.targetY -= player.speed;
    }
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        player.targetY += player.speed;
    }

    // Clamp target position
    const canvasHeight = gameCanvas.offsetHeight;
    player.targetY = Math.max(0, Math.min(canvasHeight - player.height, player.targetY));

    // Smooth movement
    player.y += (player.targetY - player.y) * 0.2;

    // Update position
    player.element.style.top = player.y + 'px';
}

// ===== Spawn Obstacle =====
function spawnObstacle() {
    const canvasHeight = gameCanvas.offsetHeight;
    const canvasWidth = gameCanvas.offsetWidth;

    const types = ['block', 'broken-heart', 'spike'];
    const type = types[Math.floor(Math.random() * types.length)];

    const obstacle = {
        element: document.createElement('div'),
        x: canvasWidth,
        y: Math.random() * (canvasHeight - 50),
        width: type === 'broken-heart' ? 35 : 40,
        height: type === 'broken-heart' ? 35 : 40,
        type: type
    };

    obstacle.element.className = 'obstacle';
    if (type === 'broken-heart') {
        obstacle.element.classList.add('broken-heart');
        obstacle.element.textContent = '💔';
    } else if (type === 'spike') {
        obstacle.element.style.width = '30px';
        obstacle.element.style.height = '30px';
        obstacle.element.style.borderRadius = '50%';
        obstacle.element.style.background = '#ff0000';
        obstacle.width = 30;
        obstacle.height = 30;
    } else {
        obstacle.element.style.width = obstacle.width + 'px';
        obstacle.element.style.height = obstacle.height + 'px';
    }

    obstacle.element.style.left = obstacle.x + 'px';
    obstacle.element.style.top = obstacle.y + 'px';

    gameCanvas.appendChild(obstacle.element);
    obstacles.push(obstacle);
}

// ===== Spawn Bonus =====
function spawnBonus() {
    const canvasHeight = gameCanvas.offsetHeight;
    const canvasWidth = gameCanvas.offsetWidth;

    const bonus = {
        element: document.createElement('div'),
        x: canvasWidth,
        y: Math.random() * (canvasHeight - 40),
        width: 30,
        height: 30
    };

    bonus.element.className = 'bonus';
    bonus.element.textContent = '✨';
    bonus.element.style.left = bonus.x + 'px';
    bonus.element.style.top = bonus.y + 'px';

    gameCanvas.appendChild(bonus.element);
    bonuses.push(bonus);
}

// ===== Update Obstacles =====
function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.x -= gameState.speed;
        obstacle.element.style.left = obstacle.x + 'px';

        // Check collision with player
        if (checkCollision(player, obstacle)) {
            hitObstacle(obstacle, i);
        }

        // Remove if off screen
        if (obstacle.x + obstacle.width < 0) {
            obstacle.element.remove();
            obstacles.splice(i, 1);
        }
    }
}

// ===== Update Bonuses =====
function updateBonuses() {
    for (let i = bonuses.length - 1; i >= 0; i--) {
        const bonus = bonuses[i];
        bonus.x -= gameState.speed;
        bonus.element.style.left = bonus.x + 'px';

        // Check collision with player
        if (checkCollision(player, bonus)) {
            collectBonus(bonus, i);
        }

        // Remove if off screen
        if (bonus.x + bonus.width < 0) {
            bonus.element.remove();
            bonuses.splice(i, 1);
        }
    }
}

// ===== Collision Detection =====
function checkCollision(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y;
}

// ===== Hit Obstacle =====
function hitObstacle(obstacle, index) {
    gameState.lives--;
    updateLives();

    // Create particles
    createParticles(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2, '#ff0000');

    // Remove obstacle
    obstacle.element.remove();
    obstacles.splice(index, 1);

    // Check game over
    if (gameState.lives <= 0) {
        gameOver();
    }
}

// ===== Collect Bonus =====
function collectBonus(bonus, index) {
    gameState.score++;
    updateScore();

    // Create particles
    createParticles(bonus.x + bonus.width / 2, bonus.y + bonus.height / 2, '#FFD700');

    // Remove bonus
    bonus.element.remove();
    bonuses.splice(index, 1);

    // Update high score
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('heartDodgerHighScore', gameState.highScore);
        highScoreDisplay.textContent = gameState.highScore;
    }
}

// ===== Create Particles =====
function createParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
        const particle = {
            element: document.createElement('div'),
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6,
            life: 30
        };

        particle.element.className = 'particle';
        particle.element.style.background = color;
        particle.element.style.left = particle.x + 'px';
        particle.element.style.top = particle.y + 'px';

        gameCanvas.appendChild(particle.element);
        particles.push(particle);
    }
}

// ===== Update Particles =====
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.life--;

        particle.element.style.left = particle.x + 'px';
        particle.element.style.top = particle.y + 'px';
        particle.element.style.opacity = particle.life / 30;

        if (particle.life <= 0) {
            particle.element.remove();
            particles.splice(i, 1);
        }
    }
}

// ===== Update Difficulty =====
function updateDifficulty() {
    // Increase speed every 10 points
    if (gameState.score > 0 && gameState.score % 10 === 0 && gameState.score / 10 > gameState.difficultyLevel - 1) {
        gameState.difficultyLevel++;
        gameState.speed += 0.5;
        gameState.obstacleSpawnRate = Math.max(60, gameState.obstacleSpawnRate - 10);
        gameState.bonusSpawnRate = Math.max(150, gameState.bonusSpawnRate - 10);
    }
}

// ===== Update Score =====
function updateScore() {
    scoreDisplay.textContent = gameState.score;
}

// ===== Update Lives =====
function updateLives() {
    const hearts = '❤️'.repeat(gameState.lives);
    livesDisplay.textContent = hearts || '💀';
}

// ===== Game Over =====
function gameOver() {
    gameState.isPlaying = false;

    // Clear game elements
    obstacles.forEach(obs => obs.element.remove());
    bonuses.forEach(bonus => bonus.element.remove());
    particles.forEach(particle => particle.element.remove());

    obstacles = [];
    bonuses = [];
    particles = [];

    // Show game over screen
    finalScoreDisplay.textContent = gameState.score;
    gameOverOverlay.classList.add('active');

    // Show confession letter after delay
    setTimeout(() => {
        showConfessionLetter();
    }, 2000);
}

// ===== Show Confession Letter =====
function showConfessionLetter() {
    gameOverOverlay.classList.remove('active');
    letterOverlay.classList.add('active');

    // Play background music
    backgroundMusic.play().catch(e => console.log('Music autoplay prevented:', e));

    const message = `I notice you almost every day on the school bus. 🚌 We may not know each other that well, and that's okay. Some things don't need a long history to feel real. It's just something I've been quietly aware of for a while now. 💭

I want to be honest about something. I'm scared of commitment, not because I don't feel things, but because I feel them deeply. 💙 I don't want anything meaningless or temporary. I don't want something that exists just to pass time. If I move toward someone, it has to matter. ✨

You feel like someone who understands that. Like we share a similar kind of calm, a similar way of seeing things. I've never felt this before. Truly, never. I've never liked someone this much. 💫 I care about you more than I know how to explain. Sometimes just seeing you standing on the bus gives me this quiet ache in my chest. 💗 I find myself wishing I could get you a seat, wishing I could do something small just to make your day easier. 🌸

And honestly, there's no doubt in my mind. You're the prettiest girl I've ever seen. 🌹 But it's not just that.

I love your smile. I love the way you are, without trying to change anything. I love how you listen to my dumb things, how I get to talk endlessly about my day with you, how it never feels forced. 💬 I don't have expectations. I don't want to shape you into anything else. I just like you as you are. 💕

Maybe that's what unconditional care feels like. Being drawn to someone without needing reasons. You feel familiar, like something steady and safe. Like home. 🏡 And I don't know where this leads. I'm not trying to define it, but I know the connection feels real to me, and I didn't want to ignore that. 💖`;

    typeWriter(message, 0, () => {
        // After typing completes, show the "Read More" button
        closeLetterButton.style.display = 'block';
        closeLetterButton.textContent = 'Read More 💕';
    });
}

// ===== Type Writer Effect =====
function typeWriter(text, index, callback) {
    if (index < text.length) {
        letterContent.innerHTML += text.charAt(index) === '\n' ? '<br>' : text.charAt(index);
        // Scroll to bottom as text appears
        letterContent.scrollTop = letterContent.scrollHeight;
        setTimeout(() => typeWriter(text, index + 1, callback), 30); // Slower typing (30ms per character)
    } else if (callback) {
        callback();
    }
}

// ===== Restart Game =====
function restartGame() {
    gameOverOverlay.classList.remove('active');
    startScreen.style.display = 'flex';
}

// ===== Close Letter and Show Valentine Proposal =====
function closeLetterAndRestart() {
    letterOverlay.classList.remove('active');
    // Don't clear the letter content or stop music
    // Navigate to Valentine proposal
    showValentineProposal();
}

// ===== Show Valentine Proposal =====
function showValentineProposal() {
    letterOverlay.classList.remove('active');
    valentineOverlay.classList.add('active');
    noClickCount = 0;
    yesClickCount = 0;
}

// ===== Handle Valentine Yes =====
function handleValentineYes() {
    yesClickCount++;
    sendToServer('valentine', { noClicks: noClickCount, yesClicks: yesClickCount });
    valentineOverlay.classList.remove('active');
    couplesOverlay.classList.add('active');
}

// ===== Handle Valentine No =====
function handleValentineNo() {
    noClickCount++;

    // Shrink the No button and grow the Yes button
    const noButton = valentineNo;
    const yesButton = valentineYes;

    const noScale = Math.max(0.3, 1 - (noClickCount * 0.15));
    const yesScale = 1 + (noClickCount * 0.15);

    noButton.style.transform = `scale(${noScale})`;
    yesButton.style.transform = `scale(${yesScale})`;

    // Update click count display
    if (noClickCount === 1) {
        clickCount.textContent = `Really? 🥺`;
    } else if (noClickCount === 2) {
        clickCount.textContent = `Are you sure? 💔`;
    } else if (noClickCount === 3) {
        clickCount.textContent = `Please? 🥹`;
    } else if (noClickCount >= 4) {
        clickCount.textContent = `The button is getting smaller... just click Yes! 💕`;
    }

    // Make No button harder to click
    if (noClickCount >= 5) {
        noButton.style.pointerEvents = 'none';
        noButton.style.opacity = '0.3';
    }
}

// ===== Handle Couples Yes =====
function handleCouplesYes() {
    couplesYesClickCount++;
    sendToServer('couples', { noClicks: couplesNoClickCount, yesClicks: couplesYesClickCount });
    couplesOverlay.classList.remove('active');
    showCelebration();
}

// ===== Handle Couples No =====
function handleCouplesNo() {
    couplesNoClickCount++;

    // Shrink the No button and grow the Yes button
    const noButton = couplesNo;
    const yesButton = couplesYes;

    const noScale = Math.max(0.2, 1 - (couplesNoClickCount * 0.2));
    const yesScale = 1 + (couplesNoClickCount * 0.2);

    noButton.style.transform = `scale(${noScale})`;
    yesButton.style.transform = `scale(${yesScale})`;

    // Make No button disappear after a few clicks
    if (couplesNoClickCount >= 4) {
        noButton.style.display = 'none';
    }
}

// ===== Show Celebration =====
function showCelebration() {
    celebrationOverlay.classList.add('active');

    // Create falling flowers
    const flowers = ['🌸', '🌺', '🌹', '🌷', '🌻', '💐', '🏵️', '🌼'];

    setInterval(() => {
        const flower = document.createElement('div');
        flower.className = 'flower';
        flower.textContent = flowers[Math.floor(Math.random() * flowers.length)];
        flower.style.left = Math.random() * 100 + '%';
        flower.style.animationDuration = (Math.random() * 3 + 3) + 's';
        flower.style.animationDelay = Math.random() * 2 + 's';
        flowersContainer.appendChild(flower);

        // Remove flower after animation
        setTimeout(() => flower.remove(), 8000);
    }, 300);
}

// ===== Send Data to Server =====
function sendToServer(stage, data) {
    // Prepare data to send
    const payload = {
        stage: stage,
        timestamp: new Date().toISOString(),
        noClicks: data.noClicks || 0,
        yesClicks: data.yesClicks || 0,
        userAgent: navigator.userAgent
    };

    console.log('📊 Sending to Google Sheets:', payload);

    // Google Apps Script Web App URL
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwFy7HTgc-LAJx3OgaUplUHtKiwPcw3gZZJSIVshznmaivFQ_Y2TLV8LkFxc5eUxkFi_w/exec';

    // Send to Google Sheets
    fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors', // Required for Google Apps Script
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    })
        .then(() => {
            console.log('✅ Response sent to Google Sheets!');
            console.log('📊 Check your Google Sheet to see the data');
        })
        .catch(error => {
            console.log('⚠️ Error sending to Google Sheets:', error);
            console.log('💾 Saving to localStorage as backup...');

            // Fallback: store in localStorage
            const stored = JSON.parse(localStorage.getItem('valentineResponses') || '[]');
            stored.push(payload);
            localStorage.setItem('valentineResponses', JSON.stringify(stored));
            console.log('✅ Saved to localStorage');
        });
}


// ===== Initialize Game =====
init();
