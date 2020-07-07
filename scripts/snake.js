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
    static HELP = 3;
    static CREDIT = 4;

    static title = new Image();
    static body1 = new Image();
    static body2 = new Image();
    static body3 = new Image();
    static food1 = new Image();
    static food2 = new Image();
    static food3 = new Image();
    static food4 = new Image();
    static bonusFood = new Image();
    static woodSign = new Image();
    static pattern1 = new Image();
    static pattern2a = new Image();
    static pattern2b = new Image();
    static pattern2c = new Image();
    static pattern3 = new Image();
    static patternIron = new Image();
    static patternBronze = new Image();

    static gameMusic = new Audio();
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
                Snake.title,
                "resources/Images/title.png",
            ),
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
                "resources/Images/food1.png",
            ),
            loadImage(
                Snake.food2,
                "resources/Images/food2.png",
            ),
            loadImage(
                Snake.food3,
                "resources/Images/food3.png",
            ),
            loadImage(
                Snake.food4,
                "resources/Images/food4.png",
            ),
            loadImage(
                Snake.bonusFood,
                "resources/Images/bonusFood.png",
            ),
            loadImage(
                Snake.woodSign,
                "resources/Images/woodSign.png",
            ),
            loadImage(
                Snake.pattern1,
                "resources/Images/pattern1.jpg",
            ),
            loadImage(
                Snake.pattern2a,
                "resources/Images/pattern2a.png",
            ),
            loadImage(
                Snake.pattern2b,
                "resources/Images/pattern2b.png",
            ),
            loadImage(
                Snake.pattern2c,
                "resources/Images/pattern2c.png",
            ),
            loadImage(
                Snake.pattern3,
                "resources/Images/pattern3.jpg",
            ),
            loadImage(
                Snake.patternIron,
                "resources/Images/ironTexture.jpg",
            ),
            loadImage(
                Snake.patternBronze,
                "resources/Images/bronzeTexture.jpg",
            ),
            loadAudio(
                Snake.gameMusic,
                "resources/Sound/gameMusic.mp3",
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
            loadAudio(
                Snake.winSound,
                "resources/Sound/win.mp3",
            ),
            loadAudio(
                Snake.eatSound,
                "resources/Sound/eat.mp3",
            ),
        ]);
    }

    constructor() {

        this.mouseDown = false;

        this.gameStatus = Snake.MENU;
        this.currentMenuButton = -1;
        this.currentSettingsButton = -1;
        this.currentHelpButton = -1;
        this.currentIdleButton = -1;
        this.gameSpeed = "normal";
        this.gameSize = "small";
        this.score = 0;
        this.bonusTime = 0;
        this.foodMultiplier = 0;

        this.soundOn = true;
        this.musicOn = true;
        this.toggleButton = -1;

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
        document.body.append(Snake.gameMusic);
        document.body.append(Snake.clickSound);
        document.body.append(Snake.highlightSound);
        document.body.append(Snake.defeatSound);
        document.body.append(Snake.winSound);
        document.body.append(Snake.eatSound);

        this.tailPrev = {
            i : -1,
            j : -1,
        }
        this.food = {
            img : Snake.food1,
            i : -1,
            j : -1,
            bonusIndex : -1,
        }

        this.body = [];
        this.bodySet = new Set();
        this.space = [];
        this.spaceMap = new Map();

        this.currentMusic = Snake.gameMusic;
        this.renderBackground();
        this.animateMenu();
        this.renderScores();
        this.renderSettings();
    }

    destroy() {
        document.removeEventListener(
            "keyup", this.keyupHandler,
        );
        document.removeEventListener(
            "keydown", this.keydownHandler,
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
        Snake.gameMusic.remove();
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
        this.renderSettings();
        this.playMusic(Snake.gameMusic);
        this.gameAnimation = setInterval(
            () => {

                this.clearScreen();
                this.update();
                this.renderFood();
                this.renderSnake();
                this.renderScores();
                if (this.isGameover && 
                    this.currentFrame >= this.frames / 5) {
                    this.endGame();
                }

            },
            50,
        );
    }

    endGame() {
        clearInterval(this.gameAnimation);
        this.currentMusic.pause();
        if (this.bodySet.size >= this.row * this.col) {
            this.score *= 2;
            this.renderScores();
            this.playSound(Snake.winSound);
        } else {
            this.playSound(Snake.defeatSound);
        }
        this.gameStatus = Snake.IDLE;
        this.endingScene = this.screen.getImageData(
            300, 100, 1200, 600,
        );
        this.renderIdle();
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
        let p1 = this.screen.createPattern(Snake.pattern1, "");
        this.screen.fillStyle = p1;
        this.screen.fillRect(0, 0, 1800, 800);
        this.screen.fillStyle = "rgb(20, 20, 30)";
        this.screen.fillRect(300, 100, 1200, 600);
        

        this.screen.fillStyle = this.screen.createPattern(
            Snake.patternIron, "",
        );
        this.screen.strokeStyle = this.screen.createPattern(
            Snake.patternBronze, "",
        );
        this.screen.lineWidth = 5;
        this.screen.fillRect(1550, 100, 200, 75);
        this.screen.fillRect(1550, 400, 200, 75);
        this.screen.strokeRect(1550, 100, 200, 75);
        this.screen.strokeRect(1550, 400, 200, 75);

        this.screen.beginPath();
        this.screen.ellipse(1680, 215, 60, 25, 0, 0, Math.PI * 2);
        this.screen.fill();
        this.screen.stroke();
        this.screen.beginPath();
        this.screen.ellipse(1680, 280, 60, 25, 0, 0, Math.PI * 2);
        this.screen.fill();
        this.screen.stroke();
        this.screen.beginPath();
        this.screen.ellipse(1680, 345, 60, 25, 0, 0, Math.PI * 2);
        this.screen.fill();
        this.screen.stroke();

        this.screen.beginPath();
        this.screen.ellipse(1680, 515, 60, 25, 0, 0, Math.PI * 2);
        this.screen.fill();
        this.screen.stroke();
        this.screen.beginPath();
        this.screen.ellipse(1680, 580, 60, 25, 0, 0, Math.PI * 2);
        this.screen.fill();
        this.screen.stroke();
        this.screen.beginPath();
        this.screen.ellipse(1680, 645, 60, 25, 0, 0, Math.PI * 2);
        this.screen.fill();
        this.screen.stroke();

        this.screen.fillStyle = this.screen.strokeStyle;
        this.screen.lineWidth = 1;
        this.screen.textAlign = "center";
        this.screen.textBaseline = "middle";
        this.screen.font = "small-caps 32px Gerogia";
        this.screen.fillText(
            "Game Speed",
            1650, 140,
        );
        this.screen.fillText(
            "Game Size",
            1650, 440,
        );
        this.screen.font = "28px Gerogia";
        this.screen.fillText(
            "slow",
            1680, 215,
        );
        this.screen.fillText(
            "normal",
            1680, 280,
        );
        this.screen.fillText(
            "fast",
            1680, 345,
        );
        this.screen.fillText(
            "small",
            1680, 515,
        );
        this.screen.fillText(
            "normal",
            1680, 580,
        );
        this.screen.fillText(
            "large",
            1680, 645,
        );

        this.screen.fillStyle = this.screen.createPattern(
            Snake.pattern3, "",
        );
        this.screen.fillRect(295, 95, 1210, 5);
        this.screen.fillRect(295, 95, 5, 610);
        this.screen.fillRect(1500, 95, 5, 610);
        this.screen.fillRect(295, 700, 1210, 5);
    }

    clearScreen() {
        this.screen.fillStyle = this.screen.createPattern(
            this.currentBackgroundPattern, "",
        );
        this.screen.fillRect(300, 100, 1200, 600);
        this.screen.fillStyle = this.screen.createPattern(
            Snake.pattern3, "",
        );
        this.screen.fillRect(295, 95, 1210, 5);
        this.screen.fillRect(295, 95, 5, 610);
        this.screen.fillRect(1500, 95, 5, 610);
        this.screen.fillRect(295, 700, 1210, 5);
    }

    animateMenu() {
        this.gameStatus = Snake.MENU;
        this.currentMenuButton = -1;
        this.screen.fillStyle = "rgb(20, 20, 30)";
        this.screen.fillRect(300, 100, 1200, 600);
        this.screen.drawImage(Snake.title, 400, 100);
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

    openHelp() {
        this.gameStatus = Snake.HELP;
        this.currentHelpButton = -1;
        clearInterval(this.menuAnimation);
        this.helpPage = 0;
        this.renderHelp();
    }

    renderHelp() {
        function _renderParagraph(p) {
            let x0 = 350;
            let x = x0;
            let y = 225;
            let w;
            for (let word of p.split(" ")) {
                w = this.screen.measureText(word + " ").width;
                if (x + w> 1450) {
                    x = x0;
                    y += 40;
                }
                this.screen.fillText(word + " ", x, y);
                x += w;
            }
        }

        this.screen.fillStyle = "rgb(20, 20, 30)";
        this.screen.fillRect(300, 100, 1200, 600);

        let titles = [
            "Introduction",
            "Game Controls",
            "Scoring Rules",
        ]
        let texts = [
            "Control the snake to eat small animals and try to obtain the highest possible score. Every time the snake eats a meal, its length will grow and the player will be awarded points. However, taking each step will also cost a small amount of points. Avoid running the snake's head into walls or into its own body, as both events will bring the game to an end.",
            "Use the arrow keys to manipulate where you want the snake to go next. If you do not press any keys, the snake will continue in its current direction. Pressing the arrow key that matches the snake's current direction will boost the snake's speed. You may change game settings using the radios buttons on the right of the screen. Note that you may not alter the settings during an ongoing game. You can, however, turn on/off sound effects and music at any time",
            "Eating a meal will earn you a base score. Bonus meals will spontaneously appear on the screen and will be available for 15 seconds before they disappear. Eating bonus food will award points equal to what\'s displayed on the \'bonus\' sign on the left. When the snake body reaches a certain length threshold, its color will change and the base score will be increased. If you manage to occupy the entire screen with the snake\'s body (thereby beating the game), the final score will be doubled.",
        ]
        this.screen.fillStyle = "rgb(20, 20, 30)";
        this.screen.fillRect(300, 100, 1200, 600);
        this.screen.fillStyle = "rgb(0, 255, 55)";
        this.screen.font = "bold 45px/1 courier";
        this.screen.textBaseline = "top";
        this.screen.textAlign = "center";

        this.screen.fillText(titles[this.helpPage], 900, 150);

        this.screen.fillStyle = "rgb(55, 200, 0)";
        this.screen.font = "bold 30px/1 courier";
        this.screen.textAlign = "left";
        _renderParagraph.call(
            this,
            texts[this.helpPage],
        );

        this.screen.fillStyle = "rgb(0, 200, 150)";
        if (this.helpPage > 0) {
            if (this.currentHelpButton == 1) {
                if (this.mouseDown) {
                    this.screen.font = "bold 36px courier";
                } else {
                    this.screen.font = "bold 40px courier";
                }
            } else {
                this.screen.font = "40px courier";
            }
            this.screen.textAlign = "left";
            this.screen.fillText("PREV", 350, 625);
        }
        if (this.helpPage < 2) {
            if (this.currentHelpButton == 2) {
                if (this.mouseDown) {
                    this.screen.font = "bold 36px courier";
                } else {
                    this.screen.font = "bold 40px courier";
                }
            } else {
                this.screen.font = "40px courier";
            }
            this.screen.textAlign = "right";
            this.screen.fillText("NEXT", 1450, 625);
        }
        if (this.currentHelpButton == 0) {
            if (this.mouseDown) {
                this.screen.font = "bold 36px courier";
            } else {
                this.screen.font = "bold 40px courier";
            }
        } else {
            this.screen.font = "40px courier";
        }
        this.screen.textAlign = "center";
        this.screen.fillText("BACK", 900, 625);
    }

    openCredit() {
        this.gameStatus = Snake.CREDIT;
        this.currentCreditButton = -1;
        clearInterval(this.menuAnimation);
        this.renderCredit();
    }

    renderCredit() {
        function _renderList(texts, x, y) {
            this.screen.fillStyle = "rgb(255, 200, 55)";
            this.screen.font = "bold 24px/1 courier";

            this.screen.fillText(
                texts[0],
                x, y,
            );

            this.screen.fillStyle = "rgb(55, 200, 55)";
            this.screen.font = "24px/1 courier";

            y += 25;
            for (let i = 1; i < texts.length; i++) {
                this.screen.fillText(
                    texts[i],
                    x, y,
                );
                y += 25;
            }
            
            return y;
        }

        this.screen.fillStyle = "rgb(20, 20, 30)";
        this.screen.fillRect(300, 100, 1200, 600);
        this.screen.textAlign = "left";
        this.screen.textBaseline = "top";

        let arr1 = [
            "The following image files were edited using lunapic.com",
            " -\'food1.png\', (from clipart-library.com)",
            " -\'food2.png\', (from pngitem.com)",
            " -\'food3.png\', (from htdraw.com)",
            " -\'food4.png\', (from )",
            " -\'bonusFood.png\', (from dreamstime.com)",
            " -\'woodSign.png\', (from nicepng.com)",
        ];
        let arr2 = [
            "Texture files used in the game include:",
            " -\'ironTexture.jpg\', (from poliigon.com)",
            " -\'bronzeTexture.jpg\', (from freecreatives.com)",
            " -\'pattern1.jpg\', (from freepik.com)",
            " -\'pattern3.jpg\', (from colourbox.com)",
        ];
        let arr3 = [
            "Sound files:",
            "\'gameMusic.mp3\', (\"The Entertainer\" by Joplin, performed by Alexander",
            "(from orangefreesounds.com)",
            "\'click.wav\', (by InspectorJ from freesound.org)",
            "\'defeat.mp3\', (from zapsplat.com)",
            "\'win.mp3\', (from zapsplat.com)",
            "\'eat.mp3\', (from zapsplat.com)",
            "\'highlight.mp3\', (from zapsplat.com)",
        ];

        let x = 325, y = 125;
        y = _renderList.call(this, arr1, x, y);
        y = _renderList.call(this, arr2, x, y);
        y = _renderList.call(this, arr3, x, y);

        this.screen.fillStyle = "rgb(255, 200, 55)";
        this.screen.font = "bold 24px/1 courier";
        this.screen.fillText(
            "snake.js game and its uncredited assets were created by Mingzhi Tian", 
            x, y,
        );
        y += 25;
        this.screen.fillText(
            "\u00a92020 by Tian, All Rights Reserved",
            x, y,
        );
        
        this.screen.fillStyle = "rgb(55, 200, 255)";
        this.screen.textAlign = "center";
        this.screen.textBaseline = "middle";
        if (this.currentCreditButton == 0) {
            if (this.mouseDown) {
                this.screen.font = "bold 40px/1 courier";
            } else {
                this.screen.font = "bold 45px/1 courier";
            }
        } else {
            this.screen.font = "45px/1 courier";
        }
        this.screen.fillText(
            "BACK\u2794",
            1400, 150,
        );
    }


    renderSettings() {
        this.screen.fillStyle = "white";
        this.screen.lineWidth = 3;
        for (let i = 0; i < 6; i++) {
            this.screen.strokeStyle = (
                this.currentSettingsButton == i ?
                "rgb(255, 150, 55)" : "rgb(55, 100, 255)"
            );
            this.screen.beginPath();
            this.screen.arc(
                1570, 215 + i * 65 + (i > 2) * 105,
                20, 0, Math.PI * 2,
            );
            this.screen.fill();
            this.screen.stroke();
        }

        this.screen.fillStyle = (
            this.gameStatus == Snake.GAME ?
            "grey" : "red"
        );
        this.screen.beginPath();
        switch (this.gameSpeed) {
            case "slow":
                this.screen.arc(1570, 215, 10, 0, Math.PI * 2);
                break;
            case "normal":
                this.screen.arc(1570, 280, 10, 0, Math.PI * 2);
                break;
            case "fast":
                this.screen.arc(1570, 345, 10, 0, Math.PI * 2);
                break;
        }
        this.screen.fill();
        this.screen.beginPath();
        switch (this.gameSize) {
            case "small":
                this.screen.arc(1570, 515, 10, 0, Math.PI * 2);
                break;
            case "normal":
                this.screen.arc(1570, 580, 10, 0, Math.PI * 2);
                break;
            case "large":
                this.screen.arc(1570, 645, 10, 0, Math.PI * 2);
                break;
        }
        this.screen.fill();

        // music icon and sound icon
        this.screen.fillStyle = (
            this.toggleButton == 0 ?
            "rgb(200, 255, 255)" : "rgb(255, 255, 255)" 
        );
        this.screen.strokeStyle = (
            this.toggleButton == 0 ?
            "rgb(255, 150, 55)" : "rgb(55, 100, 255)" 
        );
        this.screen.beginPath();
        this.screen.moveTo(1585, 725);
        this.screen.arcTo(1625, 725, 1625, 735, 10);
        this.screen.arcTo(1625, 775, 1615, 775, 10);
        this.screen.arcTo(1575, 775, 1575, 765, 10);
        this.screen.arcTo(1575, 725, 1585, 725, 10);
        this.screen.fill();
        this.screen.stroke();
        this.screen.fillStyle = this.screen.strokeStyle;
        this.screen.beginPath();
        this.screen.moveTo(1585, 742);
        this.screen.lineTo(1595, 742);
        this.screen.lineTo(1610, 730);
        this.screen.lineTo(1610, 770);
        this.screen.lineTo(1595, 758);
        this.screen.lineTo(1585, 758);
        this.screen.fill();
        if (!this.soundOn) {
            this.screen.strokeStyle = "red";
            this.screen.lineWidth = 5;
            this.screen.beginPath();
            this.screen.moveTo(1585, 735);
            this.screen.lineTo(1615, 765);
            this.screen.stroke();
        }

        this.screen.fillStyle = (
            this.toggleButton == 1 ?
            "rgb(200, 255, 255)" : "rgb(255, 255, 255)" 
        );
        this.screen.strokeStyle = (
            this.toggleButton == 1 ?
            "rgb(255, 150, 55)" : "rgb(55, 100, 255)" 
        );
        this.screen.beginPath();
        this.screen.moveTo(1685, 725);
        this.screen.arcTo(1725, 725, 1725, 735, 10);
        this.screen.arcTo(1725, 775, 1715, 775, 10);
        this.screen.arcTo(1675, 775, 1675, 765, 10);
        this.screen.arcTo(1675, 725, 1685, 725, 10);
        this.screen.fill();
        this.screen.stroke();
        this.screen.lineWidth = 4;
        this.screen.beginPath();
        this.screen.moveTo(1695, 760);
        this.screen.lineTo(1695, 735);
        this.screen.lineTo(1715, 740);
        this.screen.lineTo(1715, 765);
        this.screen.moveTo(1695, 742);
        this.screen.lineTo(1715, 747);
        this.screen.stroke();
        this.screen.fillStyle = this.screen.strokeStyle;
        this.screen.beginPath();
        this.screen.ellipse(1689, 760, 7, 4, -0.15, 0, Math.PI * 2);
        this.screen.ellipse(1709, 765, 7, 4, -0.15, 0, Math.PI * 2);
        this.screen.fill();
        if (!this.musicOn) {
            this.screen.strokeStyle = "red";
            this.screen.lineWidth = 5;
            this.screen.beginPath();
            this.screen.moveTo(1685, 735);
            this.screen.lineTo(1715, 765);
            this.screen.stroke();
        }
    }

    renderIdle() {
        this.screen.putImageData(
            this.endingScene, 300, 100,
        );
        this.screen.fillStyle = "rgba(255, 255, 255, 0.5)";
        this.screen.fillRect(300, 100, 1200, 600);

        this.screen.lineWidth = 2;
        this.screen.fillStyle = "rgb(110, 75, 55)";
        this.screen.strokeStyle = "rgb(0, 0, 0)";

        this.screen.beginPath();
        this.screen.moveTo(600, 385);
        this.screen.arcTo(600, 425, 610, 425, 10);
        this.screen.arcTo(800, 425, 800, 410, 10);
        this.screen.arcTo(800, 375, 790, 375, 10);
        this.screen.arcTo(600, 375, 600, 385, 10);
        this.screen.fill();
        this.screen.stroke();

        this.screen.beginPath();
        this.screen.moveTo(1000, 385);
        this.screen.arcTo(1000, 425, 1010, 425, 10);
        this.screen.arcTo(1200, 425, 1200, 410, 10);
        this.screen.arcTo(1200, 375, 1190, 375, 10);
        this.screen.arcTo(1000, 375, 1000, 385, 10);
        this.screen.fill();
        this.screen.stroke();

        this.screen.textAlign = "center";
        this.screen.textBaseline = "middle";
        this.screen.fillStyle = "silver";
        if (this.currentIdleButton == 0) {
            this.screen.font = "bold 36px sans-serif";
            if (this.mouseDown) {
                this.screen.fillStyle = "gold";
            }
        } else {
            this.screen.font = "36px sans-serif";
        }
        this.screen.fillText(
            "Play Again",
            700, 400,
        );
        this.screen.fillStyle = "silver";
        if (this.currentIdleButton == 1) {
            this.screen.font = "bold 36px sans-serif";
            if (this.mouseDown) {
                this.screen.fillStyle = "gold";
            }
        } else {
            this.screen.font = "36px sans-serif";
        }
        this.screen.fillText(
            "Main Menu",
            1100, 400,
        );
    }

    initialize() {

        this.isGameover = false;
        this.arrowUp = false;
        this.arrowDown = false;
        this.arrowLeft = false;
        this.arrowRight = false;

        this.score = 500;
        this.foodMultiplier = 1;
        switch (this.gameSize) {
            case "small":
                this.cellSize = 50;
                this.currentBackgroundPattern = Snake.pattern2a;
                break;
            case "normal":
                this.cellSize = 40;
                this.currentBackgroundPattern = Snake.pattern2b;
                break;
            case "large":
                this.cellSize = 30;
                this.currentBackgroundPattern = Snake.pattern2c;
                break;
        }
        switch (this.gameSpeed) {
            case "slow":
                this.frames = 16;
                break;
            case "normal":
                this.frames = 12;
                break;
            case "fast":
                this.frames = 8;
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
        this.currentBody = Snake.body1;
        
        for (let i = 0; i < this.row * this.col; i++) {
            this.space.push(i);
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
            this.spaceMap.set(
                this.space[key],
                key,
            );
            this.space.pop();
            this.spaceMap.delete(key);
        }
        this.bonusCooldown = this.col * 2 + (
            0 | Math.random() * (this.col + 1)
        );

        this.dispenseFood();
        this.renderFood();
        this.renderSnake();
        this.renderScores();

    }

    dispenseFood() {
        let index;
        index = 0 | Math.random() * this.space.length;
        if (this.bonusTime > 0) {
            while (index == this.food.bonusIndex) {
                // rejection sampling
                index = 0 | Math.random() * this.space.length;
            }
        }
        console.log(index);
        let foodLocationKey = this.space[index];
        this.food.i = 0 | foodLocationKey / this.col;
        this.food.j = foodLocationKey  % this.col;
        switch (0 | Math.random() * 4) {
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
        }
    }

    dispenseBonusFood() {
        if (this.space.length <= 1) {
            return;
        }
        let index = 0 | Math.random() * this.space.length;
        while (index == this.food.i * this.col + this.food.j) {
            let index = 0 | Math.random() * this.space.length;
        }
        this.food.bonusIndex = this.space[index];
        this.bonusTime = 15;
        this.bonusCounter = setInterval(
            () => {
                if (--this.bonusTime == 0) {
                    this.removeBonusFood();
                }
            },
            1000,
        );
    }

    removeBonusFood() {
        clearInterval(this.bonusCounter);
        this.bonusTime = 0;
        this.food.bonusIndex = -1;
        this.bonusCooldown = this.col * 2 + (
            0 | Math.random() * (this.col + 1)
        );
    }

    update() {
        
        switch (this.currentDirection) {
            case "Up":
                if (this.arrowUp) {
                    this.currentFrame += this.frames / 4 - 1;
                }
                break;
            case "Down":
                if (this.arrowDown) {
                    this.currentFrame += this.frames / 4 - 1;
                }
                break;
            case "Left":
                if (this.arrowLeft) {
                    this.currentFrame += this.frames / 4 - 1;
                }
                break;
            case "Right":
                if (this.arrowRight) {
                    this.currentFrame += this.frames / 4 - 1;
                }
                break;
        }
        if (++this.currentFrame < this.frames || this.isGameover) {
            return;
        }


        let a = this.body[this.headIndex];
        let b = this.body[this.headIndex + 1];

        if (this.bonusCooldown-- == 0 && this.food.bonusIndex < 0) {
            this.dispenseBonusFood();
        }
        if (a * this.col + b == this.food.bonusIndex) {
            this.score += this.bonusTime * 100 * this.foodMultiplier;
            this.removeBonusFood();
        }

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

        if (a < 0 || a >= this.row || b < 0 || b >= this.col) {
            this.isGameover = true;
        }

        if ( this.bodySet.has(newHead) ) {
            if (this.isGrowing || 
                a != this.body[this.tailIndex] || 
                b != this.body[this.tailIndex + 1]) {
                this.isGameover = true;
            }
        }

        if (this.isGrowing) {

            this.score += 100 * this.foodMultiplier;
            if (this.spaceMap.get(newHead) != this.space.length - 1) {
                this.space[
                    this.spaceMap.get(newHead)
                ] = this.space[this.space.length - 1];
                this.spaceMap.set(
                    this.space[this.space.length - 1],
                    this.spaceMap.get(newHead),
                );
            }
            this.space.pop();
            this.dispenseFood();
            this.spaceMap.delete(newHead);

        } else {
            this.tailPrev.i = this.body[this.tailIndex];
            this.tailPrev.j = this.body[this.tailIndex + 1];
            this.tailIndex = (this.tailIndex + 2) % this.qsize;
            this.bodySet.delete(
                this.tailPrev.i * this.col + this.tailPrev.j,
            );

            if ( this.spaceMap.has(newHead) ) {
                this.space[
                    this.spaceMap.get(newHead)
                ] = this.tailPrev.i * this.col + this.tailPrev.j;
                this.spaceMap.set(
                    this.tailPrev.i * this.col + this.tailPrev.j,
                    this.spaceMap.get(newHead),
                );
                this.spaceMap.delete(newHead);
            }

        }

        this.nextDirection = this.currentDirection;
        this.body[this.headIndex] = a ;
        this.body[this.headIndex + 1] = b;
        this.bodySet.add(newHead);

        this.score--;

        if (this.bodySet.has(this.food.i * this.col + this.food.j) || 
            this.bodySet.has(this.food.bonusIndex)) {
            this.playSound(Snake.eatSound);
        }

        if (this.bodySet.size == this.row * this.col / 3) {
            this.currentBody = Snake.body2;
            this.foodMultiplier = 2;
        } else if (this.bodySet.size == 2 * this.row * this.col / 3) {
            this.currentBody = Snake.body3;
            this.foodMultiplier = 3;
        }
    }

    _renderHead() {
        let p = this.screen.createPattern(this.currentBody, "");

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
        let p = this.screen.createPattern(this.currentBody, "");

        let x = 300 + this.cellSize / 2;
        let y = 100 + this.cellSize / 2;
        let ratio = (
            this.isGrowing ? 0 : 1 - this.currentFrame / this.frames
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
            beta = theta2 + Math.PI / 2 * (
                (i1 - i2) * (this.tailPrev.j - j1) - 
                (j1 - j2) * (this.tailPrev.i - i1) > 0 ? 
                -1 : 1
            );
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
        let p = this.screen.createPattern(this.currentBody, "");
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
        if ( this.bodySet.has(this.food.i * this.col + this.food.j) ) {
            this.screen.globalAlpha = 1 - this.currentFrame / this.frames;
        }
        this.screen.drawImage(
            this.food.img,
            300 + this.food.j * this.cellSize, 
            100 + this.food.i * this.cellSize, 
            this.cellSize, 
            this.cellSize,
        );
        this.screen.globalAlpha = 1.0;
        if (this.bodySet.has(this.food.bonusIndex)) {
            this.screen.globalAlpha -= this.currentFrame / this.frames;
        }
        if (this.food.bonusIndex >= 0) {
            this.screen.drawImage(
                Snake.bonusFood,
                300 + this.cellSize * 
                (this.food.bonusIndex % this.col),
                100 + this.cellSize *
                (0 | this.food.bonusIndex / this.col),
                this.cellSize,
                this.cellSize,
            );
        }
        this.screen.globalAlpha = 1.0;
    }

    renderScores() {
        this.screen.drawImage(
            Snake.woodSign,
            25, 70, 250, 180,
        );
        this.screen.drawImage(
            Snake.woodSign,
            25, 270, 250, 180,
        );
        this.screen.drawImage(
            Snake.woodSign,
            25, 470, 250, 180,
        );
        this.screen.font = "bold 40px/1 cursive";
        this.screen.textBaseline = "middle";
        this.screen.textAlign = "center";

        this.screen.fillStyle = "black";
        this.screen.fillText(
            "score",
            150, 150,
        );
        this.screen.fillText(
            "length",
            150, 350,
        );
        this.screen.fillText(
            "bonus",
            150, 550,
        );
        this.screen.fillStyle = "gold";
        this.screen.font = "bold 30px/1 cursive";
        this.screen.fillText(
            this.score,
            150, 200,
        );
        this.screen.fillText(
            this.bodySet.size,
            150, 400,
        );
        this.screen.fillText(
            this.bonusTime * 100 * this.foodMultiplier,
            150, 600,
        );

    }
    
    clickHandler(e) {
        this.mouseDown = false;
        switch (this.gameStatus) {
            case Snake.MENU:
                if (this.currentMenuButton == 0) {
                    this.startGame();
                    this.playSound(Snake.clickSound);
                } else if (this.currentMenuButton == 1) {
                    this.openHelp();
                    this.playSound(Snake.clickSound);
                } else if (this.currentMenuButton == 2) {
                    this.openCredit();
                    this.playSound(Snake.clickSound);
                } else if (this.currentMenuButton == 3) {
                    this.destroy();
                    this.playSound(Snake.clickSound);
                }
                if (this.currentSettingsButton == 0) {
                    this.gameSpeed = "slow";
                } else if (this.currentSettingsButton == 1) {
                    this.gameSpeed = "normal";
                } else if (this.currentSettingsButton == 2) {
                    this.gameSpeed = "fast";
                } else if (this.currentSettingsButton == 3) {
                    this.gameSize = "small";
                } else if (this.currentSettingsButton == 4) {
                    this.gameSize = "normal";
                } else if (this.currentSettingsButton == 5) {
                    this.gameSize = "large";
                }
                if (this.currentSettingsButton >= 0) {
                    this.renderSettings();
                    this.playSound(Snake.clickSound);
                }
                break;
            case Snake.GAME:
                break;
            case Snake.IDLE:
                if (this.currentIdleButton == 0) {
                    this.startGame();
                } else if (this.currentIdleButton == 1) {
                    this.animateMenu();
                }
                if (this.currentIdleButton >= 0) {
                    this.currentIdleButton = -1;
                    this.playSound(Snake.clickSound);
                }
                if (this.currentSettingsButton == 0) {
                    this.gameSpeed = "slow";
                } else if (this.currentSettingsButton == 1) {
                    this.gameSpeed = "normal";
                } else if (this.currentSettingsButton == 2) {
                    this.gameSpeed = "fast";
                } else if (this.currentSettingsButton == 3) {
                    this.gameSize = "small";
                } else if (this.currentSettingsButton == 4) {
                    this.gameSize = "normal";
                } else if (this.currentSettingsButton == 5) {
                    this.gameSize = "large";
                }
                if (this.currentSettingsButton >= 0) {
                    this.renderSettings();
                    this.playSound(Snake.clickSound);
                }
                break;
            case Snake.HELP:
                if (this.currentHelpButton == 0) {
                    this.animateMenu();
                } else if (this.currentHelpButton == 1) {
                    this.helpPage--;
                    this.renderHelp();
                } else if (this.currentHelpButton == 2) {
                    this.helpPage++;
                    this.renderHelp();
                }
                if (this.currentHelpButton >= 0) {
                    this.playSound(Snake.clickSound);
                }
                break;
            case Snake.CREDIT:
                if (this.currentCreditButton == 0) {
                    this.animateMenu();
                    this.playSound(Snake.clickSound);
                }
                break;
        }
        if (this.toggleButton == 0) {
            this.soundOn = !this.soundOn;
            this.playSound(Snake.clickSound);
        }
        if (this.toggleButton == 1) {
            this.musicOn = !this.musicOn;
            if (this.musicOn) {
                this.currentMusic.play();
            } else {
                this.currentMusic.pause();
            }
            this.playSound(Snake.clickSound);
        }
    }

    mousedownHandler(e) {
        this.mouseDown = true;
        if (this.gameStatus == Snake.IDLE) {
            this.renderIdle();
        } else if (this.gameStatus == Snake.HELP) {
            this.renderHelp();
        } else if (this.gameStatus == Snake.CREDIT) {
            this.renderCredit();
        }
    }

    mousemoveHandler(e) {
        let rect = this.canvas.getBoundingClientRect();
        let a = 2 * (e.clientX - rect.x);
        let b = 2 * (e.clientY - rect.y);

        if (this.gameStatus == Snake.MENU || 
            this.gameStatus == Snake.IDLE) {

            let x = 900, y = 400;
            let button = -1;
            
            if (this.gameStatus == Snake.MENU) {
                for (let i = 0; i < 4; i++) {
                    if (a >= x - this.buttonWidths[i] / 2 && 
                        a <= x + this.buttonWidths[i] / 2 &&
                        b >= y - 18 && b <= y + 18) {
                        button = i;
                        if (this.currentMenuButton != i) {
                            this.playSound(Snake.highlightSound);
                        }
                    }
                    y += 60;
                }
                this.currentMenuButton = button;
            } else {
                if (a >= 600 && a <= 800 && 
                    b >= 375 && b <= 425) {
                    button = 0;
                    if (this.currentIdleButton != button) {
                        this.playSound(Snake.highlightSound);
                    }
                }
                if (a >= 1000 && a <= 1200 && 
                    b >= 375 && b <= 425) {
                    button = 1;
                    if (this.currentIdleButton != button) {
                        this.playSound(Snake.highlightSound);
                    }
                }
                this.currentIdleButton = button;
                this.renderIdle();
            }

            button = -1;
            let ox, oy;
            for (let i = 0; i < 6; i++) {
                ox = 1570;
                oy = 215 + i * 65 + (i > 2) * 105;
                if (Math.pow(a - ox, 2) + Math.pow(b - oy, 2) <= 400) {
                    button = i;
                    if (this.currentSettingsButton != button) {
                        this.playSound(Snake.highlightSound);
                    }
                }
            }
            this.currentSettingsButton = button;
        } else if (this.gameStatus == Snake.GAME) {
        } else if (this.gameStatus == Snake.HELP) {
            let button = -1;
            if (a >= 850 && a <= 950 && b >= 625 && b <= 665) {
                button = 0;
                if (this.currentHelpButton != button) {
                    this.playSound(Snake.highlightSound);
                }
            }
            if (a >= 350 && a <= 450 && 
                b >= 625 && b <= 665 && 
                this.helpPage > 0) {
                button = 1;
                if (this.currentHelpButton != button) {
                    this.playSound(Snake.highlightSound);
                }
            }
            if (a >= 1350 && a <= 1450 && 
                b >= 625 && b <= 665 && 
                this.helpPage < 2) {
                button = 2;
                if (this.currentHelpButton != button) {
                    this.playSound(Snake.highlightSound);
                }
            }
            this.currentHelpButton = button;
            this.renderHelp();
        } else if (this.gameStatus == Snake.CREDIT) {
            let button = -1;
            if (a >= 1325 && a <= 1475 && b >= 125 && b <= 175) {
                button = 0;
                if (this.currentCreditButton != button) {
                    this.playSound(Snake.highlightSound);
                }
            }
            this.currentCreditButton = button;
            this.renderCredit();
        }

        if (a >= 1575 && a <= 1625 && b >= 725 && b <= 775) {
            if (this.toggleButton != 0) {
                this.playSound(Snake.highlightSound);
            }
            this.toggleButton = 0;
        } else if (a >= 1675 && a <= 1725 && b >= 725 && b <= 775) {
            if (this.toggleButton != 1) {
                this.playSound(Snake.highlightSound);
            }
            this.toggleButton = 1;
        } else {
            this.toggleButton = -1;
        }
        this.renderSettings();
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
                game.arrowUp = true;
                game.nextDirection = "Up";
                break;
            case "ArrowDown":
                game.arrowDown = true;
                game.nextDirection = "Down";
                break;
            case "ArrowLeft":
                game.arrowLeft = true;
                game.nextDirection = "Left";
                break;
            case "ArrowRight":
                game.arrowRight = true;
                game.nextDirection = "Right";
                break;
        }
    }
}
