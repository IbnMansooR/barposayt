import { motion } from "motion/react";
import { SoftDivider } from "../app/components/SoftDivider";

const RUBRICS = [
  {
    title: "BARPO Standarti",
    articles: [
      "Devor tekisligi nima uchun muhim?",
      "Pardoz sifatini buzadigan 5 ta yashirin xato",
      "Nima uchun yopiladigan ishlar oldin tekshirilishi kerak?",
      "Toza obyekt — xavfsizlik va sifat belgisi",
    ],
  },
  {
    title: "Mijoz iqtisodiy foydasi",
    articles: [
      "Qurilishda ortiqcha xarajat qayerdan chiqadi?",
      "Arzon smeta nima uchun qimmatga tushadi?",
      "Noto'g'ri muhandislik yechimi kelajakda qanday xarajat keltiradi?",
      "Materialni tejash va sifatni tushirish — bir xil narsa emas",
    ],
  },
  {
    title: "Yangi qurilish madaniyati",
    articles: [
      "Qurilishda madaniyat nimadan boshlanadi?",
      "O'zbek me'morchiligidan zamonaviy qurilish nimani o'rganishi mumkin?",
      "Nima uchun tartib — tezlikning asosi?",
      "Buyurtmachi xotirjamligi qurilish xizmatining bir qismi bo'lishi kerak",
    ],
  },
  {
    title: "Tarix va zamonaviylik",
    articles: [
      "Girih naqshidan zamonaviy grid tizimigacha",
      "Koshin va zamonaviy fasad materiallari",
      "Gumbazdan long-span konstruksiyalargacha",
      "Amir Temur davridagi bunyodkorlik ruhi va bugungi qurilish",
    ],
  },
];

export function BlogPage() {
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
            BILIM MARKAZI
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 4rem)", color: "#060920" }}
            className="tracking-tight leading-[1.1]"
          >
            Qurilish haqida gapirmaymiz. Qurilish qanday ishlashini tushuntiramiz.
          </motion.h1>
        </div>
      </section>

      {/* Rubrics */}
      <section className="px-8 md:px-16 py-12">
        <div className="max-w-5xl mx-auto space-y-14">
          {RUBRICS.map((rub, ri) => (
            <motion.div
              key={rub.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-60px" }}
              transition={{ duration: 0.7, delay: ri * 0.05 }}
            >
              <div className="w-fit mb-6">
                <h2 style={{ fontFamily: "var(--font-display)" }} className="text-2xl md:text-3xl text-[#060920]">{rub.title}</h2>
                <SoftDivider className="mt-3" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {rub.articles.map((a) => (
                  <div
                    key={a}
                    className="bg-white rounded-2xl card-shadow p-6 cursor-pointer group"
                  >
                    <h3 style={{ fontFamily: "var(--font-display)" }} className="text-lg text-[#060920] leading-snug group-hover:opacity-70 transition-opacity">
                      {a}
                    </h3>
                    <span style={{ fontFamily: "var(--font-body)" }} className="mt-3 inline-block text-xs tracking-[0.15em] uppercase text-[#060920]/40">
                      Tez orada →
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 px-8 md:px-16 bg-[#060920]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.5rem, 4vw, 2.5rem)", color: "#FFFFFF" }} className="tracking-tight">
            Savolingiz bormi? Mutaxassislarimiz javob beradi.
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
