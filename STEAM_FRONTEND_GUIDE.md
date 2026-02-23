# Panduan Integrasi Frontend: Steam Profile Component

Endpoint API Steam di backend (`api.beliakun.com`) telah selesai dibuat dan siap mem-*parsing* 11 tipe data metrik profil Steam secara *real-time*. Data ini sudah disesuaikan agar mudah di-*consume* oleh frontend.

## 1. Spesifikasi Endpoint

Lakukan `GET` request ke endpoint berikut dari aplikasi frontend Anda (React/Next.js/Vue):

```http
GET https://api.beliakun.com/steam/profile
```

*(Saat development lokal, gunakan `http://localhost:4000/steam/profile`)*

### Contoh Response Sukses (200 OK)

Backend akan mengembalikan data dalam format JSON berikut:

```json
{
  "username": "u can help me ?",
  "realName": "Aditya Anugrah",
  "state": "In-Game",          
  "personastate": 1,         
  "avatarUrl": "https://avatars.steamstatic.com/9b53dc1bbbe7d9aefdba3b1801f586bd84be1d4c_full.jpg",
  "gameName": "Grand Theft Auto V",
  "gameId": "271590",
  "profileUrl": "https://steamcommunity.com/id/claraikaa/",
  "countryCode": "ID",         
  "lastLogoff": 1708682000,
  "timeCreated": 1602495000
}
```

## 2. Definisi *State* (Status Profil)

Backend sudah menyederhanakan kode status Steam ke dalam bentuk teks yang mudah dibaca pada properti `state`:

| Nilai `state` | Penjelasan | Warna Indikator yang Disarankan (UI) |
| :--- | :--- | :--- |
| `Offline` | Pengguna sedang tidak aktif. | Gray / Abu-abu |
| `Online` | Pengguna sedang aktif. | Blue / Biru |
| `In-Game` | Pengguna sedang bermain game. | Green / Hijau |
| `Busy` | Mode Sibuk (Do Not Disturb). | Red / Merah |
| `Away` | Sedang tidak di depan layar (AFK). | Yellow / Kuning |
| `Snooze` | Mode Tidur / Inaktif lama. | Slate / Biru Gelap |
| `Looking to Play` | Mencari grup untuk bermain. | Emerald / Hijau Terang |
| `Looking to Trade`| Mencari teman untuk bertukar item. | Purple / Ungu |

## 3. Implementasi Logic di Frontend (React Component)

Berikut adalah panduan dan contoh bagaimana Anda bisa mengimplementasikan datanya ke dalam UI komponen `SteamCard.jsx`.

### A. Mengatur Teks dan Warna Status

Gunakan kondisi sederhana untuk mengubah teks dan warna lingkaran indikator status berdasarkan data yang diterima:

```javascript
// Contoh menggunakan data dari state/fetching (misal: SWR / React Query)
const steamData = response.data;

let statusText = steamData.state; 
let statusColor = "bg-gray-500"; 

// Tentukan warna berdasarkan state
if (steamData.state === "Online") statusColor = "bg-blue-500";
if (steamData.state === "In-Game") statusColor = "bg-green-500";
if (steamData.state === "Busy") statusColor = "bg-red-500";
if (steamData.state === "Away" || steamData.state === "Snooze") statusColor = "bg-yellow-500";

// Tampilkan nama game jika sedang In-Game
if (steamData.gameName) {
    statusText = `Playing ${steamData.gameName}`;
}
```

### B. Menampilkan UI

Gunakan Tailwind CSS untuk menampilkan data profil dengan cepat:

```jsx
import React from 'react';

// ... (logic fetching diletakkan di sini)

return (
  <div className="flex items-center gap-4 p-4 bg-gray-900 rounded-lg text-white">
    
    {/* Avatar Section */}
    <div className="relative">
      <img 
        src={steamData.avatarUrl} 
        alt="Steam Avatar" 
        className="w-16 h-16 rounded-md border-2 border-gray-700"
      />
      {/* Indikator Status di pojok foto */}
      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-900 ${statusColor}`}></div>
    </div>

    {/* Info Section */}
    <div className="flex flex-col">
      <a href={steamData.profileUrl} target="_blank" rel="noreferrer" className="text-lg font-bold hover:text-blue-400">
        {steamData.username}
      </a>
      
      {/* Status & Game Name */}
      <div className="flex items-center gap-2 mt-1">
         <span className={`text-sm font-medium ${steamData.state === 'In-Game' ? 'text-green-400' : 'text-gray-400'}`}>
            {statusText}
         </span>
      </div>

      {/* Bendera (Opsional, butuh icon flag) */}
      {steamData.countryCode && (
         <span className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            Location: {steamData.countryCode} 🇮🇩
         </span>
      )}
    </div>
  </div>
);
```

## 4. Keamanan dan Fallback

*   **Fallback Method:** Jika API resmi Steam sedang *down* atau terkena limit rate (_Too Many Requests_), backend telah dikonfigurasi untuk secara otomatis merespons dengan HTTP Status 500 dan menyertakan data _fallback_.
    ```json
    { 
       "error": "Gagal mengambil data Steam API.", 
       "state": "Offline", 
       "username": "Aditya"
    }
    ```
    Oleh karena itu, komponen UI Anda **tidak akan berantakan (crash)** meskipun server Steam sedang bermasalah. Status `Offline` akan otomatis digunakan.
*   **Keamanan API Key:** `STEAM_API_KEY` disimpan dengan aman di file `.env` server dan hanya dipanggil sisi belakang (server-to-server). Frontend tidak akan (dan tidak boleh) pernah mengetahui kunci rahasia ini.
