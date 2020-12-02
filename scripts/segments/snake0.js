"use strict";

// implementation of the game
class Snake {
    static loadAssets() {
    }

    constructor() {
        this.canvas = document.createElement("canvas");
        this.canvas.setAttribute("id", "snake");
        this.canvas.setAttribute("class", "screen");
        this.canvas.setAttribute("width", 1800);
        this.canvas.setAttribute("height", 800);
        this.screen = this.canvas.getContext("2d");

        document.body.append(this.canvas);
    }

}


// running the game
Snake.loadAssets()
    .then(
        () => {
            let game = new Snake();
        },
        () => {
            alert("unable to load the game");
        }
    );
