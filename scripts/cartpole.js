"use strict";

// file created on May 10th,

class Cartpole {

    static MENU = 0;
    static GAME = 1;
    static IDLE = 2;

    static GRAVITY = -250;
    static CART_MASS = 10.0;
    static POLE_MASS = 1.0;
    static CART_WIDTH = 200;
    static POLE_LENGTH = 200;
    static XMIN = 100;
    static XMAX = 1700;
    static THETA_MIN = -Math.PI / 2;
    static THETA_MAX = Math.PI / 2;

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
            );
        }
        return Promise.all([
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
        this.menuClickEnabled = true;
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
        this.animateMenu();
    }

    destroy() {
        document.removeEventListener("keydown", this.keydownHandler);
        document.removeEventListener("keyup", this.keyupHandler);
        this.canvas.remove();
    }

    startGame() {
        if (this.gameStatus == Cartpole.MENU) {
            clearInterval(this.menuAnimation);
        }

        this.leftDown = false;
        this.rightDown = false;
        this.gameStatus = Cartpole.GAME;

        this.x = 900;
        this.v = 0;
        this.a = 0;
        this.theta = -0.01 + 0.02 * Math.random();
        this.omega = 0;
        this.alpha = 0;
        this.F = 0;
        this.W = 0;

        this.renderBackground();
        this.screen.lineWidth = 10;

        this.gameAnimation = setInterval(
            () => {
                this.screen.putImageData(this.cacheImg, 0, 0);
                this.evolve();
                this.renderSystem();
            },
            40,
        );
    }

    endGame() {
        alert("game over");
        clearInterval(this.gameAnimation);
    }

    evolve() {
        // evolve the state of the system according to the 
        // equations of motion.

        this.F = 2000 * (this.rightDown - this.leftDown);
        
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

        if (this.x - Cartpole.CART_WIDTH / 2 <= Cartpole.XMIN || 
            this.x + Cartpole.CART_WIDTH / 2 >= Cartpole.XMAX ||
            this.theta <= Cartpole.THETA_MIN || 
            this.theta >= Cartpole.THETA_MAX) {
            this.endGame();
        }
    }

    playSound(audio) {
        audio.currentTime = 0;
        if (this.soundOn) {
            audio.play();
        }
    }

    playMusic(audio) {
    }

    animateMenu() {
        this.screen.fillStyle = "rgb(55, 55, 55)";
        this.screen.fillRect(0, 0, 1800, 800);
        this.menuAnimation = setInterval(
            this.renderMenu.bind(this),
            20,
        );
    }

    renderMenu() {
        this.screen.textAlign = "center";
        this.screen.textBaseline = "middle";
        let x = 900, y = 400;
        for (let i = 0; i < 4; i++) {
            this.screen.fillStyle = "rgb(55, 55, 55)";
            this.screen.fillRect(
                x - this.buttonWidths[i] / 2,
                y - 20,
                this.buttonWidths[i], 40,
            );
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

    _paintSunny() {

        let gradient = this.screen.createLinearGradient(
            0, 0, 0, 800
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

    }

    _paintWindy() {

    }

    _paintSnowy() {

    }

    renderBackground(weather = "sunny") {
        this.screen.clearRect(0, 0, 1800, 800);
        switch (weather) {
            case "sunny":
                this._paintSunny();
                break;
            case "rainy":
                this._paintRainy();
                break;
            case "windy":
                this._paintWindy();
                break;
            case "snowy":
                this._paintSnowy();
                break;
        }
        this.cacheImg = this.screen.getImageData(0, 0, 1800, 800);
    }

    renderSystem() {

        this.screen.font = "24px sans-serif";
        this.screen.textAlign = "left";
        this.screen.fillStyle = "black";
        this.screen.fillText("v: " + this.v, 50, 50);
        this.screen.fillText("x: " + (this.x - 900), 50, 75);
        this.screen.fillText("\u03B8: " + this.theta, 50, 100);

        this.screen.fillStyle = "red";
        this.screen.fillRect(
            this.x - Cartpole.CART_WIDTH / 2, 
            550,
            Cartpole.CART_WIDTH,
            30,
        );

        this.screen.strokeStyle = "rgb(200, 200, 200)";
        this.screen.beginPath();
        this.screen.moveTo(this.x, 550);
        this.screen.lineTo(
            this.x + Cartpole.POLE_LENGTH * Math.sin(this.theta), 
            550 - Cartpole.POLE_LENGTH * Math.cos(this.theta), 
        );
        this.screen.stroke();

        this.screen.fillStyle = "black";
        this.screen.beginPath();
        this.screen.arc(
            this.x - Cartpole.CART_WIDTH / 4,
            585,
            15,
            0,
            2 * Math.PI,
        );
        this.screen.fill();

        this.screen.beginPath();
        this.screen.arc(
            this.x + Cartpole.CART_WIDTH / 4,
            585,
            15,
            0,
            2 * Math.PI,
        );
        this.screen.fill();
    }

    renderWeather() {

    }

    renderDefeat() {
    }

    clickHandler(e) {
        if (this.gameStatus == Cartpole.MENU) {
            switch (this.currentMenuButton) {
                case 0:
                    this.startGame();
                    break;
                case 1:
                    break;
                case 2:
                    break;
                case 3:
                    break;
            }
        }
        this.mouseDown = false;
    }

    mousedownHandler(e) {
        this.mouseDown = true;
    }

    mousemoveHandler(e) {
        if (this.mouseDown) {
            return;
        }
        if (this.gameStatus == Cartpole.MENU) {
            let rect = this.canvas.getBoundingClientRect();
            let x = 900, y = 400;
            let a = 2 * (e.clientX - rect.x);
            let b = 2 * (e.clientY - rect.y);
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
