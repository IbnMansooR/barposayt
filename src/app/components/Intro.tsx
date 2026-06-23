import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import renderImg from "../../assets/render.webp";
import renderMobImg from "../../assets/render-mob.webp";
import cloudImg from "../../assets/cloud.png";
import logoWhite from "../../assets/oqlogo.png";
import { useT } from "../i18n";

/**
 * Kirish (intro) — loading screen kabi bir martalik fixed parda.
 * IKKI BOSQICHLI scroll:
 *   1-scroll -> render PANORAMA bir marta pan bo'ladi (tepadan pastga).
 *   2-scroll -> parda ko'tarilib sayt ochiladi (DOM'dan o'chadi, qaytib bo'lmaydi).
 * Bitta scroll gesturasi ikkalasini tetiklamasligi uchun cooldown bor.
 * Desktop/planshet: render.jpg, mobil: render-mob.jpg.
 */
export function Intro() {
  const t = useT();
  const [phase, setPhase] = useState<0 | 1 | 2>(0); // 0=boshlang'ich, 1=pan, 2=kirish
  const [gone, setGone] = useState(false);
  const lockRef = useRef(0);

  useEffect(() => {
    if (gone) return;
    const intent = () => {
      const now = Date.now();
      if (now < lockRef.current) return; // cooldown — ayni gesturani e'tiborsiz qoldir
      if (phase === 0) {
        lockRef.current = now + 1200; // 1-scroll: pan boshlanadi, ~1.2s blok
        setPhase(1);
      } else if (phase === 1) {
        setPhase(2); // 2-scroll: saytga kirish
      }
    };
    const onWheel = (e: WheelEvent) => { if (e.deltaY > 0) intent(); };
    const onKey = (e: KeyboardEvent) => {
      if (["ArrowDown", "PageDown", " ", "Enter"].indexOf(e.key) >= 0) intent();
    };
    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("touchmove", intent, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("click", intent);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", intent);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", intent);
    };
  }, [phase, gone]);

  // Parda turganda sahifa scroll'ini bloklash
  useEffect(() => {
    document.body.style.overflow = gone ? "" : "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [gone]);

  // Parda ko'rinib turganda homepage smooth-scroll (Lenis) ni qulflab turamiz.
  // Lenis body.overflow:hidden ni inobatga olmaydi — shu sabab introdagi scroll
  // bosh sahifani bir necha floor pastga surib yuborardi. Parda ketganda sahifani
  // tepaga qaytarib Lenis'ni qayta yoqamiz (sayt har doim Floor 1 dan boshlanadi).
  useEffect(() => {
    if (!gone) {
      let raf = 0;
      const lock = () => {
        const lenis = (window as any).__barpoLenis;
        if (lenis) { lenis.scrollTo(0, { immediate: true }); lenis.stop(); return; }
        raf = requestAnimationFrame(lock); // Lenis hali tayyor bo'lmasa, kutamiz
      };
      lock();
      return () => {
        cancelAnimationFrame(raf);
        // Parda gone bo'lmasdan unmount bo'lsa (masalan to'g'ridan-to'g'ri URL bilan
        // boshqa sahifaga o'tish) — Lenis qotib qolmasligi uchun qayta yoqamiz.
        const lenis = (window as any).__barpoLenis;
        if (lenis) lenis.start();
      };
    }
    const lenis = (window as any).__barpoLenis;
    if (lenis) { lenis.start(); lenis.scrollTo(0, { immediate: true }); }
    else { window.scrollTo(0, 0); }
  }, [gone]);

  // Kirish bosqichida (2) pardani olib tashlash (fallback)
  useEffect(() => {
    if (phase !== 2) return;
    const tm = setTimeout(() => setGone(true), 1300);
    return () => clearTimeout(tm);
  }, [phase]);

  if (gone) return null;

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: phase === 2 ? "-100%" : 0 }}
      transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
      onAnimationComplete={() => { if (phase === 2) setGone(true); }}
      className="fixed inset-0 overflow-hidden bg-[#060920]"
      style={{ zIndex: 9998 }}
    >
      {/* Panorama pan — faqat 1-scroll'dan keyin (phase>=1) bir marta ishlaydi */}
      <style>{`
        @keyframes barpoPanorama {
          0%   { object-position: center 0%; }
          100% { object-position: center 100%; }
        }
        .barpo-pan { animation: barpoPanorama 4.5s ease-in-out forwards; }
        .barpo-cloud { position:absolute; left:0; width:100%; top:calc(100svh - 25vw); z-index:2; transform:translateY(0); transition:transform 3s ease-in-out; }
        .barpo-cloud.rise { transform:translateY(-100vw); }
        @media (max-width:767px){ .barpo-cloud.rise { transform:translateY(-250vw); } }
      `}</style>

      <div className="absolute inset-0">
        <img
          src={renderImg}
          alt=""
          fetchPriority="high"
          decoding="async"
          className={"hidden md:block w-full h-full object-cover " + (phase >= 1 ? "barpo-pan" : "")}
          style={{ objectPosition: "center 0%" }}
        />
        <img
          src={renderMobImg}
          alt=""
          fetchPriority="high"
          decoding="async"
          className={"md:hidden w-full h-full object-cover " + (phase >= 1 ? "barpo-pan" : "")}
          style={{ objectPosition: "center 0%" }}
        />
        <div className="absolute inset-0 bg-[#060920]/15" />
      </div>

      {/* bulut — Sheron uslubi: pastda turadi, 1-scroll'da yuqoriga ko'tariladi (3s) */}
      <img
        src={cloudImg}
        alt=""
        className={"barpo-cloud pointer-events-none select-none " + (phase >= 1 ? "rise" : "")}
      />

      {/* markazda logo */}
      <motion.img
        src={logoWhite}
        alt="BARPO"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, delay: 2.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 select-none h-auto"
        style={{ width: "clamp(170px, 26vw, 400px)" }}
      />

      {/* aylantirish ishorasi (bosqichga qarab matn o'zgaradi) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 3.2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span
          style={{ fontFamily: "var(--font-body)" }}
          className={"text-white/90 " + (phase === 0 ? "text-xs tracking-[0.2em] uppercase" : "text-lg md:text-xl tracking-[0.15em] font-light")}
        >
          {phase === 0
            ? t("Pastga aylantiring", "Прокрутите вниз")
            : t("Yangi qurilish madaniyati", "Новая культура строительства")}
        </span>
        <motion.div animate={{ y: [0, 9, 0] }} transition={{ duration: 1.6, repeat: Infinity }} className="w-[1px] h-9 bg-white/70" />
      </motion.div>
    </motion.div>
  );
}
