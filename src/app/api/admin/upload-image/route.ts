import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin-api';

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    await requireAdmin(request);

    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 });
    }

    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (!accountId || !apiToken) {
      return NextResponse.json({ error: 'Cloudflare upload env missing' }, { status: 500 });
    }

    const cfForm = new FormData();
    cfForm.append('file', file, file.name || 'upload.jpg');
    cfForm.append('requireSignedURLs', 'false');

    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiToken}` },
      body: cfForm,
    });

    const data: { success?: boolean; result?: { id?: string; filename?: string; variants?: string[] }; errors?: Array<{ message?: string }> } = await res.json();
    if (!res.ok || !data?.success) {
      return NextResponse.json({ error: data?.errors?.[0]?.message || 'Upload failed' }, { status: 500 });
    }

    const variants: string[] = data.result?.variants || [];
    const url = variants[0] || null;

    return NextResponse.json({
      success: true,
      id: data.result?.id,
      filename: data.result?.filename,
      url,
      variants,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
