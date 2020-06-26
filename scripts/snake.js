"use strict";

// File created on May 10th
// source file for a fun little snake game
// where the food will be little animals that run
// across the screen in a fixed direction

// to start a game, use the static loadAssets function to create
// a promise object, then create a new Snake object. Game should 
// run automatically.


class Snake {

    static MENU = 0;
    static GAME = 1;
    static IDLE = 2;

    static body1 = new Image();
    static body2 = new Image();
    static body3 = new Image();
    static food1 = new Image();
    static food2 = new Image();
    static food3 = new Image();
    static food4 = new Image();
    static food5 = new Image();

    static music1 = new Audio();
    static music2 = new Audio();
    static clickSound = new Audio();
    static highlightSound = new Audio();
    static defeatSound = new Audio();
    static winSound = new Audio();
    static eatSound = new Audio();


    static loadAssets() {
        function loadImage(asset, src) {
            return new Promise(
                (resolve, reject) => {
                    asset.addEventListener(
                        "load",
                        (e) => {
                            resolve()
                        },
                    );
                    asset.addEventListener(
                        "error",
                        (e) => {
                            reject(e.error);
                        },
                    );
                    asset.src = src;
                }
            )
        }
        function loadAudio(asset, src) {
            return new Promise(
                (resolve, reject) => {
                    asset.addEventListener(
                        "canplaythrough",
                        (e) => {
                            resolve();
                        },
                    );
                    asset.addEventListener(
                        "error",
                        (e) => {
                            reject(e.error);
                        },
                    );
                    asset.src = src;
                }
            );
        }
        return Promise.all([
            loadImage(
                Snake.body1,
                "resources/Images/body1.png",
            ),
            loadImage(
                Snake.body2,
                "resources/Images/body2.png",
            ),
            loadImage(
                Snake.body3,
                "resources/Images/body3.png",
            ),
            loadImage(
                Snake.food1,
                "resources/Images/food.png",
            ),
            loadImage(
                Snake.food2,
                "resources/Images/food.png",
            ),
            loadImage(
                Snake.food3,
                "resources/Images/food.png",
            ),
            loadImage(
                Snake.food4,
                "resources/Images/food.png",
            ),
            loadImage(
                Snake.food5,
                "resources/Images/food.png",
            ),
            loadAudio(
                Snake.music1,
                "resources/Sound/music1.mp3",
            ),
            loadAudio(
                Snake.music2,
                "resources/Sound/music2.mp3",
            ),
            loadAudio(
                Snake.clickSound,
                "resources/Sound/click.wav",
            ),
            loadAudio(
                Snake.highlightSound,
                "resources/Sound/highlight.mp3",
            ),
            loadAudio(
                Snake.defeatSound,
                "resources/Sound/defeat.mp3",
            ),
        ]);
    }

    constructor() {

        this.mouseDown = false;

        this.gameStatus = Snake.MENU;
        this.currentMenuButton = -1;
        this.gameSpeed = "fast";
        this.gameSize = "normal";

        this.soundOn = true;
        this.musicOn = true;

        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("id", "snake");
        this.canvas.setAttribute("class", "screen");
        this.canvas.setAttribute("width", 1800);
        this.canvas.setAttribute("height", 800);
        
        this.canvas.addEventListener(
            "click",
            this.clickHandler.bind(this),
        );
        this.canvas.addEventListener(
            "mousedown",
            this.mousedownHandler.bind(this),
        );
        this.canvas.addEventListener(
            "mousemove",
            this.mousemoveHandler.bind(this),
        );
        document.addEventListener(
            "keyup",
            this.keyupHandler,
        );
        document.addEventListener(
            "keydown",
            this.keydownHandler,
        );

        this.screen = this.canvas.getContext("2d");
        this.screen.font = "40px courier";

        this.buttons = [
            "New Game",
            "How to Play",
            "Credit",
            "Quit"
        ]
        this.buttonWidths = [];
        this.buttons.forEach(
            (txt) => {
                this.buttonWidths.push(
                    this.screen.measureText(txt).width,
                );
            }
        );
        
        document.body.append(this.canvas);

        this.tailPrev = {
            i : -1,
            j : -1,
        }
        this.food = {
            img : Snake.food1,
            i : -1,
            j : -1,
        }

        this.body = [];
        this.bodySet = new Set();
        this.space = [];
        this.spaceMap = new Map();

        this.currentMusic = Snake.music1;
        this.playMusic(Snake.music1);
        this.renderBackground();
        this.animateMenu();
        this.renderSettings();
    }

    destroy() {
        document.removeEventListener(
            "keyup", this.keyupHandler
        );
        document.removeEventListener(
            "keydown", this.keydownHandler
        );
        this.canvas.remove();
        Snake.body1.remove();
        Snake.body2.remove();
        Snake.body3.remove();
        Snake.food1.remove();
        Snake.food2.remove();
        Snake.food3.remove();
        Snake.food4.remove();
        Snake.food5.remove();
        Snake.music1.remove();
        Snake.music2.remove();
        Snake.clickSound.remove();
        Snake.highlightSound.remove();
        Snake.defeatSound.remove();
        Snake.winSound.remove();
        Snake.eatSound.remove();
    }

    startGame() {
        clearInterval(this.menuAnimation);
        this.gameStatus = Snake.GAME;

        this.initialize();
        this.gameAnimation = setInterval(
            () => {

                this.update();
                this.screen.fillStyle = "rgb(20, 20, 30)";
                this.screen.fillRect(295, 95, 1210, 610);

                this.renderFood();
                this.renderSnake();

            },
            80,
        );
    }

    endGame() {
        this.gameStatus = Snake.IDLE;
        clearInterval(this.gameAnimation);
        alert("game over");
    }

    playSound(audio) {
        audio.currentTime = 0;
        if (this.soundOn) {
            audio.play();
        }
    }

    playMusic(audio, loop = true) {
        this.currentMusic.pause();
        this.currentMusic.currentTime = 0;
        this.currentMusic = audio;
        this.currentMusic.loop = loop;
        if (this.musicOn) {
            this.currentMusic.play();
        }
    }

    renderBackground() {
        this.screen.fillStyle = "rgb(100, 55, 55)";
        this.screen.fillRect(0, 0, 1800, 800);
        this.screen.fillStyle = "rgb(20, 20, 30)";
        this.screen.fillRect(295, 95, 1210, 610);
    }

    animateMenu() {
        this.menuAnimation = setInterval(
            () => {
                this.renderMenu();
            },
            20,
        );
    }

    renderMenu() {
        this.screen.textAlign = "center";
        this.screen.textBaseline = "middle";
        this.screen.fillStyle = "rgb(20, 20, 30)";
        this.screen.fillRect(
            700, 350, 400, 300,
        );
        let x = 900, y = 400;
        for (let i = 0; i < 4; i++) {
            if (this.currentMenuButton == i) {
                if (this.mouseDown) {
                    this.screen.font = "bold 36px courier";
                } else {
                    this.screen.font = "bold 40px courier";
                }
            } else {
                this.screen.font = "36px courier";
            }
            this.screen.fillStyle = "silver";
            this.screen.fillText(this.buttons[i], x, y);
            y += 60;
        }
    }

    renderSettings() {
    }

    initialize() {

        this.arrowUp = false;
        this.arrowDown = false;
        this.arrowLeft = false;
        this.arrowRight = false;

        switch (this.gameSize) {
            case "small":
                this.cellSize = 50;
                break;
            case "normal":
                this.cellSize = 40;
                break;
            case "large":
                this.cellSize = 30;
                break;
        }
        switch (this.gameSpeed) {
            case "slow":
                this.frames = 15;
                break;
            case "normal":
                this.frames = 10;
                break;
            case "fast":
                this.frames = 5;
                break;
        }

        this.row = 600 / this.cellSize;
        this.col = 1200 / this.cellSize;
        this.qsize = 2 * this.row * this.col;
        this.body.length = 0;
        this.bodySet.clear();
        this.space.length = 0;
        this.spaceMap.clear();
        this.currentFrame = 0;
        this.tailIndex = 0;
        this.headIndex = 6;
        this.isGrowing = false;
        
        for (let i = 0; i < this.row * this.col; i++) {
            this.space[i] = i;
            this.spaceMap.set(i, i);
        }

        this.nextDirection = [
            "Up",
            "Down",
            "Left",
            "Right",
        ][0 | Math.random() * 4]
        this.currentDirection = this.nextDirection;

        let _rand = (a, b) => {
            return 0 | a + Math.random() * (b - a);
        }

        let dRow, dCol;
        switch (this.currentDirection) {
            case "Up":
                this.tailPrev.i = _rand(this.row / 2 + 3, this.row);
                this.tailPrev.j = _rand(0, this.col);
                dRow = -1;
                dCol = 0;
                break;
            case "Down":
                this.tailPrev.i = _rand(0, this.row / 2 - 3);
                this.tailPrev.j = _rand(3, this.col);
                dRow = 1;
                dCol = 0;
                break;
            case "Left":
                this.tailPrev.i = _rand(0, this.row);
                this.tailPrev.j = _rand(this.col / 2 + 3, this.col);
                dRow = 0;
                dCol = -1;
                break;
            case "Right":
                this.tailPrev.i = _rand(0, this.row);
                this.tailPrev.j = _rand(0, this.col / 2 - 3);
                dRow = 0;
                dCol = 1;
                break;
        }

        for (let k = 1; k <= 4; k++) {
            let a = this.tailPrev.i + k * dRow;
            let b = this.tailPrev.j + k * dCol;
            let key = a * this.col + b;
            this.body.push(a, b);
            this.bodySet.add(key);
            this.space[key] = this.space[this.space.length - 1];
            this.space.length--;
            this.spaceMap.delete(key);
        }

        this.dispenseFood();
        this.renderFood();
        this.renderSnake();

    }

    dispenseFood() {
        let foodLocationKey = this.space[
            0 | Math.random() * this.space.length
        ];
        this.food.i = 0 | foodLocationKey / this.col;
        this.food.j = foodLocationKey  % this.col;
        switch (0 | Math.random() * 5) {
            case 0:
                this.food.img = Snake.food1;
                break;
            case 1:
                this.food.img = Snake.food2;
                break;
            case 2:
                this.food.img = Snake.food3;
                break;
            case 3:
                this.food.img = Snake.food4;
                break;
            case 4:
                this.food.img = Snake.food5;
                break;
        }
    }

    update() {
        
        if (++this.currentFrame < this.frames) {
            return;
        }

        let a = this.body[this.headIndex];
        let b = this.body[this.headIndex + 1];
        let justGrown = this.isGrowing;

        this.isGrowing = (a == this.food.i && b == this.food.j);
        this.currentFrame = 0;
        this.headIndex = (this.headIndex + 2) % this.qsize;
        switch (this.nextDirection) {
            case "Up":
                if (this.currentDirection != "Down") {
                    a -= 1;
                    this.currentDirection = "Up";
                } else {
                    a += 1;
                }
                break;
            case "Down":
                if (this.currentDirection != "Up") {
                    a += 1;
                    this.currentDirection = "Down";
                } else {
                    a -= 1;
                }
                break;
            case "Left":
                if (this.currentDirection != "Right") {
                    b -= 1;
                    this.currentDirection = "Left";
                } else {
                    b += 1;
                }
                break;
            case "Right":
                if (this.currentDirection != "Left") {
                    b += 1;
                    this.currentDirection = "Right";
                } else {
                    b -= 1;
                }
                break;
        }

        let newHead = a * this.col + b;

        if (a < 0 || a >= this.row || 
            b < 0 || b >= this.col || 
            this.bodySet.has(newHead) ) {
            this.endGame();
        }

        if (this.isGrowing) {

            this.dispenseFood();
            if (this.spaceMap.get(newHead) != this.space.length - 1) {
                this.space[
                    this.spaceMap.get(newHead)
                ] = this.space[this.space.length - 1];
                this.spaceMap.set(
                    this.space[this.space.length - 1],
                    this.spaceMap.get(newHead),
                );
            }
            this.space.length--;

        } else {

            this.space[
                this.spaceMap.get(newHead)
            ] = this.tailPrev.i * this.col + this.tailPrev.j;
            this.spaceMap.set(
                this.tailPrev.i * this.col + this.tailPrev.j,
                this.spaceMap.get(newHead),
            );

        }

        if (!justGrown) {
            this.tailPrev.i = this.body[this.tailIndex];
            this.tailPrev.j = this.body[this.tailIndex + 1];
            this.tailIndex = (this.tailIndex + 2) % this.qsize;
            this.bodySet.delete(
                this.tailPrev.i * this.col + this.tailPrev.j,
            );
        }
        this.nextDirection = this.currentDirection;
        this.body[this.headIndex] = a ;
        this.body[this.headIndex + 1] = b;
        this.bodySet.add(newHead);
        this.spaceMap.delete(newHead);

    }

    _renderHead() {
        let p = this.screen.createPattern(Snake.body1, "");

        let x = 300 + this.cellSize / 2;
        let y = 100 + this.cellSize / 2;
        let ratio = this.currentFrame / this.frames;
        let iHead = this.body[this.headIndex];
        let jHead = this.body[this.headIndex + 1];
        let i1 = this.body[
            (this.headIndex + this.qsize - 2) % this.qsize
        ];
        let j1 = this.body[
            (this.headIndex + this.qsize - 1) % this.qsize
        ];
        let i2 = this.body[
            (this.headIndex + this.qsize - 4) % this.qsize
        ];
        let j2 = this.body[
            (this.headIndex + this.qsize - 3) % this.qsize
        ];

        let ox, oy, beta;

        this.screen.strokeStyle = p;
        this.screen.beginPath();
        if ((iHead == i1 && i1 == i2) || 
            (jHead == j1 && j1 == j2)) {
            let x1 = x + (j1 + j2) * this.cellSize / 2;
            let y1 = y + (i1 + i2) * this.cellSize / 2;
            ox = x1 + (j1 - j2) * this.cellSize * ratio;
            oy = y1 + (i1 - i2) * this.cellSize * ratio;
            this.screen.moveTo(x1, y1);
            this.screen.lineTo(ox, oy);
            beta = (
                i1 == i2 ? 
                Math.PI * (j1 < j2) :
                -Math.PI / 2 + Math.PI * (i1 > i2)
            );
        } else {
            let theta1 = (
                i1 == i2 ?
                Math.PI / 2 - Math.PI * (i1 < iHead) :
                Math.PI * (j1 < jHead)
            );
            let theta2 = theta1 + ratio * Math.PI / 2 * (
                i1 == i2 ?
                2 * (j1 > j2 ^ i1 > iHead)  - 1 :
                1 - 2 * (i1 > i2 ^ j1 > jHead)
            );
            let cx = x + (j2 + jHead) * this.cellSize / 2;
            let cy = y + (i2 + iHead) * this.cellSize / 2;
            this.screen.arc(
                cx, cy,
                this.cellSize / 2,
                theta1, theta2,
                theta1 > theta2,
            );
            ox = cx + Math.cos(theta2) * this.cellSize / 2;
            oy = cy + Math.sin(theta2) * this.cellSize / 2;
            beta = theta2 + (
                (i1 - i2) * (jHead - j1) - (j1 - j2) * (iHead - i1) > 0 ? 
                -Math.PI / 2 : Math.PI / 2
            );
        }
        this.screen.stroke();

        let xl = this.cellSize * 0.3 * Math.cos(beta + Math.PI / 2);
        let yl = this.cellSize * 0.3 * Math.sin(beta + Math.PI / 2);
        let xr = this.cellSize * 0.3 * Math.cos(beta - Math.PI / 2);
        let yr = this.cellSize * 0.3 * Math.sin(beta - Math.PI / 2);
        let xm = this.cellSize * Math.cos(beta);
        let ym = this.cellSize * Math.sin(beta);

        this.screen.beginPath();
        this.screen.moveTo(
            ox + xl,
            oy + yl,
        );
        this.screen.bezierCurveTo(
            ox + xl + 0.1 * xm,
            oy + yl + 0.1 * ym,
            ox + 1.5 * xl + 0.3 * xm,
            oy + 1.5 * yl + 0.3 * ym,
            ox + 1.2 * xl + 0.5 * xm,
            oy + 1.2 * yl + 0.5 * ym,
        );
        this.screen.quadraticCurveTo(
            ox + xm,
            oy + ym,
            ox + 1.2 * xr + 0.5 * xm,
            oy + 1.2 * yr + 0.5 * ym,
        );
        this.screen.bezierCurveTo(
            ox + 1.5 * xr + 0.3 * xm,
            oy + 1.5 * yr + 0.3 * ym,
            ox + xr + 0.1 * xm,
            oy + yr + 0.1 * ym,
            ox + xr,
            oy + yr,
        );
        this.screen.fill();

        this.screen.beginPath();
        this.screen.fillStyle = "gold";
        this.screen.ellipse(
            ox + 0.7 * xl + 0.5 * xm,
            oy + 0.7 * yl + 0.5 * ym,
            this.cellSize * 0.15, 
            this.cellSize * 0.15,
            beta,
            0, Math.PI * 2,
        );
        this.screen.ellipse(
            ox + 0.7 * xr + 0.5 * xm,
            oy + 0.7 * yr + 0.5 * ym,
            this.cellSize * 0.15, 
            this.cellSize * 0.15,
            beta,
            0, Math.PI * 2,
        );
        this.screen.fill();

        this.screen.beginPath();
        this.screen.fillStyle = "black";
        this.screen.ellipse(
            ox + 0.7 * xl + 0.6 * xm,
            oy + 0.7 * yl + 0.6 * ym,
            this.cellSize * 0.1, 
            this.cellSize * 0.1,
            beta,
            0, Math.PI * 2,
        );
        this.screen.ellipse(
            ox + 0.7 * xr + 0.6 * xm,
            oy + 0.7 * yr + 0.6 * ym,
            this.cellSize * 0.1, 
            this.cellSize * 0.1,
            beta,
            0, Math.PI * 2,
        );
        this.screen.fill();
    }

    _renderTail() {
        let p = this.screen.createPattern(Snake.body1, "");

        let x = 300 + this.cellSize / 2;
        let y = 100 + this.cellSize / 2;
        let ratio = (
            this.isGrowing ? 1 : 1 - this.currentFrame / this.frames
        );
        let i1 = this.body[this.tailIndex];
        let j1 = this.body[this.tailIndex + 1];
        let i2 = this.body[(this.tailIndex + 2) % this.qsize];
        let j2 = this.body[(this.tailIndex + 3) % this.qsize];

        let ox, oy, beta;

        this.screen.strokeStyle = p;
        this.screen.lineWidth = this.cellSize * 0.6;
        this.screen.beginPath();
        if ((this.tailPrev.i == i1 && i1 == i2) || 
            (this.tailPrev.j == j1 && j1 == j2)) {
            let x1 = x + (j1 + j2) * this.cellSize / 2;
            let y1 = y + (i1 + i2) * this.cellSize / 2;
            ox = x1 + (j1 - j2) * this.cellSize * ratio;
            oy = y1 + (i1 - i2) * this.cellSize * ratio;
            this.screen.moveTo(x1, y1);
            this.screen.lineTo(ox, oy);
            beta = (
                i1 == i2 ? 
                Math.PI * (j1 < j2) :
                Math.PI / 2 - Math.PI * (i1 < i2)
            );
        } else {
            let theta1 = (
                i1 == i2 ?
                Math.PI / 2 - Math.PI * (i1 < this.tailPrev.i) :
                Math.PI * (j1 < this.tailPrev.j)
            );
            let theta2 = theta1 + ratio * Math.PI / 2 * (
                i1 == i2 ?
                2 * (j1 > j2 ^ i1 > this.tailPrev.i) - 1 :
                1 - 2 * (i1 > i2 ^ j1 > this.tailPrev.j)
            );
            let cx = x + (this.tailPrev.j + j2) * this.cellSize / 2;
            let cy = y + (this.tailPrev.i + i2) * this.cellSize / 2;
            this.screen.arc(
                cx, cy,
                this.cellSize / 2,
                theta1, theta2,
                theta1 > theta2,
            );
            ox = cx + Math.cos(theta2) * this.cellSize / 2;
            oy = cy + Math.sin(theta2) * this.cellSize / 2;
            beta = theta2 + Math.PI / 2 * (theta2 < theta1 ? -1 : 1);
        }
        this.screen.stroke();

        let xl = this.cellSize * 0.3 * Math.cos(beta + Math.PI / 2);
        let yl = this.cellSize * 0.3 * Math.sin(beta + Math.PI / 2);
        let xr = this.cellSize * 0.3 * Math.cos(beta - Math.PI / 2);
        let yr = this.cellSize * 0.3 * Math.sin(beta - Math.PI / 2);
        let xm = this.cellSize * 0.8 * Math.cos(beta);
        let ym = this.cellSize * 0.8 * Math.sin(beta);

        this.screen.fillStyle = p;
        this.screen.beginPath();
        this.screen.moveTo(
            ox + xl,
            oy + yl,
        );
        this.screen.bezierCurveTo(
            ox + xl + xm / 2,
            oy + yl + ym / 2,
            ox + xm / 2,
            oy + ym / 2,
            ox + xm,
            oy + ym,
        );
        this.screen.bezierCurveTo(
            ox + xm / 2,
            oy + ym / 2,
            ox + xr + xm / 2,
            oy + yr + ym / 2,
            ox + xr,
            oy + yr,
        );
        this.screen.fill();
    }

    renderSnake() {

        this._renderTail();
        
        this.screen.lineWidth = this.cellSize * 0.6;
        let p = this.screen.createPattern(Snake.body1, "");
        let x = 300 + this.cellSize/ 2;
        let y = 100 + this.cellSize/ 2;
        this.screen.strokeStyle = p;
        
        let iPrev = this.tailIndex;
        let i = (iPrev + 2) % this.qsize;
        let iNext = (i + 2) % this.qsize;

        this.screen.beginPath();
        this.screen.moveTo(
            x + (this.body[i + 1] + this.body[iPrev + 1]) * 
            this.cellSize / 2,
            y + (this.body[i] + this.body[iPrev]) * 
            this.cellSize / 2,
        );
        while (iNext != this.headIndex) {

            if ((this.body[iPrev] == this.body[i] && 
                this.body[i] == this.body[iNext]) || 
                (this.body[iPrev + 1] == this.body[i + 1] && 
                this.body[i + 1] == this.body[iNext + 1])) {

                this.screen.lineTo(
                    x + (this.body[i + 1] + this.body[iNext + 1]) * 
                    this.cellSize / 2,
                    y + (this.body[i] + this.body[iNext]) * 
                    this.cellSize / 2,
                );

            } else {

                this.screen.arcTo(
                    x + this.body[i + 1] * this.cellSize,
                    y + this.body[i] * this.cellSize,
                    x + this.body[iNext + 1] * this.cellSize,
                    y + this.body[iNext] * this.cellSize,
                    this.cellSize / 2,
                );

            }

            iPrev = i;
            i = iNext;
            iNext = (i + 2) % this.qsize;
        }
        this.screen.stroke();

        this._renderHead();
    }

    renderFood() {
        this.screen.drawImage(
            this.food.img,
            300 + this.food.j * this.cellSize, 
            100 + this.food.i * this.cellSize, 
            this.cellSize, 
            this.cellSize,
        );
        if ( this.bodySet.has(this.food.i * this.col + this.food.j) ) {
            let alpha = this.currentFrame / this.frames;
            console.log(alpha);
            this.screen.fillStyle = `rgba(20, 20, 30, ${alpha})`;
            this.screen.fillRect(
                300 + this.food.j * this.cellSize,
                100 + this.food.i * this.cellSize, 
                this.cellSize, 
                this.cellSize,
            );
        }
    }
    
    clickHandler(e) {
        this.mouseDown = false;
        switch (this.gameStatus) {
            case Snake.MENU:
                if (this.currentMenuButton == 0) {
                    this.startGame();
                }
                break;
            case Snake.GAME:
                break;
        }
    }

    mousedownHandler(e) {
        this.mouseDown = true;
    }

    mousemoveHandler(e) {
        let rect = this.canvas.getBoundingClientRect();
        let a = 2 * (e.clientX - rect.x);
        let b = 2 * (e.clientY - rect.y);

        if (this.gameStatus == Snake.MENU) {
            let x = 900, y = 400;
            let button = -1;
            for (let i = 0; i < 4; i++) {
                if (a >= x - this.buttonWidths[i] / 2 && 
                    a <= x + this.buttonWidths[i] / 2 &&
                    b >= y - 18 && b <= y + 18) {
                    button = i;
                    if (this.currentMenuButton != i) {
                        this.playSound(Cartpole.highlightSound);
                    }
                }
                y += 60;
            }
            this.currentMenuButton = button;
            return;
        } else if (this.gameStatus == Snake.GAME) {
        } else if (this.gameStatus == Snake.HELP) {
        } else if (this.gameStatus == Snake.CREDIT) {
        }
    }

    keyupHandler(e) {
        if (game.gameStatus != Snake.GAME) {
            return;
        }
        switch (e.key) {
            case "ArrowUp":
                game.arrowUp = false;
                break;
            case "ArrowDown":
                game.arrowDown = false;
                break;
            case "ArrowLeft":
                game.arrowLeft = false;
                break;
            case "ArrowRight":
                game.arrowRight = false;
                break;
        }
    }

    keydownHandler(e) {
        if (game.gameStatus != Snake.GAME) {
            return;
        }
        switch (e.key) {
            case "ArrowUp":
                if (!game.arrowUp) {
                    game.nextDirection = "Up";
                }
                break;
            case "ArrowDown":
                if (!game.arrowUp) {
                    game.nextDirection = "Down";
                }
                break;
            case "ArrowLeft":
                if (!game.arrowUp) {
                    game.nextDirection = "Left";
                }
                break;
            case "ArrowRight":
                if (!game.arrowDown) {
                    game.nextDirection = "Right";
                }
                break;
        }
    }
}
