var birb;
var obstacle = [];
var spacePressed = false;
var gameStarted = false;
var gameOver = false;
var score = 0;
var highScore = 0;
var HIGH_SCORE_KEY = "floppyBirbHighScore";

// Read the persisted high score from browser storage on startup.
function loadHighScore() {
  var storedScore = localStorage.getItem(HIGH_SCORE_KEY);
  var parsedScore = Number(storedScore);

  if (!Number.isNaN(parsedScore) && parsedScore >= 0) {
    highScore = parsedScore;
  }
}

// Save the latest high score so it survives page reloads.
function saveHighScore() {
  localStorage.setItem(HIGH_SCORE_KEY, String(highScore));
}

// Keep the on-page score and high-score text in sync with game state.
function updateScoreDisplay() {
  var scoreElement = document.getElementById("scoreValue");
  var highScoreElement = document.getElementById("highScoreValue");

  if (scoreElement) {
    scoreElement.textContent = score;
  }

  if (highScoreElement) {
    highScoreElement.textContent = highScore;
  }
}

function startGame() {
    birb = new component(70,100, "https://github.com/Basilisk00/Basilisk00.github.io/blob/main/docs/assests/img/birb_cropped.png?raw=true", 210, 200, "image"); // First pair is coords, other pair of num is dimension of img
    loadHighScore();
    score = 0;
    updateScoreDisplay();
    myGameArea.start();
  }
  
  // Object that creates canvas 
var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
      this.canvas.width = 480; // Canvas dimensions
      this.canvas.height = 550;
      this.context = this.canvas.getContext("2d"); // create drawing element
      
      // Insert canvas after score display in the game container
      var scoreDisplay = document.querySelector(".score-display");
      if (scoreDisplay && scoreDisplay.parentNode) {
        scoreDisplay.parentNode.insertBefore(this.canvas, scoreDisplay.nextSibling);
      } else {
        // Fallback if structure doesn't exist
        document.body.appendChild(this.canvas);
      }
      
      this.interval = setInterval(updateGameArea, 20); // Executes function every 20 millisecond
      this.frameNo = 0;

      // Gets keyboard input
      window.addEventListener('keypress', function(event) {
        myGameArea.key = event.code;
        if (event.code === "Space" && !spacePressed) { // If space is pressed and not already pressed
          if (gameOver) {
            myGameArea.restart();
          }

          birb.gravitySpeed = -5;
          gameStarted = true;
          spacePressed = true; 
        }
      })

      window.addEventListener('keyup', function (event) {
        spacePressed = false;
        myGameArea.key = 0;
        // birb.gravity += 0.3;
  
      })
    },

    clear: function() {
      this.context.clearRect(0,0,this.canvas.width, this.canvas.height);
    },

    // End game
    stop: function() {
      clearInterval(this.interval);
      this.interval = null;
      gameOver = true;
      gameStarted = false;
    },

    // Restart on space press
    restart: function() {
      obstacle = [];
      this.frameNo = 0;

      score = 0;
      updateScoreDisplay();

      birb.x = 210;
      birb.y = 200;
      birb.speedX = 0;
      birb.speedY = 0;
      birb.gravitySpeed = 0;

      gameOver = false;
      gameStarted = false;

      this.clear();
      if (this.interval) {
        clearInterval(this.interval);
      }
      this.interval = setInterval(updateGameArea, 20);
    }
  }

  // Component constructor
function component(width,height,color,x,y,type) {
  this.type = type;

  if (type == "image") {
    this.image = new Image();
    this.image.src = color;
  }
  
  this.width = width;
  this.height = height;
  this.speedX = 0;
  this.speedY = 0;
  this.x = x;
  this.y = y;

  this.gravity = 0.3;
  this.gravitySpeed = 0;
  this.scored = false;

  // Draws component again each frame
  this.update = function() {
    ctx = myGameArea.context;
    if (type == "image") {
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
      }
    else {
      ctx.fillStyle =color;
      ctx.fillRect(this.x, this.y, this.width, this.height);
    } 
  }

  this.newPos = function(){
    this.gravitySpeed += this.gravity;

    if (this.gravitySpeed > 5) {
      this.gravitySpeed = 3;
    }
    else if (this.gravitySpeed < -5) {
      this.gravitySpeed = -5;
    }
    this.y += this.speedY + this.gravitySpeed;

    // Ceiling: prevent moving above the top of the canvas
    if (this.y < 0) {
      this.y = 0;
      this.gravitySpeed = 0;
    }

    // End the game when the player moves out of bounds at the bottom
    if (this.y + this.height > myGameArea.canvas.height) {
      myGameArea.stop();
    }
  }

  this.hitBottom = function () {
    var screenBottom = myGameArea.canvas.height - this.height;

    if (this.y > screenBottom) {
      myGameArea.stop();
    }
  }

  this.crashWith = function(otherObj) {
    // Get dimensions of player component
    var left = this.x;
    var right = this.x + this.width;
    var top = this.y;
    var bottom = this.y + this.height;

    // Dimensions of object collided with
    var otherLeft = otherObj.x;
    var otherRight = otherObj.x + otherObj.width;
    var otherTop = otherObj.y;
    var otherBottom = otherObj.y + otherObj.height;

    var hasCrashed = true; // Assume crash by default

    // If player object is outside of otherObject bounds, it has not crashed

    if ((bottom < otherTop) ||(top > otherBottom) || (right < otherLeft) || (left > otherRight)) {
      hasCrashed = false;
    }

    return hasCrashed;
  }
}

function updateGameArea() {
  var x,y;

  // Keep returning if space not pressed yet
  if (!gameStarted) { 
    birb.update();            
    return;
  }
  // Checks all obstacles within array if player collides
  for (i = 0; i < obstacle.length; i++) {
    if (birb.crashWith(obstacle[i])) {
      myGameArea.stop();
    }
  }
    myGameArea.clear(); // Clears gameArea to prevent ghosting
    myGameArea.frameNo ++;
    // At first frame, or every 160th frame, generate new obstacle
    if (myGameArea.frameNo == 1 || everyinterval(160)) {
      x = myGameArea.canvas.width;
      y= myGameArea.canvas.height;

      minHeight = 20;
      maxHeight = 300;
      height = Math.floor(Math.random()*(maxHeight-minHeight+1)+minHeight);

      gap = 200;

      obstacle.push(new component(10, height, "green", x, 0));  // Generates obstacles on top
      obstacle.push(new component(10, y - height - gap, "green", x, height + gap)); // Bottom obstacle
    }

    // Update all obstacles in array
    for (i = 0; i < obstacle.length; i++) {
      obstacle[i].x --;

      // Update score when passing obstacles
      if (obstacle[i].y === 0 && !obstacle[i].scored && obstacle[i].x + obstacle[i].width < birb.x) {
        obstacle[i].scored = true;
        score += 1;

        if (score > highScore) {
          highScore = score;
          saveHighScore();
        }

        updateScoreDisplay();
      }

      obstacle[i].update();
      
    }

  birb.newPos();
  birb.update(); // Draws new birb after deletion  
  
}

function everyinterval(n) {
  // If frame number is at current interval
  if ((myGameArea.frameNo / n) % 1 == 0) {
    //console.log ("Spwan obstacle");
    return true;
  }
  //console.log("Do not spawn");
  return false;
}
