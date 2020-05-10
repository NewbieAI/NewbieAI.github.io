"use strict"

let game = new Minesweeper(null);

for (let i = 0; i < game.state.length; i++) {
    let ele = document.createElement("p");
    ele.innerHTML = String(game.state[i]);
    document.body.append(ele);
}
