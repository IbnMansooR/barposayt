import { motion } from "motion/react";
import { SoftDivider } from "../app/components/SoftDivider";

const blocks = [
  {
    num: "1",
    title: "Ortiqcha material sarfini kamaytirish",
    desc: "Material noto'g'ri hisoblanmasa, mijoz ortiqcha xarajat qilmaydi. Har bir xarid obyekt ehtiyoji bilan bog'langan bo'lishi kerak.",
  },
  {
    num: "2",
    title: "Qayta buzish xavfini kamaytirish",
    desc: "Xato vaqtida ko'rilsa, uni tuzatish arzonroq bo'ladi. Kech ko'rilgan xato esa pardoz, muhandislik yoki konstruksiyani qayta buzishga olib keladi.",
  },
  {
    num: "3",
    title: "Qarorlarni optimallashtirish",
    desc: "Ba'zi yechimlar ko'rinishda chiroyli, lekin iqtisodiy jihatdan og'ir bo'lishi mumkin. BARPO vazifani tushunib, samaraliroq variant taklif qiladi.",
  },
  {
    num: "4",
    title: "Muddatni nazorat qilish",
    desc: "Qurilishdagi har bir kechikish qo'shimcha xarajatdir: ijara, ishchi kuchi, texnika, kredit, ochilish sanasi. Shuning uchun vaqt ham budjetning bir qismi hisoblanadi.",
  },
  {
    num: "5",
    title: "Ekspluatatsiya xarajatlarini hisobga olish",
    desc: "To'g'ri muhandislik, sifatli fasad, qulay xizmat ko'rsatish nuqtalari kelajakdagi xarajatlarni kamaytiradi.",
  },
];

export function FoydaPage() {
  return (
    <div className="relative bg-white pt-32">
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center px-8 md:px-16 py-20">
        <div className="max-w-4xl w-full mx-auto space-y-6">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ fontFamily: "var(--font-body)" }}
            className="text-xs tracking-[0.25em] uppercase text-[#060920]/50"
          >
            Mijoz uchun iqtisodiy foyda
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 5vw, 4rem)",
              color: "#060920",
            }}
            className="tracking-tight"
          >
            Arzon qurish boshqa. To'g'ri qurish boshqa.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-16 h-1 rounded-full bg-[#060920]"
          />

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            style={{ fontFamily: "var(--font-body)", color: "#060920" }}
            className="text-lg leading-relaxed opacity-70 max-w-2xl"
          >
            BARPO mijoz mablag'ini faqat narxni tushirish orqali emas, xatolar, ortiqcha sarf, qayta ishlash va noto'g'ri qarorlarning oldini olish orqali himoya qiladi.
          </motion.p>
        </div>
      </section>

      {/* Bloklar */}
      <section className="relative py-16 px-8 md:px-16">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {blocks.map((item, i) => (
              <motion.div
                key={item.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.7, delay: i * 0.06 }}
                className="flex gap-5 items-start"
              >
                <span
                  style={{ fontFamily: "var(--font-display)" }}
                  className="text-3xl font-bold text-[#060920]/15 shrink-0 leading-none mt-1"
                >
                  {item.num}
                </span>
                <div className="space-y-2">
                  <div className="w-fit">
                    <h3 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">
                      {item.title}
                    </h3>
                    <SoftDivider className="mt-2.5" />
                  </div>
                  <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/60 leading-relaxed text-sm">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Kuchli case bloki */}
      <section className="relative py-16 px-8 md:px-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            className="p-8 md:p-10 border-l-4 border-[#060920] bg-white rounded space-y-4"
          >
            <h2
              style={{ fontFamily: "var(--font-display)", color: "#060920" }}
              className="text-2xl md:text-3xl tracking-tight"
            >
              Bir qaror — o'n minglab dollar farq.
            </h2>
            <p
              style={{ fontFamily: "var(--font-body)" }}
              className="text-[#060920]/65 leading-relaxed"
            >
              Ba'zan obyekt qiymatini kamaytirish uchun sifatni tushirish shart emas. To'g'ri tahlil, alternativ material, texnik yechim va pudratchi tajribasi orqali mijoz bir xil vazifani kamroq xarajat bilan hal qilishi mumkin.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 px-8 md:px-16 bg-[#060920]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 4vw, 2.5rem)", color: "#FFFFFF" }}
            className="tracking-tight"
          >
            Obyektingizdagi ortiqcha xarajat xavflarini tahlil qilamiz
          </motion.h2>
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ fontFamily: "var(--font-body)", textDecoration: "none" }}
            className="inline-block px-8 py-3 bg-white text-[#060920] tracking-[0.15em] uppercase text-sm font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            Tahlil uchun murojaat qilish
          </motion.a>
        </div>
      </section>
    </div>
  );
}
