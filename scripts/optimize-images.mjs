import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const PUBLIC_IMAGES = path.join(ROOT, 'public', 'images');
const MANIFEST_PATH = path.join(ROOT, 'src', 'lib', 'generated-image-manifest.json');
const widths = [640, 1080, 1920];
const candidateFormats = [
  { ext: 'jpg', key: 'jpeg', transform: (img) => img.jpeg({ quality: 80, mozjpeg: true }) },
  { ext: 'webp', key: 'webp', transform: (img) => img.webp({ quality: 78 }) },
  { ext: 'avif', key: 'avif', transform: (img) => img.avif({ quality: 55 }) },
];
const validExt = new Set(['.jpg', '.jpeg']);

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return [full];
  }));
  return files.flat();
}

function variantPublicPath(relPath, width, ext) {
  const parsed = path.parse(relPath);
  return path.posix.join('/images', parsed.dir.replace(/\\/g, '/'), `${parsed.name}-${width}.${ext}`).replace('/images//', '/images/');
}

function outputPath(relPath, width, ext) {
  return path.join(PUBLIC_IMAGES, path.dirname(relPath), `${path.parse(relPath).name}-${width}.${ext}`);
}

const manifest = {};
const supportedFormats = candidateFormats.filter((format) => {
  const capability = sharp.format[format.key];
  const supported = Boolean(capability?.output?.file || capability?.output?.buffer);
  if (!supported) console.warn(`Skipping ${format.ext}: encoder unavailable in current sharp build`);
  return supported;
});

const allFiles = (await walk(PUBLIC_IMAGES)).filter((file) => validExt.has(path.extname(file).toLowerCase()));

for (const file of allFiles) {
  const relPath = path.relative(PUBLIC_IMAGES, file);
  if (/-\d+\.(jpg|jpeg|webp|avif)$/i.test(relPath)) continue;

  try {
    const meta = await sharp(file).metadata();
    if (!meta.width || !meta.height) continue;

    const key = path.posix.join('/images', relPath.replace(/\\/g, '/'));
    const entry = { fallback: key, width: meta.width, height: meta.height, variants: {}, placeholder: null };

    const placeholderBuffer = await sharp(file)
      .resize(16, 16, { fit: 'cover' })
      .blur(0.3)
      .jpeg({ quality: 45, mozjpeg: true })
      .toBuffer();
    entry.placeholder = `data:image/jpeg;base64,${placeholderBuffer.toString('base64')}`;

    for (const width of widths) {
      const targetWidth = Math.min(width, meta.width);
      if (!entry.variants[targetWidth]) entry.variants[targetWidth] = {};
      for (const format of supportedFormats) {
        const outPath = outputPath(relPath, targetWidth, format.ext);
        await fs.mkdir(path.dirname(outPath), { recursive: true });
        let pipeline = sharp(file).rotate();
        if (meta.width > targetWidth) pipeline = pipeline.resize({ width: targetWidth, withoutEnlargement: true });
        await format.transform(pipeline).toFile(outPath);
        entry.variants[targetWidth][format.ext] = variantPublicPath(relPath, targetWidth, format.ext);
      }
    }

    manifest[key] = entry;
  } catch (error) {
    console.warn(`Skipping ${relPath}: ${error.message.split('\n')[0]}`);
  }
}

await fs.mkdir(path.dirname(MANIFEST_PATH), { recursive: true });
await fs.writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Optimized ${Object.keys(manifest).length} source images`);
