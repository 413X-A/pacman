// powerup.js
window.onPowerupCollected = function(pacman, ghosts, PACMAN_GRID, board, TILE_SIZE) {
    if (!ghosts.length) return;

    const rows = PACMAN_GRID.length;
    const cols = PACMAN_GRID[0].length;
    const SPEED = TILE_SIZE / 35;

    // ================== Am weitesten entfernten Ghost finden ==================
    let farthestGhost = ghosts[0];
    let maxDist = 0;
    ghosts.forEach(g => {
        const dist = Math.abs(g.gridX - pacman.gridX) + Math.abs(g.gridY - pacman.gridY);
        if (dist > maxDist) {
            maxDist = dist;
            farthestGhost = g;
        }
    });

    farthestGhost.el.style.border = "2px solid red";
    farthestGhost.el.style.borderRadius = "50%";

    // ================== Letztes Zielfeld wählen (PACMAN_GRID === 6) ==================
    const selectionCells = [];
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (PACMAN_GRID[y][x] === 6) selectionCells.push([x, y]);
        }
    }
    const lastCell = selectionCells.length
        ? selectionCells[Math.floor(Math.random() * selectionCells.length)]
        : [farthestGhost.gridX, farthestGhost.gridY];

    // ================== Zufälligen Pfad generieren ==================
    const walkable = [0, 2, 6, 7, 8];
    const DIRS = [
        [0, -1], [0, 1], [-1, 0], [1, 0]
    ];

    let plannedPath = [];
    let currentX = farthestGhost.gridX;
    let currentY = farthestGhost.gridY;

    for (let i = 0; i < 35; i++) {
        const options = DIRS
            .map(d => [currentX + d[0], currentY + d[1]])
            .filter(([nx, ny]) =>
                nx >= 0 && nx < cols &&
                ny >= 0 && ny < rows &&
                walkable.includes(PACMAN_GRID[ny][nx])
            );

        if (!options.length) break;

        options.sort((a, b) => {
            const da = Math.hypot(a[0]-lastCell[0], a[1]-lastCell[1]);
            const db = Math.hypot(b[0]-lastCell[0], b[1]-lastCell[1]);
            return Math.random() < 0.7 ? da-db : Math.random()-0.5;
        });

        const [nx, ny] = options[0];
        plannedPath.push([nx, ny]);
        currentX = nx;
        currentY = ny;

        if (nx === lastCell[0] && ny === lastCell[1]) break;
    }

    plannedPath.push(lastCell); // letzter Punkt = PACMAN_GRID === 6

    // ================== Auf Board markieren (Divs absolut mittig, über allen) ==================
    const pathDivs = [];
    const createdCells = new Set(); // pro Zelle nur 1 Div

    plannedPath.forEach((pos) => {
        const [px, py] = pos;
        const key = `${px},${py}`;
        if (createdCells.has(key)) return;
        createdCells.add(key);

        const cell = board.children[py * cols + px];
        if (!cell) return;

        const div = document.createElement("div");
        div.style.width = TILE_SIZE * 0.75 + "px";
        div.style.height = TILE_SIZE * 0.75 + "px";
        div.style.borderRadius = "50%";
        div.style.backgroundColor = (px === lastCell[0] && py === lastCell[1]) ? "red" : "white";
        div.style.position = "absolute";
        div.style.left = px * TILE_SIZE + TILE_SIZE / 2 - (TILE_SIZE * 0.75) / 2 + "px";
        div.style.top = py * TILE_SIZE + TILE_SIZE / 2 - (TILE_SIZE * 0.75) / 2 + "px";
        div.style.pointerEvents = "none";
        div.style.zIndex = "10";
        div.classList.add("ghost-path");

        board.appendChild(div);
        pathDivs.push(div);
    });

    // ================== Macht alle anderen Geister essbar ==================
    const edibleGhosts = ghosts.filter(g => g !== farthestGhost);
    edibleGhosts.forEach(g => g.edible = true);

    function respawnGhost(g) {
    const startCells = [];

    PACMAN_GRID.forEach((row, y) =>
        row.forEach((v, x) => {
            if (v === 3) startCells.push([x, y]);
        })
    );

    if (!startCells.length) return;

    const [sx, sy] = startCells[Math.floor(Math.random() * startCells.length)];

    // === POSITION RESET ===
    g.gridX = sx;
    g.gridY = sy;
    g.x = sx * TILE_SIZE + TILE_SIZE / 2;
    g.y = sy * TILE_SIZE + TILE_SIZE / 2;

    // === SICHTBAR ===
    g.el.style.display = "block";

    // === VOLLER STARTRESET ===
    g.dir = "up";
    g.nextDir = "up";

    g.leftHouse = false;
    g.firstMovePending = true;

    g.biasChance = 0.5;
    g.edible = false;
    g.slowUntil = 0;

    // 🔥 WICHTIG
    ghostFirstChoiceDone.delete(g);
}




    // ================== Ghost Schritt für Schritt bewegen + Pacman Kollisionscheck ==================
    const originalMove = farthestGhost.move.bind(farthestGhost);
    farthestGhost.plannedPath = [...plannedPath];

    farthestGhost.move = function() {
        if (!this.plannedPath || this.plannedPath.length === 0) {
            // Route fertig → zurücksetzen
            this.move = originalMove;
            delete this.plannedPath;
            this.el.style.border = "";

            pathDivs.forEach(div => div.remove());
            // Essbare Ghosts zurücksetzen
            edibleGhosts.forEach(g => g.edible = false);

            return;
        }

        const [nx, ny] = this.plannedPath[0];
        const targetX = nx * TILE_SIZE + TILE_SIZE / 2;
        const targetY = ny * TILE_SIZE + TILE_SIZE / 2;
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const dist = Math.hypot(dx, dy);

        if (Math.abs(dx) > Math.abs(dy)) this.dir = dx > 0 ? "right" : "left";
        else this.dir = dy > 0 ? "down" : "up";

        if (dist < SPEED) {
            this.x = targetX;
            this.y = targetY;
            this.gridX = nx;
            this.gridY = ny;
            this.plannedPath.shift();
        } else {
            this.x += (dx / dist) * SPEED;
            this.y += (dy / dist) * SPEED;
        }

        // ================== Kollisionscheck Pacman -> essbare Ghosts ==================
        edibleGhosts.forEach(g => {
            if (g.edible) {
    const dx = g.x - pacman.x;
    const dy = g.y - pacman.y;
    const distance = Math.hypot(dx, dy);
    if (distance < TILE_SIZE / 2) {
        g.el.style.display = "none";
        g.edible = false;
        setTimeout(() => respawnGhost(g), 1000);
        return; // keine normale Bewegung für diesen Frame
    }
}

        });

        this.render();
    };
};
