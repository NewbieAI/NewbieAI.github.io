"use strict";

class Minesweeper {
    static ROW = 20;
    static COL = 40;

    static EASY = 80;
    static MEDIUM = 120;
    static HARD = 160;
    static INSANE = 200;

    static IDLE = 0;
    static GAME = 1;

    static mine = new Image();
    static smileyFace = new Image();
    static surprisedFace = new Image();
    static coolFace = new Image();
    static sadFace = new Image();
    static backgroundImg = new Image();
    static scrollImg = new Image();
    static explosionFrames = new Image();
    static helpImage = new Image();
    
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
                "resources/Images/Minesweeper/mine.png",
            ),
            loadImage(
                Minesweeper.smileyFace, 
                "resources/Images/Minesweeper/smileyFace.png",
            ),
            loadImage(
                Minesweeper.surprisedFace, 
                "resources/Images/Minesweeper/surprisedFace.png",
            ),
            loadImage(
                Minesweeper.coolFace, 
                "resources/Images/Minesweeper/coolFace.jpg",
            ),
            loadImage(
                Minesweeper.sadFace, 
                "resources/Images/Minesweeper/sadFace.png",
            ),
            loadImage(
                Minesweeper.backgroundImg, 
                `resources/Images/Minesweeper/bg${0 | Math.random() * 5}.jpg`,
            ),
            loadImage(
                Minesweeper.scrollImg,
                "resources/Images/Minesweeper/scroll.png",
            ),
            loadImage(
                Minesweeper.explosionFrames, 
                "resources/Images/Minesweeper/explosion.png",
            ),
            loadAudio(
                Minesweeper.explosionSound,
                "resources/Sound/explosion.mp3",
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
            loadAudio(
                Minesweeper.music3,
                "resources/Sound/music3.mp3",
            ),
        ]);
    }

    constructor() {
        // the internal game states will be rendered inside the
        // canvas element

        this.gameStatus = Minesweeper.IDLE;
        this.gameStarted = false;
        this.cellClickEnabled = false;
        this.cellClickEnabled_tmp = false;
        this.menuClickEnabled = true;

        this.leftMouseDown = false;
        this.rightMouseDown = false;
        this.clickedCell = {
            i : -1,
            j : -1,
        }
        this.currentEmoji = null;
        this.currentMusic = Minesweeper.music1;
        this.currentMenuButton = -1;
        this.currentHelpButton = -1;
        this.currentSettingsButton = -1;

        this.soundOn = true;
        this.musicOn = true;
        this.helpOpen = false;
        this.creditOpen = false;
        this.settingsOpen = false;
        this.difficulty = Minesweeper.MEDIUM;
        this.allowHint = true;
        this.autoFlag = true;

        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("id", "minesweeper");
        this.canvas.setAttribute("class", "screen");
        this.canvas.setAttribute("width", 1800);
        this.canvas.setAttribute("height", 800);

        this.cellWidth = 1600 / Minesweeper.COL;
        this.cellHeight = 800 / Minesweeper.ROW;

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

        this._keyupHandler = this.keyupHandler.bind(this);
        document.addEventListener(
            "keyup",
            this._keyupHandler,
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
        document.body.append(Minesweeper.music3);

        this.state = [];
        this.spaces = [];
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
        this.screen.fillStyle = "black";
        this.screen.font = "bold 108px/1 cursive";
        this.screen.textAlign = "center";
        this.screen.fillBaseline = "top";
        this.screen.fillText(
            "MINESWEEPER v1.1",
            800, 200,
        );
        this.renderMenu();

        this.cacheImg = this.screen.getImageData(0, 0, 1800, 800);
        this.screen.putImageData(this.cacheImg, 0, 0);
        this.playMusic(Minesweeper.music1);

    }

    destroy() {
        document.removeEventListener(
            "keyup",
            this._keyupHandler,
        );
        Minesweeper.explosionSound.remove();
        Minesweeper.clickSound.remove();
        Minesweeper.highlightSound.remove();
        Minesweeper.victorySound.remove();
        Minesweeper.music1.remove();
        Minesweeper.music2.remove();
        Minesweeper.music3.remove();
        this.canvas.remove();
    }

    reset() {
        this.gameStatus = Minesweeper.GAME;
        this.gameStarted = false;
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
        this.spaces.length = 0;
        let totalSize = Minesweeper.COL * Minesweeper.ROW;
        for (let k = 0; k < totalSize; k++) {
            this.spaces[k] = k;
        }

        let index, tmp, x, y;
        for (let m = 0; m < this.difficulty; m++) {
            index = m + (Math.random() * (totalSize - m) | 0);
            tmp = this.spaces[index];
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

            this.spaces[index] = this.spaces[m];
            this.spaces[m] = tmp;
        }

        this.renderMineCounter();
        this.renderEmoji(Minesweeper.smileyFace);
        this.playMusic(Minesweeper.music2);
        this.animateStart().then(
            () => {
                this.cellClickEnabled = true;
                clearInterval(this.timerInterval);
            }
        );
    }

    endGame(isWin = false) {
        this.gameStatus = Minesweeper.INTRO;
        this.cellClickEnabled = false;
        this.menuClickEnabled = false;
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
                                this.screen.fillStyle = "white";
                                this.screen.fillRect(
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
                            let x = explosions[i] - 2;
                            let y = explosions[i + 1] - 2;
                            this.screen.drawImage(
                                Minesweeper.explosionFrames,
                                512 * (frame % 8),
                                512 * (0 | frame / 8),
                                512,
                                512,
                                y * this.cellWidth,
                                x * this.cellHeight,
                                5 * this.cellWidth,
                                5 * this.cellHeight,
                            );
                        }
                        frame += frame < 32 ? 1 : 2;
                    },
                    20,
                );
            },
        );
    }
    
    animateCredit() {
        this.renderButtons(3, false, false);
        let credits;
        fetch("resources/JSON/credit.json").then(
            response => response.json()
        ).then(
            data => {
                credits = data;
            }
        );

        return new Promise(
            (resolve) => {
                let frame = 0;
                let x = 800, ystart = 800;
                this.screen.textAlign = "center";
                this.screen.textBaseline = "top";
                this.cacheImg = this.screen.getImageData(
                    0, 0, 1600, 800,
                );
                this.creditOpen = true;
                this.animationInterval = setInterval(
                    () => {
                        this.screen.fillStyle = "rgb(0, 0, 0)";
                        if (frame < 20) {
                            this.screen.fillRect(0, 0, 1600, 800);
                            this.screen.putImageData(
                                this.cacheImg,
                                -frame * 20, 0,
                                frame * 20, 0,
                                800 - frame * 20, 800,
                            );
                            this.screen.putImageData(
                                this.cacheImg,
                                frame * 20, 0,
                                800, 0,
                                800 - frame * 20, 800,
                            );
                        } else if (frame < 1500) {
                            this.screen.fillRect(400, 0, 800, 800);
                            let y = ystart;
                            for (let line of credits) {
                                if (y > 800) {
                                    break;
                                }
                                this.screen.font = line[0];
                                this.screen.fillStyle = line[1];
                                this.screen.fillText(line[2], x, y);
                                y += line[3];
                            }
                            ystart -= 2;
                        } else if (frame <= 1520) {
                            this.screen.fillRect(0, 0, 1600, 800);
                            this.screen.putImageData(
                                this.cacheImg,
                                -(1520 - frame) * 20, 0,
                                (1520 - frame) * 20, 0,
                                800 - (1520 - frame) * 20, 800,
                            );
                            this.screen.putImageData(
                                this.cacheImg,
                                (1520 - frame) * 20, 0,
                                800, 0,
                                800 - (1520 - frame) * 20, 800,
                            );
                        } else {
                            clearInterval(this.animationInterval);
                            resolve();
                        }
                        frame++;
                    },
                    25,
                );
            }
        );
    }

    openCredit() {
        this.cellClickEnabled_tmp = this.cellClickEnabled;
        this.cellClickEnabled = false
        this.menuClickEnabled = false;
        this.animateCredit().then(
            this.closeCredit.bind(this)
        );
    }

    closeCredit() {
        clearInterval(this.animationInterval);
        this.creditOpen = false;
        this.screen.putImageData(this.cacheImg, 0, 0)
        this.cellClickEnabled = this.cellClickEnabled_tmp;
        this.menuClickEnabled = true;
    }

    openHelp() {
        if (this.helpOpen) {
            return;
        }
        this.cellClickEnabled = false;
        this.menuClickEnabled = false;
        this.helpOpen = true;
        this.cacheImg = this.screen.getImageData(
            0, 0, 1600, 800,
        );
        this.helpPage = 0;
        this.renderHelp();
    }

    openSettings() {
        if (this.settingsOpen) {
            return;
        }
        this.cellClickEnabled = false;
        this.menuClickEnabled = false;
        this.settingsOpen = true;
        this.cacheImg = this.screen.getImageData(
            0, 0, 1600, 800,
        );
        this.renderSettings();
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

    _guaranteeFirstClick(i, j) {
        console.log("first click");
        let key = i * Minesweeper.COL + j;
        if ( this.mines.has(key) ) {
            this.mines.delete(key);
            this.state[i][j] = 0;
            this.runAround(
                i, 
                j,
                (a, b, i_=i, j_=j) => {
                    if (this.state[a][b] < 0) {
                        this.state[i_][j_]++;
                    }
                }
            );
            let index = this.difficulty + Math.random() * (
                Minesweeper.COL * Minesweeper.ROW - this.difficulty
            ) | 0;
            let newKey = this.spaces[index];
            let x = 0 | newKey / Minesweeper.COL;
            let y = newKey % Minesweeper.COL;
            this.mines.add(newKey);
            this.runAround(
                x,
                y,
                (a, b) => {
                    if (this.state[a][b] >= 0) {
                        this.state[a][b]++;
                    }
                }
            );
        }
    }

    renderCell(i, j) {
        let colorStyle = (
            "rgba(" + 
            String(0 + ((Math.random() * 20) | 0)) + ", " +
            String(125 + ((Math.random() * 20) | 0)) + ", " +
            String(200 + ((Math.random() * 20) | 0)) + ", " +
            String(0.5 + (Math.random() * 0.2)) +
            ")"
        );

        let key = i * Minesweeper.COL + j;
        if (this.state[i][j] >= -1) {
            this.screen.fillStyle = "rgb(255, 255, 255)";
            this.screen.fillRect(
                j * this.cellWidth,
                i * this.cellHeight,
                this.cellWidth,
                this.cellHeight,
            );

            this.screen.fillStyle = colorStyle;
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

                this.screen.fillStyle = "rgb(255, 255, 255)";
                this.screen.fillRect(
                    j * this.cellWidth,
                    i * this.cellHeight,
                    this.cellWidth,
                    this.cellHeight,
                );
                this.screen.fillStyle = colorStyle;
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
            this.clickedCell.j < 0 || 
            this.gameStatus == Minesweeper.IDLE || 
            this.helpOpen || this.settingsOpen) {
            return;
        }
        this.screen.strokeStyle = "rgb(255, 255, 255)";
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

    renderHelp(helpPage) {
        function getHelpImg(page) {
            return new Promise(
                (resolve) => {
                    Minesweeper.helpImage.onload = resolve
                    Minesweeper.helpImage.src = (
                        `resources/Images/Minesweeper/help${page}.png`
                    );
                },
            );
        }
        this.renderButtons(1, false, false);
        if (!this.helpOpen) {
            this.screen.putImageData(this.cacheImg, 0, 0);
            return;
        }
        let x = 200, y = 100, w = 1200, h = 600;
        getHelpImg(this.helpPage).
        then(
            () => {
                this.screen.putImageData(this.cacheImg, 0, 0);
                this.screen.drawImage(
                    Minesweeper.helpImage,
                    x, y, w, h,
                );
                if (this.helpPage == 0) { 
                    this.screen.fillStyle = "rgb(155, 155, 155)";
                } else {
                    this.screen.fillStyle = `rgb(
                        ${55 + 75 * (this.currentHelpButton == 1)},
                        ${100 + 75 * (this.currentHelpButton == 1)},
                        ${155 + 75 * (this.currentHelpButton == 1)}
                    )`;
                }
                this.screen.beginPath();
                this.screen.moveTo(x + 15, y + 40);
                this.screen.lineTo(x + 40, y + 15);
                this.screen.lineTo(x + 40, y + 65);
                this.screen.fill();
                this.screen.fillRect(x + 40, y + 30, 40, 20);
                if (this.helpPage == 5) { 
                    this.screen.fillStyle = "rgb(155, 155, 155)";
                } else {
                    this.screen.fillStyle = `rgb(
                        ${55 + 75 * (this.currentHelpButton == 2)},
                        ${100 + 75 * (this.currentHelpButton == 2)},
                        ${155 + 75 * (this.currentHelpButton == 2)}
                    )`;
                }
                this.screen.beginPath();
                this.screen.moveTo(x + w - 15, y + 40);
                this.screen.lineTo(x + w - 40, y + 15);
                this.screen.lineTo(x + w - 40, y + 65);
                this.screen.fill();
                this.screen.fillRect(x + w - 40, y + 30, -40, 20);
                this.screen.font = "40px/1 serif";
                this.screen.textAlign = "center";
                this.screen.textBaseline = "top";
                this.screen.fillStyle = "rgb(55, 55, 55)";
                this.screen.fillText(
                    `${1 + this.helpPage} / 6`,
                    x + w / 2, y + 15,
                );
                this.screen.fillStyle = (
                    this.currentHelpButton == 0 ? 
                    "rgb(200, 155, 100)" : "rgb(155, 155, 155)"
                );
                this.screen.fillText(
                    "CLOSE",
                    x + w - 75, y + h - 50,
                );
            }
        );
    }

    renderSettings() {
        this.screen.putImageData(this.cacheImg, 0, 0);
        this.renderButtons(2, false, false);
        if (!this.settingsOpen) {
            return;
        }
        let x = 550, y = 25, w = 600, h = 750;
        this.screen.drawImage(
            Minesweeper.scrollImg,
            x, y, w, h,
        );
        this.screen.font = "bold 40px/1 arial";
        this.screen.textAlign = "center";
        this.screen.textBaseline = "middle";
        this.screen.fillStyle = "brown";
        this.screen.fillText(
            "Settings",
            x + w / 2,
            y + 125,
        );
        this.screen.font = "32px/1 cursive";
        this.screen.textAlign = "right";
        this.screen.fillText(
            "Difficulty:",
            x + 200,
            y + 200,
        );
        this.screen.fillText(
            "Hints:",
            x + 200,
            y + 350,
        );
        this.screen.fillText(
            "Autoflag:",
            x + 200,
            y + 500,
        );

        let colors = ["green", "orange", "red", "purple"];
        let lvls = ["easy", "medium", "hard", "insane"];
        let i = 0 | (this.difficulty - Minesweeper.EASY) / 40;
        this.screen.textAlign = "center";
        this.screen.fillStyle = colors[i];
        this.screen.fillText(
            lvls[i],
            x + 400,
            y + 200,
        );
        this.screen.fillStyle = "black";
        this.screen.fillText(
            "(changes only affect new games)",
            x + w / 2,
            y + 250,
        );

        this.screen.textAlign = "left";
        this.screen.fillStyle = this.allowHint ? "black" : "grey";
        this.screen.fillText(
            this.allowHint ? "Enabled" : "Disabled",
            x + 400,
            y + 350,
        );
        this.screen.fillStyle = this.autoFlag ? "black" : "grey";
        this.screen.fillText(
            this.autoFlag ? "Enabled" : "Disabled",
            x + 400,
            y + 500,
        );

        if (this.difficulty > Minesweeper.EASY) {
            this.screen.fillStyle = `rgb(
                ${55 + 100 * (this.currentSettingsButton == 1)},
                ${55 + 100 * (this.currentSettingsButton == 1)},
                ${55 + 100 * (this.currentSettingsButton == 1)}
            )`;
            this.screen.beginPath();
            this.screen.moveTo(x + 275, y + 200);
            this.screen.lineTo(x + 310, y + 180);
            this.screen.lineTo(x + 295, y + 200);
            this.screen.lineTo(x + 310, y + 220);
            this.screen.closePath();
            this.screen.fill();
        }
        if (this.difficulty < Minesweeper.INSANE) {
            this.screen.fillStyle = `rgb(
                ${55 + 100 * (this.currentSettingsButton == 2)},
                ${55 + 100 * (this.currentSettingsButton == 2)},
                ${55 + 100 * (this.currentSettingsButton == 2)}
            )`;
            this.screen.beginPath();
            this.screen.moveTo(x + 525, y + 200);
            this.screen.lineTo(x + 490, y + 180);
            this.screen.lineTo(x + 505, y + 200);
            this.screen.lineTo(x + 490, y + 220);
            this.screen.closePath();
            this.screen.fill();
        }

        this.screen.fillStyle = "rgb(255, 255, 255)";
        this.screen.strokeStyle = `rgba(
            255, 
            100, 
            0,
            ${0.5 + 0.5 * (this.currentSettingsButton == 3)}
        )`;
        this.screen.beginPath();
        this.screen.arc(
            x + 300, 
            y + 345, 
            20, 
            0.5 * Math.PI, 
            1.5 * Math.PI,
        );
        this.screen.arc(
            x + 350, 
            y + 345, 
            20, 
            -0.5 * Math.PI, 
            0.5 * Math.PI,
        );
        this.screen.closePath();
        this.screen.fill();
        this.screen.stroke();

        this.screen.strokeStyle = `rgba(
            255, 
            100, 
            0,
            ${0.5 + 0.5 * (this.currentSettingsButton == 4)}
        )`;
        this.screen.beginPath();
        this.screen.arc(
            x + 300, 
            y + 495, 
            20, 
            0.5 * Math.PI, 
            1.5 * Math.PI,
        );
        this.screen.arc(
            x + 350, 
            y + 495, 
            20, 
            -0.5 * Math.PI, 
            0.5 * Math.PI,
        );
        this.screen.closePath();
        this.screen.fill();
        this.screen.stroke();

        this.screen.fillStyle = "rgb(0, 100, 255)";
        this.screen.beginPath();
        this.screen.arc(
            x + 300 + 30 * (1 - this.allowHint), 
            y + 345, 
            16, 
            0.5 * Math.PI, 
            1.5 * Math.PI,
        );
        this.screen.arc(
            x + 350 - 30 * this.allowHint, 
            y + 345, 
            16, 
            -0.5 * Math.PI, 
            0.5 * Math.PI,
        );
        this.screen.fill();

        this.screen.beginPath();
        this.screen.arc(
            x + 300 + 30 * (1 - this.autoFlag), 
            y + 495, 
            16, 
            0.5 * Math.PI, 
            1.5 * Math.PI,
        );
        this.screen.arc(
            x + 350 - 30 * this.autoFlag, 
            y + 495, 
            16, 
            -0.5 * Math.PI, 
            0.5 * Math.PI,
        );
        this.screen.fill();

        
        let gradient = this.screen.createLinearGradient(
            x + w / 2 - 100, y + 600 - 75,
            x + w / 2 + 100, y + 600 + 75,
        );
        gradient.addColorStop(
            0, 
            this.currentSettingsButton == 0 ? "orange" : "black",
        );
        gradient.addColorStop(
            1, 
            this.currentSettingsButton == 0 ? "green" : "grey",
        );
        this.screen.fillStyle = gradient;
        this.screen.font = "36px/1 serif";
        this.screen.textAlign = "center";
        this.screen.fillText(
            "CONFIRM",
            x + w / 2,
            y + 600,
        );

    }

    renderMenu() {
        // displays menu on the left side of the script

        this.screen.fillStyle = "white";
        this.screen.fillRect(1600, 0, 200, 800);
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
        this.screen.fillStyle = "white";
        this.screen.fillRect(x, y, w, h);
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

        this.screen.fillStyle = "rgb(255, 255, 255)";
        this.screen.fillRect(x, y - 50, 250, 55);
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
            let gradient = this.screen.createLinearGradient(
                1625, 0, 1775, 0,
            );
            gradient.addColorStop(0, "rgb(0, 0, 255)");
            gradient.addColorStop(0.4, "rgb(0, 100, 255)");
            gradient.addColorStop(1, "rgb(255, 0, 255)");
            this.screen.fillStyle = gradient;
            if (isPressed) {
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
            if (this.menuClickEnabled) {
                this.menuClick(
                    e.clientX - rect.x,
                    e.clientY - rect.y,
                );
            }
        } else if (this.helpOpen) {
            
            this.helpClick();

        } else if (this.creditOpen) {

            this.closeCredit();

        } else if (this.settingsOpen) {

            this.settingsClick();

        } else if (this.cellClickEnabled) {

            let j = 0 | (e.clientX - rect.x) / (this.cellWidth / 2);
            let i = 0 | (e.clientY - rect.y) / (this.cellHeight / 2);

            if (this.leftMouseDown && this.rightMouseDown) {
                
                this.dualClickCell(i, j);

            } else if (this.leftMouseDown) {

                if (!this.gameStarted) {
                    this.timerInterval = setInterval(
                        () => {
                            this.timer++;
                            this.renderTimer();
                        },
                        1000,
                    );
                }
                this.leftClickCell(i, j);
      
            } else if (this.rightMouseDown) {

                this.rightClickCell(i, j);

            }

            // check for whether game is won
            let gridSize = Minesweeper.ROW * Minesweeper.COL;
            if (this.gameStatus == Minesweeper.GAME && 
                this.flagCorrect == this.flags.size &&
                this.flagCorrect + this.explored == gridSize) {
                this.endGame(true);
            }
        }

        this.leftMouseDown = false;
        this.rightMouseDown = false;
        this.removeHighlight();
        this.clickedCell.i = -1;
        this.clickedCell.j = -1;
       
    }

    menuClick() {
        if (!this.menuClickEnabled) {
            return;
        }
        for (let i = 0; i < 5; i++) {
            if (this.currentMenuButton == i) {
                this.renderButtons(i, true, false);
                this.playSound(Minesweeper.clickSound);
                switch (i) {
                    case 0:
                        this.reset();
                        break;
                    case 1:
                        this.openHelp();
                        break;
                    case 2:
                        this.openSettings();
                        break;
                    case 3:
                        this.openCredit();
                        break;
                    case 4:
                        this.destroy();
                        break;
                }
            }
        }
        if (this.currentMenuButton == 5) {
            this.renderEmoji(null, true, false);
            if (this.allowHint && this.gameStatus == Minesweeper.GAME) {
                this._hint();
            } else {
                this.reset();
            }
            this.playSound(Minesweeper.clickSound);
        }
        if (this.currentMenuButton == 6) {
            this.toggleSound();
            this.renderSoundIcon(true, false);
            this.playSound(Minesweeper.clickSound);
        }
        if (this.currentMenuButton == 7) {
            this.toggleMusic();
            this.renderMusicIcon(true, false);
            this.playSound(Minesweeper.clickSound);
        }
    }

    helpClick() {

        switch (this.currentHelpButton) {
            case 0:
                this.helpPage = 0;
                this.helpOpen = false;
                this.menuClickEnabled = true;
                if (this.gameStatus == Minesweeper.GAME) {
                    this.cellClickEnabled = true;
                }
                break;
            case 1:
                this.helpPage--;
                break;
            case 2:
                this.helpPage++;
                break;
        }

        this.renderHelp();

    }

    settingsClick() {

        switch (this.currentSettingsButton) {
            case 0:
                this.currentSettingsButton = -1;
                this.settingsOpen = false;
                this.menuClickEnabled = true;
                if (this.gameStatus == Minesweeper.GAME) {
                    this.cellClickEnabled = true;
                }
                break;
            case 1:
                if (this.difficulty > Minesweeper.EASY) {
                    this.difficulty -= 40;
                }
                break;
            case 2:
                if (this.difficulty < Minesweeper.INSANE) {
                    this.difficulty += 40;
                }
                break;
            case 3:
                this.allowHint = !this.allowHint;
                break;
            case 4:
                this.autoFlag = !this.autoFlag;
                break;
        }
        this.renderSettings();

    }

    leftClickCell(i, j) {

        this.renderEmoji(Minesweeper.smileyFace);
        if (!this.leftMouseDown || 
            i != this.clickedCell.i || 
            j != this.clickedCell.j || 
            this.state[i][j] < -1) {
            return;
        }

        if (!this.flags.has(i*Minesweeper.COL + j) && 
            !this.qMarks.has(i*Minesweeper.COL + j)) {
            if (!this.gameStarted) {
                this._guaranteeFirstClick(i, j);
                this.gameStarted = true;
            }
            if ( this.reveal(i, j) ){
                this.endGame();
            }
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
                    } else if (mines == spaces && this.autoFlag) {
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
            if (!this.menuClickEnabled) {
                return;
            }
            for (let button = 0; button < 5; button++) {
                if (this.currentMenuButton == button) {
                    this.renderButtons(button, true, true);
                }
            }
            if (this.currentMenuButton == 5) {
                this.renderEmoji(null, true, true);
            }
            if (this.currentMenuButton == 6) {
                this.renderSoundIcon(true, true);
            }
            if (this.currentMenuButton == 7) {
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
        if (!this.cellClickEnabled) {
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
        if (this.leftMouseDown || 
            this.rightMouseDown) {
            return;
        }

        let rect = this.canvas.getBoundingClientRect();
        let a = 2 * (e.clientX - rect.x);
        let b = 2 * (e.clientY - rect.y);

        if (this.helpOpen) {
            let button = -1
            if (a >= 1260 && a <= 1390 && 
                b >= 650 && b <= 690) {
                button = 0;
                if (this.currentHelpButton != 0) {
                    this.playSound(Minesweeper.highlightSound);
                }
            } else if (
                a >= 215 && a <= 280 && 
                b >= 115 && b <= 165 && 
                this.helpPage > 0) {
                button = 1;
                if (this.currentHelpButton != 1) {
                    this.playSound(Minesweeper.highlightSound);
                }
            } else if (
                a >= 1320 && a <= 1385 && 
                b >= 115 && b <= 165 && 
                this.helpPage < 5) {
                button = 2;
                if (this.currentHelpButton != 2) {
                    this.playSound(Minesweeper.highlightSound);
                }
            }
            this.currentHelpButton = button;
            this.renderHelp();
            return;
        }

        if (this.settingsOpen) {
            let button = -1;
            if (a >= 775 && a <= 925 && 
                b >= 605 && b <= 645) {
                button = 0;
                if (this.currentSettingsButton != 0) {
                    this.playSound(Minesweeper.highlightSound);
                }
            } else if (
                a >= 825 && a <= 860 && 
                b >= 225 - 20 * (a - 825) / 35 && 
                b <= 225 + 20 * (a - 825) / 35) {
                button = 1;
                if (this.currentSettingsButton != 1) {
                    this.playSound(Minesweeper.highlightSound);
                }
            } else if (
                a >= 1040 && a <= 1075 && 
                b >= 225 - 20 * (1075 - a) / 35 && 
                b <= 225 + 20 * (1075 - a) / 35 ) {
                button = 2;
                if (this.currentSettingsButton != 2) {
                    this.playSound(Minesweeper.highlightSound);
                }
            } else if (
                a >= 830 && a <= 920 && 
                b >= 350 && b <= 390) {
                button = 3;
                if (this.currentSettingsButton != 3) {
                    this.playSound(Minesweeper.highlightSound);
                }
            } else if (
                a >= 830 && a <= 920 && 
                b >= 500 && b <= 540) {
                button = 4;
                if (this.currentSettingsButton != 4) {
                    this.playSound(Minesweeper.highlightSound);
                }
            }
            this.currentSettingsButton = button;
            this.renderSettings();
            return;
        }

        if (!this.menuClickEnabled) {
            return;
        }


        this.canvas.font = "bold small-caps 36px serif";
        let w = [
            this.screen.measureText("New Game").width,
            this.screen.measureText("Help").width,
            this.screen.measureText("Settings").width,
            this.screen.measureText("Credit").width,
            this.screen.measureText("Exit").width,
        ];

        let x = 1620, y = 400, h = 36;
        let button = -1;
        for (let i = 0; i < 5; i++) {
            if (a >= x && a <= x + w[i] && b <= y && b >= y - h) {
                this.renderButtons(i, true, false);
                button = i;
                if (this.currentMenuButton != button) {
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
            if (this.currentMenuButton != button) {
                this.playSound(Minesweeper.highlightSound);
            }
        } else {
            this.renderEmoji(null);
        }
        if (a >= 1620 && a <= 1690 && b >= 720 && b <= 790) {
            this.renderSoundIcon(true, false);
            button = 6;
            if (this.currentMenuButton != button) {
                this.playSound(Minesweeper.highlightSound);
            }
        } else {
            this.renderSoundIcon(false, false);
        }
        if (a >= 1710 && a <= 1780 && b >= 720 && b <= 790) {
            this.renderMusicIcon(true, false);
            button = 7;
            if (this.currentMenuButton != button) {
                this.playSound(Minesweeper.highlightSound);
            }
        } else {
            this.renderMusicIcon(false, false);
        }
        this.currentMenuButton = button;
    }

    keyupHandler(e) {
        let hasSound = false;
        switch (e.key) {
            case "r":
                if (this.menuClickEnabled) {
                    this.reset();
                    hasSound = true;
                }
                break;
            case "q":
                this.destroy();
                break;
            case "i":
                if (this.cellClickEnabled && this.allowHint) {
                    this._hint();
                    hasSound = true;
                }
                break;
            case "h":
                if (this.menuClickEnabled) {
                    this.openHelp();
                    hasSound = true;
                }
                break;
            case "s":
                if (this.menuClickEnabled) {
                    this.openSettings();
                    hasSound = true;
                }
                break;
            case "c":
                if (this.menuClickEnabled) {
                    this.openCredit();
                    hasSound = true;
                }
                break;
            case "n":
                this.toggleSound();
                this.canvas.dispatchEvent(new Event("mousemove"));
                hasSound = this.soundOn;
                break;
            case "m":
                this.toggleMusic();
                this.canvas.dispatchEvent(new Event("mousemove"));
                hasSound = this.soundOn;
                break;
        }
        if (hasSound) {
            this.playSound(Minesweeper.clickSound);
        }
    }

    _hint() {
        // reveals something.
        this.timer += 20;
        this.renderTimer();

        let a = 0, b = 0, d = 0;
        let w = Minesweeper.COL, h = Minesweeper.ROW;
        let key = 0, priority = 0;
        for (let i = 0; i < Minesweeper.COL * Minesweeper.ROW; i++) {
            if (this.state[a][b] >= -1) {
                let p = 0;
                if (this.state[a][b] == 0) {
                    p = 3;
                } else {
                    let isAdjacent = false;
                    this.runAround(
                        a, b,
                        (x, y) => {
                            if (this.state[x][y] < -1) {
                            }
                        },
                    );
                    if (isAdjacent) {
                        p = 2;
                    } else if (this.state[a][b] > 0) {
                        p = 1;
                    }
                }
                if (p >= priority) {
                    key = a * Minesweeper.COL + b;
                    priority = p;
                }
            }
            switch (d) {
                case 0:
                    b++;
                    if (b + 1 == w) {
                        d = 1;
                    }
                    break;
                case 1:
                    a++;
                    if (a + 1 == h) {
                        d = 2;
                        h--;
                    }
                    break;
                case 2:
                    b--;
                    if (b == 40 - w) {
                        d = 3
                        w--;
                    }
                    break;
                case 3:
                    a--;
                    if (a == 20 - h) {
                        d = 0;
                    }
                    break;
            }
        }
        
        a = 0 | key / Minesweeper.COL;
        b = key % Minesweeper.COL;
        if (priority > 0) {
            this.reveal(a, b);
        } else {
            while ( this.flags.has(key) ) {
                this.mark(a, b);
            }
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
