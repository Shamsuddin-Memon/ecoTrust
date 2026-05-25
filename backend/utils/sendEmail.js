const nodemailer = require('nodemailer');

/**
 * Send email helper
 * @param {Object} options - { email, subject, message, html }
 */
const sendEmail = async (options) => {
  // Validate presence of SMTP config
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ SMTP Email Configuration is missing in environment variables. Email not sent.');
    return { success: false, error: 'SMTP config missing' };
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"ecoTrust Platform" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send email via SMTP:', error);
    return { success: false, error: error.message };
  }
};

module.exports = sendEmail;
