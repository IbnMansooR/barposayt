import { defineConfig } from 'vite'
import path from 'path'
import fs from 'fs'
import multer from 'multer'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import nodemailer from 'nodemailer'
import { runBackup, getLastBackupTime } from './scripts/backup.mjs'

// ===== ADMINLAR =====
// 5 ta admin. Har biri alohida login/parol bilan, o'z qurilmasidan kiradi.
// MUHIM: bu yerdagi username/parollarni o'zingiznikiga almashtiring.
const ADMINS = [
  { username: 'jamshid', password: 'jamshid2026', name: 'Jamshid' },
  { username: 'admin2', password: 'admin2_2026', name: 'Admin 2' },
  { username: 'admin3', password: 'admin3_2026', name: 'Admin 3' },
  { username: 'admin4', password: 'admin4_2026', name: 'Admin 4' },
  { username: 'admin5', password: 'admin5_2026', name: 'Admin 5' },
]

// ===== ADMIN BOSHQARUVI (superadmin tizimi) =====
// Bosh admin (superadmin) — faqat u boshqa adminlarni boshqara oladi:
// login/parol almashtirish, ruxsat berish/olish, topshiriq berish.
const SUPERADMIN_USERNAME = 'jamshid'

// Har bir bo'lim uchun ruxsat kalitlari
const PERM_KEYS = ['projects', 'ornaments', 'offers', 'standards', 'investors', 'sections', 'stats', 'suggestions', 'hr', 'contacts', 'settings']

function defaultPerms(value = true) {
  const o = {}
  for (const k of PERM_KEYS) o[k] = value
  return o
}

// Adminlar endi data/admins.json da saqlanadi (birinchi ishga tushishda ADMINS dan ko'chiriladi)
function readAdmins() {
  ensureDataDir()
  const f = path.join(DATA_DIR, 'admins.json')
  if (!fs.existsSync(f)) {
    const seeded = ADMINS.map((a) => ({
      username: a.username,
      password: a.password,
      name: a.name,
      role: a.username === SUPERADMIN_USERNAME ? 'superadmin' : 'admin',
      perms: defaultPerms(true),
    }))
    fs.writeFileSync(f, JSON.stringify(seeded, null, 2), 'utf8')
    return seeded
  }
  try {
    const arr = JSON.parse(fs.readFileSync(f, 'utf8'))
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function writeAdmins(list) {
  ensureDataDir()
  fs.writeFileSync(path.join(DATA_DIR, 'admins.json'), JSON.stringify(list, null, 2), 'utf8')
}

// Audit log: kim, nima, qachon qilgani (oxirgi 100 ta saqlanadi)
function logHistory(actor, action) {
  const list = readJsonArray('history.json')
  list.unshift({ id: genId(), actor, action, time: new Date().toISOString() })
  writeJsonArray('history.json', list.slice(0, 100))
}

// ---- Avtomatik backup: sayt ishlayotganda har 3 kunda lokal nusxa ----
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000

function autoBackup() {
  return {
    name: 'auto-backup',
    configureServer() {
      const root = __dirname
      const check = () => {
        try {
          const last = getLastBackupTime(root)
          if (Date.now() - last >= THREE_DAYS_MS) {
            const dest = runBackup(root)
            if (dest) console.log('[backup] Avtomatik backup yaratildi:', dest)
          }
        } catch (e) {
          console.error('[backup] xato:', e?.message || e)
        }
      }
      check() // server ishga tushganda darhol tekshiradi
      // Har 6 soatda tekshiradi — oxirgi backupdan 3 kun o'tgan bo'lsa, yangi backup qiladi.
      const timer = setInterval(check, 6 * 60 * 60 * 1000)
      if (timer.unref) timer.unref()
    },
  }
}

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

// ---- Ma'lumotlar bazasi (oddiy JSON fayllar) ----
const DATA_DIR = path.resolve(__dirname, 'data')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

function readJsonArray(name) {
  ensureDataDir()
  const file = path.join(DATA_DIR, name)
  if (!fs.existsSync(file)) return []
  try {
    const raw = fs.readFileSync(file, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeJsonArray(name, arr) {
  ensureDataDir()
  fs.writeFileSync(path.join(DATA_DIR, name), JSON.stringify(arr, null, 2), 'utf8')
}

// ===== SOZLAMALAR (email + Google Sheets) =====
function readSettings() {
  ensureDataDir()
  const f = path.join(DATA_DIR, 'settings.json')
  const emptyTg = () => ({ botToken: '', chatIds: [] })
  const defaultSocials = () => ({
    telegram: 'https://t.me/barpo_etamiz',
    instagram: 'https://www.instagram.com/barpo.official',
    facebook: '',
    youtube: '',
  })
  const defaultContactInfo = () => ({
    phone: '+998 (90) 123-45-67',
    email: 'info@barpo.uz',
    address: "Toshkent, Mirzo Ulug'bek tumani, A.Navoiy ko'chasi, 100-uy",
  })
  const empty = {
    notifyEmails: [], notifyEmailsByType: { hr: [], suggestion: [], contact: [] }, smtp: {}, sheetsWebhook: '',
    telegram: emptyTg(),
    telegramByType: { hr: emptyTg(), suggestion: emptyTg(), contact: emptyTg() },
    socials: defaultSocials(),
    contactInfo: defaultContactInfo(),
  }
  if (!fs.existsSync(f)) return empty
  try {
    const s = JSON.parse(fs.readFileSync(f, 'utf8'))
    if (!s.notifyEmailsByType) s.notifyEmailsByType = { hr: [], suggestion: [], contact: [] }
    if (!s.telegram) s.telegram = emptyTg()
    if (!s.telegramByType) s.telegramByType = { hr: emptyTg(), suggestion: emptyTg(), contact: emptyTg() }
    for (const k of ['hr', 'suggestion', 'contact']) { if (!s.telegramByType[k]) s.telegramByType[k] = emptyTg() }
    if (!s.socials) s.socials = defaultSocials()
    if (!s.contactInfo) s.contactInfo = defaultContactInfo()
    return s
  } catch { return empty }
}

// Tur bo'yicha qabul pochtalari: maxsus ro'yxat bo'lsa — o'sha, bo'lmasa umumiy ro'yxat
function emailsForType(type) {
  const s = readSettings()
  const byType = (s.notifyEmailsByType || {})[type] || []
  return byType.length ? byType : (s.notifyEmails || [])
}
function writeSettings(s) {
  ensureDataDir()
  fs.writeFileSync(path.join(DATA_DIR, 'settings.json'), JSON.stringify(s, null, 2), 'utf8')
}

function htmlEscape(v) {
  return String(v == null ? '' : v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// SMTP transport (sozlamalar to'liq bo'lsa). Aks holda null.
function getTransport() {
  const m = readSettings().smtp || {}
  if (!m.host || !m.user || !m.pass) return null
  return nodemailer.createTransport({
    host: m.host,
    port: Number(m.port) || 587,
    secure: !!m.secure || Number(m.port) === 465,
    auth: { user: m.user, pass: m.pass },
  })
}

// Email yuborish (xato bo'lsa jim o'tadi — sayt ishlashiga xalal bermaydi)
async function sendMail(to, subject, html) {
  try {
    const list = (Array.isArray(to) ? to : [to]).filter(Boolean)
    if (!list.length) return
    const tr = getTransport()
    if (!tr) return
    const s = readSettings()
    const from = (s.smtp && (s.smtp.from || s.smtp.user)) || undefined
    await tr.sendMail({ from, to: list.join(','), subject, html })
  } catch (e) { console.error('[mail] xato:', e?.message || e) }
}

// Telegram bot orqali xabar yuborish (xato bo'lsa jim o'tadi)
// Tur bo'yicha bot sozlamasi: maxsus bot kiritilgan bo'lsa — o'sha, bo'lmasa umumiy bot
function tgConfigForType(type) {
  const s = readSettings()
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
    const { token, chatIds } = type === 'general'
      ? tgConfigForType('__none__') // umumiy bot
      : tgConfigForType(type)
    if (!token || !chatIds.length) return results
    for (const chatId of chatIds) {
      try {
        const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
        })
        const j = await r.json().catch(() => ({}))
        if (j.ok) results.push({ chatId, ok: true })
        else {
          results.push({ chatId, ok: false, error: j.description || `HTTP ${r.status}` })
          console.error(`[telegram] ${chatId} xato:`, j.description || r.status)
        }
      } catch (e) {
        results.push({ chatId, ok: false, error: e?.message || 'tarmoq xatosi' })
        console.error('[telegram] xato:', e?.message || e)
      }
    }
  } catch (e) { console.error('[telegram] xato:', e?.message || e) }
  return results
}

// Telegram botga fayl (rezyume) yuborish
async function sendTelegramDocument(buffer, filename, caption, type = 'general') {
  try {
    const { token, chatIds } = tgConfigForType(type)
    if (!token || !chatIds.length || !buffer) return
    for (const chatId of chatIds) {
      const fd = new FormData()
      fd.append('chat_id', chatId)
      if (caption) fd.append('caption', caption)
      fd.append('document', new Blob([buffer]), filename || 'rezyume')
      await fetch(`https://api.telegram.org/bot${token}/sendDocument`, { method: 'POST', body: fd })
    }
  } catch (e) { console.error('[telegram] fayl xato:', e?.message || e) }
}

// Google Sheets webhook (Apps Script) ga qator qo'shish
async function pushToSheet(type, row) {
  try {
    const s = readSettings()
    if (!s.sheetsWebhook) return
    await fetch(s.sheetsWebhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, row, at: new Date().toISOString() }),
    })
  } catch (e) { console.error('[sheets] xato:', e?.message || e) }
}

// Yangi murojaat kelganda: belgilangan pochtalarga email + Google Sheets ga yozadi
async function notifyNew(type, titleUz, record) {
  // Bildirishnomalar faqat Telegram orqali yuboriladi (email o'chirilgan)
  const tgLines = Object.entries(record).map(([k, v]) => `<b>${htmlEscape(k)}:</b> ${htmlEscape(v)}`).join('\n')
  await sendTelegram(`🔔 <b>BARPO — yangi ${htmlEscape(titleUz)}</b>\n\n${tgLines}`, type)
}

// CSV (Excel/Google Sheets ochadigan) matn yasaydi
function toCsv(headers, rows) {
  const cell = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"'
  const lines = [headers.map(cell).join(',')]
  for (const r of rows) lines.push(r.map(cell).join(','))
  return '﻿' + lines.join('\r\n')
}

// Naqshlar (Tarixiy aloqa) — fayl bo'lmasa, dastlabki 4 ta naqsh bilan to'ldiradi
function ensureOrnaments() {
  ensureDataDir()
  const file = path.join(DATA_DIR, 'ornaments.json')
  if (fs.existsSync(file)) return
  const defaults = [
    { old: 'Girih naqshi', new: 'Zamonaviy grid va reja', desc: 'Geometrik aniqlik qadimdan ham, bugun ham asosiy qoida' },
    { old: 'Zanjira naqshi', new: 'Jarayon uzviyligi', desc: "Har bir detal va bosqich bir-biriga bog'langan" },
    { old: 'Turunj (markaz)', new: 'Markaziy boshqaruv', desc: 'Hammaning markaz atrofida tartibiy harakatlari' },
    { old: 'Koshin (plitkalar)', new: 'Zamonaviy fasad paneli', desc: 'Material integratsiyasi va chidamlilik' },
  ].map((o) => ({
    id: genId(), old: o.old, new: o.new, desc: o.desc, history: '',
    hasImage: false, active: true, createdAt: new Date().toISOString(),
  }))
  fs.writeFileSync(file, JSON.stringify(defaults, null, 2), 'utf8')
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = ''
    req.on('data', (chunk) => (data += chunk))
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {})
      } catch {
        resolve({})
      }
    })
  })
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// HR_baza papkasidagi barcha arizalarni o'qib chiqadi
function readHrApplications() {
  const base = path.resolve(__dirname, 'HR_baza')
  if (!fs.existsSync(base)) return []
  const out = []
  for (const folder of fs.readdirSync(base)) {
    const dir = path.join(base, folder)
    try {
      if (!fs.statSync(dir).isDirectory()) continue
      const malumot = path.join(dir, 'malumot.json')
      if (fs.existsSync(malumot)) {
        const rec = JSON.parse(fs.readFileSync(malumot, 'utf8'))
        out.push({ ...rec, folder })
      }
    } catch {
      /* skip */
    }
  }
  // Eng yangisi birinchi
  out.sort((a, b) => String(b.submittedAt).localeCompare(String(a.submittedAt)))
  return out
}

// Standart sahifasi gridlari — fayl bo'lmasa, dastlabki 6 ta bilan to'ldiradi
function ensureStandards() {
  ensureDataDir()
  const file = path.join(DATA_DIR, 'standards.json')
  if (fs.existsSync(file)) return
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
  fs.writeFileSync(file, JSON.stringify(defaults, null, 2), 'utf8')
}

// Investorlar uchun obyekt konsepsiyalari — dastlabki ro'yxat bilan to'ldiradi
function ensureInvestors() {
  ensureDataDir()
  const file = path.join(DATA_DIR, 'investors.json')
  if (fs.existsSync(file)) return
  const defaults = [
    { title: 'Data center — raqamli iqtisodiyot infratuzilmasi', text: "Data center oddiy bino emas. Bu yuqori darajadagi muhandislik, xavfsizlik, energiya barqarorligi va uzluksiz ishlash talab qiladigan strategik obyekt.\n\nBunday loyihada har bir qaror oldindan hisoblanishi kerak: elektr quvvati, sovutish tizimi, zaxira energiya, yong'in xavfsizligi, kirish nazorati va ekspluatatsiya qulayligi.\n\nBARPO data center qurilishiga faqat qurilish sifatida emas, biznes uzluksizligi infratuzilmasi sifatida qaraydi.", key: "Data center — bu beton ichidagi serverlar emas. Bu ishonch, xavfsizlik va uzluksiz ishlash tizimi." },
    { title: 'A klass biznes markazi — status, tizim va tijoriy qiymat', text: "A klass biznes markazi shunchaki ofis binosi emas. U kompaniyalar uchun imij, xodimlar uchun qulaylik, investor uchun esa barqaror daromad manbai bo'lishi kerak.\n\nBunday obyektlarda fasad, kirish guruhi, lift zonasi, parking, muhandislik tizimlari, umumiy foydalanish maydonlari va ekspluatatsiya xarajatlari bir butun tizim sifatida o'ylanishi kerak.\n\nBARPO biznes markazlarni faqat qurib topshiriladigan bino sifatida emas, ishlaydigan tijoriy aktiv sifatida ko'radi.", key: "A klass daraja binoning balandligida emas. Uning boshqaruvi, qulayligi va detalida." },
    { title: 'Savdo markazi — odam oqimi ishlaydigan arxitektura', text: "Savdo markazining muvaffaqiyati faqat maydon hajmiga bog'liq emas. Odam oqimi, kirish-chiqish logikasi, navigatsiya, ijarachilar joylashuvi, parking va muhandislik tizimlari birgalikda ishlashi kerak.\n\nBARPO savdo obyektlariga tijorat natijasi nuqtayi nazaridan qaraydi. Har bir metr, har bir yo'lak, har bir zona mijoz harakati va biznes samaradorligiga xizmat qilishi kerak.", key: "Savdo markazi — bu devorlar ichidagi do'konlar emas. Bu odam oqimi va daromad modeli." },
    { title: 'Park — shahar nafas oladigan joy', text: "Park qurilishi oddiy obodonlashtirish emas. Bu shahar muhiti, odamlar harakati, dam olish madaniyati va tabiiy muvozanatni birlashtiradigan loyiha.\n\nYaxshi parkda yo'laklar, yoritish, landshaft, suv tizimi, xavfsizlik, xizmat ko'rsatish zonalari va ekspluatatsiya qulayligi oldindan o'ylangan bo'ladi.\n\nBARPO park va rekreatsion hududlarni nafaqat chiroyli, balki uzoq muddat ishlaydigan, odamlar qayta-qayta keladigan muhit sifatida ko'radi.", key: "Park — bu yashil maydon emas. Bu shahar hayotining madaniy ritmi." },
    { title: 'Premium turar joy majmuasi — uy emas, yashash madaniyati', text: "Premium turar joy majmuasi faqat qimmat materiallar yoki chiroyli fasaddan iborat emas. Bu insonning kundalik hayotini qulay, xavfsiz va estetik qiladigan tizim.\n\nKirish zonasi, hovli, parking, lift, muhandislik tizimlari, shovqin izolyatsiyasi, fasad, jamoat hududlari va ekspluatatsiya sifati birgalikda premium darajani yaratadi.\n\nBARPO premium turar joy majmuasi qurilishida detal, muhandislik, estetika va uzoq muddatli qiymatni birlashtiradi.", key: "Premium — ko'rinish emas. Premium — har kuni seziladigan sifat." },
    { title: 'Klinika — aniqlik, tozalik va muhandislik talabi', text: "Tibbiyot obyektlarida xato qilish mumkin emas. Bu yerda rejalashtirish, ventilyatsiya, steril zonalar, oqimlar ajratilishi, muhandislik tizimlari va foydalanish qulayligi alohida ahamiyatga ega.\n\nBARPO klinika qurilishiga bemor, shifokor va ekspluatatsiya jamoasi nuqtayi nazaridan qaraydi.\n\nBino chiroyli bo'lishi mumkin. Lekin klinika, avvalo, to'g'ri ishlashi kerak.", key: "Klinika qurilishi — bu dizayn emas. Bu aniqlik va mas'uliyat." },
    { title: 'Mehmonxona — tajriba sotadigan obyekt', text: "Mehmonxona qurilishida har bir detal mehmon tajribasiga ta'sir qiladi: kirish taassuroti, xona ergonomikasi, ovoz izolyatsiyasi, muhandislik tizimlari, servis zonalari, evakuatsiya, yoritish va umumiy atmosfera.\n\nBARPO mehmonxona obyektlarini nafaqat qurilish, balki servis biznesining infratuzilmasi sifatida ko'radi.", key: "Mehmonxona — bu xona soni emas. Bu mehmon qaytib keladigan tajriba." },
    { title: 'Sanoat obyekti — jarayon uchun qurilgan bino', text: "Ishlab chiqarish obyektida asosiy narsa — jarayonning to'g'ri ishlashi. Logistika, texnika harakati, xavfsizlik, yuklama, muhandislik tizimlari va ekspluatatsiya qulayligi oldindan hisoblanishi kerak.\n\nBARPO sanoat obyektlarida biznes jarayonini tushunib, qurilish yechimini shu jarayonga moslashtiradi.", key: "Sanoat binosi devor emas. Bu ishlab chiqarish ritmini ushlab turadigan tizim." },
  ].map((x) => ({ id: genId(), title: x.title, text: x.text, key: x.key, active: true, createdAt: new Date().toISOString() }))
  fs.writeFileSync(file, JSON.stringify(defaults, null, 2), 'utf8')
}

// Barcha API endpointlari shu yerda
function barpoApi() {
  return {
    name: 'barpo-api',
    configureServer(server) {
      const upload = multer({
        storage: multer.memoryStorage(),
        limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
      })

      const sendJson = (res, code, obj) => {
        res.statusCode = code
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
        res.end(JSON.stringify(obj))
      }

      // username+password ni tekshiradi, mos admin obyektini qaytaradi (aks holda null)
      const getAdmin = (req) => {
        const url = new URL(req.url, 'http://localhost')
        const username = url.searchParams.get('username')
        const password = url.searchParams.get('password')
        return readAdmins().find((a) => a.username === username && a.password === password) || null
      }

      // Admin shartmi — bo'lmasa 401 javob beradi va null qaytaradi
      const requireAdmin = (req, res) => {
        const admin = getAdmin(req)
        if (!admin) {
          sendJson(res, 401, { ok: false, error: 'Ruxsat yo\'q — login yoki parol noto\'g\'ri' })
          return null
        }
        return admin
      }

      // Bo'lim ruxsati shartmi — superadmin hamma narsaga ruxsatli,
      // oddiy admin faqat o'ziga berilgan bo'limlarni boshqaradi
      const requirePerm = (req, res, key) => {
        const admin = requireAdmin(req, res)
        if (!admin) return null
        if (admin.role === 'superadmin') return admin
        if (admin.perms && admin.perms[key] === false) {
          sendJson(res, 403, { ok: false, error: "Sizda bu bo'lim uchun ruxsat yo'q" })
          return null
        }
        return admin
      }

      // Superadmin shartmi
      const requireSuper = (req, res) => {
        const admin = requireAdmin(req, res)
        if (!admin) return null
        if (admin.role !== 'superadmin') {
          sendJson(res, 403, { ok: false, error: 'Bu amal faqat bosh admin uchun' })
          return null
        }
        return admin
      }

      // ---- HR ARIZASI (rezyume bilan) ----
      server.middlewares.use('/api/apply', (req, res) => {
        if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' })
        upload.single('resume')(req, res, (err) => {
          try {
            if (err) throw err
            const body = req.body || {}
            for (const key of ['fullName', 'field', 'phone']) {
              if (!body[key] || !String(body[key]).trim()) {
                return sendJson(res, 400, { ok: false, error: `Majburiy maydon to'ldirilmagan: ${key}` })
              }
            }
            const safeName =
              String(body.fullName).trim().replace(/[^\p{L}\p{N}]+/gu, '_').slice(0, 60) || 'nomalum'
            const stamp = new Date().toISOString().replace(/[:.]/g, '-')
            const dir = path.resolve(__dirname, 'HR_baza', `${stamp}_${safeName}`)
            fs.mkdirSync(dir, { recursive: true })
            const record = {
              fullName: body.fullName,
              field: body.field,
              experienceYears: body.experienceYears || '',
              phone: body.phone,
              email: body.email || '',
              contact: body.contact || '',
              status: 'pending',
              submittedAt: new Date().toISOString(),
              resumeFile: null,
            }
            if (req.file) {
              const ext = path.extname(req.file.originalname) || ''
              const resumeName = `rezyume${ext}`
              fs.writeFileSync(path.join(dir, resumeName), req.file.buffer)
              record.resumeFile = resumeName
            }
            fs.writeFileSync(path.join(dir, 'malumot.json'), JSON.stringify(record, null, 2), 'utf8')
            notifyNew('hr', 'HR arizasi', {
              'Ism-sharif': record.fullName, 'Soha': record.field,
              'Tajriba (yil)': record.experienceYears, 'Telefon': record.phone,
              'Email': record.email, 'Aloqa': record.contact,
              'Rezyume': record.resumeFile ? 'bor' : 'yo\'q', 'Sana': record.submittedAt,
            })
            // Rezyume faylini Telegram botga ham yuborish
            if (req.file) {
              const ext = path.extname(req.file.originalname) || ''
              sendTelegramDocument(
                req.file.buffer,
                `${safeName}_rezyume${ext}`,
                `📄 Rezyume — ${record.fullName} (${record.field})`,
                'hr'
              )
            }
            sendJson(res, 200, { ok: true })
          } catch (e) {
            sendJson(res, 500, { ok: false, error: e?.message || 'Server xatosi' })
          }
        })
      })

      // ---- TAKLIFLAR (BARPO e'lon qiladigan) ----
      // GET  -> faqat "active" takliflarni qaytaradi (ommaviy)
      // admin /api/admin/offers orqali boshqaradi
      server.middlewares.use('/api/offers', (req, res) => {
        if (req.method !== 'GET') return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' })
        const offers = readJsonArray('offers.json').filter((o) => o.active !== false)
        sendJson(res, 200, { ok: true, offers })
      })

      // ---- KELGAN TAKLIFLAR (tashrifchidan bizga) ----
      server.middlewares.use('/api/suggestions', async (req, res) => {
        if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' })
        try {
          const body = await readBody(req)
          if (!body.subject || !String(body.subject).trim() || !body.message || !String(body.message).trim()) {
            return sendJson(res, 400, { ok: false, error: "Mavzu va xabar majburiy" })
          }
          const list = readJsonArray('suggestions.json')
          const rec = {
            id: genId(),
            fullName: body.fullName || '',
            phone: body.phone || '',
            category: body.category || '',
            subject: body.subject,
            message: body.message,
            submittedAt: new Date().toISOString(),
          }
          list.unshift(rec)
          writeJsonArray('suggestions.json', list)
          notifyNew('suggestion', 'taklif', {
            'Mavzu': rec.subject, 'Yo\'nalish': rec.category, 'Xabar': rec.message,
            'Ism': rec.fullName, 'Telefon': rec.phone, 'Sana': rec.submittedAt,
          })
          sendJson(res, 200, { ok: true })
        } catch (e) {
          sendJson(res, 500, { ok: false, error: e?.message || 'Server xatosi' })
        }
      })

      // ---- ALOQA SO'ROVI ----
      server.middlewares.use('/api/contact', async (req, res) => {
        if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' })
        try {
          const body = await readBody(req)
          if (!body.fullName || !String(body.fullName).trim() || !body.phone || !String(body.phone).trim()) {
            return sendJson(res, 400, { ok: false, error: "Ism va telefon majburiy" })
          }
          const list = readJsonArray('contacts.json')
          const rec = {
            id: genId(),
            fullName: body.fullName,
            phone: body.phone,
            email: body.email || '',
            company: body.company || '',
            message: body.message || '',
            submittedAt: new Date().toISOString(),
          }
          list.unshift(rec)
          writeJsonArray('contacts.json', list)
          notifyNew('contact', 'aloqa so\'rovi', {
            'Ism': rec.fullName, 'Telefon': rec.phone, 'Email': rec.email, 'Kompaniya': rec.company,
            'Xabar': rec.message, 'Sana': rec.submittedAt,
          })
          sendJson(res, 200, { ok: true })
        } catch (e) {
          sendJson(res, 500, { ok: false, error: e?.message || 'Server xatosi' })
        }
      })

      // ---- ADMIN: login ----
      server.middlewares.use('/api/admin/login', async (req, res) => {
        if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' })
        try {
          const body = await readBody(req)
          const admin = readAdmins().find(
            (a) => a.username === body.username && a.password === body.password
          )
          if (!admin) return sendJson(res, 401, { ok: false, error: "Login yoki parol noto'g'ri" })
          logHistory(admin.name, 'tizimga kirdi')
          sendJson(res, 200, { ok: true, name: admin.name, username: admin.username, role: admin.role || 'admin' })
        } catch (e) {
          sendJson(res, 500, { ok: false, error: e?.message || 'Server xatosi' })
        }
      })

      // ---- SUPERADMIN: adminlarni boshqarish ----
      server.middlewares.use('/api/admin/admins', async (req, res) => {
        const admin = requireSuper(req, res)
        if (!admin) return
        let admins = readAdmins()
        if (req.method === 'GET') {
          return sendJson(res, 200, { ok: true, admins })
        }
        if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' })
        try {
          const body = await readBody(req)
          const action = body.action
          if (action === 'create') {
            const username = String(body.username || '').trim()
            const password = String(body.password || '').trim()
            const name = String(body.name || '').trim() || username
            if (!username || !password) return sendJson(res, 400, { ok: false, error: 'Login va parol majburiy' })
            if (admins.some((a) => a.username === username)) return sendJson(res, 400, { ok: false, error: 'Bu login band' })
            const perms = {}
            for (const k of PERM_KEYS) perms[k] = body.perms && body.perms[k] === false ? false : true
            admins.push({ username, password, name, role: 'admin', perms })
            logHistory(admin.name, `yangi admin qo'shdi: "${name}" (${username})`)
          } else if (action === 'update') {
            const target = admins.find((a) => a.username === body.username)
            if (!target) return sendJson(res, 404, { ok: false, error: 'Admin topilmadi' })
            // Superadminning o'z rolini pasaytirib bo'lmaydi
            if (target.username === admin.username && body.role && body.role !== 'superadmin') {
              return sendJson(res, 400, { ok: false, error: "O'z superadmin rolingizni o'zgartira olmaysiz" })
            }
            if (body.newUsername && String(body.newUsername).trim() && body.newUsername !== target.username) {
              const nu = String(body.newUsername).trim()
              if (admins.some((a) => a.username === nu)) return sendJson(res, 400, { ok: false, error: 'Bu login band' })
              target.username = nu
            }
            if (body.password && String(body.password).trim()) target.password = String(body.password).trim()
            if (body.name && String(body.name).trim()) target.name = String(body.name).trim()
            if (body.role && target.username !== admin.username) target.role = body.role === 'superadmin' ? 'superadmin' : 'admin'
            if (body.perms && typeof body.perms === 'object') {
              const perms = {}
              for (const k of PERM_KEYS) perms[k] = body.perms[k] === false ? false : true
              target.perms = perms
            }
            logHistory(admin.name, `adminni tahrirladi: "${target.name}" (${target.username})`)
          } else if (action === 'delete') {
            const target = admins.find((a) => a.username === body.username)
            if (!target) return sendJson(res, 404, { ok: false, error: 'Admin topilmadi' })
            if (target.username === admin.username) return sendJson(res, 400, { ok: false, error: "O'zingizni o'chira olmaysiz" })
            admins = admins.filter((a) => a.username !== body.username)
            logHistory(admin.name, `adminni o'chirdi: "${target.name}" (${target.username})`)
          } else {
            return sendJson(res, 400, { ok: false, error: 'Noma\'lum amal' })
          }
          writeAdmins(admins)
          sendJson(res, 200, { ok: true, admins })
        } catch (e) {
          sendJson(res, 500, { ok: false, error: e?.message || 'Server xatosi' })
        }
      })

      // ---- TOPSHIRIQLAR (superadmin beradi, adminlar bajaradi) ----
      server.middlewares.use('/api/admin/tasks', async (req, res) => {
        const admin = requireAdmin(req, res)
        if (!admin) return
        if (req.method === 'GET') {
          let tasks = readJsonArray('tasks.json')
          if (admin.role !== 'superadmin') tasks = tasks.filter((t) => t.assignee === admin.username)
          return sendJson(res, 200, { ok: true, tasks })
        }
        if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' })
        try {
          const body = await readBody(req)
          const action = body.action
          let tasks = readJsonArray('tasks.json')
          if (action === 'create') {
            if (admin.role !== 'superadmin') return sendJson(res, 403, { ok: false, error: 'Topshiriqni faqat bosh admin beradi' })
            const title = String(body.title || '').trim()
            if (!title) return sendJson(res, 400, { ok: false, error: 'Topshiriq matni majburiy' })
            tasks.unshift({
              id: genId(),
              title,
              desc: String(body.desc || ''),
              assignee: String(body.assignee || ''),
              status: 'pending',
              createdBy: admin.username,
              createdAt: new Date().toISOString(),
              doneAt: null,
            })
            logHistory(admin.name, `topshiriq berdi (${body.assignee}): "${title}"`)
          } else if (action === 'done' || action === 'undone') {
            const t = tasks.find((x) => x.id === body.id)
            if (!t) return sendJson(res, 404, { ok: false, error: 'Topshiriq topilmadi' })
            if (admin.role !== 'superadmin' && t.assignee !== admin.username) {
              return sendJson(res, 403, { ok: false, error: 'Bu topshiriq sizga tegishli emas' })
            }
            t.status = action === 'done' ? 'done' : 'pending'
            t.doneAt = action === 'done' ? new Date().toISOString() : null
            logHistory(admin.name, `topshiriqni ${action === 'done' ? 'bajardi' : 'qayta ochdi'}: "${t.title}"`)
          } else if (action === 'delete') {
            if (admin.role !== 'superadmin') return sendJson(res, 403, { ok: false, error: 'Faqat bosh admin o\'chira oladi' })
            const t = tasks.find((x) => x.id === body.id)
            tasks = tasks.filter((x) => x.id !== body.id)
            logHistory(admin.name, `topshiriqni o'chirdi: "${t ? t.title : ''}"`)
          } else {
            return sendJson(res, 400, { ok: false, error: 'Noma\'lum amal' })
          }
          writeJsonArray('tasks.json', tasks)
          let out = tasks
          if (admin.role !== 'superadmin') out = tasks.filter((t) => t.assignee === admin.username)
          sendJson(res, 200, { ok: true, tasks: out })
        } catch (e) {
          sendJson(res, 500, { ok: false, error: e?.message || 'Server xatosi' })
        }
      })

      // ---- ADMIN: sozlamalar (email/Sheets) ----
      server.middlewares.use('/api/admin/settings', async (req, res) => {
        if (req.method === 'GET') {
          if (!requirePerm(req, res, 'settings')) return
          return sendJson(res, 200, { ok: true, settings: readSettings() })
        }
        if (req.method === 'POST') {
          const admin = requirePerm(req, res, 'settings')
          if (!admin) return
          try {
            const body = await readBody(req)
            const cur = readSettings()
            const cleanList = (v, fallback) => Array.isArray(v) ? v.map((x) => String(x).trim()).filter(Boolean) : (fallback || [])
            const curByType = cur.notifyEmailsByType || {}
            const bodyByType = body.notifyEmailsByType || {}
            const next = {
              notifyEmails: cleanList(body.notifyEmails, cur.notifyEmails),
              notifyEmailsByType: {
                hr: cleanList(bodyByType.hr, curByType.hr),
                suggestion: cleanList(bodyByType.suggestion, curByType.suggestion),
                contact: cleanList(bodyByType.contact, curByType.contact),
              },
              smtp: body.smtp ? { ...(cur.smtp || {}), ...body.smtp } : (cur.smtp || {}),
              sheetsWebhook: body.sheetsWebhook != null ? String(body.sheetsWebhook).trim() : (cur.sheetsWebhook || ''),
              telegram: {
                botToken: body.telegram && body.telegram.botToken != null ? String(body.telegram.botToken).trim() : ((cur.telegram || {}).botToken || ''),
                chatIds: cleanList(body.telegram && body.telegram.chatIds, (cur.telegram || {}).chatIds),
              },
              socials: (() => {
                const curS = cur.socials || {}
                const bodyS = body.socials || {}
                const out = {}
                for (const k of ['telegram', 'instagram', 'facebook', 'youtube']) {
                  out[k] = bodyS[k] != null ? String(bodyS[k]).trim() : (curS[k] || '')
                }
                return out
              })(),
              contactInfo: (() => {
                const curC = cur.contactInfo || {}
                const bodyC = body.contactInfo || {}
                const out = {}
                for (const k of ['phone', 'email', 'address']) {
                  out[k] = bodyC[k] != null ? String(bodyC[k]).trim() : (curC[k] || '')
                }
                return out
              })(),
              telegramByType: (() => {
                const curBT = cur.telegramByType || {}
                const bodyBT = body.telegramByType || {}
                const out = {}
                for (const k of ['hr', 'suggestion', 'contact']) {
                  const c = curBT[k] || {}
                  const b = bodyBT[k] || {}
                  out[k] = {
                    botToken: b.botToken != null ? String(b.botToken).trim() : (c.botToken || ''),
                    chatIds: cleanList(b.chatIds, c.chatIds),
                  }
                }
                return out
              })(),
            }
            writeSettings(next)
            logHistory(admin.name, 'sozlamalarni yangiladi')
            return sendJson(res, 200, { ok: true, settings: next })
          } catch (e) { return sendJson(res, 500, { ok: false, error: e?.message || 'Server xatosi' }) }
        }
        return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' })
      })

      // ---- ADMIN: test email yuborish ----
      server.middlewares.use('/api/admin/test-mail', async (req, res) => {
        if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' })
        const admin = requirePerm(req, res, 'settings')
        if (!admin) return
        const s = readSettings()
        if (!getTransport()) return sendJson(res, 400, { ok: false, error: 'SMTP sozlanmagan' })
        if (!(s.notifyEmails || []).length) return sendJson(res, 400, { ok: false, error: 'Qabul pochtalari kiritilmagan' })
        await sendMail(s.notifyEmails, 'BARPO — test xabar', '<p>Bu test xabari. Email sozlamalari to\'g\'ri ishlayapti ✅</p>')
        sendJson(res, 200, { ok: true })
      })

      // ---- Ommaviy: ijtimoiy tarmoq linklari (footer va aloqa sahifasi uchun) ----
      server.middlewares.use('/api/socials', (req, res) => {
        if (req.method !== 'GET') return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' })
        const s = readSettings()
        sendJson(res, 200, { ok: true, socials: s.socials || {}, contact: s.contactInfo || {} })
      })

      // ---- ADMIN: test Telegram xabar yuborish ----
      server.middlewares.use('/api/admin/test-telegram', async (req, res) => {
        if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' })
        const admin = requirePerm(req, res, 'settings')
        if (!admin) return
        const url = new URL(req.url, 'http://localhost')
        const type = url.searchParams.get('type') || 'general'
        const cfg = type === 'general' ? tgConfigForType('__none__') : tgConfigForType(type)
        if (!cfg.token) return sendJson(res, 400, { ok: false, error: 'Bot token kiritilmagan' })
        if (!cfg.chatIds.length) return sendJson(res, 400, { ok: false, error: 'Chat ID kiritilmagan' })
        const labels = { general: 'Umumiy', hr: 'HR arizalari', suggestion: 'Kelgan takliflar', contact: 'Aloqa so\'rovlari' }
        const results = await sendTelegram(`✅ <b>BARPO — test xabar (${labels[type] || type})</b>\nTelegram bildirishnomalar to'g'ri ishlayapti.`, type)
        const failed = results.filter((r) => !r.ok)
        if (failed.length) {
          return sendJson(res, 400, {
            ok: false,
            error: failed.map((f) => `${f.chatId}: ${f.error}`).join(' | '),
          })
        }
        sendJson(res, 200, { ok: true })
      })

      // ---- ADMIN: HR arizasini qabul/rad etish ----
      server.middlewares.use('/api/admin/hr-status', async (req, res) => {
        if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' })
        const admin = requirePerm(req, res, 'hr')
        if (!admin) return
        try {
          const body = await readBody(req)
          const folder = String(body.folder || '')
          const status = String(body.status || '')
          if (!['accepted', 'rejected', 'pending'].includes(status)) {
            return sendJson(res, 400, { ok: false, error: 'Noto\'g\'ri holat' })
          }
          if (folder.includes('..') || folder.includes('/') || folder.includes('\\')) {
            return sendJson(res, 400, { ok: false, error: 'Noto\'g\'ri yo\'l' })
          }
          const file = path.resolve(__dirname, 'HR_baza', folder, 'malumot.json')
          if (!file.startsWith(path.resolve(__dirname, 'HR_baza')) || !fs.existsSync(file)) {
            return sendJson(res, 404, { ok: false, error: 'Ariza topilmadi' })
          }
          const rec = JSON.parse(fs.readFileSync(file, 'utf8'))
          rec.status = status
          rec.statusBy = admin.name
          rec.statusAt = new Date().toISOString()
          fs.writeFileSync(file, JSON.stringify(rec, null, 2), 'utf8')

          // Nomzodga xushmuomala xabar (email bo'lsa)
          if (rec.email && (status === 'accepted' || status === 'rejected')) {
            if (status === 'accepted') {
              await sendMail(rec.email, 'BARPO — arizangiz bo\'yicha yangilik',
                `<div style="font-family:Arial,sans-serif;color:#222"><p>Assalomu alaykum, ${htmlEscape(rec.fullName)}!</p>` +
                `<p>BARPO jamoasiga bildirgan qiziqishingiz uchun rahmat. Arizangiz biz tomonidan ko'rib chiqildi va sizni keyingi bosqich — suhbatga taklif qilmoqchimiz.</p>` +
                `<p>Tez orada siz bilan bog'lanamiz. Hamkorlikdan mamnunmiz.</p><p>— BARPO jamoasi</p></div>`)
            } else {
              await sendMail(rec.email, 'BARPO — arizangiz bo\'yicha javob',
                `<div style="font-family:Arial,sans-serif;color:#222"><p>Assalomu alaykum, ${htmlEscape(rec.fullName)}!</p>` +
                `<p>BARPO jamoasiga vaqt ajratib, ariza yuborganingiz uchun samimiy minnatdorchilik bildiramiz.</p>` +
                `<p>Hozircha aynan shu yo'nalish bo'yicha imkoniyatlarimiz cheklangan, shu sababli sizning nomzodingizni kelajakdagi mos vakansiyalar uchun bazamizda saqlab qolamiz va munosib o'rin paydo bo'lganda siz bilan bog'lanamiz.</p>` +
                `<p>Sizga kasbiy yo'lda omad va katta muvaffaqiyatlar tilaymiz.</p><p>Hurmat bilan, — BARPO jamoasi</p></div>`)
            }
          }
          logHistory(admin.name, `HR arizasini ${status === 'accepted' ? 'qabul qildi' : status === 'rejected' ? 'rad etdi' : 'kutishga qaytardi'}: "${rec.fullName}"`)
          sendJson(res, 200, { ok: true })
        } catch (e) { sendJson(res, 500, { ok: false, error: e?.message || 'Server xatosi' }) }
      })

      // ---- ADMIN: HR arizasini butunlay o'chirish (papka bilan) ----
      server.middlewares.use('/api/admin/hr-delete', async (req, res) => {
        if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' })
        const admin = requirePerm(req, res, 'hr')
        if (!admin) return
        try {
          const body = await readBody(req)
          const folder = String(body.folder || '')
          if (!folder || folder.includes('..') || folder.includes('/') || folder.includes('\\')) {
            return sendJson(res, 400, { ok: false, error: 'Noto\'g\'ri yo\'l' })
          }
          const dir = path.resolve(__dirname, 'HR_baza', folder)
          if (!dir.startsWith(path.resolve(__dirname, 'HR_baza')) || !fs.existsSync(dir)) {
            return sendJson(res, 404, { ok: false, error: 'Ariza topilmadi' })
          }
          let name = folder
          try { name = JSON.parse(fs.readFileSync(path.join(dir, 'malumot.json'), 'utf8')).fullName || folder } catch {}
          fs.rmSync(dir, { recursive: true, force: true })
          logHistory(admin.name, `HR arizasini o'chirdi: "${name}"`)
          sendJson(res, 200, { ok: true })
        } catch (e) { sendJson(res, 500, { ok: false, error: e?.message || 'Server xatosi' }) }
      })

      // ---- ADMIN: CSV eksport (Excel/Google Sheets ochadi) ----
      server.middlewares.use('/api/admin/export', (req, res) => {
        try {
          const url = new URL(req.url, 'http://localhost')
          const type = url.searchParams.get('type')
          const permKey = type === 'hr' ? 'hr' : type === 'contacts' ? 'contacts' : 'suggestions'
          if (!requirePerm(req, res, permKey)) return
          let csv = '', fname = 'export.csv'
          if (type === 'suggestions') {
            const rows = readJsonArray('suggestions.json').map((s) => [s.submittedAt, s.subject, s.category, s.message, s.fullName, s.phone])
            csv = toCsv(['Sana', 'Mavzu', 'Yo\'nalish', 'Xabar', 'Ism', 'Telefon'], rows); fname = 'kelgan-takliflar.csv'
          } else if (type === 'contacts') {
            const rows = readJsonArray('contacts.json').map((s) => [s.submittedAt, s.fullName, s.phone, s.company, s.message])
            csv = toCsv(['Sana', 'Ism', 'Telefon', 'Kompaniya', 'Xabar'], rows); fname = 'murojaatlar.csv'
          } else if (type === 'hr') {
            const rows = readHrApplications().map((s) => [s.submittedAt, s.fullName, s.field, s.experienceYears, s.phone, s.email || '', s.contact, s.status || 'pending', s.resumeFile ? 'bor' : 'yo\'q'])
            csv = toCsv(['Sana', 'Ism', 'Soha', 'Tajriba', 'Telefon', 'Email', 'Aloqa', 'Holat', 'Rezyume'], rows); fname = 'hr-arizalar.csv'
          } else {
            return sendJson(res, 400, { ok: false, error: 'Noma\'lum tur' })
          }
          res.statusCode = 200
          res.setHeader('Content-Type', 'text/csv; charset=utf-8')
          res.setHeader('Content-Disposition', `attachment; filename="${fname}"`)
          res.end(csv)
        } catch (e) { sendJson(res, 500, { ok: false, error: e?.message || 'Server xatosi' }) }
      })

      // ---- ADMIN: barcha ma'lumot (+ history) ----
      server.middlewares.use('/api/admin/data', (req, res) => {
        if (req.method !== 'GET') return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' })
        const admin = requireAdmin(req, res)
        if (!admin) return
        ensureOrnaments(); ensureStandards(); ensureInvestors()
        const isSuper = admin.role === 'superadmin'
        let tasks = readJsonArray('tasks.json')
        if (!isSuper) tasks = tasks.filter((t) => t.assignee === admin.username)
        sendJson(res, 200, {
          ok: true,
          data: {
            hr: readHrApplications(),
            offers: readJsonArray('offers.json'),
            suggestions: readJsonArray('suggestions.json'),
            contacts: readJsonArray('contacts.json'),
            projects: readJsonArray('projects.json'),
            ornaments: readJsonArray('ornaments.json'),
            standards: readJsonArray('standards.json'),
            investors: readJsonArray('investors.json'),
            history: readJsonArray('history.json').slice(0, 10),
            tasks,
            me: {
              username: admin.username,
              name: admin.name,
              role: admin.role || 'admin',
              perms: isSuper ? defaultPerms(true) : (admin.perms || defaultPerms(true)),
            },
            admins: isSuper ? readAdmins() : undefined,
          },
        })
      })

      // ---- STANDART gridlari (ommaviy) ----
      server.middlewares.use('/api/standards', (req, res) => {
        if (req.method !== 'GET') return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' })
        ensureStandards()
        sendJson(res, 200, { ok: true, standards: readJsonArray('standards.json').filter((s) => s.active !== false) })
      })

      // ---- ADMIN: standartlarni boshqarish ----
      server.middlewares.use('/api/admin/standards', async (req, res) => {
        if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' })
        const admin = requirePerm(req, res, 'standards')
        if (!admin) return
        try {
          ensureStandards()
          const body = await readBody(req)
          const action = body.action
          let items = readJsonArray('standards.json')
          if (action === 'create') {
            items.unshift({ id: genId(), title: body.title || 'Nomsiz', desc: body.desc || '', active: true, createdAt: new Date().toISOString() })
            logHistory(admin.name, `yangi standart qo'shdi: "${body.title || ''}"`)
          } else if (action === 'update') {
            items = items.map((s) => s.id === body.id ? Object.assign({}, s, { title: body.title, desc: body.desc }) : s)
            logHistory(admin.name, `standartni tahrirladi: "${body.title || ''}"`)
          } else if (action === 'toggle') {
            let st = true
            items = items.map((s) => { if (s.id === body.id) { st = !(s.active !== false); return Object.assign({}, s, { active: st }) } return s })
            const it = items.find((s) => s.id === body.id)
            logHistory(admin.name, `standartni ${st ? 'ko\'rsatdi' : 'yashirdi'}: "${it ? it.title : ''}"`)
          } else if (action === 'delete') {
            const it = items.find((s) => s.id === body.id)
            items = items.filter((s) => s.id !== body.id)
            logHistory(admin.name, `standartni o'chirdi: "${it ? it.title : ''}"`)
          } else { return sendJson(res, 400, { ok: false, error: 'Noma\'lum amal' }) }
          writeJsonArray('standards.json', items)
          sendJson(res, 200, { ok: true, standards: items })
        } catch (e) { sendJson(res, 500, { ok: false, error: e?.message || 'Server xatosi' }) }
      })

      // ---- INVESTORLAR uchun konsepsiyalar (ommaviy) ----
      server.middlewares.use('/api/investors', (req, res) => {
        if (req.method !== 'GET') return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' })
        ensureInvestors()
        sendJson(res, 200, { ok: true, investors: readJsonArray('investors.json').filter((x) => x.active !== false) })
      })

      // ---- ADMIN: investor konsepsiyalarini boshqarish ----
      server.middlewares.use('/api/admin/investors', async (req, res) => {
        if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' })
        const admin = requirePerm(req, res, 'investors')
        if (!admin) return
        try {
          ensureInvestors()
          const body = await readBody(req)
          const action = body.action
          let items = readJsonArray('investors.json')
          if (action === 'create') {
            items.unshift({ id: genId(), title: body.title || 'Nomsiz', text: body.text || '', key: body.key || '', active: true, createdAt: new Date().toISOString() })
            logHistory(admin.name, `yangi investor bo'limi qo'shdi: "${body.title || ''}"`)
          } else if (action === 'update') {
            items = items.map((s) => s.id === body.id ? Object.assign({}, s, { title: body.title, text: body.text, key: body.key }) : s)
            logHistory(admin.name, `investor bo'limini tahrirladi: "${body.title || ''}"`)
          } else if (action === 'toggle') {
            let st = true
            items = items.map((s) => { if (s.id === body.id) { st = !(s.active !== false); return Object.assign({}, s, { active: st }) } return s })
            const it = items.find((s) => s.id === body.id)
            logHistory(admin.name, `investor bo'limini ${st ? 'ko\'rsatdi' : 'yashirdi'}: "${it ? it.title : ''}"`)
          } else if (action === 'delete') {
            const it = items.find((s) => s.id === body.id)
            items = items.filter((s) => s.id !== body.id)
            logHistory(admin.name, `investor bo'limini o'chirdi: "${it ? it.title : ''}"`)
          } else { return sendJson(res, 400, { ok: false, error: 'Noma\'lum amal' }) }
          writeJsonArray('investors.json', items)
          sendJson(res, 200, { ok: true, investors: items })
        } catch (e) { sendJson(res, 500, { ok: false, error: e?.message || 'Server xatosi' }) }
      })

      // ---- LOYIHALAR (ommaviy: ro'yxat) ----
      server.middlewares.use('/api/projects', (req, res) => {
        if (req.method !== 'GET') return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' })
        const url = new URL(req.url, 'http://localhost')
        const id = url.searchParams.get('id')
        const all = readJsonArray('projects.json')
        if (id) {
          const project = all.find((p) => p.id === id && p.active !== false)
          if (!project) return sendJson(res, 404, { ok: false, error: 'Loyiha topilmadi' })
          return sendJson(res, 200, { ok: true, project })
        }
        sendJson(res, 200, { ok: true, projects: all.filter((p) => p.active !== false) })
      })

      // ---- LOYIHA RASMI ----
      server.middlewares.use('/api/project-image', (req, res) => {
        try {
          const url = new URL(req.url, 'http://localhost')
          const id = url.searchParams.get('id') || ''
          if (id.includes('..') || id.includes('/') || id.includes('\\')) {
            res.statusCode = 400; return res.end('Bad request')
          }
          const dir = path.resolve(__dirname, 'data', 'project_images')
          if (!fs.existsSync(dir)) { res.statusCode = 404; return res.end('Not found') }
          const match = fs.readdirSync(dir).find((f) => f.startsWith(id + '.'))
          if (!match) { res.statusCode = 404; return res.end('Not found') }
          const ext = path.extname(match).toLowerCase()
          const mime =
            ext === '.png' ? 'image/png'
            : ext === '.webp' ? 'image/webp'
            : ext === '.gif' ? 'image/gif'
            : 'image/jpeg'
          res.setHeader('Content-Type', mime)
          res.setHeader('Cache-Control', 'no-cache')
          res.end(fs.readFileSync(path.join(dir, match)))
        } catch {
          res.statusCode = 500; res.end('Server error')
        }
      })

      // ---- NAQSHLAR / ORNAMENT (ommaviy ro'yxat) ----
      server.middlewares.use('/api/ornaments', (req, res) => {
        if (req.method !== 'GET') return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' })
        ensureOrnaments()
        sendJson(res, 200, { ok: true, ornaments: readJsonArray('ornaments.json').filter((o) => o.active !== false) })
      })

      // ---- NAQSH RASMI ----
      server.middlewares.use('/api/ornament-image', (req, res) => {
        try {
          const url = new URL(req.url, 'http://localhost')
          const id = url.searchParams.get('id') || ''
          if (id.includes('..') || id.includes('/') || id.includes('\\')) { res.statusCode = 400; return res.end('Bad request') }
          const dir = path.resolve(__dirname, 'data', 'ornament_images')
          if (!fs.existsSync(dir)) { res.statusCode = 404; return res.end('Not found') }
          const match = fs.readdirSync(dir).find((f) => f.startsWith(id + '.'))
          if (!match) { res.statusCode = 404; return res.end('Not found') }
          const ext = path.extname(match).toLowerCase()
          const mime = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : ext === '.gif' ? 'image/gif' : 'image/jpeg'
          res.setHeader('Content-Type', mime)
          res.setHeader('Cache-Control', 'no-cache')
          res.end(fs.readFileSync(path.join(dir, match)))
        } catch { res.statusCode = 500; res.end('Server error') }
      })

      // ---- ADMIN: naqshlarni boshqarish (rasm bilan) ----
      server.middlewares.use('/api/admin/ornaments', (req, res) => {
        if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' })
        const admin = requirePerm(req, res, 'ornaments')
        if (!admin) return
        upload.single('image')(req, res, (err) => {
          try {
            if (err) throw err
            ensureOrnaments()
            const body = req.body || {}
            const action = body.action
            let items = readJsonArray('ornaments.json')
            const imgDir = path.resolve(__dirname, 'data', 'ornament_images')

            const saveImage = (id) => {
              if (!req.file) return
              fs.mkdirSync(imgDir, { recursive: true })
              for (const f of fs.readdirSync(imgDir)) { if (f.startsWith(id + '.')) fs.unlinkSync(path.join(imgDir, f)) }
              const ext = (path.extname(req.file.originalname) || '.jpg').toLowerCase()
              fs.writeFileSync(path.join(imgDir, `${id}${ext}`), req.file.buffer)
            }

            if (action === 'create') {
              const id = genId()
              saveImage(id)
              items.unshift({
                id, old: body.old || '', new: body.new || '', desc: body.desc || '',
                history: body.history || '', hasImage: !!req.file, active: true, createdAt: new Date().toISOString(),
              })
              logHistory(admin.name, `yangi naqsh qo'shdi: "${body.old || ''}"`)
            } else if (action === 'update') {
              saveImage(body.id)
              items = items.map((o) => o.id === body.id
                ? Object.assign({}, o, { old: body.old, new: body.new, desc: body.desc, history: body.history, hasImage: req.file ? true : o.hasImage })
                : o)
              logHistory(admin.name, `naqshni tahrirladi: "${body.old || ''}"`)
            } else if (action === 'toggle') {
              let st = true
              items = items.map((o) => { if (o.id === body.id) { st = !(o.active !== false); return Object.assign({}, o, { active: st }) } return o })
              const it = items.find((o) => o.id === body.id)
              logHistory(admin.name, `naqshni ${st ? 'ko\'rsatdi' : 'yashirdi'}: "${it ? it.old : ''}"`)
            } else if (action === 'delete') {
              const it = items.find((o) => o.id === body.id)
              items = items.filter((o) => o.id !== body.id)
              if (fs.existsSync(imgDir)) { for (const f of fs.readdirSync(imgDir)) { if (f.startsWith(body.id + '.')) fs.unlinkSync(path.join(imgDir, f)) } }
              logHistory(admin.name, `naqshni o'chirdi: "${it ? it.old : ''}"`)
            } else {
              return sendJson(res, 400, { ok: false, error: 'Noma\'lum amal' })
            }

            writeJsonArray('ornaments.json', items)
            sendJson(res, 200, { ok: true, ornaments: items })
          } catch (e) {
            sendJson(res, 500, { ok: false, error: e?.message || 'Server xatosi' })
          }
        })
      })

      // ---- ADMIN: loyihalarni boshqarish (rasm yuklash bilan) ----
      server.middlewares.use('/api/admin/projects', (req, res) => {
        if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' })
        const admin = requirePerm(req, res, 'projects')
        if (!admin) return
        upload.single('image')(req, res, (err) => {
          try {
            if (err) throw err
            const body = req.body || {}
            const action = body.action
            let projects = readJsonArray('projects.json')
            const imgDir = path.resolve(__dirname, 'data', 'project_images')

            const saveImage = (id) => {
              if (!req.file) return
              fs.mkdirSync(imgDir, { recursive: true })
              // eski rasmni o'chirish
              if (fs.existsSync(imgDir)) {
                for (const f of fs.readdirSync(imgDir)) {
                  if (f.startsWith(id + '.')) fs.unlinkSync(path.join(imgDir, f))
                }
              }
              const ext = (path.extname(req.file.originalname) || '.jpg').toLowerCase()
              fs.writeFileSync(path.join(imgDir, `${id}${ext}`), req.file.buffer)
            }

            if (action === 'create') {
              const id = genId()
              saveImage(id)
              projects.unshift({
                id,
                name: body.name || 'Nomsiz loyiha',
                direction: body.direction || '',
                location: body.location || '',
                area: body.area || '',
                year: body.year || '',
                status: body.status || '',
                workType: body.workType || '',
                duration: body.duration || '',
                role: body.role || '',
                task: body.task || '',
                problem: body.problem || '',
                solution: body.solution || '',
                process: body.process || '',
                result: body.result || '',
                description: body.description || '',
                details: body.details || '',
                features: body.features || '',
                hasImage: !!req.file,
                active: true,
                createdAt: new Date().toISOString(),
              })
              logHistory(admin.name, `yangi loyiha qo'shdi: "${body.name || 'Nomsiz loyiha'}"`)
            } else if (action === 'update') {
              saveImage(body.id)
              projects = projects.map((p) =>
                p.id === body.id
                  ? {
                      ...p,
                      name: body.name, location: body.location, area: body.area,
                      year: body.year, status: body.status, description: body.description,
                      details: body.details, features: body.features,
                      direction: body.direction || '', task: body.task || '',
                      solution: body.solution || '', result: body.result || '',
                      workType: body.workType || '', duration: body.duration || '',
                      role: body.role || '', problem: body.problem || '', process: body.process || '',
                      hasImage: req.file ? true : p.hasImage,
                    }
                  : p
              )
              logHistory(admin.name, `loyihani tahrirladi: "${body.name}"`)
            } else if (action === 'toggle') {
              let newState = true
              projects = projects.map((p) => {
                if (p.id === body.id) { newState = !p.active; return { ...p, active: newState } }
                return p
              })
              const pr = projects.find((p) => p.id === body.id)
              logHistory(admin.name, `loyihani ${newState ? 'ko\'rsatdi' : 'yashirdi'}: "${pr?.name || ''}"`)
            } else if (action === 'delete') {
              const pr = projects.find((p) => p.id === body.id)
              projects = projects.filter((p) => p.id !== body.id)
              if (fs.existsSync(imgDir)) {
                for (const f of fs.readdirSync(imgDir)) {
                  if (f.startsWith(body.id + '.')) fs.unlinkSync(path.join(imgDir, f))
                }
              }
              logHistory(admin.name, `loyihani o'chirdi: "${pr?.name || ''}"`)
            } else {
              return sendJson(res, 400, { ok: false, error: 'Noma\'lum amal' })
            }

            writeJsonArray('projects.json', projects)
            sendJson(res, 200, { ok: true, projects })
          } catch (e) {
            sendJson(res, 500, { ok: false, error: e?.message || 'Server xatosi' })
          }
        })
      })

      // ---- ADMIN: takliflarni boshqarish (create/update/delete/toggle) ----
      server.middlewares.use('/api/admin/offers', async (req, res) => {
        if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' })
        const admin = requirePerm(req, res, 'offers')
        if (!admin) return
        try {
          const body = await readBody(req)
          const action = body.action
          let offers = readJsonArray('offers.json')

          if (action === 'create') {
            offers.unshift({
              id: genId(),
              title: body.title || 'Nomsiz taklif',
              description: body.description || '',
              tag: body.tag || '',
              active: true,
              createdAt: new Date().toISOString(),
            })
            logHistory(admin.name, `yangi taklif qo'shdi: "${body.title || 'Nomsiz taklif'}"`)
          } else if (action === 'update') {
            offers = offers.map((o) =>
              o.id === body.id
                ? { ...o, title: body.title, description: body.description, tag: body.tag }
                : o
            )
            logHistory(admin.name, `taklifni tahrirladi: "${body.title}"`)
          } else if (action === 'toggle') {
            let newState = true
            offers = offers.map((o) => {
              if (o.id === body.id) { newState = !o.active; return { ...o, active: newState } }
              return o
            })
            const of = offers.find((o) => o.id === body.id)
            logHistory(admin.name, `taklifni ${newState ? 'ko\'rsatdi' : 'yashirdi'}: "${of?.title || ''}"`)
          } else if (action === 'delete') {
            const of = offers.find((o) => o.id === body.id)
            offers = offers.filter((o) => o.id !== body.id)
            logHistory(admin.name, `taklifni o'chirdi: "${of?.title || ''}"`)
          } else {
            return sendJson(res, 400, { ok: false, error: 'Noma\'lum amal' })
          }

          writeJsonArray('offers.json', offers)
          sendJson(res, 200, { ok: true, offers })
        } catch (e) {
          sendJson(res, 500, { ok: false, error: e?.message || 'Server xatosi' })
        }
      })

      // ---- ADMIN: kelgan taklif / aloqani o'chirish ----
      server.middlewares.use('/api/admin/delete', async (req, res) => {
        if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' })
        try {
          const body = await readBody(req)
          const admin = requirePerm(req, res, body.type === 'contact' ? 'contacts' : 'suggestions')
          if (!admin) return
          const fileMap = { suggestion: 'suggestions.json', contact: 'contacts.json' }
          const file = fileMap[body.type]
          if (!file) return sendJson(res, 400, { ok: false, error: 'Noma\'lum tur' })
          const list = readJsonArray(file).filter((x) => x.id !== body.id)
          writeJsonArray(file, list)
          logHistory(admin.name, body.type === 'suggestion' ? "kelgan taklifni o'chirdi" : "aloqa so'rovini o'chirdi")
          sendJson(res, 200, { ok: true })
        } catch (e) {
          sendJson(res, 500, { ok: false, error: e?.message || 'Server xatosi' })
        }
      })

      // ---- ADMIN: rezyumeni yuklab olish ----
      server.middlewares.use('/api/admin/resume', (req, res) => {
        if (!requirePerm(req, res, 'hr')) return
        try {
          const url = new URL(req.url, 'http://localhost')
          const folder = url.searchParams.get('folder') || ''
          const file = url.searchParams.get('file') || ''
          // Path traversal himoyasi
          if (folder.includes('..') || file.includes('..') || folder.includes('/') || folder.includes('\\')) {
            return sendJson(res, 400, { ok: false, error: 'Noto\'g\'ri yo\'l' })
          }
          const filePath = path.resolve(__dirname, 'HR_baza', folder, file)
          if (!filePath.startsWith(path.resolve(__dirname, 'HR_baza'))) {
            return sendJson(res, 400, { ok: false, error: 'Noto\'g\'ri yo\'l' })
          }
          if (!fs.existsSync(filePath)) return sendJson(res, 404, { ok: false, error: 'Fayl topilmadi' })
          const ext = path.extname(file).toLowerCase()
          const mime =
            ext === '.pdf' ? 'application/pdf'
            : ext === '.doc' ? 'application/msword'
            : ext === '.docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            : 'application/octet-stream'
          res.setHeader('Content-Type', mime)
          res.end(fs.readFileSync(filePath))
        } catch (e) {
          sendJson(res, 500, { ok: false, error: e?.message || 'Server xatosi' })
        }
      })

      // ===== BO'LIM RASMLARI (Madaniyat / Xizmatlar sahifalaridagi boxlar) =====
      const SECTION_DIR = path.resolve(__dirname, 'data', 'section_images')
      const SECTION_KEY_RE = /^[a-z0-9-]+$/

      // ---- Ommaviy: qaysi kalitlarda rasm bor + o'zgargan vaqti (cache-bust uchun) ----
      server.middlewares.use('/api/section-images', (req, res) => {
        if (req.method !== 'GET') return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' })
        const images = {}
        try {
          if (fs.existsSync(SECTION_DIR)) {
            for (const f of fs.readdirSync(SECTION_DIR)) {
              const key = f.replace(/\.[^.]+$/, '')
              try { images[key] = Math.floor(fs.statSync(path.join(SECTION_DIR, f)).mtimeMs) } catch {}
            }
          }
        } catch {}
        sendJson(res, 200, { ok: true, images })
      })

      // ---- Ommaviy: bitta bo'lim rasmini qaytaradi ----
      server.middlewares.use('/api/section-image', (req, res) => {
        try {
          const url = new URL(req.url, 'http://localhost')
          const key = url.searchParams.get('key') || ''
          if (!SECTION_KEY_RE.test(key)) { res.statusCode = 400; return res.end('Bad request') }
          if (!fs.existsSync(SECTION_DIR)) { res.statusCode = 404; return res.end('Not found') }
          const match = fs.readdirSync(SECTION_DIR).find((f) => f.startsWith(key + '.'))
          if (!match) { res.statusCode = 404; return res.end('Not found') }
          const ext = path.extname(match).toLowerCase()
          const mime =
            ext === '.png' ? 'image/png'
            : ext === '.webp' ? 'image/webp'
            : ext === '.gif' ? 'image/gif'
            : 'image/jpeg'
          res.setHeader('Content-Type', mime)
          res.setHeader('Cache-Control', 'no-cache')
          res.end(fs.readFileSync(path.join(SECTION_DIR, match)))
        } catch {
          res.statusCode = 500; res.end('Server error')
        }
      })

      // ---- ADMIN: bo'lim rasmini yuklash yoki o'chirish ----
      server.middlewares.use('/api/admin/section-image', (req, res) => {
        if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' })
        const admin = requirePerm(req, res, 'sections')
        if (!admin) return
        upload.single('image')(req, res, (err) => {
          try {
            if (err) throw err
            const body = req.body || {}
            const key = String(body.key || '')
            if (!SECTION_KEY_RE.test(key)) return sendJson(res, 400, { ok: false, error: "Noto'g'ri kalit" })
            fs.mkdirSync(SECTION_DIR, { recursive: true })
            const removeExisting = () => {
              for (const f of fs.readdirSync(SECTION_DIR)) {
                if (f.startsWith(key + '.')) fs.unlinkSync(path.join(SECTION_DIR, f))
              }
            }
            if (body.action === 'delete') {
              removeExisting()
              logHistory(admin.name, `bo'lim rasmini o'chirdi: ${key}`)
              return sendJson(res, 200, { ok: true })
            }
            if (!req.file) return sendJson(res, 400, { ok: false, error: 'Rasm tanlanmagan' })
            removeExisting()
            const ext = (path.extname(req.file.originalname) || '.jpg').toLowerCase()
            fs.writeFileSync(path.join(SECTION_DIR, `${key}${ext}`), req.file.buffer)
            logHistory(admin.name, `bo'lim rasmini yangiladi: ${key}`)
            sendJson(res, 200, { ok: true })
          } catch (e) {
            sendJson(res, 500, { ok: false, error: e?.message || 'Server xatosi' })
          }
        })
      })

      // ===== HERO STATISTIKA (10+ / 50+ / 100% bloklari) =====
      const DEFAULT_STATS = [
        { value: '10+', label: 'Yillik tajriba' },
        { value: '50+', label: 'Loyihalar yakunlandi' },
        { value: '100%', label: 'Mijozlar mamnunligi' },
      ]
      const readStats = () => {
        const arr = readJsonArray('stats.json')
        // Doimo 3 ta blok bo'lsin; bo'sh bo'lsa default qiymatlar
        return [0, 1, 2].map((i) => ({
          value: (arr[i] && typeof arr[i].value === 'string') ? arr[i].value : DEFAULT_STATS[i].value,
          label: (arr[i] && typeof arr[i].label === 'string') ? arr[i].label : DEFAULT_STATS[i].label,
        }))
      }

      // ---- Ommaviy: statistikani o'qish ----
      server.middlewares.use('/api/stats', (req, res) => {
        if (req.method !== 'GET') return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' })
        sendJson(res, 200, { ok: true, stats: readStats() })
      })

      // ---- ADMIN: statistikani saqlash ----
      server.middlewares.use('/api/admin/stats', async (req, res) => {
        if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'Method Not Allowed' })
        const admin = requirePerm(req, res, 'stats')
        if (!admin) return
        try {
          const body = await readBody(req)
          const incoming = Array.isArray(body.stats) ? body.stats : []
          const stats = [0, 1, 2].map((i) => ({
            value: String(incoming[i]?.value ?? DEFAULT_STATS[i].value).slice(0, 20),
            label: String(incoming[i]?.label ?? DEFAULT_STATS[i].label).slice(0, 60),
          }))
          writeJsonArray('stats.json', stats)
          logHistory(admin.name, 'hero statistikasini yangiladi')
          sendJson(res, 200, { ok: true, stats })
        } catch (e) {
          sendJson(res, 500, { ok: false, error: e?.message || 'Server xatosi' })
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [
    autoBackup(),
    figmaAssetResolver(),
    barpoApi(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // Ma'lumot va backup fayllari o'zgarganda sahifa qayta yuklanmasin
  server: {
    watch: {
      ignored: ['**/backups/**', '**/data/**', '**/HR_baza/**'],
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
// bo'lim rasmlari API qo'shildi
