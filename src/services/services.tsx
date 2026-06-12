import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { SoftDivider } from "../app/components/SoftDivider";

// Lokal rasmlar (zaxira variant): src/assets papkasiga 1.jpg, 2.png ... nomi bilan rasm
// qo'ysangiz ham chiqadi. Lekin asosiy usul — admin panel orqali rasm yuklash.
const serviceImageModules = import.meta.glob(
  "../assets/*.{jpg,jpeg,png,webp}",
  { eager: true, import: "default" }
) as Record<string, string>;

const serviceImageByName: Record<string, string> = {};
for (const [filePath, url] of Object.entries(serviceImageModules)) {
  const fileName = filePath.split("/").pop() ?? "";
  const baseName = fileName.replace(/\.[^.]+$/, "");
  serviceImageByName[baseName] = url;
}

export function ServicesPage() {
  // Admin panel orqali yuklangan bo'lim rasmlari (kalit -> o'zgargan vaqti)
  const [sectionImages, setSectionImages] = useState<Record<string, number>>({});
  useEffect(() => {
    fetch("/api/section-images")
      .then((r) => r.json())
      .then((j) => { if (j.ok) setSectionImages(j.images || {}); })
      .catch(() => {});
  }, []);

  const services = [
    {
      number: "1",
      title: "Bosh pudratchi — obyektning boshqaruv markazi",
      subtitle: "Bosh pudratchi xizmatlari",
      description: "Qurilishda eng katta xavf — har bir yo'nalish alohida yashashi. Bitta brigada kutadi, ikkinchisi kechikadi, material vaqtida kelmaydi, muhandislik va pardoz bir-biriga mos kelmaydi. Natijada mijozning vaqti, mablag'i va asabi sarflanadi. BARPO bosh pudratchi sifatida jarayonni yagona tizimga yig'adi: grafik, brigadalar, material, texnik nazorat va qabul bosqichlari bir markazdan boshqariladi.",
      detailsLabel: "Nimani boshqaramiz",
      details: [
        "Ish grafigi",
        "Brigadalar koordinatsiyasi",
        "Materiallar kelishi",
        "Sifat nazorati",
        "Bosqichma-bosqich qabul",
        "Mijozga hisobot",
        "Muammolarni joyida hal qilish"
      ],
      highlight: "Mijoz uchun foyda: siz har kuni obyektga kelib, kim nima qilishi kerakligini tushuntirib yurmaysiz. Jarayon boshqaruvda bo'ladi.",
      cta: "Bosh pudratchilik bo'yicha maslahat olish"
    },
    {
      number: "2",
      title: "Asosiy konstruktiv ishlar — keyingi barcha bosqichlarning poydevori",
      subtitle: "Qurilish-montaj ishlari",
      description: "Qurilish-montaj ishlarida xato bo'lsa, keyingi bosqichlar uni yashirmaydi — aksincha, yanada qimmatlashtiradi. Shuning uchun BARPO bu bosqichda aniqlik, texnik talab va nazoratga alohida e'tibor beradi.",
      detailsLabel: "Nimalar kiradi",
      details: [
        "Devor ishlari",
        "Beton ishlari",
        "G'isht va blok terish",
        "Metall konstruksiyalar",
        "Pol va shift tayyorlash",
        "Montaj ishlari",
        "Loyiha asosidagi umumiy qurilish ishlari"
      ],
      cta: "",
      highlight: "Bu bosqichda \"keyin to'g'rilab yuboramiz\" degan fikr bo'lmasligi kerak. Chunki haqiqiy sifat boshidan boshlanadi."
    },
    {
      number: "3",
      title: "Pardoz — obyektning yuzidir. Lekin uning sifati ko'rinmaydigan tayyorgarlikdan boshlanadi",
      subtitle: "Pardozlash ishlari",
      description: "Pardozlash ishlarida mijoz ko'radigan natija — bo'yoq, devor, pol, shift, burchak va detal. Lekin bu natijaning sifati oldingi tayyorgarlik, tekshiruv va qabul mezonlariga bog'liq.",
      detailsLabel: "Nimalarni nazorat qilamiz",
      details: [
        "Devor tekisligi",
        "Burchaklar",
        "Bo'yoq sifati",
        "Plitka chiziqlari",
        "Pol sathi",
        "Shift silliqligi",
        "Material sarfi",
        "Yakuniy tozalik"
      ],
      cta: "",
      highlight: "Premium pardoz qimmat materialdan emas, to'g'ri tayyorgarlik va aniq qo'ldan boshlanadi."
    },
    {
      number: "4",
      title: "Fasad — binoning bozor bilan birinchi suhbati",
      subtitle: "Fasad va tashqi ishlar",
      description: "Fasad faqat tashqi ko'rinish emas. U binoning imiji, chidamliligi, energiya samaradorligi va investor uchun qiymatiga ta'sir qiladi.",
      detailsLabel: "Nimalar kiradi",
      details: [
        "Fasad montaji",
        "Ventilyatsiyali fasadlar",
        "Klinker / keramogranit / HPL / alyukobond",
        "Tashqi pardoz ishlari",
        "Kirish guruhi",
        "Tashqi dekorativ elementlar",
        "Yoritish va vizual aksentlar"
      ],
      cta: "",
      highlight: "Yaxshi fasad binoni bezamaydi. U binoning qiymatini oshiradi."
    },
    {
      number: "5",
      title: "Muhandislik tizimlari — binoning ichki hayoti",
      subtitle: "Muhandislik tizimlari",
      description: "Ko'rinmaydigan ishlar eng katta mas'uliyatni talab qiladi. Chunki elektrika, ventilyatsiya, santexnika va past kuchlanish tizimlari keyinchalik obyektning qulayligi, xavfsizligi va ishlash barqarorligini belgilaydi.",
      detailsLabel: "Yo'nalishlar",
      details: [
        "Elektrika ishlari — elektr tarmoqlari, kabel kanallari, yoritish nuqtalari, taqsimlash shchitlari va jihozlar loyiha asosida montaj qilinadi",
        "Ventilyatsiya tizimi — havo almashinuvi, chiqarish va kiritish tizimlari obyekt vazifasiga mos holda bajariladi",
        "Santexnika ishlari — suv ta'minoti, kanalizatsiya, isitish va sanitariya tizimlari xavfsiz, tartibli va xizmat ko'rsatishga qulay tarzda o'rnatiladi",
        "Past kuchlanish tizimlari — internet, videokuzatuv, domofon, signalizatsiya va boshqa kommunikatsiya tizimlari yagona infratuzilma sifatida tashkil qilinadi"
      ],
      cta: "",
      highlight: "Yaxshi muhandislik tizimi ko'zga tashlanmaydi. Lekin har kuni seziladi."
    },
    {
      number: "6",
      title: "Premium pardoz va interyer ijrosi",
      subtitle: "Seziladigan sifat",
      description: "Premium segmentda sifat ko'zga tashlanishi shart emas — u sezilishi kerak. Materiallar, chiziqlar, yoritish, tutashuvlar, faktura va umumiy atmosfera bir butun bo'lishi kerak. BARPO premium pardozda nozik detal, yuqori ijro intizomi va muvozanatli estetika bilan ishlaydi.",
      detailsLabel: "",
      details: [],
      cta: "",
      highlight: "Premium — bu qimmat material emas. Premium — bu xato ko'rinmaydigan darajadagi aniqlik."
    }
  ];

  return (
    <div className="relative bg-white pt-32">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center px-8 md:px-16 py-20 overflow-hidden">
        <div className="max-w-5xl w-full mx-auto text-center space-y-6">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ fontFamily: 'var(--font-display)' }}
            className="text-sm tracking-[0.15em] uppercase text-[#060920]/50"
          >
            Biz nima qilamiz
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
            Qurilish xizmat emas. Bu kapitalni himoya qiladigan jarayon.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ fontFamily: 'var(--font-body)' }}
            className="text-lg text-[#060920]/60 max-w-3xl mx-auto"
          >
            BARPO har bir ish yo'nalishini alohida brigada sifatida emas, umumiy natijaga xizmat qiladigan tizim sifatida boshqaradi.
          </motion.p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="relative py-24 px-8 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-16">
            {services.map((service, index) => (
              <motion.div
                key={service.number}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`grid grid-cols-1 md:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "md:grid-cols-2 md:direction-rtl" : ""
                }`}
              >
                {/* Content */}
                <div className={index % 2 === 1 ? "md:order-2" : ""}>
                  <div className="space-y-6">
                    <div>
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        style={{ fontFamily: 'var(--font-display)' }}
                        className="text-[#060920]/40 text-sm tracking-[0.15em] uppercase mb-2"
                      >
                        {service.subtitle}
                      </motion.div>
                      <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.1 }}
                        style={{ fontFamily: 'var(--font-display)' }}
                        className="text-[#060920] text-3xl md:text-4xl font-light leading-tight"
                      >
                        {service.title}
                      </motion.h2>
                    </div>

                    <motion.p
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.15 }}
                      style={{ fontFamily: 'var(--font-body)' }}
                      className="text-[#060920]/70 text-lg leading-relaxed"
                    >
                      {service.description}
                    </motion.p>

                    {service.highlight && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.8, delay: 0.18 }}
                        style={{ fontFamily: 'var(--font-body)' }}
                        className="text-[#060920]/70 text-lg leading-relaxed"
                      >
                        {service.highlight}
                      </motion.p>
                    )}

                    {service.details.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <p
                          style={{ fontFamily: 'var(--font-display)' }}
                          className="text-sm tracking-[0.12em] uppercase text-[#060920]/40"
                        >
                          {service.detailsLabel || "Nimalarni o'z ichiga oladi"}
                        </p>
                        {service.details.map((detail, i) => (
                          <motion.div
                            key={detail}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 + i * 0.05 }}
                            className="flex items-start gap-4"
                          >
                            <div className="w-2 h-2 bg-[#060920]/40 rounded-full flex-shrink-0 mt-2" />
                            <span
                              style={{ fontFamily: 'var(--font-body)' }}
                              className="text-[#060920]/60 text-sm"
                            >
                              {detail}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    {service.cta && (
                      <motion.a
                        href="#contact"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        style={{ fontFamily: 'var(--font-body)', textDecoration: 'none' }}
                        className="inline-block mt-2 px-7 py-3 bg-[#060920] text-white tracking-[0.12em] uppercase text-xs font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all"
                      >
                        {service.cta}
                      </motion.a>
                    )}
                  </div>
                </div>

                {/* Number/Visual */}
                <div className={index % 2 === 1 ? "md:order-1" : ""}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="relative h-80 md:h-full min-h-80 flex items-center justify-center overflow-hidden rounded-3xl"
                  >
                    {sectionImages[`service-${service.number}`] ? (
                      <img
                        src={`/api/section-image?key=service-${service.number}&v=${sectionImages[`service-${service.number}`]}`}
                        alt={service.title}
                        className="absolute inset-0 w-full h-full object-cover rounded-3xl"
                      />
                    ) : serviceImageByName[service.number] ? (
                      <img
                        src={serviceImageByName[service.number]}
                        alt={service.title}
                        className="absolute inset-0 w-full h-full object-cover rounded-3xl"
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-[#060920]/5 to-[#060920]/0 rounded-3xl" />
                        <div
                          style={{ fontFamily: 'var(--font-display)' }}
                          className="text-[15vw] md:text-[12rem] font-light text-[#060920]/10 select-none"
                        >
                          {service.number}
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

      {/* Why Choose Us */}
      <section className="relative py-24 px-8 md:px-16 bg-[#060920]/2">
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
              Nima uchun BARPO
            </p>
            <h2
              style={{ fontFamily: 'var(--font-display)' }}
              className="text-4xl md:text-5xl font-light text-[#060920]"
            >
              Tizim — Tartib — Natija
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Tizim",
                desc: "Xizmatlar o'zaro bog'langan jarayon sifatida amalga oshiriladi, bu esa mijozning xotirjamligini ta'minlaydi."
              },
              {
                title: "Tartib",
                desc: "Har bosqich aniq belgilangan qoidalar asosida bajariladi. Tartib — natijaviy sifatning asosi."
              },
              {
                title: "Natija",
                desc: "Sifatni faqat gap bilan emas, qabul mezonlari va standartlar bilan ko'rsatamiz."
              }
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.15 }}
                className="space-y-3"
              >
                <div className="w-fit">
                  <h3
                    style={{ fontFamily: 'var(--font-display)' }}
                    className="text-2xl text-[#060920]"
                  >
                    {item.title}
                  </h3>
                  <SoftDivider className="mt-3" />
                </div>
                <p
                  style={{ fontFamily: 'var(--font-body)' }}
                  className="text-[#060920]/60 leading-relaxed"
                >
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA 3 */}
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
            BARPO bilan qurilish — bu xotirjamlik
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ fontFamily: 'var(--font-body)' }}
            className="space-y-1 text-white/50 text-base leading-relaxed"
          >
            <p>Tizim bor joyda tartib bor.</p>
            <p>Tartib bor joyda sifat bor.</p>
            <p>Sifat bor joyda natija bor.</p>
          </motion.div>
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ fontFamily: 'var(--font-body)', textDecoration: 'none' }}
            className="inline-block px-8 py-3 bg-white text-[#060920] tracking-[0.15em] uppercase text-sm font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            Biz bilan bog'lanish
          </motion.a>
        </div>
      </section>
    </div>
  );
}
