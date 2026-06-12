import { useEffect, useState } from "react";
import { Facebook, Instagram, Youtube, Send } from "lucide-react";
import logoLight from "../../assets/Logo dark night.png";

type Socials = { telegram?: string; instagram?: string; facebook?: string; youtube?: string };
type ContactInfo = { phone?: string; email?: string; address?: string };

export function Footer() {
  const [socials, setSocials] = useState<Socials>({});
  const [contact, setContact] = useState<ContactInfo>({});
  useEffect(() => {
    fetch("/api/socials")
      .then((r) => r.json())
      .then((j) => { if (j.ok) { setSocials(j.socials || {}); setContact(j.contact || {}); } })
      .catch(() => {});
  }, []);

  const socialIcons = [
    { Icon: Facebook, href: socials.facebook },
    { Icon: Instagram, href: socials.instagram },
    { Icon: Youtube, href: socials.youtube },
    { Icon: Send, href: socials.telegram },
  ].filter((s) => s.href);

  return (
    <footer className="relative py-16 px-8 md:px-16 bg-[#060920]">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div>
            <a href="#home">
              <img
                src={logoLight}
                alt="BARPO Logo"
                className="h-10 mb-4 cursor-pointer hover:opacity-80 transition-opacity"
              />
            </a>
            <p style={{ fontFamily: 'var(--font-body)' }} className="tracking-wide text-white/50 max-w-md text-sm leading-relaxed">
              BARPO — O'zbekistonda yangi qurilish madaniyatini shakllantirayotgan qurilish kompaniyasi.
            </p>
            <p style={{ fontFamily: 'var(--font-body)' }} className="tracking-wide text-white/50 max-w-md text-sm leading-relaxed mt-3">
              Biz tizim, sifat, nazorat, mas'uliyat va investor xotirjamligi asosida obyektlarni barpo etamiz.
            </p>
            <p style={{ fontFamily: 'var(--font-display)' }} className="tracking-wide text-white/80 max-w-md text-base mt-5">
              Biz qurmaymiz. Biz barpo etamiz.
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
                XIZMATLAR
              </div>
              {["Bosh pudratchi", "Qurilish ishlari", "Pardoz", "Muhandislik", "Fasad"].map((service) => (
                <a key={service} href="#services" style={{ fontFamily: 'var(--font-body)' }} className="block text-sm text-white/50 hover:text-white cursor-pointer mb-2 transition-colors">
                  {service}
                </a>
              ))}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)' }} className="text-sm text-white/60 mb-4 tracking-wide">
                BO'LIMLAR
              </div>
              {[
                { label: "HR — Bizga qo'shiling", href: "#hr" },
                { label: "Takliflar", href: "#takliflar" },
                { label: "Loyihalar", href: "#projects" },
                { label: "Standart", href: "#standard" },
                { label: "Haqimizda", href: "#about" },
              ].map((item) => (
                <a key={item.label} href={item.href} style={{ fontFamily: 'var(--font-body)' }} className="block text-sm text-white/50 hover:text-white cursor-pointer mb-2 transition-colors">
                  {item.label}
                </a>
              ))}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)' }} className="text-sm text-white/60 mb-4 tracking-wide">
                ALOQA
              </div>
              <a href={`tel:${(contact.phone || "+998901234567").replace(/[^\d+]/g, "")}`} style={{ fontFamily: 'var(--font-body)' }} className="block text-sm text-white/50 hover:text-white cursor-pointer mb-2 transition-colors">
                {contact.phone || "+998 (90) 123-45-67"}
              </a>
              <a href={`mailto:${contact.email || "info@barpo.uz"}`} style={{ fontFamily: 'var(--font-body)' }} className="block text-sm text-white/50 hover:text-white cursor-pointer mb-2 transition-colors">
                {contact.email || "info@barpo.uz"}
              </a>
              <a href="#contact" style={{ fontFamily: 'var(--font-body)' }} className="inline-block mt-2 text-sm text-white/80 hover:text-white cursor-pointer transition-colors border-b border-white/30 hover:border-white pb-0.5">
                Bog'lanish →
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
          <p style={{ fontFamily: 'var(--font-body)' }} className="tracking-wide text-white/40 text-center text-sm">
            © 2026 BARPO. Barcha huquqlar himoyalangan. | Biz qurmaymiz. Biz barpo etamiz.
          </p>
          <a href="#boshqaruv" style={{ fontFamily: 'var(--font-body)' }} className="text-xs tracking-wide text-white/30 hover:text-white/60 transition-colors">
            Boshqaruv
          </a>
        </div>
      </div>
    </footer>
  );
}
