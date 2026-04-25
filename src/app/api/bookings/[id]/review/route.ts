import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { userDb, getDb } from "@/lib/d1";
import { bookingDb } from "@/lib/booking-db";
import { reviewDb } from "@/lib/review-db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUserFromRequest(request);

    if (!currentUser?.email) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const db = getDb();
    const user = await userDb.findByEmail(db, currentUser.email);
    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const { id } = await params;
    const booking = await bookingDb.findById(db, id);
    if (!booking || booking.userId !== user.id) {
      return NextResponse.json({ error: "预订不存在" }, { status: 404 });
    }

    const review = await reviewDb.findByBookingId(db, booking.id);
    return NextResponse.json({ success: true, review });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error("Get review error:", error);
    return NextResponse.json({ error: "获取评价失败" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUserFromRequest(request);

    if (!currentUser?.email) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 });
    }

    const db = getDb();
    const user = await userDb.findByEmail(db, currentUser.email);
    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const { id } = await params;
    const booking = await bookingDb.findById(db, id);
    if (!booking || booking.userId !== user.id) {
      return NextResponse.json({ error: "预订不存在" }, { status: 404 });
    }

    if (booking.status !== "CHECKED_OUT") {
      return NextResponse.json({ error: "仅已完成预订可评价" }, { status: 400 });
    }

    const body = (await request.json().catch(() => ({}))) as { rating?: number; comment?: string };
    const rating = Number(body.rating);
    const comment = (body.comment || "").trim();

    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "评分必须在 1-5" }, { status: 400 });
    }

    if (!comment) {
      return NextResponse.json({ error: "请填写评价内容" }, { status: 400 });
    }

    const review = await reviewDb.upsert(db, {
      bookingId: booking.id,
      propertyId: booking.propertyId,
      userId: user.id,
      rating,
      comment,
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error("Submit review error:", error);
    return NextResponse.json({ error: "提交评价失败" }, { status: 500 });
  }
}
