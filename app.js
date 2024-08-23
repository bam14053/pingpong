//Specifying width and length of canvas
const canvasWidth = 600;
const canvasLength = 400;
let itemColor = "blue";
let itemBlinkIntervalID = 0;
let ballColor = "white";
let itemTimeoutID = 1;

//Specifying length and width of the pongs
const defaultPlayerWidth = 10;
const defaultPlayerLength = 85;
let playerColor = "black";

//Game settings
const gameSettings = {
    isSinglePlayerMode : true,
    singlePlayerIntervalID : 0,
    chosenDifficulty : 2,
    difficulties : [50,30,20],
    playerSpeed : 30,
    maximumScore : 4,
    ballVelocity : 5,
    itemTimeouts : {
        short : [8000,10000],
        medium : [10000,15000],
        long : [15000,20000],
    },
    itemTimeout : [8000,10000],
    generateTimeout() { return Math.floor(Math.random()*(this.itemTimeout[1]-this.itemTimeout[0]))+this.itemTimeout[0];},
}

//amplifier, freezer, accelerator, attacher, shrink
const items = {
    0 : {
        itemName : "magnifier",
        itemDescription : "Increases your pong size by 20% for 10 seconds.",
        fireItem (player) {
            console.log("magnifier");
            player.pos.playerLength *= 1.2;
            setTimeout(function(player) {player.pos.playerLength /= 1.2}, 10000, player);
        }
    },
    1 : {
        itemName : "freezer",
        itemDescription : "Freezes the opponents pong for 4 seconds.",
        fireItem (player) {
            console.log("freezer");
            if(player === players[0]){
                players[1].isBlocked = true;
                setTimeout(function(player) {player.isBlocked = false}, 4000, players[1]);
            }else{
                players[0].isBlocked = true;
                setTimeout(function(player) {player.isBlocked = false}, 4000, players[0]);
            }
        }
    },
    2 : {
        itemName : "accelerator",
        itemDescription : "Accelerates the velocity of the ball by 25% for three seconds when moving to the opponents direction.",
        fireItem (player) {
            console.log("accelerator");
            if(player === players[0]){
                let interval = setInterval(function(newV, oldV) {
                    if(ball.vel.x > 0 && ball.vel.x < newV) ball.vel.x = newV;
                    if(ball.vel.x < 0 && ball.vel.y > oldV) ball.vel.y = oldV;
                        }, 50, ball.vel.x*1.25, ball.vel.x);
                setTimeout(function(interval) {clearInterval(interval)}, 3000, interval);
            }
            else{
                let interval = setInterval(function(newV, oldV) {
                    if(ball.vel.x < 0 && ball.vel.x < newV) ball.vel.x = newV;
                    if(ball.vel.x > 0 && ball.vel.y > oldV) ball.vel.y = oldV;
                        }, 50, ball.vel.x*1.25, ball.vel.x);
                setTimeout(function(interval) {clearInterval(interval)}, 3000, interval);
            }
        }
    },
    3 : {
        itemName : "attacher",
        itemDescription : "Shootes a spike and when sucessfully connected to the oppenents pong, attaches your pong to his granting you full control of his pong for 5 seconds.",
        fireItem (player) {console.log("Not implemented yet");}
    },
    4 : {
        itemName : "shrinker",
        itemDescription : "Decreases the opponents by 10% for 10 seconds.",
        fireItem (player) {
            console.log("shrinker");
            if(player === players[0]){
                players[1].pos.playerLength *= 0.9;
                setTimeout(function(player) {player.pos.playerLength /= 0.9}, 10000, players[1]);
            }else{
                players[0].pos.playerLength *= 0.9;
                setTimeout(function(player) {player.pos.playerLength /= 0.9}, 10000, players[0]);
            }
        }
    },
    itemCount : 3,
    generatedItem : {
        id : undefined,
        posX : 0,
        posY : 0,
    }
};

const ball = {
    pos : {
        x : canvasWidth/2,
        y : canvasLength/2,
    },
    vel : {
        x : 0,
        y : 0,
    },
    radius : 10,
    update () {
        //Player one pong
        if(this.vel.x < 0){
            if(items.generatedItem.id !== undefined)
                //Check if the two items (ball, item) overlap
                if(Math.hypot((this.pos.x-this.radius) - (items.generatedItem.posX-this.radius/2),
                    (this.pos.y-this.radius) - (items.generatedItem.posY-this.radius/2)) <= this.radius/2 + this.radius)
                        assignItemToPlayer(players[1]);
            if(this.pos.x-this.radius === defaultPlayerWidth || this.pos.x === defaultPlayerWidth){
                if(this.pos.y < (players[0].pos.borderDown()+5) && this.pos.y > (players[0].pos.borderUp()-5)){
                    if(this.pos.y <= players[0].pos.y + (players[0].pos.playerLength/6) && this.pos.y >= players[0].pos.y - (players[0].pos.playerLength/6)){
                        this.vel.x *= -1;
                    }
                    else if(this.pos.y > players[0].pos.y && this.pos.y <= players[0].pos.y + (players[0].pos.playerLength/6)*2){
                        this.vel.y += 1.5;
                        this.vel.x *= -1;
                    } else if(this.pos.y < players[0].pos.y && this.pos.y >= players[0].pos.y - (players[0].pos.playerLength/6)*2 ){
                        this.vel.y -= 1.5;
                        this.vel.x *= -1;
                    } else if(this.pos.y > players[0].pos.y){
                        this.vel.y += 2;
                        this.vel.x *= -1;
                    } else if(this.pos.y < players[0].pos.y){
                        this.vel.y -= 2;
                        this.vel.x *= -1;
                    }
                }
            } 
            if(this.pos.x-this.radius <= -5){
              if(++players[0].score < gameSettings.maximumScore){
                this.resetBall();
                setTimeout(this.startBall, 700);
                players[0].reset();
                players[1].reset();
              } 
              else
                endGame("Player 2 has won");
            }
         }

        //Player two pong
        if(this.vel.x > 0){
            if(items.generatedItem.id !== undefined)
                //Check if the two items (ball, item) overlap
            if(Math.hypot((this.pos.x+this.radius) - (items.generatedItem.posX+this.radius/2),
                    (this.pos.y+this.radius) - (items.generatedItem.posY+this.radius/2)) <= this.radius/2 + this.radius)
                        assignItemToPlayer(players[0]);
            if(this.pos.x+this.radius === canvasWidth-defaultPlayerWidth || this.pos.x === canvasWidth-defaultPlayerWidth){
                if(this.pos.y < (players[1].pos.borderDown()+5) && this.pos.y > (players[1].pos.borderUp()-5)){
                    if(this.pos.y <= players[1].pos.y + (players[1].pos.playerLength/6) && this.pos.y >= players[1].pos.y - (players[1].pos.playerLength/6)){
                        this.vel.x *= -1;
                    }
                    else if(this.pos.y > players[1].pos.y && this.pos.y <= players[1].pos.y + (players[1].pos.playerLength/6)*2){
                        this.vel.y += 1.5;
                        this.vel.x *= -1;
                    } else if(this.pos.y < players[1].pos.y && this.pos.y >= players[1].pos.y - (players[1].pos.playerLength/6)*2 ){
                        this.vel.y -= 1.5;
                        this.vel.x *= -1;
                    } else if(this.pos.y > players[1].pos.y){
                        this.vel.y += 2;
                        this.vel.x *= -1;
                    } else if(this.pos.y < players[1].pos.y){
                        this.vel.y -= 2;
                        this.vel.x *= -1;
                    }
                }
            }
            if(this.pos.x+this.radius >= canvasWidth+5){
                if(++players[1].score < gameSettings.maximumScore){
                    this.resetBall();
                    setTimeout(this.startBall, 700);
                    players[0].reset();
                    players[1].reset();
                }
                else
                    endGame("Player 1 has won");
            }
        }

        //Reverse ball when it touches the bottom or the top
        if(this.pos.y-this.radius < 2 || this.pos.y+this.radius > canvasLength-2 )
            this.vel.y *= -1;
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
    },
    resetBall () {
        this.pos.x = canvasWidth/2;
        this.pos.y = canvasLength/2;
        this.vel.x = 0;
        this.vel.y = 0;
    },
    startBall() {
        ball.vel.x += Math.round(Math.random()) ? gameSettings.ballVelocity : -gameSettings.ballVelocity;
    }
};

function removeItemFromPlayingfield(){
    items.generatedItem.id = undefined;
    clearInterval(itemBlinkIntervalID);
    itemColor = "blue";
}

function assignItemToPlayer(player){
    clearTimeout(itemTimeoutID);
    //Give the player his item and unset everything
    player.item.id = items.generatedItem.id;
    player.item.itemCount = items.itemCount;
    //Unset everything until item has been used.
    removeItemFromPlayingfield();
    if(gameSettings.isSinglePlayerMode && player === players[1])
        setTimeout(runSinglePlayerItems, Math.floor (Math.random()*3000) + 1000);
}

//Creating the various items
function generateItem () {
    items.generatedItem.id = Math.floor(Math.random()*(Object.keys(items).length-2));
    items.generatedItem.posX = Math.floor(Math.random()*canvasWidth/3)+ Math.floor(canvasWidth/3);
    items.generatedItem.posY = Math.floor(Math.random()*canvasLength/2)+ Math.floor(canvasLength/2);
    itemBlinkIntervalID = setInterval(function() {itemColor = itemColor == "white" ? "blue" : "white"; } ,500);
    itemTimeoutID = setTimeout(function () { if(items.generatedItem.id !== undefined) removeItemFromPlayingfield(); generateItem (); }, 15000);
}

//Player coordinates
function Player() {
    this.pos = {
        x : 0,
        y : canvasLength/2,
        borderUp() { return this.y - this.playerLength/2 },
        borderDown() { return this.y + this.playerLength/2 },
        playerLength : defaultPlayerLength
    };
    this.score = 0;
    this.move = {
        moveID : undefined,
        vel : 5,
        moveUp (player) { if (player.pos.borderUp() > 0 && !player.isBlocked) player.pos.y -= player.move.vel },
        moveDown (player) { if (player.pos.borderDown() < canvasLength && !player.isBlocked) player.pos.y += player.move.vel }
    };
    this.reset = function () { this.pos.y = canvasLength/2; },
    this.item = {
        id : undefined,
        itemCount : 0,
    };
    this.isBlocked = false;
};

const players = [];

function moveSinglePlayerOpponent() {
    if(ball.vel.x <= 0 || ball.pos.x < canvasWidth/2)
        return;
    else if(ball.vel.y == 0){
        if(players[1].pos.y-20 != ball.pos.y)
            players[1].move.moveDown(players[1]);
    }
    else if(players[1].pos.y < ball.pos.y)
        players[1].move.moveDown(players[1]);
    else if(players[1].pos.y > ball.pos.y)
        players[1].move.moveUp(players[1]);
}

function draw () {
    const canvas = document.querySelector("canvas").getContext("2d");
    canvas.clearRect(0, 0, canvasWidth, canvasLength);

    //The canvas background
    canvas.fillStyle = "rgb(95, 218, 86)";
    canvas.fillRect(0, 0, canvasWidth, canvasLength);

    //The players
    canvas.fillStyle = playerColor;
    canvas.fillRect(players[0].pos.x,players[0].pos.borderUp(),defaultPlayerWidth, players[0].pos.playerLength);
    canvas.fillRect(players[1].pos.x,players[1].pos.borderUp(),defaultPlayerWidth, players[1].pos.playerLength);

    //The ball
    ball.update()
    canvas.beginPath();
    canvas.arc(ball.pos.x, ball.pos.y, ball.radius, 0, 2 * Math.PI);
    canvas.fillStyle = ballColor;
    canvas.fill();

    //Draw item if generated
    if(items.generatedItem.id !== undefined){
        canvas.beginPath();
        canvas.arc(items.generatedItem.posX, items.generatedItem.posY, ball.radius/2, 0, 2 * Math.PI);
        canvas.fillStyle = itemColor;
        canvas.fill();
    }
    window.requestAnimationFrame(draw)
}

function runSinglePlayerItems(){
    items[players[1].item.id].fireItem(players[1]);
    if(--players[1].item.itemCount === 0){
        players[1].item.id = undefined;
        setTimeout(generateItem, gameSettings.generateTimeout());
    }else
        setTimeout(runSinglePlayerItems, Math.floor (Math.random()*3000) + 1000);
}

function startGame(){
    players.push(new Player());
    players.push(new Player());
    players[1].pos.x = canvasWidth-defaultPlayerWidth;
    setTimeout(ball.startBall,3000);
    gameSettings.singlePlayerIntervalID = setInterval(moveSinglePlayerOpponent, gameSettings.difficulties[gameSettings.chosenDifficulty]);
    setTimeout(generateItem, gameSettings.generateTimeout());
}

function endGame(message){
    alert(message);
    clearInterval(gameSettings.singlePlayerIntervalID);
    clearTimeout(itemTimeoutID);
    removeItemFromPlayingfield();
    players.pop();
    players.pop();
    ball.resetBall();
    if(prompt("Would you like to play again? (y,n)") === 'y')
        startGame();
}

function addListeners(){
    //Registering the key events
    window.addEventListener("keydown", (e) => {
        if(e.code === "ArrowDown" && !players[0].move.moveID)
            players[0].move.moveID = setInterval(players[0].move.moveDown, gameSettings.playerSpeed, players[0]);
        if(e.code === "ArrowUp" && !players[0].move.moveID)
            players[0].move.moveID = setInterval(players[0].move.moveUp, gameSettings.playerSpeed, players[0]);
    });

    //Registering the key events
    window.addEventListener("keyup", (e) => {
        if(players[0].move.moveID && (e.code === "ArrowDown") || (e.code === "ArrowUp")){
            clearInterval(players[0].move.moveID)
            players[0].move.moveID = undefined;
        }else if(e.code === "Space" && players[0].item.itemCount > 0){
            items[players[0].item.id].fireItem(players[0]);
            if(--players[0].item.itemCount === 0){
                players[0].item.id = undefined;
                setTimeout(generateItem, gameSettings.generateTimeout());
            }
        }
    });
}

startGame();
addListeners();
window.requestAnimationFrame(draw);
