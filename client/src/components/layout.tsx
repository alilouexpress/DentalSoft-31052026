import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Calendar,
  Users,
  FlaskConical,
  CreditCard,
  Settings,
  LogOut,
  Activity,
  FileText,
  ClipboardList,
  Menu,
  Bell,
  Search,
  AlertTriangle,
  ScrollText,
  Package,
  Banknote,
  History,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/i18n/language-context";
import { useAuth } from "@/auth/auth-context";
import { useUnreadNotificationCount, useNotifications, useUpdateNotification } from "@/hooks/use-api";
import LanguageSwitcher from "@/components/language-switcher";
import ThreeDIcon from "@/components/three-d-icon";
import { CommandPalette } from "@/components/command-palette";

const iconMap: Record<string, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  appointments: Calendar,
  patients: Users,
  treatments: Activity,
  "lab-work": FlaskConical,
  quotations: ScrollText,
  inventory: Package,
  billing: CreditCard,
  debts: AlertTriangle,
  expenses: Banknote,
  reports: FileText,
  tasks: ClipboardList,
  "audit-log": History,
} as const;

const allNavKeys = [
  "dashboard",
  "appointments",
  "patients",
  "treatments",
  "lab-work",
  "quotations",
  "inventory",
  "billing",
  "debts",
  "expenses",
  "reports",
  "tasks",
  "audit-log",
] as const;

function getNavKeys(role: string): readonly string[] {
  if (role === "assistant") return ["dashboard", "appointments", "patients"] as const;
  if (role === "doctor") return allNavKeys;
  return allNavKeys;
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem("dentalsoft-sidebar-collapsed") === "true"; } catch { return false; }
  });
  const [cmdOpen, setCmdOpen] = useState(false);
  const { t, dir } = useLanguage();
  const { user, logout, isAuthenticated } = useAuth();
  const roleLabel = user?.role === "admin" ? t("settings.role-admin") : user?.role === "doctor" ? t("settings.role-doctor") : t("settings.role-assistant");
  const navKeys = getNavKeys(user?.role || "admin");
  const { data: unreadData } = useUnreadNotificationCount();
  const { data: notifications = [] } = useNotifications();
  const updateNotification = useUpdateNotification();
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = unreadData?.count || 0;
  const unreadNotifications = notifications.filter(n => !n.isRead).slice(0, 10);
  const allUnread = notifications.filter(n => !n.isRead);
  const markAllRead = () => {
    allUnread.forEach(n => updateNotification.mutate({ id: n.id, data: { isRead: true } }));
  };

  const severityBadge: Record<string, string> = {
    critical: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    major: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
    minor: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    neutral: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  };

  const rtl = dir === "rtl";

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 z-50 flex flex-col transition-all duration-300 ease-in-out lg:relative",
          sidebarCollapsed ? "w-[68px]" : "w-64",
          rtl ? "right-0" : "left-0",
          sidebarOpen
            ? "translate-x-0 shadow-2xl shadow-black/20"
            : rtl ? "translate-x-full lg:translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        style={{ backgroundColor: "hsl(var(--sidebar))" }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
          <div className="h-9 w-9 rounded-lg flex items-center justify-center ms-0 me-3" style={{ backgroundColor: "hsl(var(--sidebar-primary) / 0.15)" }}>
            <ThreeDIcon icon="shield" size={28} />
          </div>
          <div className="flex items-baseline gap-1.5">
            {!sidebarCollapsed && (
              <>
                <span className="text-lg font-bold tracking-tight" style={{ color: "hsl(var(--sidebar-foreground))" }}>Dental</span>
                <span className="text-lg font-light tracking-tight" style={{ color: "hsl(var(--sidebar-primary))" }}>Soft</span>
              </>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navKeys.map((key) => {
            const href = key === "dashboard" ? "/" : `/${key}`;
            const Icon = iconMap[key];
            const isActive = location === href;
            return (
              <Link key={href} href={href} onClick={() => setSidebarOpen(false)}>
                <div
                  className={cn(
                    "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer group",
                    isActive
                      ? "shadow-sm"
                      : "",
                    isActive
                      ? "text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                  style={isActive ? {
                    backgroundColor: "hsl(var(--sidebar-primary) / 0.12)",
                    color: "hsl(var(--sidebar-primary))"
                  } : undefined}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center h-8 w-8 rounded-lg transition-all duration-200 me-3",
                      isActive
                        ? ""
                        : "group-hover:bg-sidebar-accent"
                    )}
                    style={isActive ? {
                      backgroundColor: "hsl(var(--sidebar-primary) / 0.15)"
                    } : undefined}
                  >
                    <Icon className={cn("h-[18px] w-[18px]")} />
                  </div>
                  {!sidebarCollapsed && <span className="flex-1">{t(`nav.${key}`)}</span>}
                  {isActive && (
                    <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "hsl(var(--sidebar-primary))" }} />
                  )}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-3 border-t space-y-0.5" style={{ borderColor: "hsl(var(--sidebar-border))" }}>
          <button
            onClick={() => {
              const next = !sidebarCollapsed;
              setSidebarCollapsed(next);
              try { localStorage.setItem("dentalsoft-sidebar-collapsed", String(next)); } catch {}
            }}
            className="flex items-center justify-center h-8 w-8 rounded-lg transition-colors duration-200 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted mx-auto mt-2"
            aria-label={sidebarCollapsed ? "Développer la barre latérale" : "Replier la barre latérale"}
          >
            <ChevronLeft className={`h-4 w-4 transition-transform duration-300 ${sidebarCollapsed ? "rotate-180" : ""}`} />
          </button>
          <Link href="/settings" onClick={() => setSidebarOpen(false)}>
            <div
              className={cn(
                "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                location === "/settings"
                  ? "text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
              )}
              style={location === "/settings" ? {
                backgroundColor: "hsl(var(--sidebar-primary) / 0.12)",
                color: "hsl(var(--sidebar-primary))"
              } : undefined}
            >
              <div className="flex items-center justify-center h-8 w-8 rounded-lg me-3">
                <Settings className="h-[18px] w-[18px]" />
              </div>
              {!sidebarCollapsed && t("nav.settings")}
            </div>
          </Link>
          <div onClick={() => { logout(); window.location.href = "/login"; }}
            className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200"
            style={{ color: "hsl(var(--sidebar-foreground) / 0.5)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "hsl(var(--destructive) / 0.1)";
              e.currentTarget.style.color = "hsl(var(--destructive))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "hsl(var(--sidebar-foreground) / 0.5)";
            }}
          >
            <div className="flex items-center justify-center h-8 w-8 rounded-lg me-3">
              <LogOut className="h-[18px] w-[18px]" />
            </div>
            {!sidebarCollapsed && t("nav.logout")}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 glass-strong border-b border-border sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover:bg-secondary transition-colors duration-200 h-9 w-9"
              aria-label="Toggle sidebar"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="relative hidden sm:block">
              <Search className={cn("absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground", rtl ? "right-3" : "left-3")} />
              <Input
                placeholder={t("header.search")}
                className={cn("h-9 w-64 lg:w-80 bg-muted/50 border-0 focus-visible:bg-card text-sm cursor-pointer", rtl ? "pr-9" : "pl-9")}
                dir={rtl ? "rtl" : "ltr"}
                readOnly
                onClick={() => setCmdOpen(true)}
              />
            </div>
          </div>

          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <div className="relative" ref={notifRef}>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full relative hover:bg-secondary transition-colors duration-200" aria-label="Notifications" onClick={() => setNotifOpen(!notifOpen)}>
                <Bell className="h-[18px] w-[18px] text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className={cn("absolute -top-0.5 h-4 min-w-[16px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center ring-2 ring-card", rtl ? "-left-0.5" : "-right-0.5")}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Button>
              {notifOpen && (
                <div className={cn(
                  "absolute top-full mt-1 w-80 bg-card border rounded-xl shadow-2xl z-50 overflow-hidden",
                  rtl ? "left-0" : "right-0"
                )}>
                  <div className="flex items-center justify-between px-4 py-2 border-b">
                    <span className="text-sm font-semibold">{t("notif.title")}</span>
                    {unreadCount > 0 && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={markAllRead}>
                        {t("notif.mark-all-read")}
                      </Button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {unreadNotifications.length === 0 ? (
                      <div className="py-8 text-center text-sm text-muted-foreground">{t("notif.no-notifications")}</div>
                    ) : unreadNotifications.map(n => (
                      <div key={n.id} className="px-4 py-3 hover:bg-muted/50 cursor-pointer border-b last:border-0" onClick={() => updateNotification.mutate({ id: n.id, data: { isRead: true } })}>
                        <div className="flex items-start gap-2">
                          <div className={cn("mt-0.5 h-2 w-2 rounded-full shrink-0", n.severity === "critical" ? "bg-red-500" : n.severity === "major" ? "bg-orange-500" : n.severity === "minor" ? "bg-yellow-500" : "bg-blue-500")} />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{n.title}</div>
                            {n.description && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.description}</div>}
                            <div className="text-xs text-muted-foreground mt-1">
                              {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : ""}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href="/debts">
                    <div className="px-4 py-2 text-center text-xs font-medium text-primary hover:bg-muted/50 border-t" onClick={() => setNotifOpen(false)}>
                      {t("debt.title")}
                    </div>
                  </Link>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 ps-3" style={{ borderInlineStart: "1px solid hsl(var(--border))" }}>
              <div className={cn("hidden sm:block", rtl ? "text-start" : "text-end")}>
                <div className="text-sm font-semibold text-foreground">{user?.username || "DentalSoft"}</div>
                <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{roleLabel}</div>
              </div>
              <div className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold border-2"
                style={{
                  backgroundColor: "hsl(var(--primary) / 0.1)",
                  color: "hsl(var(--primary))",
                  borderColor: "hsl(var(--primary) / 0.2)"
                }}>
                {(user?.username || "DS").charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-5 lg:p-8">
          <div className="mx-auto w-full" style={{ maxWidth: "1400px" }}>
            <div className="animate-fade-in">
              {children}
            </div>
          </div>
        </div>
      </main>
      <CommandPalette open={cmdOpen} onOpenChange={setCmdOpen} />
    </div>
  );
}
