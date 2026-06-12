import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff } from "lucide-react";

const CREDS_KEY = "barpo_admin_creds";

interface Creds {
  username: string;
  password: string;
  name: string;
}

function loadCreds(): Creds | null {
  try {
    const raw = sessionStorage.getItem(CREDS_KEY);
    return raw ? (JSON.parse(raw) as Creds) : null;
  } catch {
    return null;
  }
}

type Tab = "projects" | "ornaments" | "offers" | "standards" | "investors" | "sections" | "stats" | "suggestions" | "hr" | "contacts" | "settings" | "tasks" | "admins";

// Bo'lim ruxsatlari (superadmin boshqaradi)
const PERM_LABELS: { key: string; label: string }[] = [
  { key: "projects", label: "Loyihalar" },
  { key: "ornaments", label: "Naqshlar" },
  { key: "standards", label: "Standartlar" },
  { key: "investors", label: "Investorlar" },
  { key: "offers", label: "Takliflar" },
  { key: "sections", label: "Bo'lim rasmlari" },
  { key: "stats", label: "Statistika" },
  { key: "suggestions", label: "Kelgan takliflar" },
  { key: "hr", label: "HR arizalari" },
  { key: "contacts", label: "Aloqa so'rovlari" },
  { key: "settings", label: "Sozlamalar" },
];

interface AdminUser {
  username: string; password: string; name: string;
  role: "superadmin" | "admin";
  perms: Record<string, boolean>;
}
interface TaskItem {
  id: string; title: string; desc: string; assignee: string;
  status: "pending" | "done"; createdBy: string; createdAt: string; doneAt: string | null;
}
interface Me {
  username: string; name: string; role: "superadmin" | "admin";
  perms: Record<string, boolean>;
}

interface Settings {
  notifyEmails: string[];
  notifyEmailsByType: { hr: string[]; suggestion: string[]; contact: string[] };
  smtp: { host?: string; port?: string; secure?: boolean; user?: string; pass?: string; from?: string };
  sheetsWebhook: string;
  telegram: TgConfig;
  telegramByType: { hr: TgConfig; suggestion: TgConfig; contact: TgConfig };
  socials: { telegram: string; instagram: string; facebook: string; youtube: string };
  contactInfo: { phone: string; email: string; address: string };
}
interface TgConfig { botToken: string; chatIds: string[]; }
type TgKey = "general" | "hr" | "suggestion" | "contact";
const emptyTg = (): TgConfig => ({ botToken: "", chatIds: [] });

interface StatItem { value: string; label: string; }
const DEFAULT_STATS: StatItem[] = [
  { value: "10+", label: "Yillik tajriba" },
  { value: "50+", label: "Loyihalar yakunlandi" },
  { value: "100%", label: "Mijozlar mamnunligi" },
];

// Madaniyat va Xizmatlar sahifalaridagi rasm boxlari
const SECTION_IMAGE_GROUPS: { group: string; items: { key: string; label: string }[] }[] = [
  {
    group: "Madaniyat sahifasi",
    items: [
      { key: "culture-0", label: "Tartib" },
      { key: "culture-1", label: "Hisob" },
      { key: "culture-2", label: "Intizom" },
      { key: "culture-3", label: "Hurmat" },
      { key: "culture-4", label: "Meros" },
    ],
  },
  {
    group: "Xizmatlar sahifasi",
    items: [
      { key: "service-1", label: "1 · Bosh pudratchi xizmatlari" },
      { key: "service-2", label: "2 · Qurilish-montaj ishlari" },
      { key: "service-3", label: "3 · Fasad va tashqi ishlar" },
      { key: "service-4", label: "4 · Pardozlash ishlari" },
      { key: "service-5", label: "5 · Muhandislik tizimlari" },
      { key: "service-6", label: "6 · Premium pardoz va interyer ijrosi" },
    ],
  },
];

interface Project {
  id: string; name: string; location: string; area: string; year: string;
  status: string; description: string; details: string; features: string;
  direction?: string; task?: string; solution?: string; result?: string;
  workType?: string; duration?: string; role?: string; problem?: string; process?: string;
  hasImage?: boolean; active: boolean; createdAt: string;
}
interface Offer {
  id: string; title: string; description: string; tag: string; active: boolean; createdAt: string;
}
interface HRRecord {
  fullName: string; field: string; experienceYears: string; phone: string;
  email?: string; contact: string; submittedAt: string; resumeFile: string | null; folder: string;
  status?: string; statusBy?: string; statusAt?: string;
}
interface Suggestion {
  id: string; fullName: string; phone: string; category: string;
  subject: string; message: string; submittedAt: string;
}
interface Contact {
  id: string; fullName: string; phone: string; company: string; message: string; submittedAt: string;
}
interface Ornament {
  id: string; old: string; new: string; desc: string; history: string;
  hasImage?: boolean; active: boolean; createdAt: string;
}
interface Standard {
  id: string; title: string; desc: string; active: boolean; createdAt: string;
}
interface Investor {
  id: string; title: string; text: string; key: string; active: boolean; createdAt: string;
}
interface HistoryEntry {
  id: string; actor: string; action: string; time: string;
}
interface AdminData {
  projects: Project[]; ornaments: Ornament[]; standards: Standard[]; investors: Investor[];
  hr: HRRecord[]; offers: Offer[];
  suggestions: Suggestion[]; contacts: Contact[]; history: HistoryEntry[];
  tasks?: TaskItem[]; me?: Me; admins?: AdminUser[];
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("uz-UZ", {
      day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

export function AdminPage() {
  const [creds, setCreds] = useState<Creds | null>(() => loadCreds());
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("projects");
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");

  const [sectionImages, setSectionImages] = useState<Record<string, number>>({});
  const [stats, setStats] = useState<StatItem[]>(DEFAULT_STATS);
  const [savingStats, setSavingStats] = useState(false);
  const [statsSaved, setStatsSaved] = useState(false);

  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingOrnament, setEditingOrnament] = useState<Ornament | null>(null);
  const [showOrnamentModal, setShowOrnamentModal] = useState(false);
  const [editingStandard, setEditingStandard] = useState<Standard | null>(null);
  const [showStandardModal, setShowStandardModal] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState<Investor | null>(null);
  const [showInvestorModal, setShowInvestorModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>({ notifyEmails: [], notifyEmailsByType: { hr: [], suggestion: [], contact: [] }, smtp: {}, sheetsWebhook: "", telegram: emptyTg(), telegramByType: { hr: emptyTg(), suggestion: emptyTg(), contact: emptyTg() }, socials: { telegram: "", instagram: "", facebook: "", youtube: "" }, contactInfo: { phone: "", email: "", address: "" } });
  const [settingsMsg, setSettingsMsg] = useState("");

  const isLoggedIn = !!creds;
  // Har bir admin so'rovi uchun autentifikatsiya query-string
  const authQS = () =>
    `username=${encodeURIComponent(creds?.username || "")}&password=${encodeURIComponent(creds?.password || "")}`;

  const inputClass =
    "w-full px-4 py-3 bg-white/50 border border-[#060920]/15 text-[#060920] placeholder-[#060920]/40 focus:outline-none focus:border-[#060920]/40 transition-colors rounded-lg";

  const loadData = useCallback(() => {
    const c = loadCreds();
    if (!c) return;
    setLoading(true);
    setFetchError("");
    fetch(`/api/admin/data?username=${encodeURIComponent(c.username)}&password=${encodeURIComponent(c.password)}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.ok) setData(json.data);
        else setFetchError(json.error || "Ma'lumot olishda xatolik");
      })
      .catch(() => setFetchError("Server bilan bog'lanib bo'lmadi"))
      .finally(() => setLoading(false));
    fetch("/api/section-images")
      .then((r) => r.json())
      .then((j) => { if (j.ok) setSectionImages(j.images || {}); })
      .catch(() => {});
    fetch("/api/stats")
      .then((r) => r.json())
      .then((j) => { if (j.ok && Array.isArray(j.stats) && j.stats.length) setStats(j.stats); })
      .catch(() => {});
    fetch(`/api/admin/settings?username=${encodeURIComponent(c.username)}&password=${encodeURIComponent(c.password)}`)
      .then((r) => r.json())
      .then((j) => { if (j.ok && j.settings) setSettings({ notifyEmails: j.settings.notifyEmails || [], notifyEmailsByType: { hr: j.settings.notifyEmailsByType?.hr || [], suggestion: j.settings.notifyEmailsByType?.suggestion || [], contact: j.settings.notifyEmailsByType?.contact || [] }, smtp: j.settings.smtp || {}, sheetsWebhook: j.settings.sheetsWebhook || "", telegram: { botToken: j.settings.telegram?.botToken || "", chatIds: j.settings.telegram?.chatIds || [] }, telegramByType: { hr: { botToken: j.settings.telegramByType?.hr?.botToken || "", chatIds: j.settings.telegramByType?.hr?.chatIds || [] }, suggestion: { botToken: j.settings.telegramByType?.suggestion?.botToken || "", chatIds: j.settings.telegramByType?.suggestion?.chatIds || [] }, contact: { botToken: j.settings.telegramByType?.contact?.botToken || "", chatIds: j.settings.telegramByType?.contact?.chatIds || [] } }, socials: { telegram: j.settings.socials?.telegram || "", instagram: j.settings.socials?.instagram || "", facebook: j.settings.socials?.facebook || "", youtube: j.settings.socials?.youtube || "" }, contactInfo: { phone: j.settings.contactInfo?.phone || "", email: j.settings.contactInfo?.email || "", address: j.settings.contactInfo?.address || "" } }); })
      .catch(() => {});
  }, []);

  // HR holatini o'zgartirish (qabul/rad/kutish)
  const setHrStatus = async (folder: string, status: string) => {
    const labels: Record<string, string> = { accepted: "qabul qilish", rejected: "rad etish", pending: "kutishga qaytarish" };
    if (!confirm(`Bu arizani ${labels[status]}ni tasdiqlaysizmi?`)) return;
    try {
      await fetch(`/api/admin/hr-status?${authQS()}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ folder, status }),
      });
      loadData();
    } catch {}
  };

  // HR arizasini butunlay o'chirish (rezyume papkasi bilan)
  const deleteHr = async (folder: string, name: string) => {
    if (!confirm(`"${name}" arizasi butunlay o'chirilsinmi? Rezyume fayli ham o'chadi va qaytarib bo'lmaydi.`)) return;
    try {
      await fetch(`/api/admin/hr-delete?${authQS()}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ folder }),
      });
      loadData();
    } catch {}
  };

  // CSV yuklab olish
  const exportCsv = (type: string) => {
    const c = loadCreds();
    if (!c) return;
    window.open(`/api/admin/export?type=${type}&username=${encodeURIComponent(c.username)}&password=${encodeURIComponent(c.password)}`, "_blank");
  };

  // Sozlamalarni saqlash
  const saveSettings = async () => {
    setSaving(true); setSettingsMsg("");
    try {
      const res = await fetch(`/api/admin/settings?${authQS()}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Xatolik");
      setSettingsMsg("Saqlandi ✅");
    } catch { setSettingsMsg("Saqlashda xatolik"); } finally { setSaving(false); }
  };
  const sendTestTelegram = async (type: TgKey) => {
    setSettingsMsg("Yuborilmoqda...");
    try {
      const res = await fetch(`/api/admin/test-telegram?type=${type}&${authQS()}`, { method: "POST" });
      const json = await res.json().catch(() => ({}));
      setSettingsMsg(json.ok ? "Telegram test xabari yuborildi ✅" : (json.error || "Xatolik"));
    } catch { setSettingsMsg("Xatolik"); }
  };

  // Telegram konfigini olish/yangilash (umumiy yoki tur bo'yicha)
  const getTg = (k: TgKey): TgConfig => k === "general" ? settings.telegram : settings.telegramByType[k];
  const setTg = (k: TgKey, cfg: TgConfig) => {
    if (k === "general") setSettings({ ...settings, telegram: cfg });
    else setSettings({ ...settings, telegramByType: { ...settings.telegramByType, [k]: cfg } });
  };

  useEffect(() => {
    if (isLoggedIn) loadData();
  }, [isLoggedIn, loadData]);

  // Ruxsat bo'lmagan tab ochiq qolsa — birinchi ruxsatli tabga o'tkazamiz
  useEffect(() => {
    const m = data?.me;
    if (!m || m.role === "superadmin") return;
    if (activeTab === "admins") { setActiveTab("tasks"); return; }
    if (activeTab !== "tasks" && m.perms?.[activeTab] === false) {
      const first = PERM_LABELS.find((p) => m.perms?.[p.key] !== false)?.key as Tab | undefined;
      setActiveTab(first || "tasks");
    }
  }, [data, activeTab]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        setLoginError(json.error || "Login yoki parol noto'g'ri");
        return;
      }
      const newCreds: Creds = { username: username.trim(), password, name: json.name };
      sessionStorage.setItem(CREDS_KEY, JSON.stringify(newCreds));
      setCreds(newCreds);
      setPassword("");
    } catch {
      setLoginError("Server bilan bog'lanib bo'lmadi");
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(CREDS_KEY);
    setCreds(null);
    setData(null);
  };

  // ---- Admin boshqaruvi amallari (faqat superadmin) ----
  const adminUserAction = async (payload: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/admins?${authQS()}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) throw new Error(json.error || "Xatolik");
    return json;
  };
  const saveAdminUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const perms: Record<string, boolean> = {};
    for (const p of PERM_LABELS) perms[p.key] = fd.get(`perm_${p.key}`) === "on";
    try {
      if (editingAdmin) {
        await adminUserAction({
          action: "update",
          username: editingAdmin.username,
          newUsername: String(fd.get("username") || "").trim(),
          password: String(fd.get("password") || ""),
          name: String(fd.get("name") || "").trim(),
          role: String(fd.get("role") || "admin"),
          perms,
        });
      } else {
        await adminUserAction({
          action: "create",
          username: String(fd.get("username") || "").trim(),
          password: String(fd.get("password") || ""),
          name: String(fd.get("name") || "").trim(),
          perms,
        });
      }
      setShowAdminModal(false); setEditingAdmin(null); loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Xatolik");
    } finally { setSaving(false); }
  };
  const deleteAdminUser = async (username: string) => {
    if (!confirm(`"${username}" admin o'chirilsinmi?`)) return;
    try { await adminUserAction({ action: "delete", username }); loadData(); }
    catch (err) { alert(err instanceof Error ? err.message : "Xatolik"); }
  };

  // ---- Topshiriq amallari ----
  const taskAction = async (payload: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/tasks?${authQS()}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) throw new Error(json.error || "Xatolik");
    return json;
  };
  const saveTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      await taskAction({ action: "create", ...body });
      setShowTaskModal(false); loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Xatolik");
    } finally { setSaving(false); }
  };
  const toggleTaskDone = async (t: TaskItem) => {
    try { await taskAction({ action: t.status === "done" ? "undone" : "done", id: t.id }); loadData(); } catch {}
  };
  const deleteTask = async (id: string) => {
    if (!confirm("Bu topshiriq o'chirilsinmi?")) return;
    try { await taskAction({ action: "delete", id }); loadData(); } catch {}
  };

  // ---- Offer amallari (JSON) ----
  const offerAction = async (payload: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/offers?${authQS()}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) throw new Error(json.error || "Xatolik");
    return json;
  };
  const saveOffer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      if (editingOffer) await offerAction({ action: "update", id: editingOffer.id, ...body });
      else await offerAction({ action: "create", ...body });
      setShowOfferModal(false); setEditingOffer(null); loadData();
    } catch {} finally { setSaving(false); }
  };
  const toggleOffer = async (id: string) => { try { await offerAction({ action: "toggle", id }); loadData(); } catch {} };
  const deleteOffer = async (id: string) => {
    if (!confirm("Bu taklif o'chirilsinmi?")) return;
    try { await offerAction({ action: "delete", id }); loadData(); } catch {}
  };

  // ---- Loyiha amallari (FormData — rasm bilan) ----
  const projectAction = async (fd: FormData) => {
    const res = await fetch(`/api/admin/projects?${authQS()}`, { method: "POST", body: fd });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) throw new Error(json.error || "Xatolik");
    return json;
  };
  const saveProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    fd.append("action", editingProject ? "update" : "create");
    if (editingProject) fd.append("id", editingProject.id);
    try {
      await projectAction(fd);
      setShowProjectModal(false); setEditingProject(null); loadData();
    } catch {} finally { setSaving(false); }
  };
  const projectSimple = async (action: string, id: string) => {
    const fd = new FormData();
    fd.append("action", action); fd.append("id", id);
    try { await projectAction(fd); loadData(); } catch {}
  };
  const toggleProject = (id: string) => projectSimple("toggle", id);
  const deleteProject = (id: string) => {
    if (!confirm("Bu loyiha o'chirilsinmi? Rasm ham o'chadi.")) return;
    projectSimple("delete", id);
  };

  // ---- Naqsh amallari (FormData — rasm bilan) ----
  const ornamentAction = async (fd: FormData) => {
    const res = await fetch(`/api/admin/ornaments?${authQS()}`, { method: "POST", body: fd });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) throw new Error(json.error || "Xatolik");
    return json;
  };
  const saveOrnament = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    fd.append("action", editingOrnament ? "update" : "create");
    if (editingOrnament) fd.append("id", editingOrnament.id);
    try {
      await ornamentAction(fd);
      setShowOrnamentModal(false); setEditingOrnament(null); loadData();
    } catch {} finally { setSaving(false); }
  };
  const ornamentSimple = async (action: string, id: string) => {
    const fd = new FormData();
    fd.append("action", action); fd.append("id", id);
    try { await ornamentAction(fd); loadData(); } catch {}
  };
  const toggleOrnament = (id: string) => ornamentSimple("toggle", id);
  const deleteOrnament = (id: string) => {
    if (!confirm("Bu naqsh o'chirilsinmi?")) return;
    ornamentSimple("delete", id);
  };

  // ---- Standart amallari (JSON) ----
  const standardAction = async (payload: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/standards?${authQS()}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) throw new Error(json.error || "Xatolik");
    return json;
  };
  const saveStandard = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      if (editingStandard) await standardAction({ action: "update", id: editingStandard.id, ...body });
      else await standardAction({ action: "create", ...body });
      setShowStandardModal(false); setEditingStandard(null); loadData();
    } catch {} finally { setSaving(false); }
  };
  const toggleStandard = async (id: string) => { try { await standardAction({ action: "toggle", id }); loadData(); } catch {} };
  const deleteStandard = async (id: string) => {
    if (!confirm("Bu standart o'chirilsinmi?")) return;
    try { await standardAction({ action: "delete", id }); loadData(); } catch {}
  };

  // ---- Investor amallari (JSON) ----
  const investorAction = async (payload: Record<string, unknown>) => {
    const res = await fetch(`/api/admin/investors?${authQS()}`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) throw new Error(json.error || "Xatolik");
    return json;
  };
  const saveInvestor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      if (editingInvestor) await investorAction({ action: "update", id: editingInvestor.id, ...body });
      else await investorAction({ action: "create", ...body });
      setShowInvestorModal(false); setEditingInvestor(null); loadData();
    } catch {} finally { setSaving(false); }
  };
  const toggleInvestor = async (id: string) => { try { await investorAction({ action: "toggle", id }); loadData(); } catch {} };
  const deleteInvestor = async (id: string) => {
    if (!confirm("Bu bo'lim o'chirilsinmi?")) return;
    try { await investorAction({ action: "delete", id }); loadData(); } catch {}
  };

  // ---- Bo'lim rasmlari (culture / services boxlari) ----
  const uploadSectionImage = async (key: string, file: File) => {
    const fd = new FormData();
    fd.append("key", key);
    fd.append("image", file);
    const res = await fetch(`/api/admin/section-image?${authQS()}`, { method: "POST", body: fd });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) throw new Error(json.error || "Xatolik");
    loadData();
  };
  const deleteSectionImage = async (key: string) => {
    if (!confirm("Bu rasm o'chirilsinmi?")) return;
    const fd = new FormData();
    fd.append("key", key);
    fd.append("action", "delete");
    try {
      const res = await fetch(`/api/admin/section-image?${authQS()}`, { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Xatolik");
      loadData();
    } catch {}
  };

  // ---- Hero statistikasini saqlash ----
  const updateStat = (i: number, field: "value" | "label", val: string) => {
    setStats((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)));
    setStatsSaved(false);
  };
  const saveStats = async () => {
    setSavingStats(true);
    setStatsSaved(false);
    try {
      const res = await fetch(`/api/admin/stats?${authQS()}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stats }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Xatolik");
      if (Array.isArray(json.stats)) setStats(json.stats);
      setStatsSaved(true);
      loadData();
    } catch {} finally { setSavingStats(false); }
  };

  // ---- Kelgan taklif / aloqani o'chirish ----
  const deleteItem = async (type: "suggestion" | "contact", id: string) => {
    if (!confirm("O'chirilsinmi?")) return;
    try {
      await fetch(`/api/admin/delete?${authQS()}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, id }),
      });
      loadData();
    } catch {}
  };

  // ---- LOGIN EKRANI ----
  if (!isLoggedIn) {
    return (
      <div className="pt-24 min-h-screen flex items-center justify-center px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="w-full max-w-md">
          <div className="text-center mb-10 space-y-3">
            <p style={{ fontFamily: "var(--font-body)" }} className="opacity-60 tracking-[0.2em] uppercase text-sm text-[#060920]">BOSHQARUV PANELI</p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "#060920" }}>Boshqaruvga kirish</h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder="Login (username)" autoComplete="username"
              style={{ fontFamily: "var(--font-body)" }} className={inputClass} autoFocus />
            <div className="relative">
              <input type={showLoginPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Parol" autoComplete="current-password"
                style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} pr-12`} />
              <button type="button" onClick={() => setShowLoginPass((v) => !v)}
                aria-label={showLoginPass ? "Parolni yashirish" : "Parolni ko'rsatish"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#060920]/40 hover:text-[#060920] transition-colors">
                {showLoginPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {loginError && <p style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]">{loginError}</p>}
            <button type="submit" disabled={loggingIn} style={{ fontFamily: "var(--font-body)" }}
              className="w-full px-8 py-4 bg-[#060920] text-white tracking-[0.15em] uppercase font-medium rounded-2xl hover:shadow-xl transition-all disabled:opacity-70">
              {loggingIn ? "Tekshirilmoqda..." : "Kirish"}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const me = data?.me;
  const isSuper = me?.role === "superadmin";
  const hasPerm = (key: string) => isSuper || !me || me.perms?.[key] !== false;

  const tabs = [
    { id: "projects" as Tab, label: "Loyihalar", count: data?.projects.length ?? 0 },
    { id: "ornaments" as Tab, label: "Naqshlar", count: data?.ornaments?.length ?? 0 },
    { id: "standards" as Tab, label: "Standartlar", count: data?.standards?.length ?? 0 },
    { id: "investors" as Tab, label: "Investorlar", count: data?.investors?.length ?? 0 },
    { id: "offers" as Tab, label: "Cheklangan takliflar", count: data?.offers.length ?? 0 },
    { id: "sections" as Tab, label: "Bo'lim rasmlari", count: Object.keys(sectionImages).length },
    { id: "stats" as Tab, label: "Statistika", count: stats.length },
    { id: "suggestions" as Tab, label: "Kelgan takliflar", count: data?.suggestions.length ?? 0 },
    { id: "hr" as Tab, label: "HR Arizalari", count: data?.hr.length ?? 0 },
    { id: "contacts" as Tab, label: "Aloqa So'rovlari", count: data?.contacts.length ?? 0 },
    { id: "settings" as Tab, label: "Sozlamalar", count: (settings.telegram?.chatIds || []).filter(Boolean).length },
  ].filter((t) => hasPerm(t.id));

  // Topshiriqlar hammaga, Adminlar faqat superadminga
  tabs.push({ id: "tasks" as Tab, label: "Topshiriqlar", count: (data?.tasks || []).filter((t) => t.status !== "done").length });
  if (isSuper) tabs.push({ id: "admins" as Tab, label: "Adminlar", count: data?.admins?.length ?? 0 });

  const btnGhost = "px-3 py-1.5 rounded-lg text-xs tracking-wide border border-[#060920]/15 text-[#060920]/70 hover:bg-[#060920]/5 transition-colors";
  const btnDanger = "px-3 py-1.5 rounded-lg text-xs tracking-wide border border-[#060920]/30 text-[#060920] hover:bg-[#060920]/10 transition-colors";

  return (
    <div className="pt-24 min-h-screen px-6 md:px-16 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <p style={{ fontFamily: "var(--font-body)" }} className="opacity-60 tracking-[0.2em] uppercase text-sm text-[#060920] mb-1">BARPO · BOSHQARUV</p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "#060920" }}>Boshqaruv Paneli</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div style={{ fontFamily: "var(--font-body)" }} className="text-xs tracking-[0.15em] uppercase text-[#060920]/40">Kirgan admin</div>
              <div style={{ fontFamily: "var(--font-display)" }} className="text-[#060920]">{creds?.name}</div>
            </div>
            <button onClick={handleLogout} style={{ fontFamily: "var(--font-body)" }}
              className="px-5 py-2.5 border border-[#060920]/20 text-[#060920]/70 hover:text-[#060920] rounded-xl transition-colors text-sm tracking-wide">
              Chiqish
            </button>
          </div>
        </div>

        {/* Stat / Tab cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {tabs.map(({ id, label, count }) => (
            <motion.button key={id} onClick={() => setActiveTab(id)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className={`p-5 rounded-2xl border text-left transition-all ${activeTab === id ? "bg-[#060920] text-white border-[#060920]" : "bg-white/60 border-[#060920]/15 hover:bg-white/80"}`}>
              <div style={{ fontFamily: "var(--font-display)" }} className={`text-3xl mb-1 ${activeTab === id ? "text-white" : "text-[#060920]"}`}>
                {loading ? "..." : count}
              </div>
              <div style={{ fontFamily: "var(--font-body)" }} className={`text-xs md:text-sm tracking-wide ${activeTab === id ? "text-white/70" : "text-[#060920]/60"}`}>{label}</div>
            </motion.button>
          ))}
        </div>

        {loading && <div className="text-center py-20"><div style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/50 tracking-wide animate-pulse">Ma'lumotlar yuklanmoqda...</div></div>}
        {fetchError && <div className="text-center py-20"><p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]">{fetchError}</p></div>}

        {!loading && !fetchError && data && (
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

            {/* ===== LOYIHALAR ===== */}
            {activeTab === "projects" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
                  <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">Loyihalar ({data.projects.length})</h2>
                  <button onClick={() => { setEditingProject(null); setShowProjectModal(true); }} style={{ fontFamily: "var(--font-body)" }}
                    className="px-5 py-2.5 bg-[#060920] text-white rounded-xl text-sm tracking-wide hover:shadow-lg transition-all">
                    + Yangi loyiha
                  </button>
                </div>
                {data.projects.length === 0 ? <EmptyState text="Hozircha loyiha qo'shilmagan. '+ Yangi loyiha' tugmasini bosing." /> : data.projects.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className={`p-5 bg-white/60 border rounded-2xl flex gap-5 items-start ${p.active ? "border-[#060920]/10" : "border-[#060920]/10 opacity-60"}`}>
                    <div className="w-24 h-24 rounded-xl bg-[#060920]/5 overflow-hidden flex-shrink-0">
                      {p.hasImage ? (
                        <img src={`/api/project-image?id=${p.id}`} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div style={{ fontFamily: "var(--font-display)" }} className="w-full h-full flex items-center justify-center text-[#060920]/20 text-xs">BARPO</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div style={{ fontFamily: "var(--font-display)" }} className="text-lg text-[#060920]">{p.name}</div>
                        {!p.active && <span style={{ fontFamily: "var(--font-body)" }} className="px-2.5 py-0.5 text-xs tracking-wide uppercase bg-[#060920]/10 text-[#060920] rounded-full">Yashirin</span>}
                      </div>
                      <div style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]/55 mt-1 space-x-2">
                        {p.location && <span>{p.location}</span>}
                        {p.area && <span>· {p.area}</span>}
                        {p.year && <span>· {p.year}</span>}
                      </div>
                      {p.description && <p style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]/60 mt-2 line-clamp-2">{p.description}</p>}
                      <div className="flex gap-2 mt-3 flex-wrap" style={{ fontFamily: "var(--font-body)" }}>
                        <button onClick={() => { setEditingProject(p); setShowProjectModal(true); }} className={btnGhost}>Tahrirlash</button>
                        <button onClick={() => toggleProject(p.id)} className={btnGhost}>{p.active ? "Yashirish" : "Ko'rsatish"}</button>
                        <button onClick={() => deleteProject(p.id)} className={btnDanger}>O'chirish</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ===== TOPSHIRIQLAR ===== */}
            {activeTab === "tasks" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
                  <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">
                    Topshiriqlar ({(data.tasks || []).length})
                  </h2>
                  {isSuper && (
                    <button onClick={() => setShowTaskModal(true)} style={{ fontFamily: "var(--font-body)" }}
                      className="px-5 py-2.5 bg-[#060920] text-white rounded-xl text-sm tracking-wide hover:shadow-lg transition-all">
                      + Yangi topshiriq
                    </button>
                  )}
                </div>
                {(data.tasks || []).length === 0 ? (
                  <EmptyState text={isSuper ? "Hozircha topshiriq yo'q. '+ Yangi topshiriq' tugmasini bosing." : "Sizga hozircha topshiriq berilmagan."} />
                ) : (data.tasks || []).map((t, i) => (
                  <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className={`p-5 bg-white/60 border rounded-2xl flex gap-4 items-start ${t.status === "done" ? "border-[#060920]/10 opacity-60" : "border-[#060920]/15"}`}>
                    <button onClick={() => toggleTaskDone(t)}
                      className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${t.status === "done" ? "bg-[#060920] border-[#060920] text-white" : "border-[#060920]/30 hover:border-[#060920]"}`}>
                      {t.status === "done" && <span className="text-xs">✓</span>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div style={{ fontFamily: "var(--font-display)" }} className={`text-lg text-[#060920] ${t.status === "done" ? "line-through" : ""}`}>{t.title}</div>
                      {t.desc && <p style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]/60 mt-1 whitespace-pre-line">{t.desc}</p>}
                      <div style={{ fontFamily: "var(--font-body)" }} className="text-xs text-[#060920]/40 mt-2 space-x-2">
                        {isSuper && <span>Kimga: <b>{t.assignee || "—"}</b></span>}
                        <span>· Berilgan: {formatDate(t.createdAt)}</span>
                        {t.doneAt && <span>· Bajarilgan: {formatDate(t.doneAt)}</span>}
                      </div>
                      <div className="flex gap-2 mt-3 flex-wrap" style={{ fontFamily: "var(--font-body)" }}>
                        <button onClick={() => toggleTaskDone(t)} className={btnGhost}>{t.status === "done" ? "Qayta ochish" : "Bajarildi"}</button>
                        {isSuper && <button onClick={() => deleteTask(t.id)} className={btnDanger}>O'chirish</button>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ===== ADMINLAR (faqat superadmin) ===== */}
            {activeTab === "admins" && isSuper && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
                  <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">
                    Adminlar ({data.admins?.length ?? 0})
                  </h2>
                  <button onClick={() => { setEditingAdmin(null); setShowAdminModal(true); }} style={{ fontFamily: "var(--font-body)" }}
                    className="px-5 py-2.5 bg-[#060920] text-white rounded-xl text-sm tracking-wide hover:shadow-lg transition-all">
                    + Yangi admin
                  </button>
                </div>
                {(data.admins || []).map((a, i) => (
                  <motion.div key={a.username} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="p-5 bg-white/60 border border-[#060920]/10 rounded-2xl">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div style={{ fontFamily: "var(--font-display)" }} className="text-lg text-[#060920]">{a.name}</div>
                      <span style={{ fontFamily: "var(--font-body)" }}
                        className={`px-2.5 py-0.5 text-xs tracking-wide uppercase rounded-full ${a.role === "superadmin" ? "bg-[#060920] text-white" : "bg-[#060920]/10 text-[#060920]"}`}>
                        {a.role === "superadmin" ? "Bosh admin" : "Admin"}
                      </span>
                      <span style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]/50">login: <b>{a.username}</b></span>
                    </div>
                    {a.role !== "superadmin" && (
                      <div style={{ fontFamily: "var(--font-body)" }} className="text-xs text-[#060920]/50 mt-2 flex flex-wrap gap-1.5">
                        {PERM_LABELS.map((p) => (
                          <span key={p.key} className={`px-2 py-0.5 rounded-full border ${a.perms?.[p.key] === false ? "border-[#060920]/10 text-[#060920]/30 line-through" : "border-[#060920]/20 text-[#060920]/60"}`}>
                            {p.label}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 mt-3 flex-wrap" style={{ fontFamily: "var(--font-body)" }}>
                      <button onClick={() => { setEditingAdmin(a); setShowAdminModal(true); }} className={btnGhost}>Tahrirlash</button>
                      {a.username !== me?.username && <button onClick={() => deleteAdminUser(a.username)} className={btnDanger}>O'chirish</button>}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ===== NAQSHLAR (Tarixiy aloqa) ===== */}
            {activeTab === "ornaments" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
                  <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">Naqshlar — Tarixiy aloqa ({data.ornaments?.length ?? 0})</h2>
                  <button onClick={() => { setEditingOrnament(null); setShowOrnamentModal(true); }} style={{ fontFamily: "var(--font-body)" }}
                    className="px-5 py-2.5 bg-[#060920] text-white rounded-xl text-sm tracking-wide hover:shadow-lg transition-all">
                    + Yangi naqsh
                  </button>
                </div>
                {(data.ornaments?.length ?? 0) === 0 ? <EmptyState text="Hozircha naqsh qo'shilmagan. '+ Yangi naqsh' tugmasini bosing." /> : data.ornaments.map((o, i) => (
                  <motion.div key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className={`p-5 bg-white/60 border rounded-2xl flex gap-5 items-start ${o.active ? "border-[#060920]/10" : "border-[#060920]/10 opacity-60"}`}>
                    <div className="w-24 h-24 rounded-xl bg-[#060920]/5 overflow-hidden flex-shrink-0">
                      {o.hasImage ? (
                        <img src={`/api/ornament-image?id=${o.id}`} alt={o.old} className="w-full h-full object-cover" />
                      ) : (
                        <div style={{ fontFamily: "var(--font-display)" }} className="w-full h-full flex items-center justify-center text-[#060920]/20 text-xs">naqsh</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div style={{ fontFamily: "var(--font-display)" }} className="text-lg text-[#060920]">{o.old}</div>
                        {!o.active && <span style={{ fontFamily: "var(--font-body)" }} className="px-2.5 py-0.5 text-xs tracking-wide uppercase bg-[#060920]/10 text-[#060920] rounded-full">Yashirin</span>}
                      </div>
                      {o.desc && <p style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]/60 mt-1">{o.desc}</p>}
                      {o.history && <p style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]/50 mt-1 line-clamp-2">{o.history}</p>}
                      <div className="flex gap-2 mt-3 flex-wrap" style={{ fontFamily: "var(--font-body)" }}>
                        <button onClick={() => { setEditingOrnament(o); setShowOrnamentModal(true); }} className={btnGhost}>Tahrirlash</button>
                        <button onClick={() => toggleOrnament(o.id)} className={btnGhost}>{o.active ? "Yashirish" : "Ko'rsatish"}</button>
                        <button onClick={() => deleteOrnament(o.id)} className={btnDanger}>O'chirish</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ===== STANDARTLAR ===== */}
            {activeTab === "standards" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
                  <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">Standart gridlari ({data.standards?.length ?? 0})</h2>
                  <button onClick={() => { setEditingStandard(null); setShowStandardModal(true); }} style={{ fontFamily: "var(--font-body)" }}
                    className="px-5 py-2.5 bg-[#060920] text-white rounded-xl text-sm tracking-wide hover:shadow-lg transition-all">
                    + Yangi standart
                  </button>
                </div>
                {(data.standards?.length ?? 0) === 0 ? <EmptyState text="Hozircha standart qo'shilmagan." /> : data.standards.map((s, i) => (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className={`p-6 bg-white/60 border rounded-2xl ${s.active ? "border-[#060920]/10" : "border-[#060920]/10 opacity-60"}`}>
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div style={{ fontFamily: "var(--font-display)" }} className="text-lg text-[#060920]">{s.title}</div>
                          {!s.active && <span style={{ fontFamily: "var(--font-body)" }} className="px-2.5 py-0.5 text-xs tracking-wide uppercase bg-[#060920]/10 text-[#060920] rounded-full">Yashirin</span>}
                        </div>
                        <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/65 text-sm mt-2 leading-relaxed">{s.desc}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap" style={{ fontFamily: "var(--font-body)" }}>
                        <button onClick={() => { setEditingStandard(s); setShowStandardModal(true); }} className={btnGhost}>Tahrirlash</button>
                        <button onClick={() => toggleStandard(s.id)} className={btnGhost}>{s.active ? "Yashirish" : "Ko'rsatish"}</button>
                        <button onClick={() => deleteStandard(s.id)} className={btnDanger}>O'chirish</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ===== INVESTORLAR ===== */}
            {activeTab === "investors" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
                  <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">Investorlar uchun konsepsiyalar ({data.investors?.length ?? 0})</h2>
                  <button onClick={() => { setEditingInvestor(null); setShowInvestorModal(true); }} style={{ fontFamily: "var(--font-body)" }}
                    className="px-5 py-2.5 bg-[#060920] text-white rounded-xl text-sm tracking-wide hover:shadow-lg transition-all">
                    + Yangi bo'lim
                  </button>
                </div>
                {(data.investors?.length ?? 0) === 0 ? <EmptyState text="Hozircha konsepsiya qo'shilmagan." /> : data.investors.map((s, i) => (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className={`p-6 bg-white/60 border rounded-2xl ${s.active ? "border-[#060920]/10" : "border-[#060920]/10 opacity-60"}`}>
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div style={{ fontFamily: "var(--font-display)" }} className="text-lg text-[#060920]">{s.title}</div>
                          {!s.active && <span style={{ fontFamily: "var(--font-body)" }} className="px-2.5 py-0.5 text-xs tracking-wide uppercase bg-[#060920]/10 text-[#060920] rounded-full">Yashirin</span>}
                        </div>
                        <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/65 text-sm mt-2 leading-relaxed line-clamp-2">{s.text}</p>
                        {s.key && <p style={{ fontFamily: "var(--font-display)" }} className="text-[#060920]/80 text-sm mt-2 italic">{s.key}</p>}
                      </div>
                      <div className="flex gap-2 flex-wrap" style={{ fontFamily: "var(--font-body)" }}>
                        <button onClick={() => { setEditingInvestor(s); setShowInvestorModal(true); }} className={btnGhost}>Tahrirlash</button>
                        <button onClick={() => toggleInvestor(s.id)} className={btnGhost}>{s.active ? "Yashirish" : "Ko'rsatish"}</button>
                        <button onClick={() => deleteInvestor(s.id)} className={btnDanger}>O'chirish</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ===== TAKLIFLAR (boshqaruv) ===== */}
            {activeTab === "offers" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
                  <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">Cheklangan takliflar ({data.offers.length})</h2>
                  <button onClick={() => { setEditingOffer(null); setShowOfferModal(true); }} style={{ fontFamily: "var(--font-body)" }}
                    className="px-5 py-2.5 bg-[#060920] text-white rounded-xl text-sm tracking-wide hover:shadow-lg transition-all">
                    + Yangi taklif
                  </button>
                </div>
                {data.offers.length === 0 ? <EmptyState text="Hozircha taklif qo'shilmagan. '+ Yangi taklif' tugmasini bosing." /> : data.offers.map((o, i) => (
                  <motion.div key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className={`p-6 bg-white/60 border rounded-2xl space-y-3 ${o.active ? "border-[#060920]/10" : "border-[#060920]/10 opacity-60"}`}>
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div style={{ fontFamily: "var(--font-display)" }} className="text-lg text-[#060920]">{o.title}</div>
                          {o.tag && <span style={{ fontFamily: "var(--font-body)" }} className="px-2.5 py-0.5 text-xs tracking-wide uppercase bg-[#060920]/8 text-[#060920]/60 rounded-full">{o.tag}</span>}
                          {!o.active && <span style={{ fontFamily: "var(--font-body)" }} className="px-2.5 py-0.5 text-xs tracking-wide uppercase bg-[#060920]/10 text-[#060920] rounded-full">Yashirin</span>}
                        </div>
                        <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/65 text-sm mt-2 leading-relaxed">{o.description}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap" style={{ fontFamily: "var(--font-body)" }}>
                        <button onClick={() => { setEditingOffer(o); setShowOfferModal(true); }} className={btnGhost}>Tahrirlash</button>
                        <button onClick={() => toggleOffer(o.id)} className={btnGhost}>{o.active ? "Yashirish" : "Ko'rsatish"}</button>
                        <button onClick={() => deleteOffer(o.id)} className={btnDanger}>O'chirish</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ===== BO'LIM RASMLARI ===== */}
            {activeTab === "sections" && (
              <div className="space-y-10">
                <p style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]/55 leading-relaxed">
                  Madaniyat va Xizmatlar sahifalaridagi har bir blok uchun rasm yuklang. Rasm yuklasangiz — bo'limdagi
                  bo'sh quti o'rniga o'sha rasm chiqadi. Rasmni o'chirsangiz, avvalgi ko'rinish (gradient/raqam) qaytadi.
                </p>
                {SECTION_IMAGE_GROUPS.map((grp) => (
                  <div key={grp.group} className="space-y-4">
                    <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">{grp.group}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {grp.items.map((it) => (
                        <SectionImageCard
                          key={it.key}
                          itemKey={it.key}
                          label={it.label}
                          version={sectionImages[it.key]}
                          onUpload={uploadSectionImage}
                          onDelete={deleteSectionImage}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ===== STATISTIKA ===== */}
            {activeTab === "stats" && (
              <div className="space-y-6 max-w-3xl">
                <p style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]/55 leading-relaxed">
                  Bosh sahifaning yuqorisidagi 3 ta ko'rsatkichni shu yerda o'zgartiring. "Qiymat" — katta raqam
                  (masalan: 10+, 50+, 100%), "Izoh" — uning ostidagi matn.
                </p>
                {stats.map((s, i) => (
                  <div key={i} className="p-5 bg-white/60 border border-[#060920]/10 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">Qiymat</label>
                      <input value={s.value} onChange={(e) => updateStat(i, "value", e.target.value)}
                        placeholder="masalan: 10+" style={{ fontFamily: "var(--font-display)" }} className={inputClass} />
                    </div>
                    <div className="md:col-span-2">
                      <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">Izoh</label>
                      <input value={s.label} onChange={(e) => updateStat(i, "label", e.target.value)}
                        placeholder="masalan: Yillik tajriba" style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-4">
                  <button onClick={saveStats} disabled={savingStats} style={{ fontFamily: "var(--font-body)" }}
                    className="px-8 py-3.5 bg-[#060920] text-white tracking-[0.15em] uppercase text-sm font-medium rounded-2xl hover:shadow-xl transition-all disabled:opacity-70">
                    {savingStats ? "Saqlanmoqda..." : "Saqlash"}
                  </button>
                  {statsSaved && <span style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]">Saqlandi ✓</span>}
                </div>
              </div>
            )}

            {/* ===== KELGAN TAKLIFLAR ===== */}
            {activeTab === "suggestions" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">Kelgan takliflar ({data.suggestions.length})</h2>
                  <button onClick={() => exportCsv("suggestions")} className={btnGhost}>⤓ Excel / Sheets (CSV)</button>
                </div>
                {data.suggestions.length === 0 ? <EmptyState text="Hozircha kelgan taklif yo'q" /> : data.suggestions.map((t, i) => (
                  <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="p-6 bg-white/60 border border-[#060920]/10 rounded-2xl space-y-3">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <div style={{ fontFamily: "var(--font-display)" }} className="text-lg text-[#060920]">{t.subject}</div>
                        {t.category && <div style={{ fontFamily: "var(--font-body)" }} className="text-xs text-[#060920]/50 mt-0.5 tracking-wide uppercase">{t.category}</div>}
                      </div>
                      <div className="flex items-center gap-3" style={{ fontFamily: "var(--font-body)" }}>
                        <span className="text-xs text-[#060920]/40">{formatDate(t.submittedAt)}</span>
                        <button onClick={() => deleteItem("suggestion", t.id)} className={btnDanger}>O'chirish</button>
                      </div>
                    </div>
                    <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/70 text-sm leading-relaxed">{t.message}</p>
                    {(t.fullName || t.phone) && (
                      <div className="flex flex-wrap gap-4 text-sm pt-2 border-t border-[#060920]/5" style={{ fontFamily: "var(--font-body)" }}>
                        {t.fullName && <span className="text-[#060920]/50">{t.fullName}</span>}
                        {t.phone && <span className="text-[#060920]/50">Tel: {t.phone}</span>}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}

            {/* ===== HR ===== */}
            {activeTab === "hr" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">HR Arizalari ({data.hr.length})</h2>
                  <button onClick={() => exportCsv("hr")} className={btnGhost}>⤓ Excel / Sheets (CSV)</button>
                </div>
                {data.hr.length === 0 ? <EmptyState text="Hozircha HR arizasi yo'q" /> : [...data.hr]
                  .sort((a, b) => {
                    // Rad etilganlar ro'yxat oxiriga tushadi, qolganlar yangilik tartibida
                    const aRej = (a.status || "pending") === "rejected" ? 1 : 0;
                    const bRej = (b.status || "pending") === "rejected" ? 1 : 0;
                    if (aRej !== bRej) return aRej - bRej;
                    return String(b.submittedAt).localeCompare(String(a.submittedAt));
                  })
                  .map((r, i) => {
                  const st = r.status || "pending";
                  const badge = st === "accepted"
                    ? { t: "Qabul qilingan", c: "bg-[#060920]/10 text-[#060920]" }
                    : st === "rejected"
                    ? { t: "Rad etilgan", c: "bg-[#060920]/10 text-[#060920]" }
                    : { t: "Kutilmoqda", c: "bg-[#060920]/8 text-[#060920]/60" };
                  return (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="p-6 bg-white/60 border border-[#060920]/10 rounded-2xl space-y-3">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div style={{ fontFamily: "var(--font-display)" }} className="text-lg text-[#060920]">{r.fullName}</div>
                          <span style={{ fontFamily: "var(--font-body)" }} className={`px-2.5 py-0.5 text-xs tracking-wide uppercase rounded-full ${badge.c}`}>{badge.t}</span>
                        </div>
                        <div style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/60 text-sm mt-1">
                          {r.field}{r.experienceYears && ` · ${r.experienceYears} yil tajriba`}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteHr(r.folder, r.fullName)}
                        style={{ fontFamily: "var(--font-body)" }}
                        className="shrink-0 w-8 h-8 rounded-lg border border-[#060920]/15 text-[#060920]/50 hover:text-[#060920] hover:bg-[#060920]/10 transition-colors text-base leading-none"
                        aria-label="Arizani o'chirish"
                        title="Arizani butunlay o'chirish"
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm" style={{ fontFamily: "var(--font-body)" }}>
                      <span className="text-[#060920]/70">Tel: {r.phone}</span>
                      {r.email && <span className="text-[#060920]/70">Email: {r.email}</span>}
                      {r.contact && <span className="text-[#060920]/70">Aloqa: {r.contact}</span>}
                      {r.resumeFile && (
                        <a href={`/api/admin/resume?folder=${encodeURIComponent(r.folder)}&file=${encodeURIComponent(r.resumeFile)}&${authQS()}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-[#060920] underline underline-offset-2 hover:opacity-70 transition-opacity">
                          Rezyumeni ko'rish
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap pt-2 border-t border-[#060920]/5" style={{ fontFamily: "var(--font-body)" }}>
                      <button onClick={() => setHrStatus(r.folder, "accepted")} className="px-3 py-1.5 rounded-lg text-xs tracking-wide border border-[#060920]/30 text-[#060920] hover:bg-[#060920]/10 transition-colors">Qabul qilish</button>
                      <button onClick={() => setHrStatus(r.folder, "rejected")} className={btnDanger}>Rad etish</button>
                      {st !== "pending" && <button onClick={() => setHrStatus(r.folder, "pending")} className={btnGhost}>Kutishga qaytarish</button>}
                      {!r.email && <span className="text-xs text-[#060920]/40 self-center">(email kiritilmagan — xabar yuborilmaydi)</span>}
                      <span style={{ fontFamily: "var(--font-body)" }} className="ml-auto text-xs text-[#060920]/40 self-center">{formatDate(r.submittedAt)}</span>
                    </div>
                  </motion.div>
                  );
                })}
              </div>
            )}

            {/* ===== ALOQA ===== */}
            {activeTab === "contacts" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">Aloqa So'rovlari ({data.contacts.length})</h2>
                  <button onClick={() => exportCsv("contacts")} className={btnGhost}>⤓ Excel / Sheets (CSV)</button>
                </div>
                {data.contacts.length === 0 ? <EmptyState text="Hozircha aloqa so'rovi yo'q" /> : data.contacts.map((a, i) => (
                  <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="p-6 bg-white/60 border border-[#060920]/10 rounded-2xl space-y-3">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <div style={{ fontFamily: "var(--font-display)" }} className="text-lg text-[#060920]">{a.fullName}</div>
                        {a.company && <div style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]/60 mt-0.5">{a.company}</div>}
                      </div>
                      <div className="flex items-center gap-3" style={{ fontFamily: "var(--font-body)" }}>
                        <span className="text-xs text-[#060920]/40">{formatDate(a.submittedAt)}</span>
                        <button onClick={() => deleteItem("contact", a.id)} className={btnDanger}>O'chirish</button>
                      </div>
                    </div>
                    {a.message && <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/70 text-sm leading-relaxed">{a.message}</p>}
                    <span style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/70 text-sm">Tel: {a.phone}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ===== SOZLAMALAR (email + Sheets) ===== */}
            {activeTab === "settings" && (
              <div className="space-y-8 max-w-2xl">

                {/* Aloqa ma'lumotlari */}
                <div className="space-y-3">
                  <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">Aloqa ma'lumotlari</h2>
                  <p style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]/55">
                    Saytdagi (Aloqa sahifasi, bosh sahifa va footer) telefon, email va manzil shu yerdan boshqariladi.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50">Telefon</label>
                      <input
                        value={settings.contactInfo?.phone || ""}
                        onChange={(e) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, phone: e.target.value } })}
                        placeholder="+998 (90) 123-45-67"
                        style={{ fontFamily: "var(--font-body)" }} className={inputClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50">Email</label>
                      <input
                        value={settings.contactInfo?.email || ""}
                        onChange={(e) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, email: e.target.value } })}
                        placeholder="info@barpo.uz"
                        style={{ fontFamily: "var(--font-body)" }} className={inputClass}
                      />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50">Manzil</label>
                      <input
                        value={settings.contactInfo?.address || ""}
                        onChange={(e) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, address: e.target.value } })}
                        placeholder="Toshkent, ..."
                        style={{ fontFamily: "var(--font-body)" }} className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Ijtimoiy tarmoqlar */}
                <div className="space-y-3">
                  <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">Ijtimoiy tarmoqlar</h2>
                  <p style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]/55">
                    Saytdagi (footer va Aloqa sahifasidagi) ijtimoiy tarmoq tugmalari shu linklarga olib boradi. Bo'sh qoldirilgan tarmoq saytda ko'rsatilmaydi.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {([
                      { key: "telegram" as const, label: "Telegram", ph: "https://t.me/barpo_etamiz" },
                      { key: "instagram" as const, label: "Instagram", ph: "https://www.instagram.com/barpo.official" },
                      { key: "facebook" as const, label: "Facebook", ph: "https://www.facebook.com/..." },
                      { key: "youtube" as const, label: "YouTube", ph: "https://www.youtube.com/@..." },
                    ]).map((s) => (
                      <div key={s.key} className="space-y-1.5">
                        <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50">{s.label}</label>
                        <input
                          value={settings.socials?.[s.key] || ""}
                          onChange={(e) => setSettings({ ...settings, socials: { ...settings.socials, [s.key]: e.target.value } })}
                          placeholder={s.ph}
                          style={{ fontFamily: "var(--font-body)" }} className={inputClass}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Telegram bildirishnomalar */}
                <div className="space-y-3">
                  <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">Telegram bildirishnomalar</h2>
                  <p style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]/55">
                    Har bir tur uchun alohida bot va chat ID belgilash mumkin — shunda xabarlar aralashmaydi. Tur uchun maydon bo'sh qoldirilsa, <b>Umumiy bot</b> sozlamasi ishlaydi. Bot yaratish: <b>@BotFather</b> → <b>/newbot</b>. Chat ID: <b>@userinfobot</b> orqali (botga avval <b>/start</b> yozing).
                  </p>
                </div>

                {([
                  { key: "general" as TgKey, label: "Umumiy bot", hint: "Maxsus bot kiritilmagan turlar uchun ishlaydi" },
                  { key: "hr" as TgKey, label: "HR arizalari boti", hint: "HR arizalari va rezyume fayllari shu botga boradi" },
                  { key: "suggestion" as TgKey, label: "Kelgan takliflar boti", hint: "Takliflar sahifasidan kelgan murojaatlar" },
                  { key: "contact" as TgKey, label: "Aloqa so'rovlari boti", hint: "Aloqa formasidan kelgan so'rovlar" },
                ]).map((sec) => {
                  const cfg = getTg(sec.key);
                  return (
                    <div key={sec.key} className="space-y-3 p-5 border border-[#060920]/10 rounded-2xl bg-white/50">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h3 style={{ fontFamily: "var(--font-display)" }} className="text-base text-[#060920]">{sec.label}</h3>
                          <p style={{ fontFamily: "var(--font-body)" }} className="text-xs text-[#060920]/45 mt-0.5">{sec.hint}</p>
                        </div>
                        <button onClick={() => sendTestTelegram(sec.key)} className={btnGhost}>Test yuborish</button>
                      </div>
                      <input
                        type="password"
                        value={cfg?.botToken || ""}
                        onChange={(e) => setTg(sec.key, { ...cfg, botToken: e.target.value })}
                        placeholder={sec.key === "general" ? "Bot token (123456789:ABC...)" : "Bot token (bo'sh = umumiy bot ishlatiladi)"}
                        autoComplete="new-password"
                        style={{ fontFamily: "var(--font-body)" }} className={inputClass}
                      />
                      <div className="space-y-2">
                        <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50">Chat ID lar</label>
                        {(cfg?.chatIds || []).map((id, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              value={id}
                              onChange={(e) => {
                                const ids = [...(cfg?.chatIds || [])];
                                ids[idx] = e.target.value.replace(/[^\d\-]/g, "");
                                setTg(sec.key, { ...cfg, chatIds: ids });
                              }}
                              placeholder="123456789 yoki -1001234567890"
                              style={{ fontFamily: "var(--font-body)" }} className={inputClass}
                            />
                            <button
                              type="button"
                              onClick={() => setTg(sec.key, { ...cfg, chatIds: (cfg?.chatIds || []).filter((_, i) => i !== idx) })}
                              style={{ fontFamily: "var(--font-body)" }}
                              className="shrink-0 w-10 h-10 rounded-lg border border-[#060920]/15 text-[#060920]/50 hover:text-[#060920] hover:bg-[#060920]/5 transition-colors"
                              aria-label="O'chirish"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setTg(sec.key, { ...cfg, chatIds: [...(cfg?.chatIds || []), ""] })}
                          style={{ fontFamily: "var(--font-body)" }}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-[#060920]/25 text-sm text-[#060920]/60 hover:text-[#060920] hover:border-[#060920]/50 transition-colors"
                        >
                          <span className="w-5 h-5 rounded-full bg-[#060920] text-white flex items-center justify-center text-xs leading-none">+</span>
                          ID qo'shish
                        </button>
                      </div>
                    </div>
                  );
                })}

                <div className="flex items-center gap-3 flex-wrap">
                  <button onClick={saveSettings} disabled={saving} style={{ fontFamily: "var(--font-body)" }}
                    className="px-6 py-3 bg-[#060920] text-white tracking-[0.15em] uppercase text-sm rounded-2xl hover:shadow-xl transition-all disabled:opacity-70">
                    {saving ? "Saqlanmoqda..." : "Saqlash"}
                  </button>
                  {settingsMsg && <span style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]/70">{settingsMsg}</span>}
                </div>
              </div>
            )}

          </motion.div>
        )}

        {/* ===== HISTORY — doimo ochiq, oxirgi 10 ta o'zgarish ===== */}
        <div className="mt-16 pt-10 border-t border-[#060920]/10">
          <div className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
            <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">
              O'zgarishlar tarixi
            </h2>
            <span style={{ fontFamily: "var(--font-body)" }} className="text-xs tracking-[0.15em] uppercase text-[#060920]/40">
              Oxirgi 10 ta amal
            </span>
          </div>

          {!data || data.history.length === 0 ? (
            <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/40 tracking-wide py-6">
              Hozircha o'zgarish qayd etilmagan.
            </p>
          ) : (
            <div className="space-y-px bg-[#060920]/10 border border-[#060920]/10 rounded-2xl overflow-hidden">
              {data.history.map((h) => (
                <div key={h.id} className="bg-white px-5 py-4 flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span style={{ fontFamily: "var(--font-display)" }} className="text-[#060920]">
                      {h.actor}
                    </span>
                    <span style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/70">
                      {h.action}
                    </span>
                  </div>
                  <span style={{ fontFamily: "var(--font-body)" }} className="text-xs text-[#060920]/40 whitespace-nowrap">
                    {formatDate(h.time)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== OFFER MODAL ===== */}
      <AnimatePresence>
        {showOfferModal && (
          <ModalShell title={editingOffer ? "Taklifni tahrirlash" : "Yangi taklif"} onClose={() => { setShowOfferModal(false); setEditingOffer(null); }}>
            <form onSubmit={saveOffer} className="space-y-4">
              <input name="title" required defaultValue={editingOffer?.title || ""} placeholder="Taklif sarlavhasi *" style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              <input name="tag" defaultValue={editingOffer?.tag || ""} placeholder="Yorliq (masalan: Yangi, Chegirma) — ixtiyoriy" style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              <textarea name="description" required rows={4} defaultValue={editingOffer?.description || ""} placeholder="Taklif tavsifi *" style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              <SaveBtn saving={saving} editing={!!editingOffer} />
            </form>
          </ModalShell>
        )}
      </AnimatePresence>

      {/* ===== PROJECT MODAL ===== */}
      <AnimatePresence>
        {showProjectModal && (
          <ModalShell wide title={editingProject ? "Loyihani tahrirlash" : "Yangi loyiha"} onClose={() => { setShowProjectModal(false); setEditingProject(null); }}>
            <form onSubmit={saveProject} className="space-y-4">
              <input name="name" required defaultValue={editingProject?.name || ""} placeholder="Obyekt nomi *" style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="direction" defaultValue={editingProject?.direction || ""} placeholder="Yo'nalish (biznes markaz / JK / fasad...)" style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                <input name="location" defaultValue={editingProject?.location || ""} placeholder="Hudud (masalan: Toshkent)" style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="area" defaultValue={editingProject?.area || ""} placeholder="Maydon (masalan: 5000 m²)" style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                <input name="year" defaultValue={editingProject?.year || ""} placeholder="Yil (masalan: 2025)" style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="status" defaultValue={editingProject?.status || ""} placeholder="Holati (masalan: Yakunlangan)" style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                <input name="workType" defaultValue={editingProject?.workType || ""} placeholder="Ish turi (masalan: pardoz + muhandislik)" style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="duration" defaultValue={editingProject?.duration || ""} placeholder="Muddat (masalan: 6 oy)" style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                <input name="role" defaultValue={editingProject?.role || ""} placeholder="BARPO roli (masalan: bosh pudratchi)" style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">Vazifa (mijoz oldida qanday vazifa turgan edi?)</label>
                <textarea name="task" rows={2} defaultValue={editingProject?.task || ""} placeholder="Bu obyekt bo'yicha asosiy vazifa..." style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">Murakkablik (qaysi joyda xavf yoki muammo bor edi?)</label>
                <textarea name="problem" rows={2} defaultValue={editingProject?.problem || ""} placeholder="Asosiy muammo yoki texnik murakkablik..." style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">BARPO yechimi (qanday yondashuv qo'llandi?)</label>
                <textarea name="solution" rows={2} defaultValue={editingProject?.solution || ""} placeholder="BARPO jarayonni qanday boshqardi..." style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">Jarayon (ishlar qanday ketdi, qaysi bosqichlar bo'ldi?)</label>
                <textarea name="process" rows={2} defaultValue={editingProject?.process || ""} placeholder="Ishlar bosqichlari..." style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">Natija (mijoz nimaga erishdi?)</label>
                <textarea name="result" rows={2} defaultValue={editingProject?.result || ""} placeholder="Natija qanday bo'ldi..." style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <textarea name="description" rows={2} defaultValue={editingProject?.description || ""} placeholder="Qisqa tavsif (kartochkada ko'rinadi)" style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">Batafsil matn (har bir xatboshi yangi qatordan)</label>
                <textarea name="details" rows={5} defaultValue={editingProject?.details || ""} placeholder="Loyiha haqida batafsil ma'lumot..." style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">Asosiy ko'rsatkichlar (har biri yangi qatordan)</label>
                <textarea name="features" rows={3} defaultValue={editingProject?.features || ""} placeholder={"Masalan:\n8 qavat\nMuddatda topshirildi\n0 ta nuqson"} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">
                  Loyiha rasmi {editingProject?.hasImage ? "(yangi rasm yuklasangiz, eskisi almashadi)" : ""}
                </label>
                <input type="file" name="image" accept="image/*" style={{ fontFamily: "var(--font-body)" }}
                  className="w-full text-sm text-[#060920]/70 file:mr-4 file:px-4 file:py-2 file:rounded-lg file:border file:border-[#060920]/15 file:bg-white file:text-[#060920]/70 file:cursor-pointer cursor-pointer" />
              </div>
              <SaveBtn saving={saving} editing={!!editingProject} />
            </form>
          </ModalShell>
        )}
      </AnimatePresence>

      {/* ===== ORNAMENT (NAQSH) MODAL ===== */}
      <AnimatePresence>
        {showOrnamentModal && (
          <ModalShell wide title={editingOrnament ? "Naqshni tahrirlash" : "Yangi naqsh"} onClose={() => { setShowOrnamentModal(false); setEditingOrnament(null); }}>
            <form onSubmit={saveOrnament} className="space-y-4">
              <input name="old" required defaultValue={editingOrnament?.old || ""} placeholder="Naqsh nomi (masalan: Girih naqshi) *" style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              <input name="desc" defaultValue={editingOrnament?.desc || ""} placeholder="Qisqa izoh (kartochkada ko'rinadi)" style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">Tarixiy ma'lumot (batafsil)</label>
                <textarea name="history" rows={4} defaultValue={editingOrnament?.history || ""} placeholder="Naqsh va uning tarixi haqida batafsil..." style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">
                  Naqsh rasmi (miniatura) {editingOrnament?.hasImage ? "(yangi rasm yuklasangiz, eskisi almashadi)" : ""}
                </label>
                <input type="file" name="image" accept="image/*" style={{ fontFamily: "var(--font-body)" }}
                  className="w-full text-sm text-[#060920]/70 file:mr-4 file:px-4 file:py-2 file:rounded-lg file:border file:border-[#060920]/15 file:bg-white file:text-[#060920]/70 file:cursor-pointer cursor-pointer" />
              </div>
              <SaveBtn saving={saving} editing={!!editingOrnament} />
            </form>
          </ModalShell>
        )}
      </AnimatePresence>

      {/* ===== STANDART MODAL ===== */}
      <AnimatePresence>
        {showStandardModal && (
          <ModalShell title={editingStandard ? "Standartni tahrirlash" : "Yangi standart"} onClose={() => { setShowStandardModal(false); setEditingStandard(null); }}>
            <form onSubmit={saveStandard} className="space-y-4">
              <input name="title" required defaultValue={editingStandard?.title || ""} placeholder="Sarlavha (masalan: Tizim) *" style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              <textarea name="desc" required rows={4} defaultValue={editingStandard?.desc || ""} placeholder="Tavsif *" style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              <SaveBtn saving={saving} editing={!!editingStandard} />
            </form>
          </ModalShell>
        )}
      </AnimatePresence>

      {/* ===== INVESTOR MODAL ===== */}
      <AnimatePresence>
        {showInvestorModal && (
          <ModalShell wide title={editingInvestor ? "Bo'limni tahrirlash" : "Yangi investor bo'limi"} onClose={() => { setShowInvestorModal(false); setEditingInvestor(null); }}>
            <form onSubmit={saveInvestor} className="space-y-4">
              <input name="title" required defaultValue={editingInvestor?.title || ""} placeholder="Sarlavha *" style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">Matn (har bir xatboshi yangi qatordan)</label>
                <textarea name="text" required rows={7} defaultValue={editingInvestor?.text || ""} placeholder="Bo'lim matni..." style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">Kalit fikr</label>
                <textarea name="key" rows={2} defaultValue={editingInvestor?.key || ""} placeholder="Asosiy g'oya..." style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <SaveBtn saving={saving} editing={!!editingInvestor} />
            </form>
          </ModalShell>
        )}
      </AnimatePresence>
      {/* ===== ADMIN MODAL (faqat superadmin) ===== */}
      <AnimatePresence>
        {showAdminModal && (
          <ModalShell wide title={editingAdmin ? `Adminni tahrirlash — ${editingAdmin.name}` : "Yangi admin"} onClose={() => { setShowAdminModal(false); setEditingAdmin(null); }}>
            <form onSubmit={saveAdminUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="name" required defaultValue={editingAdmin?.name || ""} placeholder="Ism *" style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                <input name="username" required defaultValue={editingAdmin?.username || ""} placeholder="Login *" autoComplete="off" style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              </div>
              <input name="password" type="text" required={!editingAdmin} defaultValue={editingAdmin?.password || ""} autoComplete="new-password"
                placeholder={editingAdmin ? "Parol (o'zgartirish uchun yangisini yozing)" : "Parol *"}
                style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              {editingAdmin?.username !== me?.username && (
                <div>
                  <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">Rol</label>
                  <select name="role" defaultValue={editingAdmin?.role || "admin"} style={{ fontFamily: "var(--font-body)" }} className={inputClass}>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Bosh admin</option>
                  </select>
                </div>
              )}
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-2">Bo'lim ruxsatlari</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {PERM_LABELS.map((p) => (
                    <label key={p.key} style={{ fontFamily: "var(--font-body)" }}
                      className="flex items-center gap-2 px-3 py-2 border border-[#060920]/10 rounded-lg text-sm text-[#060920]/70 cursor-pointer hover:bg-[#060920]/5 transition-colors">
                      <input type="checkbox" name={`perm_${p.key}`} defaultChecked={editingAdmin ? editingAdmin.perms?.[p.key] !== false : true} className="accent-[#060920]" />
                      {p.label}
                    </label>
                  ))}
                </div>
              </div>
              <SaveBtn saving={saving} editing={!!editingAdmin} />
            </form>
          </ModalShell>
        )}
      </AnimatePresence>

      {/* ===== TOPSHIRIQ MODAL (faqat superadmin) ===== */}
      <AnimatePresence>
        {showTaskModal && (
          <ModalShell title="Yangi topshiriq" onClose={() => setShowTaskModal(false)}>
            <form onSubmit={saveTask} className="space-y-4">
              <input name="title" required placeholder="Topshiriq sarlavhasi *" style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              <textarea name="desc" rows={4} placeholder="Batafsil tavsif (ixtiyoriy)" style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">Kimga</label>
                <select name="assignee" required style={{ fontFamily: "var(--font-body)" }} className={inputClass}>
                  {(data?.admins || []).filter((a) => a.username !== me?.username).map((a) => (
                    <option key={a.username} value={a.username}>{a.name} ({a.username})</option>
                  ))}
                </select>
              </div>
              <SaveBtn saving={saving} editing={false} />
            </form>
          </ModalShell>
        )}
      </AnimatePresence>
    </div>
  );
}

function ModalShell({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#060920]/40 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${wide ? "max-w-2xl" : "max-w-lg"} bg-white rounded-2xl p-8 shadow-2xl my-auto`}>
        <div className="flex items-center justify-between mb-6">
          <h3 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">{title}</h3>
          <button onClick={onClose} style={{ fontFamily: "var(--font-body)" }} className="px-3 py-1 rounded-lg hover:bg-[#060920]/5 text-[#060920]/50 text-sm">Yopish</button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function SaveBtn({ saving, editing }: { saving: boolean; editing: boolean }) {
  return (
    <button type="submit" disabled={saving} style={{ fontFamily: "var(--font-body)" }}
      className="w-full px-8 py-3.5 bg-[#060920] text-white tracking-[0.15em] uppercase text-sm font-medium rounded-2xl hover:shadow-xl transition-all disabled:opacity-70">
      {saving ? "Saqlanmoqda..." : editing ? "Saqlash" : "Qo'shish"}
    </button>
  );
}

function SectionImageCard({
  itemKey, label, version, onUpload, onDelete,
}: {
  itemKey: string;
  label: string;
  version?: number;
  onUpload: (key: string, file: File) => Promise<void>;
  onDelete: (key: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const hasImage = !!version;
  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try { await onUpload(itemKey, file); } catch {} finally { setBusy(false); e.target.value = ""; }
  };
  return (
    <div className="p-4 bg-white/60 border border-[#060920]/10 rounded-2xl flex gap-4 items-start">
      <div className="w-28 h-20 rounded-xl bg-[#060920]/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
        {hasImage ? (
          <img src={`/api/section-image?key=${itemKey}&v=${version}`} alt={label} className="w-full h-full object-cover" />
        ) : (
          <span style={{ fontFamily: "var(--font-display)" }} className="text-[#060920]/20 text-xs">Rasm yo'q</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div style={{ fontFamily: "var(--font-display)" }} className="text-[#060920] text-sm leading-snug">{label}</div>
        <div className="flex gap-2 mt-3 flex-wrap items-center" style={{ fontFamily: "var(--font-body)" }}>
          <label className="px-3 py-1.5 rounded-lg text-xs tracking-wide border border-[#060920]/15 text-[#060920]/70 hover:bg-[#060920]/5 transition-colors cursor-pointer">
            {busy ? "Yuklanmoqda..." : hasImage ? "Almashtirish" : "Rasm yuklash"}
            <input type="file" accept="image/*" onChange={handleFile} disabled={busy} className="hidden" />
          </label>
          {hasImage && (
            <button onClick={() => onDelete(itemKey)} disabled={busy}
              className="px-3 py-1.5 rounded-lg text-xs tracking-wide border border-[#060920]/30 text-[#060920] hover:bg-[#060920]/10 transition-colors">
              O'chirish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="text-center py-20">
      <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/40 tracking-wide">{text}</p>
    </div>
  );
}
