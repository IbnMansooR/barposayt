// BARPO sayt — Supabase backup logikasi.
// Saytning HAQIQIY ma'lumotlari Supabase'da turadi: `kv` jadvali (barcha matn/JSON
// kontent) va Storage bucket'lari (`images`, `resumes`). Bu skript shularni
// `backups/backup_<sana>/` ichiga yuklab oladi. Oxirgi 10 ta backup saqlanadi.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const KEEP_BACKUPS = 10; // nechta oxirgi backup saqlansin
const IMAGE_FOLDERS = ["ornament", "project", "section", "blog"]; // images bucket ichidagi bo'limlar

function loadEnvLocal(root) {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY) return;
  try {
    const raw = fs.readFileSync(path.join(root, ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = /^([A-Z_]+)=(.*)$/.exec(line.trim());
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {}
}

async function downloadInto(sb, bucket, remotePath, localPath) {
  const { data, error } = await sb.storage.from(bucket).download(remotePath);
  if (error || !data) return false;
  fs.mkdirSync(path.dirname(localPath), { recursive: true });
  fs.writeFileSync(localPath, Buffer.from(await data.arrayBuffer()));
  return true;
}

// Backupni bajaradi. root — loyiha ildizi. Yaratilgan papka yo'lini qaytaradi
// (yoki Supabase'ga ulanib bo'lmasa/xatolik chiqsa null).
export async function runBackup(root) {
  loadEnvLocal(root);
  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("Backup: SUPABASE_URL / SUPABASE_SERVICE_KEY topilmadi (.env.local'ni tekshiring).");
    return null;
  }
  const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });

  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 16); // 2026-06-06T14-30
  const backupsDir = path.join(root, "backups");
  const dest = path.join(backupsDir, `backup_${stamp}`);
  fs.mkdirSync(dest, { recursive: true });

  // 1) Butun `kv` jadvali (loyihalar, naqshlar, standartlar, investorlar, blog,
  //    xizmatlar, madaniyat, sozlamalar, adminlar, tarix — saytning barcha matn
  //    kontenti) bitta JSON faylga yoziladi.
  const { data: kvRows, error: kvErr } = await sb.from("kv").select("key, value, updated_at");
  if (kvErr) console.error("Backup: kv jadvalini o'qib bo'lmadi:", kvErr.message);
  else fs.writeFileSync(path.join(dest, "kv.json"), JSON.stringify(kvRows, null, 2), "utf8");

  // 2) `images` bucket'idagi ma'lum bo'limlar (naqsh/loyiha/bo'lim/blog rasmlari).
  let fileCount = 0;
  for (const folder of IMAGE_FOLDERS) {
    const { data: files, error } = await sb.storage.from("images").list(folder, { limit: 1000 });
    if (error || !files) continue;
    for (const f of files) {
      const ok = await downloadInto(sb, "images", `${folder}/${f.name}`, path.join(dest, "images", folder, f.name));
      if (ok) fileCount++;
    }
  }

  // 3) Rezyume fayllari — `resumes` bucket'i ichidagi papka nomlari tasodifiy
  //    (har bir HR arizasining `folder` maydoni), shu sabab ularni bevosita
  //    bucket'ni "kôrlab" aylanish o'rniga, endigina o'qilgan kv'dagi haqiqiy
  //    `hr` ro'yxatidan olamiz — bu ancha ishonchli va aniq.
  const hrRow = (kvRows || []).find((r) => r.key === "hr");
  const hrList = Array.isArray(hrRow?.value) ? hrRow.value : [];
  for (const rec of hrList) {
    if (!rec?.folder) continue;
    const { data: files, error } = await sb.storage.from("resumes").list(rec.folder, { limit: 100 });
    if (error || !files) continue;
    for (const f of files) {
      const ok = await downloadInto(sb, "resumes", `${rec.folder}/${f.name}`, path.join(dest, "resumes", rec.folder, f.name));
      if (ok) fileCount++;
    }
  }

  fs.writeFileSync(
    path.join(backupsDir, "last_backup.json"),
    JSON.stringify({ time: new Date().toISOString(), folder: `backup_${stamp}`, kvRows: (kvRows || []).length, files: fileCount }, null, 2),
    "utf8"
  );

  pruneOld(backupsDir, KEEP_BACKUPS);
  return dest;
}

// Eski backuplarni o'chirib, faqat oxirgi `keep` tasini qoldiradi
function pruneOld(backupsDir, keep) {
  if (!fs.existsSync(backupsDir)) return;
  const dirs = fs
    .readdirSync(backupsDir)
    .filter((d) => d.startsWith("backup_"))
    .sort(); // nom sana asosida — alfavit tartibi = vaqt tartibi
  while (dirs.length > keep) {
    const old = dirs.shift();
    fs.rmSync(path.join(backupsDir, old), { recursive: true, force: true });
  }
}

// Oxirgi backup vaqtini (ms) qaytaradi. Hech qachon bo'lmagan bo'lsa 0.
export function getLastBackupTime(root) {
  try {
    const f = path.join(root, "backups", "last_backup.json");
    if (!fs.existsSync(f)) return 0;
    return new Date(JSON.parse(fs.readFileSync(f, "utf8")).time).getTime();
  } catch {
    return 0;
  }
}

// CLI rejimi: `node scripts/backup.mjs` to'g'ridan-to'g'ri ishga tushirilganda
const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isDirectRun) {
  const root = path.resolve(fileURLToPath(import.meta.url), "..", "..");
  const dest = await runBackup(root);
  if (dest) console.log("✓ Backup yaratildi:", dest);
  else console.log("Backup yaratilmadi — Supabase'ga ulanishda muammo bo'ldi (yuqoridagi xatoni tekshiring).");
}
