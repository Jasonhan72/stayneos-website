/**
 * Email notification helper using Resend API.
 * Requires RESEND_API_KEY as a Cloudflare Workers secret.
 * Falls back silently if not configured (inquiry still saved to D1).
 */

const RESEND_API_URL = 'https://api.resend.com/emails';

interface EmailPayload {
  to: string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'hello@stayneos.com';

  if (!apiKey) {
    if (process.env.NODE_ENV !== 'production') console.warn('[email] RESEND_API_KEY not set, skipping email notification');
    return false;
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `NEOS <${fromEmail}>`,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        reply_to: payload.replyTo,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      if (process.env.NODE_ENV !== 'production') console.error('[email] Resend error:', res.status, err);
      return false;
    }

    return true;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('[email] Failed to send:', error);
    return false;
  }
}

/** Notify admin about a new inquiry/contact submission */
export async function notifyNewInquiry(data: {
  type: string;
  name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
}): Promise<boolean> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'hello.stayneos@gmail.com';

  return sendEmail({
    to: [adminEmail],
    subject: `[NEOS] New ${data.type} inquiry from ${data.name}`,
    replyTo: data.email,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #111; border-bottom: 2px solid #e5e5e5; padding-bottom: 12px;">
          New ${data.type.charAt(0).toUpperCase() + data.type.slice(1)} Inquiry
        </h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #666; width: 100px;">Name</td><td style="padding: 8px 0; font-weight: 600;">${data.name}</td></tr>
          <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
          ${data.phone ? `<tr><td style="padding: 8px 0; color: #666;">Phone</td><td style="padding: 8px 0;">${data.phone}</td></tr>` : ''}
          ${data.subject ? `<tr><td style="padding: 8px 0; color: #666;">Subject</td><td style="padding: 8px 0;">${data.subject}</td></tr>` : ''}
        </table>
        <div style="margin-top: 16px; padding: 16px; background: #f9f9f9; border-radius: 8px;">
          <p style="color: #666; margin: 0 0 8px 0; font-size: 13px;">Message</p>
          <p style="color: #111; margin: 0; white-space: pre-wrap;">${data.message}</p>
        </div>
        <p style="margin-top: 24px; color: #999; font-size: 12px;">
          This notification was sent automatically from www.stayneos.com
        </p>
      </div>
    `,
  });
}
