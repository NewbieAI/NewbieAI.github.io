"use strict";

let game;
let button1 = document.createElement("button");
let button2 = document.createElement("button");
let button3 = document.createElement("button");
button1.innerText = "play Minesweeper";
button2.innerText = "play Snake";
button3.innerText = "play Cartpole";

button1.onclick = () => {
    Minesweeper.loadAssets().then(
        () => {
            game = new Minesweeper();
        }
    );
};
button2.onclick = () => {
    Snake.loadAssets().then(
        () => {
            game = new Snake();
        }
    );
};
button3.onclick = () => {
    Cartpole.loadAssets().then(
        () => {
            game = new Cartpole();
        }
    );
};

document.body.append(button1);
document.body.append(button2);
document.body.append(button3);
