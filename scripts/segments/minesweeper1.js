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
