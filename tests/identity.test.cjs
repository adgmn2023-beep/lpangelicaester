const fs = require('node:fs');
const assert = require('node:assert/strict');
const test = require('node:test');
const css = fs.readFileSync('src/app/globals.css', 'utf8');
const colors = Object.fromEntries([...css.matchAll(/--([\w-]+):\s*(#[\da-f]{6});/gi)].map(match => [match[1], match[2]]));
function luminance(hex) {
  const channels = hex.slice(1).match(/../g).map(value => parseInt(value, 16) / 255).map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
function contrast(a, b) { const values = [luminance(colors[a]), luminance(colors[b])].sort((x, y) => y - x); return (values[0] + 0.05) / (values[1] + 0.05); }
test('all text color pairs meet WCAG AA for normal text', () => {
  const pairs = [];
  for (const background of ['bg', 'bg-soft']) for (const foreground of ['text-on-bg', 'muted-on-bg', 'bronze-dark']) pairs.push([foreground, background]);
  for (const background of ['primary', 'rose', 'bronze-light']) pairs.push(['ink', background]);
  for (const foreground of ['bg', 'bg-soft', 'bronze-light']) pairs.push([foreground, 'ink']);
  for (const [foreground, background] of pairs) assert(contrast(foreground, background) >= 4.5, `${foreground}/${background}: ${contrast(foreground, background).toFixed(2)}:1`);
});
test('photos come from configuration and empty paths render decorative blocks', () => {
  const source = fs.readFileSync('src/app/page.tsx', 'utf8');
  assert(source.includes('photo={site.photos.hero}'));
  assert(source.includes('photo={site.photos.about}'));
  const slot = fs.readFileSync('src/components/photo-slot.tsx', 'utf8');
  assert(slot.includes('photo.src ?'));
  assert(slot.includes('aria-hidden="true"'));
});
test('brand assets have the required dimensions and preserve logo proportions', async () => {
  const sharp = require('sharp');
  for (const [file, width, height] of [['icon-512.png', 512, 512], ['apple-touch-icon.png', 180, 180], ['og.png', 1200, 630]]) {
    const info = await sharp('public/brand/' + file).metadata();
    assert.equal(info.width, width);
    assert.equal(info.height, height);
  }
  const { alphaBounds } = require('../scripts/brand-assets.cjs');
  const { bounds } = await alphaBounds('public/brand/logo-transparente.png');
  const padding = Math.round(Math.max(bounds.width, bounds.height) * 0.02);
  const optimized = await sharp('public/brand/logo.webp').metadata();
  assert(optimized.hasAlpha);
  assert(optimized.height <= 400);
  assert(Math.abs((bounds.width + padding * 2) / (bounds.height + padding * 2) - optimized.width / optimized.height) < 0.01);
  const dimensions = JSON.parse(fs.readFileSync('public/brand/dimensions.json', 'utf8'));
  assert.equal(dimensions.width, optimized.width);
  assert.equal(dimensions.height, optimized.height);
});

test('logos retain real transparency with small, uniform margins after trimming', async () => {
  const sharp = require('sharp');
  const { alphaBounds } = require('../scripts/brand-assets.cjs');
  for (const file of ['logo.png', 'logo.webp']) {
    const source = 'public/brand/' + file;
    const info = await sharp(source).metadata();
    const alpha = await alphaBounds(source);
    assert(alpha.transparent > 0);
    assert(alpha.partial > 0);
    assert.equal(info.height, 400);
    const { left, top, width, height } = alpha.bounds;
    const margins = [left, top, info.width - left - width, info.height - top - height];
    assert(Math.max(...margins) - Math.min(...margins) <= 2);
    assert(margins.every(margin => margin > 0 && margin < info.height * 0.04));
  }
});

test('brand generation rejects opaque PNGs, even with an unused alpha channel', async () => {
  const sharp = require('sharp');
  const { alphaBounds } = require('../scripts/brand-assets.cjs');
  for (const channels of [3, 4]) {
    const white = await sharp({ create: { width: 8, height: 8, channels, background: { r: 255, g: 255, b: 255, alpha: 1 } } }).png().toBuffer();
    await assert.rejects(alphaBounds(white), /canal alfa|totalmente opaco/);
  }
});

test('share image and icons use the page cream at their margins', async () => {
  const sharp = require('sharp');
  const expected = colors.bg.slice(1).match(/../g).map(value => parseInt(value, 16));
  for (const file of ['icon-512.png', 'apple-touch-icon.png', 'og.png']) {
    const pixel = await sharp('public/brand/' + file).extract({ left: 0, top: 0, width: 1, height: 1 }).removeAlpha().raw().toBuffer();
    assert.deepEqual(Array.from(pixel), expected);
  }
});

test('served photo sources fit the width and file-size limits without upscaling', async () => {
  const sharp = require('sharp');
  for (const [file, width, height] of [['hero-original.jpg', 666, 1363], ['about-original.jpg', 1086, 1448]]) {
    const source = 'public/images/' + file;
    const metadata = await sharp(source).metadata();
    assert.equal(metadata.width, width);
    assert.equal(metadata.height, height);
    assert(metadata.width <= 1600);
    assert(fs.statSync(source).size < 2_000_000);
  }
});
