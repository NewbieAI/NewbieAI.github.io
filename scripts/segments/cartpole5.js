    _renderTree(theta) {
        this.screen.fillStyle = "green";
        this.screen.beginPath();
        this.screen.moveTo(385, 500);
        this.screen.bezierCurveTo(
            385 - 130 * Math.cos(theta),
            500 - 130 * Math.sin(theta),
            385 - 130 * Math.cos(theta) + 200 * Math.sin(theta),
            500 - 130 * Math.sin(theta) - 200 * Math.cos(theta),
            385 + 350 * Math.sin(theta),
            500 - 350 * Math.cos(theta),
        );
        this.screen.bezierCurveTo(
            385 + 120 * Math.cos(theta) + 200 * Math.sin(theta),
            500 + 120 * Math.sin(theta) - 200 * Math.cos(theta),
            385 + 120 * Math.cos(theta),
            500 + 120 * Math.sin(theta),
            385,
            500,
        );
        this.screen.fill();

        this.screen.fillStyle = "brown";
        this.screen.beginPath();
        this.screen.moveTo(360, 600);
        this.screen.quadraticCurveTo(
            370, 
            450,
            370 + 150 * Math.sin(theta),
            450 - 150 * Math.cos(theta),
        );
        this.screen.quadraticCurveTo(
            385 + 50 * Math.sin(theta),
            450 - 50 * Math.cos(theta),
            400 + 150 * Math.sin(theta),
            450 - 150 * Math.cos(theta),
        );
        this.screen.quadraticCurveTo(
            400,
            450,
            400,
            600,
        );
        this.screen.fill();
    }
