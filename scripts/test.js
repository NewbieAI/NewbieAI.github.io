"use strict";

let gameScreen = document.createElement("canvas");
gameScreen.setAttribute("class", "screen");
document.body.append(gameScreen);

let game = new Minesweeper(gameScreen.getContext("2d"));

