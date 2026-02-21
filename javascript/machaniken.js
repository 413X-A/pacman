// mechaniken.js
import {
    TILE_SIZE,
    PACMAN_GRID_original,
    PACMAN_GRID_busybee,
    PACMAN_GRID_fogmaze,
    PACMAN_GRID_crystal
} from "../assets/maps/pacman_grid.js";

import {
    PunkteSystem,
    triggerGameOver
} from "../javascript/punkte.js";

import {
    initGhostReproduction,
    checkGhostReproductionPacmanCollision
} from "../javascript/ghost_reproduction.js";



const PACMAN_SPRITES = {
    left: {
        open: "assets/objects/pacman/pacman_left_open.png",
        closed: "assets/objects/pacman/pacman_left_closed.png"
    },
    right: {
        open: "assets/objects/pacman/pacman_right_open.png",
        closed: "assets/objects/pacman/pacman_right_closed.png"
    },
    up: {
        open: "assets/objects/pacman/pacman_up_open.png",
        closed: "assets/objects/pacman/pacman_up_closed.png"
    },
    down: {
        open: "assets/objects/pacman/pacman_down_open.png",
        closed: "assets/objects/pacman/pacman_down_closed.png"
    }
};


document.addEventListener("DOMContentLoaded", () => {
    const SPEED = TILE_SIZE / 32.5;
    const PACMAN_SPEED = TILE_SIZE / 30;

    // ================= USER & SETTINGS =================
    let users = JSON.parse(localStorage.getItem("pac_users") || "{}");
    const activeUser = localStorage.getItem("pac_active_user");
    const userData = users[activeUser] || {};
    const gameSettings = userData.game_settings || {};
    const herausforderungList = userData.herausforderung_list || [];
    const herausforderungAktiv = gameSettings.herausforderung_aktiv;

    // ================= GHOST SETTINGS =================
    const GHOST_SETTINGS = {
        dead: false,
        reproduction: false
    };

    if (herausforderungAktiv) {
        const aktiveChallenge = herausforderungList.find(c => c.aktiv);
        if (aktiveChallenge) {
            GHOST_SETTINGS.dead = aktiveChallenge.ghosts_dead ?? false;
            GHOST_SETTINGS.reproduction = aktiveChallenge.ghosts_reproduction ?? false;
        }
    } else {
        GHOST_SETTINGS.dead = userData.settings?.ghosts_dead ?? false;
        GHOST_SETTINGS.reproduction = userData.settings?.ghosts_reproduction ?? false;
    }


    // ================= TELEPORTER SETTINGS (GLOBAL AUFGELÖST) =================
    function getTeleporterSettings() {
        if (herausforderungAktiv) {
            const activeChallenge = herausforderungList.find(h => h.aktiv);
            if (activeChallenge) {
                return {
                    aktiv: !!activeChallenge.teleporter_aktiv,
                    pacman: !!activeChallenge.teleporter_pacman,
                    ghosts: !!activeChallenge.teleporter_ghosts
                };
            }
        }

        // Fallback: normale Spielereinstellungen
        return {
            aktiv: !!users[activeUser]?.settings?.teleporter_aktiv,
            pacman: !!users[activeUser]?.settings?.teleporter_pacman,
            ghosts: !!users[activeUser]?.settings?.teleporter_ghosts
        };
    }

    const TELEPORTER_SETTINGS = getTeleporterSettings();


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

                // 💡 Powerup-Blinken
                const users = JSON.parse(localStorage.getItem("pac_users") || "{}");
                const activeUser = localStorage.getItem("pac_active_user");
                const blinkEnabled = !!users[activeUser]?.settings?.powerup_blinken;

                if (blinkEnabled) {
                    let visible = true;
                    setInterval(() => {
                        visible = !visible;
                        powerup.style.opacity = visible ? "1" : "0.65";
                    }, 500);
                }
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

    // ================= Pacman-Check =================

    function isGhostBlocked(x, y) {
        const cell = PACMAN_GRID[y]?.[x];

        if (cell === 1) return true;

        // Teleporter nur blockieren, wenn Ghost-Teleport AUS
        if (cell === 5 && !TELEPORTER_SETTINGS.ghosts) return true;

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
        const teleporterDuration =
            (users[currentUser]?.stats?.teleporter_duration || 10) * 1000;

        const canPacmanTeleport = TELEPORTER_SETTINGS.aktiv && TELEPORTER_SETTINGS.pacman &&
            (now - lastTeleportTime >= teleporterDuration);

        // === VISUELLE DARSTELLUNG ===
        PACMAN_GRID.forEach((row, y) => {
            row.forEach((cell, x) => {
                if (cell === 5) {
                    const domCell = board.children[y * cols + x];
                    if (!domCell) return;

                    // ❌ Wall nur zeigen, wenn PacMan blockiert UND Ghosts auch blockiert sind
                    const ghostBlocked = !TELEPORTER_SETTINGS.ghosts;
                    domCell.classList.toggle("wall", !canPacmanTeleport && ghostBlocked);
                }
            });
        });

        // ❌ PacMan darf nicht teleportieren → abbrechen
        if (!canPacmanTeleport) return;

        if (!pacman.atCenter()) return;

        const cellValue = PACMAN_GRID[pacman.gridY]?.[pacman.gridX];
        if (cellValue !== 5) return;

        // === Teleport
        if (pacman.gridX === 0) pacman.gridX = cols - 1;
        else if (pacman.gridX === cols - 1) pacman.gridX = 0;

        pacman.x = pacman.gridX * TILE_SIZE + TILE_SIZE / 2;
        pacman.y = pacman.gridY * TILE_SIZE + TILE_SIZE / 2;

        lastTeleportTime = now;
    }




    function checkGhostTeleporter(ghost) {
        if (!TELEPORTER_SETTINGS.ghosts) return;

        const now = Date.now();
        const cooldown = 50; // Minimaler Abstand zwischen Teleporten

        if (!ghost.lastTeleportTime) ghost.lastTeleportTime = 0;
        if (now - ghost.lastTeleportTime < cooldown) return;

        const cellValue = PACMAN_GRID[ghost.gridY]?.[ghost.gridX];
        if (cellValue !== 5) return;

        let exitX = null;

        if (ghost.gridX === 0) {
            exitX = cols - 2;
            ghost.dir = "right";
            ghost.lastDirBeforeTeleport = ghost.dir;
            ghost.blockReverseUntilDecision = true;
        } else if (ghost.gridX === cols - 1) {
            exitX = 1;
            ghost.dir = "left";
        } else return;

        ghost.nextDir = ghost.dir;
        ghost.gridX = exitX;
        ghost.x = ghost.gridX * TILE_SIZE + TILE_SIZE / 2;
        ghost.y = ghost.gridY * TILE_SIZE + TILE_SIZE / 2;

        ghost.lastTeleportTime = now;
        ghost.render();
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
            this.firstMovePending = true;

            // === PACMAN ANIMATION ===
            this.isPacman = className === "pacman";
            this.mouthOpen = true;
            this.lastAnimSwitch = 0;
            this.animInterval = 120;
            this.lastDir = "right";


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
            this.el.style.transform = "translate(-50%, -50%)";
        }

        atCenter() {
            const cx = this.gridX * TILE_SIZE + TILE_SIZE / 2;
            const cy = this.gridY * TILE_SIZE + TILE_SIZE / 2;
            return Math.abs(this.x - cx) < SPEED / 2 &&
                Math.abs(this.y - cy) < SPEED / 2;
        }

        canMove(dir, forGhost = false) {
            const d = DIRS[dir];
            const tx = this.gridX + d.x;
            const ty = this.gridY + d.y;

            if (tx < 0 || tx >= cols || ty < 0 || ty >= rows) return false;
            const cell = PACMAN_GRID[ty][tx];

            if (forGhost) {
                if (cell === 1) return false;         // Wand
                if (cell === 5 && !TELEPORTER_SETTINGS.ghosts) return false; // Teleporter blockieren
                return true;                          // Ghost darf durch
            }

            // ================= PACMAN =================
            if (cell === 1 || cell === 4) return false; // Wand / Ghost-Door

            // Teleporter-Feld
            if (cell === 5) {
                if (!TELEPORTER_SETTINGS.aktiv || !TELEPORTER_SETTINGS.pacman) return false;
                const now = Date.now();
                const duration = (users[currentUser]?.stats?.teleporter_duration || 10) * 1000;
                if (now - lastTeleportTime < duration) return false;
            }

            return true;
        }



        move() {
            let speed = this.el.classList.contains("pacman")
                ? PACMAN_SPEED
                : SPEED;

            const isGhost = this.el.classList.contains("ghost");
            let moved = false;

            if (this.atCenter()) {
                if (this.nextDir && this.canMove(this.nextDir, isGhost)) {
                    this.dir = this.nextDir;
                }
                if (!this.canMove(this.dir, isGhost)) return;
            }

            const d = DIRS[this.dir];
            this.x += d.x * speed;
            this.y += d.y * speed;
            this.gridX = Math.floor(this.x / TILE_SIZE);
            this.gridY = Math.floor(this.y / TILE_SIZE);
            moved = true;

            this.render();

            // ================= PACMAN MUND + RICHTUNG =================
            if (this.isPacman && moved) {
                const now = Date.now();

                if (now - this.lastAnimSwitch > this.animInterval) {
                    this.mouthOpen = !this.mouthOpen;

                    const dir = this.dir || this.lastDir;
                    this.lastDir = dir;

                    const sprite = PACMAN_SPRITES[dir];
                    if (sprite) {
                        this.el.src = this.mouthOpen
                            ? sprite.open
                            : sprite.closed;
                    }

                    this.lastAnimSwitch = now;
                }
            }
        }
    }

    window.SpawnGhostExtern = function (x, y, ghosts, imgSrc = null) {
        // Immer das Reproduktionsbild verwenden
        imgSrc = "assets/objects/ghosts/ghost_dead.png";

        const g = new Entity(imgSrc, x, y, "ghost");
        g.el.style.zIndex = "11";
        g.nextDir = "up";
        g.biasChance = 0.5;

        // Ghost ist sofort tot
        g.edible = false;
        g.dead = true;
        g.permanent_dead = true;
        g.firstMovePending = true;

        ghosts.push(g);
    };





    // ================= PACMAN =================
    let pacStartX = 0, pacStartY = 0;
    PACMAN_GRID.forEach((r, y) =>
        r.forEach((v, x) => { if (v === 7) { pacStartX = x; pacStartY = y; } })
    );

    const pacman = new Entity(
        PACMAN_SPRITES.right.open,
        pacStartX,
        pacStartY,
        "pacman"
    );
    pacman.el.style.zIndex = "12";


    const punkteSystem = new PunkteSystem(board, pacman, TILE_SIZE);


// ================= KEYBOARD + MOBILE CONTROL =================
document.addEventListener("keydown", e => {
    if (e.key === "ArrowUp") pacman.nextDir = "up";
    if (e.key === "ArrowDown") pacman.nextDir = "down";
    if (e.key === "ArrowLeft") pacman.nextDir = "left";
    if (e.key === "ArrowRight") pacman.nextDir = "right";

    if (e.key === "w") pacman.nextDir = "up";
    if (e.key === "s") pacman.nextDir = "down";
    if (e.key === "a") pacman.nextDir = "left";
    if (e.key === "d") pacman.nextDir = "right";
});


// ================= MOBILE SWIPE CONTROL =================
let touchStartX = 0;
let touchStartY = 0;
const swipeThreshold = 30; // Mindest-Wischdistanz

document.addEventListener("touchstart", (e) => {
    const touch = e.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}, { passive: true });

document.addEventListener("touchend", (e) => {
    const touch = e.changedTouches[0];

    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;

    // Wenn kaum Bewegung → ignorieren
    if (Math.abs(dx) < swipeThreshold && Math.abs(dy) < swipeThreshold) return;

    if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal
        pacman.nextDir = dx > 0 ? "right" : "left";
    } else {
        // Vertikal
        pacman.nextDir = dy > 0 ? "down" : "up";
    }
}, { passive: true });

    // ================= GHOSTS =================
    const ghostImages = [
        "assets/objects/ghosts/ghost_red.png", "assets/objects/ghosts/ghost_pink.png",
        "assets/objects/ghosts/ghost_cyan.png", "assets/objects/ghosts/ghost_orange.png",
        "assets/objects/ghosts/ghost_neongreen.png", "assets/objects/ghosts/ghost_brightviolet.png",
        "assets/objects/ghosts/ghost_turquoisegreen.png", "assets/objects/ghosts/ghost_goldenyellow.png",
        "assets/objects/ghosts/ghost_neonpink.png", "assets/objects/ghosts/ghost_electricblue.png",
        "assets/objects/ghosts/ghost_magentared.png", "assets/objects/ghosts/ghost_toxicgreen.png",
        "assets/objects/ghosts/ghost_blueviolet.png", "assets/objects/ghosts/ghost_iceblue.png",
        "assets/objects/ghosts/ghost_neonorange.png", "assets/objects/ghosts/ghost_acidyellowgreen.png"
    ];

    let anzGeister = herausforderungAktiv
        ? (herausforderungList.find(c => c.aktiv)?.anz_ghosts ?? 3)
        : ({ easy: 2, normal: 4, hard: 6, insane: 8 }[gameSettings.difficulty] || 2);

    const ghostStartPositions = [];
    PACMAN_GRID.forEach((r, y) => r.forEach((v, x) => { if (v === 3) ghostStartPositions.push({ x, y }) }));

    const ghosts = [];
    const ghostFirstChoiceDone = new WeakMap();

    function respawnGhostInHouse(g) {
        // ------------------- STARTPOSITION IM HAUS -------------------
        const house = [];
        PACMAN_GRID.forEach((r, y) =>
            r.forEach((v, x) => { if (v === 3) house.push({ x, y }); })
        );
        if (!house.length) return;

        const pos = house[Math.floor(Math.random() * house.length)];
        g.gridX = pos.x;
        g.gridY = pos.y;
        g.x = g.gridX * TILE_SIZE + TILE_SIZE / 2;
        g.y = g.gridY * TILE_SIZE + TILE_SIZE / 2;
        g.dir = "up";
        g.nextDir = "up";
        g.leftHouse = false;
        g.firstMovePending = true;
        g.dead = false; // Ghost ist aktiv fürs Haus-Verlassen
        g.el.style.display = "block";

        // ------------------- SPIELER SETTINGS -------------------
        const users = JSON.parse(localStorage.getItem("pac_users") || "{}");
        const activeUser = localStorage.getItem("pac_active_user");
        const settings = users[activeUser]?.settings || {};

        // ------------------- TOT STATUS & POWERUP -------------------
        if (settings.ghosts_dead) {
            g.edible = false;
            g.permanent_dead = true;
            g.el.src = "assets/objects/ghosts/ghost_dead.png";
        } else {
            // Normale Geister: Powerup-Dauer übernehmen, falls gerade aktiv
            if (window.currentPowerupEnd && window.currentPowerupEnd > Date.now()) {
                g.edible = true;
                g.edibleUntil = window.currentPowerupEnd;
                if (!g.originalImg) g.originalImg = g.el.src;
                g.el.src = "assets/objects/ghosts/ghost_edible.png";
            } else {
                g.edible = false;
                if (!g.originalImg) g.originalImg = g.el.src;
                g.el.src = g.originalImg;
            }
        }

        // ------------------- ONE-TIME DECISION RESET -------------------
        ghostFirstChoiceDone.delete(g);
    }


    function spawnGhostsSerially() {
        let spawned = 0;
        const totalSlots = ghostStartPositions.length;
        let nextImgIndex = 0; // neuer Index für das nächste Bild

        function spawnNext() {
            if (spawned >= anzGeister) return;

            const slot = ghostStartPositions[spawned % totalSlots];

            // Nächstes Bild in der Liste
            const img = ghostImages[nextImgIndex];
            nextImgIndex = (nextImgIndex + 1) % ghostImages.length; // zyklisch weiter

            const g = new Entity(img, slot.x, slot.y, "ghost");
            g.el.style.zIndex = "11";
            g.nextDir = "up";
            g.biasChance = 0.5;
            g.edible = false;
            g.permanent_dead = false;
            g.firstMovePending = true;

            // Originalbild sichern
            g.originalImg = img;

            ghosts.push(g);
            spawned++;

            if (spawned >= totalSlots) setTimeout(spawnNext, 1000);
            else spawnNext();
        }

        spawnNext();
    }
    spawnGhostsSerially();


    // ================= GHOST REPRODUCTION INIT =================
    initGhostReproduction({
        enabled: GHOST_SETTINGS.reproduction,
        board,
        pacman,
        ghosts,
        grid: PACMAN_GRID,
        cols,
        tileSize: TILE_SIZE
    });




    // ================= BFS =================
    function findShortestPath(sx, sy, tx, ty, forGhost = false) {
        const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
        const queue = [{ x: sx, y: sy, path: [] }];
        const walkable = [0, 2, 6, 7, 8];
        while (queue.length) {
            const { x, y, path } = queue.shift();
            if (x === tx && y === ty) return path;
            if (visited[y][x]) continue;
            visited[y][x] = true;
            for (const [dir, d] of Object.entries(DIRS)) {
                const nx = x + d.x, ny = y + d.y;
                if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;
                if (forGhost && PACMAN_GRID[ny][nx] === 1) continue;
                if (forGhost && PACMAN_GRID[ny][nx] === 5 && !TELEPORTER_SETTINGS.ghosts) continue;

                if (!forGhost && !walkable.includes(PACMAN_GRID[ny][nx])) continue;
                if (!visited[ny][nx]) queue.push({ x: nx, y: ny, path: path.concat(dir) });
            }
        }
        return [];
    }

    // ================= GHOST LOGIK =================
    function chooseGhostDirection(g) {
        let options = Object.keys(DIRS).filter(d => g.canMove(d, true));
        if (!options.length) return;

        if (g.blockReverseUntilDecision && g.lastDirBeforeTeleport) {
            const weiter = {
                left: "left",
                right: "right",
                up: "up",
                down: "down"
            }[g.lastDirBeforeTeleport];

            options = options.filter(d => d !== weiter);

            if (!options.length) {
                options = Object.keys(DIRS).filter(d => g.canMove(d, true));
            }
        }
        const dx = pacman.gridX - g.gridX;
        const dy = pacman.gridY - g.gridY;
        const distance = Math.abs(dx) + Math.abs(dy);
        const chaseDistance = getChaseDistanceByDifficulty();
        if (distance > chaseDistance) g.biasChance = 0.65;
        const errorChance = 0.35, detourChance = 0.2;
        if (Math.random() < g.biasChance) {
            const path = findShortestPath(g.gridX, g.gridY, pacman.gridX, pacman.gridY, true);
            if (path.length > 0) {
                let nextStep = path[0];
                if (Math.random() < errorChance) {
                    const alt = options.filter(d => d !== nextStep);
                    if (alt.length > 0) nextStep = alt[Math.floor(Math.random() * alt.length)];
                }
                if (Math.random() < detourChance) {
                    const detours = options.filter(d => d !== nextStep);
                    if (detours.length > 0) nextStep = detours[Math.floor(Math.random() * detours.length)];
                }
                g.nextDir = nextStep;
            }
            g.biasChance = Math.max(0, g.biasChance - 0.05);
        } else g.nextDir = options[Math.floor(Math.random() * options.length)];
        g.slowUntil = Date.now() + 50 + Math.random() * 50;

        g.blockReverseUntilDecision = false;
    }

    // ================= GAME LOOP =================
    function gameLoop() {
        pacman.move();
        checkPacmanTeleporter(pacman);
        punkteSystem.checkDots(PACMAN_GRID, cols);

        // Powerup prüfen
        // Powerup prüfen
        if (typeof window.onPowerupCollected === "function") {
            const gx = pacman.gridX;
            const gy = pacman.gridY;

            const cell = board.children[gy * cols + gx];

            if (cell) {
                const pEl = cell.querySelector(".powerup");

                if (pEl) {
                    // ✅ +1 EXP GENAU EINMAL
                    const activeUser = localStorage.getItem("pac_active_user");
                    const users = JSON.parse(localStorage.getItem("pac_users")) || {};

                    if (users[activeUser]?.ingame) {
                        users[activeUser].ingame.exp += 1;
                        users[activeUser].stats.gesamt_exp += 1;
                        localStorage.setItem("pac_users", JSON.stringify(users));
                    }

                    // Powerup entfernen
                    cell.removeChild(pEl);
                    PACMAN_GRID[gy][gx] = 0;

                    window.onPowerupCollected(
                        pacman,
                        ghosts,
                        PACMAN_GRID,
                        board,
                        TILE_SIZE
                    );
                }
            }
        }



        let powerupActive = window.currentPowerupEnd && window.currentPowerupEnd > Date.now();

        checkGhostReproductionPacmanCollision();

        ghosts.forEach(g => {
            // Essbare Ghosts behandeln
            if (g.edible) {
                const d = Math.hypot(g.x - pacman.x, g.y - pacman.y);
                if (d < TILE_SIZE / 2) {
                    g.el.style.display = "none";
                    g.edible = false;
                    g.dead = true;
                    setTimeout(() => respawnGhostInHouse(g), 1000);
                    return;
                }
            }

            // ================= Ghost im Haus =================
            if (!g.leftHouse) {
                if (g.atCenter()) {
                    const exitCells = [];
                    PACMAN_GRID.forEach((row, y) => {
                        row.forEach((v, x) => { if (v === 8) exitCells.push({ x, y }); });
                    });

                    if (exitCells.length > 0) {
                        let shortestPath = null;
                        for (const cell of exitCells) {
                            const path = findShortestPath(g.gridX, g.gridY, cell.x, cell.y, true);
                            if (path.length === 0) continue;
                            if (!shortestPath || path.length < shortestPath.length) shortestPath = path;
                        }

                        if (shortestPath && shortestPath.length > 0) {
                            g.nextDir = shortestPath[0];
                            g.dir = g.nextDir;
                        }
                    }
                }

                if (PACMAN_GRID[g.gridY]?.[g.gridX] === 8) g.leftHouse = true;
            }
            else {
                if (g.atCenter() && isOneTimeDecision(g.gridX, g.gridY) && !ghostFirstChoiceDone.get(g)) {
                    const canLeft = !isGhostBlocked(g.gridX - 1, g.gridY);
                    const canRight = !isGhostBlocked(g.gridX + 1, g.gridY);
                    if (canLeft && canRight) g.nextDir = Math.random() < 0.5 ? "left" : "right";
                    else if (canLeft) g.nextDir = "left";
                    else if (canRight) g.nextDir = "right";
                    else g.nextDir = "up";
                    ghostFirstChoiceDone.set(g, true);
                }

                if (g.atCenter() && isDecision(g.gridX, g.gridY)) chooseGhostDirection(g);
            }

            g.move();
            checkGhostTeleporter(g);
        });

        // ================= KOLLISION PACMAN ↔ GHOST =================
        if (!powerupActive) {
            for (const g of ghosts) {
                const dx = Math.abs(g.x - pacman.x);
                const dy = Math.abs(g.y - pacman.y);
                if (dx < TILE_SIZE / 2 && dy < TILE_SIZE / 2) {
                    // Spiel beenden
                    punkteSystem.gameOver = true;

                    triggerGameOver({
                        user: punkteSystem.user,
                        currentChallenge: punkteSystem.currentChallenge,
                        newHighscore: punkteSystem.newHighscore
                    });

                    return;
                }
            }
        }

        requestAnimationFrame(gameLoop);

    }

    gameLoop();

});
