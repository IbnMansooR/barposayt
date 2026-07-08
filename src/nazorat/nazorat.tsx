import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SoftDivider } from "../app/components/SoftDivider";
import { BarpoWord } from "../app/components/Barpo";
import { useT } from "../app/i18n";

const CHAOS = [
  { p: ["Material kechikishi", "Задержка материалов"], s: ["Ta'minot grafigi oldindan tuziladi — material obyektga kerak bo'lishidan oldin yetkaziladi.", "График поставок составляется заранее — материал доставляется до того, как понадобится на объекте."] },
  { p: ["Brigadalar to'qnashuvi", "Столкновение бригад"], s: ["Brigadalar navbati umumiy grafik asosida aniqlashtiriladi, bir zonada urishib qolmaydi.", "Очерёдность бригад определяется по общему графику, они не сталкиваются в одной зоне."] },
  { p: ["Noto'g'ri smeta", "Неверная смета"], s: ["Smeta real hajm va narx asosida hisoblanadi — ortiqcha xarajat oldindan ko'rinadi.", "Смета считается по реальным объёмам и ценам — лишние расходы видны заранее."] },
  { p: ["Yopilgan xato", "Скрытая ошибка"], s: ["Yopiladigan ishlar yopilishdan oldin tekshiriladi — keyin buzib tuzatish kerak bo'lmaydi.", "Скрытые работы проверяются до закрытия — потом не придётся ломать и переделывать."] },
  { p: ["Muddat cho'zilishi", "Затягивание сроков"], s: ["Har bosqich grafikka bog'lanadi, kechikish darhol ko'rinadi va to'g'rilanadi.", "Каждый этап привязан к графику, задержка видна сразу и исправляется."] },
  { p: ["Mijozga hisobot yo'qligi", "Отсутствие отчётов клиенту"], s: ["Mijozga kunlik hisobot, foto/video progress va keyingi kun rejasi yetkaziladi.", "Клиенту предоставляются ежедневный отчёт, фото/видео прогресса и план на следующий день."] },
  { p: ["Muhandislik va pardoz kelishmovchiligi", "Несогласованность инженерии и отделки"], s: ["Muhandislik tugunlari pardozdan oldin tekshiriladi va o'zaro kelishtiriladi.", "Инженерные узлы проверяются до отделки и согласуются между собой."] },
];

const CHECKPOINTS = [
  { t: ["Ish boshlanishidan oldin", "До начала работ"], d: ["Reja, grafik va mas'uliyat aniqlanadi.", "Определяются план, график и ответственность."] },
  { t: ["Material kelganda", "При поступлении материала"], d: ["Sifat va hajm qabul qilinadi.", "Принимаются качество и объём."] },
  { t: ["Yopiladigan ishlar oldidan", "Перед скрытыми работами"], d: ["Armatura, kabel, quvurlar yopilishdan oldin tekshiriladi.", "Арматура, кабели, трубы проверяются до закрытия."] },
  { t: ["Pardozdan oldin", "Перед отделкой"], d: ["Devor, burchak va tekislik mezon bilan tekshiriladi.", "Стены, углы и ровность проверяются по критериям."] },
  { t: ["Yakuniy qabuldan oldin", "Перед финальной приёмкой"], d: ["Barcha tugunlar loyiha asosida solishtiriladi.", "Все узлы сверяются с проектом."] },
  { t: ["Topshirish vaqtida", "При сдаче"], d: ["Obyekt qabul mezonlari bilan rasman topshiriladi.", "Объект официально сдаётся по критериям приёмки."] },
];

const PANEL = [
  ["Kunlik hisobot", "Ежедневный отчёт"],
  ["Bajarilgan ishlar ro'yxati", "Список выполненных работ"],
  ["Foto / video progress", "Фото / видео прогресс"],
  ["Muammolar va yechimlar", "Проблемы и решения"],
  ["Keyingi kun rejasi", "План на следующий день"],
  ["Sarf va muddat nazorati", "Контроль расходов и сроков"],
];

export function NazoratPage() {
  const tr = useT();
  const [active, setActive] = useState(0);

  return (
    <div className="relative bg-white pt-32">
      {/* ===== XAOS XARITASI ===== */}
      <section className="px-8 md:px-16 pt-12 pb-16">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-10">
            <p style={{ fontFamily: "var(--font-body)" }} className="text-sm tracking-[0.2em] uppercase text-[#060920]/50 mb-4">{tr("QURILISHDAGI XAOS XARITASI", "КАРТА ХАОСА В СТРОИТЕЛЬСТВЕ")}</p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 4rem)", color: "#060920" }} className="tracking-tight leading-[1.1]">
              {tr("Qurilish qayerda buziladi?", "Где строительство ломается?")}
            </h1>
            <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/65 leading-relaxed mt-5 max-w-2xl">
              {tr("Muammoli nuqtani bosing —", "Нажмите на проблемную точку —")} <BarpoWord /> {tr("o'sha joyda qanday yechim qo'llashini ko'ring.", "посмотрите, какое решение применяется в этом месте.")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Nuqtalar */}
            <div className="flex flex-col gap-2">
              {CHAOS.map((c, i) => (
                <button
                  key={c.p[0]}
                  onClick={() => setActive(i)}
                  aria-pressed={active === i}
                  style={{ fontFamily: "var(--font-body)" }}
                  className={`text-left px-5 py-4 rounded-2xl border transition-all ${
                    active === i
                      ? "bg-[#060920] text-white border-[#060920]"
                      : "bg-white border-[#060920]/15 text-[#060920]/70 hover:border-[#060920]/35"
                  }`}
                >
                  <span className="text-sm tracking-wide">{tr(c.p[0], c.p[1])}</span>
                </button>
              ))}
            </div>

            {/* Yechim */}
            <div className="md:sticky md:top-28" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-3xl card-shadow p-8"
                >
                  <p style={{ fontFamily: "var(--font-body)" }} className="text-xs tracking-[0.2em] uppercase text-[#060920]/40 mb-3">{tr("MUAMMO", "ПРОБЛЕМА")}</p>
                  <div className="w-fit mb-5">
                    <h3 style={{ fontFamily: "var(--font-display)" }} className="text-2xl text-[#060920]">{tr(CHAOS[active].p[0], CHAOS[active].p[1])}</h3>
                    <SoftDivider className="mt-3" />
                  </div>
                  <p style={{ fontFamily: "var(--font-body)" }} className="text-xs tracking-[0.2em] uppercase text-[#060920]/40 mb-2"><BarpoWord /> {tr("YECHIMI", "РЕШЕНИЕ")}</p>
                  <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/75 leading-relaxed text-lg">{tr(CHAOS[active].s[0], CHAOS[active].s[1])}</p>
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
            <p style={{ fontFamily: "var(--font-body)" }} className="text-sm tracking-[0.2em] uppercase text-[#060920]/50 mb-4"><BarpoWord /> {tr("NAZORAT NUQTALARI", "ТОЧКИ КОНТРОЛЯ")}</p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 4vw, 3rem)", color: "#060920" }} className="tracking-tight">
              {tr("Biz qayerda to'xtab, tekshiramiz?", "Где мы останавливаемся и проверяем?")}
            </h2>
          </div>

          <div className="relative pl-8">
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[#060920]/15" />
            {CHECKPOINTS.map((c, i) => (
              <motion.div
                key={c.t[0]}
                initial={{ opacity: 0, x: 16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, delay: i * 0.06 }}
                className="relative mb-9"
              >
                <span className="absolute -left-8 top-1.5 w-[15px] h-[15px] rounded-full bg-[#060920] ring-4 ring-white" />
                <h3 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">{tr(c.t[0], c.t[1])}</h3>
                <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/60 mt-1">{tr(c.d[0], c.d[1])}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 pl-5 border-l-2 border-[#060920]/30">
            <p style={{ fontFamily: "var(--font-display)" }} className="text-lg text-[#060920] italic leading-snug">
              {tr("Bu bosqichda tekshiruv bo'lmasa, keyingi bosqichda xato qimmatlashadi.", "Если на этом этапе нет проверки, на следующем ошибка обходится дороже.")}
            </p>
          </div>
        </div>
      </section>

      {/* ===== XOTIRJAMLIK PANELI ===== */}
      <section className="px-8 md:px-16 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10">
            <p style={{ fontFamily: "var(--font-body)" }} className="text-sm tracking-[0.2em] uppercase text-[#060920]/50 mb-4">{tr("OBYEKT EGASI UCHUN XOTIRJAMLIK PANELI", "ПАНЕЛЬ СПОКОЙСТВИЯ ДЛЯ ВЛАДЕЛЬЦА ОБЪЕКТА")}</p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 4vw, 3rem)", color: "#060920" }} className="tracking-tight leading-[1.15]">
              {tr("Siz obyektni his qilasiz, lekin har kuni boshqarmaysiz.", "Вы чувствуете объект, но не управляете им каждый день.")}
            </h2>
          </div>

          <div className="bg-white rounded-3xl card-shadow p-8 md:p-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {PANEL.map((item, i) => (
                <motion.div
                  key={item[0]}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="flex items-center gap-4"
                >
                  <span className="w-2 h-2 rounded-full bg-[#060920]/50 flex-shrink-0" />
                  <span style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/75 text-lg">{tr(item[0], item[1])}</span>
                </motion.div>
              ))}
            </div>
          </div>
          <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/45 text-sm mt-4">
            * {tr("Bu", "Это")} <BarpoWord /> {tr("yondashuvini ko'rsatadigan konsepsiya. Har bir loyiha bo'yicha mijozga shu tartibda hisobot beriladi.", "концепция, показывающая подход. По каждому проекту клиенту предоставляется отчёт в таком порядке.")}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 px-8 md:px-16 bg-[#060920]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 4vw, 2.5rem)", color: "#FFFFFF" }} className="tracking-tight">
            {tr("Obyekt egasi har kuni muammo ortidan yugurmasligi kerak.", "Владелец объекта не должен каждый день бегать за проблемами.")}
          </h2>
          <a href="#contact" style={{ fontFamily: "var(--font-body)" }}
            className="inline-block px-8 py-3 bg-white text-[#060920] tracking-[0.15em] uppercase text-sm font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all">
            {tr("Loyihani muhokama qilish", "Обсудить проект")}
          </a>
        </div>
      </section>
    </div>
  );
}
