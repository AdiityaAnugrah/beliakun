const express = require('express');
const fetch = require('node-fetch');

const router = express.Router();

router.get('/profile', async (req, res) => {
    try {
        const STEAM_API_KEY = process.env.STEAM_API_KEY;
        const STEAM_ID = process.env.STEAM_ID;
        
        if (!STEAM_API_KEY || !STEAM_ID) {
            return res.status(500).json({ error: "STEAM_API_KEY or STEAM_ID is missing from .env" });
        }

        // Memanggil API Resmi Steam: GetPlayerSummaries
        const response = await fetch(
            `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${STEAM_ID}`
        );
        
        const data = await response.json();

        // Mengambil profil Steam Anda (index 0)
        const player = data?.response?.players?.[0];
        if (!player) {
            return res.status(404).json({ error: "Steam Profile not found" });
        }

        // --- Membaca Status Online (personastate) ---
        // 0 = Offline, 1 = Online, 2 = Busy, 3 = Away, 4 = Snooze, 5 = looking to trade, 6 = looking to play
        let currentState = 'Offline';
        if (player.personastate === 1) currentState = 'Online';
        else if (player.personastate === 2) currentState = 'Sibuk';
        else if (player.personastate === 3) currentState = 'Pergi';
        else if (player.personastate === 4) currentState = 'Tidur';
        else if (player.personastate === 5) currentState = 'Mencari Teman Untuk Trade';
        else if (player.personastate === 6) currentState = 'Mencari Teman Untuk Bermain';
        
        // --- Membaca Jika Sedang Bermain Game (gameextrainfo) ---
        // Jika sedang memutar game, variable ini akan terisi nama gamenya
        if (player.gameextrainfo) {
            currentState = 'Sedang Bermain Game';
        }

        // --- Info Waktu (opsional tapi berguna untuk frontend) ---
        // lastlogoff: Waktu terakhir online (Unix timestamp)
        // timecreated: Waktu akun dibuat (Unix timestamp)
        
        // Membungkus data untuk dikirim ke frontend
        const steamData = {
            username: player.personaname, 
            realName: player.realname || null,
            state: currentState,          // 'Online', 'Offline', 'In-Game', dll
            personastate: player.personastate, // Raw angka jika frontend mau styling spesifik
            avatarUrl: player.avatarfull, // HD Avatar
            gameName: player.gameextrainfo || null,
            gameId: player.gameid || null, 
            profileUrl: player.profileurl,
            countryCode: player.loccountrycode || null, // Misal: "ID", "US"
            lastLogoff: player.lastlogoff || null,
            timeCreated: player.timecreated || null
        };

        return res.json(steamData);
        
    } catch (error) {
        console.error('Steam API Error:', error.message);
        
        // Berikan data fallback jika API Steam gagal agar frontend tidak hancur
        return res.status(500).json({ 
             error: "Gagal mengambil data Steam API.", 
             state: "Offline", 
             username: "Aditya"
        });
    }
});

module.exports = router;
