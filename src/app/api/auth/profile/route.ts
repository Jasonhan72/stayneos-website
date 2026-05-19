// PATCH /api/auth/profile — update the authenticated user's name, phone, avatar.
//
// Body (all optional): { name?: string; firstName?: string; lastName?: string; phone?: string; address?: string; avatar?: string }
// Returns the updated user (minus password).

import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/auth";
import { getDb } from "@/lib/d1";
import { validateCsrf } from '@/lib/security/csrf';

export const dynamic = "force-dynamic";

export async function PATCH(request: NextRequest) {
  if (!validateCsrf(request)) return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  try {
    const currentUser = await getCurrentUserFromRequest(request);
    if (!currentUser?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as {
      name?: unknown;
      firstName?: unknown;
      lastName?: unknown;
      phone?: unknown;
      address?: unknown;
      avatar?: unknown;
      bio?: unknown;
    };

    // Whitelist fields — only allowed columns.
    const fields: string[] = [];
    const values: (string | null)[] = [];

    const firstName = typeof body.firstName === "string" ? body.firstName.trim() : undefined;
    const lastName = typeof body.lastName === "string" ? body.lastName.trim() : undefined;
    const explicitName = typeof body.name === "string" ? body.name.trim() : undefined;

    if (firstName !== undefined || lastName !== undefined || explicitName !== undefined) {
      const base = await getDb()
        .prepare("SELECT name, phone, avatar, role, email, id FROM User WHERE id = ?")
        .bind(currentUser.userId)
        .first<{ name?: string | null }>();

      const existingName = (base?.name || '').trim();
      const existingParts = existingName.split(/\s+/).filter(Boolean);
      const nextFirstName = firstName ?? existingParts[0] ?? '';
      const nextLastName = lastName ?? existingParts.slice(1).join(' ');
      const combinedName = explicitName || [nextFirstName, nextLastName].filter(Boolean).join(' ').trim();

      if (combinedName) {
        fields.push("name = ?");
        values.push(combinedName);
      }
    }
    if (typeof body.phone === "string") {
      fields.push("phone = ?");
      values.push(body.phone.trim() || null);
    }
    if (typeof body.address === "string") {
      fields.push("address = ?");
      values.push(body.address.trim() || null);
    }
    if (typeof body.avatar === "string") {
      fields.push("avatar = ?");
      values.push(body.avatar.trim() || null);
    }
    if (typeof body.bio === "string") {
      fields.push("bio = ?");
      values.push(body.bio.trim() || null);
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: "No valid fields provided" }, { status: 400 });
    }

    const db = getDb();
    const now = new Date().toISOString();
    fields.push("updatedAt = ?");
    values.push(now);
    values.push(currentUser.userId);

    await db
      .prepare(`UPDATE User SET ${fields.join(", ")} WHERE id = ?`)
      .bind(...values)
      .run();

    // Return the updated row (never leak password).
    const updated = await db
      .prepare("SELECT id, email, emailVerified, name, phone, address, avatar, role, createdAt, updatedAt FROM User WHERE id = ?")
      .bind(currentUser.userId)
      .first();

    return NextResponse.json({ user: updated });
  } catch (err) {
    console.error("auth/profile:patch", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
