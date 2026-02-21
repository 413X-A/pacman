// ------------------- settings_script.js -------------------

document.addEventListener("DOMContentLoaded", () => {

    // ================= USER =================
    const activeUser = localStorage.getItem("pac_active_user");
    if (!activeUser) return;

    const users = JSON.parse(localStorage.getItem("pac_users")) || {};
    const user = users[activeUser];
    if (!user) return;

    // ================= AUDIO =================
    let audio = new Audio();
    audio.loop = true;
    audio.volume = 0.5;
    let previewAudio = null;

    // ================= GAME FRAME =================
    const gameFrame = document.querySelector(".game-frame");
    if (!gameFrame) return;

    // ================= OVERLAY =================
    const overlay = document.createElement("div");
    overlay.id = "settingsOverlay";
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

    // ================= BOX =================
    const box = document.createElement("div");
    box.className = "start-box";
    Object.assign(box.style, {
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        width: "90%",
        maxWidth: "650px",
        maxHeight: "90%",
        overflowY: "auto"
    });
    box.style.scrollbarWidth = "none";
    box.style.msOverflowStyle = "none";
    box.style.setProperty("::-webkit-scrollbar", "display: none");

    box.innerHTML = `
        <h2 style="margin-bottom:10px;">Spieleinstellungen</h2>
        <p>————— ———————— ————— ———————— —————</p>

        <div class="settings-section">
            <label style="font-weight:600; margin-bottom:6px;">Musik</label>
            <select id="musicSelect" style="width:100%; padding:6px; font-size:0.95em;"></select>
        </div>

        <p>————————— ——————————————— —————————</p>

        <div class="settings-section">
            <label style="font-weight:600; margin-bottom:6px;">Geister</label>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <label class="checkbox-label">
                    <input type="checkbox" id="setting_ghosts_dead">
                    <span>Tote Geister</span>
                </label>

                <label class="checkbox-label">
                    <input type="checkbox" id="setting_ghosts_reproduction">
                    <span>Vermehrung</span>
                </label>
            </div>
        </div>

        <p>————— ———————— ————— ———————— —————</p>

        <div class="settings-section">
            <label style="font-weight:600; margin-bottom:6px;">Teleporter</label>
            <div style="display:flex; flex-direction:column; gap:6px;">
                <label class="checkbox-label">
                    <input type="checkbox" id="setting_teleporter_aktiv">
                    <span>Teleporter aktiv</span>
                </label>

                <div id="teleporterOptions" style="display:flex; gap:10px; margin-left:20px;">
                    <label class="checkbox-label" style="flex:1;">
                        <input type="checkbox" id="setting_teleporter_pacman">
                        <span>Pacman darf teleportieren</span>
                    </label>

                    <label class="checkbox-label" style="flex:1;">
                        <input type="checkbox" id="setting_teleporter_ghosts">
                        <span>Geister dürfen teleportieren</span>
                    </label>
                </div>
            </div>
        </div>

        <p>————————— ——————————————— —————————</p>

        <div class="settings-section">
            <label style="font-weight:600; margin-bottom:6px;">Powerups</label>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                <label class="checkbox-label">
                    <input type="checkbox" id="setting_powerup_blinken">
                    <span>Powerup blinkt</span>
                </label>

                <label class="checkbox-label">
                    <input type="checkbox" id="setting_powerup_ghostsblinken">
                    <span>Geister blinken</span>
                </label>
            </div>
        </div>

        <p>————— ———————— ————— ———————— —————</p>

        <div class="start-actions" style="
            position: sticky;
            bottom: 0;
            left: 0;
            width: 100%;
            padding: 10px 20px;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
            z-index: 20;
        ">
            <button id="cancelSettings">Abbrechen</button>
            <button id="confirmSettings" disabled
                style="background-color: grey; color: #ccc; cursor: not-allowed;">
                Bestätigen
            </button>
        </div>
    `;

    overlay.appendChild(box);
    gameFrame.appendChild(overlay);

    // ================= ELEMENTE =================
    const musicSelect = document.getElementById("musicSelect");
    const confirmBtn = document.getElementById("confirmSettings");
    const settingsBtn = document.getElementById("settingsBtn");

    const chkGhostsDead = document.getElementById("setting_ghosts_dead");
    const chkGhostsRepro = document.getElementById("setting_ghosts_reproduction");

    const chkTeleporterAktiv = document.getElementById("setting_teleporter_aktiv");
    const chkTeleporterPacman = document.getElementById("setting_teleporter_pacman");
    const chkTeleporterGhosts = document.getElementById("setting_teleporter_ghosts");
    const teleporterOptions = document.getElementById("teleporterOptions");

    const chkPowerupBlink = document.getElementById("setting_powerup_blinken");
    const chkGhostBlink = document.getElementById("setting_powerup_ghostsblinken");

    // ================= HELPER =================
    function getMusicFile(name) {
        return `assets/music/${name.toLowerCase().replaceAll(" ", "_")}.mp3`;
    }

    function setConfirmButton(enabled) {
        confirmBtn.disabled = !enabled;
        confirmBtn.style.backgroundColor = enabled ? "" : "grey";
        confirmBtn.style.color = enabled ? "" : "#ccc";
        confirmBtn.style.cursor = enabled ? "pointer" : "not-allowed";
    }

    function updateTeleporterUI() {
        if (chkTeleporterAktiv.checked) {
            teleporterOptions.style.display = "flex";
            chkTeleporterPacman.disabled = false;
            chkTeleporterGhosts.disabled = false;
        } else {
            chkTeleporterPacman.disabled = true;
            chkTeleporterGhosts.disabled = true;
            chkTeleporterPacman.checked = false;
            chkTeleporterGhosts.checked = false;
        }
    }

    function loadSettings() {
        chkGhostsDead.checked = !!user.settings.ghosts_dead;
        chkGhostsRepro.checked = !!user.settings.ghosts_reproduction;

        chkTeleporterAktiv.checked = !!user.settings.teleporter_aktiv;
        chkTeleporterPacman.checked = !!user.settings.teleporter_pacman;
        chkTeleporterGhosts.checked = !!user.settings.teleporter_ghosts;

        chkPowerupBlink.checked = !!user.settings.powerup_blinken;
        chkGhostBlink.checked = !!user.settings.powerup_ghostsblinken;

        updateTeleporterUI();
    }

    function settingsChanged() {
        return (
            chkGhostsDead.checked !== user.settings.ghosts_dead ||
            chkGhostsRepro.checked !== user.settings.ghosts_reproduction ||
            chkTeleporterAktiv.checked !== user.settings.teleporter_aktiv ||
            chkTeleporterPacman.checked !== user.settings.teleporter_pacman ||
            chkTeleporterGhosts.checked !== user.settings.teleporter_ghosts ||
            chkPowerupBlink.checked !== user.settings.powerup_blinken ||
            chkGhostBlink.checked !== user.settings.powerup_ghostsblinken ||
            (musicSelect.selectedOptions[0]?.text.replace(/^➔\s*/, "") !== user.settings.music)
        );
    }

    function checkConfirmButton() {
        setConfirmButton(settingsChanged());
    }

    function loadMusicOptions() {
        musicSelect.innerHTML = "";
        (user.music_list || []).forEach((name, i) => {
            const opt = document.createElement("option");
            opt.value = i;
            opt.text = name;
            musicSelect.appendChild(opt);
        });

        Array.from(musicSelect.options).forEach(opt => {
            if (opt.text === user.settings.music) {
                opt.text = `➔ ${opt.text}`;
                opt.style.color = "green";
                musicSelect.value = opt.value;
            }
        });
    }

    function playAudio(trackName, startTime = 0) {
        audio.pause();
        audio.src = getMusicFile(trackName);
        audio.currentTime = startTime;
        audio.loop = true;
        audio.volume = 0.5;
        audio.play().catch(() => { });
    }

    // ================= SETTINGS BUTTON =================
    settingsBtn?.addEventListener("click", () => {
        settingsBtn.style.display = "none";
        user.settings.music_timestamp = audio.currentTime;
        localStorage.setItem("pac_users", JSON.stringify(users));

        loadMusicOptions();
        loadSettings();
        setConfirmButton(false);
        overlay.style.display = "flex";
    });

    // ================= EVENTS =================
    [
        chkGhostsDead,
        chkGhostsRepro,
        chkTeleporterAktiv,
        chkTeleporterPacman,
        chkTeleporterGhosts,
        chkPowerupBlink,
        chkGhostBlink
    ].forEach(el => el.addEventListener("change", () => {
        updateTeleporterUI();
        checkConfirmButton();
    }));

    musicSelect.addEventListener("change", () => {
        const trackName = musicSelect.selectedOptions[0]?.text.replace(/^➔\s*/, "");
        if (!trackName) return;

        if (user.settings_temp?.music_preview) {
            previewAudio?.pause();
            previewAudio = new Audio(getMusicFile(trackName));
            previewAudio.loop = true;
            previewAudio.volume = 0.5;
            previewAudio.play().catch(() => { });
        } else {
            playAudio(trackName, 0);
        }

        checkConfirmButton();
    });

    document.addEventListener("click", e => {
        if (e.target.id === "cancelSettings") {
            previewAudio?.pause();
            previewAudio = null;
            loadSettings();
            setConfirmButton(false);
            overlay.style.display = "none";
            settingsBtn.style.display = "flex";
        }

        if (e.target.id === "confirmSettings") {
            // ===================== SPEICHERN =====================
            user.settings.ghosts_dead = chkGhostsDead.checked;
            user.settings.ghosts_reproduction = chkGhostsRepro.checked;

            user.settings.teleporter_aktiv = chkTeleporterAktiv.checked;
            user.settings.teleporter_pacman = chkTeleporterPacman.checked;
            user.settings.teleporter_ghosts = chkTeleporterGhosts.checked;

            user.settings.powerup_blinken = chkPowerupBlink.checked;
            user.settings.powerup_ghostsblinken = chkGhostBlink.checked;

            user.settings.music =
                musicSelect.selectedOptions[0]?.text.replace(/^➔\s*/, "") || user.settings.music;
            user.settings.music_timestamp = audio.currentTime;

            localStorage.setItem("pac_users", JSON.stringify(users));
            setConfirmButton(false);
            overlay.style.display = "none";
            settingsBtn.style.display = "flex";
        }
    });

    // ================= INIT =================
    if (user.settings.music) {
        playAudio(user.settings.music, user.settings.music_timestamp || 0);
    }
});
