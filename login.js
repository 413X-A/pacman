document.getElementById("loginBtn").addEventListener("click", () => {
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const status = document.getElementById("status");
    const loginBtn = document.getElementById("loginBtn");

    const user = usernameInput.value.trim();
    const pass = passwordInput.value.trim();

    if (!user || !pass) {
        showError("Bitte Benutzername und Passwort eingeben");
        return;
    }

    let users = JSON.parse(localStorage.getItem("pac_users")) || {};

    /* =========================
       NEUER BENUTZER
    ========================= */
    if (!users[user]) {
        users[user] = {
            password: pass,
            createdAt: Date.now(),
            // LISTEN (Musik | Herausforderungen | usw.)
            music_list: [
                "Keine Musik",
                "Mikhail Smusev",
                "Roman Rumyantsev",
                "Dvir Silverstone",
                "thatlofishow"
            ],
            herausforderung_list: [
                { name: null, beschreibung: "Teste dich in den unterschiedlichsten Herausforderungen in PacMan !", players: null, map: null, difficulty: null, anz_ghosts: null, theme: null, reward_exp: null, aktiv: null, abgeschlossen: null },
                { name: "Erstes Spiel", beschreibung: "Spiele ein einfaches Spiel !", players: 1, map: "original", difficulty: "easy", anz_ghosts: 2, theme: "original", reward_exp: 5, aktiv: false, abgeschlossen: false },
                { name: "Zweites Spiel", beschreibung: "Spiele ein weiteres Spiel !", players: 1, map: "busybee", difficulty: "easy", anz_ghosts: 3, theme: "lava", reward_exp: 5, aktiv: false, abgeschlossen: false }
            ],

            // PROFIL
            profil: {
                benutzername: user,
                passwort: pass
            },
            
            // STATISTIKEN
            stats: {
                herausforderungen_abgeschlossen: 0,
                gamesPlayed: 0,
                highscore: 0,
                gesamt_score: 0,
                gesamt_exp: 0,
                teleporter_duration: 10
            },

            // EINSTELLUNGEN
            game_settings: {
                herausforderung_aktiv: false,
                herausforderung_beschreibung: null,
                players: "1",
                map: "original",
                difficulty: "easy",
                theme: "original"
            },
            game_settings_temp: {
                players: null,
                map: null,
                difficulty: null,
                theme: null
            },
            settings: {
                music_preview: true,
                music_timestamp: null,
                music: "Keine Musik",
            },
            settings_temp: {
                music_preview: true,
                music_timestamp: null,
                music: null
            }
        };

        localStorage.setItem("pac_users", JSON.stringify(users));
        localStorage.setItem("pac_active_user", user);

        showSuccess(`Willkommen ${user} !`);
        redirect();
        return;
    }

    /* =========================
       LOGIN EXISTIERENDER USER
    ========================= */
    if (users[user].password === pass) {
        localStorage.setItem("pac_active_user", user);

        usernameInput.style.border = "2px solid #33ff00";
        passwordInput.style.border = "2px solid #33ff00";

        showSuccess(`Willkommen zurück ${user} !`);
        redirect();
    } else {
        showError("Falsches Passwort");
    }

    /* =========================
       HILFSFUNKTIONEN
    ========================= */
    function showError(msg) {
        loginBtn.disabled = true;
        status.innerText = msg;
        status.style.color = "red";

        usernameInput.style.border = "2px solid red";
        passwordInput.style.border = "2px solid red";

        setTimeout(() => {
            resetUI();
        }, 1200);
    }

    function showSuccess(msg) {
        status.innerText = msg;
        status.style.color = "#33ff00";
    }

    function resetUI() {
        loginBtn.disabled = false;
        usernameInput.style.border = "2px solid #0ff";
        passwordInput.style.border = "2px solid #0ff";
        status.innerText = "Auto-Registrierung aktiv";
        status.style.color = "#0ff";
    }

    function redirect() {
        setTimeout(() => {
            window.location.href = "hauptmenue.html";
        }, 900);
    }
});
