const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');

async function alphaBounds(source) {
  const metadata = await sharp(source).metadata();
  if (!metadata.hasAlpha) throw new Error('A logo não tem canal alfa. A marca atual foi preservada.');
  const { data, info } = await sharp(source).rotate().toColourspace('srgb').ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let left = info.width, top = info.height, right = -1, bottom = -1, transparent = 0, partial = 0;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    const alpha = data[(y * info.width + x) * info.channels + 3];
    if (alpha === 0) transparent++;
    else {
      if (alpha < 255) partial++;
      left = Math.min(left, x); right = Math.max(right, x);
      top = Math.min(top, y); bottom = Math.max(bottom, y);
    }
  }
  if (!transparent && !partial) throw new Error('O PNG é totalmente opaco. A marca atual foi preservada.');
  if (right < left) throw new Error('O PNG está inteiramente transparente e não contém uma logo.');
  return { bounds: { left, top, width: right - left + 1, height: bottom - top + 1 }, transparent, partial };
}

async function main() {
  const dir = path.resolve('public/brand');
  const source = path.join(dir, 'logo-transparente.png');
  if (!fs.existsSync(source)) throw new Error('Adicione public/brand/logo-transparente.png. A marca atual foi preservada.');
  // Validate real pixel transparency before writing any replacement assets.
  const alpha = await alphaBounds(source);
  const cropIndex = process.argv.indexOf('--monogram');
  const crop = (process.argv[cropIndex + 1] || '').split(',').map(Number);
  if (cropIndex < 0 || crop.length !== 4 || crop.some(value => !Number.isInteger(value) || value < 0) || !crop[2] || !crop[3]) throw new Error('Informe --monogram esquerda,topo,largura,altura em pixels do arquivo fonte, delimitando somente o monograma AE.');
  const image = sharp(source).rotate();
  const monogram = await image.clone().extract({ left: crop[0], top: crop[1], width: crop[2], height: crop[3] }).png().toBuffer();
  const monogramBounds = (await alphaBounds(monogram)).bounds;
  // Crop transparent margins only; retain every nonzero alpha pixel.
  const trimmed = await image.clone().extract(alpha.bounds).png().toBuffer();
  const padding = Math.max(1, Math.round(Math.max(alpha.bounds.width, alpha.bounds.height) * 0.02));
  const trimmedWithMargin = await sharp(trimmed).extend({ top: padding, bottom: padding, left: padding, right: padding, background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const optimized = await sharp(trimmedWithMargin).resize({ height: 400, withoutEnlargement: true }).png({ compressionLevel: 9 }).toBuffer();
  const css = fs.readFileSync('src/app/globals.css', 'utf8');
  const background = css.match(/--bg:\s*(#[\da-f]{6})/i)[1];
  await sharp(optimized).png({ compressionLevel: 9 }).toFile(path.join(dir, 'logo.png'));
  await sharp(optimized).webp({ quality: 90, alphaQuality: 100 }).toFile(path.join(dir, 'logo.webp'));
  const dimensions = await sharp(optimized).metadata();
  fs.writeFileSync(path.join(dir, 'dimensions.json'), JSON.stringify({ width: dimensions.width, height: dimensions.height }) + '\n');
  const ogLogo = await sharp(trimmedWithMargin).resize({ width: 840, height: 430, fit: 'inside' }).png().toBuffer();
  const ogInfo = await sharp(ogLogo).metadata();
  await sharp({ create: { width: 1200, height: 630, channels: 4, background } }).composite([{ input: ogLogo, left: Math.round((1200 - ogInfo.width) / 2), top: Math.round((630 - ogInfo.height) / 2) }]).png().toFile(path.join(dir, 'og.png'));
  const markSource = await sharp(monogram).extract(monogramBounds).png().toBuffer();
  for (const [size, name] of [[512, 'icon-512.png'], [180, 'apple-touch-icon.png']]) {
    const inset = Math.round(size * 0.16);
    const mark = await sharp(markSource).resize(size - inset * 2, size - inset * 2, { fit: 'contain', background }).png().toBuffer();
    await sharp({ create: { width: size, height: size, channels: 4, background } }).composite([{ input: mark, left: inset, top: inset }]).png().toFile(path.join(dir, name));
  }
  console.log(JSON.stringify({ source: path.basename(source), ...alpha, padding, output: { width: dimensions.width, height: dimensions.height }, background }));
}

module.exports = { alphaBounds };
if (require.main === module) main().catch(error => { console.error(error.message); process.exitCode = 1; });
