"use strict";

let game;
let button = document.createElement("button");
button.innerText = "click to play";
button.onclick = () => {
    Minesweeper.loadAssets().then(
        () => {
            game = new Minesweeper();
        }
    );
};
document.body.append(button);

