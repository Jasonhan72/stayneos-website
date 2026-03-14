import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/admin-api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getR2(): any {
  const symbol = Symbol.for("__cloudflare-context__");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const context = (globalThis as any)[symbol];
  if (context?.env?.IMAGES) return context.env.IMAGES;
  throw new Error("R2 binding 'IMAGES' not found");
}

export async function POST(request: Request) {
  try {
    await requireAdmin(request);

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const propertyId = formData.get('propertyId') as string | null;

    if (!file) {
      return NextResponse.json({ error: '未选择文件' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: '不支持的文件类型，仅支持 JPEG/PNG/WebP/AVIF' }, { status: 400 });
    }

    // Max 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: '文件大小超过 10MB 限制' }, { status: 400 });
    }

    // Generate unique key
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const prefix = propertyId ? `properties/${propertyId}` : 'uploads';
    const key = `${prefix}/${timestamp}-${random}.${ext}`;

    // Upload to R2
    const r2 = getR2();
    const arrayBuffer = await file.arrayBuffer();
    await r2.put(key, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000',
      },
      customMetadata: {
        originalName: file.name,
        propertyId: propertyId || '',
        uploadedAt: new Date().toISOString(),
      },
    });

    // Return the public URL (via custom domain or R2 public URL)
    const url = `/api/images/${key}`;

    return NextResponse.json({
      success: true,
      url,
      key,
      size: file.size,
      type: file.type,
      name: file.name,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error instanceof Error && error.message === 'FORBIDDEN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Upload error:', error);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}
