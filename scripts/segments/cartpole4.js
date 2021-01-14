    renderWeather() {
        for (let i = 0; i < this.clouds.length; i += 2) {
            if (this.clouds[i] >= -105 && this.clouds[i] <= 1905) {
                this._renderCloud(this.clouds[i], this.clouds[i + 1]);
                this.clouds[i] += this.W * 0.10;
            } else {
                this.clouds[i] = (this.W > 0) ? -105 : 1905;
                this.clouds[i + 1] = 75 + Math.random() * 150;
            }
        }
        this._renderTree(
            Math.atan(-this.W * 2 / Cartpole.GRAVITY) *
            (1 + 0.2 * Math.sin(2 * Math.PI * this.frame / 30))
        );
        switch (this.weather) {
            case "sunny":
                break;
            case "rainy":
                for (let i = 0; i < this.raindrops.length; i += 2) {
                    this._renderRaindrop(
                        this.raindrops[i],
                        this.raindrops[i + 1],
                    );
                    this.raindrops[i + 1] += 25;
                    this.raindrops[i] -= 25 * this.W / Cartpole.GRAVITY;
                }
                this.raindrops[this.raindropNumber] = (
                    -200 + Math.random() * 2200
                );
                this.raindrops[this.raindropNumber + 1] = -200;
                this.raindropNumber = (this.raindropNumber + 2) % 50;
                break;
            case "windy":
                break;
            case "snowy":
                for (let i = 0; i < this.snowflakes.length; i += 2) {
                    this._renderSnowflake(
                        this.snowflakes[i],
                        this.snowflakes[i + 1],
                    );
                    this.snowflakes[i + 1] += 5;
                    this.snowflakes[i] -= 15 * this.W / Cartpole.GRAVITY;
                }
                this.snowflakes[this.snowflakeNumber] = (
                    -300 + Math.random() * 2400
                );
                this.snowflakes[this.snowflakeNumber + 1] = -25;
                this.snowflakeNumber = (this.snowflakeNumber + 2) % 250;
                break;
        }
        this.screen.font = "bold 32px Georgia";
        this.screen.textAlign = "center";
        this.screen.textBaseline = "top";
        this.screen.fillStyle = "black";
        this.screen.fillText(this.forecast, 900, 25);
    }

    _renderCloud(x, y) {
        if (this.weather == "sunny") {
            this.screen.fillStyle = "rgb(255, 255, 255)";
        } else {
            this.screen.fillStyle = "rgb(155, 155, 155)";
        }
        this.screen.beginPath();
        this.screen.ellipse(
            x - 20, y - 25,
            60, 50,
            0,
            0, Math.PI * 2,
        );
        this.screen.fill();
        this.screen.beginPath();
        this.screen.ellipse(
            x - 30, y,
            75, 50,
            0,
            0, Math.PI * 2,
        );
        this.screen.ellipse(
            x + 30, y,
            75, 50,
            0,
            0, Math.PI * 2,
        );
        this.screen.fill();
    }

    _renderRaindrop(x, y) {
        let l = Math.sqrt(
            this.W * this.W + Cartpole.GRAVITY * Cartpole.GRAVITY
        );
        let w, h;
        if (y - 600 < 200 * Cartpole.GRAVITY / l) {
            h = 600 - y;
            w = -h * this.W / Cartpole.GRAVITY;
        } else {
            h = -200 * Cartpole.GRAVITY / l;
            w = 200 * this.W / l;
        }
        if ((w >= 0 && x > 1800) || 
            (w < 0 && x <= 0) || 
            y >= 600 || y + h <= 0) {
            return;
        }
        let g = this.screen.createLinearGradient(
            x, 
            y, 
            x + 200 * this.W / l,
            y - 200 * Cartpole.GRAVITY / l,
        );
        g.addColorStop(0.0, "rgba(255, 255, 255, 0)");
        g.addColorStop(0.68, "rgba(255, 255, 255, 0.5)");
        g.addColorStop(1.0, "rgba(255, 255, 255, 0)");
        this.screen.lineWidth = 4;
        this.screen.strokeStyle = g;
        this.screen.beginPath();
        this.screen.moveTo(x, y);
        this.screen.lineTo(x + w, y + h);
        this.screen.stroke();
    }

    _renderSnowflake(x, y) {
        this.screen.fillStyle = "rgb(200, 255, 255)";
        this.screen.strokeStyle = "rgb(200, 255, 255)";

        let angle = Math.PI / 3;
        this.screen.beginPath();
        this.screen.moveTo(
            x + 5 * Math.cos(0 * angle),
            y + 5 * Math.sin(0 * angle),
        );
        for (let i = 1; i <= 5; i++) {
            this.screen.lineTo(
                x + 5 * Math.cos(i * angle),
                y + 5 * Math.sin(i * angle),
            );
        }
        this.screen.fill();

        this.screen.lineWidth = 2;
        this.screen.beginPath();
        for (let i = 0; i < 6; i++) {
            this.screen.moveTo(x, y);
            this.screen.lineTo(
                x + 20 * Math.cos(i * angle),
                y + 20 * Math.sin(i * angle),
            );
            this.screen.moveTo(
                x + 10 * Math.cos(i * angle) + 
                4 * Math.cos((i + 2) * angle),
                y + 10 * Math.sin(i * angle) + 
                4 * Math.sin((i + 2) * angle),
            );
            this.screen.lineTo(
                x + 10 * Math.cos(i * angle),
                y + 10 * Math.sin(i * angle),
            );
            this.screen.lineTo(
                x + 10 * Math.cos(i * angle) + 
                4 * Math.cos((i - 2) * angle),
                y + 10 * Math.sin(i * angle) + 
                4 * Math.sin((i - 2) * angle),
            );
            this.screen.moveTo(
                x + 15 * Math.cos(i * angle) + 
                6 * Math.cos((i + 2) * angle),
                y + 15 * Math.sin(i * angle) + 
                6 * Math.sin((i + 2) * angle),
            );
            this.screen.lineTo(
                x + 15 * Math.cos(i * angle),
                y + 15 * Math.sin(i * angle),
            );
            this.screen.lineTo(
                x + 15 * Math.cos(i * angle) + 
                6 * Math.cos((i - 2) * angle),
                y + 15 * Math.sin(i * angle) + 
                6 * Math.sin((i - 2) * angle),
            );
        }
        this.screen.stroke();
    }
