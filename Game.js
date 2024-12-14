let player = { x: 100, y: 230 };
let reticle = { x: 200, y: 200 };
let moving = 0;
let playerspeed = 1.5;
let ghost, pumpkin, wall, explo;
let projectiles = [];
let state = "start"; // Game states: "start", "play", "gameOver"
let myFont;
let score = 0;
let timer = 0;
let duration = 15;
let lastMilestone = 0; // Tracks the last milestone for score-based timer additions
let targets = [
  { x: 400, y: 200, living: true },
  { x: 150, y: 100, living: true },
  { x: 100, y: 400, living: true },
  { x: 475, y: 475, living: true }
];
let walls = [
  { x: 110, y: 300 },
  { x: 150, y: 300 },
  { x: 400, y: 400 },
  { x: 440, y: 400 },
  { x: 400, y: 180 },
  { x: 440, y: 180 }
];
let hit, startMusic;

function preload() {
  ghost = loadImage("ghost_1.png");
  pumpkin = loadImage("Pum.png");
  myFont = loadFont("Eater-Regular.ttf");
  hit = loadSound("hitSound.mp3");
  hit.setVolume(0.3);
  startMusic = loadSound("startMusic.mp3");
  startMusic.setVolume(0.4);
  wall = loadImage("wall.png");
  explo = loadImage("explosion.gif");
}

function setup() {
  createCanvas(650, 500);
  rectMode(CENTER);
  imageMode(CENTER);
  textAlign(CENTER, CENTER);
  startMusic.setVolume(0.5);
}

function draw() {
  background(131, 63, 153);

  if (state === "start") {
    drawStartScreen();
  } else if (state === "play") {
    runGame();
  } else if (state === "gameOver") {
    drawGameOverScreen();
  }
}

function drawStartScreen() {
  background(200, 150, 90);
  textFont(myFont);
  textSize(50);
  fill(0);
  text("Halloween Game", width / 2, 150);
  textSize(20);
  text("Press [S] to Start", width / 2, 300);
  text("Avoid the walls \n making contact with the walls will kill you", width / 2, 350);
  text("You need to stack 15 points to keep on playing \n The counter will stop if the player cannot score", width / 2, 420);
}

function runGame() {
  displayScoreAndTimer();
  drawGameObjects();
  handlePlayerMovement();
  updateProjectiles();

  if (checkCollisions()) {
    state = "gameOver";
  }
}

function drawGameOverScreen() {
  background(200, 150, 90);

  // Stop music explicitly
  startMusic.stop();

  textAlign(CENTER);
  textFont(myFont);
  textSize(50);
  fill(0);
  text("Game Over", width / 2, height / 2 - 50);
  textSize(30);
  text(`Final Score: ${score}`, width / 2, height / 2 + 50);

  textSize(20);
  text("Press [R] to Restart", width / 2, height / 2 + 100);
}

function displayScoreAndTimer() {
  textSize(20);
  fill(255);
  text(`Score: ${score}`, 60, 50);
  
  // Update timer for countdown
  timer -= deltaTime / 1000;
  if (timer <= 0) {
    timer = 0;
    state = "gameOver"; // End the game when timer reaches 0
  }
  
  text(`Time Left: ${Math.ceil(timer)}s`, width - 100, 30);
}

function drawGameObjects() {
  // Draw targets
  targets.forEach(target => {
    if (target.living) {
      image(pumpkin, target.x, target.y, 55, 55);
    }
  });

  // Draw walls
  walls.forEach(wallObj => image(wall, wallObj.x, wallObj.y, 45, 45));

  // Draw player
  image(ghost, player.x, player.y, 50, 50);

  // Draw reticle
  cursor(CROSS);
  noFill();
  stroke(255);
  circle(reticle.x, reticle.y, 50);
  reticle.x = mouseX;
  reticle.y = mouseY;
}

function handlePlayerMovement() {
  if (keyIsPressed) {
    if (keyIsDown(38) || keyIsDown(87)) player.y -= playerspeed; // Up
    if (keyIsDown(37) || keyIsDown(65)) player.x -= playerspeed; // Left
    if (keyIsDown(39) || keyIsDown(68)) player.x += playerspeed; // Right
    if (keyIsDown(40) || keyIsDown(83)) player.y += playerspeed; // Down
  }
}

function updateProjectiles() {
  for (let i = projectiles.length - 1; i >= 0; i--) {
    let projectile = projectiles[i];
    projectile.update();
    projectile.show();
    projectile.collide();
    if (isOutOfBounds(projectile.pos)) {
      projectiles.splice(i, 1);
    }
  }
}

function mousePressed() {
  if (state === "play") {
    let direction = createVector(reticle.x - player.x, reticle.y - player.y);
    direction.normalize();
    projectiles.push(new Projectile(player.x, player.y, direction));
  }
}

function checkCollisions() {
  if (walls.some(wall => collides(player, wall, 40))) {
    console.log("Collision with wall detected. Game Over.");
    state = "gameOver";
    return true;
  }
  return false;
}

function keyPressed() {
  if (state === "start" && keyCode === 83) { // S to start
    timer = duration; // Initialize the countdown
    state = "play";
    startMusic.loop(); // Restart music for new game
  } else if (state === "gameOver" && keyCode === 82) { // R to restart
    resetGame();
  }
}

function resetGame() {
  score = 0;
  lastMilestone = 0; // Reset milestone tracker
  timer = duration; // Reset timer to the full duration
  player = { x: 100, y: 230 };
  targets.forEach(target => {
    target.living = true;
    target.x = random(50, width - 50);
    target.y = random(50, height - 50);
  });
  startMusic.stop(); // Ensure music stops on reset
  state = "start";
}

function collides(obj1, obj2, distance) {
  return dist(obj1.x, obj1.y, obj2.x, obj2.y) < distance;
}

function isOutOfBounds(pos) {
  return pos.x < 0 || pos.x > width || pos.y < 0 || pos.y > height;
}

class Projectile {
  constructor(x, y, direction) {
    this.pos = createVector(x, y);
    this.vel = direction.copy().mult(5);
    this.size = 10;
  }

  update() {
    this.pos.add(this.vel);
  }

  show() {
    fill(244, 217, 89);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.size);
  }

  collide() {
    targets.forEach(target => {
      if (collides(this.pos, target, 25) && target.living) {
        target.living = false;
        score += 1;

        // Check for score milestones
        if (score % 15 === 0 && score > lastMilestone) {
          timer += 15; // Add 15 seconds
          lastMilestone = score; // Update milestone tracker
        }

        this.pos.set(-50, -50);
        hit.play();
        respawnTarget(target);
      }
    });

    if (walls.some(wall => collides(this.pos, wall, 25))) {
      this.pos.set(-50, -50);
    }
  }
}

function respawnTarget(target) {
  do {
    target.x = random(50, width - 50);
    target.y = random(50, height - 50);
  } while (walls.some(wall => collides(target, wall, 50)));

  target.living = true;
}
