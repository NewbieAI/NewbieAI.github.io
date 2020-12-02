    startGame() {
        clearInterval(this.menuAnimation);
        this.gameStatus = Snake.GAME;

        this.initialize();
        this.renderSettings();
        this.playMusic(Snake.gameMusic);
        this.gameAnimation = setInterval(
            () => {

                this.clearScreen();
                this.update();
                this.renderFood();
                this.renderSnake();
                this.renderScores();
                if (this.isGameover && 
                    this.currentFrame >= this.frames / 5) {
                    this.endGame();
                }

            },
            50,
        );
    }

    initialize() {
        this.isGameover = false;
        this.arrowUp = false;
        this.arrowDown = false;
        this.arrowLeft = false;
        this.arrowRight = false;

        this.score = 500;
        this.foodMultiplier = 1;
        switch (this.gameSize) {
            case "small":
                this.cellSize = 50;
                this.currentBackgroundPattern = Snake.pattern2a;
                break;
            case "normal":
                this.cellSize = 40;
                this.currentBackgroundPattern = Snake.pattern2b;
                break;
            case "large":
                this.cellSize = 30;
                this.currentBackgroundPattern = Snake.pattern2c;
                break;
        }
        switch (this.gameSpeed) {
            case "slow":
                this.frames = 16;
                break;
            case "normal":
                this.frames = 12;
                break;
            case "fast":
                this.frames = 8;
                break;
        }

        this.row = 600 / this.cellSize;
        this.col = 1200 / this.cellSize;
        this.qsize = 2 * this.row * this.col;
        this.body.length = 0;
        this.bodySet.clear();
        this.space.length = 0;
        this.spaceMap.clear();
        this.currentFrame = 0;
        this.tailIndex = 0;
        this.headIndex = 6;
        this.isGrowing = false;
        this.currentBody = Snake.body1;
        
        for (let i = 0; i < this.row * this.col; i++) {
            this.space.push(i);
            this.spaceMap.set(i, i);
        }

        this.nextDirection = [
            "Up",
            "Down",
            "Left",
            "Right",
        ][0 | Math.random() * 4]
        this.currentDirection = this.nextDirection;

        let _rand = (a, b) => {
            return 0 | a + Math.random() * (b - a);
        }

        let dRow, dCol;
        switch (this.currentDirection) {
            case "Up":
                this.tailPrev.i = _rand(this.row / 2 + 3, this.row);
                this.tailPrev.j = _rand(0, this.col);
                dRow = -1;
                dCol = 0;
                break;
            case "Down":
                this.tailPrev.i = _rand(0, this.row / 2 - 3);
                this.tailPrev.j = _rand(3, this.col);
                dRow = 1;
                dCol = 0;
                break;
            case "Left":
                this.tailPrev.i = _rand(0, this.row);
                this.tailPrev.j = _rand(this.col / 2 + 3, this.col);
                dRow = 0;
                dCol = -1;
                break;
            case "Right":
                this.tailPrev.i = _rand(0, this.row);
                this.tailPrev.j = _rand(0, this.col / 2 - 3);
                dRow = 0;
                dCol = 1;
                break;
        }

        for (let k = 1; k <= 4; k++) {
            let a = this.tailPrev.i + k * dRow;
            let b = this.tailPrev.j + k * dCol;
            let key = a * this.col + b;
            this.body.push(a, b);
            this.bodySet.add(key);
            this.space[key] = this.space[this.space.length - 1];
            this.spaceMap.set(
                this.space[key],
                key,
            );
            this.space.pop();
            this.spaceMap.delete(key);
        }
        this.bonusCooldown = this.col * 2 + (
            0 | Math.random() * (this.col + 1)
        );

        this.dispenseFood();
        this.renderFood();
        this.renderSnake();
        this.renderScores();

    }

    dispenseFood() {
        let index;
        index = 0 | Math.random() * this.space.length;
        if (this.bonusTime > 0) {
            while (index == this.food.bonusIndex) {
                // rejection sampling
                index = 0 | Math.random() * this.space.length;
            }
        }
        console.log(index);
        let foodLocationKey = this.space[index];
        this.food.i = 0 | foodLocationKey / this.col;
        this.food.j = foodLocationKey  % this.col;
        switch (0 | Math.random() * 4) {
            case 0:
                this.food.img = Snake.food1;
                break;
            case 1:
                this.food.img = Snake.food2;
                break;
            case 2:
                this.food.img = Snake.food3;
                break;
            case 3:
                this.food.img = Snake.food4;
                break;
        }
    }

    dispenseBonusFood() {
        if (this.space.length <= 1) {
            return;
        }
        let index = 0 | Math.random() * this.space.length;
        while (index == this.food.i * this.col + this.food.j) {
            let index = 0 | Math.random() * this.space.length;
        }
        this.food.bonusIndex = this.space[index];
        this.bonusTime = 15;
        this.bonusCounter = setInterval(
            () => {
                if (--this.bonusTime == 0) {
                    this.removeBonusFood();
                }
            },
            1000,
        );
    }

    removeBonusFood() {
        clearInterval(this.bonusCounter);
        this.bonusTime = 0;
        this.food.bonusIndex = -1;
        this.bonusCooldown = this.col * 2 + (
            0 | Math.random() * (this.col + 1)
        );
    }

    update() {
        
        switch (this.currentDirection) {
            case "Up":
                if (this.arrowUp) {
                    this.currentFrame += this.frames / 4 - 1;
                }
                break;
            case "Down":
                if (this.arrowDown) {
                    this.currentFrame += this.frames / 4 - 1;
                }
                break;
            case "Left":
                if (this.arrowLeft) {
                    this.currentFrame += this.frames / 4 - 1;
                }
                break;
            case "Right":
                if (this.arrowRight) {
                    this.currentFrame += this.frames / 4 - 1;
                }
                break;
        }
        if (++this.currentFrame < this.frames || this.isGameover) {
            return;
        }


        let a = this.body[this.headIndex];
        let b = this.body[this.headIndex + 1];

        if (this.bonusCooldown-- == 0 && this.food.bonusIndex < 0) {
            this.dispenseBonusFood();
        }
        if (a * this.col + b == this.food.bonusIndex) {
            this.score += this.bonusTime * 100 * this.foodMultiplier;
            this.removeBonusFood();
        }

        this.isGrowing = (a == this.food.i && b == this.food.j);
        this.currentFrame = 0;
        this.headIndex = (this.headIndex + 2) % this.qsize;
        switch (this.nextDirection) {
            case "Up":
                if (this.currentDirection != "Down") {
                    a -= 1;
                    this.currentDirection = "Up";
                } else {
                    a += 1;
                }
                break;
            case "Down":
                if (this.currentDirection != "Up") {
                    a += 1;
                    this.currentDirection = "Down";
                } else {
                    a -= 1;
                }
                break;
            case "Left":
                if (this.currentDirection != "Right") {
                    b -= 1;
                    this.currentDirection = "Left";
                } else {
                    b += 1;
                }
                break;
            case "Right":
                if (this.currentDirection != "Left") {
                    b += 1;
                    this.currentDirection = "Right";
                } else {
                    b -= 1;
                }
                break;
        }

        let newHead = a * this.col + b;

        if (a < 0 || a >= this.row || b < 0 || b >= this.col) {
            this.isGameover = true;
        }

        if ( this.bodySet.has(newHead) ) {
            if (this.isGrowing || 
                a != this.body[this.tailIndex] || 
                b != this.body[this.tailIndex + 1]) {
                this.isGameover = true;
            }
        }

        if (this.isGrowing) {

            this.score += 100 * this.foodMultiplier;
            if (this.spaceMap.get(newHead) != this.space.length - 1) {
                this.space[
                    this.spaceMap.get(newHead)
                ] = this.space[this.space.length - 1];
                this.spaceMap.set(
                    this.space[this.space.length - 1],
                    this.spaceMap.get(newHead),
                );
            }
            this.space.pop();
            this.dispenseFood();
            this.spaceMap.delete(newHead);

        } else {
            this.tailPrev.i = this.body[this.tailIndex];
            this.tailPrev.j = this.body[this.tailIndex + 1];
            this.tailIndex = (this.tailIndex + 2) % this.qsize;
            this.bodySet.delete(
                this.tailPrev.i * this.col + this.tailPrev.j,
            );

            if ( this.spaceMap.has(newHead) ) {
                this.space[
                    this.spaceMap.get(newHead)
                ] = this.tailPrev.i * this.col + this.tailPrev.j;
                this.spaceMap.set(
                    this.tailPrev.i * this.col + this.tailPrev.j,
                    this.spaceMap.get(newHead),
                );
                this.spaceMap.delete(newHead);
            }

        }

        this.nextDirection = this.currentDirection;
        this.body[this.headIndex] = a ;
        this.body[this.headIndex + 1] = b;
        this.bodySet.add(newHead);

        this.score--;

        if (this.bodySet.has(this.food.i * this.col + this.food.j) || 
            this.bodySet.has(this.food.bonusIndex)) {
            this.playSound(Snake.eatSound);
        }

        if (this.bodySet.size == this.row * this.col / 3) {
            this.currentBody = Snake.body2;
            this.foodMultiplier = 2;
        } else if (this.bodySet.size == 2 * this.row * this.col / 3) {
            this.currentBody = Snake.body3;
            this.foodMultiplier = 3;
        }
    }

