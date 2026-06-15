import { motion } from "motion/react";
import { SoftDivider } from "../app/components/SoftDivider";
import { BarpoWord } from "../app/components/Barpo";

export function RahbarPage() {
  return (
    <div className="relative bg-white pt-32">
      {/* Hero */}
      <section className="px-8 md:px-16 pt-12 pb-10">
        <div className="max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ fontFamily: "var(--font-body)" }}
            className="text-sm tracking-[0.2em] uppercase text-[#060920]/50 mb-4"
          >
            RAHBAR / ASOSCHI
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 4rem)", color: "#060920" }}
            className="tracking-tight leading-[1.1]"
          >
            Qurilishdagi tartibga bo'lgan talab shaxsiy tajribadan boshlangan.
          </motion.h1>
        </div>
      </section>

      {/* Body */}
      <section className="px-8 md:px-16 py-12">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, margin: "-80px" }}
            transition={{ duration: 0.8 }}
            className="bg-white rounded-3xl card-shadow p-8 md:p-10"
          >
            <div className="w-fit mb-5">
              <h2 style={{ fontFamily: "var(--font-display)" }} className="text-2xl text-[#060920]">
                Farruxon Shohdiyorxon Umidxon o'g'li
              </h2>
              <SoftDivider className="mt-3" />
            </div>
            <div style={{ fontFamily: "var(--font-body)" }} className="space-y-4 text-[#060920]/75 leading-relaxed text-lg">
              <p>
<BarpoWord /> asoschisi Farruxon Shohdiyorxon Umidxon o'g'li qurilishga tasodifan kelmagan.
                Uning arxitektura va dizayn bo'yicha ta'limi, davlat tizimidagi tajribasi, ishlab chiqarish
                va biznesdagi amaliyoti bir fikrga olib kelgan: O'zbekistonda sifatli qurilish faqat yaxshi
                ustalar bilan emas, kuchli boshqaruv madaniyati bilan rivojlanadi.
              </p>
              <p>
<BarpoWord /> ana shu qarashning natijasi. Kompaniya har bir obyektga shunchaki pudratchi sifatida
                emas, mijoz kapitali, vaqti va ishonchini himoya qiladigan mas'ul tizim sifatida kiradi.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 px-8 md:px-16 bg-[#060920]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 4vw, 2.5rem)", color: "#FFFFFF" }} className="tracking-tight">
<BarpoWord light /> bilan tizimli qurilishni boshlang
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
