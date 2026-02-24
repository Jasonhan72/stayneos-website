// Cloudflare Pages Function - Stripe Webhook Handler
// 路径: /functions/api/payments/webhook.js

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    // 获取 Stripe 签名
    const signature = request.headers.get('stripe-signature');
    
    if (!signature) {
      return new Response(
        JSON.stringify({ error: "Missing stripe-signature header" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 获取请求体
    const body = await request.text();

    // 验证 webhook 签名（简化版，生产环境应该使用 stripe.webhooks.constructEvent）
    if (!env.STRIPE_WEBHOOK_SECRET) {
      console.warn('[WEBHOOK] STRIPE_WEBHOOK_SECRET not configured');
    }

    // 解析事件
    const event = JSON.parse(body);
    console.log('[WEBHOOK] Received event:', event.type);

    // 处理不同的事件类型
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(env, event.data.object);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(env, event.data.object);
        break;
        
      case 'charge.refunded':
        await handleRefund(env, event.data.object);
        break;
        
      default:
        console.log(`[WEBHOOK] Unhandled event type: ${event.type}`);
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('[WEBHOOK] Error:', error);
    return new Response(
      JSON.stringify({ error: "Webhook 处理失败" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// 处理支付成功
async function handlePaymentSuccess(env, paymentIntent) {
  const bookingId = paymentIntent.metadata?.bookingId;
  
  if (!bookingId) {
    console.error('[WEBHOOK] No bookingId in payment intent metadata');
    return;
  }

  const now = new Date().toISOString();

  // 更新预订状态
  await env.DB.prepare(
    `UPDATE bookings SET 
      payment_status = 'COMPLETED',
      status = 'CONFIRMED',
      updated_at = ?
     WHERE id = ?`
  ).bind(now, bookingId).run();

  // 更新支付记录
  await env.DB.prepare(
    `UPDATE payments SET 
      status = 'COMPLETED',
      stripe_payment_intent_id = ?,
      updated_at = ?
     WHERE booking_id = ?`
  ).bind(paymentIntent.id, now, bookingId).run();

  console.log('[WEBHOOK] Payment succeeded for booking:', bookingId);

  // 发送确认邮件（可选）
  try {
    const booking = await env.DB.prepare(
      `SELECT * FROM bookings WHERE id = ?`
    ).bind(bookingId).first();

    if (booking && env.RESEND_API_KEY) {
      await sendPaymentConfirmationEmail(env, booking);
    }
  } catch (error) {
    console.error('[WEBHOOK] Failed to send confirmation email:', error);
  }
}

// 处理支付失败
async function handlePaymentFailure(env, paymentIntent) {
  const bookingId = paymentIntent.metadata?.bookingId;
  
  if (!bookingId) {
    console.error('[WEBHOOK] No bookingId in payment intent metadata');
    return;
  }

  const now = new Date().toISOString();

  // 更新支付记录
  await env.DB.prepare(
    `UPDATE payments SET 
      status = 'FAILED',
      error_message = ?,
      updated_at = ?
     WHERE booking_id = ?`
  ).bind(
    paymentIntent.last_payment_error?.message || '支付失败',
    now,
    bookingId
  ).run();

  console.log('[WEBHOOK] Payment failed for booking:', bookingId);
}

// 处理退款
async function handleRefund(env, charge) {
  const paymentIntentId = charge.payment_intent;
  
  if (!paymentIntentId) {
    console.error('[WEBHOOK] No payment_intent in charge');
    return;
  }

  const now = new Date().toISOString();

  // 更新支付记录
  await env.DB.prepare(
    `UPDATE payments SET 
      status = 'REFUNDED',
      updated_at = ?
     WHERE stripe_payment_intent_id = ?`
  ).bind(now, paymentIntentId).run();

  console.log('[WEBHOOK] Payment refunded:', paymentIntentId);
}

// 发送支付确认邮件
async function sendPaymentConfirmationEmail(env, booking) {
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>支付确认 - StayNeos</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #000;">支付确认</h1>
        <p>尊敬的 ${booking.guest_name}，</p>
        <p>您的预订支付已成功！</p>
        
        <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
          <h3 style="margin-top: 0;">预订详情</h3>
          <p><strong>预订编号：</strong>${booking.booking_number}</p>
          <p><strong>房源：</strong>${booking.property_title}</p>
          <p><strong>入住日期：</strong>${booking.check_in}</p>
          <p><strong>退房日期：</strong>${booking.check_out}</p>
          <p><strong>支付金额：</strong>CAD $${booking.total_price}</p>
        </div>
        
        <p>感谢您选择 StayNeos！</p>
      </div>
    </body>
    </html>
  `;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.RESEND_FROM_EMAIL || 'hello@stayneos.com',
      to: booking.guest_email,
      subject: `支付确认 - 预订 #${booking.booking_number}`,
      html: emailHtml,
    }),
  });
}

// 处理 OPTIONS 请求（CORS 预检）
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
