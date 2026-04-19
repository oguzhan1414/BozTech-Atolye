const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Transporter oluştur
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  // 2. Mail seçeneklerini tanımla
  const message = {
    from: process.env.FROM_EMAIL || 'BozTech Atölye <noreply@boztech.com>',
    to: options.email,
    replyTo: options.replyTo || process.env.SMTP_USER,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  // 3. Maili gönder
  try {
    const info = await transporter.sendMail(message);
    console.log('Email successfully sent: %s', info.messageId);
    return true;
  } catch (err) {
    console.error('Email sending failed (Check your SMTP credentials in .env!):', err.message);
    return false;
  }
};

module.exports = sendEmail;
