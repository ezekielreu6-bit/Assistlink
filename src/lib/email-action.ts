'use server';

import nodemailer from 'nodemailer';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://assistlink-bit.vercel.app';
const logoUrl = `${appUrl}/logo.png`;

// Create transporter logic
const createTransporter = () => {
  // If you are using Gmail, the host should be smtp.gmail.com
  // If you are using a professional service (Resend, SendGrid), use their host
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com', 
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true, // true for 465, false for 587
    auth: {
      user: process.env.SMTP_USER, // Your email
      pass: process.env.SMTP_PASS, // Your App Password
    },
  });
};

export async function sendChatNotification(toEmail: string, customerName: string, sessionId: string) {
  try {
    const transporter = createTransporter();
    const chatLink = `${appUrl}/dashboard/chat?session=${sessionId}`;

    const info = await transporter.sendMail({
      // IMPORTANT: The "from" MUST be the same email as SMTP_USER
      from: `"AssistLink" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `New Message from ${customerName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #3333CC;">New Support Request</h2>
          <p><strong>${customerName}</strong> is waiting for a response on your website.</p>
          <div style="margin: 30px 0;">
            <a href="${chatLink}" style="background-color: #3333CC; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              View Conversation
            </a>
          </div>
          <p style="color: #999; font-size: 12px;">Sent via AssistLink</p>
        </div>
      `,
    });

    console.log("Email sent: %s", info.messageId);
    return { success: true };
  } catch (error) {
    console.error("Email Error:", error);
    return { success: false, error: "Failed to send email" };
  }
}

export async function sendTeamInvitation(toEmail: string, role: string, inviterName: string) {
  try {
    const transporter = createTransporter();
    const loginLink = `${appUrl}/login`;

    const info = await transporter.sendMail({
      from: `"AssistLink Team" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `Invitation to join ${inviterName}'s team`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
          <h2 style="color: #3333CC;">Team Invitation</h2>
          <p><strong>${inviterName}</strong> invited you to join their team as a <strong>${role}</strong>.</p>
          <div style="margin: 30px 0;">
            <a href="${loginLink}" style="background-color: #3333CC; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Accept Invitation
            </a>
          </div>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Invitation Error:", error);
    return { success: false };
  }
}