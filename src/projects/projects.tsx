import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { SoftDivider } from "../app/components/SoftDivider";
import { BarpoWord, barpo } from "../app/components/Barpo";

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

export function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/projects")
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setProjects(json.projects || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative bg-white pt-32">
      {/* Hero */}
      <section className="relative min-h-[40vh] flex items-center justify-center px-8 md:px-16 py-20">
        <div className="max-w-4xl w-full mx-auto text-center space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 4rem)', color: '#060920' }}
            className="tracking-tight"
          >
            Har obyekt — bu bajarilgan ish emas. Bu boshqarilgan jarayon.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ fontFamily: 'var(--font-body)', color: '#060920' }}
            className="text-lg opacity-70 max-w-2xl mx-auto"
          >
            Har bir obyekt <BarpoWord /> uchun alohida mas'uliyat. Biz loyihalarni faqat suratlar orqali emas, jarayon, yechim, murakkablik va natija orqali ko'rsatamiz.
          </motion.p>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="relative py-16 px-8 md:px-16">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div style={{ fontFamily: 'var(--font-body)' }} className="text-center py-16 text-[#060920]/40 tracking-wide animate-pulse">
              <BarpoWord /> etilyapti...
            </div>
          ) : projects.length === 0 ? (
            <div style={{ fontFamily: 'var(--font-body)' }} className="text-center py-16 text-[#060920]/40 tracking-wide">
              Hozircha loyihalar qo'shilmagan. Tez orada yangilanadi.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project, i) => (
                <motion.a
                  key={project.id}
                  href={`#project-${project.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.7, delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="rounded-3xl overflow-hidden bg-white shadow-[0_12px_32px_-12px_rgba(6,9,32,0.20)] hover:shadow-[0_18px_44px_-12px_rgba(6,9,32,0.28)] transition-shadow group cursor-pointer flex flex-col"
                >
                  {/* Rasm (bo'lsa) */}
                  {project.hasImage && (
                    <div className="aspect-[4/3] bg-[#060920]/5 overflow-hidden">
                      <img
                        src={`/api/project-image?id=${project.id}`}
                        alt={project.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}

                  {/* Matn */}
                  <div className="p-7 flex flex-col flex-1">
                    <div className="w-fit">
                      <h3 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl text-[#060920]">
                        {barpo(project.name)}
                      </h3>
                      <SoftDivider className="mt-3" />
                    </div>

                    {/* Yo'nalish, hudud, ish turi, muddat, rol */}
                    {(project.direction || project.location || project.workType || project.duration || project.role) && (
                      <div style={{ fontFamily: 'var(--font-body)' }} className="mt-4 space-y-1 text-sm">
                        {project.direction && (
                          <p className="text-[#060920]/60">
                            <span className="text-[#060920]/40 uppercase tracking-wide text-xs">Yo'nalish:</span> {project.direction}
                          </p>
                        )}
                        {project.location && (
                          <p className="text-[#060920]/60">
                            <span className="text-[#060920]/40 uppercase tracking-wide text-xs">Hudud:</span> {project.location}
                          </p>
                        )}
                        {project.workType && (
                          <p className="text-[#060920]/60">
                            <span className="text-[#060920]/40 uppercase tracking-wide text-xs">Ish turi:</span> {project.workType}
                          </p>
                        )}
                        {project.duration && (
                          <p className="text-[#060920]/60">
                            <span className="text-[#060920]/40 uppercase tracking-wide text-xs">Muddat:</span> {project.duration}
                          </p>
                        )}
                        {project.role && (
                          <p className="text-[#060920]/60">
                            <span className="text-[#060920]/40 uppercase tracking-wide text-xs"><BarpoWord /> roli:</span> {barpo(project.role)}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Vazifa / Yechim / Natija */}
                    <div className="mt-4 space-y-3 flex-1">
                      {project.task && (
                        <div style={{ fontFamily: 'var(--font-body)' }}>
                          <p className="text-[#060920]/40 uppercase tracking-wide text-xs mb-0.5">Vazifa</p>
                          <p className="text-sm text-[#060920]/65 leading-relaxed line-clamp-2">{barpo(project.task)}</p>
                        </div>
                      )}
                      {project.solution && (
                        <div style={{ fontFamily: 'var(--font-body)' }}>
                          <p className="text-[#060920]/40 uppercase tracking-wide text-xs mb-0.5"><BarpoWord /> yechimi</p>
                          <p className="text-sm text-[#060920]/65 leading-relaxed line-clamp-2">{barpo(project.solution)}</p>
                        </div>
                      )}
                      {project.result && (
                        <div style={{ fontFamily: 'var(--font-body)' }}>
                          <p className="text-[#060920]/40 uppercase tracking-wide text-xs mb-0.5">Natija</p>
                          <p className="text-sm text-[#060920]/65 leading-relaxed line-clamp-2">{barpo(project.result)}</p>
                        </div>
                      )}
                      {/* Yangi maydonlar bo'lmasa — eski tavsif ko'rinadi */}
                      {!project.task && !project.solution && !project.result && (
                        <p style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/65 leading-relaxed">
                          {project.description
                            ? barpo(project.description)
                            : [project.location, project.area, project.year].filter(Boolean).join(" · ")}
                        </p>
                      )}
                    </div>

                    <SoftDivider className="mt-5 mb-4 max-w-none" />
                    <span style={{ fontFamily: 'var(--font-display)' }} className="text-lg text-[#060920] group-hover:opacity-60 transition-opacity">
                      Batafsil ko'rish →
                    </span>
                  </div>
                </motion.a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA 1 */}
      <section className="relative py-16 px-8 md:px-16 bg-[#060920]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: '#FFFFFF' }}
            className="tracking-tight"
          >
            Loyihangizni tizim bilan boshlang
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ fontFamily: 'var(--font-body)' }}
            className="text-white/55 text-base max-w-xl mx-auto leading-relaxed"
          >
            Qurilishdagi eng to'g'ri qaror — ish boshlanishidan oldin aniq tizim yaratish.
          </motion.p>
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ fontFamily: 'var(--font-body)', textDecoration: 'none' }}
            className="inline-block px-8 py-3 bg-white text-[#060920] tracking-[0.15em] uppercase text-sm font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            Loyihani muhokama qilish
          </motion.a>
        </div>
      </section>
    </div>
  );
}
