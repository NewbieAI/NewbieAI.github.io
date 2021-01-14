    renderBackground() {
        this.screen.fillStyle = "white";
        this.screen.fillRect(0, 0, 1800, 800);
        switch (this.weather) {
            case "sunny":
                this._paintSunny();
                break;
            case "rainy":
                this._paintRainy();
                break;
            case "snowy":
                this._paintSnowy();
                break;
        }
        this.cacheImg = this.screen.getImageData(0, 0, 1800, 800);
    }

    _paintSunny() {

        let gradient = this.screen.createLinearGradient(
            0, 0, 0, 800,
        );
        gradient.addColorStop(0, "rgba(0, 0, 255, 0.2)");
        gradient.addColorStop(1, "rgba(0, 0, 255, 1.0)");
        this.screen.fillStyle = gradient;
        this.screen.fillRect(0, 0, 1800, 600);
        this.screen.fillStyle = "rgb(0, 200, 0)";
        this.screen.fillRect(0, 600, 1800, 50);
        this.screen.fillStyle = "rgb(100, 50, 50)";
        this.screen.fillRect(0, 650, 1800, 150);

    }
    
    _paintRainy() {

        let gradient = this.screen.createLinearGradient(
            0, 0, 0, 800,
        );
        gradient.addColorStop(0, "rgba(0, 0, 150, 0.2)");
        gradient.addColorStop(1, "rgba(100, 100, 255, 1.0)");
        this.screen.fillStyle = gradient;
        this.screen.fillRect(0, 0, 1800, 600);
        this.screen.fillStyle = "rgb(0, 150, 100)";
        this.screen.fillRect(0, 600, 1800, 50);
        this.screen.fillStyle = "rgb(100, 50, 50)";
        this.screen.fillRect(0, 650, 1800, 150);

    }

    _paintSnowy() {

        let gradient = this.screen.createLinearGradient(
            0, 0, 0, 800,
        );
        gradient.addColorStop(0, "rgba(100, 100, 150, 0.2)");
        gradient.addColorStop(1, "rgba(100, 100, 150, 1.0)");
        this.screen.fillStyle = gradient;
        this.screen.fillRect(0, 0, 1800, 600);
        this.screen.fillStyle = "rgb(200, 255, 255)";
        this.screen.fillRect(0, 600, 1800, 50);
        this.screen.fillStyle = "rgb(100, 50, 50)";
        this.screen.fillRect(0, 650, 1800, 150);

    }
