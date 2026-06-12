// Vercel serverless funksiyasi — barcha /api/* so'rovlarini qabul qiladi.
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
    // Vercel catch-all ba'zan /api prefiksini olib tashlashi mumkin — qayta tiklaymiz
    if (req.url && !req.url.startsWith('/api/')) {
      req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url)
    }

    const ct = (req.headers['content-type'] || '')
    const method = (req.method || 'GET').toUpperCase()
    if (method === 'POST' || method === 'PUT') {
      if (ct.includes('multipart/form-data')) {
        const { fields, file } = await parseMultipart(req)
        req._fields = fields
        req._file = file
      } else if (req.body !== undefined && req.body !== null) {
        // Vercel JSON tanani allaqachon parse qilgan bo'lishi mumkin
        if (typeof req.body === 'string') {
          try { req._json = JSON.parse(req.body) } catch { req._json = {} }
        } else if (typeof req.body === 'object') {
          req._json = req.body
        } else {
          req._json = {}
        }
      } else {
        // Aks holda xom tanani o'zimiz o'qiymiz
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
