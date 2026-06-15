import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { SoftDivider } from "../app/components/SoftDivider";
import { BarpoWord } from "../app/components/Barpo";
import { useT } from "../app/i18n";

export function StandardPage() {
  const t = useT();
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
            <BarpoWord /> {t("Standarti", "Стандарт")}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 4rem)', color: '#060920' }}
            className="tracking-tight"
          >
            {t("Sifat og'izda emas. Qabul mezonida bo'ladi.", "Качество не на словах. Оно в критерии приёмки.")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ fontFamily: 'var(--font-body)', color: '#060920' }}
            className="text-lg opacity-70 max-w-2xl mx-auto"
          >
            <BarpoWord /> {t("Standarti — bu har bir bosqichni tekshirish, xatoni vaqtida ko'rish, natijani aniq mezon bilan qabul qilish tizimi.", "Стандарт — это система проверки каждого этапа, своевременного выявления ошибки и приёмки результата по чётким критериям.")}
          </motion.p>
        </div>
      </section>

      {/* Nazorat bo'limlari */}
      <section className="relative py-16 px-8 md:px-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {[
              { num: "1", title: ["Devor tekshiruvi", "Проверка стен"], desc: ["Devor tekisligi ko'z bilan emas, asbob bilan tekshiriladi. Har bir og'ish keyingi pardoz sifatiga ta'sir qiladi.", "Ровность стен проверяется не на глаз, а прибором. Каждое отклонение влияет на качество последующей отделки."] },
              { num: "2", title: ["Burchak va chiziqlar", "Углы и линии"], desc: ["Burchakdagi xato kichik ko'rinishi mumkin, lekin yakuniy interyerda u birinchi bo'lib seziladi.", "Ошибка в углу может казаться мелкой, но в готовом интерьере она замечается первой."] },
              { num: "3", title: ["Armatura va konstruktiv tekshiruv", "Армирование и конструктив"], desc: ["Yopilib ketadigan ishlar yopilishdan oldin tekshiriladi. Chunki keyin xatoni tuzatish qimmatga tushadi.", "Скрываемые работы проверяются до закрытия. Потому что позже исправление ошибки обходится дорого."] },
              { num: "4", title: ["Muhandislik tugunlari", "Инженерные узлы"], desc: ["Elektrika, santexnika va ventilyatsiya tizimlari faqat ishlashi emas, kelajakda xizmat ko'rsatishga qulay bo'lishi ham kerak.", "Электрика, сантехника и вентиляция должны не только работать, но и быть удобными для обслуживания в будущем."] },
              { num: "5", title: ["Tozalik va obyekt madaniyati", "Чистота и культура объекта"], desc: ["Toza obyekt — bu imij emas. Bu xavfsizlik, tezlik va nazoratning bir qismi.", "Чистый объект — это не имидж. Это часть безопасности, скорости и контроля."] },
              { num: "6", title: ["Qabul jarayoni", "Процесс приёмки"], desc: ["Har ish bajarilgandan keyin emas, tekshirilgandan keyin yakunlangan hisoblanadi.", "Каждая работа считается завершённой не после выполнения, а после проверки."] },
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
                    <h3 style={{ fontFamily: 'var(--font-display)' }} className="text-xl text-[#060920]">{t(item.title[0], item.title[1])}</h3>
                    <SoftDivider className="mt-2.5" />
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/60 leading-relaxed text-sm">
                    {t(item.desc[0], item.desc[1])}
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
              {t("Standartlar admin paneldan qo'shiladi.", "Стандарты добавляются из админ-панели.")}
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
            {t("Obyektingiz uchun", "Примените")} <BarpoWord light /> {t("Standartini qo'llang", "Стандарт для вашего объекта")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ fontFamily: 'var(--font-body)' }}
            className="text-white/55 text-base max-w-xl mx-auto leading-relaxed"
          >
            {t("Qurilishdagi eng to'g'ri qaror — ish boshlanishidan oldin aniq tizim yaratish.", "Самое верное решение в строительстве — создать чёткую систему до начала работ.")}
          </motion.p>
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ fontFamily: 'var(--font-body)', textDecoration: 'none' }}
            className="inline-block px-8 py-3 bg-white text-[#060920] tracking-[0.15em] uppercase text-sm font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            <BarpoWord /> {t("Standartini qo'llash", "Применить Стандарт")}
          </motion.a>
        </div>
      </section>
    </div>
  );
}
