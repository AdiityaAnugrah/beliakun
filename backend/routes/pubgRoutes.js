const express = require("express");
const router = express.Router();

router.get("/steam/player/:playerName", async (req, res) => {
  try {
    const apiKey = process.env.PUBG_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ ok: false, error: "API KEY NOT SET" });
    }

    const playerName = req.params.playerName;
    const shard = "steam";

    const url =
      `https://api.pubg.com/shards/${shard}/players?filter[playerNames]=` +
      encodeURIComponent(playerName);

    const r = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/vnd.api+json",
      },
    });

    const body = await r.json();

    if (!r.ok) {
      return res.status(r.status).json({
        ok: false,
        error: body?.errors?.[0]?.title || "PUBG API error",
        details: body,
      });
    }

    const player = body?.data?.[0];
    if (!player) {
      return res.status(404).json({ ok: false, error: "Player not found" });
    }

    const recentMatchIds =
      player?.relationships?.matches?.data?.slice(0, 10).map((m) => m.id) || [];

    return res.json({
      ok: true,
      platform: shard,
      ign: player.attributes?.name,
      playerId: player.id,
      recentMatchIds,
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: "Server error", message: String(err) });
  }
});

module.exports = router;