const area = document.getElementById("pacmanArea");
const pacman = document.getElementById("pacman");

let dots = [];
const DOT_COUNT = 8;
let lastSide = "left"; // merkt sich die Seite, von der Pac-Man zuletzt verschwunden ist

/* ================= PAC-MAN + GHOSTS ================= */
const ghostImages = [
    "assets/objects/ghosts/ghost_red.png", "assets/objects/ghosts/ghost_pink.png",
    "assets/objects/ghosts/ghost_cyan.png"
];

class Ghost {
    constructor(imgSrc, index) {
        this.el = document.createElement("img");
        this.el.src = imgSrc;
        this.el.className = "ghost";
        this.index = index;
        this.x = 0;
        this.active = false;
        this.el.style.position = "absolute";
        this.el.style.zIndex = "2";
        this.el.style.opacity = 0; // unsichtbar am Anfang
        area.appendChild(this.el);
    }

    spawn(x, dir) {
        this.x = x - (this.index + 1) * 45 * dir;
        this.el.style.left = this.x + "px";
        this.el.style.opacity = 1;
        this.el.style.transform = dir > 0 ? "scaleX(1)" : "scaleX(-1)";
        this.active = true;
    }

    hide() {
        this.active = false;
        this.el.style.opacity = 0;
    }

    update(targetX, dir) {
        if (!this.active) return;
        const target = targetX - (this.index + 1) * 45 * dir;
        this.x += (target - this.x) * 0.05;
        this.el.style.left = this.x + "px";
        this.el.style.transform = dir > 0 ? "scaleX(1)" : "scaleX(-1)";
    }

    isOutOfScreen() {
        return this.x < -60 || this.x > area.offsetWidth + 60;
    }
}

let ghosts = ghostImages.map((src, i) => new Ghost(src, i));

/* Pac-Man Linie */
let pacLine = {
    el: pacman,
    x: 0,
    direction: 0,
    active: false,
    delay: 0
};

pacman.style.position = "absolute";
pacman.style.zIndex = "3";
pacman.style.opacity = 1;
pacman.style.transform = "rotate(0deg)"; // schaut nach oben

/* ================= PUNKTE ================= */
function createDots() {
    dots.forEach(d => d.remove());
    dots = [];

    const totalWidth = (DOT_COUNT - 1) * 30;
    const startX = area.offsetWidth / 2 - totalWidth / 2;

    for (let i = 0; i < DOT_COUNT; i++) {
        const dot = document.createElement("div");
        dot.className = "dot";
        dot.style.width = "6px";
        dot.style.height = "6px";
        dot.style.borderRadius = "50%";
        dot.style.background = "yellow";
        dot.style.left = (startX + i * 30) + "px";
        dot.style.opacity = 0;
        dot.style.zIndex = "1";
        area.appendChild(dot);
        dots.push(dot);
    }

    fadeInDots();
}

function fadeInDots() {
    let alpha = 0;
    const fade = () => {
        alpha += 0.02;
        dots.forEach(dot => dot.style.opacity = Math.min(alpha, 1));
        if (alpha < 1) requestAnimationFrame(fade);
    };
    fade();
}

function eatDots() {
    const pacCenter = pacLine.x + pacman.offsetWidth / 2;
    for (let i = dots.length - 1; i >= 0; i--) {
        const dot = dots[i];
        const dotCenter = dot.offsetLeft + dot.offsetWidth / 2;
        if (Math.abs(dotCenter - pacCenter) < 6) {
            dot.remove();
            dots.splice(i, 1);
        }
    }
}

/* ================= INTRO ================= */
function startPacmanIntro(callback) {
    // Pac-Man mittig auf der Linie
    pacLine.x = area.offsetWidth / 2 - pacman.offsetWidth / 2;
    pacman.style.left = pacLine.x + "px";
    pacman.style.opacity = 1;
    pacman.style.transform = "rotate(0deg)"; // schaut nach oben

    // 1 Sekunde warten
    setTimeout(() => {
        // zufällige Richtung wählen
        pacLine.direction = Math.random() > 0.5 ? 1 : -1;
        pacman.style.transform = pacLine.direction > 0 ? "scaleX(1)" : "scaleX(-1)";
        pacLine.active = true;

        // Pac-Man läuft raus
        movePacmanOut(() => {
            lastSide = pacLine.direction > 0 ? "right" : "left";
            pacLine.active = false;

            // Jetzt erst startet die Loop nach kleiner Verzögerung
            setTimeout(callback, 500 + Math.random() * 1000);
        });
    }, 1000);
}

function movePacmanOut(callback) {
    function step() {
        pacLine.x += 2 * pacLine.direction;
        pacman.style.left = pacLine.x + "px";
        if (pacLine.x < -60 || pacLine.x > area.offsetWidth + 60) {
            callback();
        } else {
            requestAnimationFrame(step);
        }
    }
    requestAnimationFrame(step);
}

/* ================= LOOP ================= */
function spawnLine() {
    pacLine.active = true;

    if (lastSide === "left") {
        pacLine.direction = 1;
        pacLine.x = -50;
    } else {
        pacLine.direction = -1;
        pacLine.x = area.offsetWidth + 50;
    }

    pacman.style.left = pacLine.x + "px";
    pacman.style.transform = pacLine.direction > 0 ? "scaleX(1)" : "scaleX(-1)";
    pacman.style.opacity = 1;

    // Geister erscheinen erst jetzt
    ghosts.forEach(g => g.spawn(pacLine.x, pacLine.direction));

    // Punkte erzeugen
    createDots();
}

function updateLine() {
    if (!pacLine.active) {
        requestAnimationFrame(updateLine);
        return;
    }

    pacLine.x += 1.5 * pacLine.direction;
    pacman.style.left = pacLine.x + "px";

    eatDots();
    ghosts.forEach(g => g.update(pacLine.x, pacLine.direction));

    if (pacLine.x < -60 || pacLine.x > area.offsetWidth + 60) {
        const allGhostsOut = ghosts.every(g => g.isOutOfScreen());
        if (allGhostsOut) {
            pacLine.active = false;
            pacman.style.opacity = 0;
            ghosts.forEach(g => g.hide());
            lastSide = pacLine.direction > 0 ? "right" : "left";

            // kleine zufällige Verzögerung, dann nächste Linie
            setTimeout(spawnLine, 500 + Math.random() * 1000);
        }
    }

    requestAnimationFrame(updateLine);
}

/* ================= START ================= */
startPacmanIntro(() => {
    spawnLine();
});
updateLine();
