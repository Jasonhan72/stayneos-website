const RESEND_API_URL = 'https://api.resend.com/emails';

export interface EmailPayload {
  to: string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

function getResendApiKey(): string | null {
  return process.env.RESEND_API_KEY || null;
}

function getFromEmail(): string {
  return process.env.RESEND_FROM_EMAIL || 'reservations@send.neos.rentals';
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  const apiKey = getResendApiKey();

  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not set, skipping email notification');
    return false;
  }

  try {
    const res = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `NEOS RENTALS <${getFromEmail()}>`,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        reply_to: payload.replyTo,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[email] Resend error:', res.status, err);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[email] Failed to send:', error);
    return false;
  }
}
