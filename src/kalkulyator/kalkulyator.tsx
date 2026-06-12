import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SoftDivider } from "../app/components/SoftDivider";

interface Answers {
  type: string;
  area: string;
  projectReady: string;
  brigades: string;
  shortDeadline: string;
  engineering: string;
  finishLevel: string;
  material: string;
}

const initial: Answers = {
  type: "", area: "", projectReady: "", brigades: "",
  shortDeadline: "", engineering: "", finishLevel: "", material: "",
};

function computeRisks(a: Answers): string[] {
  const risks: string[] = [];
  if (a.projectReady === "yo'q") risks.push("Loyihaviy noaniqlik — qaror almashuvi va qayta ishlash xavfi.");
  if (a.shortDeadline === "ha") risks.push("Muddat cho'zilishi va shoshilishdan kelib chiqadigan sifat xavfi.");
  if (a.brigades === "3+" || a.brigades === "2") risks.push("Brigadalar koordinatsiyasi va bir zonada to'qnashuv xavfi.");
  if (a.engineering === "ha") risks.push("Muhandislik va pardoz kelishmovchiligi xavfi.");
  if (a.material === "o'zim") risks.push("Material kechikishi va ta'minot uzilishi xavfi.");
  if (a.area === "katta") risks.push("Katta hajm — nazorat va koordinatsiya murakkablashishi.");
  if (a.finishLevel === "premium") risks.push("Yuqori pardoz talabi — qattiq sifat nazorati zarurati.");
  // Har doim:
  risks.push("Muntazam hisobot bo'lmasa — jarayon ustidan nazorat yo'qolishi xavfi.");
  return risks;
}

const FIELDS: { name: keyof Answers; label: string; options: string[] }[] = [
  { name: "type", label: "Obyekt turi", options: ["Turar joy majmuasi", "Biznes markaz", "Savdo markazi", "Klinika", "Ishlab chiqarish", "Boshqa"] },
  { name: "area", label: "Maydon", options: ["kichik", "o'rta", "katta"] },
  { name: "projectReady", label: "Loyiha tayyormi?", options: ["ha", "yo'q", "qisman"] },
  { name: "brigades", label: "Brigadalar soni", options: ["1", "2", "3+"] },
  { name: "shortDeadline", label: "Muddat qisqami?", options: ["ha", "yo'q"] },
  { name: "engineering", label: "Muhandislik tizimlari bormi?", options: ["ha", "yo'q"] },
  { name: "finishLevel", label: "Pardoz darajasi", options: ["oddiy", "o'rta", "premium"] },
  { name: "material", label: "Materialni kim oladi?", options: ["BARPO", "o'zim", "aralash"] },
];

export function KalkulyatorPage() {
  const [a, setA] = useState<Answers>(initial);
  const [result, setResult] = useState<string[] | null>(null);

  const filled = Object.values(a).filter(Boolean).length;
  const canCompute = filled >= 4;

  return (
    <div className="relative bg-white pt-32 min-h-screen">
      <section className="px-8 md:px-16 pt-12 pb-16">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-10">
            <p style={{ fontFamily: "var(--font-body)" }} className="text-sm tracking-[0.2em] uppercase text-[#060920]/50 mb-4">XAVF KALKULYATORI</p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 4rem)", color: "#060920" }} className="tracking-tight leading-[1.1]">
              Obyektingizda qaysi xavflar bor?
            </h1>
            <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/65 leading-relaxed mt-5 max-w-2xl">
              Bu narx kalkulyatori emas. Obyektingiz haqida bir necha savolga javob bering — saytning o'zi
              asosiy xavflarni ko'rsatadi.
            </p>
          </motion.div>

          {/* Savollar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FIELDS.map((f) => (
              <div key={f.name} className="space-y-2">
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-[0.15em] uppercase text-[#060920]/50">{f.label}</label>
                <div className="flex flex-wrap gap-2">
                  {f.options.map((o) => (
                    <button
                      key={o}
                      onClick={() => { setA({ ...a, [f.name]: o }); setResult(null); }}
                      style={{ fontFamily: "var(--font-body)" }}
                      className={`px-3.5 py-2 rounded-xl text-sm border transition-all ${
                        a[f.name] === o
                          ? "bg-[#060920] text-white border-[#060920]"
                          : "bg-white text-[#060920]/65 border-[#060920]/15 hover:border-[#060920]/35"
                      }`}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-4 flex-wrap">
            <button
              disabled={!canCompute}
              onClick={() => setResult(computeRisks(a))}
              style={{ fontFamily: "var(--font-body)" }}
              className="px-8 py-3.5 bg-[#060920] text-white tracking-[0.15em] uppercase text-sm font-medium rounded-2xl hover:shadow-xl transition-all disabled:opacity-50"
            >
              Xavflarni aniqlash
            </button>
            {!canCompute && <span style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]/40">Kamida 4 ta savolga javob bering</span>}
          </div>

          {/* Natija */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-12 bg-white rounded-3xl card-shadow p-8 md:p-10"
              >
                <div className="w-fit mb-6">
                  <h2 style={{ fontFamily: "var(--font-display)" }} className="text-2xl text-[#060920]">Sizning obyektingizdagi asosiy xavflar</h2>
                  <SoftDivider className="mt-3" />
                </div>
                <div className="space-y-4">
                  {result.map((r, i) => (
                    <motion.div
                      key={r}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-start gap-4"
                    >
                      <span style={{ fontFamily: "var(--font-display)" }} className="text-[#060920]/25 text-xl leading-none mt-0.5">{String(i + 1).padStart(2, "0")}</span>
                      <span style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/75 leading-relaxed">{r}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-[#060920]/10">
                  <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/60 mb-4">
                    Bu xavflarni boshlanishidayoq tahlil qilish — eng arzon va eng to'g'ri qaror.
                  </p>
                  <a href="#contact" style={{ fontFamily: "var(--font-body)" }}
                    className="inline-block px-8 py-3.5 bg-[#060920] text-white tracking-[0.15em] uppercase text-sm font-medium rounded-2xl hover:shadow-xl transition-all">
                    BARPO mutaxassisi bilan xavflarni tahlil qilish
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
