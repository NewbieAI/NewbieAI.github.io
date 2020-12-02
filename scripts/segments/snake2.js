class Snake {
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

        this._keyupHandler = this.keyupHandler.bind(this);
        this._keydownHandler = this.keydownHandler.bind(this);
        document.addEventListener(
            "keyup",
            this._keyupHandler,
        );
        document.addEventListener(
            "keydown",
            this._keydownHandler,
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
}
