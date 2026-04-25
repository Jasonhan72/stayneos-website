// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getR2(): any {
  const symbol = Symbol.for("__cloudflare-context__");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const context = (globalThis as any)[symbol];
  if (context?.env?.IMAGES) return context.env.IMAGES;
  throw new Error("R2 binding 'IMAGES' not found");
}

export async function GET(_request: Request, { params }: { params: Promise<{ key: string[] }> }) {
  try {
    const { key } = await params;
    const keyPath = key.join('/');
    const r2 = getR2();
    const object = await r2.get(keyPath);

    if (!object) {
      return new Response('Not Found', { status: 404 });
    }

    const headers = new Headers();
    headers.set('Content-Type', object.httpMetadata?.contentType || 'image/jpeg');
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('ETag', object.httpEtag || '');

    return new Response(object.body, { headers });
  } catch {
    return new Response('Error loading image', { status: 500 });
  }
}
