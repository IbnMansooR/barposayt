import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { SoftDivider } from "../app/components/SoftDivider";
import { BarpoWord, barpo } from "../app/components/Barpo";
import { useT } from "../app/i18n";

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
  process?: string;
  processRu?: string;
  result?: string;
  resultRu?: string;
  description: string;
  descriptionRu?: string;
  details: string;
  detailsRu?: string;
  features: string;
  featuresRu?: string;
  hasImage?: boolean;
}

export function ProjectDetailPage({ id }: { id: string }) {
  const t = useT();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    setFetchFailed(false);
    setImgFailed(false);
    window.scrollTo(0, 0);
    fetch(`/api/projects?id=${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return;
        if (json.ok && json.project) setProject(json.project);
        else setNotFound(true);
      })
      .catch(() => {
        if (cancelled) return;
        setFetchFailed(true);
      })
      .finally(() => {
        if (cancelled) return;
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id, retryCount]);

  if (loading) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <div style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/40 tracking-wide animate-pulse">
          {t("Yuklanmoqda...", "Загрузка...")}
        </div>
      </div>
    );
  }

  if (fetchFailed) {
    return (
      <div className="pt-32 min-h-screen flex flex-col items-center justify-center px-8 text-center gap-6">
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#060920' }}>
          {t("Serverga ulanib bo'lmadi", "Не удалось подключиться к серверу")}
        </div>
        <p style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/60 max-w-md">
          {t("Internet aloqasini tekshiring va qayta urinib ko'ring.", "Проверьте подключение к интернету и попробуйте снова.")}
        </p>
        <button
          type="button"
          onClick={() => setRetryCount((c) => c + 1)}
          style={{ fontFamily: 'var(--font-body)' }}
          className="px-6 py-3 bg-[#060920] text-white tracking-[0.15em] uppercase text-sm rounded-2xl hover:shadow-lg transition-all"
        >
          {t("Qayta urinish", "Повторить")}
        </button>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="pt-32 min-h-screen flex flex-col items-center justify-center px-8 text-center gap-6">
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#060920' }}>
          {t("Loyiha topilmadi", "Проект не найден")}
        </div>
        <a
          href="#projects"
          style={{ fontFamily: 'var(--font-body)' }}
          className="px-6 py-3 bg-[#060920] text-white tracking-[0.15em] uppercase text-sm rounded-2xl hover:shadow-lg transition-all"
        >
          ← {t("Barcha loyihalar", "Все проекты")}
        </a>
      </div>
    );
  }

  // Uz/Ru juftlikdagi maydon: Ru bo'sh bo'lsa Uz qiymatga qaytadi
  const bi = (uz?: string, ru?: string) => t(uz || "", ru || uz || "");

  const meta = [
    { id: "direction", label: t("Yo'nalish", "Направление"), value: bi(project.direction, project.directionRu) },
    { id: "location", label: t("Hudud", "Регион"), value: bi(project.location, project.locationRu) },
    { id: "workType", label: t("Ish turi", "Тип работ"), value: bi(project.workType, project.workTypeRu) },
    { id: "area", label: t("Maydon", "Площадь"), value: bi(project.area, project.areaRu) },
    { id: "duration", label: t("Muddat", "Срок"), value: bi(project.duration, project.durationRu) },
    { id: "role", label: t("BARPO roli", "Наша роль"), value: bi(project.role, project.roleRu) },
    { id: "year", label: t("Yil", "Год"), value: project.year },
    { id: "status", label: t("Holati", "Статус"), value: bi(project.status, project.statusRu) },
  ].filter((m) => m.value);

  const tsr = [
    { id: "task", label: t("Vazifa", "Задача"), value: bi(project.task, project.taskRu) },
    { id: "problem", label: t("Murakkablik", "Сложность"), value: bi(project.problem, project.problemRu) },
    { id: "solution", label: t("BARPO yechimi", "Наше решение"), value: bi(project.solution, project.solutionRu) },
    { id: "process", label: t("Jarayon", "Процесс"), value: bi(project.process, project.processRu) },
    { id: "result", label: t("Natija", "Результат"), value: bi(project.result, project.resultRu) },
  ].filter((m) => m.value);

  const detailParas = (bi(project.details, project.detailsRu) || "").split("\n").map((s) => s.trim()).filter(Boolean);
  const featureList = (bi(project.features, project.featuresRu) || "").split("\n").map((s) => s.trim()).filter(Boolean);

  return (
    <div className="relative bg-white pt-32 min-h-screen">
      <div className="max-w-4xl mx-auto px-8 md:px-16 py-10">
        {/* Orqaga */}
        <motion.a
          href="#projects"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ fontFamily: 'var(--font-body)' }}
          className="inline-block mb-10 text-sm text-[#060920]/60 hover:text-[#060920] tracking-[0.15em] uppercase transition-colors"
        >
          ← {t("Barcha loyihalar", "Все проекты")}
        </motion.a>

        {/* Sarlavha */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-4 mb-10"
        >
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#060920' }} className="tracking-tight leading-[1.1]">
            {barpo(bi(project.name, project.nameRu))}
          </h1>
          {project.description && (
            <p style={{ fontFamily: 'var(--font-body)' }} className="text-lg text-[#060920]/70 leading-relaxed max-w-2xl">
              {barpo(bi(project.description, project.descriptionRu))}
            </p>
          )}
        </motion.div>

        {/* Rasm */}
        {project.hasImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="rounded-2xl overflow-hidden mb-12 border border-[#060920]/10"
          >
            {imgFailed ? (
              <div className="w-full aspect-video flex items-center justify-center bg-[#060920]/[0.05]">
                <span style={{ fontFamily: 'var(--font-display)' }} className="text-[#060920]/12 text-7xl md:text-8xl tracking-wider">
                  BARPO
                </span>
              </div>
            ) : (
              <img
                src={`/api/project-image?id=${project.id}`}
                alt={bi(project.name, project.nameRu)}
                className="w-full object-cover"
                onError={() => setImgFailed(true)}
              />
            )}
          </motion.div>
        )}

        {/* Meta ma'lumotlar */}
        {meta.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[#060920]/10 border border-[#060920]/10 rounded-2xl overflow-hidden mb-12"
          >
            {meta.map((m) => (
              <div key={m.id} className="bg-white p-5">
                <div style={{ fontFamily: 'var(--font-body)' }} className="text-xs tracking-[0.15em] uppercase text-[#060920]/40 mb-1">
                  {barpo(m.label)}
                </div>
                <div style={{ fontFamily: 'var(--font-display)' }} className="text-[#060920]">
                  {barpo(m.value)}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* Vazifa / BARPO yechimi / Natija */}
        {tsr.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.18 }}
            className="space-y-8 mb-12"
          >
            {tsr.map((m) => (
              <div key={m.id}>
                <div className="w-fit mb-3">
                  <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-xl text-[#060920] mb-3">
                    {barpo(m.label)}
                  </h2>
                  <SoftDivider />
                </div>
                <p style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/75 leading-relaxed max-w-2xl">
                  {barpo(m.value)}
                </p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Batafsil matn */}
        {detailParas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="space-y-5 mb-12"
          >
            <div className="w-fit mb-4">
              <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl text-[#060920] mb-3">
                {t("Loyiha haqida", "О проекте")}
              </h2>
              <SoftDivider />
            </div>
            {detailParas.map((p, i) => (
              <p key={i} style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/75 leading-relaxed">
                {barpo(p)}
              </p>
            ))}
          </motion.div>
        )}

        {/* Xususiyatlar */}
        {featureList.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mb-12"
          >
            <div className="w-fit mb-5">
              <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl text-[#060920] mb-3">
                {t("Asosiy ko'rsatkichlar", "Ключевые показатели")}
              </h2>
              <SoftDivider />
            </div>
            <div className="space-y-3">
              {featureList.map((f, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#060920]/40 flex-shrink-0" />
                  <span style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/75 leading-relaxed">
                    {barpo(f)}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* CTA 2 */}
        <div className="mt-16 border border-[#060920]/10 rounded-3xl p-8 md:p-12 text-center space-y-5 bg-white">
          <h3
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.25rem, 3vw, 2rem)', color: '#060920' }}
            className="tracking-tight"
          >
            {t("Investor sifatida obyekt qurmoqchimisiz?", "Хотите построить объект как инвестор?")}
          </h3>
          <p
            style={{ fontFamily: 'var(--font-body)' }}
            className="text-[#060920]/60 text-base max-w-lg mx-auto leading-relaxed"
          >
            {t(
              "Biz sizga obyektni faqat qurilish nuqtayi nazaridan emas, biznes va ekspluatatsiya samaradorligi nuqtayi nazaridan ham ko'rib chiqishga yordam beramiz.",
              "Мы поможем вам рассмотреть объект не только с точки зрения строительства, но и с точки зрения бизнеса и эффективности эксплуатации.",
            )}
          </p>
          <a
            href="#contact"
            style={{ fontFamily: 'var(--font-body)', textDecoration: 'none' }}
            className="inline-block px-8 py-3 bg-[#060920] text-white tracking-[0.15em] uppercase text-sm font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            {t("Investorlar uchun maslahat olish", "Получить консультацию для инвесторов")}
          </a>
        </div>
      </div>
    </div>
  );
}
