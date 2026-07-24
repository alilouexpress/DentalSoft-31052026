import { useParams, useLocation } from "wouter";
import Layout from "@/components/layout";
import { PatientWorkspace } from "@/components/patient-workspace";
import { usePatient } from "@/hooks/use-api";
import { useLanguage } from "@/i18n/language-context";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";

export default function PatientWorkspacePage() {
  const { patientId } = useParams<{ patientId: string }>();
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const { data: patient, isLoading, isError } = usePatient(patientId || "");

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col gap-6">
          <Skeleton className="h-9 w-9" />
          <Skeleton className="w-full h-[500px] rounded-xl" />
        </div>
      </Layout>
    );
  }

  if (isError || !patient) {
    return (
      <Layout>
        <div className="flex flex-col gap-6">
          <Button variant="ghost" size="sm" className="w-fit gap-2" onClick={() => navigate("/patients")}>
            <ArrowLeft className="h-4 w-4" /> {t("common.back")}
          </Button>
          <div className="flex items-center justify-center py-20">
            <p className="text-muted-foreground">{t("workspace.patient-not-found")}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => navigate("/patients")} aria-label="Retour">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>

        <PatientWorkspace patientId={patient.id} />
      </div>
    </Layout>
  );
}
