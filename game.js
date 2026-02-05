const grid = document.getElementById("grid");
const buttons = document.querySelectorAll(".difficulty-bar button");

/*
W = Wall
. = Dot
P = Pacman
*/
const levels = {
    easy: [
        "WWWWWWWWWWWWWWW",
        "W.....W.....PW",
        "W.WWW.W.WWW.W.W",
        "W.............W",
        "W.WWW.W.WWW.W.W",
        "W.....W.....W.W",
        "WWWWW.WWWWW.W.W",
        "W.............W",
        "W.WWW.W.WWW.W.W",
        "W.....W.....W.W",
        "W.WWW.W.WWW.W.W",
        "W.............W",
        "W.WWW.W.WWW.W.W",
        "W.....W.......W",
        "WWWWWWWWWWWWWWW"
    ],

    normal: [
        "WWWWWWWWWWWWWWW",
        "W...W.....W..PW",
        "W.W.W.WWW.W.W.W",
        "W.W.....W.....W",
        "W.WWWWW.W.WWW.W",
        "W.....W.W.....W",
        "WWWWW.W.W.WWWWW",
        "W.............W",
        "WWWWW.W.W.WWWWW",
        "W.....W.W.....W",
        "W.WWWWW.W.WWW.W",
        "W.....W.....W.W",
        "W.W.W.WWW.W.W.W",
        "W...W.....W...W",
        "WWWWWWWWWWWWWWW"
    ],

    insane: [
        "WWWWWWWWWWWWWWW",
        "WP..W.W.W.W...W",
        "W.W.W.W.W.W.W.W",
        "W.W...W...W.W.W",
        "W.WWWWWWWWW.W.W",
        "W.....W.....W.W",
        "WWWWW.W.W.WWWWW",
        "W...W.....W...W",
        "WWWWW.W.W.WWWWW",
        "W.W.....W.....W",
        "W.W.WWWWWWWWW.W",
        "W.W...W...W...W",
        "W.W.W.W.W.W.W.W",
        "W...W.W.W.W...W",
        "WWWWWWWWWWWWWWW"
    ]
};

let pacmanIndex = 0;

function renderLevel(levelName) {
    grid.innerHTML = "";
    const map = levels[levelName];

    map.forEach((row, y) => {
        [...row].forEach((cell, x) => {
            const div = document.createElement("div");
            div.classList.add("cell");

            if (cell === "W") div.classList.add("wall");
            if (cell === ".") div.classList.add("path", "dot");
            if (cell === "P") {
                div.classList.add("pacman");
                pacmanIndex = y * 15 + x;
            }
            if (cell === " ") div.classList.add("path");

            grid.appendChild(div);
        });
    });
}

// Buttons
buttons.forEach(btn => {
    btn.addEventListener("click", () => {
        renderLevel(btn.dataset.level);
    });
});

// Default
renderLevel("easy");
