// ------------------- hauptmenue_script.js -------------------

document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById("startGameBtn");
    const gameFrame = document.querySelector(".game-frame");

    if (!startBtn || !gameFrame) return;

    const activeUser = localStorage.getItem("pac_active_user");
    const users = JSON.parse(localStorage.getItem("pac_users")) || {};
    const userData = users[activeUser] || {};
    const gameSettings = userData.game_settings || {};
    const herausforderungList = userData.herausforderung_list || [];
    const herausforderungAktiv = gameSettings.herausforderung_aktiv === true;


    // ================= GHOST SETTINGS =================
    let ghostsDead = false;
    let ghostsReproduction = false;

    if (herausforderungAktiv) {
        const aktiveChallenge = herausforderungList.find(c => c.aktiv);
        if (aktiveChallenge) {
            ghostsDead = aktiveChallenge.ghosts_dead ?? false;
            ghostsReproduction = aktiveChallenge.ghosts_reproduction ?? false;
        }
    } else {
        ghostsDead = userData.settings?.ghosts_dead ?? false;
        ghostsReproduction = userData.settings?.ghosts_reproduction ?? false;
    }

    // ================= OVERLAY =================
    const overlay = document.createElement("div");
    overlay.id = "startOverlay";
    overlay.style.position = "absolute";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0, 40, 70, 0.9)";
    overlay.style.zIndex = "25";
    overlay.style.display = "none";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.backdropFilter = "blur(4px)";
    overlay.style.borderRadius = "10px";

    // ================= BOX =================
    const box = document.createElement("div");
    box.className = "start-box";
    box.innerHTML = `
        <h2>Spiel starten</h2>

        <label>Spieler</label>
        <select id="playersSelect">
            <option value="1">1 Spieler</option>
            <option value="2">2 Spieler</option>
        </select>

        <label>Karte</label>
        <select id="mapSelect">
            <option value="original">Original</option>
            <option value="fogmaze">Nebellabyrinth</option>
            <option value="crystal">Kristallhöhle</option>
            <option value="busybee">ALPHA: Beschäftigte Biene</option>
        </select>

        <label>Gebiet</label>
        <select id="themeSelect">
    <option value="original">Original</option>
    <option value="lava">Feuerwelt</option>
    <option value="ice">Frostwelt</option>
    <option value="forest">Waldwelt</option>
    <option value="desert">Wüstenwelt</option>
    <option value="ocean">Ozeanwelt</option>
    <option value="neon">Neonstadt</option>
    <option value="space">Weltraum</option>
    <option value="volcano">Vulkanwelt</option>
    <option value="crystal">Kristallwelt</option>
    <option value="mystic">Mystische Welt</option>

    <option value="toxic">Giftwelt</option>
    <option value="ruins">Antike Ruinen</option>
    <option value="cyber">Cyberwelt</option>
    <option value="jungle">Dschungelwelt</option>
    <option value="sky">Himmelswelt</option>
    <option value="shadow">Schattenwelt</option>
    <option value="factory">Fabrikwelt</option>
    <option value="void">Leere</option>
    <option value="dream">Traumwelt</option>
    <option value="abyss">Abgrund</option>
</select>


        <label>Schwierigkeit</label>
        <select id="difficultySelect">
            <option value="easy">Einfach</option>
            <option value="normal">Normal</option>
            <option value="hard">Hart</option>
            <option value="insane">Heftig</option>
        </select>

        <div class="start-actions">
            <button id="cancelStart">Abbrechen</button>
            <button id="confirmStart">Los geht's !</button>
        </div>
    `;
    overlay.appendChild(box);
    gameFrame.appendChild(overlay);

    // ================= BUTTON + CHALLENGE =================
    if (activeUser && users[activeUser]) {
        const buttonRow = document.createElement("div");
        buttonRow.style.display = "flex";
        buttonRow.style.alignItems = "center";
        buttonRow.style.gap = "8px";
        buttonRow.style.marginTop = "10px";

        startBtn.parentNode.insertBefore(buttonRow, startBtn);
        buttonRow.appendChild(startBtn);

        startBtn.style.flexGrow = "1";
        startBtn.style.width = "100%";
        startBtn.style.textAlign = "center";

        if (herausforderungAktiv) {
            const aktiveChallenge = herausforderungList.find(c => c.aktiv);
            startBtn.innerText = `▶ ${gameSettings.herausforderung_beschreibung || "Challenge"} STARTEN`;

            const deactivateBtn = document.createElement("img");
            deactivateBtn.src = "assets/icons/close.png";
            deactivateBtn.alt = "Herausforderung deaktivieren";
            deactivateBtn.title = "Herausforderung deaktivieren";
            deactivateBtn.style.width = "24px";
            deactivateBtn.style.height = "24px";
            deactivateBtn.style.cursor = "pointer";
            deactivateBtn.style.flexShrink = "0";

            deactivateBtn.addEventListener("click", () => {
                users[activeUser].game_settings.herausforderung_aktiv = false;
                users[activeUser].game_settings.herausforderung_beschreibung = null;
                users[activeUser].herausforderung_list.forEach(h => h.aktiv = false);
                localStorage.setItem("pac_users", JSON.stringify(users));
                deactivateBtn.remove();
                window.location.href = "hauptmenue.html";
            });

            buttonRow.appendChild(deactivateBtn);
            startBtn.style.width = `calc(100% - 32px)`;
        } else {
            startBtn.innerText = "▶ SPIEL STARTEN";
            startBtn.style.width = "100%";
        }
    }

    // ================= VOREINSTELLUNGEN =================
    function loadUserSettings() {
        if (!activeUser) return;
        const users = JSON.parse(localStorage.getItem("pac_users")) || {};
        const s = users[activeUser]?.game_settings;
        if (!s) return;

        document.getElementById("playersSelect").value = s.players || "1";
        document.getElementById("mapSelect").value = s.map || "original";
        document.getElementById("themeSelect").value = s.theme || "original";
        document.getElementById("difficultySelect").value = s.difficulty || "normal";
    }

    // ================= EVENTS =================
    startBtn.addEventListener("click", () => {
        const users = JSON.parse(localStorage.getItem("pac_users")) || {};
        const herausforderung = users[activeUser]?.game_settings?.herausforderung_aktiv;

        if (herausforderung) {
            saveGameSettings();
            window.location.href = "spiel.html";
            return;
        }


        document.getElementById("settingsBtn")?.style.setProperty("display", "none");
        saveTempSettings();
        loadUserSettings();
        overlay.style.display = "flex";
    });

    document.addEventListener("click", (e) => {
        if (e.target.id === "cancelStart") {
            document.getElementById("settingsBtn")?.style.setProperty("display", "flex");
            revertTempSettings();
            overlay.style.display = "none";
        }

        if (e.target.id === "confirmStart") {
            document.getElementById("settingsBtn")?.style.setProperty("display", "flex");
            saveGameSettings();
            overlay.style.display = "none";
            window.location.href = "spiel.html";
        }

    });

    // ================= FUNKTIONEN =================
    function saveGameSettings() {
        const players = document.getElementById("playersSelect").value;
        const map = document.getElementById("mapSelect").value;
        const theme = document.getElementById("themeSelect").value;
        const difficulty = document.getElementById("difficultySelect").value;

        localStorage.setItem("pac_game_settings", JSON.stringify({ players, map, theme, difficulty }));

        const users = JSON.parse(localStorage.getItem("pac_users")) || {};
        if (users[activeUser]) {
            users[activeUser].game_settings = {
                ...users[activeUser].game_settings,
                players, map, theme, difficulty
            };

            users[activeUser].stats.gamesPlayed += 1;

            delete users[activeUser].game_settings_temp;
            localStorage.setItem("pac_users", JSON.stringify(users));
        }
    }

    function saveTempSettings() {
        if (!activeUser) return;
        const users = JSON.parse(localStorage.getItem("pac_users")) || {};
        users[activeUser].game_settings_temp = {
            players: document.getElementById("playersSelect").value,
            map: document.getElementById("mapSelect").value,
            theme: document.getElementById("themeSelect").value,
            difficulty: document.getElementById("difficultySelect").value
        };
        localStorage.setItem("pac_users", JSON.stringify(users));
    }

    function revertTempSettings() {
        const users = JSON.parse(localStorage.getItem("pac_users")) || {};
        const temp = users[activeUser]?.game_settings_temp;
        if (!temp) return;

        document.getElementById("playersSelect").value = temp.players;
        document.getElementById("mapSelect").value = temp.map;
        document.getElementById("themeSelect").value = temp.theme;
        document.getElementById("difficultySelect").value = temp.difficulty;

        delete users[activeUser].game_settings_temp;
        localStorage.setItem("pac_users", JSON.stringify(users));
    }

    // ================= AUTOLOAD =================
    loadUserSettings();
});
