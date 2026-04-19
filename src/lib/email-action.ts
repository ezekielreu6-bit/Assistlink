'use server';

import nodemailer from 'nodemailer';

const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://assistlink-bit.vercel.app';
// Ensure you have a logo.png in your public folder, or use a hosted URL
const logoUrl = `/logo.png`; 

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

// Common Email Wrapper for styling
const emailTemplate = (content: string) => `
  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f9fafb;">
    <div style="background-color: #ffffff; border-radius: 24px; padding: 40px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="background-color: #3333CC; width: 48px; height: 48px; border-radius: 12px; display: inline-block; margin-bottom: 16px; line-height: 48px; color: white; font-weight: bold; font-size: 24px;">A</div>
        <h1 style="margin: 0; color: #111827; font-size: 24px; font-weight: 800; letter-spacing: -0.025em;">AssistLink</h1>
      </div>
      ${content}
      <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center;">
        <p style="margin: 0; color: #6b7280; font-size: 12px;">
          &copy; ${new Date().getFullYear()} AssistLink AI. All rights reserved.
        </p>
        <p style="margin: 4px 0 0; color: #9ca3af; font-size: 11px;">
          Real-time customer support, simplified.
        </p>
      </div>
    </div>
  </div>
`;

/**
 * Notification for new chat messages
 */
export async function sendChatNotification(toEmail: string, customerName: string, sessionId: string) {
  try {
    const transporter = createTransporter();
    const chatLink = `${appUrl}/dashboard/chat?session=${sessionId}`;

    const content = `
      <div style="text-align: center;">
        <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-bottom: 16px;">New Support Request</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 32px;">
          <strong>${customerName}</strong> is waiting for a response on your website. Don't keep them waiting!
        </p>
        <a href="${chatLink}" style="display: inline-block; background-color: #3333CC; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; transition: background-color 0.2s;">
          Open Chat Dashboard
        </a>
      </div>
    `;

    await transporter.sendMail({
      from: `"AssistLink" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `💬 New Message from ${customerName}`,
      html: emailTemplate(content),
    });

    return { success: true };
  } catch (error) {
    console.error("Notification Error:", error);
    return { success: false };
  }
}

/**
 * Invitation for new team members with Unique ID
 */
export async function sendTeamInvitation(toEmail: string, role: string, inviterName: string, inviteId: string) {
  try {
    const transporter = createTransporter();
    const inviteLink = `${appUrl}/invite/${inviteId}`;

    const content = `
      <div style="text-align: center;">
        <h2 style="color: #111827; font-size: 20px; font-weight: 700; margin-bottom: 16px;">You're Invited!</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 8px;">
          <strong>${inviterName}</strong> has invited you to join their support team on AssistLink.
        </p>
        <div style="display: inline-block; background-color: #f3f4f6; padding: 6px 12px; border-radius: 8px; margin-bottom: 32px;">
          <span style="color: #374151; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Role: ${role}</span>
        </div>
        <br />
        <a href="${inviteLink}" style="display: inline-block; background-color: #3333CC; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px;">
          Accept Invitation
        </a>
        <p style="color: #9ca3af; font-size: 13px; margin-top: 32px;">
          If you don't have an account yet, you'll be asked to create one after clicking the button.
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"AssistLink Team" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `🚀 Join ${inviterName}'s team on AssistLink`,
      html: emailTemplate(content),
    });

    return { success: true };
  } catch (error) {
    console.error("Invitation Error:", error);
    return { success: false };
  }
}