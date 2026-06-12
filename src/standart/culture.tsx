import { useEffect, useState } from "react";
import { motion } from "motion/react";

export function CulturePage() {
  // Admin panel orqali yuklangan bo'lim rasmlari (kalit -> o'zgargan vaqti)
  const [sectionImages, setSectionImages] = useState<Record<string, number>>({});
  useEffect(() => {
    fetch("/api/section-images")
      .then((r) => r.json())
      .then((j) => { if (j.ok) setSectionImages(j.images || {}); })
      .catch(() => {});
  }, []);

  // Tarixiy aloqa naqshlari (admin paneldan boshqariladi)
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
      title: "Tartib",
      description: "Qurilish maydonida tartib bo'lmasa, sifat ham, tezlik ham, iqtisodiy foyda ham xavf ostida qoladi.",
      details: "Har qanday katta loyihada tartib — tartibsizlik ichidagi tizim demakdir. Tartib yaratishda biz qoidalarga qat'iy amal qilamiz: maydon tozaligi, reja asosidagi to'g'ri harakatlar, har bir brigada va ishchining aniq o'rni.",
      principles: [
        "Ish joyining tozaligi va tartibliligi",
        "Materiallarni to'g'ri saqlash va taqsimlash",
        "Brigada va xizmatlarning maydondagi aniq joylashuvi",
        "Xavfsizlik qoidalarining qat'iy bajarilishi",
        "Har kuni ish yakunida tozalash va ertangi kunga tayyorgarlik"
      ]
    },
    {
      title: "Hisob",
      description: "Har bir material, har bir ish hajmi, har bir kun va har bir qaror hisobda bo'lishi kerak.",
      details: "Xarajat, muddat, resurs — hammasi hisobga olingan sonlar. Taxmin va chamalab ish qilish katta loyihalarda o'rinsiz. Biz har bir so'm, har bir kub metr, har bir soat uchun javob beramiz.",
      principles: [
        "Barcha xarajatlarning aniq o'lchovi va hisobi",
        "Materiallarning kelishi va sarflanishi hisobda",
        "Ishchilarga ish hajmiga qarab hisob va to'lov",
        "Vaqtning aniq grafik asosida o'lchanishi",
        "Foyda va tejamkorlikning birgalikda ta'minlanishi"
      ]
    },
    {
      title: "Intizom",
      description: "Belgilangan grafik, texnik talab va qabul mezonlari ish jarayonining asosiy qoidasi bo'ladi.",
      details: "Intizom — jarayonning uzviyligi va har bir xodim o'z zimmasidagi vazifani aniq bilishi demakdir. Intizom bor joyda bosqichlar o'z vaqtida almashinadi va jarayon to'xtab qolmaydi.",
      principles: [
        "Qat'iy ish grafigi va muddat belgilash",
        "Texnik talablarning barcha xodimlarga ma'lum bo'lishi",
        "Jarayon tartibiga to'liq rioya qilish",
        "Har bir ish bosqichining aniq hisobi",
        "Qabul mezonlarining maydonda qo'llanilishi"
      ]
    },
    {
      title: "Hurmat",
      description: "Buyurtmachining vaqti, mablag'i va ishonchi hurmat qilinadi. Qurilish mijozni charchatadigan jarayon bo'lmasligi kerak.",
      details: "BARPO falsafasida mijoz — bu hamkor. Uning vaqti, mablag'i va ishonchi — qimmatli manba. Biz mijozni noaniqlik bilan charchatmaymiz: darhol tushuntiramiz, maslahat beramiz va muammoning yechimini taklif etamiz.",
      principles: [
        "Haftalik hisobot va jarayon haqida muntazam ma'lumot",
        "Tushuntirish va maslahat berish",
        "Muammolarni tezda hal qilish",
        "Muhim qarorlar oldidan mijozning roziligini olish",
        "Har kuni ishonchning ta'minlanishi"
      ]
    },
    {
      title: "Meros",
      description: "O'zbekiston me'moriy merosi bizga shuni o'rgatadi: mustahkam inshoot faqat material bilan emas, fikr, o'lchov va tartib bilan barpo bo'ladi.",
      details: "Qadimiy o'zbek me'morchiligi — asrlar davomida to'plangan texnik bilim va badiiy tafakkur belgisidir. Girih naqshi, zanjira naqshi, turunj, koshin, gumbaz — bu detallarning har birida chuqur aql va hisob borligini ko'ramiz. BARPO shu merosga tayanadi:",
      principles: [
        "Zamonaviy texnologiya va qadimiy me'moriy tafakkur birligi",
        "Har bir detal va konstruksiyaning ma'nosi",
        "Milliy o'ziga xoslikning saqlanishi",
        "Ishni faqat material bilan emas, fikr bilan qilish",
        "O'tmish va bugun o'rtasidagi tarixiy aloqani saqlash"
      ]
    }
  ];

  return (
    <div className="relative bg-white pt-32">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] flex items-center justify-center px-8 md:px-16 py-20 overflow-hidden">
        <div className="max-w-5xl w-full mx-auto text-center space-y-8">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ fontFamily: 'var(--font-display)' }}
            className="text-sm tracking-[0.15em] uppercase text-[#060920]/50"
          >
            Bizning falsafamiz
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            }}
            className="text-[#060920] tracking-tight font-light leading-tight"
          >
            Yangi Qurilish Madaniyati
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-6"
          >
            <p
              style={{ fontFamily: 'var(--font-body)' }}
              className="text-lg md:text-xl text-[#060920]/70 max-w-3xl mx-auto leading-relaxed"
            >
              Qurilish madaniyati — bu baland shior emas.
            </p>
            <p
              style={{ fontFamily: 'var(--font-body)' }}
              className="text-lg md:text-xl font-medium text-[#060920] max-w-3xl mx-auto"
            >
              Bu har kuni obyekt ichida ko'rinadigan tartib.
            </p>
            <p
              style={{ fontFamily: 'var(--font-body)' }}
              className="text-base text-[#060920]/60 max-w-2xl mx-auto"
            >
              BARPO uchun qurilish madaniyati — bu ish joyining tozaligi, chizmadagi aniqlik, materialdagi hisob, brigadadagi intizom, nazoratdagi qat'iylik va mijozga bo'lgan hurmatdir.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Culture Pillars */}
      <section className="relative py-24 px-8 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-20">
            {cultureElements.map((element, index) => (
              <motion.div
                key={element.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "md:grid-cols-2" : ""
                }`}
              >
                {/* Content */}
                <div className={index % 2 === 1 ? "md:order-2" : ""}>
                  <div className="space-y-6">
                    <div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl mb-4"
                      >
                      </motion.div>
                      <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        style={{ fontFamily: 'var(--font-display)' }}
                        className="text-[#060920] text-4xl font-light leading-tight"
                      >
                        {element.title}
                      </motion.h2>
                    </div>

                    <motion.p
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.15 }}
                      style={{ fontFamily: 'var(--font-body)' }}
                      className="text-[#060920]/70 text-lg leading-relaxed font-medium"
                    >
                      {element.description}
                    </motion.p>

                    <motion.p
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      style={{ fontFamily: 'var(--font-body)' }}
                      className="text-[#060920]/60 text-base leading-relaxed"
                    >
                      {element.details}
                    </motion.p>

                    <div className="space-y-2">
                      {element.principles.map((principle, i) => (
                        <motion.div
                          key={principle}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: 0.25 + i * 0.05 }}
                          className="flex items-start gap-3"
                        >
                          <div className="w-1.5 h-1.5 bg-[#060920]/60 rounded-full flex-shrink-0 mt-2" />
                          <span
                            style={{ fontFamily: 'var(--font-body)' }}
                            className="text-[#060920]/60 text-sm"
                          >
                            {principle}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Visual */}
                <div className={index % 2 === 1 ? "md:order-1" : ""}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="relative h-80 md:h-96 flex items-center justify-center overflow-hidden rounded-3xl"
                  >
                    {sectionImages[`culture-${index}`] ? (
                      <img
                        src={`/api/section-image?key=culture-${index}&v=${sectionImages[`culture-${index}`]}`}
                        alt={element.title}
                        className="absolute inset-0 w-full h-full object-cover rounded-3xl"
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-[#060920]/8 to-[#060920]/0 rounded-3xl" />
                        <div className="relative z-10 text-center space-y-4">
                          <p
                            style={{ fontFamily: 'var(--font-display)' }}
                            className="text-2xl text-[#060920]/30 font-light"
                          >
                            {element.title}
                          </p>
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
      <section className="relative py-24 px-8 md:px-16 bg-[#060920]/3">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p
              style={{ fontFamily: 'var(--font-display)' }}
              className="text-sm tracking-[0.15em] uppercase text-[#060920]/50 mb-4"
            >
              Tarixiy aloqa
            </p>
            <h2
              style={{ fontFamily: 'var(--font-display)' }}
              className="text-4xl md:text-5xl font-light text-[#060920] leading-tight"
            >
              Qadim fikr — Zamonaviy Tizim
            </h2>
          </motion.div>

          {ornaments.length === 0 ? (
            <p style={{ fontFamily: 'var(--font-body)' }} className="text-center text-[#060920]/40 tracking-wide py-8">
              Naqshlar admin paneldan qo'shiladi.
            </p>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8">
            {ornaments.map((item, i) => (
              <motion.a
                key={item.id}
                href={`#ornament-${item.id}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                style={{ textDecoration: 'none' }}
                className="block cursor-pointer w-[88%] mx-auto md:w-auto md:mx-0 border border-[#060920]/15 rounded-2xl bg-white/50 hover:bg-white hover:shadow-[0_18px_44px_-12px_rgba(6,9,32,0.18)] transition-all overflow-hidden"
              >
                {item.hasImage && (
                  <div className="h-32 md:h-48 bg-[#060920]/5 overflow-hidden">
                    <img
                      src={`/api/ornament-image?id=${item.id}`}
                      alt={item.old}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-5 md:p-8">
                  <div className="flex items-start justify-between">
                    <p style={{ fontFamily: 'var(--font-display)' }} className="text-lg md:text-xl text-[#060920]">{item.old}</p>
                    <span className="text-xl text-[#060920]/30">→</span>
                  </div>
                  {item.desc && (
                    <p style={{ fontFamily: 'var(--font-body)' }} className="text-xs md:text-sm text-[#060920]/50 mt-3 pt-3 md:mt-4 md:pt-4 border-t border-[#060920]/10 line-clamp-2">
                      {item.desc}
                    </p>
                  )}
                  <span style={{ fontFamily: 'var(--font-body)' }} className="inline-block mt-3 md:mt-4 text-xs tracking-[0.15em] uppercase text-[#060920]/60">
                    Batafsil ko'rish →
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <h2
              style={{ fontFamily: 'var(--font-display)' }}
              className="text-3xl md:text-4xl font-light text-[#060920]"
            >
              BARPO bilan yangi madaniyatni birgalikda yarataylik
            </h2>
            <p
              style={{ fontFamily: 'var(--font-body)' }}
              className="text-lg text-[#060920]/60 max-w-2xl mx-auto"
            >
              Qurilish — bu faqat material va ishchi kuchi emas. Bu fikr, tartib va mas'uliyatning birlashuvidir.
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ fontFamily: 'var(--font-body)' }}
              className="mt-8 inline-block px-12 py-4 bg-[#060920] text-white tracking-[0.15em] uppercase font-medium rounded-2xl hover:shadow-lg transition-shadow"
            >
              Bog'lanish
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
