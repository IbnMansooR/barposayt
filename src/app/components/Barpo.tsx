import logo from "../../assets/logo.png";

// "BARPO" so'zi o'rniga logo rasmini chiqaradi (matn ichida inline).
export function BarpoWord({ className = "" }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="BARPO"
      className={`inline-block h-[0.8em] w-auto align-[-0.08em] ${className}`}
    />
  );
}
