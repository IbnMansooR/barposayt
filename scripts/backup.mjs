// BARPO sayt — lokal backup logikasi.
// `data/` (takliflar, loyihalar, history, rasmlar) va `HR_baza/` papkalarini
// `backups/backup_<sana>/` ichiga nusxalaydi. Oxirgi 10 ta backup saqlanadi.
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const KEEP_BACKUPS = 10; // nechta oxirgi backup saqlansin
const SOURCES = ["data", "HR_baza"]; // backup qilinadigan papkalar

// Backupni bajaradi. root — loyiha ildizi. Yaratilgan papka yo'lini qaytaradi.
export function runBackup(root) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 16); // 2026-06-06T14-30
  const backupsDir = path.join(root, "backups");
  const dest = path.join(backupsDir, `backup_${stamp}`);
  fs.mkdirSync(dest, { recursive: true });

  let copiedAny = false;
  for (const s of SOURCES) {
    const src = path.join(root, s);
    if (fs.existsSync(src)) {
      fs.cpSync(src, path.join(dest, s), { recursive: true });
      copiedAny = true;
    }
  }

  // Hech narsa bo'lmasa, bo'sh backup papkasini o'chiramiz
  if (!copiedAny) {
    fs.rmSync(dest, { recursive: true, force: true });
    return null;
  }

  // Oxirgi backup vaqtini belgilab qo'yamiz
  fs.writeFileSync(
    path.join(backupsDir, "last_backup.json"),
    JSON.stringify({ time: new Date().toISOString(), folder: `backup_${stamp}` }, null, 2),
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
  const dest = runBackup(root);
  if (dest) console.log("✓ Backup yaratildi:", dest);
  else console.log("Backup qilinadigan ma'lumot topilmadi (data/ va HR_baza/ bo'sh).");
}
