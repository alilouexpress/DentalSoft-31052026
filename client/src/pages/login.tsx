import { useState, useEffect } from "react";
import { useAuth } from "@/auth/auth-context";
import { useLanguage } from "@/i18n/language-context";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LANGUAGES } from "@/i18n/translations";
import { Eye, EyeOff, Lock, User, Loader2, AlertCircle } from "lucide-react";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) setLocation("/");
  }, [isAuthenticated, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !password) { setError(t("login.fields-required")); return; }
    setLoading(true);
    try {
      await login(username, password);
      setLocation("/");
    } catch (err: any) {
      setError(err.message || t("login.connection-error"));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT PANEL — Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-cyan-600 via-cyan-700 to-teal-800 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dental-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dental-grid)" />
          </svg>
        </div>
        <div className="absolute top-20 left-20 w-40 h-40 bg-white/5 rounded-3xl rotate-12 animate-float" />
        <div className="absolute bottom-32 right-16 w-28 h-28 bg-white/5 rounded-full animate-float" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-8 w-20 h-20 bg-white/5 rounded-2xl -rotate-12 animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-40 right-32 w-16 h-16 bg-white/5 rounded-xl rotate-45 animate-float" style={{ animationDelay: "3s" }} />
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <div className="h-16 w-16 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center mb-6 ring-1 ring-white/20 shadow-lg shadow-black/10">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L3 7v10l9 5 9-5V7l-9-5z"/>
                <path d="M12 22V12"/>
                <path d="M3 7l9 5 9-5"/>
              </svg>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-3">DentalSoft</h1>
            <p className="text-lg text-cyan-100/80 max-w-md leading-relaxed">
              Gestion dentaire intelligente. Simple, rapide, fiable.
            </p>
          </div>
          <div className="space-y-4 text-cyan-100/60 text-sm">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="10"/></svg>
              </div>
              <span>Gestion des patients et dossiers médicaux</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              </div>
              <span>Planification des rendez-vous et rappels</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
              </div>
              <span>Facturation et suivi des paiements</span>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
      </div>
      {/* RIGHT PANEL — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 via-white to-cyan-50/30">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-600 to-cyan-700 flex items-center justify-center text-white shadow-lg shadow-cyan-600/25">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L3 7v10l9 5 9-5V7l-9-5z"/></svg>
            </div>
            <span className="text-xl font-bold text-foreground">DentalSoft</span>
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">{t("login.sign-in")}</h2>
            <p className="text-muted-foreground mt-1 text-sm">{t("login.subtitle")}</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">{t("login.username")}</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t("login.username-placeholder")} className="h-11 pl-10" autoComplete="username" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("login.password")}</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="h-11 pl-10 pr-10" autoComplete="current-password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-lg">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <Button type="submit" disabled={loading} className="w-full h-11 text-base font-semibold bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 shadow-lg shadow-cyan-600/25 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-600/30 hover:-translate-y-0.5 cursor-pointer">
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("login.connecting")}
                </span>
              ) : t("login.sign-in")}
            </Button>
          </form>
          <div className="mt-8">
            <p className="text-xs text-muted-foreground text-center mb-3 uppercase tracking-wider font-medium">Langue</p>
            <div className="flex justify-center gap-2">
              {LANGUAGES.map((l) => (
                <Button key={l.code} variant={l.code === language ? "default" : "outline"} size="sm" className="cursor-pointer" onClick={() => setLanguage(l.code)}>
                  {l.flag} {l.label}
                </Button>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-8">© {new Date().getFullYear()} DentalSoft. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
}
