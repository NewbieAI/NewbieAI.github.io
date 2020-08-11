
"use strict";
let pattern = document.createElement("canvas");
let w = 40, h = 40;
pattern.setAttribute("width", w);
pattern.setAttribute("height", h);

let canvas = document.createElement("canvas");
canvas.setAttribute("width", 1800);
canvas.setAttribute("height", 800);
document.body.append(pattern);

let ctx = pattern.getContext("2d");
let r = [];
let g = [];
let b = [];
let p = 8;
for (let i = 0; i <= h / 5; i += 1) {
    r[i] = [];
    g[i] = [];
    b[i] = [];
    for (let j = 0; j <= w / 5; j += 1) {
        r[i][j] = 0;
        g[i][j] = 0;
        b[i][j] = 0;
    }
}
for (let i = 0; i <= h / 5; i += p) {
    for (let j = 0; j <= w / 5; j += p) {
        for (let x = Math.max(0, i - 2 * p); 
            x < Math.min(h / 5, i + 2 * p + 1);
            x++) {
            for (let y = Math.max(0, j - 2 * p); 
                y < Math.min(w / 5, j + 2 * p + 1);
                y++) {
                r[x][y] += 10 * Math.exp(
                    -(Math.pow(i * 5 - x * 5 - 3, 2) + 
                    Math.pow(j * 5 - y * 5 - 3, 2)) / 
                    (p * p * 4)
                );
                g[x][y] += 20 * Math.exp(
                    -(Math.pow(i * 5 - x * 5 - 3, 2) + 
                    Math.pow(j * 5 - y * 5 - 3, 2)) / 
                    (p * p * 4)
                );
                b[x][y] += 55 * Math.exp(
                    -(Math.pow(i * 5 - x * 5 - p / 2, 2) + 
                    Math.pow(j * 5 - y * 5 - p / 2, 2)) / 
                    (p * p * 4)
                );
            }
        }
    }
}
for (let i = 0; i <= h / 5; i++) {
    for (let j = 0; j <= w / 5; j++) {
        ctx.fillStyle = `rgb(
            ${0 | r[i][j]}, 
            ${0 | g[i][j]}, 
            ${0 | b[i][j]})`;
        ctx.fillRect(i * 5, j * 5, 5, 5);
    }
}

let screen = canvas.getContext("2d");
screen.fillStyle = screen.createPattern(pattern, "");
screen.fillRect(0, 0, 1800, 800);
screen.strokeStyle = "red";
screen.strokeRect(295, 95, 1210, 610);
