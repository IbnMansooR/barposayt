import { useEffect, useState, useRef, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useLang, useT } from "./i18n";
import Lenis from "lenis";

// Bosh sahifa (App) eager — bu LCP sahifa, birinchi paint.
// Footer va PageReveal ham eager — ular lazy sahifalar atrofida darhol chiziladi.
import App from "./App";
import { Footer } from "./components/Footer";
import { PageReveal } from "./components/PageReveal";

// Qolgan barcha sahifalar lazy — faqat o'sha sahifa ochilganda yuklanadi.
// Bu bosh sahifaning boshlang'ich JS yukini keskin yengillashtiradi
// (admin/admin.tsx ~2000 qator va boshqa ~17 sahifa endi initial bundle'da emas).
// Hammasi named export, shuning uchun .then(m => ({ default: m.Xxx })) bilan o'raladi.
const ServicesPage = lazy(() => import("../services/services").then((m) => ({ default: m.ServicesPage })));
const StandardPage = lazy(() => import("../standart/standard").then((m) => ({ default: m.StandardPage })));
const CulturePage = lazy(() => import("../standart/culture").then((m) => ({ default: m.CulturePage })));
const ProjectsPage = lazy(() => import("../projects/projects").then((m) => ({ default: m.ProjectsPage })));
const ProjectDetailPage = lazy(() => import("../projects/projectDetail").then((m) => ({ default: m.ProjectDetailPage })));
const ContactPage = lazy(() => import("../contacts/contacts").then((m) => ({ default: m.ContactPage })));
const AboutPage = lazy(() => import("../about/about").then((m) => ({ default: m.AboutPage })));
const HRPage = lazy(() => import("../hr/hr").then((m) => ({ default: m.HRPage })));
const TakliflarPage = lazy(() => import("../takliflar/takliflar").then((m) => ({ default: m.TakliflarPage })));
const AdminPage = lazy(() => import("../admin/admin").then((m) => ({ default: m.AdminPage })));
const JarayonPage = lazy(() => import("../jarayon/jarayon").then((m) => ({ default: m.JarayonPage })));
const OrnamentDetailPage = lazy(() => import("../standart/ornamentDetail").then((m) => ({ default: m.OrnamentDetailPage })));
const FoydaPage = lazy(() => import("../foyda/foyda").then((m) => ({ default: m.FoydaPage })));
const RahbarPage = lazy(() => import("../rahbar/rahbar").then((m) => ({ default: m.RahbarPage })));
const JamoaPage = lazy(() => import("../jamoa/jamoa").then((m) => ({ default: m.JamoaPage })));
const BlogPage = lazy(() => import("../blog/blog").then((m) => ({ default: m.BlogPage })));
const BlogDetailPage = lazy(() => import("../blog/blogDetail").then((m) => ({ default: m.BlogDetailPage })));
const NazoratPage = lazy(() => import("../nazorat/nazorat").then((m) => ({ default: m.NazoratPage })));
// Xavf kalkulyatori vaqtincha saytdan olib qo'yilgan (fayl saqlanadi: src/kalkulyator/kalkulyator.tsx).
// Qaytarish uchun: shu importni, menyu elementini va "kalkulyator" case'ini tiklash kifoya.
// import { KalkulyatorPage } from "../kalkulyator/kalkulyator";
const LugatPage = lazy(() => import("../lugat/lugat").then((m) => ({ default: m.LugatPage })));

import logo from '../assets/logo.png';

export function AppRouter() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isGlobalMenuOpen, setIsGlobalMenuOpen] = useState(false);
  const { lang, setLang } = useLang();
  const t = useT();
  const firstNavLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || "home";
      setCurrentPage(hash);
      setIsGlobalMenuOpen(false);
    };

    handleHashChange();
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Global smooth scroll — Sheron uslubidagi momentum/eased (Lenis "speedramp")
  const lenisRef = useRef<Lenis | null>(null);
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true, wheelMultiplier: 1 });
    lenisRef.current = lenis;
    (window as any).__barpoLenis = lenis; // gorizontal galereya uni to'xtatishi uchun
    let raf = 0;
    const loop = (time: number) => { lenis.raf(time); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); lenisRef.current = null; (window as any).__barpoLenis = null; };
  }, []);


  // Close global menu on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsGlobalMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Menu ochilganda fokusni birinchi nav linkka ko'chirish (klaviatura uchun focus trap)
  useEffect(() => {
    if (isGlobalMenuOpen) {
      firstNavLinkRef.current?.focus();
    }
  }, [isGlobalMenuOpen]);

  // Bosh sahifa ochilgach, eng ko'p bosiladigan sahifa chunklarini fon rejimida
  // (browser bo'sh bo'lganda) oldindan yuklaymiz — birinchi navigatsiya tez bo'ladi.
  // Admin (boshqaruv) ataylab yuklanmaydi — u faqat kerak bo'lganda olinadi.
  useEffect(() => {
    if (currentPage !== "home") return;
    const warm = () => {
      import("../contacts/contacts");
      import("../services/services");
      import("../takliflar/takliflar");
    };
    const ric = (window as any).requestIdleCallback as undefined | ((cb: () => void) => number);
    const id = ric ? ric(warm) : window.setTimeout(warm, 1500);
    return () => {
      const cic = (window as any).cancelIdleCallback as undefined | ((h: number) => void);
      if (cic) cic(id); else clearTimeout(id);
    };
  }, [currentPage]);

  // All pages for global menu
  const allNavItems = [
    { label: t("Bosh sahifa", "Главная"), href: "#home", icon: "◆" },
    { label: t("Xizmatlar", "Услуги"), href: "#services", icon: "◈" },
    { label: t("Madaniyat", "Культура"), href: "#culture", icon: "◇" },
    { label: t("Loyihalar", "Проекты"), href: "#projects", icon: "◉" },
    { label: t("Jarayon", "Процесс"), href: "#jarayon", icon: "◎" },
    { label: t("Iqtisodiy foyda", "Экономическая выгода"), href: "#foyda", icon: "◍" },
    { label: t("Haqimizda", "О нас"), href: "#about", icon: "◐" },
    { label: t("Rahbar", "Руководитель"), href: "#rahbar", icon: "◕" },
    { label: t("Jamoa", "Команда"), href: "#jamoa", icon: "○" },
    { label: t("Bilim markazi", "Центр знаний"), href: "#blog", icon: "●" },
    { label: t("Nazorat", "Контроль"), href: "#nazorat", icon: "◖" },
    { label: t("Lug'at", "Словарь"), href: "#lugat", icon: "◘" },
    { label: t("Standart", "Стандарт"), href: "#standard", icon: "◑" },
    { label: t("HR", "HR"), href: "#hr", icon: "◒" },
    { label: t("Takliflar", "Предложения"), href: "#takliflar", icon: "◓" },
    { label: t("Aloqa", "Контакты"), href: "#contact", icon: "◔" },
  ];

  const renderPage = () => {
    // Har bir loyiha uchun alohida sahifa: #project-<id>
    if (currentPage.startsWith("project-")) {
      const id = currentPage.slice("project-".length);
      return <ProjectDetailPage id={id} />;
    }

    // Har bir naqsh uchun alohida sahifa: #ornament-<id>
    if (currentPage.startsWith("ornament-")) {
      const id = currentPage.slice("ornament-".length);
      return <OrnamentDetailPage id={id} />;
    }

    // Har bir maqola uchun alohida sahifa: #blog-<id>
    if (currentPage.startsWith("blog-")) {
      const id = currentPage.slice("blog-".length);
      return <BlogDetailPage id={id} />;
    }

    switch (currentPage) {
      case "services":
        return <ServicesPage />;
      case "culture":
        return <CulturePage />;
      case "standard":
        return <StandardPage />;
      case "projects":
        return <PageReveal dir="left"><ProjectsPage /></PageReveal>;
      case "about":
        return <AboutPage />;
      case "contact":
        return <ContactPage />;
      case "hr":
        return <HRPage />;
      case "takliflar":
        return <TakliflarPage />;
      case "jarayon":
        return <JarayonPage />;
      case "foyda":
        return <FoydaPage />;
      case "rahbar":
        return <RahbarPage />;
      case "jamoa":
        return <JamoaPage />;
      case "blog":
        return <BlogPage />;
      case "nazorat":
        return <NazoratPage />;
      case "lugat":
        return <LugatPage />;
      case "boshqaruv":
        return <AdminPage />;
      case "home":
      default:
        return <App />;
    }
  };

  // Admin sahifasida va bosh sahifada asosiy navigatsiya ko'rsatilmaydi
  // (bosh sahifa o'zining navigatsiyasiga ega)
  const showNav = currentPage !== "home" && currentPage !== "boshqaruv" && currentPage !== "projects";

  return (
    <>
      {showNav && (
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="fixed top-0 left-0 right-0 z-40 px-5 md:px-16 py-4 md:py-8 bg-white/95 border-b border-[#060920]/10"
        >
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <a href="#home" className="flex-shrink-0">
              <img
                src={logo}
                alt="BARPO Logo"
                className="h-8 cursor-pointer hover:opacity-80 transition-opacity"
              />
            </a>

            {/* Nav links olib tashlandi — global menu tugmasi orqali boshqariladi */}
          </div>

        </motion.nav>
      )}

      {/* ─── Tezkor linklar + til almashtirgich — menu tugmasi yonida ─── */}
      {/* Projects sahifasida to'liq ekran layout uchun tezkor linklar yashiriladi,
          lekin til almashtirgich barcha sahifalarda, jumladan projects'da ham ko'rinishi kerak. */}
      {currentPage !== "boshqaruv" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="fixed top-[14px] md:top-6 right-[5.5rem] z-[60] h-11 flex items-center gap-4 md:gap-6"
        >
          {currentPage !== "projects" && (
            <div className="hidden md:flex items-center gap-6">
              {[
                { label: t("Xizmatlar", "Услуги"), href: "#services" },
                { label: t("HR", "HR"), href: "#hr" },
                { label: t("Aloqa", "Контакты"), href: "#contact" },
              ].map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  style={{ fontFamily: 'var(--font-body)', textDecoration: 'none' }}
                  className={`tracking-[0.15em] uppercase text-xs transition-colors whitespace-nowrap ${
                    currentPage === item.href.slice(1)
                      ? 'text-[#060920] font-medium'
                      : 'text-[#060920]/60 hover:text-[#060920]'
                  }`}
                >
                  {item.label}
                </a>
              ))}
            </div>
          )}

          {/* UZ / RU til almashtirgich */}
          <div
            className="flex items-center rounded-full border border-[#060920]/20 overflow-hidden bg-white/80 backdrop-blur-sm"
            style={{ fontFamily: 'var(--font-body)' }}
          >
            <button
              onClick={() => setLang("uz")}
              aria-pressed={lang === "uz"}
              className={`px-2.5 py-1 text-xs tracking-[0.1em] transition-colors ${lang === "uz" ? "bg-[#060920] text-white" : "text-[#060920]/55 hover:text-[#060920]"}`}
            >
              UZ
            </button>
            <button
              onClick={() => setLang("ru")}
              aria-pressed={lang === "ru"}
              className={`px-2.5 py-1 text-xs tracking-[0.1em] transition-colors ${lang === "ru" ? "bg-[#060920] text-white" : "text-[#060920]/55 hover:text-[#060920]"}`}
            >
              RU
            </button>
          </div>
        </motion.div>
      )}

      {/* ─── Global fixed menu button — always visible, top-right ─── */}
      {currentPage !== "boshqaruv" && currentPage !== "projects" && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsGlobalMenuOpen((v) => !v)}
          aria-label={t("Navigatsiya menyusi", "Меню навигации")}
          className="fixed top-[14px] md:top-6 right-6 z-[60] flex flex-col items-center justify-center gap-[5px] w-11 h-11 rounded-full bg-[#060920] shadow-[0_4px_20px_-4px_rgba(6,9,32,0.45)] transition-shadow hover:shadow-[0_8px_28px_-4px_rgba(6,9,32,0.55)]"
        >
          <AnimatePresence mode="wait">
            {isGlobalMenuOpen ? (
              <motion.span
                key="close"
                initial={{ rotate: -45, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 45, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-white text-lg leading-none select-none"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                ×
              </motion.span>
            ) : (
              <motion.div
                key="bars"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col items-center gap-[5px]"
              >
                <span className="block w-4 h-[1.5px] bg-white rounded-full" />
                <span className="block w-4 h-[1.5px] bg-white rounded-full" />
                <span className="block w-2.5 h-[1.5px] bg-white/60 rounded-full self-start ml-[3px]" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      )}

      {/* ─── Global menu overlay panel ─── */}
      <AnimatePresence>
        {isGlobalMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setIsGlobalMenuOpen(false)}
              className="fixed inset-0 z-[55] bg-[#060920]/40 backdrop-blur-sm"
            />

            {/* Slide-in panel from top-right */}
            <motion.div
              key="panel"
              initial={{ opacity: 0, x: 40, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-16 md:top-20 right-6 z-[58] w-[min(72vw,288px)] md:w-72 bg-[#060920] rounded-3xl shadow-[0_24px_64px_-12px_rgba(6,9,32,0.7)] overflow-hidden"
            >
              {/* Panel header */}
              <div className="px-6 pt-6 pb-4 border-b border-white/10">
                <p
                  style={{ fontFamily: 'var(--font-body)' }}
                  className="text-xs tracking-[0.2em] uppercase text-white/40"
                >
                  {t("BARPO — Navigatsiya", "Навигация")}
                </p>
              </div>

              {/* Nav links */}
              <nav className="px-3 py-3">
                {allNavItems.map((item, i) => {
                  const pageKey = item.href.slice(1);
                  const isActive = currentPage === pageKey;
                  return (
                    <motion.a
                      key={item.label}
                      ref={i === 0 ? firstNavLinkRef : undefined}
                      href={item.href}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, delay: 0.05 + i * 0.04 }}
                      onClick={() => setIsGlobalMenuOpen(false)}
                      style={{ fontFamily: 'var(--font-body)', textDecoration: 'none' }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                        isActive
                          ? 'bg-white/10 text-white'
                          : 'text-white/60 hover:bg-white/[0.07] hover:text-white'
                      }`}
                    >
                      <span className="text-white/30 text-[10px] w-3 shrink-0">{item.icon}</span>
                      <span className="text-sm tracking-[0.08em] uppercase">{item.label}</span>
                      {isActive && (
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
                      )}
                    </motion.a>
                  );
                })}
              </nav>
              
              {/* Panel footer */}
              <div className="px-6 py-4 border-t border-white/10">
                <p
                  style={{ fontFamily: 'var(--font-body)' }}
                  className="text-[10px] tracking-[0.15em] uppercase text-white/20"
                >
                  barpo.uz
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Page Content — lazy sahifalar chunk yuklanguncha oq parda ko'rsatiladi */}
      <Suspense fallback={<div className="fixed inset-0 z-[30] bg-white" />}>
        {renderPage()}
      </Suspense>

      {/* Footer — bosh sahifa (o'zi ko'rsatadi) va admin'dan tashqari barcha sahifalarda */}
      {currentPage !== "home" && currentPage !== "boshqaruv" && currentPage !== "projects" && <Footer />}
    </>
  );
}
