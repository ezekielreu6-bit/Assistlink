
'use server';

import nodemailer from 'nodemailer';

/**
 * Sends a notification email to a user when a new message is received.
 * Note: Requires environment variables for SMTP configuration.
 */
export async function sendChatNotification(toEmail: string, customerName: string, sessionId: string) {
  // Use a generic test account if no credentials provided, but for production
  // you'd use your actual SMTP server details.
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, 
    auth: {
      user: process.env.SMTP_USER || 'demo@ethereal.email',
      pass: process.env.SMTP_PASS || 'demo_pass',
    },
  });

  const chatLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/dashboard/chat?session=${sessionId}`;

  const info = await transporter.sendMail({
    from: '"AssistLink Notifications" <notifications@assistlink.com>',
    to: toEmail,
    subject: `New Message from ${customerName}`,
    text: `You have a new support request from ${customerName}. View it here: ${chatLink}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #3333CC;">New Message on AssistLink</h2>
        <p>You have a new support request from <strong>${customerName}</strong>.</p>
        <div style="margin: 20px 0;">
          <a href="${chatLink}" style="background-color: #3333CC; color: white; padding: 12px 24px; text-decoration: none; rounded: 8px; font-weight: bold;">
            Open Chat Session
          </a>
        </div>
        <p style="color: #666; font-size: 12px;">This is an automated notification from your AssistLink dashboard.</p>
      </div>
    `,
  });

  return { success: true, messageId: info.messageId };
}
