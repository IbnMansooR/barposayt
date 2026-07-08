import { motion } from "motion/react";
import { SoftDivider } from "../app/components/SoftDivider";
import { useT } from "../app/i18n";

const ROLES = [
  { role: ["Loyiha rahbari", "Руководитель проекта"], desc: ["Jarayonning umumiy ritmi, muddat va mas'uliyatni nazorat qiladi.", "Контролирует общий ритм процесса, сроки и ответственность."] },
  { role: ["Texnik nazorat", "Технический надзор"], desc: ["Ish sifatini ko'z bilan emas, mezon bilan tekshiradi.", "Проверяет качество работ не на глаз, а по критериям."] },
  { role: ["Prorab", "Прораб"], desc: ["Maydondagi kunlik harakat, brigadalar va vazifalarni boshqaradi.", "Управляет ежедневной работой на площадке, бригадами и задачами."] },
  { role: ["Muhandis", "Инженер"], desc: ["Ko'rinmaydigan tizimlar xavfsiz va to'g'ri ishlashini ta'minlaydi.", "Обеспечивает безопасную и правильную работу скрытых систем."] },
  { role: ["Ta'minot", "Снабжение"], desc: ["Material o'z vaqtida kelmasa, grafik buziladi. Shu sabab ta'minot ham qurilishning muhim qismi.", "Если материал не приходит вовремя, график рушится. Поэтому снабжение — важная часть строительства."] },
  { role: ["Marketing / aloqa", "Маркетинг / коммуникация"], desc: ["Mijozga kompaniya madaniyati, jarayon va natija to'g'ri yetkaziladi.", "Клиенту правильно доносятся культура компании, процесс и результат."] },
];

export function JamoaPage() {
  const t = useT();
  return (
    <div className="relative bg-white pt-32">
      {/* Hero */}
      <section className="px-8 md:px-16 pt-12 pb-12 text-center">
        <div className="max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ fontFamily: "var(--font-body)" }}
            className="text-sm tracking-[0.2em] uppercase text-[#060920]/50 mb-4"
          >
            {t("JAMOA", "КОМАНДА")}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 4rem)", color: "#060920" }}
            className="tracking-tight leading-[1.1]"
          >
            {t("Obyektni bitta odam emas. Tizimga ulangan jamoa quradi.", "Объект строит не один человек. Его строит команда, подключённая к системе.")}
          </motion.h1>
        </div>
      </section>

      {/* Roles */}
      <section className="px-8 md:px-16 py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-10">
          {ROLES.map((r, i) => (
            <motion.div
              key={r.role[0]}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.7, delay: i * 0.06 }}
              className="space-y-3"
            >
              <div className="w-fit">
                <h3 style={{ fontFamily: "var(--font-display)" }} className="text-2xl text-[#060920]">{t(r.role[0], r.role[1])}</h3>
                <SoftDivider className="mt-3" />
              </div>
              <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/65 leading-relaxed">{t(r.desc[0], r.desc[1])}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 px-8 md:px-16 bg-[#060920]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 4vw, 2.5rem)", color: "#FFFFFF" }} className="tracking-tight">
            {t("Tizimli jamoa bilan ishlashni xohlaysizmi?", "Хотите работать с системной командой?")}
          </h2>
          <a href="#contact" style={{ fontFamily: "var(--font-body)" }}
            className="inline-block px-8 py-3 bg-white text-[#060920] tracking-[0.15em] uppercase text-sm font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all">
            {t("Bog'lanish", "Связаться")}
          </a>
        </div>
      </section>
    </div>
  );
}
