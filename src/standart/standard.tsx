import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { SoftDivider } from "../app/components/SoftDivider";

export function StandardPage() {
  type Standard = { id: string; title: string; desc: string };
  const [standards, setStandards] = useState<Standard[]>([]);
  useEffect(() => {
    fetch("/api/standards")
      .then((r) => r.json())
      .then((j) => { if (j.ok) setStandards(j.standards || []); })
      .catch(() => {});
  }, []);

  return (
    <div className="relative bg-white pt-32">
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center justify-center px-8 md:px-16 py-20">
        <div className="max-w-4xl w-full mx-auto text-center space-y-6">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ fontFamily: 'var(--font-display)' }}
            className="text-sm tracking-[0.15em] uppercase text-[#060920]/50"
          >
            BARPO Standarti
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 4rem)', color: '#060920' }}
            className="tracking-tight"
          >
            Sifat og'izda emas. Qabul mezonida bo'ladi.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ fontFamily: 'var(--font-body)', color: '#060920' }}
            className="text-lg opacity-70 max-w-2xl mx-auto"
          >
            BARPO Standarti — bu har bir bosqichni tekshirish, xatoni vaqtida ko'rish, natijani aniq mezon bilan qabul qilish tizimi.
          </motion.p>
        </div>
      </section>

      {/* Nazorat bo'limlari */}
      <section className="relative py-16 px-8 md:px-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {[
              { num: "1", title: "Devor tekshiruvi", desc: "Devor tekisligi ko'z bilan emas, asbob bilan tekshiriladi. Har bir og'ish keyingi pardoz sifatiga ta'sir qiladi." },
              { num: "2", title: "Burchak va chiziqlar", desc: "Burchakdagi xato kichik ko'rinishi mumkin, lekin yakuniy interyerda u birinchi bo'lib seziladi." },
              { num: "3", title: "Armatura va konstruktiv tekshiruv", desc: "Yopilib ketadigan ishlar yopilishdan oldin tekshiriladi. Chunki keyin xatoni tuzatish qimmatga tushadi." },
              { num: "4", title: "Muhandislik tugunlari", desc: "Elektrika, santexnika va ventilyatsiya tizimlari faqat ishlashi emas, kelajakda xizmat ko'rsatishga qulay bo'lishi ham kerak." },
              { num: "5", title: "Tozalik va obyekt madaniyati", desc: "Toza obyekt — bu imij emas. Bu xavfsizlik, tezlik va nazoratning bir qismi." },
              { num: "6", title: "Qabul jarayoni", desc: "Har ish bajarilgandan keyin emas, tekshirilgandan keyin yakunlangan hisoblanadi." },
            ].map((item, i) => (
              <motion.div
                key={item.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.7, delay: i * 0.06 }}
                className="flex gap-5 items-start"
              >
                <span style={{ fontFamily: 'var(--font-display)' }} className="text-3xl font-bold text-[#060920]/15 shrink-0 leading-none mt-1">{item.num}</span>
                <div className="space-y-2">
                  <div className="w-fit">
                    <h3 style={{ fontFamily: 'var(--font-display)' }} className="text-xl text-[#060920]">{item.title}</h3>
                    <SoftDivider className="mt-2.5" />
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/60 leading-relaxed text-sm">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Standards Grid */}
      <section className="relative py-20 px-8 md:px-16">
        <div className="max-w-7xl mx-auto">
          {standards.length === 0 ? (
            <p style={{ fontFamily: 'var(--font-body)' }} className="text-center text-[#060920]/40 tracking-wide py-8">
              Standartlar admin paneldan qo'shiladi.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              {standards.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.8, delay: i * 0.08 }}
                  className="space-y-3"
                >
                  <div className="w-fit">
                    <h3 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl text-[#060920]">
                      {item.title}
                    </h3>
                    <SoftDivider className="mt-3" />
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/60 leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          )}
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
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: '#FFFFFF' }}
            className="tracking-tight"
          >
            Obyektingiz uchun BARPO Standartini qo'llang
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ fontFamily: 'var(--font-body)' }}
            className="text-white/55 text-base max-w-xl mx-auto leading-relaxed"
          >
            Qurilishdagi eng to'g'ri qaror — ish boshlanishidan oldin aniq tizim yaratish.
          </motion.p>
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ fontFamily: 'var(--font-body)', textDecoration: 'none' }}
            className="inline-block px-8 py-3 bg-white text-[#060920] tracking-[0.15em] uppercase text-sm font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            BARPO Standartini qo'llash
          </motion.a>
        </div>
      </section>
    </div>
  );
}
