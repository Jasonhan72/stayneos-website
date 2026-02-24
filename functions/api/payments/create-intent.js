// Cloudflare Pages Function - Stripe Payment Intent Creation
// 路径: /functions/api/payments/create-intent.js

export async function onRequestPost(context) {
  const { request, env } = context;
  
  try {
    const body = await request.json();
    const { bookingId } = body;

    // 验证必填字段
    if (!bookingId) {
      return new Response(
        JSON.stringify({ error: "预订ID不能为空" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 检查 Stripe 配置
    if (!env.STRIPE_SECRET_KEY) {
      console.error('[PAYMENT] STRIPE_SECRET_KEY not configured');
      return new Response(
        JSON.stringify({ error: "支付系统未配置，请联系客服" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 从数据库获取预订信息
    const booking = await env.DB.prepare(
      `SELECT * FROM bookings WHERE id = ?`
    ).bind(bookingId).first();

    if (!booking) {
      return new Response(
        JSON.stringify({ error: "预订不存在" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // 检查预订状态
    if (booking.status === 'CANCELLED') {
      return new Response(
        JSON.stringify({ error: "预订已取消" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (booking.payment_status === 'COMPLETED') {
      return new Response(
        JSON.stringify({ error: "预订已支付" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 计算支付金额（转换为分）
    const amountInCents = Math.round(Number(booking.total_price) * 100);

    // 创建 Stripe Payment Intent
    const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        amount: amountInCents.toString(),
        currency: booking.currency.toLowerCase(),
        'metadata[bookingId]': booking.id,
        'metadata[bookingNumber]': booking.booking_number,
        'metadata[propertyId]': booking.property_id,
        description: `预订 #${booking.booking_number} - ${booking.property_title}`,
        ...(booking.guest_email ? { 'receipt_email': booking.guest_email } : {}),
      }),
    });

    const paymentIntent = await stripeResponse.json();

    if (!stripeResponse.ok) {
      console.error('[PAYMENT] Stripe error:', paymentIntent);
      return new Response(
        JSON.stringify({ error: paymentIntent.error?.message || "创建支付失败" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // 更新预订的 Stripe Payment Intent ID
    await env.DB.prepare(
      `UPDATE bookings SET 
        stripe_payment_intent_id = ?,
        payment_status = 'PROCESSING',
        updated_at = ?
       WHERE id = ?`
    ).bind(
      paymentIntent.id,
      new Date().toISOString(),
      bookingId
    ).run();

    // 创建支付记录
    await env.DB.prepare(
      `INSERT INTO payments (
        id, booking_id, amount, currency, 
        stripe_payment_intent_id, payment_method, status, 
        metadata, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      crypto.randomUUID(),
      booking.id,
      booking.total_price,
      booking.currency,
      paymentIntent.id,
      'CREDIT_CARD',
      'PENDING',
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      new Date().toISOString()
    ).run();

    return new Response(
      JSON.stringify({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: amountInCents,
        currency: booking.currency,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error('[PAYMENT] Create intent error:', error);
    return new Response(
      JSON.stringify({ error: "创建支付意向失败，请稍后重试" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
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
