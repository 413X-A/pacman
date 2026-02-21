import { herausforderung_liste } from "../assets/additions/herausforderungen_liste.js";

document.addEventListener("DOMContentLoaded", () => {
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const status = document.getElementById("status");
    const loginBtn = document.getElementById("loginBtn");

    loginBtn.addEventListener("click", () => {
        const user = usernameInput.value.trim();
        const pass = passwordInput.value.trim();

        if (!user || !pass) {
            showError("Bitte Benutzername und Passwort eingeben");
            return;
        }

        let users = JSON.parse(localStorage.getItem("pac_users")) || {};

        // Neuer Benutzer
        if (!users[user]) {
            let maxPunkteNeed = 0;
            if (herausforderung_liste?.length) {
                maxPunkteNeed = Math.max(...herausforderung_liste.map(h => h.punkte_need || 0));
            }

            let anzahlHerausforderungen = herausforderung_liste?.length;

            users[user] = {
                password: pass,
                createdAt: Date.now(),
                music_list: ["Keine Musik", "Mikhail Smusev", "Roman Rumyantsev", "Dvir Silverstone", "thatlofishow"],
                herausforderung_list: [...herausforderung_liste],

                stats: {
                    benutzername: user,
                    passwort: pass,
                    herausforderungen_abgeschlossen: 0,
                    herausforderungen_anzahl: anzahlHerausforderungen,
                    herausforderungen_beendet: maxPunkteNeed,
                    gamesPlayed: 0,
                    highscore: 0,
                    gesamt_score: 0,
                    gesamt_exp: 0,
                    teleporter_duration: 10,
                    powerup_duration: 7.5
                },
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
                    powerup_blinken: true,
                    powerup_ghostsblinken: false,
                    ghosts_dead: false,
                    ghosts_reproduction: false,
                    teleporter_aktiv: true,
                    teleporter_pacman: true,
                    teleporter_ghosts: false
                },
                settings_temp: {
                    music_preview: true,
                    music_timestamp: null,
                    music: null,
                    powerup_blinken: null,
                    powerup_ghostsblinken: null,
                    ghosts_dead: null,
                    ghosts_reproduction: null,
                    teleporter_aktiv: null,
                    teleporter_pacman: null,
                    teleporter_ghosts: null
                },
                ingame: {
                    punkte: 0,
                    exp: 0,
                    herausforderung_punkte: 0
                }
            };

            localStorage.setItem("pac_users", JSON.stringify(users));
            localStorage.setItem("pac_active_user", user);
            showSuccess(`Willkommen ${user} !`);
            redirect();
            return;
        }


        // Existierender Benutzer
        if (users[user].password === pass) {
            localStorage.setItem("pac_active_user", user);
            showSuccess(`Willkommen zurück ${user} !`);
            redirect();
        } else {
            showError("Falsches Passwort");
        }

        function showError(msg) {
            loginBtn.disabled = true;
            status.innerText = msg;
            status.style.color = "red";
            usernameInput.style.border = "2px solid red";
            passwordInput.style.border = "2px solid red";
            setTimeout(resetUI, 1200);
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
            setTimeout(() => { window.location.href = "hauptmenue.html"; }, 850);
        }
    });
});

// localStorage.clear();

