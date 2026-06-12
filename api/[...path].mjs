// Vercel serverless funksiyasi — barcha /api/* so'rovlarini qabul qiladi.
// Multipart (fayl) ni busboy bilan, JSON ni Vercel'ning req.body si orqali oladi.
import { handleApi } from '../server/api-core.mjs'
import { parseMultipart } from '../server/multipart.mjs'

export const config = { api: { bodyParser: false } }

function readRawJson(req) {
  return new Promise((resolve) => {
    let data = ''
    req.on('data', (c) => (data += c))
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}) } catch { resolve({}) } })
    req.on('error', () => resolve({}))
  })
}

export default async function handler(req, res) {
  try {
    const ct = (req.headers['content-type'] || '')
    const method = (req.method || 'GET').toUpperCase()
    if (method === 'POST' || method === 'PUT') {
      if (ct.includes('multipart/form-data')) {
        const { fields, file } = await parseMultipart(req)
        req._fields = fields
        req._file = file
      } else {
        // JSON tanani o'qiymiz (bodyParser o'chirilgan)
        req._json = await readRawJson(req)
      }
    }
    await handleApi(req, res)
  } catch (e) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ ok: false, error: e?.message || 'Server xatosi' }))
  }
}
