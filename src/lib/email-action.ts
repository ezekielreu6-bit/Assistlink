'use server';

import nodemailer from 'nodemailer';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://assistlink-bit.vercel.app';

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '465'),
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Beautiful Email Template
const emailTemplate = (title: string, content: string) => `
  <div style="font-family: 'Segoe UI', system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #f9fafb;">
    <div style="background: white; border-radius: 24px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #f1f5f9;">
      
      <!-- Logo / Header -->
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="background: #3333CC; width: 56px; height: 56px; border-radius: 16px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
          <span style="color: white; font-size: 28px; font-weight: bold;">A</span>
        </div>
        <h1 style="margin: 0; color: #111827; font-size: 26px; font-weight: 800;">AssistLink</h1>
      </div>

      <h2 style="color: #111827; text-align: center; font-size: 22px; margin-bottom: 24px;">${title}</h2>
      
      ${content}

      <!-- Footer -->
      <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="color: #6b7280; font-size: 13px; margin: 0;">
          © ${new Date().getFullYear()} AssistLink • Real-time AI Customer Support
        </p>
      </div>
    </div>
  </div>
`;

/**
 * Send notification to organization owner when a customer sends a new message
 */
export async function sendNewSupportNotification(
  ownerEmail: string,
  customerName: string,
  messagePreview: string,
  sessionId: string,
  orgId: string
) {
  try {
    const transporter = createTransporter();
    const dashboardLink = `\( {appUrl}/dashboard/chat?session= \){sessionId}`;

    const content = `
      <div style="text-align: center; margin-bottom: 32px;">
        <p style="font-size: 17px; color: #374151; margin-bottom: 8px;">
          <strong>${customerName}</strong> just sent a message and is waiting for support.
        </p>
        <div style="background: #f8fafc; padding: 16px; border-radius: 12px; margin: 20px 0; text-align: left; border-left: 4px solid #3333CC;">
          <p style="margin: 0; color: #4b5563; font-size: 15px;">"${messagePreview}"</p>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${dashboardLink}" 
           style="display: inline-block; background: #3333CC; color: white; padding: 16px 36px; 
                  text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
          Reply Now →
        </a>
      </div>
    `;

    await transporter.sendMail({
      from: `"AssistLink Notifications" <${process.env.SMTP_USER}>`,
      to: ownerEmail,
      subject: `🔔 New Message from ${customerName}`,
      html: emailTemplate("New Support Request", content),
    });

    console.log(`✅ Notification sent to ${ownerEmail}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to send support notification:", error);
    return { success: false, error };
  }
}

/**
 * Send team invitation (your existing function - improved)
 */
export async function sendTeamInvitation(
  toEmail: string, 
  role: string, 
  inviterName: string, 
  inviteId: string
) {
  try {
    const transporter = createTransporter();
    const inviteLink = `\( {appUrl}/invite/ \){inviteId}`;

    const content = `
      <div style="text-align: center;">
        <h2 style="color: #111827; font-size: 22px; margin-bottom: 16px;">You've been invited!</h2>
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">
          <strong>\( {inviterName}</strong> invited you to join their team as a <strong> \){role}</strong> on AssistLink.
        </p>
        
        <div style="margin: 32px 0;">
          <a href="${inviteLink}" 
             style="display: inline-block; background: #3333CC; color: white; padding: 16px 40px; 
                    text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
            Accept Invitation
          </a>
        </div>
        
        <p style="color: #6b7280; font-size: 14px;">
          If you don’t have an account yet, you’ll be guided to create one.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"AssistLink Team" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `🚀 Join ${inviterName}'s team on AssistLink`,
      html: emailTemplate("Team Invitation", content),
    });

    return { success: true };
  } catch (error) {
    console.error("Invitation email failed:", error);
    return { success: false };
  }
}