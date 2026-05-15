import { sendEmail } from './client';
import { bookingReceivedTemplate } from './templates/booking-received';
import { paymentConfirmedTemplate } from './templates/payment-confirmed';
import { hostNewReservationTemplate } from './templates/host-new-reservation';
import type { EmailBooking, EmailProperty } from './templates/shared';

export { sendEmail, type EmailPayload } from './client';

function getRecipient(booking: EmailBooking, userEmail?: string | null): string | null {
  return booking.guestEmail || userEmail || null;
}

export async function sendBookingReceived(input: {
  booking: EmailBooking;
  property: EmailProperty;
  userEmail?: string | null;
  locale?: string | null;
}): Promise<boolean> {
  const to = getRecipient(input.booking, input.userEmail);
  if (!to) {
    console.warn('[email] No recipient for booking received email', input.booking.id);
    return false;
  }

  try {
    const message = bookingReceivedTemplate(input);
    return await sendEmail({ to: [to], ...message });
  } catch (error) {
    console.error('[email] Failed to send booking received email:', error);
    return false;
  }
}

export async function sendPaymentConfirmed(input: {
  booking: EmailBooking;
  property: EmailProperty;
  userEmail?: string | null;
  locale?: string | null;
  paidAmount?: number | null;
}): Promise<boolean> {
  const to = getRecipient(input.booking, input.userEmail);
  if (!to) {
    console.warn('[email] No recipient for payment confirmed email', input.booking.id);
    return false;
  }

  try {
    const message = paymentConfirmedTemplate(input);
    return await sendEmail({ to: [to], ...message });
  } catch (error) {
    console.error('[email] Failed to send payment confirmed email:', error);
    return false;
  }
}


export async function sendHostNewReservation(
  booking: EmailBooking,
  property: EmailProperty
): Promise<boolean> {
  const to = process.env.HOST_NOTIFICATION_EMAIL || 'host@neos.rentals';

  try {
    const message = hostNewReservationTemplate({ booking, property });
    return await sendEmail({ to: [to], ...message });
  } catch (error) {
    console.error('[email] Failed to send host new reservation email:', error);
    return false;
  }
}

// TODO(BOOK-003 Phase 2): wire this to a cron-triggered pre-arrival reminder job.
export async function sendPreArrivalReminder(): Promise<boolean> {
  console.warn('[email] Pre-arrival reminder is not implemented yet');
  return false;
}

/** Notify admin about a new inquiry/contact submission. */
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
