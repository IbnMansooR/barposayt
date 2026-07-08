import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useT } from "../app/i18n";

type Ornament = {
  id: string;
  old: string;
  new: string;
  desc: string;
  history?: string;
  hasImage?: boolean;
  oldRu?: string;
  newRu?: string;
  descRu?: string;
  historyRu?: string;
};

export function OrnamentDetailPage({ id }: { id: string }) {
  const t = useT();
  const bi = (uz: string, ru?: string) => t(uz, ru || uz);
  const [ornament, setOrnament] = useState<Ornament | null>(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setImgError(false);
    fetch("/api/ornaments")
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        if (j.ok) {
          const found = (j.ornaments || []).find((o: Ornament) => o.id === id);
          setOrnament(found || null);
        }
      })
      .catch(() => {
        if (!cancelled) setOrnament(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="relative bg-white pt-32 min-h-screen flex items-center justify-center">
        <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/40 tracking-wide">
          {t("Yuklanmoqda...", "Загрузка...")}
        </p>
      </div>
    );
  }

  if (!ornament) {
    return (
      <div className="relative bg-white pt-32 min-h-screen flex items-center justify-center px-8">
        <div className="text-center space-y-5">
          <h1 style={{ fontFamily: "var(--font-display)", color: "#060920" }} className="text-2xl tracking-tight">
            {t("Naqsh topilmadi", "Орнамент не найден")}
          </h1>
          <a
            href="#culture"
            style={{ fontFamily: "var(--font-body)", textDecoration: "none" }}
            className="inline-block px-8 py-3 bg-[#060920] text-white tracking-[0.15em] uppercase text-sm rounded-2xl hover:shadow-xl transition-all"
          >
            ← {t("Madaniyatga qaytish", "Вернуться к культуре")}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-white pt-32 min-h-screen">
      <div className="max-w-5xl mx-auto px-8 md:px-16 pb-24">
        {/* Back link */}
        <motion.a
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          href="#culture"
          style={{ fontFamily: "var(--font-body)", textDecoration: "none" }}
          className="inline-block mb-10 text-sm tracking-[0.15em] uppercase text-[#060920]/60 hover:text-[#060920] transition-colors"
        >
          ← {t("Tarixiy aloqa", "Историческая связь")}
        </motion.a>

        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ fontFamily: "var(--font-display)" }}
          className="text-sm tracking-[0.15em] uppercase text-[#060920]/50 mb-4"
        >
          {t("Tarixiy aloqa — Naqsh", "Историческая связь — Орнамент")}
        </motion.p>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            color: "#060920",
          }}
          className="tracking-tight mb-12"
        >
          {bi(ornament.old, ornament.oldRu)}
        </motion.h1>

        {/* Full image — butun ko'rinishda */}
        {ornament.hasImage && !imgError && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="mb-14 rounded-3xl overflow-hidden bg-white border border-[#060920]/10"
          >
            <img
              src={`/api/ornament-image?id=${ornament.id}`}
              alt={bi(ornament.old, ornament.oldRu)}
              className="w-full h-auto object-contain"
              onError={() => setImgError(true)}
            />
          </motion.div>
        )}

        {/* Description */}
        {ornament.desc && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-10"
          >
            <div className="w-fit mb-4">
              <h2 style={{ fontFamily: "var(--font-display)", color: "#060920" }} className="text-xl tracking-tight">
                {t("Ma'nosi", "Значение")}
              </h2>
              <div className="mt-3 h-[1px] w-full bg-[#060920]/20" />
            </div>
            <p style={{ fontFamily: "var(--font-body)" }} className="text-lg text-[#060920]/65 leading-relaxed max-w-3xl">
              {bi(ornament.desc, ornament.descRu)}
            </p>
          </motion.div>
        )}

        {/* History */}
        {ornament.history && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mb-14"
          >
            <div className="w-fit mb-4">
              <h2 style={{ fontFamily: "var(--font-display)", color: "#060920" }} className="text-xl tracking-tight">
                {t("Tarixi", "История")}
              </h2>
              <div className="mt-3 h-[1px] w-full bg-[#060920]/20" />
            </div>
            <p style={{ fontFamily: "var(--font-body)" }} className="text-lg text-[#060920]/65 leading-relaxed max-w-3xl whitespace-pre-line">
              {bi(ornament.history, ornament.historyRu)}
            </p>
          </motion.div>
        )}

        {/* Back CTA */}
        <div className="border-t border-[#060920]/10 pt-10">
          <a
            href="#culture"
            style={{ fontFamily: "var(--font-body)", textDecoration: "none" }}
            className="inline-block px-8 py-3 bg-[#060920] text-white tracking-[0.15em] uppercase text-sm font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            ← {t("Barcha naqshlar", "Все орнаменты")}
          </a>
        </div>
      </div>
    </div>
  );
}
