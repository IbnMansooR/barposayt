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

const FIELDS: { name: keyof Answers; label: string; options: string[] }[] = [
  { name: "type", label: "Obyekt turi", options: ["Turar joy majmuasi", "Biznes markaz", "Savdo markazi", "Klinika", "Ishlab chiqarish", "Boshqa"] },
  { name: "area", label: "Maydon", options: ["kichik", "o'rta", "katta"] },
  { name: "projectReady", label: "Loyiha tayyormi?", options: ["ha", "qisman", "yo'q"] },
  { name: "brigades", label: "Brigadalar soni", options: ["1", "2", "3+"] },
  { name: "shortDeadline", label: "Muddat qisqami?", options: ["ha", "yo'q"] },
  { name: "engineering", label: "Muhandislik tizimlari bormi?", options: ["ha", "yo'q"] },
  { name: "finishLevel", label: "Pardoz darajasi", options: ["oddiy", "o'rta", "premium"] },
  { name: "material", label: "Materialni kim oladi?", options: ["BARPO", "aralash", "o'zim"] },
];

// Har bir javob 4 ta xavf yo'nalishiga ball qo'shadi:
// [muddat, byudjet, sifat, koordinatsiya]
type Dims = { schedule: number; budget: number; quality: number; coord: number };
const Z = (): Dims => ({ schedule: 0, budget: 0, quality: 0, coord: 0 });

const WEIGHTS: Record<string, Record<string, Partial<Dims>>> = {
  type: {
    "Turar joy majmuasi": { coord: 10, quality: 6 },
    "Biznes markaz": { coord: 12, quality: 8 },
    "Savdo markazi": { coord: 16, schedule: 8 },
    "Klinika": { quality: 20, coord: 12 },
    "Ishlab chiqarish": { coord: 12, schedule: 6 },
    "Boshqa": { coord: 5, quality: 5 },
  },
  area: {
    "kichik": {},
    "o'rta": { coord: 8, schedule: 6 },
    "katta": { coord: 18, schedule: 12, budget: 8 },
  },
  projectReady: {
    "ha": {},
    "qisman": { budget: 12, schedule: 10, quality: 8 },
    "yo'q": { budget: 24, schedule: 20, quality: 16 },
  },
  brigades: {
    "1": {},
    "2": { coord: 12 },
    "3+": { coord: 22, schedule: 8 },
  },
  shortDeadline: {
    "ha": { schedule: 24, quality: 16 },
    "yo'q": {},
  },
  engineering: {
    "ha": { coord: 14, quality: 12 },
    "yo'q": {},
  },
  finishLevel: {
    "oddiy": {},
    "o'rta": { quality: 8 },
    "premium": { quality: 22, budget: 10 },
  },
  material: {
    "BARPO": {},
    "aralash": { schedule: 8, budget: 8 },
    "o'zim": { schedule: 20, budget: 14 },
  },
};

// Tavsiyalar — qaysi javob xavf keltirsa, o'shanga mos aniq yechim
const RECS: { match: (a: Answers) => boolean; title: string; rec: string }[] = [
  { match: (a) => a.projectReady === "yo'q", title: "Loyiha hujjatlari tayyor emas", rec: "Loyihasiz boshlangan ish davomida qarorlar qayta-qayta o'zgaradi — bu qayta ishlash, material isrofi va muddat cho'zilishiga olib keladi. BARPO avval loyihani to'liq tahlil qiladi, keyin ish boshlaydi." },
  { match: (a) => a.projectReady === "qisman", title: "Loyiha qisman tayyor", rec: "Yetishmayotgan qismlar ish jarayonida aniqlanadi — bu kutilmagan xarajat manbai. Bo'shliqlarni boshida yopish eng arzon yechim." },
  { match: (a) => a.shortDeadline === "ha", title: "Muddat qisqa — shoshilish xavfi", rec: "Qisqa muddat sifatni buzmasligi uchun GPR (grafik-progressiv reja) shart. To'g'ri rejada tezlik intizomdan keladi, shoshilishdan emas." },
  { match: (a) => a.brigades === "3+", title: "Ko'p brigada — to'qnashuv xavfi", rec: "3 va undan ortiq brigada bir zonada to'qnashadi, bir-birini kutadi. Yagona koordinatsiya markazi bo'lmasa, har kuni vaqt yo'qoladi." },
  { match: (a) => a.brigades === "2", title: "Brigadalararo koordinatsiya", rec: "Ikki brigada ham aniq navbat va zona taqsimoti talab qiladi — aks holda ishlar bir-birini bloklaydi." },
  { match: (a) => a.engineering === "ha", title: "Muhandislik–pardoz ketma-ketligi", rec: "Elektrika, santexnika va ventilyatsiya pardozdan oldin tugashi va tekshirilishi kerak. Tartib buzilsa, tayyor pardozni qayta buzishga to'g'ri keladi." },
  { match: (a) => a.material === "o'zim", title: "Material ta'minoti sizning zimmangizda", rec: "Material o'z vaqtida kelmasa, butun grafik to'xtaydi. Ta'minotni qurilish grafigiga bog'lash kechikishlarning oldini oladi." },
  { match: (a) => a.material === "aralash", title: "Aralash ta'minot — mas'uliyat chegarasi", rec: "Kim qaysi materialni olishini aniq belgilamasa, kechikishda mas'uliyat noaniq qoladi. Chegaralarni boshida kelishib olish kerak." },
  { match: (a) => a.area === "katta", title: "Katta hajm — nazorat murakkabligi", rec: "Katta obyektda har bir zonani kuzatish qiyinlashadi. Kunlik texnik nazorat va hisobot tizimisiz muammolar kech ko'rinadi." },
  { match: (a) => a.finishLevel === "premium", title: "Premium pardoz — aniqlik talabi", rec: "Premium darajada har bir tutashuv, chiziq va faktura seziladi. Qattiq qabul mezonlari va malakali ijro bo'lmasa, natija premium ko'rinmaydi." },
  { match: (a) => a.type === "Klinika", title: "Tibbiy obyekt — nol xato talabi", rec: "Klinikada steril zonalar, ventilyatsiya va oqimlar ajratilishi aniqlik talab qiladi. Bu yerda \"keyin to'g'rilaymiz\" yondashuvi ishlamaydi." },
];

interface Result {
  overall: number;
  level: "Past" | "O'rta" | "Yuqori";
  dims: { key: string; label: string; pct: number }[];
  recs: { title: string; rec: string }[];
  answered: number;
  accuracy: number;
}

function analyze(a: Answers): Result {
  const total = Z();
  for (const f of FIELDS) {
    const val = a[f.name];
    if (!val) continue;
    const w = WEIGHTS[f.name]?.[val] || {};
    total.schedule += w.schedule || 0;
    total.budget += w.budget || 0;
    total.quality += w.quality || 0;
    total.coord += w.coord || 0;
  }
  // 0–100 ga normallashtirish (real maks ~70, shuning uchun *1.35, 100 da cheklash)
  const norm = (x: number) => Math.min(100, Math.round(x * 1.35));
  const dimsRaw = {
    schedule: norm(total.schedule),
    budget: norm(total.budget),
    quality: norm(total.quality),
    coord: norm(total.coord),
  };
  const overall = Math.round((dimsRaw.schedule + dimsRaw.budget + dimsRaw.quality + dimsRaw.coord) / 4);
  const level: Result["level"] = overall >= 60 ? "Yuqori" : overall >= 30 ? "O'rta" : "Past";
  const recs = RECS.filter((r) => r.match(a)).map((r) => ({ title: r.title, rec: r.rec }));
  const answered = Object.values(a).filter(Boolean).length;
  const accuracy = Math.round((answered / FIELDS.length) * 100);
  return {
    overall, level,
    dims: [
      { key: "schedule", label: "Muddat xavfi", pct: dimsRaw.schedule },
      { key: "budget", label: "Byudjet / xarajat xavfi", pct: dimsRaw.budget },
      { key: "quality", label: "Sifat xavfi", pct: dimsRaw.quality },
      { key: "coord", label: "Koordinatsiya xavfi", pct: dimsRaw.coord },
    ],
    recs, answered, accuracy,
  };
}

export function KalkulyatorPage() {
  const [a, setA] = useState<Answers>(initial);
  const [result, setResult] = useState<Result | null>(null);

  const filled = Object.values(a).filter(Boolean).length;
  const canCompute = filled >= 5;

  return (
    <div className="relative bg-white pt-32 min-h-screen">
      <section className="px-8 md:px-16 pt-12 pb-16">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mb-10">
            <p style={{ fontFamily: "var(--font-body)" }} className="text-sm tracking-[0.2em] uppercase text-[#060920]/50 mb-4">XAVF KALKULYATORI</p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 4rem)", color: "#060920" }} className="tracking-tight leading-[1.1]">
              Obyektingizning xavf darajasini hisoblang
            </h1>
            <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/65 leading-relaxed mt-5 max-w-2xl">
              Bu narx kalkulyatori emas. Obyektingiz haqida savollarga javob bering — tizim 4 ta yo'nalish bo'yicha
              xavf darajasini foizda hisoblab, aniq tavsiyalar beradi.
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
              onClick={() => setResult(analyze(a))}
              style={{ fontFamily: "var(--font-body)" }}
              className="px-8 py-3.5 bg-[#060920] text-white tracking-[0.15em] uppercase text-sm font-medium rounded-2xl hover:shadow-xl transition-all disabled:opacity-50"
            >
              Xavf darajasini hisoblash
            </button>
            {!canCompute && <span style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]/40">Aniq natija uchun kamida 5 ta savolga javob bering ({filled}/8)</span>}
          </div>

          {/* Natija */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-12 space-y-8"
              >
                {/* Umumiy ko'rsatkich */}
                <div className="bg-white rounded-3xl border border-[#060920]/10 p-8 md:p-10">
                  <div className="flex flex-col md:flex-row md:items-center gap-8">
                    {/* Doiraviy ko'rsatkich */}
                    <div className="relative w-40 h-40 shrink-0 mx-auto md:mx-0">
                      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                        <circle cx="60" cy="60" r="52" fill="none" stroke="#060920" strokeOpacity="0.08" strokeWidth="12" />
                        <motion.circle
                          cx="60" cy="60" r="52" fill="none" stroke="#060920" strokeWidth="12" strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 52}
                          initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - result.overall / 100) }}
                          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span style={{ fontFamily: "var(--font-display)" }} className="text-4xl text-[#060920] leading-none">{result.overall}%</span>
                        <span style={{ fontFamily: "var(--font-body)" }} className="text-xs tracking-wide uppercase text-[#060920]/45 mt-1">umumiy xavf</span>
                      </div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap mb-3">
                        <h2 style={{ fontFamily: "var(--font-display)" }} className="text-2xl text-[#060920]">Xavf darajasi:</h2>
                        <span style={{ fontFamily: "var(--font-body)" }}
                          className={`px-4 py-1 rounded-full text-sm tracking-wide uppercase ${
                            result.level === "Yuqori" ? "bg-[#060920] text-white"
                            : result.level === "O'rta" ? "bg-[#060920]/15 text-[#060920]"
                            : "bg-[#060920]/8 text-[#060920]/60"
                          }`}>
                          {result.level}
                        </span>
                      </div>
                      <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/65 leading-relaxed">
                        {result.level === "Yuqori"
                          ? "Obyektingizda bir nechta xavf omili birlashgan. Tizimli boshqaruvsiz muddat, xarajat va sifat jiddiy xavf ostida."
                          : result.level === "O'rta"
                          ? "Obyektingizda boshqariladigan, lekin e'tibordan chetda qolsa xarajatga aylanadigan xavflar bor."
                          : "Obyektingizdagi xavflar past, lekin tartibli nazorat natijani kafolatlaydi."}
                      </p>
                      <p style={{ fontFamily: "var(--font-body)" }} className="text-xs text-[#060920]/40 mt-3">
                        Tahlil aniqligi: {result.accuracy}% ({result.answered}/8 savol) — qancha ko'p javob bersangiz, shuncha aniq.
                      </p>
                    </div>
                  </div>

                  {/* Yo'nalishlar bo'yicha */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5 mt-9 pt-8 border-t border-[#060920]/10">
                    {result.dims.map((d, i) => (
                      <div key={d.key}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]/70">{d.label}</span>
                          <span style={{ fontFamily: "var(--font-display)" }} className="text-sm text-[#060920]">{d.pct}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#060920]/8 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full bg-[#060920]"
                            initial={{ width: 0 }}
                            animate={{ width: `${d.pct}%` }}
                            transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Aniqlangan xavflar + tavsiyalar */}
                {result.recs.length > 0 && (
                  <div className="bg-white rounded-3xl border border-[#060920]/10 p-8 md:p-10">
                    <div className="w-fit mb-6">
                      <h2 style={{ fontFamily: "var(--font-display)" }} className="text-2xl text-[#060920]">Aniqlangan xavflar va yechimlar</h2>
                      <SoftDivider className="mt-3" />
                    </div>
                    <div className="space-y-6">
                      {result.recs.map((r, i) => (
                        <motion.div
                          key={r.title}
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 + i * 0.06 }}
                          className="flex items-start gap-4"
                        >
                          <span style={{ fontFamily: "var(--font-display)" }} className="text-[#060920]/20 text-2xl leading-none mt-0.5 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                          <div>
                            <h3 style={{ fontFamily: "var(--font-display)" }} className="text-lg text-[#060920] mb-1">{r.title}</h3>
                            <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/65 leading-relaxed text-sm">{r.rec}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="relative rounded-3xl bg-[#060920] p-8 md:p-12 text-center">
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.4rem, 3.5vw, 2.2rem)", color: "#FFFFFF" }} className="tracking-tight">
                    Bu xavflarni boshida tahlil qilish — eng arzon qaror
                  </h2>
                  <p style={{ fontFamily: "var(--font-body)" }} className="text-white/55 max-w-xl mx-auto mt-4 leading-relaxed">
                    BARPO mutaxassisi obyektingizni ko'rib chiqib, har bir xavfni qanday boshqarish mumkinligini aniq aytadi.
                  </p>
                  <a href="#contact" style={{ fontFamily: "var(--font-body)", textDecoration: "none" }}
                    className="inline-block mt-7 px-8 py-3.5 bg-white text-[#060920] tracking-[0.15em] uppercase text-sm font-medium rounded-2xl hover:shadow-xl transition-all">
                    BARPO bilan xavflarni tahlil qilish
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
