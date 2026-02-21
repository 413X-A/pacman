export const herausforderung_liste = [];

const maps = ["original","fogmaze","crystal","busybee"];
const themes = [
    "original","lava","ice","forest","desert","ocean","neon","space",
    "volcano","crystal","mystic","toxic","ruins","cyber",
    "jungle","sky","shadow","factory","void","dream","abyss"
];

for (let i = 1; i <= 100; i++) {

    const isBoss = [25,50,75,100].includes(i);

    // ================= SCHWIERIGKEIT =================
    let difficulty;
    if (i <= 25) difficulty = "easy";
    else if (i <= 50) difficulty = "normal";
    else if (i <= 75) difficulty = "hard";
    else difficulty = "insane";

    if (isBoss) difficulty = "insane";

    // ================= GEISTER =================
    let ghosts = Math.min(10, 1 + Math.floor(i / 8));
    if (isBoss) ghosts = 10;

    // ================= XP =================
    let exp = Math.min(50, 4 + i);
    if (isBoss) exp = Math.min(50, exp + 5);

    // ================= TELEPORTER =================
    const teleporter_aktiv = i >= 20 || isBoss;
    const teleporter_pacman = i >= 30 || isBoss;
    const teleporter_ghosts = i >= 55 || isBoss;

    // ================= REPRODUCTION =================
    const ghosts_reproduction = i >= 45 || isBoss;

    // ================= PUNKTE =================
    let punkte_need = 500 + (i * 150) + Math.floor(i * i * 2);
    if (isBoss) punkte_need *= 1.5;

    herausforderung_liste.push({
        name: isBoss ? `👑 Boss Level ${i}` : `Level ${i}`,
        beschreibung: isBoss 
            ? `Ein mächtiger Boss erwartet dich in Stufe ${i}.`
            : `Herausforderung Stufe ${i}.`,
        players: 1,
        map: maps[i % maps.length],
        difficulty: difficulty,
        anz_ghosts: ghosts,
        theme: themes[i % themes.length],
        punkte_need: Math.floor(punkte_need),
        reward_exp: exp,
        ghosts_dead: false,
        ghosts_reproduction: ghosts_reproduction,
        teleporter_aktiv: teleporter_aktiv,
        teleporter_pacman: teleporter_pacman,
        teleporter_ghosts: teleporter_ghosts,
        boss: isBoss,
        freigeschaltet: i === 1,
        aktiv: null,
        abgeschlossen: null
    });
}