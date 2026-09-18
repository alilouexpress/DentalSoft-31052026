import { useRoute } from "wouter";
import { useState } from "react";
import Layout from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { useLanguage } from "@/i18n/language-context";
import type { MedicalHistoryRecord } from "@shared/schema";
import { usePatient, useMedicalHistory, useMedicalSummary } from "@/hooks/use-api";
import MedicalHistoryHeader from "@/components/medical-history/header";
import MedicalHistorySummary from "@/components/medical-history/summary-card";
import MedicalHistoryList from "@/components/medical-history/list-card";
import MedicalHistoryFormDialog from "@/components/medical-history/form-dialog";
import MedicalHistoryDeleteDialog from "@/components/medical-history/delete-dialog";
import MedicalHistoryBatchDialog from "@/components/medical-history/batch-dialog";

export default function MedicalHistory() {
  const [, params] = useRoute<{ patientId: string }>("/medical-history/:patientId");
  const patientId = params?.patientId || "";
  const { t } = useLanguage();

  const { data: patient } = usePatient(patientId);
  const { data: records = [], isLoading, isError, refetch } = useMedicalHistory(patientId);
  const { data: summary = [] } = useMedicalSummary(patientId);

  const [activeTab, setActiveTab] = useState("all");
  const [summaryExpanded, setSummaryExpanded] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalHistoryRecord | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);

  const openEdit = (record: MedicalHistoryRecord) => {
    setEditingRecord(record);
    setDialogOpen(true);
  };

  const confirmDelete = (id: string) => {
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  if (isError) {
    return (
      <Layout>
        <div className="flex flex-col gap-6 p-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t("common.error")}</AlertTitle>
            <AlertDescription>
              {t("common.error")}
              <br />
              <Button variant="outline" size="sm" onClick={() => refetch()} className="mt-2">
                <RefreshCw className="h-3 w-3 mr-1" /> {t("common.retry")}
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <MedicalHistoryHeader
          patientName={patient?.name}
          onBatch={() => setBatchDialogOpen(true)}
          onAdd={() => setDialogOpen(true)}
        />

        {summary.length > 0 && (
          <MedicalHistorySummary
            summary={summary}
            expanded={summaryExpanded}
            onToggle={() => setSummaryExpanded(!summaryExpanded)}
          />
        )}

        <MedicalHistoryList
          records={records}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onEdit={openEdit}
          onDelete={confirmDelete}
        />
      </div>

      <MedicalHistoryFormDialog
        open={dialogOpen}
        onOpenChange={(o) => { if (!o) setDialogOpen(false); }}
        patientId={patientId}
        record={editingRecord}
      />
      <MedicalHistoryDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        targetId={deleteTargetId}
      />
      <MedicalHistoryBatchDialog
        open={batchDialogOpen}
        onOpenChange={setBatchDialogOpen}
        patientId={patientId}
      />
    </Layout>
  );
}