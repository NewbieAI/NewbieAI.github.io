"use strict";

// simple class that creates a representation of minesweeper game
// the game will be rendered in an html canvas element

class Minesweeper {
    static ROW = 20;
    static COL = 40;
    static INITIAL_MINES = 160;

    constructor() {
        // the internal game states will be rendered inside the
        // canvas element

        this.leftMouseDown = false;
        this.rightMouseDown = false;
        this.clickedCell = {
            i : -1,
            j : -1,
        }

        this.soundOn = true;
        this.musicOn = true;

        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("id", "minesweeper");
        this.canvas.setAttribute("class", "screen");
        this.canvas.setAttribute("width", "1800");
        this.canvas.setAttribute("height", "800");
      
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
        this.screen = this.canvas.getContext("2d");
        this.screen.lineWidth = 2;
        document.body.append(this.canvas);

        this.state = [];
        this.mines = new Set();
        this.flags = new Set();
        this.qMarks = new Set();
        this.flagCorrect = 0;
        this.explored = 0;
        this.timer = 0;

        this.reset();

    }

    destroy() {
        this.canvas.remove();
    }

    reset() {
        this.flags.clear();
        this.qMarks.clear();
        this.mines.clear();
        this.flagCorrect = 0;
        this.explored = 0;
        this.timer = 0;

        for (let i = 0; i < Minesweeper.ROW; i++) {
            if (this.state.length <= i) {
                this.state[i] = [];
            }
            for (let j = 0; j < Minesweeper.COL; j++) {
                this.state[i][j] = 0;
                this.renderCell(i, j);
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
        this.renderMenu();
        this.timerInterval = setInterval(
            () => {
                this.timer++;
                this.renderTimer();
            },
            1000,
        );
    }

    endGame(isWin = false) {
        clearInterval(this.timerInterval);
        for (let key of this.mines.keys() ) {
            if ( this.flags.has(key) ) {
                continue;
            }
            let i = 0 | key / Minesweeper.COL;
            let j = key % Minesweeper.COL;
            if ( this.qMarks.has(key) ) {
                this.qMarks.delete(key);
                this.renderCell(i, j);
            }

            if (this.state[i][j] == -1) {
                this.renderMine(i, j);
            }
        }
        for (let key of this.flags.keys()) {
            let i = 0 | key / Minesweeper.COL;
            let j = key % Minesweeper.COL;
            this.renderCheck(i, j);
        }

        if (isWin) {
            alert("Congratulations! You won.");
        } else {
            
        }
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
            if (this.state[i][j] == -11) {
                this.renderMine(i, j);
            } else {
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
    }
    
    removeHighlight() {
        this.screen.strokeStyle = "rgb(255, 255, 255)";
        this.screen.strokeRect(
            this.cellWidth * this.clickedCell.j,
            this.cellHeight * this.clickedCell.i,
            this.cellWidth,
            this.cellHeight,
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

        this.renderEmoji();
        this.renderMineCounter();
        this.renderTimer();
        this.renderButtons();
        
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
            "All rights reserved",
            1700,
            690,
        );

        this.renderSoundIcon(true, false);
        this.renderMusicIcon(true, false);
    }

    renderEmoji(){
        let x = 1650, y = 25;
        let w = 100, h = 100;
        this.screen.strokeRect(x, y, w, h);
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

    renderButtons(selected = -1) {
        this.screen.shadowOffsetX = 10;
        this.screen.shadowOffsetY = 5;
        this.screen.shadowBlur = 5;
        this.screen.shadowColor = "rgb(55, 55, 55)";
        this.screen.textAlign = "left";
        this.screen.textBaseline = "bottom";

        let buttons = [
            "New Game",
            "Help",
            "Settings",
            "Credit",
            "Exit",
        ];


        for (let i = 0; i < 5; i++) {
            if (i == selected) {
                this.screen.fillStyle = "rgb(100, 100, 150)";
                this.screen.font = "bold small-caps 36px serif";
            } else {
                this.screen.fillStyle = "rgb(0, 0, 0)";
                this.screen.font = "bold small-caps 36px serif";
            }
            this.screen.fillText(
                buttons[i],
                1625,
                400 + 50 * i,
            );
        }

        this.screen.shadowOffsetX = 0;
        this.screen.shadowOffsetY = 0;
        this.screen.shadowBlur = 0;

    }

    renderSoundIcon(isOn, isHighlight) {
        let x = 1620, y = 720;
        let w = 70, h = 70;
        this.screen.clearRect(x, y, w, h);
        this.screen.fillStyle = "rgba(255, 155, 0, 0.4)";
        this.screen.fillRect(x, y, w, h);

        if (isHighlight) {
            this.screen.fillStyle = "rgb(255, 0, 0)";
            this.screen.strokeStyle = "rgb(255, 0, 0)";
        } else {
            this.screen.fillStyle = "rgb(0, 0, 0)";
            this.screen.strokeStyle = "rgb(0, 0, 0)";
        }

        this.screen.beginPath();
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
        this.screen.lineWidth = 2;
    }

    renderMusicIcon(isOn, isHighlight) {
        let x = 1710, y = 720;
        let w = 70, h = 70;
        this.screen.clearRect(x, y, w, h);
        this.screen.fillStyle = "rgba(255, 155, 0, 0.4)";
        this.screen.fillRect(x, y, w, h);

        if (isHighlight) {
            this.screen.fillStyle = "rgb(255, 0, 0)";
        } else {
            this.screen.fillStyle = "rgb(0, 0, 0)";
        }

        this.screen.beginPath();
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

    }

    toggleSound() {
        this.soundOn = !this.soundOn;
        this.renderSoundIcon(this.soundOn, true);
    }

    toggleMusic() {
        this.musicOn = !this.musicOn;
        this.renderMusicIcon(this.musicOn, true);
    }
    
    clickHandler(e) {
        e.preventDefault();
        let rect = this.canvas.getBoundingClientRect();

        if (e.clientX - rect.x > 800) {
            this.menuClick(
                e.clientX - rect.x,
                e.clientY - rect.y,
            );
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
        if (this.flagCorrect == this.flags.size &&
            this.flagCorrect + this.explored == gridSize) {
            this.endGame(true);
        }
       
    }

    mousedownHandler(e) {
        let rect = this.canvas.getBoundingClientRect();
        let j = 0 | (e.clientX - rect.x) / (this.cellWidth / 2);
        let i = 0 | (e.clientY - rect.y) / (this.cellHeight / 2);

        this.clickedCell.i = i;
        this.clickedCell.j = j;
        if (e.button == 0) {
            this.leftMouseDown = true;
            if (this.state[i][j] < -1 && this.rightMouseDown) {
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
            if (this.state[i][j] < -1 && this.leftMouseDown) {
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

    menuClick() {
    }

    leftClickCell(i, j) {
        if (!this.leftMouseDown || 
            i != this.clickedCell.i || 
            j != this.clickedCell.j) {
            return;
        }

        if (this.state[i][j] >= -1) {
            if ( this.reveal(i, j) ) {
                this.endGame();
            }
        }
    }

    rightClickCell(i, j) {
        if (!this.rightMouseDown || 
            i != this.clickedCell.i || 
            j != this.clickedCell.j) {
            return;
        }

        if (this.state[i][j] < -1) {
            return;
        }

        this.mark(i, j);
        this.renderMineCounter();
    }

    dualClickCell(i, j) {
        if (!this.leftMouseDown || !this.rightMouseDown) {
            return;
        }

        if (this.state[i][j] >= -1) {
            return;
        }

        let triggered = false;
        this.runAround(
            i,
            j,
            (a, b) => {
                let key = a * Minesweeper.COL + b;
                if (this.state[a][b] >= -1 &&
                    !this.flags.has(key) &&
                    !this.qMarks.has(key)) {
                    if ( this.reveal(a, b) ) {
                        triggered = true;
                    }
                }
            },
        );
        if (triggered) {
            this.endGame();
        }
    } 

    _solve() {
        // solves the current game
        for (let i = 0; i < Minesweeper.ROW; i++) {
            for (let j = 0; j < Minesweeper.COL; j++) {
                if (this.state[i][j] >= 0) {
                    this.reveal(i, j);
                } else if (this.state[i][j] == -1) {
                    this.mark(i, j);
                }
            }
        }
        this.endGame(true);
    }
}
