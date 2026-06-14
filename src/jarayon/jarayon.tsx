import { motion } from "motion/react";

const steps = [
  {
    num: "01",
    title: "Tanishuv va ehtiyojni aniqlash",
    desc: "Avval obyektning vazifasi, hajmi, texnik talabi, muddat va budjet chegarasi aniqlanadi. Biz darhol narx aytib yubormaymiz — avval vazifani tushunamiz.",
  },
  {
    num: "02",
    title: "Obyekt va loyiha tahlili",
    desc: "Chizmalar, mavjud holat, texnik shartlar, muammoli joylar va potensial xavflar ko'rib chiqiladi.",
  },
  {
    num: "03",
    title: "Hisob-kitob va tijoriy taklif",
    desc: "Ish hajmi, material, muddat, brigadalar va xarajatlar asosida tushunarli taklif tayyorlanadi.",
  },
  {
    num: "04",
    title: "Grafik va resurs rejalashtirish",
    desc: "Qaysi ish qachon boshlanishi, qaysi brigada kirishi, material qachon kelishi va qaysi bosqich qachon yopilishi rejalashtiriladi.",
  },
  {
    num: "05",
    title: "Ishga kirishish",
    desc: "Obyekt ichida mas'ullar belgilanadi, ish hududi tartibga keltiriladi va jarayon bosqichma-bosqich boshlanadi.",
  },
  {
    num: "06",
    title: "Texnik nazorat",
    desc: "Har ish bajarilgandan so'ng tekshiriladi. Xato ko'rilsa, keyingi bosqichga o'tkazilmaydi.",
  },
  {
    num: "07",
    title: "Hisobot",
    desc: "Mijozga jarayon bo'yicha aniq hisobot beriladi: nima bajarildi, nima davom etmoqda, qaysi bosqich keyingi.",
  },
  {
    num: "08",
    title: "Yakuniy qabul",
    desc: "Obyekt \"tayyor\" deb faqat vizual chiroy uchun emas, qabul mezonlari bajarilgani uchun topshiriladi.",
  },
];

export function JarayonPage() {
  return (
    <div className="relative bg-white pt-32">
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center px-8 md:px-16 py-20">
        <div className="max-w-4xl w-full mx-auto space-y-6">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ fontFamily: "var(--font-body)" }}
            className="text-xs tracking-[0.25em] uppercase text-[#060920]"
          >
            Jarayon bo'limi
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 5vw, 4rem)",
              color: "#060920",
            }}
            className="tracking-tight"
          >
            Qurilishda xotirjamlik jarayon tushunarli bo'lganda paydo bo'ladi
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-16 h-1 rounded-full bg-[#060920]"
          />

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ fontFamily: "var(--font-body)", color: "#060920" }}
            className="text-lg leading-relaxed opacity-70 max-w-2xl"
          >
            Biz mijozni noaniqlik ichida qoldirmaymiz. Har bosqich, har qaror va har natija tushunarli tizim asosida olib boriladi.
          </motion.p>
        </div>
      </section>

      {/* Steps */}
      <section className="relative py-20 px-8 md:px-16">
        <div className="max-w-5xl mx-auto">
          <div className="space-y-0">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, margin: "-80px" }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="relative"
              >
                {/* Vertical connector line */}
                {i < steps.length - 1 && (
                  <div className="absolute left-[2.25rem] top-[5rem] bottom-0 w-[1px] bg-[#060920]/10 z-0" />
                )}

                <div className="relative z-10 flex gap-6 md:gap-10 py-10 border-b border-[#060920]/8 last:border-0">
                  {/* Step number bubble */}
                  <div className="shrink-0 flex flex-col items-center">
                    <div
                      style={{ fontFamily: "var(--font-display)" }}
                      className="w-[4.5rem] h-[4.5rem] rounded-full bg-[#060920] text-white flex items-center justify-center text-lg font-bold shadow-[0_8px_24px_-8px_rgba(6,9,32,0.35)]"
                    >
                      {step.num}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pt-2">
                    <h2
                      style={{ fontFamily: "var(--font-display)", color: "#060920" }}
                      className="text-2xl md:text-3xl tracking-tight mb-3"
                    >
                      {step.title}
                    </h2>
                    <p
                      style={{ fontFamily: "var(--font-body)", color: "#060920" }}
                      className="text-base leading-relaxed opacity-65 max-w-2xl"
                    >
                      {step.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Kuchli blok */}
      <section className="relative py-16 px-8 md:px-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            className="p-8 md:p-10 border-l-4 border-[#060920] bg-white rounded"
          >
            <p
              style={{ fontFamily: "var(--font-display)", color: "#060920" }}
              className="text-xl md:text-2xl tracking-tight leading-relaxed"
            >
              Biz mijozni qurilish boshqaruvchisiga aylantirmaymiz. Bu mas'uliyatni o'zimiz olamiz.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Summary strip */}
      <section className="relative py-16 px-8 md:px-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            {steps.map((s) => (
              <div
                key={s.num}
                style={{ fontFamily: "var(--font-body)" }}
                className="flex items-center gap-3 px-5 py-3 bg-white border border-[#060920]/10 rounded-full shadow-[0_2px_8px_-4px_rgba(6,9,32,0.12)]"
              >
                <span
                  style={{ fontFamily: "var(--font-display)" }}
                  className="text-xs font-bold text-[#060920]"
                >
                  {s.num}
                </span>
                <span className="text-sm text-[#060920]/80">{s.title}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA 1 */}
      <section className="relative py-16 px-8 md:px-16 bg-[#060920]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.5rem, 4vw, 2.5rem)",
              color: "#FFFFFF",
            }}
            className="tracking-tight"
          >
            Loyihangizni tizim bilan boshlang
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ fontFamily: "var(--font-body)" }}
            className="text-white/55 text-base max-w-xl mx-auto leading-relaxed"
          >
            Qurilishdagi eng to'g'ri qaror — ish boshlanishidan oldin aniq tizim yaratish.
          </motion.p>
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ fontFamily: "var(--font-body)", textDecoration: "none" }}
            className="inline-block px-8 py-3 bg-white text-[#060920] tracking-[0.15em] uppercase text-sm font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            Loyihani muhokama qilish
          </motion.a>
        </div>
      </section>
    </div>
  );
}
