"use strict";

let canvas = document.createElement("canvas");
canvas.setAttribute("width", 1000);
canvas.setAttribute("height", 300);
document.body.append(canvas);

let ctx = canvas.getContext("2d");
ctx.font = "10px arial";
ctx.textAlign = "center";
ctx.textBaseline = "middle";

//ctx.fillStyle = "black";
//ctx.fillRect(0, 0, 1000, 300);

let arr = [
    [200, 70],
    [180, 70],
    [175, 60],
    [150, 50],
    [125, 40],
    [100, 40],
    [75, 60],
    [50, 80],
    [50, 100],
    [75, 110],
    [125, 130],
    [150, 130],
    [175, 140],
    [200, 150],
    [200, 180],
    [175, 190],
    [125, 210],
    [100, 200],
    [75, 185],
    [50, 170],
    [50, 145],
    [75, 160],
    [125, 190],
    [150, 210],
    [175, 210],
    [200, 210],
    [215, 190],
    [225, 170],
    [250, 120],
    [270, 110],
    [270, 130],
    [270, 150],
    [275, 210],
    [270, 200],
    [265, 190],
    [265, 180],
    [270, 150],
    [275, 120],
    [300, 100],
    [335, 100],
    [370, 100],
    [390, 120],
    [390, 160],
    [390, 170],
    [390, 220],
    [440, 210],
    [490, 200],
    [520, 190],
    [560, 160],
    [580, 145],
    [585, 120],
    [560, 105],
    [535, 90],
    [500, 90],
    [480, 110],
    [460, 130],
    [460, 180],
    [490, 195],
    [520, 210],
    [550, 190],
    [575, 170],
    [585, 150],
    [585, 120],
    [580, 130],
    [575, 160],
    [570, 170],
    [580, 190],
    [590, 210],
    [620, 170],
    [650, 130],
    [680, 90],
    [690, 70],
    [685, 70],
    [680, 70],
    [675, 130],
    [675, 150],
    [675, 170],
    [675, 200],
    [670, 200],
    [660, 200],
    [660, 160],
    [675, 150],
    [725, 100],
    [740, 100],
    [745, 105],
    [750, 110],
    [725, 140],
    [675, 150],
    [725, 190],
    [775, 210],
    [825, 185],
    [875, 160],
    [950, 140],
    [950, 120],
    [950, 100],
    [900, 90],
    [850, 110],
    [800, 130],
    [800, 170],
    [825, 185],
    [850, 200],
    [875, 200],
    [900, 200],
];
let g = ctx.createLinearGradient(
    0, 0, 1000, 300,
);
g.addColorStop(0, "rgb(55, 100, 255)");
g.addColorStop(1, "rgb(255, 55, 0)");
ctx.strokeStyle = g;
ctx.lineWidth = 16;
ctx.beginPath();
ctx.moveTo(arr[0][0], arr[0][1]);
for (let i = 1; i < arr.length; i += 3) {
    ctx.bezierCurveTo(
        arr[i][0], arr[i][1],
        arr[i + 1][0], arr[i + 1][1],
        arr[i + 2][0], arr[i + 2][1],
    );
}
ctx.stroke();







// draw head
ctx.beginPath()
ctx.fillStyle = "red";
let tongue = [
    250, 75,
    275, 80, 
    300, 70, 
    325, 50,
    350, 30, 
    375, 30, 
    385, 60,
    380, 35, 
    350, 25, 
    325, 45,
    350, 15, 
    375, 20, 
    390, 10,
    375, 20, 
    350, 15, 
    325, 40,
    300, 65, 
    275, 75, 
    250, 70,
];
ctx.moveTo(tongue[0], tongue[1]);
for (let i = 1; i <= 18; i += 3) {
    ctx.bezierCurveTo(
        tongue[2 * i + 0], tongue[2 * i + 1],
        tongue[2 * i + 2], tongue[2 * i + 3],
        tongue[2 * i + 4], tongue[2 * i + 5],
    );
}
ctx.fill();

ctx.fillStyle = ctx.strokeStyle;
ctx.beginPath();
ctx.moveTo(200, 62);
ctx.bezierCurveTo(210, 62, 210, 50, 230, 50);
ctx.bezierCurveTo(250, 50, 300, 80, 250, 78);
ctx.bezierCurveTo(200, 76, 210, 78, 200, 78);
ctx.fill();

ctx.fillStyle = "rgb(255, 175, 0)";
ctx.beginPath();
ctx.ellipse(
    235, 60,
    9, 4,
    Math.PI / 18,
    0, Math.PI * 2,
);
ctx.fill();
ctx.fillStyle = "black";
ctx.beginPath();
ctx.ellipse(
    235, 60,
    2, 4,
    0,
    0, Math.PI * 2,
);
ctx.fill();
ctx.beginPath();
ctx.arc(263, 67, 1, 0, Math.PI * 2);
ctx.fill();

ctx.lineWidth = 1;
ctx.strokeStyle = "black";
ctx.moveTo(215, 65);
ctx.bezierCurveTo(
    225, 78,
    245, 70,
    271, 73,
);
ctx.stroke();
//draw tail

ctx.fillStyle = g;
ctx.beginPath();
ctx.moveTo(900, 208);
ctx.bezierCurveTo(
    920, 208,
    940, 200,
    975, 170,
);
ctx.bezierCurveTo(
    940, 190,
    930, 192,
    900, 192,
);
ctx.fill();

/*
ctx.fillStyle = "white";
for (let i = 0; i < arr.length; i++) {
    ctx.fillText(i, arr[i][0], arr[i][1]);
}
ctx.strokeStyle = "green";
for (let x = 25; x < 1000; x += 25) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 300);
    ctx.stroke();
}
for (let y = 25; y < 300; y += 25) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1000, y);
    ctx.stroke();
}
*/
