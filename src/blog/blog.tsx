import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { SoftDivider } from "../app/components/SoftDivider";

interface Article {
  id: string;
  title: string;
  rubric: string;
  content: string;
  hasImage?: boolean;
  publishedAt?: string | null;
}

export function BlogPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/blog")
      .then((r) => r.json())
      .then((j) => { if (j.ok) setArticles(j.articles || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Rubrika bo'yicha guruhlash (tartibni saqlab)
  const rubrics: { title: string; items: Article[] }[] = [];
  for (const a of articles) {
    const key = a.rubric || "Boshqa";
    let g = rubrics.find((x) => x.title === key);
    if (!g) { g = { title: key, items: [] }; rubrics.push(g); }
    g.items.push(a);
  }

  return (
    <div className="relative bg-white pt-32">
      {/* Hero */}
      <section className="px-8 md:px-16 pt-12 pb-12 text-center">
        <div className="max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ fontFamily: "var(--font-body)" }}
            className="text-sm tracking-[0.2em] uppercase text-[#060920]/50 mb-4"
          >
            BILIM MARKAZI
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 4rem)", color: "#060920" }}
            className="tracking-tight leading-[1.1]"
          >
            Qurilish haqida gapirmaymiz. Qurilish qanday ishlashini tushuntiramiz.
          </motion.h1>
        </div>
      </section>

      {/* Maqolalar */}
      <section className="px-8 md:px-16 py-12">
        <div className="max-w-5xl mx-auto">
          {loading ? (
            <p style={{ fontFamily: "var(--font-body)" }} className="text-center text-[#060920]/40 tracking-wide py-10 animate-pulse">
              Yuklanmoqda...
            </p>
          ) : articles.length === 0 ? (
            <p style={{ fontFamily: "var(--font-body)" }} className="text-center text-[#060920]/40 tracking-wide py-10">
              Hozircha chop etilgan maqola yo'q. Tez orada yangilanadi.
            </p>
          ) : (
            <div className="space-y-14">
              {rubrics.map((rub, ri) => (
                <motion.div
                  key={rub.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, margin: "-60px" }}
                  transition={{ duration: 0.7, delay: ri * 0.05 }}
                >
                  <div className="w-fit mb-6">
                    <h2 style={{ fontFamily: "var(--font-display)" }} className="text-2xl md:text-3xl text-[#060920]">{rub.title}</h2>
                    <SoftDivider className="mt-3" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {rub.items.map((a) => (
                      <a
                        key={a.id}
                        href={`#blog-${a.id}`}
                        style={{ textDecoration: "none" }}
                        className="block bg-white rounded-2xl border border-[#060920]/10 hover:border-[#060920]/25 hover:shadow-[0_14px_36px_-12px_rgba(6,9,32,0.18)] transition-all overflow-hidden group cursor-pointer"
                      >
                        {a.hasImage && (
                          <div className="h-40 bg-[#060920]/5 overflow-hidden">
                            <img src={`/api/blog-image?id=${a.id}`} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                        )}
                        <div className="p-6">
                          <h3 style={{ fontFamily: "var(--font-display)" }} className="text-lg text-[#060920] leading-snug group-hover:opacity-70 transition-opacity">
                            {a.title}
                          </h3>
                          <span style={{ fontFamily: "var(--font-body)" }} className="mt-3 inline-block text-xs tracking-[0.15em] uppercase text-[#060920]/50">
                            O'qish →
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 px-8 md:px-16 bg-[#060920]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 4vw, 2.5rem)", color: "#FFFFFF" }} className="tracking-tight">
            Savolingiz bormi? Mutaxassislarimiz javob beradi.
          </h2>
          <a href="#contact" style={{ fontFamily: "var(--font-body)", textDecoration: "none" }}
            className="inline-block px-8 py-3 bg-white text-[#060920] tracking-[0.15em] uppercase text-sm font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all">
            Bog'lanish
          </a>
        </div>
      </section>
    </div>
  );
}
