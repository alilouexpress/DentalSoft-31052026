import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, Users, Calendar, CreditCard, FileText, Settings, LayoutDashboard, Beaker, ClipboardList, Wrench, Receipt, Package, FileBarChart, AlertTriangle, BookOpen, Stethoscope } from "lucide-react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface CommandItem {
  label: string;
  icon: React.ElementType;
  path: string;
  keywords: string[];
}

const commands: CommandItem[] = [
  { label: "Tableau de bord", icon: LayoutDashboard, path: "/", keywords: ["dashboard", "accueil", "home"] },
  { label: "Patients", icon: Users, path: "/patients", keywords: ["patient", "liste", "dossier"] },
  { label: "Rendez-vous", icon: Calendar, path: "/appointments", keywords: ["appointment", "rdv", "calendrier"] },
  { label: "Facturation", icon: CreditCard, path: "/billing", keywords: ["billing", "facture", "paiement"] },
  { label: "Devis", icon: FileText, path: "/quotations", keywords: ["quotation", "devis", "estimation"] },
  { label: "Laboratoire", icon: Beaker, path: "/lab-work", keywords: ["lab", "laboratoire", "travaux"] },
  { label: "Paramètres", icon: Settings, path: "/settings", keywords: ["settings", "configuration", "parametres"] },
  { label: "Tâches", icon: ClipboardList, path: "/tasks", keywords: ["task", "tache", "todo"] },
  { label: "Traitements", icon: Wrench, path: "/treatments", keywords: ["treatment", "traitement", "soin"] },
  { label: "Dépenses", icon: Receipt, path: "/expenses", keywords: ["expense", "depense", "charge"] },
  { label: "Inventaire", icon: Package, path: "/inventory", keywords: ["inventory", "stock", "produit"] },
  { label: "Rapports", icon: FileBarChart, path: "/reports", keywords: ["report", "rapport", "statistiques"] },
  { label: "Créances", icon: AlertTriangle, path: "/debts", keywords: ["debt", "dette", "creance"] },
  { label: "Historique médical", icon: BookOpen, path: "/medical-history", keywords: ["medical", "historique", "dossier medical"] },
  { label: "Journal d'audit", icon: Stethoscope, path: "/audit-log", keywords: ["audit", "journal", "log"] },
  { label: "Documents", icon: FileText, path: "/documents", keywords: ["document", "fichier", "image"] },
];

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const filtered = commands.filter(cmd =>
    cmd.label.toLowerCase().includes(query.toLowerCase()) ||
    cmd.keywords.some(k => k.includes(query.toLowerCase()))
  );

  useEffect(() => { setSelectedIndex(0); }, [query]);

  const executeCommand = useCallback((cmd: CommandItem) => {
    navigate(cmd.path);
    onOpenChange(false);
    setQuery("");
  }, [navigate, onOpenChange]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter" && filtered[selectedIndex]) { executeCommand(filtered[selectedIndex]); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-lg gap-0 overflow-hidden" onKeyDown={handleKeyDown}>
        <div className="flex items-center border-b px-4">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher... (Ctrl+K)" className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 h-12 text-base" autoFocus />
        </div>
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">Aucun résultat</div>
          ) : (
            filtered.map((cmd, idx) => {
              const Icon = cmd.icon;
              return (
                <button key={cmd.path} onClick={() => executeCommand(cmd)} className={cn("flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors cursor-pointer", idx === selectedIndex ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted")}>
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="font-medium">{cmd.label}</span>
                  <span className="ml-auto text-xs text-muted-foreground">{cmd.path}</span>
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
