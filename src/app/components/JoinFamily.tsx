import { useState } from "react";
import { motion } from "motion/react";

// Yo'nalishga qarab sohalar ro'yxati
const FIELDS_BY_DIRECTION: Record<string, string[]> = {
  Qurilish: [
    "Bosh pudratchi",
    "Qurilish-montaj ishlari",
    "Pardozlash ishlari",
    "Muhandislik tizimlari",
    "Fasad va tashqi ishlar",
    "Loyihalash / Smeta",
    "Loyiha menejmenti",
    "HR / Ofis / Administratsiya",
    "Boshqa",
  ],
  Marketing: [
    "Marketolog",
    "SMM mutaxassisi",
    "Kontent menejer",
    "Grafik dizayner",
    "Motion dizayner",
    "Videograf",
    "Mobilograf",
    "Kopirayter",
    "Targetolog",
    "PR",
    "Boshqa",
  ],
};

type Status = "idle" | "sending" | "success" | "error";

export function JoinFamily() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [fileName, setFileName] = useState("");
  const [direction, setDirection] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    setStatus("sending");
    setErrorMsg("");
    try {
      const data = new FormData(formEl);
      const res = await fetch("/api/apply", { method: "POST", body: data });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Yuborishda xatolik yuz berdi");
      setStatus("success");
      formEl.reset();
      setFileName("");
      setDirection("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Yuborishda xatolik yuz berdi");
    }
  };

  const inputClass =
    "w-full px-4 py-3 bg-white/50 border border-[#060920]/15 text-[#060920] placeholder-[#060920]/40 focus:outline-none focus:border-[#060920]/40 transition-colors rounded-lg";

  return (
    <section
      id="join"
      className="relative min-h-screen flex items-center justify-center px-8 md:px-16 py-32"
    >
      <div className="max-w-3xl w-full mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="text-center space-y-4 mb-12"
        >
          <p
            style={{ fontFamily: "var(--font-body)" }}
            className="opacity-60 tracking-[0.2em] uppercase text-sm text-[#060920]"
          >
            BIZGA QO'SHILING
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              color: "#060920",
            }}
            className="leading-[1.15] tracking-tight"
          >
            BARPO oilasiga qo'shiling
          </h2>
          <p
            style={{ fontFamily: "var(--font-body)" }}
            className="max-w-xl mx-auto leading-relaxed tracking-wide text-[#060920]/70"
          >
            Tartib, nazorat va sifatni qadrlaydigan jamoaga qo'shiling. O'zingiz haqingizda
            ma'lumot qoldiring va rezyumeingizni yuklang — biz siz bilan bog'lanamiz.
          </p>
        </motion.div>

        {status === "success" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="p-10 border border-[#060920]/15 bg-white/60 backdrop-blur-sm rounded-2xl text-center space-y-4"
          >
            <div
              style={{ fontFamily: "var(--font-display)" }}
              className="text-2xl text-[#060920]"
            >
              Rahmat! Murojaatingiz qabul qilindi.
            </div>
            <p
              style={{ fontFamily: "var(--font-body)" }}
              className="text-[#060920]/70 tracking-wide"
            >
              Ma'lumotlaringiz bazaga saqlandi. Tez orada siz bilan bog'lanamiz.
            </p>
            <button
              onClick={() => setStatus("idle")}
              style={{ fontFamily: "var(--font-body)" }}
              className="mt-2 px-6 py-2 text-sm tracking-[0.15em] uppercase text-[#060920]/70 hover:text-[#060920] transition-colors"
            >
              Yana yuborish
            </button>
          </motion.div>
        ) : (
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 1, delay: 0.2 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="fullName"
                required
                placeholder="Ism-sharif *"
                style={{ fontFamily: "var(--font-body)" }}
                className={inputClass}
              />
              <input
                type="tel"
                name="phone"
                required
                placeholder="Telefon raqam *"
                inputMode="tel"
                onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^\d+()\-\s]/g, ""); }}
                style={{ fontFamily: "var(--font-body)" }}
                className={inputClass}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                required
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                style={{ fontFamily: "var(--font-body)" }}
                className={inputClass}
              >
                <option value="" disabled>
                  Yo'nalish *
                </option>
                <option value="Qurilish">Qurilish</option>
                <option value="Marketing">Marketing</option>
              </select>
              <select
                name="field"
                required
                defaultValue=""
                disabled={!direction}
                key={direction}
                style={{ fontFamily: "var(--font-body)" }}
                className={`${inputClass} disabled:opacity-50`}
              >
                <option value="" disabled>
                  {direction ? "Qaysi soha bo'yicha? *" : "Avval yo'nalishni tanlang"}
                </option>
                {(FIELDS_BY_DIRECTION[direction] || []).map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="number"
              name="experienceYears"
              min={0}
              max={60}
              placeholder="Soha bo'yicha tajriba (yil)"
              style={{ fontFamily: "var(--font-body)" }}
              className={inputClass}
            />

            <input
              type="email"
              name="email"
              placeholder="Email pochtangiz (javob shu manzilga yuboriladi)"
              inputMode="email"
              pattern="[^@\s]+@[^@\s]+\.[^@\s]{2,}"
              title="To'g'ri email kiriting, masalan: ism@gmail.com"
              onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^A-Za-z0-9@._%+\-]/g, ""); }}
              style={{ fontFamily: "var(--font-body)" }}
              className={inputClass}
            />

            <input
              type="text"
              name="contact"
              placeholder="Telegram yoki boshqa aloqa (masalan @username)"
              style={{ fontFamily: "var(--font-body)" }}
              className={inputClass}
            />

            {/* Rezyume yuklash */}
            <label
              style={{ fontFamily: "var(--font-body)" }}
              className="flex items-center gap-3 w-full px-4 py-3 bg-white/50 border border-dashed border-[#060920]/25 text-[#060920]/70 hover:border-[#060920]/50 transition-colors rounded-lg cursor-pointer"
            >
              <span className="truncate">
                {fileName || "Rezyumeni yuklash (PDF, DOC, DOCX)"}
              </span>
              <input
                type="file"
                name="resume"
                accept=".pdf,.doc,.docx,.rtf,.txt"
                onChange={(e) => setFileName(e.target.files?.[0]?.name || "")}
                className="hidden"
              />
            </label>

            {status === "error" && (
              <p
                style={{ fontFamily: "var(--font-body)" }}
                className="text-sm text-[#060920]"
              >
                {errorMsg}
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              style={{ fontFamily: "var(--font-body)" }}
              className="w-full px-8 py-4 bg-[#060920] text-white tracking-[0.15em] uppercase font-medium border border-[#060920]/20 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] rounded-2xl flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100"
            >
              {status === "sending" ? "Yuborilmoqda..." : "Murojaatni yuborish"}
            </button>

            <p
              style={{ fontFamily: "var(--font-body)" }}
              className="text-xs text-[#060920]/40 text-center tracking-wide"
            >
              * bilan belgilangan maydonlar majburiy
            </p>
          </motion.form>
        )}
      </div>
    </section>
  );
}
