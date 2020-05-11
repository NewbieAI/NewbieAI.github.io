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
        this.canvas.setAttribute("class", "screen");
        this.canvas.setAttribute("width", "1600");
        this.canvas.setAttribute("height", "800");
        this.screen = this.canvas.getContext("2d");
        document.body.append(this.canvas);
	
        this.mines = Minesweeper.INITIAL_MINES;
        this.state = [];
        for (let i = 0; i < Minesweeper.ROW; i++) {
            this.state[i] = [];
            for (let j = 0; j < Minesweeper.COL; j++) {
                this.state[i][j] = 0;
                this.render(i, j);
            }
        }
        this.reset();

    }

    reset() {
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
        if (this.state[i][j] != -10) {
            return this.state[i][j] < -10 ? true : false;
        }

        queue = [i, j];
        let k = 0;
        let a, b;
        while (queue.length > k) {
            a = queue[k];
            b = queue[k + 1];
            k += 2;
            if (this.data[i][j] == -10) {
                this.runAround(
                    a, 
                    b,
                    (x, y) => {
                        this.state[x][y] -= 10;
                        queue.push(x, y);
                    }
                );
            }
        }
        return false;
    }

    render(i, j) {
        if (this.state[i][j] >= -1) {
            this.screen.fillStyle = (
                "rgba(" + 
                String(0 + ((Math.random() * 20) | 0)) + ", " +
                String(125 + ((Math.random() * 25) | 0)) + ", " +
                String(200 + ((Math.random() * 50) | 0)) + ", " +
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
        if (this.state[i][j] < -10) {
            // mines, flags, or question mark
        } else {
            // numbers
        }
    }
    
}
