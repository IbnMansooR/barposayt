import { motion } from "motion/react";
import { SoftDivider } from "../app/components/SoftDivider";
import { BarpoWord } from "../app/components/Barpo";

const TERMS = [
  { t: "Genpudrat (bosh pudratchi)", d: "Butun qurilish jarayonini yagona javobgar tomon sifatida boshqaradigan kompaniya — reja, grafik, brigadalar va sifatni bir nuqtadan boshqaradi." },
  { t: "Texnik nazorat", d: "Ish sifatini ko'z bilan emas, o'lchov va mezon bilan tekshiruvchi mustaqil nazorat. Har bosqichni qabul qiladi." },
  { t: "Yopiladigan ish", d: "Keyin devor yoki pardoz ostida ko'rinmay qoladigan ishlar — armatura, kabel, quvur. Yopilishdan oldin tekshirilishi shart." },
  { t: "Smeta", d: "Bajariladigan ishlar va materiallarning hisob-kitobi, taxminiy narx jadvali. Ortiqcha xarajatni oldindan ko'rsatadi." },
  { t: "Qabul dalolatnomasi", d: "Bajarilgan ish tekshirilib, rasman qabul qilinganini tasdiqlovchi hujjat. Mas'uliyat va sifatni qayd etadi." },
  { t: "Ventilyatsiyali fasad", d: "Bino tashqi qoplamasi bilan devor orasida havo qatlami bo'lgan fasad tizimi — issiqlik va namlikni boshqaradi." },
  { t: "Past kuchlanish tizimi", d: "Internet, signalizatsiya, videonazorat, telefon kabi past quvvatli tarmoqlar. Binoning 'asab tizimi'ning bir qismi." },
  { t: "Loyiha yechimi", d: "Obyekt qanday quriladi va ishlaydi degan savolga texnik javob — chizmalar va qarorlar majmui." },
  { t: "Ekspluatatsiya xarajati", d: "Bino qurib bo'lingandan keyin uni ishlatish va xizmat ko'rsatish xarajatlari. To'g'ri yechim uni kamaytiradi." },
];

export function LugatPage() {
  return (
    <div className="relative bg-white pt-32 min-h-screen">
      <section className="px-8 md:px-16 pt-12 pb-12 text-center">
        <div className="max-w-4xl mx-auto">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            style={{ fontFamily: "var(--font-body)" }} className="text-sm tracking-[0.2em] uppercase text-[#060920]/50 mb-4">
<BarpoWord /> LUG'ATI
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.1 }}
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 4rem)", color: "#060920" }} className="tracking-tight leading-[1.1]">
            Qurilish tilini tushunarli qilamiz.
          </motion.h1>
        </div>
      </section>

      <section className="px-8 md:px-16 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {TERMS.map((term, i) => (
            <motion.div
              key={term.t}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-60px" }}
              transition={{ duration: 0.6, delay: (i % 3) * 0.05 }}
            >
              <div className="w-fit">
                <h2 style={{ fontFamily: "var(--font-display)" }} className="text-2xl text-[#060920]">{term.t}</h2>
                <SoftDivider className="mt-3" />
              </div>
              <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/70 leading-relaxed mt-4 text-lg max-w-3xl">{term.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="relative py-16 px-8 md:px-16 bg-[#060920]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 4vw, 2.5rem)", color: "#FFFFFF" }} className="tracking-tight">
            Tushunmagan atamangiz bo'lsa — biz tushuntiramiz.
          </h2>
          <a href="#contact" style={{ fontFamily: "var(--font-body)" }}
            className="inline-block px-8 py-3 bg-white text-[#060920] tracking-[0.15em] uppercase text-sm font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all">
            Savol berish
          </a>
        </div>
      </section>
    </div>
  );
}
