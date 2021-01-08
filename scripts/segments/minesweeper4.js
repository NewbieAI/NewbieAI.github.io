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

        } else if (this.settingsOpen) {

            this.settingsClick();

        } else if (this.cellClickEnabled) {

            let j = 0 | (e.clientX - rect.x) / (this.cellWidth / 2);
            let i = 0 | (e.clientY - rect.y) / (this.cellHeight / 2);

            if (this.leftMouseDown && this.rightMouseDown) {
                
                this.dualClickCell(i, j);

            } else if (this.leftMouseDown) {
                
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

        if ( this.reveal(i, j) ) {
            this.endGame();
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
