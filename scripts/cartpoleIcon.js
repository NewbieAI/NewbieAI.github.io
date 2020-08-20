"use strict";

let canvas = document.createElement("canvas");
canvas.setAttribute("width", 100);
canvas.setAttribute("height", 100);

let ctx = canvas.getContext("2d");
ctx.fillStyle = "red";
ctx.fillRect(15, 65, 70, 15);

ctx.fillStyle = "black";
ctx.beginPath();
ctx.arc(30, 80, 8, 0, Math.PI * 2);
ctx.arc(70, 80, 8, 0, Math.PI * 2);
ctx.fill();

let theta = Math.PI / 9;
ctx.strokeStyle = "white";
ctx.lineWidth = 4;
ctx.beginPath();
ctx.moveTo(50, 65);
ctx.lineTo(
    50 + 60 * Math.sin(theta),
    65 - 60 * Math.cos(theta),
);
ctx.stroke();

ctx.fillStyle = "silver";
ctx.beginPath();
ctx.arc(50, 65, 5, 0, Math.PI * 2);
ctx.fill();
ctx.fillStyle = "white";
ctx.beginPath();
ctx.arc(50, 65, 2, 0, Math.PI * 2);
ctx.fill();

document.body.append(canvas);
