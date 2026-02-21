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
    Object.assign(overlay.style, {
        position: "absolute",
        inset: "0",
        background: "rgba(0, 40, 70, 0.9)",
        zIndex: "25",
        display: "none",
        justifyContent: "center",
        alignItems: "center",
        backdropFilter: "blur(4px)",
        borderRadius: "10px",
        overflow: "hidden"
    });

    // ================= BACK BUTTON =================
    const backBtn = document.createElement("img");
    backBtn.src = "assets/icons/back.png";
    backBtn.alt = "Zurück";
    backBtn.title = "Zurück";
    Object.assign(backBtn.style, {
        position: "absolute",
        top: "4px",
        right: "4px",
        width: "45px",
        height: "45px",
        cursor: "pointer",
        zIndex: "30",
        opacity: "0.85",
        transition: "transform 0.15s ease, opacity 0.15s ease"
    });

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
        window.location.reload();
        const settingsBtn = document.getElementById("settingsBtn");
        if (settingsBtn) settingsBtn.style.display = "flex";
    });
    overlay.appendChild(backBtn);

    // ================= BOX =================
    const box = document.createElement("div");
    box.className = "start-box";
    Object.assign(box.style, {
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        padding: "20px",
        width: "90%",
        maxWidth: "650px",
        maxHeight: "90%",
        overflowY: "auto"
    });
    box.style.scrollbarWidth = "none";
    box.style.msOverflowStyle = "none";
    box.style.setProperty("::-webkit-scrollbar", "display: none");

    const title = document.createElement("h2");
    // ===== ANZAHL ABGESCHLOSSENE CHALLENGES BERECHNEN =====
    user.stats.herausforderungen_abgeschlossen = user.herausforderung_list
        .filter(h => h.abgeholt === true).length;
    title.textContent = `Herausforderungen (${user.stats.herausforderungen_abgeschlossen} / ${user.stats.herausforderungen_anzahl})`;
    box.appendChild(title);

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

        // NUR freigeschaltete Level anzeigen
        const sichtbareChallenges = user.herausforderung_list.filter(
            c => c.freigeschaltet === true
        );

        sichtbareChallenges.forEach((challenge) => {
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

            // ---------- ABGEHOLT ----------
            if (challenge.abgeschlossen && challenge.abgeholt) {
                const cBox = document.createElement("div");
                cBox.style.background = "#1a2540";
                cBox.style.borderRadius = "12px";
                cBox.style.padding = "14px";
                cBox.style.color = "#888";
                cBox.style.fontSize = "1em";
                cBox.textContent = challenge.name + " | ✓";
                challengesContainer.appendChild(cBox);
                return;
            }

            // ---------- CHALLENGE BOX ----------
            const cBox = document.createElement("div");
            cBox.style.background = challenge.aktiv ? "#388e3c" : "#1a2540";
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
            if (challenge.players !== null) info.push(`${challenge.players} Spieler`);
            if (challenge.difficulty !== null)
                if (challenge.difficulty === "easy") {
                    schwierigkeit = "Einfach";
                }
                else if (challenge.difficulty === "normal") {
                    schwierigkeit = "Normal";
                }
                else if (challenge.difficulty === "hard") {
                    schwierigkeit = "Hart";
                }
                else if (challenge.difficulty === "insane") {
                    schwierigkeit = "Heftig";
                }
            info.push(`${schwierigkeit}`);
            if (challenge.reward_exp !== null) info.push(`${challenge.reward_exp} EXP`);

            if (info.length) {
                const infoRow = document.createElement("div");
                infoRow.textContent = info.join("   •   ");
                infoRow.style.opacity = "0.85";
                infoRow.style.fontSize = "0.9em";
                cBox.appendChild(infoRow);
            }

            // ---------- BUTTONS ----------
            const actionBtn = document.createElement("button");
            actionBtn.style.alignSelf = "flex-end";
            actionBtn.style.marginTop = "8px";
            actionBtn.style.padding = "6px 14px";
            actionBtn.style.border = "none";
            actionBtn.style.borderRadius = "6px";
            actionBtn.style.cursor = "pointer";

            if (challenge.abgeschlossen && !challenge.abgeholt) {
                // Belohnung abholen
                actionBtn.textContent = "Abholen";
                actionBtn.style.background = "#fbc02d";
                actionBtn.style.color = "#000";

                actionBtn.addEventListener("click", () => {
                    // EXP hinzufügen
                    user.stats.gesamt_exp += challenge.reward_exp;

                    // Challenge als abgeholt markieren
                    challenge.abgeholt = true;

                    // ================= DIREKT SPEICHERN =================
                    users[activeUser] = user;
                    localStorage.setItem("pac_users", JSON.stringify(users));

                    // ===== ANZAHL ABGESCHLOSSENE CHALLENGES BERECHNEN =====
                    user.stats.herausforderungen_abgeschlossen = user.herausforderung_list
                        .filter(h => h.abgeholt === true).length;

                    // ===== TITEL AKTUALISIEREN =====
                    title.textContent = `Herausforderungen (${user.stats.herausforderungen_abgeschlossen} / ${user.stats.herausforderungen_anzahl})`;

                    // Challenges neu laden
                    loadChallenges();
                });
            }
            else if (!challenge.abgeschlossen) {
                actionBtn.textContent = challenge.aktiv ? "Deaktivieren" : "Aktivieren";
                actionBtn.style.background = challenge.aktiv ? "#d32f2f" : "#4caf50";
                actionBtn.style.color = "#fff";

                actionBtn.addEventListener("mouseenter", () => {
                    actionBtn.style.background = challenge.aktiv ? "#b71c1c" : "#45a049";
                });
                actionBtn.addEventListener("mouseleave", () => {
                    actionBtn.style.background = challenge.aktiv ? "#d32f2f" : "#4caf50";
                });

                actionBtn.addEventListener("click", () => {
                    if (challenge.aktiv) {
                        // ---------- DEAKTIVIEREN ----------
                        challenge.aktiv = false;

                        // Challenge-Settings zurücksetzen
                        if (user.game_settings) {
                            user.game_settings.herausforderung_aktiv = false;
                            user.game_settings.herausforderung_beschreibung = null;
                        }
                    } else {
                        // ---------- AKTIVIEREN ----------
                        user.herausforderung_list.forEach(h => h.aktiv = false);
                        challenge.aktiv = true;

                        user.game_settings = {
                            ...user.game_settings,
                            herausforderung_aktiv: true,
                            herausforderung_beschreibung: challenge.beschreibung,
                            players: String(challenge.players),
                            map: String(challenge.map),
                            difficulty: challenge.difficulty
                        };
                    }

                    users[activeUser] = user;
                    localStorage.setItem("pac_users", JSON.stringify(users));
                    overlay.style.display = "none";
                    window.location.href = "hauptmenue.html";
                });
            }


            cBox.appendChild(actionBtn);
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
