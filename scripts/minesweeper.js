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

        this.leftMouseDown = false;
        this.rightMouseDown = false;

        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("id", "minesweeper");
        this.canvas.setAttribute("class", "screen");
        this.canvas.setAttribute("width", "1600");
        this.canvas.setAttribute("height", "800");
        this.canvas.addEventListener(
            "mousedown",
            (e) => {
                if (e.button == 0) {
                    this.leftMouseDown = true;
                }
                if (e.button == 2) {
                    this.rightMouseDown = true;
                }
            },
        );
        /*
        this.canvas.addEventListener(
            "mouseup",
            (e) => {
                if (e.button == 0) {
                    this.leftMouseDown = false;
                }
                if (e.button == 2) {
                    this.rightMouseDown = false;
                }
            },
        );
        */
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

    endGame() {
        alert("Game Over");
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

        this.flags.delete(`(${i}, ${j})`);
        this.qMarks.delete(`(${i}, ${j})`);
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
                            this.flags.delete(`(${x}, ${y})`);
                            this.qMarks.delete(`(${x}, ${y})`);
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

        let key = `(${i}, ${j})`;
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
                j * 32,
                i * 32,
                32,
                32,
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
                j * 32,
                i * 32,
                32,
                32,
            );
            let key = `(${i}, ${j})`;
            if ( this.flags.has(key) ) {
                this.renderFlag(i, j);
            }
            if ( this.qMarks.has(key) ) {
                this.renderQMark(i, j);
            }
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
            this.screen.font = "36px bold serif";
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
        let x = j * 32;
        let y = i * 32;
        
        if (this.state[i][j] < -1) {
            this.screen.fillStyle = "rgb(255, 0, 0)";
            this.screen.fillRect(x, y, 32, 32);
        }

        this.screen.fillStyle = "rgb(0, 0, 0)";
        this.screen.beginPath();
        this.screen.arc(x + 16, y + 16, 10, 0, 2 * Math.PI);
        this.screen.fill();

   };

    renderFlag(i, j) {
        let x = j * 32;
        let y = i * 32;

        this.screen.beginPath();
        this.screen.fillStyle = "rgb(0, 0, 0)";
        this.screen.moveTo(x + 10, y + 2);
        this.screen.lineTo(x + 10, y + 20);
        this.screen.lineTo(x + 3, y + 25);
        this.screen.lineTo(x + 25, y + 25);
        this.screen.lineTo(x + 12, y + 20);
        this.screen.lineTo(x + 12, y + 2);
        this.screen.fill();
        this.screen.beginPath();
        this.screen.fillStyle = "rgb(255, 0, 0)";
        this.screen.moveTo(x + 12, y + 2);
        this.screen.lineTo(x + 25, y + 15);
        this.screen.lineTo(x + 12, y + 15);
        this.screen.fill();

    }

    renderQMark(i, j) {
        this.screen.fillStyle = "rgb(0, 0, 45)";
        this.screen.font = "32px bold serif";
        this.screen.textAlign = "center";
        this.screen.textBaseline = "middle";
        this.screen.fillText(
            "?",
            j * 32 + 16,
            i * 32 + 16,
        );

    }
    
    clickHandler(e) {
        e.preventDefault();
        let rect = this.canvas.getBoundingClientRect();
        let j = 0 | (e.clientX - rect.x) / 16;
        let i = 0 | (e.clientY - rect.y) / 16;

        if (this.leftMouseDown && this.rightMouseDown) {
            // most complicated action in the game
            //

            if (this.state[i][j] >= -1) {
                return;
            }

            this.runAround(
                i,
                j,
                (a, b) => {
                    let key = `(${a}, ${b})`;
                    if (this.state[a][b] >= -1 &&
                        !this.flags.has(key) &&
                        !this.qMarks.has(key)) {
                        this.reveal(a, b);
                    }
                },
            );
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
