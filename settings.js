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

    // ================= TEMP SETTINGS =================
    let tempSettings = {
        music_preview: user.settings_temp.music_preview,
        music: null,
        music_timestamp: null
    };

    // ================= GAME FRAME =================
    const gameFrame = document.querySelector(".game-frame");
    if (!gameFrame) return;

    // ================= OVERLAY =================
    const overlay = document.createElement("div");
    overlay.id = "settingsOverlay";
    overlay.style.position = "absolute";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0, 40, 70, 0.9)";
    overlay.style.zIndex = "25";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.backdropFilter = "blur(4px)";
    overlay.style.borderRadius = "10px";
    overlay.style.display = "none";

    // ================= BOX =================
    const box = document.createElement("div");
    box.className = "start-box";
    box.innerHTML = `
        <h2>Spieleinstellungen</h2>
        <label>Musik</label>
        <select id="musicSelect"></select>
        <div class="start-actions">
            <button id="cancelSettings">Abbrechen</button>
            <button id="confirmSettings" disabled style="background-color: grey; color: #ccc; cursor: not-allowed;">Bestätigen</button>
        </div>
    `;
    overlay.appendChild(box);
    gameFrame.appendChild(overlay);

    const musicSelect = document.getElementById("musicSelect");
    const confirmBtn = document.getElementById("confirmSettings");
    const settingsBtn = document.getElementById("settingsBtn");

    // ================= FUNCTIONS =================
    function getMusicFile(trackName) {
        return `assets/music/${trackName.toLowerCase().replaceAll(" ", "_")}.mp3`;
    }

    function setConfirmButton(enabled) {
        confirmBtn.disabled = !enabled;
        if (enabled) {
            confirmBtn.style.backgroundColor = "";
            confirmBtn.style.color = "";
            confirmBtn.style.cursor = "pointer";
        } else {
            confirmBtn.style.backgroundColor = "grey";
            confirmBtn.style.color = "#ccc";
            confirmBtn.style.cursor = "not-allowed";
        }
    }

    function loadMusicOptions() {
    const musicList = user.music_list || []; // nur aus localStorage

    musicSelect.innerHTML = "";
    musicList.forEach((trackName, index) => {
        const option = document.createElement("option");
        option.value = (index + 1).toString(); // ID
        option.text = trackName;
        musicSelect.appendChild(option);
    });

    markConfirmedMusic();
}

    function markConfirmedMusic() {
        Array.from(musicSelect.options).forEach(opt => {
            if (opt.text === user.settings.music) {
                opt.text = `➔ ${opt.text}`;
                opt.style.color = "green";
                musicSelect.value = opt.value;
            } else {
                // Entferne ggf. alte Pfeile und Farbe
                opt.text = opt.text.replace(/^➔\s*/, "");
                opt.style.color = "";
            }
        });
    }

    function playAudio(trackName, startTime = 0) {
        audio.pause();
        audio.src = getMusicFile(trackName);
        audio.currentTime = startTime;
        audio.loop = true;
        audio.volume = 0.5;
        audio.play().catch(() => {});
    }

    // ================= SETTINGS BUTTON =================
    if (settingsBtn) {
        settingsBtn.addEventListener("click", () => {
            settingsBtn.style.display = "none";

            // Vor Öffnen: bestätigte Musik Timestamp speichern
            user.settings.music_timestamp = audio.currentTime;
            localStorage.setItem("pac_users", JSON.stringify(users));

            loadMusicOptions();

            setConfirmButton(false);
            overlay.style.display = "flex";
        });
    }

    // ================= EVENTS =================
    document.addEventListener("click", (e) => {
        if (e.target.id === "cancelSettings") {
            // Vorschau stoppen
            if (previewAudio) {
                previewAudio.pause();
                previewAudio = null;
            }

            // Bestätigte Musik am gespeicherten Timestamp weiterspielen
            playAudio(user.settings.music, user.settings.music_timestamp || 0);

            // Temp Settings löschen
            tempSettings.music = null;
            tempSettings.music_timestamp = null;

            setConfirmButton(false);

            if (settingsBtn) settingsBtn.style.display = "flex";
            overlay.style.display = "none";
        }

        if (e.target.id === "confirmSettings") {
            // Vorschau übernehmen
            if (previewAudio) {
                audio.pause();
                audio = previewAudio;
                previewAudio = null;
                audio.loop = true;
                audio.volume = 0.5;
            }

            // Timestamp übernehmen
            user.settings.music = musicSelect.selectedOptions[0].text.replace(/^➔\s*/, "");
            user.settings.music_timestamp = audio.currentTime;

            // Temp Settings löschen
            user.settings_temp.music = null;
            user.settings_temp.music_timestamp = null;

            localStorage.setItem("pac_users", JSON.stringify(users));

            tempSettings.music = null;
            tempSettings.music_timestamp = null;

            markConfirmedMusic();
            setConfirmButton(false);

            if (settingsBtn) settingsBtn.style.display = "flex";
            overlay.style.display = "none";
        }
    });

    // ================= MUSIK AUSWAHL =================
    musicSelect.addEventListener("change", () => {
        const selectedOption = musicSelect.selectedOptions[0];
        if (!selectedOption) return;

        let trackName = selectedOption.text.replace(/^➔\s*/, "");

        if (user.settings_temp.music_preview) {
            // Vorschau starten
            if (previewAudio) previewAudio.pause();
            previewAudio = new Audio(getMusicFile(trackName));
            previewAudio.loop = true;
            previewAudio.volume = 0.5;
            previewAudio.currentTime = 0;

            audio.pause();
            previewAudio.play().catch(() => {});

            // Temp Settings speichern
            tempSettings.music = trackName;
            tempSettings.music_timestamp = previewAudio.currentTime;
            user.settings_temp.music = trackName;
            user.settings_temp.music_timestamp = previewAudio.currentTime;
            localStorage.setItem("pac_users", JSON.stringify(users));
        } else {
            // Keine Vorschau, direkt wechseln
            playAudio(trackName, 0);
        }

        // Confirm-Button aktivieren/deaktivieren
        if (trackName === user.settings.music) {
            setConfirmButton(false);
        } else {
            setConfirmButton(true);
        }
    });

    // ================= INIT =================
    if (user.settings.music) {
        playAudio(user.settings.music, user.settings.music_timestamp || 0);
    }
});
