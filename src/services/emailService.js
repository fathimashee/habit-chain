const nodemailer = require('nodemailer');

function createTransport() {
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_PORT === '465',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }
  // Development fallback: log to console
  return null;
}

const EmailService = {
  async sendPasswordReset(toEmail, toName, resetLink) {
    const from = process.env.MAIL_FROM || '"Habit Chain" <no-reply@habitchain.local>';
    const html = `
      <div style="font-family:Inter,sans-serif;max-width:480px;margin:auto;padding:32px;background:#fff;border:1px solid #D9ECEB;border-radius:12px">
        <h2 style="color:#0F9D9A;font-family:'Plus Jakarta Sans',sans-serif">Password Reset Request</h2>
        <p style="color:#12303A">Hi <strong>${toName}</strong>,</p>
        <p style="color:#5B7580">We received a request to reset your Habit Chain password. Click the button below within <strong>30 minutes</strong>:</p>
        <div style="text-align:center;margin:24px 0">
          <a href="${resetLink}" style="background:#0F9D9A;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">Reset My Password</a>
        </div>
        <p style="color:#5B7580;font-size:13px">If you did not request this, you can safely ignore this email. This link expires in 30 minutes.</p>
        <hr style="border:none;border-top:1px solid #D9ECEB;margin:24px 0">
        <p style="color:#5B7580;font-size:12px;text-align:center">Habit Chain – Your chain of consistent learning</p>
      </div>`;

    const transport = createTransport();
    if (!transport) {
      // Development: print to console
      console.log('\n===== PASSWORD RESET LINK (dev mode) =====');
      console.log(`To: ${toEmail}`);
      console.log(`Link: ${resetLink}`);
      console.log('==========================================\n');
      return;
    }
    await transport.sendMail({
      from,
      to: toEmail,
      subject: 'Reset your Habit Chain password',
      html,
      text: `Hi ${toName},\n\nReset your password here (expires in 30 min):\n${resetLink}\n\nIf you did not request this, ignore this email.`
    });
  }
};

module.exports = { EmailService };

