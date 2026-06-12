import { motion } from "motion/react";
import { ReactNode } from "react";

interface FloorSectionProps {
  floorNumber: number;
  title: string;
  subtitle: string;
  description: string;
  children?: ReactNode;
  alignment?: "left" | "right" | "center";
  showFloorNumber?: boolean;
  image?: string;
}

export function FloorSection({
  floorNumber,
  title,
  subtitle,
  description,
  children,
  alignment = "center",
  showFloorNumber = true,
  image,
}: FloorSectionProps) {
  const isCenter = alignment === "center";
  const isLeft = alignment === "left";

  return (
    <section className="relative min-h-screen flex items-center justify-center px-8 md:px-16">
      <div className="max-w-7xl w-full mx-auto">
        <div className={`flex flex-col ${isCenter ? "items-center text-center" : `md:flex-row items-start gap-12 md:gap-24 ${isLeft ? "" : "md:flex-row-reverse"}`}`}>
          {/* Content side */}
          <motion.div
            initial={{ opacity: 0, x: isCenter ? 0 : isLeft ? -40 : 40, y: isCenter ? 30 : 0 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className={`space-y-6 ${isCenter ? "w-full max-w-3xl" : "flex-1 max-w-xl"}`}
          >
            {/* Subtitle */}
            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.9, delay: 0.3 }}
                className="opacity-60 tracking-wide text-sm"
                style={{ fontFamily: 'var(--font-body)' }}
              >
                {subtitle}
              </motion.p>
            )}

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 1, delay: 0.4 }}
              className="leading-[1.2] tracking-tight"
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(2.5rem, 5vw, 4rem)'
              }}
            >
              {title}
            </motion.h2>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 1, delay: 0.5 }}
              className="leading-relaxed tracking-wide opacity-70 max-w-lg"
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
                letterSpacing: '0.02em'
              }}
            >
              {description}
            </motion.p>

            {/* Additional content */}
            {children && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 1, delay: 0.6 }}
              >
                {children}
              </motion.div>
            )}
          </motion.div>

          {/* Image or Spacer */}
          {!isCenter && (
            image ? (
              <motion.div
                initial={{ opacity: 0, x: isLeft ? 40 : -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, margin: "-100px" }}
                transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                className="flex-1 relative h-80 md:h-full min-h-80 flex items-center justify-center rounded-3xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#060920]/5 to-[#060920]/0 rounded-3xl"></div>
                <img 
                  src={image} 
                  alt={title} 
                  className="w-full h-full object-cover rounded-3xl"
                />
              </motion.div>
            ) : (
              <div className="hidden md:block flex-1 h-80 md:h-full min-h-80" />
            )
          )}
        </div>
      </div>

      {/* Decorative line */}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: false }}
        transition={{ duration: 1.5, delay: 0.7 }}
        className={`absolute bottom-24 ${isLeft ? "left-8" : "right-8"} w-32 h-[1px] bg-[#060920]/20 origin-${isLeft ? "left" : "right"}`}
      />
    </section>
  );
}
