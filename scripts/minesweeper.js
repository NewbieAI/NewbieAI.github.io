"use strict"

// simple class that creates a representation of minesweeper game
// the game will be rendered in an html canvas element

class Minesweeper {
    const ROW = 25;
    const COL = 40;
    const INITIAL_MINES = 75;

    constructor(canvasElement) {
        // the internal game states will be rendered inside the
        // canvas element
        this.canvas = canvasElement;
        this.mines = INITIAL_MINES;
        this.state = [];
        for (let i = 0; i < ROW; i++) {
            this.state.append([]);
            for (let j = 0; j < COL; j++) {
                this.state[i].append(0);
            }
        }
        this.reset();

    }

    reset() {

        let mineCount = INITIAL_MINES;
        let k = 0;
        for (let i = 0; i < ROW; i++) {
            for (let j = 0; j < COL; j++) {
                val = Math.random() * (1000 - k);
                if (val < mineCount) {
                    this.state[i][j] = -1;
                }
                this.runAound(
                    i,
                    j,
                    () => this.state[i][j]++,
                );
                k++;

                this.cover(i, j);
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
            if (a > 0 && a < ROW && b > 0 && b < COL) {
                func(a, b);
            }
        }
    }

    reveal(i, j) {
        // reveals the cell at (i, j)
    }

    cover(i, j) {
        // covers the cell at (i, j)
    }




}
