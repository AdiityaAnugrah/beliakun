const { Newsletter } = require("../models");
const { sendNewsletterEmail } = require("../utils/sendMail");

exports.subscribeNewsletter = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ status: "error", message: "Email is required" });
  }

  try {
    const existing = await Newsletter.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ status: "error", message: "Email already subscribed" });
    }

    await Newsletter.create({ email });
    await sendNewsletterEmail(email); // ✅ kirim email konfirmasi
    res.json({ status: "success", message: "Thank you for subscribing!" });
  } catch (err) {
    console.error("Newsletter error:", err);
    res.status(500).json({ status: "error", message: "Internal server error" });
  }
};
