'use server';

import nodemailer from 'nodemailer';

/**
 * Sends a notification email to a user when a new message is received.
 * Includes custom branding and logo.
 */
export async function sendChatNotification(toEmail: string, customerName: string, sessionId: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
  const logoUrl = `${appUrl}/logo.png`;
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, 
    auth: {
      user: process.env.SMTP_USER || 'demo@ethereal.email',
      pass: process.env.SMTP_PASS || 'demo_pass',
    },
  });

  const chatLink = `${appUrl}/dashboard/chat?session=${sessionId}`;

  const info = await transporter.sendMail({
    from: '"AssistLink Notifications" <notifications@assistlink.com>',
    to: toEmail,
    subject: `New Message from ${customerName}`,
    text: `You have a new support request from ${customerName}. View it here: ${chatLink}`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 24px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 32px;">
          <img src="${logoUrl}" alt="AssistLink Logo" style="width: 48px; height: 48px; border-radius: 12px; margin-bottom: 16px;">
          <h1 style="color: #3333CC; margin: 0; font-size: 24px; font-weight: 700;">New Support Request</h1>
        </div>
        
        <div style="background-color: #f8f8ff; padding: 24px; border-radius: 16px; margin-bottom: 32px; text-align: center;">
          <p style="color: #444; font-size: 16px; margin-bottom: 8px;"><strong>${customerName}</strong> is waiting for a response.</p>
          <p style="color: #666; font-size: 14px; margin: 0;">A new conversation has been initiated through your website widget.</p>
        </div>

        <div style="text-align: center;">
          <a href="${chatLink}" style="display: inline-block; background-color: #3333CC; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(51, 51, 204, 0.2);">
            View Conversation
          </a>
        </div>

        <hr style="border: 0; border-top: 1px solid #eee; margin: 40px 0;">
        
        <div style="text-align: center; color: #999; font-size: 12px;">
          <p style="margin: 0;">© 2024 AssistLink Inc. All rights reserved.</p>
          <p style="margin: 4px 0;">You received this because email notifications are enabled for your account.</p>
        </div>
      </div>
    `,
  });

  return { success: true, messageId: info.messageId };
}
