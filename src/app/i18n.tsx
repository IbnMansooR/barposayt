import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type Lang = "uz" | "ru";

interface LangCtxValue {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const LangContext = createContext<LangCtxValue>({ lang: "uz", setLang: () => {} });

function readLang(): Lang {
  try {
    const v = localStorage.getItem("barpo_lang");
    return v === "ru" ? "ru" : "uz";
  } catch {
    return "uz";
  }
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => readLang());
  const setLang = useCallback((l: Lang) => {
    try { localStorage.setItem("barpo_lang", l); } catch {}
    setLangState(l);
  }, []);
  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

// Tarjima yordamchisi: t("uzbekcha", "ruscha") -> joriy tilga mos matn
export function useT() {
  const { lang } = useLang();
  return useCallback((uz: string, ru: string) => (lang === "ru" ? ru : uz), [lang]);
}
