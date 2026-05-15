import {
  detailRow,
  EmailBooking,
  EmailProperty,
  escapeHtml,
  formatDate,
  formatMoney,
  getSiteUrl,
  propertyTitle,
  renderShell,
  TemplateResult,
} from './shared';

type HostEmailBooking = EmailBooking & {
  guestPhone?: string | null;
  adults?: number | null;
  children?: number | null;
};

function guestSummary(booking: HostEmailBooking): string {
  const parts = [
    booking.guestName || 'Not provided',
    booking.guestEmail || 'Not provided',
    booking.guestPhone || 'Not provided',
  ];
  return parts.join(' / ');
}

function guestCountSummary(booking: HostEmailBooking): string {
  if (typeof booking.adults === 'number' || typeof booking.children === 'number') {
    const adults = booking.adults ?? 0;
    const children = booking.children ?? 0;
    return `${adults} adults + ${children} children (${adults + children} total)`;
  }

  const totalGuests = booking.guests ?? 0;
  return `${totalGuests} total guest${totalGuests === 1 ? '' : 's'}`;
}

export function hostNewReservationTemplate(input: {
  booking: HostEmailBooking;
  property: EmailProperty;
}): TemplateResult {
  const { booking, property } = input;
  const title = propertyTitle(property, 'en');
  const bookingUrl = `${getSiteUrl()}/dashboard/bookings/${encodeURIComponent(booking.id)}`;
  const total = formatMoney(booking.totalPrice, booking.currency, 'en');

  const subject = `New reservation: ${title} · ${booking.bookingNumber}`;
  const html = renderShell('New paid reservation', `
    <p style="font-size:16px;line-height:1.7;margin:0 0 18px;">A guest has completed payment for a new reservation.</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;border-top:1px solid #eee;border-bottom:1px solid #eee;">
      ${detailRow('Property', title)}
      ${detailRow('Booking number', booking.bookingNumber)}
      ${detailRow('Guest', guestSummary(booking))}
      ${detailRow('Check-in', formatDate(booking.checkIn, 'en'))}
      ${detailRow('Check-out', formatDate(booking.checkOut, 'en'))}
      ${detailRow('Guests', guestCountSummary(booking))}
      ${detailRow('Total', total)}
      ${detailRow('Status', 'PAID')}
      ${detailRow('Link', bookingUrl)}
    </table>
    <p style="margin:24px 0;">
      <a href="${escapeHtml(bookingUrl)}" style="display:inline-block;background:#222;color:#fff;padding:12px 20px;border-radius:10px;text-decoration:none;font-weight:700;">View booking</a>
    </p>
  `);

  const text = `New paid reservation\nProperty: ${title}\nBooking number: ${booking.bookingNumber}\nGuest: ${guestSummary(booking)}\nCheck-in: ${formatDate(booking.checkIn, 'en')}\nCheck-out: ${formatDate(booking.checkOut, 'en')}\nGuests: ${guestCountSummary(booking)}\nTotal: ${total}\nStatus: PAID\nLink: ${bookingUrl}`;

  return { subject, html, text };
}
