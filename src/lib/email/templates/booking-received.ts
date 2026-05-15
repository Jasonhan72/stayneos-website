import {
  detailRow,
  EmailBooking,
  EmailProperty,
  escapeHtml,
  formatDate,
  getSiteUrl,
  getSupportEmail,
  normalizeLocale,
  propertyTitle,
  renderShell,
  TemplateResult,
} from './shared';

export function bookingReceivedTemplate(input: {
  booking: EmailBooking;
  property: EmailProperty;
  locale?: string | null;
}): TemplateResult {
  const { booking, property } = input;
  const locale = normalizeLocale(input.locale);
  const title = propertyTitle(property, locale);
  const supportEmail = getSupportEmail();
  const paymentUrl = `${getSiteUrl()}/payment/${encodeURIComponent(booking.propertyId)}?bookingId=${encodeURIComponent(booking.id)}`;

  if (locale === 'zh') {
    const subject = `我们已收到你的预订请求 #${booking.bookingNumber}`;
    const html = renderShell('你的预订请求已收到', `
      <p style="font-size:16px;line-height:1.7;margin:0 0 18px;">你好${booking.guestName ? ` ${escapeHtml(booking.guestName)}` : ''}，我们已收到你的预订请求。请继续完成付款以确认预订。</p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;border-top:1px solid #eee;border-bottom:1px solid #eee;">
        ${detailRow('预订编号', booking.bookingNumber)}
        ${detailRow('房源', title)}
        ${detailRow('入住日期', formatDate(booking.checkIn, locale))}
        ${detailRow('退房日期', formatDate(booking.checkOut, locale))}
      </table>
      <p style="text-align:center;margin:28px 0;">
        <a href="${escapeHtml(paymentUrl)}" style="display:inline-block;background:#FF385C;color:#fff;padding:13px 24px;border-radius:10px;text-decoration:none;font-weight:700;">前往付款</a>
      </p>
      <p style="font-size:14px;line-height:1.7;color:#555;margin:0;">如果你有任何问题，请回复此邮件或联系 ${escapeHtml(supportEmail)}。付款完成后，我们会发送确认邮件。</p>
    `);
    const text = `你的预订请求已收到\n预订编号: ${booking.bookingNumber}\n房源: ${title}\n入住: ${formatDate(booking.checkIn, locale)}\n退房: ${formatDate(booking.checkOut, locale)}\n付款链接: ${paymentUrl}\n客服: ${supportEmail}`;
    return { subject, html, text };
  }

  const subject = `Reservation received #${booking.bookingNumber}`;
  const html = renderShell('Your reservation request is received', `
    <p style="font-size:16px;line-height:1.7;margin:0 0 18px;">Hi${booking.guestName ? ` ${escapeHtml(booking.guestName)}` : ''}, we received your reservation request. Please complete payment to confirm your stay.</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;border-top:1px solid #eee;border-bottom:1px solid #eee;">
      ${detailRow('Booking number', booking.bookingNumber)}
      ${detailRow('Property', title)}
      ${detailRow('Check-in', formatDate(booking.checkIn, locale))}
      ${detailRow('Check-out', formatDate(booking.checkOut, locale))}
    </table>
    <p style="text-align:center;margin:28px 0;">
      <a href="${escapeHtml(paymentUrl)}" style="display:inline-block;background:#FF385C;color:#fff;padding:13px 24px;border-radius:10px;text-decoration:none;font-weight:700;">Continue to payment</a>
    </p>
    <p style="font-size:14px;line-height:1.7;color:#555;margin:0;">Questions? Reply to this email or contact ${escapeHtml(supportEmail)}. We’ll send a confirmation email after payment is completed.</p>
  `);
  const text = `Reservation received\nBooking number: ${booking.bookingNumber}\nProperty: ${title}\nCheck-in: ${formatDate(booking.checkIn, locale)}\nCheck-out: ${formatDate(booking.checkOut, locale)}\nPayment link: ${paymentUrl}\nSupport: ${supportEmail}`;
  return { subject, html, text };
}
