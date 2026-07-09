import { motion } from "motion/react";
import { ReactNode } from "react";
import { barpo } from "./Barpo";
import { useFloorImage } from "../sectionImages";

interface FloorSectionProps {
  floorNumber: number;
  title: string;
  subtitle: string;
  description: string;
  children?: ReactNode;
  alignment?: "left" | "right" | "center";
  image?: string;
}

export function FloorSection({
  floorNumber,
  title,
  description,
  children,
  alignment = "center",
  image,
}: FloorSectionProps) {
  const isCenter = alignment === "center";
  const isLeft = alignment === "left";
  const ctxImage = useFloorImage(floorNumber);
  const finalImage = image || ctxImage;

  // Matn bloki (uchala layoutda ham ishlatiladi)
  const textBlock = (
    <motion.div
      initial={{ opacity: 0, x: isCenter ? 0 : isLeft ? -40 : 40, y: isCenter ? 30 : 0 }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className={`space-y-6 w-full ${isCenter ? "max-w-3xl mx-auto text-center" : "max-w-2xl"}`}
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.4 }}
        className="leading-[1.2] tracking-tight text-[clamp(1.375rem,7vw,1.875rem)] md:text-[clamp(2rem,3.5vw,3.5rem)]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {barpo(title)}
      </motion.h2>

      {description && (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
          className="leading-relaxed tracking-wide opacity-70"
          style={{ fontFamily: 'var(--font-body)', fontSize: 'clamp(1rem, 1.3vw, 1.2rem)', letterSpacing: '0.02em' }}
        >
          {barpo(description)}
        </motion.p>
      )}

      {children && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.6 }}
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );

  // ── Rasmli (markaziy bo'lmagan) floor ──
  if (!isCenter && finalImage) {
    return (
      <section className="relative min-h-screen flex flex-col md:flex-row overflow-x-clip">
        {/* Rasm — mobil: 42vh, desktop: to'liq balandlik */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className={`relative w-full h-[42vh] md:h-auto md:w-1/2 overflow-hidden ${isLeft ? "md:order-2" : "md:order-1"}`}
        >
          <motion.img
            src={finalImage}
            alt={title}
            loading="lazy"
            decoding="async"
            initial={{ scale: 1.12 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </motion.div>

        {/* Matn yarmi */}
        <div className={`w-full md:w-1/2 flex items-center px-8 md:px-14 py-12 md:py-16 ${isLeft ? "md:order-1" : "md:order-2"}`}>
          {textBlock}
        </div>
      </section>
    );
  }

  // ── Markaziy yoki rasmsiz floor ──
  return (
    <section className="relative min-h-screen flex items-center justify-center px-5 md:px-16 py-14 md:py-20 overflow-x-clip">
      <div className="max-w-7xl w-full mx-auto">
        {isCenter ? (
          <div className="flex flex-col items-center text-center">{textBlock}</div>
        ) : (
          <div className={`flex flex-col md:flex-row items-start gap-12 md:gap-24 ${isLeft ? "" : "md:flex-row-reverse"}`}>
            {textBlock}
            <div className="hidden md:block flex-1 min-h-80" />
          </div>
        )}
      </div>
    </section>
  );
}
