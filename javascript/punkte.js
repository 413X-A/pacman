// punkte.js

// ======================================================
// =================== GAME OVER UI =====================
// ======================================================
export function triggerGameOver({
    user = {},
    currentChallenge = null,
    newHighscore = false,
    challengeSuccess = false
} = {}) {

    if (window.gameOver) return;
    window.gameOver = true;
    window.gameLoopRunning = false;

    const gameFrame = document.querySelector(".game-frame");
    if (!gameFrame) return;

    // ================= OVERLAY =================
    const overlay = document.createElement("div");
    overlay.id = "gameOverOverlay";
    Object.assign(overlay.style, {
        position: "absolute",
        inset: "0",
        background: "rgba(0,40,70,0.9)",
        zIndex: "25",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    });

    // ================= BOX =================
    const box = document.createElement("div");
    Object.assign(box.style, {
        padding: "25px",
        width: "90%",
        maxWidth: "420px",
        background: "rgba(0,90,140,0.95)",
        border: "2px solid #00ffff",
        borderRadius: "12px",
        color: "#00ffff",
        textAlign: "center"
    });

    const title = document.createElement("h2");
    title.textContent = challengeSuccess ? "Herausforderung geschafft!" : "Spiel beendet!";
    box.appendChild(title);

    const scoreText = document.createElement("p");

    if (currentChallenge) {
        scoreText.innerHTML =
            `Punkte: ${user.ingame.herausforderung_punkte} / ${currentChallenge.punkte_need}`;
    } else {
        scoreText.innerHTML =
            `Punkte: ${user.ingame.punkte}<br>
             Highscore: ${user.stats?.highscore || 0}${newHighscore ? " ⭐" : ""}`;
    }

    box.appendChild(scoreText);

    // ================= BUTTONS =================
    const btnRow = document.createElement("div");
    Object.assign(btnRow.style, {
        marginTop: "20px",
        display: "flex",
        justifyContent: "center",
        gap: "10px"
    });

    const mainBtn = document.createElement("button");
    const exitBtn = document.createElement("button");

    mainBtn.textContent = challengeSuccess
        ? "Nächste Herausforderung"
        : currentChallenge
            ? "Wiederholen"
            : "Neustart";

    exitBtn.textContent = "Hauptmenü";

    [mainBtn, exitBtn].forEach(btn => {
        Object.assign(btn.style, {
            padding: "10px",
            border: "2px solid #00ffff",
            borderRadius: "6px",
            background: "rgba(0,50,80,0.9)",
            color: "#00ffff",
            cursor: "pointer"
        });
    });

    // ================= MAIN BUTTON LOGIK =================
    mainBtn.onclick = () => {
        window.dispatchEvent(new CustomEvent("pacman_gameover_action", {
            detail: {
                type: challengeSuccess ? "next_challenge" : "retry",
                hasChallenge: !!currentChallenge
            }
        }));
    };

    exitBtn.onclick = () => {
        const users = JSON.parse(localStorage.getItem("pac_users") || "{}");
        const activeUser = localStorage.getItem("pac_active_user");
        const user = users[activeUser];

        if (user && user.herausforderung_list) {
            user.herausforderung_list.forEach(h => h.aktiv = false);
            if (user.game_settings) {
                user.game_settings.herausforderung_aktiv = false;
                user.game_settings.herausforderung_beschreibung = null;
            }
            users[activeUser] = user;
            localStorage.setItem("pac_users", JSON.stringify(users));
        }

        window.location.href = "hauptmenue.html";
    };

    btnRow.appendChild(mainBtn);
    btnRow.appendChild(exitBtn);
    box.appendChild(btnRow);
    overlay.appendChild(box);
    gameFrame.appendChild(overlay);
}

// ======================================================
// =================== PUNKTE SYSTEM ====================
// ======================================================
export class PunkteSystem {
    constructor(board, pacman, tileSize) {
        this.board = board;
        this.pacman = pacman;
        this.tileSize = tileSize;

        this.scoreEl = document.getElementById("score");

        this.users = JSON.parse(localStorage.getItem("pac_users") || "{}");
        this.activeUser = localStorage.getItem("pac_active_user");
        this.user = this.users[this.activeUser];

        // Falls kein User gefunden, abbrechen
        if (!this.user) return;


        // ================= CHALLENGE =================
        this.herausforderungAktiv = this.user.game_settings?.herausforderung_aktiv === true;
        this.currentChallenge = this.herausforderungAktiv
            ? this.user.herausforderung_list?.find(h => h.aktiv)
            : null;

        this.newHighscore = false;
        this.gameOver = false;

        this.updateUI();

        // ===== GameOver Actions =====
        window.addEventListener("pacman_gameover_action", (e) => {
            this.handleGameOverAction(e.detail);
        });
    }

    // ================= SCORE =================
    add(points) {
        if (this.gameOver) return;

        if (this.herausforderungAktiv && this.currentChallenge) {
            // Challenge-Punkte
            this.user.ingame.herausforderung_punkte += points;
            this.user.stats.gesamt_exp += this.user.ingame.exp;

            this.updateUI();

            if (this.user.ingame.herausforderung_punkte >= this.currentChallenge.punkte_need) {
                this.finishChallenge(true);
            }
        } else {
            // 🔧 NORMALES SPIEL
            this.user.ingame.punkte += points;
            this.user.stats.gesamt_score += points;
            this.user.stats.gesamt_exp += this.user.ingame.exp;

            // ✅ Highscore korrekt prüfen
            if (this.user.ingame.punkte > this.user.stats.highscore) {
                this.user.stats.highscore = this.user.ingame.punkte;
                this.newHighscore = true;
            }

            this.save();
            this.updateUI();
        }
    }


    // ================= DOT CHECK =================
    checkDots(grid, cols) {
        if (this.gameOver) return;

        const gx = this.pacman.gridX;
        const gy = this.pacman.gridY;
        const index = gy * cols + gx;
        const cell = this.board.children[index];
        if (!cell) return;

        const dot = cell.querySelector(".dot");
        if (dot) {
            cell.removeChild(dot);
            grid[gy][gx] = 0;
            this.add(10);
        }

        const anyDotsLeft = [...this.board.children].some(c => c.querySelector(".dot"));

        if (!anyDotsLeft) {
            if (this.herausforderungAktiv && this.currentChallenge) {
                this.finishChallenge(this.user.ingame.herausforderung_punkte >= this.currentChallenge.punkte_need);
            } else {
                triggerGameOver({
                    user: this.user,
                    newHighscore: this.newHighscore
                });
            }
        }
    }

    // ================= CHALLENGE ENDE =================
    finishChallenge(success) {
        this.gameOver = true;

        if (success && this.currentChallenge) {
            // Challenge als abgeschlossen markieren
            this.currentChallenge.abgeschlossen = true;

            // Score der Challenge zum Gesamtscore hinzufügen
            this.user.stats.gesamt_score += this.user.ingame.herausforderung_punkte;

            // Nächste Challenge freischalten
            const list = this.user.herausforderung_list;
            const currentIndex = list.indexOf(this.currentChallenge);
            if (currentIndex !== -1) {
                const nextChallenge = list[currentIndex + 1];
                if (nextChallenge && nextChallenge.freigeschaltet === false) {
                    nextChallenge.freigeschaltet = true;
                }
            }
        }

        this.save();

        triggerGameOver({
            user: this.user,
            currentChallenge: this.currentChallenge,
            challengeSuccess: success
        });
    }

    // ================= GAMEOVER ACTION =================
    handleGameOverAction({ type, hasChallenge }) {
        const users = JSON.parse(localStorage.getItem("pac_users") || "{}");
        const activeUser = localStorage.getItem("pac_active_user");
        const user = users[activeUser];
        if (!user) return;

        // ---------------- Normales Spiel ----------------
        if (!hasChallenge) {
            if (type === "retry") {
                // Nur normale Spielpunkte zurücksetzen
                user.ingame.punkte = 0;
                this.newHighscore = false;

                // Challenge-Punkte bleiben unverändert

                users[activeUser].stats.gamesPlayed += 1;

                users[activeUser] = user;
                localStorage.setItem("pac_users", JSON.stringify(users));
                setTimeout(() =>
                    window.location.reload(),
                    500);
            }

            if (type === "next_challenge") {
                window.location.href = "hauptmenue.html";
            }
            return;
        }

        // ---------------- Challenge ----------------
        if (this.herausforderungAktiv && this.currentChallenge) {
            if (type === "retry") {
                // Challenge erneut spielen, Score bleibt erhalten
                this.currentChallenge.aktiv = true;

                users[activeUser].stats.gamesPlayed += 1;

                users[activeUser] = user;
                localStorage.setItem("pac_users", JSON.stringify(users));
                setTimeout(() =>
                    window.location.reload(),
                    500);
                return;
            }

            if (type === "next_challenge") {
                // Nächste nicht abgeschlossene Challenge finden
                const next = user.herausforderung_list.find(h => !h.abgeschlossen);

                if (!next) {
                    // Alle Challenges deaktivieren, Challenge vorbei
                    user.herausforderung_list.forEach(h => h.aktiv = false);
                    user.game_settings.herausforderung_aktiv = false;
                    user.game_settings.herausforderung_beschreibung = null;

                    users[activeUser] = user;
                    localStorage.setItem("pac_users", JSON.stringify(users));
                    window.location.href = "hauptmenue.html";
                    return;
                }

                // Aktuelle Challenge deaktivieren, nächste aktivieren
                user.herausforderung_list.forEach(h => h.aktiv = false);
                next.aktiv = true;

                user.game_settings.herausforderung_aktiv = true;
                user.game_settings.herausforderung_beschreibung = next.beschreibung;
                user.game_settings.players = String(next.players);
                user.game_settings.map = String(next.map);
                user.game_settings.difficulty = next.difficulty;

                users[activeUser].stats.gamesPlayed += 1;

                // Challenge-Punkte bleiben unverändert
                users[activeUser] = user;
                localStorage.setItem("pac_users", JSON.stringify(users));

                setTimeout(() =>
                    window.location.reload(),
                    500);
            }
        }
    }

    // ================= UI =================
    updateUI() {
        if (!this.scoreEl) return;

        if (this.herausforderungAktiv && this.currentChallenge) {
            this.scoreEl.textContent =
                `Punkte: ${this.user.ingame.herausforderung_punkte} / ${this.currentChallenge.punkte_need}`;
        } else {
            this.scoreEl.textContent = `Punkte: ${this.user.ingame.punkte}`;
        }

        const event = new CustomEvent("pacman_stats_updated", {
            detail: {
                user: this.user
            }
        });
        window.dispatchEvent(event);
    }

    save() {
        this.users[this.activeUser] = this.user;
        localStorage.setItem("pac_users", JSON.stringify(this.users));
    }
}
