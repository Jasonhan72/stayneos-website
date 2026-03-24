import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function deprecatedResponse() {
  return NextResponse.json(
    {
      error: "deprecated",
      message: "NextAuth endpoint is deprecated. Use /api/auth/login, /api/auth/register, and cookie-based JWT session (/api/auth/session).",
    },
    { status: 410 }
  );
}

export async function GET() {
  return deprecatedResponse();
}

export async function POST() {
  return deprecatedResponse();
}
