import { useEffect, useState } from "react";
import { Facebook, Instagram, Youtube, Send } from "lucide-react";
import logoLight from "../../assets/oqlogo.png";
import { useT } from "../i18n";

type Socials = { telegram?: string; instagram?: string; facebook?: string; youtube?: string };
type ContactInfo = { phone?: string; email?: string; address?: string };

export function Footer() {
  const t = useT();
  const [socials, setSocials] = useState<Socials>({});
  const [contact, setContact] = useState<ContactInfo>({});
  useEffect(() => {
    fetch("/api/socials")
      .then((r) => r.json())
      .then((j) => { if (j.ok) { setSocials(j.socials || {}); setContact(j.contact || {}); } })
      .catch(() => {});
  }, []);

  const socialIcons = [
    { Icon: Facebook, href: socials.facebook || "https://facebook.com/barpo.uz" },
    { Icon: Instagram, href: socials.instagram || "https://instagram.com/barpo.uz" },
    { Icon: Youtube, href: socials.youtube || "https://youtube.com/@barpo.uz" },
    { Icon: Send, href: socials.telegram || "https://t.me/barpo_uz" },
  ].filter((s) => s.href);

  return (
    <footer className="relative py-12 md:py-16 px-5 md:px-16 bg-[#060920]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div>
            <a href="#home">
              <img
                src={logoLight}
                alt="BARPO Logo"
                loading="lazy"
                decoding="async"
                className="h-10 mb-4 cursor-pointer hover:opacity-80 transition-opacity"
              />
            </a>
            <p style={{ fontFamily: 'var(--font-body)' }} className="tracking-wide text-white/50 max-w-md text-sm leading-relaxed">
              {t("BARPO — O'zbekistonda yangi qurilish madaniyatini shakllantirayotgan qurilish kompaniyasi.", "Строительная компания, формирующая новую культуру строительства в Узбекистане.")}
            </p>
            <p style={{ fontFamily: 'var(--font-body)' }} className="tracking-wide text-white/50 max-w-md text-sm leading-relaxed mt-3">
              {t("Biz tizim, sifat, nazorat, mas'uliyat va investor xotirjamligi asosida obyektlarni barpo etamiz.", "Мы возводим объекты на основе системы, качества, контроля, ответственности и спокойствия инвестора.")}
            </p>
            <p style={{ fontFamily: 'var(--font-display)' }} className="tracking-wide text-white/80 max-w-md text-base mt-5">
              {t("Biz qurmaymiz. Biz barpo etamiz.", "Мы не строим. Мы созидаем.")}
            </p>
            <div className="flex items-center gap-3 mt-6">
              {socialIcons.map(({ Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
                >
                  <Icon size={16} className="text-white/80" />
                </a>
              ))}
            </div>
          </div>

          <div className="flex gap-12 md:gap-16 flex-wrap">
            <div>
              <div style={{ fontFamily: 'var(--font-display)' }} className="text-sm text-white/60 mb-4 tracking-wide">
                {t("XIZMATLAR", "УСЛУГИ")}
              </div>
              {[
                { uz: "Bosh pudratchi", ru: "Генподряд" },
                { uz: "Qurilish ishlari", ru: "Строительные работы" },
                { uz: "Pardoz", ru: "Отделка" },
                { uz: "Muhandislik", ru: "Инженерия" },
                { uz: "Fasad", ru: "Фасад" },
              ].map((service) => (
                <a key={service.uz} href="#services" style={{ fontFamily: 'var(--font-body)' }} className="block text-sm text-white/50 hover:text-white cursor-pointer mb-2 transition-colors">
                  {t(service.uz, service.ru)}
                </a>
              ))}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)' }} className="text-sm text-white/60 mb-4 tracking-wide">
                {t("BO'LIMLAR", "РАЗДЕЛЫ")}
              </div>
              {[
                { uz: "HR — Bizga qo'shiling", ru: "HR — Присоединяйтесь", href: "#hr" },
                { uz: "Takliflar", ru: "Предложения", href: "#takliflar" },
                { uz: "Loyihalar", ru: "Проекты", href: "#projects" },
                { uz: "Standart", ru: "Стандарт", href: "#standard" },
                { uz: "Haqimizda", ru: "О нас", href: "#about" },
              ].map((item) => (
                <a key={item.href} href={item.href} style={{ fontFamily: 'var(--font-body)' }} className="block text-sm text-white/50 hover:text-white cursor-pointer mb-2 transition-colors">
                  {t(item.uz, item.ru)}
                </a>
              ))}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)' }} className="text-sm text-white/60 mb-4 tracking-wide">
                {t("ALOQA", "КОНТАКТЫ")}
              </div>
              <a href={`tel:${(contact.phone || "+998901234567").replace(/[^\d+]/g, "")}`} style={{ fontFamily: 'var(--font-body)' }} className="block text-sm text-white/50 hover:text-white cursor-pointer mb-2 transition-colors">
                {contact.phone || "+998 (90) 123-45-67"}
              </a>
              <a href={`mailto:${contact.email || "info@barpo.uz"}`} style={{ fontFamily: 'var(--font-body)' }} className="block text-sm text-white/50 hover:text-white cursor-pointer mb-2 transition-colors">
                {contact.email || "info@barpo.uz"}
              </a>
              <a href="#contact" style={{ fontFamily: 'var(--font-body)' }} className="inline-block mt-2 text-sm text-white/80 hover:text-white cursor-pointer transition-colors border-b border-white/30 hover:border-white pb-0.5">
                {t("Bog'lanish", "Связаться")} →
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
          <p style={{ fontFamily: 'var(--font-body)' }} className="tracking-wide text-white/40 text-center text-sm">
            {t("© 2026 BARPO. Barcha huquqlar himoyalangan. | Biz qurmaymiz. Biz barpo etamiz.", "© 2026 BARPO. Все права защищены. | Мы не строим. Мы созидаем.")}
          </p>
          <a href="#boshqaruv" style={{ fontFamily: 'var(--font-body)' }} className="text-xs tracking-wide text-white/30 hover:text-white/60 transition-colors">
            {t("Boshqaruv", "Управление")}
          </a>
        </div>
      </div>
    </footer>
  );
}
