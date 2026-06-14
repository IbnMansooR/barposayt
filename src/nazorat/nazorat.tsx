import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SoftDivider } from "../app/components/SoftDivider";

const CHAOS = [
  { p: "Material kechikishi", s: "Ta'minot grafigi oldindan tuziladi — material obyektga kerak bo'lishidan oldin yetkaziladi." },
  { p: "Brigadalar to'qnashuvi", s: "Brigadalar navbati umumiy grafik asosida aniqlashtiriladi, bir zonada urishib qolmaydi." },
  { p: "Noto'g'ri smeta", s: "Smeta real hajm va narx asosida hisoblanadi — ortiqcha xarajat oldindan ko'rinadi." },
  { p: "Yopilgan xato", s: "Yopiladigan ishlar yopilishdan oldin tekshiriladi — keyin buzib tuzatish kerak bo'lmaydi." },
  { p: "Muddat cho'zilishi", s: "Har bosqich grafikka bog'lanadi, kechikish darhol ko'rinadi va to'g'rilanadi." },
  { p: "Mijozga hisobot yo'qligi", s: "Mijozga haftalik hisobot, foto/video progress va keyingi hafta rejasi yetkaziladi." },
  { p: "Muhandislik va pardoz kelishmovchiligi", s: "Muhandislik tugunlari pardozdan oldin tekshiriladi va o'zaro kelishtiriladi." },
];

const CHECKPOINTS = [
  { t: "Ish boshlanishidan oldin", d: "Reja, grafik va mas'uliyat aniqlanadi." },
  { t: "Material kelganda", d: "Sifat va hajm qabul qilinadi." },
  { t: "Yopiladigan ishlar oldidan", d: "Armatura, kabel, quvurlar yopilishdan oldin tekshiriladi." },
  { t: "Pardozdan oldin", d: "Devor, burchak va tekislik mezon bilan tekshiriladi." },
  { t: "Yakuniy qabuldan oldin", d: "Barcha tugunlar loyiha asosida solishtiriladi." },
  { t: "Topshirish vaqtida", d: "Obyekt qabul mezonlari bilan rasman topshiriladi." },
];

const PANEL = [
  "Haftalik hisobot",
  "Bajarilgan ishlar ro'yxati",
  "Foto / video progress",
  "Muammolar va yechimlar",
  "Keyingi hafta rejasi",
  "Sarf va muddat nazorati",
];

export function NazoratPage() {
  const [active, setActive] = useState(0);

  return (
    <div className="relative bg-white pt-32">
      {/* ===== XAOS XARITASI ===== */}
      <section className="px-8 md:px-16 pt-12 pb-16">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-10">
            <p style={{ fontFamily: "var(--font-body)" }} className="text-sm tracking-[0.2em] uppercase text-[#060920]/50 mb-4">QURILISHDAGI XAOS XARITASI</p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 4rem)", color: "#060920" }} className="tracking-tight leading-[1.1]">
              Qurilish qayerda buziladi?
            </h1>
            <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/65 leading-relaxed mt-5 max-w-2xl">
              Muammoli nuqtani bosing — BARPO o'sha joyda qanday yechim qo'llashini ko'ring.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Nuqtalar */}
            <div className="flex flex-col gap-2">
              {CHAOS.map((c, i) => (
                <button
                  key={c.p}
                  onClick={() => setActive(i)}
                  style={{ fontFamily: "var(--font-body)" }}
                  className={`text-left px-5 py-4 rounded-2xl border transition-all ${
                    active === i
                      ? "bg-[#060920] text-white border-[#060920]"
                      : "bg-white border-[#060920]/15 text-[#060920]/70 hover:border-[#060920]/35"
                  }`}
                >
                  <span className="text-sm tracking-wide">{c.p}</span>
                </button>
              ))}
            </div>

            {/* Yechim */}
            <div className="md:sticky md:top-28">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-3xl card-shadow p-8"
                >
                  <p style={{ fontFamily: "var(--font-body)" }} className="text-xs tracking-[0.2em] uppercase text-[#060920]/40 mb-3">MUAMMO</p>
                  <div className="w-fit mb-5">
                    <h3 style={{ fontFamily: "var(--font-display)" }} className="text-2xl text-[#060920]">{CHAOS[active].p}</h3>
                    <SoftDivider className="mt-3" />
                  </div>
                  <p style={{ fontFamily: "var(--font-body)" }} className="text-xs tracking-[0.2em] uppercase text-[#060920]/40 mb-2">BARPO YECHIMI</p>
                  <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/75 leading-relaxed text-lg">{CHAOS[active].s}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ===== NAZORAT NUQTALARI (timeline) ===== */}
      <section className="px-8 md:px-16 py-16 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <p style={{ fontFamily: "var(--font-body)" }} className="text-sm tracking-[0.2em] uppercase text-[#060920]/50 mb-4">BARPO NAZORAT NUQTALARI</p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 4vw, 3rem)", color: "#060920" }} className="tracking-tight">
              Biz qayerda to'xtab, tekshiramiz?
            </h2>
          </div>

          <div className="relative pl-8">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[#060920]/15" />
            {CHECKPOINTS.map((c, i) => (
              <motion.div
                key={c.t}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, delay: i * 0.06 }}
                className="relative mb-9"
              >
                <span className="absolute -left-8 top-1.5 w-[15px] h-[15px] rounded-full bg-[#060920] ring-4 ring-white" />
                <h3 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">{c.t}</h3>
                <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/60 mt-1">{c.d}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 pl-5 border-l-2 border-[#060920]/30">
            <p style={{ fontFamily: "var(--font-display)" }} className="text-lg text-[#060920] italic leading-snug">
              Bu bosqichda tekshiruv bo'lmasa, keyingi bosqichda xato qimmatlashadi.
            </p>
          </div>
        </div>
      </section>

      {/* ===== XOTIRJAMLIK PANELI ===== */}
      <section className="px-8 md:px-16 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <p style={{ fontFamily: "var(--font-body)" }} className="text-sm tracking-[0.2em] uppercase text-[#060920]/50 mb-4">OBYEKT EGASI UCHUN XOTIRJAMLIK PANELI</p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 4vw, 3rem)", color: "#060920" }} className="tracking-tight leading-[1.15]">
              Siz obyektni his qilasiz, lekin har kuni boshqarmaysiz.
            </h2>
          </div>

          <div className="bg-white rounded-3xl card-shadow p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {PANEL.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="flex items-center gap-4"
                >
                  <span className="w-2 h-2 rounded-full bg-[#060920]/50 flex-shrink-0" />
                  <span style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/75 text-lg">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/45 text-sm mt-4">
            * Bu BARPO yondashuvini ko'rsatadigan konsepsiya. Har bir loyiha bo'yicha mijozga shu tartibda hisobot beriladi.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 px-8 md:px-16 bg-[#060920]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 4vw, 2.5rem)", color: "#FFFFFF" }} className="tracking-tight">
            Obyekt egasi har kuni muammo ortidan yugurmasligi kerak.
          </h2>
          <a href="#contact" style={{ fontFamily: "var(--font-body)" }}
            className="inline-block px-8 py-3 bg-white text-[#060920] tracking-[0.15em] uppercase text-sm font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all">
            Loyihani muhokama qilish
          </a>
        </div>
      </section>
    </div>
  );
}
