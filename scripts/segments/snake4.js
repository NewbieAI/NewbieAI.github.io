    renderBackground() {
        let p1 = this.screen.createPattern(Snake.pattern1, "");
        this.screen.fillStyle = p1;
        this.screen.fillRect(0, 0, 1800, 800);
        this.screen.fillStyle = "rgb(20, 20, 30)";
        this.screen.fillRect(300, 100, 1200, 600);
        

        this.screen.fillStyle = this.screen.createPattern(
            Snake.patternIron, "",
        );
        this.screen.strokeStyle = this.screen.createPattern(
            Snake.patternBronze, "",
        );
        this.screen.lineWidth = 5;
        this.screen.fillRect(1550, 100, 200, 75);
        this.screen.fillRect(1550, 400, 200, 75);
        this.screen.strokeRect(1550, 100, 200, 75);
        this.screen.strokeRect(1550, 400, 200, 75);

        this.screen.beginPath();
        this.screen.ellipse(1680, 215, 60, 25, 0, 0, Math.PI * 2);
        this.screen.fill();
        this.screen.stroke();
        this.screen.beginPath();
        this.screen.ellipse(1680, 280, 60, 25, 0, 0, Math.PI * 2);
        this.screen.fill();
        this.screen.stroke();
        this.screen.beginPath();
        this.screen.ellipse(1680, 345, 60, 25, 0, 0, Math.PI * 2);
        this.screen.fill();
        this.screen.stroke();

        this.screen.beginPath();
        this.screen.ellipse(1680, 515, 60, 25, 0, 0, Math.PI * 2);
        this.screen.fill();
        this.screen.stroke();
        this.screen.beginPath();
        this.screen.ellipse(1680, 580, 60, 25, 0, 0, Math.PI * 2);
        this.screen.fill();
        this.screen.stroke();
        this.screen.beginPath();
        this.screen.ellipse(1680, 645, 60, 25, 0, 0, Math.PI * 2);
        this.screen.fill();
        this.screen.stroke();

        this.screen.fillStyle = this.screen.strokeStyle;
        this.screen.lineWidth = 1;
        this.screen.textAlign = "center";
        this.screen.textBaseline = "middle";
        this.screen.font = "small-caps 32px Gerogia";
        this.screen.fillText(
            "Game Speed",
            1650, 140,
        );
        this.screen.fillText(
            "Game Size",
            1650, 440,
        );
        this.screen.font = "28px Gerogia";
        this.screen.fillText(
            "slow",
            1680, 215,
        );
        this.screen.fillText(
            "normal",
            1680, 280,
        );
        this.screen.fillText(
            "fast",
            1680, 345,
        );
        this.screen.fillText(
            "small",
            1680, 515,
        );
        this.screen.fillText(
            "normal",
            1680, 580,
        );
        this.screen.fillText(
            "large",
            1680, 645,
        );

        this.screen.fillStyle = this.screen.createPattern(
            Snake.pattern3, "",
        );
        this.screen.fillRect(295, 95, 1210, 5);
        this.screen.fillRect(295, 95, 5, 610);
        this.screen.fillRect(1500, 95, 5, 610);
        this.screen.fillRect(295, 700, 1210, 5);
    }

    _renderHead() {
        let p = this.screen.createPattern(this.currentBody, "");

        let x = 300 + this.cellSize / 2;
        let y = 100 + this.cellSize / 2;
        let ratio = this.currentFrame / this.frames;
        let iHead = this.body[this.headIndex];
        let jHead = this.body[this.headIndex + 1];
        let i1 = this.body[
            (this.headIndex + this.qsize - 2) % this.qsize
        ];
        let j1 = this.body[
            (this.headIndex + this.qsize - 1) % this.qsize
        ];
        let i2 = this.body[
            (this.headIndex + this.qsize - 4) % this.qsize
        ];
        let j2 = this.body[
            (this.headIndex + this.qsize - 3) % this.qsize
        ];

        let ox, oy, beta;

        this.screen.strokeStyle = p;
        this.screen.beginPath();
        if ((iHead == i1 && i1 == i2) || 
            (jHead == j1 && j1 == j2)) {
            let x1 = x + (j1 + j2) * this.cellSize / 2;
            let y1 = y + (i1 + i2) * this.cellSize / 2;
            ox = x1 + (j1 - j2) * this.cellSize * ratio;
            oy = y1 + (i1 - i2) * this.cellSize * ratio;
            this.screen.moveTo(x1, y1);
            this.screen.lineTo(ox, oy);
            beta = (
                i1 == i2 ? 
                Math.PI * (j1 < j2) :
                -Math.PI / 2 + Math.PI * (i1 > i2)
            );
        } else {
            let theta1 = (
                i1 == i2 ?
                Math.PI / 2 - Math.PI * (i1 < iHead) :
                Math.PI * (j1 < jHead)
            );
            let theta2 = theta1 + ratio * Math.PI / 2 * (
                i1 == i2 ?
                2 * (j1 > j2 ^ i1 > iHead)  - 1 :
                1 - 2 * (i1 > i2 ^ j1 > jHead)
            );
            let cx = x + (j2 + jHead) * this.cellSize / 2;
            let cy = y + (i2 + iHead) * this.cellSize / 2;
            this.screen.arc(
                cx, cy,
                this.cellSize / 2,
                theta1, theta2,
                theta1 > theta2,
            );
            ox = cx + Math.cos(theta2) * this.cellSize / 2;
            oy = cy + Math.sin(theta2) * this.cellSize / 2;
            beta = theta2 + (
                (i1 - i2) * (jHead - j1) - (j1 - j2) * (iHead - i1) > 0 ? 
                -Math.PI / 2 : Math.PI / 2
            );
        }
        this.screen.stroke();

        let xl = this.cellSize * 0.3 * Math.cos(beta + Math.PI / 2);
        let yl = this.cellSize * 0.3 * Math.sin(beta + Math.PI / 2);
        let xr = this.cellSize * 0.3 * Math.cos(beta - Math.PI / 2);
        let yr = this.cellSize * 0.3 * Math.sin(beta - Math.PI / 2);
        let xm = this.cellSize * Math.cos(beta);
        let ym = this.cellSize * Math.sin(beta);

        this.screen.beginPath();
        this.screen.moveTo(
            ox + xl,
            oy + yl,
        );
        this.screen.bezierCurveTo(
            ox + xl + 0.1 * xm,
            oy + yl + 0.1 * ym,
            ox + 1.5 * xl + 0.3 * xm,
            oy + 1.5 * yl + 0.3 * ym,
            ox + 1.2 * xl + 0.5 * xm,
            oy + 1.2 * yl + 0.5 * ym,
        );
        this.screen.quadraticCurveTo(
            ox + xm,
            oy + ym,
            ox + 1.2 * xr + 0.5 * xm,
            oy + 1.2 * yr + 0.5 * ym,
        );
        this.screen.bezierCurveTo(
            ox + 1.5 * xr + 0.3 * xm,
            oy + 1.5 * yr + 0.3 * ym,
            ox + xr + 0.1 * xm,
            oy + yr + 0.1 * ym,
            ox + xr,
            oy + yr,
        );
        this.screen.fill();

        this.screen.beginPath();
        this.screen.fillStyle = "gold";
        this.screen.ellipse(
            ox + 0.7 * xl + 0.5 * xm,
            oy + 0.7 * yl + 0.5 * ym,
            this.cellSize * 0.15, 
            this.cellSize * 0.15,
            beta,
            0, Math.PI * 2,
        );
        this.screen.ellipse(
            ox + 0.7 * xr + 0.5 * xm,
            oy + 0.7 * yr + 0.5 * ym,
            this.cellSize * 0.15, 
            this.cellSize * 0.15,
            beta,
            0, Math.PI * 2,
        );
        this.screen.fill();

        this.screen.beginPath();
        this.screen.fillStyle = "black";
        this.screen.ellipse(
            ox + 0.7 * xl + 0.6 * xm,
            oy + 0.7 * yl + 0.6 * ym,
            this.cellSize * 0.1, 
            this.cellSize * 0.1,
            beta,
            0, Math.PI * 2,
        );
        this.screen.ellipse(
            ox + 0.7 * xr + 0.6 * xm,
            oy + 0.7 * yr + 0.6 * ym,
            this.cellSize * 0.1, 
            this.cellSize * 0.1,
            beta,
            0, Math.PI * 2,
        );
        this.screen.fill();
    }

    _renderTail() {
        let p = this.screen.createPattern(this.currentBody, "");

        let x = 300 + this.cellSize / 2;
        let y = 100 + this.cellSize / 2;
        let ratio = (
            this.isGrowing ? 0 : 1 - this.currentFrame / this.frames
        );
        let i1 = this.body[this.tailIndex];
        let j1 = this.body[this.tailIndex + 1];
        let i2 = this.body[(this.tailIndex + 2) % this.qsize];
        let j2 = this.body[(this.tailIndex + 3) % this.qsize];

        let ox, oy, beta;

        this.screen.strokeStyle = p;
        this.screen.lineWidth = this.cellSize * 0.6;
        this.screen.beginPath();
        if ((this.tailPrev.i == i1 && i1 == i2) || 
            (this.tailPrev.j == j1 && j1 == j2)) {
            let x1 = x + (j1 + j2) * this.cellSize / 2;
            let y1 = y + (i1 + i2) * this.cellSize / 2;
            ox = x1 + (j1 - j2) * this.cellSize * ratio;
            oy = y1 + (i1 - i2) * this.cellSize * ratio;
            this.screen.moveTo(x1, y1);
            this.screen.lineTo(ox, oy);
            beta = (
                i1 == i2 ? 
                Math.PI * (j1 < j2) :
                Math.PI / 2 - Math.PI * (i1 < i2)
            );
        } else {
            let theta1 = (
                i1 == i2 ?
                Math.PI / 2 - Math.PI * (i1 < this.tailPrev.i) :
                Math.PI * (j1 < this.tailPrev.j)
            );
            let theta2 = theta1 + ratio * Math.PI / 2 * (
                i1 == i2 ?
                2 * (j1 > j2 ^ i1 > this.tailPrev.i) - 1 :
                1 - 2 * (i1 > i2 ^ j1 > this.tailPrev.j)
            );
            let cx = x + (this.tailPrev.j + j2) * this.cellSize / 2;
            let cy = y + (this.tailPrev.i + i2) * this.cellSize / 2;
            this.screen.arc(
                cx, cy,
                this.cellSize / 2,
                theta1, theta2,
                theta1 > theta2,
            );
            ox = cx + Math.cos(theta2) * this.cellSize / 2;
            oy = cy + Math.sin(theta2) * this.cellSize / 2;
            beta = theta2 + Math.PI / 2 * (
                (i1 - i2) * (this.tailPrev.j - j1) - 
                (j1 - j2) * (this.tailPrev.i - i1) > 0 ? 
                -1 : 1
            );
        }
        this.screen.stroke();

        let xl = this.cellSize * 0.3 * Math.cos(beta + Math.PI / 2);
        let yl = this.cellSize * 0.3 * Math.sin(beta + Math.PI / 2);
        let xr = this.cellSize * 0.3 * Math.cos(beta - Math.PI / 2);
        let yr = this.cellSize * 0.3 * Math.sin(beta - Math.PI / 2);
        let xm = this.cellSize * 0.8 * Math.cos(beta);
        let ym = this.cellSize * 0.8 * Math.sin(beta);

        this.screen.fillStyle = p;
        this.screen.beginPath();
        this.screen.moveTo(
            ox + xl,
            oy + yl,
        );
        this.screen.bezierCurveTo(
            ox + xl + xm / 2,
            oy + yl + ym / 2,
            ox + xm / 2,
            oy + ym / 2,
            ox + xm,
            oy + ym,
        );
        this.screen.bezierCurveTo(
            ox + xm / 2,
            oy + ym / 2,
            ox + xr + xm / 2,
            oy + yr + ym / 2,
            ox + xr,
            oy + yr,
        );
        this.screen.fill();
    }

    renderSnake() {

        this._renderTail();
        
        this.screen.lineWidth = this.cellSize * 0.6;
        let p = this.screen.createPattern(this.currentBody, "");
        let x = 300 + this.cellSize/ 2;
        let y = 100 + this.cellSize/ 2;
        this.screen.strokeStyle = p;
        
        let iPrev = this.tailIndex;
        let i = (iPrev + 2) % this.qsize;
        let iNext = (i + 2) % this.qsize;

        this.screen.beginPath();
        this.screen.moveTo(
            x + (this.body[i + 1] + this.body[iPrev + 1]) * 
            this.cellSize / 2,
            y + (this.body[i] + this.body[iPrev]) * 
            this.cellSize / 2,
        );
        while (iNext != this.headIndex) {

            if ((this.body[iPrev] == this.body[i] && 
                this.body[i] == this.body[iNext]) || 
                (this.body[iPrev + 1] == this.body[i + 1] && 
                this.body[i + 1] == this.body[iNext + 1])) {

                this.screen.lineTo(
                    x + (this.body[i + 1] + this.body[iNext + 1]) * 
                    this.cellSize / 2,
                    y + (this.body[i] + this.body[iNext]) * 
                    this.cellSize / 2,
                );

            } else {

                this.screen.arcTo(
                    x + this.body[i + 1] * this.cellSize,
                    y + this.body[i] * this.cellSize,
                    x + this.body[iNext + 1] * this.cellSize,
                    y + this.body[iNext] * this.cellSize,
                    this.cellSize / 2,
                );

            }

            iPrev = i;
            i = iNext;
            iNext = (i + 2) % this.qsize;
        }
        this.screen.stroke();

        this._renderHead();
    }

    renderFood() {
        if ( this.bodySet.has(this.food.i * this.col + this.food.j) ) {
            this.screen.globalAlpha = 1 - this.currentFrame / this.frames;
        }
        this.screen.drawImage(
            this.food.img,
            300 + this.food.j * this.cellSize, 
            100 + this.food.i * this.cellSize, 
            this.cellSize, 
            this.cellSize,
        );
        this.screen.globalAlpha = 1.0;
        if (this.bodySet.has(this.food.bonusIndex)) {
            this.screen.globalAlpha -= this.currentFrame / this.frames;
        }
        if (this.food.bonusIndex >= 0) {
            this.screen.drawImage(
                Snake.bonusFood,
                300 + this.cellSize * 
                (this.food.bonusIndex % this.col),
                100 + this.cellSize *
                (0 | this.food.bonusIndex / this.col),
                this.cellSize,
                this.cellSize,
            );
        }
        this.screen.globalAlpha = 1.0;
    }

    renderScores() {
        this.screen.drawImage(
            Snake.woodSign,
            25, 70, 250, 180,
        );
        this.screen.drawImage(
            Snake.woodSign,
            25, 270, 250, 180,
        );
        this.screen.drawImage(
            Snake.woodSign,
            25, 470, 250, 180,
        );
        this.screen.font = "bold 40px/1 cursive";
        this.screen.textBaseline = "middle";
        this.screen.textAlign = "center";

        this.screen.fillStyle = "black";
        this.screen.fillText(
            "score",
            150, 150,
        );
        this.screen.fillText(
            "length",
            150, 350,
        );
        this.screen.fillText(
            "bonus",
            150, 550,
        );
        this.screen.fillStyle = "gold";
        this.screen.font = "bold 30px/1 cursive";
        this.screen.fillText(
            this.score,
            150, 200,
        );
        this.screen.fillText(
            this.bodySet.size,
            150, 400,
        );
        this.screen.fillText(
            this.bonusTime * 100 * this.foodMultiplier,
            150, 600,
        );

    renderSettings() {
        this.screen.fillStyle = "white";
        this.screen.lineWidth = 3;
        for (let i = 0; i < 6; i++) {
            this.screen.strokeStyle = (
                this.currentSettingsButton == i ?
                "rgb(255, 150, 55)" : "rgb(55, 100, 255)"
            );
            this.screen.beginPath();
            this.screen.arc(
                1570, 215 + i * 65 + (i > 2) * 105,
                20, 0, Math.PI * 2,
            );
            this.screen.fill();
            this.screen.stroke();
        }

        this.screen.fillStyle = (
            this.gameStatus == Snake.GAME ?
            "grey" : "red"
        );
        this.screen.beginPath();
        switch (this.gameSpeed) {
            case "slow":
                this.screen.arc(1570, 215, 10, 0, Math.PI * 2);
                break;
            case "normal":
                this.screen.arc(1570, 280, 10, 0, Math.PI * 2);
                break;
            case "fast":
                this.screen.arc(1570, 345, 10, 0, Math.PI * 2);
                break;
        }
        this.screen.fill();
        this.screen.beginPath();
        switch (this.gameSize) {
            case "small":
                this.screen.arc(1570, 515, 10, 0, Math.PI * 2);
                break;
            case "normal":
                this.screen.arc(1570, 580, 10, 0, Math.PI * 2);
                break;
            case "large":
                this.screen.arc(1570, 645, 10, 0, Math.PI * 2);
                break;
        }
        this.screen.fill();

        // music icon and sound icon
        this.screen.fillStyle = (
            this.toggleButton == 0 ?
            "rgb(200, 255, 255)" : "rgb(255, 255, 255)" 
        );
        this.screen.strokeStyle = (
            this.toggleButton == 0 ?
            "rgb(255, 150, 55)" : "rgb(55, 100, 255)" 
        );
        this.screen.beginPath();
        this.screen.moveTo(1585, 725);
        this.screen.arcTo(1625, 725, 1625, 735, 10);
        this.screen.arcTo(1625, 775, 1615, 775, 10);
        this.screen.arcTo(1575, 775, 1575, 765, 10);
        this.screen.arcTo(1575, 725, 1585, 725, 10);
        this.screen.fill();
        this.screen.stroke();
        this.screen.fillStyle = this.screen.strokeStyle;
        this.screen.beginPath();
        this.screen.moveTo(1585, 742);
        this.screen.lineTo(1595, 742);
        this.screen.lineTo(1610, 730);
        this.screen.lineTo(1610, 770);
        this.screen.lineTo(1595, 758);
        this.screen.lineTo(1585, 758);
        this.screen.fill();
        if (!this.soundOn) {
            this.screen.strokeStyle = "red";
            this.screen.lineWidth = 5;
            this.screen.beginPath();
            this.screen.moveTo(1585, 735);
            this.screen.lineTo(1615, 765);
            this.screen.stroke();
        }

        this.screen.fillStyle = (
            this.toggleButton == 1 ?
            "rgb(200, 255, 255)" : "rgb(255, 255, 255)" 
        );
        this.screen.strokeStyle = (
            this.toggleButton == 1 ?
            "rgb(255, 150, 55)" : "rgb(55, 100, 255)" 
        );
        this.screen.beginPath();
        this.screen.moveTo(1685, 725);
        this.screen.arcTo(1725, 725, 1725, 735, 10);
        this.screen.arcTo(1725, 775, 1715, 775, 10);
        this.screen.arcTo(1675, 775, 1675, 765, 10);
        this.screen.arcTo(1675, 725, 1685, 725, 10);
        this.screen.fill();
        this.screen.stroke();
        this.screen.lineWidth = 4;
        this.screen.beginPath();
        this.screen.moveTo(1695, 760);
        this.screen.lineTo(1695, 735);
        this.screen.lineTo(1715, 740);
        this.screen.lineTo(1715, 765);
        this.screen.moveTo(1695, 742);
        this.screen.lineTo(1715, 747);
        this.screen.stroke();
        this.screen.fillStyle = this.screen.strokeStyle;
        this.screen.beginPath();
        this.screen.ellipse(1689, 760, 7, 4, -0.15, 0, Math.PI * 2);
        this.screen.ellipse(1709, 765, 7, 4, -0.15, 0, Math.PI * 2);
        this.screen.fill();
        if (!this.musicOn) {
            this.screen.strokeStyle = "red";
            this.screen.lineWidth = 5;
            this.screen.beginPath();
            this.screen.moveTo(1685, 735);
            this.screen.lineTo(1715, 765);
            this.screen.stroke();
        }
    }

    renderIdle() {
        this.screen.putImageData(
            this.endingScene, 300, 100,
        );
        this.screen.fillStyle = "rgba(255, 255, 255, 0.5)";
        this.screen.fillRect(300, 100, 1200, 600);

        this.screen.lineWidth = 2;
        this.screen.fillStyle = "rgb(110, 75, 55)";
        this.screen.strokeStyle = "rgb(0, 0, 0)";

        this.screen.beginPath();
        this.screen.moveTo(600, 385);
        this.screen.arcTo(600, 425, 610, 425, 10);
        this.screen.arcTo(800, 425, 800, 410, 10);
        this.screen.arcTo(800, 375, 790, 375, 10);
        this.screen.arcTo(600, 375, 600, 385, 10);
        this.screen.fill();
        this.screen.stroke();

        this.screen.beginPath();
        this.screen.moveTo(1000, 385);
        this.screen.arcTo(1000, 425, 1010, 425, 10);
        this.screen.arcTo(1200, 425, 1200, 410, 10);
        this.screen.arcTo(1200, 375, 1190, 375, 10);
        this.screen.arcTo(1000, 375, 1000, 385, 10);
        this.screen.fill();
        this.screen.stroke();

        this.screen.textAlign = "center";
        this.screen.textBaseline = "middle";
        this.screen.fillStyle = "silver";
        if (this.currentIdleButton == 0) {
            this.screen.font = "bold 36px sans-serif";
            if (this.mouseDown) {
                this.screen.fillStyle = "gold";
            }
        } else {
            this.screen.font = "36px sans-serif";
        }
        this.screen.fillText(
            "Play Again",
            700, 400,
        );
        this.screen.fillStyle = "silver";
        if (this.currentIdleButton == 1) {
            this.screen.font = "bold 36px sans-serif";
            if (this.mouseDown) {
                this.screen.fillStyle = "gold";
            }
        } else {
            this.screen.font = "36px sans-serif";
        }
        this.screen.fillText(
            "Main Menu",
            1100, 400,
        );
    }
