// 1. IMPORTS DAN KONFIGURASI AWAL
const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    Partials,
} = require("discord.js");
require("dotenv").config();

// Konfigurasi Bot
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
const COMMAND_PREFIX = "!";
const API_URL = "https://api.beliakun.com/product";

if (!BOT_TOKEN) {
    console.error(
        "KRITIS: Token bot (DISCORD_BOT_TOKEN) tidak ditemukan di environment variables."
    );
    console.error(
        "Pastikan Anda sudah membuat file .env di dalam folder 'bot/' dan mengisi DISCORD_BOT_TOKEN=TOKEN_ANDA"
    );
    process.exit(1);
}

// 2. INISIALISASI CLIENT (BOT) DISCORD
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.on("ready", () => {
    console.log("--------------------------------------------------");
    console.log(`Bot berhasil login sebagai: ${client.user.tag}`);
    console.log(`ID Bot: ${client.user.id}`);
    console.log(`Prefix perintah: ${COMMAND_PREFIX}`);
    console.log(`Terhubung dan siap menerima perintah!`);
    console.log("--------------------------------------------------");
});

client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.content.startsWith(COMMAND_PREFIX)) {
        return;
    }

    const args = message.content
        .slice(COMMAND_PREFIX.length)
        .trim()
        .split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "produk") {
        let halaman = parseInt(args[0]) || 1;
        let jumlahItem = parseInt(args[1]) || 5;

        if (halaman <= 0) {
            message.reply(
                "Nomor halaman tidak valid. Harap masukkan angka lebih besar dari 0."
            );
            return;
        }
        if (jumlahItem <= 0) {
            message.reply(
                "Jumlah item tidak valid. Harap masukkan angka lebih besar dari 0."
            );
            return;
        }
        if (jumlahItem > 20) {
            message.reply(
                "Jumlah item terlalu banyak. Maksimal 20 item per halaman untuk tampilan optimal."
            );
            return;
        }

        console.log(
            `[INFO] Perintah '${COMMAND_PREFIX}produk' diterima dari ${message.author.tag}. Parameter: halaman=${halaman}, jumlah_item=${jumlahItem}`
        );

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            controller.abort();
            console.log("[API] Permintaan API dihentikan karena timeout.");
        }, 10000);

        try {
            const queryParams = new URLSearchParams({
                page: halaman,
                limit: jumlahItem,
            });
            const fullApiUrl = `${API_URL}?${queryParams}`;

            console.log(
                `[API] Mengirim permintaan GET ke: ${fullApiUrl} menggunakan fetch`
            );
            const responseFromApi = await fetch(fullApiUrl, {
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!responseFromApi.ok) {
                const errorText = await responseFromApi.text();
                const status = responseFromApi.status;
                console.error(
                    `[API ERROR] Status: ${status}, Pesan: ${errorText}`
                );
                const error = new Error(
                    `API request failed with status ${status}`
                );
                error.response = { status: status, data: errorText };
                throw error;
            }

            console.log(
                `[API] Respons diterima. Status: ${responseFromApi.status}`
            );
            const dataHasilApi = await responseFromApi.json();
            const listProdukDariApi = dataHasilApi.products || [];
            const totalSemuaItem = dataHasilApi.totalItems || 0;
            const totalSemuaHalaman = dataHasilApi.totalPages || 0;
            const halamanSaatIni = dataHasilApi.currentPage || halaman;
            if (listProdukDariApi.length === 0) {
                let pesanKosong = `Tidak ada produk yang ditemukan untuk halaman ${halamanSaatIni}.`;
                if (
                    halamanSaatIni > totalSemuaHalaman &&
                    totalSemuaHalaman > 0
                ) {
                    pesanKosong += ` Total halaman yang tersedia hanya ${totalSemuaHalaman}.`;
                }
                message.reply(pesanKosong);
                return;
            }
            const pesanEmbed = new EmbedBuilder()
                .setColor(0xffc107)
                .setTitle("🛍️ Daftar Produk dari BeliAkun.com")
                .setDescription("Menampilkan produk yang tersedia.")
                .setTimestamp()
                .setFooter({
                    text: `Halaman ${halamanSaatIni}/${totalSemuaHalaman} | Total Produk: ${totalSemuaItem}`,
                });

            console.log(
                `[INFO] Memproses ${listProdukDariApi.length} produk untuk ditampilkan.`
            );

            listProdukDariApi.forEach((item_produk) => {
                if (
                    pesanEmbed.data.fields &&
                    pesanEmbed.data.fields.length >= jumlahItem
                )
                    return;
                const namaProduk = item_produk.nama || "Nama Tidak Tersedia";
                const hargaProduk = item_produk.harga || 0;
                const stokProduk =
                    item_produk.stock !== undefined
                        ? String(item_produk.stock)
                        : "N/A";
                const deskripsiProduk = item_produk.deskripsi || "";
                const urlGambarProduk = item_produk.gambar || null;
                const kategoriProduk = item_produk.kategori || "";
                const linkShopeeProduk = item_produk.link_shopee || "";
                let hargaFormatted;
                try {
                    hargaFormatted = `Rp ${parseInt(hargaProduk).toLocaleString(
                        "id-ID"
                    )}`;
                } catch (e) {
                    hargaFormatted = String(hargaProduk);
                }
                let nilaiField = `**Harga**: ${hargaFormatted}\n`;
                if (stokProduk !== "N/A" && stokProduk !== "") {
                    nilaiField += `**Stok**: ${stokProduk}\n`;
                }
                if (kategoriProduk) {
                    nilaiField += `**Kategori**: ${kategoriProduk}\n`;
                }
                if (deskripsiProduk) {
                    nilaiField += `*${deskripsiProduk}*\n`;
                }
                if (linkShopeeProduk) {
                    nilaiField += `[🛒 Beli di Shopee](${linkShopeeProduk})\n`;
                }
                if (urlGambarProduk) {
                    nilaiField += `[🖼️ Lihat Gambar](${urlGambarProduk})`;
                }

                pesanEmbed.addFields({
                    name: `🏷️ ${namaProduk}`,
                    value: nilaiField.trim(),
                    inline: false,
                });
            });

            message.channel.send({ embeds: [pesanEmbed] });
            console.log(
                `[INFO] Pesan embed berhasil dikirim ke channel #${message.channel.name}.`
            );
        } catch (error) {
            clearTimeout(timeoutId);
            console.error(
                "[ERROR] Terjadi kesalahan pada perintah !produk:",
                error.message
            );
            let pesanErrorPengguna =
                "Maaf, terjadi kesalahan saat memproses permintaan Anda.";

            if (error.name === "AbortError") {
                pesanErrorPengguna =
                    "Permintaan ke API terlalu lama (timeout). Server API mungkin lambat merespons.";
            } else if (error.response && error.response.status) {
                const status = error.response.status;
                pesanErrorPengguna = `Terjadi kesalahan saat menghubungi API (Status: ${status}). `;
                if (status === 401)
                    pesanErrorPengguna += "Akses ditolak (Unauthorized).";
                else if (status === 404)
                    pesanErrorPengguna +=
                        "Endpoint API tidak ditemukan (Not Found).";
                else if (status >= 500)
                    pesanErrorPengguna +=
                        "Server API sedang mengalami masalah.";
            } else if (
                error.message &&
                (error.message.toLowerCase().includes("fetch") ||
                    error.message.toLowerCase().includes("network"))
            ) {
                pesanErrorPengguna =
                    "Tidak dapat terhubung ke server API. Pastikan API Anda aktif dan dapat dijangkau.";
            }
            message.reply(pesanErrorPengguna);
        }
    }
});
client
    .login(BOT_TOKEN)
    .then(() => {
        console.log("[LOGIN] Bot berhasil login ke Discord.");
    })
    .catch((err) => {
        console.error("[LOGIN ERROR] Gagal login ke Discord:", err.message);
        console.error(
            "Pastikan token bot Anda benar dan koneksi internet stabil."
        );
    });
