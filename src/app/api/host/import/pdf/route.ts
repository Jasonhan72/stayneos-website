import { verifyRequestAuth } from "@/lib/auth/admin-api";
import { NextRequest, NextResponse } from "next/server";
import { validateCsrf } from '@/lib/security/csrf';

export const dynamic = "force-dynamic";

/**
 * POST /api/host/import/pdf
 *
 * Placeholder. PDF parsing (e.g. via `pdf-parse` or `unpdf`) will be added
 * later; for now we accept the upload and return an empty draft so the wizard
 * can proceed without errors.
 */
export async function POST(req: NextRequest) {
  if (!validateCsrf(req)) return NextResponse.json({ error: 'Invalid CSRF token' }, { status: 403 });
  const user = await verifyRequestAuth(req);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  let fileName = "";
  try {
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      if (file instanceof File) fileName = file.name;
    }
  } catch {
    /* ignore */
  }

  return NextResponse.json({
    draft: {},
    warnings: [
      "PDF parsing coming soon — please fill the details manually for now.",
      fileName ? `Received: ${fileName}` : "No file detected on the request.",
    ],
  });
}
