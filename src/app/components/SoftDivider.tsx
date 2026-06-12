// Ingichka, minimalistik chiziqcha: o'rtasi to'q, chetga qarab shaffof.
// w-fit ichiga o'ralganda sarlavha matni kengligiga moslashadi.
export function SoftDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-px w-full ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#060920]/70 to-transparent" />
      <div className="absolute inset-x-0 top-[1.5px] h-px blur-[1px] bg-gradient-to-r from-transparent via-[#060920]/25 to-transparent" />
    </div>
  );
}
