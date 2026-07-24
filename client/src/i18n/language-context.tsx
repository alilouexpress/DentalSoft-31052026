import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { Language } from "./translations";
import { translations, LANGUAGES } from "./translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  dir: "ltr" | "rtl";
}

export const LanguageContext = createContext<LanguageContextType | null>(null);

function getInitialLanguage(): Language {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("dentalsoft-language") as Language | null;
    if (saved && translations[saved]) return saved;
  }
  return "fr";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("dentalsoft-language", lang);
    }
  };

  const dir = LANGUAGES.find(l => l.code === language)?.dir || "ltr";

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const map = translations[language];
    let val = map[key];
    if (!val) {
      const fallback = translations["fr"][key];
      val = fallback ?? key;
    }
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        val = val.replace(`{${k}}`, String(v));
      }
    }
    return val;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
