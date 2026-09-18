import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/empty-state";
import { useLanguage } from "@/i18n/language-context";
import { Pencil, Trash2, ClipboardList } from "lucide-react";
import type { MedicalHistoryRecord } from "@shared/schema";
import { CATEGORIES, formatDate } from "./constants";
import { SeverityBadge, CategoryBadge } from "./badges";

interface Props {
  records: MedicalHistoryRecord[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  onEdit: (record: MedicalHistoryRecord) => void;
  onDelete: (id: string) => void;
}

export default function MedicalHistoryList({ records, activeTab, onTabChange, onEdit, onDelete }: Props) {
  const { t } = useLanguage();
  const filtered = activeTab === "all" ? records : records.filter((r) => r.category === activeTab);
  return (
    <Card className="card-hover">
      <CardHeader className="pb-0 px-5 pt-5">
        <Tabs defaultValue="all" value={activeTab} onValueChange={onTabChange}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">{t("medicalHistory.list")}</CardTitle>
          </div>
          <TabsList className="mt-3 flex-wrap h-auto">
            <TabsTrigger value="all" className="text-xs">{t("common.all")}</TabsTrigger>
            {CATEGORIES.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="text-xs">
                {t(`medicalHistory.${cat}`)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-4">
        <ScrollArea className="max-h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[140px]">{t("medicalHistory.category")}</TableHead>
                <TableHead>{t("medicalHistory.value")}</TableHead>
                <TableHead className="w-[110px]">{t("medicalHistory.severity")}</TableHead>
                <TableHead className="w-[100px]">{t("medicalHistory.startDate")}</TableHead>
                <TableHead className="w-[100px]">{t("medicalHistory.endDate")}</TableHead>
                <TableHead className="w-[80px]">{t("medicalHistory.current")}</TableHead>
                <TableHead className="w-[90px] text-end">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12">
                    <EmptyState
                      icon={<ClipboardList className="h-10 w-10" />}
                      title={t("common.no-items")}
                      description="Aucun historique médical trouvé"
                    />
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell><CategoryBadge category={record.category} /></TableCell>
                    <TableCell className="font-medium">{record.value}</TableCell>
                    <TableCell><SeverityBadge severity={record.severity} /></TableCell>
                    <TableCell className="text-muted-foreground text-xs">{formatDate(record.startDate)}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{formatDate(record.endDate)}</TableCell>
                    <TableCell>
                      {record.isCurrent ? (
                        <Badge variant="default" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-100">
                          {t("common.yes")}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          {t("common.no")}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(record)} aria-label="Modifier l'enregistrement">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive transition-colors duration-200" onClick={() => onDelete(record.id)} aria-label="Supprimer l'enregistrement">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}