import logoDark from "../../assets/Logo dark night.png"; // #060920 (to'q) matn joylari uchun
import logoLight from "../../assets/oqlogo.png";          // oq matn joylari uchun
import { useLang } from "../i18n";

// "BARPO" so'zi o'rniga logo rasmini chiqaradi (matn ichida inline).
// light=true -> oq fon ustidagi (oq matnli) joylar uchun oq logo
// MUHIM: rus tilida matn ichidagi logo umuman chiqarilmaydi (boshliq qarori).
// Logo faqat o'zbek tilida matn ichida ko'rinadi; logo joylari (header/footer/hero)
// to'g'ridan-to'g'ri <img> ishlatadi, ular ikkala tilda ham o'zgarmaydi.
export function BarpoWord({ light = false, className = "" }: { light?: boolean; className?: string }) {
  const { lang } = useLang();
  if (lang === "ru") return null;
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
// Rus tilida BarpoWord null qaytargani uchun "BARPO" bo'lagi ko'rinmaydi.
export function barpo(text: unknown, light = false): React.ReactNode {
  if (text == null) return text as React.ReactNode;
  const parts = String(text).split(/(BARPO)/g);
  return parts.map((p, i) => (p === "BARPO" ? <BarpoWord key={i} light={light} /> : p));
}
