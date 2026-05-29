const nodemailer = require('nodemailer');

/**
 * Create a reusable email transporter.
 * Uses Gmail SMTP by default; swap for SendGrid/Mailgun in production.
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send a password reset email.
 * @param {string} to - Recipient email address
 * @param {string} resetUrl - The password reset URL with token
 */
const sendPasswordResetEmail = async (to, resetUrl) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"EcoTrust" <${process.env.EMAIL_USER}>`,
    to,
    subject: '🌿 EcoTrust — Password Reset Request',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #f8faf5; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #065f46, #10b981); padding: 32px; text-align: center;">
          <h1 style="color: #fff; margin: 0; font-size: 28px;">🌿 EcoTrust</h1>
          <p style="color: #d1fae5; margin: 8px 0 0;">Environmental Trust Platform</p>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #065f46; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #374151; line-height: 1.6;">
            You requested a password reset. Click the button below to set a new password.
            This link will expire in <strong>15 minutes</strong>.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #065f46, #10b981); color: #fff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
              Reset My Password
            </a>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            If you didn't request this, you can safely ignore this email. Your password will remain unchanged.
          </p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            © ${new Date().getFullYear()} EcoTrust. Building trust for the environment.
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

const { getMonitoringReminderTemplate, getLowSurvivalAlertTemplate } = require('../utils/emailTemplates');

const sendMonitoringReminderEmail = async (to, ngoName, projectTitle) => {
  try {
    const transporter = createTransporter();
    const mailOptions = getMonitoringReminderTemplate(ngoName, projectTitle, `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard`);
    mailOptions.from = `"EcoTrust" <${process.env.EMAIL_USER}>`;
    mailOptions.to = to;
    await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Sent monitoring reminder to ${to} for project: ${projectTitle}`);
  } catch (err) {
    console.error('[Email Service Error] Failed to send monitoring reminder:', err.message);
  }
};

const sendLowSurvivalAlertEmail = async (to, ngoName, projectTitle, survivalRate, currentCount, initialCount) => {
  try {
    const transporter = createTransporter();
    const mailOptions = getLowSurvivalAlertTemplate(ngoName, projectTitle, survivalRate, currentCount, initialCount);
    mailOptions.from = `"EcoTrust" <${process.env.EMAIL_USER}>`;
    mailOptions.to = to;
    await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Sent low survival alert to ${to} for project: ${projectTitle}`);
  } catch (err) {
    console.error('[Email Service Error] Failed to send low survival warning:', err.message);
  }
};

module.exports = { sendPasswordResetEmail, sendMonitoringReminderEmail, sendLowSurvivalAlertEmail };
