const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const restartButton = document.getElementById('restartButton');

// تحميل صور اللاعب
const playerImage = new Image();
playerImage.src = 'https://i.postimg.cc/BnGpCm8g/1000014745.png';
const jumpImage = new Image();
jumpImage.src = 'https://i.postimg.cc/Y0tBfKgy/1000015238.png';
const coinImage = new Image();
coinImage.src = 'https://i.postimg.cc/k5xkgNM8/1000014983.jpg';

// إعدادات اللاعب
const player = {
    x: 0,
    y: 0,
    width: 60,
    height: 60,
    dx: 0,
    dy: 0,
    speed: 5,
    gravity: 0.5,
    jumpStrength: -10,
    isJumping: true,
    isAlive: true
};

// إعدادات الألواح
let platforms = [];
let score = 0;
let coinsCollected = 0;
let coins = [];

// إنشاء الألواح والعملات
function createPlatformsAndCoins() {
    const platformCount = 10;
    const platformWidth = 80;
    const platformHeight = 10;
    const minY = 50;
    const maxY = canvas.height - 100;
    const spacing = 100;

    for (let i = 0; i < platformCount; i++) {
        let x = i * spacing + 100;
        let y = Math.random() * (maxY - minY) + minY;
        platforms.push({ x, y, width: platformWidth, height: platformHeight });
        if (Math.random() < 0.5) {
            coins.push({
                x: x + platformWidth / 2 - 10,
                y: y - 20,
                width: 20,
                height: 20
            });
        }
    }

    // وضع اللاعب فوق اللوح الأول
    player.x = platforms[0].x;
    player.y = platforms[0].y - player.height;
}

// رسم اللاعب
function drawPlayer() {
    if (player.isJumping) {
        ctx.drawImage(jumpImage, player.x, player.y, player.width, player.height);
    } else {
        ctx.drawImage(playerImage, player.x, player.y, player.width, player.height);
    }
}

// رسم الألواح
function drawPlatforms() {
    ctx.fillStyle = 'green';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });
}

// رسم العملات
function drawCoins() {
    coins.forEach(coin => {
        ctx.drawImage(coinImage, coin.x, coin.y, coin.width, coin.height);
    });
}

// تحديث اللاعب
function updatePlayer() {
    if (!player.isAlive) return;

    player.dy += player.gravity;
    player.x += player.dx;
    player.y += player.dy;

    // قيود الحركة داخل الشاشة
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

    // تحقق من اصطدام اللاعب مع الألواح
    let onPlatform = false;
    platforms.forEach(platform => {
        if (
            player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y + player.height - player.dy <= platform.y
        ) {
            if (!onPlatform && player.dy >= 0) {
                score++;
            }
            player.dy = 0;
            player.isJumping = false;
            player.y = platform.y - player.height;
            onPlatform = true;
        }
    });

    // تحقق من جمع العملات
    coins = coins.filter(coin => {
        if (
            player.x < coin.x + coin.width &&
            player.x + player.width > coin.x &&
            player.y < coin.y + coin.height &&
            player.y + player.height > coin.y
        ) {
            coinsCollected++;
            return false; // إزالة العملة التي تم جمعها
        }
        return true;
    });

    // خسارة اللاعب إذا سقط من جميع الألواح
    if (!onPlatform && player.y > canvas.height) {
        player.isAlive = false;
        restartButton.style.display = "block"; // إظهار زر إعادة اللعب عند الخسارة
    }
}

// تحديث الألواح
function updatePlatforms() {
    platforms.forEach(platform => {
        platform.x -= 2; // تحريك اللوح لليسار

        // إعادة اللوح إلى الجانب الأيمن عند خروجه من الجانب الأيسر
        if (platform.x + platform.width < 0) {
            platform.x = canvas.width;
            platform.y = Math.random() * (canvas.height - 100) + 50;
        }
    });
}

// إعادة ضبط اللعبة
function resetGame() {
    player.x = platforms[0].x;
    player.y = platforms[0].y - player.height;
    player.dy = 0;
    player.isJumping = false; // اللاعب ليس في حالة قفز
    player.isAlive = true;
    score = 0;
    coinsCollected = 0;
    platforms = [];
    coins = [];
    createPlatformsAndCoins();
    restartButton.style.display = "none";
}

// تحكم الحركة
function movePlayer(e) {
    if (!player.isAlive) return;

    switch (e.key) {
        case 'ArrowLeft':
            player.dx = -player.speed;
            break;
        case 'ArrowRight':
            player.dx = player.speed;
            break;
        case 'ArrowUp':
            if (!player.isJumping) {
                player.dy = player.jumpStrength;
                player.isJumping = true;
            }
            break;
    }
}

function stopPlayer(e) {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        player.dx = 0;
    }
}

// تحديث اللعبة
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlatforms();
    drawCoins();
    drawPlayer();
    updatePlayer();
    updatePlatforms(); // تحديث حركة الألواح
    requestAnimationFrame(update);
}

// بدء اللعبة
createPlatformsAndCoins();
update();
document.addEventListener('keydown', movePlayer);
document.addEventListener('keyup', stopPlayer);