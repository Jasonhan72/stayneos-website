// Get Booking Details API
// 路径: /functions/api/bookings/[id].js

export async function onRequestGet(context) {
  const { request, env, params } = context;
  const { id } = params;
  
  try {
    // 支持通过 booking ID 或 booking number 查询
    let booking;
    
    // 先尝试按 ID 查询
    booking = await env.DB.prepare(
      `SELECT * FROM bookings WHERE id = ?`
    ).bind(id).first();
    
    // 如果没找到，尝试按 booking_number 查询
    if (!booking) {
      booking = await env.DB.prepare(
        `SELECT * FROM bookings WHERE booking_number = ?`
      ).bind(id).first();
    }

    if (!booking) {
      return new Response(
        JSON.stringify({ message: "预订不存在" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // 获取邮件发送记录
    const emails = await env.DB.prepare(
      `SELECT * FROM email_logs WHERE booking_id = ? ORDER BY sent_at DESC`
    ).bind(booking.id).all();

    return new Response(
      JSON.stringify({
        booking,
        emails: emails.results || [],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("查询预订错误:", error);
    return new Response(
      JSON.stringify({ message: "查询失败: " + error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// 更新预订状态 (确认/取消)
export async function onRequestPatch(context) {
  const { request, env, params } = context;
  const { id } = params;
  
  try {
    const body = await request.json();
    const { status, cancelReason, confirmedAt } = body;

    const booking = await env.DB.prepare(
      `SELECT * FROM bookings WHERE id = ? OR booking_number = ?`
    ).bind(id, id).first();

    if (!booking) {
      return new Response(
        JSON.stringify({ message: "预订不存在" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    let updateFields = [];
    let bindings = [];

    if (status) {
      updateFields.push('status = ?');
      bindings.push(status);
    }

    if (confirmedAt) {
      updateFields.push('confirmed_at = ?');
      bindings.push(confirmedAt);
    }

    if (cancelReason) {
      updateFields.push('cancel_reason = ?');
      bindings.push(cancelReason);
    }

    if (status === 'CANCELLED') {
      updateFields.push('cancelled_at = ?');
      bindings.push(new Date().toISOString());
    }

    updateFields.push('updated_at = ?');
    bindings.push(new Date().toISOString());
    bindings.push(booking.id);

    await env.DB.prepare(
      `UPDATE bookings SET ${updateFields.join(', ')} WHERE id = ?`
    ).bind(...bindings).run();

    // 如果确认预订，发送确认邮件
    if (status === 'CONFIRMED') {
      await sendConfirmationEmail({ env, booking });
    }

    return new Response(
      JSON.stringify({ message: "预订已更新" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("更新预订错误:", error);
    return new Response(
      JSON.stringify({ message: "更新失败: " + error.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

async function sendConfirmationEmail({ env, booking }) {
  try {
    const subject = `预订已确认 - ${booking.property_title} - ${booking.booking_number}`;
    
    const htmlContent = `
      <h2>您的预订已确认！</h2>
      <p>尊敬的 ${booking.guest_name}，</p>
      <p>我们很高兴地通知您，您的预订已确认！</p>
      
      <h3>预订详情</h3>
      <ul>
        <li><strong>预订编号：</strong> ${booking.booking_number}</li>
        <li><strong>房源：</strong> ${booking.property_title}</li>
        <li><strong>入住日期：</strong> ${booking.check_in}</li>
        <li><strong>退房日期：</strong> ${booking.check_out}</li>
        <li><strong>总金额：</strong> $${booking.total_price} ${booking.currency}</li>
      </ul>
      
      <p>入住当天请联系我们的管家获取钥匙和入住指南。</p>
      
      <p>期待您的入住！<br/>StayNeos 团队</p>
    `;

    // 使用与 create.js 相同的 sendEmail 函数
    console.log(`[CONFIRMATION EMAIL] To: ${booking.guest_email}, Subject: ${subject}`);
  } catch (error) {
    console.error("发送确认邮件失败:", error);
  }
}
