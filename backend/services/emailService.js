const nodemailer = require("nodemailer");
const EmailLog = require("../models/EmailLog");

// ─── Transporter (lazy init) ────────────────────────────────────────────────
let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false, // ← add this
    },
  });

  return transporter;
};

// ─── Base send function ──────────────────────────────────────────────────────
const sendEmail = async ({
  to,
  subject,
  html,
  attachments = [], // ✅ add this
  userId = null,
  type = "custom",
  sentBy = null
}) => {
  // Skip if SMTP not configured
  if (!process.env.SMTP_USER) {
    console.log(`📧 [MOCK EMAIL] To: ${to} | Subject: ${subject}`);
    return { success: true, mock: true };
  }

  try {
await getTransporter().sendMail({
  from: process.env.FROM_EMAIL || "InceptaX <noreply@inceptax.io>",
  to,
  subject,
  html,
  attachments 
});

    await EmailLog.create({ to, userId, type, subject, body: html, status: "sent", sentBy });
    return { success: true };
  } catch (err) {
    console.error("Email send error:", err.message);
    await EmailLog.create({ to, userId, type, subject, status: "failed", error: err.message, sentBy });
    return { success: false, error: err.message };
  }
};

// ─── Welcome email template ──────────────────────────────────────────────────
const sendWelcomeEmail = async (user) => {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050510;font-family:'Segoe UI',sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px">
    <div style="background:linear-gradient(135deg,#0d0d2b,#111130);border:1px solid #1a1a4e;border-radius:16px;padding:48px 40px;text-align:center">
      <!-- Logo -->
      <div style="width:56px;height:56px;background:linear-gradient(135deg,#4f46e5,#06b6d4);border-radius:14px;margin:0 auto 24px;display:flex;align-items:center;justify-content:center">
        <span style="color:white;font-size:22px;font-weight:800">IX</span>
      </div>
      <h1 style="color:#ffffff;font-size:26px;font-weight:700;margin:0 0 8px">Welcome to InceptaX</h1>
      <p style="color:#64748b;font-size:14px;margin:0 0 32px">You're now part of the builder community.</p>
      <div style="background:#0a0a1f;border:1px solid #1e1e4e;border-radius:12px;padding:24px;margin-bottom:32px;text-align:left">
        <p style="color:#94a3b8;font-size:13px;margin:0 0 6px">Signed in as</p>
        <p style="color:#e2e8f0;font-size:16px;font-weight:600;margin:0">${user.name}</p>
        <p style="color:#64748b;font-size:13px;margin:4px 0 0">${user.email}</p>
      </div>
      <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 32px">
        Tackle real-world challenges, get AI-powered feedback, and climb the leaderboard.<br>
        Your free plan gives you access to all public challenges.
      </p>
      <a href="${process.env.FRONTEND_URL}" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#06b6d4);color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:14px;letter-spacing:0.3px">
        Start Competing →
      </a>
      <div style="margin-top:40px;padding-top:24px;border-top:1px solid #1a1a4e">
        <p style="color:#374151;font-size:12px;margin:0">© ${new Date().getFullYear()} InceptaX · Building the future, one commit at a time.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `;
  return sendEmail({
    to: user.email,
    subject: "Welcome to InceptaX 🚀",
    html,
    userId: user._id,
    type: "welcome",
  });
};

// ─── Admin blast email ───────────────────────────────────────────────────────
const sendAdminBlast = async ({ recipients, subject, htmlBody, adminId }) => {
  const results = [];
  for (const recipient of recipients) {
    const result = await sendEmail({
      to: recipient.email,
      subject,
      html: htmlBody,
      userId: recipient._id || null,
      type: "admin_blast",
      sentBy: adminId,
    });
    results.push({ email: recipient.email, ...result });
    // Small delay to avoid rate limiting
    await new Promise((r) => setTimeout(r, 100));
  }
  return results;
};

// ─── Plan upgrade notification ───────────────────────────────────────────────
const sendPlanUpgradeEmail = async (user, plan) => {
  const planNames = { ten_day: "10-Day Premium", monthly: "Monthly Premium" };
  const html = `
<!DOCTYPE html><html><body style="margin:0;padding:0;background:#050510;font-family:'Segoe UI',sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px">
    <div style="background:linear-gradient(135deg,#0d0d2b,#111130);border:1px solid #1a1a4e;border-radius:16px;padding:48px 40px;text-align:center">
      <div style="font-size:48px;margin-bottom:20px">🎉</div>
      <h1 style="color:#ffffff;font-size:24px;font-weight:700;margin:0 0 12px">Plan Activated!</h1>
      <p style="color:#94a3b8;font-size:14px;margin:0 0 24px">Your <strong style="color:#06b6d4">${planNames[plan] || plan}</strong> plan is now active.</p>
      <a href="${process.env.FRONTEND_URL}/challenges" style="display:inline-block;background:linear-gradient(135deg,#4f46e5,#06b6d4);color:white;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:14px">
        Access Premium Challenges →
      </a>
    </div>
  </div>
</body></html>
  `;
  return sendEmail({
    to: user.email,
    subject: `Your ${planNames[plan]} plan is active! 🚀`,
    html,
    userId: user._id,
    type: "plan_upgrade",
  });
};

module.exports = { sendEmail, sendWelcomeEmail, sendAdminBlast, sendPlanUpgradeEmail };
