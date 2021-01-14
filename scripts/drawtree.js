"use strict";

let canvas = document.createElement("canvas");
canvas.setAttribute("width", 400);
canvas.setAttribute("height", 500);
document.body.append(canvas);
let theta_0 = Math.PI / 12;
let delta = Math.PI / 18;
let t = 0;
let theta = theta_0;
redraw();

document.addEventListener(
    "keydown",
    (e) => {
        if (e.key == "ArrowLeft") {
            t -= 1;
        }
        if (e.key == "ArrowRight") {
            t += 1;
        }
        theta = theta_0 - delta * Math.sin(2 * Math.PI * t / 48);
        redraw();
    },
);

function redraw() {
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 400, 500);

    ctx.fillStyle = "skyblue";
    ctx.fillRect(0, 0, 400, 500);
    ctx.fillStyle = "green";
    ctx.beginPath();
    
    let x = 200, y = 300;
    ctx.moveTo(x, y);
    ctx.bezierCurveTo(
        x - 130 * Math.cos(-theta),
        y - 130 * Math.sin(-theta),
        x - 130 * Math.cos(-theta) + 200 * Math.sin(-theta),
        y - 130 * Math.sin(-theta) - 200 * Math.cos(-theta),
        x + 300 * Math.sin(-theta),
        y - 300 * Math.cos(-theta),
    );
    ctx.bezierCurveTo(
        x + 110 * Math.cos(-theta) + 200 * Math.sin(-theta),
        y + 110 * Math.sin(-theta) - 200 * Math.cos(-theta),
        x + 110 * Math.cos(-theta),
        y + 110 * Math.sin(-theta),
        x,
        y,
    );
    ctx.fill();

    
    ctx.fillStyle = "brown";
    ctx.beginPath();
    ctx.moveTo(150, 500);
    ctx.quadraticCurveTo(
        180, 
        300, 
        180 - 200 * Math.sin(theta), 
        350 - 200 * Math.cos(theta)
    );
    ctx.quadraticCurveTo(
        200, 
        300,
        220 - 200 * Math.sin(theta), 
        350 - 200 * Math.cos(theta),
    );
    ctx.quadraticCurveTo(
        220,
        300,
        220, 
        500, 
    );
    ctx.fill();

    ctx.font = "20px serif";
    ctx.fillStyle = "black";
    ctx.fillText(`t = ${t}`, 50, 450);

}
