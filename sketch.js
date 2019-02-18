//------------------------------------------------------//
//------------DIRECTIONS:-------------------------------//
//------------------------------------------------------//
//-------------Dodge the asteroids for -----------------//
//-------------as long as you can.----------------------//
//------------------------------------------------------//
//-------------Use arrow keys or 'WASD"-----------------//
//-------------to move.---------------------------------//
//------------------------------------------------------//
//-------------Space bar to shoot.----------------------//
//------------------------------------------------------//

  //----------------------------------------------------//
 //------------STARS BACKGROUND OBJECT-----------------//
//----------------------------------------------------//

function Stars(){
  this.xTop         = [];
  this.yTop         = [];
  this.xBottom      = [];
  this.yBottom      = [];
  this.j            = 0;
  this.scrollSpeed  = 2;
}
Stars.prototype = {
  constructor : Stars,
  starMap : function(){
    for(i=0;i<150;i++){
      this.xTop[i]     = random(0,windowWidth);
      this.yTop[i]     = random(0,windowHeight);
      this.xBottom[i]  = random(0,windowWidth);
      this.yBottom[i]  = random(0,windowHeight);
    }
  },
  drawStars : function(){
    background(0);
    stroke(255);
    j = this.scrollSpeed*(frameCount+windowHeight)%windowHeight;
    for(i=0;i<150;i++){
      point(this.xTop[i], this.yTop[i]+j*2);
      point(this.xTop[i], this.yTop[i]+j*2-windowHeight);
      point(this.xTop[i], this.yTop[i]+j*2-2*windowHeight);
      point(this.xTop[i], this.yTop[i]+j*2-3*windowHeight);
      point(this.xBottom[i], this.yBottom[i]+j);
      point(this.xBottom[i], this.yBottom[i]+j-windowHeight);
    }
  }
}

  //----------------------------------------------------//
 //-----------------SPACESHIP OBJECT-------------------//
//----------------------------------------------------//

function SpaceShip(){
  this.size=50;
  this.movementSpeed= 10;
}
SpaceShip.prototype = {
  constructor : SpaceShip,
  position    : function(newX,newY){
    this.xPos = newX;
    this.yPos = newY;
    this.boundary = [];
  },
  create      : function(){
    noStroke();
    colorMode(HSB);
    // Engines
    k=(frameCount+60)%15;
    fill(15+2*k,255,255);
    ellipse(this.xPos-this.size/4, this.yPos, this.size/4, this.size/2);
    ellipse(this.xPos+this.size/4, this.yPos, this.size/4, this.size/2);
    // Wings
    fill(0,120,50);
    fill(180,20,60);
    ellipse(this.xPos-this.size*0.7, this.yPos-this.size/6, this.size/8, this.size/3);
    ellipse(this.xPos+this.size*0.7, this.yPos-this.size/6, this.size/8, this.size/3);
    fill(0,120,50);
    triangle(this.xPos, this.yPos-this.size/2,
             this.xPos-this.size*0.8, this.yPos, 
             this.xPos+this.size*0.8, this.yPos);
    // Fusilage
    fill(180,20,60);
    triangle(this.xPos, this.yPos-this.size, 
             this.xPos-(this.size/2), this.yPos, 
             this.xPos+(this.size/2), this.yPos);
    // Cockpit
    fill(240,200,30);
    ellipse(this.xPos, this.yPos-(this.size*0.6), this.size*0.2, this.size*0.4);
    this.getBoundary();
  },
  //-----  SPACESHIP MOVEMENT -----//
  move        : function(){
    // UP
    if((keyCode === 87 || keyCode === UP_ARROW) && this.yPos > windowHeight/2){
      this.position(this.xPos, this.yPos-this.movementSpeed);
    }
    // DOWN
    if((keyCode === 83 || keyCode === DOWN_ARROW) && this.yPos < windowHeight){
      this.position(this.xPos, this.yPos+2*this.movementSpeed);
    }
    // LEFT
    if((keyCode === 65 || keyCode === LEFT_ARROW) && this.xPos > this.size){
      this.position(this.xPos-this.movementSpeed, this.yPos);
    }
    // RIGHT
    if((keyCode === 68 || keyCode === RIGHT_ARROW) && this.xPos < windowWidth-this.size){
      this.position(this.xPos+this.movementSpeed, this.yPos);
    }
  },
  //  Gets outermost boundary points for collision detection
  getBoundary     : function(){
    this.boundary[0]  = createVector(this.xPos, this.yPos-this.size);
    this.boundary[1]  = createVector(this.xPos-this.size*0.8, this.yPos);
    this.boundary[2]  = createVector(this.xPos+this.size*0.8, this.yPos);
  }
}

  //----------------------------------------------------//
 //------------------ASTEROID OBJECT-------------------//
//----------------------------------------------------//

function Asteroid(){
  this.movementSpeed  = random(1,5);
  this.xPos           = random(windowWidth);
  this.yPos           = -100;
  this.size           = 10*random(5);
  this.h              = random(20,50);
  this.hit            = false;
  this.destroyed      = false;
  //  Drop the asteroids from the top of the screen
  this.drop = function(){
    colorMode(HSB);
    //  Increment the Y coordinate by the motions speed
    this.yPos += this.movementSpeed;
    //  If the asteroid is contained within the window, draw it
    if(this.yPos < windowHeight+10){
      fill(this.h,30,30);
      ellipse(this.xPos, this.yPos, this.size, this.size);
    }
    //  When the asteroid passes beyond the window, generate new settings and drop it again
    if(this.yPos >= windowHeight+10){
      this.regenerate();
      score += round(this.size/10)*10;
      timeToBonus += round(this.size/10)*10;
    }
  },
  this.regenerate = function(){
      this.xPos       = random(windowWidth);
      this.yPos       = -100;
      this.size       = 10*random(1,5);
  }
  //  Detect collision with the spaceship
  this.collision = function(spaceShip){
    this.hit = collideCirclePoly(this.xPos, this.yPos, this.size, spaceShip.boundary);
    return this.hit;
  },
  this.blownUp = function(){
    this.destroyed = collidePointCircle(bullet.xPos,bullet.yPos, this.xPos,this.yPos,this.size);
    if(this.destroyed){
      this.regenerate();
      score += round(this.size/10)*50;
    }
  }
}

  //----------------------------------------------------//
 //------------------BULLET OBJECT---------------------//
//----------------------------------------------------//

function Bullet(){
  this.movementSpeed  = 10;
  this.xPos           = spaceShip.xPos;
  this.yPos           = spaceShip.yPos-spaceShip.size;
  this.size           = 10;
  this.hit            = false;
  this.go             = false;
  // Pulls the trigger (from keyPressed())
  this.trigger = function(){
    this.go = true;
  }
  //  Fires bullet when trigger is pulled
  this.fire = function(){
    colorMode(HSB);
    rectMode(CENTER);
    if(this.go === false){
      this.xPos           = spaceShip.xPos;
      this.yPos           = spaceShip.yPos-spaceShip.size;
    }
    //  Increment the Y coordinate by the motions speed
    if(this.go === true){
      this.yPos -= this.movementSpeed;
      //  Draw bullet as long as it remains within the window
      if(this.yPos > -10){
        strokeWeight(10);
        stroke(120,255,255);
        point(this.xPos, this.yPos);
        strokeWeight(1);
      }
      // Regenerate when bullet leaves the window
      else{
        this.regenerate();
      }
    }
    // Regenerate the bullet if it hits an asteroid
    if(this.hit){
      this.regenerate();
    }
  },
  // Restores initial settings
  this.regenerate = function(){
    this.go=false;
    this.xPos = spaceShip.xPos;
    this.yPos = spaceShip.yPos-spaceShip.size;
  }
}

  //------------------------------------------//
 //------------MAIN PROGRAM BODY-------------//
//------------------------------------------//

var stars;
var spaceShip;
var asteroid  = [];
var dead = false;
var lives = 3;
var score = 0;
var timeToBonus = 0;
var highScore = [0,0,0,0];
var bullet;

function setup() {
  createCanvas(windowWidth,windowHeight);
  stars = new Stars();
  stars.starMap();
  spaceShip = new SpaceShip();
  spaceShip.position(windowWidth/2, windowHeight*0.9);
  for(i=0;i<20;i++){
    asteroid[i] = new Asteroid();
  }
  bullet = new Bullet();
}

function draw() {
  background(0);

  stars.drawStars();
  spaceShip.create();
  
  //  Drop asteroids and listen for collision
  for(i=0;i<20;i++){
    asteroid[i].drop();
    asteroid[i].collision(spaceShip);
    if(asteroid[i].collision(spaceShip)){
      kill();
    }
    asteroid[i].blownUp();
    if(asteroid[i].blownUp()){
      bullet.regenerate();
    }
  }
  
  livesCounter();
  scoreCounter();
  extraLife();
  bullet.fire();
}

function keyPressed(){
  spaceShip.move();
  if(keyCode === 32){
    bullet.trigger();
  }
  // Listens for RETURN when space ship dies to restart play
  if(dead){
    gameOn();
  }
}

  //------------------------------------------//
 //--------------LIVES COUNTER---------------//
//------------------------------------------//

function livesCounter(){
  colorMode(RGB);
  fill(255,255,255);
  textAlign(CENTER);
  textSize(20);
  text('LIVES: '+str(lives), windowWidth/20, windowHeight/20);
}

  //------------------------------------------//
 //--------------SCORE COUNTER---------------//
//------------------------------------------//

function scoreCounter(){
  colorMode(RGB);
  fill(255,255,255);
  textAlign(RIGHT);
  textSize(20);
  text(score, windowWidth-(windowWidth/20), windowHeight/20);
}

  //------------------------------------------//
 //-------------SPACE SHIP DIES--------------//
//------------------------------------------//

// Executes on collision, if no lives remaining executes game over

function kill(){
    //  KA-BLAM!!! message on kill
    textAlign(CENTER);
    textSize(30);
    fill(60,255,255);
    text('KA-BLAM!!!', spaceShip.xPos, spaceShip.yPos-spaceShip.size);
    noFill();
    //-------------
    noLoop();   // Stop everything
    dead=true;  // Indicates the space ship is dead and action is stopped, restarted by keyPressed()
    lives--;    // Player loses one life
    if(lives === 0){
      gameOver();
    }
}

  //------------------------------------------//
 //------------GAME OVER FUNCTION------------//
//------------------------------------------//

function gameOver(){
  push();
  fill(255);
  rectMode(CENTER);
  textSize(windowHeight/10);
  textAlign(CENTER);
  text('GAME OVER', windowWidth/2,windowHeight/4);
  pop();
  setHighScores();
}

  //------------------------------------------//
 //-------------GAME ON FUNCTION-------------//
//------------------------------------------//

// Called by keyPressed() when the space ship dies; restarts play

function gameOn(){
  if(keyCode === RETURN){
    // Clear the screen of asteroids
    for(var i=0;i<20;i++){
      asteroid[i].regenerate();
      asteroid[i].drop();
    }
    bullet.regenerate();
    spaceShip.position(windowWidth/2, windowHeight*0.9);
    dead=false; // No longer dead
    if(lives === 0){  // Reset lives and score if game over
      lives=3;
      score=0;
    }
    loop();     // Game on!
    }
}

  //------------------------------------------//
 //----------------EXTRA LIFE----------------//
//------------------------------------------//

function extraLife(){
  var bonusLevel = 5000;
  if(timeToBonus >= bonusLevel){
    lives++;
    timeToBonus -= bonusLevel;
    return true;
  }
}

  //------------------------------------------//
 //-------RECORD AND PRINT HIGH SCORES-------//
//------------------------------------------//

function setHighScores(){
  highScore[3]=score;  // Add current score to the end of the list; last element doesn't show
  // Bubble sort - O(20)
  for(var j=0;j<3;j++){
    for(var i=0;i<3;i++){
      if(highScore[i+1]>highScore[i]){
        var temp       = highScore[i];
        highScore[i]   = highScore[i+1];
        highScore[i+1] = temp;
      }
    }
  }
  // Assemble high scores message
  var highScoreList = 'HIGH SCORES: \n';
  for(i=0;i<3;i++){
    highScoreList = highScoreList + str(i+1) + '.  ' + str(highScore[i] + '\n');
  }
  // Print high scores list
  push();
  fill(255);
  rectMode(CENTER);
  textSize(windowHeight/20);
  textAlign(CENTER);
  text(highScoreList, windowWidth/2, windowHeight/3);
  textSize(windowHeight/30);
  text('Press RETURN to Play Again.', windowWidth/2, windowHeight-15)
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  stars.starMap();
}