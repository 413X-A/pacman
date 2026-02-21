// ------------------- hauptmenue_profil.js -------------------

document.addEventListener("DOMContentLoaded", () => {

    // ================= SCORE FORMAT =================
    function formatScore(value) {
        if (value === null || value === undefined) return "0";

        if (value >= 1_000_000_000_000) return (value / 1_000_000_000_000).toFixed(2).replace(/\.0+$/, "") + "t";
        if (value >= 1_000_000_000) return (value / 1_000_000_000).toFixed(2).replace(/\.0+$/, "") + "b";
        if (value >= 1_000_000) return (value / 1_000_000).toFixed(2).replace(/\.0+$/, "") + "m";
        if (value >= 1_000) return (value / 1_000).toFixed(2).replace(/\.0+$/, "") + "k";

        return String(value);
    }

    // ================= USER =================
    const activeUser = localStorage.getItem("pac_active_user");
    if (!activeUser) return;

    const users = JSON.parse(localStorage.getItem("pac_users")) || {};
    const user = users[activeUser];
    if (!user || !user.stats) return;

    const stats = user.stats;

    // ================= GAME FRAME =================
    const gameFrame = document.querySelector(".game-frame");
    if (!gameFrame) return;

    // ================= OVERLAY =================
    const overlay = document.createElement("div");
    overlay.id = "profileOverlay";
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
        transition: "transform .15s ease, opacity .15s ease"
    });

    backBtn.onmouseenter = () => {
        backBtn.style.transform = "scale(1.1)";
        backBtn.style.opacity = "1";
    };
    backBtn.onmouseleave = () => {
        backBtn.style.transform = "scale(1)";
        backBtn.style.opacity = "0.85";
    };
    backBtn.onclick = () => {
        overlay.style.display = "none";
        window.location.reload();
        const settingsBtn = document.getElementById("settingsBtn");
        if (settingsBtn) settingsBtn.style.display = "flex";
    };

    overlay.appendChild(backBtn);

    // ================= BOX =================
    const box = document.createElement("div");
    box.className = "start-box";
    Object.assign(box.style, {
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "22px",
        width: "90%",
        maxWidth: "520px",
        maxHeight: "90%",
        overflowY: "auto"
    });

    box.style.scrollbarWidth = "none";
    box.style.msOverflowStyle = "none";
    box.style.setProperty("::-webkit-scrollbar", "display: none");

    // ================= TITLE =================
    const title = document.createElement("h2");
    title.textContent = "Profil";
    box.appendChild(title);

    // ================= STATS CARD =================
    const card = document.createElement("div");
    Object.assign(card.style, {
        background: "#1a2540",
        borderRadius: "14px",
        padding: "18px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        color: "#fff"
    });

    const username = document.createElement("h3");
    username.textContent = stats.benutzername;
    username.style.margin = "0 0 6px 0";
    card.appendChild(username);

    user.stats.herausforderungen_abgeschlossen = user.herausforderung_list
        .filter(h => h.abgeholt === true).length;
    // ================= STATS =================
    const rows = [
        ["Höchste Punktzahl", formatScore(stats.highscore)],
        ["Lebenslange Punkte", formatScore(stats.gesamt_score)],
        ["EXP", formatScore(stats.gesamt_exp)],
        ["Spiele gespielt", formatScore(stats.gamesPlayed)],
        ["Herausforderungen", `${stats.herausforderungen_abgeschlossen} / ${stats.herausforderungen_anzahl}`],
        ["Powerup Dauer", `${stats.powerup_duration}s`],
        ["Teleporter Dauer", `${stats.teleporter_duration}s`]
    ];

    rows.forEach(([label, value]) => {
        const row = document.createElement("div");
        Object.assign(row.style, {
            display: "flex",
            justifyContent: "space-between",
            padding: "6px 0",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            fontSize: "0.95em",
            opacity: "0.9"
        });

        const l = document.createElement("span");
        l.textContent = label;

        const v = document.createElement("span");
        v.textContent = value;

        row.appendChild(l);
        row.appendChild(v);
        card.appendChild(row);
    });

    box.appendChild(card);
    overlay.appendChild(box);
    gameFrame.appendChild(overlay);

    // ================= OPEN BUTTON =================
    const profileBtn = document.getElementById("profileBtn");
    if (profileBtn) {
        profileBtn.addEventListener("click", () => {
            const settingsBtn = document.getElementById("settingsBtn");
            if (settingsBtn) settingsBtn.style.display = "none";
            overlay.style.display = "flex";
            box.scrollTop = 0;
        });
    }
});
