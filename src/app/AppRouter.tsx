import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import App from "./App";
import { ServicesPage } from "../services/services";
import { StandardPage } from "../standart/standard";
import { CulturePage } from "../standart/culture";
import { ProjectsPage } from "../projects/projects";
import { ProjectDetailPage } from "../projects/projectDetail";
import { ContactPage } from "../contacts/contacts";
import { AboutPage } from "../about/about";
import { HRPage } from "../hr/hr";
import { TakliflarPage } from "../takliflar/takliflar";
import { AdminPage } from "../admin/admin";
import { JarayonPage } from "../jarayon/jarayon";
import { OrnamentDetailPage } from "../standart/ornamentDetail";
import { FoydaPage } from "../foyda/foyda";
import { Footer } from "./components/Footer";

import logo from '../assets/logo.png';

export function AppRouter() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isGlobalMenuOpen, setIsGlobalMenuOpen] = useState(false);

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

  // Close global menu on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsGlobalMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // All pages for global menu
  const allNavItems = [
    { label: "Bosh sahifa", href: "#home", icon: "◆" },
    { label: "Xizmatlar", href: "#services", icon: "◈" },
    { label: "Madaniyat", href: "#culture", icon: "◇" },
    { label: "Loyihalar", href: "#projects", icon: "◉" },
    { label: "Jarayon", href: "#jarayon", icon: "◎" },
    { label: "Iqtisodiy foyda", href: "#foyda", icon: "◍" },
    { label: "Haqimizda", href: "#about", icon: "◐" },
    { label: "Standart", href: "#standard", icon: "◑" },
    { label: "HR", href: "#hr", icon: "◒" },
    { label: "Takliflar", href: "#takliflar", icon: "◓" },
    { label: "Aloqa", href: "#contact", icon: "◔" },
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

    switch (currentPage) {
      case "services":
        return <ServicesPage />;
      case "culture":
        return <CulturePage />;
      case "standard":
        return <StandardPage />;
      case "projects":
        return <ProjectsPage />;
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
      case "boshqaruv":
        return <AdminPage />;
      case "home":
      default:
        return <App />;
    }
  };

  // Admin sahifasida va bosh sahifada asosiy navigatsiya ko'rsatilmaydi
  // (bosh sahifa o'zining navigatsiyasiga ega)
  const showNav = currentPage !== "home" && currentPage !== "boshqaruv";

  return (
    <>
      {showNav && (
        <motion.nav
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="fixed top-0 left-0 right-0 z-40 px-8 md:px-16 py-8 bg-white/95 backdrop-blur-sm border-b border-[#060920]/10"
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

      {/* ─── Tezkor linklar — menu tugmasi yonida ─── */}
      {currentPage !== "boshqaruv" && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="fixed top-6 right-[5.5rem] z-[60] h-11 hidden md:flex items-center gap-6"
        >
          {[
            { label: "Xizmatlar", href: "#services" },
            { label: "HR", href: "#hr" },
            { label: "Aloqa", href: "#contact" },
          ].map((item) => (
            <a
              key={item.label}
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
        </motion.div>
      )}

      {/* ─── Global fixed menu button — always visible, top-right ─── */}
      {currentPage !== "boshqaruv" && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={() => setIsGlobalMenuOpen((v) => !v)}
          aria-label="Navigatsiya menyusi"
          className="fixed top-6 right-6 z-[60] flex flex-col items-center justify-center gap-[5px] w-11 h-11 rounded-full bg-[#060920] shadow-[0_4px_20px_-4px_rgba(6,9,32,0.45)] transition-shadow hover:shadow-[0_8px_28px_-4px_rgba(6,9,32,0.55)]"
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
              className="fixed top-20 right-6 z-[58] w-72 bg-[#060920] rounded-3xl shadow-[0_24px_64px_-12px_rgba(6,9,32,0.7)] overflow-hidden"
            >
              {/* Panel header */}
              <div className="px-6 pt-6 pb-4 border-b border-white/10">
                <p
                  style={{ fontFamily: 'var(--font-body)' }}
                  className="text-xs tracking-[0.2em] uppercase text-white/40"
                >
                  BARPO — Navigatsiya
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

      {/* Page Content */}
      {renderPage()}

      {/* Footer — bosh sahifa (o'zi ko'rsatadi) va admin'dan tashqari barcha sahifalarda */}
      {currentPage !== "home" && currentPage !== "boshqaruv" && <Footer />}
    </>
  );
}
