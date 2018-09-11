// INITIAL SETUP 
var canvas = document.getElementById("canvas"),
    c = canvas.getContext("2d");

var innerWidth = 800,
    innerHeight = 600;
canvas.width = innerWidth;
canvas.height = innerHeight;
	
// VARIABLES 

var score = 0,
    lastTime = 0,
    isOn = false;

// KEYS EVENTS LISTENERS 

var pressedKeys = {
    37: false, // Left Arrow Key
    39: false, // Right Arrow Key
    38: false, // Up Arrow Key
    40: false // Down Arrow Key
};

addEventListener("keydown", function(e) {
    if (e.keyCode in pressedKeys) {
        pressedKeys[e.keyCode] = true;
        
        switch(e.keyCode){
        case 37: basket.x = wolf.x - 200; break;
        case 38: basket.y = wolf.y - 30; break;
        case 39: basket.x = wolf.x + 200; break;
        case 40: basket.y = wolf.y + 120; break;
        }
    };
});

addEventListener("keyup", function(e) {
    if (e.keyCode in pressedKeys) {
        pressedKeys[e.keyCode] = false;
    }
});

// WOLF

var wolf = {},
    wolf_width = 130,
	wolf_height = 130,
	wolf_img = new Image();
wolf_img.src = "images/wolf-face.png";

wolf = {
    width: wolf_width,
    height: wolf_height,
    x: innerWidth / 2 - wolf_width / 2,
    y: innerHeight - (wolf_height + 180),
    lives: 10,
    draw: function() {
        c.drawImage(wolf_img, this.x, this.y, this.width, this.height);
    }
};

// BASKET

var basket = {},
    basket_width = 130,
	basket_height = 130,
	basket_img = new Image();
basket_img.src = "images/basket.png";

basket = {
    width: basket_width,
    height: basket_height,
    x: wolf.x + 200,
    y: wolf.y - 50,
    draw: function() {
        c.drawImage(basket_img, this.x, this.y, this.width, this.height);
    }
};

// EGGS

var eggsArr = [],
    eggIndex = 0,
    egg_width = 50,
    egg_height = 50,
    egg_timer = 200,
    egg_img = new Image();
egg_img.src = "images/egg.png";

function enhanceLevel(score) {
    if(score <= 5){ return 1500; }
    else if(score <= 10){ return 1200; }
    else if(score <= 15){ return 1000; }
    else if(score <= 20){ return 700; }
    else if(score <= 25){ return 400; }
    return 200;
};

function egg(x, y, dx, dy, egg_img, egg_width, egg_height, side) {

    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this.img = egg_img;
    this.width = egg_width;
    this.height = egg_height;
    eggIndex++;
    eggsArr[eggIndex] = this;
    this.id = eggIndex;
    this.destinationLeft = innerWidth / 2 - (wolf.width / 2) - 50;
    this.destinationRight = innerWidth / 2 + (wolf.width / 2) + 80;
    this.side = side;

    this.update = function() {

        this.y += this.dy;

        if (side == "left") {
            this.x += this.dx;
            if (this.x + this.width >= this.destinationLeft) {
                this.x = innerWidth / 2 - (wolf.width / 2) - 50;
                this.y += 2;
                if (this.y + this.height >= innerHeight) {
                    wolf.lives += -1;
                    this.delete();
                }
            };
            this.draw();
        } else if (side == "right") {
            this.x -= this.dx;
            if (this.x + this.width <= this.destinationRight) {
                this.x = innerWidth / 2 + wolf.width - 80;
                this.y += 2;
                if (this.y + this.height >= innerHeight) {
                    wolf.lives += -1;
                    this.delete();
                };
            };
        this.draw();
        }
    };

    this.delete = function() {
        delete eggsArr[this.id];
    };
    this.draw = function() {
        c.drawImage(this.img, this.x, this.y, this.width, this.height);
    }
};

var eggPositionY = {
    upper: 50,
    lower: 290
};

function create_egg(side) {
    var x = ( side == 'left' ) ? -egg_width : innerWidth;
    var y = eggPositionY[Math.random() > 0.5 ? "upper" : "lower"];
    var dx = 4;
    var dy = 3;
    var side = side;

    new egg(x, y, dx, dy, egg_img, egg_width, egg_height, side);
};

function catches(a, b) {
    return 	a.x < b.x + b.width &&
		    a.x + a.width > b.x &&
		    a.y < b.y + b.height &&
		    a.y + a.height > b.y;
};

function handleCatch() {

    eggsArr.forEach(function(egg) {
        if (catches(basket, egg)) {
            score += 1;
            egg.delete();
        };
    });
};

function drawShelves() {
    function drawShelf(x1, y1, x2, y2, x3, y3) {
        c.beginPath();
        c.moveTo(x1, y1);
        c.lineTo(x2, y2);
        c.lineTo(x3, y3);
        c.fill();
    };
    drawShelf(0, 135, 187, 265, 0, 200); // Left Upper Shelf
    drawShelf(0, 374, 187, 498, 0, 441); // Left Down Shelf
    drawShelf(800, 135, 613, 265, 800, 200); // Right Upper Shelf
    drawShelf(800, 374, 613, 498, 800, 441); // Right Down Shelf
};

// MAIN

function animate(currentTime) {
    var animation = requestAnimationFrame(animate);
    c.clearRect(0, 0, canvas.width, canvas.height);
    drawShelves();

    //INFORMATION

    c.font = "24px arial";
    c.fillStyle = "#ffffff";
    c.fillText("счёт: ".toUpperCase() + score, 15, 25);

    c.font = "24px arial";
    c.fillStyle = "#ffffff";
    var showLives = c.fillText("жизни: ".toUpperCase() + wolf.lives, innerWidth - 150, 25)

    // MAIN
   
    wolf.draw();
    basket.draw();

    // CREATE NEW EGGS

    egg_timer = enhanceLevel(score);

    if (currentTime >= lastTime + egg_timer) {
        lastTime = currentTime;
        create_egg("left");
        create_egg("right");
    };

    eggsArr.forEach(function(egg) {
        egg.update();
    });

    handleCatch();

    // END GAME

    if (wolf.lives < 0) {
        cancelAnimationFrame(animation);
        pressAnyKey();
        isOn = false;
        lastTime = 0;
        score = 0;
        wolf.lives = 10;
        eggsArr = [];
    };
};

function pressAnyKey() {
    c.font = "32px arial";
    c.fillStyle = "#ffffff";
    c.fillText("Нажмите любую клавишу".toUpperCase(), 180, 100);

    addEventListener("keydown", function(e) {
        if (e.keyCode >= 0 && isOn == false && e.keyCode !== 116) {
            c.clearRect(0, 0, canvas.width, canvas.height);
            animate();
            isOn = true;
        };
    });
};

pressAnyKey();
