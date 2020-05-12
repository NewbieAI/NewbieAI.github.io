"use strict";

// simple class that creates a representation of minesweeper game
// the game will be rendered in an html canvas element

class Minesweeper {
    static ROW = 25;
    static COL = 50;
    static INITIAL_MINES = 250;

    constructor() {
        // the internal game states will be rendered inside the
        // canvas element

        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("id", "minesweeper");
        this.canvas.setAttribute("class", "screen");
        this.canvas.setAttribute("width", "1600");
        this.canvas.setAttribute("height", "800");
        this.canvas.addEventListener(
            "click",
            this.clickHandler.bind(this),
        );
        this.canvas.addEventListener(
            "contextmenu",
            (e) => {
                //e.stopPropagation();
                e.preventDefault();
                return false;
            }
        );

        this.screen = this.canvas.getContext("2d");
        document.body.append(this.canvas);
	
        this.mines = Minesweeper.INITIAL_MINES;
        this.state = [];
        this.flags = new Set();
        this.qMarks = new Set();
        
        this.reset();

    }

    destroy() {
        this.canvas.remove();
    }

    reset() {
        this.flags.clear();
        this.qMarks.clear();

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

            x = (tmp / Minesweeper.COL) | 0;
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
                        if (this.state[x][y] >= 0) {
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
        this.renderCell(i, j);
    }

    renderCell(i, j) {
        if (this.state[i][j] >= -1) {
            this.screen.fillStyle = (
                "rgba(" + 
                String(0 + ((Math.random() * 20) | 0)) + ", " +
                String(125 + ((Math.random() * 20) | 0)) + ", " +
                String(200 + ((Math.random() * 20) | 0)) + ", " +
                String(0.5 + (Math.random() * 0.2)) +
                ")"
            );
            this.screen.fillRect(
                j * 32,
                i * 32,
                32,
                32,
            );
            return;
        }
        if (this.state[i][j] == -11) {
            this.renderMine(i, j);
        } else {
            this.renderDigit(i, j);
        }
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
            j * 32,
            i * 32,
            32,
            32,
        );

        let n = this.state[i][j] + 10;
        if (n > 0) {
            this.screen.fillStyle = color[n];
            this.screen.font = "32px bold serif";
            this.screen.textAlign = "center";
            this.screen.textBaseline = "middle";
            this.screen.fillText(
                String(n),
                j * 32 + 16,
                i * 32 + 16,
            );
        }
    }

    renderMine(i, j) {
        alert("rendering mine");
    };

    renderFlag(i, j) {
        alert("rendering flag");
    }

    renderQuestionMark(i, j) {
        alert("rendering question mark");
    }
    
    clickHandler(e) {
        e.preventDefault();
        let rect = this.canvas.getBoundingClientRect();
        let j = 0 | (e.clientX - rect.x) / 16;
        let i = 0 | (e.clientY - rect.y) / 16;

        if (this.state[i][j] >= -1) {
            let isGameEnded = this.reveal(i, j);
        }
    }
}
