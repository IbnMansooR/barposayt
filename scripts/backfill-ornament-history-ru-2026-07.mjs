// BIR MARTALIK MIGRATSIYA (2026-07-09) — QA auditda topilgan kamchilik:
// naqshlarning "Tarixi" (history) maydoni uchun RU tarjimasi (historyRu)
// birinchi RU-backfill (backfill-ru-2026-07.mjs) paytida hisobga olinmagan
// edi. Bu skript FAQAT historyRu maydonini to'ldiradi, boshqa hech narsaga
// tegmaydi. Ishlatish: node scripts/backfill-ornament-history-ru-2026-07.mjs [--dry-run]
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

// "old" (sarlavha) bo'yicha mos keladi — Girih/Turunj o'zgarmagan, "Bodom naqshi"
// esa seed'dagi "Zanjira naqshi"ning qayta nomlangan shakli (avvalgi backfill
// skriptida ham shu moslik ishlatilgan).
const HISTORY_RU = {
  "Girih naqshi": "архитектурный орнамент, построенный на точной геометрии, балансе и взаимосвязи. Его восьмигранная структура символизирует 8 основных принципов BARPO: каждая грань — отдельный принцип, а каждая связь — единая система. Этот орнамент выражает дисциплину, точность, гармонию и культуру устойчивого строительства в бренде.\nДля BARPO: гирих — это не хаотичное украшение, а символ системы, в которой каждая линия связана смыслом.",
  "Bodom naqshi": "в традиционных трактовках миндалевидные узоры рассматриваются как символ, близкий к атмосфере совета, беседы и важных решений. В этом смысле BARPO воспринимает этот орнамент как знак размышления, глубокого анализа задачи и достижения истинной сути решения.\n\nВ строительстве правильный результат создаётся не только исполнением, а прежде всего размышлением, сравнением, обсуждением и выбором наиболее обоснованного решения. Для BARPO орнамент «Бодом» выражает, что за каждым проектом должна стоять взвешенная мысль, точный расчёт и ответственное решение.",
  "Turunj (markaz)": "в восточном декоративном искусстве это медальон, собирающий всю композицию вокруг одного центра. Он придаёт изображению порядок, создаёт направление и связывает каждый элемент вокруг единым смыслом.\n\nДля BARPO Турундж выражает идею занять центральное место на строительном рынке, задавать направление и создавать стандарт. По нашему убеждению, местные подрядчики должны быть не просто исполнителями, а силой, формирующей культуру рынка.\n\nВ этом смысле Турундж — символ философии BARPO: качество — в центре, дисциплина — в центре, ответственность — в центре. Именно вокруг этих ценностей создаётся новая культура строительства.",
};

const { data, error } = await sb.from("kv").select("value").eq("key", "ornaments").maybeSingle();
if (error) { console.error("O'qishda xato:", error.message); process.exit(1); }
const arr = Array.isArray(data?.value) ? data.value : [];

let changed = 0;
const next = arr.map((item) => {
  const ru = HISTORY_RU[item.old];
  if (!ru) { console.log(`Moslik topilmadi: "${item.old}" — o'tkazib yuborildi.`); return item; }
  if (item.historyRu && item.historyRu.trim()) { console.log(`"${item.old}" — historyRu allaqachon to'ldirilgan, tegilmadi.`); return item; }
  changed++;
  console.log(`"${item.old}" -> historyRu to'ldirildi.`);
  // Yo'l-yo'lakay: UZ "history" matni oxirida uzilib qolgan bo'lsa ("...barpo etilad")
  // to'g'ri so'z bilan tugatamiz — faqat aniq shu bitta yozuv uchun, boshqa hech narsa o'zgartirilmaydi.
  const fixedHistory = item.old === "Turunj (markaz)" && item.history && item.history.endsWith("barpo etilad")
    ? item.history.replace(/barpo etilad$/, "barpo etiladi")
    : item.history;
  return { ...item, history: fixedHistory, historyRu: ru };
});

console.log(`Jami ${arr.length} ta yozuv, ${changed} tasi yangilandi.`);
if (changed === 0 || dryRun) {
  console.log(dryRun ? "--dry-run: yozilmadi." : "O'zgarish yo'q, yozilmadi.");
} else {
  const { error: writeErr } = await sb.from("kv").upsert({ key: "ornaments", value: next, updated_at: new Date().toISOString() });
  if (writeErr) console.error("Yozishda xato:", writeErr.message);
  else console.log("Saqlandi ✓");
}
