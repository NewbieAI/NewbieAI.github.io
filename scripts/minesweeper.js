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

        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("id", "minesweeper");
        this.canvas.setAttribute("class", "screen");
        this.canvas.setAttribute("width", "1600");
        this.canvas.setAttribute("height", "800");
        this.cellWidth = 1600 / Minesweeper.COL;
        this.cellHeight = 800 / Minesweeper.ROW;
        this.canvas.addEventListener(
            "mousedown",
            (e) => {
                let rect = this.canvas.getBoundingClientRect();
                let j = 0 | (e.clientX - rect.x) / (this.cellWidth / 2);
                let i = 0 | (e.clientY - rect.y) / (this.cellHeight / 2);

                if (e.button == 0) {
                    this.leftMouseDown = true;
                    this.screen.save();
                    if (this.rightMouseDown) {
                    }
                }
                if (e.button == 2) {
                    this.rightMouseDown = true;
                    if (this.leftMouseDown) {
                    }
                }
            },
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
        document.body.append(this.canvas);
	
        this.state = [];
        this.mines = new Set();
        this.flags = new Set();
        this.qMarks = new Set();
        this.flagTotal = 0;
        this.flagCorrect = 0;
        
        this.reset();

    }

    destroy() {
        this.canvas.remove();
    }

    reset() {
        this.flags.clear();
        this.qMarks.clear();
        this.mines.length = 0;

        for (let i = 0; i < Minesweeper.ROW; i++) {
            this.state[i] = [];
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
    }

    endGame(isWin = false) {
        if (isWin) {
            alert("Congratulations! You won.");
        } else {
            for (let key of this.mines.keys()) {
                let i = 0 | key / Minesweeper.COL;
                let j = key % Minesweeper.COL;
                if (key in this.qMarks) {
                    this.flags.delete(key);
                    this.renderCell(i, j);
                }
                this.renderMine(i, j);
            }
            for (let key of this.flags.keys()) {
                let i = 0 | key / Minesweeper.COL;
                let j = key % Minesweeper.COL;
                this.renderCheck(i, j);
            }
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
        let key = i * Minesweeper.COL + j;
        this.flags.delete(key);
        this.qMarks.delete(key);
        this.state[i][j] -= 10;
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
                            key = x * Minesweeper.COL + y;
                            this.flags.delete(key);
                            this.qMarks.delete(key);
                            this.state[x][y] -= 10;
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
        if (this.state[i][j] < -1) {
            return;
        }

        let key = i * Minesweeper.COL + j;
        if ( this.flags.has(key) ) {
            this.flags.delete(key);
            this.qMarks.add(key);
        } else if ( this.qMarks.has(key) ) {
            this.qMarks.delete(key);
        } else {
            this.flags.add(key);
        }

        this.renderCell(i, j);
    }

    renderCell(i, j) {

        if (this.state[i][j] >= -1) {
            this.screen.clearRect(
                j * this.cellWidth,
                i * this.cellHeight,
                this.cellWidth,
                this.cellHeight,
            );
            this.screen.fillStyle = (
                "rgba(" + 
                String(0 + ((Math.random() * 20) | 0)) + ", " +
                String(125 + ((Math.random() * 20) | 0)) + ", " +
                String(200 + ((Math.random() * 20) | 0)) + ", " +
                String(0.5 + (Math.random() * 0.2)) +
                ")"
            );
            this.screen.fillRect(
                j * this.cellWidth,
                i * this.cellHeight,
                this.cellWidth,
                this.cellHeight,
            );
            let key = i * Minesweeper.COL + j;
            if ( this.flags.has(key) ) {
                this.renderFlag(i, j);
            }
            if ( this.qMarks.has(key) ) {
                this.renderQMark(i, j);
            }
        } else {

            if (this.state[i][j] == -11) {
                this.renderMine(i, j);
            } else {
                this.renderDigit(i, j);
            }
        }
        this.screen.strokeStyle = "white";
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
            "rgb(0, 55, 110)",
            "rgb(55, 110, 220)",
            "rgb(55, 220, 110)",
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

    renderMine(i, j, triggered = false) {
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
        this.screen.fillStyle = "rgb(0, 0, 0)";
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
        this.screen.fillStyle = "rgb(255, 55, 0)";
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
        this.screen.fillStyle = "rgb(0, 0, 45)";
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
        this.screen.lineWidth = 2;
        let x = j * this.cellWidth;
        let y = i * this.cellHeight;
        //this.screen.beginPath();
        if (this.state[i][j] == -1) {
            this.screen.strokeStyle = "green";
        } else {
            this.screen.strokeStyle = "red";
        }
        //this.screen.stroke();
        this.screen.lineWidth = 1;
    }

    highlight(i, j) {
        this.screen.strokeStyle = "orange";
        this.screen.strokeRect(
            this.cellWidth * j,
            this.cellHeight * i,
            this.cellWidth,
            this.cellHeight,
        );
    }
    
    clickHandler(e) {
        e.preventDefault();
        let rect = this.canvas.getBoundingClientRect();
        let j = 0 | (e.clientX - rect.x) / (this.cellWidth / 2);
        let i = 0 | (e.clientY - rect.y) / (this.cellHeight / 2);

        if (this.leftMouseDown && this.rightMouseDown) {
            // most complicated action in the game

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

        } else if (this.leftMouseDown) {
            if (this.state[i][j] >= -1) {
                if ( this.reveal(i, j) ) {
                    this.endGame();
                }
            }
        } else if (this.rightMouseDown) {
            this.mark(i, j);
        }
        this.leftMouseDown = false;
        this.rightMouseDown = false;
       
    }
}
