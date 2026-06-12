import { motion } from "motion/react";
import { SoftDivider } from "../app/components/SoftDivider";

const ROLES = [
  { role: "Loyiha rahbari", desc: "Jarayonning umumiy ritmi, muddat va mas'uliyatni nazorat qiladi." },
  { role: "Texnik nazorat", desc: "Ish sifatini ko'z bilan emas, mezon bilan tekshiradi." },
  { role: "Prorab", desc: "Maydondagi kunlik harakat, brigadalar va vazifalarni boshqaradi." },
  { role: "Muhandis", desc: "Ko'rinmaydigan tizimlar xavfsiz va to'g'ri ishlashini ta'minlaydi." },
  { role: "Ta'minot", desc: "Material o'z vaqtida kelmasa, grafik buziladi. Shu sabab ta'minot ham qurilishning muhim qismi." },
  { role: "Marketing / aloqa", desc: "Mijozga kompaniya madaniyati, jarayon va natija to'g'ri yetkaziladi." },
];

export function JamoaPage() {
  return (
    <div className="relative bg-white pt-32">
      {/* Hero */}
      <section className="px-8 md:px-16 pt-12 pb-12 text-center">
        <div className="max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ fontFamily: "var(--font-body)" }}
            className="text-sm tracking-[0.2em] uppercase text-[#060920]/50 mb-4"
          >
            JAMOA
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 4rem)", color: "#060920" }}
            className="tracking-tight leading-[1.1]"
          >
            Obyektni bitta odam emas. Tizimga ulangan jamoa quradi.
          </motion.h1>
        </div>
      </section>

      {/* Roles */}
      <section className="px-8 md:px-16 py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-14 gap-y-10">
          {ROLES.map((r, i) => (
            <motion.div
              key={r.role}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ duration: 0.7, delay: i * 0.06 }}
              className="space-y-3"
            >
              <div className="w-fit">
                <h3 style={{ fontFamily: "var(--font-display)" }} className="text-2xl text-[#060920]">{r.role}</h3>
                <SoftDivider className="mt-3" />
              </div>
              <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/65 leading-relaxed">{r.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 px-8 md:px-16 bg-[#060920]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 4vw, 2.5rem)", color: "#FFFFFF" }} className="tracking-tight">
            Tizimli jamoa bilan ishlashni xohlaysizmi?
          </h2>
          <a href="#contact" style={{ fontFamily: "var(--font-body)" }}
            className="inline-block px-8 py-3 bg-white text-[#060920] tracking-[0.15em] uppercase text-sm font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all">
            Bog'lanish
          </a>
        </div>
      </section>
    </div>
  );
}
