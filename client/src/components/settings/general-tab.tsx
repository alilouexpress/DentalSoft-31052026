import { PremiumCard, PremiumCardContent } from "@/components/premium-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useLanguage } from "@/i18n/language-context";
import { toast } from "sonner";
import type { ClinicSetting } from "@shared/schema";
import type { UseMutationResult } from "@tanstack/react-query";

type SetSettingMutation = UseMutationResult<ClinicSetting, Error, { key: string; value: any }>;

interface GeneralSettingsTabProps {
  clinicName: ClinicSetting | undefined;
  clinicNameLoading: boolean;
  clinicNameError: boolean;
  refetchClinicName: () => void;
  clinicAddress: ClinicSetting | undefined;
  clinicPhone: ClinicSetting | undefined;
  clinicEmail: ClinicSetting | undefined;
  clinicDoctorName: ClinicSetting | undefined;
  setSetting: SetSettingMutation;
}

export default function GeneralSettingsTab({
  clinicName,
  clinicNameLoading,
  clinicNameError,
  refetchClinicName,
  clinicAddress,
  clinicPhone,
  clinicEmail,
  clinicDoctorName,
  setSetting,
}: GeneralSettingsTabProps) {
  const { t } = useLanguage();

  const handleSaveGeneral = async () => {
    const nameInput = document.getElementById("clinicNameInput") as HTMLInputElement;
    const addressInput = document.getElementById("clinicAddressInput") as HTMLInputElement;
    const phoneInput = document.getElementById("clinicPhoneInput") as HTMLInputElement;
    const emailInput = document.getElementById("clinicEmailInput") as HTMLInputElement;
    const doctorInput = document.getElementById("clinicDoctorInput") as HTMLInputElement;
    if (nameInput?.value) await setSetting.mutateAsync({ key: "clinicName", value: nameInput.value });
    if (addressInput) await setSetting.mutateAsync({ key: "clinicAddress", value: addressInput.value });
    if (phoneInput) await setSetting.mutateAsync({ key: "clinicPhone", value: phoneInput.value });
    if (emailInput) await setSetting.mutateAsync({ key: "clinicEmail", value: emailInput.value });
    if (doctorInput) await setSetting.mutateAsync({ key: "clinicDoctorName", value: doctorInput.value });
    toast.success(t("settings.saved"));
  };

  return (
    <>
      {clinicNameLoading ? (
        <PremiumCard variant="glow">
          <PremiumCardContent className="space-y-4">
            <Skeleton className="h-4 w-40" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-1.5">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </PremiumCardContent>
        </PremiumCard>
      ) : clinicNameError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("common.error")}</AlertTitle>
          <AlertDescription>
            {t("common.error")}
            <br />
            <Button variant="outline" size="sm" onClick={() => refetchClinicName()} className="mt-2">
              <RefreshCw className="h-3 w-3 mr-1" /> {t("common.retry")}
            </Button>
          </AlertDescription>
        </Alert>
      ) : (
        <PremiumCard variant="glow">
          <PremiumCardContent className="space-y-4">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{t("settings.clinic-info")}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{t("settings.clinic-name")}</Label>
                <Input id="clinicNameInput" defaultValue={typeof clinicName?.value === "string" ? clinicName.value : t("settings.clinic-default-name")} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("settings.clinic-doctor-name")}</Label>
                <Input id="clinicDoctorInput" defaultValue={typeof clinicDoctorName?.value === "string" ? clinicDoctorName.value : ""} placeholder="Dr. ..." />
              </div>
              <div className="space-y-1.5">
                <Label>{t("settings.clinic-address")}</Label>
                <Input id="clinicAddressInput" defaultValue={typeof clinicAddress?.value === "string" ? clinicAddress.value : ""} placeholder="123 Rue ..." />
              </div>
              <div className="space-y-1.5">
                <Label>{t("settings.clinic-phone")}</Label>
                <Input id="clinicPhoneInput" defaultValue={typeof clinicPhone?.value === "string" ? clinicPhone.value : ""} placeholder="+213 ..." />
              </div>
              <div className="space-y-1.5">
                <Label>{t("settings.clinic-email")}</Label>
                <Input id="clinicEmailInput" defaultValue={typeof clinicEmail?.value === "string" ? clinicEmail.value : ""} placeholder="contact@..." />
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button onClick={handleSaveGeneral} className="shadow-sm">{t("settings.save")}</Button>
            </div>
          </PremiumCardContent>
        </PremiumCard>
      )}
    </>
  );
}