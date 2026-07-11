// Umumiy forma-validatsiya yordamchilari — barcha ochiq formalar (Aloqa, HR,
// Takliflar, Bosh sahifa tezkor-aloqa) shu funksiyalarni ishlatadi.

// Telefon raqamida kamida shuncha raqam bo'lishi kerak (masalan +998901234567 = 12 ta raqam).
// Belgilar filtri (faqat raqam/+/-/()/probel) allaqachon input darajasida qo'llanadi —
// bu funksiya esa "----" yoki "()()" kabi raqamsiz/deyarli raqamsiz qiymatlarni ushlaydi.
const MIN_PHONE_DIGITS = 7;

export function isValidPhone(value: string): boolean {
  const digits = (value || "").replace(/\D/g, "");
  return digits.length >= MIN_PHONE_DIGITS;
}

// Sodda email formati tekshiruvi (xavfsizlik uchun emas — chiqishda htmlEscape
// bilan himoyalangan — faqat ma'lumot sifati uchun: "asd", "a@b" kabi aniq
// noto'g'ri qiymatlarni ushlaydi, chuqur RFC-mos tekshiruv qilmaydi).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test((value || "").trim());
}
