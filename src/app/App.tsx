import { useState, useEffect, useRef } from "react";
import { motion, useScroll } from "motion/react";
import logo from '../assets/logo.png';
import logoHero from '../assets/Logo dark night.png';
import { FloorSection } from "./components/FloorSection";
import { SoftDivider } from "./components/SoftDivider";
import { Footer } from "./components/Footer";

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
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
              <span className="inline-flex items-baseline justify-center gap-3 flex-wrap">
                biz 
                <img
                  src={logoHero}
                  alt="BARPO"
                  style={{ height: '1em', display: 'inline-block', transform: 'translateY(0.05em)' }}
                />
                  etamiz
              </span><br />
              <span className="text-[#060920]">—</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
              style={{ fontFamily: 'var(--font-display)', textShadow: 'none' }}
              className="max-w-3xl mx-auto leading-relaxed tracking-wide text-[#060920] text-xl md:text-2xl"
            >
              Biz shunchaki qurmaymiz. Qurilish jarayonini boshqaramiz.
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.4 }}
              style={{ fontFamily: 'var(--font-body)', textShadow: 'none' }}
              className="max-w-3xl mx-auto leading-relaxed tracking-wide text-[#060920]/75 text-lg"
            >
              BARPO — tijorat obyektlari, biznes markazlar, klinikalar, savdo markazlari, ishlab chiqarish binolari va turar joy majmualari uchun tizimli qurilish hamkori.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.6 }}
              className="flex gap-4 justify-center flex-wrap"
            >
              <motion.a
                href="#contact"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ fontFamily: 'var(--font-body)', textDecoration: 'none' }}
                className="px-8 py-3 bg-[#060920] text-white tracking-[0.15em] uppercase text-sm font-medium border border-[#060920]/20 shadow-lg transition-all hover:shadow-xl rounded-2xl inline-block"
              >
                Loyihani muhokama qilish
              </motion.a>
              <motion.a
                href="#services"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{ fontFamily: 'var(--font-body)', textDecoration: 'none' }}
                className="px-8 py-3 bg-[#060920] text-white tracking-[0.15em] uppercase text-sm border border-white/30 hover:border-white transition-all rounded-2xl shadow-lg hover:shadow-xl inline-block"
              >
                Xizmatlarni ko'rish
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
              { title: "Tijorat obyektlari", desc: "Klinikalar, ofislar, savdo markazlari, ishlab chiqarish binolari" },
              { title: "Genpudrat va kompleks ishlar", desc: "Bitta tizimda boshqariladigan jarayon" },
              { title: "Nazorat ostidagi sifat", desc: "Har bosqich tekshiriladi, har ish qabul qilinadi" },
              { title: "Mijoz xotirjamligi", desc: "Buyurtmachi har kuni obyekt \"dispetcheri\" bo'lib qolmaydi" },
            ].map((fact) => (
              <div key={fact.title} className="space-y-2">
                <div style={{ fontFamily: 'var(--font-display)', color: '#060920', textShadow: 'none' }} className="text-lg leading-snug">
                  {fact.title}
                </div>
                <div style={{ fontFamily: 'var(--font-body)', textShadow: 'none' }} className="tracking-wide text-[#060920]/60 text-sm leading-relaxed">
                  {fact.desc}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Floor 1 - BARPO nima qiladi? */}
      <FloorSection
        floorNumber={1}
        subtitle="BARPO NIMA QILADI?"
        title="Qurilish jarayonini boshidan oxirigacha tizimga soladigan hamkor"
        description="Biz obyektni faqat qurilish maydonidagi ishchi kuchi bilan emas, balki reja, grafika, texnik nazorat, brigadalar koordinatsiyasi, materiallar boshqaruvi va sifat qabul qilish tizimi orqali olib boramiz."
        alignment="left"
      >
        <div className="space-y-6 mt-8">
          {[
            { num: "1", title: "Bosh pudratchi xizmatlari", desc: "Obyektni bir nechta brigada va yo'nalishlar orasida tarqalib ketgan jarayon emas, yagona boshqaruv tizimi sifatida olib boramiz." },
            { num: "2", title: "Qurilish-montaj ishlari", desc: "Konstruksiya, devor, pol, shift, fasad va boshqa asosiy qurilish bosqichlari texnik talab va grafik asosida bajariladi." },
            { num: "3", title: "Pardozlash ishlari", desc: "Yakuniy ko'rinish faqat chiroy emas. Bu silliqlik, burchak, detal, tozalik va qabul mezonlariga javob beradigan natija." },
            { num: "4", title: "Muhandislik tizimlari", desc: "Elektrika, ventilyatsiya, santexnika va past kuchlanish tizimlari obyektning ichki \"asab tizimi\" sifatida loyihaga muvofiq bajariladi." },
            { num: "5", title: "Fasad va tashqi ishlar", desc: "Binoning tashqi ko'rinishi uning bozordagi birinchi taassurotidir. Biz fasadni estetika, chidamlilik va texnik talablar asosida bajaramiz." },
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
                <div style={{ fontFamily: 'var(--font-display)' }} className="text-lg text-[#060920] mb-1">{service.title}</div>
                <p style={{ fontFamily: 'var(--font-body)' }} className="text-sm text-[#060920]/60 leading-relaxed">{service.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </FloorSection>

      {/* Floor 2 - NIMA UCHUN BARPO? */}
      <FloorSection
        floorNumber={2}
        subtitle="NIMA UCHUN BARPO?"
        title="Qurilishda asosiy muammo ishchi kuchida emas. Muammo — boshqaruv yo'qligida"
        description="Ko'p obyektlarda kechikish, ortiqcha xarajat, qayta buzish, brigadalar orasidagi kelishmovchilik va mijozning charchashi bitta sababdan kelib chiqadi: jarayon tizimga solinmagan bo'ladi."
        alignment="right"
      >
        <div className="mt-8">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ fontFamily: 'var(--font-body)' }}
            className="text-xs tracking-[0.25em] uppercase text-[#060920]/50 mb-6"
          >
            BARPO yechimi
          </motion.p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {[
              { title: "Reja", desc: "Har bosqich oldindan hisoblanadi: kim ishlaydi, qachon ishlaydi, qanday material kerak, qaysi ish qaysi bosqichdan keyin boshlanadi." },
              { title: "Nazorat", desc: "Har ish \"bo'ldi\" degan gap bilan emas, tekshiruv va qabul mezonlari bilan yopiladi." },
              { title: "Mas'uliyat", desc: "Jarayon kimning zimmasida ekanligi aniq bo'ladi. Bu esa mijozni har kuni muammo ortidan yugurishdan ozod qiladi." },
              { title: "Sifat", desc: "Sifat — va'da emas. Sifat — qabul qilinadigan standart." },
              { title: "Xotirjamlik", desc: "Buyurtmachi obyektni nazorat qilayotganini his qiladi, lekin har bir mayda ishni o'zi boshqarishga majbur bo'lmaydi." }
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.8, delay: 0.4 + i * 0.08 }}
                className="space-y-3"
              >
                <div className="w-fit">
                  <div style={{ fontFamily: 'var(--font-display)' }} className="text-2xl text-[#060920]">
                    {item.title}
                  </div>
                  <SoftDivider className="mt-3" />
                </div>
                <div style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/60 leading-relaxed text-sm">
                  {item.desc}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </FloorSection>

      {/* Floor 3 - BARPO STANDARTI */}
      <FloorSection
        floorNumber={3}
        subtitle="BARPO STANDARTI"
        title="Sifat — qabul qilinadigan mezon"
        description="BARPO sifatni gap bilan emas, tizim bilan boshqaradi. Har bir bosqichni tekshirish, xatoni vaqtida ko'rish, natijani aniq mezon bilan qabul qilish tizimi."
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
              Nazorat nuqtalari
            </h3>
            <SoftDivider className="mt-3" />
          </div>
          <p style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/70 leading-relaxed">
            Devor tekisligi asbob bilan tekshiriladi. Burchak va chiziqlar aniqlik bilan tekshiriladi. Yopiladigan ishlar yopilishdan oldin tekshiriladi. Muhandislik tugunlari esa loyiha asosida tekshiriladi.
          </p>
        </motion.div>
      </FloorSection>

      {/* Floor 4 - QANDAY ISHLAYMIZ? */}
      <FloorSection
        floorNumber={4}
        subtitle="QANDAY ISHLAYMIZ?"
        title="Tushunarli jarayon"
        description="Qurilishda xotirjamlik jarayon tushunarli bo'lganda paydo bo'ladi. Biz mijozni noaniqlik ichida qoldirmaymiz. Har bosqich, har qaror va har natija tushunarli tizim asosida olib boriladi."
        alignment="right"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          <div className="space-y-3">
            {[
              "Tanishuv va ehtiyojni aniqlash",
              "Obyekt va loyiha tahlili",
              "Hisob-kitob va tijoriy taklif",
              "Grafik va resurs rejalashtirish",
              "Ishga kirishish va tayyorlash",
              "Texnik nazorat — har ish bajarilgandan so'ng",
              "Kunlik hisobot mijozga",
              "Yakuniy qabul va topshirish"
            ].map((step, i) => (
              <motion.div
                key={step}
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
                  {step}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </FloorSection>

      {/* Floor 5 - LOYIHALAR */}
      <FloorSection
        floorNumber={5}
        subtitle="LOYIHALAR"
        title="Bajarilgan ishlarni ko'rish"
        description="Har bir loyiha BARPO'ning jarayonni boshqarish va sifatni nazorat qilish salohiyatini ko'rsatadi. Bu faqat bitirilgan loyihalar emas — bu tizim bilan bajarilgan loyihalar."
        alignment="left"
      >
        {homeProjects.length === 0 ? (
          <div className="mt-8">
            <a
              href="#projects"
              style={{ fontFamily: 'var(--font-body)' }}
              className="inline-block mt-5 text-sm tracking-[0.15em] uppercase text-[#060920] hover:opacity-60 transition-opacity"
            >
              Barcha loyihalar →
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
                    Batafsil ko'rish →
                  </span>
                </motion.a>
              ))}
            </div>
            <a
              href="#projects"
              style={{ fontFamily: 'var(--font-body)' }}
              className="inline-block mt-8 text-sm tracking-[0.15em] uppercase text-[#060920] hover:opacity-60 transition-opacity"
            >
              Barcha loyihalar →
            </a>
          </>
        )}
      </FloorSection>

      {/* Floor 6 - HISOBOT VA NAZORAT */}
      <FloorSection
        floorNumber={6}
        subtitle="HISOBOT VA NAZORAT"
        title="Investor uchun shaffof qurilish"
        description="Qurilishda eng katta xavflardan biri — investor jarayonni real ko'rmasligi. BARPO'da obyekt bo'yicha kunlik nazorat tizimi yuritiladi."
        alignment="left"
      >
        <div className="mt-8 space-y-6">
          <p style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/65 leading-relaxed">
            Qaysi ish bajarildi, qaysi brigada ishladi, qancha odam obyektga chiqdi, material holati qanday, grafikdan ortda qolish bormi — bularning barchasi boshqaruv tizimida ko'rinib turadi.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mt-6">
            {[
              { label: "Kunlik nazorat", desc: "Har kuni maydon tekshiruvi va qaydlar" },
              { label: "Kunlik hisobot", desc: "Mijozga strukturali progress hisoboti" },
              { label: "Grafik monitoring", desc: "Rejadan ortda qolish darhol ko'rinadi" },
              { label: "Material holati", desc: "Zaxira va sarflanish real vaqtda" },
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
                  <div style={{ fontFamily: 'var(--font-display)' }} className="text-2xl text-[#060920]">{item.label}</div>
                  <SoftDivider className="mt-3" />
                </div>
                <div style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/60 leading-relaxed">{item.desc}</div>
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
              Shaffoflik — bu chiroyli hisobot emas.<br />
              Shaffoflik — bu vaqtida qaror qabul qilish imkoniyati.
            </p>
          </motion.div>
        </div>
      </FloorSection>

      {/* Floor 7 - IQTISODIY FOYDA */}
      <FloorSection
        floorNumber={7}
        subtitle="IQTISODIY FOYDA"
        title="To'g'ri qurilish investor pulini himoya qiladi"
        description="Qurilishda tejash har doim arzon material tanlash degani emas. Ba'zan eng katta iqtisod noto'g'ri yechimni vaqtida to'xtatish va smetani chuqur tahlil qilishdan keladi."
        alignment="right"
      >
        <div className="mt-8 space-y-5">
          {[
            { num: "01", text: "Har bir xarajatga savol bilan qaraymiz: bu qaror obyekt sifati, muddati va kelajakdagi ishlashiga qanday ta'sir qiladi?" },
            { num: "02", text: "Ortiqcha ishni oldini olish orqali byudjetni tejash — arzon pudratchi tanlashdan ko'ra samarali." },
            { num: "03", text: "Smeta chuqur tahlil qilinadi: har bir modda asoslanadi va investor bilan muhokama qilinadi." },
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
              <p style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/65 leading-relaxed">{item.text}</p>
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
              Bizning maqsadimiz — narxni shunchaki pasaytirish emas.<br />
              Bizning maqsadimiz — investor kapitalini oqilona ishlatish.
            </p>
            <a
              href="#foyda"
              style={{ fontFamily: 'var(--font-body)', textDecoration: 'none' }}
              className="inline-block mt-4 text-sm tracking-[0.15em] uppercase text-[#060920] hover:opacity-60 transition-opacity"
            >
              Batafsil — iqtisodiy foyda →
            </a>
          </motion.div>
        </div>
      </FloorSection>

      {/* Floor 8 - MILLIY IDENTITET */}
      <FloorSection
        floorNumber={8}
        subtitle="MILLIY IDENTITET"
        title="Zamonaviy qurilish. Milliy ildiz."
        description="BARPO zamonaviy qurilish kompaniyasi, lekin bizning estetikamiz va fikrlashimiz O'zbekistonning boy me'moriy merosi bilan bog'langan."
        alignment="left"
      >
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-12 gap-y-8">
            {["Ornament", "Nisbat", "Ritm", "Tartib", "Chuqur ma'no", "Zamonaviy shakl"].map((word, i) => (
              <motion.div
                key={word}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, delay: 0.5 + i * 0.07 }}
                className="w-fit"
              >
                <div style={{ fontFamily: 'var(--font-display)' }} className="text-xl text-[#060920]">
                  {word}
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
            Bular biz uchun faqat bezak emas. Bu qurilish madaniyatining bir qismi. Biz o'tmishni takrorlamaymiz — undan kuch olib, zamonaviy shaklda barpo etamiz.
          </motion.p>
        </div>
      </FloorSection>

      {/* Floor 9 - ALOQA */}
      <FloorSection
        floorNumber={9}
        subtitle="ALOQA"
        title="Loyihangizni muhokama qilaylik"
        description="Biz avval vazifani tushunamiz, keyin yechim taklif qilamiz. Har bir loyiha noyob, shuning uchun har biriga alohida yondashamiz."
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
                Rahmat! Murojaatingiz qabul qilindi.
              </div>
              <p style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/70 tracking-wide text-sm">
                Tez orada siz bilan bog'lanamiz.
              </p>
              <button
                onClick={() => setContactStatus("idle")}
                style={{ fontFamily: 'var(--font-body)' }}
                className="mt-1 px-6 py-2 text-sm tracking-[0.15em] uppercase text-[#060920]/70 hover:text-[#060920] transition-colors"
              >
                Yana yuborish
              </button>
            </div>
          ) : (
          <form className="space-y-4" onSubmit={handleContactSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="fullName"
                required
                placeholder="Sizning ismingiz *"
                style={{ fontFamily: 'var(--font-body)' }}
                className="px-4 py-3 bg-white/50 border border-[#060920]/15 text-[#060920] placeholder-[#060920]/40 focus:outline-none focus:border-[#060920]/40 transition-colors rounded-lg"
              />
              <input
                type="tel"
                name="phone"
                required
                placeholder="Telefon raqam *"
                inputMode="tel"
                onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^\d+()\-\s]/g, ""); }}
                style={{ fontFamily: 'var(--font-body)' }}
                className="px-4 py-3 bg-white/50 border border-[#060920]/15 text-[#060920] placeholder-[#060920]/40 focus:outline-none focus:border-[#060920]/40 transition-colors rounded-lg"
              />
            </div>
            <input
              type="text"
              name="company"
              placeholder="Kompaniya nomi"
              style={{ fontFamily: 'var(--font-body)' }}
              className="w-full px-4 py-3 bg-white/50 border border-[#060920]/15 text-[#060920] placeholder-[#060920]/40 focus:outline-none focus:border-[#060920]/40 transition-colors rounded-lg"
            />
            <textarea
              name="message"
              placeholder="Loyihangiz haqida qisqacha"
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
              {contactStatus === "sending" ? "Yuborilmoqda..." : "Murojaatni yuborish"}
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
              <span style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/40 text-xs tracking-[0.15em] uppercase w-16 flex-shrink-0">Manzil</span>
              <div style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/70 tracking-wide">
                {contactInfo.address || "Toshkent, O'zbekiston"}
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
