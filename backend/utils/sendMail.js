// utils/sendMail.js
require("dotenv").config(); // WAJIB sebelum akses process.env

const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendNewsletterEmail = async (toEmail) => {
  await transporter.sendMail({
    from: `"Beli Akun" <${process.env.MAIL_USER}>`,
    to: toEmail,
    subject: "🎮 Thanks for Subscribing to Beli Akun!",
    html: `
      <h2>Welcome, Gamer!</h2>
      <p>You’re now subscribed to Beli Akun’s newsletter.</p>
      <p>We’ll keep you posted with top-up deals, new accounts, and more.</p>
      <br />
      <small>Happy Gaming! 🎮</small>
    `,
  });
};
