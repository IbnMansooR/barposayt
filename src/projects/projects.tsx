import { useState, useEffect } from "react";
import { barpo } from "../app/components/Barpo";
import { useT } from "../app/i18n";
import { HorizontalGallery } from "../app/components/HorizontalGallery";

interface Project {
  id: string;
  name: string;
  nameRu?: string;
  direction?: string;
  directionRu?: string;
  location: string;
  locationRu?: string;
  area: string;
  areaRu?: string;
  year: string;
  status: string;
  statusRu?: string;
  workType?: string;
  workTypeRu?: string;
  duration?: string;
  durationRu?: string;
  role?: string;
  roleRu?: string;
  task?: string;
  taskRu?: string;
  problem?: string;
  problemRu?: string;
  solution?: string;
  solutionRu?: string;
  result?: string;
  resultRu?: string;
  description: string;
  descriptionRu?: string;
  hasImage?: boolean;
}

// Panel ranglari navbatma-navbat (Sheron uslubi: to'q va och tonlar almashinadi)
// #060920 (navy) qoladi, qolgani oq (foydalanuvchi: navy joyida, boshqa fonlar oq)
const PANELS = [
  { bg: "#060920", fg: "#FFFFFF" }, // navy
  { bg: "#FFFFFF", fg: "#060920" }, // oq
];

// Rus tilida sanoq so'zi songa qarab o'zgaradi (проект/проекта/проектов)
function ruProject(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "проект";
  if ([2, 3, 4].includes(mod10) && ![12, 13, 14].includes(mod100)) return "проекта";
  return "проектов";
}

export function ProjectsPage() {
  const t = useT();
  const bi = (uz: string, ru?: string) => t(uz || "", ru || uz || "");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((json) => {
        // Faqat admin'dan boshqariladigan haqiqiy loyihalar (demo yo'q)
        if (json.ok) setProjects(json.projects || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Loyiha yo'q (yoki hali yuklanmoqda) — Barpo loading screen: favicon markazda, halqa aylanadi
  if (projects.length === 0) {
    return (
      <div className="relative w-full h-screen flex flex-col items-center justify-center bg-white">
        <a
          href="#home"
          aria-label={t("Yopish", "Закрыть")}
          className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-[#060920] text-white flex items-center justify-center hover:scale-110 transition-transform"
          style={{ fontFamily: "var(--font-display)", textDecoration: "none", fontSize: "1.4rem", lineHeight: 1 }}
        >
          ×
        </a>

        <div className="relative flex items-center justify-center" style={{ width: 170, height: 170 }}>
          {/* aylanuvchi halqa */}
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: "1.15s" }}>
            <svg viewBox="0 0 170 170" className="w-full h-full">
              <defs>
                <linearGradient id="barpo-proj-ring" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#060920" />
                  <stop offset="1" stopColor="#060920" stopOpacity="0" />
                </linearGradient>
              </defs>
              <circle cx="85" cy="85" r="81" fill="none" stroke="url(#barpo-proj-ring)" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          {/* markazda favicon (qimirlamaydi) */}
          <img src="/favicon.png" alt="BARPO" className="relative select-none" style={{ width: 96, height: "auto" }} />
        </div>

        <div style={{ fontFamily: "var(--font-display)" }} className="mt-9 text-2xl md:text-3xl text-[#060920] tracking-wide">
          {t("Barpo etyapmiz", "Созидаем")}
        </div>
        <div style={{ fontFamily: "var(--font-body)" }} className="mt-3 text-[#060920]/45 text-xs tracking-[0.25em] uppercase">
          {t("Loyihalar tez orada", "Проекты скоро")}
        </div>
      </div>
    );
  }

  return (
    <HorizontalGallery count={projects.length + 1}>
      {/* Intro slayd */}
      <div className="h-full flex items-center shrink-0" style={{ width: "min(88vw, 780px)" }}>
        <div className="px-10 md:px-20">
          <div style={{ fontFamily: "var(--font-body)" }} className="text-xs tracking-[0.3em] uppercase text-[#060920]/50">
            {t("LOYIHALAR", "ПРОЕКТЫ")}
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3.5rem)", color: "#060920" }} className="mt-5 leading-tight">
            {t("Har obyekt — boshqarilgan jarayon", "Каждый объект — управляемый процесс")}
          </h1>
          <p style={{ fontFamily: "var(--font-body)" }} className="mt-6 text-[#060920]/65 leading-relaxed max-w-md">
            {t("Biz loyihalarni suratlar orqali emas — jarayon, yechim va natija orqali ko'rsatamiz.", "Мы показываем проекты не через фотографии, а через процесс, решение и результат.")}
          </p>
          <div style={{ fontFamily: "var(--font-body)" }} className="mt-8 text-[#060920]/40 text-xs tracking-[0.25em] uppercase">
            {loading
              ? t("Yuklanmoqda...", "Загрузка...")
              : `→ ${projects.length} ${t("loyiha", ruProject(projects.length))}`}
          </div>
        </div>
      </div>

      {/* Loyiha slaydlari: yarim ekran rasm + rangli matn paneli (navbatma-navbat) */}
      {projects.map((p, i) => {
        const panel = PANELS[i % PANELS.length];
        const reverse = i % 2 === 1;
        const imgFailed = imgErrors[p.id];
        return (
          <div
            key={p.id}
            className={`h-full flex shrink-0 ${reverse ? "flex-row-reverse" : ""}`}
            style={{ width: "100vw" }}
          >
            {/* Rasm tomoni */}
            <div className="relative h-full overflow-hidden shrink-0" style={{ width: "58vw" }}>
              {p.hasImage && !imgFailed ? (
                <img
                  data-parallax
                  src={`/api/project-image?id=${p.id}`}
                  alt={p.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transform: "scale(1.16)" }}
                  onError={() => setImgErrors((prev) => ({ ...prev, [p.id]: true }))}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-[#060920]/[0.05]">
                  <span style={{ fontFamily: "var(--font-display)" }} className="text-[#060920]/12 text-7xl md:text-8xl tracking-wider">
                    BARPO
                  </span>
                </div>
              )}
            </div>

            {/* Panel tomoni */}
            <div
              className="h-full flex flex-col justify-center px-10 md:px-16 shrink-0"
              style={{ width: "42vw", background: panel.bg, color: panel.fg }}
            >
              {p.direction && (
                <div style={{ fontFamily: "var(--font-body)" }} className="text-xs tracking-[0.25em] uppercase opacity-60">
                  {bi(p.direction, p.directionRu)}
                </div>
              )}
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 2.8vw, 3rem)" }} className="mt-3 leading-tight">
                {barpo(bi(p.name, p.nameRu))}
              </h2>
              <div className="mt-5 h-px w-16" style={{ background: panel.fg, opacity: 0.35 }} />
              <p style={{ fontFamily: "var(--font-body)", opacity: 0.82 }} className="mt-6 leading-relaxed max-w-md">
                {barpo(bi(p.description, p.descriptionRu) || [bi(p.location, p.locationRu), bi(p.area, p.areaRu), p.year].filter(Boolean).join(" · "))}
              </p>
              {(p.location || p.area || p.year) && (
                <div style={{ fontFamily: "var(--font-body)", opacity: 0.55 }} className="mt-4 text-sm tracking-wide">
                  {[bi(p.location, p.locationRu), bi(p.area, p.areaRu), p.year].filter(Boolean).join(" · ")}
                </div>
              )}
              <a
                href={`#project-${p.id}`}
                style={{ fontFamily: "var(--font-body)", color: panel.fg, textDecoration: "none" }}
                className="mt-8 inline-flex items-center gap-2 text-sm tracking-[0.15em] uppercase opacity-90 hover:gap-3 hover:opacity-100 transition-all"
              >
                {t("Batafsil ko'rish", "Подробнее")} →
              </a>
            </div>
          </div>
        );
      })}
    </HorizontalGallery>
  );
}
