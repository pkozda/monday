#!/usr/bin/env node
/**
 * Generates favicons from assets/logo.png (icon mark) and assets/logo-dark.png.
 * Run: node scripts/generate-favicon.mjs
 */

import sharp from 'sharp'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PUBLIC = join(ROOT, 'public')
const LOGO_LIGHT = join(ROOT, 'assets/logo.png')
const LOGO_DARK = join(ROOT, 'assets/logo-dark.png')

async function findIconBounds(imagePath, bgIsLight) {
  const { data, info } = await sharp(imagePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const w = info.width
  const h = info.height
  // Icon mark only — above the wordmark
  const scanH = Math.floor(h * 0.42)
  let minX = w
  let minY = h
  let maxX = 0
  let maxY = 0

  const isBg = bgIsLight
    ? (r, g, b) => r > 250 && g > 250 && b > 250
    : (r, g, b) => r < 30 && g < 30 && b < 30

  for (let y = 0; y < scanH; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]
      const a = data[i + 3]
      if (a < 20 || isBg(r, g, b)) continue
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    }
  }

  const pad = 24
  const left = Math.max(0, minX - pad)
  const top = Math.max(0, minY - pad)
  const right = Math.min(w - 1, maxX + pad)
  const bottom = Math.min(h - 1, maxY + pad)

  return {
    left,
    top,
    width: right - left + 1,
    height: bottom - top + 1,
  }
}

async function extractIconSquare(sourcePath, bgIsLight) {
  const bounds = await findIconBounds(sourcePath, bgIsLight)
  const bg = bgIsLight ? '#ffffff' : '#121212'

  return sharp(sourcePath)
    .extract(bounds)
    .resize(512, 512, { fit: 'contain', background: bg })
    .flatten({ background: bg })
    .png()
}

async function main() {
  const lightMaster = await extractIconSquare(LOGO_LIGHT, true)
  const darkMaster = await extractIconSquare(LOGO_DARK, false)

  await lightMaster.clone().resize(32, 32).toFile(join(PUBLIC, 'favicon-32.png'))
  await lightMaster.clone().resize(16, 16).toFile(join(PUBLIC, 'favicon-16.png'))
  await lightMaster.clone().resize(180, 180).toFile(join(PUBLIC, 'apple-touch-icon.png'))
  await darkMaster.clone().resize(32, 32).toFile(join(PUBLIC, 'favicon-dark-32.png'))
  await darkMaster.clone().resize(16, 16).toFile(join(PUBLIC, 'favicon-dark-16.png'))

  // 32×32 PNG used as .ico fallback for older browsers
  await lightMaster.clone().resize(32, 32).toFile(join(PUBLIC, 'favicon.ico'))

  console.log('Wrote public/favicon-16.png')
  console.log('Wrote public/favicon-32.png')
  console.log('Wrote public/favicon-dark-16.png')
  console.log('Wrote public/favicon-dark-32.png')
  console.log('Wrote public/apple-touch-icon.png')
  console.log('Wrote public/favicon.ico')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
