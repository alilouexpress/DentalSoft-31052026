import { Badge } from "@/components/ui/badge";

export interface TabBadge {
  count: number;
  variant: "default" | "secondary" | "destructive" | "outline";
}

export interface WorkspaceTab {
  value: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactNode;
  label: string;
}

export const ToothIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M7 3C9 3 10 4.5 12 4.5C14 4.5 15 3 17 3C19 3 20 4.5 20 6C20 9 19 12 18 15C17.5 16.5 16 17.5 15.5 19C15.2 20 14.5 21 13.5 21C12.5 21 12 20 12 19C12 20 11.5 21 10.5 21C9.5 21 8.8 20 8.5 19C8 17.5 6.5 16.5 6 15C5 12 4 9 4 6C4 4.5 5 3 7 3Z" />
    <path d="M12 4.5V11" />
  </svg>
);

interface TabNavProps {
  tabs: WorkspaceTab[];
  tabBadges: Record<string, TabBadge | undefined>;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function TabNav({ tabs, tabBadges, activeTab, onTabChange }: TabNavProps) {
  return (
    <div className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-700/50 shadow-sm">
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.value;
          const badge = tabBadges[tab.value];
          return (
            <button
              key={tab.value}
              onClick={() => onTabChange(tab.value)}
              className={`group relative flex items-center gap-2 min-w-[120px] px-5 py-3.5 text-sm font-bold whitespace-nowrap transition-all duration-300 cursor-pointer shrink-0
                ${isActive
                  ? "text-sky-700 dark:text-sky-400"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
                }`}
            >
              <Icon className={`h-4 w-4 transition-colors duration-300 ${isActive ? "text-sky-600 dark:text-sky-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400"}`} />
              {tab.label}
              {badge && (
                <Badge className={`ml-0.5 text-[10px] px-1.5 py-0 font-bold rounded-full border-0 transition-colors duration-300 ${isActive
                  ? "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                  }`}>
                  {badge.count}
                </Badge>
              )}
              <span className={`absolute bottom-0 left-2 right-2 h-[3px] rounded-full transition-all duration-300 ${isActive
                ? "bg-gradient-to-r from-sky-500 to-emerald-500 opacity-100"
                : "bg-transparent opacity-0 group-hover:bg-slate-300 group-hover:opacity-40"
                }`} />
            </button>
          );
        })}
      </div>
    </div>
  );
}