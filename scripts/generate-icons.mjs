import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, getPixel) {
  // RGBA buffer with filter byte 0 at start of each scanline
  const scanlineLength = width * 4 + 1;
  const rawData = Buffer.alloc(scanlineLength * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLength;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = getPixel(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * 4;
      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // CRC32 calculation table
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const typeAndData = buf.subarray(4, 8 + len);
    buf.writeUInt32BE(crc32(typeAndData), 8 + len);
    return buf;
  }

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type RGBA
  ihdrData[10] = 0; // compression method
  ihdrData[11] = 0; // filter method
  ihdrData[12] = 0; // interlace method
  const ihdr = makeChunk('IHDR', ihdrData);

  // IDAT chunk
  const idat = makeChunk('IDAT', compressed);

  // IEND chunk
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Ensure public dir exists
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Gaming Logo: Rich dark gradient background, glowing gold & cyan game controller / dice design
function gamingPixel(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = (x - cx) / (w / 2);
  const dy = (y - cy) / (h / 2);
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Background gradient: #0d131f to #1a233a
  const bgGrad = 0.5 + 0.5 * dy;
  let r = Math.round(13 + bgGrad * 15);
  let g = Math.round(19 + bgGrad * 20);
  let b = Math.round(31 + bgGrad * 35);
  let a = 255;

  const targetRadius = isMaskable ? 0.65 : 0.82;

  // Outer glowing ring
  if (dist < targetRadius && dist > targetRadius - 0.08) {
    // Golden amber glow
    const factor = 1 - Math.abs(dist - (targetRadius - 0.04)) / 0.04;
    r = Math.min(255, Math.round(r + factor * 245));
    g = Math.min(255, Math.round(g + factor * 180));
    b = Math.min(255, Math.round(b + factor * 40));
  } else if (dist < targetRadius - 0.08) {
    // Center emblem area: deep navy-cyan
    r = 16;
    g = 24;
    b = 40;

    // Glowing 'C' / Gaming Spade & Controller crest
    const rDist = Math.sqrt(dx * dx + (dy * 1.2) * (dy * 1.2));
    if (rDist < 0.45 && rDist > 0.28 && (dx < 0.25 || dy < -0.15 || dy > 0.15)) {
      // Golden 'C' logo shape
      r = 250;
      g = 190;
      b = 40;
    } else if (rDist <= 0.22) {
      // Center cyan diamond
      if (Math.abs(dx) + Math.abs(dy) < 0.2) {
        r = 0;
        g = 210;
        b = 255;
      }
    }
  }

  return [r, g, b, a];
}

console.log('Generating PWA icons...');

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, (x, y, w, h) => gamingPixel(x, y, w, h, false)));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, (x, y, w, h) => gamingPixel(x, y, w, h, false)));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, (x, y, w, h) => gamingPixel(x, y, w, h, true)));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, (x, y, w, h) => gamingPixel(x, y, w, h, false)));

// Write icon.svg
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#050811"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fcd34d"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <linearGradient id="cyan" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="110" fill="url(#bg)"/>
  <circle cx="256" cy="256" r="210" fill="none" stroke="url(#gold)" stroke-width="14" opacity="0.85"/>
  <path d="M 330 160 A 130 130 0 1 0 330 352" fill="none" stroke="url(#gold)" stroke-width="36" stroke-linecap="round"/>
  <polygon points="256,190 300,256 256,322 212,256" fill="url(#cyan)"/>
  <circle cx="256" cy="256" r="14" fill="#ffffff"/>
  <text x="256" y="440" font-family="system-ui, sans-serif" font-size="44" font-weight="900" fill="#fcd34d" text-anchor="middle" letter-spacing="4">COMEPLAY</text>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);
console.log('Icons generated successfully in public/');
