// BIR MARTALIK MIGRATSIYA (2026-07) — jonli Supabase bazasidagi allaqachon
// mavjud "ornaments" / "investors" / "standards" yozuvlariga, ular yaratilgan
// paytda hali RU maydonlar bo'lmagani sabab qolib ketgan ruscha tarjimalarni
// TO'LDIRADI. Faqat mos kelgan (matn bo'yicha) yozuvning BO'SH *Ru maydonini
// yozadi — mavjud UZ matnga yoki allaqachon to'ldirilgan RU matnga tegmaydi.
// Ishlatish: node scripts/backfill-ru-2026-07.mjs [--dry-run]
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(fileURLToPath(import.meta.url), "..", "..");
const dryRun = process.argv.includes("--dry-run");

function loadEnvLocal() {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) return;
  const raw = fs.readFileSync(path.join(root, ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const m = /^([A-Z_]+)=(.*)$/.exec(line.trim());
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}
loadEnvLocal();
const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// ---------- Tarjima lug'atlari (server/api-core.mjs dagi seed matnlar bilan bir xil) ----------
const ORNAMENT_RU = {
  "Girih naqshi": { oldRu: "Орнамент гирих", descRu: "Геометрическая точность была и остаётся главным правилом — вчера и сегодня" },
  "Zanjira naqshi": { oldRu: "Орнамент занджира", descRu: "Каждая деталь и этап связаны друг с другом" },
  // Jonli bazada "Zanjira naqshi" nomi keyinchalik "Bodom naqshi"ga o'zgartirilgan (desc matni bir xil qolgan) —
  // seed lug'atida yo'q edi, shuning uchun mos nom bilan qo'shildi.
  "Bodom naqshi": { oldRu: "Орнамент бодом", descRu: "Каждая деталь и этап связаны друг с другом" },
  "Turunj (markaz)": { oldRu: "Турундж (центр)", descRu: "Упорядоченное движение всего вокруг центра" },
  "Koshin (plitkalar)": { oldRu: "Кошин (плитка)", descRu: "Интеграция материалов и долговечность" },
};

const STANDARD_RU = {
  "Tizim": { titleRu: "Система", descRu: "Каждый объект ведётся на основе упорядоченного управления: ГПР, график работ, финансовый план, график ресурсов, график техники и ежедневный контроль" },
  "Sifat": { titleRu: "Качество", descRu: "Качество проверяется не только в конце. Оно контролируется каждый день, на каждом этапе, в каждом виде работ" },
  "Nazorat": { titleRu: "Контроль", descRu: "Должно быть видно, что происходит на объекте: кто работает, что сделано, сколько сделано, на каком этапе есть проблема" },
  "Mas'uliyat": { titleRu: "Ответственность", descRu: "Мы отвечаем за свои решения, работу и результат. Для нас важен не момент сдачи объекта, а то, чтобы он работал правильно" },
  "Shaffoflik": { titleRu: "Прозрачность", descRu: "Для инвестора расходы, процессы и решения должны быть понятны. Неопределённость в строительстве — это риск. Прозрачность — это управление" },
  "Xotirjamlik": { titleRu: "Спокойствие", descRu: "Клиент не должен каждый день бегать за объектом. Если система работает правильно, инвестор занимается стратегическими решениями, а процесс находится под контролем." },
  "Innovatsion yondashuv": { titleRu: "Инновационный подход", descRu: "Мы внедряем современное управление, инженерные решения и инструменты цифрового контроля в строительный процесс" },
  "Iqtisodiy samaradorlik": { titleRu: "Экономическая эффективность", descRu: "Правильное строительство — это не просто дёшево. Правильное строительство — это предотвращение лишних расходов, рациональное использование ресурсов и защита инвестиций" },
};

const INVESTOR_RU = {
  "Data center — raqamli iqtisodiyot infratuzilmasi": {
    titleRu: "Дата-центр — инфраструктура цифровой экономики",
    textRu: "Дата-центр — не обычное здание. Это стратегический объект, требующий инженерии высокого уровня, безопасности, энергетической устойчивости и бесперебойной работы.\n\nВ таком проекте каждое решение должно быть просчитано заранее: электрическая мощность, система охлаждения, резервное питание, пожарная безопасность, контроль доступа и удобство эксплуатации.\n\nBARPO рассматривает строительство дата-центра не просто как стройку, а как инфраструктуру непрерывности бизнеса.",
    keyRu: "Дата-центр — это не серверы внутри бетона.\nЭто система доверия, безопасности и бесперебойной работы." },
  "A klass biznes markazi — status, tizim va tijoriy qiymat": {
    titleRu: "Бизнес-центр класса А — статус, система и коммерческая ценность",
    textRu: "Бизнес-центр класса А — это не просто офисное здание. Он должен быть имиджем для компаний, комфортом для сотрудников и источником стабильного дохода для инвестора.\n\nВ таких объектах фасад, входная группа, лифтовая зона, парковка, инженерные системы, места общего пользования и эксплуатационные расходы должны продумываться как единая система.\n\nBARPO рассматривает бизнес-центры не просто как здание, которое нужно построить и сдать, а как работающий коммерческий актив.",
    keyRu: "Класс А — это не высота здания.\nЭто его управление, удобство и детали." },
  "Savdo markazi — odam oqimi ishlaydigan arxitektura": {
    titleRu: "Торговый центр — архитектура работающего людского потока",
    textRu: "Успех торгового центра зависит не только от площади. Поток людей, логика входа-выхода, навигация, расположение арендаторов, парковка и инженерные системы должны работать сообща.\n\nBARPO рассматривает торговые объекты с точки зрения коммерческого результата. Каждый метр, каждый проход, каждая зона должны служить движению клиента и эффективности бизнеса.",
    keyRu: "Торговый центр — это не магазины внутри стен.\nЭто поток людей и модель дохода." },
  "Park — shahar nafas oladigan joy": {
    titleRu: "Парк — место, где дышит город",
    textRu: "Строительство парка — это не просто благоустройство. Это проект, объединяющий городскую среду, движение людей, культуру отдыха и природный баланс.\n\nВ хорошем парке заранее продуманы дорожки, освещение, ландшафт, водная система, безопасность, зоны обслуживания и удобство эксплуатации.\n\nBARPO рассматривает парки и рекреационные зоны не только как красивые, но и как долговечно работающие пространства, куда люди возвращаются снова и снова.",
    keyRu: "Парк — это не просто зелёная зона.\nЭто культурный ритм городской жизни." },
  "Premium turar joy majmuasi — uy emas, yashash madaniyati": {
    titleRu: "Премиальный жилой комплекс — не просто дом, а культура жизни",
    textRu: "Премиальный жилой комплекс — это не только дорогие материалы или красивый фасад. Это система, делающая повседневную жизнь человека удобной, безопасной и эстетичной.\n\nВходная зона, двор, парковка, лифт, инженерные системы, шумоизоляция, фасад, общественные пространства и качество эксплуатации вместе создают премиальный уровень.\n\nBARPO объединяет деталь, инженерию, эстетику и долгосрочную ценность в строительстве премиальных жилых комплексов.",
    keyRu: "Премиум — это не внешний вид.\nПремиум — это качество, ощущаемое каждый день." },
  "Klinika — aniqlik, tozalik va muhandislik talabi": {
    titleRu: "Клиника — точность, чистота и инженерная строгость",
    textRu: "В медицинских объектах нельзя допускать ошибок. Здесь особое значение имеют планировка, вентиляция, стерильные зоны, разделение потоков, инженерные системы и удобство эксплуатации.\n\nBARPO подходит к строительству клиники с точки зрения пациента, врача и эксплуатационной команды.\n\nЗдание может быть красивым. Но клиника прежде всего должна правильно работать.",
    keyRu: "Строительство клиники — это не дизайн.\nЭто точность и ответственность." },
  "Mehmonxona — tajriba sotadigan obyekt": {
    titleRu: "Гостиница — объект, продающий впечатления",
    textRu: "В строительстве гостиницы каждая деталь влияет на впечатление гостя: первое впечатление от входа, эргономика номера, звукоизоляция, инженерные системы, сервисные зоны, эвакуация, освещение и общая атмосфера.\n\nBARPO рассматривает гостиничные объекты не просто как стройку, а как инфраструктуру сервисного бизнеса.",
    keyRu: "Гостиница — это не количество номеров.\nЭто впечатление, ради которого гость возвращается." },
  "Sanoat obyekti — jarayon uchun qurilgan bino": {
    titleRu: "Промышленный объект — здание, построенное для процесса",
    textRu: "На производственном объекте главное — правильная работа процесса. Логистика, движение техники, безопасность, погрузка, инженерные системы и удобство эксплуатации должны быть просчитаны заранее.\n\nBARPO, понимая бизнес-процесс, адаптирует строительное решение под этот процесс.",
    keyRu: "Промышленное здание — это не стены.\nЭто система, удерживающая ритм производства." },
};

function isBlank(v) { return v == null || String(v).trim() === ""; }

async function backfillKv(key, dict, matchField, fieldsToFill) {
  const { data, error } = await sb.from("kv").select("value").eq("key", key).maybeSingle();
  if (error) { console.error(`[${key}] o'qishda xato:`, error.message); return; }
  const arr = Array.isArray(data?.value) ? data.value : [];
  if (!arr.length) { console.log(`[${key}] bo'sh yoki topilmadi — o'tkazib yuborildi.`); return; }

  let changedCount = 0;
  const next = arr.map((item) => {
    const translation = dict[item[matchField]];
    if (!translation) {
      console.log(`[${key}] moslik topilmadi (tarjima lug'atida yo'q): "${item[matchField]}" — o'zgartirilmadi.`);
      return item;
    }
    const patch = {};
    let itemChanged = false;
    for (const f of fieldsToFill) {
      if (isBlank(item[f]) && !isBlank(translation[f])) {
        patch[f] = translation[f];
        itemChanged = true;
      }
    }
    if (itemChanged) {
      changedCount++;
      console.log(`[${key}] to'ldirildi: "${item[matchField]}" -> ${Object.keys(patch).join(", ")}`);
      return { ...item, ...patch };
    }
    return item;
  });

  console.log(`[${key}] jami ${arr.length} ta yozuv, ${changedCount} tasi yangilandi.`);
  if (changedCount === 0) return;
  if (dryRun) { console.log(`[${key}] --dry-run: yozilmadi.`); return; }
  const { error: writeErr } = await sb.from("kv").upsert({ key, value: next, updated_at: new Date().toISOString() });
  if (writeErr) console.error(`[${key}] yozishda xato:`, writeErr.message);
  else console.log(`[${key}] saqlandi ✓`);
}

console.log(dryRun ? "=== DRY RUN (hech narsa yozilmaydi) ===" : "=== HAQIQIY YOZISH ===");
await backfillKv("ornaments", ORNAMENT_RU, "old", ["oldRu", "descRu"]);
await backfillKv("standards", STANDARD_RU, "title", ["titleRu", "descRu"]);
await backfillKv("investors", INVESTOR_RU, "title", ["titleRu", "textRu", "keyRu"]);
console.log("Tugadi.");
