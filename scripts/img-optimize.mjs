// Bir martalik: og'ir rasm assetlarini .webp ga siqadi (intro LCP va bulut).
// Ishga tushirish: node scripts/img-optimize.mjs
// sharp faqat devDependency — production bundle'ga kirmaydi.
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const A = path.resolve(__dirname, '../src/assets')

// [manba, natija, sifat, alpha-mi]
const jobs = [
  ['render.jpg', 'render.webp', 78, false],
  ['render-mob.jpg', 'render-mob.webp', 78, false],
  ['cloud.png', 'cloud.webp', 82, true],
]

for (const [src, out, quality, alpha] of jobs) {
  const srcPath = path.join(A, src)
  const outPath = path.join(A, out)
  if (!fs.existsSync(srcPath)) { console.log('SKIP (yo\'q):', src); continue }
  const before = fs.statSync(srcPath).size
  let pipe = sharp(srcPath)
  pipe = pipe.webp({ quality, alphaQuality: alpha ? 90 : undefined, effort: 6 })
  await pipe.toFile(outPath)
  const after = fs.statSync(outPath).size
  const pct = Math.round((1 - after / before) * 100)
  console.log(`${src} (${(before/1024).toFixed(0)}KB) -> ${out} (${(after/1024).toFixed(0)}KB)  -${pct}%`)
}
console.log('Tayyor.')
