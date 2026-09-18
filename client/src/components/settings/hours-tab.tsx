import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useLanguage } from "@/i18n/language-context";
import { toast } from "sonner";
import type { ClinicSetting } from "@shared/schema";
import type { UseMutationResult } from "@tanstack/react-query";

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

type SetSettingMutation = UseMutationResult<ClinicSetting, Error, { key: string; value: any }>;

interface HoursSettingsTabProps {
  clinicHours: ClinicSetting | undefined;
  clinicHoursLoading: boolean;
  clinicHoursError: boolean;
  refetchClinicHours: () => void;
  setSetting: SetSettingMutation;
}

export default function HoursSettingsTab({
  clinicHours,
  clinicHoursLoading,
  clinicHoursError,
  refetchClinicHours,
  setSetting,
}: HoursSettingsTabProps) {
  const { t } = useLanguage();
  const [hours, setHours] = useState<Record<string, { start: string; end: string; closed: boolean }>>({});

  useEffect(() => {
    if (clinicHours?.value) {
      const h = clinicHours.value as Record<string, string | null>;
      setHours(Object.fromEntries(days.map(d => {
        const range = (h as any)[d];
        if (!range) return [d, { start: "09:00", end: "17:00", closed: true }];
        const [start, end] = (range as string).split("-");
        return [d, { start, end, closed: false }];
      })));
    }
  }, [clinicHours]);

  const handleSaveHours = async () => {
    const value: Record<string, string | null> = {};
    for (const d of days) {
      const h = hours[d];
      value[d] = h?.closed ? null : `${h.start}-${h.end}`;
    }
    await setSetting.mutateAsync({ key: "clinicHours", value });
    toast.success(t("settings.saved"));
  };

  return (
    <>
      {clinicHoursLoading ? (
        <Card className="rounded-xl border border-border shadow-sm overflow-hidden">
          <CardContent className="p-6 space-y-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-10" />
                <Skeleton className="h-9 w-32" />
                <span className="text-muted-foreground">—</span>
                <Skeleton className="h-9 w-32" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : clinicHoursError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("common.error")}</AlertTitle>
          <AlertDescription>
            {t("common.error")}
            <br />
            <Button variant="outline" size="sm" onClick={() => refetchClinicHours()} className="mt-2">
              <RefreshCw className="h-3 w-3 mr-1" /> {t("common.retry")}
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <Card className="rounded-xl border border-border shadow-sm overflow-hidden">
          <CardContent className="p-6 space-y-4">
            {days.map(day => {
            const h = hours[day];
            if (!h) return null;
            return (
              <div key={day} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
                <div className="w-28 font-medium text-sm">{t("settings." + day)}</div>
                <Switch checked={!h.closed} onCheckedChange={(v) => setHours({ ...hours, [day]: { ...h, closed: !v } })} />
                {h.closed ? (
                  <span className="text-sm text-muted-foreground italic">{t("settings.closed")}</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input type="time" value={h.start} onChange={(e) => setHours({ ...hours, [day]: { ...h, start: e.target.value } })} className="w-32 h-9" />
                    <span className="text-muted-foreground">—</span>
                    <Input type="time" value={h.end} onChange={(e) => setHours({ ...hours, [day]: { ...h, end: e.target.value } })} className="w-32 h-9" />
                  </div>
                )}
              </div>
            );
          })}
          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveHours} className="shadow-sm">{t("settings.save")}</Button>
          </div>
        </CardContent>
      </Card>
      )}
    </>
  );
}