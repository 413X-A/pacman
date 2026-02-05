import {
    TILE_SIZE,
    PACMAN_GRID_original,
    PACMAN_GRID_busybee,
    PACMAN_GRID_fogmaze,
    PACMAN_GRID_crystal
} from "./assets/maps/pacman_grid.js";

document.addEventListener("DOMContentLoaded", () => {
    const SPEED = TILE_SIZE / 32.5;
    const PACMAN_SPEED = TILE_SIZE / 65;

    // ================= USER & SETTINGS =================
    let users = JSON.parse(localStorage.getItem("pac_users") || "{}");
    const activeUser = localStorage.getItem("pac_active_user");
    const userData = users[activeUser] || {};
    const gameSettings = userData.game_settings || {};
    const herausforderungList = userData.herausforderung_list || [];
    const herausforderungAktiv = gameSettings.herausforderung_aktiv;

    // ================= MAP & THEME =================
    let PACMAN_GRID = PACMAN_GRID_original;
    let theme = "original";

    function setMapAndTheme(mapKey, explicitTheme) {
        switch (mapKey) {
            case "crystal":
                PACMAN_GRID = PACMAN_GRID_crystal;
                theme = explicitTheme || "original";
                break;
            case "fogmaze":
                PACMAN_GRID = PACMAN_GRID_fogmaze;
                theme = explicitTheme || "original";
                break;
            case "busybee":
                PACMAN_GRID = PACMAN_GRID_busybee;
                theme = explicitTheme || "original";
                break;
            default:
                PACMAN_GRID = PACMAN_GRID_original;
                theme = explicitTheme || "original";
        }
    }

    if (herausforderungAktiv) {
        const activeChallenge = herausforderungList.find(c => c.aktiv) || {};
        const mapChoice = activeChallenge.map || "original";
        const explicitTheme = activeChallenge.theme;
        setMapAndTheme(mapChoice, explicitTheme);
    } else {
        const mapChoice = gameSettings.map || "original";
        const explicitTheme = gameSettings.theme;
        setMapAndTheme(mapChoice, explicitTheme);
    }

    // ================= BOARD =================
    const board = document.getElementById("board");
    const rows = PACMAN_GRID.length;
    const cols = PACMAN_GRID[0].length;

    board.style.position = "relative";
    board.style.display = "grid";
    board.style.gridTemplateRows = `repeat(${rows}, ${TILE_SIZE}px)`;
    board.style.gridTemplateColumns = `repeat(${cols}, ${TILE_SIZE}px)`;
    board.style.width = `${cols * TILE_SIZE}px`;
    board.style.height = `${rows * TILE_SIZE}px`;
    board.className = `board theme-${theme}`;

    // ================= GRID RENDER =================
    PACMAN_GRID.forEach((row, y) => {
        row.forEach((type, x) => {
            const cell = document.createElement("div");
            cell.classList.add("cell");

            if (type === 1) cell.classList.add("wall");
            if ([0, 2, 6, 8].includes(type)) cell.classList.add("path");
            if ([0, 6, 8].includes(type)) {
                const dot = document.createElement("div");
                dot.classList.add("dot");
                cell.appendChild(dot);
            }
            if ([2, 6].includes(type)) {
                const auswahl = document.createElement("div");
                auswahl.classList.add("auswahl");
                cell.appendChild(auswahl);
            }
            if (type === 2) {
                const powerup = document.createElement("div");
                powerup.classList.add("powerup");
                cell.appendChild(powerup);
            }
            if (type === 5) {
                const teleporter = document.createElement("div");
                teleporter.classList.add("teleporter");
                cell.appendChild(teleporter);
            }
            if (type === 7) cell.classList.add("pacman-start");
            if (type === 3) cell.classList.add("ghost-start");
            if (type === 4) cell.classList.add("ghost-door");

            board.appendChild(cell);
        });
    });

    // ================= HELPERS =================
const DIRS = { up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 } };

function isWall(x, y) {
    return PACMAN_GRID[y]?.[x] === 1;
}

// Ghosts behandeln Teleporter immer wie Wand
function isGhostBlocked(x, y) {
    if (isWall(x, y)) return true;
    if (PACMAN_GRID[y]?.[x] === 5) return true; // Teleporter = Wand für Ghosts
    return false;
}

function isDecision(x, y) {
    const cell = board.children[y * cols + x];
    return cell?.querySelector(".auswahl") !== null;
}

function isOneTimeDecision(x, y) {
    return PACMAN_GRID[y]?.[x] === 8;
}

function getChaseDistanceByDifficulty() {
    if (herausforderungAktiv) {
        const c = herausforderungList.find(c => c.aktiv);
        if (c?.difficulty) return getChaseDistanceFromDiff(c.difficulty);
    }
    return getChaseDistanceFromDiff(gameSettings.difficulty || "easy");
}

function getChaseDistanceFromDiff(diff) {
    return { easy: 25, normal: 20, hard: 15, insane: 10 }[diff] ?? 25;
}

// ================= TELEPORT =================
let lastTeleportTime = 0;
const currentUser = activeUser;

function checkPacmanTeleporter(pacman) {
    const now = Date.now();
    const teleporterDuration = (users[currentUser]?.stats?.teleporter_duration || 10) * 1000;
    const cooldownActive = now - lastTeleportTime < teleporterDuration;

    // Teleporter nur optisch blockieren, Ghosts werden immer blockiert
    PACMAN_GRID.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell === 5) {
                const domCell = board.children[y * cols + x];
                if (!domCell) return;

                if (cooldownActive) domCell.classList.add("wall"); // Pacman sieht Wand
                else domCell.classList.remove("wall");             // Pacman kann wieder durch
            }
        });
    });

    const cellValue = PACMAN_GRID[pacman.gridY]?.[pacman.gridX];
    if (cellValue !== 5) return;  // Pacman ist nicht auf Teleporter
    if (cooldownActive) return;   // Teleporter im Cooldown, blockiert Pacman optisch

    // Teleport Pacman
    if (pacman.gridX === 0) pacman.gridX = cols - 1;
    else if (pacman.gridX === cols - 1) pacman.gridX = 0;
    pacman.x = pacman.gridX * TILE_SIZE + TILE_SIZE / 2;
    lastTeleportTime = now;
}


    // ================= ENTITY =================
    class Entity {
        constructor(imgSrc, startX, startY, className) {
            this.gridX = startX;
            this.gridY = startY;
            this.x = startX * TILE_SIZE + TILE_SIZE / 2;
            this.y = startY * TILE_SIZE + TILE_SIZE / 2;
            this.dir = "up";
            this.nextDir = "up";
            this.leftHouse = false;
            this.el = document.createElement("img");
            this.el.src = imgSrc;
            this.el.className = className;
            this.el.style.position = "absolute";
            this.el.style.width = TILE_SIZE + "px";
            this.el.style.height = TILE_SIZE + "px";
            this.el.style.transform = "translate(-50%, -50%)";
            board.appendChild(this.el);
            this.render();
        }

        render() {
            this.el.style.left = this.x + "px";
            this.el.style.top = this.y + "px";
            this.el.style.transform = `translate(-50%, -50%) ${this.dir === "left" ? "scaleX(-1)" : "scaleX(1)"}`;
        }

        atCenter() {
            const cx = this.gridX * TILE_SIZE + TILE_SIZE / 2;
            const cy = this.gridY * TILE_SIZE + TILE_SIZE / 2;
            return Math.abs(this.x - cx) < SPEED / 2 && Math.abs(this.y - cy) < SPEED / 2;
        }

        canMove(dir, forGhost = false) {
    const d = DIRS[dir];
    const targetX = this.gridX + d.x;
    const targetY = this.gridY + d.y;

    // außerhalb des Grids
    if (targetX < 0 || targetX >= cols || targetY < 0 || targetY >= rows) return false;

    if (forGhost) {
        // Ghosts: Teleporter immer blockieren wie Wand
        if (isWall(targetX, targetY) || PACMAN_GRID[targetY]?.[targetX] === 5) return false;
        return true;
    }

    // Pacman: normale Logik, Teleporter nur blockieren, wenn Cooldown aktiv
    const cellValue = PACMAN_GRID[targetY]?.[targetX];
    if (cellValue === 1) return false;
    if (cellValue === 5) {
        const domCell = board.children[targetY * cols + targetX];
        if (domCell?.classList.contains("wall")) return false;
    }

    return true;
}


        move() {
    // Unterschiedliche Geschwindigkeit für Pacman und Ghosts
    let currentSpeed = SPEED; // default = Ghosts
    if (this.el.classList.contains("pacman")) {
        currentSpeed = PACMAN_SPEED; // langsamer
    }
    if (this.slowUntil && Date.now() < this.slowUntil) currentSpeed /= 3.5;

    if (this.atCenter()) {
        if (this.nextDir && this.canMove(this.nextDir)) this.dir = this.nextDir;
        if (!this.canMove(this.dir)) {
            this.x = this.gridX * TILE_SIZE + TILE_SIZE / 2;
            this.y = this.gridY * TILE_SIZE + TILE_SIZE / 2;
            return;
        }
    }

    const d = DIRS[this.dir];
    this.x += d.x * currentSpeed;
    this.y += d.y * currentSpeed;
    this.gridX = Math.floor(this.x / TILE_SIZE);
    this.gridY = Math.floor(this.y / TILE_SIZE);
    this.render();
}

    }

    // ================= PACMAN =================
    let pacStartX = 0, pacStartY = 0;
    PACMAN_GRID.forEach((r, y) => r.forEach((v, x) => { if (v === 7) { pacStartX = x; pacStartY = y } }));
    const pacman = new Entity("assets/objects/pacman.png", pacStartX, pacStartY, "pacman");

    document.addEventListener("keydown", e => {
        if (e.key === "ArrowUp") pacman.nextDir = "up";
        if (e.key === "ArrowDown") pacman.nextDir = "down";
        if (e.key === "ArrowLeft") pacman.nextDir = "left";
        if (e.key === "ArrowRight") pacman.nextDir = "right";
    });

    // ================= GHOSTS =================
    const ghostImages = [
        "assets/objects/ghost_red.png", "assets/objects/ghost_pink.png",
        "assets/objects/ghost_cyan.png", "assets/objects/ghost_orange.png",
        "assets/objects/ghost_neongreen.png", "assets/objects/ghost_brightviolet.png",
        "assets/objects/ghost_turquoisegreen.png", "assets/objects/ghost_goldenyellow.png",
        "assets/objects/ghost_neonpink.png", "assets/objects/ghost_electricblue.png",
        "assets/objects/ghost_magentared.png", "assets/objects/ghost_toxicgreen.png",
        "assets/objects/ghost_blueviolet.png", "assets/objects/ghost_iceblue.png",
        "assets/objects/ghost_neonorange.png", "assets/objects/ghost_acidyellowgreen.png"
    ];

    let anzGeister = herausforderungAktiv
        ? (herausforderungList.find(c => c.aktiv)?.anz_ghosts ?? 3)
        : ({ easy: 2, normal: 4, hard: 6, insane: 8 }[gameSettings.difficulty] || 2);

    const ghostStartPositions = [];
    PACMAN_GRID.forEach((r, y) => r.forEach((v, x) => { if (v === 3) ghostStartPositions.push({ x, y }) }));

    const ghosts = [];
    const ghostFirstChoiceDone = new WeakMap();

    function spawnGhostsSerially() {
    let spawned = 0;
    const totalSlots = ghostStartPositions.length;

    function spawnNext() {
        if (spawned >= anzGeister) return;

        const slot = ghostStartPositions[spawned % totalSlots];
        const img = ghostImages[spawned % ghostImages.length];

        const g = new Entity(img, slot.x, slot.y, "ghost");
        g.el.style.zIndex = "11";

        // === STARTZUSTAND ===
        g.gridX = slot.x;
        g.gridY = slot.y;
        g.x = slot.x * TILE_SIZE + TILE_SIZE / 2;
        g.y = slot.y * TILE_SIZE + TILE_SIZE / 2;

        g.dir = "up";
        g.nextDir = "up";

        g.leftHouse = false;
        g.firstMovePending = true;

        g.biasChance = 0.5;
        g.edible = false;
        g.slowUntil = 0;

        ghostFirstChoiceDone.delete(g);

        ghosts.push(g);
        spawned++;

        if (spawned >= totalSlots) setTimeout(spawnNext, 1000);
        else spawnNext();
    }

    spawnNext();
}
    spawnGhostsSerially();

    // ================= BFS FÜR KÜRZESTEN WEG =================
function findShortestPath(sx, sy, tx, ty, forGhost = false) {
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    const queue = [{ x: sx, y: sy, path: [] }];
    const walkable = [0, 2, 6, 7, 8]; // normale Felder

    while (queue.length) {
        const { x, y, path } = queue.shift();
        if (x === tx && y === ty) return path;
        if (visited[y][x]) continue;
        visited[y][x] = true;

        for (const [dir, d] of Object.entries(DIRS)) {
            const nx = x + d.x;
            const ny = y + d.y;

            if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;

            // Für Ghosts: Teleporter immer blockieren
            if (forGhost && (PACMAN_GRID[ny][nx] === 1 || PACMAN_GRID[ny][nx] === 5)) continue;

            // Normale Felder prüfen
            if (!forGhost && !walkable.includes(PACMAN_GRID[ny][nx])) continue;

            if (!visited[ny][nx]) {
                queue.push({ x: nx, y: ny, path: path.concat(dir) });
            }
        }
    }

    return [];
}

// ================= GHOST DIRECTION MIT BIAS UND UMWEGEN =================
function chooseGhostDirection(g) {
    const options = Object.keys(DIRS).filter(d => g.canMove(d, true)); // Ghost-spezifisch
if (options.length === 0) return; // Keine Bewegungsmöglichkeiten


    const dx = pacman.gridX - g.gridX;
    const dy = pacman.gridY - g.gridY;
    const distance = Math.abs(dx) + Math.abs(dy);
    const chaseDistance = getChaseDistanceByDifficulty();

    // Bias zurücksetzen, wenn Ghost außerhalb Chase-Distanz
    if (distance > chaseDistance) {
        g.biasChance = 0.65; // Standardwert
    }

    const errorChance = 0.35; // 35% Chance, alternative Wege zu wählen
    const detourChance = 0.2; // 20% Chance, einen kleinen Umweg zu gehen

    if (Math.random() < g.biasChance) {
        const path = findShortestPath(g.gridX, g.gridY, pacman.gridX, pacman.gridY, true);

        if (path.length > 0) {
            let nextStep = path[0];

            // Zufällige Fehler: alternative Wege
            if (Math.random() < errorChance) {
                const alternatives = options.filter(d => d !== nextStep);
                if (alternatives.length > 0) nextStep = alternatives[Math.floor(Math.random() * alternatives.length)];
            }

            // Kleine Umwege einbauen, damit Ghosts nicht alle in einer Linie laufen
            if (Math.random() < detourChance) {
                const detours = options.filter(d => d !== nextStep);
                if (detours.length > 0) nextStep = detours[Math.floor(Math.random() * detours.length)];
            }

            g.nextDir = nextStep;
        }

        // Bias-Chance langsam verringern
        g.biasChance = Math.max(0, g.biasChance - 0.05);
    } else {
        // Random-Weg, falls Bias nicht greift
        g.nextDir = options[Math.floor(Math.random() * options.length)];
    }

    // Kleine Verzögerung, um Bewegungen weniger synchron wirken zu lassen
    g.slowUntil = Date.now() + 50 + Math.random() * 50;
}





    function gameLoop() {
        pacman.move();

        // ================= PACMAN POWERUP CHECK =================
function checkPacmanPowerup(pacman) {
    const x = pacman.gridX;
    const y = pacman.gridY;

    if (PACMAN_GRID[y]?.[x] === 2) {
        // Powerup von Grid entfernen
        PACMAN_GRID[y][x] = 0;

        // Powerup DOM entfernen
        const cell = board.children[y * cols + x];
        const powerupEl = cell.querySelector(".powerup");
        if (powerupEl) cell.removeChild(powerupEl);

        // Powerup.js Funktion aufrufen
        if (typeof window.onPowerupCollected === "function") {
            window.onPowerupCollected(pacman, ghosts, PACMAN_GRID, board, TILE_SIZE);
        }
    }
}
        pacman.move();
checkPacmanTeleporter(pacman);
checkPacmanPowerup(pacman); // <-- hier prüfen

        ghosts.forEach(g => {

    // ================= ESSBARE GHOSTS =================
    if (g.edible) {
        const dx = g.x - pacman.x;
        const dy = g.y - pacman.y;
        const distance = Math.hypot(dx, dy);

        if (distance < TILE_SIZE / 2) {
            g.el.style.display = "none";
            g.edible = false;
            setTimeout(() => respawnGhost(g), 1000);
            return;
        }
    }

    // ================= IM HAUS =================
    if (!g.leftHouse) {
        if (g.atCenter()) {
            // IMMER nach oben raus
            if (!isGhostBlocked(g.gridX, g.gridY - 1)) {
                g.nextDir = "up";
            } else {
                const sides = ["left", "right"].filter(d =>
                    !isGhostBlocked(
                        d === "left" ? g.gridX - 1 : g.gridX + 1,
                        g.gridY
                    )
                );
                if (sides.length) {
                    g.nextDir = sides[Math.floor(Math.random() * sides.length)];
                }
            }

            // Haus verlassen
            if (g.gridY < 8) {
                g.leftHouse = true;
                g.firstMovePending = false;
            }
        }
    }

    // ================= DRAUSSEN =================
    else {

        // === ONE-TIME-DECISION NUR AUF FELD 8 ===
        if (
            g.atCenter() &&
            isOneTimeDecision(g.gridX, g.gridY) &&
            !ghostFirstChoiceDone.get(g)
        ) {
            const canLeft = !isGhostBlocked(g.gridX - 1, g.gridY);
            const canRight = !isGhostBlocked(g.gridX + 1, g.gridY);

            if (canLeft && canRight) {
                g.nextDir = Math.random() < 0.5 ? "left" : "right";
            } else if (canLeft) {
                g.nextDir = "left";
            } else if (canRight) {
                g.nextDir = "right";
            }

            ghostFirstChoiceDone.set(g, true);
        }

        // === NORMALE KI-ENTSCHEIDUNG ===
        if (g.atCenter() && isDecision(g.gridX, g.gridY)) {
            chooseGhostDirection(g);
        }
    }

    g.move();
});




        requestAnimationFrame(gameLoop);
    }

    gameLoop();
});
