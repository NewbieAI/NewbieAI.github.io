class Minesweeper {

    static EASY = 80;
    static MEDIUM = 120;
    static HARD = 160;
    static INSANE = 200;

    constructor() {
        //...

        this.state = [];
        this.mines = new Set();
        this.flags = new Set();
        this.qMarks = new Set();
        this.flagCorrect = 0;
        this.explored = 0;
        this.timer = 0;

        //...
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
        for (let m = 0; m < this.difficulty; m++) {
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

}
