import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { SoftDivider } from "../app/components/SoftDivider";

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
  process?: string;
  result?: string;
  description: string;
  details: string;
  features: string;
  hasImage?: boolean;
}

export function ProjectDetailPage({ id }: { id: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    window.scrollTo(0, 0);
    fetch(`/api/projects?id=${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.ok && json.project) setProject(json.project);
        else setNotFound(true);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="pt-32 min-h-screen flex items-center justify-center">
        <div style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/40 tracking-wide animate-pulse">
          Barpo etilyapti...
        </div>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="pt-32 min-h-screen flex flex-col items-center justify-center px-8 text-center gap-6">
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: '#060920' }}>
          Loyiha topilmadi
        </div>
        <a
          href="#projects"
          style={{ fontFamily: 'var(--font-body)' }}
          className="px-6 py-3 bg-[#060920] text-white tracking-[0.15em] uppercase text-sm rounded-2xl hover:shadow-lg transition-all"
        >
          ← Barcha loyihalar
        </a>
      </div>
    );
  }

  const meta = [
    { label: "Yo'nalish", value: project.direction },
    { label: "Hudud", value: project.location },
    { label: "Ish turi", value: project.workType },
    { label: "Maydon", value: project.area },
    { label: "Muddat", value: project.duration },
    { label: "BARPO roli", value: project.role },
    { label: "Yil", value: project.year },
    { label: "Holati", value: project.status },
  ].filter((m) => m.value);

  const tsr = [
    { label: "Vazifa", value: project.task },
    { label: "Murakkablik", value: project.problem },
    { label: "BARPO yechimi", value: project.solution },
    { label: "Jarayon", value: project.process },
    { label: "Natija", value: project.result },
  ].filter((m) => m.value);

  const detailParas = (project.details || "").split("\n").map((s) => s.trim()).filter(Boolean);
  const featureList = (project.features || "").split("\n").map((s) => s.trim()).filter(Boolean);

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
          ← Barcha loyihalar
        </motion.a>

        {/* Sarlavha */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="space-y-4 mb-10"
        >
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#060920' }} className="tracking-tight leading-[1.1]">
            {project.name}
          </h1>
          {project.description && (
            <p style={{ fontFamily: 'var(--font-body)' }} className="text-lg text-[#060920]/70 leading-relaxed max-w-2xl">
              {project.description}
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
            <img src={`/api/project-image?id=${project.id}`} alt={project.name} className="w-full object-cover" />
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
              <div key={m.label} className="bg-white p-5">
                <div style={{ fontFamily: 'var(--font-body)' }} className="text-xs tracking-[0.15em] uppercase text-[#060920]/40 mb-1">
                  {m.label}
                </div>
                <div style={{ fontFamily: 'var(--font-display)' }} className="text-[#060920]">
                  {m.value}
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
              <div key={m.label}>
                <div className="w-fit mb-3">
                  <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-xl text-[#060920] mb-3">
                    {m.label}
                  </h2>
                  <SoftDivider />
                </div>
                <p style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/75 leading-relaxed max-w-2xl">
                  {m.value}
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
                Loyiha haqida
              </h2>
              <SoftDivider />
            </div>
            {detailParas.map((p, i) => (
              <p key={i} style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/75 leading-relaxed">
                {p}
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
                Asosiy ko'rsatkichlar
              </h2>
              <SoftDivider />
            </div>
            <div className="space-y-3">
              {featureList.map((f, i) => (
                <div key={i} className="flex gap-4 items-start">
                  <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#060920]/40 flex-shrink-0" />
                  <span style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/75 leading-relaxed">
                    {f}
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
            Investor sifatida obyekt qurmoqchimisiz?
          </h3>
          <p
            style={{ fontFamily: 'var(--font-body)' }}
            className="text-[#060920]/60 text-base max-w-lg mx-auto leading-relaxed"
          >
            Biz sizga obyektni faqat qurilish nuqtayi nazaridan emas, biznes va ekspluatatsiya samaradorligi nuqtayi nazaridan ham ko'rib chiqishga yordam beramiz.
          </p>
          <a
            href="#contact"
            style={{ fontFamily: 'var(--font-body)', textDecoration: 'none' }}
            className="inline-block px-8 py-3 bg-[#060920] text-white tracking-[0.15em] uppercase text-sm font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            Investorlar uchun maslahat olish
          </a>
        </div>
      </div>
    </div>
  );
}
