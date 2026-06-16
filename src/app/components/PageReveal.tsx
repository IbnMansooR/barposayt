import { useState, useEffect, ReactNode } from "react";

/**
 * Sahifa ochilish pardasi — GORIZONTAL.
 * Parda = oq, chap va o'ng chetida 30px navy (#060920) chiziq (navy→oq→navy).
 * Parda gorizontal suriladi: loyihalar o'ngdan chapga (dir="left", translateX -100%),
 * takliflar chapdan o'ngga (dir="right", translateX +100%) — qarama-qarshi.
 *
 * Yakuniy holat React state'ga bog'langan (CSS transition) — animatsiya
 * ishlamasa ham parda chetga ketadi va o'chadi (sahifa hech qachon yopiq qolmaydi).
 */
export function PageReveal({ dir = "left", children }: { dir?: "left" | "right"; children: ReactNode }) {
  const [lifting, setLifting] = useState(false);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setLifting(true), 60);
    const t2 = setTimeout(() => setGone(true), 1150);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const off = dir === "right" ? "translateX(100%)" : "translateX(-100%)";

  return (
    <div className="relative" style={{ minHeight: "100vh", background: "#FFFFFF" }}>
      {children}
      {!gone && (
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            transform: lifting ? off : "translateX(0)",
            transition: "transform 0.9s cubic-bezier(0.76, 0, 0.24, 1)",
            // 30px navy chapda + oq + 30px navy o'ngda (gorizontal)
            background:
              "linear-gradient(to right, #060920 0px, #060920 30px, #FFFFFF 30px, #FFFFFF calc(100% - 30px), #060920 calc(100% - 30px), #060920 100%)",
            willChange: "transform",
          }}
        />
      )}
    </div>
  );
}
