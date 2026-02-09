// Cloudflare Pages Function - Booking API with Email Confirmation
// 路径: /functions/api/bookings/create.js

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    const {
      propertyId,
      propertyTitle,
      userId,
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      nights,
      guests,
      basePrice,
      discountRate,
      discountAmount,
      serviceFee,
      totalPrice,
      specialRequests,
    } = body;

    // 验证必填字段
    if (!propertyId || !guestName || !guestEmail || !checkIn || !checkOut || !totalPrice) {
      return new Response(
        JSON.stringify({ message: "请填写所有必填信息" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 生成预订编号 (如: STN-20260207-XXXX)
    const bookingNumber = `STN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const bookingId = crypto.randomUUID();
    const now = new Date().toISOString();

    // 保存预订到数据库
    await env.DB.prepare(
      `INSERT INTO bookings (
        id, booking_number, property_id, property_title, user_id,
        guest_name, guest_email, guest_phone, check_in, check_out,
        nights, guests, base_price, discount_rate, discount_amount,
        service_fee, total_price, currency, special_requests,
        status, payment_status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      bookingId,
      bookingNumber,
      propertyId,
      propertyTitle || '未知房源',
      userId || null,
      guestName,
      guestEmail,
      guestPhone || null,
      checkIn,
      checkOut,
      nights || 0,
      guests || 1,
      basePrice || 0,
      discountRate || 0,
      discountAmount || 0,
      serviceFee || 0,
      totalPrice,
      'CAD',
      specialRequests || null,
      'PENDING',
      'PENDING',
      now
    ).run();

    // 检查邮件配置
    console.log('[BOOKING] RESEND_API_KEY configured:', !!env.RESEND_API_KEY);
    
    // 发送确认邮件给客人
    console.log('[BOOKING] Sending confirmation email to:', guestEmail);
    const guestEmailResult = await sendBookingConfirmationEmail({
      env,
      to: guestEmail,
      booking: {
        bookingNumber,
        propertyTitle: propertyTitle || '未知房源',
        guestName,
        checkIn,
        checkOut,
        nights: nights || 0,
        guests: guests || 1,
        totalPrice,
        currency: 'CAD',
        specialRequests,
      },
    });
    console.log('[BOOKING] Guest email result:', guestEmailResult);

    // 发送通知邮件给管理员
    console.log('[BOOKING] Sending admin notification');
    const adminEmailResult = await sendAdminNotificationEmail({
      env,
      booking: {
        bookingNumber,
        propertyTitle: propertyTitle || '未知房源',
        guestName,
        guestEmail,
        guestPhone,
        checkIn,
        checkOut,
        nights: nights || 0,
        guests: guests || 1,
        totalPrice,
        currency: 'CAD',
        specialRequests,
      },
    });
    console.log('[BOOKING] Admin email result:', adminEmailResult);

    return new Response(
      JSON.stringify({
        message: "预订提交成功",
        booking: {
          id: bookingId,
          bookingNumber,
          status: 'PENDING',
          createdAt: now,
        },
        emails: {
          guest: guestEmailResult.success,
          admin: adminEmailResult.success,
        },
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("预订错误:", error);
    return new Response(
      JSON.stringify({ message: "预订失败: " + error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// 发送客人确认邮件
async function sendBookingConfirmationEmail({ env, to, booking }) {
  try {
    const subject = `预订确认 - ${booking.propertyTitle} - ${booking.bookingNumber}`;
    
    const htmlContent = `
      <h2>感谢您在 StayNeos 预订！</h2>
      <p>尊敬的 ${booking.guestName}，</p>
      <p>您的预订已收到，我们正在为您确认房源可用性。</p>
      
      <h3>预订详情</h3>
      <ul>
        <li><strong>预订编号：</strong> ${booking.bookingNumber}</li>
        <li><strong>房源：</strong> ${booking.propertyTitle}</li>
        <li><strong>入住日期：</strong> ${booking.checkIn}</li>
        <li><strong>退房日期：</strong> ${booking.checkOut}</li>
        <li><strong>入住天数：</strong> ${booking.nights} 晚</li>
        <li><strong>入住人数：</strong> ${booking.guests} 人</li>
        <li><strong>总金额：</strong> $${booking.totalPrice} ${booking.currency}</li>
      </ul>
      
      ${booking.specialRequests ? `<p><strong>特殊要求：</strong> ${booking.specialRequests}</p>` : ''}
      
      <p>我们会在24小时内通过邮件或电话与您确认预订详情。</p>
      
      <p>如有疑问，请联系我们：</p>
      <ul>
        <li>电话：+1 (647) 862-6518</li>
        <li>邮箱：hello@stayneos.com</li>
      </ul>
      
      <p>祝您入住愉快！<br/>StayNeos 团队</p>
    `;

    // 这里使用简单的 fetch 调用邮件服务
    // 实际生产环境可以使用 SendGrid, Resend, 或 Cloudflare Email Workers
    const emailResult = await sendEmail({
      env,
      to,
      subject,
      html: htmlContent,
      template: 'BOOKING_CONFIRMATION',
    });

    return { success: emailResult.success };
  } catch (error) {
    console.error("发送客人邮件失败:", error);
    return { success: false, error: error.message };
  }
}

// 发送管理员通知邮件
async function sendAdminNotificationEmail({ env, booking }) {
  try {
    const subject = `新预订通知 - ${booking.propertyTitle} - ${booking.bookingNumber}`;
    
    const htmlContent = `
      <h2>新预订通知</h2>
      <p>收到新的预订请求，请及时处理。</p>
      
      <h3>预订详情</h3>
      <ul>
        <li><strong>预订编号：</strong> ${booking.bookingNumber}</li>
        <li><strong>房源：</strong> ${booking.propertyTitle}</li>
        <li><strong>客人姓名：</strong> ${booking.guestName}</li>
        <li><strong>客人邮箱：</strong> ${booking.guestEmail}</li>
        <li><strong>客人电话：</strong> ${booking.guestPhone || '未提供'}</li>
        <li><strong>入住日期：</strong> ${booking.checkIn}</li>
        <li><strong>退房日期：</strong> ${booking.checkOut}</li>
        <li><strong>入住天数：</strong> ${booking.nights} 晚</li>
        <li><strong>入住人数：</strong> ${booking.guests} 人</li>
        <li><strong>总金额：</strong> $${booking.totalPrice} ${booking.currency}</li>
      </ul>
      
      ${booking.specialRequests ? `<p><strong>特殊要求：</strong> ${booking.specialRequests}</p>` : ''}
      
      <p>请及时登录后台管理系统确认此预订。</p>
    `;

    const emailResult = await sendEmail({
      env,
      to: 'hello@stayneos.com', // 管理员邮箱
      subject,
      html: htmlContent,
      template: 'ADMIN_NOTIFICATION',
    });

    return { success: emailResult.success };
  } catch (error) {
    console.error("发送管理员邮件失败:", error);
    return { success: false, error: error.message };
  }
}

// 发送邮件（使用 Cloudflare Email Workers 或外部服务）
async function sendEmail({ env, to, subject, html, template }) {
  try {
    // 方案1: 使用 Resend API (需要设置 RESEND_API_KEY)
    if (env.RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'StayNeos <hello@stayneos.com>',
          to,
          subject,
          html,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // 记录邮件日志
        await logEmail({ env, bookingId: null, recipient: to, recipientType: template === 'ADMIN_NOTIFICATION' ? 'ADMIN' : 'GUEST', subject, template, status: 'SENT' });
        
        return { success: true, id: result.id };
      } else {
        // 记录错误详情
        const errorText = await response.text();
        console.error('Resend API 错误:', response.status, errorText);
        await logEmail({ env, bookingId: null, recipient: to, recipientType: template === 'ADMIN_NOTIFICATION' ? 'ADMIN' : 'GUEST', subject, template, status: 'FAILED', errorMessage: `Resend ${response.status}: ${errorText}` });
        return { success: false, error: `Resend API error: ${response.status} - ${errorText}` };
      }
    }

    // 方案2: 使用 Cloudflare Email Workers (需要设置 EMAIL_WORKER_URL)
    if (env.EMAIL_WORKER_URL) {
      const response = await fetch(env.EMAIL_WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, html }),
      });

      if (response.ok) {
        await logEmail({ env, bookingId: null, recipient: to, recipientType: template === 'ADMIN_NOTIFICATION' ? 'ADMIN' : 'GUEST', subject, template, status: 'SENT' });
        return { success: true };
      }
    }

    // 如果没有配置邮件服务，仅记录日志（开发模式）
    console.log(`[EMAIL MOCK] To: ${to}, Subject: ${subject}`);
    await logEmail({ env, bookingId: null, recipient: to, recipientType: template === 'ADMIN_NOTIFICATION' ? 'ADMIN' : 'GUEST', subject, template, status: 'MOCK' });
    
    return { success: true, mock: true };
  } catch (error) {
    console.error("发送邮件失败:", error);
    await logEmail({ env, bookingId: null, recipient: to, recipientType: template === 'ADMIN_NOTIFICATION' ? 'ADMIN' : 'GUEST', subject, template, status: 'FAILED', errorMessage: error.message });
    return { success: false, error: error.message };
  }
}

// 记录邮件日志
async function logEmail({ env, bookingId, recipient, recipientType, subject, template, status, errorMessage }) {
  try {
    await env.DB.prepare(
      `INSERT INTO email_logs (id, booking_id, recipient, recipient_type, subject, template, status, sent_at, error_message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      crypto.randomUUID(),
      bookingId,
      recipient,
      recipientType,
      subject,
      template,
      status,
      new Date().toISOString(),
      errorMessage || null
    ).run();
  } catch (error) {
    console.error("记录邮件日志失败:", error);
  }
}
