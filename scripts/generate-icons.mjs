/**
 * generate-icons.mjs — Zero-dependency PNG icon generator.
 *
 * Generates 16×16, 48×48 and 128×128 PNG icons for the Chrome extension.
 * Uses Node's built-in `zlib.deflateSync` to compress raw pixel data,
 * so no npm packages are required.
 *
 * Design: blue rounded rectangle with a white play-button triangle.
 * Blue: #3B82F6 (Tailwind blue-500)
 * Run: node scripts/generate-icons.mjs
 */

import { deflateSync } from 'zlib'
import { writeFileSync, mkdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUT_DIR = join(__dirname, '..', 'public', 'icons')

mkdirSync(OUT_DIR, { recursive: true })

// ── PNG helpers ──────────────────────────────────────────────────────────────

function crc32(buf) {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[i] = c
  }
  let crc = 0xffffffff
  for (const byte of buf) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function pngChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii')
  const lenBuf = Buffer.alloc(4)
  lenBuf.writeUInt32BE(data.length)
  const crcBuf = Buffer.alloc(4)
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])))
  return Buffer.concat([lenBuf, typeBytes, data, crcBuf])
}

/**
 * Encode raw RGBA pixels as a valid PNG.
 * pixels: Uint8Array of length size*size*4 (R G B A, row-major)
 */
function encodePNG(size, pixels) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

  // IHDR: 8-bit RGBA (color type 6)
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8   // bit depth
  ihdr[9] = 6   // RGBA
  ihdr[10] = 0  // compression
  ihdr[11] = 0  // filter method
  ihdr[12] = 0  // interlace

  // Build filtered raw data (filter byte 0 = None per row)
  const rowBytes = 1 + size * 4
  const raw = Buffer.alloc(size * rowBytes)
  for (let y = 0; y < size; y++) {
    raw[y * rowBytes] = 0 // filter type: None
    for (let x = 0; x < size; x++) {
      const src = (y * size + x) * 4
      const dst = y * rowBytes + 1 + x * 4
      raw[dst]     = pixels[src]     // R
      raw[dst + 1] = pixels[src + 1] // G
      raw[dst + 2] = pixels[src + 2] // B
      raw[dst + 3] = pixels[src + 3] // A
    }
  }

  return Buffer.concat([
    sig,
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0)),
  ])
}

// ── Drawing utilities ────────────────────────────────────────────────────────

function setPixel(pixels, size, x, y, r, g, b, a) {
  if (x < 0 || y < 0 || x >= size || y >= size) return
  const i = (y * size + x) * 4
  // Alpha-blend over existing pixel
  const srcA = a / 255
  const dstA = pixels[i + 3] / 255
  const outA = srcA + dstA * (1 - srcA)
  if (outA === 0) return
  pixels[i]     = Math.round((r * srcA + pixels[i]     * dstA * (1 - srcA)) / outA)
  pixels[i + 1] = Math.round((g * srcA + pixels[i + 1] * dstA * (1 - srcA)) / outA)
  pixels[i + 2] = Math.round((b * srcA + pixels[i + 2] * dstA * (1 - srcA)) / outA)
  pixels[i + 3] = Math.round(outA * 255)
}

/** Anti-aliased circle fill */
function fillCircle(pixels, size, cx, cy, r, [R, G, B]) {
  for (let y = Math.floor(cy - r - 1); y <= Math.ceil(cy + r + 1); y++) {
    for (let x = Math.floor(cx - r - 1); x <= Math.ceil(cx + r + 1); x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
      const alpha = Math.max(0, Math.min(1, r - dist + 0.5))
      if (alpha > 0) setPixel(pixels, size, x, y, R, G, B, Math.round(alpha * 255))
    }
  }
}

/** Anti-aliased rounded rectangle */
function fillRoundRect(pixels, size, x1, y1, x2, y2, radius, [R, G, B, A = 255]) {
  const rr = Math.min(radius, (x2 - x1) / 2, (y2 - y1) / 2)
  for (let py = Math.floor(y1); py <= Math.ceil(y2); py++) {
    for (let px = Math.floor(x1); px <= Math.ceil(x2); px++) {
      let inside = 1.0
      // Check each corner
      const corners = [
        [x1 + rr, y1 + rr],
        [x2 - rr, y1 + rr],
        [x1 + rr, y2 - rr],
        [x2 - rr, y2 - rr],
      ]
      let inCore = px >= x1 + rr && px <= x2 - rr && py >= y1 && py <= y2
      let inVert = px >= x1 && px <= x2 && py >= y1 + rr && py <= y2 - rr
      if (!inCore && !inVert) {
        // Find nearest corner
        let minDist = Infinity
        for (const [cx, cy] of corners) {
          if (
            (px < cx && py < cy && cx === x1 + rr && cy === y1 + rr) ||
            (px > cx && py < cy && cx === x2 - rr && cy === y1 + rr) ||
            (px < cx && py > cy && cx === x1 + rr && cy === y2 - rr) ||
            (px > cx && py > cy && cx === x2 - rr && cy === y2 - rr)
          ) {
            minDist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2)
            inside = Math.max(0, Math.min(1, rr - minDist + 0.5))
            break
          }
        }
        if (minDist === Infinity) inside = 0
      }
      if (inside > 0) setPixel(pixels, size, px, py, R, G, B, Math.round(A * inside))
    }
  }
}

/** Draw a filled triangle (for the play button) */
function fillTriangle(pixels, size, x1, y1, x2, y2, x3, y3, [R, G, B]) {
  const minX = Math.floor(Math.min(x1, x2, x3)) - 1
  const maxX = Math.ceil(Math.max(x1, x2, x3)) + 1
  const minY = Math.floor(Math.min(y1, y2, y3)) - 1
  const maxY = Math.ceil(Math.max(y1, y2, y3)) + 1

  function edgeFn(ax, ay, bx, by, px, py) {
    return (bx - ax) * (py - ay) - (by - ay) * (px - ax)
  }

  const area = edgeFn(x1, y1, x2, y2, x3, y3)

  for (let py = minY; py <= maxY; py++) {
    for (let px = minX; px <= maxX; px++) {
      const w0 = edgeFn(x1, y1, x2, y2, px, py) / area
      const w1 = edgeFn(x2, y2, x3, y3, px, py) / area
      const w2 = edgeFn(x3, y3, x1, y1, px, py) / area
      const minW = Math.min(w0, w1, w2)
      const alpha = Math.max(0, Math.min(1, minW + 0.5))
      if (alpha > 0) setPixel(pixels, size, px, py, R, G, B, Math.round(alpha * 255))
    }
  }
}

// ── Icon renderer ────────────────────────────────────────────────────────────

function renderIcon(size) {
  const pixels = new Uint8Array(size * size * 4) // transparent black
  const s = size

  // Background: blue rounded rect
  fillRoundRect(pixels, s, 0, 0, s - 1, s - 1, s * 0.2, [59, 130, 246, 255])

  // White vertical bar (pause-style left bar of "record" symbol)
  const barW = Math.max(1, s * 0.085)
  const barH = s * 0.5
  const barX = s * 0.22
  const barY = s * 0.25
  fillRoundRect(pixels, s, barX, barY, barX + barW, barY + barH, barW / 2, [255, 255, 255, 255])

  // White play triangle
  const tx = s * 0.36
  const ty = s * 0.24
  const th = s * 0.52
  fillTriangle(
    pixels, s,
    tx, ty,
    tx, ty + th,
    tx + th * 0.87, ty + th / 2,
    [255, 255, 255]
  )

  return encodePNG(s, pixels)
}

// ── Generate and write ───────────────────────────────────────────────────────

for (const size of [16, 48, 128]) {
  const png = renderIcon(size)
  const out = join(OUT_DIR, `icon${size}.png`)
  writeFileSync(out, png)
  console.log(`  ✓ icons/icon${size}.png  (${png.length} bytes)`)
}

console.log('\nIcons generated in public/icons/')
