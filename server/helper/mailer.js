'use strict';
const nodemailer = require('nodemailer');

let cachedTransporter = null;

function createTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

  if (EMAIL_HOST && EMAIL_PORT) {
    cachedTransporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: Number(EMAIL_PORT),
      secure: Number(EMAIL_PORT) === 465, // true for 465, false for other ports
      auth: EMAIL_USER && EMAIL_PASS ? { user: EMAIL_USER, pass: EMAIL_PASS } : undefined,
    });
  } else {
    // Ethereal fallback for dev if no creds provided
    cachedTransporter = nodemailer.createTransport({
      jsonTransport: true, // Do not actually send; prints message as JSON in logs
    });
  }

  return cachedTransporter;
}

async function sendMail({ to, subject, html, text, from }) {
  const transporter = createTransporter();
  const mailFrom = from || process.env.EMAIL_FROM || process.env.EMAIL_USER || 'no-reply@smart-learning.local';
  const info = await transporter.sendMail({ from: mailFrom, to, subject, html, text });
  return info;
}

module.exports = {
  createTransporter,
  sendMail,
};
