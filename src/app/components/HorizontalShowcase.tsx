import { useRef, useState, useEffect, ReactNode } from "react";
import { motion, useScroll, useTransform } from "motion/react";

/**
 * Sheron uslubidagi gorizontal showcase: VERTIKAL scroll -> GORIZONTAL harakat.
 * Tashqi section baland (100vh + masofa); ichidagi qism sticky (pinned) bo'lib,
 * scroll davomida slaydlar chapga suriladi. Lenis bilan smooth ishlaydi.
 * Sahifaning qolgan (vertikal, funksional) qismi shu section'dan keyin davom etadi.
 *
 * count — slaydlar soni (ma'lumot yuklangach qayta o'lchash uchun dependency).
 */
export function HorizontalShowcase({ count, children }: { count: number; children: ReactNode }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (!stripRef.current) return;
      const d = stripRef.current.scrollWidth - window.innerWidth;
      setDistance(d > 0 ? d : 0);
    };
    measure();
    // rasm/layout o'rnashgach yana o'lchaymiz
    const id = setTimeout(measure, 300);
    window.addEventListener("resize", measure);
    return () => { clearTimeout(id); window.removeEventListener("resize", measure); };
  }, [count]);

  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);

  return (
    <section ref={sectionRef} style={{ height: `calc(100vh + ${distance}px)` }} className="relative">
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        <motion.div
          ref={stripRef}
          style={{ x }}
          className="flex gap-6 md:gap-8 px-8 md:px-16 will-change-transform"
        >
          {children}
        </motion.div>
      </div>
    </section>
  );
}
