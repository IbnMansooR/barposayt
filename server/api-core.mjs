// ============================================================
//  BARPO — Umumiy API yadrosi (async, Supabase saqlash bilan)
//  Ham Vite dev plugin, ham Vercel serverless shu yadroni chaqiradi.
//
//  Adapter mas'uliyati (dev yoki vercel):
//   - multipart so'rovni oldindan parse qilib req._fields va req._file ga qo'yadi
//   - keyin handleApi(req, res) ni chaqiradi
// ============================================================
import {
  readArray, writeArray, readJson, writeJson,
  getFile, putFile, listFiles, deleteFile, deleteFiles,
} from './store.mjs'

// ---------- Adminlar / ruxsatlar ----------
const ADMINS = [
  { username: 'jamshid', password: 'jamshid2026', name: 'Jamshid' },
  { username: 'admin2', password: 'admin2_2026', name: 'Admin 2' },
  { username: 'admin3', password: 'admin3_2026', name: 'Admin 3' },
  { username: 'admin4', password: 'admin4_2026', name: 'Admin 4' },
  { username: 'admin5', password: 'admin5_2026', name: 'Admin 5' },
]
const SUPERADMIN_USERNAME = 'jamshid'
const PERM_KEYS = ['projects', 'ornaments', 'offers', 'standards', 'investors', 'sections', 'stats', 'suggestions', 'hr', 'contacts', 'settings']

function defaultPerms(value = true) {
  const o = {}
  for (const k of PERM_KEYS) o[k] = value
  return o
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
function htmlEscape(v) {
  return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ---------- Adminlar (kv: 'admins') ----------
async function readAdmins() {
  let arr = await readJson('admins', null)
  if (!Array.isArray(arr)) {
    arr = ADMINS.map((a) => ({
      username: a.username, password: a.password, name: a.name,
      role: a.username === SUPERADMIN_USERNAME ? 'superadmin' : 'admin',
      perms: defaultPerms(true),
    }))
    await writeJson('admins', arr)
  }
  return arr
}
async function writeAdmins(list) { await writeJson('admins', list) }

// ---------- Audit log (kv: 'history') ----------
async function logHistory(actor, action) {
  const list = await readArray('history')
  list.unshift({ id: genId(), actor, action, time: new Date().toISOString() })
  await writeArray('history', list.slice(0, 100))
}

// ---------- Sozlamalar (kv: 'settings') ----------
function emptyTg() { return { botToken: '', chatIds: [] } }
function defaultSocials() {
  return { telegram: 'https://t.me/barpo_etamiz', instagram: 'https://www.instagram.com/barpo.official', facebook: '', youtube: '' }
}
function defaultContactInfo() {
  return { phone: '+998 (90) 123-45-67', email: 'info@barpo.uz', address: "Toshkent, Mirzo Ulug'bek tumani, A.Navoiy ko'chasi, 100-uy" }
}
async function readSettings() {
  const s = (await readJson('settings', null)) || {}
  if (!s.telegram) s.telegram = emptyTg()
  if (!s.telegramByType) s.telegramByType = { hr: emptyTg(), suggestion: emptyTg(), contact: emptyTg() }
  for (const k of ['hr', 'suggestion', 'contact']) if (!s.telegramByType[k]) s.telegramByType[k] = emptyTg()
  if (!s.socials) s.socials = defaultSocials()
  if (!s.contactInfo) s.contactInfo = defaultContactInfo()
  return s
}
async function writeSettings(s) { await writeJson('settings', s) }

// ---------- Telegram ----------
function tgConfigForType(s, type) {
  const general = s.telegram || {}
  const byType = (s.telegramByType || {})[type] || {}
  const token = String(byType.botToken || '').trim() || String(general.botToken || '').trim()
  const ownIds = (byType.chatIds || []).map((x) => String(x).trim()).filter(Boolean)
  const generalIds = (general.chatIds || []).map((x) => String(x).trim()).filter(Boolean)
  const chatIds = ownIds.length ? ownIds : generalIds
  return { token, chatIds }
}
async function sendTelegram(text, type = 'general') {
  const results = []
  try {
    const s = await readSettings()
    const { token, chatIds } = type === 'general' ? tgConfigForType(s, '__none__') : tgConfigForType(s, type)
    if (!token || !chatIds.length) return results
    for (const chatId of chatIds) {
      try {
        const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
        })
        const j = await r.json().catch(() => ({}))
        if (j.ok) results.push({ chatId, ok: true })
        else results.push({ chatId, ok: false, error: j.description || `HTTP ${r.status}` })
      } catch (e) { results.push({ chatId, ok: false, error: e?.message || 'tarmoq xatosi' }) }
    }
  } catch (e) { console.error('[telegram]', e?.message || e) }
  return results
}
async function sendTelegramDocument(buffer, filename, caption, type = 'general') {
  try {
    const s = await readSettings()
    const { token, chatIds } = tgConfigForType(s, type)
    if (!token || !chatIds.length || !buffer) return
    for (const chatId of chatIds) {
      const fd = new FormData()
      fd.append('chat_id', chatId)
      if (caption) fd.append('caption', caption)
      fd.append('document', new Blob([buffer]), filename || 'rezyume')
      await fetch(`https://api.telegram.org/bot${token}/sendDocument`, { method: 'POST', body: fd })
    }
  } catch (e) { console.error('[telegram doc]', e?.message || e) }
}
async function notifyNew(type, titleUz, record) {
  const tgLines = Object.entries(record).map(([k, v]) => `<b>${htmlEscape(k)}:</b> ${htmlEscape(v)}`).join('\n')
  await sendTelegram(`🔔 <b>BARPO — yangi ${htmlEscape(titleUz)}</b>\n\n${tgLines}`, type)
}

// ---------- Seed (dastlabki kontent) ----------
async function ensureOrnaments() {
  const cur = await readJson('ornaments', null)
  if (Array.isArray(cur)) return
  const defaults = [
    { old: 'Girih naqshi', new: '', desc: 'Geometrik aniqlik qadimdan ham, bugun ham asosiy qoida' },
    { old: 'Zanjira naqshi', new: '', desc: "Har bir detal va bosqich bir-biriga bog'langan" },
    { old: 'Turunj (markaz)', new: '', desc: 'Hammaning markaz atrofida tartibiy harakatlari' },
    { old: 'Koshin (plitkalar)', new: '', desc: 'Material integratsiyasi va chidamlilik' },
  ].map((o) => ({ id: genId(), old: o.old, new: o.new, desc: o.desc, history: '', hasImage: false, active: true, createdAt: new Date().toISOString() }))
  await writeJson('ornaments', defaults)
}
async function ensureStandards() {
  const cur = await readJson('standards', null)
  if (Array.isArray(cur)) return
  const defaults = [
    { title: 'Tizim', desc: 'Har bir obyekt tartibli boshqaruv asosida yuritiladi: GPR, ish grafigi, moliyaviy reja, resurslar jadvali, texnika grafigi va kunlik nazorat' },
    { title: 'Sifat', desc: 'Sifat faqat yakunda tekshirilmaydi. U har kuni, har bosqichda, har ish turida nazorat qilinadi' },
    { title: 'Nazorat', desc: "Obyektda nima bo'layotgani ko'rinib turishi kerak: kim ishlayapti, nima bajarildi, qancha bajarildi, qaysi bosqichda muammo bor" },
    { title: "Mas'uliyat", desc: "Biz qarorlarimiz, ishimiz va natijamiz uchun javob beramiz. Obyekt biz uchun topshirilguncha emas, to'g'ri ishlaguncha muhim" },
    { title: 'Shaffoflik', desc: "Investor uchun xarajatlar, jarayonlar va qarorlar tushunarli bo'lishi kerak. Qurilishda noaniqlik — xavf. Shaffoflik — boshqaruv" },
    { title: 'Xotirjamlik', desc: "Mijoz har kuni obyekt ortidan yugurmasligi kerak. Tizim to'g'ri ishlasa, investor strategik qarorlar bilan shug'ullanadi, jarayon esa nazorat ostida bo'ladi." },
    { title: 'Innovatsion yondashuv', desc: 'Biz zamonaviy boshqaruv, muhandislik yechimlari va raqamli nazorat vositalarini qurilish jarayoniga kiritamiz' },
    { title: 'Iqtisodiy samaradorlik', desc: "To'g'ri qurilish — bu faqat arzon qilish emas. To'g'ri qurilish — keraksiz xarajatlarni oldini olish, resursni oqilona ishlatish va investitsiyani himoya qilish" },
  ].map((s) => ({ id: genId(), title: s.title, desc: s.desc, active: true, createdAt: new Date().toISOString() }))
  await writeJson('standards', defaults)
}
async function ensureInvestors() {
  const cur = await readJson('investors', null)
  if (Array.isArray(cur)) return
  await writeJson('investors', [])
}

// ---------- Statistika (saqlanmaydi, faqat default — hero faktlar bilan almashtirilgan) ----------
const DEFAULT_STATS = [
  { value: '10+', label: 'Yillik tajriba' },
  { value: '50+', label: 'Loyihalar yakunlandi' },
  { value: '100%', label: 'Mijozlar mamnunligi' },
]
async function readStats() {
  const arr = await readJson('stats', null)
  const a = Array.isArray(arr) ? arr : []
  return [0, 1, 2].map((i) => ({
    value: (a[i] && typeof a[i].value === 'string') ? a[i].value : DEFAULT_STATS[i].value,
    label: (a[i] && typeof a[i].label === 'string') ? a[i].label : DEFAULT_STATS[i].label,
  }))
}

// ---------- HR (kv: 'hr', resume fayllari resumes bucket: <id>/rezyume.<ext>) ----------
async function readHrApplications() {
  const arr = await readArray('hr')
  return arr.slice().sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)))
}

// ---------- Rasm yo'lini topish ----------
function extFromName(name) {
  const m = String(name || '').match(/\.([a-z0-9]+)$/i)
  return m ? '.' + m[1].toLowerCase() : ''
}
function mimeFromExt(ext) {
  ext = String(ext || '').toLowerCase()
  if (ext === '.png') return 'image/png'
  if (ext === '.webp') return 'image/webp'
  if (ext === '.gif') return 'image/gif'
  return 'image/jpeg'
}
async function findImagePath(folder, id) {
  const names = await listFiles('image', folder)
  const match = names.find((n) => n.startsWith(id + '.'))
  return match ? `${folder}/${match}` : null
}

// ============================================================
//  ASOSIY HANDLER
// ============================================================

// JSON tana o'qish (adapter req._json bergan bo'lsa o'shani oladi)
async function getJson(req) {
  if (req._json !== undefined) return req._json || {}
  return await new Promise((resolve) => {
    let data = ''
    req.on('data', (c) => (data += c))
    req.on('end', () => { try { resolve(data ? JSON.parse(data) : {}) } catch { resolve({}) } })
    req.on('error', () => resolve({}))
  })
}
const fields = (req) => req._fields || {}
const file = (req) => req._file || null

export async function handleApi(req, res) {
  const url = new URL(req.url, 'http://localhost')
  const p = url.pathname
  const method = (req.method || 'GET').toUpperCase()
  const q = url.searchParams

  const json = (code, obj) => {
    res.statusCode = code
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify(obj))
  }
  const binary = (mime, buf) => {
    res.statusCode = 200
    res.setHeader('Content-Type', mime)
    res.setHeader('Cache-Control', 'no-cache')
    res.end(buf)
  }
  const notFound = () => { res.statusCode = 404; res.end('Not found') }

  // Auth yordamchilari
  const getAdmin = async () => {
    const username = q.get('username'); const password = q.get('password')
    return (await readAdmins()).find((a) => a.username === username && a.password === password) || null
  }
  const requireAdmin = async () => {
    const a = await getAdmin()
    if (!a) { json(401, { ok: false, error: "Ruxsat yo'q — login yoki parol noto'g'ri" }); return null }
    return a
  }
  const requirePerm = async (key) => {
    const a = await requireAdmin(); if (!a) return null
    if (a.role === 'superadmin') return a
    if (a.perms && a.perms[key] === false) { json(403, { ok: false, error: "Sizda bu bo'lim uchun ruxsat yo'q" }); return null }
    return a
  }
  const requireSuper = async () => {
    const a = await requireAdmin(); if (!a) return null
    if (a.role !== 'superadmin') { json(403, { ok: false, error: 'Bu amal faqat bosh admin uchun' }); return null }
    return a
  }

  try {
    // ===== VAQTINCHALIK: env tekshiruvi (diagnostika, keyin olib tashlanadi) =====
    if (p === '/api/_envcheck' && method === 'GET') {
      const eurl = process.env.SUPABASE_URL || ''
      const ekey = process.env.SUPABASE_SERVICE_KEY || ''
      return json(200, {
        ok: true,
        urlSet: !!eurl, urlLen: eurl.length, urlPreview: eurl.slice(0, 34),
        keySet: !!ekey, keyLen: ekey.length, keyHead: ekey.slice(0, 12), keyTail: ekey.slice(-6),
        keyHasSpaceOrQuote: /[\s"']/.test(ekey),
        expectedKeyLen: 41, expectedHead: 'sb_secret_ki', expectedTail: 'aNBKOu',
      })
    }

    // ===== Ommaviy GET'lar =====
    if (p === '/api/offers' && method === 'GET') {
      const offers = (await readArray('offers')).filter((o) => o.active !== false)
      return json(200, { ok: true, offers })
    }
    if (p === '/api/standards' && method === 'GET') {
      await ensureStandards()
      return json(200, { ok: true, standards: (await readArray('standards')).filter((s) => s.active !== false) })
    }
    if (p === '/api/investors' && method === 'GET') {
      await ensureInvestors()
      return json(200, { ok: true, investors: (await readArray('investors')).filter((x) => x.active !== false) })
    }
    if (p === '/api/ornaments' && method === 'GET') {
      await ensureOrnaments()
      return json(200, { ok: true, ornaments: (await readArray('ornaments')).filter((o) => o.active !== false) })
    }
    if (p === '/api/stats' && method === 'GET') {
      return json(200, { ok: true, stats: await readStats() })
    }
    if (p === '/api/socials' && method === 'GET') {
      const s = await readSettings()
      return json(200, { ok: true, socials: s.socials || {}, contact: s.contactInfo || {} })
    }
    if (p === '/api/projects' && method === 'GET') {
      const id = q.get('id')
      const all = await readArray('projects')
      if (id) {
        const project = all.find((x) => x.id === id && x.active !== false)
        if (!project) return json(404, { ok: false, error: 'Loyiha topilmadi' })
        return json(200, { ok: true, project })
      }
      return json(200, { ok: true, projects: all.filter((x) => x.active !== false) })
    }

    // ===== Rasm berish =====
    if (p === '/api/project-image' && method === 'GET') {
      const id = q.get('id') || ''
      if (!id || /[\/\\]/.test(id) || id.includes('..')) { res.statusCode = 400; return res.end('Bad request') }
      const fp = await findImagePath('project', id); if (!fp) return notFound()
      const f = await getFile('image', fp); if (!f) return notFound()
      return binary(f.contentType || mimeFromExt(extFromName(fp)), f.buffer)
    }
    if (p === '/api/ornament-image' && method === 'GET') {
      const id = q.get('id') || ''
      if (!id || /[\/\\]/.test(id) || id.includes('..')) { res.statusCode = 400; return res.end('Bad request') }
      const fp = await findImagePath('ornament', id); if (!fp) return notFound()
      const f = await getFile('image', fp); if (!f) return notFound()
      return binary(f.contentType || mimeFromExt(extFromName(fp)), f.buffer)
    }
    if (p === '/api/section-images' && method === 'GET') {
      const names = await listFiles('image', 'section')
      const images = {}
      for (const n of names) { const key = n.replace(/\.[^.]+$/, ''); images[key] = 1 }
      return json(200, { ok: true, images })
    }
    if (p === '/api/section-image' && method === 'GET') {
      const key = q.get('key') || ''
      if (!/^[a-z0-9-]+$/.test(key)) { res.statusCode = 400; return res.end('Bad request') }
      const fp = await findImagePath('section', key); if (!fp) return notFound()
      const f = await getFile('image', fp); if (!f) return notFound()
      return binary(f.contentType || mimeFromExt(extFromName(fp)), f.buffer)
    }

    // ===== Ommaviy POST'lar (forma) =====
    if (p === '/api/suggestions' && method === 'POST') {
      const body = await getJson(req)
      if (!body.subject || !String(body.subject).trim() || !body.message || !String(body.message).trim())
        return json(400, { ok: false, error: 'Mavzu va xabar majburiy' })
      const list = await readArray('suggestions')
      const rec = { id: genId(), fullName: body.fullName || '', phone: body.phone || '', category: body.category || '', subject: body.subject, message: body.message, submittedAt: new Date().toISOString() }
      list.unshift(rec); await writeArray('suggestions', list)
      await notifyNew('suggestion', 'taklif', { 'Mavzu': rec.subject, "Yo'nalish": rec.category, 'Xabar': rec.message, 'Ism': rec.fullName, 'Telefon': rec.phone, 'Sana': rec.submittedAt })
      return json(200, { ok: true })
    }
    if (p === '/api/contact' && method === 'POST') {
      const body = await getJson(req)
      if (!body.fullName || !String(body.fullName).trim() || !body.phone || !String(body.phone).trim())
        return json(400, { ok: false, error: 'Ism va telefon majburiy' })
      const list = await readArray('contacts')
      const rec = { id: genId(), fullName: body.fullName, phone: body.phone, email: body.email || '', company: body.company || '', message: body.message || '', submittedAt: new Date().toISOString() }
      list.unshift(rec); await writeArray('contacts', list)
      await notifyNew('contact', "aloqa so'rovi", { 'Ism': rec.fullName, 'Telefon': rec.phone, 'Email': rec.email, 'Kompaniya': rec.company, 'Xabar': rec.message, 'Sana': rec.submittedAt })
      return json(200, { ok: true })
    }
    if (p === '/api/apply' && method === 'POST') {
      const body = fields(req)
      for (const key of ['fullName', 'field', 'phone'])
        if (!body[key] || !String(body[key]).trim()) return json(400, { ok: false, error: `Majburiy maydon to'ldirilmagan: ${key}` })
      const id = genId()
      const safeName = String(body.fullName).trim().replace(/[^\p{L}\p{N}]+/gu, '_').slice(0, 60) || 'nomalum'
      const f = file(req)
      const rec = {
        id, folder: id, fullName: body.fullName, field: body.field,
        experienceYears: body.experienceYears || '', phone: body.phone, email: body.email || '',
        contact: body.contact || '', status: 'pending', submittedAt: new Date().toISOString(),
        resumeFile: null,
      }
      if (f && f.buffer) {
        const ext = extFromName(f.originalname) || ''
        const resumeName = `rezyume${ext}`
        await putFile('resume', `${id}/${resumeName}`, f.buffer, f.mimetype)
        rec.resumeFile = resumeName
      }
      const list = await readArray('hr'); list.unshift(rec); await writeArray('hr', list)
      await notifyNew('hr', 'HR arizasi', {
        'Ism-sharif': rec.fullName, 'Soha': rec.field, 'Tajriba (yil)': rec.experienceYears,
        'Telefon': rec.phone, 'Email': rec.email, 'Aloqa': rec.contact,
        'Rezyume': rec.resumeFile ? 'bor' : "yo'q", 'Sana': rec.submittedAt,
      })
      if (f && f.buffer) {
        const ext = extFromName(f.originalname) || ''
        await sendTelegramDocument(f.buffer, `${safeName}_rezyume${ext}`, `📄 Rezyume — ${rec.fullName} (${rec.field})`, 'hr')
      }
      return json(200, { ok: true })
    }

    // ===== ADMIN: login =====
    if (p === '/api/admin/login' && method === 'POST') {
      const body = await getJson(req)
      const admin = (await readAdmins()).find((a) => a.username === body.username && a.password === body.password)
      if (!admin) return json(401, { ok: false, error: "Login yoki parol noto'g'ri" })
      await logHistory(admin.name, 'tizimga kirdi')
      return json(200, { ok: true, name: admin.name, username: admin.username, role: admin.role || 'admin' })
    }

    // ===== ADMIN: barcha ma'lumot =====
    if (p === '/api/admin/data' && method === 'GET') {
      const admin = await requireAdmin(); if (!admin) return
      await ensureOrnaments(); await ensureStandards(); await ensureInvestors()
      const isSuper = admin.role === 'superadmin'
      let tasks = await readArray('tasks')
      if (!isSuper) tasks = tasks.filter((t) => t.assignee === admin.username)
      return json(200, {
        ok: true,
        data: {
          hr: await readHrApplications(),
          offers: await readArray('offers'),
          suggestions: await readArray('suggestions'),
          contacts: await readArray('contacts'),
          projects: await readArray('projects'),
          ornaments: await readArray('ornaments'),
          standards: await readArray('standards'),
          investors: await readArray('investors'),
          history: (await readArray('history')).slice(0, 10),
          tasks,
          me: { username: admin.username, name: admin.name, role: admin.role || 'admin', perms: isSuper ? defaultPerms(true) : (admin.perms || defaultPerms(true)) },
          admins: isSuper ? await readAdmins() : undefined,
        },
      })
    }

    // ===== ADMIN: sozlamalar =====
    if (p === '/api/admin/settings') {
      if (method === 'GET') { if (!(await requirePerm('settings'))) return; return json(200, { ok: true, settings: await readSettings() }) }
      if (method === 'POST') {
        const admin = await requirePerm('settings'); if (!admin) return
        const body = await getJson(req); const cur = await readSettings()
        const cleanList = (v, fb) => Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : (fb || [])
        const curBT = cur.telegramByType || {}; const bodyBT = body.telegramByType || {}
        const next = {
          ...cur,
          telegram: { botToken: body.telegram && body.telegram.botToken != null ? String(body.telegram.botToken).trim() : ((cur.telegram || {}).botToken || ''), chatIds: cleanList(body.telegram && body.telegram.chatIds, (cur.telegram || {}).chatIds) },
          telegramByType: (() => { const out = {}; for (const k of ['hr', 'suggestion', 'contact']) { const c = curBT[k] || {}; const b = bodyBT[k] || {}; out[k] = { botToken: b.botToken != null ? String(b.botToken).trim() : (c.botToken || ''), chatIds: cleanList(b.chatIds, c.chatIds) } } return out })(),
          socials: (() => { const cS = cur.socials || {}; const bS = body.socials || {}; const out = {}; for (const k of ['telegram', 'instagram', 'facebook', 'youtube']) out[k] = bS[k] != null ? String(bS[k]).trim() : (cS[k] || ''); return out })(),
          contactInfo: (() => { const cC = cur.contactInfo || {}; const bC = body.contactInfo || {}; const out = {}; for (const k of ['phone', 'email', 'address']) out[k] = bC[k] != null ? String(bC[k]).trim() : (cC[k] || ''); return out })(),
        }
        await writeSettings(next); await logHistory(admin.name, 'sozlamalarni yangiladi')
        return json(200, { ok: true, settings: next })
      }
      return json(405, { ok: false, error: 'Method Not Allowed' })
    }
    if (p === '/api/admin/test-telegram' && method === 'POST') {
      const admin = await requirePerm('settings'); if (!admin) return
      const type = q.get('type') || 'general'
      const s = await readSettings()
      const cfg = type === 'general' ? tgConfigForType(s, '__none__') : tgConfigForType(s, type)
      if (!cfg.token) return json(400, { ok: false, error: 'Bot token kiritilmagan' })
      if (!cfg.chatIds.length) return json(400, { ok: false, error: 'Chat ID kiritilmagan' })
      const labels = { general: 'Umumiy', hr: 'HR arizalari', suggestion: 'Kelgan takliflar', contact: "Aloqa so'rovlari" }
      const results = await sendTelegram(`✅ <b>BARPO — test xabar (${labels[type] || type})</b>\nTelegram bildirishnomalar to'g'ri ishlayapti.`, type)
      const failed = results.filter((r) => !r.ok)
      if (failed.length) return json(400, { ok: false, error: failed.map((f) => `${f.chatId}: ${f.error}`).join(' | ') })
      return json(200, { ok: true })
    }

    // ===== SUPERADMIN: adminlar =====
    if (p === '/api/admin/admins') {
      const admin = await requireSuper(); if (!admin) return
      let admins = await readAdmins()
      if (method === 'GET') return json(200, { ok: true, admins })
      if (method !== 'POST') return json(405, { ok: false, error: 'Method Not Allowed' })
      const body = await getJson(req); const action = body.action
      if (action === 'create') {
        const username = String(body.username || '').trim(); const password = String(body.password || '').trim()
        const name = String(body.name || '').trim() || username
        if (!username || !password) return json(400, { ok: false, error: 'Login va parol majburiy' })
        if (admins.some((a) => a.username === username)) return json(400, { ok: false, error: 'Bu login band' })
        const perms = {}; for (const k of PERM_KEYS) perms[k] = body.perms && body.perms[k] === false ? false : true
        admins.push({ username, password, name, role: 'admin', perms })
        await logHistory(admin.name, `yangi admin qo'shdi: "${name}" (${username})`)
      } else if (action === 'update') {
        const target = admins.find((a) => a.username === body.username)
        if (!target) return json(404, { ok: false, error: 'Admin topilmadi' })
        if (target.username === admin.username && body.role && body.role !== 'superadmin') return json(400, { ok: false, error: "O'z superadmin rolingizni o'zgartira olmaysiz" })
        if (body.newUsername && String(body.newUsername).trim() && body.newUsername !== target.username) {
          const nu = String(body.newUsername).trim()
          if (admins.some((a) => a.username === nu)) return json(400, { ok: false, error: 'Bu login band' })
          target.username = nu
        }
        if (body.password && String(body.password).trim()) target.password = String(body.password).trim()
        if (body.name && String(body.name).trim()) target.name = String(body.name).trim()
        if (body.role && target.username !== admin.username) target.role = body.role === 'superadmin' ? 'superadmin' : 'admin'
        if (body.perms && typeof body.perms === 'object') { const perms = {}; for (const k of PERM_KEYS) perms[k] = body.perms[k] === false ? false : true; target.perms = perms }
        await logHistory(admin.name, `adminni tahrirladi: "${target.name}" (${target.username})`)
      } else if (action === 'delete') {
        const target = admins.find((a) => a.username === body.username)
        if (!target) return json(404, { ok: false, error: 'Admin topilmadi' })
        if (target.username === admin.username) return json(400, { ok: false, error: "O'zingizni o'chira olmaysiz" })
        admins = admins.filter((a) => a.username !== body.username)
        await logHistory(admin.name, `adminni o'chirdi: "${target.name}" (${target.username})`)
      } else return json(400, { ok: false, error: "Noma'lum amal" })
      await writeAdmins(admins)
      return json(200, { ok: true, admins })
    }

    // ===== Topshiriqlar =====
    if (p === '/api/admin/tasks') {
      const admin = await requireAdmin(); if (!admin) return
      if (method === 'GET') {
        let tasks = await readArray('tasks')
        if (admin.role !== 'superadmin') tasks = tasks.filter((t) => t.assignee === admin.username)
        return json(200, { ok: true, tasks })
      }
      if (method !== 'POST') return json(405, { ok: false, error: 'Method Not Allowed' })
      const body = await getJson(req); const action = body.action
      let tasks = await readArray('tasks')
      if (action === 'create') {
        if (admin.role !== 'superadmin') return json(403, { ok: false, error: 'Topshiriqni faqat bosh admin beradi' })
        const title = String(body.title || '').trim(); if (!title) return json(400, { ok: false, error: 'Topshiriq matni majburiy' })
        tasks.unshift({ id: genId(), title, desc: String(body.desc || ''), assignee: String(body.assignee || ''), status: 'pending', createdBy: admin.username, createdAt: new Date().toISOString(), doneAt: null })
        await logHistory(admin.name, `topshiriq berdi (${body.assignee}): "${title}"`)
      } else if (action === 'done' || action === 'undone') {
        const t = tasks.find((x) => x.id === body.id); if (!t) return json(404, { ok: false, error: 'Topshiriq topilmadi' })
        if (admin.role !== 'superadmin' && t.assignee !== admin.username) return json(403, { ok: false, error: 'Bu topshiriq sizga tegishli emas' })
        t.status = action === 'done' ? 'done' : 'pending'; t.doneAt = action === 'done' ? new Date().toISOString() : null
        await logHistory(admin.name, `topshiriqni ${action === 'done' ? 'bajardi' : 'qayta ochdi'}: "${t.title}"`)
      } else if (action === 'delete') {
        if (admin.role !== 'superadmin') return json(403, { ok: false, error: "Faqat bosh admin o'chira oladi" })
        const t = tasks.find((x) => x.id === body.id); tasks = tasks.filter((x) => x.id !== body.id)
        await logHistory(admin.name, `topshiriqni o'chirdi: "${t ? t.title : ''}"`)
      } else return json(400, { ok: false, error: "Noma'lum amal" })
      await writeArray('tasks', tasks)
      let out = tasks; if (admin.role !== 'superadmin') out = tasks.filter((t) => t.assignee === admin.username)
      return json(200, { ok: true, tasks: out })
    }

    // ===== HR holatini o'zgartirish =====
    if (p === '/api/admin/hr-status' && method === 'POST') {
      const admin = await requirePerm('hr'); if (!admin) return
      const body = await getJson(req)
      const folder = String(body.folder || ''); const status = String(body.status || '')
      if (!['accepted', 'rejected', 'pending'].includes(status)) return json(400, { ok: false, error: "Noto'g'ri holat" })
      const list = await readArray('hr'); const rec = list.find((x) => (x.folder || x.id) === folder)
      if (!rec) return json(404, { ok: false, error: 'Ariza topilmadi' })
      rec.status = status; rec.statusBy = admin.name; rec.statusAt = new Date().toISOString()
      await writeArray('hr', list)
      if (rec.email && (status === 'accepted' || status === 'rejected')) {
        // email o'chirilgan — bildirishnoma yuborilmaydi
      }
      await logHistory(admin.name, `HR arizasini ${status === 'accepted' ? 'qabul qildi' : status === 'rejected' ? 'rad etdi' : 'kutishga qaytardi'}: "${rec.fullName}"`)
      return json(200, { ok: true })
    }
    if (p === '/api/admin/hr-delete' && method === 'POST') {
      const admin = await requirePerm('hr'); if (!admin) return
      const body = await getJson(req); const folder = String(body.folder || '')
      if (!folder) return json(400, { ok: false, error: "Noto'g'ri yo'l" })
      const list = await readArray('hr'); const rec = list.find((x) => (x.folder || x.id) === folder)
      if (!rec) return json(404, { ok: false, error: 'Ariza topilmadi' })
      const names = await listFiles('resume', folder)
      await deleteFiles('resume', names.map((n) => `${folder}/${n}`))
      await writeArray('hr', list.filter((x) => (x.folder || x.id) !== folder))
      await logHistory(admin.name, `HR arizasini o'chirdi: "${rec.fullName}"`)
      return json(200, { ok: true })
    }
    if (p === '/api/admin/resume' && method === 'GET') {
      if (!(await requirePerm('hr'))) return
      const folder = q.get('folder') || ''; const fileName = q.get('file') || ''
      if (folder.includes('..') || fileName.includes('..') || /[\/\\]/.test(folder)) return json(400, { ok: false, error: "Noto'g'ri yo'l" })
      const f = await getFile('resume', `${folder}/${fileName}`)
      if (!f) return json(404, { ok: false, error: 'Fayl topilmadi' })
      const ext = extFromName(fileName)
      const mime = ext === '.pdf' ? 'application/pdf' : ext === '.doc' ? 'application/msword' : ext === '.docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'application/octet-stream'
      return binary(mime, f.buffer)
    }

    // ===== CSV eksport =====
    if (p === '/api/admin/export' && method === 'GET') {
      const type = q.get('type')
      const permKey = type === 'hr' ? 'hr' : type === 'contacts' ? 'contacts' : 'suggestions'
      if (!(await requirePerm(permKey))) return
      const cell = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'
      const toCsv = (headers, rows) => '﻿' + [headers.map(cell).join(','), ...rows.map((r) => r.map(cell).join(','))].join('\r\n')
      let csv = '', fname = 'export.csv'
      if (type === 'suggestions') { const rows = (await readArray('suggestions')).map((s) => [s.submittedAt, s.subject, s.category, s.message, s.fullName, s.phone]); csv = toCsv(['Sana', 'Mavzu', "Yo'nalish", 'Xabar', 'Ism', 'Telefon'], rows); fname = 'kelgan-takliflar.csv' }
      else if (type === 'contacts') { const rows = (await readArray('contacts')).map((s) => [s.submittedAt, s.fullName, s.phone, s.company, s.message]); csv = toCsv(['Sana', 'Ism', 'Telefon', 'Kompaniya', 'Xabar'], rows); fname = 'murojaatlar.csv' }
      else if (type === 'hr') { const rows = (await readHrApplications()).map((s) => [s.submittedAt, s.fullName, s.field, s.experienceYears, s.phone, s.email || '', s.contact, s.status || 'pending', s.resumeFile ? 'bor' : "yo'q"]); csv = toCsv(['Sana', 'Ism', 'Soha', 'Tajriba', 'Telefon', 'Email', 'Aloqa', 'Holat', 'Rezyume'], rows); fname = 'hr-arizalar.csv' }
      else return json(400, { ok: false, error: "Noma'lum tur" })
      res.statusCode = 200
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="${fname}"`)
      return res.end(csv)
    }

    // ===== ADMIN: standartlar / investorlar / offers / delete =====
    if (p === '/api/admin/standards' && method === 'POST') {
      const admin = await requirePerm('standards'); if (!admin) return
      await ensureStandards(); const body = await getJson(req); const action = body.action
      let items = await readArray('standards')
      if (action === 'create') { items.unshift({ id: genId(), title: body.title || 'Nomsiz', desc: body.desc || '', active: true, createdAt: new Date().toISOString() }); await logHistory(admin.name, `yangi standart qo'shdi: "${body.title || ''}"`) }
      else if (action === 'update') { items = items.map((s) => s.id === body.id ? { ...s, title: body.title, desc: body.desc } : s); await logHistory(admin.name, `standartni tahrirladi: "${body.title || ''}"`) }
      else if (action === 'toggle') { let st = true; items = items.map((s) => { if (s.id === body.id) { st = !(s.active !== false); return { ...s, active: st } } return s }); const it = items.find((s) => s.id === body.id); await logHistory(admin.name, `standartni ${st ? "ko'rsatdi" : 'yashirdi'}: "${it ? it.title : ''}"`) }
      else if (action === 'delete') { const it = items.find((s) => s.id === body.id); items = items.filter((s) => s.id !== body.id); await logHistory(admin.name, `standartni o'chirdi: "${it ? it.title : ''}"`) }
      else return json(400, { ok: false, error: "Noma'lum amal" })
      await writeArray('standards', items); return json(200, { ok: true, standards: items })
    }
    if (p === '/api/admin/investors' && method === 'POST') {
      const admin = await requirePerm('investors'); if (!admin) return
      await ensureInvestors(); const body = await getJson(req); const action = body.action
      let items = await readArray('investors')
      if (action === 'create') { items.unshift({ id: genId(), title: body.title || 'Nomsiz', text: body.text || '', key: body.key || '', active: true, createdAt: new Date().toISOString() }); await logHistory(admin.name, `yangi investor bo'limi qo'shdi: "${body.title || ''}"`) }
      else if (action === 'update') { items = items.map((s) => s.id === body.id ? { ...s, title: body.title, text: body.text, key: body.key } : s); await logHistory(admin.name, `investor bo'limini tahrirladi: "${body.title || ''}"`) }
      else if (action === 'toggle') { let st = true; items = items.map((s) => { if (s.id === body.id) { st = !(s.active !== false); return { ...s, active: st } } return s }); const it = items.find((s) => s.id === body.id); await logHistory(admin.name, `investor bo'limini ${st ? "ko'rsatdi" : 'yashirdi'}: "${it ? it.title : ''}"`) }
      else if (action === 'delete') { const it = items.find((s) => s.id === body.id); items = items.filter((s) => s.id !== body.id); await logHistory(admin.name, `investor bo'limini o'chirdi: "${it ? it.title : ''}"`) }
      else return json(400, { ok: false, error: "Noma'lum amal" })
      await writeArray('investors', items); return json(200, { ok: true, investors: items })
    }
    if (p === '/api/admin/offers' && method === 'POST') {
      const admin = await requirePerm('offers'); if (!admin) return
      const body = await getJson(req); const action = body.action
      let offers = await readArray('offers')
      if (action === 'create') { offers.unshift({ id: genId(), title: body.title || 'Nomsiz taklif', description: body.description || '', tag: body.tag || '', active: true, createdAt: new Date().toISOString() }); await logHistory(admin.name, `yangi taklif qo'shdi: "${body.title || ''}"`) }
      else if (action === 'update') { offers = offers.map((o) => o.id === body.id ? { ...o, title: body.title, description: body.description, tag: body.tag } : o); await logHistory(admin.name, `taklifni tahrirladi: "${body.title}"`) }
      else if (action === 'toggle') { let st = true; offers = offers.map((o) => { if (o.id === body.id) { st = !o.active; return { ...o, active: st } } return o }); const of = offers.find((o) => o.id === body.id); await logHistory(admin.name, `taklifni ${st ? "ko'rsatdi" : 'yashirdi'}: "${of?.title || ''}"`) }
      else if (action === 'delete') { const of = offers.find((o) => o.id === body.id); offers = offers.filter((o) => o.id !== body.id); await logHistory(admin.name, `taklifni o'chirdi: "${of?.title || ''}"`) }
      else return json(400, { ok: false, error: "Noma'lum amal" })
      await writeArray('offers', offers); return json(200, { ok: true, offers })
    }
    if (p === '/api/admin/delete' && method === 'POST') {
      const body = await getJson(req)
      const admin = await requirePerm(body.type === 'contact' ? 'contacts' : 'suggestions'); if (!admin) return
      const fileMap = { suggestion: 'suggestions', contact: 'contacts' }; const key = fileMap[body.type]
      if (!key) return json(400, { ok: false, error: "Noma'lum tur" })
      const list = (await readArray(key)).filter((x) => x.id !== body.id); await writeArray(key, list)
      await logHistory(admin.name, body.type === 'suggestion' ? "kelgan taklifni o'chirdi" : "aloqa so'rovini o'chirdi")
      return json(200, { ok: true })
    }
    if (p === '/api/admin/stats' && method === 'POST') {
      const admin = await requirePerm('stats'); if (!admin) return
      const body = await getJson(req); const incoming = Array.isArray(body.stats) ? body.stats : []
      const stats = [0, 1, 2].map((i) => ({ value: String(incoming[i]?.value ?? DEFAULT_STATS[i].value).slice(0, 20), label: String(incoming[i]?.label ?? DEFAULT_STATS[i].label).slice(0, 60) }))
      await writeJson('stats', stats); await logHistory(admin.name, 'hero statistikasini yangiladi')
      return json(200, { ok: true, stats })
    }

    // ===== ADMIN: rasm bilan (multipart) — naqsh / loyiha / bo'lim =====
    if (p === '/api/admin/ornaments' && method === 'POST') {
      const admin = await requirePerm('ornaments'); if (!admin) return
      await ensureOrnaments(); const body = fields(req); const action = body.action; const f = file(req)
      let items = await readArray('ornaments')
      const saveImg = async (id) => { if (!f || !f.buffer) return; const old = await listFiles('image', 'ornament'); await deleteFiles('image', old.filter((n) => n.startsWith(id + '.')).map((n) => `ornament/${n}`)); const ext = extFromName(f.originalname) || '.jpg'; await putFile('image', `ornament/${id}${ext}`, f.buffer, f.mimetype) }
      if (action === 'create') { const id = genId(); await saveImg(id); items.unshift({ id, old: body.old || '', new: body.new || '', desc: body.desc || '', history: body.history || '', hasImage: !!(f && f.buffer), active: true, createdAt: new Date().toISOString() }); await logHistory(admin.name, `yangi naqsh qo'shdi: "${body.old || ''}"`) }
      else if (action === 'update') { await saveImg(body.id); items = items.map((o) => o.id === body.id ? { ...o, old: body.old, new: body.new, desc: body.desc, history: body.history, hasImage: (f && f.buffer) ? true : o.hasImage } : o); await logHistory(admin.name, `naqshni tahrirladi: "${body.old || ''}"`) }
      else if (action === 'toggle') { let st = true; items = items.map((o) => { if (o.id === body.id) { st = !(o.active !== false); return { ...o, active: st } } return o }); const it = items.find((o) => o.id === body.id); await logHistory(admin.name, `naqshni ${st ? "ko'rsatdi" : 'yashirdi'}: "${it ? it.old : ''}"`) }
      else if (action === 'delete') { const it = items.find((o) => o.id === body.id); items = items.filter((o) => o.id !== body.id); const old = await listFiles('image', 'ornament'); await deleteFiles('image', old.filter((n) => n.startsWith(body.id + '.')).map((n) => `ornament/${n}`)); await logHistory(admin.name, `naqshni o'chirdi: "${it ? it.old : ''}"`) }
      else return json(400, { ok: false, error: "Noma'lum amal" })
      await writeArray('ornaments', items); return json(200, { ok: true, ornaments: items })
    }
    if (p === '/api/admin/projects' && method === 'POST') {
      const admin = await requirePerm('projects'); if (!admin) return
      const body = fields(req); const action = body.action; const f = file(req)
      let projects = await readArray('projects')
      const saveImg = async (id) => { if (!f || !f.buffer) return; const old = await listFiles('image', 'project'); await deleteFiles('image', old.filter((n) => n.startsWith(id + '.')).map((n) => `project/${n}`)); const ext = extFromName(f.originalname) || '.jpg'; await putFile('image', `project/${id}${ext}`, f.buffer, f.mimetype) }
      if (action === 'create') {
        const id = genId(); await saveImg(id)
        projects.unshift({ id, name: body.name || 'Nomsiz loyiha', direction: body.direction || '', location: body.location || '', area: body.area || '', year: body.year || '', status: body.status || '', workType: body.workType || '', duration: body.duration || '', role: body.role || '', task: body.task || '', problem: body.problem || '', solution: body.solution || '', process: body.process || '', result: body.result || '', description: body.description || '', details: body.details || '', features: body.features || '', hasImage: !!(f && f.buffer), active: true, createdAt: new Date().toISOString() })
        await logHistory(admin.name, `yangi loyiha qo'shdi: "${body.name || 'Nomsiz loyiha'}"`)
      } else if (action === 'update') {
        await saveImg(body.id)
        projects = projects.map((pr) => pr.id === body.id ? { ...pr, name: body.name, location: body.location, area: body.area, year: body.year, status: body.status, description: body.description, details: body.details, features: body.features, direction: body.direction || '', task: body.task || '', solution: body.solution || '', result: body.result || '', workType: body.workType || '', duration: body.duration || '', role: body.role || '', problem: body.problem || '', process: body.process || '', hasImage: (f && f.buffer) ? true : pr.hasImage } : pr)
        await logHistory(admin.name, `loyihani tahrirladi: "${body.name}"`)
      } else if (action === 'toggle') { let st = true; projects = projects.map((pr) => { if (pr.id === body.id) { st = !pr.active; return { ...pr, active: st } } return pr }); const pr = projects.find((x) => x.id === body.id); await logHistory(admin.name, `loyihani ${st ? "ko'rsatdi" : 'yashirdi'}: "${pr?.name || ''}"`) }
      else if (action === 'delete') { const pr = projects.find((x) => x.id === body.id); projects = projects.filter((x) => x.id !== body.id); const old = await listFiles('image', 'project'); await deleteFiles('image', old.filter((n) => n.startsWith(body.id + '.')).map((n) => `project/${n}`)); await logHistory(admin.name, `loyihani o'chirdi: "${pr?.name || ''}"`) }
      else return json(400, { ok: false, error: "Noma'lum amal" })
      await writeArray('projects', projects); return json(200, { ok: true, projects })
    }
    if (p === '/api/admin/section-image' && method === 'POST') {
      const admin = await requirePerm('sections'); if (!admin) return
      const body = fields(req); const key = String(body.key || ''); const f = file(req)
      if (!/^[a-z0-9-]+$/.test(key)) return json(400, { ok: false, error: "Noto'g'ri kalit" })
      const old = await listFiles('image', 'section')
      const removeOld = async () => { await deleteFiles('image', old.filter((n) => n.startsWith(key + '.')).map((n) => `section/${n}`)) }
      if (body.action === 'delete') { await removeOld(); await logHistory(admin.name, `bo'lim rasmini o'chirdi: ${key}`); return json(200, { ok: true }) }
      if (!f || !f.buffer) return json(400, { ok: false, error: 'Rasm tanlanmagan' })
      await removeOld(); const ext = extFromName(f.originalname) || '.jpg'; await putFile('image', `section/${key}${ext}`, f.buffer, f.mimetype)
      await logHistory(admin.name, `bo'lim rasmini yangiladi: ${key}`)
      return json(200, { ok: true })
    }

    // Topilmadi
    return json(404, { ok: false, error: 'API topilmadi' })
  } catch (e) {
    console.error('[api]', p, e?.message || e)
    return json(500, { ok: false, error: e?.message || 'Server xatosi' })
  }
}
