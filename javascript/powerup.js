window.onPowerupCollected = function (pacman, ghosts) {
    const users = JSON.parse(localStorage.getItem("pac_users") || "{}");
    const activeUser = localStorage.getItem("pac_active_user");
    const userSettings = users[activeUser]?.settings || {};

    const POWERUP_DURATION = (users[activeUser]?.stats?.powerup_duration ?? 3.5) * 1000;
    const BLINK_DURATION = 1500;
    const BLINK_COUNT = 3;
    const BLINK_INTERVAL = BLINK_DURATION / (BLINK_COUNT * 2);
    const GHOSTS_BLINK = !!userSettings.powerup_ghostsblinken;

    const now = Date.now();

    // ------------------ Globalen Timer setzen / verlängern ------------------
    if (window.currentPowerupEnd && window.currentPowerupEnd > now) {
        window.currentPowerupEnd += POWERUP_DURATION; // bestehende Zeit verlängern
    } else {
        window.currentPowerupEnd = now + POWERUP_DURATION; // neues Powerup starten
    }

    const remainingTime = window.currentPowerupEnd - now;

    // ------------------ Alle aktuellen Geister sofort essbar machen ------------------
    ghosts.forEach(g => {
        if (!g.dead && !g.permanent_dead) {
            g.edible = true;
            g.edibleUntil = window.currentPowerupEnd;
            if (!g.originalImg) g.originalImg = g.el.src;
            g.el.src = "assets/objects/ghosts/ghost_edible.png"; // essbar, KEIN blink
        }
    });

    // ------------------ LETZTE PHASE: Blinken oder Schwarz ------------------
    const phaseDelay = Math.max(0, remainingTime - BLINK_DURATION);
    setTimeout(() => {
        // Blinken oder Schwarz-Phase starten
        if (GHOSTS_BLINK) {
            let blinkStep = 0;
            window._powerupBlinkTimer = setInterval(() => {
                blinkStep++;
                ghosts.forEach(g => {
                    if (!g.dead && g.edible) {
                        g.el.src = blinkStep % 2 === 0
                            ? "assets/objects/ghosts/ghost_edible.png"
                            : g.originalImg;
                    }
                });
                if (blinkStep >= BLINK_COUNT * 2) clearInterval(window._powerupBlinkTimer);
            }, BLINK_INTERVAL);
        } else {
            ghosts.forEach(g => {
                if (!g.dead && g.edible) g.el.src = "assets/objects/ghosts/ghost_black.png";
            });
        }
    }, phaseDelay);

    // ------------------ Powerup Ende ------------------
    if (window._powerupEndTimer) clearTimeout(window._powerupEndTimer);
    window._powerupEndTimer = setTimeout(() => {
        ghosts.forEach(g => {
            if (!g.dead && !g.permanent_dead) {
                g.edible = false;
                g.el.src = g.originalImg;
            }
        });
        window.currentPowerupEnd = 0;
        window._powerupEndTimer = null;
        if (window._powerupBlinkTimer) {
            clearInterval(window._powerupBlinkTimer);
            window._powerupBlinkTimer = null;
        }
    }, remainingTime);
};
