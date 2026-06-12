// Vercel serverless funksiyasi — barcha /api/* so'rovlarini qabul qiladi.
// vercel.json orqali /api/:path* shu funksiyaga yo'naltiriladi (__path bilan).
import { handleApi } from '../server/api-core.mjs'
import { parseMultipart } from '../server/multipart.mjs'

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
    // Asl yo'lni tiklash: rewrite __path query'sida asl yo'lni uzatadi
    try {
      const u = new URL(req.url, 'http://localhost')
      const rawPath = u.searchParams.get('__path')
      if (rawPath !== null && rawPath !== undefined) {
        u.searchParams.delete('__path')
        const clean = String(rawPath).replace(/^\/+/, '')
        const qs = u.searchParams.toString()
        req.url = '/api/' + clean + (qs ? '?' + qs : '')
      } else if (req.url && !req.url.startsWith('/api/')) {
        req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url)
      }
    } catch { /* req.url o'zgarmaydi */ }

    const ct = (req.headers['content-type'] || '')
    const method = (req.method || 'GET').toUpperCase()
    if (method === 'POST' || method === 'PUT') {
      if (ct.includes('multipart/form-data')) {
        const { fields, file } = await parseMultipart(req)
        req._fields = fields
        req._file = file
      } else {
        const b = req.body
        if (Buffer.isBuffer(b)) {
          try { req._json = JSON.parse(b.toString('utf8')) } catch { req._json = {} }
        } else if (typeof b === 'string') {
          try { req._json = JSON.parse(b) } catch { req._json = {} }
        } else if (b && typeof b === 'object') {
          req._json = b
        } else {
          req._json = await readRawJson(req)
        }
      }
    }
    await handleApi(req, res)
  } catch (e) {
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ ok: false, error: e?.message || 'Server xatosi' }))
  }
}
