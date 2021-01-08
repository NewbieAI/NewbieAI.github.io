    animateStart() {
        return new Promise(
            (resolve) => {
                let arr = [];
                let size = Minesweeper.ROW * Minesweeper.COL;
                for (let i = 0; i < size; i++) { 
                    arr[i] = i;
                }
                let index, tmp;
                for (let i = 0; i < size; i++) {
                    index = i + (0 | Math.random() * (size - i));
                    tmp = arr[index];
                    arr[index] = arr[i]
                    arr[i] = tmp;
                }

                let frame = 0;
                let animation = setInterval(
                    () => {
                        let size = Minesweeper.ROW * Minesweeper.COL;
                        for (let i = frame * Minesweeper.COL; 
                            i < (frame + 1) * Minesweeper.COL; 
                            i++) {
                            let a = 0 | arr[i % size] / Minesweeper.COL;
                            let b = arr[i % size] % Minesweeper.COL
                            if (frame < Minesweeper.ROW) {
                                this.screen.fillStyle = "white";
                                this.screen.fillRect(
                                    b * this.cellWidth,
                                    a * this.cellHeight,
                                    this.cellWidth,
                                    this.cellHeight,
                                );
                            } else {
                                this.renderCell(a, b);
                            }
                        }
                        if (++frame == 2 * Minesweeper.ROW) {
                            clearInterval(animation);
                            resolve();
                        }
                    },
                    25,
                );
            },
        );
    }

    animateVictory() {
        return new Promise(
            (resolve) => {
                this.currentMusic.pause();
                this.playSound(Minesweeper.victorySound);
                let y = -100, h = 100, i = 0;
                let savedFrame = this.screen.getImageData(
                    0, 0, 1600, 800,
                );
                let animation = setInterval(
                    () => {
                        this.screen.putImageData(savedFrame, 0, 0);
                        if (y >= i * this.cellHeight && 
                            i < Minesweeper.ROW) {
                            let key = i * Minesweeper.COL;
                            for (let j = 0; j < Minesweeper.COL; j++) {
                                if ( this.flags.has(key++) ) {
                                    this.renderCheck(i, j);
                                }
                            }
                            i++;
                        }
                        savedFrame = this.screen.getImageData(
                            0, 0, 1600, 800,
                        );
                        let g = this.screen.createLinearGradient(
                            0, y - h,
                            0, y + h,
                        );
                        g.addColorStop(0, "rgba(255, 255, 255, 0)");
                        g.addColorStop(0.5, "rgba(255, 255, 255, 0.5)");
                        g.addColorStop(1.0, "rgba(255, 255, 255, 0)");
                        this.screen.fillStyle = g;
                        this.screen.fillRect(0, y - h, 1600, 2 * h);
                        y += 16;
                        if (y - h > 800) {
                            clearInterval(animation);
                            this.renderEmoji(Minesweeper.coolFace);
                            resolve();
                        }
                    },
                    10,
                );
            },
        );
    }
    
    animateDefeat() {
        return new Promise(
            (resolve) => {
                this.currentMusic.pause();
                let explosions = [];
                let a, b;
                for (let m of this.mines.keys()) {
                    if ( !this.flags.has(m) ) {
                        let a = 0 | m / Minesweeper.COL;
                        let b = m % Minesweeper.COL;
                        explosions.push(a, b);
                    }
                }
                let frame = 0;
                let savedFrame = this.screen.getImageData(
                    0, 0, 1800, 800,
                );
                this.playSound(Minesweeper.explosionSound);
                let animation = setInterval(
                    () => {
                        this.screen.putImageData(savedFrame, 0, 0);
                        if (frame == 64) {
                            for (let key of this.flags.keys()) {
                                this.renderCheck(
                                    0 | key / Minesweeper.COL, 
                                    key % Minesweeper.COL,
                                );
                            }
                            clearInterval(animation);
                            this.renderEmoji(Minesweeper.sadFace);
                            resolve();
                            return;
                        } else if (frame == 10) {
                            for (let i = 0; i < explosions.length; i+=2) {
                                this.renderMine(
                                    explosions[i], 
                                    explosions[i + 1],
                                );
                            }
                            savedFrame = this.screen.getImageData(
                                0, 0, 1800, 800,
                            );
                        }
                        for (let i = 0; i < explosions.length; i+=2) {
                            let x = explosions[i] - 2;
                            let y = explosions[i + 1] - 2;
                            this.screen.drawImage(
                                Minesweeper.explosionFrames,
                                512 * (frame % 8),
                                512 * (0 | frame / 8),
                                512,
                                512,
                                y * this.cellWidth,
                                x * this.cellHeight,
                                5 * this.cellWidth,
                                5 * this.cellHeight,
                            );
                        }
                        frame += frame < 32 ? 1 : 2;
                    },
                    20,
                );
            },
        );
    }
    
    animateCredit() {
        this.renderButtons(3, false, false);
        let credits;
        fetch("resources/JSON/credit.json").then(
            response => response.json()
        ).then(
            data => {
                credits = data;
            }
        );

        return new Promise(
            (resolve) => {
                let frame = 0;
                let x = 800, ystart = 800;
                this.screen.textAlign = "center";
                this.screen.textBaseline = "top";
                let imgData = this.screen.getImageData(
                    0, 0, 1600, 800,
                );
                let animation = setInterval(
                    () => {
                        this.screen.fillStyle = "rgb(0, 0, 0)";
                        if (frame < 20) {
                            this.screen.fillRect(0, 0, 1600, 800);
                            this.screen.putImageData(
                                imgData,
                                -frame * 20, 0,
                                frame * 20, 0,
                                800 - frame * 20, 800,
                            );
                            this.screen.putImageData(
                                imgData,
                                frame * 20, 0,
                                800, 0,
                                800 - frame * 20, 800,
                            );
                        } else if (frame < 1500) {
                            this.screen.fillRect(400, 0, 800, 800);
                            let y = ystart;
                            for (let line of credits) {
                                if (y > 800) {
                                    break;
                                }
                                this.screen.font = line[0];
                                this.screen.fillStyle = line[1];
                                this.screen.fillText(line[2], x, y);
                                y += line[3];
                            }
                            ystart -= 2;
                        } else if (frame <= 1520) {
                            this.screen.fillRect(0, 0, 1600, 800);
                            this.screen.putImageData(
                                imgData,
                                -(1520 - frame) * 20, 0,
                                (1520 - frame) * 20, 0,
                                800 - (1520 - frame) * 20, 800,
                            );
                            this.screen.putImageData(
                                imgData,
                                (1520 - frame) * 20, 0,
                                800, 0,
                                800 - (1520 - frame) * 20, 800,
                            );
                        } else {
                            clearInterval(animation);
                            resolve();
                        }
                        frame++;
                    },
                    25,
                );
            }
        );
    }
