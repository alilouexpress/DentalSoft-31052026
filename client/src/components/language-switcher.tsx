import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/i18n/language-context";
import { LANGUAGES } from "@/i18n/translations";
import { Check } from "lucide-react";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = LANGUAGES.find(l => l.code === language)!;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 h-8 px-2 rounded-lg text-sm font-medium hover:bg-secondary/60 transition-colors"
        title={current.label}
      >
        <span className="text-base leading-none">{current.flag}</span>
        <span className="text-xs text-muted-foreground hidden sm:inline">{current.code.toUpperCase()}</span>
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-1 w-40 py-1 rounded-xl border bg-card shadow-lg z-50 animate-scale-in origin-top-right"
          style={{ borderColor: "hsl(var(--border))" }}
        >
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setOpen(false);
              }}
              className="flex items-center gap-3 w-full px-3 py-2 text-sm hover:bg-secondary/60 transition-colors"
            >
              <span className="text-base leading-none">{lang.flag}</span>
              <span className="flex-1 text-left">{lang.label}</span>
              {language === lang.code && (
                <Check className="h-3.5 w-3.5 text-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
