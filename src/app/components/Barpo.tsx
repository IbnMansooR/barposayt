import logoDark from "../../assets/Logo dark night.png"; // #060920 (to'q) matn joylari uchun
import logoLight from "../../assets/oqlogo.png";          // oq matn joylari uchun

// "BARPO" so'zi o'rniga logo rasmini chiqaradi (matn ichida inline).
// light=true -> oq fon ustidagi (oq matnli) joylar uchun oq logo
export function BarpoWord({ light = false, className = "" }: { light?: boolean; className?: string }) {
  return (
    <img
      src={light ? logoLight : logoDark}
      alt="BARPO"
      className={`inline-block h-[0.8em] w-auto align-[-0.08em] ${className}`}
    />
  );
}

// Matn (string) ichidagi har bir "BARPO" so'zini logo bilan almashtiradi.
// JSX ichida {barpo(text)} yoki {barpo(text, true)} (oq logo) ko'rinishida ishlatiladi.
export function barpo(text: unknown, light = false): React.ReactNode {
  if (text == null) return text as React.ReactNode;
  const parts = String(text).split(/(BARPO)/g);
  return parts.map((p, i) => (p === "BARPO" ? <BarpoWord key={i} light={light} /> : p));
}
