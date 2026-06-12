import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { SoftDivider } from "../app/components/SoftDivider";
import { Instagram, Facebook, Youtube, Send } from "lucide-react";

export function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: ""
  });

  const [formStatus, setFormStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("sending");
    setFormError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.name,
          phone: formData.phone,
          company: formData.company,
          email: formData.email,
          message: formData.message,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Yuborishda xatolik yuz berdi");
      setFormStatus("success");
      setFormData({ name: "", email: "", phone: "", company: "", message: "" });
    } catch (err) {
      setFormStatus("error");
      setFormError(err instanceof Error ? err.message : "Yuborishda xatolik yuz berdi");
    }
  };

  // Aloqa ma'lumotlari — admin panel Sozlamalaridan boshqariladi
  const [contactInfo, setContactInfo] = useState<{ phone?: string; email?: string; address?: string }>({});

  const contactMethods = [
    {
      title: "Telefon",
      details: contactInfo.phone || "",
      description: "Qo'ng'iroq qiling — biz bilan bog'laning"
    },
    {
      title: "Email",
      details: contactInfo.email || "",
      description: "Javob vaqti: 24 soat ichida"
    },
    {
      title: "Manzil",
      details: contactInfo.address || "",
      description: "Ofis manzili va uchrashuv joyi"
    }
  ].filter((m) => m.details);

  const TelegramIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="currentColor" viewBox="0 0 26 26">
      <path d="M2.14753 11.8099C7.3949 9.52374 10.894 8.01654 12.6447 7.28833C17.6435 5.20916 18.6822 4.84799 19.3592 4.83606C19.5081 4.83344 19.8411 4.87034 20.0567 5.04534C20.2388 5.1931 20.2889 5.39271 20.3129 5.5328C20.3369 5.6729 20.3667 5.99204 20.343 6.2414C20.0721 9.08763 18.9 15.9947 18.3037 19.1825C18.0514 20.5314 17.5546 20.9836 17.0736 21.0279C16.0283 21.1241 15.2345 20.3371 14.2221 19.6735C12.6379 18.635 11.7429 17.9885 10.2051 16.9751C8.42795 15.804 9.58001 15.1603 10.5928 14.1084C10.8579 13.8331 15.4635 9.64397 15.5526 9.26395C15.5637 9.21642 15.5741 9.03926 15.4688 8.94571C15.3636 8.85216 15.2083 8.88415 15.0962 8.9096C14.9373 8.94566 12.4064 10.6184 7.50365 13.928C6.78528 14.4212 6.13461 14.6616 5.55163 14.649C4.90893 14.6351 3.67265 14.2856 2.7536 13.9869C1.62635 13.6204 0.730432 13.4267 0.808447 12.8044C0.849081 12.4803 1.29544 12.1488 2.14753 11.8099Z" />
    </svg>
  );

  // Ijtimoiy tarmoq linklari — admin paneldan boshqariladi
  const [socials, setSocials] = useState<{ telegram?: string; instagram?: string; facebook?: string; youtube?: string }>({});
  useEffect(() => {
    fetch("/api/socials")
      .then((r) => r.json())
      .then((j) => { if (j.ok) { setSocials(j.socials || {}); setContactInfo(j.contact || {}); } })
      .catch(() => {});
  }, []);

  const socialLinks = [
    { name: "Telegram", link: socials.telegram, Icon: TelegramIcon },
    { name: "Instagram", link: socials.instagram, Icon: Instagram },
    { name: "Facebook", link: socials.facebook, Icon: Facebook },
    { name: "YouTube", link: socials.youtube, Icon: Youtube }
  ].filter((s) => s.link);

  return (
    <div className="relative bg-white pt-32">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center px-8 md:px-16 py-20 overflow-hidden">
        <div className="max-w-5xl w-full mx-auto text-center space-y-8">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ fontFamily: 'var(--font-display)' }}
            className="text-sm tracking-[0.15em] uppercase text-[#060920]/50"
          >
            Biz bilan bog'laning
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            }}
            className="text-[#060920] tracking-tight font-light leading-tight"
          >
            Loyihangizni Muhokama Qilaylik
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ fontFamily: 'var(--font-body)' }}
            className="text-lg text-[#060920]/60 max-w-2xl mx-auto"
          >
            Biz avval vazifani tushunamiz, keyin yechim taklif qilamiz. Har bir loyiha noyob, shuning uchun har biriga alohida yondashamiz.
          </motion.p>
        </div>
      </section>

      {/* Contact Methods Grid */}
      <section className="relative py-24 px-8 md:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
            {contactMethods.map((method, i) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
                className="space-y-3"
              >
                <div className="w-fit">
                  <h3
                    style={{ fontFamily: 'var(--font-display)' }}
                    className="text-2xl text-[#060920]"
                  >
                    {method.title}
                  </h3>
                  <SoftDivider className="mt-3" />
                </div>
                <p
                  style={{ fontFamily: 'var(--font-body)' }}
                  className="text-lg text-[#060920]/80 font-medium"
                >
                  {method.details}
                </p>
                <p
                  style={{ fontFamily: 'var(--font-body)' }}
                  className="text-[#060920]/60 leading-relaxed"
                >
                  {method.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tezkor aloqa — Murojaat formasi */}
      <section className="relative py-24 px-8 md:px-16 bg-[#060920]/2">
        <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="space-y-6">
                <div>
                  <p
                    style={{ fontFamily: 'var(--font-display)' }}
                    className="text-sm tracking-[0.15em] uppercase text-[#060920]/50 mb-3"
                  >
                    Tezkor aloqa
                  </p>
                  <h2
                    style={{ fontFamily: 'var(--font-display)' }}
                    className="text-3xl font-light text-[#060920]"
                  >
                    Murojaatni yuboring
                  </h2>
                </div>

                {formStatus === "success" ? (
                <div className="p-8 border border-[#060920]/15 bg-white/60 rounded-2xl text-center space-y-3">
                  <div style={{ fontFamily: 'var(--font-display)' }} className="text-xl text-[#060920]">
                    Rahmat! Murojaatingiz qabul qilindi.
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/70 text-sm">
                    Tez orada siz bilan bog'lanamiz.
                  </p>
                  <button
                    onClick={() => setFormStatus("idle")}
                    style={{ fontFamily: 'var(--font-body)' }}
                    className="mt-1 px-6 py-2 text-sm tracking-[0.15em] uppercase text-[#060920]/70 hover:text-[#060920] transition-colors"
                  >
                    Yana yuborish
                  </button>
                </div>
                ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Sizning ismingiz *"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={{ fontFamily: 'var(--font-body)' }}
                      className="px-4 py-4 bg-white/80 border border-[#060920]/10 text-[#060920] placeholder-[#060920]/40 focus:outline-none focus:bg-white focus:border-[#060920]/30 transition-colors rounded-xl"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email manzilingiz *"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{ fontFamily: 'var(--font-body)' }}
                      className="px-4 py-4 bg-white/80 border border-[#060920]/10 text-[#060920] placeholder-[#060920]/40 focus:outline-none focus:bg-white focus:border-[#060920]/30 transition-colors rounded-xl"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="tel"
                      placeholder="Telefon raqam *"
                      value={formData.phone}
                      inputMode="tel"
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^\d+()\-\s]/g, "") })}
                      style={{ fontFamily: 'var(--font-body)' }}
                      className="px-4 py-4 bg-white/80 border border-[#060920]/10 text-[#060920] placeholder-[#060920]/40 focus:outline-none focus:bg-white focus:border-[#060920]/30 transition-colors rounded-xl"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Kompaniya nomi"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      style={{ fontFamily: 'var(--font-body)' }}
                      className="px-4 py-4 bg-white/80 border border-[#060920]/10 text-[#060920] placeholder-[#060920]/40 focus:outline-none focus:bg-white focus:border-[#060920]/30 transition-colors rounded-xl"
                    />
                  </div>

                  <textarea
                    placeholder="Loyihangiz haqida qisqacha ma'lumot *"
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    style={{ fontFamily: 'var(--font-body)' }}
                    className="w-full px-4 py-4 bg-white/80 border border-[#060920]/10 text-[#060920] placeholder-[#060920]/40 focus:outline-none focus:bg-white focus:border-[#060920]/30 transition-colors resize-none rounded-xl"
                    required
                  />

                  {formStatus === "error" && (
                    <p style={{ fontFamily: 'var(--font-body)' }} className="text-sm text-[#060920]">{formError}</p>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={formStatus === "sending"}
                    style={{ fontFamily: 'var(--font-body)' }}
                    className="w-full px-8 py-4 bg-[#060920] text-white tracking-[0.15em] uppercase font-medium border border-[#060920]/20 shadow-lg transition-all hover:shadow-xl rounded-2xl disabled:opacity-70"
                  >
                    {formStatus === "sending" ? "Yuborilmoqda..." : "Murojaatni yuborish"}
                  </motion.button>
                </form>
                )}

                <p
                  style={{ fontFamily: 'var(--font-body)' }}
                  className="text-xs text-[#060920]/40"
                >
                  Yulduzcha (*) bilan belgilangan maydonlar to'ldirilishi shart.
                </p>
              </div>
            </motion.div>
        </div>
      </section>

      {/* Social Media */}
      <section className="relative py-20 px-8 md:px-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-10"
          >
            <div>
              <p
                style={{ fontFamily: 'var(--font-display)' }}
                className="text-sm tracking-[0.15em] uppercase text-[#060920]/50 mb-3"
              >
                Ijtimoiy tarmoqlar
              </p>
              <h2
                style={{ fontFamily: 'var(--font-display)' }}
                className="text-2xl md:text-3xl font-light text-[#060920]"
              >
                Bizni kuzatib boring
              </h2>
            </div>

            <style>{`
              .social-btn {
                background: #ffffff;
                position: relative;
                padding: 5px 15px;
                display: flex;
                align-items: center;
                font-size: 17px;
                font-weight: 600;
                text-decoration: none;
                cursor: pointer;
                border: 1px solid #060920;
                border-radius: 25px;
                outline: none;
                overflow: hidden;
                color: #060920;
                transition: color 0.3s ease-out, background-color 0.3s ease-out;
                text-align: center;
              }
              .social-btn span {
                margin: 10px;
              }
              .social-btn:hover {
                background: #060920;
                color: #ffffff;
                border: 1px solid #ffffff;
              }
            `}</style>
            <div className="flex justify-center gap-6 flex-wrap">
              {socialLinks.map((social, i) => (
                <motion.a
                  key={social.name}
                  href={social.link}
                  target={social.link !== "#" ? "_blank" : undefined}
                  rel={social.link !== "#" ? "noopener noreferrer" : undefined}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="social-btn"
                  style={{ fontFamily: 'var(--font-body)' }}
                >
                  <social.Icon width={22} height={22} size={22} />
                  <span>{social.name}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Map Placeholder */}
      <section className="relative py-20 px-8 md:px-16">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="rounded-3xl overflow-hidden border border-[#060920]/10 h-96 bg-[#060920]/5"
          >
            <iframe
              src="https://yandex.com/map-widget/v1/?ll=69.274312%2C41.311834&z=17&pt=69.274312%2C41.311834%2Cpm2rdm"
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              title="BARPO ofisi — Yandex xarita"
              className="w-full h-full"
            />
          </motion.div>
        </div>
      </section>

      {/* CTA 3 */}
      <section className="relative py-16 px-8 md:px-16 bg-[#060920]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: '#FFFFFF' }}
            className="tracking-tight"
          >
            BARPO bilan qurilish — bu xotirjamlik
          </motion.h2>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ fontFamily: 'var(--font-body)' }}
            className="space-y-1 text-white/50 text-base leading-relaxed"
          >
            <p>Tizim bor joyda tartib bor.</p>
            <p>Tartib bor joyda sifat bor.</p>
            <p>Sifat bor joyda natija bor.</p>
          </motion.div>
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ fontFamily: 'var(--font-body)', textDecoration: 'none' }}
            className="inline-block px-8 py-3 bg-white text-[#060920] tracking-[0.15em] uppercase text-sm font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            Biz bilan bog'lanish
          </motion.a>
        </div>
      </section>
    </div>
  );
}
