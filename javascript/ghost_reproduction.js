// ghost_reproduction.js

const MAX_MARKED = 3;
const INTERVAL = 10000;

let enabled = false;
let board, pacman, ghosts, grid, cols, tileSize;

const marked = new Map();

export function initGhostReproduction(cfg) {
    if (!cfg.enabled) return;

    enabled = true;
    ({ board, pacman, ghosts, grid, cols, tileSize } = cfg);

    setTimeout(() => {
        setInterval(markRandomCell, INTERVAL);
    }, 12500);
}

function markRandomCell() {
    if (!enabled) return;
    if (marked.size >= MAX_MARKED) return;

    const free = [];

    grid.forEach((row, y) => {
        row.forEach((v, x) => {
            if (v === 6 && !marked.has(`${x},${y}`)) {
                free.push({ x, y });
            }
        });
    });

    if (!free.length) return;

    const { x, y } = free[Math.floor(Math.random() * free.length)];
    const cell = board.children[y * cols + x];
    if (!cell) return;

    cell.style.boxShadow = "inset 0 0 0 3px red";

    const timeout = setTimeout(() => {
        window.SpawnGhostExtern(
            x,
            y,
            ghosts,
            ghosts[0]?.el?.src
        );
        clearMark(x, y);
    }, INTERVAL);

    marked.set(`${x},${y}`, { timeout, cell });
}

function clearMark(x, y) {
    const key = `${x},${y}`;
    const m = marked.get(key);
    if (!m) return;

    clearTimeout(m.timeout);
    m.cell.style.boxShadow = "";
    marked.delete(key);
}

export function checkGhostReproductionPacmanCollision() {
    if (!enabled) return;

    for (const [key] of marked) {
        const [x, y] = key.split(",").map(Number);
        if (pacman.gridX === x && pacman.gridY === y) {
            clearMark(x, y);
        }
    }
}
