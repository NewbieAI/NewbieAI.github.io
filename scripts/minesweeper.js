"use strict";

// simple class that creates a representation of minesweeper game
// the game will be rendered in an html canvas element

class Minesweeper {
    static ROW = 25;
    static COL = 50;
    static INITIAL_MINES = 250;

    constructor(canvasContext) {
        // the internal game states will be rendered inside the
        // canvas element
        this.screen = canvasContext;
        this.mines = Minesweeper.INITIAL_MINES;
        this.data = [];
        this.state = [];
        for (let i = 0; i < Minesweeper.ROW; i++) {
            this.data[i] = [];
            this.state[i] = [];
            for (let j = 0; j < Minesweeper.COL; j++) {
                this.data[i][j] = 0;
                this.state[i][j] = 0;
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

        let k = 0;
        for (let i = 0; i < Minesweeper.ROW; i++) {
            for (let j = 0; j < Minesweeper.COL; j++) {
                this.hide(i, j);
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
        // uses dfs to recursive reveal
        // adjacent cells. however if the 
        // grid is very large, iterative
        // technique will be preferred.
        if (this.state[i][j] > 0) {
            return;
        }

        this.state[i][j] = 1;
        if (this.data[i][j] == 0) {
            this.runAround(
                i, j,
                this.reveal
            );
        }
    }

    hide(i, j) {
        // covers the cell at (i, j)
        this.state[i][j] = 0;
    }


    mark(i, j, val) {
        // mark the cell at (i, j) as specified val
    }


}
