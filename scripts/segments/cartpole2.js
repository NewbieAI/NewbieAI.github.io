    renderSystem() {

        this.screen.fillStyle = "red";
        this.screen.fillRect(
            this.x - Cartpole.CART_WIDTH / 2, 
            580,
            Cartpole.CART_WIDTH,
            30,
        );

        this.screen.strokeStyle = "white";
        this.screen.lineWidth = 10;
        this.screen.beginPath();
        this.screen.moveTo(this.x, 580);
        this.screen.lineTo(
            this.x + Cartpole.POLE_LENGTH * Math.sin(this.theta), 
            580 - Cartpole.POLE_LENGTH * Math.cos(this.theta), 
        );
        this.screen.stroke();
        this.screen.beginPath();

        this.screen.fillStyle = "grey";
        this.screen.beginPath();
        this.screen.arc(this.x, 580, 10, 0, 2 * Math.PI);
        this.screen.fill();
        this.screen.fillStyle = "white";
        this.screen.beginPath();
        this.screen.arc(this.x, 580, 5, 0, 2 * Math.PI);
        this.screen.fill();

        this.screen.fillStyle = "black";
        this.screen.beginPath();
        this.screen.arc(
            this.x - Cartpole.CART_WIDTH / 4,
            615,
            15,
            0,
            2 * Math.PI,
        );
        this.screen.fill();

        this.screen.beginPath();
        this.screen.arc(
            this.x + Cartpole.CART_WIDTH / 4,
            615,
            15,
            0,
            2 * Math.PI,
        );
        this.screen.fill();

        this.screen.fillStyle = "gold";
        this.screen.font = "bold 48px courier";
        this.screen.textBaseline = "top";
        this.screen.textAlign = "right";
        this.screen.fillText(
            "SCORE: ",
            900, 675,
        );
        this.screen.textAlign = "left";
        this.screen.fillText(
            Date.now() - this.startTime,
            900, 675,
        );

    }
