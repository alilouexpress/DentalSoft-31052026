import { db, pool } from "./db";
import { sql, eq, and, or, gte, lte, desc, asc, like, count, sum, avg, max, isNotNull, isNull } from "drizzle-orm";
import {
  users, type User, type InsertUser,
  patients, type Patient, type InsertPatient,
  doctors, type Doctor, type InsertDoctor,
  appointments, type Appointment, type InsertAppointment,
  treatmentCategories, type TreatmentCategory, type InsertTreatmentCategory,
  treatments, type Treatment, type InsertTreatment,
  staff, type StaffMember, type InsertStaff,
  invoices, type Invoice, type InsertInvoice,
  invoiceItems, type InvoiceItem, type InsertInvoiceItem,
  payments, type Payment, type InsertPayment,
  labCases, type LabCase, type InsertLabCase,
  tasks, type Task, type InsertTask,
  clinicSettings, type ClinicSetting, type InsertClinicSetting,
  statusConfigs, type StatusConfig, type InsertStatusConfig,
  timeSlots, type TimeSlot, type InsertTimeSlot,
  notifications, type Notification, type InsertNotification,
  treatmentPhases, type TreatmentPhase, type InsertTreatmentPhase,
  patientTreatmentProgress, type PatientTreatmentProgress, type InsertPatientTreatmentProgress,
  dentalCharts, type DentalChart, type InsertDentalChart,
  dentalChartEntries, type DentalChartEntry, type InsertDentalChartEntry,
  dentalChartNotes, type DentalChartNote, type InsertDentalChartNote,
  quotations, type Quotation, type InsertQuotation,
  quotationItems, type QuotationItem, type InsertQuotationItem,
  medicalHistory, type MedicalHistoryRecord, type InsertMedicalHistory,
  inventoryProducts, type InventoryProduct, type InsertInventoryProduct,
  inventorySuppliers, type InventorySupplier, type InsertInventorySupplier,
  inventoryMovements, type InventoryMovement, type InsertInventoryMovement,
  purchaseOrders, type PurchaseOrder, type InsertPurchaseOrder,
  purchaseOrderItems, type PurchaseOrderItem, type InsertPurchaseOrderItem,
  expenses, type Expense, type InsertExpense,
  patientDocuments, type PatientDocument, type InsertPatientDocument,
  patientImages, type PatientImage, type InsertPatientImage,
  signatures, type Signature, type InsertSignature,
  auditLogs, type AuditLog, type InsertAuditLog,
  backups, type Backup, type InsertBackup,
  userSessions, type UserSession, type InsertUserSession,
  patientTreatments, type PatientTreatment, type InsertPatientTreatment,
  prescriptions, type Prescription, type InsertPrescription,
  prescriptionItems, type PrescriptionItem, type InsertPrescriptionItem,
  recallReminders, type RecallReminder, type InsertRecallReminder,
  doctorSchedules, type DoctorSchedule, type InsertDoctorSchedule,
  blockedTimes, type BlockedTime, type InsertBlockedTime,
  insuranceClaims, type InsuranceClaim, type InsertInsuranceClaim,
  patientStatistics, type PatientStatistics, type InsertPatientStatistics,
  appointmentTypes, type AppointmentType, type InsertAppointmentType,
  rooms, type Room, type InsertRoom,
} from "@shared/schema";

export interface IStorage {
  // ── Existing ──
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  deleteUser(id: string): Promise<boolean>;
  getPatients(): Promise<Patient[]>;
  getPatient(id: string): Promise<Patient | undefined>;
  getPatientByPatientId(patientId: string): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: string, patient: Partial<InsertPatient>): Promise<Patient | undefined>;
  deletePatient(id: string): Promise<boolean>;
  getDoctors(): Promise<Doctor[]>;
  getDoctor(id: string): Promise<Doctor | undefined>;
  createDoctor(doctor: InsertDoctor): Promise<Doctor>;
  updateDoctor(id: string, doctor: Partial<InsertDoctor>): Promise<Doctor | undefined>;
  deleteDoctor(id: string): Promise<boolean>;
  getAppointments(): Promise<(Appointment & { patientName?: string; doctorName?: string })[]>;
  getAppointmentsByDate(date: Date): Promise<(Appointment & { patientName?: string; doctorName?: string })[]>;
  getAppointment(id: string): Promise<Appointment | undefined>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  updateAppointment(id: string, appointment: Partial<InsertAppointment>): Promise<Appointment | undefined>;
  deleteAppointment(id: string): Promise<boolean>;
  getTreatmentCategories(): Promise<TreatmentCategory[]>;
  createTreatmentCategory(data: InsertTreatmentCategory): Promise<TreatmentCategory>;
  deleteTreatmentCategory(id: string): Promise<boolean>;
  getTreatments(): Promise<(Treatment & { categoryName?: string })[]>;
  getTreatmentsByCategory(categoryId: string): Promise<Treatment[]>;
  createTreatment(data: InsertTreatment): Promise<Treatment>;
  updateTreatment(id: string, data: Partial<InsertTreatment>): Promise<Treatment | undefined>;
  deleteTreatment(id: string): Promise<boolean>;
  getStaff(): Promise<StaffMember[]>;
  createStaff(data: InsertStaff): Promise<StaffMember>;
  updateStaff(id: string, data: Partial<InsertStaff>): Promise<StaffMember | undefined>;
  deleteStaff(id: string): Promise<boolean>;
  syncDoctorFromStaff(member: StaffMember): Promise<void>;
  getInvoices(): Promise<(Invoice & { patientName?: string; remaining?: string; invoiceNumber?: string })[]>;
  getInvoicesByPatient(patientId: string): Promise<(Invoice & { remaining?: string })[]>;
  createInvoice(data: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, data: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: string): Promise<boolean>;
  getPaymentsByInvoice(invoiceId: string): Promise<Payment[]>;
  getPaymentsByPatient(patientId: string): Promise<(Payment & { invoiceAmount?: string })[]>;
  createPayment(data: InsertPayment): Promise<Payment>;
  updatePayment(id: string, data: Partial<InsertPayment>): Promise<Payment | undefined>;
  deletePayment(id: string): Promise<boolean>;
  getPatientDebtSummary(patientId: string): Promise<{ totalInvoiced: string; totalPaid: string; balance: string; lastPaymentDate: string | null; paymentCount: number }>;
  getDebtorsList(): Promise<(Patient & { totalInvoiced: string; totalPaid: string; balance: string; lastPaymentDate: string | null; overdueDays: number; currentPhase?: string; currentPhaseColor?: string; treatmentPercentage: number })[]>;
  getTreatmentPhases(): Promise<TreatmentPhase[]>;
  createTreatmentPhase(data: InsertTreatmentPhase): Promise<TreatmentPhase>;
  deleteTreatmentPhase(id: string): Promise<boolean>;
  getPatientTreatmentProgress(patientId: string): Promise<(PatientTreatmentProgress & { phaseName?: string; phaseColor?: string })[]>;
  upsertPatientTreatmentProgress(data: InsertPatientTreatmentProgress): Promise<PatientTreatmentProgress>;
  getNotifications(): Promise<(Notification & { patientName?: string })[]>;
  getUnreadNotificationCount(): Promise<number>;
  createNotification(data: InsertNotification): Promise<Notification>;
  updateNotification(id: string, data: Partial<InsertNotification>): Promise<Notification | undefined>;
  deleteNotification(id: string): Promise<boolean>;
  autoCreateOverdueNotifications(): Promise<void>;
  getLabCases(): Promise<(LabCase & { patientName?: string; doctorName?: string })[]>;
  createLabCase(data: InsertLabCase): Promise<LabCase>;
  updateLabCase(id: string, data: Partial<InsertLabCase>): Promise<LabCase | undefined>;
  deleteLabCase(id: string): Promise<boolean>;
  getTasks(): Promise<(Task & { assigneeName?: string })[]>;
  createTask(data: InsertTask): Promise<Task>;
  updateTask(id: string, data: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: string): Promise<boolean>;
  getClinicSetting(key: string): Promise<ClinicSetting | undefined>;
  setClinicSetting(key: string, value: any): Promise<ClinicSetting>;
  getStatusConfigs(entityType?: string): Promise<StatusConfig[]>;
  createStatusConfig(data: InsertStatusConfig): Promise<StatusConfig>;
  deleteStatusConfig(id: string): Promise<boolean>;
  getTimeSlots(): Promise<TimeSlot[]>;
  createTimeSlot(data: InsertTimeSlot): Promise<TimeSlot>;
  deleteTimeSlot(id: string): Promise<boolean>;
  getDashboardStats(): Promise<{ totalPatients: number; todayAppointments: number; completedAppointments: number; monthlyRevenue: string }>;
  getMonthlyStats(year: number): Promise<{ month: number; appointments: number; revenue: string }[]>;
  getTreatmentStats(): Promise<{ name: string; count: number; revenue: string }[]>;
  getStatusStats(): Promise<{ status: string; count: number }[]>;

  // ── Module 1: Dashboard Enhancements ──
  getDailyRevenue(): Promise<string>;
  getWeeklyRevenue(): Promise<string>;
  getMonthlyRevenue(): Promise<string>;
  getNetProfit(): Promise<string>;
  getActiveTreatments(): Promise<number>;
  getCriticalAlerts(): Promise<{ id: string; type: string; title: string; severity: string; patientName?: string; createdAt: Date }[]>;
  getRecentActivities(limit?: number): Promise<{ action: string; entityType: string; entityName: string; username: string; createdAt: Date }[]>;
  getDoctorProductivity(doctorId?: string, startDate?: Date, endDate?: Date): Promise<{ id: string; name: string; appointmentCount: number; revenue: string }[]>;
  getUpcomingAppointments(limit?: number): Promise<(Appointment & { patientName?: string; doctorName?: string })[]>;
  getLabAlerts(): Promise<(LabCase & { patientName?: string; overdueDays?: number })[]>;

  // ── Module 2: Dental Chart ──
  getDentalChart(patientId: string): Promise<(DentalChart & { entries?: DentalChartEntry[]; notes?: DentalChartNote[] }) | undefined>;
  createDentalChart(data: InsertDentalChart): Promise<DentalChart>;
  updateDentalChart(id: string, data: Partial<InsertDentalChart>): Promise<DentalChart | undefined>;
  upsertDentalChartEntry(data: InsertDentalChartEntry): Promise<DentalChartEntry>;
  updateDentalChartEntry(id: string, data: Partial<InsertDentalChartEntry>): Promise<DentalChartEntry | undefined>;
  deleteDentalChartEntry(id: string): Promise<boolean>;
  getDentalChartNotes(chartId: string): Promise<DentalChartNote[]>;
  addDentalChartNote(data: InsertDentalChartNote): Promise<DentalChartNote>;

  // ── Module 3: Quotations ──
  getQuotations(): Promise<(Quotation & { patientName?: string; doctorName?: string; itemCount?: number })[]>;
  getQuotation(id: string): Promise<(Quotation & { patientName?: string; doctorName?: string; items?: QuotationItem[] }) | undefined>;
  getQuotationsByPatient(patientId: string): Promise<Quotation[]>;
  createQuotation(data: InsertQuotation): Promise<Quotation>;
  updateQuotation(id: string, data: Partial<InsertQuotation>): Promise<Quotation | undefined>;
  deleteQuotation(id: string): Promise<boolean>;
  approveQuotation(id: string): Promise<Quotation | undefined>;
  convertQuotationToInvoice(quotationId: string): Promise<Invoice | undefined>;
  getQuotationItems(quotationId: string): Promise<QuotationItem[]>;
  addQuotationItem(data: InsertQuotationItem): Promise<QuotationItem>;
  deleteQuotationItem(id: string): Promise<boolean>;

  // ── Module 4: Medical History ──
  getMedicalHistory(patientId: string): Promise<MedicalHistoryRecord[]>;
  getMedicalHistoryByCategory(patientId: string, category: string): Promise<MedicalHistoryRecord[]>;
  getMedicalSummary(patientId: string): Promise<{ category: string; items: { value: string; severity?: string; isCurrent: boolean }[] }[]>;
  createMedicalHistory(data: InsertMedicalHistory): Promise<MedicalHistoryRecord>;
  updateMedicalHistory(id: string, data: Partial<InsertMedicalHistory>): Promise<MedicalHistoryRecord | undefined>;
  deleteMedicalHistory(id: string): Promise<boolean>;
  batchCreateMedicalHistory(patientId: string, records: InsertMedicalHistory[]): Promise<MedicalHistoryRecord[]>;

  // ── Module 5: Inventory ──
  getInventoryProducts(): Promise<InventoryProduct[]>;
  getInventoryProduct(id: string): Promise<InventoryProduct | undefined>;
  createInventoryProduct(data: InsertInventoryProduct): Promise<InventoryProduct>;
  updateInventoryProduct(id: string, data: Partial<InsertInventoryProduct>): Promise<InventoryProduct | undefined>;
  deleteInventoryProduct(id: string): Promise<boolean>;
  getLowStockProducts(): Promise<InventoryProduct[]>;
  getExpiringProducts(): Promise<InventoryProduct[]>;
  adjustStock(productId: string, quantity: number, type: string, performedBy?: string, notes?: string): Promise<InventoryProduct>;
  getInventorySuppliers(): Promise<InventorySupplier[]>;
  createInventorySupplier(data: InsertInventorySupplier): Promise<InventorySupplier>;
  updateInventorySupplier(id: string, data: Partial<InsertInventorySupplier>): Promise<InventorySupplier | undefined>;
  deleteInventorySupplier(id: string): Promise<boolean>;
  getPurchaseOrders(): Promise<(PurchaseOrder & { supplierName?: string; itemCount?: number })[]>;
  createPurchaseOrder(data: InsertPurchaseOrder): Promise<PurchaseOrder>;
  updatePurchaseOrder(id: string, data: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined>;
  getPurchaseOrderItems(orderId: string): Promise<(PurchaseOrderItem & { productName?: string })[]>;
  addPurchaseOrderItem(data: InsertPurchaseOrderItem): Promise<PurchaseOrderItem>;
  getInventoryMovements(productId: string): Promise<InventoryMovement[]>;

  // ── Module 6: Expenses ──
  getExpenses(): Promise<Expense[]>;
  getExpensesByDateRange(startDate: Date, endDate: Date): Promise<Expense[]>;
  getExpenseCategories(): Promise<string[]>;
  getExpenseSummary(startDate: Date, endDate: Date): Promise<{ total: string; byCategory: { category: string; amount: string }[] }>;
  createExpense(data: InsertExpense): Promise<Expense>;
  updateExpense(id: string, data: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: string): Promise<boolean>;

  // ── Module 7: Patient Documents ──
  getPatientDocuments(patientId: string): Promise<PatientDocument[]>;
  createPatientDocument(data: InsertPatientDocument): Promise<PatientDocument>;
  deletePatientDocument(id: string): Promise<boolean>;
  getPatientDocument(id: string): Promise<PatientDocument | undefined>;

  // ── Module 8A: Patient Images ──
  getPatientImages(patientId: string, filters?: { tooth?: string; type?: string; tag?: string; dentistId?: string; dateFrom?: string; dateTo?: string }): Promise<(PatientImage & { dentistName?: string })[]>;
  getPatientImage(id: string): Promise<PatientImage | undefined>;
  createPatientImage(data: InsertPatientImage): Promise<PatientImage>;
  updatePatientImage(id: string, data: Partial<InsertPatientImage>): Promise<PatientImage | undefined>;
  deletePatientImage(id: string): Promise<boolean>;

  // ── Module 8: Signatures ──
  createSignature(data: InsertSignature): Promise<Signature>;
  getSignaturesByDocument(documentType: string, documentId: string): Promise<Signature[]>;

  // ── Module 9: Backups ──
  createBackupEntry(data: InsertBackup): Promise<Backup>;
  getBackups(): Promise<Backup[]>;

  // ── Module 10: Audit Logs ──
  createAuditLog(data: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(limit?: number, offset?: number): Promise<AuditLog[]>;
  getAuditLogsByEntity(entityType: string, entityId: string): Promise<AuditLog[]>;
  getAuditLogsByUser(userId: string): Promise<AuditLog[]>;

  // ── Module 11: Advanced Scheduling ──
  getAppointmentsByDateRange(startDate: Date, endDate: Date): Promise<(Appointment & { patientName?: string; doctorName?: string })[]>;

  // ── Module 14: Global Search ──
  globalSearch(query: string): Promise<{ patients: Patient[]; appointments: (Appointment & { patientName?: string })[]; treatments: Treatment[]; invoices: (Invoice & { patientName?: string })[]; labCases: (LabCase & { patientName?: string })[] }>;

  // ── Module 15: Security ──
  updateUserLastLogin(id: string): Promise<void>;
  getUserSessions(userId: string): Promise<UserSession[]>;
  createUserSession(data: InsertUserSession): Promise<UserSession>;
  deleteUserSession(id: string): Promise<boolean>;
  getInvoice(id: string): Promise<Invoice | undefined>;
  getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]>;
  createInvoiceItem(data: InsertInvoiceItem): Promise<InvoiceItem>;
  deleteInvoiceItems(invoiceId: string): Promise<void>;
  getInvoiceDetail(id: string): Promise<(Invoice & { patient: Patient | null; payments: Payment[]; items: InvoiceItem[] }) | undefined>;

  // ── PDF ──
  getInvoiceForPrint(id: string): Promise<(Invoice & { patientName?: string; patient: Patient | null; payments: Payment[] }) | undefined>;

  // ── New Modules: Patient Treatments ──
  getPatientTreatments(patientId: string): Promise<(PatientTreatment & { treatmentName?: string; doctorName?: string })[]>;
  createPatientTreatment(data: InsertPatientTreatment): Promise<PatientTreatment>;
  updatePatientTreatment(id: string, data: Partial<InsertPatientTreatment>): Promise<PatientTreatment | undefined>;
  deletePatientTreatment(id: string): Promise<boolean>;

  // ── New Modules: Prescriptions ──
  getPrescriptions(patientId: string): Promise<(Prescription & { doctorName?: string })[]>;
  getPrescription(id: string): Promise<(Prescription & { items?: PrescriptionItem[]; doctorName?: string }) | undefined>;
  createPrescription(data: InsertPrescription): Promise<Prescription>;
  updatePrescription(id: string, data: Partial<InsertPrescription>): Promise<Prescription | undefined>;
  deletePrescription(id: string): Promise<boolean>;
  addPrescriptionItem(data: InsertPrescriptionItem): Promise<PrescriptionItem>;

  // ── New Modules: Recall Reminders ──
  getRecallReminders(patientId?: string): Promise<(RecallReminder & { patientName?: string })[]>;
  createRecallReminder(data: InsertRecallReminder): Promise<RecallReminder>;
  updateRecallReminder(id: string, data: Partial<InsertRecallReminder>): Promise<RecallReminder | undefined>;
  deleteRecallReminder(id: string): Promise<boolean>;

  // ── New Modules: Doctor Schedules ──
  getDoctorSchedules(doctorId: string): Promise<DoctorSchedule[]>;
  createDoctorSchedule(data: InsertDoctorSchedule): Promise<DoctorSchedule>;
  updateDoctorSchedule(id: string, data: Partial<InsertDoctorSchedule>): Promise<DoctorSchedule | undefined>;
  deleteDoctorSchedule(id: string): Promise<boolean>;

  // ── New Modules: Blocked Times ──
  getBlockedTimes(doctorId: string, startDate?: Date, endDate?: Date): Promise<BlockedTime[]>;
  createBlockedTime(data: InsertBlockedTime): Promise<BlockedTime>;
  deleteBlockedTime(id: string): Promise<boolean>;

  // ── New Modules: Insurance Claims ──
  getInsuranceClaims(patientId?: string): Promise<(InsuranceClaim & { patientName?: string })[]>;
  createInsuranceClaim(data: InsertInsuranceClaim): Promise<InsuranceClaim>;
  updateInsuranceClaim(id: string, data: Partial<InsertInsuranceClaim>): Promise<InsuranceClaim | undefined>;
  deleteInsuranceClaim(id: string): Promise<boolean>;

  // ── New Modules: Patient Statistics ──
  getPatientStatistics(patientId: string): Promise<PatientStatistics | undefined>;
  upsertPatientStatistics(patientId: string, data: Partial<InsertPatientStatistics>): Promise<PatientStatistics>;

  // ── New Modules: Appointment Types ──
  getAppointmentTypes(): Promise<AppointmentType[]>;
  createAppointmentType(data: InsertAppointmentType): Promise<AppointmentType>;
  updateAppointmentType(id: string, data: Partial<InsertAppointmentType>): Promise<AppointmentType | undefined>;
  deleteAppointmentType(id: string): Promise<boolean>;

  // ── New Modules: Rooms ──
  getRooms(): Promise<Room[]>;
  createRoom(data: InsertRoom): Promise<Room>;
  updateRoom(id: string, data: Partial<InsertRoom>): Promise<Room | undefined>;
  deleteRoom(id: string): Promise<boolean>;
}

class DatabaseStorage implements IStorage {
  // ════════════════════════════════════════════
  // EXISTING METHODS (preserved)
  // ════════════════════════════════════════════
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  async getUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.username);
  }
  async deleteUser(id: string): Promise<boolean> {
    const [deleted] = await db.delete(users).where(eq(users.id, id)).returning();
    return !!deleted;
  }
  async getPatients(): Promise<Patient[]> {
    return await db.select().from(patients).orderBy(desc(patients.createdAt));
  }
  async getPatient(id: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient || undefined;
  }
  async getPatientByPatientId(patientId: string): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.patientId, patientId));
    return patient || undefined;
  }
  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const result = await pool.query("SELECT nextval('patient_id_seq') AS seq");
    const seq = result.rows[0].seq;
    const patientId = `P-${String(seq).padStart(3, "0")}`;
    const [patient] = await db.insert(patients).values({ ...insertPatient, patientId }).returning();
    return patient;
  }
  async updatePatient(id: string, patient: Partial<InsertPatient>): Promise<Patient | undefined> {
    const [updated] = await db.update(patients).set(patient).where(eq(patients.id, id)).returning();
    return updated || undefined;
  }
  async deletePatient(id: string): Promise<boolean> {
    return db.transaction(async (tx) => {
      const patientInvoices = await tx.select({ id: invoices.id }).from(invoices).where(eq(invoices.patientId, id));
      for (const inv of patientInvoices) {
        await tx.delete(payments).where(eq(payments.invoiceId, inv.id));
      }
      await tx.delete(appointments).where(eq(appointments.patientId, id));
      await tx.delete(invoices).where(eq(invoices.patientId, id));
      await tx.delete(labCases).where(eq(labCases.patientId, id));
      const result = await tx.delete(patients).where(eq(patients.id, id));
      return (result.rowCount ?? 0) > 0;
    });
  }
  async getDoctors(): Promise<Doctor[]> {
    return await db.select().from(doctors).orderBy(doctors.name);
  }
  async getDoctor(id: string): Promise<Doctor | undefined> {
    const [doctor] = await db.select().from(doctors).where(eq(doctors.id, id));
    return doctor || undefined;
  }
  async createDoctor(insertDoctor: InsertDoctor): Promise<Doctor> {
    const [doctor] = await db.insert(doctors).values(insertDoctor).returning();
    return doctor;
  }
  async updateDoctor(id: string, data: Partial<InsertDoctor>): Promise<Doctor | undefined> {
    const [updated] = await db.update(doctors).set(data).where(eq(doctors.id, id)).returning();
    return updated || undefined;
  }
  async deleteDoctor(id: string): Promise<boolean> {
    return db.transaction(async (tx) => {
      await tx.delete(appointments).where(eq(appointments.doctorId, id));
      await tx.delete(labCases).where(eq(labCases.doctorId, id));
      const result = await tx.delete(doctors).where(eq(doctors.id, id));
      return (result.rowCount ?? 0) > 0;
    });
  }
  async getAppointments(): Promise<(Appointment & { patientName?: string; doctorName?: string })[]> {
    const results = await db.select({
      id: appointments.id, patientId: appointments.patientId, doctorId: appointments.doctorId,
      appointmentDate: appointments.appointmentDate, duration: appointments.duration,
      type: appointments.type, status: appointments.status, color: appointments.color,
      room: appointments.room, notes: appointments.notes, createdAt: appointments.createdAt,
      patientName: patients.name, doctorName: doctors.name,
      doctorColor: doctors.color,
    }).from(appointments).leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id)).orderBy(appointments.appointmentDate);
    return results.map((r: any) => ({ ...r, patientName: r.patientName ?? undefined, doctorName: r.doctorName ?? undefined }));
  }
  async getAppointmentsByDate(date: Date): Promise<(Appointment & { patientName?: string; doctorName?: string })[]> {
    const startOfDay = new Date(date); startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date); endOfDay.setHours(23, 59, 59, 999);
    const results = await db.select({
      id: appointments.id, patientId: appointments.patientId, doctorId: appointments.doctorId,
      appointmentDate: appointments.appointmentDate, duration: appointments.duration,
      type: appointments.type, status: appointments.status, color: appointments.color,
      room: appointments.room, notes: appointments.notes, createdAt: appointments.createdAt,
      patientName: patients.name, doctorName: doctors.name,
      doctorColor: doctors.color,
    }).from(appointments).leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .where(and(gte(appointments.appointmentDate, startOfDay), lte(appointments.appointmentDate, endOfDay)))
      .orderBy(appointments.appointmentDate);
    return results.map((r: any) => ({ ...r, patientName: r.patientName ?? undefined, doctorName: r.doctorName ?? undefined }));
  }
  async getAppointment(id: string): Promise<Appointment | undefined> {
    const [appointment] = await db.select().from(appointments).where(eq(appointments.id, id));
    return appointment || undefined;
  }
  async createAppointment(insertAppointment: InsertAppointment): Promise<Appointment> {
    const [appointment] = await db.insert(appointments).values(insertAppointment).returning();
    return appointment;
  }
  async updateAppointment(id: string, updateData: Partial<InsertAppointment>): Promise<Appointment | undefined> {
    const [appointment] = await db.update(appointments).set(updateData).where(eq(appointments.id, id)).returning();
    return appointment || undefined;
  }
  async deleteAppointment(id: string): Promise<boolean> {
    const result = await db.delete(appointments).where(eq(appointments.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  async getTreatmentCategories(): Promise<TreatmentCategory[]> {
    return await db.select().from(treatmentCategories).orderBy(treatmentCategories.sortOrder);
  }
  async createTreatmentCategory(data: InsertTreatmentCategory): Promise<TreatmentCategory> {
    const [category] = await db.insert(treatmentCategories).values(data).returning();
    return category;
  }
  async deleteTreatmentCategory(id: string): Promise<boolean> {
    return db.transaction(async (tx) => {
      await tx.delete(treatments).where(eq(treatments.categoryId, id));
      const result = await tx.delete(treatmentCategories).where(eq(treatmentCategories.id, id));
      return (result.rowCount ?? 0) > 0;
    });
  }
  async getTreatments(): Promise<(Treatment & { categoryName?: string })[]> {
    const results = await db.select({
      id: treatments.id, categoryId: treatments.categoryId, name: treatments.name,
      duration: treatments.duration, description: treatments.description, price: treatments.price,
      isActive: treatments.isActive, sortOrder: treatments.sortOrder, createdAt: treatments.createdAt,
      toothNumber: treatments.toothNumber, dentistId: treatments.dentistId, assistantId: treatments.assistantId, status: treatments.status, notes: treatments.notes,
      categoryName: treatmentCategories.name,
    }).from(treatments).leftJoin(treatmentCategories, eq(treatments.categoryId, treatmentCategories.id)).orderBy(treatments.sortOrder);
    return results.map((r: any) => ({ ...r, categoryName: r.categoryName ?? undefined }));
  }
  async getTreatmentsByCategory(categoryId: string): Promise<Treatment[]> {
    return await db.select().from(treatments).where(eq(treatments.categoryId, categoryId)).orderBy(treatments.sortOrder);
  }
  async createTreatment(data: InsertTreatment): Promise<Treatment> {
    const [treatment] = await db.insert(treatments).values(data).returning();
    return treatment;
  }
  async updateTreatment(id: string, data: Partial<InsertTreatment>): Promise<Treatment | undefined> {
    const [updated] = await db.update(treatments).set(data).where(eq(treatments.id, id)).returning();
    return updated || undefined;
  }
  async deleteTreatment(id: string): Promise<boolean> {
    const result = await db.delete(treatments).where(eq(treatments.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  async getStaff(): Promise<StaffMember[]> {
    return await db.select().from(staff).orderBy(staff.name);
  }
  async createStaff(data: InsertStaff): Promise<StaffMember> {
    return db.transaction(async (tx) => {
      const [member] = await tx.insert(staff).values(data).returning();
      await this.syncDoctorFromStaffTx(tx, member);
      return member;
    });
  }
  async updateStaff(id: string, data: Partial<InsertStaff>): Promise<StaffMember | undefined> {
    return db.transaction(async (tx) => {
      const [updated] = await tx.update(staff).set(data).where(eq(staff.id, id)).returning();
      if (updated) await this.syncDoctorFromStaffTx(tx, updated);
      return updated || undefined;
    });
  }
  async deleteStaff(id: string): Promise<boolean> {
    return db.transaction(async (tx) => {
      await tx.delete(doctors).where(eq(doctors.staffId, id));
      const result = await tx.delete(staff).where(eq(staff.id, id));
      return (result.rowCount ?? 0) > 0;
    });
  }
  async syncDoctorFromStaff(member: StaffMember): Promise<void> {
    await this.syncDoctorFromStaffTx(db, member);
  }
  private async syncDoctorFromStaffTx(tx: any, member: StaffMember): Promise<void> {
    const isDoctor = member.role === "Doctor" || member.role === "Admin";
    const existing = await tx.select().from(doctors).where(eq(doctors.staffId, member.id)).limit(1);
    if (isDoctor) {
      const doctorData = {
        name: member.name, specialization: member.specialization || null,
        email: member.email || null, phone: member.phone || null, staffId: member.id,
      };
      if (existing.length > 0) {
        await tx.update(doctors).set(doctorData).where(eq(doctors.id, existing[0].id));
      } else {
        await tx.insert(doctors).values(doctorData);
      }
    } else if (existing.length > 0) {
      await tx.update(doctors).set({ staffId: null }).where(eq(doctors.id, existing[0].id));
    }
  }
  async getInvoices(): Promise<(Invoice & { patientName?: string; remaining?: string; invoiceNumber?: string })[]> {
    const results = await db.select({
      id: invoices.id, patientId: invoices.patientId, invoiceNumber: invoices.invoiceNumber,
      amount: invoices.amount, paidAmount: invoices.paidAmount, doctorId: invoices.doctorId,
      date: invoices.date, dueDate: invoices.dueDate, status: invoices.status,
      notes: invoices.notes, createdAt: invoices.createdAt,
      patientName: patients.name,
    }).from(invoices).leftJoin(patients, eq(invoices.patientId, patients.id)).orderBy(desc(invoices.date));
    return results.map((r: any) => ({
      ...r, patientName: r.patientName ?? undefined,
      remaining: (parseFloat(r.amount) - parseFloat(r.paidAmount || "0.00")).toFixed(2),
    }));
  }
  async getInvoicesByPatient(patientId: string): Promise<(Invoice & { remaining?: string })[]> {
    const results = await db.select().from(invoices).where(eq(invoices.patientId, patientId)).orderBy(desc(invoices.date));
    return results.map((r: any) => ({
      ...r,
      remaining: (parseFloat(r.amount) - parseFloat(r.paidAmount || "0.00")).toFixed(2),
    }));
  }
  async createInvoice(data: InsertInvoice): Promise<Invoice> {
    const result = await pool.query("SELECT nextval('invoice_number_seq') AS seq");
    const seq = result.rows[0].seq;
    const invoiceNumber = `INV-${seq}`;
    const [invoice] = await db.insert(invoices).values({ ...data, invoiceNumber }).returning();
    return invoice;
  }
  async updateInvoice(id: string, data: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const [updated] = await db.update(invoices).set(data).where(eq(invoices.id, id)).returning();
    return updated || undefined;
  }
  async deleteInvoice(id: string): Promise<boolean> {
    return db.transaction(async (tx) => {
      await tx.delete(payments).where(eq(payments.invoiceId, id));
      const result = await tx.delete(invoices).where(eq(invoices.id, id));
      return (result.rowCount ?? 0) > 0;
    });
  }
  async getInvoice(id: string): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice || undefined;
  }
  async getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
    return await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId)).orderBy(asc(invoiceItems.createdAt));
  }
  async createInvoiceItem(data: InsertInvoiceItem): Promise<InvoiceItem> {
    const [item] = await db.insert(invoiceItems).values(data).returning();
    return item;
  }
  async deleteInvoiceItems(invoiceId: string): Promise<void> {
    await db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
  }
  async getInvoiceDetail(id: string): Promise<(Invoice & { patient: Patient | null; payments: Payment[]; items: InvoiceItem[] }) | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    if (!invoice) return undefined;
    const patientResult = invoice.patientId
      ? await db.select().from(patients).where(eq(patients.id, invoice.patientId)).limit(1)
      : [];
    const paymentResults = await db.select().from(payments).where(eq(payments.invoiceId, id)).orderBy(desc(payments.paymentDate));
    const itemResults = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id)).orderBy(asc(invoiceItems.createdAt));
    return { ...invoice, patient: patientResult[0] || null, payments: paymentResults, items: itemResults };
  }
  async getPaymentsByInvoice(invoiceId: string): Promise<Payment[]> {
    return await db.select().from(payments).where(eq(payments.invoiceId, invoiceId)).orderBy(desc(payments.paymentDate));
  }
  async getPaymentsByPatient(patientId: string): Promise<(Payment & { invoiceAmount?: string })[]> {
    const results = await db.select({
      id: payments.id, invoiceId: payments.invoiceId, amount: payments.amount,
      paymentDate: payments.paymentDate, paymentMethod: payments.paymentMethod,
      notes: payments.notes, receivedBy: payments.receivedBy, createdAt: payments.createdAt,
      invoiceAmount: invoices.amount,
    }).from(payments).innerJoin(invoices, eq(payments.invoiceId, invoices.id))
      .where(eq(invoices.patientId, patientId)).orderBy(desc(payments.paymentDate));
    return results.map((r: any) => ({ ...r, invoiceAmount: r.invoiceAmount ?? undefined }));
  }
  async createPayment(data: InsertPayment): Promise<Payment> {
    return db.transaction(async (tx) => {
      const [invoice] = await tx.select().from(invoices).where(eq(invoices.id, data.invoiceId)).limit(1);
      if (!invoice) throw new Error("Invoice not found");
      const existingPayments = await tx.select({ amount: payments.amount }).from(payments).where(eq(payments.invoiceId, data.invoiceId));
      const totalPaid = existingPayments.reduce((s, p) => s + parseFloat(p.amount), 0);
      const newTotal = totalPaid + parseFloat(data.amount);
      if (newTotal > parseFloat(invoice.amount)) throw new Error("Le paiement total dépasse le montant de la facture");
      const [payment] = await tx.insert(payments).values(data).returning();
      const updatedTotal = newTotal;
      await tx.update(invoices).set({ paidAmount: updatedTotal.toFixed(2) }).where(eq(invoices.id, data.invoiceId));
      return payment;
    });
  }
  async updatePayment(id: string, data: Partial<InsertPayment>): Promise<Payment | undefined> {
    return db.transaction(async (tx) => {
      const [payment] = await tx.update(payments).set(data).where(eq(payments.id, id)).returning();
      if (!payment) return undefined;
      const allPayments = await tx.select({ amount: payments.amount }).from(payments).where(eq(payments.invoiceId, payment.invoiceId));
      const totalPaid = allPayments.reduce((s, p) => s + parseFloat(p.amount), 0);
      await tx.update(invoices).set({ paidAmount: totalPaid.toFixed(2) }).where(eq(invoices.id, payment.invoiceId));
      return payment;
    });
  }
  async deletePayment(id: string): Promise<boolean> {
    return db.transaction(async (tx) => {
      const [payment] = await tx.select().from(payments).where(eq(payments.id, id));
      if (!payment) return false;
      await tx.delete(payments).where(eq(payments.id, id));
      const allPayments = await tx.select({ amount: payments.amount }).from(payments).where(eq(payments.invoiceId, payment.invoiceId));
      const totalPaid = allPayments.reduce((s, p) => s + parseFloat(p.amount), 0);
      await tx.update(invoices).set({ paidAmount: totalPaid.toFixed(2) }).where(eq(invoices.id, payment.invoiceId));
      return true;
    });
  }
  async getPatientDebtSummary(patientId: string): Promise<{ totalInvoiced: string; totalPaid: string; balance: string; lastPaymentDate: string | null; paymentCount: number }> {
    const patientInvoices = await this.getInvoicesByPatient(patientId);
    const totalInvoiced = patientInvoices.reduce((s, inv) => s + parseFloat(inv.amount), 0).toFixed(2);
    const totalPaid = patientInvoices.reduce((s, inv) => s + parseFloat(inv.paidAmount || "0.00"), 0).toFixed(2);
    const balance = (parseFloat(totalInvoiced) - parseFloat(totalPaid)).toFixed(2);
    const [lastPayment] = await db.select({ paymentDate: payments.paymentDate }).from(payments)
      .innerJoin(invoices, eq(payments.invoiceId, invoices.id))
      .where(eq(invoices.patientId, patientId)).orderBy(desc(payments.paymentDate)).limit(1);
    const [cnt] = await db.select({ count: sql<number>`count(*)` }).from(payments)
      .innerJoin(invoices, eq(payments.invoiceId, invoices.id)).where(eq(invoices.patientId, patientId));
    return {
      totalInvoiced, totalPaid, balance,
      lastPaymentDate: lastPayment?.paymentDate?.toISOString() || null,
      paymentCount: Number(cnt?.count || 0),
    };
  }
  async getDebtorsList(): Promise<any[]> {
    const allPatients = await this.getPatients();
    const result = [];
    for (const patient of allPatients) {
      const summary = await this.getPatientDebtSummary(patient.id);
      const balance = parseFloat(summary.balance);
      if (balance <= 0) continue;
      let overdueDays = 0;
      const patientInvs = await this.getInvoicesByPatient(patient.id);
      const now = new Date();
      for (const inv of patientInvs) {
        if (inv.dueDate && new Date(inv.dueDate) < now && parseFloat(inv.amount) > parseFloat(inv.paidAmount || "0.00")) {
          const diff = Math.floor((now.getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24));
          if (diff > overdueDays) overdueDays = diff;
        }
      }
      let currentPhase, currentPhaseColor, treatmentPercentage = 0;
      const [progress] = await db.select({
        phaseName: treatmentPhases.name,
        phaseColor: treatmentPhases.colorClass,
        percentage: patientTreatmentProgress.percentage,
      }).from(patientTreatmentProgress).leftJoin(treatmentPhases, eq(patientTreatmentProgress.phaseId, treatmentPhases.id))
        .where(and(eq(patientTreatmentProgress.patientId, patient.id), eq(patientTreatmentProgress.isCurrent, true))).limit(1);
      if (progress) { currentPhase = progress.phaseName ?? undefined; currentPhaseColor = progress.phaseColor ?? undefined; treatmentPercentage = progress.percentage; }
      else {
        const lastProgress = await db.select({
          phaseName: treatmentPhases.name, phaseColor: treatmentPhases.colorClass,
          percentage: patientTreatmentProgress.percentage,
        }).from(patientTreatmentProgress).leftJoin(treatmentPhases, eq(patientTreatmentProgress.phaseId, treatmentPhases.id))
          .where(eq(patientTreatmentProgress.patientId, patient.id)).orderBy(desc(treatmentPhases.sortOrder)).limit(1);
        if (lastProgress.length > 0) { currentPhase = lastProgress[0].phaseName ?? undefined; currentPhaseColor = lastProgress[0].phaseColor ?? undefined; treatmentPercentage = lastProgress[0].percentage; }
      }
      result.push({ ...patient, totalInvoiced: summary.totalInvoiced, totalPaid: summary.totalPaid, balance: summary.balance, lastPaymentDate: summary.lastPaymentDate, overdueDays, currentPhase, currentPhaseColor, treatmentPercentage });
    }
    return result.sort((a, b) => parseFloat(b.balance) - parseFloat(a.balance));
  }
  async getTreatmentPhases(): Promise<TreatmentPhase[]> { return db.select().from(treatmentPhases).orderBy(treatmentPhases.sortOrder); }
  async createTreatmentPhase(data: InsertTreatmentPhase): Promise<TreatmentPhase> { const [phase] = await db.insert(treatmentPhases).values(data).returning(); return phase; }
  async deleteTreatmentPhase(id: string): Promise<boolean> { const result = await db.delete(treatmentPhases).where(eq(treatmentPhases.id, id)); return (result.rowCount ?? 0) > 0; }
  async getPatientTreatmentProgress(patientId: string): Promise<(PatientTreatmentProgress & { phaseName?: string; phaseColor?: string })[]> {
    const results = await db.select({
      id: patientTreatmentProgress.id, patientId: patientTreatmentProgress.patientId, phaseId: patientTreatmentProgress.phaseId,
      percentage: patientTreatmentProgress.percentage, isCurrent: patientTreatmentProgress.isCurrent,
      startedAt: patientTreatmentProgress.startedAt, completedAt: patientTreatmentProgress.completedAt,
      phaseName: treatmentPhases.name, phaseColor: treatmentPhases.colorClass,
    }).from(patientTreatmentProgress).leftJoin(treatmentPhases, eq(patientTreatmentProgress.phaseId, treatmentPhases.id))
      .where(eq(patientTreatmentProgress.patientId, patientId)).orderBy(treatmentPhases.sortOrder);
    return results.map((r: any) => ({ ...r, phaseName: r.phaseName ?? undefined, phaseColor: r.phaseColor ?? undefined }));
  }
  async upsertPatientTreatmentProgress(data: InsertPatientTreatmentProgress): Promise<PatientTreatmentProgress> {
    const existing = await db.select().from(patientTreatmentProgress)
      .where(and(eq(patientTreatmentProgress.patientId, data.patientId), eq(patientTreatmentProgress.phaseId, data.phaseId))).limit(1);
    if (existing.length > 0) { const [progress] = await db.update(patientTreatmentProgress).set(data).where(eq(patientTreatmentProgress.id, existing[0].id)).returning(); return progress; }
    const [progress] = await db.insert(patientTreatmentProgress).values(data).returning(); return progress;
  }
  async getNotifications(): Promise<(Notification & { patientName?: string })[]> {
    const results = await db.select({
      id: notifications.id, patientId: notifications.patientId, invoiceId: notifications.invoiceId,
      type: notifications.type, severity: notifications.severity, title: notifications.title,
      description: notifications.description, status: notifications.status, isRead: notifications.isRead,
      createdBy: notifications.createdBy, createdAt: notifications.createdAt, updatedAt: notifications.updatedAt,
      patientName: patients.name,
    }).from(notifications).leftJoin(patients, eq(notifications.patientId, patients.id)).orderBy(desc(notifications.createdAt));
    return results.map((r: any) => ({ ...r, patientName: r.patientName ?? undefined }));
  }
  async getUnreadNotificationCount(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(notifications).where(eq(notifications.isRead, false));
    return Number(result?.count || 0);
  }
  async createNotification(data: InsertNotification): Promise<Notification> { const [notification] = await db.insert(notifications).values(data).returning(); return notification; }
  async updateNotification(id: string, data: Partial<InsertNotification>): Promise<Notification | undefined> {
    const [notification] = await db.update(notifications).set({ ...data, updatedAt: new Date() }).where(eq(notifications.id, id)).returning();
    return notification || undefined;
  }
  async deleteNotification(id: string): Promise<boolean> { const result = await db.delete(notifications).where(eq(notifications.id, id)); return (result.rowCount ?? 0) > 0; }
  async autoCreateOverdueNotifications(): Promise<void> {
    const debtors = await this.getDebtorsList();
    for (const debtor of debtors) {
      if (debtor.overdueDays <= 0) continue;
      const [existing] = await db.select({ count: sql<number>`count(*)` }).from(notifications)
        .where(and(eq(notifications.patientId, debtor.id), eq(notifications.type, "overdue"), eq(notifications.status, "active")));
      if (Number(existing?.count || 0) > 0) continue;
      let severity = "minor", title = `Paiement en retard - ${debtor.name}`;
      if (debtor.overdueDays > 90) { severity = "critical"; title = `Dette critique - ${debtor.name}`; }
      else if (debtor.overdueDays > 30) { severity = "major"; title = `Dette importante - ${debtor.name}`; }
      else if (debtor.overdueDays > 7) { severity = "neutral"; title = `Paiement en retard - ${debtor.name}`; }
      await this.createNotification({
        patientId: debtor.id, type: "overdue", severity, title,
        description: `Solde impayé: ${debtor.balance} DZD. Retard de ${debtor.overdueDays} jours.`,
        status: "active", isRead: false, createdBy: "system",
      });
    }
  }
  async getLabCases(): Promise<(LabCase & { patientName?: string; doctorName?: string })[]> {
    const results = await db.select({
      id: labCases.id, patientId: labCases.patientId, doctorId: labCases.doctorId,
      labName: labCases.labName, type: labCases.type, status: labCases.status,
      dueDate: labCases.dueDate, description: labCases.description, cost: labCases.cost,
      createdAt: labCases.createdAt,
      patientName: patients.name, doctorName: doctors.name,
    }).from(labCases).leftJoin(patients, eq(labCases.patientId, patients.id))
      .leftJoin(doctors, eq(labCases.doctorId, doctors.id)).orderBy(desc(labCases.createdAt));
    return results.map((r: any) => ({ ...r, patientName: r.patientName ?? undefined, doctorName: r.doctorName ?? undefined }));
  }
  async createLabCase(data: InsertLabCase): Promise<LabCase> { const [labCase] = await db.insert(labCases).values(data).returning(); return labCase; }
  async updateLabCase(id: string, data: Partial<InsertLabCase>): Promise<LabCase | undefined> {
    const [updated] = await db.update(labCases).set(data).where(eq(labCases.id, id)).returning(); return updated || undefined;
  }
  async deleteLabCase(id: string): Promise<boolean> { const result = await db.delete(labCases).where(eq(labCases.id, id)); return (result.rowCount ?? 0) > 0; }
  async getTasks(): Promise<(Task & { assigneeName?: string })[]> {
    const results = await db.select({
      id: tasks.id, title: tasks.title, assigneeId: tasks.assigneeId, priority: tasks.priority,
      dueDate: tasks.dueDate, status: tasks.status, description: tasks.description, createdAt: tasks.createdAt,
      assigneeName: staff.name,
    }).from(tasks).leftJoin(staff, eq(tasks.assigneeId, staff.id)).orderBy(desc(tasks.createdAt));
    return results.map((r: any) => ({ ...r, assigneeName: r.assigneeName ?? undefined }));
  }
  async createTask(data: InsertTask): Promise<Task> { const [task] = await db.insert(tasks).values(data).returning(); return task; }
  async updateTask(id: string, data: Partial<InsertTask>): Promise<Task | undefined> {
    const [updated] = await db.update(tasks).set(data).where(eq(tasks.id, id)).returning(); return updated || undefined;
  }
  async deleteTask(id: string): Promise<boolean> { const result = await db.delete(tasks).where(eq(tasks.id, id)); return (result.rowCount ?? 0) > 0; }
  async getClinicSetting(key: string): Promise<ClinicSetting | undefined> {
    const [setting] = await db.select().from(clinicSettings).where(eq(clinicSettings.key, key)); return setting || undefined;
  }
  async setClinicSetting(key: string, value: any): Promise<ClinicSetting> {
    const [setting] = await db.insert(clinicSettings).values({ key, value }).onConflictDoUpdate({ target: clinicSettings.key, set: { value } }).returning();
    return setting;
  }
  async getStatusConfigs(entityType?: string): Promise<StatusConfig[]> {
    if (entityType) return await db.select().from(statusConfigs).where(eq(statusConfigs.entityType, entityType)).orderBy(statusConfigs.sortOrder);
    return await db.select().from(statusConfigs).orderBy(statusConfigs.sortOrder);
  }
  async createStatusConfig(data: InsertStatusConfig): Promise<StatusConfig> { const [config] = await db.insert(statusConfigs).values(data).returning(); return config; }
  async deleteStatusConfig(id: string): Promise<boolean> { const result = await db.delete(statusConfigs).where(eq(statusConfigs.id, id)); return (result.rowCount ?? 0) > 0; }
  async getTimeSlots(): Promise<TimeSlot[]> { return await db.select().from(timeSlots).where(eq(timeSlots.isActive, true)).orderBy(timeSlots.sortOrder); }
  async createTimeSlot(data: InsertTimeSlot): Promise<TimeSlot> { const [slot] = await db.insert(timeSlots).values(data).returning(); return slot; }
  async deleteTimeSlot(id: string): Promise<boolean> { const result = await db.delete(timeSlots).where(eq(timeSlots.id, id)); return (result.rowCount ?? 0) > 0; }
  async getDashboardStats() {
    const [patientCount] = await db.select({ count: sql<number>`count(*)` }).from(patients);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const [todayAppts] = await db.select({ count: sql<number>`count(*)` }).from(appointments)
      .where(and(gte(appointments.appointmentDate, today), lte(appointments.appointmentDate, tomorrow)));
    const [completedAppts] = await db.select({ count: sql<number>`count(*)` }).from(appointments)
      .where(and(gte(appointments.appointmentDate, today), lte(appointments.appointmentDate, tomorrow), eq(appointments.status, "Completed")));
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const [revenue] = await db.select({ sum: sql<string>`COALESCE(SUM(CAST(${invoices.amount} AS numeric)), 0)` }).from(invoices)
      .where(and(gte(invoices.date, startOfMonth), lte(invoices.date, tomorrow)));
    return {
      totalPatients: Number(patientCount?.count || 0),
      todayAppointments: Number(todayAppts?.count || 0),
      completedAppointments: Number(completedAppts?.count || 0),
      monthlyRevenue: revenue?.sum || "0",
    };
  }
  async getMonthlyStats(year: number) {
    const rows = await db.execute(sql`
      SELECT EXTRACT(MONTH FROM date)::int AS month, count(*) AS appointments,
             COALESCE(SUM(CAST(amount AS numeric)), 0) AS revenue
      FROM invoices WHERE EXTRACT(YEAR FROM date) = ${year}
      GROUP BY month ORDER BY month`);
    return rows.rows?.map((r: any) => ({ month: Number(r.month), appointments: Number(r.appointments), revenue: String(r.revenue) })) || [];
  }
  async getTreatmentStats() {
    const rows = await db.execute(sql`
      SELECT t.name, 0::int AS count, '0'::text AS revenue
      FROM treatments t ORDER BY t.name`);
    return rows.rows?.map((r: any) => ({ name: r.name, count: Number(r.count), revenue: String(r.revenue) })) || [];
  }
  async getStatusStats() {
    const rows = await db.execute(sql`SELECT status, COUNT(*)::int AS count FROM patients GROUP BY status ORDER BY count DESC`);
    return rows.rows?.map((r: any) => ({ status: r.status, count: Number(r.count) })) || [];
  }

  // ════════════════════════════════════════════
  // MODULE 1: DASHBOARD ENHANCEMENTS
  // ════════════════════════════════════════════
  async getDailyRevenue(): Promise<string> {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const [result] = await db.select({ sum: sql<string>`COALESCE(SUM(CAST(${invoices.amount} AS numeric)), 0)` })
      .from(invoices).where(and(gte(invoices.date, today), lte(invoices.date, tomorrow)));
    return result?.sum || "0";
  }
  async getWeeklyRevenue(): Promise<string> {
    const today = new Date();
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
    const [result] = await db.select({ sum: sql<string>`COALESCE(SUM(CAST(${invoices.amount} AS numeric)), 0)` })
      .from(invoices).where(and(gte(invoices.date, weekAgo), lte(invoices.date, today)));
    return result?.sum || "0";
  }
  async getMonthlyRevenue(): Promise<string> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const [result] = await db.select({ sum: sql<string>`COALESCE(SUM(CAST(${invoices.amount} AS numeric)), 0)` })
      .from(invoices).where(gte(invoices.date, startOfMonth));
    return result?.sum || "0";
  }
  async getNetProfit(): Promise<string> {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const [revenue] = await db.select({ sum: sql<string>`COALESCE(SUM(CAST(${invoices.amount} AS numeric)), 0)` })
      .from(invoices).where(gte(invoices.date, startOfMonth));
    const [totalExpenses] = await db.select({ sum: sql<string>`COALESCE(SUM(CAST(${expenses.amount} AS numeric)), 0)` })
      .from(expenses).where(gte(expenses.date, startOfMonth));
    return (parseFloat(revenue?.sum || "0") - parseFloat(totalExpenses?.sum || "0")).toFixed(2);
  }
  async getActiveTreatments(): Promise<number> {
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(patientTreatmentProgress)
      .where(eq(patientTreatmentProgress.isCurrent, true));
    return Number(result?.count || 0);
  }
  async getCriticalAlerts(): Promise<{ id: string; type: string; title: string; severity: string; patientName?: string; createdAt: Date }[]> {
    const results = await db.select({
      id: notifications.id, type: notifications.type, title: notifications.title,
      severity: notifications.severity, createdAt: notifications.createdAt,
      patientName: patients.name,
    }).from(notifications).leftJoin(patients, eq(notifications.patientId, patients.id))
      .where(and(eq(notifications.status, "active"), eq(notifications.isRead, false)))
      .orderBy(desc(notifications.severity), desc(notifications.createdAt)).limit(10);
    return results.map((r: any) => ({ ...r, patientName: r.patientName ?? undefined }));
  }
  async getRecentActivities(limit = 10): Promise<{ action: string; entityType: string; entityName: string; username: string; createdAt: Date }[]> {
    const rows = await db.select({
      action: auditLogs.action, entityType: auditLogs.entityType,
      entityName: auditLogs.entityName, username: auditLogs.username, createdAt: auditLogs.createdAt,
    }).from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
    return rows.map((r: any) => ({ ...r, entityName: r.entityName ?? "", username: r.username ?? "" }));
  }
  async getDoctorProductivity(doctorId?: string, startDate?: Date, endDate?: Date): Promise<{ id: string; name: string; appointmentCount: number; revenue: string }[]> {
    const today = new Date();
    const start = startDate || new Date(today.getFullYear(), today.getMonth(), 1);
    const end = endDate || today;
    let condition = and(gte(appointments.appointmentDate, start), lte(appointments.appointmentDate, end));
    if (doctorId) condition = and(condition, eq(appointments.doctorId, doctorId));
    const rows = await db.execute(sql`
      SELECT d.id, d.name, COUNT(DISTINCT a.id)::int AS appointment_count,
             COALESCE(SUM(CAST(i.amount AS numeric)), 0) AS revenue
      FROM doctors d
      LEFT JOIN appointments a ON a.doctor_id = d.id AND a.appointment_date >= ${start} AND a.appointment_date <= ${end}
      LEFT JOIN invoices i ON i.doctor_id = d.id AND i.date >= ${start} AND i.date <= ${end}
      ${doctorId ? sql`WHERE d.id = ${doctorId}` : sql``}
      GROUP BY d.id, d.name ORDER BY revenue DESC`);
    return rows.rows?.map((r: any) => ({ id: r.id, name: r.name, appointmentCount: Number(r.appointment_count), revenue: String(r.revenue) })) || [];
  }
  async getUpcomingAppointments(limit = 8): Promise<(Appointment & { patientName?: string; doctorName?: string })[]> {
    const now = new Date();
    const results = await db.select({
      id: appointments.id, patientId: appointments.patientId, doctorId: appointments.doctorId,
      appointmentDate: appointments.appointmentDate, duration: appointments.duration,
      type: appointments.type, status: appointments.status, color: appointments.color,
      room: appointments.room, notes: appointments.notes, createdAt: appointments.createdAt,
      patientName: patients.name, doctorName: doctors.name,
    }).from(appointments).leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .where(gte(appointments.appointmentDate, now)).orderBy(appointments.appointmentDate).limit(limit);
    return results.map((r: any) => ({ ...r, patientName: r.patientName ?? undefined, doctorName: r.doctorName ?? undefined }));
  }
  async getLabAlerts(): Promise<(LabCase & { patientName?: string; overdueDays?: number })[]> {
    const now = new Date();
    const results = await db.select({
      id: labCases.id, patientId: labCases.patientId, doctorId: labCases.doctorId,
      labName: labCases.labName, type: labCases.type, status: labCases.status,
      dueDate: labCases.dueDate, description: labCases.description, cost: labCases.cost,
      createdAt: labCases.createdAt,
      patientName: patients.name,
    }).from(labCases).leftJoin(patients, eq(labCases.patientId, patients.id))
      .where(and(lte(labCases.dueDate, now), eq(labCases.status, "Sent")))
      .orderBy(labCases.dueDate);
    return results.map((r: any) => ({
      ...r, patientName: r.patientName ?? undefined,
      overdueDays: r.dueDate ? Math.floor((now.getTime() - new Date(r.dueDate).getTime()) / (1000 * 60 * 60 * 24)) : 0,
    }));
  }

  // ════════════════════════════════════════════
  // MODULE 2: DENTAL CHART
  // ════════════════════════════════════════════
  async getDentalChart(patientId: string): Promise<(DentalChart & { entries?: DentalChartEntry[]; notes?: DentalChartNote[] }) | undefined> {
    const [chart] = await db.select().from(dentalCharts).where(eq(dentalCharts.patientId, patientId)).limit(1);
    if (!chart) return undefined;
    const entries = await db.select().from(dentalChartEntries).where(eq(dentalChartEntries.chartId, chart.id)).orderBy(dentalChartEntries.toothNumber);
    const notes = await db.select().from(dentalChartNotes).where(eq(dentalChartNotes.chartId, chart.id)).orderBy(desc(dentalChartNotes.createdAt));
    return { ...chart, entries, notes };
  }
  async createDentalChart(data: InsertDentalChart): Promise<DentalChart> {
    const [chart] = await db.insert(dentalCharts).values(data).returning();
    return chart;
  }
  async updateDentalChart(id: string, data: Partial<InsertDentalChart>): Promise<DentalChart | undefined> {
    const [chart] = await db.update(dentalCharts).set(data).where(eq(dentalCharts.id, id)).returning();
    return chart;
  }
  async upsertDentalChartEntry(data: InsertDentalChartEntry): Promise<DentalChartEntry> {
    const existing = await db.select().from(dentalChartEntries)
      .where(and(eq(dentalChartEntries.chartId, data.chartId!), eq(dentalChartEntries.toothNumber, data.toothNumber), eq(dentalChartEntries.surface, data.surface!)))
      .limit(1);
    if (existing.length > 0) {
      const [entry] = await db.update(dentalChartEntries).set(data).where(eq(dentalChartEntries.id, existing[0].id)).returning();
      return entry;
    }
    const [entry] = await db.insert(dentalChartEntries).values(data).returning();
    return entry;
  }
  async updateDentalChartEntry(id: string, data: Partial<InsertDentalChartEntry>): Promise<DentalChartEntry | undefined> {
    const [entry] = await db.update(dentalChartEntries).set(data).where(eq(dentalChartEntries.id, id)).returning();
    return entry || undefined;
  }
  async deleteDentalChartEntry(id: string): Promise<boolean> {
    const result = await db.delete(dentalChartEntries).where(eq(dentalChartEntries.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  async getDentalChartNotes(chartId: string): Promise<DentalChartNote[]> {
    return await db.select().from(dentalChartNotes).where(eq(dentalChartNotes.chartId, chartId)).orderBy(desc(dentalChartNotes.createdAt));
  }
  async addDentalChartNote(data: InsertDentalChartNote): Promise<DentalChartNote> {
    const [note] = await db.insert(dentalChartNotes).values(data).returning();
    return note;
  }

  // ════════════════════════════════════════════
  // MODULE 3: QUOTATIONS
  // ════════════════════════════════════════════
  async getQuotations(): Promise<(Quotation & { patientName?: string; doctorName?: string; itemCount?: number })[]> {
    const results = await db.select({
      id: quotations.id, quoteNumber: quotations.quoteNumber, patientId: quotations.patientId,
      doctorId: quotations.doctorId, status: quotations.status, totalAmount: quotations.totalAmount,
      discount: quotations.discount, tax: quotations.tax, finalAmount: quotations.finalAmount,
      notes: quotations.notes, validUntil: quotations.validUntil,
      convertedToInvoiceId: quotations.convertedToInvoiceId,
      createdAt: quotations.createdAt, updatedAt: quotations.updatedAt,
      patientName: patients.name, doctorName: doctors.name,
    }).from(quotations).leftJoin(patients, eq(quotations.patientId, patients.id))
      .leftJoin(doctors, eq(quotations.doctorId, doctors.id)).orderBy(desc(quotations.createdAt));
    const withCounts = [];
    for (const r of results) {
      const [cnt] = await db.select({ count: sql<number>`count(*)` }).from(quotationItems).where(eq(quotationItems.quotationId, r.id));
      withCounts.push({ ...r, patientName: r.patientName ?? undefined, doctorName: r.doctorName ?? undefined, itemCount: Number(cnt?.count || 0) });
    }
    return withCounts;
  }
  async getQuotation(id: string): Promise<(Quotation & { patientName?: string; doctorName?: string; items?: QuotationItem[] }) | undefined> {
    const [quotation] = await db.select({
      id: quotations.id, quoteNumber: quotations.quoteNumber, patientId: quotations.patientId,
      doctorId: quotations.doctorId, status: quotations.status, totalAmount: quotations.totalAmount,
      discount: quotations.discount, tax: quotations.tax, finalAmount: quotations.finalAmount,
      notes: quotations.notes, validUntil: quotations.validUntil,
      convertedToInvoiceId: quotations.convertedToInvoiceId,
      createdAt: quotations.createdAt, updatedAt: quotations.updatedAt,
      patientName: patients.name, doctorName: doctors.name,
    }).from(quotations).leftJoin(patients, eq(quotations.patientId, patients.id))
      .leftJoin(doctors, eq(quotations.doctorId, doctors.id)).where(eq(quotations.id, id)).limit(1);
    if (!quotation) return undefined;
    const items = await db.select().from(quotationItems).where(eq(quotationItems.quotationId, id)).orderBy(quotationItems.createdAt);
    return { ...quotation, patientName: quotation.patientName ?? undefined, doctorName: quotation.doctorName ?? undefined, items };
  }
  async getQuotationsByPatient(patientId: string): Promise<Quotation[]> {
    return await db.select().from(quotations).where(eq(quotations.patientId, patientId)).orderBy(desc(quotations.createdAt));
  }
  async createQuotation(data: InsertQuotation): Promise<Quotation> {
    const result = await pool.query("SELECT nextval('quote_number_seq') AS seq");
    const seq = result.rows[0].seq;
    const quoteNumber = `DEV-${String(seq).padStart(4, "0")}`;
    const [quotation] = await db.insert(quotations).values({ ...data, quoteNumber }).returning();
    return quotation;
  }
  async updateQuotation(id: string, data: Partial<InsertQuotation>): Promise<Quotation | undefined> {
    const [quotation] = await db.update(quotations).set({ ...data, updatedAt: new Date() }).where(eq(quotations.id, id)).returning();
    return quotation || undefined;
  }
  async deleteQuotation(id: string): Promise<boolean> {
    await db.delete(quotationItems).where(eq(quotationItems.quotationId, id));
    const result = await db.delete(quotations).where(eq(quotations.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  async approveQuotation(id: string): Promise<Quotation | undefined> {
    const [quotation] = await db.update(quotations).set({ status: "approved", updatedAt: new Date() }).where(eq(quotations.id, id)).returning();
    return quotation || undefined;
  }
  async convertQuotationToInvoice(quotationId: string): Promise<Invoice | undefined> {
    const quotation = await this.getQuotation(quotationId);
    if (!quotation || !quotation.items || quotation.items.length === 0) return undefined;
    if (quotation.convertedToInvoiceId) throw new Error("Ce devis a déjà été converti en facture");
    const seqResult = await pool.query("SELECT nextval('invoice_number_seq') AS seq");
    const invoiceNumber = `INV-${seqResult.rows[0].seq}`;
    return db.transaction(async (tx) => {
      const [invoice] = await tx.insert(invoices).values({
        patientId: quotation.patientId,
        doctorId: quotation.doctorId,
        amount: quotation.finalAmount,
        paidAmount: "0.00",
        status: "Pending",
        invoiceNumber,
        notes: `Converted from quote ${quotation.quoteNumber}: ${quotation.notes || ""}`,
        dueDate: quotation.validUntil || undefined,
      }).returning();
      await tx.update(quotations).set({ status: "converted", convertedToInvoiceId: invoice.id, updatedAt: new Date() }).where(eq(quotations.id, quotationId));
      return invoice;
    });
  }
  async getQuotationItems(quotationId: string): Promise<QuotationItem[]> {
    return await db.select().from(quotationItems).where(eq(quotationItems.quotationId, quotationId)).orderBy(quotationItems.createdAt);
  }
  async addQuotationItem(data: InsertQuotationItem): Promise<QuotationItem> {
    const [item] = await db.insert(quotationItems).values(data).returning();
    await this.recalculateQuotationTotal(data.quotationId);
    return item;
  }
  async deleteQuotationItem(id: string): Promise<boolean> {
    const [item] = await db.select({ quotationId: quotationItems.quotationId }).from(quotationItems).where(eq(quotationItems.id, id)).limit(1);
    const result = await db.delete(quotationItems).where(eq(quotationItems.id, id));
    if (item && (result.rowCount ?? 0) > 0) await this.recalculateQuotationTotal(item.quotationId);
    return (result.rowCount ?? 0) > 0;
  }
  private async recalculateQuotationTotal(quotationId: string): Promise<void> {
    const items = await this.getQuotationItems(quotationId);
    const totalAmount = items.reduce((s, i) => s + parseFloat(i.total), 0).toFixed(2);
    const [quotation] = await db.select().from(quotations).where(eq(quotations.id, quotationId)).limit(1);
    if (!quotation) return;
    const discount = parseFloat(quotation.discount);
    const tax = parseFloat(quotation.tax);
    const finalAmount = (parseFloat(totalAmount) - discount + tax).toFixed(2);
    await db.update(quotations).set({ totalAmount, finalAmount, updatedAt: new Date() }).where(eq(quotations.id, quotationId));
  }

  // ════════════════════════════════════════════
  // MODULE 4: MEDICAL HISTORY
  // ════════════════════════════════════════════
  async getMedicalHistory(patientId: string): Promise<MedicalHistoryRecord[]> {
    return await db.select().from(medicalHistory).where(eq(medicalHistory.patientId, patientId)).orderBy(medicalHistory.category, desc(medicalHistory.createdAt));
  }
  async getMedicalHistoryByCategory(patientId: string, category: string): Promise<MedicalHistoryRecord[]> {
    return await db.select().from(medicalHistory)
      .where(and(eq(medicalHistory.patientId, patientId), eq(medicalHistory.category, category)))
      .orderBy(desc(medicalHistory.createdAt));
  }
  async getMedicalSummary(patientId: string): Promise<{ category: string; items: { value: string; severity?: string; isCurrent: boolean }[] }[]> {
    const records = await this.getMedicalHistory(patientId);
    const grouped: Record<string, { value: string; severity?: string; isCurrent: boolean }[]> = {};
    for (const r of records) {
      if (!grouped[r.category]) grouped[r.category] = [];
      grouped[r.category].push({ value: r.value, severity: r.severity ?? undefined, isCurrent: r.isCurrent });
    }
    return Object.entries(grouped).map(([category, items]) => ({ category, items }));
  }
  async createMedicalHistory(data: InsertMedicalHistory): Promise<MedicalHistoryRecord> {
    const [record] = await db.insert(medicalHistory).values(data).returning();
    return record;
  }
  async updateMedicalHistory(id: string, data: Partial<InsertMedicalHistory>): Promise<MedicalHistoryRecord | undefined> {
    const [record] = await db.update(medicalHistory).set({ ...data, updatedAt: new Date() }).where(eq(medicalHistory.id, id)).returning();
    return record || undefined;
  }
  async deleteMedicalHistory(id: string): Promise<boolean> {
    const result = await db.delete(medicalHistory).where(eq(medicalHistory.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  async batchCreateMedicalHistory(patientId: string, records: InsertMedicalHistory[]): Promise<MedicalHistoryRecord[]> {
    const created: MedicalHistoryRecord[] = [];
    for (const r of records) {
      created.push(await this.createMedicalHistory({ ...r, patientId }));
    }
    return created;
  }

  // ════════════════════════════════════════════
  // MODULE 5: INVENTORY
  // ════════════════════════════════════════════
  async getInventoryProducts(): Promise<InventoryProduct[]> {
    return await db.select().from(inventoryProducts).orderBy(inventoryProducts.name);
  }
  async getInventoryProduct(id: string): Promise<InventoryProduct | undefined> {
    const [product] = await db.select().from(inventoryProducts).where(eq(inventoryProducts.id, id));
    return product || undefined;
  }
  async createInventoryProduct(data: InsertInventoryProduct): Promise<InventoryProduct> {
    const [product] = await db.insert(inventoryProducts).values(data).returning();
    return product;
  }
  async updateInventoryProduct(id: string, data: Partial<InsertInventoryProduct>): Promise<InventoryProduct | undefined> {
    const [product] = await db.update(inventoryProducts).set({ ...data, updatedAt: new Date() }).where(eq(inventoryProducts.id, id)).returning();
    return product || undefined;
  }
  async deleteInventoryProduct(id: string): Promise<boolean> {
    const result = await db.delete(inventoryProducts).where(eq(inventoryProducts.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  async getLowStockProducts(): Promise<InventoryProduct[]> {
    return await db.select().from(inventoryProducts)
      .where(sql`${inventoryProducts.currentStock} <= ${inventoryProducts.minimumStock}`)
      .orderBy(inventoryProducts.currentStock);
  }
  async getExpiringProducts(): Promise<InventoryProduct[]> {
    const thirtyDays = new Date(); thirtyDays.setDate(thirtyDays.getDate() + 30);
    return await db.select().from(inventoryProducts)
      .where(and(isNotNull(inventoryProducts.expirationDate), lte(inventoryProducts.expirationDate, thirtyDays)))
      .orderBy(inventoryProducts.expirationDate);
  }
  async adjustStock(productId: string, quantity: number, type: string, performedBy?: string, notes?: string): Promise<InventoryProduct> {
    return db.transaction(async (tx) => {
      const [product] = await tx.select().from(inventoryProducts).where(eq(inventoryProducts.id, productId)).limit(1);
      if (!product) throw new Error("Product not found");
      const newStock = type === "in" ? product.currentStock + quantity : product.currentStock - quantity;
      const [updated] = await tx.update(inventoryProducts).set({ currentStock: Math.max(0, newStock), updatedAt: new Date() }).where(eq(inventoryProducts.id, productId)).returning();
      await tx.insert(inventoryMovements).values({ productId, type, quantity, performedBy: performedBy || null, notes: notes || null });
      return updated;
    });
  }
  async getInventorySuppliers(): Promise<InventorySupplier[]> {
    return await db.select().from(inventorySuppliers).orderBy(inventorySuppliers.name);
  }
  async createInventorySupplier(data: InsertInventorySupplier): Promise<InventorySupplier> {
    const [supplier] = await db.insert(inventorySuppliers).values(data).returning();
    return supplier;
  }
  async updateInventorySupplier(id: string, data: Partial<InsertInventorySupplier>): Promise<InventorySupplier | undefined> {
    const [supplier] = await db.update(inventorySuppliers).set(data).where(eq(inventorySuppliers.id, id)).returning();
    return supplier || undefined;
  }
  async deleteInventorySupplier(id: string): Promise<boolean> {
    const result = await db.delete(inventorySuppliers).where(eq(inventorySuppliers.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  async getPurchaseOrders(): Promise<(PurchaseOrder & { supplierName?: string; itemCount?: number })[]> {
    const results = await db.select({
      id: purchaseOrders.id, orderNumber: purchaseOrders.orderNumber, supplierId: purchaseOrders.supplierId,
      status: purchaseOrders.status, totalAmount: purchaseOrders.totalAmount,
      expectedDate: purchaseOrders.expectedDate, receivedDate: purchaseOrders.receivedDate,
      notes: purchaseOrders.notes, createdAt: purchaseOrders.createdAt, updatedAt: purchaseOrders.updatedAt,
      supplierName: inventorySuppliers.name,
    }).from(purchaseOrders).leftJoin(inventorySuppliers, eq(purchaseOrders.supplierId, inventorySuppliers.id))
      .orderBy(desc(purchaseOrders.createdAt));
    const withCounts = [];
    for (const r of results) {
      const [cnt] = await db.select({ count: sql<number>`count(*)` }).from(purchaseOrderItems).where(eq(purchaseOrderItems.orderId, r.id));
      withCounts.push({ ...r, supplierName: r.supplierName ?? undefined, itemCount: Number(cnt?.count || 0) });
    }
    return withCounts;
  }
  async createPurchaseOrder(data: InsertPurchaseOrder): Promise<PurchaseOrder> {
    const result = await pool.query("SELECT nextval('order_number_seq') AS seq");
    const seq = result.rows[0].seq;
    const orderNumber = `PO-${seq}`;
    const [order] = await db.insert(purchaseOrders).values({ ...data, orderNumber }).returning();
    return order;
  }
  async updatePurchaseOrder(id: string, data: Partial<InsertPurchaseOrder>): Promise<PurchaseOrder | undefined> {
    const [order] = await db.update(purchaseOrders).set({ ...data, updatedAt: new Date() }).where(eq(purchaseOrders.id, id)).returning();
    return order || undefined;
  }
  async getPurchaseOrderItems(orderId: string): Promise<(PurchaseOrderItem & { productName?: string })[]> {
    const results = await db.select({
      id: purchaseOrderItems.id, orderId: purchaseOrderItems.orderId, productId: purchaseOrderItems.productId,
      quantity: purchaseOrderItems.quantity, unitPrice: purchaseOrderItems.unitPrice,
      total: purchaseOrderItems.total, createdAt: purchaseOrderItems.createdAt,
      productName: inventoryProducts.name,
    }).from(purchaseOrderItems).leftJoin(inventoryProducts, eq(purchaseOrderItems.productId, inventoryProducts.id))
      .where(eq(purchaseOrderItems.orderId, orderId));
    return results.map((r: any) => ({ ...r, productName: r.productName ?? undefined }));
  }
  async addPurchaseOrderItem(data: InsertPurchaseOrderItem): Promise<PurchaseOrderItem> {
    const [item] = await db.insert(purchaseOrderItems).values(data).returning();
    const items = await db.select({ total: purchaseOrderItems.total }).from(purchaseOrderItems).where(eq(purchaseOrderItems.orderId, data.orderId));
    const totalAmount = items.reduce((s, i) => s + parseFloat(i.total), 0).toFixed(2);
    await db.update(purchaseOrders).set({ totalAmount }).where(eq(purchaseOrders.id, data.orderId));
    return item;
  }
  async getInventoryMovements(productId: string): Promise<InventoryMovement[]> {
    return await db.select().from(inventoryMovements).where(eq(inventoryMovements.productId, productId)).orderBy(desc(inventoryMovements.createdAt));
  }

  // ════════════════════════════════════════════
  // MODULE 6: EXPENSES
  // ════════════════════════════════════════════
  async getExpenses(): Promise<Expense[]> {
    return await db.select().from(expenses).orderBy(desc(expenses.date));
  }
  async getExpensesByDateRange(startDate: Date, endDate: Date): Promise<Expense[]> {
    return await db.select().from(expenses).where(and(gte(expenses.date, startDate), lte(expenses.date, endDate))).orderBy(desc(expenses.date));
  }
  async getExpenseCategories(): Promise<string[]> {
    const rows = await db.execute(sql`SELECT DISTINCT category FROM expenses ORDER BY category`);
    return rows.rows?.map((r: any) => r.category) || [];
  }
  async getExpenseSummary(startDate: Date, endDate: Date): Promise<{ total: string; byCategory: { category: string; amount: string }[] }> {
    const [totalResult] = await db.select({ total: sql<string>`COALESCE(SUM(CAST(${expenses.amount} AS numeric)), 0)` })
      .from(expenses).where(and(gte(expenses.date, startDate), lte(expenses.date, endDate)));
    const rows = await db.execute(sql`
      SELECT category, COALESCE(SUM(CAST(amount AS numeric)), 0) AS amount
      FROM expenses WHERE date >= ${startDate} AND date <= ${endDate}
      GROUP BY category ORDER BY amount DESC`);
    return {
      total: totalResult?.total || "0",
      byCategory: rows.rows?.map((r: any) => ({ category: r.category, amount: String(r.amount) })) || [],
    };
  }
  async createExpense(data: InsertExpense): Promise<Expense> {
    const [expense] = await db.insert(expenses).values(data).returning();
    return expense;
  }
  async updateExpense(id: string, data: Partial<InsertExpense>): Promise<Expense | undefined> {
    const [expense] = await db.update(expenses).set(data).where(eq(expenses.id, id)).returning();
    return expense || undefined;
  }
  async deleteExpense(id: string): Promise<boolean> {
    const result = await db.delete(expenses).where(eq(expenses.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ════════════════════════════════════════════
  // MODULE 7: PATIENT DOCUMENTS
  // ════════════════════════════════════════════
  async getPatientDocuments(patientId: string): Promise<PatientDocument[]> {
    return await db.select().from(patientDocuments).where(eq(patientDocuments.patientId, patientId)).orderBy(desc(patientDocuments.createdAt));
  }
  async createPatientDocument(data: InsertPatientDocument): Promise<PatientDocument> {
    const [doc] = await db.insert(patientDocuments).values(data).returning();
    return doc;
  }
  async deletePatientDocument(id: string): Promise<boolean> {
    const result = await db.delete(patientDocuments).where(eq(patientDocuments.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  async getPatientDocument(id: string): Promise<PatientDocument | undefined> {
    const [doc] = await db.select().from(patientDocuments).where(eq(patientDocuments.id, id));
    return doc || undefined;
  }

  // ════════════════════════════════════════════
  // MODULE 8A: PATIENT IMAGES
  // ════════════════════════════════════════════
  async getPatientImages(patientId: string, filters?: { tooth?: string; type?: string; tag?: string; dentistId?: string; dateFrom?: string; dateTo?: string }): Promise<(PatientImage & { dentistName?: string })[]> {
    const conditions = [eq(patientImages.patientId, patientId)];
    if (filters?.tooth) conditions.push(like(patientImages.toothNumbers, `%${filters.tooth}%`));
    if (filters?.type) conditions.push(eq(patientImages.imageType, filters.type));
    if (filters?.tag) conditions.push(like(patientImages.tags, `%${filters.tag}%`));
    if (filters?.dentistId) conditions.push(eq(patientImages.dentistId, filters.dentistId));
    if (filters?.dateFrom) conditions.push(gte(patientImages.date, new Date(filters.dateFrom)));
    if (filters?.dateTo) conditions.push(lte(patientImages.date, new Date(filters.dateTo)));
    const results = await db.select({
      id: patientImages.id, patientId: patientImages.patientId, toothNumbers: patientImages.toothNumbers,
      imageType: patientImages.imageType, date: patientImages.date, dentistId: patientImages.dentistId,
      clinicalNote: patientImages.clinicalNote, tags: patientImages.tags, filePath: patientImages.filePath,
      fileSize: patientImages.fileSize, mimeType: patientImages.mimeType, fileName: patientImages.fileName,
      uploadedBy: patientImages.uploadedBy, dicomMetadata: patientImages.dicomMetadata,
      createdAt: patientImages.createdAt, updatedAt: patientImages.updatedAt,
      dentistName: doctors.name,
    }).from(patientImages)
      .leftJoin(doctors, eq(patientImages.dentistId, doctors.id))
      .where(and(...conditions))
      .orderBy(desc(patientImages.date));
    return results.map((r: any) => ({ ...r, dentistName: r.dentistName ?? undefined }));
  }
  async getPatientImage(id: string): Promise<PatientImage | undefined> {
    const [img] = await db.select().from(patientImages).where(eq(patientImages.id, id));
    return img || undefined;
  }
  async createPatientImage(data: InsertPatientImage): Promise<PatientImage> {
    const [img] = await db.insert(patientImages).values(data).returning();
    return img;
  }
  async updatePatientImage(id: string, data: Partial<InsertPatientImage>): Promise<PatientImage | undefined> {
    const [updated] = await db.update(patientImages).set(data).where(eq(patientImages.id, id)).returning();
    return updated || undefined;
  }
  async deletePatientImage(id: string): Promise<boolean> {
    const result = await db.delete(patientImages).where(eq(patientImages.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ════════════════════════════════════════════
  // MODULE 8: SIGNATURES
  // ════════════════════════════════════════════
  async createSignature(data: InsertSignature): Promise<Signature> {
    const [sig] = await db.insert(signatures).values(data).returning();
    return sig;
  }
  async getSignaturesByDocument(documentType: string, documentId: string): Promise<Signature[]> {
    return await db.select().from(signatures)
      .where(and(eq(signatures.documentType, documentType), eq(signatures.documentId, documentId)))
      .orderBy(desc(signatures.signedAt));
  }

  // ════════════════════════════════════════════
  // MODULE 9: BACKUPS
  // ════════════════════════════════════════════
  async createBackupEntry(data: InsertBackup): Promise<Backup> {
    const [backup] = await db.insert(backups).values(data).returning();
    return backup;
  }
  async getBackups(): Promise<Backup[]> {
    return await db.select().from(backups).orderBy(desc(backups.createdAt));
  }

  // ════════════════════════════════════════════
  // MODULE 10: AUDIT LOGS
  // ════════════════════════════════════════════
  async createAuditLog(data: InsertAuditLog): Promise<AuditLog> {
    const [log] = await db.insert(auditLogs).values(data).returning();
    return log;
  }
  async getAuditLogs(limit = 50, offset = 0): Promise<AuditLog[]> {
    return await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit).offset(offset);
  }
  async getAuditLogsByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return await db.select().from(auditLogs)
      .where(and(eq(auditLogs.entityType, entityType), eq(auditLogs.entityId, entityId)))
      .orderBy(desc(auditLogs.createdAt));
  }
  async getAuditLogsByUser(userId: string): Promise<AuditLog[]> {
    return await db.select().from(auditLogs).where(eq(auditLogs.userId, userId)).orderBy(desc(auditLogs.createdAt));
  }

  // ════════════════════════════════════════════
  // MODULE 11: ADVANCED SCHEDULING
  // ════════════════════════════════════════════
  async getAppointmentsByDateRange(startDate: Date, endDate: Date): Promise<(Appointment & { patientName?: string; doctorName?: string })[]> {
    const results = await db.select({
      id: appointments.id, patientId: appointments.patientId, doctorId: appointments.doctorId,
      appointmentDate: appointments.appointmentDate, duration: appointments.duration,
      type: appointments.type, status: appointments.status, color: appointments.color,
      room: appointments.room, notes: appointments.notes, createdAt: appointments.createdAt,
      patientName: patients.name, doctorName: doctors.name,
      doctorColor: doctors.color,
    }).from(appointments).leftJoin(patients, eq(appointments.patientId, patients.id))
      .leftJoin(doctors, eq(appointments.doctorId, doctors.id))
      .where(and(gte(appointments.appointmentDate, startDate), lte(appointments.appointmentDate, endDate)))
      .orderBy(appointments.appointmentDate);
    return results.map((r: any) => ({ ...r, patientName: r.patientName ?? undefined, doctorName: r.doctorName ?? undefined }));
  }

  // ════════════════════════════════════════════
  // MODULE 14: GLOBAL SEARCH
  // ════════════════════════════════════════════
  async globalSearch(query: string): Promise<any> {
    const searchPattern = `%${query}%`;
    const matchedPatients = await db.select().from(patients)
      .where(or(sql`${patients.name} ILIKE ${searchPattern}`, sql`${patients.patientId} ILIKE ${searchPattern}`, sql`${patients.phone} ILIKE ${searchPattern}`))
      .limit(10);
    const matchedAppointments = await db.select({
      id: appointments.id, patientId: appointments.patientId, doctorId: appointments.doctorId,
      appointmentDate: appointments.appointmentDate, duration: appointments.duration,
      type: appointments.type, status: appointments.status, color: appointments.color,
      room: appointments.room, notes: appointments.notes, createdAt: appointments.createdAt,
      patientName: patients.name,
    }).from(appointments).leftJoin(patients, eq(appointments.patientId, patients.id))
      .where(sql`${patients.name} ILIKE ${searchPattern}`).limit(10);
    const matchedTreatments = await db.select().from(treatments)
      .where(or(sql`${treatments.name} ILIKE ${searchPattern}`, sql`${treatments.description} ILIKE ${searchPattern}`))
      .limit(10);
    const matchedInvoices = await db.select({
      id: invoices.id, patientId: invoices.patientId, invoiceNumber: invoices.invoiceNumber,
      amount: invoices.amount, paidAmount: invoices.paidAmount, doctorId: invoices.doctorId,
      date: invoices.date, dueDate: invoices.dueDate, status: invoices.status,
      notes: invoices.notes, createdAt: invoices.createdAt,
      patientName: patients.name,
    }).from(invoices).leftJoin(patients, eq(invoices.patientId, patients.id))
      .where(sql`${patients.name} ILIKE ${searchPattern}`).limit(10);
    const matchedLabCases = await db.select({
      id: labCases.id, patientId: labCases.patientId, doctorId: labCases.doctorId,
      labName: labCases.labName, type: labCases.type, status: labCases.status,
      dueDate: labCases.dueDate, description: labCases.description, cost: labCases.cost,
      createdAt: labCases.createdAt,
      patientName: patients.name,
    }).from(labCases).leftJoin(patients, eq(labCases.patientId, patients.id))
      .where(sql`${labCases.labName} ILIKE ${searchPattern}`).limit(10);
    return { patients: matchedPatients, appointments: matchedAppointments, treatments: matchedTreatments, invoices: matchedInvoices, labCases: matchedLabCases };
  }

  // ════════════════════════════════════════════
  // MODULE 15: SECURITY
  // ════════════════════════════════════════════
  async updateUserLastLogin(id: string): Promise<void> {
    await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, id));
  }
  async getUserSessions(userId: string): Promise<UserSession[]> {
    return await db.select().from(userSessions).where(eq(userSessions.userId, userId)).orderBy(desc(userSessions.createdAt));
  }
  async createUserSession(data: InsertUserSession): Promise<UserSession> {
    const [session] = await db.insert(userSessions).values(data).returning();
    return session;
  }
  async deleteUserSession(id: string): Promise<boolean> {
    const result = await db.delete(userSessions).where(eq(userSessions.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ════════════════════════════════════════════
  // PDF
  // ════════════════════════════════════════════
  async getInvoiceForPrint(id: string): Promise<(Invoice & { patientName?: string; patient: Patient | null; payments: Payment[] }) | undefined> {
    const [invoice] = await db.select({
      id: invoices.id, patientId: invoices.patientId, invoiceNumber: invoices.invoiceNumber,
      amount: invoices.amount, paidAmount: invoices.paidAmount, doctorId: invoices.doctorId,
      date: invoices.date, dueDate: invoices.dueDate, status: invoices.status,
      notes: invoices.notes, createdAt: invoices.createdAt, updatedAt: invoices.updatedAt,
      patientName: patients.name,
    }).from(invoices).leftJoin(patients, eq(invoices.patientId, patients.id)).where(eq(invoices.id, id)).limit(1);
    if (!invoice) return undefined;
    const [patient] = await db.select().from(patients).where(eq(patients.id, invoice.patientId)).limit(1);
    const invoicePayments = await this.getPaymentsByInvoice(id);
    return { ...invoice, patient: patient || null, payments: invoicePayments, patientName: invoice.patientName ?? undefined };
  }

  // ════════════════════════════════════════════
  // NEW MODULES: PATIENT TREATMENTS
  // ════════════════════════════════════════════
  async getPatientTreatments(patientId: string): Promise<(PatientTreatment & { treatmentName?: string; doctorName?: string })[]> {
    const results = await db.select({
      id: patientTreatments.id, patientId: patientTreatments.patientId, treatmentId: patientTreatments.treatmentId,
      doctorId: patientTreatments.doctorId, assistantId: patientTreatments.assistantId,
      toothNumber: patientTreatments.toothNumber, surface: patientTreatments.surface,
      status: patientTreatments.status, priority: patientTreatments.priority, notes: patientTreatments.notes, cost: patientTreatments.cost,
      startedAt: patientTreatments.startedAt, completedAt: patientTreatments.completedAt,
      createdAt: patientTreatments.createdAt, updatedAt: patientTreatments.updatedAt,
      treatmentName: treatments.name, doctorName: doctors.name,
    }).from(patientTreatments)
      .leftJoin(treatments, eq(patientTreatments.treatmentId, treatments.id))
      .leftJoin(doctors, eq(patientTreatments.doctorId, doctors.id))
      .where(eq(patientTreatments.patientId, patientId))
      .orderBy(desc(patientTreatments.createdAt));
    return results.map((r: any) => ({ ...r, treatmentName: r.treatmentName ?? undefined, doctorName: r.doctorName ?? undefined }));
  }
  async createPatientTreatment(data: InsertPatientTreatment): Promise<PatientTreatment> {
    const [result] = await db.insert(patientTreatments).values(data).returning();
    return result;
  }
  async updatePatientTreatment(id: string, data: Partial<InsertPatientTreatment>): Promise<PatientTreatment | undefined> {
    const [updated] = await db.update(patientTreatments).set(data).where(eq(patientTreatments.id, id)).returning();
    return updated || undefined;
  }
  async deletePatientTreatment(id: string): Promise<boolean> {
    const result = await db.delete(patientTreatments).where(eq(patientTreatments.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ════════════════════════════════════════════
  // NEW MODULES: PRESCRIPTIONS
  // ════════════════════════════════════════════
  async getPrescriptions(patientId: string): Promise<(Prescription & { doctorName?: string })[]> {
    const results = await db.select({
      id: prescriptions.id, patientId: prescriptions.patientId, doctorId: prescriptions.doctorId,
      diagnosis: prescriptions.diagnosis, notes: prescriptions.notes, status: prescriptions.status,
      issuedAt: prescriptions.issuedAt, expiresAt: prescriptions.expiresAt,
      createdAt: prescriptions.createdAt, updatedAt: prescriptions.updatedAt,
      doctorName: doctors.name,
    }).from(prescriptions)
      .leftJoin(doctors, eq(prescriptions.doctorId, doctors.id))
      .where(eq(prescriptions.patientId, patientId))
      .orderBy(desc(prescriptions.issuedAt));
    return results.map((r: any) => ({ ...r, doctorName: r.doctorName ?? undefined }));
  }
  async getPrescription(id: string): Promise<(Prescription & { items?: PrescriptionItem[]; doctorName?: string }) | undefined> {
    const [prescription] = await db.select({
      id: prescriptions.id, patientId: prescriptions.patientId, doctorId: prescriptions.doctorId,
      diagnosis: prescriptions.diagnosis, notes: prescriptions.notes, status: prescriptions.status,
      issuedAt: prescriptions.issuedAt, expiresAt: prescriptions.expiresAt,
      createdAt: prescriptions.createdAt, updatedAt: prescriptions.updatedAt,
      doctorName: doctors.name,
    }).from(prescriptions)
      .leftJoin(doctors, eq(prescriptions.doctorId, doctors.id))
      .where(eq(prescriptions.id, id)).limit(1);
    if (!prescription) return undefined;
    const items = await db.select().from(prescriptionItems).where(eq(prescriptionItems.prescriptionId, id));
    return { ...prescription, items, doctorName: prescription.doctorName ?? undefined };
  }
  async createPrescription(data: InsertPrescription): Promise<Prescription> {
    const [result] = await db.insert(prescriptions).values(data).returning();
    return result;
  }
  async updatePrescription(id: string, data: Partial<InsertPrescription>): Promise<Prescription | undefined> {
    const [updated] = await db.update(prescriptions).set(data).where(eq(prescriptions.id, id)).returning();
    return updated || undefined;
  }
  async deletePrescription(id: string): Promise<boolean> {
    const result = await db.delete(prescriptions).where(eq(prescriptions.id, id));
    return (result.rowCount ?? 0) > 0;
  }
  async addPrescriptionItem(data: InsertPrescriptionItem): Promise<PrescriptionItem> {
    const [item] = await db.insert(prescriptionItems).values(data).returning();
    return item;
  }

  // ════════════════════════════════════════════
  // NEW MODULES: RECALL REMINDERS
  // ════════════════════════════════════════════
  async getRecallReminders(patientId?: string): Promise<(RecallReminder & { patientName?: string })[]> {
    const selectCols = {
      id: recallReminders.id, patientId: recallReminders.patientId, appointmentId: recallReminders.appointmentId,
      reminderType: recallReminders.reminderType, title: recallReminders.title, description: recallReminders.description,
      dueDate: recallReminders.dueDate, status: recallReminders.status, notifiedAt: recallReminders.notifiedAt,
      completedAt: recallReminders.completedAt, createdBy: recallReminders.createdBy,
      createdAt: recallReminders.createdAt, updatedAt: recallReminders.updatedAt,
      patientName: patients.name,
    };
    let results;
    if (patientId) {
      results = await db.select(selectCols).from(recallReminders)
        .leftJoin(patients, eq(recallReminders.patientId, patients.id))
        .where(eq(recallReminders.patientId, patientId))
        .orderBy(recallReminders.dueDate);
    } else {
      results = await db.select(selectCols).from(recallReminders)
        .leftJoin(patients, eq(recallReminders.patientId, patients.id))
        .orderBy(recallReminders.dueDate);
    }
    return results.map((r: any) => ({ ...r, patientName: r.patientName ?? undefined }));
  }
  async createRecallReminder(data: InsertRecallReminder): Promise<RecallReminder> {
    const [result] = await db.insert(recallReminders).values(data).returning();
    return result;
  }
  async updateRecallReminder(id: string, data: Partial<InsertRecallReminder>): Promise<RecallReminder | undefined> {
    const [updated] = await db.update(recallReminders).set(data).where(eq(recallReminders.id, id)).returning();
    return updated || undefined;
  }
  async deleteRecallReminder(id: string): Promise<boolean> {
    const result = await db.delete(recallReminders).where(eq(recallReminders.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ════════════════════════════════════════════
  // NEW MODULES: DOCTOR SCHEDULES
  // ════════════════════════════════════════════
  async getDoctorSchedules(doctorId: string): Promise<DoctorSchedule[]> {
    return await db.select().from(doctorSchedules).where(eq(doctorSchedules.doctorId, doctorId)).orderBy(doctorSchedules.dayOfWeek);
  }
  async createDoctorSchedule(data: InsertDoctorSchedule): Promise<DoctorSchedule> {
    const [result] = await db.insert(doctorSchedules).values(data).returning();
    return result;
  }
  async updateDoctorSchedule(id: string, data: Partial<InsertDoctorSchedule>): Promise<DoctorSchedule | undefined> {
    const [updated] = await db.update(doctorSchedules).set(data).where(eq(doctorSchedules.id, id)).returning();
    return updated || undefined;
  }
  async deleteDoctorSchedule(id: string): Promise<boolean> {
    const result = await db.delete(doctorSchedules).where(eq(doctorSchedules.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ════════════════════════════════════════════
  // NEW MODULES: BLOCKED TIMES
  // ════════════════════════════════════════════
  async getBlockedTimes(doctorId: string, startDate?: Date, endDate?: Date): Promise<BlockedTime[]> {
    if (startDate && endDate) {
      return await db.select().from(blockedTimes)
        .where(and(eq(blockedTimes.doctorId, doctorId), gte(blockedTimes.startTime, startDate), lte(blockedTimes.startTime, endDate)))
        .orderBy(blockedTimes.startTime);
    }
    return await db.select().from(blockedTimes)
      .where(eq(blockedTimes.doctorId, doctorId))
      .orderBy(blockedTimes.startTime);
  }
  async createBlockedTime(data: InsertBlockedTime): Promise<BlockedTime> {
    const [result] = await db.insert(blockedTimes).values(data).returning();
    return result;
  }
  async deleteBlockedTime(id: string): Promise<boolean> {
    const result = await db.delete(blockedTimes).where(eq(blockedTimes.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ════════════════════════════════════════════
  // NEW MODULES: INSURANCE CLAIMS
  // ════════════════════════════════════════════
  async getInsuranceClaims(patientId?: string): Promise<(InsuranceClaim & { patientName?: string })[]> {
    const selectCols = {
      id: insuranceClaims.id, patientId: insuranceClaims.patientId, invoiceId: insuranceClaims.invoiceId,
      insuranceProvider: insuranceClaims.insuranceProvider, policyNumber: insuranceClaims.policyNumber,
      claimNumber: insuranceClaims.claimNumber, claimAmount: insuranceClaims.claimAmount,
      approvedAmount: insuranceClaims.approvedAmount, status: insuranceClaims.status,
      submittedAt: insuranceClaims.submittedAt, processedAt: insuranceClaims.processedAt,
      notes: insuranceClaims.notes, createdAt: insuranceClaims.createdAt, updatedAt: insuranceClaims.updatedAt,
      patientName: patients.name,
    };
    let results;
    if (patientId) {
      results = await db.select(selectCols).from(insuranceClaims)
        .leftJoin(patients, eq(insuranceClaims.patientId, patients.id))
        .where(eq(insuranceClaims.patientId, patientId))
        .orderBy(desc(insuranceClaims.createdAt));
    } else {
      results = await db.select(selectCols).from(insuranceClaims)
        .leftJoin(patients, eq(insuranceClaims.patientId, patients.id))
        .orderBy(desc(insuranceClaims.createdAt));
    }
    return results.map((r: any) => ({ ...r, patientName: r.patientName ?? undefined }));
  }
  async createInsuranceClaim(data: InsertInsuranceClaim): Promise<InsuranceClaim> {
    const [result] = await db.insert(insuranceClaims).values(data).returning();
    return result;
  }
  async updateInsuranceClaim(id: string, data: Partial<InsertInsuranceClaim>): Promise<InsuranceClaim | undefined> {
    const [updated] = await db.update(insuranceClaims).set(data).where(eq(insuranceClaims.id, id)).returning();
    return updated || undefined;
  }
  async deleteInsuranceClaim(id: string): Promise<boolean> {
    const result = await db.delete(insuranceClaims).where(eq(insuranceClaims.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ════════════════════════════════════════════
  // NEW MODULES: PATIENT STATISTICS
  // ════════════════════════════════════════════
  async getPatientStatistics(patientId: string): Promise<PatientStatistics | undefined> {
    const [stats] = await db.select().from(patientStatistics).where(eq(patientStatistics.patientId, patientId));
    return stats || undefined;
  }
  async upsertPatientStatistics(patientId: string, data: Partial<InsertPatientStatistics>): Promise<PatientStatistics> {
    const existing = await this.getPatientStatistics(patientId);
    if (existing) {
      const [updated] = await db.update(patientStatistics).set(data).where(eq(patientStatistics.patientId, patientId)).returning();
      return updated!;
    }
    const [created] = await db.insert(patientStatistics).values({ patientId, ...data } as any).returning();
    return created;
  }

  // ════════════════════════════════════════════
  // NEW MODULES: APPOINTMENT TYPES
  // ════════════════════════════════════════════
  async getAppointmentTypes(): Promise<AppointmentType[]> {
    return await db.select().from(appointmentTypes).where(eq(appointmentTypes.isActive, true)).orderBy(appointmentTypes.sortOrder);
  }
  async createAppointmentType(data: InsertAppointmentType): Promise<AppointmentType> {
    const [result] = await db.insert(appointmentTypes).values(data).returning();
    return result;
  }
  async updateAppointmentType(id: string, data: Partial<InsertAppointmentType>): Promise<AppointmentType | undefined> {
    const [updated] = await db.update(appointmentTypes).set(data).where(eq(appointmentTypes.id, id)).returning();
    return updated || undefined;
  }
  async deleteAppointmentType(id: string): Promise<boolean> {
    const result = await db.delete(appointmentTypes).where(eq(appointmentTypes.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // ════════════════════════════════════════════
  // NEW MODULES: ROOMS
  // ════════════════════════════════════════════
  async getRooms(): Promise<Room[]> {
    return await db.select().from(rooms).where(eq(rooms.isActive, true)).orderBy(rooms.name);
  }
  async createRoom(data: InsertRoom): Promise<Room> {
    const [result] = await db.insert(rooms).values(data).returning();
    return result;
  }
  async updateRoom(id: string, data: Partial<InsertRoom>): Promise<Room | undefined> {
    const [updated] = await db.update(rooms).set(data).where(eq(rooms.id, id)).returning();
    return updated || undefined;
  }
  async deleteRoom(id: string): Promise<boolean> {
    const result = await db.delete(rooms).where(eq(rooms.id, id));
    return (result.rowCount ?? 0) > 0;
  }
}

export const storage: IStorage = new DatabaseStorage();
