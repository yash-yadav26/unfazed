const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html, text }) => {
  return await transporter.sendMail({
    from: `"Unfazed" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
    text,
  });
};

module.exports = {
  sendEmail,
};