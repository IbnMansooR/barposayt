import { useState, useEffect } from "react";
import { barpo } from "../app/components/Barpo";
import { useT } from "../app/i18n";
import { HorizontalGallery } from "../app/components/HorizontalGallery";

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
  const [offers, setOffers] = useState<Offer[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [sectionImages, setSectionImages] = useState<Record<string, number>>({});

  const inputClass =
    "w-full px-4 py-3 bg-white/70 border border-[#060920]/15 text-[#060920] placeholder-[#060920]/40 focus:outline-none focus:border-[#060920]/40 transition-colors rounded-lg";

  useEffect(() => {
    fetch("/api/section-images")
      .then((r) => r.json())
      .then((json) => setSectionImages(json || {}))
      .catch(() => {});
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

  const count = 1 + offers.length + investors.length + 1;

  return (
    <HorizontalGallery count={count} reverse>
      {/* Intro slayd */}
      <div className="h-full flex items-center shrink-0" style={{ width: "min(88vw, 780px)" }}>
        <div className="px-10 md:px-20">
          <div style={{ fontFamily: "var(--font-body)" }} className="text-xs tracking-[0.3em] uppercase text-[#060920]/50">
            {t("INVESTORLAR UCHUN TAKLIFLAR", "ПРЕДЛОЖЕНИЯ ДЛЯ ИНВЕСТОРОВ")}
          </div>
        </div>
      </div>

      {/* Cheklangan takliflar (offerlar) — matn panellari */}
      {offers.map((offer) => (
        <div key={offer.id} className="h-full flex items-center shrink-0" style={{ width: "min(78vw, 680px)" }}>
          <div className="px-10 md:px-16">
            {offer.tag && (
              <span style={{ fontFamily: "var(--font-body)" }} className="inline-block px-3 py-1 mb-4 text-xs tracking-[0.15em] uppercase bg-[#060920]/8 text-[#060920]/70 rounded-full">
                {offer.tag}
              </span>
            )}
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 3vw, 3rem)", color: "#060920" }} className="leading-tight">
              {barpo(offer.title)}
            </h2>
            <div className="mt-4 h-px w-16 bg-[#060920]/30" />
            <p style={{ fontFamily: "var(--font-body)" }} className="mt-5 text-[#060920]/70 leading-relaxed max-w-lg">
              {barpo(offer.description)}
            </p>
            <a href="#contact" style={{ fontFamily: "var(--font-body)", textDecoration: "none" }} className="mt-6 inline-flex items-center gap-2 text-sm tracking-[0.15em] uppercase text-[#060920] hover:gap-3 transition-all">
              {t("Bog'lanish", "Связаться")} →
            </a>
          </div>
        </div>
      ))}

      {/* Investor konsepsiyalari — 4:5 portret rasm (1080×1350) + rangli panel */}
      {investors.map((inv, i) => {
        const panel = PANELS[i % PANELS.length];
        return (
          <div key={inv.id} className="h-full flex items-center shrink-0">
            {/* 4:5 portret rasm joyi (1080×1350 px shu yerga sig'adi) */}
            <div className="relative self-center h-[45vh] md:h-[78vh] overflow-hidden shrink-0" style={{ aspectRatio: "4 / 5" }}>
              {sectionImages[`investor-${i}`] ? (
                <img
                  src={`/api/section-image?key=investor-${i}&v=${sectionImages[`investor-${i}`]}`}
                  alt={inv.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ transform: "scale(1.16)" }}
                />
              ) : (
                <div
                  data-parallax
                  className="absolute inset-0 flex items-center justify-center bg-[#060920]/[0.04] border border-[#060920]/10"
                  style={{ transform: "scale(1.16)" }}
                >
                  <span style={{ fontFamily: "var(--font-display)" }} className="text-[#060920]/12 text-6xl tracking-wider">BARPO</span>
                </div>
              )}
            </div>

            {/* Panel */}
            <div className="h-full flex flex-col justify-center px-5 md:px-14 shrink-0 w-[52vw] md:w-[38vw]" style={{ background: panel.bg, color: panel.fg }}>
              <div style={{ fontFamily: "var(--font-body)" }} className="text-xs tracking-[0.25em] uppercase opacity-60">
                {t("INVESTOR KONSEPSIYASI", "КОНЦЕПЦИЯ ДЛЯ ИНВЕСТОРА")}
              </div>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.6rem, 2.4vw, 2.6rem)" }} className="mt-3 leading-tight">
                {barpo(inv.title)}
              </h2>
              <div className="mt-4 h-px w-14" style={{ background: panel.fg, opacity: 0.35 }} />
              <div style={{ fontFamily: "var(--font-body)", opacity: 0.85 }} className="mt-5 space-y-3 leading-relaxed max-w-md">
                {inv.text.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 3).map((p, idx) => (
                  <p key={idx}>{barpo(p)}</p>
                ))}
              </div>
              {inv.key && (
                <div className="mt-5 pl-4 border-l-2" style={{ borderColor: panel.fg + "55" }}>
                  <p style={{ fontFamily: "var(--font-display)", opacity: 0.95 }} className="italic leading-snug whitespace-pre-line">
                    {barpo(inv.key)}
                  </p>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Forma slaydi — taklif yuborish */}
      <div className="h-full flex items-center shrink-0" style={{ width: "min(96vw, 720px)" }}>
        <div className="w-full px-5 md:px-16">
          <div style={{ fontFamily: "var(--font-body)" }} className="text-xs tracking-[0.3em] uppercase text-[#060920]/50">
            {t("SIZNING TAKLIFINGIZ", "ВАШЕ ПРЕДЛОЖЕНИЕ")}
          </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" name="fullName" placeholder={t("Ism-sharif (ixtiyoriy)", "Ф.И.О. (необязательно)")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                <input type="tel" name="phone" placeholder={t("Telefon (ixtiyoriy)", "Телефон (необязательно)")} inputMode="tel"
                  onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^\d+()\-\s]/g, ""); }}
                  style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              </div>
              <select name="category" required defaultValue="" style={{ fontFamily: "var(--font-body)" }} className={inputClass}>
                <option value="" disabled>{t("Taklif yo'nalishi *", "Направление *")}</option>
                {CATEGORIES.map((c) => <option key={c[0]} value={c[0]}>{t(c[0], c[1])}</option>)}
              </select>
              <input type="text" name="subject" required placeholder={t("Taklif mavzusi *", "Тема предложения *")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              <textarea name="message" required rows={4} placeholder={t("Taklifingizni batafsil yozing *", "Опишите предложение *")} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              {status === "error" && <p style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]">{errorMsg}</p>}
              <button type="submit" disabled={status === "sending"} style={{ fontFamily: "var(--font-body)" }}
                className="w-full px-8 py-3.5 bg-[#060920] text-white tracking-[0.15em] uppercase font-medium rounded-2xl transition-all hover:shadow-xl disabled:opacity-70">
                {status === "sending" ? t("Yuborilmoqda...", "Отправляется...") : t("Taklifni yuborish", "Отправить предложение")}
              </button>
            </form>
          )}
        </div>
      </div>
    </HorizontalGallery>
  );
}
