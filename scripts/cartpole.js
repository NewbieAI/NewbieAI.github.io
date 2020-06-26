"use strict";

// file created on May 10th,

class Cartpole {

    static MENU = 0;
    static GAME = 1;
    static IDLE = 2;
    static HELP = 3;
    static CREDIT = 4;

    static GRAVITY = -250;
    static CART_MASS = 10.0;
    static POLE_MASS = 1.0;
    static CART_WIDTH = 200;
    static POLE_LENGTH = 200;
    static XMIN = 0;
    static XMAX = 1800;
    static THETA_MIN = -Math.PI / 2;
    static THETA_MAX = Math.PI / 2;

    static music = new Audio();
    static introSound = new Audio();
    static defeatSound = new Audio();
    static clickSound = new Audio();
    static highlightSound = new Audio();

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
            loadAudio(
                Cartpole.music,
                "resources/Sound/music.oga",
            ),
            loadAudio(
                Cartpole.introSound,
                "resources/Sound/intro.mp3",
            ),
            loadAudio(
                Cartpole.defeatSound,
                "resources/Sound/defeat.mp3",
            ),
            loadAudio(
                Cartpole.highlightSound,
                "resources/Sound/highlight.mp3",
            ),
            loadAudio(
                Cartpole.clickSound,
                "resources/Sound/click.wav",
            ),
        ]);
    }

    constructor() {
        // create an instance of the cartpole game

        this.mouseDown = false;
        this.leftDown = false;
        this.rightDown = false;

        this.gameStatus = Cartpole.MENU;
        this.currentMenuButton = -1;

        this.soundOn = true;
        this.musicOn = true;

        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("id", "cartpole");
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
        this.screen.lineWidth = 2;
        this.screen.font = "40px courier";

        this.buttons = [
            "Play",
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
        this.currentMusic = Cartpole.introSound;
        this.playMusic(Cartpole.introSound, false);
        this.paintMenu();
        this.renderMenu();
    }

    destroy() {
        document.removeEventListener("keydown", this.keydownHandler);
        document.removeEventListener("keyup", this.keyupHandler);
        this.canvas.remove();
        Cartpole.music.remove();
        Cartpole.introSound.remove();
        Cartpole.defeatSound.remove();
        Cartpole.clickSound.remove();
        Cartpole.highlightSound.remove();
    }

    startGame() {
        this.leftDown = false;
        this.rightDown = false;
        this.gameStatus = Cartpole.GAME;
        this.frame = 0;
        this.weather = "sunny";
        this.startTime = Date.now();
        this.nextLvlup = this.startTime + 30000;
        this.nextW = 0;
        this.forecast = `Weather forecast: rainfall, with wind velocity of 0 km/s.`;

        this.x = 900;
        this.v = 0;
        this.a = 0;
        this.theta = -0.01 + 0.02 * Math.random();
        this.omega = 0;
        this.alpha = 0;
        this.F = 0;
        this.W = 0;

        this.renderBackground();

        this.clouds = [
            600 * Math.random(), 
            75 + 150 * Math.random(), 
            600 + 600 * Math.random(), 
            75 + 150 * Math.random(), 
            1200 + 600 * Math.random(),
            75 + 150 * Math.random(),
        ];
        this.raindrops = [];
        this.snowflakes = [];
        this.cloudNumber = 0;
        this.raindropNumber = 0;
        this.snowflakeNumber = 0;

        this.playMusic(Cartpole.music);

        this.gameAnimation = setInterval(
            () => {
                this.screen.putImageData(this.cacheImg, 0, 0);
                this.renderWeather();
                this.evolveSystem();
                this.renderSystem();
                this.frame++;
                if (Date.now() > this.nextLvlup) {
                    this.lvlup();
                }
                if (this.x - Cartpole.CART_WIDTH / 2 <= Cartpole.XMIN || 
                    this.x + Cartpole.CART_WIDTH / 2 >= Cartpole.XMAX ||
                    this.theta <= Cartpole.THETA_MIN || 
                    this.theta >= Cartpole.THETA_MAX) {
                    this.cacheImg = this.screen.getImageData(
                        0, 0, 1800, 800
                    );
                    this.endGame();
                }
            },
            40,
        );
    }

    endGame() {
        this.gameStatus = Cartpole.IDLE;
        this.playMusic(Cartpole.defeatSound, false);
        clearInterval(this.gameAnimation);
        
        this.renderIdleScreen();
    }


    _renderBackButton() {
        this.screen.fillStyle = "rgb(55, 55, 55)";
        this.screen.fillRect(750, 710, 300, 40);

        this.screen.fillStyle = "rgb(255, 255, 200)";
        if (this.mouseOnBack) {
            if (this.mouseDown) {
                this.screen.font = "bold 36px courier";
            } else {
                this.screen.font = "bold 40px courier";
            }
        } else {
            this.screen.font = "36px courier";
        }
        this.screen.textAlign = "center";
        this.screen.textBaseline = "bottom";
        this.screen.fillText("Back to Menu", 900, 750);
    }

    help() {
        this.gameStatus = Cartpole.HELP;

        this.screen.fillStyle = "rgb(55, 55, 55)";
        this.screen.fillRect(0, 0, 1800, 800);

        this.screen.font = "24px arial";
        this.screen.textAlign = "left";
        this.screen.textBaseline = "top";

        let x = 200, y = 100;
        let txts = [
            "OBJECTIVE:",
            "",
            "Cartpole is a classic control system, where a movable pole is mounted on top of a cart. The goal of the game is to keep the pole from", 
            "falling over and keep the cart from going off screen. The longer the game lasts, the higher the score will be.",
            "",
            "",
            "CONTROLS:",
            "",
            "To keep the cartpole system balanced, use to left and right arrow keys to apply forces to the cart. The left arrow key will push the",
            "cart to the left, and the right arrow key will push the cart to the right.",
            "",
            "",
            "WEATHER SYSTEM:",
            "",
            "The weather will alternate between \'sunny\', \'rainy\', and \'snowy\'. When it\'s raining, the ground becomes slippery and pressing the arrow", 
            "keys will apply more forces on the cart. When it\'s snowing, pressing arrow keys will instead be less effective.",
            "",
            "As the game goes on, it will become incrementally more difficulty because wind stength will incrementally increase. Initially, there", 
            "is no wind. But after the completion of the first weather cycle, wind strength will become non-zero. Pay attention to the weather", 
            "forecast displayed near the top of the screen, so that you do not get caught unprepared when the wind direction changes.",
            "",
            "",
            "That is all. Good luck and have fun!",
        ];

        for (let line of txts) {
            if (line[line.length - 1] == ":") {
                this.screen.fillStyle = "gold";
            } else if (line[line.length - 1] == "!") {
                this.screen.fillStyle = "cyan";
            } else {
                this.screen.fillStyle = "white";
            }
            this.screen.fillText(line, x, y);
            y += 25;
        }

        this._renderBackButton();
    }

    credit() {
        this.gameStatus = Cartpole.CREDIT;

        this.screen.fillStyle = "rgb(55, 55, 55)";
        this.screen.fillRect(0, 0, 1800, 800);

        this.screen.fillStyle = "white";
        this.screen.font = "24px arial";
        this.screen.textAlign = "left";
        this.screen.textBaseline = "top";

        let x = 300, y = 200;
        let txts = [
            "The game \'cartpole.js\' was created by Mingzhi Tian",
            "",
            "",
            "The following sound files are either in the public domain or used under Attribution License:",
            "",
            "        music.oga  -  \'Entrance of the Gladiator\' by Julius Fucik, performed by US Marine Band",
            "",
            "        From zapsplat.com  -",
            "                defeat.mp3",
            "                higlight.mp3",
            "                intro.mp3",
            "",
            "        From freesound.org by InspectorJ  -",
            "                click.wav",
        ]
        for (let line of txts) {
            this.screen.fillText(line, x, y);
            y += 25;
        }

        this._renderBackButton();
    }

    lvlup() {
        let nextWeather;
        switch (this.weather) {
            case "sunny":
                this.raindrops.length = 0;
                this.weather = "rainy";
                nextWeather = "snowfall";
                break;
            case "rainy":
                this.nextW = (
                    (Math.random > 0.5 ? 1 : -1) * (Math.abs(this.W) + 5)
                );
                this.snowflakes.length = 0;
                this.weather = "snowy";
                nextWeather = "sunny";
                break;
            case "snowy":
                this.W = this.nextW;
                this.weather = "sunny";
                nextWeather = "rainfall";
                break;
        }
        this.forecast = `Weather forecast: ${nextWeather}, with wind velocity of ${this.nextW} km/s`;
        this.renderBackground();
        this.nextLvlup += 30000;
    }

    evolveSystem() {
        // evolve the state of the system according to the 
        // equations of motion.

        let force = (
            2000 +
            (this.weather == "rainy") * 1000 -
            (this.weather == "snowy") * 500
        );
        this.F = force * (this.rightDown - this.leftDown);
        
        let g = Cartpole.GRAVITY;
        let mp = Cartpole.POLE_MASS;
        let mc = Cartpole.CART_MASS;
        let L = Cartpole.POLE_LENGTH;
        let sin = Math.sin(this.theta);
        let cos = Math.cos(this.theta);
        let delta = (mc + mp * sin * sin) * mp * L;

        this.a = (
            (this.F + this.W + mp * L * sin * this.omega * this.omega) *
            (mp * L) + 
            (this.W * cos - mp * g * sin) *
            (-mp * L * cos)
        ) / delta;
        this.alpha = (
            (this.F + this.W + mp * L * sin * this.omega * this.omega) *
            (-mp * cos) + 
            (this.W * cos - mp * g * sin) *
            (mp + mc)
        ) / delta;

        this.x += this.v * 0.04 + 0.5 * this.a * 0.0016;
        this.v += this.a * 0.04;
        this.theta += this.omega * 0.04 + 0.5 * this.alpha * 0.0016;
        this.omega += this.alpha * 0.04;

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

    paintMenu() {
        this.screen.fillStyle = "rgb(55, 55, 55)";
        this.screen.fillRect(0, 0, 1800, 800);

        let title = "C a r t p o   e";
        this.screen.font = "144px cursive";
        let g = this.screen.createLinearGradient(
            900 - this.screen.measureText(title).width / 2, 0, 
            900 + this.screen.measureText(title).width / 2, 0, 
        );
        g.addColorStop(0, "blue");
        g.addColorStop(0.1, "green");
        g.addColorStop(0.2, "red");
        g.addColorStop(0.3, "orange");
        g.addColorStop(0.4, "purple");
        g.addColorStop(0.7, "cyan");
        g.addColorStop(1.0, "brown");
        this.screen.fillStyle = g;
        this.screen.textAlign = "center";
        this.screen.textBaseline = "bottom";
        this.screen.fillText(title, 900, 275);

        let x = 1200, y = 120;
        for (let i = 0; i < 25; i++) {
            this.screen.fillStyle = i % 2 ? "black" : "white";
            this.screen.fillRect(x - 5, y, 5, 5);
            this.screen.fillStyle = i % 2 ? "white" : "black";
            this.screen.fillRect(x, y, 5, 5);
            y += 5;
        }

        this.screen.font = "24px courier";
        this.screen.fillStyle = "white";
        this.screen.fillText(
            "\u00a92020 by Mingzhi Tian. All Rights Reserved",
            900, 750,
        );
    }

    renderMenu() {
        this.screen.textAlign = "center";
        this.screen.textBaseline = "middle";
        this.screen.fillStyle = "rgb(55, 55, 55)";
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
            this.screen.fillStyle = "rgb(255, 255, 200)";
            this.screen.fillText(this.buttons[i], x, y);
            y += 60;
        }
    }

    renderIdleScreen() {
        this.screen.putImageData(this.cacheImg, 0, 0);
        this.screen.font = "small-caps 108px cursive";
        this.screen.fillStyle = "pink";
        this.screen.textAlign = "center";
        this.screen.textBaseline = "bottom";
        this.screen.fillText(
            "Game   Over",
            900, 400,
        );

        this.screen.font = "small-caps 32px Georgia";
        this.screen.textAlign = "center";
        this.screen.fillStyle = (
            this.currentIdleButton == 0 ? "orange" : "black"
        );
        this.screen.fillText(
            "Play Again",
            750, 450,
        );
        this.screen.fillStyle = (
            this.currentIdleButton == 1 ? "orange" : "black"
        );
        this.screen.fillText(
            "Main Menu",
            1050, 450,
        );
    }

    _paintSunny() {

        let gradient = this.screen.createLinearGradient(
            0, 0, 0, 800,
        );
        gradient.addColorStop(0, "rgba(0, 0, 255, 0.2)");
        gradient.addColorStop(1, "rgba(0, 0, 255, 1.0)");
        this.screen.fillStyle = gradient;
        this.screen.fillRect(0, 0, 1800, 600);
        this.screen.fillStyle = "rgb(0, 200, 0)";
        this.screen.fillRect(0, 600, 1800, 50);
        this.screen.fillStyle = "rgb(100, 50, 50)";
        this.screen.fillRect(0, 650, 1800, 150);

    }
    
    _paintRainy() {

        let gradient = this.screen.createLinearGradient(
            0, 0, 0, 800,
        );
        gradient.addColorStop(0, "rgba(0, 0, 150, 0.2)");
        gradient.addColorStop(1, "rgba(100, 100, 255, 1.0)");
        this.screen.fillStyle = gradient;
        this.screen.fillRect(0, 0, 1800, 600);
        this.screen.fillStyle = "rgb(0, 150, 100)";
        this.screen.fillRect(0, 600, 1800, 50);
        this.screen.fillStyle = "rgb(100, 50, 50)";
        this.screen.fillRect(0, 650, 1800, 150);

    }

    _paintSnowy() {

        let gradient = this.screen.createLinearGradient(
            0, 0, 0, 800,
        );
        gradient.addColorStop(0, "rgba(100, 100, 150, 0.2)");
        gradient.addColorStop(1, "rgba(100, 100, 150, 1.0)");
        this.screen.fillStyle = gradient;
        this.screen.fillRect(0, 0, 1800, 600);
        this.screen.fillStyle = "rgb(200, 255, 255)";
        this.screen.fillRect(0, 600, 1800, 50);
        this.screen.fillStyle = "rgb(100, 50, 50)";
        this.screen.fillRect(0, 650, 1800, 150);

    }

    renderBackground() {
        this.screen.clearRect(0, 0, 1800, 800);
        switch (this.weather) {
            case "sunny":
                this._paintSunny();
                break;
            case "rainy":
                this._paintRainy();
                break;
            case "snowy":
                this._paintSnowy();
                break;
        }
        this.cacheImg = this.screen.getImageData(0, 0, 1800, 800);
    }

    renderSystem() {

        this.screen.fillStyle = "red";
        this.screen.fillRect(
            this.x - Cartpole.CART_WIDTH / 2, 
            580,
            Cartpole.CART_WIDTH,
            30,
        );

        this.screen.strokeStyle = "white";
        this.screen.lineWidth = 10;
        this.screen.beginPath();
        this.screen.moveTo(this.x, 580);
        this.screen.lineTo(
            this.x + Cartpole.POLE_LENGTH * Math.sin(this.theta), 
            580 - Cartpole.POLE_LENGTH * Math.cos(this.theta), 
        );
        this.screen.stroke();
        this.screen.beginPath();

        this.screen.fillStyle = "grey";
        this.screen.beginPath();
        this.screen.arc(this.x, 580, 10, 0, 2 * Math.PI);
        this.screen.fill();
        this.screen.fillStyle = "white";
        this.screen.beginPath();
        this.screen.arc(this.x, 580, 5, 0, 2 * Math.PI);
        this.screen.fill();

        this.screen.fillStyle = "black";
        this.screen.beginPath();
        this.screen.arc(
            this.x - Cartpole.CART_WIDTH / 4,
            615,
            15,
            0,
            2 * Math.PI,
        );
        this.screen.fill();

        this.screen.beginPath();
        this.screen.arc(
            this.x + Cartpole.CART_WIDTH / 4,
            615,
            15,
            0,
            2 * Math.PI,
        );
        this.screen.fill();

        this.screen.fillStyle = "gold";
        this.screen.font = "bold 48px courier";
        this.screen.textBaseline = "top";
        this.screen.textAlign = "right";
        this.screen.fillText(
            "SCORE: ",
            900, 675,
        );
        this.screen.textAlign = "left";
        this.screen.fillText(
            Date.now() - this.startTime,
            900, 675,
        );

    }

    _renderCloud(x, y) {
        if (this.weather == "sunny") {
            this.screen.fillStyle = "rgb(255, 255, 255)";
        } else {
            this.screen.fillStyle = "rgb(155, 155, 155)";
        }
        this.screen.beginPath();
        this.screen.ellipse(
            x - 20, y - 25,
            60, 50,
            0,
            0, Math.PI * 2,
        );
        this.screen.fill();
        this.screen.beginPath();
        this.screen.ellipse(
            x - 30, y,
            75, 50,
            0,
            0, Math.PI * 2,
        );
        this.screen.ellipse(
            x + 30, y,
            75, 50,
            0,
            0, Math.PI * 2,
        );
        this.screen.fill();
    }

    _renderRaindrop(x, y) {
        let l = Math.sqrt(
            this.W * this.W + Cartpole.GRAVITY * Cartpole.GRAVITY
        );
        let w, h;
        if (y - 600 < 200 * Cartpole.GRAVITY / l) {
            h = 600 - y;
            w = -h * this.W / Cartpole.GRAVITY;
        } else {
            h = -200 * Cartpole.GRAVITY / l;
            w = 200 * this.W / l;
        }
        if ((w >= 0 && x > 1800) || 
            (w < 0 && x <= 0) || 
            y >= 600 || y + h <= 0) {
            return;
        }
        let g = this.screen.createLinearGradient(
            x, 
            y, 
            x + 200 * this.W / l,
            y - 200 * Cartpole.GRAVITY / l,
        );
        g.addColorStop(0.0, "rgba(255, 255, 255, 0)");
        g.addColorStop(0.68, "rgba(255, 255, 255, 0.5)");
        g.addColorStop(1.0, "rgba(255, 255, 255, 0)");
        this.screen.lineWidth = 4;
        this.screen.strokeStyle = g;
        this.screen.beginPath();
        this.screen.moveTo(x, y);
        this.screen.lineTo(x + w, y + h);
        this.screen.stroke();
    }

    _renderSnowflake(x, y) {
        this.screen.fillStyle = "rgb(200, 255, 255)";
        this.screen.strokeStyle = "rgb(200, 255, 255)";

        let angle = Math.PI / 3;
        this.screen.beginPath();
        this.screen.moveTo(
            x + 5 * Math.cos(0 * angle),
            y + 5 * Math.sin(0 * angle),
        );
        for (let i = 1; i <= 5; i++) {
            this.screen.lineTo(
                x + 5 * Math.cos(i * angle),
                y + 5 * Math.sin(i * angle),
            );
        }
        this.screen.fill();

        this.screen.lineWidth = 2;
        this.screen.beginPath();
        for (let i = 0; i < 6; i++) {
            this.screen.moveTo(x, y);
            this.screen.lineTo(
                x + 20 * Math.cos(i * angle),
                y + 20 * Math.sin(i * angle),
            );
            this.screen.moveTo(
                x + 10 * Math.cos(i * angle) + 
                4 * Math.cos((i + 2) * angle),
                y + 10 * Math.sin(i * angle) + 
                4 * Math.sin((i + 2) * angle),
            );
            this.screen.lineTo(
                x + 10 * Math.cos(i * angle),
                y + 10 * Math.sin(i * angle),
            );
            this.screen.lineTo(
                x + 10 * Math.cos(i * angle) + 
                4 * Math.cos((i - 2) * angle),
                y + 10 * Math.sin(i * angle) + 
                4 * Math.sin((i - 2) * angle),
            );
            this.screen.moveTo(
                x + 15 * Math.cos(i * angle) + 
                6 * Math.cos((i + 2) * angle),
                y + 15 * Math.sin(i * angle) + 
                6 * Math.sin((i + 2) * angle),
            );
            this.screen.lineTo(
                x + 15 * Math.cos(i * angle),
                y + 15 * Math.sin(i * angle),
            );
            this.screen.lineTo(
                x + 15 * Math.cos(i * angle) + 
                6 * Math.cos((i - 2) * angle),
                y + 15 * Math.sin(i * angle) + 
                6 * Math.sin((i - 2) * angle),
            );
        }
        this.screen.stroke();
    }

    _renderTree(theta) {
        this.screen.fillStyle = "green";
        this.screen.beginPath();
        this.screen.moveTo(385, 500);
        this.screen.bezierCurveTo(
            385 - 130 * Math.cos(theta),
            500 - 130 * Math.sin(theta),
            385 - 130 * Math.cos(theta) + 200 * Math.sin(theta),
            500 - 130 * Math.sin(theta) - 200 * Math.cos(theta),
            385 + 350 * Math.sin(theta),
            500 - 350 * Math.cos(theta),
        );
        this.screen.bezierCurveTo(
            385 + 120 * Math.cos(theta) + 200 * Math.sin(theta),
            500 + 120 * Math.sin(theta) - 200 * Math.cos(theta),
            385 + 120 * Math.cos(theta),
            500 + 120 * Math.sin(theta),
            385,
            500,
        );
        this.screen.fill();

        this.screen.fillStyle = "brown";
        this.screen.beginPath();
        this.screen.moveTo(360, 600);
        this.screen.quadraticCurveTo(
            370, 
            450,
            370 + 150 * Math.sin(theta),
            450 - 150 * Math.cos(theta),
        );
        this.screen.quadraticCurveTo(
            385 + 50 * Math.sin(theta),
            450 - 50 * Math.cos(theta),
            400 + 150 * Math.sin(theta),
            450 - 150 * Math.cos(theta),
        );
        this.screen.quadraticCurveTo(
            400,
            450,
            400,
            600,
        );
        this.screen.fill();
    }

    renderWeather() {
        for (let i = 0; i < this.clouds.length; i += 2) {
            if (this.clouds[i] >= -105 && this.clouds[i] <= 1905) {
                this._renderCloud(this.clouds[i], this.clouds[i + 1]);
                this.clouds[i] += this.W * 0.05;
            } else {
                this.clouds[i] = (this.W > 0) ? -105 : 1905;
                this.clouds[i + 1] = 75 + Math.random() * 150;
            }
        }
        this._renderTree(
            Math.atan(-this.W / Cartpole.GRAVITY) *
            (1 + 0.2 * Math.sin(2 * Math.PI * this.frame / 30))
        );
        switch (this.weather) {
            case "sunny":
                break;
            case "rainy":
                for (let i = 0; i < this.raindrops.length; i += 2) {
                    this._renderRaindrop(
                        this.raindrops[i],
                        this.raindrops[i + 1],
                    );
                    this.raindrops[i + 1] += 25;
                    this.raindrops[i] -= 25 * this.W / Cartpole.GRAVITY;
                }
                this.raindrops[this.raindropNumber] = (
                    -200 + Math.random() * 2200
                );
                this.raindrops[this.raindropNumber + 1] = -200;
                this.raindropNumber = (this.raindropNumber + 2) % 50;
                break;
            case "windy":
                break;
            case "snowy":
                for (let i = 0; i < this.snowflakes.length; i += 2) {
                    this._renderSnowflake(
                        this.snowflakes[i],
                        this.snowflakes[i + 1],
                    );
                    this.snowflakes[i + 1] += 5;
                    this.snowflakes[i] -= 15 * this.W / Cartpole.GRAVITY;
                }
                this.snowflakes[this.snowflakeNumber] = (
                    -300 + Math.random() * 2400
                );
                this.snowflakes[this.snowflakeNumber + 1] = -25;
                this.snowflakeNumber = (this.snowflakeNumber + 2) % 250;
                break;
        }
        this.screen.font = "bold 32px Georgia";
        this.screen.textAlign = "center";
        this.screen.textBaseline = "top";
        this.screen.fillStyle = "black";
        this.screen.fillText(this.forecast, 900, 25);
    }

    clickHandler(e) {
        this.mouseDown = false;
        if (this.gameStatus == Cartpole.MENU) {
            this.renderMenu();
            switch (this.currentMenuButton) {
                case 0:
                    this.currentMenuButton = -1;
                    this.playSound(Cartpole.clickSound);
                    this.startGame();
                    break;
                case 1:
                    this.currentMenuButton = -1;
                    this.playSound(Cartpole.clickSound);
                    this.help();
                    break;
                case 2:
                    this.currentMenuButton = -1;
                    this.playSound(Cartpole.clickSound);
                    this.credit();
                    break;
                case 3:
                    this.destroy();
                    break;
            }
        } else if (this.gameStatus == Cartpole.IDLE) {
            switch (this.currentIdleButton) {
                case 0:
                    this.playSound(Cartpole.clickSound);
                    this.startGame();
                    this.currentIdleButton = -1;
                    break;
                case 1:
                    this.playSound(Cartpole.clickSound);
                    this.playMusic(Cartpole.introSound, false);
                    this.gameStatus = Cartpole.MENU;
                    this.paintMenu();
                    this.renderMenu();
                    this.currentIdleButton = -1;
                    break;
            }
        } else if (
            this.gameStatus == Cartpole.HELP ||
            this.gameStatus == Cartpole.CREDIT) {
            if (this.mouseOnBack) {
                this.mouseOnBack = false;
                this.playSound(Cartpole.clickSound);
                this.gameStatus = Cartpole.MENU;
                this.paintMenu();
                this.renderMenu();
            }
        }
    }

    mousedownHandler(e) {
        this.mouseDown = true;
        if (this.gameStatus == Cartpole.MENU) {
            this.renderMenu();
        }
        if (this.gameStatus == Cartpole.HELP || 
            this.gameStatus == Cartpole.CREDIT) {
            this._renderBackButton();
        }
    }

    mousemoveHandler(e) {
        if (this.mouseDown) {
            return;
        }
        let rect = this.canvas.getBoundingClientRect();
        let a = 2 * (e.clientX - rect.x);
        let b = 2 * (e.clientY - rect.y);
        if (this.gameStatus == Cartpole.MENU) {
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
            this.renderMenu();
            return;
        } else if (this.gameStatus == Cartpole.IDLE) {
            let button = -1;
            if (a >= 650 && a <= 850 && b >= 418 && b <= 450) { 
                button = 0;
                if (this.currentIdleButton != 0) {
                    this.playSound(Cartpole.highlightSound);
                }
            }
            if (a >= 950 && a <= 1150 && b >= 418 && b <= 450) {
                button = 1;
                if (this.currentIdleButton != 1) {
                    this.playSound(Cartpole.highlightSound);
                }
            }
            this.currentIdleButton = button;
            this.renderIdleScreen();
        } else if (
            this.gameStatus == Cartpole.HELP ||
            this.gameStatus == Cartpole.CREDIT) {
            let onBack = false;
            if (a >= 750 && a <= 1050 && b >= 710 && b <= 750) {
                onBack = true;
                if (!this.mouseOnBack) {
                    this.playSound(Cartpole.highlightSound);
                }
            }
            this.mouseOnBack = onBack;
            this._renderBackButton();
        }
    }

    keydownHandler(e) {
        if (game.gameStatus != Cartpole.GAME) {
            return;
        }
        if (e.key == "ArrowLeft") {
            game.leftDown = true;
        }
        if (e.key == "ArrowRight") {
            game.rightDown = true;
        }
    }

    keyupHandler(e) {
        if (game.gameStatus != Cartpole.GAME) {
            return;
        }
        if (e.key == "ArrowLeft") {
            game.leftDown = false;
        }
        if (e.key == "ArrowRight") {
            game.rightDown = false;
        }
    }

}
