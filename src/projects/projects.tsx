import { useState, useEffect } from "react";
import { barpo } from "../app/components/Barpo";
import { useT } from "../app/i18n";
import { HorizontalGallery } from "../app/components/HorizontalGallery";

interface Project {
  id: string;
  name: string;
  direction?: string;
  location: string;
  area: string;
  year: string;
  status: string;
  workType?: string;
  duration?: string;
  role?: string;
  task?: string;
  problem?: string;
  solution?: string;
  result?: string;
  description: string;
  hasImage?: boolean;
}

// Panel ranglari navbatma-navbat (Sheron uslubi: to'q va och tonlar almashinadi)
// #060920 (navy) qoladi, qolgani oq (foydalanuvchi: navy joyida, boshqa fonlar oq)
const PANELS = [
  { bg: "#060920", fg: "#FFFFFF" }, // navy
  { bg: "#FFFFFF", fg: "#060920" }, // oq
];

export function ProjectsPage() {
  const t = useT();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

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
              : projects.length === 0
                ? t("Hozircha loyihalar qo'shilmagan", "Пока проекты не добавлены")
                : `→ ${projects.length} ${t("loyiha", "проект")}`}
          </div>
        </div>
      </div>

      {/* Loyiha slaydlari: yarim ekran rasm + rangli matn paneli (navbatma-navbat) */}
      {projects.map((p, i) => {
        const panel = PANELS[i % PANELS.length];
        const reverse = i % 2 === 1;
        return (
          <div
            key={p.id}
            className={`h-full flex shrink-0 ${reverse ? "flex-row-reverse" : ""}`}
            style={{ width: "100vw" }}
          >
            {/* Rasm tomoni */}
            <div className="relative h-full overflow-hidden shrink-0" style={{ width: "58vw" }}>
              {p.hasImage ? (
                <img
                  data-parallax
                  src={`/api/project-image?id=${p.id}`}
                  alt={p.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transform: "scale(1.16)" }}
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
                  {p.direction}
                </div>
              )}
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.75rem, 2.8vw, 3rem)" }} className="mt-3 leading-tight">
                {barpo(p.name)}
              </h2>
              <div className="mt-5 h-px w-16" style={{ background: panel.fg, opacity: 0.35 }} />
              <p style={{ fontFamily: "var(--font-body)", opacity: 0.82 }} className="mt-6 leading-relaxed max-w-md">
                {barpo(p.description || [p.location, p.area, p.year].filter(Boolean).join(" · "))}
              </p>
              {(p.location || p.area || p.year) && (
                <div style={{ fontFamily: "var(--font-body)", opacity: 0.55 }} className="mt-4 text-sm tracking-wide">
                  {[p.location, p.area, p.year].filter(Boolean).join("  ·  ")}
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
