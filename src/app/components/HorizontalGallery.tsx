import { useRef, useEffect, ReactNode, Children } from "react";
import { useT } from "../i18n";

/**
 * Sheron "Batafsil" overlay'idagi AYNAN gorizontal scroll mexanizmi.
 * - g'ildirak / touch -> GORIZONTAL harakat (lerp bilan smooth)
 * - rasm PARALLAX (slayd markazga nisbatan suriladi)
 * - to'liq ekran; global vertikal Lenis to'xtatiladi (Sheron home.js: window.lenis.stop())
 * - yopish (×) -> #home
 *
 * reverse=true -> QARAMA-QARSHI yo'nalish: slaydlar o'ngdan boshlanadi, scroll chapga
 * progress qiladi (loyihalar=normal, takliflar=reverse).
 *
 * Manba: Sheron klon assets/js/home.js (.side-overlay + horizontal Lenis).
 */
export function HorizontalGallery({
  count,
  children,
  reverse = false,
}: {
  count: number;
  children: ReactNode;
  reverse?: boolean;
}) {
  const t = useT();
  const wrapRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const target = useRef(0);
  const current = useRef(0);
  const max = useRef(0);

  useEffect(() => {
    const wrap = wrapRef.current;
    const strip = stripRef.current;
    if (!wrap || !strip) return;

    // Global vertikal Lenis'ni to'xtatamiz (Sheron kabi)
    const lenis = (window as any).__barpoLenis;
    if (lenis && lenis.stop) lenis.stop();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let inited = false;
    const recalc = () => {
      max.current = Math.max(0, strip.scrollWidth - window.innerWidth);
      // reverse: o'ng chetdan boshlanadi (birinchi mantiqiy slayd = o'ngda)
      if (reverse && !inited && max.current > 0) {
        current.current = max.current;
        target.current = max.current;
        inited = true;
      }
    };
    recalc();
    const settle = setTimeout(recalc, 250);
    const ro = new ResizeObserver(recalc);
    ro.observe(strip);
    window.addEventListener("resize", recalc);

    const clamp = (v: number) => Math.min(max.current, Math.max(0, v));
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const d = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      target.current = clamp(target.current + (reverse ? -d : d));
    };
    wrap.addEventListener("wheel", onWheel, { passive: false });

    let tx = 0;
    const onTS = (e: TouchEvent) => { tx = e.touches[0].clientX; };
    const onTM = (e: TouchEvent) => {
      const x = e.touches[0].clientX;
      const dd = (tx - x) * 1.6;
      target.current = clamp(target.current + (reverse ? -dd : dd));
      tx = x;
    };
    wrap.addEventListener("touchstart", onTS, { passive: true });
    wrap.addEventListener("touchmove", onTM, { passive: true });

    const imgEls = Array.from(strip.querySelectorAll<HTMLElement>("[data-parallax]"));
    let raf = 0;
    const loop = () => {
      current.current += (target.current - current.current) * 0.09;
      if (Math.abs(target.current - current.current) < 0.08) current.current = target.current;
      strip.style.transform = `translate3d(${-current.current}px,0,0)`;
      const vw = window.innerWidth;
      for (const img of imgEls) {
        const box = img.parentElement;
        if (!box) continue;
        const rect = box.getBoundingClientRect();
        const off = (rect.left + rect.width / 2 - vw / 2) / vw;
        const c = Math.max(-1.5, Math.min(1.5, off));
        img.style.transform = `translate3d(${-c * 8}%,0,0) scale(1.16)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settle);
      ro.disconnect();
      window.removeEventListener("resize", recalc);
      wrap.removeEventListener("wheel", onWheel);
      wrap.removeEventListener("touchstart", onTS);
      wrap.removeEventListener("touchmove", onTM);
      document.body.style.overflow = prevOverflow;
      if (lenis && lenis.start) lenis.start();
    };
  }, [count, reverse]);

  const ordered = reverse ? Children.toArray(children).reverse() : children;

  return (
    <div ref={wrapRef} className="relative w-full h-screen overflow-hidden bg-white" style={{ touchAction: "none" }}>
      <div ref={stripRef} className="flex h-full will-change-transform" style={{ width: "max-content" }}>
        {ordered}
      </div>

      {/* Yopish */}
      <a
        href="#home"
        aria-label="Yopish"
        className="absolute top-6 right-6 z-50 w-12 h-12 rounded-full bg-[#060920] text-white flex items-center justify-center shadow-[0_6px_24px_-6px_rgba(6,9,32,0.6)] hover:scale-110 transition-transform"
        style={{ fontFamily: "var(--font-display)", textDecoration: "none", fontSize: "1.4rem", lineHeight: 1 }}
      >
        ×
      </a>

      {/* Scroll ishorasi */}
      <div
        className="absolute bottom-7 left-1/2 -translate-x-1/2 z-40 text-[#060920]/45 text-xs tracking-[0.3em] uppercase select-none pointer-events-none"
        style={{ fontFamily: "var(--font-body)" }}
      >
        ←&nbsp;&nbsp;{t("aylantiring", "листайте")}&nbsp;&nbsp;→
      </div>
    </div>
  );
}
