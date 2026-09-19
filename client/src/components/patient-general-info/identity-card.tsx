import { useLanguage } from "@/i18n/language-context";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, User } from "lucide-react";
import type { Patient } from "@shared/schema";
import { FormField } from "./form-field";
import type { FormState } from "./constants";

interface IdentityCardProps {
  patient: Patient;
  onPhotoClick: () => void;
  form: FormState;
  onChange: (field: keyof FormState, value: string) => void;
  fieldErrors: Record<string, string>;
}

export function IdentityCard({ patient, onPhotoClick, form, onChange, fieldErrors }: IdentityCardProps) {
  const { t } = useLanguage();
  return (
    <Card className="border-border/60 shadow-sm overflow-hidden">
      <div className="h-12 bg-gradient-to-r from-primary/60 to-primary/20" />
      <CardContent className="relative -mt-8 pb-4">
        <div className="flex items-end gap-4">
          <div className="relative group cursor-pointer shrink-0" onClick={onPhotoClick}>
            <Avatar className="h-16 w-16 border-2 border-background shadow-md">
              <AvatarImage src={patient.photoUrl || undefined} />
              <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                {patient.name.split(" ").map((n) => n[0]).join("")}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <FormField
                field="name"
                labelKey="patients.full-name"
                placeholderKey="patients.name-placeholder"
                form={form}
                onChange={onChange}
                fieldErrors={fieldErrors}
              />
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">{t("patients.status")}</Label>
                <Input value={patient.status} disabled className="h-9 bg-muted/50" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1.5">
              <User className="h-3 w-3" />
              <span className="font-mono">{t("patients.patient-id")}: {patient.patientId}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}