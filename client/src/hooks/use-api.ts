import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Patient, InsertPatient,
  Doctor, InsertDoctor,
  Appointment, InsertAppointment,
  TreatmentCategory, InsertTreatmentCategory,
  Treatment, InsertTreatment,
  StaffMember, InsertStaff,
  Invoice, InsertInvoice,
  Payment, InsertPayment,
  LabCase, InsertLabCase,
  Task, InsertTask,
  ClinicSetting,
  StatusConfig, InsertStatusConfig,
  TimeSlot, InsertTimeSlot,
  User, InsertUser,
  Notification, InsertNotification,
  TreatmentPhase, InsertTreatmentPhase,
  PatientTreatment, InsertPatientTreatment,
  PatientTreatmentProgress, InsertPatientTreatmentProgress,
  DentalChart, DentalChartEntry, InsertDentalChartEntry, DentalChartNote,
  Quotation, QuotationItem, InsertQuotation, InsertQuotationItem,
  MedicalHistoryRecord, InsertMedicalHistory,
  InventoryProduct, InsertInventoryProduct,
  InventorySupplier, InsertInventorySupplier,
  InventoryMovement,
  PurchaseOrder, InsertPurchaseOrder,
  PurchaseOrderItem,
  Expense, InsertExpense,
  PatientDocument,
  Signature,
  AuditLog,
  Backup,
  UserSession,
  PatientImage, InsertPatientImage,
  Prescription, InsertPrescription,
  PrescriptionItem, InsertPrescriptionItem,
} from "@shared/schema";

const API_BASE = "/api";

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("dentalsoft-token") : null;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...options?.headers as Record<string, string> },
  });
  if (response.status === 401) {
    localStorage.removeItem("dentalsoft-token");
    window.location.href = "/login";
    throw new Error("Session expirée");
  }
  if (!response.ok) throw new Error(`API error: ${response.statusText}`);
  if (response.status === 204) return undefined as T;
  return response.json();
}

// --- Patients ---
export function usePatients() {
  return useQuery<Patient[]>({ queryKey: ["patients"], queryFn: () => fetchJson(`${API_BASE}/patients`) });
}
export function usePatient(id: string) {
  return useQuery<Patient>({ queryKey: ["patients", id], queryFn: () => fetchJson(`${API_BASE}/patients/${id}`), enabled: !!id });
}
export function useCreatePatient() {
  const qc = useQueryClient();
  return useMutation<Patient, Error, InsertPatient>({
    mutationFn: (data) => fetchJson(`${API_BASE}/patients`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["patients"] }); },
  });
}
export function useUpdatePatient() {
  const qc = useQueryClient();
  return useMutation<Patient, Error, { id: string; data: Partial<InsertPatient> }>({
    mutationFn: ({ id, data }) => fetchJson(`${API_BASE}/patients/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["patients"] }); },
  });
}
export function useDeletePatient() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => fetchJson(`${API_BASE}/patients/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["patients"] }); },
  });
}

// --- Doctors ---
export function useDoctors() {
  return useQuery<Doctor[]>({ queryKey: ["doctors"], queryFn: () => fetchJson(`${API_BASE}/doctors`) });
}
export function useCreateDoctor() {
  const qc = useQueryClient();
  return useMutation<Doctor, Error, InsertDoctor>({
    mutationFn: (data) => fetchJson(`${API_BASE}/doctors`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["doctors"] }); },
  });
}
export function useUpdateDoctor() {
  const qc = useQueryClient();
  return useMutation<Doctor, Error, { id: string; data: Partial<InsertDoctor> }>({
    mutationFn: ({ id, data }) => fetchJson(`${API_BASE}/doctors/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["doctors"] }); },
  });
}
export function useDeleteDoctor() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => fetchJson(`${API_BASE}/doctors/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["doctors"] }); },
  });
}

// --- Appointments ---
export function useAppointments(date?: string) {
  return useQuery<(Appointment & { patientName?: string; doctorName?: string })[]>({
    queryKey: ["appointments", date],
    queryFn: () => fetchJson(date ? `${API_BASE}/appointments?date=${date}` : `${API_BASE}/appointments`),
  });
}
export function useCreateAppointment() {
  const qc = useQueryClient();
  return useMutation<Appointment, Error, InsertAppointment>({
    mutationFn: (data) => fetchJson(`${API_BASE}/appointments`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["appointments"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); },
  });
}
export function useUpdateAppointment() {
  const qc = useQueryClient();
  return useMutation<Appointment, Error, { id: string; data: Partial<InsertAppointment> }>({
    mutationFn: ({ id, data }) => fetchJson(`${API_BASE}/appointments/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["appointments"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); },
  });
}
export function useDeleteAppointment() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => fetchJson(`${API_BASE}/appointments/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["appointments"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); },
  });
}

// --- Treatment Categories ---
export function useTreatmentCategories() {
  return useQuery<TreatmentCategory[]>({ queryKey: ["treatment-categories"], queryFn: () => fetchJson(`${API_BASE}/treatment-categories`) });
}
export function useCreateTreatmentCategory() {
  const qc = useQueryClient();
  return useMutation<TreatmentCategory, Error, InsertTreatmentCategory>({
    mutationFn: (data) => fetchJson(`${API_BASE}/treatment-categories`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["treatment-categories"] }); },
  });
}
export function useDeleteTreatmentCategory() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => fetchJson(`${API_BASE}/treatment-categories/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["treatment-categories"] }); },
  });
}

// --- Treatments ---
export function useTreatments(categoryId?: string) {
  return useQuery<(Treatment & { categoryName?: string })[]>({
    queryKey: ["treatments", categoryId],
    queryFn: () => fetchJson(categoryId ? `${API_BASE}/treatments?categoryId=${categoryId}` : `${API_BASE}/treatments`),
  });
}
export function useCreateTreatment() {
  const qc = useQueryClient();
  return useMutation<Treatment, Error, InsertTreatment>({
    mutationFn: (data) => fetchJson(`${API_BASE}/treatments`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["treatments"] }); },
  });
}
export function useUpdateTreatment() {
  const qc = useQueryClient();
  return useMutation<Treatment, Error, { id: string; data: Partial<InsertTreatment> }>({
    mutationFn: ({ id, data }) => fetchJson(`${API_BASE}/treatments/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["treatments"] }); },
  });
}
export function useDeleteTreatment() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => fetchJson(`${API_BASE}/treatments/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["treatments"] }); },
  });
}

// --- Staff ---
export function useStaff() {
  return useQuery<StaffMember[]>({ queryKey: ["staff"], queryFn: () => fetchJson(`${API_BASE}/staff`) });
}
export function useCreateStaff() {
  const qc = useQueryClient();
  return useMutation<StaffMember, Error, InsertStaff>({
    mutationFn: (data) => fetchJson(`${API_BASE}/staff`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["staff"] }); },
  });
}
export function useUpdateStaff() {
  const qc = useQueryClient();
  return useMutation<StaffMember, Error, { id: string; data: Partial<InsertStaff> }>({
    mutationFn: ({ id, data }) => fetchJson(`${API_BASE}/staff/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["staff"] }); },
  });
}
export function useDeleteStaff() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => fetchJson(`${API_BASE}/staff/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["staff"] }); },
  });
}

export function useUploadStaffAvatar() {
  const qc = useQueryClient();
  return useMutation<{ photoUrl: string }, Error, { id: string; file: File }>({
    mutationFn: async ({ id, file }) => {
      const formData = new FormData();
      formData.append("avatar", file);
      const response = await fetch(`${API_BASE}/staff/${id}/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("dentalsoft-token") || ""}` },
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["staff"] }); },
  });
}

// --- Invoices ---
export function useInvoices() {
  return useQuery<(Invoice & { patientName?: string; remaining?: string })[]>({ queryKey: ["invoices"], queryFn: () => fetchJson(`${API_BASE}/invoices`) });
}
export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation<Invoice, Error, InsertInvoice>({
    mutationFn: (data) => fetchJson(`${API_BASE}/invoices`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["invoices"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); },
  });
}
export function useUpdateInvoice() {
  const qc = useQueryClient();
  return useMutation<Invoice, Error, { id: string; data: Partial<InsertInvoice> }>({
    mutationFn: ({ id, data }) => fetchJson(`${API_BASE}/invoices/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["invoices"] }); },
  });
}
export function useDeleteInvoice() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => fetchJson(`${API_BASE}/invoices/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["invoices"] }); },
  });
}

// --- Payments ---
export function useInvoicePayments(invoiceId: string) {
  return useQuery<Payment[]>({
    queryKey: ["payments", "invoice", invoiceId],
    queryFn: () => fetchJson(`${API_BASE}/invoices/${invoiceId}/payments`),
    enabled: !!invoiceId,
  });
}
export function useInvoiceDetail(invoiceId: string) {
  return useQuery<any>({
    queryKey: ["invoice-detail", invoiceId],
    queryFn: () => fetchJson(`${API_BASE}/invoices/${invoiceId}/detail`),
    enabled: !!invoiceId,
  });
}
export function usePatientPayments(patientId: string) {
  return useQuery<(Payment & { invoiceAmount?: string })[]>({
    queryKey: ["payments", "patient", patientId],
    queryFn: () => fetchJson(`${API_BASE}/patients/${patientId}/payments`),
    enabled: !!patientId,
  });
}
export function usePatientDebt(patientId: string) {
  return useQuery<{ totalInvoiced: string; totalPaid: string; balance: string; lastPaymentDate: string | null; paymentCount: number }>({
    queryKey: ["debt", patientId],
    queryFn: () => fetchJson(`${API_BASE}/patients/${patientId}/debt`),
    enabled: !!patientId,
  });
}
export function useCreatePayment() {
  const qc = useQueryClient();
  return useMutation<Payment, Error, InsertPayment>({
    mutationFn: (data) => fetchJson(`${API_BASE}/payments`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["debt"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
export function useDeletePayment() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => fetchJson(`${API_BASE}/payments/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["debt"] });
    },
  });
}
export function useUpdatePayment() {
  const qc = useQueryClient();
  return useMutation<Payment, Error, { id: string; data: Partial<InsertPayment> }>({
    mutationFn: ({ id, data }) => fetchJson(`${API_BASE}/payments/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payments"] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
      qc.invalidateQueries({ queryKey: ["debt"] });
    },
  });
}

// --- Debts ---
export function useDebtors() {
  return useQuery<(Patient & { totalInvoiced: string; totalPaid: string; balance: string; lastPaymentDate: string | null; overdueDays: number; currentPhase?: string; currentPhaseColor?: string; treatmentPercentage: number })[]>({
    queryKey: ["debts"],
    queryFn: () => fetchJson(`${API_BASE}/debts`),
  });
}
export function useOverdueDebts() {
  return useQuery<(Patient & { totalInvoiced: string; totalPaid: string; balance: string; lastPaymentDate: string | null; overdueDays: number; currentPhase?: string; currentPhaseColor?: string; treatmentPercentage: number })[]>({
    queryKey: ["debts", "overdue"],
    queryFn: () => fetchJson(`${API_BASE}/debts/overdue`),
  });
}

// --- Treatment Phases ---
export function useTreatmentPhases() {
  return useQuery<TreatmentPhase[]>({ queryKey: ["treatment-phases"], queryFn: () => fetchJson(`${API_BASE}/treatment-phases`) });
}
export function useCreateTreatmentPhase() {
  const qc = useQueryClient();
  return useMutation<TreatmentPhase, Error, InsertTreatmentPhase>({
    mutationFn: (data) => fetchJson(`${API_BASE}/treatment-phases`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["treatment-phases"] }); },
  });
}
export function useDeleteTreatmentPhase() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => fetchJson(`${API_BASE}/treatment-phases/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["treatment-phases"] }); },
  });
}

// --- Patient Treatment Progress ---
export function usePatientTreatmentProgress(patientId: string) {
  return useQuery<(PatientTreatmentProgress & { phaseName?: string; phaseColor?: string })[]>({
    queryKey: ["treatment-progress", patientId],
    queryFn: () => fetchJson(`${API_BASE}/patients/${patientId}/treatment-progress`),
    enabled: !!patientId,
  });
}
export function useUpsertPatientTreatmentProgress() {
  const qc = useQueryClient();
  return useMutation<PatientTreatmentProgress, Error, { patientId: string; data: InsertPatientTreatmentProgress }>({
    mutationFn: ({ patientId, data }) => fetchJson(`${API_BASE}/patients/${patientId}/treatment-progress`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["treatment-progress"] }); },
  });
}

// --- Patient Treatments (Treatment Plan) ---
export function usePatientTreatments(patientId: string) {
  return useQuery<(PatientTreatment & { treatmentName?: string; doctorName?: string })[]>({
    queryKey: ["patient-treatments", patientId],
    queryFn: () => fetchJson(`${API_BASE}/patients/${patientId}/treatments`),
    enabled: !!patientId,
  });
}
export function useCreatePatientTreatment() {
  const qc = useQueryClient();
  return useMutation<PatientTreatment, Error, { patientId: string; data: InsertPatientTreatment }>({
    mutationFn: ({ patientId, data }) => fetchJson(`${API_BASE}/patients/${patientId}/treatments`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["patient-treatments"] }); },
  });
}
export function useUpdatePatientTreatment() {
  const qc = useQueryClient();
  return useMutation<PatientTreatment, Error, { id: string; data: Partial<InsertPatientTreatment> }>({
    mutationFn: ({ id, data }) => fetchJson(`${API_BASE}/patients/treatments/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["patient-treatments"] }); },
  });
}
export function useDeletePatientTreatment() {
  const qc = useQueryClient();
  return useMutation<boolean, Error, string>({
    mutationFn: (id) => fetchJson(`${API_BASE}/patients/treatments/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["patient-treatments"] }); },
  });
}

// --- Treatment History (Audit Logs) ---
export function useTreatmentHistory(treatmentId: string) {
  return useQuery<AuditLog[]>({
    queryKey: ["treatment-history", treatmentId],
    queryFn: () => fetchJson(`${API_BASE}/treatments/${treatmentId}/history`),
    enabled: !!treatmentId,
  });
}

// --- Notifications ---
export function useNotifications() {
  return useQuery<(Notification & { patientName?: string })[]>({
    queryKey: ["notifications"],
    queryFn: () => fetchJson(`${API_BASE}/notifications`),
    refetchInterval: 30000,
  });
}
export function useUnreadNotificationCount() {
  return useQuery<{ count: number }>({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => fetchJson(`${API_BASE}/notifications/unread-count`),
    refetchInterval: 15000,
  });
}
export function useCreateNotification() {
  const qc = useQueryClient();
  return useMutation<Notification, Error, InsertNotification>({
    mutationFn: (data) => fetchJson(`${API_BASE}/notifications`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); },
  });
}
export function useUpdateNotification() {
  const qc = useQueryClient();
  return useMutation<Notification, Error, { id: string; data: Partial<InsertNotification> }>({
    mutationFn: ({ id, data }) => fetchJson(`${API_BASE}/notifications/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); },
  });
}
export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => fetchJson(`${API_BASE}/notifications/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); },
  });
}
export function useAutoCreateOverdueNotifications() {
  const qc = useQueryClient();
  return useMutation<{ success: boolean }, Error, void>({
    mutationFn: () => fetchJson(`${API_BASE}/notifications/auto-overdue`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["debts"] });
    },
  });
}

// --- Lab Cases ---
export function useLabCases() {
  return useQuery<(LabCase & { patientName?: string; doctorName?: string })[]>({ queryKey: ["lab-cases"], queryFn: () => fetchJson(`${API_BASE}/lab-cases`) });
}
export function useCreateLabCase() {
  const qc = useQueryClient();
  return useMutation<LabCase, Error, InsertLabCase>({
    mutationFn: (data) => fetchJson(`${API_BASE}/lab-cases`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lab-cases"] }); },
  });
}
export function useUpdateLabCase() {
  const qc = useQueryClient();
  return useMutation<LabCase, Error, { id: string; data: Partial<InsertLabCase> }>({
    mutationFn: ({ id, data }) => fetchJson(`${API_BASE}/lab-cases/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lab-cases"] }); },
  });
}
export function useDeleteLabCase() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => fetchJson(`${API_BASE}/lab-cases/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["lab-cases"] }); },
  });
}

// --- Tasks ---
export function useTasks() {
  return useQuery<(Task & { assigneeName?: string })[]>({ queryKey: ["tasks"], queryFn: () => fetchJson(`${API_BASE}/tasks`) });
}
export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation<Task, Error, InsertTask>({
    mutationFn: (data) => fetchJson(`${API_BASE}/tasks`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); },
  });
}
export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation<Task, Error, { id: string; data: Partial<InsertTask> }>({
    mutationFn: ({ id, data }) => fetchJson(`${API_BASE}/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); },
  });
}
export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => fetchJson(`${API_BASE}/tasks/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); },
  });
}

// --- Settings ---
export function useClinicSetting(key: string) {
  return useQuery<ClinicSetting>({
    queryKey: ["settings", key],
    queryFn: () => fetchJson(`${API_BASE}/settings/${key}`),
    enabled: !!key,
  });
}
export function useSetClinicSetting() {
  const qc = useQueryClient();
  return useMutation<ClinicSetting, Error, { key: string; value: any }>({
    mutationFn: ({ key, value }) => fetchJson(`${API_BASE}/settings/${key}`, { method: "PUT", body: JSON.stringify({ value }) }),
    onSuccess: (_, vars) => { qc.invalidateQueries({ queryKey: ["settings", vars.key] }); },
  });
}

// --- Status Configs ---
export function useStatusConfigs(entityType?: string) {
  return useQuery<StatusConfig[]>({
    queryKey: ["status-configs", entityType],
    queryFn: () => fetchJson(entityType ? `${API_BASE}/status-configs?entityType=${entityType}` : `${API_BASE}/status-configs`),
  });
}

// --- Time Slots ---
export function useTimeSlots() {
  return useQuery<TimeSlot[]>({ queryKey: ["time-slots"], queryFn: () => fetchJson(`${API_BASE}/time-slots`) });
}

// --- Dashboard & Reports ---
export function useDashboardStats() {
  return useQuery<{ totalPatients: number; todayAppointments: number; completedAppointments: number; monthlyRevenue: string; }>({
    queryKey: ["dashboard", "stats"],
    queryFn: () => fetchJson(`${API_BASE}/dashboard/stats`),
  });
}
export function useMonthlyStats(year?: number) {
  return useQuery<{ month: number; appointments: number; revenue: string }[]>({
    queryKey: ["reports", "monthly", year],
    queryFn: () => fetchJson(`${API_BASE}/reports/monthly${year ? `?year=${year}` : ""}`),
  });
}
export function useTreatmentStats() {
  return useQuery<{ name: string; count: number; revenue: string }[]>({
    queryKey: ["reports", "treatments"],
    queryFn: () => fetchJson(`${API_BASE}/reports/treatments`),
  });
}
export function useStatusStats() {
  return useQuery<{ status: string; count: number }[]>({
    queryKey: ["reports", "status-stats"],
    queryFn: () => fetchJson(`${API_BASE}/reports/status-stats`),
  });
}
export function useUsers() {
  return useQuery<User[]>({
    queryKey: ["users"],
    queryFn: () => fetchJson(`${API_BASE}/users`),
  });
}
export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InsertUser & { password: string }) =>
      fetchJson(`${API_BASE}/users`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}
export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      fetchJson(`${API_BASE}/users/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

// ═══════════════════════════════════════════
// MODULE 1: DASHBOARD ENHANCEMENTS
// ═══════════════════════════════════════════
export function useDailyRevenue() {
  return useQuery<{ amount: string }>({ queryKey: ["dashboard", "daily-revenue"], queryFn: () => fetchJson(`${API_BASE}/dashboard/daily-revenue`) });
}
export function useWeeklyRevenue() {
  return useQuery<{ amount: string }>({ queryKey: ["dashboard", "weekly-revenue"], queryFn: () => fetchJson(`${API_BASE}/dashboard/weekly-revenue`) });
}
export function useMonthlyRevenue() {
  return useQuery<{ amount: string }>({ queryKey: ["dashboard", "monthly-revenue"], queryFn: () => fetchJson(`${API_BASE}/dashboard/monthly-revenue`) });
}
export function useNetProfit() {
  return useQuery<{ amount: string }>({ queryKey: ["dashboard", "net-profit"], queryFn: () => fetchJson(`${API_BASE}/dashboard/net-profit`) });
}
export function useActiveTreatments() {
  return useQuery<{ count: number }>({ queryKey: ["dashboard", "active-treatments"], queryFn: () => fetchJson(`${API_BASE}/dashboard/active-treatments`) });
}
export function useCriticalAlerts() {
  return useQuery<{ id: string; type: string; title: string; severity: string; patientName?: string; createdAt: Date }[]>({
    queryKey: ["dashboard", "critical-alerts"],
    queryFn: () => fetchJson(`${API_BASE}/dashboard/critical-alerts`),
  });
}
export function useRecentActivities() {
  return useQuery<{ action: string; entityType: string; entityName: string; username: string; createdAt: Date }[]>({
    queryKey: ["dashboard", "recent-activities"],
    queryFn: () => fetchJson(`${API_BASE}/dashboard/recent-activities`),
  });
}
export function useDoctorProductivity(doctorId?: string, startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  if (doctorId) params.set("doctorId", doctorId);
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  const qs = params.toString();
  return useQuery<{ id: string; name: string; appointmentCount: number; revenue: string }[]>({
    queryKey: ["dashboard", "doctor-productivity", doctorId, startDate, endDate],
    queryFn: () => fetchJson(`${API_BASE}/dashboard/doctor-productivity${qs ? `?${qs}` : ""}`),
  });
}
export function useUpcomingAppointments() {
  return useQuery<(Appointment & { patientName?: string; doctorName?: string })[]>({
    queryKey: ["dashboard", "upcoming-appointments"],
    queryFn: () => fetchJson(`${API_BASE}/dashboard/upcoming-appointments`),
    refetchInterval: 30000,
  });
}
export function useLabAlerts() {
  return useQuery<(LabCase & { patientName?: string; overdueDays?: number })[]>({
    queryKey: ["dashboard", "lab-alerts"],
    queryFn: () => fetchJson(`${API_BASE}/dashboard/lab-alerts`),
  });
}

// ═══════════════════════════════════════════
// MODULE 2: DENTAL CHART
// ═══════════════════════════════════════════
export function useDentalChart(patientId: string) {
  return useQuery<DentalChart & { entries?: DentalChartEntry[]; notes?: DentalChartNote[] }>({
    queryKey: ["dental-chart", patientId],
    queryFn: () => fetchJson(`${API_BASE}/patients/${patientId}/dental-chart`),
    enabled: !!patientId,
  });
}
export function useCreateDentalChart() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: { chartType: string } }) =>
      fetchJson(`${API_BASE}/patients/${patientId}/dental-chart`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dental-chart"] }),
  });
}
export function useUpsertDentalChartEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InsertDentalChartEntry) =>
      fetchJson(`${API_BASE}/dental-chart/entries`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dental-chart"] }),
  });
}
export function useUpdateDentalChartEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertDentalChartEntry> }) =>
      fetchJson(`${API_BASE}/dental-chart/entries/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dental-chart"] }),
  });
}
export function useDeleteDentalChartEntry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJson(`${API_BASE}/dental-chart/entries/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dental-chart"] }),
  });
}
export function useAddDentalChartNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ chartId, data }: { chartId: string; data: { note: string; authorId?: string } }) =>
      fetchJson(`${API_BASE}/dental-chart/${chartId}/notes`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["dental-chart"] }),
  });
}

// ═══════════════════════════════════════════
// MODULE 3: QUOTATIONS
// ═══════════════════════════════════════════
export function useQuotations() {
  return useQuery<(Quotation & { patientName?: string; doctorName?: string; itemCount?: number })[]>({
    queryKey: ["quotations"],
    queryFn: () => fetchJson(`${API_BASE}/quotations`),
  });
}
export function useQuotation(id: string) {
  return useQuery<Quotation & { patientName?: string; doctorName?: string; items?: QuotationItem[] }>({
    queryKey: ["quotations", id],
    queryFn: () => fetchJson(`${API_BASE}/quotations/${id}`),
    enabled: !!id,
  });
}
export function useCreateQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InsertQuotation) =>
      fetchJson(`${API_BASE}/quotations`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["quotations"] }); },
  });
}
export function useUpdateQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertQuotation> }) =>
      fetchJson(`${API_BASE}/quotations/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotations"] }),
  });
}
export function useDeleteQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJson(`${API_BASE}/quotations/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotations"] }),
  });
}
export function useApproveQuotation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJson(`${API_BASE}/quotations/${id}/approve`, { method: "POST" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["quotations"] }); },
  });
}
export function useConvertQuotationToInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJson(`${API_BASE}/quotations/${id}/convert-to-invoice`, { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["quotations"] });
      qc.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
}
export function useQuotationItems(quotationId: string) {
  return useQuery<QuotationItem[]>({
    queryKey: ["quotations", quotationId, "items"],
    queryFn: () => fetchJson(`${API_BASE}/quotations/${quotationId}/items`),
    enabled: !!quotationId,
  });
}
export function useAddQuotationItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ quotationId, data }: { quotationId: string; data: InsertQuotationItem }) =>
      fetchJson(`${API_BASE}/quotations/${quotationId}/items`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotations"] }),
  });
}
export function useDeleteQuotationItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJson(`${API_BASE}/quotation-items/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotations"] }),
  });
}

// ═══════════════════════════════════════════
// MODULE 4: MEDICAL HISTORY
// ═══════════════════════════════════════════
export function useMedicalHistory(patientId: string) {
  return useQuery<MedicalHistoryRecord[]>({
    queryKey: ["medical-history", patientId],
    queryFn: () => fetchJson(`${API_BASE}/patients/${patientId}/medical-history`),
    enabled: !!patientId,
  });
}
export function useMedicalSummary(patientId: string) {
  return useQuery<{ category: string; items: { value: string; severity?: string; isCurrent: boolean }[] }[]>({
    queryKey: ["medical-summary", patientId],
    queryFn: () => fetchJson(`${API_BASE}/patients/${patientId}/medical-summary`),
    enabled: !!patientId,
  });
}
export function useCreateMedicalHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: string; data: InsertMedicalHistory }) =>
      fetchJson(`${API_BASE}/patients/${patientId}/medical-history`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medical-history"] }),
  });
}
export function useUpdateMedicalHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertMedicalHistory> }) =>
      fetchJson(`${API_BASE}/medical-history/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medical-history"] }),
  });
}
export function useDeleteMedicalHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJson(`${API_BASE}/medical-history/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medical-history"] }),
  });
}
export function useBatchCreateMedicalHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ patientId, records }: { patientId: string; records: InsertMedicalHistory[] }) =>
      fetchJson(`${API_BASE}/patients/${patientId}/medical-history/batch`, { method: "POST", body: JSON.stringify({ records }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medical-history"] }),
  });
}

// ═══════════════════════════════════════════
// MODULE 5: INVENTORY
// ═══════════════════════════════════════════
export function useInventoryProducts() {
  return useQuery<InventoryProduct[]>({ queryKey: ["inventory", "products"], queryFn: () => fetchJson(`${API_BASE}/inventory/products`) });
}
export function useLowStockProducts() {
  return useQuery<InventoryProduct[]>({ queryKey: ["inventory", "low-stock"], queryFn: () => fetchJson(`${API_BASE}/inventory/products/low-stock`) });
}
export function useExpiringProducts() {
  return useQuery<InventoryProduct[]>({ queryKey: ["inventory", "expiring"], queryFn: () => fetchJson(`${API_BASE}/inventory/products/expiring`) });
}
export function useCreateInventoryProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InsertInventoryProduct) =>
      fetchJson(`${API_BASE}/inventory/products`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["inventory"] }); },
  });
}
export function useUpdateInventoryProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertInventoryProduct> }) =>
      fetchJson(`${API_BASE}/inventory/products/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });
}
export function useDeleteInventoryProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJson(`${API_BASE}/inventory/products/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });
}
export function useAdjustStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, quantity, type, notes }: { id: string; quantity: number; type: string; notes?: string }) =>
      fetchJson(`${API_BASE}/inventory/products/${id}/adjust-stock`, { method: "POST", body: JSON.stringify({ quantity, type, notes }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });
}
export function useInventoryMovements(productId: string) {
  return useQuery<InventoryMovement[]>({
    queryKey: ["inventory", "movements", productId],
    queryFn: () => fetchJson(`${API_BASE}/inventory/products/${productId}/movements`),
    enabled: !!productId,
  });
}
export function useInventorySuppliers() {
  return useQuery<InventorySupplier[]>({ queryKey: ["inventory", "suppliers"], queryFn: () => fetchJson(`${API_BASE}/inventory/suppliers`) });
}
export function useCreateInventorySupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InsertInventorySupplier) =>
      fetchJson(`${API_BASE}/inventory/suppliers`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });
}
export function useUpdateInventorySupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertInventorySupplier> }) =>
      fetchJson(`${API_BASE}/inventory/suppliers/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });
}
export function useDeleteInventorySupplier() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJson(`${API_BASE}/inventory/suppliers/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });
}
export function usePurchaseOrders() {
  return useQuery<(PurchaseOrder & { supplierName?: string; itemCount?: number })[]>({
    queryKey: ["inventory", "purchase-orders"],
    queryFn: () => fetchJson(`${API_BASE}/inventory/purchase-orders`),
  });
}
export function useCreatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InsertPurchaseOrder) =>
      fetchJson(`${API_BASE}/inventory/purchase-orders`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });
}
export function useUpdatePurchaseOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertPurchaseOrder> }) =>
      fetchJson(`${API_BASE}/inventory/purchase-orders/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });
}
export function usePurchaseOrderItems(orderId: string) {
  return useQuery<(PurchaseOrderItem & { productName?: string })[]>({
    queryKey: ["inventory", "purchase-order-items", orderId],
    queryFn: () => fetchJson(`${API_BASE}/inventory/purchase-orders/${orderId}/items`),
    enabled: !!orderId,
  });
}
export function useAddPurchaseOrderItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, data }: { orderId: string; data: any }) =>
      fetchJson(`${API_BASE}/inventory/purchase-orders/${orderId}/items`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inventory"] }),
  });
}

// ═══════════════════════════════════════════
// MODULE 6: EXPENSES
// ═══════════════════════════════════════════
export function useExpenses(startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  const qs = params.toString();
  return useQuery<Expense[]>({
    queryKey: ["expenses", startDate, endDate],
    queryFn: () => fetchJson(`${API_BASE}/expenses${qs ? `?${qs}` : ""}`),
  });
}
export function useExpenseSummary(startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  if (startDate) params.set("startDate", startDate);
  if (endDate) params.set("endDate", endDate);
  const qs = params.toString();
  return useQuery<{ total: string; byCategory: { category: string; amount: string }[] }>({
    queryKey: ["expenses", "summary", startDate, endDate],
    queryFn: () => fetchJson(`${API_BASE}/expenses/summary${qs ? `?${qs}` : ""}`),
  });
}
export function useExpenseCategories() {
  return useQuery<string[]>({ queryKey: ["expenses", "categories"], queryFn: () => fetchJson(`${API_BASE}/expenses/categories`) });
}
export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InsertExpense) => fetchJson(`${API_BASE}/expenses`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["expenses"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); },
  });
}
export function useUpdateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertExpense> }) =>
      fetchJson(`${API_BASE}/expenses/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["expenses"] }),
  });
}
export function useDeleteExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJson(`${API_BASE}/expenses/${id}`, { method: "DELETE" }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["expenses"] }); qc.invalidateQueries({ queryKey: ["dashboard"] }); },
  });
}

// ═══════════════════════════════════════════
// MODULE 6A: PATIENT IMAGES (Dental Imaging)
// ═══════════════════════════════════════════
export function usePatientImages(patientId: string, filters?: Record<string, string>) {
  const params = new URLSearchParams(filters || {});
  const qs = params.toString();
  return useQuery<(PatientImage & { dentistName?: string })[]>({
    queryKey: ["patient-images", patientId, filters],
    queryFn: () => fetchJson(`${API_BASE}/patients/${patientId}/images${qs ? `?${qs}` : ""}`),
    enabled: !!patientId,
  });
}
export function useUploadPatientImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ patientId, file, imageType, toothNumbers, dentistId, clinicalNote, tags, date }: {
      patientId: string; file: File; imageType?: string; toothNumbers?: string; dentistId?: string; clinicalNote?: string; tags?: string; date?: string;
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      if (imageType) formData.append("imageType", imageType);
      if (toothNumbers) formData.append("toothNumbers", toothNumbers);
      if (dentistId) formData.append("dentistId", dentistId);
      if (clinicalNote) formData.append("clinicalNote", clinicalNote);
      if (tags) formData.append("tags", tags);
      if (date) formData.append("date", date);
      const response = await fetch(`${API_BASE}/patients/${patientId}/images`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("dentalsoft-token") || ""}` },
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["patient-images"] }),
  });
}
export function useUpdatePatientImage() {
  const qc = useQueryClient();
  return useMutation<PatientImage, Error, { id: string; data: Partial<InsertPatientImage> }>({
    mutationFn: ({ id, data }) => fetchJson(`${API_BASE}/patients/images/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["patient-images"] }),
  });
}
export function useDeletePatientImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJson(`${API_BASE}/patients/images/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["patient-images"] }),
  });
}

// ═══════════════════════════════════════════
// MODULE 7: PATIENT DOCUMENTS
// ═══════════════════════════════════════════
export function usePatientDocuments(patientId: string) {
  return useQuery<PatientDocument[]>({
    queryKey: ["documents", patientId],
    queryFn: () => fetchJson(`${API_BASE}/patients/${patientId}/documents`),
    enabled: !!patientId,
  });
}
export function useUploadPatientDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ patientId, file, name, type, category, notes }: { patientId: string; file: File; name?: string; type?: string; category?: string; notes?: string }) => {
      const formData = new FormData();
      formData.append("file", file);
      if (name) formData.append("name", name);
      if (type) formData.append("type", type);
      if (category) formData.append("category", category);
      if (notes) formData.append("notes", notes);
      const response = await fetch(`${API_BASE}/patients/${patientId}/documents`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("dentalsoft-token") || ""}` },
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      return response.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documents"] }),
  });
}
export function useDeletePatientDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJson(`${API_BASE}/documents/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documents"] }),
  });
}

// ═══════════════════════════════════════════
// MODULE 8: SIGNATURES
// ═══════════════════════════════════════════
export function useCreateSignature() {
  return useMutation({
    mutationFn: (data: any) => fetchJson(`${API_BASE}/signatures`, { method: "POST", body: JSON.stringify(data) }),
  });
}
export function useSignatures(documentType: string, documentId: string) {
  return useQuery<Signature[]>({
    queryKey: ["signatures", documentType, documentId],
    queryFn: () => fetchJson(`${API_BASE}/signatures/${documentType}/${documentId}`),
    enabled: !!documentType && !!documentId,
  });
}

// ═══════════════════════════════════════════
// MODULE 10: AUDIT LOGS
// ═══════════════════════════════════════════
export function useAuditLogs(limit = 50, offset = 0) {
  return useQuery<AuditLog[]>({
    queryKey: ["audit-logs", limit, offset],
    queryFn: () => fetchJson(`${API_BASE}/audit-logs?limit=${limit}&offset=${offset}`),
  });
}
export function useAuditLogsByEntity(entityType: string, entityId: string) {
  return useQuery<AuditLog[]>({
    queryKey: ["audit-logs", entityType, entityId],
    queryFn: () => fetchJson(`${API_BASE}/audit-logs/${entityType}/${entityId}`),
    enabled: !!entityType && !!entityId,
  });
}

// ═══════════════════════════════════════════
// MODULE 11: ADVANCED SCHEDULING
// ═══════════════════════════════════════════
export function useAppointmentsRange(startDate: string, endDate: string) {
  return useQuery<(Appointment & { patientName?: string; doctorName?: string })[]>({
    queryKey: ["appointments", "range", startDate, endDate],
    queryFn: () => fetchJson(`${API_BASE}/appointments/range?startDate=${startDate}&endDate=${endDate}`),
    enabled: !!startDate && !!endDate,
  });
}

// ═══════════════════════════════════════════
// MODULE 14: GLOBAL SEARCH
// ═══════════════════════════════════════════
export function useGlobalSearch(query: string) {
  return useQuery<{ patients: Patient[]; appointments: any[]; treatments: Treatment[]; invoices: any[]; labCases: any[] }>({
    queryKey: ["search", query],
    queryFn: () => fetchJson(`${API_BASE}/search?q=${encodeURIComponent(query)}`),
    enabled: query.length > 1,
  });
}

// ═══════════════════════════════════════════
// MODULE 15: SECURITY
// ═══════════════════════════════════════════
export function useSessions() {
  return useQuery<UserSession[]>({
    queryKey: ["sessions"],
    queryFn: () => fetchJson(`${API_BASE}/sessions`),
  });
}
export function useDeleteSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJson(`${API_BASE}/sessions/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessions"] }),
  });
}
export function useChangePassword() {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      fetchJson(`${API_BASE}/auth/change-password`, { method: "POST", body: JSON.stringify(data) }),
  });
}

// ═══════════════════════════════════════════
// MODULE 9: BACKUPS
// ═══════════════════════════════════════════
export function useBackups() {
  return useQuery<Backup[]>({
    queryKey: ["backups"],
    queryFn: () => fetchJson(`${API_BASE}/backups`),
  });
}
export function useCreateBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (type?: string) => fetchJson(`${API_BASE}/backups`, { method: "POST", body: JSON.stringify({ type: type || "manual" }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["backups"] }),
  });
}
export function useDeleteBackup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchJson(`${API_BASE}/backups/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["backups"] }),
  });
}

// ═══════════════════════════════════════════
// MODULE: PRESCRIPTIONS
// ═══════════════════════════════════════════
export function usePrescriptions(patientId: string) {
  return useQuery<(Prescription & { doctorName?: string })[]>({
    queryKey: ["prescriptions", patientId],
    queryFn: () => fetchJson(`${API_BASE}/patients/${patientId}/prescriptions`),
    enabled: !!patientId,
  });
}
export function usePrescription(id: string) {
  return useQuery<Prescription & { items?: PrescriptionItem[]; doctorName?: string }>({
    queryKey: ["prescription", id],
    queryFn: () => fetchJson(`${API_BASE}/prescriptions/${id}`),
    enabled: !!id,
  });
}
export function useCreatePrescription() {
  const qc = useQueryClient();
  return useMutation<Prescription, Error, InsertPrescription>({
    mutationFn: (data) => fetchJson(`${API_BASE}/prescriptions`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prescriptions"] }),
  });
}
export function useUpdatePrescription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertPrescription> }) => fetchJson(`${API_BASE}/prescriptions/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prescriptions"] }),
  });
}
export function useDeletePrescription() {
  const qc = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id) => fetchJson(`${API_BASE}/prescriptions/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prescriptions"] }),
  });
}
export function useAddPrescriptionItem() {
  const qc = useQueryClient();
  return useMutation<PrescriptionItem, Error, { prescriptionId: string; data: InsertPrescriptionItem }>({
    mutationFn: ({ prescriptionId, data }) =>
      fetchJson(`${API_BASE}/prescriptions/${prescriptionId}/items`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["prescriptions"] }),
  });
}
