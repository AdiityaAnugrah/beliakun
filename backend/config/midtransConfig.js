const midtransClient = require("midtrans-client");

// Konfigurasi Midtrans
const coreApi = new midtransClient.CoreApi({
    isProduction: false, // Ubah ke true jika sudah di production
    serverKey: process.env.MIDTRANS_SERVER_KEY, // Server Key dari Midtrans
    clientKey: process.env.MIDTRANS_CLIENT_KEY, // Client Key dari Midtrans
});

module.exports = coreApi;
