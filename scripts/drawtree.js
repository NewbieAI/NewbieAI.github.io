"use strict";

let canvas = document.createElement("canvas");
canvas.setAttribute("width", 400);
canvas.setAttribute("height", 500);
document.body.append(canvas);
let theta = 0;
let animation = setInterval(redraw, 50);

document.addEventListener(
    "keydown",
    (e) => {
        if (e.key == "ArrowLeft") {
            theta += 0.01;
        }
        if (e.key == "ArrowRight") {
            theta -= 0.01;
        }
        if (e.key == "x") {
            clearInterval(animation);
        }
    },
);

function redraw() {
    let ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 400, 500);

    /*
    ctx.fillStyle = "green";
    ctx.beginPath();
    ctx.moveTo(200, 300);
    ctx.bezierCurveTo(
        x1, y1,
        x2, y1,
        200 - 300 * Math.sin(theta), 300 + 300 * Math.cos(theta),
    );
    ctx.bezierCurveTo(
        x1, y1,
        x2, y2,
        200, 300,
    );
    ctx.fill();
    */

    
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

}
