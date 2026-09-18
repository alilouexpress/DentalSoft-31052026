import { useLanguage } from "@/i18n/language-context";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Clock } from "lucide-react";
import { useLowStockProducts, useExpiringProducts } from "@/hooks/use-api";

export function StockAlertsTab() {
  const { t } = useLanguage();
  const { data: lowStock = [] } = useLowStockProducts();
  const { data: expiring = [] } = useExpiringProducts();
  const today = new Date();

  return (
    <div className="space-y-6">
      <Card className="card-hover">
        <CardHeader className="pb-3 px-5 pt-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight">{t("inventory.lowStock")}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{lowStock.length} {t("inventory.product") || "produit(s)"} {t("inventory.belowMinStock") || "en dessous du stock minimum"}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          {lowStock.length === 0 ? (
            <EmptyState icon={<AlertTriangle />} title="Aucun stock faible" description="Tous les stocks sont suffisants" />
          ) : (
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-2">
                {lowStock.map(p => (
                  <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 font-semibold">
                        {t("inventory.lowStock")}
                      </Badge>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.sku || ""} {p.sku && p.category ? "·" : ""} {p.category || ""}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-600">{p.currentStock}</p>
                      <p className="text-xs text-muted-foreground">{t("inventory.minStock")}: {p.minimumStock}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Card className="card-hover">
        <CardHeader className="pb-3 px-5 pt-5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight">{t("inventory.expiring")}</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">{expiring.length} {t("inventory.product") || "produit(s)"} {t("inventory.expiringSoon") || "expire(nt) bientôt"}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          {expiring.length === 0 ? (
            <EmptyState icon={<Clock />} title="Aucun produit expiré" description="Aucun produit expiré détecté" />
          ) : (
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-2">
                {expiring.map(p => {
                  const daysLeft = p.expirationDate ? Math.ceil((new Date(p.expirationDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;
                  return (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 font-semibold">
                          {t("inventory.expiring")}
                        </Badge>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.sku || ""}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={cn("text-sm font-bold", daysLeft !== null && daysLeft <= 0 ? "text-red-600" : "text-amber-600")}>
                          {daysLeft !== null ? `${daysLeft} j` : "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {p.expirationDate ? new Date(p.expirationDate).toLocaleDateString() : "—"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
