/**
 * Email templates for ecoTrust notifications
 */

const baseTemplate = (title, bodyContent) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #0c111d;
      color: #eaecf0;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #0c111d;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #151c2c;
      border: 1px solid #28334a;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 10px 30px rgba(0,0,0,0.4);
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      padding: 30px 40px;
      text-align: center;
    }
    .logo {
      font-size: 28px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
      margin: 0;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .logo span {
      opacity: 0.9;
    }
    .content {
      padding: 40px;
      line-height: 1.6;
    }
    h1 {
      font-size: 22px;
      font-weight: 700;
      color: #ffffff;
      margin-top: 0;
      margin-bottom: 20px;
    }
    p {
      color: #98a2b3;
      font-size: 16px;
      margin-top: 0;
      margin-bottom: 20px;
    }
    .status-badge {
      display: inline-block;
      padding: 6px 16px;
      border-radius: 9999px;
      font-size: 14px;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 25px;
    }
    .status-approved {
      background-color: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.2);
    }
    .status-declined {
      background-color: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.2);
    }
    .reason-box {
      background-color: #0c111d;
      border-left: 4px solid #ef4444;
      padding: 16px 20px;
      border-radius: 0 8px 8px 0;
      margin: 25px 0;
    }
    .reason-title {
      font-weight: bold;
      color: #f87171;
      font-size: 14px;
      margin-bottom: 6px;
    }
    .reason-text {
      color: #98a2b3;
      margin: 0;
      font-style: italic;
    }
    .btn {
      display: inline-block;
      background-color: #10b981;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 700;
      padding: 12px 30px;
      border-radius: 8px;
      margin-top: 15px;
      transition: background-color 0.2s;
      text-align: center;
    }
    .footer {
      background-color: #0c111d;
      padding: 20px 40px;
      text-align: center;
      border-top: 1px solid #1f2a3f;
    }
    .footer p {
      font-size: 12px;
      color: #475467;
      margin: 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <div class="logo">🌿 <span>ecoTrust</span></div>
      </div>
      <div class="content">
        ${bodyContent}
      </div>
      <div class="footer">
        <p>© ${new Date().getFullYear()} ecoTrust Platform. All rights reserved.</p>
        <p>This is an automated notification. Please do not reply directly to this email.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

exports.getNGOApprovalTemplate = (ngoName, userName) => {
  const title = `NGO Approved - ecoTrust`;
  const body = `
    <h1>NGO Application Approved! 🎉</h1>
    <p>Hi ${userName},</p>
    <div class="status-badge status-approved">Approved</div>
    <p>We are thrilled to inform you that your application for registration of NGO <strong>"${ngoName}"</strong> has been reviewed and <strong>approved</strong> by our admin team!</p>
    <p>Your user account status has been promoted. You can now login to ecoTrust to create tree plantation projects, submit field plantation captures, track project progress, and connect with global donors.</p>
    <p>To access your NGO dashboard, please log out and sign back in to refresh your credentials.</p>
    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/login" class="btn">Login to ecoTrust</a>
  `;
  return {
    subject: `ecoTrust NGO Registration Approved: "${ngoName}"`,
    text: `Congratulations! Your NGO "${ngoName}" registration request on ecoTrust has been approved. Please re-login to access NGO features.`,
    html: baseTemplate(title, body),
  };
};

exports.getNGODeclineTemplate = (ngoName, userName, reason) => {
  const title = `NGO Application Status - ecoTrust`;
  const reasonHtml = reason 
    ? `
      <div class="reason-box">
        <div class="reason-title">Reason for rejection:</div>
        <p class="reason-text">"${reason}"</p>
      </div>
    `
    : '';
  const body = `
    <h1>NGO Application Status</h1>
    <p>Hi ${userName},</p>
    <div class="status-badge status-declined">Declined</div>
    <p>Thank you for submitting your application to register the NGO <strong>"${ngoName}"</strong> on ecoTrust.</p>
    <p>After careful review of your documents, our admin team has decided to <strong>decline</strong> your registration request at this time.</p>
    ${reasonHtml}
    <p>If the rejection was due to missing files or incorrect information, you are welcome to correct the details and submit a new application through your dashboard.</p>
    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/register-ngo" class="btn">Re-submit Application</a>
  `;
  return {
    subject: `ecoTrust NGO Registration Status: "${ngoName}"`,
    text: `Your NGO "${ngoName}" registration request has been declined. ${reason ? 'Reason: ' + reason : ''}`,
    html: baseTemplate(title, body),
  };
};

exports.getProjectApprovalTemplate = (projectTitle, ngoName, userName) => {
  const title = `Project Approved - ecoTrust`;
  const body = `
    <h1>Project Approved! 🌿</h1>
    <p>Hi ${userName},</p>
    <div class="status-badge status-approved">Approved</div>
    <p>Great news! Your project proposal <strong>"${projectTitle}"</strong> under NGO <strong>"${ngoName}"</strong> has been reviewed and <strong>approved</strong> by our admin team!</p>
    <p>The project is now live on the public global feed and is open to receiving sponsorships and donations from ecoTrust members worldwide.</p>
    <p>You can begin uploading satellite/drone photos to start verifying tree plantations on this project.</p>
    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" class="btn">View Project Feed</a>
  `;
  return {
    subject: `ecoTrust Project Approved: "${projectTitle}"`,
    text: `Great news! Your project proposal "${projectTitle}" on ecoTrust has been approved and is now live for global donors.`,
    html: baseTemplate(title, body),
  };
};

exports.getProjectDeclineTemplate = (projectTitle, ngoName, userName, reason) => {
  const title = `Project Proposal Status - ecoTrust`;
  const reasonHtml = reason 
    ? `
      <div class="reason-box">
        <div class="reason-title">Reason for rejection:</div>
        <p class="reason-text">"${reason}"</p>
      </div>
    `
    : '';
  const body = `
    <h1>Project Proposal Status</h1>
    <p>Hi ${userName},</p>
    <div class="status-badge status-declined">Declined</div>
    <p>Thank you for submitting your project proposal <strong>"${projectTitle}"</strong> on ecoTrust.</p>
    <p>After reviewing the project specifications and requirements, our admin team has decided to <strong>decline</strong> this proposal at this time.</p>
    ${reasonHtml}
    <p>You can check the feedback above and create a new project proposal with the necessary updates if applicable.</p>
    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" class="btn">Go to Dashboard</a>
  `;
  return {
    subject: `ecoTrust Project Status: "${projectTitle}"`,
    text: `Your project proposal "${projectTitle}" has been declined. ${reason ? 'Reason: ' + reason : ''}`,
    html: baseTemplate(title, body),
  };
};

exports.getMonitoringReminderTemplate = (ngoName, projectTitle, linkUrl) => {
  const title = `Please Update Your Project Image - ecoTrust`;
  const body = `
    <h1>Please Update Your Project Image 🌳</h1>
    <p>Hi team at <strong>${ngoName}</strong>,</p>
    <p>This is an automated reminder that your plantation for <strong>"${projectTitle}"</strong> requires a periodic image update.</p>
    <p>To verify the tree survival rates and maintain your trust score, please update your project image as soon as possible.</p>
    <p>Please navigate to your dashboard to upload the monitoring image.</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="${linkUrl || 'http://localhost:5173/dashboard'}" class="btn">Please Update Your Project Image</a>
    </div>
  `;
  return {
    subject: `Please update your project image for "${projectTitle}"`,
    text: `Please update your project image for "${projectTitle}" on the EcoTrust dashboard.`,
    html: baseTemplate(title, body),
  };
};

exports.getLowSurvivalAlertTemplate = (ngoName, projectTitle, survivalRate, currentCount, initialCount) => {
  const title = `Low Tree Survival Alert - ecoTrust`;
  const body = `
    <h1>⚠️ Low Tree Survival Rate Detected</h1>
    <p>Hi team at <strong>${ngoName}</strong>,</p>
    <div class="status-badge status-declined">Critical Warning</div>
    <p>Our AI verification engine has completed inference on your latest monitoring submission for project <strong>"${projectTitle}"</strong>.</p>
    <p>A low tree survival rate of <strong style="color: #ef4444;">${survivalRate}%</strong> has been detected.</p>
    <div class="reason-box">
      <div class="reason-title">Inference details:</div>
      <p class="reason-text">Initial Tree Count: <strong>${initialCount}</strong></p>
      <p class="reason-text">Current Trees Detected: <strong>${currentCount}</strong></p>
    </div>
    <p>According to our platform policies, low survival rates (&lt; 70%) trigger automatic alerts and affect your NGO Trust Score. A score deduction of <strong>-15 points</strong> has been applied to your trust profile.</p>
    <p>Please check your dashboard to review the analysis and upload a clearer image if this was a detection error, or take soil and plant care measures to preserve your plantation.</p>
    <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard" class="btn">View My Dashboard</a>
  `;
  return {
    subject: `ecoTrust Critical Alert: Low Survival Rate on "${projectTitle}" (${survivalRate}%)`,
    text: `Alert: A low survival rate of ${survivalRate}% was detected on your plantation for "${projectTitle}". A trust score penalty has been applied.`,
    html: baseTemplate(title, body),
  };
};

