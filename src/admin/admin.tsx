import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BarpoWord } from "../app/components/Barpo";
import { useT } from "../app/i18n";
import { Eye, EyeOff } from "lucide-react";

const CREDS_KEY = "barpo_admin_creds";

// DIQQAT: parol bu yerda HECH QACHON saqlanmaydi — faqat login paytida
// bir martalik almashinuvda ishlatiladi. Keyingi barcha so'rovlar server
// bergan muddatli sessiya tokeni (Authorization sarlavhasi) orqali boradi.
interface Creds {
  token: string;
  username: string;
  name: string;
}

function loadCreds(): Creds | null {
  try {
    const raw = sessionStorage.getItem(CREDS_KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<Creds>) : null;
    if (!parsed || !parsed.token) return null;
    return parsed as Creds;
  } catch {
    return null;
  }
}

type Tab = "projects" | "ornaments" | "offers" | "standards" | "investors" | "blog" | "sections" | "stats" | "suggestions" | "hr" | "contacts" | "settings" | "tasks" | "admins" | "services" | "culture";

interface BlogArticle {
  id: string; title: string; titleRu?: string; rubric: string; rubricRu?: string; content: string; contentRu?: string;
  hasImage?: boolean; status: "draft" | "published"; createdAt: string; publishedAt?: string | null;
}

// Bo'lim ruxsatlari (superadmin boshqaradi)
const PERM_LABELS: { key: string; label: string; ru: string }[] = [
  { key: "projects", label: "Loyihalar", ru: "Проекты" },
  { key: "ornaments", label: "Naqshlar", ru: "Орнаменты" },
  { key: "standards", label: "Standartlar", ru: "Стандарты" },
  { key: "investors", label: "Investorlar", ru: "Инвесторы" },
  { key: "blog", label: "Bilim markazi", ru: "Центр знаний" },
  { key: "offers", label: "Cheklangan takliflar", ru: "Ограниченные предложения" },
  { key: "sections", label: "Bo'lim rasmlari", ru: "Изображения разделов" },
  { key: "stats", label: "Statistika", ru: "Статистика" },
  { key: "suggestions", label: "Kelgan takliflar", ru: "Поступившие предложения" },
  { key: "hr", label: "HR arizalari", ru: "HR-заявки" },
  { key: "contacts", label: "Aloqa so'rovlari", ru: "Запросы на связь" },
  { key: "settings", label: "Sozlamalar", ru: "Настройки" },
  { key: "services", label: "Xizmatlar", ru: "Услуги" },
  { key: "culture", label: "Madaniyat", ru: "Культура" },
];

interface AdminUser {
  // Parol hech qachon serverdan qaytarilmaydi (tahrirlash formasi bo'sh boshlanadi).
  username: string; name: string;
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
// Xizmatlar/Madaniyat guruhlari data.services / data.cultureElements'dan DINAMIK tuziladi
// (elementning haqiqiy .id'si bo'yicha) — shunda rasm biriktiruvi elementlar
// qo'shilsa/o'chirilsa/tartibi o'zgarsa ham to'g'ri elementga bog'liq bo'lib qoladi.
// "Investorlar sahifasi" guruhi ataylab yo'q: investor kartalari hech qachon rasm
// ko'rsatmaydi (faqat matn), shuning uchun bu yerda mavjud bo'lgan eski investor-0..4
// slotlari hech qachon hech qaerda render qilinmagan — o'lik UI edi, olib tashlandi.
function sectionImageGroups(data: AdminData): { group: string; groupRu: string; items: { key: string; label: string; ru: string }[] }[] {
  return [
    {
      group: "Bosh sahifa qavatlari",
      groupRu: "Этажи главной страницы",
      items: [
        { key: "floor-1", label: "1 · Yangi qurilish madaniyati", ru: "1 · Новая культура строительства" },
        { key: "floor-2", label: "2 · Biz haqimizda", ru: "2 · О нас" },
        { key: "floor-3", label: "3 · Missiya", ru: "3 · Миссия" },
        { key: "floor-4", label: "4 · BARPO nima qiladi", ru: "4 · Что делает BARPO" },
        { key: "floor-5", label: "5 · Nima uchun BARPO", ru: "5 · Почему BARPO" },
        { key: "floor-6", label: "6 · BARPO standarti", ru: "6 · Стандарт BARPO" },
        { key: "floor-7", label: "7 · Qanday ishlaymiz", ru: "7 · Как мы работаем" },
        { key: "floor-8", label: "8 · Loyihalar", ru: "8 · Проекты" },
        { key: "floor-9", label: "9 · Hisobot va nazorat", ru: "9 · Отчётность и контроль" },
        { key: "floor-10", label: "10 · Iqtisodiy foyda", ru: "10 · Экономическая выгода" },
        { key: "floor-11", label: "11 · Milliy identitet", ru: "11 · Национальная идентичность" },
        { key: "floor-12", label: "12 · Aloqa", ru: "12 · Контакты" },
      ],
    },
    {
      group: "Madaniyat sahifasi",
      groupRu: "Страница «Культура»",
      items: (data.cultureElements ?? []).map((e, i) => ({
        key: `culture-${e.id}`,
        label: `${i + 1} · ${e.titleUz || "?"}`,
        ru: `${i + 1} · ${e.titleRu || e.titleUz || "?"}`,
      })),
    },
    {
      group: "Xizmatlar sahifasi",
      groupRu: "Страница «Услуги»",
      items: (data.services ?? []).map((s, i) => ({
        key: `service-${s.id}`,
        label: `${i + 1} · ${s.titleUz || "?"}`,
        ru: `${i + 1} · ${s.titleRu || s.titleUz || "?"}`,
      })),
    },
  ];
}

interface Project {
  id: string; name: string; nameRu?: string; location: string; locationRu?: string; area: string; areaRu?: string; year: string;
  status: string; statusRu?: string; description: string; descriptionRu?: string; details: string; detailsRu?: string; features: string; featuresRu?: string;
  direction?: string; directionRu?: string; task?: string; taskRu?: string; solution?: string; solutionRu?: string; result?: string; resultRu?: string;
  workType?: string; workTypeRu?: string; duration?: string; durationRu?: string; role?: string; roleRu?: string; problem?: string; problemRu?: string; process?: string; processRu?: string;
  hasImage?: boolean; active: boolean; createdAt: string;
}
interface Offer {
  id: string; title: string; titleRu?: string; description: string; descriptionRu?: string; tag: string; tagRu?: string; active: boolean; createdAt: string;
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
  id: string; old: string; oldRu?: string; new: string; newRu?: string; desc: string; descRu?: string; history: string; historyRu?: string;
  hasImage?: boolean; active: boolean; createdAt: string;
}
interface Standard {
  id: string; title: string; titleRu?: string; desc: string; descRu?: string; active: boolean; createdAt: string;
}
interface Investor {
  id: string; title: string; titleRu?: string; text: string; textRu?: string; key: string; keyRu?: string; active: boolean; createdAt: string;
}
interface HistoryEntry {
  id: string; actor: string; action: string; time: string;
}
interface Service {
  id: string; titleUz: string; titleRu: string; descUz: string; descRu: string;
  highlightUz: string; highlightRu: string; active: boolean; createdAt: string;
}
interface CultureElement {
  id: string; titleUz: string; titleRu: string; descUz: string; descRu: string;
  detailsUz: string; detailsRu: string;
  principlesUz: string[]; principlesRu: string[];
  active: boolean; createdAt: string;
}
interface AdminData {
  projects: Project[]; ornaments: Ornament[]; standards: Standard[]; investors: Investor[];
  hr: HRRecord[]; offers: Offer[];
  suggestions: Suggestion[]; contacts: Contact[]; history: HistoryEntry[];
  blog?: BlogArticle[];
  services?: Service[]; cultureElements?: CultureElement[];
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
  const t = useT();
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
  const [editingBlog, setEditingBlog] = useState<BlogArticle | null>(null);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [blogSort, setBlogSort] = useState<"new" | "old">("new");
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingCulture, setEditingCulture] = useState<CultureElement | null>(null);
  const [showCultureModal, setShowCultureModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>({ notifyEmails: [], notifyEmailsByType: { hr: [], suggestion: [], contact: [] }, smtp: {}, sheetsWebhook: "", telegram: emptyTg(), telegramByType: { hr: emptyTg(), suggestion: emptyTg(), contact: emptyTg() }, socials: { telegram: "", instagram: "", facebook: "", youtube: "" }, contactInfo: { phone: "", email: "", address: "" } });
  const [settingsMsg, setSettingsMsg] = useState("");

  const isLoggedIn = !!creds;

  const inputClass =
    "w-full px-4 py-3 bg-white/50 border border-[#060920]/15 text-[#060920] placeholder-[#060920]/40 focus:outline-none focus:border-[#060920]/40 transition-colors rounded-lg";

  const handleLogout = useCallback(() => {
    setCreds((prev) => {
      if (prev?.token) fetch("/api/admin/logout", { method: "POST", headers: { Authorization: `Bearer ${prev.token}` } }).catch(() => {});
      return null;
    });
    sessionStorage.removeItem(CREDS_KEY);
    setData(null);
  }, []);

  // Barcha autentifikatsiyalangan so'rovlar shu yordamchi orqali o'tadi: token
  // Authorization sarlavhasida yuboriladi — URL manzilida HECH QACHON parol
  // (yoki hatto token) ko'rinmaydi. 401 kelsa, sessiya tugagan/bekor bo'lgan
  // deb hisoblanadi (masalan, o'z loginingizni endigina o'zgartirgan bo'lsangiz)
  // — avtomatik chiqib, login ekraniga qaytariladi.
  const apiCall = useCallback(async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    if (creds?.token) headers.set("Authorization", `Bearer ${creds.token}`);
    const res = await fetch(url, { ...options, headers });
    if (res.status === 401) {
      handleLogout();
      throw new Error(t("Sessiya tugadi — qaytadan tizimga kiring", "Сессия истекла — войдите снова"));
    }
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json.ok) throw new Error(json.error || t("Xatolik", "Ошибка"));
    return json;
  }, [creds, handleLogout, t]);

  // window.open / <a href> kabi to'g'ridan-to'g'ri navigatsiyalar maxsus
  // sarlavha qo'sha olmaydi — shu bir nechta joyda (CSV eksport, rezyume
  // yuklab olish) token URL query-parametri sifatida yuboriladi. Bu ham
  // ochiq parol emas — muddati tugaydigan va chiqishda bekor qilinadigan token.
  const authTokenQS = () => `token=${encodeURIComponent(creds?.token || "")}`;

  const loadData = useCallback(() => {
    if (!creds?.token) return;
    setLoading(true);
    setFetchError("");
    apiCall("/api/admin/data")
      .then((json) => setData(json.data))
      .catch((err) => setFetchError(err instanceof Error ? err.message : t("Ma'lumot olishda xatolik", "Ошибка при получении данных")))
      .finally(() => setLoading(false));
    fetch("/api/section-images")
      .then((r) => r.json())
      .then((j) => { if (j.ok) setSectionImages(j.images || {}); })
      .catch(() => {});
    fetch("/api/stats")
      .then((r) => r.json())
      .then((j) => { if (j.ok && Array.isArray(j.stats) && j.stats.length) setStats(j.stats); })
      .catch(() => {});
    apiCall("/api/admin/settings")
      .then((j) => { if (j.settings) setSettings({ notifyEmails: j.settings.notifyEmails || [], notifyEmailsByType: { hr: j.settings.notifyEmailsByType?.hr || [], suggestion: j.settings.notifyEmailsByType?.suggestion || [], contact: j.settings.notifyEmailsByType?.contact || [] }, smtp: j.settings.smtp || {}, sheetsWebhook: j.settings.sheetsWebhook || "", telegram: { botToken: j.settings.telegram?.botToken || "", chatIds: j.settings.telegram?.chatIds || [] }, telegramByType: { hr: { botToken: j.settings.telegramByType?.hr?.botToken || "", chatIds: j.settings.telegramByType?.hr?.chatIds || [] }, suggestion: { botToken: j.settings.telegramByType?.suggestion?.botToken || "", chatIds: j.settings.telegramByType?.suggestion?.chatIds || [] }, contact: { botToken: j.settings.telegramByType?.contact?.botToken || "", chatIds: j.settings.telegramByType?.contact?.chatIds || [] } }, socials: { telegram: j.settings.socials?.telegram || "", instagram: j.settings.socials?.instagram || "", facebook: j.settings.socials?.facebook || "", youtube: j.settings.socials?.youtube || "" }, contactInfo: { phone: j.settings.contactInfo?.phone || "", email: j.settings.contactInfo?.email || "", address: j.settings.contactInfo?.address || "" } }); })
      .catch(() => {});
  }, [creds, apiCall, t]);

  // HR holatini o'zgartirish (qabul/rad/kutish)
  const setHrStatus = async (folder: string, status: string) => {
    const labels: Record<string, string> = {
      accepted: t("qabul qilish", "принять"),
      rejected: t("rad etish", "отклонить"),
      pending: t("kutishga qaytarish", "вернуть в ожидание"),
    };
    if (!confirm(t(`Bu arizani ${labels[status]}ni tasdiqlaysizmi?`, `Подтверждаете действие «${labels[status]}» для этой заявки?`))) return;
    try {
      await apiCall("/api/admin/hr-status", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ folder, status }) });
      loadData();
    } catch (err) { alert(err instanceof Error ? err.message : t("Xatolik", "Ошибка")); }
  };

  // HR arizasini butunlay o'chirish (rezyume papkasi bilan)
  const deleteHr = async (folder: string, name: string) => {
    if (!confirm(t(`"${name}" arizasi butunlay o'chirilsinmi? Rezyume fayli ham o'chadi va qaytarib bo'lmaydi.`, `Полностью удалить заявку «${name}»? Файл резюме также будет удалён без возможности восстановления.`))) return;
    try {
      await apiCall("/api/admin/hr-delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ folder }) });
      loadData();
    } catch (err) { alert(err instanceof Error ? err.message : t("Xatolik", "Ошибка")); }
  };

  // CSV yuklab olish
  const exportCsv = (type: string) => {
    if (!creds?.token) return;
    window.open(`/api/admin/export?type=${type}&${authTokenQS()}`, "_blank");
  };

  // Sozlamalarni saqlash
  const saveSettings = async () => {
    setSaving(true); setSettingsMsg("");
    try {
      await apiCall("/api/admin/settings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
      setSettingsMsg(t("Saqlandi ✅", "Сохранено ✅"));
    } catch (err) { setSettingsMsg(err instanceof Error ? err.message : t("Saqlashda xatolik", "Ошибка при сохранении")); } finally { setSaving(false); }
  };
  const sendTestTelegram = async (type: TgKey) => {
    setSettingsMsg(t("Yuborilmoqda...", "Отправляется..."));
    try {
      await apiCall(`/api/admin/test-telegram?type=${type}`, { method: "POST" });
      setSettingsMsg(t("Telegram test xabari yuborildi ✅", "Тестовое сообщение в Telegram отправлено ✅"));
    } catch (err) { setSettingsMsg(err instanceof Error ? err.message : t("Xatolik", "Ошибка")); }
  };
  const sendTestEmail = async (type: TgKey) => {
    setSettingsMsg(t("Yuborilmoqda...", "Отправляется..."));
    try {
      await apiCall(`/api/admin/test-email?type=${type}`, { method: "POST" });
      setSettingsMsg(t("Test email yuborildi ✅", "Тестовое письмо отправлено ✅"));
    } catch (err) { setSettingsMsg(err instanceof Error ? err.message : t("Xatolik", "Ошибка")); }
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
        setLoginError(json.error || t("Login yoki parol noto'g'ri", "Неверный логин или пароль"));
        return;
      }
      const newCreds: Creds = { token: json.token, username: json.username, name: json.name };
      sessionStorage.setItem(CREDS_KEY, JSON.stringify(newCreds));
      setCreds(newCreds);
      setPassword("");
    } catch {
      setLoginError(t("Server bilan bog'lanib bo'lmadi", "Не удалось связаться с сервером"));
    } finally {
      setLoggingIn(false);
    }
  };

  // ---- Admin boshqaruvi amallari (faqat superadmin) ----
  const adminUserAction = async (payload: Record<string, unknown>) => {
    return apiCall("/api/admin/admins", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
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
          role: String(fd.get("role") || "admin"),
          perms,
        });
      }
      setShowAdminModal(false); setEditingAdmin(null); loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : t("Xatolik", "Ошибка"));
    } finally { setSaving(false); }
  };
  const deleteAdminUser = async (username: string) => {
    if (!confirm(t(`"${username}" admin o'chirilsinmi?`, `Удалить администратора «${username}»?`))) return;
    try { await adminUserAction({ action: "delete", username }); loadData(); }
    catch (err) { alert(err instanceof Error ? err.message : t("Xatolik", "Ошибка")); }
  };

  // ---- Topshiriq amallari ----
  const taskAction = (payload: Record<string, unknown>) =>
    apiCall("/api/admin/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const saveTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      await taskAction({ action: "create", ...body });
      setShowTaskModal(false); loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : t("Xatolik", "Ошибка"));
    } finally { setSaving(false); }
  };
  // (parametr `task` deb nomlangan — tashqi tarjima funksiyasi `t`ni soyalamasligi uchun)
  const toggleTaskDone = async (task: TaskItem) => {
    try { await taskAction({ action: task.status === "done" ? "undone" : "done", id: task.id }); loadData(); }
    catch (err) { alert(err instanceof Error ? err.message : t("Xatolik", "Ошибка")); }
  };
  const deleteTask = async (id: string) => {
    if (!confirm(t("Bu topshiriq o'chirilsinmi?", "Удалить это задание?"))) return;
    try { await taskAction({ action: "delete", id }); loadData(); }
    catch (err) { alert(err instanceof Error ? err.message : t("Xatolik", "Ошибка")); }
  };

  // ---- Offer amallari (JSON) ----
  const offerAction = (payload: Record<string, unknown>) =>
    apiCall("/api/admin/offers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const saveOffer = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      if (editingOffer) await offerAction({ action: "update", id: editingOffer.id, ...body });
      else await offerAction({ action: "create", ...body });
      setShowOfferModal(false); setEditingOffer(null); loadData();
    } catch (err) { alert(err instanceof Error ? err.message : t("Xatolik", "Ошибка")); } finally { setSaving(false); }
  };
  const toggleOffer = async (id: string) => {
    try { await offerAction({ action: "toggle", id }); loadData(); }
    catch (err) { alert(err instanceof Error ? err.message : t("Xatolik", "Ошибка")); }
  };
  const deleteOffer = async (id: string) => {
    if (!confirm(t("Bu taklif o'chirilsinmi?", "Удалить это предложение?"))) return;
    try { await offerAction({ action: "delete", id }); loadData(); }
    catch (err) { alert(err instanceof Error ? err.message : t("Xatolik", "Ошибка")); }
  };

  // ---- Loyiha amallari (FormData — rasm bilan) ----
  const projectAction = (fd: FormData) => apiCall("/api/admin/projects", { method: "POST", body: fd });
  const saveProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    fd.append("action", editingProject ? "update" : "create");
    if (editingProject) fd.append("id", editingProject.id);
    try {
      await projectAction(fd);
      setShowProjectModal(false); setEditingProject(null); loadData();
    } catch (err) { alert(err instanceof Error ? err.message : t("Xatolik", "Ошибка")); } finally { setSaving(false); }
  };
  const projectSimple = async (action: string, id: string) => {
    const fd = new FormData();
    fd.append("action", action); fd.append("id", id);
    try { await projectAction(fd); loadData(); }
    catch (err) { alert(err instanceof Error ? err.message : t("Xatolik", "Ошибка")); }
  };
  const toggleProject = (id: string) => projectSimple("toggle", id);
  const deleteProject = (id: string) => {
    if (!confirm(t("Bu loyiha o'chirilsinmi? Rasm ham o'chadi.", "Удалить этот проект? Изображение также будет удалено."))) return;
    projectSimple("delete", id);
  };

  // ---- Naqsh amallari (FormData — rasm bilan) ----
  const ornamentAction = (fd: FormData) => apiCall("/api/admin/ornaments", { method: "POST", body: fd });
  const saveOrnament = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    fd.append("action", editingOrnament ? "update" : "create");
    if (editingOrnament) fd.append("id", editingOrnament.id);
    try {
      await ornamentAction(fd);
      setShowOrnamentModal(false); setEditingOrnament(null); loadData();
    } catch (err) { alert(err instanceof Error ? err.message : t("Xatolik", "Ошибка")); } finally { setSaving(false); }
  };
  const ornamentSimple = async (action: string, id: string) => {
    const fd = new FormData();
    fd.append("action", action); fd.append("id", id);
    try { await ornamentAction(fd); loadData(); }
    catch (err) { alert(err instanceof Error ? err.message : t("Xatolik", "Ошибка")); }
  };
  const toggleOrnament = (id: string) => ornamentSimple("toggle", id);
  const deleteOrnament = (id: string) => {
    if (!confirm(t("Bu naqsh o'chirilsinmi?", "Удалить этот орнамент?"))) return;
    ornamentSimple("delete", id);
  };

  // ---- Standart amallari (JSON) ----
  const standardAction = (payload: Record<string, unknown>) =>
    apiCall("/api/admin/standards", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const saveStandard = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      if (editingStandard) await standardAction({ action: "update", id: editingStandard.id, ...body });
      else await standardAction({ action: "create", ...body });
      setShowStandardModal(false); setEditingStandard(null); loadData();
    } catch (err) { alert(err instanceof Error ? err.message : t("Xatolik", "Ошибка")); } finally { setSaving(false); }
  };
  const toggleStandard = async (id: string) => {
    try { await standardAction({ action: "toggle", id }); loadData(); }
    catch (err) { alert(err instanceof Error ? err.message : t("Xatolik", "Ошибка")); }
  };
  const deleteStandard = async (id: string) => {
    if (!confirm(t("Bu standart o'chirilsinmi?", "Удалить этот стандарт?"))) return;
    try { await standardAction({ action: "delete", id }); loadData(); }
    catch (err) { alert(err instanceof Error ? err.message : t("Xatolik", "Ошибка")); }
  };

  // ---- Investor amallari (JSON) ----
  const investorAction = (payload: Record<string, unknown>) =>
    apiCall("/api/admin/investors", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const saveInvestor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      if (editingInvestor) await investorAction({ action: "update", id: editingInvestor.id, ...body });
      else await investorAction({ action: "create", ...body });
      setShowInvestorModal(false); setEditingInvestor(null); loadData();
    } catch (err) { alert(err instanceof Error ? err.message : t("Xatolik", "Ошибка")); } finally { setSaving(false); }
  };
  const toggleInvestor = async (id: string) => {
    try { await investorAction({ action: "toggle", id }); loadData(); }
    catch (err) { alert(err instanceof Error ? err.message : t("Xatolik", "Ошибка")); }
  };
  const deleteInvestor = async (id: string) => {
    if (!confirm(t("Bu bo'lim o'chirilsinmi?", "Удалить этот раздел?"))) return;
    try { await investorAction({ action: "delete", id }); loadData(); }
    catch (err) { alert(err instanceof Error ? err.message : t("Xatolik", "Ошибка")); }
  };

  // ---- Blog / Bilim markazi amallari (FormData — rasm bilan) ----
  const blogAction = (fd: FormData) => apiCall("/api/admin/blog", { method: "POST", body: fd });
  const saveBlog = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    fd.append("action", editingBlog ? "update" : "create");
    if (editingBlog) fd.append("id", editingBlog.id);
    try {
      await blogAction(fd);
      setShowBlogModal(false); setEditingBlog(null); loadData();
    } catch (err) { alert(err instanceof Error ? err.message : t("Xatolik", "Ошибка")); } finally { setSaving(false); }
  };
  const blogSimple = async (action: string, id: string) => {
    const fd = new FormData();
    fd.append("action", action); fd.append("id", id);
    try { await blogAction(fd); loadData(); } catch (err) { alert(err instanceof Error ? err.message : t("Xatolik", "Ошибка")); }
  };
  const publishBlog = (id: string) => blogSimple("publish", id);
  const unpublishBlog = (id: string) => blogSimple("unpublish", id);
  const deleteBlog = (id: string) => {
    if (!confirm(t("Bu maqola butunlay o'chirilsinmi?", "Полностью удалить эту статью?"))) return;
    blogSimple("delete", id);
  };

  // ---- Xizmat amallari (JSON) ----
  const serviceAction = (payload: Record<string, unknown>) =>
    apiCall("/api/admin/services", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const saveService = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      if (editingService) await serviceAction({ action: "update", id: editingService.id, ...body });
      else await serviceAction({ action: "create", ...body });
      setShowServiceModal(false); setEditingService(null); loadData();
    } catch (err) { alert(err instanceof Error ? err.message : t("Xatolik", "Ошибка")); } finally { setSaving(false); }
  };
  const toggleService = async (id: string) => {
    try { await serviceAction({ action: "toggle", id }); loadData(); }
    catch (err) { alert(err instanceof Error ? err.message : t("Xatolik", "Ошибка")); }
  };
  const deleteService = async (id: string) => {
    if (!confirm(t("Bu xizmat o'chirilsinmi?", "Удалить эту услугу?"))) return;
    try { await serviceAction({ action: "delete", id }); loadData(); }
    catch (err) { alert(err instanceof Error ? err.message : t("Xatolik", "Ошибка")); }
  };

  // ---- Madaniyat elementi amallari (JSON) ----
  const cultureAction = (payload: Record<string, unknown>) =>
    apiCall("/api/admin/culture-elements", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const saveCulture = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const body: Record<string, unknown> = Object.fromEntries(fd.entries());
    body.principlesUz = String(body.principlesUz || "").split("\n").map((x: string) => x.trim()).filter(Boolean);
    body.principlesRu = String(body.principlesRu || "").split("\n").map((x: string) => x.trim()).filter(Boolean);
    try {
      if (editingCulture) await cultureAction({ action: "update", id: editingCulture.id, ...body });
      else await cultureAction({ action: "create", ...body });
      setShowCultureModal(false); setEditingCulture(null); loadData();
    } catch (err) { alert(err instanceof Error ? err.message : t("Xatolik", "Ошибка")); } finally { setSaving(false); }
  };
  const toggleCulture = async (id: string) => {
    try { await cultureAction({ action: "toggle", id }); loadData(); }
    catch (err) { alert(err instanceof Error ? err.message : t("Xatolik", "Ошибка")); }
  };
  const deleteCulture = async (id: string) => {
    if (!confirm(t("Bu element o'chirilsinmi?", "Удалить этот элемент?"))) return;
    try { await cultureAction({ action: "delete", id }); loadData(); }
    catch (err) { alert(err instanceof Error ? err.message : t("Xatolik", "Ошибка")); }
  };

  // ---- Bo'lim rasmlari (culture / services boxlari) ----
  const uploadSectionImage = async (key: string, file: File) => {
    const fd = new FormData();
    fd.append("key", key);
    fd.append("image", file);
    await apiCall("/api/admin/section-image", { method: "POST", body: fd });
    loadData();
  };
  const deleteSectionImage = async (key: string) => {
    if (!confirm(t("Bu rasm o'chirilsinmi?", "Удалить это изображение?"))) return;
    const fd = new FormData();
    fd.append("key", key);
    fd.append("action", "delete");
    try {
      await apiCall("/api/admin/section-image", { method: "POST", body: fd });
      loadData();
    } catch (err) { alert(err instanceof Error ? err.message : t("Xatolik", "Ошибка")); }
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
      const json = await apiCall("/api/admin/stats", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stats }) });
      if (Array.isArray(json.stats)) setStats(json.stats);
      setStatsSaved(true);
      loadData();
    } catch (err) { alert(err instanceof Error ? err.message : t("Xatolik", "Ошибка")); } finally { setSavingStats(false); }
  };

  // ---- Kelgan taklif / aloqani o'chirish ----
  const deleteItem = async (type: "suggestion" | "contact", id: string) => {
    if (!confirm(t("O'chirilsinmi?", "Удалить?"))) return;
    try {
      await apiCall("/api/admin/delete", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, id }) });
      loadData();
    } catch (err) { alert(err instanceof Error ? err.message : t("Xatolik", "Ошибка")); }
  };

  // ---- LOGIN EKRANI ----
  if (!isLoggedIn) {
    return (
      <div data-lenis-prevent className="pt-24 min-h-screen flex items-center justify-center px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="w-full max-w-md">
          <div className="text-center mb-10 space-y-3">
            <p style={{ fontFamily: "var(--font-body)" }} className="opacity-60 tracking-[0.2em] uppercase text-sm text-[#060920]">{t("BOSHQARUV PANELI", "ПАНЕЛЬ УПРАВЛЕНИЯ")}</p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "#060920" }}>{t("Boshqaruvga kirish", "Вход в управление")}</h2>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
              placeholder={t("Login (username)", "Логин (username)")} autoComplete="username"
              style={{ fontFamily: "var(--font-body)" }} className={inputClass} autoFocus />
            <div className="relative">
              <input type={showLoginPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder={t("Parol", "Пароль")} autoComplete="current-password"
                style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} pr-12`} />
              <button type="button" onClick={() => setShowLoginPass((v) => !v)}
                aria-label={showLoginPass ? t("Parolni yashirish", "Скрыть пароль") : t("Parolni ko'rsatish", "Показать пароль")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#060920]/40 hover:text-[#060920] transition-colors">
                {showLoginPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {loginError && <p style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]">{loginError}</p>}
            <button type="submit" disabled={loggingIn} style={{ fontFamily: "var(--font-body)" }}
              className="w-full px-8 py-4 bg-[#060920] text-white tracking-[0.15em] uppercase font-medium rounded-2xl hover:shadow-xl transition-all disabled:opacity-70">
              {loggingIn ? t("Tekshirilmoqda...", "Проверяется...") : t("Kirish", "Войти")}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  const me = data?.me;
  const isSuper = me?.role === "superadmin";
  const hasPerm = (key: string) => isSuper || !me || me.perms?.[key] !== false;
  const assignableAdmins = (data?.admins || []).filter((a) => a.username !== me?.username);

  const tabs = [
    { id: "projects" as Tab, label: t("Loyihalar", "Проекты"), count: data?.projects.length ?? 0 },
    { id: "ornaments" as Tab, label: t("Naqshlar", "Орнаменты"), count: data?.ornaments?.length ?? 0 },
    { id: "standards" as Tab, label: t("Standartlar", "Стандарты"), count: data?.standards?.length ?? 0 },
    { id: "investors" as Tab, label: t("Investorlar", "Инвесторы"), count: data?.investors?.length ?? 0 },
    { id: "blog" as Tab, label: t("Bilim markazi", "Центр знаний"), count: data?.blog?.length ?? 0 },
    { id: "offers" as Tab, label: t("Cheklangan takliflar", "Ограниченные предложения"), count: data?.offers.length ?? 0 },
    { id: "sections" as Tab, label: t("Bo'lim rasmlari", "Изображения разделов"), count: Object.keys(sectionImages).length },
    { id: "stats" as Tab, label: t("Statistika", "Статистика"), count: stats.length },
    { id: "suggestions" as Tab, label: t("Kelgan takliflar", "Поступившие предложения"), count: data?.suggestions.length ?? 0 },
    { id: "hr" as Tab, label: t("HR Arizalari", "HR-заявки"), count: data?.hr.length ?? 0 },
    { id: "contacts" as Tab, label: t("Aloqa So'rovlari", "Запросы на связь"), count: data?.contacts.length ?? 0 },
    { id: "settings" as Tab, label: t("Sozlamalar", "Настройки"), count: [settings.telegram, settings.telegramByType.hr, settings.telegramByType.suggestion, settings.telegramByType.contact].reduce((sum, cfg) => sum + (cfg?.chatIds || []).filter(Boolean).length, 0) },
    { id: "services" as Tab, label: t("Xizmatlar", "Услуги"), count: data?.services?.length ?? 0 },
    { id: "culture" as Tab, label: t("Madaniyat", "Культура"), count: data?.cultureElements?.length ?? 0 },
  ].filter((tab) => hasPerm(tab.id));

  // Topshiriqlar hammaga, Adminlar faqat superadminga
  tabs.push({ id: "tasks" as Tab, label: t("Topshiriqlar", "Задания"), count: (data?.tasks || []).filter((tk) => tk.status !== "done").length });
  if (isSuper) tabs.push({ id: "admins" as Tab, label: t("Adminlar", "Администраторы"), count: data?.admins?.length ?? 0 });

  const btnGhost = "px-3 py-1.5 rounded-lg text-xs tracking-wide border border-[#060920]/15 text-[#060920]/70 hover:bg-[#060920]/5 transition-colors";
  const btnDanger = "px-3 py-1.5 rounded-lg text-xs tracking-wide border border-[#060920]/30 text-[#060920] hover:bg-[#060920]/10 transition-colors";

  return (
    <div data-lenis-prevent className="pt-24 min-h-screen px-6 md:px-16 py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10 flex-wrap gap-4">
          <div>
            <p style={{ fontFamily: "var(--font-body)" }} className="opacity-60 tracking-[0.2em] uppercase text-sm text-[#060920] mb-1"><BarpoWord /> {t("· BOSHQARUV", "УПРАВЛЕНИЕ")}</p>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "2rem", color: "#060920" }}>{t("Boshqaruv Paneli", "Панель управления")}</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div style={{ fontFamily: "var(--font-body)" }} className="text-xs tracking-[0.15em] uppercase text-[#060920]/40">{t("Kirgan admin", "Вошедший администратор")}</div>
              <div style={{ fontFamily: "var(--font-display)" }} className="text-[#060920]">{creds?.name}</div>
            </div>
            <button onClick={handleLogout} style={{ fontFamily: "var(--font-body)" }}
              className="px-5 py-2.5 border border-[#060920]/20 text-[#060920]/70 hover:text-[#060920] rounded-xl transition-colors text-sm tracking-wide">
              {t("Chiqish", "Выход")}
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

        {loading && <div className="text-center py-20"><div style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/50 tracking-wide animate-pulse">{t("Ma'lumotlar yuklanmoqda...", "Данные загружаются...")}</div></div>}
        {fetchError && <div className="text-center py-20"><p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]">{fetchError}</p></div>}

        {!loading && !fetchError && data && (
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

            {/* ===== LOYIHALAR ===== */}
            {activeTab === "projects" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
                  <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">{t("Loyihalar", "Проекты")} ({data.projects.length})</h2>
                  <button onClick={() => { setEditingProject(null); setShowProjectModal(true); }} style={{ fontFamily: "var(--font-body)" }}
                    className="px-5 py-2.5 bg-[#060920] text-white rounded-xl text-sm tracking-wide hover:shadow-lg transition-all">
                    + {t("Yangi loyiha", "Новый проект")}
                  </button>
                </div>
                {data.projects.length === 0 ? <EmptyState text={t("Hozircha loyiha qo'shilmagan. '+ Yangi loyiha' tugmasini bosing.", "Пока проекты не добавлены. Нажмите кнопку «+ Новый проект».")} /> : data.projects.map((p, i) => (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className={`p-5 bg-white/60 border rounded-2xl flex gap-5 items-start ${p.active ? "border-[#060920]/10" : "border-[#060920]/10 opacity-60"}`}>
                    <div className="w-24 h-24 rounded-xl bg-[#060920]/5 overflow-hidden flex-shrink-0">
                      {p.hasImage ? (
                        <img src={`/api/project-image?id=${p.id}`} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div style={{ fontFamily: "var(--font-display)" }} className="w-full h-full flex items-center justify-center text-[#060920]/20 text-xs"><BarpoWord className="opacity-30" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div style={{ fontFamily: "var(--font-display)" }} className="text-lg text-[#060920]">{p.name}</div>
                        {!p.active && <span style={{ fontFamily: "var(--font-body)" }} className="px-2.5 py-0.5 text-xs tracking-wide uppercase bg-[#060920]/10 text-[#060920] rounded-full">{t("Yashirin", "Скрыт")}</span>}
                      </div>
                      <div style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]/55 mt-1 space-x-2">
                        {p.location && <span>{p.location}</span>}
                        {p.area && <span>· {p.area}</span>}
                        {p.year && <span>· {p.year}</span>}
                      </div>
                      {p.description && <p style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]/60 mt-2 line-clamp-2">{p.description}</p>}
                      <div className="flex gap-2 mt-3 flex-wrap" style={{ fontFamily: "var(--font-body)" }}>
                        <button onClick={() => { setEditingProject(p); setShowProjectModal(true); }} className={btnGhost}>{t("Tahrirlash", "Редактировать")}</button>
                        <button onClick={() => toggleProject(p.id)} className={btnGhost}>{p.active ? t("Yashirish", "Скрыть") : t("Ko'rsatish", "Показать")}</button>
                        <button onClick={() => deleteProject(p.id)} className={btnDanger}>{t("O'chirish", "Удалить")}</button>
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
                    {t("Topshiriqlar", "Задания")} ({(data.tasks || []).length})
                  </h2>
                  {isSuper && assignableAdmins.length > 0 && (
                    <button onClick={() => setShowTaskModal(true)} style={{ fontFamily: "var(--font-body)" }}
                      className="px-5 py-2.5 bg-[#060920] text-white rounded-xl text-sm tracking-wide hover:shadow-lg transition-all">
                      + {t("Yangi topshiriq", "Новое задание")}
                    </button>
                  )}
                </div>
                {isSuper && assignableAdmins.length === 0 && (
                  <p style={{ fontFamily: "var(--font-body)" }} className="text-xs text-[#060920]/45">
                    {t("Topshiriq berish uchun avval yana bitta admin qo'shing.", "Чтобы назначать задания, сначала добавьте ещё одного администратора.")}
                  </p>
                )}
                {(data.tasks || []).length === 0 ? (
                  <EmptyState text={isSuper ? t("Hozircha topshiriq yo'q. '+ Yangi topshiriq' tugmasini bosing.", "Пока заданий нет. Нажмите кнопку «+ Новое задание».") : t("Sizga hozircha topshiriq berilmagan.", "Вам пока не назначено заданий.")} />
                ) : (data.tasks || []).map((tk, i) => (
                  <motion.div key={tk.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className={`p-5 bg-white/60 border rounded-2xl flex gap-4 items-start ${tk.status === "done" ? "border-[#060920]/10 opacity-60" : "border-[#060920]/15"}`}>
                    <button onClick={() => toggleTaskDone(tk)}
                      className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${tk.status === "done" ? "bg-[#060920] border-[#060920] text-white" : "border-[#060920]/30 hover:border-[#060920]"}`}>
                      {tk.status === "done" && <span className="text-xs">✓</span>}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div style={{ fontFamily: "var(--font-display)" }} className={`text-lg text-[#060920] ${tk.status === "done" ? "line-through" : ""}`}>{tk.title}</div>
                      {tk.desc && <p style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]/60 mt-1 whitespace-pre-line">{tk.desc}</p>}
                      <div style={{ fontFamily: "var(--font-body)" }} className="text-xs text-[#060920]/40 mt-2 space-x-2">
                        {isSuper && <span>{t("Kimga:", "Кому:")} <b>{tk.assignee || "—"}</b></span>}
                        <span>· {t("Berilgan:", "Выдано:")} {formatDate(tk.createdAt)}</span>
                        {tk.doneAt && <span>· {t("Bajarilgan:", "Выполнено:")} {formatDate(tk.doneAt)}</span>}
                      </div>
                      <div className="flex gap-2 mt-3 flex-wrap" style={{ fontFamily: "var(--font-body)" }}>
                        <button onClick={() => toggleTaskDone(tk)} className={btnGhost}>{tk.status === "done" ? t("Qayta ochish", "Открыть заново") : t("Bajarildi", "Выполнено")}</button>
                        {isSuper && <button onClick={() => deleteTask(tk.id)} className={btnDanger}>{t("O'chirish", "Удалить")}</button>}
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
                    {t("Adminlar", "Администраторы")} ({data.admins?.length ?? 0})
                  </h2>
                  <button onClick={() => { setEditingAdmin(null); setShowAdminModal(true); }} style={{ fontFamily: "var(--font-body)" }}
                    className="px-5 py-2.5 bg-[#060920] text-white rounded-xl text-sm tracking-wide hover:shadow-lg transition-all">
                    + {t("Yangi admin", "Новый администратор")}
                  </button>
                </div>
                {(data.admins || []).map((a, i) => (
                  <motion.div key={a.username} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="p-5 bg-white/60 border border-[#060920]/10 rounded-2xl">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div style={{ fontFamily: "var(--font-display)" }} className="text-lg text-[#060920]">{a.name}</div>
                      <span style={{ fontFamily: "var(--font-body)" }}
                        className={`px-2.5 py-0.5 text-xs tracking-wide uppercase rounded-full ${a.role === "superadmin" ? "bg-[#060920] text-white" : "bg-[#060920]/10 text-[#060920]"}`}>
                        {a.role === "superadmin" ? t("Bosh admin", "Главный администратор") : t("Admin", "Администратор")}
                      </span>
                      <span style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]/50">{t("login:", "логин:")} <b>{a.username}</b></span>
                    </div>
                    {a.role !== "superadmin" && (
                      <div style={{ fontFamily: "var(--font-body)" }} className="text-xs text-[#060920]/50 mt-2 flex flex-wrap gap-1.5">
                        {PERM_LABELS.map((p) => (
                          <span key={p.key} className={`px-2 py-0.5 rounded-full border ${a.perms?.[p.key] === false ? "border-[#060920]/10 text-[#060920]/30 line-through" : "border-[#060920]/20 text-[#060920]/60"}`}>
                            {t(p.label, p.ru)}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2 mt-3 flex-wrap" style={{ fontFamily: "var(--font-body)" }}>
                      <button onClick={() => { setEditingAdmin(a); setShowAdminModal(true); }} className={btnGhost}>{t("Tahrirlash", "Редактировать")}</button>
                      {a.username !== me?.username && <button onClick={() => deleteAdminUser(a.username)} className={btnDanger}>{t("O'chirish", "Удалить")}</button>}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ===== NAQSHLAR (Tarixiy aloqa) ===== */}
            {activeTab === "ornaments" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
                  <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">{t("Naqshlar — Tarixiy aloqa", "Орнаменты — Историческая связь")} ({data.ornaments?.length ?? 0})</h2>
                  <button onClick={() => { setEditingOrnament(null); setShowOrnamentModal(true); }} style={{ fontFamily: "var(--font-body)" }}
                    className="px-5 py-2.5 bg-[#060920] text-white rounded-xl text-sm tracking-wide hover:shadow-lg transition-all">
                    + {t("Yangi naqsh", "Новый орнамент")}
                  </button>
                </div>
                {(data.ornaments?.length ?? 0) === 0 ? <EmptyState text={t("Hozircha naqsh qo'shilmagan. '+ Yangi naqsh' tugmasini bosing.", "Пока орнаменты не добавлены. Нажмите кнопку «+ Новый орнамент».")} /> : data.ornaments.map((o, i) => (
                  <motion.div key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className={`p-5 bg-white/60 border rounded-2xl flex gap-5 items-start ${o.active ? "border-[#060920]/10" : "border-[#060920]/10 opacity-60"}`}>
                    <div className="w-24 h-24 rounded-xl bg-[#060920]/5 overflow-hidden flex-shrink-0">
                      {o.hasImage ? (
                        <img src={`/api/ornament-image?id=${o.id}`} alt={o.old} className="w-full h-full object-cover" />
                      ) : (
                        <div style={{ fontFamily: "var(--font-display)" }} className="w-full h-full flex items-center justify-center text-[#060920]/20 text-xs">{t("naqsh", "орнамент")}</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div style={{ fontFamily: "var(--font-display)" }} className="text-lg text-[#060920]">{o.old}</div>
                        {!o.active && <span style={{ fontFamily: "var(--font-body)" }} className="px-2.5 py-0.5 text-xs tracking-wide uppercase bg-[#060920]/10 text-[#060920] rounded-full">{t("Yashirin", "Скрыт")}</span>}
                      </div>
                      {o.desc && <p style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]/60 mt-1">{o.desc}</p>}
                      {o.history && <p style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]/50 mt-1 line-clamp-2">{o.history}</p>}
                      <div className="flex gap-2 mt-3 flex-wrap" style={{ fontFamily: "var(--font-body)" }}>
                        <button onClick={() => { setEditingOrnament(o); setShowOrnamentModal(true); }} className={btnGhost}>{t("Tahrirlash", "Редактировать")}</button>
                        <button onClick={() => toggleOrnament(o.id)} className={btnGhost}>{o.active ? t("Yashirish", "Скрыть") : t("Ko'rsatish", "Показать")}</button>
                        <button onClick={() => deleteOrnament(o.id)} className={btnDanger}>{t("O'chirish", "Удалить")}</button>
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
                  <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">{t("Standart gridlari", "Сетки стандартов")} ({data.standards?.length ?? 0})</h2>
                  <button onClick={() => { setEditingStandard(null); setShowStandardModal(true); }} style={{ fontFamily: "var(--font-body)" }}
                    className="px-5 py-2.5 bg-[#060920] text-white rounded-xl text-sm tracking-wide hover:shadow-lg transition-all">
                    + {t("Yangi standart", "Новый стандарт")}
                  </button>
                </div>
                {(data.standards?.length ?? 0) === 0 ? <EmptyState text={t("Hozircha standart qo'shilmagan.", "Пока стандарты не добавлены.")} /> : data.standards.map((s, i) => (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className={`p-6 bg-white/60 border rounded-2xl ${s.active ? "border-[#060920]/10" : "border-[#060920]/10 opacity-60"}`}>
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div style={{ fontFamily: "var(--font-display)" }} className="text-lg text-[#060920]">{s.title}</div>
                          {!s.active && <span style={{ fontFamily: "var(--font-body)" }} className="px-2.5 py-0.5 text-xs tracking-wide uppercase bg-[#060920]/10 text-[#060920] rounded-full">{t("Yashirin", "Скрыт")}</span>}
                        </div>
                        <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/65 text-sm mt-2 leading-relaxed">{s.desc}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap" style={{ fontFamily: "var(--font-body)" }}>
                        <button onClick={() => { setEditingStandard(s); setShowStandardModal(true); }} className={btnGhost}>{t("Tahrirlash", "Редактировать")}</button>
                        <button onClick={() => toggleStandard(s.id)} className={btnGhost}>{s.active ? t("Yashirish", "Скрыть") : t("Ko'rsatish", "Показать")}</button>
                        <button onClick={() => deleteStandard(s.id)} className={btnDanger}>{t("O'chirish", "Удалить")}</button>
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
                  <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">{t("Investorlar uchun konsepsiyalar", "Концепции для инвесторов")} ({data.investors?.length ?? 0})</h2>
                  <button onClick={() => { setEditingInvestor(null); setShowInvestorModal(true); }} style={{ fontFamily: "var(--font-body)" }}
                    className="px-5 py-2.5 bg-[#060920] text-white rounded-xl text-sm tracking-wide hover:shadow-lg transition-all">
                    + {t("Yangi bo'lim", "Новый раздел")}
                  </button>
                </div>
                {(data.investors?.length ?? 0) === 0 ? <EmptyState text={t("Hozircha konsepsiya qo'shilmagan.", "Пока концепции не добавлены.")} /> : data.investors.map((s, i) => (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className={`p-6 bg-white/60 border rounded-2xl ${s.active ? "border-[#060920]/10" : "border-[#060920]/10 opacity-60"}`}>
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div style={{ fontFamily: "var(--font-display)" }} className="text-lg text-[#060920]">{s.title}</div>
                          {!s.active && <span style={{ fontFamily: "var(--font-body)" }} className="px-2.5 py-0.5 text-xs tracking-wide uppercase bg-[#060920]/10 text-[#060920] rounded-full">{t("Yashirin", "Скрыт")}</span>}
                        </div>
                        <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/65 text-sm mt-2 leading-relaxed line-clamp-2">{s.text}</p>
                        {s.key && <p style={{ fontFamily: "var(--font-display)" }} className="text-[#060920]/80 text-sm mt-2 italic">{s.key}</p>}
                      </div>
                      <div className="flex gap-2 flex-wrap" style={{ fontFamily: "var(--font-body)" }}>
                        <button onClick={() => { setEditingInvestor(s); setShowInvestorModal(true); }} className={btnGhost}>{t("Tahrirlash", "Редактировать")}</button>
                        <button onClick={() => toggleInvestor(s.id)} className={btnGhost}>{s.active ? t("Yashirish", "Скрыть") : t("Ko'rsatish", "Показать")}</button>
                        <button onClick={() => deleteInvestor(s.id)} className={btnDanger}>{t("O'chirish", "Удалить")}</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ===== BILIM MARKAZI (BLOG) ===== */}
            {activeTab === "blog" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
                  <div>
                    <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">{t("Bilim markazi — maqolalar", "Центр знаний — статьи")} ({data.blog?.length ?? 0})</h2>
                    <p style={{ fontFamily: "var(--font-body)" }} className="text-xs text-[#060920]/50 mt-1">
                      {t("Maqolalar avval ", "Статьи сначала сохраняются как ")}<b>{t("qoralama", "черновик")}</b>{t(" sifatida saqlanadi. \"Chop etish\" bosilsa — saytda ko'rinadi.", ". При нажатии «Опубликовать» — отображаются на сайте.")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={blogSort}
                      onChange={(e) => setBlogSort(e.target.value as "new" | "old")}
                      style={{ fontFamily: "var(--font-body)" }}
                      className="px-4 py-2.5 bg-white border border-[#060920]/15 text-[#060920]/80 rounded-xl text-sm tracking-wide hover:border-[#060920]/35 focus:outline-none focus:border-[#060920]/40 transition-colors cursor-pointer"
                    >
                      <option value="new">{t("Avval yangi yozilgani", "Сначала новые")}</option>
                      <option value="old">{t("Avval eski yozilgani", "Сначала старые")}</option>
                    </select>
                    <button onClick={() => { setEditingBlog(null); setShowBlogModal(true); }} style={{ fontFamily: "var(--font-body)" }}
                      className="px-5 py-2.5 bg-[#060920] text-white rounded-xl text-sm tracking-wide hover:shadow-lg transition-all">
                      + {t("Yangi maqola", "Новая статья")}
                    </button>
                  </div>
                </div>
                {(data.blog?.length ?? 0) === 0 ? <EmptyState text={t("Hozircha maqola yo'q. '+ Yangi maqola' tugmasini bosing.", "Пока статей нет. Нажмите кнопку «+ Новая статья».")} /> : (data.blog || [])
                  .map((a, idx) => ({ a, idx }))
                  .sort((x, y) => {
                    // Yangi maqola doim massiv boshiga qo'shiladi (idx 0 = eng yangi).
                    // Sana bir xil bo'lsa ham qo'shilish tartibi ishonchli ishlaydi.
                    const byDate = String(y.a.createdAt).localeCompare(String(x.a.createdAt)) || (x.idx - y.idx);
                    return blogSort === "new" ? byDate : -byDate;
                  })
                  .map(({ a }, i) => {
                    const published = a.status === "published";
                    return (
                      <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                        className={`p-5 bg-white/60 border rounded-2xl flex gap-4 items-start ${published ? "border-[#060920]/15" : "border-dashed border-[#060920]/20"}`}>
                        <div className="w-20 h-16 rounded-lg bg-[#060920]/5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                          {a.hasImage ? <img src={`/api/blog-image?id=${a.id}`} alt={a.title} className="w-full h-full object-cover" />
                            : <span style={{ fontFamily: "var(--font-display)" }} className="text-[#060920]/20 text-xs"><BarpoWord className="opacity-30" /></span>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span style={{ fontFamily: "var(--font-body)" }} className={`px-2.5 py-0.5 text-xs tracking-wide uppercase rounded-full ${published ? "bg-[#060920] text-white" : "bg-[#060920]/10 text-[#060920]/60"}`}>
                              {published ? t("Chop etilgan", "Опубликовано") : t("Qoralama", "Черновик")}
                            </span>
                            {a.rubric && <span style={{ fontFamily: "var(--font-body)" }} className="text-xs text-[#060920]/45 uppercase tracking-wide">{a.rubric}</span>}
                          </div>
                          <div style={{ fontFamily: "var(--font-display)" }} className="text-base text-[#060920] mt-1.5">{a.title}</div>
                          {a.content && <p style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]/55 mt-1 line-clamp-1">{a.content}</p>}
                          <div className="flex gap-2 mt-3 flex-wrap" style={{ fontFamily: "var(--font-body)" }}>
                            <button onClick={() => { setEditingBlog(a); setShowBlogModal(true); }} className={btnGhost}>{t("Tahrirlash", "Редактировать")}</button>
                            {published
                              ? <button onClick={() => unpublishBlog(a.id)} className={btnGhost}>{t("Qoralamaga qaytarish", "Вернуть в черновик")}</button>
                              : <button onClick={() => publishBlog(a.id)} className="px-3 py-1.5 rounded-lg text-xs tracking-wide bg-[#060920] text-white hover:shadow-lg transition-all">{t("Chop etish", "Опубликовать")}</button>}
                            <button onClick={() => deleteBlog(a.id)} className={btnDanger}>{t("O'chirish", "Удалить")}</button>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            )}

            {/* ===== TAKLIFLAR (boshqaruv) ===== */}
            {activeTab === "offers" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
                  <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">{t("Cheklangan takliflar", "Ограниченные предложения")} ({data.offers.length})</h2>
                  <button onClick={() => { setEditingOffer(null); setShowOfferModal(true); }} style={{ fontFamily: "var(--font-body)" }}
                    className="px-5 py-2.5 bg-[#060920] text-white rounded-xl text-sm tracking-wide hover:shadow-lg transition-all">
                    + {t("Yangi taklif", "Новое предложение")}
                  </button>
                </div>
                {data.offers.length === 0 ? <EmptyState text={t("Hozircha taklif qo'shilmagan. '+ Yangi taklif' tugmasini bosing.", "Пока предложения не добавлены. Нажмите кнопку «+ Новое предложение».")} /> : data.offers.map((o, i) => (
                  <motion.div key={o.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className={`p-6 bg-white/60 border rounded-2xl space-y-3 ${o.active ? "border-[#060920]/10" : "border-[#060920]/10 opacity-60"}`}>
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div style={{ fontFamily: "var(--font-display)" }} className="text-lg text-[#060920]">{o.title}</div>
                          {o.tag && <span style={{ fontFamily: "var(--font-body)" }} className="px-2.5 py-0.5 text-xs tracking-wide uppercase bg-[#060920]/8 text-[#060920]/60 rounded-full">{o.tag}</span>}
                          {!o.active && <span style={{ fontFamily: "var(--font-body)" }} className="px-2.5 py-0.5 text-xs tracking-wide uppercase bg-[#060920]/10 text-[#060920] rounded-full">{t("Yashirin", "Скрыт")}</span>}
                        </div>
                        <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/65 text-sm mt-2 leading-relaxed">{o.description}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap" style={{ fontFamily: "var(--font-body)" }}>
                        <button onClick={() => { setEditingOffer(o); setShowOfferModal(true); }} className={btnGhost}>{t("Tahrirlash", "Редактировать")}</button>
                        <button onClick={() => toggleOffer(o.id)} className={btnGhost}>{o.active ? t("Yashirish", "Скрыть") : t("Ko'rsatish", "Показать")}</button>
                        <button onClick={() => deleteOffer(o.id)} className={btnDanger}>{t("O'chirish", "Удалить")}</button>
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
                  {t(
                    "Madaniyat va Xizmatlar sahifalaridagi har bir blok uchun rasm yuklang. Rasm yuklasangiz — bo'limdagi bo'sh quti o'rniga o'sha rasm chiqadi. Rasmni o'chirsangiz, avvalgi ko'rinish (gradient/raqam) qaytadi.",
                    "Загрузите изображение для каждого блока на страницах «Культура» и «Услуги». При загрузке изображения вместо пустого блока появится оно. При удалении — вернётся прежний вид (градиент/номер).",
                  )}
                </p>
                {sectionImageGroups(data).filter((grp) => grp.items.length > 0).map((grp) => (
                  <div key={grp.group} className="space-y-4">
                    <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">{t(grp.group, grp.groupRu)}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {grp.items.map((it) => (
                        <SectionImageCard
                          key={it.key}
                          itemKey={it.key}
                          label={t(it.label, it.ru)}
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
                  {t(
                    "Bosh sahifaning yuqorisidagi 3 ta ko'rsatkichni shu yerda o'zgartiring. \"Qiymat\" — katta raqam (masalan: 10+, 50+, 100%), \"Izoh\" — uning ostidagi matn.",
                    "Измените здесь 3 показателя в верхней части главной страницы. «Значение» — крупное число (например: 10+, 50+, 100%), «Подпись» — текст под ним.",
                  )}
                </p>
                {stats.map((s, i) => (
                  <div key={i} className="p-5 bg-white/60 border border-[#060920]/10 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Qiymat", "Значение")}</label>
                      <input value={s.value} onChange={(e) => updateStat(i, "value", e.target.value)}
                        placeholder={t("masalan: 10+", "например: 10+")} style={{ fontFamily: "var(--font-display)" }} className={inputClass} />
                    </div>
                    <div className="md:col-span-2">
                      <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Izoh", "Подпись")}</label>
                      <input value={s.label} onChange={(e) => updateStat(i, "label", e.target.value)}
                        placeholder={t("masalan: Yillik tajriba", "например: Лет опыта")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                    </div>
                  </div>
                ))}
                <div className="flex items-center gap-4">
                  <button onClick={saveStats} disabled={savingStats} style={{ fontFamily: "var(--font-body)" }}
                    className="px-8 py-3.5 bg-[#060920] text-white tracking-[0.15em] uppercase text-sm font-medium rounded-2xl hover:shadow-xl transition-all disabled:opacity-70">
                    {savingStats ? t("Saqlanmoqda...", "Сохраняется...") : t("Saqlash", "Сохранить")}
                  </button>
                  {statsSaved && <span style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]">{t("Saqlandi ✓", "Сохранено ✓")}</span>}
                </div>
              </div>
            )}

            {/* ===== KELGAN TAKLIFLAR ===== */}
            {activeTab === "suggestions" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">{t("Kelgan takliflar", "Поступившие предложения")} ({data.suggestions.length})</h2>
                  <button onClick={() => exportCsv("suggestions")} className={btnGhost}>⤓ Excel / Sheets (CSV)</button>
                </div>
                {data.suggestions.length === 0 ? <EmptyState text={t("Hozircha kelgan taklif yo'q", "Пока нет поступивших предложений")} /> : data.suggestions.map((sg, i) => (
                  <motion.div key={sg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="p-6 bg-white/60 border border-[#060920]/10 rounded-2xl space-y-3">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <div style={{ fontFamily: "var(--font-display)" }} className="text-lg text-[#060920]">{sg.subject}</div>
                        {sg.category && <div style={{ fontFamily: "var(--font-body)" }} className="text-xs text-[#060920]/50 mt-0.5 tracking-wide uppercase">{sg.category}</div>}
                      </div>
                      <div className="flex items-center gap-3" style={{ fontFamily: "var(--font-body)" }}>
                        <span className="text-xs text-[#060920]/40">{formatDate(sg.submittedAt)}</span>
                        <button onClick={() => deleteItem("suggestion", sg.id)} className={btnDanger}>{t("O'chirish", "Удалить")}</button>
                      </div>
                    </div>
                    <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/70 text-sm leading-relaxed">{sg.message}</p>
                    {(sg.fullName || sg.phone) && (
                      <div className="flex flex-wrap gap-4 text-sm pt-2 border-t border-[#060920]/5" style={{ fontFamily: "var(--font-body)" }}>
                        {sg.fullName && <span className="text-[#060920]/50">{sg.fullName}</span>}
                        {sg.phone && <span className="text-[#060920]/50">{t("Tel:", "Тел:")} {sg.phone}</span>}
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
                  <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">{t("HR Arizalari", "HR-заявки")} ({data.hr.length})</h2>
                  <button onClick={() => exportCsv("hr")} className={btnGhost}>⤓ Excel / Sheets (CSV)</button>
                </div>
                {data.hr.length === 0 ? <EmptyState text={t("Hozircha HR arizasi yo'q", "Пока нет HR-заявок")} /> : [...data.hr]
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
                    ? { t: t("Qabul qilingan", "Принят"), c: "bg-[#060920]/10 text-[#060920]" }
                    : st === "rejected"
                    ? { t: t("Rad etilgan", "Отклонён"), c: "bg-[#060920]/10 text-[#060920]" }
                    : { t: t("Kutilmoqda", "Ожидает"), c: "bg-[#060920]/8 text-[#060920]/60" };
                  return (
                  <motion.div key={r.folder} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="p-6 bg-white/60 border border-[#060920]/10 rounded-2xl space-y-3">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <div style={{ fontFamily: "var(--font-display)" }} className="text-lg text-[#060920]">{r.fullName}</div>
                          <span style={{ fontFamily: "var(--font-body)" }} className={`px-2.5 py-0.5 text-xs tracking-wide uppercase rounded-full ${badge.c}`}>{badge.t}</span>
                        </div>
                        <div style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/60 text-sm mt-1">
                          {r.field}{r.experienceYears && ` · ${r.experienceYears} ${t("yil tajriba", "лет опыта")}`}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteHr(r.folder, r.fullName)}
                        style={{ fontFamily: "var(--font-body)" }}
                        className="shrink-0 w-8 h-8 rounded-lg border border-[#060920]/15 text-[#060920]/50 hover:text-[#060920] hover:bg-[#060920]/10 transition-colors text-base leading-none"
                        aria-label={t("Arizani o'chirish", "Удалить заявку")}
                        title={t("Arizani butunlay o'chirish", "Полностью удалить заявку")}
                      >
                        ×
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm" style={{ fontFamily: "var(--font-body)" }}>
                      <span className="text-[#060920]/70">{t("Tel:", "Тел:")} {r.phone}</span>
                      {r.email && <span className="text-[#060920]/70">Email: {r.email}</span>}
                      {r.contact && <span className="text-[#060920]/70">{t("Aloqa:", "Контакт:")} {r.contact}</span>}
                      {r.resumeFile && (
                        <a href={`/api/admin/resume?folder=${encodeURIComponent(r.folder)}&file=${encodeURIComponent(r.resumeFile)}&${authTokenQS()}`}
                          target="_blank" rel="noopener noreferrer"
                          className="text-[#060920] underline underline-offset-2 hover:opacity-70 transition-opacity">
                          {t("Rezyumeni ko'rish", "Посмотреть резюме")}
                        </a>
                      )}
                    </div>
                    <div className="flex gap-2 flex-wrap pt-2 border-t border-[#060920]/5" style={{ fontFamily: "var(--font-body)" }}>
                      <button onClick={() => setHrStatus(r.folder, "accepted")} className="px-3 py-1.5 rounded-lg text-xs tracking-wide border border-[#060920]/30 text-[#060920] hover:bg-[#060920]/10 transition-colors">{t("Qabul qilish", "Принять")}</button>
                      <button onClick={() => setHrStatus(r.folder, "rejected")} className={btnDanger}>{t("Rad etish", "Отклонить")}</button>
                      {st !== "pending" && <button onClick={() => setHrStatus(r.folder, "pending")} className={btnGhost}>{t("Kutishga qaytarish", "Вернуть в ожидание")}</button>}
                      {!r.email && <span className="text-xs text-[#060920]/40 self-center">{t("(email kiritilmagan — xabar yuborilmaydi)", "(email не указан — сообщение не отправляется)")}</span>}
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
                  <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">{t("Aloqa So'rovlari", "Запросы на связь")} ({data.contacts.length})</h2>
                  <button onClick={() => exportCsv("contacts")} className={btnGhost}>⤓ Excel / Sheets (CSV)</button>
                </div>
                {data.contacts.length === 0 ? <EmptyState text={t("Hozircha aloqa so'rovi yo'q", "Пока нет запросов на связь")} /> : data.contacts.map((a, i) => (
                  <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="p-6 bg-white/60 border border-[#060920]/10 rounded-2xl space-y-3">
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div>
                        <div style={{ fontFamily: "var(--font-display)" }} className="text-lg text-[#060920]">{a.fullName}</div>
                        {a.company && <div style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]/60 mt-0.5">{a.company}</div>}
                      </div>
                      <div className="flex items-center gap-3" style={{ fontFamily: "var(--font-body)" }}>
                        <span className="text-xs text-[#060920]/40">{formatDate(a.submittedAt)}</span>
                        <button onClick={() => deleteItem("contact", a.id)} className={btnDanger}>{t("O'chirish", "Удалить")}</button>
                      </div>
                    </div>
                    {a.message && <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/70 text-sm leading-relaxed">{a.message}</p>}
                    <span style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/70 text-sm">{t("Tel:", "Тел:")} {a.phone}</span>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ===== SOZLAMALAR (email + Sheets) ===== */}
            {activeTab === "settings" && (
              <div className="space-y-8 max-w-2xl">

                {/* Aloqa ma'lumotlari */}
                <div className="space-y-3">
                  <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">{t("Aloqa ma'lumotlari", "Контактные данные")}</h2>
                  <p style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]/55">
                    {t("Saytdagi (Aloqa sahifasi, bosh sahifa va footer) telefon, email va manzil shu yerdan boshqariladi.", "Телефон, email и адрес на сайте (страница «Контакты», главная и футер) управляются отсюда.")}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50">{t("Telefon", "Телефон")}</label>
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
                      <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50">{t("Manzil", "Адрес")}</label>
                      <input
                        value={settings.contactInfo?.address || ""}
                        onChange={(e) => setSettings({ ...settings, contactInfo: { ...settings.contactInfo, address: e.target.value } })}
                        placeholder={t("Toshkent, ...", "Ташкент, ...")}
                        style={{ fontFamily: "var(--font-body)" }} className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Ijtimoiy tarmoqlar */}
                <div className="space-y-3">
                  <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">{t("Ijtimoiy tarmoqlar", "Социальные сети")}</h2>
                  <p style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]/55">
                    {t("Saytdagi (footer va Aloqa sahifasidagi) ijtimoiy tarmoq tugmalari shu linklarga olib boradi. Bo'sh qoldirilgan tarmoq saytda ko'rsatilmaydi.", "Кнопки соцсетей на сайте (в футере и на странице «Контакты») ведут на эти ссылки. Оставленная пустой сеть на сайте не показывается.")}
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
                  <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">{t("Telegram bildirishnomalar", "Telegram-уведомления")}</h2>
                  <p style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]/55">
                    {t("Har bir tur uchun alohida bot va chat ID belgilash mumkin — shunda xabarlar aralashmaydi. Tur uchun maydon bo'sh qoldirilsa, ", "Для каждого типа можно задать отдельного бота и chat ID — тогда сообщения не перемешиваются. Если поле для типа оставить пустым, ")}<b>{t("Umumiy bot", "Общий бот")}</b>{t(" sozlamasi ishlaydi. Bot yaratish: ", " — используется его настройка. Создание бота: ")}<b>@BotFather</b> → <b>/newbot</b>. Chat ID: <b>@userinfobot</b> {t("orqali (botga avval ", "(боту сначала напишите ")}<b>/start</b>{t(" yozing).", ").")}
                  </p>
                </div>

                {([
                  { key: "general" as TgKey, label: t("Umumiy bot", "Общий бот"), hint: t("Maxsus bot kiritilmagan turlar uchun ishlaydi", "Работает для типов, у которых не указан отдельный бот") },
                  { key: "hr" as TgKey, label: t("HR arizalari boti", "Бот HR-заявок"), hint: t("HR arizalari va rezyume fayllari shu botga boradi", "HR-заявки и файлы резюме поступают этому боту") },
                  { key: "suggestion" as TgKey, label: t("Kelgan takliflar boti", "Бот поступивших предложений"), hint: t("Takliflar sahifasidan kelgan murojaatlar", "Обращения со страницы предложений") },
                  { key: "contact" as TgKey, label: t("Aloqa so'rovlari boti", "Бот запросов на связь"), hint: t("Aloqa formasidan kelgan so'rovlar", "Запросы из формы связи") },
                ]).map((sec) => {
                  const cfg = getTg(sec.key);
                  return (
                    <div key={sec.key} className="space-y-3 p-5 border border-[#060920]/10 rounded-2xl bg-white/50">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h3 style={{ fontFamily: "var(--font-display)" }} className="text-base text-[#060920]">{sec.label}</h3>
                          <p style={{ fontFamily: "var(--font-body)" }} className="text-xs text-[#060920]/45 mt-0.5">{sec.hint}</p>
                        </div>
                        <button onClick={() => sendTestTelegram(sec.key)} className={btnGhost}>{t("Test yuborish", "Отправить тест")}</button>
                      </div>
                      <input
                        type="password"
                        value={cfg?.botToken || ""}
                        onChange={(e) => setTg(sec.key, { ...cfg, botToken: e.target.value })}
                        placeholder={sec.key === "general" ? t("Bot token (123456789:ABC...)", "Токен бота (123456789:ABC...)") : t("Bot token (bo'sh = umumiy bot ishlatiladi)", "Токен бота (пусто = используется общий бот)")}
                        autoComplete="new-password"
                        style={{ fontFamily: "var(--font-body)" }} className={inputClass}
                      />
                      <div className="space-y-2">
                        <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50">{t("Chat ID lar", "Chat ID")}</label>
                        {(cfg?.chatIds || []).map((id, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              value={id}
                              onChange={(e) => {
                                const ids = [...(cfg?.chatIds || [])];
                                ids[idx] = e.target.value.replace(/[^\d\-]/g, "");
                                setTg(sec.key, { ...cfg, chatIds: ids });
                              }}
                              placeholder={t("123456789 yoki -1001234567890", "123456789 или -1001234567890")}
                              style={{ fontFamily: "var(--font-body)" }} className={inputClass}
                            />
                            <button
                              type="button"
                              onClick={() => setTg(sec.key, { ...cfg, chatIds: (cfg?.chatIds || []).filter((_, i) => i !== idx) })}
                              style={{ fontFamily: "var(--font-body)" }}
                              className="shrink-0 w-10 h-10 rounded-lg border border-[#060920]/15 text-[#060920]/50 hover:text-[#060920] hover:bg-[#060920]/5 transition-colors"
                              aria-label={t("O'chirish", "Удалить")}
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
                          {t("ID qo'shish", "Добавить ID")}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Email bildirishnomalar (SMTP) */}
                <div className="space-y-3">
                  <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">{t("Email bildirishnomalar (SMTP)", "Email-уведомления (SMTP)")}</h2>
                  <p style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]/55">
                    {t("Yangi ariza/xabar kelganda shu SMTP orqali email yuboriladi. To'liq to'ldirilmasa (host, foydalanuvchi, parol), email yuborilmaydi — Telegram bildirishnomasi baribir ishlayveradi.", "При поступлении новой заявки/сообщения письмо отправляется через этот SMTP. Если не заполнено полностью (хост, пользователь, пароль), письма не отправляются — Telegram-уведомление продолжит работать.")}
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50">{t("SMTP host", "SMTP-хост")}</label>
                      <input value={settings.smtp.host || ""} onChange={(e) => setSettings({ ...settings, smtp: { ...settings.smtp, host: e.target.value } })}
                        placeholder="smtp.gmail.com" style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                      <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50">{t("Port", "Порт")}</label>
                      <input value={settings.smtp.port || ""} onChange={(e) => setSettings({ ...settings, smtp: { ...settings.smtp, port: e.target.value.replace(/\D/g, "") } })}
                        placeholder="587" style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                      <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50">{t("Foydalanuvchi (email)", "Пользователь (email)")}</label>
                      <input value={settings.smtp.user || ""} onChange={(e) => setSettings({ ...settings, smtp: { ...settings.smtp, user: e.target.value } })}
                        placeholder="noreply@barpo.uz" autoComplete="off" style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                      <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50">{t("Parol / ilova paroli", "Пароль / пароль приложения")}</label>
                      <input type="password" value={settings.smtp.pass || ""} onChange={(e) => setSettings({ ...settings, smtp: { ...settings.smtp, pass: e.target.value } })}
                        autoComplete="new-password" style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50">{t("Kimdan (from)", "От кого (from)")}</label>
                      <input value={settings.smtp.from || ""} onChange={(e) => setSettings({ ...settings, smtp: { ...settings.smtp, from: e.target.value } })}
                        placeholder="BARPO <noreply@barpo.uz>" style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                    </div>
                    <label className="flex items-center gap-2 md:col-span-2 text-sm text-[#060920]/70" style={{ fontFamily: "var(--font-body)" }}>
                      <input type="checkbox" checked={!!settings.smtp.secure} onChange={(e) => setSettings({ ...settings, smtp: { ...settings.smtp, secure: e.target.checked } })} className="accent-[#060920]" />
                      {t("SSL/TLS (odatda 465-port uchun yoqiladi)", "SSL/TLS (обычно включается для порта 465)")}
                    </label>
                  </div>
                </div>

                {/* Har tur uchun email ro'yxati */}
                {([
                  { key: "general" as TgKey, label: t("Umumiy email ro'yxati", "Общий список email"), hint: t("Maxsus ro'yxat kiritilmagan turlar uchun ishlaydi", "Работает для типов, у которых не указан отдельный список") },
                  { key: "hr" as TgKey, label: t("HR arizalari email ro'yxati", "Список email для HR-заявок"), hint: t("HR arizalari shu manzillarga xabar qiladi", "О HR-заявках сообщается на эти адреса") },
                  { key: "suggestion" as TgKey, label: t("Kelgan takliflar email ro'yxati", "Список email для предложений"), hint: t("Takliflar sahifasidan kelgan murojaatlar", "Обращения со страницы предложений") },
                  { key: "contact" as TgKey, label: t("Aloqa so'rovlari email ro'yxati", "Список email для запросов на связь"), hint: t("Aloqa formasidan kelgan so'rovlar", "Запросы из формы связи") },
                ]).map((sec) => {
                  const list = sec.key === "general" ? settings.notifyEmails : settings.notifyEmailsByType[sec.key];
                  const setList = (next: string[]) => {
                    if (sec.key === "general") setSettings({ ...settings, notifyEmails: next });
                    else setSettings({ ...settings, notifyEmailsByType: { ...settings.notifyEmailsByType, [sec.key]: next } });
                  };
                  return (
                    <div key={sec.key} className="space-y-3 p-5 border border-[#060920]/10 rounded-2xl bg-white/50">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div>
                          <h3 style={{ fontFamily: "var(--font-display)" }} className="text-base text-[#060920]">{sec.label}</h3>
                          <p style={{ fontFamily: "var(--font-body)" }} className="text-xs text-[#060920]/45 mt-0.5">{sec.hint}</p>
                        </div>
                        <button onClick={() => sendTestEmail(sec.key)} className={btnGhost}>{t("Test yuborish", "Отправить тест")}</button>
                      </div>
                      <div className="space-y-2">
                        {(list || []).map((email, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <input
                              value={email}
                              onChange={(e) => { const next = [...(list || [])]; next[idx] = e.target.value; setList(next); }}
                              placeholder="admin@barpo.uz"
                              style={{ fontFamily: "var(--font-body)" }} className={inputClass}
                            />
                            <button
                              type="button"
                              onClick={() => setList((list || []).filter((_, i) => i !== idx))}
                              style={{ fontFamily: "var(--font-body)" }}
                              className="shrink-0 w-10 h-10 rounded-lg border border-[#060920]/15 text-[#060920]/50 hover:text-[#060920] hover:bg-[#060920]/5 transition-colors"
                              aria-label={t("O'chirish", "Удалить")}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => setList([...(list || []), ""])}
                          style={{ fontFamily: "var(--font-body)" }}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-[#060920]/25 text-sm text-[#060920]/60 hover:text-[#060920] hover:border-[#060920]/50 transition-colors"
                        >
                          <span className="w-5 h-5 rounded-full bg-[#060920] text-white flex items-center justify-center text-xs leading-none">+</span>
                          {t("Email qo'shish", "Добавить email")}
                        </button>
                      </div>
                    </div>
                  );
                })}

                {/* Google Sheets webhook */}
                <div className="space-y-3">
                  <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">{t("Google Sheets webhook", "Google Sheets webhook")}</h2>
                  <p style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]/55">
                    {t("Har bir yangi ariza/xabar shu manzilga ham POST qilinadi (Google Apps Script Web App URL). Bo'sh qoldirilsa, hech narsa yuborilmaydi.", "Каждая новая заявка/сообщение также отправляется POST-запросом на этот адрес (URL веб-приложения Google Apps Script). Если оставить пустым — ничего не отправляется.")}
                  </p>
                  <input
                    value={settings.sheetsWebhook}
                    onChange={(e) => setSettings({ ...settings, sheetsWebhook: e.target.value })}
                    placeholder="https://script.google.com/macros/s/XXXXX/exec"
                    style={{ fontFamily: "var(--font-body)" }} className={inputClass}
                  />
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <button onClick={saveSettings} disabled={saving} style={{ fontFamily: "var(--font-body)" }}
                    className="px-6 py-3 bg-[#060920] text-white tracking-[0.15em] uppercase text-sm rounded-2xl hover:shadow-xl transition-all disabled:opacity-70">
                    {saving ? t("Saqlanmoqda...", "Сохраняется...") : t("Saqlash", "Сохранить")}
                  </button>
                  {settingsMsg && <span style={{ fontFamily: "var(--font-body)" }} className="text-sm text-[#060920]/70">{settingsMsg}</span>}
                </div>
              </div>
            )}

            {/* ===== XIZMATLAR ===== */}
            {activeTab === "services" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
                  <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">{t("Xizmatlar", "Услуги")} ({data.services?.length ?? 0})</h2>
                  <button onClick={() => { setEditingService(null); setShowServiceModal(true); }} style={{ fontFamily: "var(--font-body)" }}
                    className="px-5 py-2.5 bg-[#060920] text-white rounded-xl text-sm tracking-wide hover:shadow-lg transition-all">
                    + {t("Yangi xizmat", "Новая услуга")}
                  </button>
                </div>
                {(data.services?.length ?? 0) === 0 ? <EmptyState text={t("Hozircha xizmat qo'shilmagan.", "Пока услуги не добавлены.")} /> : data.services!.map((s, i) => (
                  <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className={`p-6 bg-white/60 border rounded-2xl ${s.active ? "border-[#060920]/10" : "border-[#060920]/10 opacity-60"}`}>
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span style={{ fontFamily: "var(--font-body)" }} className="text-xs tracking-[0.1em] uppercase text-[#060920]/40">{i + 1}</span>
                          <div style={{ fontFamily: "var(--font-display)" }} className="text-lg text-[#060920]">{s.titleUz}</div>
                          {!s.active && <span style={{ fontFamily: "var(--font-body)" }} className="px-2.5 py-0.5 text-xs tracking-wide uppercase bg-[#060920]/10 text-[#060920] rounded-full">{t("Yashirin", "Скрыт")}</span>}
                        </div>
                        <div style={{ fontFamily: "var(--font-body)" }} className="text-xs text-[#060920]/40 mt-0.5 italic">{s.titleRu}</div>
                        <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/65 text-sm mt-2 leading-relaxed line-clamp-2">{s.descUz}</p>
                        {s.highlightUz && <p style={{ fontFamily: "var(--font-body)" }} className="text-xs text-[#060920]/50 mt-1 italic line-clamp-1">{s.highlightUz}</p>}
                      </div>
                      <div className="flex gap-2 flex-wrap" style={{ fontFamily: "var(--font-body)" }}>
                        <button onClick={() => { setEditingService(s); setShowServiceModal(true); }} className={btnGhost}>{t("Tahrirlash", "Редактировать")}</button>
                        <button onClick={() => toggleService(s.id)} className={btnGhost}>{s.active ? t("Yashirish", "Скрыть") : t("Ko'rsatish", "Показать")}</button>
                        <button onClick={() => deleteService(s.id)} className={btnDanger}>{t("O'chirish", "Удалить")}</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* ===== MADANIYAT ===== */}
            {activeTab === "culture" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-3">
                  <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">{t("Madaniyat elementlari", "Элементы культуры")} ({data.cultureElements?.length ?? 0})</h2>
                  <button onClick={() => { setEditingCulture(null); setShowCultureModal(true); }} style={{ fontFamily: "var(--font-body)" }}
                    className="px-5 py-2.5 bg-[#060920] text-white rounded-xl text-sm tracking-wide hover:shadow-lg transition-all">
                    + {t("Yangi element", "Новый элемент")}
                  </button>
                </div>
                {(data.cultureElements?.length ?? 0) === 0 ? <EmptyState text={t("Hozircha element qo'shilmagan.", "Пока элементы не добавлены.")} /> : data.cultureElements!.map((e, i) => (
                  <motion.div key={e.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className={`p-6 bg-white/60 border rounded-2xl ${e.active ? "border-[#060920]/10" : "border-[#060920]/10 opacity-60"}`}>
                    <div className="flex items-start justify-between flex-wrap gap-3">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div style={{ fontFamily: "var(--font-display)" }} className="text-lg text-[#060920]">{e.titleUz}</div>
                          {!e.active && <span style={{ fontFamily: "var(--font-body)" }} className="px-2.5 py-0.5 text-xs tracking-wide uppercase bg-[#060920]/10 text-[#060920] rounded-full">{t("Yashirin", "Скрыт")}</span>}
                        </div>
                        <div style={{ fontFamily: "var(--font-body)" }} className="text-xs text-[#060920]/40 mt-0.5 italic">{e.titleRu}</div>
                        <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/65 text-sm mt-2 leading-relaxed line-clamp-2">{e.descUz}</p>
                        {(e.principlesUz || []).length > 0 && (
                          <p style={{ fontFamily: "var(--font-body)" }} className="text-xs text-[#060920]/40 mt-1">{(e.principlesUz || []).length} {t("tamoyil", "принципов")}</p>
                        )}
                      </div>
                      <div className="flex gap-2 flex-wrap" style={{ fontFamily: "var(--font-body)" }}>
                        <button onClick={() => { setEditingCulture(e); setShowCultureModal(true); }} className={btnGhost}>{t("Tahrirlash", "Редактировать")}</button>
                        <button onClick={() => toggleCulture(e.id)} className={btnGhost}>{e.active ? t("Yashirish", "Скрыть") : t("Ko'rsatish", "Показать")}</button>
                        <button onClick={() => deleteCulture(e.id)} className={btnDanger}>{t("O'chirish", "Удалить")}</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

          </motion.div>
        )}

        {/* ===== HISTORY — doimo ochiq, oxirgi 10 ta o'zgarish ===== */}
        <div className="mt-16 pt-10 border-t border-[#060920]/10">
          <div className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
            <h2 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">
              {t("O'zgarishlar tarixi", "История изменений")}
            </h2>
            <span style={{ fontFamily: "var(--font-body)" }} className="text-xs tracking-[0.15em] uppercase text-[#060920]/40">
              {t("Oxirgi 10 ta amal", "Последние 10 действий")}
            </span>
          </div>

          {!data || data.history.length === 0 ? (
            <p style={{ fontFamily: "var(--font-body)" }} className="text-[#060920]/40 tracking-wide py-6">
              {t("Hozircha o'zgarish qayd etilmagan.", "Пока изменения не зафиксированы.")}
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

      {/* ===== XIZMAT MODAL ===== */}
      <AnimatePresence>
        {showServiceModal && (
          <ModalShell wide title={editingService ? t("Xizmatni tahrirlash", "Редактировать услугу") : t("Yangi xizmat", "Новая услуга")} onClose={() => { setShowServiceModal(false); setEditingService(null); }}>
            <form onSubmit={saveService} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Sarlavha (UZ) *", "Заголовок (UZ) *")}</label>
                  <input name="titleUz" required defaultValue={editingService?.titleUz || ""} placeholder={t("Sarlavha o'zbekcha *", "Заголовок на узбекском *")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                </div>
                <div>
                  <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Sarlavha (RU)", "Заголовок (RU)")}</label>
                  <input name="titleRu" defaultValue={editingService?.titleRu || ""} placeholder={t("Sarlavha ruscha", "Заголовок на русском")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                </div>
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Tavsif (UZ)", "Описание (UZ)")}</label>
                <textarea name="descUz" rows={4} defaultValue={editingService?.descUz || ""} placeholder={t("Xizmat tavsifi o'zbekcha...", "Описание услуги на узбекском...")} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Tavsif (RU)", "Описание (RU)")}</label>
                <textarea name="descRu" rows={4} defaultValue={editingService?.descRu || ""} placeholder={t("Xizmat tavsifi ruscha...", "Описание услуги на русском...")} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Ajratilgan fikr (UZ)", "Выделенная мысль (UZ)")}</label>
                  <textarea name="highlightUz" rows={2} defaultValue={editingService?.highlightUz || ""} placeholder={t("Asosiy g'oya o'zbekcha...", "Главная идея на узбекском...")} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
                </div>
                <div>
                  <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Ajratilgan fikr (RU)", "Выделенная мысль (RU)")}</label>
                  <textarea name="highlightRu" rows={2} defaultValue={editingService?.highlightRu || ""} placeholder={t("Asosiy g'oya ruscha...", "Главная идея на русском...")} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
                </div>
              </div>
              <SaveBtn saving={saving} editing={!!editingService} />
            </form>
          </ModalShell>
        )}
      </AnimatePresence>

      {/* ===== MADANIYAT ELEMENTI MODAL ===== */}
      <AnimatePresence>
        {showCultureModal && (
          <ModalShell wide title={editingCulture ? t("Elementni tahrirlash", "Редактировать элемент") : t("Yangi madaniyat elementi", "Новый элемент культуры")} onClose={() => { setShowCultureModal(false); setEditingCulture(null); }}>
            <form onSubmit={saveCulture} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Sarlavha (UZ) *", "Заголовок (UZ) *")}</label>
                  <input name="titleUz" required defaultValue={editingCulture?.titleUz || ""} placeholder={t("Masalan: Tartib", "Например: Порядок")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                </div>
                <div>
                  <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Sarlavha (RU)", "Заголовок (RU)")}</label>
                  <input name="titleRu" defaultValue={editingCulture?.titleRu || ""} placeholder={t("Masalan: Порядок", "Например: Порядок")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Qisqa tavsif (UZ)", "Краткое описание (UZ)")}</label>
                  <textarea name="descUz" rows={2} defaultValue={editingCulture?.descUz || ""} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
                </div>
                <div>
                  <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Qisqa tavsif (RU)", "Краткое описание (RU)")}</label>
                  <textarea name="descRu" rows={2} defaultValue={editingCulture?.descRu || ""} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Batafsil matn (UZ)", "Подробный текст (UZ)")}</label>
                  <textarea name="detailsUz" rows={3} defaultValue={editingCulture?.detailsUz || ""} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
                </div>
                <div>
                  <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Batafsil matn (RU)", "Подробный текст (RU)")}</label>
                  <textarea name="detailsRu" rows={3} defaultValue={editingCulture?.detailsRu || ""} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Tamoyillar (UZ) — har biri yangi qatordan", "Принципы (UZ) — каждый с новой строки")}</label>
                  <textarea name="principlesUz" rows={5} defaultValue={(editingCulture?.principlesUz || []).join("\n")} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
                </div>
                <div>
                  <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Tamoyillar (RU) — har biri yangi qatordan", "Принципы (RU) — каждый с новой строки")}</label>
                  <textarea name="principlesRu" rows={5} defaultValue={(editingCulture?.principlesRu || []).join("\n")} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
                </div>
              </div>
              <SaveBtn saving={saving} editing={!!editingCulture} />
            </form>
          </ModalShell>
        )}
      </AnimatePresence>

      {/* ===== OFFER MODAL ===== */}
      <AnimatePresence>
        {showOfferModal && (
          <ModalShell title={editingOffer ? t("Taklifni tahrirlash", "Редактировать предложение") : t("Yangi taklif", "Новое предложение")} onClose={() => { setShowOfferModal(false); setEditingOffer(null); }}>
            <form onSubmit={saveOffer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="title" required defaultValue={editingOffer?.title || ""} placeholder={t("Sarlavha (UZ) *", "Заголовок (UZ) *")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                <input name="titleRu" defaultValue={editingOffer?.titleRu || ""} placeholder={t("Sarlavha (RU)", "Заголовок (RU)")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="tag" defaultValue={editingOffer?.tag || ""} placeholder={t("Yorliq (UZ) — ixtiyoriy", "Метка (UZ) — необязательно")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                <input name="tagRu" defaultValue={editingOffer?.tagRu || ""} placeholder={t("Yorliq (RU)", "Метка (RU)")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              </div>
              <textarea name="description" required rows={4} defaultValue={editingOffer?.description || ""} placeholder={t("Tavsif (UZ) *", "Описание (UZ) *")} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              <textarea name="descriptionRu" rows={4} defaultValue={editingOffer?.descriptionRu || ""} placeholder={t("Tavsif (RU)", "Описание (RU)")} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              <SaveBtn saving={saving} editing={!!editingOffer} />
            </form>
          </ModalShell>
        )}
      </AnimatePresence>

      {/* ===== PROJECT MODAL ===== */}
      <AnimatePresence>
        {showProjectModal && (
          <ModalShell wide title={editingProject ? t("Loyihani tahrirlash", "Редактировать проект") : t("Yangi loyiha", "Новый проект")} onClose={() => { setShowProjectModal(false); setEditingProject(null); }}>
            <form onSubmit={saveProject} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="name" required defaultValue={editingProject?.name || ""} placeholder={t("Obyekt nomi (UZ) *", "Название объекта (UZ) *")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                <input name="nameRu" defaultValue={editingProject?.nameRu || ""} placeholder={t("Obyekt nomi (RU)", "Название объекта (RU)")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="direction" defaultValue={editingProject?.direction || ""} placeholder={t("Yo'nalish (UZ)", "Направление (UZ)")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                <input name="directionRu" defaultValue={editingProject?.directionRu || ""} placeholder={t("Yo'nalish (RU)", "Направление (RU)")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="location" defaultValue={editingProject?.location || ""} placeholder={t("Hudud (UZ, masalan: Toshkent)", "Регион (UZ, например: Ташкент)")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                <input name="locationRu" defaultValue={editingProject?.locationRu || ""} placeholder={t("Hudud (RU)", "Регион (RU)")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="area" defaultValue={editingProject?.area || ""} placeholder={t("Maydon (UZ, masalan: 5000 m²)", "Площадь (UZ, например: 5000 м²)")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                <input name="areaRu" defaultValue={editingProject?.areaRu || ""} placeholder={t("Maydon (RU)", "Площадь (RU)")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              </div>
              <input name="year" defaultValue={editingProject?.year || ""} placeholder={t("Yil (masalan: 2025)", "Год (например: 2025)")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="status" defaultValue={editingProject?.status || ""} placeholder={t("Holati (UZ, masalan: Yakunlangan)", "Статус (UZ, например: Завершён)")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                <input name="statusRu" defaultValue={editingProject?.statusRu || ""} placeholder={t("Holati (RU)", "Статус (RU)")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="workType" defaultValue={editingProject?.workType || ""} placeholder={t("Ish turi (UZ)", "Тип работ (UZ)")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                <input name="workTypeRu" defaultValue={editingProject?.workTypeRu || ""} placeholder={t("Ish turi (RU)", "Тип работ (RU)")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="duration" defaultValue={editingProject?.duration || ""} placeholder={t("Muddat (UZ, masalan: 6 oy)", "Срок (UZ, например: 6 месяцев)")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                <input name="durationRu" defaultValue={editingProject?.durationRu || ""} placeholder={t("Muddat (RU)", "Срок (RU)")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="role" defaultValue={editingProject?.role || ""} placeholder={t("BARPO roli (UZ)", "Роль BARPO (UZ)")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                <input name="roleRu" defaultValue={editingProject?.roleRu || ""} placeholder={t("BARPO roli (RU)", "Роль BARPO (RU)")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Vazifa — UZ (mijoz oldida qanday vazifa turgan edi?)", "Задача — UZ (какая задача стояла перед заказчиком?)")}</label>
                <textarea name="task" rows={2} defaultValue={editingProject?.task || ""} placeholder={t("Bu obyekt bo'yicha asosiy vazifa...", "Основная задача по этому объекту...")} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Vazifa — RU", "Задача — RU")}</label>
                <textarea name="taskRu" rows={2} defaultValue={editingProject?.taskRu || ""} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Murakkablik — UZ (qaysi joyda xavf yoki muammo bor edi?)", "Сложность — UZ (где был риск или проблема?)")}</label>
                <textarea name="problem" rows={2} defaultValue={editingProject?.problem || ""} placeholder={t("Asosiy muammo yoki texnik murakkablik...", "Основная проблема или техническая сложность...")} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Murakkablik — RU", "Сложность — RU")}</label>
                <textarea name="problemRu" rows={2} defaultValue={editingProject?.problemRu || ""} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5"><BarpoWord /> {t("yechimi — UZ (qanday yondashuv qo'llandi?)", "решение — UZ (какой подход применён?)")}</label>
                <textarea name="solution" rows={2} defaultValue={editingProject?.solution || ""} placeholder={t("BARPO jarayonni qanday boshqardi...", "Как BARPO управлял процессом...")} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5"><BarpoWord /> {t("yechimi — RU", "решение — RU")}</label>
                <textarea name="solutionRu" rows={2} defaultValue={editingProject?.solutionRu || ""} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Jarayon — UZ (ishlar qanday ketdi, qaysi bosqichlar bo'ldi?)", "Процесс — UZ (как шли работы, какие были этапы?)")}</label>
                <textarea name="process" rows={2} defaultValue={editingProject?.process || ""} placeholder={t("Ishlar bosqichlari...", "Этапы работ...")} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Jarayon — RU", "Процесс — RU")}</label>
                <textarea name="processRu" rows={2} defaultValue={editingProject?.processRu || ""} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Natija — UZ (mijoz nimaga erishdi?)", "Результат — UZ (чего достиг заказчик?)")}</label>
                <textarea name="result" rows={2} defaultValue={editingProject?.result || ""} placeholder={t("Natija qanday bo'ldi...", "Каким был результат...")} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Natija — RU", "Результат — RU")}</label>
                <textarea name="resultRu" rows={2} defaultValue={editingProject?.resultRu || ""} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <textarea name="description" rows={2} defaultValue={editingProject?.description || ""} placeholder={t("Qisqa tavsif — UZ (kartochkada ko'rinadi)", "Краткое описание — UZ (отображается на карточке)")} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              <textarea name="descriptionRu" rows={2} defaultValue={editingProject?.descriptionRu || ""} placeholder={t("Qisqa tavsif — RU", "Краткое описание — RU")} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Batafsil matn — UZ (har bir xatboshi yangi qatordan)", "Подробный текст — UZ (каждый абзац с новой строки)")}</label>
                <textarea name="details" rows={5} defaultValue={editingProject?.details || ""} placeholder={t("Loyiha haqida batafsil ma'lumot...", "Подробная информация о проекте...")} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Batafsil matn — RU", "Подробный текст — RU")}</label>
                <textarea name="detailsRu" rows={5} defaultValue={editingProject?.detailsRu || ""} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Asosiy ko'rsatkichlar — UZ (har biri yangi qatordan)", "Ключевые показатели — UZ (каждый с новой строки)")}</label>
                <textarea name="features" rows={3} defaultValue={editingProject?.features || ""} placeholder={t("Masalan:\n8 qavat\nMuddatda topshirildi\n0 ta nuqson", "Например:\n8 этажей\nСдан в срок\n0 дефектов")} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Asosiy ko'rsatkichlar — RU", "Ключевые показатели — RU")}</label>
                <textarea name="featuresRu" rows={3} defaultValue={editingProject?.featuresRu || ""} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">
                  {t("Loyiha rasmi", "Изображение проекта")} {editingProject?.hasImage ? t("(yangi rasm yuklasangiz, eskisi almashadi)", "(при загрузке нового изображения старое заменится)") : ""}
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
          <ModalShell wide title={editingOrnament ? t("Naqshni tahrirlash", "Редактировать орнамент") : t("Yangi naqsh", "Новый орнамент")} onClose={() => { setShowOrnamentModal(false); setEditingOrnament(null); }}>
            <form onSubmit={saveOrnament} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="old" required defaultValue={editingOrnament?.old || ""} placeholder={t("Naqsh nomi (UZ, masalan: Girih naqshi) *", "Название орнамента (UZ, например: Гирих) *")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                <input name="oldRu" defaultValue={editingOrnament?.oldRu || ""} placeholder={t("Naqsh nomi (RU)", "Название орнамента (RU)")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Zamonaviy nomi / izohi (UZ) — ixtiyoriy", "Современное название / пояснение (UZ) — необязательно")}</label>
                <input name="new" defaultValue={editingOrnament?.new || ""} placeholder={t("Masalan: zamonaviy grid tizimi", "Например: современная сетка")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Zamonaviy nomi / izohi (RU)", "Современное название / пояснение (RU)")}</label>
                <input name="newRu" defaultValue={editingOrnament?.newRu || ""} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="desc" defaultValue={editingOrnament?.desc || ""} placeholder={t("Qisqa izoh (UZ) — kartochkada ko'rinadi", "Краткое описание (UZ) — отображается на карточке")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                <input name="descRu" defaultValue={editingOrnament?.descRu || ""} placeholder={t("Qisqa izoh (RU)", "Краткое описание (RU)")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Tarixiy ma'lumot — UZ (batafsil)", "Историческая справка — UZ (подробно)")}</label>
                <textarea name="history" rows={4} defaultValue={editingOrnament?.history || ""} placeholder={t("Naqsh va uning tarixi haqida batafsil...", "Подробно об орнаменте и его истории...")} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Tarixiy ma'lumot — RU", "Историческая справка — RU")}</label>
                <textarea name="historyRu" rows={4} defaultValue={editingOrnament?.historyRu || ""} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">
                  {t("Naqsh rasmi (miniatura)", "Изображение орнамента (миниатюра)")} {editingOrnament?.hasImage ? t("(yangi rasm yuklasangiz, eskisi almashadi)", "(при загрузке нового изображения старое заменится)") : ""}
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
          <ModalShell title={editingStandard ? t("Standartni tahrirlash", "Редактировать стандарт") : t("Yangi standart", "Новый стандарт")} onClose={() => { setShowStandardModal(false); setEditingStandard(null); }}>
            <form onSubmit={saveStandard} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="title" required defaultValue={editingStandard?.title || ""} placeholder={t("Sarlavha (UZ, masalan: Tizim) *", "Заголовок (UZ, например: Система) *")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                <input name="titleRu" defaultValue={editingStandard?.titleRu || ""} placeholder={t("Sarlavha (RU)", "Заголовок (RU)")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              </div>
              <textarea name="desc" required rows={4} defaultValue={editingStandard?.desc || ""} placeholder={t("Tavsif (UZ) *", "Описание (UZ) *")} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              <textarea name="descRu" rows={4} defaultValue={editingStandard?.descRu || ""} placeholder={t("Tavsif (RU)", "Описание (RU)")} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              <SaveBtn saving={saving} editing={!!editingStandard} />
            </form>
          </ModalShell>
        )}
      </AnimatePresence>

      {/* ===== INVESTOR MODAL ===== */}
      <AnimatePresence>
        {showInvestorModal && (
          <ModalShell wide title={editingInvestor ? t("Bo'limni tahrirlash", "Редактировать раздел") : t("Yangi investor bo'limi", "Новый раздел для инвесторов")} onClose={() => { setShowInvestorModal(false); setEditingInvestor(null); }}>
            <form onSubmit={saveInvestor} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="title" required defaultValue={editingInvestor?.title || ""} placeholder={t("Sarlavha (UZ) *", "Заголовок (UZ) *")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                <input name="titleRu" defaultValue={editingInvestor?.titleRu || ""} placeholder={t("Sarlavha (RU)", "Заголовок (RU)")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Matn — UZ (har bir xatboshi yangi qatordan)", "Текст — UZ (каждый абзац с новой строки)")}</label>
                <textarea name="text" required rows={7} defaultValue={editingInvestor?.text || ""} placeholder={t("Bo'lim matni...", "Текст раздела...")} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Matn — RU", "Текст — RU")}</label>
                <textarea name="textRu" rows={7} defaultValue={editingInvestor?.textRu || ""} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Kalit fikr — UZ", "Ключевая мысль — UZ")}</label>
                <textarea name="key" rows={2} defaultValue={editingInvestor?.key || ""} placeholder={t("Asosiy g'oya...", "Главная идея...")} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Kalit fikr — RU", "Ключевая мысль — RU")}</label>
                <textarea name="keyRu" rows={2} defaultValue={editingInvestor?.keyRu || ""} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <SaveBtn saving={saving} editing={!!editingInvestor} />
            </form>
          </ModalShell>
        )}
      </AnimatePresence>

      {/* ===== BLOG / BILIM MARKAZI MODAL ===== */}
      <AnimatePresence>
        {showBlogModal && (
          <ModalShell wide title={editingBlog ? t("Maqolani tahrirlash", "Редактировать статью") : t("Yangi maqola (qoralama)", "Новая статья (черновик)")} onClose={() => { setShowBlogModal(false); setEditingBlog(null); }}>
            <form onSubmit={saveBlog} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="title" required defaultValue={editingBlog?.title || ""} placeholder={t("Sarlavha (UZ) *", "Заголовок (UZ) *")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                <input name="titleRu" defaultValue={editingBlog?.titleRu || ""} placeholder={t("Sarlavha (RU)", "Заголовок (RU)")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Rubrika (UZ)", "Рубрика (UZ)")}</label>
                  <input name="rubric" defaultValue={editingBlog?.rubric || ""} placeholder={t("Masalan: BARPO Standarti", "Например: Стандарт BARPO")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} list="blog-rubrics" />
                  <datalist id="blog-rubrics">
                    <option value="BARPO Standarti" />
                    <option value="Mijoz iqtisodiy foydasi" />
                    <option value="Yangi qurilish madaniyati" />
                    <option value="Tarix va zamonaviylik" />
                  </datalist>
                </div>
                <div>
                  <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Rubrika (RU)", "Рубрика (RU)")}</label>
                  <input name="rubricRu" defaultValue={editingBlog?.rubricRu || ""} placeholder={t("Masalan: Стандарт BARPO", "Например: Стандарт BARPO")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} list="blog-rubrics-ru" />
                  <datalist id="blog-rubrics-ru">
                    <option value="Стандарт BARPO" />
                    <option value="Экономическая выгода клиента" />
                    <option value="Новая культура строительства" />
                    <option value="История и современность" />
                  </datalist>
                </div>
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Maqola matni — UZ (har bir xatboshi yangi qatordan)", "Текст статьи — UZ (каждый абзац с новой строки)")}</label>
                <textarea name="content" rows={10} defaultValue={editingBlog?.content || ""} placeholder={t("Maqola to'liq matni...", "Полный текст статьи...")} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Maqola matni — RU", "Текст статьи — RU")}</label>
                <textarea name="contentRu" rows={10} defaultValue={editingBlog?.contentRu || ""} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              </div>
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">
                  {t("Maqola rasmi", "Изображение статьи")} {editingBlog?.hasImage ? t("(yangi rasm yuklasangiz, eskisi almashadi)", "(при загрузке нового изображения старое заменится)") : t("(ixtiyoriy)", "(необязательно)")}
                </label>
                <input type="file" name="image" accept="image/*" style={{ fontFamily: "var(--font-body)" }}
                  className="w-full text-sm text-[#060920]/70 file:mr-4 file:px-4 file:py-2 file:rounded-lg file:border file:border-[#060920]/15 file:bg-white file:text-[#060920]/70 file:cursor-pointer cursor-pointer" />
              </div>
              {editingBlog && (
                <p style={{ fontFamily: "var(--font-body)" }} className="text-xs text-[#060920]/50">
                  {t("Holat:", "Статус:")} <b>{editingBlog.status === "published" ? t("Chop etilgan", "Опубликовано") : t("Qoralama", "Черновик")}</b>. {t("Chop etish/qoralamaga qaytarishni ro'yxatdagi tugmalar orqali qiling.", "Публикацию/возврат в черновик выполняйте кнопками в списке.")}
                </p>
              )}
              <SaveBtn saving={saving} editing={!!editingBlog} />
            </form>
          </ModalShell>
        )}
      </AnimatePresence>

      {/* ===== ADMIN MODAL (faqat superadmin) ===== */}
      <AnimatePresence>
        {showAdminModal && (
          <ModalShell wide title={editingAdmin ? `${t("Adminni tahrirlash", "Редактировать администратора")} — ${editingAdmin.name}` : t("Yangi admin", "Новый администратор")} onClose={() => { setShowAdminModal(false); setEditingAdmin(null); }}>
            <form onSubmit={saveAdminUser} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input name="name" required defaultValue={editingAdmin?.name || ""} placeholder={t("Ism *", "Имя *")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
                <input name="username" required defaultValue={editingAdmin?.username || ""} placeholder={t("Login *", "Логин *")} autoComplete="off" style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              </div>
              {/* Mavjud parol hech qachon serverdan qaytarilmaydi — maydon doim
                  bo'sh boshlanadi; admin faqat yangi parol kiritganda o'zgaradi. */}
              <div className="relative">
                <input name="password" type={showAdminPass ? "text" : "password"} required={!editingAdmin} minLength={editingAdmin ? undefined : 8} autoComplete="new-password"
                  placeholder={editingAdmin ? t("Yangi parol (bo'sh qoldirsangiz o'zgarmaydi)", "Новый пароль (оставьте пустым, чтобы не менять)") : t("Parol * (kamida 8 belgi)", "Пароль * (минимум 8 символов)")}
                  style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} pr-12`} />
                <button type="button" onClick={() => setShowAdminPass((v) => !v)}
                  aria-label={showAdminPass ? t("Parolni yashirish", "Скрыть пароль") : t("Parolni ko'rsatish", "Показать пароль")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#060920]/40 hover:text-[#060920] transition-colors">
                  {showAdminPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {editingAdmin?.username !== me?.username && (
                <div>
                  <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Rol", "Роль")}</label>
                  <select name="role" defaultValue={editingAdmin?.role || "admin"} style={{ fontFamily: "var(--font-body)" }} className={inputClass}>
                    <option value="admin">{t("Admin", "Администратор")}</option>
                    <option value="superadmin">{t("Bosh admin", "Главный администратор")}</option>
                  </select>
                </div>
              )}
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-2">{t("Bo'lim ruxsatlari", "Права доступа к разделам")}</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {PERM_LABELS.map((p) => (
                    <label key={p.key} style={{ fontFamily: "var(--font-body)" }}
                      className="flex items-center gap-2 px-3 py-2 border border-[#060920]/10 rounded-lg text-sm text-[#060920]/70 cursor-pointer hover:bg-[#060920]/5 transition-colors">
                      <input type="checkbox" name={`perm_${p.key}`} defaultChecked={editingAdmin ? editingAdmin.perms?.[p.key] !== false : true} className="accent-[#060920]" />
                      {t(p.label, p.ru)}
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
          <ModalShell title={t("Yangi topshiriq", "Новое задание")} onClose={() => setShowTaskModal(false)}>
            <form onSubmit={saveTask} className="space-y-4">
              <input name="title" required placeholder={t("Topshiriq sarlavhasi *", "Заголовок задания *")} style={{ fontFamily: "var(--font-body)" }} className={inputClass} />
              <textarea name="desc" rows={4} placeholder={t("Batafsil tavsif (ixtiyoriy)", "Подробное описание (необязательно)")} style={{ fontFamily: "var(--font-body)" }} className={`${inputClass} resize-none`} />
              <div>
                <label style={{ fontFamily: "var(--font-body)" }} className="block text-xs tracking-wide uppercase text-[#060920]/50 mb-1.5">{t("Kimga", "Кому")}</label>
                <select name="assignee" required style={{ fontFamily: "var(--font-body)" }} className={inputClass}>
                  {assignableAdmins.map((a) => (
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
  const t = useT();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  // Escape bilan yopish + ochilganda panelga fokus, yopilganda oldingi
  // elementga fokusni qaytarish (klaviatura bilan ishlaydigan foydalanuvchilar uchun).
  useEffect(() => {
    triggerRef.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      triggerRef.current?.focus?.();
    };
  }, [onClose]);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      data-lenis-prevent
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#060920]/40 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}>
      <motion.div ref={panelRef} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title}
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className={`w-full ${wide ? "max-w-2xl" : "max-w-lg"} bg-white rounded-2xl p-8 shadow-2xl my-auto outline-none`}>
        <div className="flex items-center justify-between mb-6">
          <h3 style={{ fontFamily: "var(--font-display)" }} className="text-xl text-[#060920]">{title}</h3>
          <button onClick={onClose} style={{ fontFamily: "var(--font-body)" }} className="px-3 py-1 rounded-lg hover:bg-[#060920]/5 text-[#060920]/50 text-sm">{t("Yopish", "Закрыть")}</button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function SaveBtn({ saving, editing }: { saving: boolean; editing: boolean }) {
  const t = useT();
  return (
    <button type="submit" disabled={saving} style={{ fontFamily: "var(--font-body)" }}
      className="w-full px-8 py-3.5 bg-[#060920] text-white tracking-[0.15em] uppercase text-sm font-medium rounded-2xl hover:shadow-xl transition-all disabled:opacity-70">
      {saving ? t("Saqlanmoqda...", "Сохраняется...") : editing ? t("Saqlash", "Сохранить") : t("Qo'shish", "Добавить")}
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
  const t = useT();
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
          <span style={{ fontFamily: "var(--font-display)" }} className="text-[#060920]/20 text-xs">{t("Rasm yo'q", "Нет изображения")}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div style={{ fontFamily: "var(--font-display)" }} className="text-[#060920] text-sm leading-snug">{label}</div>
        <div className="flex gap-2 mt-3 flex-wrap items-center" style={{ fontFamily: "var(--font-body)" }}>
          <label className="px-3 py-1.5 rounded-lg text-xs tracking-wide border border-[#060920]/15 text-[#060920]/70 hover:bg-[#060920]/5 transition-colors cursor-pointer">
            {busy ? t("Yuklanmoqda...", "Загружается...") : hasImage ? t("Almashtirish", "Заменить") : t("Rasm yuklash", "Загрузить изображение")}
            <input type="file" accept="image/*" onChange={handleFile} disabled={busy} className="hidden" />
          </label>
          {hasImage && (
            <button onClick={() => onDelete(itemKey)} disabled={busy}
              className="px-3 py-1.5 rounded-lg text-xs tracking-wide border border-[#060920]/30 text-[#060920] hover:bg-[#060920]/10 transition-colors">
              {t("O'chirish", "Удалить")}
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
