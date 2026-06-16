import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import logoWhite from "../../assets/oqlogo.png";

/**
 * BARPO loading screen — to'q fon, aylanuvchi gradient halqa, markazda logo.
 * ~2.2s dan keyin yoki sahifa to'liq yuklanganda silliq yo'qoladi.
 */
export function Preloader() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      setHidden(true);
    };
    const t = setTimeout(finish, 2200);
    window.addEventListener("load", finish);
    return () => {
      clearTimeout(t);
      window.removeEventListener("load", finish);
    };
  }, []);

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 flex items-center justify-center bg-[#060920]"
          style={{ zIndex: 99999 }}
        >
          <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
            <motion.div
              className="absolute inset-0"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
            >
              <svg viewBox="0 0 160 160" className="w-full h-full">
                <defs>
                  <linearGradient id="barpo-preloader-ring" x1="0" y1="0" x2="1" y2="1" gradientUnits="objectBoundingBox">
                    <stop offset="0" stopColor="#F5F3EF" />
                    <stop offset="1" stopColor="#060920" />
                  </linearGradient>
                </defs>
                <circle cx="80" cy="80" r="76" fill="none" stroke="url(#barpo-preloader-ring)" strokeWidth="2.5" />
              </svg>
            </motion.div>
            <motion.img
              src={logoWhite}
              alt="BARPO"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="relative"
              style={{ width: 82, height: "auto" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
