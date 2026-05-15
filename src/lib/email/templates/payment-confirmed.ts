import {
  detailRow,
  EmailBooking,
  EmailProperty,
  escapeHtml,
  formatDate,
  formatMoney,
  getSiteUrl,
  normalizeLocale,
  propertyTitle,
  renderShell,
  TemplateResult,
} from './shared';

export function paymentConfirmedTemplate(input: {
  booking: EmailBooking;
  property: EmailProperty;
  locale?: string | null;
  paidAmount?: number | null;
}): TemplateResult {
  const { booking, property } = input;
  const locale = normalizeLocale(input.locale);
  const title = propertyTitle(property, locale);
  const dashboardUrl = `${getSiteUrl()}/dashboard/bookings/${encodeURIComponent(booking.id)}`;
  const amount = input.paidAmount ?? booking.totalPrice;

  if (locale === 'zh') {
    const subject = `付款已确认 #${booking.bookingNumber}`;
    const html = renderShell('付款已确认', `
      <p style="font-size:16px;line-height:1.7;margin:0 0 18px;">谢谢${booking.guestName ? ` ${escapeHtml(booking.guestName)}` : ''}，你的付款已确认，预订现在已生效。</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;border-top:1px solid #eee;border-bottom:1px solid #eee;">
        ${detailRow('预订编号', booking.bookingNumber)}
        ${detailRow('房源', title)}
        ${detailRow('入住日期', formatDate(booking.checkIn, locale))}
        ${detailRow('退房日期', formatDate(booking.checkOut, locale))}
        ${detailRow('已付款', formatMoney(amount, booking.currency, locale))}
      </table>
      <div style="background:#fafafa;border-radius:12px;padding:16px;margin:22px 0;color:#444;line-height:1.7;">
        <strong style="color:#222;">退订政策摘要：</strong> 若需更改或取消预订，请尽早联系我们。具体条款以预订页面和合同确认为准。
      </div>
      <p style="text-align:center;margin:28px 0;">
        <a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;background:#222;color:#fff;padding:13px 24px;border-radius:10px;text-decoration:none;font-weight:700;">查看预订</a>
      </p>
    `);
    const text = `付款已确认\n预订编号: ${booking.bookingNumber}\n房源: ${title}\n入住: ${formatDate(booking.checkIn, locale)}\n退房: ${formatDate(booking.checkOut, locale)}\n已付款: ${formatMoney(amount, booking.currency, locale)}\n退订政策摘要: 若需更改或取消预订，请尽早联系我们。\nDashboard: ${dashboardUrl}`;
    return { subject, html, text };
  }

  const subject = `Payment confirmed #${booking.bookingNumber}`;
  const html = renderShell('Payment confirmed', `
    <p style="font-size:16px;line-height:1.7;margin:0 0 18px;">Thank you${booking.guestName ? ` ${escapeHtml(booking.guestName)}` : ''}. Your payment is confirmed and your reservation is now active.</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;border-top:1px solid #eee;border-bottom:1px solid #eee;">
      ${detailRow('Booking number', booking.bookingNumber)}
      ${detailRow('Property', title)}
      ${detailRow('Check-in', formatDate(booking.checkIn, locale))}
      ${detailRow('Check-out', formatDate(booking.checkOut, locale))}
      ${detailRow('Total paid', formatMoney(amount, booking.currency, locale))}
    </table>
    <div style="background:#fafafa;border-radius:12px;padding:16px;margin:22px 0;color:#444;line-height:1.7;">
      <strong style="color:#222;">Cancellation policy summary:</strong> If you need to change or cancel your reservation, please contact us as early as possible. Final terms follow the booking page and agreement confirmation.
    </div>
    <p style="text-align:center;margin:28px 0;">
      <a href="${escapeHtml(dashboardUrl)}" style="display:inline-block;background:#222;color:#fff;padding:13px 24px;border-radius:10px;text-decoration:none;font-weight:700;">View booking</a>
    </p>
  `);
  const text = `Payment confirmed\nBooking number: ${booking.bookingNumber}\nProperty: ${title}\nCheck-in: ${formatDate(booking.checkIn, locale)}\nCheck-out: ${formatDate(booking.checkOut, locale)}\nTotal paid: ${formatMoney(amount, booking.currency, locale)}\nCancellation policy summary: Contact us early if you need to change or cancel.\nDashboard: ${dashboardUrl}`;
  return { subject, html, text };
}
