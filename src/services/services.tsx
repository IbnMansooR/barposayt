import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { SoftDivider } from "../app/components/SoftDivider";
import { BarpoWord, barpo } from "../app/components/Barpo";
import { useT } from "../app/i18n";

// Lokal rasmlar (zaxira variant)
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

type ServiceItem = {
  number: string;
  title: string[];
  description: string[];
  detailsLabel: string[];
  details: string[][];
  highlight: string[];
};

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    number: "1",
    title: ["Bosh pudratchi xizmatlari", "Услуги генподрядчика"],
    description: ["BARPO bosh pudratchi sifatida obyektning umumiy qurilish jarayonini boshqaradi: rejalashtirish, ishchi kuchi, materiallar, muhandislik tizimlari, pudratchilar, grafik va sifat nazorati.", "Как генподрядчик мы управляем общим строительным процессом объекта: планирование, рабочая сила, материалы, инженерные системы, подрядчики, график и контроль качества."],
    detailsLabel: ["Nimalarni o'z ichiga oladi", "Что включает"],
    details: [
      ["Ish jarayonini rejalashtirish", "Планирование рабочего процесса"],
      ["GPR va bosqichma-bosqich grafik", "ГПР и поэтапный график"],
      ["Pudratchilarni muvofiqlashtirish", "Координация подрядчиков"],
      ["Kunlik nazorat", "Ежедневный контроль"],
      ["Sifat tekshiruvi", "Проверка качества"],
      ["Muddat va xarajat intizomi", "Дисциплина сроков и расходов"],
      ["Obyektni topshirishga tayyorlash", "Подготовка объекта к сдаче"],
    ],
    highlight: ["Biz uchun bosh pudratchi — bu shunchaki ijrochi emas. Bu obyekt natijasi uchun javobgar markaz.", "Для нас генподрядчик — это не просто исполнитель. Это центр, ответственный за результат объекта."],
  },
  {
    number: "2",
    title: ["Qurilish-montaj ishlari", "Строительно-монтажные работы"],
    description: ["Qurilish-montaj ishlari har qanday obyektning asosiy poydevoridir. Bu bosqichda xato qilish keyingi barcha jarayonlarga ta'sir qiladi. BARPO konstruktiv yechimlar, montaj sifati, texnologik ketma-ketlik va xavfsizlik talablariga qat'iy amal qiladi.", "Строительно-монтажные работы — основа любого объекта. Ошибка на этом этапе влияет на все последующие процессы. Мы строго соблюдаем конструктивные решения, качество монтажа, технологическую последовательность и требования безопасности."],
    detailsLabel: ["", ""], details: [],
    highlight: ["Biz tezlikni shoshilish deb tushunmaymiz. Tezlik — bu oldindan tuzilgan reja va intizom natijasi.", "Мы не понимаем скорость как спешку. Скорость — результат заранее составленного плана и дисциплины."],
  },
  {
    number: "3",
    title: ["Fasad va tashqi ishlar", "Фасад и наружные работы"],
    description: ["Fasad — obyektning birinchi taassuroti. Lekin u faqat ko'rinish emas. Fasad binoning himoyasi, energetik samaradorligi, arxitekturaviy xarakteri va uzoq muddatli qiymatiga ta'sir qiladi. BARPO fasad ishlarida estetika, texnik yechim va ekspluatatsion mustahkamlikni birlashtiradi.", "Фасад — первое впечатление об объекте. Но это не только внешний вид. Фасад влияет на защиту здания, энергоэффективность, архитектурный характер и долгосрочную ценность. В фасадных работах мы объединяем эстетику, техническое решение и эксплуатационную прочность."],
    detailsLabel: ["", ""], details: [],
    highlight: ["Biz uchun chiroyli fasad — bu bugun ko'rinadigan, ertaga esa o'z sifatini saqlaydigan yechim.", "Для нас красивый фасад — это решение, которое выглядит хорошо сегодня и сохраняет качество завтра."],
  },
  {
    number: "4",
    title: ["Pardozlash ishlari", "Отделочные работы"],
    description: ["Pardoz — obyektning yakuniy hissiyoti. Aynan shu bosqichda mijoz, ijarachi yoki foydalanuvchi sifatni ko'radi, his qiladi va baholaydi. BARPO pardozlash ishlarida detal, aniqlik, material tanlovi va ijro madaniyatiga e'tibor beradi.", "Отделка — финальное ощущение от объекта. Именно на этом этапе клиент, арендатор или пользователь видит, чувствует и оценивает качество. В отделочных работах мы уделяем внимание деталям, точности, выбору материалов и культуре исполнения."],
    detailsLabel: ["", ""], details: [],
    highlight: ["Chiroyli ko'rinish yetarli emas. To'g'ri bajarilgan pardoz uzoq xizmat qilishi kerak.", "Красивого вида недостаточно. Правильно выполненная отделка должна служить долго."],
  },
  {
    number: "5",
    title: ["Muhandislik tizimlari", "Инженерные системы"],
    description: ["Muhandislik tizimlari — obyektning ko'rinmaydigan, lekin eng muhim qismi. Elektr, ventilyatsiya, isitish, sovutish, suv, kanalizatsiya, yong'in xavfsizligi va zaif tok tizimlari binoning ishlash sifatini belgilaydi. BARPO muhandislik tizimlariga alohida e'tibor beradi, chunki obyektning haqiqiy qulayligi aynan shu yerda boshlanadi.", "Инженерные системы — невидимая, но самая важная часть объекта. Электрика, вентиляция, отопление, охлаждение, водоснабжение, канализация, пожарная безопасность и слаботочные системы определяют качество работы здания. Мы уделяем инженерным системам особое внимание, ведь реальный комфорт объекта начинается именно здесь."],
    detailsLabel: ["", ""], details: [],
    highlight: ["Yaxshi bino faqat chiroyli bo'lmaydi. U to'g'ri ishlaydi.", "Хорошее здание не просто красиво. Оно правильно работает."],
  },
];

export function ServicesPage() {
  const t = useT();
  const [sectionImages, setSectionImages] = useState<Record<string, number>>({});
  useEffect(() => {
    fetch("/api/section-images")
      .then((r) => r.json())
      .then((j) => { if (j.ok) setSectionImages(j.images || {}); })
      .catch(() => {});
  }, []);

  const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES);
  useEffect(() => {
    fetch("/api/services")
      .then((r) => r.json())
      .then((j) => {
        if (j.ok && Array.isArray(j.services) && j.services.length > 0) {
          setServices(j.services.map((s: any, i: number) => ({
            number: String(i + 1),
            title: [s.titleUz, s.titleRu],
            description: [s.descUz, s.descRu],
            detailsLabel: ["", ""],
            details: [],
            highlight: [s.highlightUz, s.highlightRu],
          })));
        }
      })
      .catch(() => {});
  }, []);

  const whyItems = [
    { title: ["Tizim", "Система"], desc: ["Xizmatlar o'zaro bog'langan jarayon sifatida amalga oshiriladi, bu esa mijozning xotirjamligini ta'minlaydi.", "Услуги выполняются как взаимосвязанный процесс, что обеспечивает спокойствие клиента."] },
    { title: ["Tartib", "Порядок"], desc: ["Har bosqich aniq belgilangan qoidalar asosida bajariladi. Tartib — natijaviy sifatning asosi.", "Каждый этап выполняется по чётко заданным правилам. Порядок — основа итогового качества."] },
    { title: ["Natija", "Результат"], desc: ["Sifatni faqat gap bilan emas, qabul mezonlari va standartlar bilan ko'rsatamiz.", "Качество показываем не словами, а критериями приёмки и стандартами."] },
  ];

  return (
    <div className="relative bg-white pt-32">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center px-8 md:px-16 py-20 overflow-hidden">
        <div className="max-w-5xl w-full mx-auto text-center space-y-6">
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            style={{ fontFamily: 'var(--font-display)' }} className="text-sm tracking-[0.15em] uppercase text-[#060920]/50">
            {t("Biz nima qilamiz", "Что мы делаем")}
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }} className="text-[#060920] tracking-tight font-light leading-tight">
            {t("Xizmatlarimiz", "Наши услуги")}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }}
            style={{ fontFamily: 'var(--font-body)' }} className="text-lg text-[#060920]/60 max-w-3xl mx-auto">
            <BarpoWord /> {t("qurilish jarayonining alohida bosqichlarini emas, butun tizimini ko'radi. Shu sababli har bir xizmatimiz yakuniy natija, foydalanish qulayligi va investor manfaatiga bog'langan.", "Мы видим не отдельные этапы строительного процесса, а всю систему. Поэтому каждая наша услуга связана с конечным результатом, удобством эксплуатации и интересами инвестора.")}
          </motion.p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="relative py-24 px-8 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-16">
            {services.map((service, index) => (
              <motion.div key={service.number} initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 0.8, delay: index * 0.1 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className={index % 2 === 1 ? "md:order-2" : ""}>
                  <div className="space-y-6">
                    <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.1 }}
                      style={{ fontFamily: 'var(--font-display)' }} className="text-[#060920] text-3xl md:text-4xl font-light leading-tight">
                      {t(service.title[0], service.title[1])}
                    </motion.h2>
                    <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.15 }}
                      style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/70 text-lg leading-relaxed">
                      {barpo(t(service.description[0], service.description[1]))}
                    </motion.p>
                    <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.18 }}
                      style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/70 text-lg leading-relaxed">
                      {t(service.highlight[0], service.highlight[1])}
                    </motion.p>
                    {service.details.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <p style={{ fontFamily: 'var(--font-display)' }} className="text-sm tracking-[0.12em] uppercase text-[#060920]/40">
                          {t(service.detailsLabel[0] || "Nimalarni o'z ichiga oladi", service.detailsLabel[1] || "Что включает")}
                        </p>
                        {service.details.map((detail, i) => (
                          <motion.div key={detail[0]} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 + i * 0.05 }} className="flex items-start gap-4">
                            <div className="w-2 h-2 bg-[#060920]/40 rounded-full flex-shrink-0 mt-2" />
                            <span style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/60 text-sm">{t(detail[0], detail[1])}</span>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className={index % 2 === 1 ? "md:order-1" : ""}>
                  <motion.div initial={{ opacity: 0, scale: 0.5 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.3 }}
                    className="relative h-80 md:h-full min-h-80 flex items-center justify-center overflow-hidden rounded-3xl">
                    {sectionImages[`service-${service.number}`] ? (
                      <img src={`/api/section-image?key=service-${service.number}&v=${sectionImages[`service-${service.number}`]}`} alt={t(service.title[0], service.title[1])} className="absolute inset-0 w-full h-full object-cover rounded-3xl" />
                    ) : serviceImageByName[service.number] ? (
                      <img src={serviceImageByName[service.number]} alt={t(service.title[0], service.title[1])} className="absolute inset-0 w-full h-full object-cover rounded-3xl" />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-br from-[#060920]/5 to-[#060920]/0 rounded-3xl" />
                        <div style={{ fontFamily: 'var(--font-display)' }} className="text-[15vw] md:text-[12rem] font-light text-[#060920]/10 select-none">{service.number}</div>
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
      <section className="relative py-24 px-8 md:px-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="text-center mb-16">
            <p style={{ fontFamily: 'var(--font-display)' }} className="text-sm tracking-[0.15em] uppercase text-[#060920]/50 mb-4">{barpo(t("Nima uchun BARPO", "Почему мы"))}</p>
            <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-4xl md:text-5xl font-light text-[#060920]">
              {t("Tizim — Tartib — Natija", "Система — Порядок — Результат")}
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyItems.map((item, i) => (
              <motion.div key={item.title[0]} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.15 }} className="space-y-3">
                <div className="w-fit">
                  <h3 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl text-[#060920]">{t(item.title[0], item.title[1])}</h3>
                  <SoftDivider className="mt-3" />
                </div>
                <p style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/60 leading-relaxed">{t(item.desc[0], item.desc[1])}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 px-8 md:px-16 bg-[#060920]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} transition={{ duration: 0.8 }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: '#FFFFFF' }} className="tracking-tight">
            <BarpoWord light /> {t("bilan qurilish — bu xotirjamlik", "Строительство со спокойствием")}
          </motion.h2>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: false }} transition={{ duration: 0.8, delay: 0.2 }}
            style={{ fontFamily: 'var(--font-body)' }} className="space-y-1 text-white/50 text-base leading-relaxed">
            <p>{t("Tizim bor joyda tartib bor.", "Где система — там порядок.")}</p>
            <p>{t("Tartib bor joyda sifat bor.", "Где порядок — там качество.")}</p>
            <p>{t("Sifat bor joyda natija bor.", "Где качество — там результат.")}</p>
          </motion.div>
          <motion.a href="#contact" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            style={{ fontFamily: 'var(--font-body)', textDecoration: 'none' }}
            className="inline-block px-8 py-3 bg-white text-[#060920] tracking-[0.15em] uppercase text-sm font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all">
            {t("Biz bilan bog'lanish", "Связаться с нами")}
          </motion.a>
        </div>
      </section>
    </div>
  );
}
