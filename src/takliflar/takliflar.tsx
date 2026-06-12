import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { SoftDivider } from "../app/components/SoftDivider";

type Status = "idle" | "sending" | "success" | "error";

interface Offer {
  id: string;
  title: string;
  description: string;
  tag: string;
  active?: boolean;
}

interface Investor {
  id: string;
  title: string;
  text: string;
  key: string;
}

const CATEGORIES = [
  "Hamkorlik",
  "Xizmat sifati",
  "Ish jarayonlari",
  "Yangi g'oya",
  "Narx / Taklif",
  "Boshqa",
];

export function TakliflarPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const inputClass =
    "w-full px-4 py-3 bg-white/50 border border-[#060920]/15 text-[#060920] placeholder-[#060920]/40 focus:outline-none focus:border-[#060920]/40 transition-colors rounded-lg";

  useEffect(() => {
    fetch("/api/offers")
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setOffers(json.offers || []);
      })
      .catch(() => {})
      .finally(() => setOffersLoading(false));
    fetch("/api/investors")
      .then((r) => r.json())
      .then((json) => { if (json.ok) setInvestors(json.investors || []); })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    setStatus("sending");
    setErrorMsg("");
    try {
      const data = new FormData(formEl);
      const body = Object.fromEntries(data.entries());
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Yuborishda xatolik yuz berdi");
      setStatus("success");
      formEl.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Yuborishda xatolik yuz berdi");
    }
  };

  return (
    <div className="pt-24 min-h-screen">
      {/* ====== BARPO TAKLIFLARI (biz e'lon qiladigan) ====== */}
      <section className="relative px-8 md:px-16 pt-20 pb-12">
        <div className="max-w-5xl w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-center space-y-4 mb-14"
          >
            <p
              style={{ fontFamily: "var(--font-body)" }}
              className="opacity-60 tracking-[0.2em] uppercase text-sm text-[#060920]"
            >
              CHEKLANGAN TAKLIFLAR
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                color: "#060920",
              }}
              className="leading-[1.15] tracking-tight"
            >
              Cheklangan takliflar
            </h2>
            <p
              style={{ fontFamily: "var(--font-body)" }}
              className="max-w-xl mx-auto leading-relaxed tracking-wide text-[#060920]/70"
            >
              BARPO hamkorlik, xizmat va imkoniyatlar bo'yicha cheklangan miqdordagi maxsus takliflarni taqdim etadi. Imkoniyatni boy bermang.
            </p>
          </motion.div>

          {offersLoading ? (
            <div style={{ fontFamily: "var(--font-body)" }} className="text-center py-12 text-[#060920]/40 tracking-wide animate-pulse">
              Yuklanmoqda...
            </div>
          ) : offers.length === 0 ? (
            <div
              style={{ fontFamily: "var(--font-body)" }}
              className="text-center py-12 text-[#060920]/40 tracking-wide"
            >
              Hozircha e'lon qilingan taklif yo'q. Tez orada yangilanadi.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {offers.map((offer, i) => (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false }}
                  transition={{ duration: 0.7, delay: 0.1 + i * 0.08 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-7 border border-[#060920]/15 bg-white/55 backdrop-blur-sm hover:bg-white/75 transition-colors rounded-2xl flex flex-col"
                >
                  {offer.tag && (
                    <span
                      style={{ fontFamily: "var(--font-body)" }}
                      className="self-start px-3 py-1 mb-4 text-xs tracking-[0.15em] uppercase bg-[#060920]/8 text-[#060920]/70 rounded-full"
                    >
                      {offer.tag}
                    </span>
                  )}
                  <div
                    style={{ fontFamily: "var(--font-display)" }}
                    className="text-xl text-[#060920] mb-3"
                  >
                    {offer.title}
                  </div>
                  <p
                    style={{ fontFamily: "var(--font-body)" }}
                    className="text-[#060920]/65 text-sm leading-relaxed flex-1"
                  >
                    {offer.description}
                  </p>
                  <a
                    href="#contact"
                    style={{ fontFamily: "var(--font-body)" }}
                    className="mt-5 inline-flex items-center gap-2 text-sm text-[#060920] hover:gap-3 transition-all tracking-wide"
                  >
                    Bog'lanish →
                  </a>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ====== INVESTORLAR UCHUN TAKLIFLAR (admin'dan boshqariladi) ====== */}
      {investors.length > 0 && (
        <section className="relative px-8 md:px-16 py-16 bg-[#060920]/[0.03]">
          <div className="max-w-4xl w-full mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="text-center space-y-4 mb-12"
            >
              <p style={{ fontFamily: "var(--font-body)" }} className="opacity-60 tracking-[0.2em] uppercase text-sm text-[#060920]">
                INVESTORLAR UCHUN TAKLIFLAR
              </p>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3.25rem)", color: "#060920" }} className="leading-[1.15] tracking-tight">
                Investorlar uchun obyekt konsepsiyalari
              </h2>
              <p style={{ fontFamily: "var(--font-body)" }} className="max-w-2xl mx-auto leading-relaxed tracking-wide text-[#060920]/70">
                BARPO investorlar uchun turli yo'nalishdagi obyektlarni konsepsiyadan qurilishgacha tizimli yondashuv asosida ko'rib chiqadi.
              </p>
            </motion.div>

            <div className="space-y-8">
              {investors.map((it, i) => (
                <motion.div
                  key={it.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, margin: "-60px" }}
                  transition={{ duration: 0.7, delay: i * 0.04 }}
                  className="bg-white rounded-3xl card-shadow p-8 md:p-9"
                >
                  <div className="w-fit">
                    <h3 style={{ fontFamily: "var(--font-display)" }} className="text-xl md:text-2xl text-[#060920] leading-tight">
                      {it.title}
                    </h3>
                    <SoftDivider className="mt-3" />
                  </div>
                  <div style={{ fontFamily: "var(--font-body)" }} className="mt-4 space-y-3 text-[#060920]/75 leading-relaxed">
                    {it.text.split("\n").map((s) => s.trim()).filter(Boolean).map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>
                  {it.key && (
                    <div className="mt-5 pl-5 border-l-2 border-[#060920]/30">
                      <p style={{ fontFamily: "var(--font-display)" }} className="text-base md:text-lg text-[#060920] italic leading-snug whitespace-pre-line">
                        {it.key}
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ====== BIZGA TAKLIF YUBORING (tashrifchidan) ====== */}
      <section className="relative px-8 md:px-16 py-24">
        <div className="max-w-3xl w-full mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="text-center space-y-4 mb-12"
          >
            <p
              style={{ fontFamily: "var(--font-body)" }}
              className="opacity-60 tracking-[0.2em] uppercase text-sm text-[#060920]"
            >
              SIZNING TAKLIFINGIZ
            </p>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 4vw, 3rem)",
                color: "#060920",
              }}
              className="leading-[1.15] tracking-tight"
            >
              Bizga taklif bildiring
            </h2>
            <p
              style={{ fontFamily: "var(--font-body)" }}
              className="max-w-xl mx-auto leading-relaxed tracking-wide text-[#060920]/70"
            >
              Sizning g'oya va takliflaringizni ham e'tibor bilan ko'rib chiqamiz. Fikringizni
              bizga yuboring — har bir taklif muhim.
            </p>
          </motion.div>

          {status === "success" ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="p-10 border border-[#060920]/15 bg-white/60 backdrop-blur-sm rounded-2xl text-center space-y-4"
            >
              <div style={{ fontFamily: "var(--font-display)" }} className="text-2xl text-[#060920]">
                Rahmat! Taklifingiz qabul qilindi.
              </div>
              <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/70 tracking-wide">
                Taklifingiz ko'rib chiqiladi va zarur hollarda siz bilan bog'lanamiz.
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
                <input type="text" name="fullName" placeholder="Ism-sharif (ixtiyoriy)"
                  style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                <input type="tel" name="phone" placeholder="Telefon raqam (ixtiyoriy)" inputMode="tel"
                  onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^\d+()\-\s]/g, ""); }}
                  style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              </div>

              <select name="category" required defaultValue=""
                style={{ fontFamily: "var(--font-body)" }} className={inputClass}>
                <option value="" disabled>Taklif yo'nalishi *</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>

              <input type="text" name="subject" required placeholder="Taklif mavzusi *"
                style={{ fontFamily: "var(--font-body)" }} className={inputClass} />

              <textarea name="message" required rows={5} placeholder="Taklifingizni batafsil yozing *"
                style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />

              {status === "error" && (
                <p style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]">{errorMsg}</p>
              )}

              <button type="submit" disabled={status === "sending"}
                style={{ fontFamily: "var(--font-body)" }}
                className="w-full px-8 py-4 bg-[#060920] text-white tracking-[0.15em] uppercase font-medium border border-[#060920]/20 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] rounded-2xl flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100">
                {status === "sending" ? "Yuborilmoqda..." : "Taklifni yuborish"}
              </button>

              <p style={{ fontFamily: "var(--font-body)" }} className="text-xs text-[#060920]/40 text-center tracking-wide">
                * bilan belgilangan maydonlar majburiy. Ism va telefon ixtiyoriy — anonim yuborishingiz mumkin.
              </p>
            </motion.form>
          )}
        </div>
      </section>
    </div>
  );
}
