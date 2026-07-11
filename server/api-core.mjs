// ============================================================
//  BARPO — Umumiy API yadrosi (async, Supabase saqlash bilan)
//  Ham Vite dev plugin, ham Vercel serverless shu yadroni chaqiradi.
//
//  Adapter mas'uliyati (dev yoki vercel):
//   - multipart so'rovni oldindan parse qilib req._fields va req._file ga qo'yadi
//   - keyin handleApi(req, res) ni chaqiradi
// ============================================================
import crypto from 'node:crypto'
import nodemailer from 'nodemailer'
import {
  readArray, writeArray, readJson, writeJson, deleteJson,
  getFile, putFile, listFiles, deleteFile, deleteFiles,
  checkRateLimit,
} from './store.mjs'

// ---------- Parol xeshlash (Node ichki crypto.scrypt — tashqi bog'liqlik kerak emas) ----------
// Format: "scrypt$<salt-hex>$<hash-hex>". Eski (migratsiyadan oldingi) yozuvlar oddiy
// ochiq matn bo'lishi mumkin — verifyPassword buni ham qabul qiladi, keyin chaqiruvchi
// (login handleri) uni darhol xeshlab qayta yozadi ("lazy migration").
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex')
  return `scrypt$${salt}$${hash}`
}
function verifyPassword(password, stored) {
  const pass = String(password ?? '')
  const st = String(stored ?? '')
  if (st.startsWith('scrypt$')) {
    const [, salt, hashHex] = st.split('$')
    if (!salt || !hashHex) return false
    const expected = Buffer.from(hashHex, 'hex')
    const actual = crypto.scryptSync(pass, salt, 64)
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual)
  }
  // Eski (xeshlanmagan) yozuv — vaqt-hujumidan qisman himoyalangan solishtirish.
  const a = Buffer.from(pass); const b = Buffer.from(st)
  return a.length === b.length && a.length > 0 && crypto.timingSafeEqual(a, b)
}
function isPasswordHashed(stored) { return String(stored ?? '').startsWith('scrypt$') }

// ---------- Sessiya (kv: 'session:<token>') ----------
// Login parolni har safar qayta yubormaslik uchun: bir marta tekshirilgach,
// tasodifiy token qaytariladi, keyingi so'rovlar shu tokenni Authorization
// sarlavhasi (fetch) yoki ?token= (window.open / <a href> kabi navigatsiyalar) orqali yuboradi.
const SESSION_TTL_MS = 12 * 60 * 60 * 1000 // 12 soat
function genToken() { return crypto.randomBytes(32).toString('hex') }
async function createSession(admin) {
  const token = genToken()
  await writeJson(`session:${token}`, { username: admin.username, expiresAt: Date.now() + SESSION_TTL_MS })
  return token
}
async function getSessionAdmin(token) {
  if (!token) return null
  const sess = await readJson(`session:${token}`, null)
  if (!sess || typeof sess !== 'object' || !sess.expiresAt || sess.expiresAt < Date.now()) return null
  return (await readAdmins()).find((a) => a.username === sess.username) || null
}
async function destroySession(token) {
  if (!token) return
  await deleteJson(`session:${token}`)
}

// ---------- Adminlar / ruxsatlar ----------
// DIQQAT: bootstrap adminlar manba kodida ochiq parol bilan YOZILMAYDI.
// Muhit o'zgaruvchisi BARPO_ADMIN_SEED orqali beriladi:
//   BARPO_ADMIN_SEED='[{"username":"jamshid","password":"...","name":"Jamshid","role":"superadmin"}]'
// Agar berilmagan bo'lsa (masalan birinchi marta lokal ishga tushirilganda),
// bitta tasodifiy parolli superadmin yaratiladi va konsolga bir marta chiqariladi.
const SUPERADMIN_USERNAME_DEFAULT = 'jamshid'
function readSeedAdminsFromEnv() {
  const raw = process.env.BARPO_ADMIN_SEED
  if (!raw) return null
  try {
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr) || !arr.length) return null
    return arr
  } catch (e) {
    console.error('[api] BARPO_ADMIN_SEED noto\'g\'ri JSON:', e?.message || e)
    return null
  }
}
function buildBootstrapAdmins() {
  const fromEnv = readSeedAdminsFromEnv()
  if (fromEnv) {
    return fromEnv.map((a) => ({
      username: String(a.username), password: hashPassword(a.password), name: String(a.name || a.username),
      role: a.role === 'superadmin' ? 'superadmin' : 'admin',
      perms: defaultPerms(true),
    }))
  }
  // ENV berilmagan — bitta marta ishlatiladigan tasodifiy parol generatsiya qilamiz.
  const tempPassword = crypto.randomBytes(9).toString('base64url')
  console.warn('\n[api] BARPO_ADMIN_SEED topilmadi — vaqtinchalik superadmin yaratildi.')
  console.warn(`[api]   login: ${SUPERADMIN_USERNAME_DEFAULT}`)
  console.warn(`[api]   parol: ${tempPassword}  (faqat shu safar konsolga chiqadi — darhol kirib, o'zgartiring)\n`)
  return [{
    username: SUPERADMIN_USERNAME_DEFAULT, password: hashPassword(tempPassword), name: 'Jamshid',
    role: 'superadmin', perms: defaultPerms(true),
  }]
}
const PERM_KEYS = ['projects', 'ornaments', 'offers', 'standards', 'investors', 'blog', 'sections', 'stats', 'suggestions', 'hr', 'contacts', 'settings', 'services', 'culture']

function defaultPerms(value = true) {
  const o = {}
  for (const k of PERM_KEYS) o[k] = value
  return o
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
// Faqat ishonchli manbadan (platforma) kelgan mijoz IP'sini olishga harakat qilamiz.
// Vercel'ning o'zi x-real-ip'ni to'g'ridan-to'g'ri ulanishdan o'rnatadi (mijoz buni
// o'zgartira olmaydi); x-forwarded-for zanjirida esa OXIRGI yozuv chekka (edge)
// tomonidan qo'shiladi — mijoz faqat ZANJIR BOSHIGA soxta qiymat qo'sha oladi.
function getClientIp(req) {
  const realIp = req.headers?.['x-real-ip']
  if (realIp) return String(realIp).trim()
  const fwd = req.headers?.['x-forwarded-for']
  if (fwd) { const parts = String(fwd).split(',').map((s) => s.trim()).filter(Boolean); if (parts.length) return parts[parts.length - 1] }
  return req.socket?.remoteAddress || 'unknown'
}
function htmlEscape(v) {
  return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
// Telefon raqamida kamida shuncha raqam bo'lishi kerak — brauzer tomonidagi
// filtrni (faqat belgi ruxsat etish) chetlab o'tib to'g'ridan-to'g'ri so'rov
// yuborilgan holatlarda ham serverning o'zi haqiqiy tekshiruvni bajaradi.
function isValidPhone(v) {
  const digits = String(v == null ? '' : v).replace(/\D/g, '')
  return digits.length >= 7
}
// Sodda email format tekshiruvi (xavfsizlik uchun emas — chiqish htmlEscape
// bilan himoyalangan — faqat brauzer `type="email"` validatsiyasini chetlab
// o'tib to'g'ridan-to'g'ri so'rov yuborilgan holatlarda ham ma'lumot sifatini
// ta'minlash uchun).
function isValidEmail(v) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v == null ? '' : v).trim())
}
// Rezyume fayli uchun ruxsat etilgan kengaytmalar (klient tomonidagi
// <input accept="..."> bilan bir xil) — MIME sarlavhasiga ishonmasdan,
// avval nomdan kengaytmani tekshiramiz.
const ALLOWED_RESUME_EXTS = new Set(['.pdf', '.doc', '.docx', '.rtf', '.txt'])
// CSV formula-in'ektsiyadan himoya: agar qiymat =, +, -, @ yoki tab bilan
// boshlansa, elektron jadval dasturi uni formula deb bajarib yubormasligi uchun
// oldiga apostrof qo'shamiz (Excel/Sheets buni matn sifatida ko'rsatadi).
function csvSafe(v) {
  const s = String(v == null ? '' : v)
  return /^[=+\-@\t]/.test(s) ? `'${s}` : s
}

// ---------- UZ/RU ikki tilli maydonlar uchun umumiy yordamchi ----------
// Har bir `fields` ro'yxatidagi nom uchun o'zi (o'zbekcha, asosiy til) va
// `${nom}Ru` (ruscha, ixtiyoriy — bo'sh bo'lsa ochiq sahifada UZ'ga qaytariladi)
// maydonlarini yaratadi/yangilaydi. mergeBilingual faqat so'rovda HAQIQATDA
// kelgan maydonlarni yangilaydi — shu bilan "yangilashda yuborilmagan maydon
// bo'shab qoladi" xatosi oldini oladi.
function pickBilingual(body, fields) {
  const out = {}
  for (const f of fields) { out[f] = body[f] != null ? String(body[f]) : ''; out[`${f}Ru`] = body[`${f}Ru`] != null ? String(body[`${f}Ru`]) : '' }
  return out
}
function mergeBilingual(existing, body, fields) {
  const out = { ...existing }
  for (const f of fields) {
    if (body[f] !== undefined) out[f] = String(body[f])
    if (body[`${f}Ru`] !== undefined) out[`${f}Ru`] = String(body[`${f}Ru`])
  }
  return out
}
const STANDARD_FIELDS = ['title', 'desc']
const INVESTOR_FIELDS = ['title', 'text', 'key']
const OFFER_FIELDS = ['title', 'description', 'tag']
const ORNAMENT_FIELDS = ['old', 'new', 'desc', 'history']
const BLOG_FIELDS = ['title', 'rubric', 'content']
const PROJECT_FIELDS = ['name', 'direction', 'location', 'area', 'status', 'workType', 'duration', 'role', 'task', 'problem', 'solution', 'process', 'result', 'description', 'details', 'features']

// ---------- Adminlar (kv: 'admins') ----------
async function readAdmins() {
  let arr = await readJson('admins', null)
  if (!Array.isArray(arr)) {
    arr = buildBootstrapAdmins()
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
function emptyNotifyByType() { return { hr: [], suggestion: [], contact: [] } }
async function readSettings() {
  const s = (await readJson('settings', null)) || {}
  if (!s.telegram) s.telegram = emptyTg()
  if (!s.telegramByType) s.telegramByType = { hr: emptyTg(), suggestion: emptyTg(), contact: emptyTg() }
  for (const k of ['hr', 'suggestion', 'contact']) if (!s.telegramByType[k]) s.telegramByType[k] = emptyTg()
  if (!s.socials) s.socials = defaultSocials()
  if (!s.contactInfo) s.contactInfo = defaultContactInfo()
  if (!Array.isArray(s.notifyEmails)) s.notifyEmails = []
  if (!s.notifyEmailsByType) s.notifyEmailsByType = emptyNotifyByType()
  for (const k of ['hr', 'suggestion', 'contact']) if (!Array.isArray(s.notifyEmailsByType[k])) s.notifyEmailsByType[k] = []
  if (!s.smtp || typeof s.smtp !== 'object') s.smtp = {}
  if (typeof s.sheetsWebhook !== 'string') s.sheetsWebhook = ''
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
  await sendEmailNotification(type, titleUz, record)
  await postToSheetsWebhook(type, record)
}

// ---------- Email (SMTP, nodemailer) ----------
// s.smtp to'liq to'ldirilmagan bo'lsa (host/user/pass), email hech qachon
// yuborilmaydi — bu funksiya jimgina hech narsa qilmay qaytadi (Telegram
// bildirishnomasi baribir ishlaydi).
function emailRecipientsForType(s, type) {
  const own = (s.notifyEmailsByType?.[type] || []).map((x) => String(x).trim()).filter(Boolean)
  const general = (s.notifyEmails || []).map((x) => String(x).trim()).filter(Boolean)
  return own.length ? own : general
}
let _mailTransport = null
let _mailTransportKey = ''
function mailTransportFor(smtp) {
  const key = JSON.stringify(smtp)
  if (_mailTransport && _mailTransportKey === key) return _mailTransport
  _mailTransport = nodemailer.createTransport({
    host: smtp.host, port: Number(smtp.port) || 587, secure: !!smtp.secure,
    auth: smtp.user ? { user: smtp.user, pass: smtp.pass || '' } : undefined,
  })
  _mailTransportKey = key
  return _mailTransport
}
async function sendEmail(to, subject, html, smtp) {
  if (!smtp?.host || !smtp?.user || !smtp?.pass || !to.length) return { ok: false, error: "SMTP sozlanmagan yoki qabul qiluvchi yo'q" }
  try {
    await mailTransportFor(smtp).sendMail({ from: smtp.from || smtp.user, to: to.join(', '), subject, html })
    return { ok: true }
  } catch (e) {
    console.error('[email]', e?.message || e)
    return { ok: false, error: e?.message || 'email yuborishda xatolik' }
  }
}
async function sendEmailNotification(type, titleUz, record) {
  try {
    const s = await readSettings()
    const to = emailRecipientsForType(s, type)
    if (!to.length) return
    const rows = Object.entries(record).map(([k, v]) => `<tr><td style="padding:4px 10px 4px 0;color:#666;">${htmlEscape(k)}</td><td style="padding:4px 0;">${htmlEscape(v)}</td></tr>`).join('')
    const html = `<div style="font-family:sans-serif"><h2 style="color:#060920;">BARPO — yangi ${htmlEscape(titleUz)}</h2><table>${rows}</table></div>`
    await sendEmail(to, `BARPO — yangi ${titleUz}`, html, s.smtp)
  } catch (e) { console.error('[email notify]', e?.message || e) }
}

// ---------- Google Sheets webhook ----------
async function postToSheetsWebhook(type, record) {
  try {
    const s = await readSettings()
    const url = String(s.sheetsWebhook || '').trim()
    if (!url) return
    await fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, record, time: new Date().toISOString() }),
    }).catch((e) => console.error('[sheets webhook]', e?.message || e))
  } catch (e) { console.error('[sheets webhook]', e?.message || e) }
}

// ---------- Seed (dastlabki kontent) ----------
async function ensureOrnaments() {
  const cur = await readJson('ornaments', null)
  if (Array.isArray(cur)) return
  const defaults = [
    { old: 'Girih naqshi', oldRu: 'Орнамент гирих', new: '', newRu: '', desc: 'Geometrik aniqlik qadimdan ham, bugun ham asosiy qoida', descRu: 'Геометрическая точность была и остаётся главным правилом — вчера и сегодня' },
    { old: 'Zanjira naqshi', oldRu: 'Орнамент занджира', new: '', newRu: '', desc: "Har bir detal va bosqich bir-biriga bog'langan", descRu: 'Каждая деталь и этап связаны друг с другом' },
    { old: 'Turunj (markaz)', oldRu: 'Турундж (центр)', new: '', newRu: '', desc: 'Hammaning markaz atrofida tartibiy harakatlari', descRu: 'Упорядоченное движение всего вокруг центра' },
    { old: 'Koshin (plitkalar)', oldRu: 'Кошин (плитка)', new: '', newRu: '', desc: 'Material integratsiyasi va chidamlilik', descRu: 'Интеграция материалов и долговечность' },
  ].map((o) => ({ id: genId(), old: o.old, oldRu: o.oldRu, new: o.new, newRu: o.newRu, desc: o.desc, descRu: o.descRu, history: '', historyRu: '', hasImage: false, active: true, createdAt: new Date().toISOString() }))
  await writeJson('ornaments', defaults)
}
async function ensureStandards() {
  const cur = await readJson('standards', null)
  if (Array.isArray(cur)) return
  const defaults = [
    { title: 'Tizim', titleRu: 'Система', desc: 'Har bir obyekt tartibli boshqaruv asosida yuritiladi: GPR, ish grafigi, moliyaviy reja, resurslar jadvali, texnika grafigi va kunlik nazorat', descRu: 'Каждый объект ведётся на основе упорядоченного управления: ГПР, график работ, финансовый план, график ресурсов, график техники и ежедневный контроль' },
    { title: 'Sifat', titleRu: 'Качество', desc: 'Sifat faqat yakunda tekshirilmaydi. U har kuni, har bosqichda, har ish turida nazorat qilinadi', descRu: 'Качество проверяется не только в конце. Оно контролируется каждый день, на каждом этапе, в каждом виде работ' },
    { title: 'Nazorat', titleRu: 'Контроль', desc: "Obyektda nima bo'layotgani ko'rinib turishi kerak: kim ishlayapti, nima bajarildi, qancha bajarildi, qaysi bosqichda muammo bor", descRu: 'Должно быть видно, что происходит на объекте: кто работает, что сделано, сколько сделано, на каком этапе есть проблема' },
    { title: "Mas'uliyat", titleRu: 'Ответственность', desc: "Biz qarorlarimiz, ishimiz va natijamiz uchun javob beramiz. Obyekt biz uchun topshirilguncha emas, to'g'ri ishlaguncha muhim", descRu: 'Мы отвечаем за свои решения, работу и результат. Для нас важен не момент сдачи объекта, а то, чтобы он работал правильно' },
    { title: 'Shaffoflik', titleRu: 'Прозрачность', desc: "Investor uchun xarajatlar, jarayonlar va qarorlar tushunarli bo'lishi kerak. Qurilishda noaniqlik — xavf. Shaffoflik — boshqaruv", descRu: 'Для инвестора расходы, процессы и решения должны быть понятны. Неопределённость в строительстве — это риск. Прозрачность — это управление' },
    { title: 'Xotirjamlik', titleRu: 'Спокойствие', desc: "Mijoz har kuni obyekt ortidan yugurmasligi kerak. Tizim to'g'ri ishlasa, investor strategik qarorlar bilan shug'ullanadi, jarayon esa nazorat ostida bo'ladi.", descRu: 'Клиент не должен каждый день бегать за объектом. Если система работает правильно, инвестор занимается стратегическими решениями, а процесс находится под контролем.' },
    { title: 'Innovatsion yondashuv', titleRu: 'Инновационный подход', desc: 'Biz zamonaviy boshqaruv, muhandislik yechimlari va raqamli nazorat vositalarini qurilish jarayoniga kiritamiz', descRu: 'Мы внедряем современное управление, инженерные решения и инструменты цифрового контроля в строительный процесс' },
    { title: 'Iqtisodiy samaradorlik', titleRu: 'Экономическая эффективность', desc: "To'g'ri qurilish — bu faqat arzon qilish emas. To'g'ri qurilish — keraksiz xarajatlarni oldini olish, resursni oqilona ishlatish va investitsiyani himoya qilish", descRu: 'Правильное строительство — это не просто дёшево. Правильное строительство — это предотвращение лишних расходов, рациональное использование ресурсов и защита инвестиций' },
  ].map((s) => ({ id: genId(), title: s.title, titleRu: s.titleRu, desc: s.desc, descRu: s.descRu, active: true, createdAt: new Date().toISOString() }))
  await writeJson('standards', defaults)
}
const INVESTOR_SEED = [
  { title: 'Data center — raqamli iqtisodiyot infratuzilmasi', titleRu: 'Дата-центр — инфраструктура цифровой экономики',
    text: "Data center oddiy bino emas. Bu yuqori darajadagi muhandislik, xavfsizlik, energiya barqarorligi va uzluksiz ishlash talab qiladigan strategik obyekt.\n\nBunday loyihada har bir qaror oldindan hisoblanishi kerak: elektr quvvati, sovutish tizimi, zaxira energiya, yong'in xavfsizligi, kirish nazorati va ekspluatatsiya qulayligi.\n\nBARPO data center qurilishiga faqat qurilish sifatida emas, biznes uzluksizligi infratuzilmasi sifatida qaraydi.",
    textRu: "Дата-центр — не обычное здание. Это стратегический объект, требующий инженерии высокого уровня, безопасности, энергетической устойчивости и бесперебойной работы.\n\nВ таком проекте каждое решение должно быть просчитано заранее: электрическая мощность, система охлаждения, резервное питание, пожарная безопасность, контроль доступа и удобство эксплуатации.\n\nBARPO рассматривает строительство дата-центра не просто как стройку, а как инфраструктуру непрерывности бизнеса.",
    key: "Data center — bu beton ichidagi serverlar emas.\nBu ishonch, xavfsizlik va uzluksiz ishlash tizimi.",
    keyRu: "Дата-центр — это не серверы внутри бетона.\nЭто система доверия, безопасности и бесперебойной работы." },
  { title: 'A klass biznes markazi — status, tizim va tijoriy qiymat', titleRu: 'Бизнес-центр класса А — статус, система и коммерческая ценность',
    text: "A klass biznes markazi shunchaki ofis binosi emas. U kompaniyalar uchun imij, xodimlar uchun qulaylik, investor uchun esa barqaror daromad manbai bo'lishi kerak.\n\nBunday obyektlarda fasad, kirish guruhi, lift zonasi, parking, muhandislik tizimlari, umumiy foydalanish maydonlari va ekspluatatsiya xarajatlari bir butun tizim sifatida o'ylanishi kerak.\n\nBARPO biznes markazlarni faqat qurib topshiriladigan bino sifatida emas, ishlaydigan tijoriy aktiv sifatida ko'radi.",
    textRu: "Бизнес-центр класса А — это не просто офисное здание. Он должен быть имиджем для компаний, комфортом для сотрудников и источником стабильного дохода для инвестора.\n\nВ таких объектах фасад, входная группа, лифтовая зона, парковка, инженерные системы, места общего пользования и эксплуатационные расходы должны продумываться как единая система.\n\nBARPO рассматривает бизнес-центры не просто как здание, которое нужно построить и сдать, а как работающий коммерческий актив.",
    key: "A klass daraja binoning balandligida emas.\nUning boshqaruvi, qulayligi va detalida.",
    keyRu: "Класс А — это не высота здания.\nЭто его управление, удобство и детали." },
  { title: 'Savdo markazi — odam oqimi ishlaydigan arxitektura', titleRu: 'Торговый центр — архитектура работающего людского потока',
    text: "Savdo markazining muvaffaqiyati faqat maydon hajmiga bog'liq emas. Odam oqimi, kirish-chiqish logikasi, navigatsiya, ijarachilar joylashuvi, parking va muhandislik tizimlari birgalikda ishlashi kerak.\n\nBARPO savdo obyektlariga tijorat natijasi nuqtayi nazaridan qaraydi. Har bir metr, har bir yo'lak, har bir zona mijoz harakati va biznes samaradorligiga xizmat qilishi kerak.",
    textRu: "Успех торгового центра зависит не только от площади. Поток людей, логика входа-выхода, навигация, расположение арендаторов, парковка и инженерные системы должны работать сообща.\n\nBARPO рассматривает торговые объекты с точки зрения коммерческого результата. Каждый метр, каждый проход, каждая зона должны служить движению клиента и эффективности бизнеса.",
    key: "Savdo markazi — bu devorlar ichidagi do'konlar emas.\nBu odam oqimi va daromad modeli.",
    keyRu: "Торговый центр — это не магазины внутри стен.\nЭто поток людей и модель дохода." },
  { title: 'Park — shahar nafas oladigan joy', titleRu: 'Парк — место, где дышит город',
    text: "Park qurilishi oddiy obodonlashtirish emas. Bu shahar muhiti, odamlar harakati, dam olish madaniyati va tabiiy muvozanatni birlashtiradigan loyiha.\n\nYaxshi parkda yo'laklar, yoritish, landshaft, suv tizimi, xavfsizlik, xizmat ko'rsatish zonalari va ekspluatatsiya qulayligi oldindan o'ylangan bo'ladi.\n\nBARPO park va rekreatsion hududlarni nafaqat chiroyli, balki uzoq muddat ishlaydigan, odamlar qayta-qayta keladigan muhit sifatida ko'radi.",
    textRu: "Строительство парка — это не просто благоустройство. Это проект, объединяющий городскую среду, движение людей, культуру отдыха и природный баланс.\n\nВ хорошем парке заранее продуманы дорожки, освещение, ландшафт, водная система, безопасность, зоны обслуживания и удобство эксплуатации.\n\nBARPO рассматривает парки и рекреационные зоны не только как красивые, но и как долговечно работающие пространства, куда люди возвращаются снова и снова.",
    key: "Park — bu yashil maydon emas.\nBu shahar hayotining madaniy ritmi.",
    keyRu: "Парк — это не просто зелёная зона.\nЭто культурный ритм городской жизни." },
  { title: 'Premium turar joy majmuasi — uy emas, yashash madaniyati', titleRu: 'Премиальный жилой комплекс — не просто дом, а культура жизни',
    text: "Premium turar joy majmuasi faqat qimmat materiallar yoki chiroyli fasaddan iborat emas. Bu insonning kundalik hayotini qulay, xavfsiz va estetik qiladigan tizim.\n\nKirish zonasi, hovli, parking, lift, muhandislik tizimlari, shovqin izolyatsiyasi, fasad, jamoat hududlari va ekspluatatsiya sifati birgalikda premium darajani yaratadi.\n\nBARPO premium turar joy majmuasi qurilishida detal, muhandislik, estetika va uzoq muddatli qiymatni birlashtiradi.",
    textRu: "Премиальный жилой комплекс — это не только дорогие материалы или красивый фасад. Это система, делающая повседневную жизнь человека удобной, безопасной и эстетичной.\n\nВходная зона, двор, парковка, лифт, инженерные системы, шумоизоляция, фасад, общественные пространства и качество эксплуатации вместе создают премиальный уровень.\n\nBARPO объединяет деталь, инженерию, эстетику и долгосрочную ценность в строительстве премиальных жилых комплексов.",
    key: "Premium — ko'rinish emas.\nPremium — har kuni seziladigan sifat.",
    keyRu: "Премиум — это не внешний вид.\nПремиум — это качество, ощущаемое каждый день." },
  { title: 'Klinika — aniqlik, tozalik va muhandislik talabi', titleRu: 'Клиника — точность, чистота и инженерная строгость',
    text: "Tibbiyot obyektlarida xato qilish mumkin emas. Bu yerda rejalashtirish, ventilyatsiya, steril zonalar, oqimlar ajratilishi, muhandislik tizimlari va foydalanish qulayligi alohida ahamiyatga ega.\n\nBARPO klinika qurilishiga bemor, shifokor va ekspluatatsiya jamoasi nuqtayi nazaridan qaraydi.\n\nBino chiroyli bo'lishi mumkin. Lekin klinika, avvalo, to'g'ri ishlashi kerak.",
    textRu: "В медицинских объектах нельзя допускать ошибок. Здесь особое значение имеют планировка, вентиляция, стерильные зоны, разделение потоков, инженерные системы и удобство эксплуатации.\n\nBARPO подходит к строительству клиники с точки зрения пациента, врача и эксплуатационной команды.\n\nЗдание может быть красивым. Но клиника прежде всего должна правильно работать.",
    key: "Klinika qurilishi — bu dizayn emas.\nBu aniqlik va mas'uliyat.",
    keyRu: "Строительство клиники — это не дизайн.\nЭто точность и ответственность." },
  { title: 'Mehmonxona — tajriba sotadigan obyekt', titleRu: 'Гостиница — объект, продающий впечатления',
    text: "Mehmonxona qurilishida har bir detal mehmon tajribasiga ta'sir qiladi: kirish taassuroti, xona ergonomikasi, ovoz izolyatsiyasi, muhandislik tizimlari, servis zonalari, evakuatsiya, yoritish va umumiy atmosfera.\n\nBARPO mehmonxona obyektlarini nafaqat qurilish, balki servis biznesining infratuzilmasi sifatida ko'radi.",
    textRu: "В строительстве гостиницы каждая деталь влияет на впечатление гостя: первое впечатление от входа, эргономика номера, звукоизоляция, инженерные системы, сервисные зоны, эвакуация, освещение и общая атмосфера.\n\nBARPO рассматривает гостиничные объекты не просто как стройку, а как инфраструктуру сервисного бизнеса.",
    key: "Mehmonxona — bu xona soni emas.\nBu mehmon qaytib keladigan tajriba.",
    keyRu: "Гостиница — это не количество номеров.\nЭто впечатление, ради которого гость возвращается." },
  { title: 'Sanoat obyekti — jarayon uchun qurilgan bino', titleRu: 'Промышленный объект — здание, построенное для процесса',
    text: "Ishlab chiqarish obyektida asosiy narsa — jarayonning to'g'ri ishlashi. Logistika, texnika harakati, xavfsizlik, yuklama, muhandislik tizimlari va ekspluatatsiya qulayligi oldindan hisoblanishi kerak.\n\nBARPO sanoat obyektlarida biznes jarayonini tushunib, qurilish yechimini shu jarayonga moslashtiradi.",
    textRu: "На производственном объекте главное — правильная работа процесса. Логистика, движение техники, безопасность, погрузка, инженерные системы и удобство эксплуатации должны быть просчитаны заранее.\n\nBARPO, понимая бизнес-процесс, адаптирует строительное решение под этот процесс.",
    key: "Sanoat binosi devor emas.\nBu ishlab chiqarish ritmini ushlab turadigan tizim.",
    keyRu: "Промышленное здание — это не стены.\nЭто система, удерживающая ритм производства." },
]
async function ensureInvestors() {
  const cur = await readJson('investors', null)
  if (Array.isArray(cur)) {
    // Migratsiya: "JK" -> "turar joy majmuasi" (mavjud yozuvlarni bir marta to'g'rilaydi)
    let changed = false
    const fixed = cur.map((x) => {
      const f = { ...x }
      for (const k of ['title', 'text', 'key']) {
        if (typeof f[k] === 'string' && /\bJK\b/.test(f[k])) {
          f[k] = f[k].replace(/\bJK\b/g, 'turar joy majmuasi')
          changed = true
        }
      }
      return f
    })
    if (changed) await writeJson('investors', fixed)
    return
  }
  const list = INVESTOR_SEED.map((x) => ({ id: genId() + Math.random().toString(36).slice(2, 5), title: x.title, titleRu: x.titleRu, text: x.text, textRu: x.textRu, key: x.key, keyRu: x.keyRu, active: true, createdAt: new Date().toISOString() }))
  await writeJson('investors', list)
}
// Bilim markazi (blog) — dastlabki 16 ta maqola QORALAMA sifatida seed qilinadi
async function ensureBlog() {
  const cur = await readJson('blog', null)
  if (Array.isArray(cur)) return
  const seed = [
    { rubric: 'BARPO Standarti', rubricRu: 'Стандарт BARPO', titles: [
      ['Devor tekisligi nima uchun muhim?', 'Почему важна ровность стен?'],
      ['Pardoz sifatini buzadigan 5 ta yashirin xato', '5 скрытых ошибок, портящих качество отделки'],
      ['Nima uchun yopiladigan ishlar oldin tekshirilishi kerak?', 'Почему скрытые работы нужно проверять до их закрытия?'],
      ['Toza obyekt — xavfsizlik va sifat belgisi', 'Чистый объект — признак безопасности и качества'],
    ] },
    { rubric: 'Mijoz iqtisodiy foydasi', rubricRu: 'Экономическая выгода клиента', titles: [
      ['Qurilishda ortiqcha xarajat qayerdan chiqadi?', 'Откуда берутся лишние расходы в строительстве?'],
      ['Arzon smeta nima uchun qimmatga tushadi?', 'Почему дешёвая смета обходится дорого?'],
      ["Noto'g'ri muhandislik yechimi kelajakda qanday xarajat keltiradi?", 'К каким расходам в будущем приводит неверное инженерное решение?'],
      ['Materialni tejash va sifatni tushirish — bir xil narsa emas', 'Экономия на материале и снижение качества — не одно и то же'],
    ] },
    { rubric: 'Yangi qurilish madaniyati', rubricRu: 'Новая культура строительства', titles: [
      ['Qurilishda madaniyat nimadan boshlanadi?', 'С чего начинается культура в строительстве?'],
      ["O'zbek me'morchiligidan zamonaviy qurilish nimani o'rganishi mumkin?", 'Чему современное строительство может научиться у узбекской архитектуры?'],
      ['Nima uchun tartib — tezlikning asosi?', 'Почему порядок — основа скорости?'],
      ['Buyurtmachi xotirjamligi qurilish xizmatining bir qismi bo\'lishi kerak', 'Спокойствие заказчика должно быть частью строительной услуги'],
    ] },
    { rubric: 'Tarix va zamonaviylik', rubricRu: 'История и современность', titles: [
      ['Girih naqshidan zamonaviy grid tizimigacha', 'От орнамента гирих до современной сеточной системы'],
      ['Koshin va zamonaviy fasad materiallari', 'Кошин и современные фасадные материалы'],
      ['Gumbazdan long-span konstruksiyalargacha', 'От купола до конструкций большого пролёта'],
      ['Amir Temur davridagi bunyodkorlik ruhi va bugungi qurilish', 'Дух созидания эпохи Амира Темура и сегодняшнее строительство'],
    ] },
  ]
  const list = []
  let i = 0
  for (const r of seed) for (const [uz, ru] of r.titles) {
    list.push({ id: genId() + (i++), title: uz, titleRu: ru, rubric: r.rubric, rubricRu: r.rubricRu, content: '', contentRu: '', hasImage: false, status: 'draft', createdAt: new Date().toISOString(), publishedAt: null })
  }
  await writeJson('blog', list)
}

// ---------- Xizmatlar (kv: 'services') ----------
async function ensureServices() {
  const cur = await readJson('services', null)
  if (Array.isArray(cur)) return
  const defaults = [
    { titleUz: 'Bosh pudratchi xizmatlari', titleRu: 'Услуги генподрядчика', descUz: "BARPO bosh pudratchi sifatida obyektning umumiy qurilish jarayonini boshqaradi: rejalashtirish, ishchi kuchi, materiallar, muhandislik tizimlari, pudratchilar, grafik va sifat nazorati.", descRu: "Как генподрядчик мы управляем общим строительным процессом объекта: планирование, рабочая сила, материалы, инженерные системы, подрядчики, график и контроль качества.", highlightUz: "Biz uchun bosh pudratchi — bu shunchaki ijrochi emas. Bu obyekt natijasi uchun javobgar markaz.", highlightRu: "Для нас генподрядчик — это не просто исполнитель. Это центр, ответственный за результат объекта." },
    { titleUz: 'Qurilish-montaj ishlari', titleRu: 'Строительно-монтажные работы', descUz: "Qurilish-montaj ishlari har qanday obyektning asosiy poydevoridir. Bu bosqichda xato qilish keyingi barcha jarayonlarga ta'sir qiladi. BARPO konstruktiv yechimlar, montaj sifati, texnologik ketma-ketlik va xavfsizlik talablariga qat'iy amal qiladi.", descRu: "Строительно-монтажные работы — основа любого объекта. Ошибка на этом этапе влияет на все последующие процессы. Мы строго соблюдаем конструктивные решения, качество монтажа, технологическую последовательность и требования безопасности.", highlightUz: "Biz tezlikni shoshilish deb tushunmaymiz. Tezlik — bu oldindan tuzilgan reja va intizom natijasi.", highlightRu: "Мы не понимаем скорость как спешку. Скорость — результат заранее составленного плана и дисциплины." },
    { titleUz: 'Fasad va tashqi ishlar', titleRu: 'Фасад и наружные работы', descUz: "Fasad — obyektning birinchi taassuroti. Lekin u faqat ko'rinish emas. Fasad binoning himoyasi, energetik samaradorligi, arxitekturaviy xarakteri va uzoq muddatli qiymatiga ta'sir qiladi. BARPO fasad ishlarida estetika, texnik yechim va ekspluatatsion mustahkamlikni birlashtiradi.", descRu: "Фасад — первое впечатление об объекте. Но это не только внешний вид. Фасад влияет на защиту здания, энергоэффективность, архитектурный характер и долгосрочную ценность. В фасадных работах мы объединяем эстетику, техническое решение и эксплуатационную прочность.", highlightUz: "Biz uchun chiroyli fasad — bu bugun ko'rinadigan, ertaga esa o'z sifatini saqlaydigan yechim.", highlightRu: "Для нас красивый фасад — это решение, которое выглядит хорошо сегодня и сохраняет качество завтра." },
    { titleUz: 'Pardozlash ishlari', titleRu: 'Отделочные работы', descUz: "Pardoz — obyektning yakuniy hissiyoti. Aynan shu bosqichda mijoz, ijarachi yoki foydalanuvchi sifatni ko'radi, his qiladi va baholaydi. BARPO pardozlash ishlarida detal, aniqlik, material tanlovi va ijro madaniyatiga e'tibor beradi.", descRu: "Отделка — финальное ощущение от объекта. Именно на этом этапе клиент, арендатор или пользователь видит, чувствует и оценивает качество. В отделочных работах мы уделяем внимание деталям, точности, выбору материалов и культуре исполнения.", highlightUz: "Chiroyli ko'rinish yetarli emas. To'g'ri bajarilgan pardoz uzoq xizmat qilishi kerak.", highlightRu: "Красивого вида недостаточно. Правильно выполненная отделка должна служить долго." },
    { titleUz: 'Muhandislik tizimlari', titleRu: 'Инженерные системы', descUz: "Muhandislik tizimlari — obyektning ko'rinmaydigan, lekin eng muhim qismi. Elektr, ventilyatsiya, isitish, sovutish, suv, kanalizatsiya, yong'in xavfsizligi va zaif tok tizimlari binoning ishlash sifatini belgilaydi. BARPO muhandislik tizimlariga alohida e'tibor beradi.", descRu: "Инженерные системы — невидимая, но самая важная часть объекта. Электрика, вентиляция, отопление, охлаждение, водоснабжение, канализация, пожарная безопасность и слаботочные системы определяют качество работы здания.", highlightUz: "Yaxshi bino faqat chiroyli bo'lmaydi. U to'g'ri ishlaydi.", highlightRu: "Хорошее здание не просто красиво. Оно правильно работает." },
  ].map((s) => ({ id: genId(), ...s, active: true, createdAt: new Date().toISOString() }))
  await writeJson('services', defaults)
}

// ---------- Madaniyat elementlari (kv: 'culture-elements') ----------
async function ensureCultureElements() {
  const cur = await readJson('culture-elements', null)
  if (Array.isArray(cur)) return
  const defaults = [
    { titleUz: 'Tartib', titleRu: 'Порядок', descUz: "Qurilish maydonida tartib bo'lmasa, sifat ham, tezlik ham, iqtisodiy foyda ham xavf ostida qoladi.", descRu: "Если на стройплощадке нет порядка, под угрозой и качество, и скорость, и экономическая выгода.", detailsUz: "Har qanday katta loyihada tartib — tartibsizlik ichidagi tizim demakdir. Tartib yaratishda biz qoidalarga qat'iy amal qilamiz: maydon tozaligi, reja asosidagi to'g'ri harakatlar, har bir brigada va ishchining aniq o'rni.", detailsRu: "В любом крупном проекте порядок — это система внутри хаоса. Создавая порядок, мы строго следуем правилам: чистота площадки, верные действия по плану, чёткое место каждой бригады и рабочего.", principlesUz: ["Ish joyining tozaligi va tartibliligi", "Materiallarni to'g'ri saqlash va taqsimlash", "Brigada va xizmatlarning maydondagi aniq joylashuvi", "Xavfsizlik qoidalarining qat'iy bajarilishi", "Har kuni ish yakunida tozalash va ertangi kunga tayyorgarlik"], principlesRu: ["Чистота и порядок на рабочем месте", "Правильное хранение и распределение материалов", "Чёткое расположение бригад и служб на площадке", "Строгое соблюдение правил безопасности", "Ежедневная уборка в конце работ и подготовка к следующему дню"] },
    { titleUz: 'Hisob', titleRu: 'Расчёт', descUz: "Har bir material, har bir ish hajmi, har bir kun va har bir qaror hisobda bo'lishi kerak.", descRu: "Каждый материал, каждый объём работ, каждый день и каждое решение должны быть учтены.", detailsUz: "Xarajat, muddat, resurs — hammasi hisobga olingan sonlar. Taxmin va chamalab ish qilish katta loyihalarda o'rinsiz. Biz har bir so'm, har bir kub metr, har bir soat uchun javob beramiz.", detailsRu: "Расходы, сроки, ресурсы — всё это просчитанные цифры. Догадки и работа «на глаз» неуместны в крупных проектах. Мы отвечаем за каждый сум, каждый кубометр, каждый час.", principlesUz: ["Barcha xarajatlarning aniq o'lchovi va hisobi", "Materiallarning kelishi va sarflanishi hisobda", "Ishchilarga ish hajmiga qarab hisob va to'lov", "Vaqtning aniq grafik asosida o'lchanishi", "Foyda va tejamkorlikning birgalikda ta'minlanishi"], principlesRu: ["Точный учёт и расчёт всех расходов", "Поступление и расход материалов под учётом", "Расчёт и оплата рабочим по объёму работ", "Измерение времени по чёткому графику", "Совместное обеспечение прибыли и экономии"] },
    { titleUz: 'Intizom', titleRu: 'Дисциплина', descUz: "Belgilangan grafik, texnik talab va qabul mezonlari ish jarayonining asosiy qoidasi bo'ladi.", descRu: "Установленный график, технические требования и критерии приёмки — основное правило рабочего процесса.", detailsUz: "Intizom — jarayonning uzviyligi va har bir xodim o'z zimmasidagi vazifani aniq bilishi demakdir. Intizom bor joyda bosqichlar o'z vaqtida almashinadi va jarayon to'xtab qolmaydi.", detailsRu: "Дисциплина — это непрерывность процесса и чёткое понимание каждым сотрудником своей задачи. Там, где есть дисциплина, этапы сменяются вовремя и процесс не останавливается.", principlesUz: ["Qat'iy ish grafigi va muddat belgilash", "Texnik talablarning barcha xodimlarga ma'lum bo'lishi", "Jarayon tartibiga to'liq rioya qilish", "Har bir ish bosqichining aniq hisobi", "Qabul mezonlarining maydonda qo'llanilishi"], principlesRu: ["Строгий рабочий график и установка сроков", "Знание технических требований всеми сотрудниками", "Полное соблюдение порядка процесса", "Чёткий учёт каждого этапа работ", "Применение критериев приёмки на площадке"] },
    { titleUz: 'Hurmat', titleRu: 'Уважение', descUz: "Buyurtmachining vaqti, mablag'i va ishonchi hurmat qilinadi. Qurilish mijozni charchatadigan jarayon bo'lmasligi kerak.", descRu: "Время, средства и доверие заказчика уважаются. Строительство не должно быть процессом, утомляющим клиента.", detailsUz: "BARPO falsafasida mijoz — bu hamkor. Uning vaqti, mablag'i va ishonchi — qimmatli manba. Biz mijozni noaniqlik bilan charchatmaymiz: darhol tushuntiramiz, maslahat beramiz va muammoning yechimini taklif etamiz.", detailsRu: "В нашей философии клиент — это партнёр. Его время, средства и доверие — ценный ресурс. Мы не утомляем клиента неопределённостью: сразу объясняем, советуем и предлагаем решение проблемы.", principlesUz: ["Kunlik hisobot va jarayon haqida muntazam ma'lumot", "Tushuntirish va maslahat berish", "Muammolarni tezda hal qilish", "Muhim qarorlar oldidan mijozning roziligini olish", "Har kuni ishonchning ta'minlanishi"], principlesRu: ["Ежедневный отчёт и регулярная информация о процессе", "Разъяснение и консультирование", "Быстрое решение проблем", "Получение согласия клиента перед важными решениями", "Ежедневное укрепление доверия"] },
    { titleUz: 'Meros', titleRu: 'Наследие', descUz: "O'zbekiston me'moriy merosi bizga shuni o'rgatadi: mustahkam inshoot faqat material bilan emas, fikr, o'lchov va tartib bilan barpo bo'ladi.", descRu: "Архитектурное наследие Узбекистана учит нас: прочное сооружение создаётся не только материалом, но и мыслью, расчётом и порядком.", detailsUz: "Qadimiy o'zbek me'morchiligi — asrlar davomida to'plangan texnik bilim va badiiy tafakkur belgisidir. Girih naqshi, zanjira naqshi, turunj, koshin, gumbaz — bu detallarning har birida chuqur aql va hisob borligini ko'ramiz. BARPO shu merosga tayanadi.", detailsRu: "Древнее узбекское зодчество — знак технических знаний и художественного мышления, накопленных веками. Гирих, занджира, турундж, кошин, купол — в каждой из этих деталей мы видим глубокий ум и расчёт. Мы опираемся на это наследие.", principlesUz: ["Zamonaviy texnologiya va qadimiy me'moriy tafakkur birligi", "Har bir detal va konstruksiyaning ma'nosi", "Milliy o'ziga xoslikning saqlanishi", "Ishni faqat material bilan emas, fikr bilan qilish", "O'tmish va bugun o'rtasidagi tarixiy aloqani saqlash"], principlesRu: ["Единство современных технологий и древнего архитектурного мышления", "Смысл каждой детали и конструкции", "Сохранение национальной самобытности", "Делать работу не только материалом, но и мыслью", "Сохранение исторической связи между прошлым и настоящим"] },
  ].map((e) => ({ id: genId(), ...e, active: true, createdAt: new Date().toISOString() }))
  await writeJson('culture-elements', defaults)
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
  // DIQQAT: bo'sh satr ('') ham "string" turiga kiradi — shu sabab avvalgi
  // `typeof === 'string'` tekshiruvi bo'sh qiymatni ham "to'ldirilgan" deb
  // hisoblab, standart qiymatga hech qachon qaytmasdi. Endi bo'sh/bo'shliqdan
  // iborat qiymatlar ham standartga qaytadi.
  return [0, 1, 2].map((i) => {
    const v = a[i] && typeof a[i].value === 'string' ? a[i].value.trim() : ''
    const l = a[i] && typeof a[i].label === 'string' ? a[i].label.trim() : ''
    return {
      value: v || DEFAULT_STATS[i].value,
      label: l || DEFAULT_STATS[i].label,
    }
  })
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

// JSON so'rov tanasi uchun maksimal hajm — oddiy forma yuborishlari uchun
// bemalol yetarli, lekin xotira tugashi (DoS) xavfini oldini oladi.
const MAX_JSON_BODY_BYTES = 1 * 1024 * 1024 // 1MB

// JSON tana o'qish (adapter req._json bergan bo'lsa o'shani oladi)
async function getJson(req) {
  if (req._json !== undefined) return req._json || {}
  return await new Promise((resolve) => {
    // Chunk'larni Buffer sifatida yig'ib, oxirida bitta marta UTF-8'ga
    // aylantiramiz (chunk chegarasida bo'linib qolgan kirill/o'zbekcha
    // belgilar buzilib qolmasligi uchun).
    const chunks = []
    let total = 0
    let destroyed = false
    req.on('data', (c) => {
      if (destroyed) return
      const buf = Buffer.isBuffer(c) ? c : Buffer.from(c)
      total += buf.length
      if (total > MAX_JSON_BODY_BYTES) {
        destroyed = true
        try { req.destroy() } catch {}
        resolve({})
        return
      }
      chunks.push(buf)
    })
    req.on('end', () => {
      if (destroyed) return
      try {
        const data = Buffer.concat(chunks).toString('utf8')
        resolve(data ? JSON.parse(data) : {})
      } catch { resolve({}) }
    })
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
    // Brauzer deklaratsiya qilingan Content-Type'ni "sniff" qilib boshqacha
    // (masalan text/html) sifatida talqin qilmasin — stored-XSS'ga qo'shimcha to'siq.
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.end(buf)
  }
  const notFound = () => { res.statusCode = 404; res.end('Not found') }

  // Auth yordamchilari — sessiya tokeni orqali (parol emas). Token ikki joydan
  // qidiriladi: Authorization sarlavhasi (oddiy fetch so'rovlari) yoki ?token=
  // query-parametri (window.open / <a href> kabi to'g'ridan-to'g'ri navigatsiyalar,
  // ular maxsus sarlavha qo'sha olmaydi — lekin bu yerda ochiq parol emas, muddati
  // tugaydigan va bekor qilinadigan token yuriladi).
  const getAdmin = async () => {
    const authHeader = req.headers?.['authorization'] || ''
    const bearer = /^Bearer\s+(.+)$/i.exec(String(authHeader))?.[1]
    const token = bearer || q.get('token') || ''
    return await getSessionAdmin(token)
  }
  const requireAdmin = async () => {
    const a = await getAdmin()
    if (!a) { json(401, { ok: false, error: "Ruxsat yo'q — qaytadan tizimga kiring" }); return null }
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
    if (p === '/api/blog' && method === 'GET') {
      await ensureBlog()
      const id = q.get('id')
      const all = await readArray('blog')
      if (id) {
        const article = all.find((x) => x.id === id && x.status === 'published')
        if (!article) return json(404, { ok: false, error: 'Maqola topilmadi' })
        return json(200, { ok: true, article })
      }
      // Faqat chop etilgan (published) maqolalar
      return json(200, { ok: true, articles: all.filter((x) => x.status === 'published') })
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

    if (p === '/api/services' && method === 'GET') {
      await ensureServices()
      return json(200, { ok: true, services: (await readArray('services')).filter((s) => s.active !== false) })
    }
    if (p === '/api/culture-elements' && method === 'GET') {
      await ensureCultureElements()
      return json(200, { ok: true, cultureElements: (await readArray('culture-elements')).filter((e) => e.active !== false) })
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
    if (p === '/api/blog-image' && method === 'GET') {
      const id = q.get('id') || ''
      if (!id || /[\/\\]/.test(id) || id.includes('..')) { res.statusCode = 400; return res.end('Bad request') }
      const fp = await findImagePath('blog', id); if (!fp) return notFound()
      const f = await getFile('image', fp); if (!f) return notFound()
      return binary(f.contentType || mimeFromExt(extFromName(fp)), f.buffer)
    }

    // ===== Ommaviy POST'lar (forma) =====
    if (p === '/api/suggestions' && method === 'POST') {
      // Rate-limit IP asosida ishlaydi — so'rov tanasini o'qishdan OLDIN
      // tekshiramiz, shunda cheklovdan oshgan so'rovlar hech qachon xotiraga
      // to'liq o'qilmaydi (DoS xavfini kamaytiradi).
      const ip = getClientIp(req)
      if (!(await checkRateLimit(`suggestions:${ip}`, 3, 10 * 60 * 1000)))
        return json(429, { ok: false, error: "Juda ko'p so'rov yuborildingiz. 10 daqiqadan keyin qayta urinib ko'ring." })
      const body = await getJson(req)
      if (body._hp) return json(400, { ok: false, error: "Noto'g'ri so'rov." })
      if (!body.subject || !String(body.subject).trim() || !body.message || !String(body.message).trim())
        return json(400, { ok: false, error: 'Mavzu va xabar majburiy' })
      if (String(body.message).length > 5000 || String(body.subject).length > 300)
        return json(400, { ok: false, error: "Matn juda uzun." })
      if (body.phone && !isValidPhone(body.phone))
        return json(400, { ok: false, error: "Telefon raqamni to'g'ri kiriting" })
      const list = await readArray('suggestions')
      const rec = { id: genId(), fullName: body.fullName || '', phone: body.phone || '', category: body.category || '', subject: body.subject, message: body.message, submittedAt: new Date().toISOString() }
      list.unshift(rec); await writeArray('suggestions', list)
      await notifyNew('suggestion', 'taklif', { 'Mavzu': rec.subject, "Yo'nalish": rec.category, 'Xabar': rec.message, 'Ism': rec.fullName, 'Telefon': rec.phone, 'Sana': rec.submittedAt })
      return json(200, { ok: true })
    }
    if (p === '/api/contact' && method === 'POST') {
      const ip = getClientIp(req)
      if (!(await checkRateLimit(`contact:${ip}`, 3, 10 * 60 * 1000)))
        return json(429, { ok: false, error: "Juda ko'p so'rov yuborildingiz. 10 daqiqadan keyin qayta urinib ko'ring." })
      const body = await getJson(req)
      if (body._hp) return json(400, { ok: false, error: "Noto'g'ri so'rov." })
      if (!body.fullName || !String(body.fullName).trim() || !body.phone || !String(body.phone).trim())
        return json(400, { ok: false, error: 'Ism va telefon majburiy' })
      if (String(body.fullName).length > 200 || String(body.phone).length > 30 || String(body.message || '').length > 3000
        || String(body.email || '').length > 200 || String(body.company || '').length > 200)
        return json(400, { ok: false, error: "Matn juda uzun." })
      if (!isValidPhone(body.phone))
        return json(400, { ok: false, error: "Telefon raqamni to'g'ri kiriting" })
      if (body.email && !isValidEmail(body.email))
        return json(400, { ok: false, error: "Email manzilni to'g'ri kiriting" })
      const list = await readArray('contacts')
      const rec = { id: genId(), fullName: body.fullName, phone: body.phone, email: body.email || '', company: body.company || '', message: body.message || '', submittedAt: new Date().toISOString() }
      list.unshift(rec); await writeArray('contacts', list)
      await notifyNew('contact', "aloqa so'rovi", { 'Ism': rec.fullName, 'Telefon': rec.phone, 'Email': rec.email, 'Kompaniya': rec.company, 'Xabar': rec.message, 'Sana': rec.submittedAt })
      return json(200, { ok: true })
    }
    if (p === '/api/apply' && method === 'POST') {
      const body = fields(req)
      if (body._hp) return json(400, { ok: false, error: "Noto'g'ri so'rov." })
      const ip = getClientIp(req)
      if (!(await checkRateLimit(`apply:${ip}`, 2, 60 * 60 * 1000)))
        return json(429, { ok: false, error: "Siz allaqachon ariza yuborgansiz. 1 soatdan keyin qayta urinib ko'ring." })
      for (const key of ['fullName', 'field', 'phone'])
        if (!body[key] || !String(body[key]).trim()) return json(400, { ok: false, error: `Majburiy maydon to'ldirilmagan: ${key}` })
      if (String(body.fullName).length > 200 || String(body.phone).length > 30 || String(body.field).length > 100
        || String(body.email || '').length > 200 || String(body.contact || '').length > 200 || String(body.experienceYears || '').length > 10)
        return json(400, { ok: false, error: "Matn juda uzun." })
      if (!isValidPhone(body.phone))
        return json(400, { ok: false, error: "Telefon raqamni to'g'ri kiriting" })
      if (body.email && !isValidEmail(body.email))
        return json(400, { ok: false, error: "Email manzilni to'g'ri kiriting" })
      const id = genId()
      const safeName = String(body.fullName).trim().replace(/[^\p{L}\p{N}]+/gu, '_').slice(0, 60) || 'nomalum'
      const f = file(req)
      if (f && f.buffer) {
        const ext = extFromName(f.originalname).toLowerCase()
        if (!ALLOWED_RESUME_EXTS.has(ext))
          return json(400, { ok: false, error: "Rezyume fayli PDF, DOC, DOCX, RTF yoki TXT formatida bo'lishi kerak" })
      }
      const rec = {
        id, folder: id, fullName: body.fullName, field: body.field,
        experienceYears: body.experienceYears || '', phone: body.phone, email: body.email || '',
        contact: body.contact || '', status: 'pending', submittedAt: new Date().toISOString(),
        resumeFile: null,
      }
      if (f && f.buffer) {
        const ext = extFromName(f.originalname) || ''
        const resumeName = `rezyume${ext}`
        await putFile('resume', `${id}/${resumeName}`, f.buffer, 'application/octet-stream')
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
      const ip = getClientIp(req)
      if (!(await checkRateLimit(`admin-login:${ip}`, 8, 15 * 60 * 1000)))
        return json(429, { ok: false, error: "Juda ko'p urinish. 15 daqiqadan keyin qayta urinib ko'ring." })
      const body = await getJson(req)
      const username = String(body.username || '').trim()
      const password = String(body.password || '')
      const admins = await readAdmins()
      const admin = admins.find((a) => a.username === username)
      if (!admin || !verifyPassword(password, admin.password)) return json(401, { ok: false, error: "Login yoki parol noto'g'ri" })
      // Eski (xeshlanmagan) parolni birinchi muvaffaqiyatli kirishda darhol xeshlab qo'yamiz.
      if (!isPasswordHashed(admin.password)) {
        const idx = admins.findIndex((a) => a.username === username)
        admins[idx] = { ...admins[idx], password: hashPassword(password) }
        await writeAdmins(admins)
      }
      const token = await createSession(admin)
      await logHistory(admin.name, 'tizimga kirdi')
      return json(200, { ok: true, token, name: admin.name, username: admin.username, role: admin.role || 'admin' })
    }
    if (p === '/api/admin/logout' && method === 'POST') {
      const authHeader = req.headers?.['authorization'] || ''
      const bearer = /^Bearer\s+(.+)$/i.exec(String(authHeader))?.[1]
      await destroySession(bearer || q.get('token') || '')
      return json(200, { ok: true })
    }

    // ===== ADMIN: barcha ma'lumot =====
    // Har bir bo'lim faqat shu adminning perms'ida ruxsat berilgan bo'lsagina qaytariladi
    // (superadmin uchun hammasi) — ilgari BARCHA ma'lumot har qanday autentifikatsiyalangan
    // adminga (hatto ruxsati bo'lmasa ham) qaytardi.
    if (p === '/api/admin/data' && method === 'GET') {
      const admin = await requireAdmin(); if (!admin) return
      await ensureOrnaments(); await ensureStandards(); await ensureInvestors(); await ensureBlog(); await ensureServices(); await ensureCultureElements()
      const isSuper = admin.role === 'superadmin'
      const can = (key) => isSuper || admin.perms?.[key] !== false
      let tasks = await readArray('tasks')
      if (!isSuper) tasks = tasks.filter((t) => t.assignee === admin.username)
      const data = {
        // Audit-log boshqa adminlarning ismi va ruxsati yo'q bo'limlardagi
        // amallarni ham o'z ichiga oladi — shuning uchun faqat superadminga
        // ko'rsatiladi (boshqa hamma maydon kabi `can()` bilan emas, chunki
        // bitta maydon o'zi ko'plab bo'lim haqida metama'lumot tashiydi).
        history: isSuper ? (await readArray('history')).slice(0, 50) : [],
        tasks,
        me: { username: admin.username, name: admin.name, role: admin.role || 'admin', perms: isSuper ? defaultPerms(true) : (admin.perms || defaultPerms(true)) },
        // Parol hech qachon klientga qaytarilmaydi — faqat kerakli maydonlar.
        admins: isSuper ? (await readAdmins()).map((a) => ({ username: a.username, name: a.name, role: a.role, perms: a.perms })) : undefined,
      }
      if (can('hr')) data.hr = await readHrApplications()
      if (can('offers')) data.offers = await readArray('offers')
      if (can('suggestions')) data.suggestions = await readArray('suggestions')
      if (can('contacts')) data.contacts = await readArray('contacts')
      if (can('projects')) data.projects = await readArray('projects')
      if (can('ornaments')) data.ornaments = await readArray('ornaments')
      if (can('standards')) data.standards = await readArray('standards')
      if (can('investors')) data.investors = await readArray('investors')
      if (can('blog')) data.blog = await readArray('blog')
      // "sections" (Bo'lim rasmlari) ruxsatiga ega admin bu ro'yxatlarni FAQAT
      // rasm-slot yorliqlarini (id+sarlavha) ko'rsatish uchun ko'radi — to'liq
      // "services"/"culture" CRUD ruxsati bo'lmasa ham, aks holda sectionImageGroups()
      // bu ikki guruhni butunlay bo'sh/ko'rinmas qilib qo'yardi.
      if (can('services') || can('sections')) data.services = await readArray('services')
      if (can('culture') || can('sections')) data.cultureElements = await readArray('culture-elements')
      return json(200, { ok: true, data })
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
          notifyEmails: cleanList(body.notifyEmails, cur.notifyEmails),
          notifyEmailsByType: (() => { const curNE = cur.notifyEmailsByType || {}; const bodyNE = body.notifyEmailsByType || {}; const out = {}; for (const k of ['hr', 'suggestion', 'contact']) out[k] = cleanList(bodyNE[k], curNE[k]); return out })(),
          smtp: (() => { const cS = cur.smtp || {}; const bS = body.smtp || {}; const out = {}; for (const k of ['host', 'port', 'user', 'pass', 'from']) out[k] = bS[k] != null ? String(bS[k]).trim() : (cS[k] || ''); out.secure = typeof bS.secure === 'boolean' ? bS.secure : !!cS.secure; return out })(),
          sheetsWebhook: body.sheetsWebhook != null ? String(body.sheetsWebhook).trim() : (cur.sheetsWebhook || ''),
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
    if (p === '/api/admin/test-email' && method === 'POST') {
      const admin = await requirePerm('settings'); if (!admin) return
      const type = q.get('type') || 'general'
      const s = await readSettings()
      const to = type === 'general' ? (s.notifyEmails || []).map((x) => String(x).trim()).filter(Boolean) : emailRecipientsForType(s, type)
      if (!s.smtp?.host || !s.smtp?.user || !s.smtp?.pass) return json(400, { ok: false, error: 'SMTP sozlamalari to\'liq emas (host, foydalanuvchi, parol)' })
      if (!to.length) return json(400, { ok: false, error: "Email ro'yxati bo'sh" })
      const labels = { general: 'Umumiy', hr: 'HR arizalari', suggestion: 'Kelgan takliflar', contact: "Aloqa so'rovlari" }
      const result = await sendEmail(to, `BARPO — test xabar (${labels[type] || type})`, '<p>Email bildirishnomalar to\'g\'ri ishlayapti.</p>', s.smtp)
      if (!result.ok) return json(400, { ok: false, error: result.error })
      return json(200, { ok: true })
    }

    // ===== SUPERADMIN: adminlar =====
    if (p === '/api/admin/admins') {
      const admin = await requireSuper(); if (!admin) return
      const MIN_PASSWORD_LEN = 8
      const stripPass = (a) => ({ username: a.username, name: a.name, role: a.role, perms: a.perms })
      let admins = await readAdmins()
      if (method === 'GET') return json(200, { ok: true, admins: admins.map(stripPass) })
      if (method !== 'POST') return json(405, { ok: false, error: 'Method Not Allowed' })
      const body = await getJson(req); const action = body.action
      if (action === 'create') {
        const username = String(body.username || '').trim(); const password = String(body.password || '').trim()
        const name = String(body.name || '').trim() || username
        if (!username || !password) return json(400, { ok: false, error: 'Login va parol majburiy' })
        if (password.length < MIN_PASSWORD_LEN) return json(400, { ok: false, error: `Parol kamida ${MIN_PASSWORD_LEN} belgidan iborat bo'lishi kerak` })
        if (admins.some((a) => a.username === username)) return json(400, { ok: false, error: 'Bu login band' })
        const perms = {}; for (const k of PERM_KEYS) perms[k] = body.perms && body.perms[k] === false ? false : true
        const role = body.role === 'superadmin' ? 'superadmin' : 'admin'
        admins.push({ username, password: hashPassword(password), name, role, perms })
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
        if (body.password && String(body.password).trim()) {
          const pw = String(body.password).trim()
          if (pw.length < MIN_PASSWORD_LEN) return json(400, { ok: false, error: `Parol kamida ${MIN_PASSWORD_LEN} belgidan iborat bo'lishi kerak` })
          target.password = hashPassword(pw)
        }
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
      return json(200, { ok: true, admins: admins.map(stripPass) })
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
      if (!folder || !fileName || folder.includes('..') || fileName.includes('..') || /[\/\\]/.test(folder) || /[\/\\]/.test(fileName))
        return json(400, { ok: false, error: "Noto'g'ri yo'l" })
      const rec = (await readArray('hr')).find((x) => (x.folder || x.id) === folder)
      if (!rec) return json(404, { ok: false, error: 'Ariza topilmadi' })
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
      const cell = (v) => '"' + csvSafe(v).replace(/"/g, '""') + '"'
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
      if (action === 'create') { items.unshift({ id: genId(), ...pickBilingual(body, STANDARD_FIELDS), title: body.title || 'Nomsiz', active: true, createdAt: new Date().toISOString() }); await logHistory(admin.name, `yangi standart qo'shdi: "${body.title || ''}"`) }
      else if (action === 'update') { items = items.map((s) => s.id === body.id ? mergeBilingual(s, body, STANDARD_FIELDS) : s); await logHistory(admin.name, `standartni tahrirladi: "${body.title || ''}"`) }
      else if (action === 'toggle') { let st = true; items = items.map((s) => { if (s.id === body.id) { st = !(s.active !== false); return { ...s, active: st } } return s }); const it = items.find((s) => s.id === body.id); await logHistory(admin.name, `standartni ${st ? "ko'rsatdi" : 'yashirdi'}: "${it ? it.title : ''}"`) }
      else if (action === 'delete') { const it = items.find((s) => s.id === body.id); items = items.filter((s) => s.id !== body.id); await logHistory(admin.name, `standartni o'chirdi: "${it ? it.title : ''}"`) }
      else return json(400, { ok: false, error: "Noma'lum amal" })
      await writeArray('standards', items); return json(200, { ok: true, standards: items })
    }
    if (p === '/api/admin/investors' && method === 'POST') {
      const admin = await requirePerm('investors'); if (!admin) return
      await ensureInvestors(); const body = await getJson(req); const action = body.action
      let items = await readArray('investors')
      if (action === 'create') { items.unshift({ id: genId(), ...pickBilingual(body, INVESTOR_FIELDS), title: body.title || 'Nomsiz', active: true, createdAt: new Date().toISOString() }); await logHistory(admin.name, `yangi investor bo'limi qo'shdi: "${body.title || ''}"`) }
      else if (action === 'update') { items = items.map((s) => s.id === body.id ? mergeBilingual(s, body, INVESTOR_FIELDS) : s); await logHistory(admin.name, `investor bo'limini tahrirladi: "${body.title || ''}"`) }
      else if (action === 'toggle') { let st = true; items = items.map((s) => { if (s.id === body.id) { st = !(s.active !== false); return { ...s, active: st } } return s }); const it = items.find((s) => s.id === body.id); await logHistory(admin.name, `investor bo'limini ${st ? "ko'rsatdi" : 'yashirdi'}: "${it ? it.title : ''}"`) }
      else if (action === 'delete') { const it = items.find((s) => s.id === body.id); items = items.filter((s) => s.id !== body.id); await logHistory(admin.name, `investor bo'limini o'chirdi: "${it ? it.title : ''}"`) }
      else return json(400, { ok: false, error: "Noma'lum amal" })
      await writeArray('investors', items); return json(200, { ok: true, investors: items })
    }
    if (p === '/api/admin/offers' && method === 'POST') {
      const admin = await requirePerm('offers'); if (!admin) return
      const body = await getJson(req); const action = body.action
      let offers = await readArray('offers')
      if (action === 'create') { offers.unshift({ id: genId(), ...pickBilingual(body, OFFER_FIELDS), title: body.title || 'Nomsiz taklif', active: true, createdAt: new Date().toISOString() }); await logHistory(admin.name, `yangi taklif qo'shdi: "${body.title || ''}"`) }
      else if (action === 'update') { offers = offers.map((o) => o.id === body.id ? mergeBilingual(o, body, OFFER_FIELDS) : o); await logHistory(admin.name, `taklifni tahrirladi: "${body.title}"`) }
      else if (action === 'toggle') { let st = true; offers = offers.map((o) => { if (o.id === body.id) { st = !(o.active !== false); return { ...o, active: st } } return o }); const of = offers.find((o) => o.id === body.id); await logHistory(admin.name, `taklifni ${st ? "ko'rsatdi" : 'yashirdi'}: "${of?.title || ''}"`) }
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

    if (p === '/api/admin/services' && method === 'POST') {
      const admin = await requirePerm('services'); if (!admin) return
      await ensureServices(); const body = await getJson(req); const action = body.action
      let items = await readArray('services')
      if (action === 'create') { items.unshift({ id: genId(), titleUz: body.titleUz || 'Nomsiz', titleRu: body.titleRu || '', descUz: body.descUz || '', descRu: body.descRu || '', highlightUz: body.highlightUz || '', highlightRu: body.highlightRu || '', active: true, createdAt: new Date().toISOString() }); await logHistory(admin.name, `yangi xizmat qo'shdi: "${body.titleUz || ''}"`) }
      else if (action === 'update') { items = items.map((s) => s.id === body.id ? { ...s, titleUz: body.titleUz, titleRu: body.titleRu, descUz: body.descUz, descRu: body.descRu, highlightUz: body.highlightUz, highlightRu: body.highlightRu } : s); await logHistory(admin.name, `xizmatni tahrirladi: "${body.titleUz || ''}"`) }
      else if (action === 'toggle') { let st = true; items = items.map((s) => { if (s.id === body.id) { st = !(s.active !== false); return { ...s, active: st } } return s }); const it = items.find((s) => s.id === body.id); await logHistory(admin.name, `xizmatni ${st ? "ko'rsatdi" : 'yashirdi'}: "${it ? it.titleUz : ''}"`) }
      else if (action === 'delete') { const it = items.find((s) => s.id === body.id); items = items.filter((s) => s.id !== body.id); await logHistory(admin.name, `xizmatni o'chirdi: "${it ? it.titleUz : ''}"`) }
      else return json(400, { ok: false, error: "Noma'lum amal" })
      await writeArray('services', items); return json(200, { ok: true, services: items })
    }
    if (p === '/api/admin/culture-elements' && method === 'POST') {
      const admin = await requirePerm('culture'); if (!admin) return
      await ensureCultureElements(); const body = await getJson(req); const action = body.action
      let items = await readArray('culture-elements')
      const toArr = (v) => Array.isArray(v) ? v : (typeof v === 'string' ? v.split('\n').map((x) => x.trim()).filter(Boolean) : [])
      if (action === 'create') { items.unshift({ id: genId(), titleUz: body.titleUz || 'Nomsiz', titleRu: body.titleRu || '', descUz: body.descUz || '', descRu: body.descRu || '', detailsUz: body.detailsUz || '', detailsRu: body.detailsRu || '', principlesUz: toArr(body.principlesUz), principlesRu: toArr(body.principlesRu), active: true, createdAt: new Date().toISOString() }); await logHistory(admin.name, `yangi madaniyat elementi qo'shdi: "${body.titleUz || ''}"`) }
      else if (action === 'update') { items = items.map((e) => e.id === body.id ? { ...e, titleUz: body.titleUz, titleRu: body.titleRu, descUz: body.descUz, descRu: body.descRu, detailsUz: body.detailsUz, detailsRu: body.detailsRu, principlesUz: toArr(body.principlesUz), principlesRu: toArr(body.principlesRu) } : e); await logHistory(admin.name, `madaniyat elementini tahrirladi: "${body.titleUz || ''}"`) }
      else if (action === 'toggle') { let st = true; items = items.map((e) => { if (e.id === body.id) { st = !(e.active !== false); return { ...e, active: st } } return e }); const it = items.find((e) => e.id === body.id); await logHistory(admin.name, `madaniyat elementini ${st ? "ko'rsatdi" : 'yashirdi'}: "${it ? it.titleUz : ''}"`) }
      else if (action === 'delete') { const it = items.find((e) => e.id === body.id); items = items.filter((e) => e.id !== body.id); await logHistory(admin.name, `madaniyat elementini o'chirdi: "${it ? it.titleUz : ''}"`) }
      else return json(400, { ok: false, error: "Noma'lum amal" })
      await writeArray('culture-elements', items); return json(200, { ok: true, cultureElements: items })
    }

    // ===== ADMIN: rasm bilan (multipart) — naqsh / loyiha / bo'lim =====
    if (p === '/api/admin/ornaments' && method === 'POST') {
      const admin = await requirePerm('ornaments'); if (!admin) return
      await ensureOrnaments(); const body = fields(req); const action = body.action; const f = file(req)
      let items = await readArray('ornaments')
      // DIQQAT: klient bergan f.mimetype'ga ISHONMAYMIZ (uni istalgan qiymatga
      // o'zgartirish mumkin) — saqlanadigan Content-Type kengaytmadan olingan
      // qat'iy ro'yxat (mimeFromExt) orqali aniqlanadi, shu bilan stored-XSS
      // (masalan text/html deb yuklangan fayl) imkonsiz bo'ladi.
      const saveImg = async (id) => { if (!f || !f.buffer) return; const old = await listFiles('image', 'ornament'); await deleteFiles('image', old.filter((n) => n.startsWith(id + '.')).map((n) => `ornament/${n}`)); const ext = extFromName(f.originalname) || '.jpg'; await putFile('image', `ornament/${id}${ext}`, f.buffer, mimeFromExt(ext)) }
      if (action === 'create') { const id = genId(); await saveImg(id); items.unshift({ id, ...pickBilingual(body, ORNAMENT_FIELDS), hasImage: !!(f && f.buffer), active: true, createdAt: new Date().toISOString() }); await logHistory(admin.name, `yangi naqsh qo'shdi: "${body.old || ''}"`) }
      else if (action === 'update') { await saveImg(body.id); items = items.map((o) => o.id === body.id ? mergeBilingual({ ...o, hasImage: (f && f.buffer) ? true : o.hasImage }, body, ORNAMENT_FIELDS) : o); await logHistory(admin.name, `naqshni tahrirladi: "${body.old || ''}"`) }
      else if (action === 'toggle') { let st = true; items = items.map((o) => { if (o.id === body.id) { st = !(o.active !== false); return { ...o, active: st } } return o }); const it = items.find((o) => o.id === body.id); await logHistory(admin.name, `naqshni ${st ? "ko'rsatdi" : 'yashirdi'}: "${it ? it.old : ''}"`) }
      else if (action === 'delete') { const it = items.find((o) => o.id === body.id); items = items.filter((o) => o.id !== body.id); const old = await listFiles('image', 'ornament'); await deleteFiles('image', old.filter((n) => n.startsWith(body.id + '.')).map((n) => `ornament/${n}`)); await logHistory(admin.name, `naqshni o'chirdi: "${it ? it.old : ''}"`) }
      else return json(400, { ok: false, error: "Noma'lum amal" })
      await writeArray('ornaments', items); return json(200, { ok: true, ornaments: items })
    }
    if (p === '/api/admin/projects' && method === 'POST') {
      const admin = await requirePerm('projects'); if (!admin) return
      const body = fields(req); const action = body.action; const f = file(req)
      let projects = await readArray('projects')
      const saveImg = async (id) => { if (!f || !f.buffer) return; const old = await listFiles('image', 'project'); await deleteFiles('image', old.filter((n) => n.startsWith(id + '.')).map((n) => `project/${n}`)); const ext = extFromName(f.originalname) || '.jpg'; await putFile('image', `project/${id}${ext}`, f.buffer, mimeFromExt(ext)) }
      if (action === 'create') {
        const id = genId(); await saveImg(id)
        projects.unshift({ id, ...pickBilingual(body, PROJECT_FIELDS), name: body.name || 'Nomsiz loyiha', year: body.year || '', hasImage: !!(f && f.buffer), active: true, createdAt: new Date().toISOString() })
        await logHistory(admin.name, `yangi loyiha qo'shdi: "${body.name || 'Nomsiz loyiha'}"`)
      } else if (action === 'update') {
        await saveImg(body.id)
        projects = projects.map((pr) => pr.id === body.id ? mergeBilingual({ ...pr, year: body.year !== undefined ? body.year : pr.year, hasImage: (f && f.buffer) ? true : pr.hasImage }, body, PROJECT_FIELDS) : pr)
        await logHistory(admin.name, `loyihani tahrirladi: "${body.name}"`)
      } else if (action === 'toggle') { let st = true; projects = projects.map((pr) => { if (pr.id === body.id) { st = !(pr.active !== false); return { ...pr, active: st } } return pr }); const pr = projects.find((x) => x.id === body.id); await logHistory(admin.name, `loyihani ${st ? "ko'rsatdi" : 'yashirdi'}: "${pr?.name || ''}"`) }
      else if (action === 'delete') { const pr = projects.find((x) => x.id === body.id); projects = projects.filter((x) => x.id !== body.id); const old = await listFiles('image', 'project'); await deleteFiles('image', old.filter((n) => n.startsWith(body.id + '.')).map((n) => `project/${n}`)); await logHistory(admin.name, `loyihani o'chirdi: "${pr?.name || ''}"`) }
      else return json(400, { ok: false, error: "Noma'lum amal" })
      await writeArray('projects', projects); return json(200, { ok: true, projects })
    }
    if (p === '/api/admin/blog' && method === 'POST') {
      const admin = await requirePerm('blog'); if (!admin) return
      await ensureBlog(); const body = fields(req); const action = body.action; const f = file(req)
      let items = await readArray('blog')
      const saveImg = async (id) => { if (!f || !f.buffer) return; const old = await listFiles('image', 'blog'); await deleteFiles('image', old.filter((n) => n.startsWith(id + '.')).map((n) => `blog/${n}`)); const ext = extFromName(f.originalname) || '.jpg'; await putFile('image', `blog/${id}${ext}`, f.buffer, mimeFromExt(ext)) }
      if (action === 'create') {
        const id = genId(); await saveImg(id)
        items.unshift({ id, ...pickBilingual(body, BLOG_FIELDS), title: body.title || 'Nomsiz maqola', hasImage: !!(f && f.buffer), status: 'draft', createdAt: new Date().toISOString(), publishedAt: null })
        await logHistory(admin.name, `yangi maqola (qoralama) qo'shdi: "${body.title || ''}"`)
      } else if (action === 'update') {
        await saveImg(body.id)
        items = items.map((a) => a.id === body.id ? mergeBilingual({ ...a, hasImage: (f && f.buffer) ? true : a.hasImage }, body, BLOG_FIELDS) : a)
        await logHistory(admin.name, `maqolani tahrirladi: "${body.title || ''}"`)
      } else if (action === 'publish') {
        items = items.map((a) => a.id === body.id ? { ...a, status: 'published', publishedAt: a.publishedAt || new Date().toISOString() } : a)
        const it = items.find((a) => a.id === body.id); await logHistory(admin.name, `maqolani chop etdi: "${it ? it.title : ''}"`)
      } else if (action === 'unpublish') {
        items = items.map((a) => a.id === body.id ? { ...a, status: 'draft' } : a)
        const it = items.find((a) => a.id === body.id); await logHistory(admin.name, `maqolani qoralamaga qaytardi: "${it ? it.title : ''}"`)
      } else if (action === 'delete') {
        const it = items.find((a) => a.id === body.id); items = items.filter((a) => a.id !== body.id)
        const old = await listFiles('image', 'blog'); await deleteFiles('image', old.filter((n) => n.startsWith(body.id + '.')).map((n) => `blog/${n}`))
        await logHistory(admin.name, `maqolani o'chirdi: "${it ? it.title : ''}"`)
      } else return json(400, { ok: false, error: "Noma'lum amal" })
      await writeArray('blog', items); return json(200, { ok: true, blog: items })
    }
    if (p === '/api/admin/section-image' && method === 'POST') {
      const admin = await requirePerm('sections'); if (!admin) return
      const body = fields(req); const key = String(body.key || ''); const f = file(req)
      if (!/^[a-z0-9-]+$/.test(key)) return json(400, { ok: false, error: "Noto'g'ri kalit" })
      const old = await listFiles('image', 'section')
      const removeOld = async () => { await deleteFiles('image', old.filter((n) => n.startsWith(key + '.')).map((n) => `section/${n}`)) }
      if (body.action === 'delete') { await removeOld(); await logHistory(admin.name, `bo'lim rasmini o'chirdi: ${key}`); return json(200, { ok: true }) }
      if (!f || !f.buffer) return json(400, { ok: false, error: 'Rasm tanlanmagan' })
      await removeOld(); const ext = extFromName(f.originalname) || '.jpg'; await putFile('image', `section/${key}${ext}`, f.buffer, mimeFromExt(ext))
      await logHistory(admin.name, `bo'lim rasmini yangiladi: ${key}`)
      return json(200, { ok: true })
    }

    // Topilmadi
    return json(404, { ok: false, error: 'API topilmadi' })
  } catch (e) {
    // To'liq xato faqat server logiga yoziladi — mijozga ichki tuzilma haqida
    // ma'lumot bermaydigan umumiy xabar qaytariladi.
    console.error('[api]', p, e?.stack || e?.message || e)
    return json(500, { ok: false, error: "Server xatosi. Birozdan so'ng qayta urinib ko'ring." })
  }
}
