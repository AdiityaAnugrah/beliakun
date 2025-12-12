// utils/keyService.js
const Key = require("../models/keyModel.js");

async function takeKeyForDurasi(durasi) {
  const row = await Key.findOne({
    where: { status: "nonaktif", durasi },
    order: [["id", "ASC"]],
  });

  if (!row) return null;

  row.status = "aktif";
  await row.save();

  return row; // { id, key, durasi, status }
}

module.exports = { takeKeyForDurasi };
