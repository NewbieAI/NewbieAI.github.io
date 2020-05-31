"use strict";

// simple class that creates a representation of minesweeper game
// the game will be rendered in an html canvas element

class Minesweeper {
    static ROW = 20;
    static COL = 40;
    static INITIAL_MINES = 160;

    static IDLE = 0;
    static GAME = 1;
    static SETTING = 2;

    static mine = new Image();
    static smileyFace = new Image();
    static surprisedFace = new Image();
    static coolFace = new Image();
    static sadFace = new Image();
    static backgroundImg = new Image();
    static explosionFrames = new Image();
    
    static explosionSound = new Audio();
    static highlightSound = new Audio();
    static clickSound = new Audio();
    static victorySound = new Audio();
    static music1 = new Audio();
    static music2 = new Audio();
    static music3 = new Audio();

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
            )
        }
        return Promise.all([
            loadImage(
                Minesweeper.mine,
                "resources/mine.png",
            ),
            loadImage(
                Minesweeper.smileyFace, 
                "resources/smileyFace.png",
            ),
            loadImage(
                Minesweeper.surprisedFace, 
                "resources/surprisedFace.png",
            ),
            loadImage(
                Minesweeper.coolFace, 
                "resources/coolFace.jpg",
            ),
            loadImage(
                Minesweeper.sadFace, 
                "resources/sadFace.png",
            ),
            loadImage(
                Minesweeper.backgroundImg, 
                `resources/bg${0 | Math.random() * 5}.jpeg`,
            ),
            loadImage(
                Minesweeper.explosionFrames, 
                "resources/explosion.png",
            ),
            loadAudio(
                Minesweeper.explosionSound,
                "resources/Sound/explosion.wav",
            ),
            loadAudio(
                Minesweeper.highlightSound,
                "resources/Sound/highlight.mp3",
            ),
            loadAudio(
                Minesweeper.clickSound,
                "resources/Sound/click.wav",
            ),
            loadAudio(
                Minesweeper.victorySound,
                "resources/Sound/victory.mp3",
            ),
            loadAudio(
                Minesweeper.music1,
                "resources/Sound/music1.mp3",
            ),
            loadAudio(
                Minesweeper.music2,
                "resources/Sound/music2.mp3",
            ),
        ]);
    }

    constructor() {
        // the internal game states will be rendered inside the
        // canvas element

        this.gameStatus = Minesweeper.IDLE;
        this.cellClickEnabled = false;
        this.menuClickEnabled = true;

        this.leftMouseDown = false;
        this.rightMouseDown = false;
        this.clickedCell = {
            i : -1,
            j : -1,
        }
        this.currentButton = -1;
        this.currentEmoji = null;
        this.currentMusic = Minesweeper.music1;

        this.soundOn = true;
        this.musicOn = true;

        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("id", "minesweeper");
        this.canvas.setAttribute("class", "screen");
        this.canvas.setAttribute("width", 1800);
        this.canvas.setAttribute("height", 800);

        this.cellWidth = 1600 / Minesweeper.COL;
        this.cellHeight = 800 / Minesweeper.ROW;

        this.animationBuffer = document.createElement("canvas");
        this.animationBuffer.setAttribute("width", this.cellWidth);
        this.animationBuffer.setAttribute("height", 800);

        this.canvas.addEventListener(
            "mousedown",
            this.mousedownHandler.bind(this),
        );
        this.canvas.addEventListener(
            "click",
            this.clickHandler.bind(this),
        );
        this.canvas.addEventListener(
            "contextmenu",
            this.clickHandler.bind(this),
        );
        this.canvas.addEventListener(
            "mousemove",
            this.mousemoveHandler.bind(this),
        );
        document.addEventListener(
            "keyup",
            this.keyupHandler,
        );
        this.screen = this.canvas.getContext("2d");
        this.screen.lineWidth = 2;
        document.body.append(this.canvas);
        document.body.append(Minesweeper.explosionSound);
        document.body.append(Minesweeper.highlightSound);
        document.body.append(Minesweeper.clickSound);
        document.body.append(Minesweeper.victorySound);
        document.body.append(Minesweeper.music1);
        document.body.append(Minesweeper.music2);
        //document.body.append(Minesweeper.music3);

        this.state = [];
        this.mines = new Set();
        this.flags = new Set();
        this.qMarks = new Set();
        this.flagCorrect = 0;
        this.explored = 0;
        this.timer = 0;

        this.screen.drawImage(
            Minesweeper.backgroundImg,
            0, 0, 1600, 800,
        );
        this.renderMenu();
        this.playMusic(Minesweeper.music1);

    }

    destroy() {
        document.removeEventListener(
            "keyup",
            this.keyupHandler,
        );
        Minesweeper.explosionSound.remove();
        Minesweeper.clickSound.remove();
        Minesweeper.highlightSound.remove();
        Minesweeper.victorySound.remove();
        Minesweeper.music1.remove();
        Minesweeper.music2.remove();
        //Minesweeper.music3.remove();
        this.canvas.remove();
    }

    reset() {
        this.gameStatus = Minesweeper.GAME;
        this.flags.clear();
        this.qMarks.clear();
        this.mines.clear();
        this.flagCorrect = 0;
        this.explored = 0;
        this.timer = 0;
        if (this.timerInterval != null) {
            clearInterval(this.timerInterval);
        }
        this.renderTimer();

        for (let i = 0; i < Minesweeper.ROW; i++) {
            if (this.state.length <= i) {
                this.state[i] = [];
            }
            for (let j = 0; j < Minesweeper.COL; j++) {
                this.state[i][j] = 0;
            }
        }

        // insert mines into the grid
        let spaces = [];
        let totalSize = Minesweeper.COL * Minesweeper.ROW;
        for (let k = 0; k < totalSize; k++) {
            spaces[k] = k;
        }

        let index, tmp, x, y;
        for (let m = 0; m < Minesweeper.INITIAL_MINES; m++) {
            index = m + (Math.random() * (totalSize - m) | 0);
            tmp = spaces[index];
            this.mines.add(tmp);
            x = 0 | tmp / Minesweeper.COL;
            y = tmp % Minesweeper.COL;
            this.state[x][y] = -1;
            this.runAround(
                x, y,
                (a, b) => {
                    if (this.state[a][b] >= 0) {
                        this.state[a][b]++;
                    }
                }
            );

            spaces[index] = spaces[m];
            spaces[m] = tmp;
        }

        this.renderMineCounter();
        this.renderEmoji(Minesweeper.smileyFace);
        this.playMusic(Minesweeper.music2);
        this.animateStart().then(
            () => {
                this.cellClickEnabled = true;
                clearInterval(this.timerInterval);
                this.timerInterval = setInterval(
                    () => {
                        this.timer++;
                        this.renderTimer();
                    },
                    1000,
                );
            }
        );
    }

    endGame(isWin = false) {
        this.gameStatus = Minesweeper.INTRO;
        this.cellClickEnabled = false;
        this.menuCLickEnabled = false;
        clearInterval(this.timerInterval);

        if (isWin) {
            this.animateVictory().then(
                () => {
                    this.menuClickEnabled = true;
                    if (this.gameStatus != Minesweeper.GAME) {
                        this.playMusic(Minesweeper.music1);
                    }
                }
            );
        } else {
            this.animateDefeat().then(
                () => {
                    this.menuClickEnabled = true;
                    if (this.gameStatus != Minesweeper.GAME) {
                        this.playMusic(Minesweeper.music3);
                    }
                }
            );
        }
    }

    displayHelp() {
        this.cellClickEnabled = false;
        this.menuClickEnabled = false;
    }

    displaySettings() {
        this.cellClickEnabled = false;
        this.menuClickEnabled = false;
    }

    displayCredit() {
        this.cellClickEnabled = false;
        this.menuClickEnabled = false;
    }

    playSound(audio) {
        audio.currentTime = 0;
        if (this.soundOn) {
            audio.play();
        }
    }

    playMusic(audio) {
        this.currentMusic.pause();
        this.currentMusic.currentTime = 0;
        this.currentMusic = audio;
        this.currentMusic.loop = true;
        if (this.musicOn) {
            this.currentMusic.play();
        }
    }

    animateIntro() {
        return new Promise(
            (resolve) => {
                resolve();
            },
        );
    }

    animateStart() {
        return new Promise(
            (resolve) => {
                let arr = [];
                let size = Minesweeper.ROW * Minesweeper.COL;
                for (let i = 0; i < size; i++) { 
                    arr[i] = i;
                }
                let index, tmp;
                for (let i = 0; i < size; i++) {
                    index = i + (0 | Math.random() * (size - i));
                    tmp = arr[index];
                    arr[index] = arr[i]
                    arr[i] = tmp;
                }

                let frame = 0;
                let animation = setInterval(
                    () => {
                        let size = Minesweeper.ROW * Minesweeper.COL;
                        for (let i = frame * Minesweeper.COL; 
                            i < (frame + 1) * Minesweeper.COL; 
                            i++) {
                            let a = 0 | arr[i % size] / Minesweeper.COL;
                            let b = arr[i % size] % Minesweeper.COL
                            if (frame < Minesweeper.ROW) {
                                this.screen.clearRect(
                                    b * this.cellWidth,
                                    a * this.cellHeight,
                                    this.cellWidth,
                                    this.cellHeight,
                                );
                            } else {
                                this.renderCell(a, b);
                            }
                        }
                        if (++frame == 2 * Minesweeper.ROW) {
                            clearInterval(animation);
                            resolve();
                        }
                    },
                    25,
                );
            },
        );
    }

    animateVictory() {
        return new Promise(
            (resolve) => {
                this.currentMusic.pause();
                this.playSound(Minesweeper.victorySound);
                let y = -100, h = 100, i = 0;
                let savedFrame = this.screen.getImageData(
                    0, 0, 1600, 800,
                );
                let animation = setInterval(
                    () => {
                        this.screen.putImageData(savedFrame, 0, 0);
                        if (y >= i * this.cellHeight && 
                            i < Minesweeper.ROW) {
                            let key = i * Minesweeper.COL;
                            for (let j = 0; j < Minesweeper.COL; j++) {
                                if ( this.flags.has(key++) ) {
                                    this.renderCheck(i, j);
                                }
                            }
                            i++;
                        }
                        savedFrame = this.screen.getImageData(
                            0, 0, 1600, 800,
                        );
                        let g = this.screen.createLinearGradient(
                            0, y - h,
                            0, y + h,
                        );
                        g.addColorStop(0, "rgba(255, 255, 255, 0)");
                        g.addColorStop(0.5, "rgba(255, 255, 255, 0.5)");
                        g.addColorStop(1.0, "rgba(255, 255, 255, 0)");
                        this.screen.fillStyle = g;
                        this.screen.fillRect(0, y - h, 1600, 2 * h);
                        y += 16;
                        if (y - h > 800) {
                            clearInterval(animation);
                            this.renderEmoji(Minesweeper.coolFace);
                            resolve();
                        }
                    },
                    10,
                );
            },
        );
    }
    
    animateDefeat() {
        return new Promise(
            (resolve) => {
                this.currentMusic.pause();
                let explosions = [];
                let a, b;
                for (let m of this.mines.keys()) {
                    if ( !this.flags.has(m) ) {
                        let a = 0 | m / Minesweeper.COL;
                        let b = m % Minesweeper.COL;
                        explosions.push(a, b);
                    }
                }
                let frame = 0;
                let savedFrame = this.screen.getImageData(
                    0, 0, 1800, 800,
                );
                this.playSound(Minesweeper.explosionSound);
                let animation = setInterval(
                    () => {
                        this.screen.putImageData(savedFrame, 0, 0);
                        if (frame == 64) {
                            for (let key of this.flags.keys()) {
                                this.renderCheck(
                                    0 | key / Minesweeper.COL, 
                                    key % Minesweeper.COL,
                                );
                            }
                            clearInterval(animation);
                            this.renderEmoji(Minesweeper.sadFace);
                            resolve();
                            return;
                        } else if (frame == 10) {
                            for (let i = 0; i < explosions.length; i+=2) {
                                this.renderMine(
                                    explosions[i], 
                                    explosions[i + 1],
                                );
                            }
                            savedFrame = this.screen.getImageData(
                                0, 0, 1800, 800,
                            );
                        }
                        for (let i = 0; i < explosions.length; i+=2) {
                            let x = explosions[i] - 1;
                            let y = explosions[i + 1] - 1;
                            this.screen.drawImage(
                                Minesweeper.explosionFrames,
                                512 * (frame % 8),
                                512 * (0 | frame / 8),
                                512,
                                512,
                                y * this.cellWidth,
                                x * this.cellHeight,
                                3 * this.cellWidth,
                                3 * this.cellHeight,
                            );
                        }
                        frame += frame < 16 ? 1 : 2;
                    },
                    30,
                );
            },
        );
    }

    runAround(i, j, func) {
        let a, b;
        for (let k = 0; k < 9; k++) {
            if (k == 4) {
                continue;
            }
            a = i - 1 + (k / 3 | 0);
            b = j - 1 + k % 3;
            if (a >= 0 && a < Minesweeper.ROW && 
                b >= 0 && b < Minesweeper.COL) {
                func(a, b);
            }
        }
    }

    reveal(i, j) {
        // reveals the cell at (i, j)

        this.state[i][j] -= 10;
        this.explored++;
        this.renderCell(i, j);
        if (this.state[i][j] != -10) {
            return this.state[i][j] < -10 ? true : false;
        }

        let queue = [i, j];
        let k = 0;
        let a, b;
        while (queue.length > k) {
            a = queue[k];
            b = queue[k + 1];
            k += 2;
 
            if (this.state[a][b] == -10) {
               this.runAround(
                    a, 
                    b,
                    (x, y) => {
                        if (this.state[x][y] >= -1) {
                            this.state[x][y] -= 10;
                            this.explored++;
                            this.renderCell(x, y);
                            queue.push(x, y);
                        }
                    }
                );
            }
        }
        return false;
    }

    mark(i, j) {
        let key = i * Minesweeper.COL + j;
        if ( this.flags.has(key) ) {
            this.flags.delete(key);
            this.qMarks.add(key);
            if ( this.mines.has(key) ) {
                this.flagCorrect--;
            }
        } else if ( this.qMarks.has(key) ) {
            this.qMarks.delete(key);
        } else {
            this.flags.add(key);
            if ( this.mines.has(key) ) {
                this.flagCorrect++;
            }
        }

        this.renderCell(i, j);
    }

    renderCell(i, j) {
        this.screen.fillStyle = (
            "rgba(" + 
            String(0 + ((Math.random() * 20) | 0)) + ", " +
            String(125 + ((Math.random() * 20) | 0)) + ", " +
            String(200 + ((Math.random() * 20) | 0)) + ", " +
            String(0.5 + (Math.random() * 0.2)) +
            ")"
        );

        let key = i * Minesweeper.COL + j;
        if (this.state[i][j] >= -1) {
            this.screen.clearRect(
                j * this.cellWidth,
                i * this.cellHeight,
                this.cellWidth,
                this.cellHeight,
            );

            this.screen.fillRect(
                j * this.cellWidth,
                i * this.cellHeight,
                this.cellWidth,
                this.cellHeight,
            );
            if ( this.flags.has(key) ) {
                this.renderFlag(i, j);
            }
            if ( this.qMarks.has(key) ) {
                this.renderQMark(i, j);
            }
        } else {
            if ( this.flags.has(key) || this.qMarks.has(key) ) {
                this.flags.delete(key);
                this.qMarks.delete(key);
                this.screen.clearRect(
                    j * this.cellWidth,
                    i * this.cellHeight,
                    this.cellWidth,
                    this.cellHeight,
                );
                this.screen.fillRect(
                    j * this.cellWidth,
                    i * this.cellHeight,
                    this.cellWidth,
                    this.cellHeight,
                );
            }
            if (this.state[i][j] != -11) {
                this.renderDigit(i, j);
            }

        }
        
        this.screen.strokeStyle = "rgb(255, 255, 255)";
        this.screen.strokeRect(
            j * this.cellWidth,
            i * this.cellHeight,
            this.cellWidth,
            this.cellHeight,
        );
    }

    renderDigit(i, j) {
        let color = [
            "rgba(55, 220, 110, 0.5)",
            "rgb(0, 0, 110)",
            "rgb(0, 110, 0)",
            "rgb(165, 0, 0)",
            "rgb(110, 0, 110)",
            "rgb(55, 55, 0)",
            "rgb(220, 110, 0)",
            "rgb(0, 120, 120)",
            "rgb(220, 55, 110)",
        ];

        this.screen.fillStyle = color[0];
        this.screen.fillRect(
            j * this.cellWidth,
            i * this.cellHeight,
            this.cellWidth,
            this.cellHeight,
        );

        let n = this.state[i][j] + 10;
        if (n > 0) {
            this.screen.fillStyle = color[n];
            this.screen.font = "40px bold arial";
            this.screen.textAlign = "center";
            this.screen.textBaseline = "middle";
            this.screen.fillText(
                String(n),
                (j + 0.5) * this.cellWidth,
                (i + 0.5) * this.cellHeight + 2,
            );
        }
    }

    renderMine(i, j) {
        let x = j * this.cellWidth;
        let y = i * this.cellHeight;
        let mineRadius = this.cellWidth * 0.3;
        let spikeRadius = this.cellWidth * 0.45;
        let spikeLength = this.cellWidth * 0.2;
        let shadowDiff = this.cellWidth * 0.05;
        let shadowLength = this.cellWidth * 0.2;
        
        if (this.state[i][j] < -1) {
            this.screen.fillStyle = `rgb(255, 0, 0)`;
            this.screen.fillRect(x, y, this.cellWidth, this.cellHeight);
        }
        
        x += this.cellWidth / 2;
        y += this.cellHeight / 2;
        this.screen.fillStyle = "rgb(0, 0, 0)";
        this.screen.beginPath();
        this.screen.arc(x, y, mineRadius, 0, 2 * Math.PI);
        this.screen.fill();

        this.screen.fillStyle = "rgb(100, 100, 100)";
        this.screen.beginPath();
        this.screen.arc(x, y, mineRadius / 5, 0, 2 * Math.PI);
        this.screen.fill();
        
        for (let i = 0; i < 8; i++) {
            let theta = i * Math.PI / 4;
            let delta = Math.PI / 9;
            let a = x + spikeRadius * Math.cos(theta);
            let b = y + spikeRadius * Math.sin(theta);
            
            this.screen.fillStyle = "rgb(0, 0, 0)";
            this.screen.beginPath();
            this.screen.moveTo(a, b);
            this.screen.lineTo(
                a - spikeLength * Math.cos(theta + delta),
                b - spikeLength * Math.sin(theta + delta),
            );
            this.screen.lineTo(
                a - spikeLength * Math.cos(theta - delta),
                b - spikeLength * Math.sin(theta - delta),
            );
            this.screen.fill();

            if (i % 2 == 0) {
                continue;
            }
            this.screen.fillStyle = "rgb(100, 100, 100)";
            a -= shadowDiff * Math.cos(theta);
            b -= shadowDiff * Math.sin(theta);

            this.screen.beginPath();
            this.screen.moveTo(a, b);
            this.screen.lineTo(
                a - shadowLength * Math.cos(theta + delta),
                b - shadowLength * Math.sin(theta + delta),
            );
            this.screen.lineTo(
                a - shadowLength * Math.cos(theta - delta),
                b - shadowLength * Math.sin(theta - delta),
            );
            this.screen.fill();
        }
    };

    renderFlag(i, j) {
        let x = j * this.cellWidth;
        let y = i * this.cellHeight;

        let margin = this.cellHeight * 0.1;
        let poleTip = this.cellWidth * 0.3;
        let poleHeight = this.cellHeight * 0.55;
        let poleWidth = this.cellWidth * 0.06;
        let baseHeight = this.cellHeight * 0.18;
        let baseWidth = this.cellWidth * 0.7;
        let flagLength = this.cellHeight * 0.45;
        let flagWidth = this.cellWidth * 0.4;

        this.screen.beginPath();
        this.screen.fillStyle = "rgb(55, 55, 55)";
        this.screen.moveTo(
            x + poleTip, 
            y + margin,
        );
        this.screen.lineTo(
            x + poleTip, 
            y + margin + poleHeight,
        );
        this.screen.lineTo(
            x + margin, 
            y + margin + poleHeight + baseHeight,
        );
        this.screen.lineTo(
            x + margin + baseWidth, 
            y + margin + poleHeight + baseHeight,
        );
        this.screen.lineTo(
            x + poleTip + poleWidth, 
            y + margin + poleHeight,
        );
        this.screen.lineTo(
            x + poleTip + poleWidth, 
            y + margin,
        );
        this.screen.fill();
        this.screen.beginPath();
        this.screen.fillStyle = "rgb(255, 0, 0)";
        this.screen.moveTo(
            x + poleTip + poleWidth, 
            y + margin,
        );
        this.screen.lineTo(
            x + poleTip + poleWidth + flagWidth, 
            y + margin + flagLength,
        );
        this.screen.lineTo(
            x + poleTip + poleWidth, 
            y + margin + flagLength,
        );
        this.screen.fill();

    }

    renderQMark(i, j) {
        this.screen.fillStyle = "rgb(100, 100, 0)";
        this.screen.font = "36px bold arial";
        this.screen.textAlign = "center";
        this.screen.textBaseline = "middle";
        this.screen.fillText(
            "?",
            (j + 0.5) * this.cellWidth,
            (i + 0.5) * this.cellHeight + 2,
        );

    }

    renderCheck(i, j) {
        let x = j * this.cellWidth;
        let y = i * this.cellHeight;
        let xMargin = 0.2 * this.cellWidth;
        let yMargin = 0.2 * this.cellHeight;
        let xWidth = 0.6 * this.cellWidth;
        let yHeight = 0.6 * this.cellHeight;
        let xMiddle = 0.2 * this.cellWidth;
        let yMiddle = 0.3 * this.cellHeight;

        this.screen.beginPath();
        if (this.state[i][j] == -1) {
            this.screen.strokeStyle = "rgb(0, 150, 0)";
            this.screen.moveTo(
                x + xMargin,
                y + yMargin + yMiddle,
            );
            this.screen.lineTo(
                x + xMargin + xMiddle,
                y + yMargin + yHeight,
            );
            this.screen.lineTo(
                x + xMargin + xWidth,
                y + yMargin,
            );
        } else {
            this.screen.strokeStyle = "rgb(150, 0, 0)";
            this.screen.moveTo(
                x + xMargin,
                y + yMargin,
            );
            this.screen.lineTo(
                x + xMargin + xWidth,
                y + yMargin + yHeight,
            );
        }
        this.screen.lineWidth = 4;
        this.screen.stroke();
        this.screen.lineWidth = 2;
    }

    highlight(i, j) {
        this.screen.strokeStyle = "rgb(255, 100, 50)";
        this.screen.strokeRect(
            this.cellWidth * j,
            this.cellHeight * i,
            this.cellWidth,
            this.cellHeight,
        );
        this.renderEmoji(Minesweeper.surprisedFace);
    }
    
    removeHighlight() {
        if (this.clickedCell.j >= Minesweeper.COL || 
            this.clickedCell.j < 0) {
            return;
        }
        this.screen.strokeStyle = "rgb(255, 255, 255)";
        this.screen.strokeRect(
            this.cellWidth * this.clickedCell.j,
            this.cellHeight * this.clickedCell.i,
            this.cellWidth,
            this.cellHeight,
        );
        this.runAround(
            this.clickedCell.i,
            this.clickedCell.j,
            (a, b) => {
                this.screen.strokeRect(
                    this.cellWidth * b,
                    this.cellHeight * a,
                    this.cellWidth,
                    this.cellHeight,
                );
            },
        );
    }

    renderMenu() {
        // displays menu on the left side of the script

        this.screen.fillStyle = "rgba(255, 155, 0, 0.4)";
        this.screen.fillRect(1600, 0, 200, 800);

        let x = 1620, y1 = 150, y2 = 250;
        let w = 160, h = 80;
        this._renderTrapezoid(
            "rgb(100, 100, 100)",
            x, y1, w, 10, 3,
        );
        this._renderTrapezoid(
            "rgb(75, 75, 75)",
            x, y1 + h, h, 10, 2,
        );
        this._renderTrapezoid(
            "rgb(200, 200, 200)",
            x + w, y1, h, 10, 0,
        );
        this._renderTrapezoid(
            "rgb(175, 175, 175)",
            x + w, y1 + h, w, 10, 1,
        );
        this._renderTrapezoid(
            "rgb(100, 100, 100)",
            x, y2, w, 10, 3,
        );
        this._renderTrapezoid(
            "rgb(75, 75, 75)",
            x, y2 + h, h, 10, 2,
        );
        this._renderTrapezoid(
            "rgb(200, 200, 200)",
            x + w, y2, h, 10, 0,
        );
        this._renderTrapezoid(
            "rgb(175, 175, 175)",
            x + w, y2 + h, w, 10, 1,
        );

        this.renderEmoji(Minesweeper.mine);
        this.renderMineCounter();
        this.renderTimer();
        for (let i = 0; i < 5; i++) {
            this.renderButtons(i, false, false);
        }
        
        this.screen.fillStyle = "rgb(0, 0, 0)";
        this.screen.font = "small-caps bold 18px/1 cursive";
        this.screen.textAlign = "center";
        this.screen.textBaseline = "middle";
        this.screen.fillText(
            "Minesweeper.js",
            1700,
            650,
        );
        this.screen.fillText(
            "\u00a92020 by Ming Tian",
            1700,
            670,
        );
        this.screen.fillText(
            "All Rights Reserved",
            1700,
            690,
        );

        this.renderSoundIcon(false, false);
        this.renderMusicIcon(false, false);
    }

    renderEmoji(emoji, highlight = false, pressed = false){
        if (emoji != null) {
            this.currentEmoji = emoji;
        }

        let x = 1650, y = 25;
        let w = 100, h = 100;
        this.screen.clearRect(x, y, w, h);
        this.screen.strokeStyle = `rgb(
            ${150 + highlight * 105}, 
            ${150 + highlight * 105 - pressed * 155}, 
            ${150 + highlight * 105 - pressed * 255})`;
        this.screen.fillStyle = `rgb(
            ${255 - 255 * highlight}, 
            ${155}, 
            ${0 + 255 * highlight}, 
            ${0.4 - highlight * 0.1 + pressed * 0.1})`;
        this.screen.fillRect(x, y, w, h);
        this.screen.strokeRect(x, y, w, h);

        this.screen.drawImage(
            this.currentEmoji, 
            x + 5 * pressed, 
            y + 5 * pressed, 
            w - 10 * pressed, 
            h - 10 * pressed);
    }

    renderMineCounter() {
        let x = 1620, y = 150;
        let w = 160, h = 80;
        
        this.screen.fillStyle = "rgb(20, 20, 20)";
        this.screen.fillRect(x + 10, y + 10, w - 20, h - 20);

        let digits = [
            [0, 2, 3, 5, 6, 7, 8, 9],
            [0, 1, 2, 3, 4, 7, 8, 9],
            [0, 1, 3, 4, 5, 6, 7, 8, 9],
            [0, 2, 3, 5, 6, 8, 9],
            [0, 2, 6, 8],
            [0, 4, 5, 6, 8, 9],
            [2, 3, 4, 5, 6, 8, 9],
        ];
        let args = [
            [x + 110, y + 20, 25, 5, 0],
            [x + 135, y + 20, 20, 5, 1],
            [x + 135, y + 40, 20, 5, 1],
            [x + 110, y + 60, 25, 5, 0],
            [x + 110, y + 40, 20, 5, 1],
            [x + 110, y + 20, 20, 5, 1],
            [x + 110, y + 40, 25, 5, 0],
        ]
        let n = this.mines.size - this.flags.size;
        if (n < 0) {
            n = 0;
        }    
        for (let i = 0; i < 3; i++) {
            let d = n % 10;
            let style;
            for (let j = 0; j < 7; j++) {
                if ( digits[j].includes(d) ) {
                    style = "rgb(200, 0, 50)";
                } else {
                    style = "rgb(55, 55, 55)";
                }
                this._renderHexagon(
                    style,
                    ...(args[j]),
                );
                args[j][0] -= 45;
            }
            n = 0 | n / 10;
        }
    }

    renderTimer() {
        let x = 1620, y = 250;
        let w = 160, h = 80;

        this.screen.fillStyle = "rgb(20, 20, 20)";
        this.screen.fillRect(x + 10, y + 10, w - 20, h - 20);

        let digits = [
            [0, 2, 3, 5, 6, 7, 8, 9],
            [0, 1, 2, 3, 4, 7, 8, 9],
            [0, 1, 3, 4, 5, 6, 7, 8, 9],
            [0, 2, 3, 5, 6, 8, 9],
            [0, 2, 6, 8],
            [0, 4, 5, 6, 8, 9],
            [2, 3, 4, 5, 6, 8, 9],
        ];
        let args = [
            [x + 110, y + 20, 25, 5, 0],
            [x + 135, y + 20, 20, 5, 1],
            [x + 135, y + 40, 20, 5, 1],
            [x + 110, y + 60, 25, 5, 0],
            [x + 110, y + 40, 20, 5, 1],
            [x + 110, y + 20, 20, 5, 1],
            [x + 110, y + 40, 25, 5, 0],
        ]
        let n = this.timer;
        if (n > 999) {
            n = 999;
        }    
        for (let i = 0; i < 3; i++) {
            let d = n % 10;
            let style;
            for (let j = 0; j < 7; j++) {
                if ( digits[j].includes(d) ) {
                    style = "rgb(0, 200, 100)";
                } else {
                    style = "rgb(55, 55, 55)";
                }
                this._renderHexagon(
                    style,
                    ...(args[j]),
                );
                args[j][0] -= 45;
            }
            n = 0 | n / 10;
        }
    }

    _renderTrapezoid(style, x, y, length, width, direction) {
        // direction:
        // 0 - short side left
        // 1 - short side up
        // 2 - short side right
        // 3 - short side down
        
        this.screen.fillStyle = style;
        this.screen.beginPath();
        this.screen.moveTo(x, y);
        let a = direction > 1 ? 1 : -1;
        let b = direction % 3 > 0 ? -1 : 1;
        let c = direction % 2 > 0 ? direction - 2 : 0;
        let d = direction % 2 > 0 ? 0 : 1 - direction;
        
        this.screen.lineTo(
            x + a * width, 
            y + b * width,
        );
        this.screen.lineTo(
            x + a * width + c * (length - 2 * width), 
            y + b * width + d * (length - 2 * width),
        );
        this.screen.lineTo(
            x + c * length, 
            y + d * length,
        );
        this.screen.fill();
    }

    _renderHexagon(style, x, y, length, width, direction) {
        this._renderTrapezoid(
            style,
            x,
            y,
            length,
            width / 2,
            direction == 0 ? 3 : 0,
        );
        this._renderTrapezoid(
            style,
            x + length * (direction == 0),
            y + length * (direction == 1),
            length,
            width / 2,
            direction == 0 ? 1 : 2,
        );
    }

    renderButtons(buttonNumber, isHighlight, isPressed) {

        let x = 1625, y = 400 + 50 * buttonNumber;

        this.screen.clearRect(x, y - 50, 250, 55);
        this.screen.fillStyle = "rgba(255, 155, 0, 0.4)";
        this.screen.fillRect(x, y - 50, 250, 55);

        this.screen.shadowColor = "rgb(55, 55, 55)";
        this.screen.font = "bold small-caps 36px serif";
        this.screen.textAlign = "left";
        this.screen.textBaseline = "bottom";
        this.screen.shadowOffsetX = 10;
        this.screen.shadowOffsetY = 5;
        this.screen.shadowBlur = 5;

        let buttons = [
            "New Game",
            "Help",
            "Settings",
            "Credit",
            "Exit",
        ];


        if (isHighlight) {
            this.screen.fillStyle = "rgb(100, 100, 150)";
            if (isPressed) {
                this.screen.fillStyle = "rgb(100, 100, 150)";
                this.screen.shadowOffsetX = 2;
                this.screen.shadowOffsetY = 1;
                this.screen.shadowBlur = 2;
                x += 5;
                y += 2;
            }
        } else {
            this.screen.fillStyle = "rgb(0, 0, 0)";
        }
        this.screen.fillText(buttons[buttonNumber], x, y);

        this.screen.shadowOffsetX = 0;
        this.screen.shadowOffsetY = 0;
        this.screen.shadowBlur = 0;

    }

    renderSoundIcon(highlight = false, pressed = false) {
        let x = 1620, y = 720;
        let w = 70, h = 70;

        this.screen.beginPath();
        this.screen.moveTo(x, y + h / 2);
        this.screen.arcTo(x, y, x + w / 2, y, 15);
        this.screen.arcTo(x + w, y, x + w, y + h / 2, 15);
        this.screen.arcTo(x + w, y + h, x + w / 2, y + h, 15);
        this.screen.arcTo(x, y + h, x, y + h / 2, 15);
        this.screen.closePath();
        this.screen.fillStyle = `rgb(255, 255, 255)`;
        this.screen.fill();
        this.screen.fillStyle = `rgba(
            ${255}, 
            ${155}, 
            ${0},
            ${0.4 + 0.1 * highlight * (1 - 2 * pressed)})`;
        this.screen.fill();
        this.screen.strokeStyle = `rgb(255, 255, 255)`;
        this.screen.stroke();
        
        x += pressed * w * 0.05;
        y += pressed * h * 0.05;
        w -= pressed * w * 0.1;
        h -= pressed * h * 0.1;

        this.screen.beginPath();
        this.screen.fillStyle = "rgb(55, 100, 155)";
        this.screen.strokeStyle = `rgb(
            ${255}, 
            ${155 + 100 * highlight}, 
            ${0 + 255 * highlight})`;
        this.screen.moveTo(
            x + w * 0.5, 
            y + h * 0.2,
        );
        this.screen.lineTo(
            x + w * 0.3,
            y + h * 0.4,
        );
        this.screen.lineTo(
            x + w * 0.1,
            y + h * 0.4,
        );
        this.screen.lineTo(
            x + w * 0.1,
            y + h * 0.6,
        );
        this.screen.lineTo(
            x + w * 0.3,
            y + h * 0.6,
        );
        this.screen.lineTo(
            x + w * 0.5,
            y + h * 0.8,
        );
        this.screen.fill();

        this.screen.lineWidth = 5;
        this.screen.beginPath();
        this.screen.arc(
            x + 0.35 * w,
            y + 0.5 * h,
            0.35 * w,
            -Math.PI / 4,
            Math.PI / 4,
        );
        this.screen.stroke();
        this.screen.beginPath();
        this.screen.arc(
            x + 0.35 * w,
            y + 0.5 * h,
            0.5 * w,
            -Math.PI / 4,
            Math.PI / 4,
        );
        this.screen.stroke();

        if (!this.soundOn) {
            this.screen.strokeStyle = "rgb(255, 0, 0)";
            this.screen.beginPath();
            this.screen.moveTo(x + w * 0.2, y + h * 0.8);
            this.screen.lineTo(x + w * 0.8, y + h * 0.2);
            this.screen.stroke();
        }

        this.screen.lineWidth = 2;
    }

    renderMusicIcon(highlight, pressed) {
        let x = 1710, y = 720;
        let w = 70, h = 70;

        this.screen.beginPath();
        this.screen.moveTo(x, y + h / 2);
        this.screen.arcTo(x, y, x + w / 2, y, 15);
        this.screen.arcTo(x + w, y, x + w, y + h / 2, 15);
        this.screen.arcTo(x + w, y + h, x + w / 2, y + h, 15);
        this.screen.arcTo(x, y + h, x, y + h / 2, 15);
        this.screen.closePath();
        this.screen.fillStyle = `rgb(255, 255, 255)`;
        this.screen.fill();
        this.screen.fillStyle = `rgba(
            255, 
            155, 
            0,
            ${0.4 + 0.1 * highlight * (1 - 2 * pressed)})`;
        this.screen.fill();
        this.screen.strokeStyle = `rgb(255, 255, 255)`;
        this.screen.stroke();

        x += pressed * w * 0.05;
        y += pressed * h * 0.05;
        w -= pressed * w * 0.1;
        h -= pressed * h * 0.1;

        this.screen.beginPath();
        this.screen.fillStyle = "rgb(55, 100, 155)";
        this.screen.ellipse(
            x + w * 0.3,
            y + h * 0.6,
            w * 0.15,
            h * 0.1,
            -Math.PI / 9,
            0,
            Math.PI * 2,
        );
        this.screen.ellipse(
            x + w * 0.7,
            y + h * 0.8,
            w * 0.15,
            h * 0.1,
            -Math.PI / 9,
            0,
            Math.PI * 2,
        );
        this.screen.fill();

        this.screen.beginPath();
        this.screen.moveTo(
            x + w * 0.4,
            y + h * 0.1,
        );
        this.screen.lineTo(
            x + w * 0.4,
            y + h * 0.6,
        );
        this.screen.lineTo(
            x + w * 0.45,
            y + h * 0.6,
        );
        this.screen.lineTo(
            x + w * 0.45,
            y + h * 0.2,
        );
        this.screen.lineTo(
            x + w * 0.8,
            y + h * 0.36,
        );
        this.screen.lineTo(
            x + w * 0.8,
            y + h * 0.8,
        );
        this.screen.lineTo(
            x + w * 0.85,
            y + h * 0.8,
        );
        this.screen.lineTo(
            x + w * 0.85,
            y + h * 0.3,
        );
        this.screen.fill();

        this.screen.beginPath();
        this.screen.moveTo(
            x + w * 0.45,
            y + h * 0.25,
        );
        this.screen.lineTo(
            x + w * 0.85,
            y + h * 0.45,
        );
        this.screen.lineTo(
            x + w * 0.85,
            y + h * 0.5,
        );
        this.screen.lineTo(
            x + w * 0.45,
            y + h * 0.3,
        );
        this.screen.fill();

        if (!this.musicOn) {
            this.screen.lineWidth = 4;
            this.screen.strokeStyle = "rgb(255, 0, 0)";
            this.screen.beginPath();
            this.screen.moveTo(x + w * 0.2, y + h * 0.8);
            this.screen.lineTo(x + w * 0.8, y + h * 0.2);
            this.screen.stroke();
            this.screen.lineWidth = 2;
        }
    }

    toggleSound() {
        this.soundOn = !this.soundOn;
    }

    toggleMusic() {
        this.musicOn = !this.musicOn;
        if (this.musicOn) {
            this.currentMusic.play();
        } else {
            this.currentMusic.pause();
        }
    }
    
    clickHandler(e) {
        e.preventDefault();
        let rect = this.canvas.getBoundingClientRect();

        if (e.clientX - rect.x > 800) {
            this.menuClick(
                e.clientX - rect.x,
                e.clientY - rect.y,
            );
            this.leftMouseDown = false;
            this.rightMouseDown = false;
            this.removeHighlight();
            this.clickedCell.i = -1;
            this.clickedCell.j = -1;
            return;
        }

        let j = 0 | (e.clientX - rect.x) / (this.cellWidth / 2);
        let i = 0 | (e.clientY - rect.y) / (this.cellHeight / 2);

        if (this.leftMouseDown && this.rightMouseDown) {
            
            this.dualClickCell(i, j);

        } else if (this.leftMouseDown) {
            
            this.leftClickCell(i, j);
  
        } else if (this.rightMouseDown) {

            this.rightClickCell(i, j);

        }

        this.leftMouseDown = false;
        this.rightMouseDown = false;
        this.removeHighlight();
        this.clickedCell.i = -1;
        this.clickedCell.j = -1;

        // check for whether game is won
        let gridSize = Minesweeper.ROW * Minesweeper.COL;
        if (this.gameStatus == Minesweeper.GAME && 
            this.flagCorrect == this.flags.size &&
            this.flagCorrect + this.explored == gridSize) {
            this.endGame(true);
        }
       
    }

    menuClick() {
        for (let i = 0; i < 5; i++) {
            if (this.currentButton == i) {
                this.renderButtons(i, true, false);
                this.playSound(Minesweeper.clickSound);
                switch (i) {
                    case 0:
                        this.reset();
                        break;
                    case 1:
                        this.displayHelp();
                        break;
                    case 2:
                        this.displaySettings();
                        break;
                    case 3:
                        this.displayCredit();
                        break;
                    case 4:
                        this.destroy();
                        break;
                }
            }
        }
        if (this.currentButton == 5) {
            this.renderEmoji(null, true, false);
            this.playSound(Minesweeper.clickSound);
        }
        if (this.currentButton == 6) {
            this.toggleSound();
            this.renderSoundIcon(true, false);
            this.playSound(Minesweeper.clickSound);
        }
        if (this.currentButton == 7) {
            this.toggleMusic();
            this.renderMusicIcon(true, false);
            this.playSound(Minesweeper.clickSound);
        }
    }

    leftClickCell(i, j) {

        this.renderEmoji(Minesweeper.smileyFace);
        if (!this.leftMouseDown || 
            i != this.clickedCell.i || 
            j != this.clickedCell.j || 
            this.state[i][j] < -1) {
            return;
        }

        if ( this.reveal(i, j) ) {
            this.endGame();
        }
    }

    rightClickCell(i, j) {
        if (!this.rightMouseDown || 
            i != this.clickedCell.i || 
            j != this.clickedCell.j || 
            this.state[i][j] < -1) {
            return;
        }

        this.mark(i, j);
        this.renderMineCounter();
    }

    dualClickCell(i, j) {
        this.renderEmoji(Minesweeper.smileyFace);
        if (!this.leftMouseDown || 
            !this.rightMouseDown || 
            i != this.clickedCell.i ||
            j != this.clickedCell.j || 
            this.state[i][j] >= -1) {
            return;
        }

        let triggered = false;
        let mines = this.state[i][j] + 10;
        let spaces = 0;
        this.runAround(
            i,
            j,
            (a, b) => {
                let key = a * Minesweeper.COL + b;
                if ( this.flags.has(key) ) {
                    mines -= 1;
                } else {
                    spaces += this.state[a][b] >= -1;
                }
            }
        );

        this.runAround(
            i,
            j,
            (a, b) => {
                let key = a * Minesweeper.COL + b;
                if (this.state[a][b] >= -1 &&
                    !this.flags.has(key) &&
                    !this.qMarks.has(key)) {
                    if (mines == 0) {
                        if ( this.reveal(a, b) ) {
                            triggered = true;
                        }
                    } else if (mines == spaces) {
                        this.mark(a, b);
                    }
                }
            },
        );

        this.renderMineCounter();
        if (triggered) {
            this.endGame();
        }
    }

    mousedownHandler(e) {
        let rect = this.canvas.getBoundingClientRect();
        let j = 0 | (e.clientX - rect.x) / (this.cellWidth / 2);
        let i = 0 | (e.clientY - rect.y) / (this.cellHeight / 2);

        if (j >= Minesweeper.COL) {
            for (let button = 0; button < 5; button++) {
                if (this.currentButton == button) {
                    this.renderButtons(button, true, true);
                }
            }
            if (this.currentButton == 5) {
                this.renderEmoji(null, true, true);
            }
            if (this.currentButton == 6) {
                this.renderSoundIcon(true, true);
            }
            if (this.currentButton == 7) {
                this.renderMusicIcon(true, true);
            }
            if (e.button == 0) {
                this.leftMouseDown = true;
            }
            if (e.button == 2) {
                this.rightMouseDown = true;
            }
            return;
        }
        
        if (this.clickedCell.i == -1 && 
            this.clickedCell.j == -1) {
            this.clickedCell.i = i;
            this.clickedCell.j = j;
        }

        if (e.button == 0) {
            this.leftMouseDown = true;
            if (this.state[i][j] < -1 && 
                this.rightMouseDown && 
                this.clickedCell.i == i && 
                this.clickedCell.j == j) {
                this.runAround(
                    i,
                    j,
                    (a, b) => {
                        let key = a * Minesweeper.COL + b;
                        if (this.state[a][b] >= -1 &&
                            !this.flags.has(key) &&
                            !this.qMarks.has(key)) {
                            this.highlight(a, b);
                        }
                    },
                );
            }
            if (this.state[i][j] >= -1 && !this.rightMouseDown) {
                this.highlight(i, j);
            }
        }
        if (e.button == 2) {
            this.rightMouseDown = true;
            if (this.state[i][j] < -1 && 
                this.leftMouseDown && 
                this.clickedCell.i == i && 
                this.clickedCell.j == j) {
                this.runAround(
                    i,
                    j,
                    (a, b) => {
                        let key = a * Minesweeper.COL + b;
                        if (this.state[a][b] >= -1 &&
                            !this.flags.has(key) &&
                            !this.qMarks.has(key)) {
                            this.highlight(a, b);
                        }
                    },
                );
            }
        }
    }

    mousemoveHandler(e) {
        if (this.leftMouseDown || this.rightMouseDown) {
            return;
        }
        let rect = this.canvas.getBoundingClientRect();

        this.canvas.font = "bold small-caps 36px serif";
        let w = [
            this.screen.measureText("New Game").width,
            this.screen.measureText("Help").width,
            this.screen.measureText("Settings").width,
            this.screen.measureText("Credit").width,
            this.screen.measureText("Exit").width,
        ];

        let x = 1620, y = 400, h = 36;
        let a = 2 * (e.clientX - rect.x);
        let b = 2 * (e.clientY - rect.y);
        let button = -1;
        for (let i = 0; i < 5; i++) {
            if (a >= x && a <= x + w[i] && b <= y && b >= y - h) {
                this.renderButtons(i, true, false);
                button = i;
                if (this.currentButton != button) {
                    this.playSound(Minesweeper.highlightSound);
                }
            } else {
                this.renderButtons(i, false, false);
            }
            y += 50;
        }
        if (a >= 1650 && a <= 1750 && b >= 25 && b <= 125) {
            this.renderEmoji(null, true, false);
            button = 5;
            if (this.currentButton != button) {
                this.playSound(Minesweeper.highlightSound);
            }
        } else {
            this.renderEmoji(null);
        }
        if (a >= 1620 && a <= 1690 && b >= 720 && b <= 790) {
            this.renderSoundIcon(true, false);
            button = 6;
            if (this.currentButton != button) {
                this.playSound(Minesweeper.highlightSound);
            }
        } else {
            this.renderSoundIcon(false, false);
        }
        if (a >= 1710 && a <= 1780 && b >= 720 && b <= 790) {
            this.renderMusicIcon(true, false);
            button = 7;
            if (this.currentButton != button) {
                this.playSound(Minesweeper.highlightSound);
            }
        } else {
            this.renderMusicIcon(false, false);
        }
        this.currentButton = button;
    }

    keyupHandler(e) {
        let hasSound = true;
        switch (e.key) {
            case "r":
                game.reset();
                break;
            case "s":
                game._solve();
                break;
            case "q":
                game.destroy();
                break;
            case "h":
                game.displayHelp();
                break;
            case "c":
                game.displayCredit();
                break;
            case "n":
                game.toggleSound();
                game.canvas.dispatchEvent(new Event("mousemove"));
                hasSound = game.soundOn;
                break;
            case "m":
                game.toggleMusic();
                game.canvas.dispatchEvent(new Event("mousemove"));
                hasSound = game.soundOn;
                break;
            default:
                hasSound = false;
        }
        if (hasSound) {
            game.playSound(Minesweeper.clickSound);
        }
    }

    _solve() {
        // solves the current game
        for (let i = 0; i < Minesweeper.ROW; i++) {
            for (let j = 0; j < Minesweeper.COL; j++) {
                if (this.state[i][j] >= 0) {
                    this.reveal(i, j);
                } else if (this.state[i][j] == -1) {
                    while ( !this.flags.has(i * Minesweeper.COL + j) ) {
                        this.mark(i, j);
                    }
                }
            }
        }
        this.endGame(true);
    }
}
