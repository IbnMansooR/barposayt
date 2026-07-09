import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { barpo } from "../app/components/Barpo";
import { SoftDivider } from "../app/components/SoftDivider";
import { useT } from "../app/i18n";
import { isValidPhone } from "../app/validation";

type Status = "idle" | "sending" | "success" | "error";

interface Offer {
  id: string;
  title: string;
  description: string;
  tag: string;
  active?: boolean;
  titleRu?: string;
  descriptionRu?: string;
  tagRu?: string;
}

interface Investor {
  id: string;
  title: string;
  text: string;
  key: string;
  titleRu?: string;
  textRu?: string;
  keyRu?: string;
}

const CATEGORIES: [string, string][] = [
  ["Hamkorlik", "Сотрудничество"],
  ["Xizmat sifati", "Качество услуг"],
  ["Ish jarayonlari", "Рабочие процессы"],
  ["Yangi g'oya", "Новая идея"],
  ["Narx / Taklif", "Цена / Предложение"],
  ["Boshqa", "Другое"],
];

// #060920 (navy) qoladi, qolgani oq (foydalanuvchi: navy joyida, boshqa fonlar oq)
const PANELS = [
  { bg: "#060920", fg: "#FFFFFF" }, // navy
  { bg: "#FFFFFF", fg: "#060920" }, // oq
];

export function TakliflarPage() {
  const t = useT();
  const bi = (uz: string, ru?: string) => t(uz, ru || uz);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Brauzer standart validatsiya popup'ini (odatda ingliz tilida) UZ/RU bilan almashtiramiz.
  const onInvalidLocalized = (e: React.FormEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.currentTarget.setCustomValidity(t("Bu maydonni to'ldiring", "Заполните это поле"));
  };
  const clearValidity = (e: React.FormEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    e.currentTarget.setCustomValidity("");
  };

  const inputClass =
    "w-full px-4 py-3 bg-white/70 border border-[#060920]/15 text-[#060920] placeholder-[#060920]/40 focus:outline-none focus:border-[#060920]/40 transition-colors rounded-lg";

  useEffect(() => {
    fetch("/api/offers")
      .then((r) => r.json())
      .then((json) => { if (json.ok) setOffers(json.offers || []); })
      .catch(() => {});
    fetch("/api/investors")
      .then((r) => r.json())
      .then((json) => {
        const real = json.ok ? (json.investors || []) : [];
        // DEMO — FAQAT dev rejimida (ko'rish uchun). Production'da chiqmaydi.
        const demo: Investor[] = import.meta.env.DEV
          ? [
              { id: "d1", title: "Klinika konsepsiyasi", text: "Salomatlik yo'nalishidagi obyekt — joylashuv, oqim va xizmat modeli investor daromadiga moslab loyihalanadi.\nQurilish jarayoni tizim bilan boshqariladi.", key: "Kapital — natijaga yo'naltirilgan." },
              { id: "d2", title: "Biznes markaz", text: "Ijara modeli, qavatlar samaradorligi va texnik yechimlar konsepsiya bosqichida hisoblanadi.\nHar qaror investor vaqti va xarajatiga ta'siri bilan baholanadi.", key: "Obyekt — ishlaydigan aktiv." },
              { id: "d3", title: "Turar-joy majmuasi", text: "Sifat, muddat va shaffof smeta — uchta asos. Investor obyekt ortidan yugurmaydi, qaror qabul qiladi.\nJarayonni tizim olib boradi.", key: "Shaffoflik — vaqtida qaror." },
            ]
          : [];
        setInvestors(real.length ? real : demo);
      })
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
      if (body.phone && !isValidPhone(String(body.phone))) {
        throw new Error(t("Telefon raqamni to'g'ri kiriting", "Введите корректный номер телефона"));
      }
      const res = await fetch("/api/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || t("Yuborishda xatolik yuz berdi", "Произошла ошибка при отправке"));
      setStatus("success");
      formEl.reset();
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : t("Yuborishda xatolik yuz berdi", "Произошла ошибка при отправке"));
    }
  };

  return (
    <div className="relative bg-white pt-20 md:pt-32">
      {/* Hero */}
      <section className="relative min-h-[40vh] flex items-center justify-center px-5 md:px-16 py-12 md:py-20 overflow-hidden">
        <div className="max-w-5xl w-full mx-auto text-center space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem, 5vw, 4rem)" }}
            className="text-[#060920] tracking-tight font-light leading-tight uppercase"
          >
            {t("Investorlar uchun takliflar", "Предложения для инвесторов")}
          </motion.h1>
        </div>
      </section>

      {/* Cheklangan takliflar (offerlar) */}
      {offers.length > 0 && (
        <section className="relative py-14 md:py-24 px-5 md:px-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {offers.map((offer, i) => (
                <motion.div
                  key={offer.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.7, delay: i * 0.08 }}
                  className="bg-white rounded-3xl p-7 md:p-9 shadow-[0_12px_32px_-12px_rgba(6,9,32,0.20)] border border-[#060920]/5"
                >
                  {offer.tag && (
                    <span style={{ fontFamily: "var(--font-body)" }} className="inline-block px-3 py-1 mb-4 text-xs tracking-[0.15em] uppercase bg-[#060920]/8 text-[#060920]/70 rounded-full">
                      {bi(offer.tag, offer.tagRu)}
                    </span>
                  )}
                  <h2 style={{ fontFamily: "var(--font-display)" }} className="text-2xl md:text-3xl text-[#060920] leading-tight">
                    {barpo(bi(offer.title, offer.titleRu))}
                  </h2>
                  <SoftDivider className="mt-4 max-w-16" />
                  <p style={{ fontFamily: "var(--font-body)" }} className="mt-5 text-[#060920]/70 leading-relaxed">
                    {barpo(bi(offer.description, offer.descriptionRu))}
                  </p>
                  <a href="#contact" style={{ fontFamily: "var(--font-body)", textDecoration: "none" }} className="mt-6 inline-flex items-center gap-2 text-sm tracking-[0.15em] uppercase text-[#060920] hover:gap-3 transition-all">
                    {t("Bog'lanish", "Связаться")} →
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Investor konsepsiyalari — 4:5 portret rasm + rangli panel */}
      {investors.length > 0 && (
        <section className="relative py-14 md:py-24 px-5 md:px-16 bg-white">
          <div className="max-w-7xl mx-auto space-y-10 md:space-y-14">
            {investors.map((inv, i) => {
              const panel = PANELS[i % PANELS.length];
              return (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: i * 0.06 }}
                  className="rounded-3xl overflow-hidden shadow-[0_16px_40px_-16px_rgba(6,9,32,0.25)] px-8 py-10 md:px-14 md:py-14"
                  style={{ background: panel.bg, color: panel.fg }}
                >
                  <div className="max-w-2xl">
                    <div style={{ fontFamily: "var(--font-body)" }} className="text-xs tracking-[0.25em] uppercase opacity-60">
                      {t("INVESTOR KONSEPSIYASI", "КОНЦЕПЦИЯ ДЛЯ ИНВЕСТОРА")}
                    </div>
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 2.4vw, 2.4rem)" }} className="mt-3 leading-tight">
                      {barpo(bi(inv.title, inv.titleRu))}
                    </h3>
                    <div className="mt-4 h-px w-14" style={{ background: panel.fg, opacity: 0.35 }} />
                    <div style={{ fontFamily: "var(--font-body)", opacity: 0.85 }} className="mt-5 space-y-3 leading-relaxed">
                      {bi(inv.text || "", inv.textRu).split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 3).map((p, idx) => (
                        <p key={idx}>{barpo(p)}</p>
                      ))}
                    </div>
                    {inv.key && (
                      <div className="mt-5 pl-4 border-l-2" style={{ borderColor: panel.fg + "55" }}>
                        <p style={{ fontFamily: "var(--font-display)", opacity: 0.95 }} className="italic leading-snug whitespace-pre-line">
                          {barpo(bi(inv.key, inv.keyRu))}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      )}

      {/* Forma — taklif yuborish */}
      <section className="relative py-14 md:py-24 px-5 md:px-16 bg-[#060920]/[0.02]">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p style={{ fontFamily: "var(--font-display)" }} className="text-xs tracking-[0.3em] uppercase text-[#060920]/50">
              {t("SIZNING TAKLIFINGIZ", "ВАШЕ ПРЕДЛОЖЕНИЕ")}
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3vw, 2.75rem)", color: "#060920" }} className="mt-3 leading-tight">
              {t("Bizga taklif bildiring", "Поделитесь предложением")}
            </h2>

            {status === "success" ? (
              <div className="mt-6 p-8 border border-[#060920]/15 bg-white/60 rounded-2xl text-center space-y-3">
                <div style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">
                  {t("Rahmat! Taklifingiz qabul qilindi.", "Спасибо! Ваше предложение принято.")}
                </div>
                <button onClick={() => setStatus("idle")} style={{ fontFamily: "var(--font-body)" }} className="px-6 py-2 text-sm tracking-[0.15em] uppercase text-[#060920]/70 hover:text-[#060920] transition-colors">
                  {t("Yana yuborish", "Отправить ещё")}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-3">
                {/* Honeypot — botlar uchun, odamlar ko'rmaydi */}
                <input type="text" name="_hp" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }} aria-hidden="true" />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label htmlFor="taklif-fullName" className="sr-only">{t("Ism-sharif (ixtiyoriy)", "Ф.И.О. (необязательно)")}</label>
                  <input id="taklif-fullName" type="text" name="fullName" placeholder={t("Ism-sharif (ixtiyoriy)", "Ф.И.О. (необязательно)")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                  <label htmlFor="taklif-phone" className="sr-only">{t("Telefon (ixtiyoriy)", "Телефон (необязательно)")}</label>
                  <input id="taklif-phone" type="tel" name="phone" placeholder={t("Telefon (ixtiyoriy)", "Телефон (необязательно)")} inputMode="tel"
                    onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^\d+()\-\s]/g, ""); }}
                    style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                </div>
                <label htmlFor="taklif-category" className="sr-only">{t("Taklif yo'nalishi *", "Направление *")}</label>
                <select id="taklif-category" name="category" required defaultValue="" onInvalid={onInvalidLocalized} onInput={clearValidity} style={{ fontFamily: "var(--font-body)" }} className={inputClass}>
                  <option value="" disabled>{t("Taklif yo'nalishi *", "Направление *")}</option>
                  {CATEGORIES.map((c) => <option key={c[0]} value={c[0]}>{t(c[0], c[1])}</option>)}
                </select>
                <label htmlFor="taklif-subject" className="sr-only">{t("Taklif mavzusi *", "Тема предложения *")}</label>
                <input id="taklif-subject" type="text" name="subject" required placeholder={t("Taklif mavzusi *", "Тема предложения *")} onInvalid={onInvalidLocalized} onInput={clearValidity} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                <label htmlFor="taklif-message" className="sr-only">{t("Taklifingizni batafsil yozing *", "Опишите предложение *")}</label>
                <textarea id="taklif-message" name="message" required rows={4} placeholder={t("Taklifingizni batafsil yozing *", "Опишите предложение *")} onInvalid={onInvalidLocalized} onInput={clearValidity} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
                {status === "error" && <p style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]">{errorMsg}</p>}
                <button type="submit" disabled={status === "sending"} style={{ fontFamily: "var(--font-body)" }}
                  className="w-full px-8 py-3.5 bg-[#060920] text-white tracking-[0.15em] uppercase font-medium rounded-2xl transition-all hover:shadow-xl disabled:opacity-70">
                  {status === "sending" ? t("Yuborilmoqda...", "Отправляется...") : t("Taklifni yuborish", "Отправить предложение")}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
