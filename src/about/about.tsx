import { motion } from "motion/react";
import { SoftDivider } from "../app/components/SoftDivider";

export function AboutPage() {
  const values = [
    { title: "Tizim", desc: "Har qanday katta natija boshqariladigan jarayondan boshlanadi." },
    { title: "Sifat", desc: "Sifat — ko'rinish emas, qabul mezoni." },
    { title: "Mas'uliyat", desc: "Ishni olish — natija uchun javob berish degani." },
    { title: "Tozalik", desc: "Toza obyekt — tartibli fikrning belgisi." },
    { title: "Hurmat", desc: "Mijozning vaqti, ishonchi va mablag'i hurmat qilinadi." },
    { title: "Milliy ildiz", desc: "Biz zamonaviy qurilishni O'zbekistonning me'moriy xotirasi va bunyodkorlik ruhidan uzmaymiz." }
  ];

  const team = [
    { role: "Loyiha rahbari", desc: "Jarayonning umumiy ritmi, muddat va mas'uliyatni nazorat qiladi." },
    { role: "Texnik nazorat", desc: "Ish sifatini ko'z bilan emas, mezon bilan tekshiradi." },
    { role: "Prorab", desc: "Maydondagi kunlik harakat, brigadalar va vazifalarni boshqaradi." },
    { role: "Muhandis", desc: "Ko'rinmaydigan tizimlar xavfsiz va to'g'ri ishlashini ta'minlaydi." },
    { role: "Ta'minot", desc: "Material o'z vaqtida kelmasa, grafik buziladi. Shu sabab ta'minot muhim." },
    { role: "Marketing / aloqa", desc: "Mijozga kompaniya madaniyati, jarayon va natija to'g'ri yetkaziladi." }
  ];

  return (
    <div className="relative bg-white pt-32">
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center justify-center px-8 md:px-16 py-20">
        <div className="max-w-4xl w-full mx-auto space-y-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              color: '#060920'
            }}
            className="tracking-tight"
          >
            BARPO — qurilishdagi tartib g'oyasidan tug'ilgan kompaniya
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ fontFamily: 'var(--font-body)', color: '#060920' }}
            className="space-y-4 text-lg leading-relaxed opacity-70"
          >
            <p>
              Biz O'zbekistonda qurilish faqat tezlik va narx bilan emas, madaniyat, mas'uliyat, nazorat va sifat bilan o'lchanadigan bo'lishiga ishonamiz.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35 }}
            style={{ fontFamily: 'var(--font-body)', color: '#060920' }}
            className="space-y-4 leading-relaxed opacity-60 text-base"
          >
            <p>
              BARPO oddiy qurilish kompaniyasi bo'lish uchun yaratilmagan. Biz bozorning og'riqli nuqtalarini ko'rdik: tartibsiz brigadalar, noaniq muddatlar, qayta-qayta tuzatishlar, mijozning charchashi, sifatga bo'lgan befarqlik.
            </p>
            <p>
              Shu sababli BARPO o'z oldiga boshqa vazifa qo'ydi — qurilish jarayoniga tizim olib kirish. Har bir ishda reja, nazorat, intizom va mijozga hurmat bo'lishi kerak.
            </p>
            <p>
              Biz uchun qurilish — bu shunchaki devor ko'tarish emas. Bu kelajakda ishlaydigan, foyda keltiradigan, odamlar foydalanadigan muhit yaratishdir.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="relative py-20 px-8 md:px-16 bg-[#060920]/5">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
          >
            <h2
              style={{ fontFamily: 'var(--font-display)', color: '#060920' }}
              className="text-2xl mb-4 tracking-tight"
            >
              Bizning missiyamiz
            </h2>
            <p
              style={{ fontFamily: 'var(--font-body)', color: '#060920' }}
              className="text-lg opacity-70 leading-relaxed"
            >
              Bizning missiyamiz — O‘zbekistonda qurilish madaniyatini yangi bosqichga olib chiqish. Qurilishda sifatsizlik, kechikish, ortiqcha xarajat, tartibsiz boshqaruv va noaniq javobgarlik odatiy holat bo‘lmasligi kerak. BARPO sifat, intizom, shaffoflik va mas’uliyatni bozordagi norma darajasiga olib chiqishni maqsad qilgan. Biz uchun har bir obyekt — bu faqat loyiha emas. Bu mijoz ishonchi, investor kapitali va shahar kelajagi oldidagi javobgarlik
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            <h2
              style={{ fontFamily: 'var(--font-display)', color: '#060920' }}
              className="text-2xl mb-4 tracking-tight"
            >
              Biz qanday qurilish kelajagini ko‘ramiz?
            </h2>
            <p
              style={{ fontFamily: 'var(--font-body)', color: '#060920' }}
              className="text-lg opacity-70 leading-relaxed"
            >
              Biz qurilishda “qandaydir qilib tugatish” yondashuvi o‘rniga aniq tizim, chuqur reja va professional nazoratga asoslangan madaniyatni ko‘ramiz.
Kelajak qurilishi — bu faqat baland binolar emas. Bu yaxshi boshqarilgan jarayon, uzoq xizmat qiladigan sifat, iqtisodiy jihatdan to‘g‘ri qaror va mijoz uchun xotirjamlik.
            </p>
            
             <p
              style={{ fontFamily: 'var(--font-body)', color: '#060920' }}
              className="text-lg opacity-70 leading-relaxed"
            >
              BARPO shu kelajakni bugundan barpo etadi
            </p>
            
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="relative py-20 px-8 md:px-16">
        <div className="max-w-6xl mx-auto">
          <h2
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: '#060920' }}
            className="text-center mb-12 tracking-tight"
          >
            Qadriyatlarimiz
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-10">
            {values.map((value, i) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.8, delay: i * 0.08 }}
                className="space-y-3"
              >
                <div className="w-fit">
                  <h3
                    style={{ fontFamily: 'var(--font-display)' }}
                    className="text-2xl text-[#060920]"
                  >
                    {value.title}
                  </h3>
                  <SoftDivider className="mt-3" />
                </div>
                <p
                  style={{ fontFamily: 'var(--font-body)' }}
                  className="text-[#060920]/60 leading-relaxed"
                >
                  {value.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Nima uchun BARPO */}
      <section className="relative py-20 px-8 md:px-16">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: '#060920' }}
            className="mb-4 tracking-tight"
          >
            Nima uchun BARPO?
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12 w-16 h-1 rounded-full bg-[#060920]"
          />

          <div className="space-y-6">
            {[
              {
                num: "01",
                title: "Chunki biz jarayonni ko'ramiz",
                desc: "Ko'pchilik natijani oxirida ko'radi. Biz esa natijani boshidan rejalashtiramiz.",
              },
              {
                num: "02",
                title: "Chunki biz xarajatni nazorat qilamiz",
                desc: "Ortiqcha xarajat ko'pincha qimmat materialdan emas, noto'g'ri qarordan boshlanadi.",
              },
              {
                num: "03",
                title: "Chunki biz sifatni har kuni tekshiramiz",
                desc: "Sifat yakunda \"to'g'rilanadigan\" narsa emas. Sifat har bosqichda quriladi.",
              },
              {
                num: "04",
                title: "Chunki biz investor vaqtini qadrlaymiz",
                desc: "Investor obyekt ortidan yugurmasligi kerak. U qaror qabul qilishi kerak. Jarayon esa tizim bilan boshqarilishi kerak.",
              },
              {
                num: "05",
                title: "Chunki biz javobgarlikni bo'lib tashlamaymiz",
                desc: "Obyektda muammo bo'lsa, bahona emas, yechim kerak. BARPO mas'uliyatni jarayonning markaziga qo'yadi.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.num}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, delay: i * 0.07 }}
                className="flex gap-6 md:gap-10 items-start py-6"
              >
                <span
                  style={{ fontFamily: 'var(--font-display)' }}
                  className="text-4xl font-bold text-[#060920]/15 shrink-0 leading-none mt-1"
                >
                  {item.num}
                </span>
                <div className="space-y-3">
                  <div className="w-fit">
                    <h3
                      style={{ fontFamily: 'var(--font-display)' }}
                      className="text-2xl text-[#060920] tracking-tight"
                    >
                      {item.title}
                    </h3>
                    <SoftDivider className="mt-3" />
                  </div>
                  <p
                    style={{ fontFamily: 'var(--font-body)' }}
                    className="text-[#060920]/60 leading-relaxed"
                  >
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Rahbar / Asoschi */}
      <section className="relative py-20 px-8 md:px-16 bg-[#060920]/5">
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: '#060920' }}
            className="tracking-tight"
          >
            Qurilishdagi tartibga bo'lgan talab shaxsiy tajribadan boshlangan
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-16 h-1 rounded-full bg-[#060920]"
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ fontFamily: 'var(--font-body)' }}
            className="space-y-4 text-[#060920]/70 leading-relaxed text-lg"
          >
            <p>
              BARPO asoschisi Farruxon Shohdiyorxon Umidxon o'g'li qurilishga tasodifan kelmagan. Uning arxitektura va dizayn bo'yicha ta'limi, davlat tizimidagi tajribasi, ishlab chiqarish va biznesdagi amaliyoti bir fikrga olib kelgan: O'zbekistonda sifatli qurilish faqat yaxshi ustalar bilan emas, kuchli boshqaruv madaniyati bilan rivojlanadi.
            </p>
            <p>
              BARPO ana shu qarashning natijasi. Kompaniya har bir obyektga shunchaki pudratchi sifatida emas, mijoz kapitali, vaqti va ishonchini himoya qiladigan mas'ul tizim sifatida kiradi.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Nima uchun BARPO'ga ishonish kerak? */}
      <section className="relative py-20 px-8 md:px-16">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            className="mb-14"
          >
            <p
              style={{ fontFamily: 'var(--font-display)' }}
              className="text-sm tracking-[0.15em] uppercase text-[#060920]/50 mb-3"
            >
              Biz haqimizda
            </p>
            <h2
              style={{ fontFamily: 'var(--font-display)' }}
              className="text-3xl font-light text-[#060920] leading-tight"
            >
              Nima uchun BARPO'ga ishonish kerak?
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
            {[
              {
                title: "Tajriba",
                text: "O'zbekistonda katta va murakkab loyihalarni boshqarish tajribasiga ega."
              },
              {
                title: "Tizim",
                text: "Qurilishni tartibsizlikdan tizimga o'zgartiradigan boshqaruvga ega kompaniya."
              },
              {
                title: "Javobgarlik",
                text: "Har bir qaror va har bir ish uchun aniq javobgarlik olamiz."
              },
              {
                title: "Sifat",
                text: "Sifatni faqat gap bilan emas, qabul mezonlari bilan ta'minlaymiz."
              },
              {
                title: "Mijoz fokusi",
                text: "Mijozning xotirjamligi va ishonchi — bizning asosiy maqsadimiz."
              }
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                className="space-y-3"
              >
                <div className="w-fit">
                  <h3
                    style={{ fontFamily: 'var(--font-display)' }}
                    className="text-xl text-[#060920]"
                  >
                    {item.title}
                  </h3>
                  <SoftDivider className="mt-2.5" />
                </div>
                <p
                  style={{ fontFamily: 'var(--font-body)' }}
                  className="text-[#060920]/60 leading-relaxed"
                >
                  {item.text}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="relative py-20 px-8 md:px-16 bg-[#060920]/5">
        <div className="max-w-6xl mx-auto">
          <h2
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: '#060920' }}
            className="text-center mb-12 tracking-tight"
          >
            Jamoa
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {team.map((member, i) => (
              <motion.div
                key={member.role}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.8, delay: i * 0.08 }}
                className="space-y-3"
              >
                <div className="w-fit">
                  <h3
                    style={{ fontFamily: 'var(--font-display)' }}
                    className="text-2xl text-[#060920]"
                  >
                    {member.role}
                  </h3>
                  <SoftDivider className="mt-3" />
                </div>
                <p
                  style={{ fontFamily: 'var(--font-body)' }}
                  className="text-[#060920]/60 leading-relaxed"
                >
                  {member.desc}
                </p>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Iqtibos */}
      <section className="relative py-16 px-8 md:px-16">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false }}
            transition={{ duration: 0.8 }}
            className="p-8 border-l-4 border-[#060920] bg-[#060920]/5 rounded"
          >
            <p
              style={{ fontFamily: 'var(--font-body)' }}
              className="text-base md:text-lg italic text-[#060920]/50 leading-relaxed"
            >
              "Qurilishning barakasi — obyektning "taqir-tuqur" etib, ish bilan jaranglab turishidadir"
            </p>
            <p
              style={{ fontFamily: 'var(--font-body)' }}
              className="mt-4 text-sm md:text-base italic text-[#060920]/70 text-right"
            >
              Shoxdiyorxon Farruxon
            </p>
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
