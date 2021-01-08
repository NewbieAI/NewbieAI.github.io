"use strict";


let dims = [5, 5, 4, 4, 3, 1];
let w = 500;
let h = 400;

let canvas = document.createElement("canvas");
canvas.setAttribute("width", w);
canvas.setAttribute("height", h);
let ctx = canvas.getContext("2d");
document.body.append(canvas);



ctx.fillStyle = "ivory";
ctx.fillRect(0, 0, 500, 400);

ctx.lineWidth = 2;
ctx.strokeStyle = "black";
ctx.fillStyle = "khaki";

for (let i = 0; i < dims[0]; i++) {
    ctx.beginPath();
    ctx.moveTo(25, 100 + 60 * i);
    ctx.lineTo(50, 100 + 60 * i);
    ctx.stroke();
    ctx.arc(70, 100 + 60 * i, 20, 0, 2 * Math.PI);
    ctx.fill();
}

ctx.fillStyle = "#aa00ff";
for (let i = 1; i < dims.length; i++) {
    if (i + 1 == dims.length) {
        ctx.fillStyle = "skyblue"
    }
    let x = i * 75 + 70;
    for (let j =  0; j < dims[i]; j++) {
        let y = 100 + 60 * j + (5 - dims[i]) * 30;
        ctx.beginPath();
        ctx.arc(70 + 75 * i, y, 20, 0, 2 * Math.PI);
        ctx.fill();
        for (let k = 0; k < dims[i - 1]; k++) {
            ctx.beginPath();
            ctx.moveTo(x - 20, y);
            let t = 100 + 60 * k + (5 - dims[i - 1]) * 30;
            ctx.lineTo(x - 55, t);
            ctx.stroke();
        }
    }
}
