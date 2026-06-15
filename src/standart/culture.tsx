import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { BarpoWord, barpo } from "../app/components/Barpo";
import { useT } from "../app/i18n";

export function CulturePage() {
  const t = useT();
  const [sectionImages, setSectionImages] = useState<Record<string, number>>({});
  useEffect(() => {
    fetch("/api/section-images")
      .then((r) => r.json())
      .then((j) => { if (j.ok) setSectionImages(j.images || {}); })
      .catch(() => {});
  }, []);

  type Ornament = { id: string; old: string; new: string; desc: string; history?: string; hasImage?: boolean };
  const [ornaments, setOrnaments] = useState<Ornament[]>([]);
  useEffect(() => {
    fetch("/api/ornaments")
      .then((r) => r.json())
      .then((j) => { if (j.ok) setOrnaments(j.ornaments || []); })
      .catch(() => {});
  }, []);

  const cultureElements = [
    {
      title: ["Tartib", "Порядок"],
      description: ["Qurilish maydonida tartib bo'lmasa, sifat ham, tezlik ham, iqtisodiy foyda ham xavf ostida qoladi.", "Если на стройплощадке нет порядка, под угрозой и качество, и скорость, и экономическая выгода."],
      details: ["Har qanday katta loyihada tartib — tartibsizlik ichidagi tizim demakdir. Tartib yaratishda biz qoidalarga qat'iy amal qilamiz: maydon tozaligi, reja asosidagi to'g'ri harakatlar, har bir brigada va ishchining aniq o'rni.", "В любом крупном проекте порядок — это система внутри хаоса. Создавая порядок, мы строго следуем правилам: чистота площадки, верные действия по плану, чёткое место каждой бригады и рабочего."],
      principles: [
        ["Ish joyining tozaligi va tartibliligi", "Чистота и порядок на рабочем месте"],
        ["Materiallarni to'g'ri saqlash va taqsimlash", "Правильное хранение и распределение материалов"],
        ["Brigada va xizmatlarning maydondagi aniq joylashuvi", "Чёткое расположение бригад и служб на площадке"],
        ["Xavfsizlik qoidalarining qat'iy bajarilishi", "Строгое соблюдение правил безопасности"],
        ["Har kuni ish yakunida tozalash va ertangi kunga tayyorgarlik", "Ежедневная уборка в конце работ и подготовка к следующему дню"],
      ],
    },
    {
      title: ["Hisob", "Расчёт"],
      description: ["Har bir material, har bir ish hajmi, har bir kun va har bir qaror hisobda bo'lishi kerak.", "Каждый материал, каждый объём работ, каждый день и каждое решение должны быть учтены."],
      details: ["Xarajat, muddat, resurs — hammasi hisobga olingan sonlar. Taxmin va chamalab ish qilish katta loyihalarda o'rinsiz. Biz har bir so'm, har bir kub metr, har bir soat uchun javob beramiz.", "Расходы, сроки, ресурсы — всё это просчитанные цифры. Догадки и работа «на глаз» неуместны в крупных проектах. Мы отвечаем за каждый сум, каждый кубометр, каждый час."],
      principles: [
        ["Barcha xarajatlarning aniq o'lchovi va hisobi", "Точный учёт и расчёт всех расходов"],
        ["Materiallarning kelishi va sarflanishi hisobda", "Поступление и расход материалов под учётом"],
        ["Ishchilarga ish hajmiga qarab hisob va to'lov", "Расчёт и оплата рабочим по объёму работ"],
        ["Vaqtning aniq grafik asosida o'lchanishi", "Измерение времени по чёткому графику"],
        ["Foyda va tejamkorlikning birgalikda ta'minlanishi", "Совместное обеспечение прибыли и экономии"],
      ],
    },
    {
      title: ["Intizom", "Дисциплина"],
      description: ["Belgilangan grafik, texnik talab va qabul mezonlari ish jarayonining asosiy qoidasi bo'ladi.", "Установленный график, технические требования и критерии приёмки — основное правило рабочего процесса."],
      details: ["Intizom — jarayonning uzviyligi va har bir xodim o'z zimmasidagi vazifani aniq bilishi demakdir. Intizom bor joyda bosqichlar o'z vaqtida almashinadi va jarayon to'xtab qolmaydi.", "Дисциплина — это непрерывность процесса и чёткое понимание каждым сотрудником своей задачи. Там, где есть дисциплина, этапы сменяются вовремя и процесс не останавливается."],
      principles: [
        ["Qat'iy ish grafigi va muddat belgilash", "Строгий рабочий график и установка сроков"],
        ["Texnik talablarning barcha xodimlarga ma'lum bo'lishi", "Знание технических требований всеми сотрудниками"],
        ["Jarayon tartibiga to'liq rioya qilish", "Полное соблюдение порядка процесса"],
        ["Har bir ish bosqichining aniq hisobi", "Чёткий учёт каждого этапа работ"],
        ["Qabul mezonlarining maydonda qo'llanilishi", "Применение критериев приёмки на площадке"],
      ],
    },
    {
      title: ["Hurmat", "Уважение"],
      description: ["Buyurtmachining vaqti, mablag'i va ishonchi hurmat qilinadi. Qurilish mijozni charchatadigan jarayon bo'lmasligi kerak.", "Время, средства и доверие заказчика уважаются. Строительство не должно быть процессом, утомляющим клиента."],
      details: ["BARPO falsafasida mijoz — bu hamkor. Uning vaqti, mablag'i va ishonchi — qimmatli manba. Biz mijozni noaniqlik bilan charchatmaymiz: darhol tushuntiramiz, maslahat beramiz va muammoning yechimini taklif etamiz.", "В философии BARPO клиент — это партнёр. Его время, средства и доверие — ценный ресурс. Мы не утомляем клиента неопределённостью: сразу объясняем, советуем и предлагаем решение проблемы."],
      principles: [
        ["Kunlik hisobot va jarayon haqida muntazam ma'lumot", "Ежедневный отчёт и регулярная информация о процессе"],
        ["Tushuntirish va maslahat berish", "Разъяснение и консультирование"],
        ["Muammolarni tezda hal qilish", "Быстрое решение проблем"],
        ["Muhim qarorlar oldidan mijozning roziligini olish", "Получение согласия клиента перед важными решениями"],
        ["Har kuni ishonchning ta'minlanishi", "Ежедневное укрепление доверия"],
      ],
    },
    {
      title: ["Meros", "Наследие"],
      description: ["O'zbekiston me'moriy merosi bizga shuni o'rgatadi: mustahkam inshoot faqat material bilan emas, fikr, o'lchov va tartib bilan barpo bo'ladi.", "Архитектурное наследие Узбекистана учит нас: прочное сооружение создаётся не только материалом, но и мыслью, расчётом и порядком."],
      details: ["Qadimiy o'zbek me'morchiligi — asrlar davomida to'plangan texnik bilim va badiiy tafakkur belgisidir. Girih naqshi, zanjira naqshi, turunj, koshin, gumbaz — bu detallarning har birida chuqur aql va hisob borligini ko'ramiz. BARPO shu merosga tayanadi:", "Древнее узбекское зодчество — знак технических знаний и художественного мышления, накопленных веками. Гирих, занджира, турундж, кошин, купол — в каждой из этих деталей мы видим глубокий ум и расчёт. BARPO опирается на это наследие:"],
      principles: [
        ["Zamonaviy texnologiya va qadimiy me'moriy tafakkur birligi", "Единство современных технологий и древнего архитектурного мышления"],
        ["Har bir detal va konstruksiyaning ma'nosi", "Смысл каждой детали и конструкции"],
        ["Milliy o'ziga xoslikning saqlanishi", "Сохранение национальной самобытности"],
        ["Ishni faqat material bilan emas, fikr bilan qilish", "Делать работу не только материалом, но и мыслью"],
        ["O'tmish va bugun o'rtasidagi tarixiy aloqani saqlash", "Сохранение исторической связи между прошлым и настоящим"],
      ],
    },
  ];

  return (
    <div className="relative bg-white pt-32">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center px-8 md:px-16 py-20 overflow-hidden">
        <div className="max-w-5xl w-full mx-auto text-center space-y-8">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            style={{ fontFamily: 'var(--font-display)' }} className="text-sm tracking-[0.15em] uppercase text-[#060920]/50">
            {t("Bizning falsafamiz", "Наша философия")}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }} className="text-[#060920] tracking-tight font-light leading-tight">
            {t("Yangi Qurilish Madaniyati", "Новая культура строительства")}
          </motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="space-y-6">
            <p style={{ fontFamily: 'var(--font-body)' }} className="text-lg md:text-xl text-[#060920]/70 max-w-3xl mx-auto leading-relaxed">
              {t("Qurilish madaniyati — bu baland shior emas.", "Культура строительства — это не громкий лозунг.")}
            </p>
            <p style={{ fontFamily: 'var(--font-body)' }} className="text-lg md:text-xl font-medium text-[#060920] max-w-3xl mx-auto">
              {t("Bu har kuni obyekt ichida ko'rinadigan tartib.", "Это порядок, видимый на объекте каждый день.")}
            </p>
            <p style={{ fontFamily: 'var(--font-body)' }} className="text-base text-[#060920]/60 max-w-2xl mx-auto">
              <BarpoWord /> {t("uchun qurilish madaniyati — bu ish joyining tozaligi, chizmadagi aniqlik, materialdagi hisob, brigadadagi intizom, nazoratdagi qat'iylik va mijozga bo'lgan hurmatdir.", "для нас культура строительства — это чистота рабочего места, точность в чертеже, расчёт в материалах, дисциплина в бригаде, твёрдость в контроле и уважение к клиенту.")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Culture Pillars */}
      <section className="relative py-24 px-8 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-20">
            {cultureElements.map((element, index) => (
              <motion.div key={element.title[0]} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, delay: index * 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className={index % 2 === 1 ? "md:order-2" : ""}>
                  <div className="space-y-6">
                    <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.1 }}
                      style={{ fontFamily: 'var(--font-display)' }} className="text-[#060920] text-4xl font-light leading-tight">
                      {t(element.title[0], element.title[1])}
                    </motion.h2>
                    <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.15 }}
                      style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/70 text-lg leading-relaxed font-medium">
                      {barpo(t(element.description[0], element.description[1]))}
                    </motion.p>
                    <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
                      style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/60 text-base leading-relaxed">
                      {barpo(t(element.details[0], element.details[1]))}
                    </motion.p>
                    <div className="space-y-2">
                      {element.principles.map((principle, i) => (
                        <motion.div key={principle[0]} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.25 + i * 0.05 }} className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 bg-[#060920]/60 rounded-full flex-shrink-0 mt-2" />
                          <span style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/60 text-sm">{t(principle[0], principle[1])}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className={index % 2 === 1 ? "md:order-1" : ""}>
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.3 }}
                    className="relative h-80 md:h-96 flex items-center justify-center overflow-hidden rounded-3xl">
                    {sectionImages[`culture-${index}`] ? (
                      <img src={`/api/section-image?key=culture-${index}&v=${sectionImages[`culture-${index}`]}`} alt={t(element.title[0], element.title[1])} className="absolute inset-0 w-full h-full object-cover rounded-3xl" />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-[#060920]/8 to-[#060920]/0 rounded-3xl" />
                        <div className="relative z-10 text-center space-y-4">
                          <p style={{ fontFamily: 'var(--font-display)' }} className="text-2xl text-[#060920]/30 font-light">{t(element.title[0], element.title[1])}</p>
                        </div>
                      </>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Heritage Connection */}
      <section className="relative py-24 px-8 md:px-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-16">
            <p style={{ fontFamily: 'var(--font-display)' }} className="text-sm tracking-[0.15em] uppercase text-[#060920]/50 mb-4">{t("Tarixiy aloqa", "Историческая связь")}</p>
            <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-4xl md:text-5xl font-light text-[#060920] leading-tight">
              {t("Qadim fikr — Zamonaviy Tizim", "Древняя мысль — современная система")}
            </h2>
          </motion.div>

          {ornaments.length === 0 ? (
            <p style={{ fontFamily: 'var(--font-body)' }} className="text-center text-[#060920]/40 tracking-wide py-8">
              {t("Naqshlar admin paneldan qo'shiladi.", "Орнаменты добавляются из админ-панели.")}
            </p>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
            {ornaments.map((item, i) => (
              <motion.a key={item.id} href={`#ornament-${item.id}`} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.1 }} whileHover={{ y: -4 }}
                style={{ textDecoration: 'none' }}
                className="block cursor-pointer w-[88%] mx-auto md:w-auto md:mx-0 border border-[#060920]/15 rounded-2xl bg-white/50 hover:bg-white hover:shadow-[0_18px_44px_-12px_rgba(6,9,32,0.18)] transition-all overflow-hidden">
                {item.hasImage && (
                  <div className="h-32 md:h-48 bg-[#060920]/5 overflow-hidden">
                    <img src={`/api/ornament-image?id=${item.id}`} alt={item.old} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-5 md:p-8">
                  <div className="flex items-start justify-between">
                    <p style={{ fontFamily: 'var(--font-display)' }} className="text-lg md:text-xl text-[#060920]">{item.old}</p>
                    <span className="text-xl text-[#060920]/30">→</span>
                  </div>
                  {item.desc && (
                    <p style={{ fontFamily: 'var(--font-body)' }} className="text-xs md:text-sm text-[#060920]/50 mt-3 pt-3 md:mt-4 md:pt-4 border-t border-[#060920]/10 line-clamp-2">{item.desc}</p>
                  )}
                  <span style={{ fontFamily: 'var(--font-body)' }} className="inline-block mt-3 md:mt-4 text-xs tracking-[0.15em] uppercase text-[#060920]/60">
                    {t("Batafsil ko'rish", "Подробнее")} →
                  </span>
                </div>
              </motion.a>
            ))}
          </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-20 px-8 md:px-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="space-y-6">
            <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-3xl md:text-4xl font-light text-[#060920]">
              <BarpoWord /> {t("bilan yangi madaniyatni birgalikda yarataylik", "— давайте вместе создадим новую культуру")}
            </h2>
            <p style={{ fontFamily: 'var(--font-body)' }} className="text-lg text-[#060920]/60 max-w-2xl mx-auto">
              {t("Qurilish — bu faqat material va ishchi kuchi emas. Bu fikr, tartib va mas'uliyatning birlashuvidir.", "Строительство — это не только материал и рабочая сила. Это соединение мысли, порядка и ответственности.")}
            </p>
            <motion.a href="#contact" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              style={{ fontFamily: 'var(--font-body)', textDecoration: 'none' }}
              className="mt-8 inline-block px-12 py-4 bg-[#060920] text-white tracking-[0.15em] uppercase font-medium rounded-2xl hover:shadow-lg transition-shadow">
              {t("Bog'lanish", "Связаться")}
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
