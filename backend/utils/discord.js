// utils/discord.js
require("dotenv").config();

async function discordSend(payload) {
  const url = process.env.DISCORD_WEBHOOK_URL;
  if (!url) return;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const t = await res.text();
    console.error("[discord] webhook failed:", res.status, t);
  }
}

function rupiah(n) {
  try {
    return "Rp " + Number(n || 0).toLocaleString("id-ID");
  } catch {
    return "Rp " + String(n || 0);
  }
}

async function notifyOrderStatus({ order, reference, status, source = "Tripay" }) {
  const roleId = process.env.DISCORD_NOTIFY_ROLE_ID;
  const mention = roleId ? `<@&${roleId}> ` : "";

  const title =
    String(status).toUpperCase() === "PAID"
      ? "✅ Pembayaran Berhasil"
      : `ℹ️ Update Status: ${status}`;

  await discordSend({
    content: `${mention}${title}`,
    embeds: [
      {
        title: "Transaksi Website",
        fields: [
          { name: "Source", value: source, inline: true },
          { name: "Status", value: String(status), inline: true },
          { name: "Reference", value: String(reference || "-"), inline: false },
          { name: "Merchant Ref", value: String(order?.tripay_merchant_ref || order?.midtrans_id || "-"), inline: false },
          { name: "Nama", value: String(order?.nama || "-"), inline: true },
          { name: "Email", value: String(order?.email || "-"), inline: true },
          { name: "Total", value: rupiah(order?.total_harga), inline: true },
        ],
        timestamp: new Date().toISOString(),
      },
    ],
  });
}

module.exports = { notifyOrderStatus };
