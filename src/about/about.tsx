import { motion } from "motion/react";
import { SoftDivider } from "../app/components/SoftDivider";
import { barpo } from "../app/components/Barpo";
import { useT } from "../app/i18n";

export function AboutPage() {
  const t = useT();
  const values = [
    { title: ["Tizim", "Система"], desc: ["Har qanday katta natija boshqariladigan jarayondan boshlanadi.", "Любой большой результат начинается с управляемого процесса."] },
    { title: ["Sifat", "Качество"], desc: ["Sifat — ko'rinish emas, qabul mezoni.", "Качество — не внешний вид, а критерий приёмки."] },
    { title: ["Mas'uliyat", "Ответственность"], desc: ["Ishni olish — natija uchun javob berish degani.", "Взять работу — значит отвечать за результат."] },
    { title: ["Tozalik", "Чистота"], desc: ["Toza obyekt — tartibli fikrning belgisi.", "Чистый объект — признак упорядоченного мышления."] },
    { title: ["Hurmat", "Уважение"], desc: ["Mijozning vaqti, ishonchi va mablag'i hurmat qilinadi.", "Время, доверие и средства клиента уважаются."] },
    { title: ["Milliy ildiz", "Национальные корни"], desc: ["Biz zamonaviy qurilishni O'zbekistonning me'moriy xotirasi va bunyodkorlik ruhidan uzmaymiz.", "Мы не отрываем современное строительство от архитектурной памяти и созидательного духа Узбекистана."] },
  ];

  const team = [
    { role: ["Loyiha rahbari", "Руководитель проекта"], desc: ["Jarayonning umumiy ritmi, muddat va mas'uliyatni nazorat qiladi.", "Контролирует общий ритм процесса, сроки и ответственность."] },
    { role: ["Texnik nazorat", "Технический надзор"], desc: ["Ish sifatini ko'z bilan emas, mezon bilan tekshiradi.", "Проверяет качество работ не на глаз, а по критериям."] },
    { role: ["Prorab", "Прораб"], desc: ["Maydondagi kunlik harakat, brigadalar va vazifalarni boshqaradi.", "Управляет ежедневной работой на площадке, бригадами и задачами."] },
    { role: ["Muhandis", "Инженер"], desc: ["Ko'rinmaydigan tizimlar xavfsiz va to'g'ri ishlashini ta'minlaydi.", "Обеспечивает безопасную и правильную работу скрытых систем."] },
    { role: ["Ta'minot", "Снабжение"], desc: ["Material o'z vaqtida kelmasa, grafik buziladi. Shu sabab ta'minot muhim.", "Если материал не приходит вовремя, график рушится. Поэтому снабжение важно."] },
    { role: ["Marketing / aloqa", "Маркетинг / коммуникация"], desc: ["Mijozga kompaniya madaniyati, jarayon va natija to'g'ri yetkaziladi.", "Клиенту правильно доносятся культура компании, процесс и результат."] },
  ];

  const reasons = [
    { num: "01", title: ["Chunki biz jarayonni ko'ramiz", "Потому что мы видим процесс"], desc: ["Ko'pchilik natijani oxirida ko'radi. Biz esa natijani boshidan rejalashtiramiz.", "Большинство видит результат в конце. А мы планируем результат с самого начала."] },
    { num: "02", title: ["Chunki biz xarajatni nazorat qilamiz", "Потому что мы контролируем расходы"], desc: ["Ortiqcha xarajat ko'pincha qimmat materialdan emas, noto'g'ri qarordan boshlanadi.", "Лишние расходы чаще начинаются не с дорогого материала, а с неверного решения."] },
    { num: "03", title: ["Chunki biz sifatni har kuni tekshiramiz", "Потому что мы проверяем качество каждый день"], desc: ["Sifat yakunda \"to'g'rilanadigan\" narsa emas. Sifat har bosqichda quriladi.", "Качество — не то, что «исправляют» в конце. Качество создаётся на каждом этапе."] },
    { num: "04", title: ["Chunki biz investor vaqtini qadrlaymiz", "Потому что мы ценим время инвестора"], desc: ["Investor obyekt ortidan yugurmasligi kerak. U qaror qabul qilishi kerak. Jarayon esa tizim bilan boshqarilishi kerak.", "Инвестор не должен бегать за объектом. Он должен принимать решения. А процессом должна управлять система."] },
    { num: "05", title: ["Chunki biz javobgarlikni bo'lib tashlamaymiz", "Потому что мы не перекладываем ответственность"], desc: ["Obyektda muammo bo'lsa, bahona emas, yechim kerak. BARPO mas'uliyatni jarayonning markaziga qo'yadi.", "Если на объекте проблема — нужно решение, а не оправдание. Мы ставим ответственность в центр процесса."] },
  ];

  const trust = [
    { title: ["Tajriba", "Опыт"], text: ["O'zbekistonda katta va murakkab loyihalarni boshqarish tajribasiga ega.", "Имеет опыт управления крупными и сложными проектами в Узбекистане."] },
    { title: ["Tizim", "Система"], text: ["Qurilishni tartibsizlikdan tizimga o'zgartiradigan boshqaruvga ega kompaniya.", "Компания с управлением, превращающим строительство из хаоса в систему."] },
    { title: ["Javobgarlik", "Ответственность"], text: ["Har bir qaror va har bir ish uchun aniq javobgarlik olamiz.", "Берём чёткую ответственность за каждое решение и каждую работу."] },
    { title: ["Sifat", "Качество"], text: ["Sifatni faqat gap bilan emas, qabul mezonlari bilan ta'minlaymiz.", "Обеспечиваем качество не словами, а критериями приёмки."] },
    { title: ["Mijoz fokusi", "Фокус на клиенте"], text: ["Mijozning xotirjamligi va ishonchi — bizning asosiy maqsadimiz.", "Спокойствие и доверие клиента — наша главная цель."] },
  ];

  return (
    <div className="relative bg-white pt-32">
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center justify-center px-8 md:px-16 py-20">
        <div className="max-w-4xl w-full mx-auto space-y-8">
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 4rem)', color: '#060920' }}
            className="tracking-tight"
          >
            {barpo(t("BARPO — qurilishdagi tartib g'oyasidan tug'ilgan kompaniya", "Компания, рождённая из идеи порядка в строительстве"))}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
            style={{ fontFamily: 'var(--font-body)', color: '#060920' }} className="space-y-4 text-lg leading-relaxed opacity-70"
          >
            <p>{t("Biz O'zbekistonda qurilish faqat tezlik va narx bilan emas, madaniyat, mas'uliyat, nazorat va sifat bilan o'lchanadigan bo'lishiga ishonamiz.", "Мы верим, что строительство в Узбекистане должно измеряться не только скоростью и ценой, но и культурой, ответственностью, контролем и качеством.")}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.35 }}
            style={{ fontFamily: 'var(--font-body)', color: '#060920' }} className="space-y-4 leading-relaxed opacity-60 text-base"
          >
            <p>
              {barpo(t("BARPO oddiy qurilish kompaniyasi bo'lish uchun yaratilmagan. Biz bozorning og'riqli nuqtalarini ko'rdik: tartibsiz brigadalar, noaniq muddatlar, qayta-qayta tuzatishlar, mijozning charchashi, sifatga bo'lgan befarqlik.", "Мы созданы не для того, чтобы быть обычной строительной компанией. Мы увидели болевые точки рынка: беспорядочные бригады, неясные сроки, постоянные переделки, усталость клиента, безразличие к качеству."))}
            </p>
            <p>
              {barpo(t("Shu sababli BARPO o'z oldiga boshqa vazifa qo'ydi — qurilish jarayoniga tizim olib kirish. Har bir ishda reja, nazorat, intizom va mijozga hurmat bo'lishi kerak.", "Поэтому мы поставили перед собой иную задачу — внедрить систему в строительный процесс. В каждой работе должны быть план, контроль, дисциплина и уважение к клиенту."))}
            </p>
            <p>
              {t("Biz uchun qurilish — bu shunchaki devor ko'tarish emas. Bu kelajakda ishlaydigan, foyda keltiradigan, odamlar foydalanadigan muhit yaratishdir.", "Для нас строительство — это не просто возведение стен. Это создание среды, которая будет работать в будущем, приносить пользу и служить людям.")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="relative py-20 px-8 md:px-16 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false }} transition={{ duration: 0.8 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', color: '#060920' }} className="text-2xl mb-4 tracking-tight">
              {t("Bizning missiyamiz", "Наша миссия")}
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', color: '#060920' }} className="text-lg opacity-70 leading-relaxed">
              {t("Bizning missiyamiz — O'zbekistonda qurilish madaniyatini yangi bosqichga olib chiqish. Qurilishda sifatsizlik, kechikish, ortiqcha xarajat, tartibsiz boshqaruv va noaniq javobgarlik odatiy holat bo'lmasligi kerak.", "Наша миссия — вывести культуру строительства в Узбекистане на новый уровень. Низкое качество, задержки, лишние расходы, беспорядочное управление и неясная ответственность не должны быть нормой в строительстве.")} {barpo(t("BARPO sifat, intizom, shaffoflik va mas'uliyatni bozordagi norma darajasiga olib chiqishni maqsad qilgan. Biz uchun har bir obyekt — bu faqat loyiha emas. Bu mijoz ishonchi, investor kapitali va shahar kelajagi oldidagi javobgarlik.", "Мы ставим целью сделать качество, дисциплину, прозрачность и ответственность нормой рынка. Для нас каждый объект — это не просто проект. Это доверие клиента, капитал инвестора и ответственность перед будущим города."))}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false }} transition={{ duration: 0.8, delay: 0.1 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', color: '#060920' }} className="text-2xl mb-4 tracking-tight">
              {t("Biz qanday qurilish kelajagini ko'ramiz?", "Каким мы видим будущее строительства?")}
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', color: '#060920' }} className="text-lg opacity-70 leading-relaxed">
              {t("Biz qurilishda \"qandaydir qilib tugatish\" yondashuvi o'rniga aniq tizim, chuqur reja va professional nazoratga asoslangan madaniyatni ko'ramiz. Kelajak qurilishi — bu faqat baland binolar emas. Bu yaxshi boshqarilgan jarayon, uzoq xizmat qiladigan sifat, iqtisodiy jihatdan to'g'ri qaror va mijoz uchun xotirjamlik.", "Вместо подхода «как-нибудь закончить» мы видим культуру, основанную на чёткой системе, глубоком плане и профессиональном контроле. Строительство будущего — это не только высокие здания. Это хорошо управляемый процесс, долговечное качество, экономически верное решение и спокойствие для клиента.")}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', color: '#060920' }} className="text-lg opacity-70 leading-relaxed mt-4">
              {barpo(t("BARPO shu kelajakni bugundan barpo etadi", "Мы созидаем это будущее уже сегодня"))}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="relative py-20 px-8 md:px-16">
        <div className="max-w-6xl mx-auto">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: '#060920' }} className="text-center mb-12 tracking-tight">
            {t("Qadriyatlarimiz", "Наши ценности")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-10">
            {values.map((value, i) => (
              <motion.div key={value.title[0]} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} transition={{ duration: 0.8, delay: i * 0.08 }} className="space-y-3">
                <div className="w-fit">
                  <h3 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl text-[#060920]">{t(value.title[0], value.title[1])}</h3>
                  <SoftDivider className="mt-3" />
                </div>
                <p style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/60 leading-relaxed">{t(value.desc[0], value.desc[1])}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Nima uchun BARPO */}
      <section className="relative py-20 px-8 md:px-16">
        <div className="max-w-6xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} transition={{ duration: 0.8 }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: '#060920' }} className="mb-4 tracking-tight">
            {barpo(t("Nima uchun BARPO?", "Почему мы?"))}
          </motion.h2>
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} transition={{ duration: 0.6, delay: 0.1 }} className="mb-12 w-16 h-1 rounded-full bg-[#060920]" />

          <div className="space-y-6">
            {reasons.map((item, i) => (
              <motion.div key={item.num} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false }} transition={{ duration: 0.6, delay: i * 0.07 }} className="flex gap-6 md:gap-10 items-start py-6">
                <span style={{ fontFamily: 'var(--font-display)' }} className="text-4xl font-bold text-[#060920]/15 shrink-0 leading-none mt-1">{item.num}</span>
                <div className="space-y-3">
                  <div className="w-fit">
                    <h3 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl text-[#060920] tracking-tight">{barpo(t(item.title[0], item.title[1]))}</h3>
                    <SoftDivider className="mt-3" />
                  </div>
                  <p style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/60 leading-relaxed">{barpo(t(item.desc[0], item.desc[1]))}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Rahbar / Asoschi */}
      <section className="relative py-20 px-8 md:px-16 bg-white">
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} transition={{ duration: 0.8 }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: '#060920' }} className="tracking-tight">
            {t("Qurilishdagi tartibga bo'lgan talab shaxsiy tajribadan boshlangan", "Требование к порядку в строительстве началось с личного опыта")}
          </motion.h2>
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} transition={{ duration: 0.6, delay: 0.1 }} className="w-16 h-1 rounded-full bg-[#060920]" />
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} transition={{ duration: 0.8, delay: 0.2 }}
            style={{ fontFamily: 'var(--font-body)' }} className="space-y-4 text-[#060920]/70 leading-relaxed text-lg">
            <p>
              {barpo(t("BARPO asoschisi Farruxon Shohdiyorxon Umidxon o'g'li qurilishga tasodifan kelmagan. Uning arxitektura va dizayn bo'yicha ta'limi, davlat tizimidagi tajribasi, ishlab chiqarish va biznesdagi amaliyoti bir fikrga olib kelgan: O'zbekistonda sifatli qurilish faqat yaxshi ustalar bilan emas, kuchli boshqaruv madaniyati bilan rivojlanadi.", "Основатель компании Фаррухон Шохдиёрхон Умидхон ўғли пришёл в строительство не случайно. Его образование в области архитектуры и дизайна, опыт в государственной системе, практика в производстве и бизнесе привели к одной мысли: качественное строительство в Узбекистане развивается не только хорошими мастерами, но и сильной культурой управления."))}
            </p>
            <p>
              {barpo(t("BARPO ana shu qarashning natijasi. Kompaniya har bir obyektga shunchaki pudratchi sifatida emas, mijoz kapitali, vaqti va ishonchini himoya qiladigan mas'ul tizim sifatida kiradi.", "Компания — результат именно этого взгляда. К каждому объекту она подходит не просто как подрядчик, а как ответственная система, защищающая капитал, время и доверие клиента."))}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Ishonish kerak */}
      <section className="relative py-20 px-8 md:px-16">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} transition={{ duration: 0.8 }} className="mb-14">
            <p style={{ fontFamily: 'var(--font-display)' }} className="text-sm tracking-[0.15em] uppercase text-[#060920]/50 mb-3">{t("Biz haqimizda", "О нас")}</p>
            <h2 style={{ fontFamily: 'var(--font-display)' }} className="text-3xl font-light text-[#060920] leading-tight">
              {barpo(t("Nima uchun BARPO'ga ishonish kerak?", "Почему стоит доверять нам?"))}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10">
            {trust.map((item, i) => (
              <motion.div key={item.title[0]} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} transition={{ duration: 0.6, delay: i * 0.08 }} className="space-y-3">
                <div className="w-fit">
                  <h3 style={{ fontFamily: 'var(--font-display)' }} className="text-xl text-[#060920]">{t(item.title[0], item.title[1])}</h3>
                  <SoftDivider className="mt-2.5" />
                </div>
                <p style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/60 leading-relaxed">{t(item.text[0], item.text[1])}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="relative py-20 px-8 md:px-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: '#060920' }} className="text-center mb-12 tracking-tight">
            {t("Jamoa", "Команда")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {team.map((member, i) => (
              <motion.div key={member.role[0]} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} transition={{ duration: 0.8, delay: i * 0.08 }} className="space-y-3">
                <div className="w-fit">
                  <h3 style={{ fontFamily: 'var(--font-display)' }} className="text-2xl text-[#060920]">{t(member.role[0], member.role[1])}</h3>
                  <SoftDivider className="mt-3" />
                </div>
                <p style={{ fontFamily: 'var(--font-body)' }} className="text-[#060920]/60 leading-relaxed">{t(member.desc[0], member.desc[1])}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Iqtibos */}
      <section className="relative py-16 px-8 md:px-16">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} transition={{ duration: 0.8 }} className="p-8 border-l-4 border-[#060920] bg-white rounded">
            <p style={{ fontFamily: 'var(--font-body)' }} className="text-base md:text-lg italic text-[#060920]/50 leading-relaxed">
              {t("\"Qurilishning barakasi — obyektning \"taqir-tuqur\" etib, ish bilan jaranglab turishidadir\"", "«Благодать строительства — в том, чтобы объект кипел работой и звенел делом»")}
            </p>
            <p style={{ fontFamily: 'var(--font-body)' }} className="mt-4 text-sm md:text-base italic text-[#060920]/70 text-right">
              Shoxdiyorxon Farruxon
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-16 px-8 md:px-16 bg-[#060920]">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: false }} transition={{ duration: 0.8 }}
            style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: '#FFFFFF' }} className="tracking-tight">
            {barpo(t("BARPO bilan qurilish — bu xotirjamlik", "Строительство со спокойствием"), true)}
          </motion.h2>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: false }} transition={{ duration: 0.8, delay: 0.2 }}
            style={{ fontFamily: 'var(--font-body)' }} className="space-y-1 text-white/50 text-base leading-relaxed">
            <p>{t("Tizim bor joyda tartib bor.", "Где система — там порядок.")}</p>
            <p>{t("Tartib bor joyda sifat bor.", "Где порядок — там качество.")}</p>
            <p>{t("Sifat bor joyda natija bor.", "Где качество — там результат.")}</p>
          </motion.div>
          <motion.a href="#contact" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            style={{ fontFamily: 'var(--font-body)', textDecoration: 'none' }}
            className="inline-block px-8 py-3 bg-white text-[#060920] tracking-[0.15em] uppercase text-sm font-medium rounded-2xl shadow-lg hover:shadow-xl transition-all">
            {t("Biz bilan bog'lanish", "Связаться с нами")}
          </motion.a>
        </div>
      </section>
    </div>
  );
}
