// Multipart/form-data so'rovni parse qiladi (fayl yuklash uchun).
// { fields: {...}, file: { originalname, mimetype, buffer } | null } qaytaradi.
import busboy from 'busboy'

export function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const ct = req.headers['content-type'] || ''
    if (!ct.includes('multipart/form-data')) return resolve({ fields: {}, file: null })
    let bb
    try {
      bb = busboy({ headers: req.headers, limits: { fileSize: 10 * 1024 * 1024, files: 1 } })
    } catch (e) { return reject(e) }
    const fields = {}
    let file = null
    let truncated = false
    bb.on('field', (name, val) => { fields[name] = val })
    bb.on('file', (_name, stream, info) => {
      const chunks = []
      stream.on('data', (d) => chunks.push(d))
      // Fayl 10MB limitidan oshsa, busboy oqimni shu yerda to'xtatadi — kesilgan
      // (to'liq bo'lmagan) buferni "muvaffaqiyatli" deb saqlab qo'ymaslik uchun
      // bayroq qo'yamiz va pastda so'rovni butunlay rad etamiz.
      stream.on('limit', () => { truncated = true })
      stream.on('end', () => {
        file = { originalname: info.filename || '', mimetype: info.mimeType || 'application/octet-stream', buffer: Buffer.concat(chunks) }
      })
    })
    bb.on('close', () => {
      if (truncated) return reject(new Error("Fayl hajmi ruxsat etilgan chegaradan (10MB) katta"))
      resolve({ fields, file })
    })
    bb.on('error', reject)
    req.pipe(bb)
  })
}
