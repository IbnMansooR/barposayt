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

// path kaliti bo'yicha faylni yuklash (buffer + contentType qaytaradi yoki null)
export async function getFile(kind, pathKey) {
  try {
    const { data, error } = await sb().storage.from(bucketFor(kind)).download(pathKey)
    if (error || !data) return null
    const buf = Buffer.from(await data.arrayBuffer())
    return { buffer: buf, contentType: data.type || 'application/octet-stream' }
  } catch (e) {
    console.error('[store.getFile]', pathKey, e?.message || e)
    return null
  }
}

// fayl yozish (eski mavjud bo'lsa ustiga yoziladi)
export async function putFile(kind, pathKey, buffer, contentType) {
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

// bitta faylni o'chirish
export async function deleteFile(kind, pathKey) {
  try { await sb().storage.from(bucketFor(kind)).remove([pathKey]) } catch (e) { console.error('[store.deleteFile]', e?.message || e) }
}

// bir nechta faylni o'chirish
export async function deleteFiles(kind, pathKeys) {
  if (!pathKeys || !pathKeys.length) return
  try { await sb().storage.from(bucketFor(kind)).remove(pathKeys) } catch (e) { console.error('[store.deleteFiles]', e?.message || e) }
}

export { BUCKET_IMAGES, BUCKET_RESUMES }
