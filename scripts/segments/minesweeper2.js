    renderCell(i, j) {
        let colorStyle = (
            "rgba(" + 
            String(0 + ((Math.random() * 20) | 0)) + ", " +
            String(125 + ((Math.random() * 20) | 0)) + ", " +
            String(200 + ((Math.random() * 20) | 0)) + ", " +
            String(0.5 + (Math.random() * 0.2)) +
            ")"
        );

        let key = i * Minesweeper.COL + j;
        if (this.state[i][j] >= -1) {
            this.screen.fillStyle = "rgb(255, 255, 255)";
            this.screen.fillRect(
                j * this.cellWidth,
                i * this.cellHeight,
                this.cellWidth,
                this.cellHeight,
            );

            this.screen.fillStyle = colorStyle;
            this.screen.fillRect(
                j * this.cellWidth,
                i * this.cellHeight,
                this.cellWidth,
                this.cellHeight,
            );
            if ( this.flags.has(key) ) {
                this.renderFlag(i, j);
            }
            if ( this.qMarks.has(key) ) {
                this.renderQMark(i, j);
            }
        } else {
            if ( this.flags.has(key) || this.qMarks.has(key) ) {
                this.flags.delete(key);
                this.qMarks.delete(key);

                this.screen.fillStyle = "rgb(255, 255, 255)";
                this.screen.fillRect(
                    j * this.cellWidth,
                    i * this.cellHeight,
                    this.cellWidth,
                    this.cellHeight,
                );
                this.screen.fillStyle = colorStyle;
                this.screen.fillRect(
                    j * this.cellWidth,
                    i * this.cellHeight,
                    this.cellWidth,
                    this.cellHeight,
                );
            }
            if (this.state[i][j] != -11) {
                this.renderDigit(i, j);
            }

        }
        
        this.screen.strokeStyle = "rgb(255, 255, 255)";
        this.screen.strokeRect(
            j * this.cellWidth,
            i * this.cellHeight,
            this.cellWidth,
            this.cellHeight,
        );
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
            "rgb(0, 120, 120)",
            "rgb(220, 55, 110)",
        ];

        this.screen.fillStyle = color[0];
        this.screen.fillRect(
            j * this.cellWidth,
            i * this.cellHeight,
            this.cellWidth,
            this.cellHeight,
        );

        let n = this.state[i][j] + 10;
        if (n > 0) {
            this.screen.fillStyle = color[n];
            this.screen.font = "40px bold arial";
            this.screen.textAlign = "center";
            this.screen.textBaseline = "middle";
            this.screen.fillText(
                String(n),
                (j + 0.5) * this.cellWidth,
                (i + 0.5) * this.cellHeight + 2,
            );
        }
    }

    renderMine(i, j) {
        let x = j * this.cellWidth;
        let y = i * this.cellHeight;
        let mineRadius = this.cellWidth * 0.3;
        let spikeRadius = this.cellWidth * 0.45;
        let spikeLength = this.cellWidth * 0.2;
        let shadowDiff = this.cellWidth * 0.05;
        let shadowLength = this.cellWidth * 0.2;
        
        if (this.state[i][j] < -1) {
            this.screen.fillStyle = `rgb(255, 0, 0)`;
            this.screen.fillRect(x, y, this.cellWidth, this.cellHeight);
        }
        
        x += this.cellWidth / 2;
        y += this.cellHeight / 2;
        this.screen.fillStyle = "rgb(0, 0, 0)";
        this.screen.beginPath();
        this.screen.arc(x, y, mineRadius, 0, 2 * Math.PI);
        this.screen.fill();

        this.screen.fillStyle = "rgb(100, 100, 100)";
        this.screen.beginPath();
        this.screen.arc(x, y, mineRadius / 5, 0, 2 * Math.PI);
        this.screen.fill();
        
        for (let i = 0; i < 8; i++) {
            let theta = i * Math.PI / 4;
            let delta = Math.PI / 9;
            let a = x + spikeRadius * Math.cos(theta);
            let b = y + spikeRadius * Math.sin(theta);
            
            this.screen.fillStyle = "rgb(0, 0, 0)";
            this.screen.beginPath();
            this.screen.moveTo(a, b);
            this.screen.lineTo(
                a - spikeLength * Math.cos(theta + delta),
                b - spikeLength * Math.sin(theta + delta),
            );
            this.screen.lineTo(
                a - spikeLength * Math.cos(theta - delta),
                b - spikeLength * Math.sin(theta - delta),
            );
            this.screen.fill();

            if (i % 2 == 0) {
                continue;
            }
            this.screen.fillStyle = "rgb(100, 100, 100)";
            a -= shadowDiff * Math.cos(theta);
            b -= shadowDiff * Math.sin(theta);

            this.screen.beginPath();
            this.screen.moveTo(a, b);
            this.screen.lineTo(
                a - shadowLength * Math.cos(theta + delta),
                b - shadowLength * Math.sin(theta + delta),
            );
            this.screen.lineTo(
                a - shadowLength * Math.cos(theta - delta),
                b - shadowLength * Math.sin(theta - delta),
            );
            this.screen.fill();
        }
    };

    renderFlag(i, j) {
        let x = j * this.cellWidth;
        let y = i * this.cellHeight;

        let margin = this.cellHeight * 0.1;
        let poleTip = this.cellWidth * 0.3;
        let poleHeight = this.cellHeight * 0.55;
        let poleWidth = this.cellWidth * 0.06;
        let baseHeight = this.cellHeight * 0.18;
        let baseWidth = this.cellWidth * 0.7;
        let flagLength = this.cellHeight * 0.45;
        let flagWidth = this.cellWidth * 0.4;

        this.screen.beginPath();
        this.screen.fillStyle = "rgb(55, 55, 55)";
        this.screen.moveTo(
            x + poleTip, 
            y + margin,
        );
        this.screen.lineTo(
            x + poleTip, 
            y + margin + poleHeight,
        );
        this.screen.lineTo(
            x + margin, 
            y + margin + poleHeight + baseHeight,
        );
        this.screen.lineTo(
            x + margin + baseWidth, 
            y + margin + poleHeight + baseHeight,
        );
        this.screen.lineTo(
            x + poleTip + poleWidth, 
            y + margin + poleHeight,
        );
        this.screen.lineTo(
            x + poleTip + poleWidth, 
            y + margin,
        );
        this.screen.fill();
        this.screen.beginPath();
        this.screen.fillStyle = "rgb(255, 0, 0)";
        this.screen.moveTo(
            x + poleTip + poleWidth, 
            y + margin,
        );
        this.screen.lineTo(
            x + poleTip + poleWidth + flagWidth, 
            y + margin + flagLength,
        );
        this.screen.lineTo(
            x + poleTip + poleWidth, 
            y + margin + flagLength,
        );
        this.screen.fill();

    }

    renderQMark(i, j) {
        this.screen.fillStyle = "rgb(100, 100, 0)";
        this.screen.font = "36px bold arial";
        this.screen.textAlign = "center";
        this.screen.textBaseline = "middle";
        this.screen.fillText(
            "?",
            (j + 0.5) * this.cellWidth,
            (i + 0.5) * this.cellHeight + 2,
        );

    }

    renderCheck(i, j) {
        let x = j * this.cellWidth;
        let y = i * this.cellHeight;
        let xMargin = 0.2 * this.cellWidth;
        let yMargin = 0.2 * this.cellHeight;
        let xWidth = 0.6 * this.cellWidth;
        let yHeight = 0.6 * this.cellHeight;
        let xMiddle = 0.2 * this.cellWidth;
        let yMiddle = 0.3 * this.cellHeight;

        this.screen.beginPath();
        if (this.state[i][j] == -1) {
            this.screen.strokeStyle = "rgb(0, 150, 0)";
            this.screen.moveTo(
                x + xMargin,
                y + yMargin + yMiddle,
            );
            this.screen.lineTo(
                x + xMargin + xMiddle,
                y + yMargin + yHeight,
            );
            this.screen.lineTo(
                x + xMargin + xWidth,
                y + yMargin,
            );
        } else {
            this.screen.strokeStyle = "rgb(150, 0, 0)";
            this.screen.moveTo(
                x + xMargin,
                y + yMargin,
            );
            this.screen.lineTo(
                x + xMargin + xWidth,
                y + yMargin + yHeight,
            );
        }
        this.screen.lineWidth = 4;
        this.screen.stroke();
        this.screen.lineWidth = 2;
    }
