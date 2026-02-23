const express = require('express');
const fetch = require('node-fetch'); // atau axios
const querystring = require('querystring');

const router = express.Router();

// 1. Taruh credentials ini di file .env backend kamu ya!
const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const refresh_token = process.env.SPOTIFY_REFRESH_TOKEN; 

const basic = Buffer.from(`${client_id}:${client_secret}`).toString('base64');
const TOKEN_ENDPOINT = `https://accounts.spotify.com/api/token`;
const NOW_PLAYING_ENDPOINT = `https://api.spotify.com/v1/me/player/currently-playing`;

// Fungsi untuk hit API Spotify dan minta Access Token baru (pakai Refresh Token tua)
const getAccessToken = async () => {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token,
    }),
  });
  return response.json();
};

// Fungsi untuk mengecek lagu apa yang sedang diputar
const getNowPlaying = async () => {
  const { access_token } = await getAccessToken();

  return fetch(NOW_PLAYING_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
};

// 2. Buat endpoint GET /spotify/now-playing
// Karena kita mounting dengan app.use("/spotify", spotifyRoutes) di server.js,
// kita gunakan router.get("/now-playing", ...) agar full path-nya jadi /spotify/now-playing
router.get('/now-playing', async (req, res) => {
  try {
    const response = await getNowPlaying();

    // 204 = No Content (lagi gak dengerin lagu)
    if (response.status === 204 || response.status > 400) {
      return res.status(200).json({ isPlaying: false });
    }

    const song = await response.json();

    // Kalau dengerin podcast, kita abaikan saja (biar fokus ke lagu)
    if (song.currently_playing_type !== 'track') {
      return res.status(200).json({ isPlaying: false });
    }

    // Kalau dengerin lagu, ambil datanya:
    const isPlaying = song.is_playing;
    const title = song.item.name;
    const artist = song.item.artists.map((_artist) => _artist.name).join(', ');
    const albumImageUrl = song.item.album.images[0].url;
    const songUrl = song.item.external_urls.spotify;

    return res.status(200).json({
      albumImageUrl,
      artist,
      isPlaying,
      songUrl,
      title,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Failed to fetch Spotify status' });
  }
});

module.exports = router;
