import { useState } from "react";
import { motion } from "motion/react";
import { useT } from "../i18n";

// Yo'nalishga qarab sohalar ro'yxati — [uz, ru], saqlanadigan qiymat uz bo'lib qoladi
const FIELDS_BY_DIRECTION: Record<string, [string, string][]> = {
  Qurilish: [
    ["Bosh pudratchi", "Генеральный подрядчик"],
    ["Qurilish-montaj ishlari", "Строительно-монтажные работы"],
    ["Pardozlash ishlari", "Отделочные работы"],
    ["Muhandislik tizimlari", "Инженерные системы"],
    ["Fasad va tashqi ishlar", "Фасад и наружные работы"],
    ["Loyihalash / Smeta", "Проектирование / Смета"],
    ["Loyiha menejmenti", "Управление проектами"],
    ["HR / Ofis / Administratsiya", "HR / Офис / Администрация"],
    ["Boshqa", "Другое"],
  ],
  Marketing: [
    ["Marketolog", "Маркетолог"],
    ["SMM mutaxassisi", "SMM-специалист"],
    ["Kontent menejer", "Контент-менеджер"],
    ["Grafik dizayner", "Графический дизайнер"],
    ["Motion dizayner", "Motion-дизайнер"],
    ["Videograf", "Видеограф"],
    ["Mobilograf", "Мобилограф"],
    ["Kopirayter", "Копирайтер"],
    ["Targetolog", "Таргетолог"],
    ["PR", "PR"],
    ["Boshqa", "Другое"],
  ],
};

type Status = "idle" | "sending" | "success" | "error";

export function JoinFamily() {
  const t = useT();
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
      if (!res.ok || !json.ok) throw new Error(json.error || t("Yuborishda xatolik yuz berdi", "Произошла ошибка при отправке"));
      setStatus("success");
      formEl.reset();
      setFileName("");
      setDirection("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : t("Yuborishda xatolik yuz berdi", "Произошла ошибка при отправке"));
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
            {t("BIZGA QO'SHILING", "ПРИСОЕДИНЯЙТЕСЬ К НАМ")}
          </p>
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              color: "#060920",
            }}
            className="leading-[1.15] tracking-tight"
          >
            {t("BARPO oilasiga qo'shiling", "Присоединяйтесь к нашей команде")}
          </h2>
          <p
            style={{ fontFamily: "var(--font-body)" }}
            className="max-w-xl mx-auto leading-relaxed tracking-wide text-[#060920]/70"
          >
            {t(
              "Tartib, nazorat va sifatni qadrlaydigan jamoaga qo'shiling. O'zingiz haqingizda ma'lumot qoldiring va rezyumeingizni yuklang — biz siz bilan bog'lanamiz.",
              "Присоединяйтесь к команде, которая ценит порядок, контроль и качество. Оставьте информацию о себе и загрузите резюме — мы с вами свяжемся.",
            )}
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
              {t("Rahmat! Murojaatingiz qabul qilindi.", "Спасибо! Ваша заявка принята.")}
            </div>
            <p
              style={{ fontFamily: "var(--font-body)" }}
              className="text-[#060920]/70 tracking-wide"
            >
              {t("Ma'lumotlaringiz bazaga saqlandi. Tez orada siz bilan bog'lanamiz.", "Ваши данные сохранены в базе. Мы свяжемся с вами в ближайшее время.")}
            </p>
            <button
              onClick={() => setStatus("idle")}
              style={{ fontFamily: "var(--font-body)" }}
              className="mt-2 px-6 py-2 text-sm tracking-[0.15em] uppercase text-[#060920]/70 hover:text-[#060920] transition-colors"
            >
              {t("Yana yuborish", "Отправить ещё")}
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
            {/* Honeypot — botlar uchun, odamlar ko'rmaydi */}
            <input type="text" name="_hp" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }} aria-hidden="true" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="fullName"
                required
                placeholder={t("Ism-sharif *", "Ф.И.О. *")}
                style={{ fontFamily: "var(--font-body)" }}
                className={inputClass}
              />
              <input
                type="tel"
                name="phone"
                required
                placeholder={t("Telefon raqam *", "Телефон *")}
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
                  {t("Yo'nalish *", "Направление *")}
                </option>
                <option value="Qurilish">{t("Qurilish", "Строительство")}</option>
                <option value="Marketing">{t("Marketing", "Маркетинг")}</option>
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
                  {direction ? t("Qaysi soha bo'yicha? *", "По какому направлению? *") : t("Avval yo'nalishni tanlang", "Сначала выберите направление")}
                </option>
                {(FIELDS_BY_DIRECTION[direction] || []).map((f) => (
                  <option key={f[0]} value={f[0]}>
                    {t(f[0], f[1])}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="number"
              name="experienceYears"
              min={0}
              max={60}
              placeholder={t("Soha bo'yicha tajriba (yil)", "Опыт по направлению (лет)")}
              style={{ fontFamily: "var(--font-body)" }}
              className={inputClass}
            />

            <input
              type="email"
              name="email"
              placeholder={t("Email pochtangiz (javob shu manzilga yuboriladi)", "Ваш email (ответ придёт на этот адрес)")}
              inputMode="email"
              pattern="[^@\s]+@[^@\s]+\.[^@\s]{2,}"
              title={t("To'g'ri email kiriting, masalan: ism@gmail.com", "Введите корректный email, например: name@gmail.com")}
              onInput={(e) => { e.currentTarget.value = e.currentTarget.value.replace(/[^A-Za-z0-9@._%+\-]/g, ""); }}
              style={{ fontFamily: "var(--font-body)" }}
              className={inputClass}
            />

            <input
              type="text"
              name="contact"
              placeholder={t("Telegram yoki boshqa aloqa (masalan @username)", "Telegram или другой контакт (например @username)")}
              style={{ fontFamily: "var(--font-body)" }}
              className={inputClass}
            />

            {/* Rezyume yuklash */}
            <label
              style={{ fontFamily: "var(--font-body)" }}
              className="flex items-center gap-3 w-full px-4 py-3 bg-white/50 border border-dashed border-[#060920]/25 text-[#060920]/70 hover:border-[#060920]/50 transition-colors rounded-lg cursor-pointer"
            >
              <span className="truncate">
                {fileName || t("Rezyumeni yuklash (PDF, DOC, DOCX)", "Загрузить резюме (PDF, DOC, DOCX)")}
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
              {status === "sending" ? t("Yuborilmoqda...", "Отправляется...") : t("Murojaatni yuborish", "Отправить заявку")}
            </button>

            <p
              style={{ fontFamily: "var(--font-body)" }}
              className="text-xs text-[#060920]/40 text-center tracking-wide"
            >
              {t("* bilan belgilangan maydonlar majburiy", "Поля, отмеченные *, обязательны")}
            </p>
          </motion.form>
        )}
      </div>
    </section>
  );
}
