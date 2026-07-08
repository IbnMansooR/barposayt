// ============================================================
//  BARPO — Supabase saqlash qatlami (KV JSON + fayllar)
//  Ham lokal dev, ham Vercel serverless shu modulni ishlatadi.
//  Sozlamalar: env SUPABASE_URL + SUPABASE_SERVICE_KEY
// ============================================================
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || ''

// Bucket nomlari (Supabase Storage)
const BUCKET_IMAGES = 'images'   // loyiha / naqsh / bo'lim rasmlari
const BUCKET_RESUMES = 'resumes' // HR rezyumelari

export const storeReady = !!(SUPABASE_URL && SUPABASE_SERVICE_KEY)

let _client = null
function sb() {
  if (!storeReady) throw new Error('Supabase sozlanmagan: SUPABASE_URL / SUPABASE_SERVICE_KEY yo\'q')
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  }
  return _client
}

// ---------- KV (JSON ma'lumotlar) — `kv` jadvali: key text PK, value jsonb ----------
export async function readJson(key, fallback) {
  try {
    const { data, error } = await sb().from('kv').select('value').eq('key', key).maybeSingle()
    if (error) throw error
    if (!data) return fallback
    return data.value
  } catch (e) {
    console.error('[store.readJson]', key, e?.message || e)
    return fallback
  }
}

export async function writeJson(key, value) {
  const { error } = await sb().from('kv').upsert({ key, value, updated_at: new Date().toISOString() })
  if (error) throw error
}

// kv qatorini butunlay o'chirish (masalan, muddati o'tgan sessiya/rate-limit
// hisoblagichlarini tozalash uchun) — writeJson(key, null) faqat qiymatni
// bo'shatadi, qatorni o'chirmaydi; bu esa jadvalni haqiqatan kichiklashtiradi.
export async function deleteJson(key) {
  try {
    const { error } = await sb().from('kv').delete().eq('key', key)
    if (error) throw error
  } catch (e) {
    console.error('[store.deleteJson]', key, e?.message || e)
  }
}

// Massiv qulaylik funksiyalari (eski readJsonArray/writeJsonArray o'rnida)
export async function readArray(key) {
  const v = await readJson(key, [])
  return Array.isArray(v) ? v : []
}
export async function writeArray(key, arr) {
  await writeJson(key, Array.isArray(arr) ? arr : [])
}

// ---------- Fayllar (rasm / rezyume) — Supabase Storage ----------
function bucketFor(kind) {
  return kind === 'resume' ? BUCKET_RESUMES : BUCKET_IMAGES
}
// Har qanday chaqiruvchi tekshiruvni unutgan taqdirda ham yo'l-o'zgartirish
// (path traversal) mumkin bo'lmasligi uchun saqlash qatlamining o'zida himoya.
function assertSafePathKey(pathKey) {
  const s = String(pathKey == null ? '' : pathKey)
  if (!s || s.includes('..') || s.startsWith('/') || s.includes('\\')) {
    throw new Error(`Xavfsiz bo'lmagan fayl yo'li: "${s}"`)
  }
  return s
}
function isNotFoundError(error) {
  if (!error) return false
  const code = error.statusCode ?? error.status
  if (String(code) === '404') return true
  return /not.?found/i.test(String(error.message || ''))
}

// path kaliti bo'yicha faylni yuklash (buffer + contentType qaytaradi, fayl yo'q
// bo'lsa null; lekin haqiqiy server/tarmoq xatosi yuz bersa — uni yashirmasdan
// qayta uloqtiradi, shunda API qatlami 404 o'rniga 500 qaytara oladi).
export async function getFile(kind, pathKey) {
  assertSafePathKey(pathKey)
  try {
    const { data, error } = await sb().storage.from(bucketFor(kind)).download(pathKey)
    if (error) {
      if (isNotFoundError(error)) return null
      throw error
    }
    if (!data) return null
    const buf = Buffer.from(await data.arrayBuffer())
    return { buffer: buf, contentType: data.type || 'application/octet-stream' }
  } catch (e) {
    console.error('[store.getFile]', pathKey, e?.message || e)
    if (isNotFoundError(e)) return null
    throw e
  }
}

// fayl yozish (eski mavjud bo'lsa ustiga yoziladi)
export async function putFile(kind, pathKey, buffer, contentType) {
  assertSafePathKey(pathKey)
  const { error } = await sb().storage.from(bucketFor(kind)).upload(pathKey, buffer, {
    contentType: contentType || 'application/octet-stream',
    upsert: true,
  })
  if (error) throw error
}

// prefiks bo'yicha papkadagi fayllar ro'yxati (nomlar)
export async function listFiles(kind, prefix) {
  try {
    const { data, error } = await sb().storage.from(bucketFor(kind)).list(prefix || '', { limit: 1000 })
    if (error || !data) return []
    return data.map((f) => f.name)
  } catch (e) {
    console.error('[store.listFiles]', prefix, e?.message || e)
    return []
  }
}

// bitta faylni o'chirish — muvaffaqiyat holatini qaytaradi (jim yutilmaydi)
export async function deleteFile(kind, pathKey) {
  assertSafePathKey(pathKey)
  try {
    const { error } = await sb().storage.from(bucketFor(kind)).remove([pathKey])
    if (error) { console.error('[store.deleteFile]', pathKey, error.message || error); return false }
    return true
  } catch (e) { console.error('[store.deleteFile]', pathKey, e?.message || e); return false }
}

// bir nechta faylni o'chirish — muvaffaqiyat holatini qaytaradi
export async function deleteFiles(kind, pathKeys) {
  if (!pathKeys || !pathKeys.length) return true
  pathKeys.forEach(assertSafePathKey)
  try {
    const { error } = await sb().storage.from(bucketFor(kind)).remove(pathKeys)
    if (error) { console.error('[store.deleteFiles]', pathKeys, error.message || error); return false }
    return true
  } catch (e) { console.error('[store.deleteFiles]', pathKeys, e?.message || e); return false }
}

// ---------- Rate limiter (Supabase KV orqali) ----------
// Har oyna (windowMs ms) da bitta IP dan maxCount so'rovgacha ruxsat beradi.
// Returns: true = ruxsat, false = bloklangan
//
// DIQQAT (bilib turilgan cheklov): o'qish-va-keyin-yozish operatsiyasi to'liq
// atomik emas — bir xil kalitga deyarli bir vaqtda kelgan ikkita so'rov
// nazariy jihatdan bir xil (eski) hisobni o'qib, ikkalasi ham o'tib ketishi
// mumkin. To'liq atomiklik uchun Postgres tomonida "UPDATE ... SET count =
// count + 1 RETURNING count" kabi saqlanadigan protsedura (RPC) kerak —
// bu ma'lumotlar bazasi sxemasini o'zgartirishni talab qiladi va shu sabab
// bu yerda amalga oshirilmadi. Quyidagi ichki-jarayon qulfi (bitta issiq
// Vercel funksiyasi/lokal dev-server doirasida) real amaliy foydalanish
// hajmi uchun poyga oynasini sezilarli qisqartiradi.
const _rlLocks = new Map()
async function withKeyLock(key, fn) {
  const prev = _rlLocks.get(key) || Promise.resolve()
  let release
  const next = new Promise((r) => { release = r })
  _rlLocks.set(key, prev.then(() => next))
  await prev
  try { return await fn() } finally { release(); if (_rlLocks.get(key) === next) _rlLocks.delete(key) }
}
export async function checkRateLimit(key, maxCount = 3, windowMs = 10 * 60 * 1000) {
  try {
    return await withKeyLock(key, async () => {
      const windowId = Math.floor(Date.now() / windowMs)
      const rlKey = `rl:${key}:${windowId}`
      const count = await readJson(rlKey, 0)
      if (count >= maxCount) return false
      await writeJson(rlKey, count + 1)
      // Eski (2 oyna oldingi) hisoblagichni imkon qadar tozalab boramiz —
      // shunda kv jadvali cheksiz o'sib ketmaydi.
      deleteJson(`rl:${key}:${windowId - 2}`).catch(() => {})
      return true
    })
  } catch {
    return true // DB xatosi -> o'tkazib yuboramiz
  }
}

export { BUCKET_IMAGES, BUCKET_RESUMES }
