import { useState, useEffect, useRef } from "react";
import { motion, useScroll } from "motion/react";
import logo from '../assets/logo.png';
import logoHero from '../assets/Logo dark night.png';
import { FloorSection } from "./components/FloorSection";
import { SoftDivider } from "./components/SoftDivider";
import { Footer } from "./components/Footer";
import { BarpoWord, barpo } from "./components/Barpo";
import { useT, useLang } from "./i18n";

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const t = useT();
  const { lang } = useLang();
  const [currentFloor, setCurrentFloor] = useState(0);
  const [contactStatus, setContactStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [contactError, setContactError] = useState("");
  const [homeProjects, setHomeProjects] = useState<
    { id: string; name: string; location: string; area: string; description?: string; hasImage?: boolean }[]
  >([]);
  const [contactInfo, setContactInfo] = useState<{ phone?: string; email?: string; address?: string }>({});

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((j) => { if (j.ok) setHomeProjects((j.projects || []).slice(0, 4)); })
      .catch(() => {});
    fetch("/api/socials")
      .then((r) => r.json())
      .then((j) => { if (j.ok) setContactInfo(j.contact || {}); })
      .catch(() => {});
  }, []);

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    setContactStatus("sending");
    setContactError("");
    try {
      const fd = new FormData(formEl);
      const body = Object.fromEntries(fd.entries());
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Yuborishda xatolik yuz berdi");
      setContactStatus("success");
      formEl.reset();
    } catch (err) {
      setContactStatus("error");
      setContactError(err instanceof Error ? err.message : "Yuborishda xatolik yuz berdi");
    }
  };

  // Butun sahifa scroll progressi (qavat raqamini kuzatish uchun)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Floor number tracking
  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      const floor = Math.floor(latest * 6);
      setCurrentFloor(Math.min(floor, 5));
    });

    return () => unsubscribe();
  }, [scrollYProgress]);

  return (
    <div ref={containerRef} className="relative">
      {/* Fixed background — butun sahifa fonida toza och rang */}
      <div className="fixed inset-0 -z-10 bg-white" />

      {/* Atmospheric grain texture */}
      <div className="fixed inset-0 opacity-[0.015] pointer-events-none z-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXh0IHR5cGU9InNhdHVyYXRlIiB2YWx1ZXM9IjAiLz48L2ZpbHRlcj48cGF0aCBkPSJNMCAwaDMwMHYzMDBIMHoiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iLjA1Ii8+PC9zdmc+')]" />

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="fixed top-0 left-0 right-0 z-40 px-8 md:px-16 py-8 bg-white/95 backdrop-blur-sm border-b border-[#060920]/10"
      >
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <img 
            src={logo} 
            alt="BARPO Logo" 
            className="h-8 cursor-pointer hover:opacity-80 transition-opacity"
          />

          {/* Nav links olib tashlandi — global menu tugmasi orqali boshqariladi */}
        </div>
      </motion.nav>

      {/* Hero Section - Bosh Sahifa */}
      <section className="relative min-h-screen flex items-center justify-center px-8 md:px-16 pt-32 overflow-hidden">
        <div className="max-w-7xl w-full mx-auto text-center space-y-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <motion.h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.5rem, 6vw, 6rem)',
                lineHeight: '1.1',
                color: '#060920',
                textShadow: 'none'
              }}
              className="tracking-tight"
            >
              {t("Biz qurmaymiz.", "Мы не строим.")}<br />
              <span className="inline-flex items-baseline justify-center gap-3 flex-wrap">
                {t("Biz", "Мы")}
                {lang === "uz" && (
                  <img
                    src={logoHero}
                    alt="BARPO"
                    style={{ height: '1em', display: 'inline-block', transform: 'translateY(0.05em)' }}
                  />
                )}
                {t("etamiz.", "созидаем.")}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              style={{ fontFamily: 'var(--font-display)', textShadow: 'none' }}
              className="max-w-3xl mx-auto leading-relaxed tracking-wide text-[#060920] text-xl md:text-2xl"
            >
              <BarpoWord /> {t("— tadbirkorlar, investorlar va yirik loyihalar uchun qurilish jarayonini tizim, sifat, nazorat va mas'uliyat asosida boshqaradigan kompaniya.", "Компания, которая управляет строительным процессом для предпринимателей, инвесторов и крупных проектов на основе системы, качества, контроля и ответственности.")}
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.4 }}
              style={{ fontFamily: 'var(--font-body)', textShadow: 'none' }}
              className="max-w-3xl mx-auto leading-relaxed tracking-wide text-[#060920]/75 text-lg"
            >
              {t("Qurilish — bu faqat beton, armatura va ishchi kuchi emas. Qurilish — bu reja, intizom, muhandislik fikri, moliyaviy nazorat va natijaga bo'lgan mas'uliyat.", "Строительство — это не только бетон, арматура и рабочая сила. Строительство — это план, дисциплина, инженерная мысль, финансовый контроль и ответственность за результат.")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.6 }}
              className="flex gap-4 justify-center flex-wrap"
            >
              <motion.a
                href="#contact"
                whileTap={{ scale: 0.97 }}
                style={{ fontFamily: 'var(--font-body)', textDecoration: 'none' }}
                className="px-8 py-3 bg-white text-[#060920] border border-[#060920] hover:bg-[#060920] hover:text-white tracking-[0.15em] uppercase text-sm font-medium rounded-2xl transition-colors duration-300 inline-block"
              >
                {t("Loyihani muhokama qilish", "Обсудить проект")}
              </motion.a>
              <motion.a
                href="#takliflar"
                whileTap={{ scale: 0.97 }}
                style={{ fontFamily: 'var(--font-body)', textDecoration: 'none' }}
                className="px-8 py-3 bg-white text-[#060920] border border-[#060920] hover:bg-[#060920] hover:text-white tracking-[0.15em] uppercase text-sm font-medium rounded-2xl transition-colors duration-300 inline-block"
              >
                {t("Investorlar uchun takliflar", "Предложения для инвесторов")}
              </motion.a>
              <motion.a
                href="#standard"
                whileTap={{ scale: 0.97 }}
                style={{ fontFamily: 'var(--font-body)', textDecoration: 'none' }}
                className="group px-8 py-3 bg-white text-[#060920] border border-[#060920] hover:bg-[#060920] hover:text-white tracking-[0.15em] uppercase text-sm font-medium rounded-2xl transition-colors duration-300 inline-flex items-center"
              >
                <BarpoWord className="mr-2 transition-[filter] duration-300 group-hover:brightness-0 group-hover:invert" /> {t("standartlari bilan tanishish", "ознакомиться со стандартами")}
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Hero faktlar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.9 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 mt-20 pt-12 border-t border-[#060920]/10 text-left"
          >
            {[
              { title: ["Tijorat obyektlari", "Коммерческие объекты"], desc: ["Klinikalar, ofislar, savdo markazlari, ishlab chiqarish binolari", "Клиники, офисы, торговые центры, производственные здания"] },
              { title: ["Genpudrat va kompleks ishlar", "Генподряд и комплексные работы"], desc: ["Bitta tizimda boshqariladigan jarayon", "Процесс, управляемый в единой системе"] },
              { title: ["Nazorat ostidagi sifat", "Качество под контролем"], desc: ["Har bosqich tekshiriladi, har ish qabul qilinadi", "Каждый этап проверяется, каждая работа принимается"] },
              { title: ["Mijoz xotirjamligi", "Спокойствие клиента"], desc: ["Buyurtmachi har kuni obyekt \"dispetcheri\" bo'lib qolmaydi", "Заказчик не становится ежедневным «диспетчером» объекта"] },
            ].map((fact) => (
              <div key={fact.title[0]} className="space-y-2">
                <div style={{ fontFamily: 'var(--font-display)', color: '#060920', textShadow: 'none' }} className="text-lg leading-snug">
                  {t(fact.title[0], fact.title[1])}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', textShadow: 'none' }} className="tracking-wide text-[#060920]/60 text-sm leading-relaxed">
                  {t(fact.desc[0], fact.desc[1])}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Floor 1 - BRAND STATEMENT */}
      <FloorSection
        floorNumber={1}
        subtitle={t("YANGI YO'NALISH", "НОВОЕ НАПРАВЛЕНИЕ")}
        title={t("Yangi qurilish madaniyati", "Новая культура строительства")}
        description={t("Biz qurilish bozorida yangi yondashuvni shakllantiryapmiz: tartibli jarayon, aniq grafik, shaffof xarajat, sifat nazorati va mijoz xotirjamligi.", "Мы формируем новый подход на строительном рынке: упорядоченный процесс, точный график, прозрачные расходы, контроль качества и спокойствие клиента.")}
        alignment="left"
      >
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.8, delay: 0.3 }}
          style={{ fontFamily: 'var(--font-display)' }}
          className="mt-8 text-2xl text-[#060920] leading-snug max-w-2xl"
        >
<BarpoWord /> {t("uchun sifat — alohida va'da emas.", "Качество — не просто обещание.")}
        </motion.p>
        <p style={{ fontFamily: 'var(--font-body)' }} className="mt-3 text-[#060920]/65 leading-relaxed max-w-2xl">
          {t("Bu ish boshlanishidan obyekt topshirilishigacha amal qilinadigan mezon.", "Это критерий, который действует от начала работ до сдачи объекта.")}
        </p>
      </FloorSection>

      {/* Floor 2 - BIZ HAQIMIZDA */}
      <FloorSection
        floorNumber={2}
        subtitle={t("BIZ HAQIMIZDA", "О НАС")}
        title={t("Qurilish jarayonini tizimga, obyektni qiymatga aylantiramiz.", "Превращаем строительный процесс в систему, а объект — в ценность.")}
        description={t("BARPO yirik va o'rta hajmdagi obyektlarni qurish, boshqarish va yakuniy natijagacha olib borishga ixtisoslashgan qurilish kompaniyasi.", "Строительная компания, специализирующаяся на возведении, управлении и доведении до конечного результата крупных и средних объектов.")}
        alignment="right"
      >
        <div className="mt-8 space-y-5 max-w-2xl">
          <p style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/70 leading-relaxed">
            {t("Biz turar joy majmualari, biznes markazlar, savdo obyektlari, klinikalar, ofis binolari, ishlab chiqarish va boshqa tijoriy loyihalarda ishlaymiz.", "Мы работаем над жилыми комплексами, бизнес-центрами, торговыми объектами, клиниками, офисными зданиями, производственными и другими коммерческими проектами.")}
          </p>
          <p style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/70 leading-relaxed">
            {t("Bizning asosiy farqimiz — qurilishga faqat ijro sifatida emas, boshqaruv tizimi sifatida qarashimizda. Har bir bosqich rejalashtiriladi. Har bir ish hajmi hisoblanadi. Har bir jarayon nazorat qilinadi. Har bir qaror investorning vaqtiga, xarajatiga va natijasiga ta'siri bilan baholanadi.", "Наше главное отличие — мы относимся к строительству не просто как к исполнению, а как к системе управления. Каждый этап планируется. Каждый объём работ рассчитывается. Каждый процесс контролируется. Каждое решение оценивается по его влиянию на время, расходы и результат инвестора.")}
          </p>
          <div className="pl-5 border-l-2 border-[#060920]/30">
            <p style={{ fontFamily: 'var(--font-display)' }} className="text-lg text-[#060920] italic leading-snug">
<BarpoWord /> {t("— bu qurilishdagi tartib, nazorat va mas'uliyat. Biz obyektni shunchaki qurmaymiz. Uni tizim bilan barpo etamiz.", "Это порядок, контроль и ответственность в строительстве. Мы не просто строим объект. Мы созидаем его с помощью системы.")}
            </p>
          </div>
        </div>
      </FloorSection>

      {/* Floor 3 - MISSIYA */}
      <FloorSection
        floorNumber={3}
        subtitle={t("MISSIYA", "МИССИЯ")}
        title={t("Bizning missiyamiz", "Наша миссия")}
        description={t("Bizning missiyamiz — O'zbekistonda qurilish madaniyatini yangi bosqichga olib chiqish.", "Наша миссия — вывести культуру строительства в Узбекистане на новый уровень.")}
        alignment="left"
      >
        <div className="mt-8 space-y-5 max-w-2xl">
          <p style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/70 leading-relaxed">
            {t("Qurilishda sifatsizlik, kechikish, ortiqcha xarajat, tartibsiz boshqaruv va noaniq javobgarlik odatiy holat bo'lmasligi kerak.", "Низкое качество, задержки, лишние расходы, беспорядочное управление и неясная ответственность не должны быть нормой в строительстве.")}
          </p>
          <p style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/70 leading-relaxed">
<BarpoWord /> {t("sifat, intizom, shaffoflik va mas'uliyatni bozordagi norma darajasiga olib chiqishni maqsad qilgan.", "Мы ставим целью сделать качество, дисциплину, прозрачность и ответственность нормой рынка.")}
          </p>
          <div className="pl-5 border-l-2 border-[#060920]/30">
            <p style={{ fontFamily: 'var(--font-display)' }} className="text-lg text-[#060920] italic leading-snug">
              {t("Biz uchun har bir obyekt — bu faqat loyiha emas. Bu mijoz ishonchi, investor kapitali va shahar kelajagi oldidagi javobgarlik.", "Для нас каждый объект — это не просто проект. Это доверие клиента, капитал инвестора и ответственность перед будущим города.")}
            </p>
          </div>
        </div>
      </FloorSection>

      {/* Floor 4 - BARPO nima qiladi? */}
      <FloorSection
        floorNumber={4}
        subtitle={t("BARPO NIMA QILADI?", "ЧТО МЫ ДЕЛАЕМ?")}
        title={t("Qurilish jarayonini boshidan oxirigacha tizimga soladigan hamkor", "Партнёр, который выстраивает строительный процесс в систему от начала до конца")}
        description={t("Biz obyektni faqat qurilish maydonidagi ishchi kuchi bilan emas, balki reja, grafika, texnik nazorat, brigadalar koordinatsiyasi, materiallar boshqaruvi va sifat qabul qilish tizimi orqali olib boramiz.", "Мы ведём объект не только рабочей силой на площадке, но через план, графику, технический контроль, координацию бригад, управление материалами и систему приёмки качества.")}
        alignment="left"
      >
        <div className="space-y-6 mt-8">
          {[
            { num: "1", title: ["Bosh pudratchi xizmatlari", "Услуги генподрядчика"], desc: ["Obyektni bir nechta brigada va yo'nalishlar orasida tarqalib ketgan jarayon emas, yagona boshqaruv tizimi sifatida olib boramiz.", "Мы ведём объект не как процесс, разбросанный между бригадами и направлениями, а как единую систему управления."] },
            { num: "2", title: ["Qurilish-montaj ishlari", "Строительно-монтажные работы"], desc: ["Konstruksiya, devor, pol, shift, fasad va boshqa asosiy qurilish bosqichlari texnik talab va grafik asosida bajariladi.", "Конструкция, стены, полы, потолки, фасад и другие основные этапы выполняются по техническим требованиям и графику."] },
            { num: "3", title: ["Pardozlash ishlari", "Отделочные работы"], desc: ["Yakuniy ko'rinish faqat chiroy emas. Bu silliqlik, burchak, detal, tozalik va qabul mezonlariga javob beradigan natija.", "Финальный вид — это не только красота. Это ровность, углы, детали, чистота и результат, отвечающий критериям приёмки."] },
            { num: "4", title: ["Muhandislik tizimlari", "Инженерные системы"], desc: ["Elektrika, ventilyatsiya, santexnika va past kuchlanish tizimlari obyektning ichki \"asab tizimi\" sifatida loyihaga muvofiq bajariladi.", "Электрика, вентиляция, сантехника и слаботочные системы выполняются по проекту как внутренняя «нервная система» объекта."] },
            { num: "5", title: ["Fasad va tashqi ishlar", "Фасад и наружные работы"], desc: ["Binoning tashqi ko'rinishi uning bozordagi birinchi taassurotidir. Biz fasadni estetika, chidamlilik va texnik talablar asosida bajaramiz.", "Внешний вид здания — его первое впечатление на рынке. Мы выполняем фасад на основе эстетики, долговечности и технических требований."] },
          ].map((service, i) => (
            <motion.div
              key={service.num}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8, delay: 0.4 + i * 0.08 }}
              className="flex gap-4 items-start"
            >
              <span style={{ fontFamily: 'var(--font-display)' }} className="text-xl font-bold text-[#060920]/20 shrink-0 leading-none mt-1">{service.num}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-display)' }} className="text-lg text-[#060920] mb-1">{t(service.title[0], service.title[1])}</div>
                <p style={{ fontFamily: 'var(--font-body)' }} className="text-sm text-[#060920]/60 leading-relaxed">{t(service.desc[0], service.desc[1])}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </FloorSection>

      {/* Floor 5 - NIMA UCHUN BARPO? */}
      <FloorSection
        floorNumber={5}
        subtitle=""
        title={t("Nima uchun BARPO?", "Почему мы?")}
        description=""
        alignment="right"
      >
        <div className="space-y-6 mt-2">
          {[
            { num: "1", title: ["Chunki biz jarayonni ko'ramiz", "Потому что мы видим процесс"], desc: ["Ko'pchilik natijani oxirida ko'radi. Biz esa natijani boshidan rejalashtiramiz.", "Большинство видит результат в конце. А мы планируем результат с самого начала."] },
            { num: "2", title: ["Chunki biz xarajatni nazorat qilamiz", "Потому что мы контролируем расходы"], desc: ["Ortiqcha xarajat ko'pincha qimmat materialdan emas, noto'g'ri qarordan boshlanadi.", "Лишние расходы чаще начинаются не с дорогого материала, а с неверного решения."] },
            { num: "3", title: ["Chunki biz sifatni har kuni tekshiramiz", "Потому что мы проверяем качество каждый день"], desc: ["Sifat yakunda \"to'g'rilanadigan\" narsa emas. Sifat har bosqichda quriladi.", "Качество — не то, что «исправляют» в конце. Качество создаётся на каждом этапе."] },
            { num: "4", title: ["Chunki biz investor vaqtini qadrlaymiz", "Потому что мы ценим время инвестора"], desc: ["Investor obyekt ortidan yugurmasligi kerak. U qaror qabul qilishi kerak. Jarayon esa tizim bilan boshqarilishi kerak.", "Инвестор не должен бегать за объектом. Он должен принимать решения. А процессом должна управлять система."] },
            { num: "5", title: ["Chunki biz javobgarlikni bo'lib tashlamaymiz", "Потому что мы не перекладываем ответственность"], desc: ["Obyektda muammo bo'lsa, bahona emas, yechim kerak. BARPO mas'uliyatni jarayonning markaziga qo'yadi.", "Если на объекте проблема — нужно решение, а не оправдание. Мы ставим ответственность в центр процесса."] },
          ].map((item, i) => (
            <motion.div
              key={item.num}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.8, delay: 0.3 + i * 0.08 }}
              className="flex gap-4 items-start"
            >
              <span style={{ fontFamily: 'var(--font-display)' }} className="text-xl font-bold text-[#060920]/20 shrink-0 leading-none mt-1">{item.num}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-display)' }} className="text-lg text-[#060920] mb-1">{barpo(t(item.title[0], item.title[1]))}</div>
                <p style={{ fontFamily: 'var(--font-body)' }} className="text-sm text-[#060920]/60 leading-relaxed">{barpo(t(item.desc[0], item.desc[1]))}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </FloorSection>

      {/* Floor 3 - BARPO STANDARTI */}
      <FloorSection
        floorNumber={6}
        subtitle={t("BARPO STANDARTI", "НАШ СТАНДАРТ")}
        title={t("Sifat — qabul qilinadigan mezon", "Качество — критерий приёмки")}
        description={t("BARPO sifatni gap bilan emas, tizim bilan boshqaradi. Har bir bosqichni tekshirish, xatoni vaqtida ko'rish, natijani aniq mezon bilan qabul qilish tizimi.", "Мы управляем качеством не словами, а системой. Это система проверки каждого этапа, своевременного выявления ошибки и приёмки результата по чётким критериям.")}
        alignment="left"
      >
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-8 space-y-4"
        >
          <div className="w-fit">
            <h3 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl text-[#060920]">
              {t("Nazorat nuqtalari", "Точки контроля")}
            </h3>
            <SoftDivider className="mt-3" />
          </div>
          <p style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/70 leading-relaxed">
            {t("Devor tekisligi asbob bilan tekshiriladi. Burchak va chiziqlar aniqlik bilan tekshiriladi. Yopiladigan ishlar yopilishdan oldin tekshiriladi. Muhandislik tugunlari esa loyiha asosida tekshiriladi.", "Ровность стен проверяется прибором. Углы и линии проверяются с точностью. Скрытые работы проверяются до закрытия. Инженерные узлы проверяются по проекту.")}
          </p>
        </motion.div>
      </FloorSection>

      {/* Floor 4 - QANDAY ISHLAYMIZ? */}
      <FloorSection
        floorNumber={7}
        subtitle={t("QANDAY ISHLAYMIZ?", "КАК МЫ РАБОТАЕМ?")}
        title={t("Tushunarli jarayon", "Понятный процесс")}
        description={t("Qurilishda xotirjamlik jarayon tushunarli bo'lganda paydo bo'ladi. Biz mijozni noaniqlik ichida qoldirmaymiz. Har bosqich, har qaror va har natija tushunarli tizim asosida olib boriladi.", "Спокойствие в строительстве появляется, когда процесс понятен. Мы не оставляем клиента в неопределённости. Каждый этап, каждое решение и каждый результат ведутся по понятной системе.")}
        alignment="right"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="space-y-3">
            {[
              ["Tanishuv va ehtiyojni aniqlash", "Знакомство и выявление потребностей"],
              ["Obyekt va loyiha tahlili", "Анализ объекта и проекта"],
              ["Hisob-kitob va tijoriy taklif", "Расчёт и коммерческое предложение"],
              ["Grafik va resurs rejalashtirish", "Планирование графика и ресурсов"],
              ["Ishga kirishish va tayyorlash", "Начало работ и подготовка"],
              ["Texnik nazorat — har ish bajarilgandan so'ng", "Технический контроль — после каждой выполненной работы"],
              ["Kunlik hisobot mijozga", "Ежедневный отчёт клиенту"],
              ["Yakuniy qabul va topshirish", "Финальная приёмка и сдача"]
            ].map((step, i) => (
              <motion.div
                key={step[0]}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.8, delay: 0.5 + i * 0.08 }}
                className="flex items-center gap-4"
              >
                <div 
                  style={{ fontFamily: 'var(--font-display)' }}
                  className="min-w-8 h-8 rounded-full bg-[#060920]/10 flex items-center justify-center text-[#060920]/50 text-sm"
                >
                  {i + 1}
                </div>
                <span style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/70">
                  {t(step[0], step[1])}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </FloorSection>

      {/* Floor 5 - LOYIHALAR */}
      <FloorSection
        floorNumber={8}
        subtitle={t("LOYIHALAR", "ПРОЕКТЫ")}
        title={t("Bajarilgan ishlarni ko'rish", "Посмотреть выполненные работы")}
        description={t("Har bir loyiha BARPO'ning jarayonni boshqarish va sifatni nazorat qilish salohiyatini ko'rsatadi. Bu faqat bitirilgan loyihalar emas — bu tizim bilan bajarilgan loyihalar.", "Каждый проект показывает нашу способность управлять процессом и контролировать качество. Это не просто завершённые проекты — это проекты, выполненные с помощью системы.")}
        alignment="left"
      >
        {homeProjects.length === 0 ? (
          <div className="mt-8">
            <a
              href="#projects"
              style={{ fontFamily: 'var(--font-body)' }}
              className="inline-block mt-5 text-sm tracking-[0.15em] uppercase text-[#060920] hover:opacity-60 transition-opacity"
            >
              {t("Barcha loyihalar", "Все проекты")} →
            </a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              {homeProjects.map((project, i) => (
                <motion.a
                  key={project.id}
                  href={`#project-${project.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="block cursor-pointer bg-white rounded-3xl p-7 shadow-[0_12px_32px_-12px_rgba(6,9,32,0.20)] hover:shadow-[0_18px_44px_-12px_rgba(6,9,32,0.28)] transition-shadow"
                >
                  <div className="w-fit">
                    <div style={{ fontFamily: 'var(--font-display)' }} className="text-2xl text-[#060920]">
                      {project.name}
                    </div>
                    <SoftDivider className="mt-3" />
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/65 leading-relaxed mt-4">
                    {project.description
                      ? project.description
                      : [project.location, project.area].filter(Boolean).join(" · ")}
                  </p>
                  <SoftDivider className="mt-5 mb-4 max-w-none" />
                  <span style={{ fontFamily: 'var(--font-display)' }} className="text-lg text-[#060920]">
                    {t("Batafsil ko'rish", "Подробнее")} →
                  </span>
                </motion.a>
              ))}
            </div>
            <a
              href="#projects"
              style={{ fontFamily: 'var(--font-body)' }}
              className="inline-block mt-8 text-sm tracking-[0.15em] uppercase text-[#060920] hover:opacity-60 transition-opacity"
            >
              {t("Barcha loyihalar", "Все проекты")} →
            </a>
          </>
        )}
      </FloorSection>

      {/* Floor 6 - HISOBOT VA NAZORAT */}
      <FloorSection
        floorNumber={9}
        subtitle={t("HISOBOT VA NAZORAT", "ОТЧЁТНОСТЬ И КОНТРОЛЬ")}
        title={t("Investor uchun shaffof qurilish", "Прозрачное строительство для инвестора")}
        description={t("Qurilishda eng katta xavflardan biri — investor jarayonni real ko'rmasligi. BARPO'da obyekt bo'yicha kunlik nazorat tizimi yuritiladi.", "Один из самых больших рисков в строительстве — инвестор не видит процесс реально. У нас по объекту ведётся система ежедневного контроля.")}
        alignment="left"
      >
        <div className="mt-8 space-y-6">
          <p style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/65 leading-relaxed">
            {t("Qaysi ish bajarildi, qaysi brigada ishladi, qancha odam obyektga chiqdi, material holati qanday, grafikdan ortda qolish bormi — bularning barchasi boshqaruv tizimida ko'rinib turadi.", "Какая работа выполнена, какая бригада работала, сколько людей вышло на объект, каково состояние материалов, есть ли отставание от графика — всё это видно в системе управления.")}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mt-6">
            {[
              { label: ["Kunlik nazorat", "Ежедневный контроль"], desc: ["Har kuni maydon tekshiruvi va qaydlar", "Ежедневная проверка площадки и записи"] },
              { label: ["Kunlik hisobot", "Ежедневный отчёт"], desc: ["Mijozga strukturali progress hisoboti", "Структурированный отчёт о прогрессе клиенту"] },
              { label: ["Grafik monitoring", "Мониторинг графика"], desc: ["Rejadan ortda qolish darhol ko'rinadi", "Отставание от плана видно сразу"] },
              { label: ["Material holati", "Состояние материалов"], desc: ["Zaxira va sarflanish real vaqtda", "Запас и расход в реальном времени"] },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.7, delay: 0.5 + i * 0.08 }}
                className="space-y-3"
              >
                <div className="w-fit">
                  <div style={{ fontFamily: 'var(--font-display)' }} className="text-2xl text-[#060920]">{t(item.label[0], item.label[1])}</div>
                  <SoftDivider className="mt-3" />
                </div>
                <div style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/60 leading-relaxed">{t(item.desc[0], item.desc[1])}</div>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="pt-4 border-t border-[#060920]/10"
          >
            <p style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/50 text-sm leading-relaxed">
              {t("Shaffoflik — bu chiroyli hisobot emas.", "Прозрачность — это не красивый отчёт.")}<br />
              {t("Shaffoflik — bu vaqtida qaror qabul qilish imkoniyati.", "Прозрачность — это возможность принять решение вовремя.")}
            </p>
          </motion.div>
        </div>
      </FloorSection>

      {/* Floor 7 - IQTISODIY FOYDA */}
      <FloorSection
        floorNumber={10}
        subtitle={t("IQTISODIY FOYDA", "ЭКОНОМИЧЕСКАЯ ВЫГОДА")}
        title={t("To'g'ri qurilish investor pulini himoya qiladi", "Правильное строительство защищает деньги инвестора")}
        description={t("Qurilishda tejash har doim arzon material tanlash degani emas. Ba'zan eng katta iqtisod noto'g'ri yechimni vaqtida to'xtatish va smetani chuqur tahlil qilishdan keladi.", "Экономия в строительстве — это не всегда выбор дешёвого материала. Иногда самая большая экономия приходит от своевременной остановки неверного решения и глубокого анализа сметы.")}
        alignment="right"
      >
        <div className="mt-8 space-y-5">
          {[
            { num: "01", text: ["Har bir xarajatga savol bilan qaraymiz: bu qaror obyekt sifati, muddati va kelajakdagi ishlashiga qanday ta'sir qiladi?", "К каждому расходу относимся с вопросом: как это решение повлияет на качество объекта, сроки и будущую эксплуатацию?"] },
            { num: "02", text: ["Ortiqcha ishni oldini olish orqali byudjetni tejash — arzon pudratchi tanlashdan ko'ra samarali.", "Экономия бюджета через предотвращение лишних работ эффективнее, чем выбор дешёвого подрядчика."] },
            { num: "03", text: ["Smeta chuqur tahlil qilinadi: har bir modda asoslanadi va investor bilan muhokama qilinadi.", "Смета анализируется глубоко: каждая статья обосновывается и обсуждается с инвестором."] },
          ].map((item, i) => (
            <motion.div
              key={item.num}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.7, delay: 0.5 + i * 0.1 }}
              className="flex gap-5 items-start"
            >
              <span style={{ fontFamily: 'var(--font-display)' }} className="text-2xl font-bold text-[#060920]/15 shrink-0 leading-none mt-1">{item.num}</span>
              <p style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/65 leading-relaxed">{t(item.text[0], item.text[1])}</p>
            </motion.div>
          ))}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="pt-5 border-t border-[#060920]/10"
          >
            <p style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/50 text-sm leading-relaxed">
              {t("Bizning maqsadimiz — narxni shunchaki pasaytirish emas.", "Наша цель — не просто снизить цену.")}<br />
              {t("Bizning maqsadimiz — investor kapitalini oqilona ishlatish.", "Наша цель — разумно использовать капитал инвестора.")}
            </p>
            <a
              href="#foyda"
              style={{ fontFamily: 'var(--font-body)', textDecoration: 'none' }}
              className="inline-block mt-4 text-sm tracking-[0.15em] uppercase text-[#060920] hover:opacity-60 transition-opacity"
            >
              {t("Batafsil — iqtisodiy foyda", "Подробнее — экономическая выгода")} →
            </a>
          </motion.div>
        </div>
      </FloorSection>

      {/* Floor 8 - MILLIY IDENTITET */}
      <FloorSection
        floorNumber={11}
        subtitle={t("MILLIY IDENTITET", "НАЦИОНАЛЬНАЯ ИДЕНТИЧНОСТЬ")}
        title={t("Zamonaviy qurilish. Milliy ildiz.", "Современное строительство. Национальные корни.")}
        description={t("BARPO zamonaviy qurilish kompaniyasi, lekin bizning estetikamiz va fikrlashimiz O'zbekistonning boy me'moriy merosi bilan bog'langan.", "Мы — современная строительная компания, но наша эстетика и мышление связаны с богатым архитектурным наследием Узбекистана.")}
        alignment="left"
      >
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-8">
            {[["Ornament", "Орнамент"], ["Nisbat", "Пропорция"], ["Ritm", "Ритм"], ["Tartib", "Порядок"], ["Chuqur ma'no", "Глубокий смысл"], ["Zamonaviy shakl", "Современная форма"]].map((word, i) => (
              <motion.div
                key={word[0]}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, delay: 0.5 + i * 0.07 }}
                className="w-fit"
              >
                <div style={{ fontFamily: 'var(--font-display)' }} className="text-xl text-[#060920]">
                  {t(word[0], word[1])}
                </div>
                <SoftDivider className="mt-3" />
              </motion.div>
            ))}
          </div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.9 }}
            style={{ fontFamily: 'var(--font-body)' }}
            className="text-[#060920]/60 leading-relaxed"
          >
            {t("Bular biz uchun faqat bezak emas. Bu qurilish madaniyatining bir qismi. Biz o'tmishni takrorlamaymiz — undan kuch olib, zamonaviy shaklda barpo etamiz.", "Для нас это не просто украшение. Это часть культуры строительства. Мы не повторяем прошлое — мы черпаем из него силу и созидаем в современной форме.")}
          </motion.p>
        </div>
      </FloorSection>

      {/* Floor 9 - ALOQA */}
      <FloorSection
        floorNumber={12}
        subtitle={t("ALOQA", "КОНТАКТЫ")}
        title={t("Loyihangizni muhokama qilaylik", "Обсудим ваш проект")}
        description={t("Biz avval vazifani tushunamiz, keyin yechim taklif qilamiz. Har bir loyiha noyob, shuning uchun har biriga alohida yondashamiz.", "Сначала мы понимаем задачу, затем предлагаем решение. Каждый проект уникален, поэтому к каждому подходим индивидуально.")}
        alignment="right"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 1, delay: 0.8 }}
          className="mt-8 space-y-6"
        >
          {/* Contact form */}
          {contactStatus === "success" ? (
            <div className="p-8 border border-[#060920]/15 bg-white/60 backdrop-blur-sm rounded-2xl text-center space-y-3">
              <div style={{ fontFamily: 'var(--font-display)' }} className="text-xl text-[#060920]">
                {t("Rahmat! Murojaatingiz qabul qilindi.", "Спасибо! Ваша заявка принята.")}
              </div>
              <p style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/70 tracking-wide text-sm">
                {t("Tez orada siz bilan bog'lanamiz.", "Мы свяжемся с вами в ближайшее время.")}
              </p>
              <button
                onClick={() => setContactStatus("idle")}
                style={{ fontFamily: 'var(--font-body)' }}
                className="mt-1 px-6 py-2 text-sm tracking-[0.15em] uppercase text-[#060920]/70 hover:text-[#060920] transition-colors"
              >
                {t("Yana yuborish", "Отправить ещё")}
              </button>
            </div>
          ) : (
          <form className="space-y-4" onSubmit={handleContactSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="fullName"
                required
                placeholder={t("Sizning ismingiz *", "Ваше имя *")}
                style={{ fontFamily: 'var(--font-body)' }}
                className="px-4 py-3 bg-white/50 border border-[#060920]/15 text-[#060920] placeholder-[#060920]/40 focus:outline-none focus:border-[#060920]/40 transition-colors rounded-lg"
              />
              <input
                type="tel"
                name="phone"
                required
                placeholder={t("Telefon raqam *", "Телефон *")}
                inputMode="tel"
                onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^\d+()\-\s]/g, ""); }}
                style={{ fontFamily: 'var(--font-body)' }}
                className="px-4 py-3 bg-white/50 border border-[#060920]/15 text-[#060920] placeholder-[#060920]/40 focus:outline-none focus:border-[#060920]/40 transition-colors rounded-lg"
              />
            </div>
            <input
              type="text"
              name="company"
              placeholder={t("Kompaniya nomi", "Название компании")}
              style={{ fontFamily: 'var(--font-body)' }}
              className="w-full px-4 py-3 bg-white/50 border border-[#060920]/15 text-[#060920] placeholder-[#060920]/40 focus:outline-none focus:border-[#060920]/40 transition-colors rounded-lg"
            />
            <textarea
              name="message"
              placeholder={t("Loyihangiz haqida qisqacha", "Кратко о вашем проекте")}
              rows={4}
              style={{ fontFamily: 'var(--font-body)' }}
              className="w-full px-4 py-3 bg-white/50 border border-[#060920]/15 text-[#060920] placeholder-[#060920]/40 focus:outline-none focus:border-[#060920]/40 transition-colors resize-none rounded-lg"
            />
            {contactStatus === "error" && (
              <p style={{ fontFamily: 'var(--font-body)' }} className="text-sm text-[#060920]">{contactError}</p>
            )}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={contactStatus === "sending"}
              style={{ fontFamily: 'var(--font-body)' }}
              className="w-full px-8 py-4 bg-[#060920] text-white tracking-[0.15em] uppercase font-medium border border-[#060920]/20 shadow-lg transition-all hover:shadow-xl rounded-2xl flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {contactStatus === "sending" ? t("Yuborilmoqda...", "Отправляется...") : t("Murojaatni yuborish", "Отправить заявку")}
            </motion.button>
          </form>
          )}

          <div className="pt-6 border-t border-[#060920]/10 space-y-4">
            <div className="flex gap-3 items-baseline">
              <span style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/40 text-xs tracking-[0.15em] uppercase w-16 flex-shrink-0">Tel</span>
              <div style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/70 tracking-wide">
                {contactInfo.phone || "+998 (90) 123-45-67"}
              </div>
            </div>
            <div className="flex gap-3 items-baseline">
              <span style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/40 text-xs tracking-[0.15em] uppercase w-16 flex-shrink-0">Email</span>
              <div style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/70 tracking-wide">
                {contactInfo.email || "info@barpo.uz"}
              </div>
            </div>
            <div className="flex gap-3 items-baseline">
              <span style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/40 text-xs tracking-[0.15em] uppercase w-16 flex-shrink-0">{t("Manzil", "Адрес")}</span>
              <div style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/70 tracking-wide">
                {contactInfo.address || t("Toshkent, O'zbekiston", "Ташкент, Узбекистан")}
              </div>
            </div>
          </div>
        </motion.div>
      </FloorSection>

      {/* Footer */}
      <Footer />
    </div>
  );
}
