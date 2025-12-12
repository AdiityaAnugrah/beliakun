// utils/tripay.js
const crypto = require("crypto");

// Kalau Node kamu < 18, aktifkan:
// const fetch = require("node-fetch");

const TRIPAY_APIKEY = process.env.TRIPAY_APIKEY;
const TRIPAY_PRIVATEKEY = process.env.TRIPAY_PRIVATEKEY;
const TRIPAY_MERCHANT_CODE = process.env.TRIPAY_MERCHANT_CODE;

function mustTripayEnv() {
  if (!TRIPAY_APIKEY) throw new Error("TRIPAY_APIKEY belum di set");
  if (!TRIPAY_PRIVATEKEY) throw new Error("TRIPAY_PRIVATEKEY belum di set");
  if (!TRIPAY_MERCHANT_CODE) throw new Error("TRIPAY_MERCHANT_CODE belum di set");
}

// signature create: HMAC_SHA256(merchant_code + merchant_ref + amount, privateKey)
function createSignature(merchant_ref, amount) {
  return crypto
    .createHmac("sha256", TRIPAY_PRIVATEKEY)
    .update(TRIPAY_MERCHANT_CODE + merchant_ref + amount)
    .digest("hex");
}

// signature callback: HMAC_SHA256(JSON.stringify(body), privateKey)
function verifyCallbackSignature(body, headerSignature) {
  const sig = crypto
    .createHmac("sha256", TRIPAY_PRIVATEKEY)
    .update(JSON.stringify(body))
    .digest("hex");
  return sig === (headerSignature || "");
}

async function createTripayQris({ merchant_ref, amount, itemName, expiredMinutes = 30, returnUrl }) {
  mustTripayEnv();

  const signature = createSignature(merchant_ref, amount);

  const payload = new URLSearchParams({
    method: "QRIS",
    merchant_ref,
    amount: String(amount),
    customer_name: "Telegram Buyer",
    customer_email: "buyer@telegram.local",
    customer_phone: "000",
    order_items: JSON.stringify([{ sku: "KEY", name: itemName, price: amount, quantity: 1 }]),
    signature,
    expired_time: String(Math.floor(Date.now() / 1000) + expiredMinutes * 60),
    return_url: returnUrl || "https://beliakun.com/thank-you",
  });

  const resp = await fetch("https://tripay.co.id/api/transaction/create", {
    method: "POST",
    headers: { Authorization: `Bearer ${TRIPAY_APIKEY}` },
    body: payload,
  });

  return resp.json();
}

module.exports = {
  createTripayQris,
  verifyCallbackSignature,
};
