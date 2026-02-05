// ------------------- hauptmenue_herausforderungen.js -------------------

document.addEventListener("DOMContentLoaded", () => {
    // ================= USER =================
    const activeUser = localStorage.getItem("pac_active_user");
    if (!activeUser) return;

    const users = JSON.parse(localStorage.getItem("pac_users")) || {};
    const user = users[activeUser];
    if (!user || !Array.isArray(user.herausforderung_list)) return;

    // ================= GAME FRAME =================
    const gameFrame = document.querySelector(".game-frame");
    if (!gameFrame) return;

    // ================= OVERLAY =================
    const overlay = document.createElement("div");
    overlay.id = "challengesOverlay";
    overlay.style.position = "absolute";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0, 40, 70, 0.9)";
    overlay.style.zIndex = "25";
    overlay.style.display = "none";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.backdropFilter = "blur(4px)";
    overlay.style.borderRadius = "10px";
    overlay.style.overflow = "hidden";

    // ================= BACK BUTTON =================
    const backBtn = document.createElement("img");
    backBtn.src = "assets/icons/back.png";
    backBtn.alt = "Zurück";
    backBtn.title = "Zurück";

    backBtn.style.position = "absolute";
    backBtn.style.top = "4px";
    backBtn.style.right = "4px";
    backBtn.style.width = "45px";
    backBtn.style.height = "45px";
    backBtn.style.cursor = "pointer";
    backBtn.style.zIndex = "30";
    backBtn.style.opacity = "0.85";
    backBtn.style.transition = "transform 0.15s ease, opacity 0.15s ease";

    backBtn.addEventListener("mouseenter", () => {
        backBtn.style.transform = "scale(1.1)";
        backBtn.style.opacity = "1";
    });

    backBtn.addEventListener("mouseleave", () => {
        backBtn.style.transform = "scale(1.0)";
        backBtn.style.opacity = "0.85";
    });

    backBtn.addEventListener("click", () => {
        overlay.style.display = "none";
        const settingsBtn = document.getElementById("settingsBtn");
        if (settingsBtn) settingsBtn.style.display = "flex";
    });

    overlay.appendChild(backBtn);

    // ================= BOX (SCROLL-CONTAINER) =================
    const box = document.createElement("div");
    box.className = "start-box";
    box.style.display = "flex";
    box.style.flexDirection = "column";
    box.style.gap = "15px";
    box.style.padding = "20px";
    box.style.width = "90%";
    box.style.maxWidth = "650px";
    box.style.maxHeight = "90%";
    box.style.overflowY = "auto";

    // Scrollbar verstecken
    box.style.scrollbarWidth = "none";
    box.style.msOverflowStyle = "none";
    box.style.setProperty("::-webkit-scrollbar", "display: none");

    // ================= HEADER =================
    const title = document.createElement("h2");
    title.textContent = "Herausforderungen";
    box.appendChild(title);

    // ================= CONTAINER =================
    const challengesContainer = document.createElement("div");
    challengesContainer.style.display = "flex";
    challengesContainer.style.flexDirection = "column";
    challengesContainer.style.gap = "14px";
    box.appendChild(challengesContainer);

    overlay.appendChild(box);
    gameFrame.appendChild(overlay);

    // ================= LOAD CHALLENGES =================
    function loadChallenges() {
        challengesContainer.innerHTML = "";

        user.herausforderung_list.forEach((challenge) => {

            // ---------- UNTERÜBERSCHRIFT ----------
            if (challenge.name === null && challenge.abgeschlossen === null) {
                const label = document.createElement("div");
                label.textContent = challenge.beschreibung;
                label.style.opacity = "0.85";
                label.style.fontSize = "1em";
                label.style.margin = "6px 0 -6px 0";
                challengesContainer.appendChild(label);
                return;
            }

            // ---------- CHALLENGE BOX ----------
            const cBox = document.createElement("div");
            cBox.style.background = challenge.aktiv ? "#388e3c" : "#1a2540"; // grün wenn aktiv
            cBox.style.borderRadius = "12px";
            cBox.style.padding = "14px";
            cBox.style.color = "#fff";
            cBox.style.display = "flex";
            cBox.style.flexDirection = "column";
            cBox.style.gap = "8px";
            cBox.style.transition = "transform 0.2s ease, box-shadow 0.2s ease";

            cBox.addEventListener("mouseenter", () => {
                cBox.style.transform = "scale(1.02)";
                cBox.style.boxShadow = "0 6px 18px rgba(0,0,0,0.35)";
            });

            cBox.addEventListener("mouseleave", () => {
                cBox.style.transform = "scale(1)";
                cBox.style.boxShadow = "none";
            });

            // ---------- TITLE ----------
            const cTitle = document.createElement("h3");
            cTitle.textContent = challenge.name;
            cTitle.style.margin = "0";
            cTitle.style.fontSize = "1em";
            cBox.appendChild(cTitle);

            // ---------- DESCRIPTION ----------
            if (challenge.beschreibung) {
                const desc = document.createElement("p");
                desc.textContent = challenge.beschreibung;
                desc.style.margin = "0";
                desc.style.opacity = "0.9";
                desc.style.fontSize = "0.95em";
                cBox.appendChild(desc);
            }

            // ---------- INFO ----------
            const info = [];
            if (challenge.players !== null) info.push(`👥 ${challenge.players}`);
            if (challenge.map !== null) info.push(`🗺️ Map ${challenge.map}`);
            if (challenge.difficulty !== null) info.push(`⚔️ ${challenge.difficulty}`);
            if (challenge.reward_exp !== null) info.push(`⭐ ${challenge.reward_exp} XP`);

            if (info.length) {
                const infoRow = document.createElement("div");
                infoRow.textContent = info.join("   •   ");
                infoRow.style.opacity = "0.85";
                infoRow.style.fontSize = "0.9em";
                cBox.appendChild(infoRow);
            }

            // ---------- ACTIVATE / DEACTIVATE BUTTON ----------
            const startBtn = document.createElement("button");
            startBtn.textContent = challenge.aktiv ? "Deaktivieren" : "Aktivieren";
            startBtn.style.alignSelf = "flex-end";
            startBtn.style.marginTop = "8px";
            startBtn.style.padding = "6px 14px";
            startBtn.style.border = "none";
            startBtn.style.borderRadius = "6px";
            startBtn.style.cursor = "pointer";
            startBtn.style.background = challenge.aktiv ? "#d32f2f" : "#4caf50"; // rot wenn aktiv, grün sonst
            startBtn.style.color = "#fff";

            startBtn.addEventListener("mouseenter", () => {
                startBtn.style.background = challenge.aktiv ? "#b71c1c" : "#45a049";
            });
            startBtn.addEventListener("mouseleave", () => {
                startBtn.style.background = challenge.aktiv ? "#d32f2f" : "#4caf50";
            });

            startBtn.addEventListener("click", () => {
                if (challenge.aktiv) {
                    // Deaktivieren
                    challenge.aktiv = false;
                    users[activeUser].game_settings.herausforderung_aktiv = false;
                    users[activeUser].game_settings.herausforderung_beschreibung = null;
                    localStorage.setItem("pac_game_settings", JSON.stringify(users[activeUser].game_settings));
                } else {
                    // Aktivieren andere Challenges
                    user.herausforderung_list.forEach(h => h.aktiv = false);
                    challenge.aktiv = true;

                    const gameSettings = {
                        herausforderung_aktiv: true,
                        herausforderung_beschreibung: challenge.beschreibung,
                        players: String(challenge.players),
                        map: String(challenge.map),
                        difficulty: challenge.difficulty
                    };

                    users[activeUser].game_settings = {
                        ...users[activeUser].game_settings,
                        ...gameSettings
                    };
                    localStorage.setItem("pac_game_settings", JSON.stringify(gameSettings));
                }

                localStorage.setItem("pac_users", JSON.stringify(users));
                overlay.style.display = "none";
                window.location.href = "hauptmenue.html";
            });

            cBox.appendChild(startBtn);
            challengesContainer.appendChild(cBox);
        });
    }

    // ================= OPEN BUTTON =================
    const challengesBtn = document.getElementById("challengesBtn");
    if (challengesBtn) {
        challengesBtn.addEventListener("click", () => {
            const settingsBtn = document.getElementById("settingsBtn");
            if (settingsBtn) settingsBtn.style.display = "none";

            loadChallenges();
            overlay.style.display = "flex";
            box.scrollTop = 0;
        });
    }
});
