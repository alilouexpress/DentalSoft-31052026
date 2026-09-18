import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useLanguage } from "@/i18n/language-context";
import { toast } from "sonner";
import type { ClinicSetting } from "@shared/schema";
import type { UseMutationResult } from "@tanstack/react-query";

type SetSettingMutation = UseMutationResult<ClinicSetting, Error, { key: string; value: any }>;

interface NotificationsSettingsTabProps {
  setSetting: SetSettingMutation;
}

export default function NotificationsSettingsTab({ setSetting }: NotificationsSettingsTabProps) {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState({ emailNotif: true, smsNotif: false, apptReminder: true, marketing: false });

  const handleSaveNotifications = async () => {
    await setSetting.mutateAsync({ key: "notificationPreferences", value: notifications });
    toast.success(t("settings.saved"));
  };

  return (
    <>
      <Card className="rounded-xl border border-border shadow-sm overflow-hidden">
        <CardContent className="p-6 space-y-4">
          {[
            { key: "emailNotif", label: t("settings.email-notif") },
            { key: "smsNotif", label: t("settings.sms-notif") },
            { key: "apptReminder", label: t("settings.appt-reminder") },
            { key: "marketing", label: t("settings.marketing") },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <span className="text-sm font-medium">{item.label}</span>
              <Switch checked={notifications[item.key as keyof typeof notifications]}
                onCheckedChange={(v) => setNotifications({ ...notifications, [item.key]: v })} />
            </div>
          ))}
          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveNotifications} disabled={setSetting.isPending} className="shadow-sm">{t("settings.save")}</Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}