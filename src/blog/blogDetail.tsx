import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { SoftDivider } from "../app/components/SoftDivider";
import { barpo } from "../app/components/Barpo";
import { useT } from "../app/i18n";

interface Article {
  id: string;
  title: string;
  rubric: string;
  content: string;
  hasImage?: boolean;
  publishedAt?: string | null;
  titleRu?: string;
  rubricRu?: string;
  contentRu?: string;
}

export function BlogDetailPage({ id }: { id: string }) {
  const t = useT();
  const bi = (uz: string, ru?: string) => t(uz, ru || uz);
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    window.scrollTo(0, 0);
    fetch(`/api/blog?id=${id}`)
      .then((r) => r.json())
      .then((j) => {
        if (cancelled) return;
        setArticle(j.ok ? j.article : null);
      })
      .catch(() => {
        if (!cancelled) setArticle(null);
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
        <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/40 tracking-wide animate-pulse">{t("Yuklanmoqda...", "Загрузка...")}</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="relative bg-white pt-32 min-h-screen flex flex-col items-center justify-center px-8 text-center gap-5">
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "#060920" }}>{t("Maqola topilmadi", "Статья не найдена")}</h1>
        <a href="#blog" style={{ fontFamily: "var(--font-body)", textDecoration: "none" }}
          className="inline-block px-6 py-3 bg-[#060920] text-white tracking-[0.15em] uppercase text-sm rounded-2xl hover:shadow-xl transition-all">
          ← {t("Bilim markazi", "Центр знаний")}
        </a>
      </div>
    );
  }

  const paras = bi(article.content || "", article.contentRu).split("\n").map((s) => s.trim()).filter(Boolean);

  return (
    <div className="relative bg-white pt-32 min-h-screen">
      <article className="max-w-3xl mx-auto px-8 md:px-16 py-10">
        {/* Orqaga */}
        <motion.a
          href="#blog"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ fontFamily: "var(--font-body)", textDecoration: "none" }}
          className="inline-block mb-8 text-sm text-[#060920]/60 hover:text-[#060920] tracking-[0.15em] uppercase transition-colors"
        >
          ← {t("Bilim markazi", "Центр знаний")}
        </motion.a>

        {/* Rubrika */}
        {article.rubric && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ fontFamily: "var(--font-body)" }}
            className="text-xs tracking-[0.2em] uppercase text-[#060920]/50 mb-4"
          >
            {barpo(bi(article.rubric, article.rubricRu))}
          </motion.p>
        )}

        {/* Sarlavha */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.05 }}
          style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.9rem, 4.5vw, 3rem)", color: "#060920" }}
          className="tracking-tight leading-[1.15] mb-6"
        >
          {barpo(bi(article.title, article.titleRu))}
        </motion.h1>

        <SoftDivider className="mb-10" />

        {/* Rasm */}
        {article.hasImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="rounded-2xl overflow-hidden mb-10 border border-[#060920]/10"
          >
            <img src={`/api/blog-image?id=${article.id}`} alt={article.title} className="w-full object-cover" />
          </motion.div>
        )}

        {/* Matn */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="space-y-5"
        >
          {paras.length > 0 ? paras.map((para, i) => (
            <p key={i} style={{ fontFamily: "var(--font-body)" }} className="text-lg text-[#060920]/75 leading-relaxed">
              {barpo(para)}
            </p>
          )) : (
            <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/40">{t("Maqola matni hali to'ldirilmagan.", "Текст статьи ещё не заполнен.")}</p>
          )}
        </motion.div>

        {/* CTA */}
        <div className="mt-14 border-t border-[#060920]/10 pt-10 text-center">
          <a href="#contact" style={{ fontFamily: "var(--font-body)", textDecoration: "none" }}
            className="inline-block px-8 py-3 bg-[#060920] text-white tracking-[0.15em] uppercase text-sm font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all">
            {t("Loyihangizni muhokama qilish", "Обсудить ваш проект")}
          </a>
        </div>
      </article>
    </div>
  );
}
