window.currentPowerupEnd = 0; // globaler Zeitpunkt, wann Powerup endet

window.onPowerupCollected = function (pacman, ghosts) {
    const users = JSON.parse(localStorage.getItem("pac_users") || "{}");
    const activeUser = localStorage.getItem("pac_active_user");
    const userSettings = users[activeUser]?.settings || {};

    const POWERUP_DURATION = ((users[activeUser]?.stats?.powerup_duration ?? 3.5) * 1000);
    const BLINK_DURATION = 1500;
    const BLINK_COUNT = 3;
    const BLINK_INTERVAL = BLINK_DURATION / (BLINK_COUNT * 2);
    const GHOSTS_BLINK = !!userSettings.powerup_ghostsblinken;

    // -------- GLOBAL POWERUP TIMER --------
    const now = Date.now();
    window.currentPowerupEnd = now + POWERUP_DURATION;

    // -------- POWERUP START: alle Geister gleichzeitig aktivieren --------
    ghosts.forEach(g => {
        if (!g.dead && !g.permanent_dead) {
            g.edible = true;
            g.edibleUntil = window.currentPowerupEnd;

            if (!g.originalImg) g.originalImg = g.el.src;
            g.el.src = "assets/objects/ghosts/ghost_edible.png";
        }
    });

    // -------- LETZTE PHASE: Blinken --------
    setTimeout(() => {
        if (GHOSTS_BLINK) {
            let blinkStep = 0;

            const blinkTimer = setInterval(() => {
                blinkStep++;
                ghosts.forEach(g => {
                    if (!g.dead && g.edible) {
                        g.el.src =
                            blinkStep % 2 === 0
                                ? "assets/objects/ghosts/ghost_edible.png"
                                : g.originalImg;
                    }
                });

                if (blinkStep >= BLINK_COUNT * 2) clearInterval(blinkTimer);
            }, BLINK_INTERVAL);

        } else {
            ghosts.forEach(g => {
                if (!g.dead && g.edible) g.el.src = "assets/objects/ghosts/ghost_black.png";
            });
        }
    }, POWERUP_DURATION - BLINK_DURATION);

    // -------- POWERUP ENDE --------
    setTimeout(() => {
        ghosts.forEach(g => {
            if (!g.dead && !g.permanent_dead) {
                g.edible = false;
                g.el.src = g.originalImg;
            }
        });
        window.currentPowerupEnd = 0; // zurücksetzen
    }, POWERUP_DURATION);
};
