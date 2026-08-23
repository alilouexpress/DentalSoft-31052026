import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, boolean, jsonb, index, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ─────────────────────────────────────────────
// EXISTING TABLES (preserved + extended)
// ─────────────────────────────────────────────

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("admin"),
  staffId: varchar("staff_id").references(() => staff.id),
  lastLogin: timestamp("last_login"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({ username: true, password: true, role: true, staffId: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const doctors = pgTable("doctors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  specialization: text("specialization"),
  email: text("email"),
  phone: text("phone"),
  status: text("status").notNull().default("Active"),
  staffId: varchar("staff_id").references(() => staff.id),
  color: text("color").default("#3b82f6"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDoctorSchema = createInsertSchema(doctors).omit({ id: true, createdAt: true });
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
export type Doctor = typeof doctors.$inferSelect;

export const patients = pgTable("patients", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: text("patient_id").notNull().unique(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  dateOfBirth: timestamp("date_of_birth"),
  bloodType: text("blood_type"),
  nationalId: text("national_id"),
  emergencyContact: text("emergency_contact"),
  emergencyPhone: text("emergency_phone"),
  insuranceProvider: text("insurance_provider"),
  insuranceNumber: text("insurance_number"),
  lastVisit: timestamp("last_visit"),
  status: text("status").notNull().default("Active"),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0.00"),
  notes: text("notes"),
  photoUrl: text("photo_url"),
  secondaryPhone: text("secondary_phone"),
  city: text("city"),
  state: text("state"),
  postalCode: text("postal_code"),
  country: text("country"),
  preferredLanguage: text("preferred_language"),
  preferredCommunication: text("preferred_communication"),
  profession: text("profession"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPatientSchema = createInsertSchema(patients, { age: (schema) => schema.min(0) }).omit({ id: true, createdAt: true, patientId: true });
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type Patient = typeof patients.$inferSelect;

export const appointments = pgTable("appointments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  doctorId: varchar("doctor_id").notNull().references(() => doctors.id),
  appointmentDate: timestamp("appointment_date").notNull(),
  duration: integer("duration").notNull().default(45),
  type: text("type").notNull(),
  status: text("status").notNull().default("Scheduled"),
  color: text("color"),
  room: text("room"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true, createdAt: true });
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type Appointment = typeof appointments.$inferSelect;

export const treatmentCategories = pgTable("treatment_categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  icon: text("icon").notNull().default("Stethoscope"),
  color: text("color").notNull().default("bg-emerald-50 text-emerald-600"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTreatmentCategorySchema = createInsertSchema(treatmentCategories).omit({ id: true });
export type InsertTreatmentCategory = z.infer<typeof insertTreatmentCategorySchema>;
export type TreatmentCategory = typeof treatmentCategories.$inferSelect;

export const treatments = pgTable("treatments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  categoryId: varchar("category_id").notNull().references(() => treatmentCategories.id),
  name: text("name").notNull(),
  duration: text("duration").notNull().default("30 min"),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).default("0.00"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  toothNumber: text("tooth_number"),
  dentistId: varchar("dentist_id"),
  assistantId: varchar("assistant_id"),
  status: text("status").default("pending"),
  notes: text("notes"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTreatmentSchema = createInsertSchema(treatments).omit({ id: true, createdAt: true });
export type InsertTreatment = z.infer<typeof insertTreatmentSchema>;
export type Treatment = typeof treatments.$inferSelect;

export const staff = pgTable("staff", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  role: text("role").notNull(),
  email: text("email"),
  phone: text("phone"),
  photoUrl: text("photo_url"),
  specialization: text("specialization"),
  commissionPercentage: decimal("commission_percentage", { precision: 5, scale: 2 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStaffSchema = createInsertSchema(staff).omit({ id: true, createdAt: true });
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type StaffMember = typeof staff.$inferSelect;

export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: text("invoice_number").unique(),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  doctorId: varchar("doctor_id").references(() => doctors.id),
  date: timestamp("date").notNull().defaultNow(),
  dueDate: timestamp("due_date"),
  status: text("status").notNull().default("Pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({ id: true, createdAt: true });
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

export const invoiceItems = pgTable("invoice_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").notNull().references(() => invoices.id),
  treatmentId: varchar("treatment_id").references(() => treatments.id),
  description: text("description").notNull(),
  toothNumber: integer("tooth_number"),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull().default("0.00"),
  discount: decimal("discount", { precision: 5, scale: 2 }).notNull().default("0.00"),
  tax: decimal("tax", { precision: 5, scale: 2 }).notNull().default("0.00"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({ id: true, createdAt: true });
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
export type InvoiceItem = typeof invoiceItems.$inferSelect;

export const treatmentPhases = pgTable("treatment_phases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  colorClass: text("color_class").notNull().default("bg-gray-100 text-gray-700"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTreatmentPhaseSchema = createInsertSchema(treatmentPhases).omit({ id: true, createdAt: true });
export type InsertTreatmentPhase = z.infer<typeof insertTreatmentPhaseSchema>;
export type TreatmentPhase = typeof treatmentPhases.$inferSelect;

export const patientTreatmentProgress = pgTable("patient_treatment_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  phaseId: varchar("phase_id").notNull().references(() => treatmentPhases.id),
  percentage: integer("percentage").notNull().default(0),
  isCurrent: boolean("is_current").notNull().default(false),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPatientTreatmentProgressSchema = createInsertSchema(patientTreatmentProgress).omit({ id: true, startedAt: true });
export type InsertPatientTreatmentProgress = z.infer<typeof insertPatientTreatmentProgressSchema>;
export type PatientTreatmentProgress = typeof patientTreatmentProgress.$inferSelect;

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id),
  invoiceId: varchar("invoice_id").references(() => invoices.id),
  type: text("type").notNull(),
  severity: text("severity").notNull().default("minor"),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("active"),
  isRead: boolean("is_read").notNull().default(false),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: varchar("invoice_id").notNull().references(() => invoices.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").notNull().defaultNow(),
  paymentMethod: text("payment_method").notNull().default("cash"),
  notes: text("notes"),
  receivedBy: varchar("received_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPaymentSchema = createInsertSchema(payments).omit({ id: true, createdAt: true });
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export const labCases = pgTable("lab_cases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  doctorId: varchar("doctor_id").notNull().references(() => doctors.id),
  labName: text("lab_name").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull().default("Sent"),
  dueDate: timestamp("due_date"),
  description: text("description"),
  cost: decimal("cost", { precision: 10, scale: 2 }).default("0.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertLabCaseSchema = createInsertSchema(labCases).omit({ id: true, createdAt: true });
export type InsertLabCase = z.infer<typeof insertLabCaseSchema>;
export type LabCase = typeof labCases.$inferSelect;

export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  assigneeId: varchar("assignee_id").references(() => staff.id),
  priority: text("priority").notNull().default("Medium"),
  dueDate: timestamp("due_date"),
  status: text("status").notNull().default("Pending"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true });
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export const clinicSettings = pgTable("clinic_settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertClinicSettingSchema = createInsertSchema(clinicSettings);
export type InsertClinicSetting = z.infer<typeof insertClinicSettingSchema>;
export type ClinicSetting = typeof clinicSettings.$inferSelect;

export const statusConfigs = pgTable("status_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  entityType: text("entity_type").notNull(),
  statusValue: text("status_value").notNull(),
  label: text("label").notNull(),
  colorClass: text("color_class").notNull().default("bg-gray-50 text-gray-700 border-gray-200"),
  iconName: text("icon_name"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStatusConfigSchema = createInsertSchema(statusConfigs).omit({ id: true });
export type InsertStatusConfig = z.infer<typeof insertStatusConfigSchema>;
export type StatusConfig = typeof statusConfigs.$inferSelect;

export const timeSlots = pgTable("time_slots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  label: text("label").notNull(),
  value: text("value").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertTimeSlotSchema = createInsertSchema(timeSlots).omit({ id: true });
export type InsertTimeSlot = z.infer<typeof insertTimeSlotSchema>;
export type TimeSlot = typeof timeSlots.$inferSelect;

// ─────────────────────────────────────────────
// MODULE 2: DENTAL CHART (ODONTOGRAM)
// ─────────────────────────────────────────────

export const dentalCharts = pgTable("dental_charts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  chartType: text("chart_type").notNull().default("permanent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [uniqueIndex("dental_charts_patient_unique").on(t.patientId)]);

export const insertDentalChartSchema = createInsertSchema(dentalCharts).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDentalChart = z.infer<typeof insertDentalChartSchema>;
export type DentalChart = typeof dentalCharts.$inferSelect;

export const dentalChartEntries = pgTable("dental_chart_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chartId: varchar("chart_id").notNull().references(() => dentalCharts.id),
  toothNumber: integer("tooth_number").notNull(),
  surface: text("surface"),
  status: text("status").notNull().default("healthy"),
  treatment: text("treatment"),
  treatmentDate: timestamp("treatment_date"),
  doctorId: varchar("doctor_id").references(() => doctors.id),
  notes: text("notes"),
  color: text("color"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [uniqueIndex("dental_chart_entries_unique").on(t.chartId, t.toothNumber, t.surface)]);

export const insertDentalChartEntrySchema = createInsertSchema(dentalChartEntries).omit({ id: true, createdAt: true });
export type InsertDentalChartEntry = z.infer<typeof insertDentalChartEntrySchema>;
export type DentalChartEntry = typeof dentalChartEntries.$inferSelect;

export const dentalChartNotes = pgTable("dental_chart_notes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  chartId: varchar("chart_id").notNull().references(() => dentalCharts.id),
  note: text("note").notNull(),
  authorId: varchar("author_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertDentalChartNoteSchema = createInsertSchema(dentalChartNotes).omit({ id: true, createdAt: true });
export type InsertDentalChartNote = z.infer<typeof insertDentalChartNoteSchema>;
export type DentalChartNote = typeof dentalChartNotes.$inferSelect;

// ─────────────────────────────────────────────
// MODULE 3: QUOTATIONS / ESTIMATES
// ─────────────────────────────────────────────

export const quotations = pgTable("quotations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quoteNumber: text("quote_number").notNull().unique(),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  doctorId: varchar("doctor_id").references(() => doctors.id),
  status: text("status").notNull().default("draft"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  discount: decimal("discount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  tax: decimal("tax", { precision: 10, scale: 2 }).notNull().default("0.00"),
  finalAmount: decimal("final_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  notes: text("notes"),
  validUntil: timestamp("valid_until"),
  convertedToInvoiceId: varchar("converted_to_invoice_id").references(() => invoices.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertQuotationSchema = createInsertSchema(quotations).omit({ id: true, createdAt: true, updatedAt: true }).extend({ quoteNumber: z.string().optional() });
export type InsertQuotation = z.infer<typeof insertQuotationSchema>;
export type Quotation = typeof quotations.$inferSelect;

export const quotationItems = pgTable("quotation_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  quotationId: varchar("quotation_id").notNull().references(() => quotations.id),
  treatmentId: varchar("treatment_id").references(() => treatments.id),
  description: text("description").notNull(),
  toothNumber: integer("tooth_number"),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull().default("0.00"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertQuotationItemSchema = createInsertSchema(quotationItems).omit({ id: true, createdAt: true });
export type InsertQuotationItem = z.infer<typeof insertQuotationItemSchema>;
export type QuotationItem = typeof quotationItems.$inferSelect;

// ─────────────────────────────────────────────
// MODULE 4: MEDICAL HISTORY
// ─────────────────────────────────────────────

export const medicalHistory = pgTable("medical_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  category: text("category").notNull(),
  value: text("value").notNull(),
  severity: text("severity"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  notes: text("notes"),
  isCurrent: boolean("is_current").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("medical_history_patient_idx").on(t.patientId),
  index("medical_history_category_idx").on(t.category),
]);

export const insertMedicalHistorySchema = createInsertSchema(medicalHistory).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertMedicalHistory = z.infer<typeof insertMedicalHistorySchema>;
export type MedicalHistoryRecord = typeof medicalHistory.$inferSelect;

// ─────────────────────────────────────────────
// MODULE 5: INVENTORY MANAGEMENT
// ─────────────────────────────────────────────

export const inventorySuppliers = pgTable("inventory_suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertInventorySupplierSchema = createInsertSchema(inventorySuppliers).omit({ id: true, createdAt: true });
export type InsertInventorySupplier = z.infer<typeof insertInventorySupplierSchema>;
export type InventorySupplier = typeof inventorySuppliers.$inferSelect;

export const inventoryProducts = pgTable("inventory_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  sku: text("sku").unique(),
  category: text("category"),
  description: text("description"),
  unit: text("unit").notNull().default("piece"),
  purchasePrice: decimal("purchase_price", { precision: 10, scale: 2 }).notNull().default("0.00"),
  sellingPrice: decimal("selling_price", { precision: 10, scale: 2 }).notNull().default("0.00"),
  currentStock: integer("current_stock").notNull().default(0),
  minimumStock: integer("minimum_stock").notNull().default(5),
  maximumStock: integer("maximum_stock").notNull().default(100),
  supplierId: varchar("supplier_id").references(() => inventorySuppliers.id),
  expirationDate: timestamp("expiration_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [index("inventory_products_category_idx").on(t.category)]);

export const insertInventoryProductSchema = createInsertSchema(inventoryProducts).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertInventoryProduct = z.infer<typeof insertInventoryProductSchema>;
export type InventoryProduct = typeof inventoryProducts.$inferSelect;

export const inventoryMovements = pgTable("inventory_movements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => inventoryProducts.id),
  type: text("type").notNull(),
  quantity: integer("quantity").notNull(),
  reference: text("reference"),
  notes: text("notes"),
  performedBy: varchar("performed_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [index("inventory_movements_product_idx").on(t.productId)]);

export const insertInventoryMovementSchema = createInsertSchema(inventoryMovements).omit({ id: true, createdAt: true });
export type InsertInventoryMovement = z.infer<typeof insertInventoryMovementSchema>;
export type InventoryMovement = typeof inventoryMovements.$inferSelect;

export const purchaseOrders = pgTable("purchase_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: text("order_number").notNull().unique(),
  supplierId: varchar("supplier_id").notNull().references(() => inventorySuppliers.id),
  status: text("status").notNull().default("draft"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  expectedDate: timestamp("expected_date"),
  receivedDate: timestamp("received_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPurchaseOrderSchema = createInsertSchema(purchaseOrders).omit({ id: true, createdAt: true, updatedAt: true }).extend({ orderNumber: z.string().optional() });
export type InsertPurchaseOrder = z.infer<typeof insertPurchaseOrderSchema>;
export type PurchaseOrder = typeof purchaseOrders.$inferSelect;

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => purchaseOrders.id),
  productId: varchar("product_id").notNull().references(() => inventoryProducts.id),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull().default("0.00"),
  total: decimal("total", { precision: 10, scale: 2 }).notNull().default("0.00"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertPurchaseOrderItemSchema = createInsertSchema(purchaseOrderItems).omit({ id: true, createdAt: true });
export type InsertPurchaseOrderItem = z.infer<typeof insertPurchaseOrderItemSchema>;
export type PurchaseOrderItem = typeof purchaseOrderItems.$inferSelect;

// ─────────────────────────────────────────────
// MODULE 6: EXPENSE MANAGEMENT
// ─────────────────────────────────────────────

export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: text("category").notNull(),
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date").notNull().defaultNow(),
  type: text("type").notNull().default("variable"),
  recurring: boolean("recurring").notNull().default(false),
  recurringInterval: text("recurring_interval"),
  supplierId: varchar("supplier_id").references(() => inventorySuppliers.id),
  notes: text("notes"),
  receiptUrl: text("receipt_url"),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("expenses_category_idx").on(t.category),
  index("expenses_date_idx").on(t.date),
]);

export const insertExpenseSchema = createInsertSchema(expenses).omit({ id: true, createdAt: true });
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

// ─────────────────────────────────────────────
// MODULE 7: PATIENT DOCUMENTS
// ─────────────────────────────────────────────

export const patientDocuments = pgTable("patient_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  category: text("category"),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  uploadedBy: varchar("uploaded_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [index("patient_documents_patient_idx").on(t.patientId)]);

export const insertPatientDocumentSchema = createInsertSchema(patientDocuments).omit({ id: true, createdAt: true });
export type InsertPatientDocument = z.infer<typeof insertPatientDocumentSchema>;
export type PatientDocument = typeof patientDocuments.$inferSelect;

// ─────────────────────────────────────────────
// MODULE 8A: PATIENT IMAGES (Dental Imaging)
// ─────────────────────────────────────────────

export const patientImages = pgTable("patient_images", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
  toothNumbers: text("tooth_numbers"),
  imageType: text("image_type").notNull().default("intraoral"),
  date: timestamp("date").defaultNow().notNull(),
  dentistId: varchar("dentist_id").references(() => doctors.id, { onDelete: "set null" }),
  clinicalNote: text("clinical_note"),
  tags: text("tags"),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  fileName: text("file_name"),
  uploadedBy: varchar("uploaded_by"),
  dicomMetadata: jsonb("dicom_metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("patient_images_patient_idx").on(t.patientId),
  index("patient_images_tooth_idx").on(t.toothNumbers),
  index("patient_images_type_idx").on(t.imageType),
  index("patient_images_date_idx").on(t.date),
]);

export const insertPatientImageSchema = createInsertSchema(patientImages).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPatientImage = z.infer<typeof insertPatientImageSchema>;
export type PatientImage = typeof patientImages.$inferSelect;

// ─────────────────────────────────────────────
// MODULE 8B: ELECTRONIC SIGNATURES
// ─────────────────────────────────────────────

export const signatures = pgTable("signatures", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").references(() => patients.id),
  staffId: varchar("staff_id").references(() => staff.id),
  documentType: text("document_type").notNull(),
  documentId: varchar("document_id"),
  signatureData: text("signature_data").notNull(),
  signedAt: timestamp("signed_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertSignatureSchema = createInsertSchema(signatures).omit({ id: true, createdAt: true });
export type InsertSignature = z.infer<typeof insertSignatureSchema>;
export type Signature = typeof signatures.$inferSelect;

// ─────────────────────────────────────────────
// MODULE 9: AUTOMATIC BACKUP SYSTEM
// ─────────────────────────────────────────────

export const backups = pgTable("backups", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  filename: text("filename").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size"),
  status: text("status").notNull().default("completed"),
  type: text("type").notNull().default("manual"),
  encrypted: boolean("encrypted").notNull().default(true),
  checksum: text("checksum"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertBackupSchema = createInsertSchema(backups).omit({ id: true, createdAt: true });
export type InsertBackup = z.infer<typeof insertBackupSchema>;
export type Backup = typeof backups.$inferSelect;

// ─────────────────────────────────────────────
// MODULE 10: AUDIT TRAIL
// ─────────────────────────────────────────────

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  username: text("username"),
  action: text("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: varchar("entity_id"),
  entityName: text("entity_name"),
  previousValue: jsonb("previous_value"),
  newValue: jsonb("new_value"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("audit_logs_user_idx").on(t.userId),
  index("audit_logs_entity_idx").on(t.entityType, t.entityId),
  index("audit_logs_created_idx").on(t.createdAt),
]);

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({ id: true, createdAt: true });
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

// ─────────────────────────────────────────────
// MODULE 14: GLOBAL SEARCH
// ─────────────────────────────────────────────
// (Implemented via API endpoints, no dedicated table needed)

// ─────────────────────────────────────────────
// MODULE 15: SESSION MANAGEMENT
// ─────────────────────────────────────────────

export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  token: text("token").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [index("user_sessions_user_idx").on(t.userId)]);

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserSession = typeof userSessions.$inferSelect;

// ─────────────────────────────────────────────
// MODULE 16: APPOINTMENT TYPES
// ─────────────────────────────────────────────

export const appointmentTypes = pgTable("appointment_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
  defaultDuration: integer("default_duration").notNull().default(30),
  color: text("color"),
  isActive: boolean("is_active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertAppointmentTypeSchema = createInsertSchema(appointmentTypes).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertAppointmentType = z.infer<typeof insertAppointmentTypeSchema>;
export type AppointmentType = typeof appointmentTypes.$inferSelect;

// ─────────────────────────────────────────────
// MODULE 17: ROOMS
// ─────────────────────────────────────────────

export const rooms = pgTable("rooms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  description: text("description"),
  capacity: integer("capacity").notNull().default(1),
  equipment: text("equipment"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertRoomSchema = createInsertSchema(rooms).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof rooms.$inferSelect;

// ─────────────────────────────────────────────
// MODULE 18: PATIENT TREATMENTS (proper instances)
// ─────────────────────────────────────────────

export const patientTreatments = pgTable("patient_treatments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
  treatmentId: varchar("treatment_id").references(() => treatments.id, { onDelete: "set null" }),
  doctorId: varchar("doctor_id").references(() => doctors.id, { onDelete: "set null" }),
  assistantId: varchar("assistant_id").references(() => staff.id, { onDelete: "set null" }),
  toothNumber: text("tooth_number"),
  surface: text("surface"),
  status: text("status").notNull().default("pending"),
  priority: text("priority").notNull().default("medium"),
  notes: text("notes"),
  cost: decimal("cost", { precision: 10, scale: 2 }).default("0.00"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("patient_treatments_patient_id_idx").on(t.patientId),
  index("patient_treatments_doctor_id_idx").on(t.doctorId),
  index("patient_treatments_status_idx").on(t.status),
  index("patient_treatments_treatment_id_idx").on(t.treatmentId),
]);

export const insertPatientTreatmentSchema = createInsertSchema(patientTreatments).omit({ id: true, createdAt: true, updatedAt: true, startedAt: true });
export type InsertPatientTreatment = z.infer<typeof insertPatientTreatmentSchema>;
export type PatientTreatment = typeof patientTreatments.$inferSelect;

// ─────────────────────────────────────────────
// MODULE 19: PRESCRIPTIONS
// ─────────────────────────────────────────────

export const prescriptions = pgTable("prescriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
  doctorId: varchar("doctor_id").references(() => doctors.id, { onDelete: "set null" }),
  diagnosis: text("diagnosis"),
  notes: text("notes"),
  status: text("status").notNull().default("active"),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("prescriptions_patient_id_idx").on(t.patientId),
  index("prescriptions_doctor_id_idx").on(t.doctorId),
  index("prescriptions_status_idx").on(t.status),
]);

export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({ id: true, createdAt: true, updatedAt: true, issuedAt: true });
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type Prescription = typeof prescriptions.$inferSelect;

export const prescriptionItems = pgTable("prescription_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  prescriptionId: varchar("prescription_id").notNull().references(() => prescriptions.id, { onDelete: "cascade" }),
  medicationName: text("medication_name").notNull(),
  dosage: text("dosage"),
  frequency: text("frequency"),
  duration: text("duration"),
  instructions: text("instructions"),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => [
  index("prescription_items_prescription_id_idx").on(t.prescriptionId),
]);

export const insertPrescriptionItemSchema = createInsertSchema(prescriptionItems).omit({ id: true, createdAt: true });
export type InsertPrescriptionItem = z.infer<typeof insertPrescriptionItemSchema>;
export type PrescriptionItem = typeof prescriptionItems.$inferSelect;

// ─────────────────────────────────────────────
// MODULE 20: RECALL REMINDERS
// ─────────────────────────────────────────────

export const recallReminders = pgTable("recall_reminders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
  appointmentId: varchar("appointment_id").references(() => appointments.id, { onDelete: "set null" }),
  reminderType: text("reminder_type").notNull().default("follow_up"),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  status: text("status").notNull().default("pending"),
  notifiedAt: timestamp("notified_at"),
  completedAt: timestamp("completed_at"),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("recall_reminders_patient_id_idx").on(t.patientId),
  index("recall_reminders_appointment_id_idx").on(t.appointmentId),
  index("recall_reminders_due_date_idx").on(t.dueDate),
  index("recall_reminders_status_idx").on(t.status),
]);

export const insertRecallReminderSchema = createInsertSchema(recallReminders).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertRecallReminder = z.infer<typeof insertRecallReminderSchema>;
export type RecallReminder = typeof recallReminders.$inferSelect;

// ─────────────────────────────────────────────
// MODULE 21: DOCTOR SCHEDULES
// ─────────────────────────────────────────────

export const doctorSchedules = pgTable("doctor_schedules", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  doctorId: varchar("doctor_id").notNull().references(() => doctors.id, { onDelete: "cascade" }),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("doctor_schedules_doctor_id_idx").on(t.doctorId),
  index("doctor_schedules_day_of_week_idx").on(t.dayOfWeek),
]);

export const insertDoctorScheduleSchema = createInsertSchema(doctorSchedules).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertDoctorSchedule = z.infer<typeof insertDoctorScheduleSchema>;
export type DoctorSchedule = typeof doctorSchedules.$inferSelect;

// ─────────────────────────────────────────────
// MODULE 22: BLOCKED TIMES
// ─────────────────────────────────────────────

export const blockedTimes = pgTable("blocked_times", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  doctorId: varchar("doctor_id").notNull().references(() => doctors.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  recurrence: text("recurrence"),
  createdBy: varchar("created_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("blocked_times_doctor_id_idx").on(t.doctorId),
  index("blocked_times_start_time_idx").on(t.startTime),
  index("blocked_times_end_time_idx").on(t.endTime),
]);

export const insertBlockedTimeSchema = createInsertSchema(blockedTimes).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBlockedTime = z.infer<typeof insertBlockedTimeSchema>;
export type BlockedTime = typeof blockedTimes.$inferSelect;

// ─────────────────────────────────────────────
// MODULE 23: INSURANCE CLAIMS
// ─────────────────────────────────────────────

export const insuranceClaims = pgTable("insurance_claims", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }),
  invoiceId: varchar("invoice_id").references(() => invoices.id, { onDelete: "set null" }),
  insuranceProvider: text("insurance_provider").notNull(),
  policyNumber: text("policy_number"),
  claimNumber: text("claim_number"),
  claimAmount: decimal("claim_amount", { precision: 10, scale: 2 }).notNull(),
  approvedAmount: decimal("approved_amount", { precision: 10, scale: 2 }).default("0.00"),
  status: text("status").notNull().default("submitted"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("insurance_claims_patient_id_idx").on(t.patientId),
  index("insurance_claims_invoice_id_idx").on(t.invoiceId),
  index("insurance_claims_status_idx").on(t.status),
]);

export const insertInsuranceClaimSchema = createInsertSchema(insuranceClaims).omit({ id: true, createdAt: true, updatedAt: true, submittedAt: true });
export type InsertInsuranceClaim = z.infer<typeof insertInsuranceClaimSchema>;
export type InsuranceClaim = typeof insuranceClaims.$inferSelect;

// ─────────────────────────────────────────────
// MODULE 24: PATIENT STATISTICS
// ─────────────────────────────────────────────

export const patientStatistics = pgTable("patient_statistics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  patientId: varchar("patient_id").notNull().references(() => patients.id, { onDelete: "cascade" }).unique(),
  totalVisits: integer("total_visits").notNull().default(0),
  totalTreatments: integer("total_treatments").notNull().default(0),
  totalInvoiced: decimal("total_invoiced", { precision: 10, scale: 2 }).notNull().default("0.00"),
  totalPaid: decimal("total_paid", { precision: 10, scale: 2 }).notNull().default("0.00"),
  outstandingBalance: decimal("outstanding_balance", { precision: 10, scale: 2 }).notNull().default("0.00"),
  lastVisitDate: timestamp("last_visit_date"),
  nextAppointmentDate: timestamp("next_appointment_date"),
  preferredDoctorId: varchar("preferred_doctor_id").references(() => doctors.id, { onDelete: "set null" }),
  riskLevel: text("risk_level").default("low"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
  index("patient_statistics_preferred_doctor_id_idx").on(t.preferredDoctorId),
  index("patient_statistics_risk_level_idx").on(t.riskLevel),
]);

export const insertPatientStatisticsSchema = createInsertSchema(patientStatistics).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPatientStatistics = z.infer<typeof insertPatientStatisticsSchema>;
export type PatientStatistics = typeof patientStatistics.$inferSelect;

// ─────────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────────

export const patientsRelations = relations(patients, ({ many }) => ({
  appointments: many(appointments),
  invoices: many(invoices),
  labCases: many(labCases),
  treatmentProgress: many(patientTreatmentProgress),
  notifications: many(notifications),
  dentalChart: many(dentalCharts),
  quotations: many(quotations),
  medicalHistory: many(medicalHistory),
  documents: many(patientDocuments),
  patientTreatments: many(patientTreatments),
  prescriptions: many(prescriptions),
  recallReminders: many(recallReminders),
  insuranceClaims: many(insuranceClaims),
}));

export const doctorsRelations = relations(doctors, ({ many }) => ({
  appointments: many(appointments),
  labCases: many(labCases),
  dentalChartEntries: many(dentalChartEntries),
  quotations: many(quotations),
  patientTreatments: many(patientTreatments),
  prescriptions: many(prescriptions),
  doctorSchedules: many(doctorSchedules),
  blockedTimes: many(blockedTimes),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  patient: one(patients, { fields: [appointments.patientId], references: [patients.id] }),
  doctor: one(doctors, { fields: [appointments.doctorId], references: [doctors.id] }),
  recallReminders: many(recallReminders),
}));

export const treatmentCategoriesRelations = relations(treatmentCategories, ({ many }) => ({
  treatments: many(treatments),
}));

export const treatmentsRelations = relations(treatments, ({ one, many }) => ({
  category: one(treatmentCategories, { fields: [treatments.categoryId], references: [treatmentCategories.id] }),
  patientTreatments: many(patientTreatments),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  patient: one(patients, { fields: [invoices.patientId], references: [patients.id] }),
  payments: many(payments),
  items: many(invoiceItems),
  doctor: one(doctors, { fields: [invoices.doctorId], references: [doctors.id] }),
  insuranceClaims: many(insuranceClaims),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, { fields: [invoiceItems.invoiceId], references: [invoices.id] }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, { fields: [payments.invoiceId], references: [invoices.id] }),
}));

export const labCasesRelations = relations(labCases, ({ one }) => ({
  patient: one(patients, { fields: [labCases.patientId], references: [patients.id] }),
  doctor: one(doctors, { fields: [labCases.doctorId], references: [doctors.id] }),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  assignee: one(staff, { fields: [tasks.assigneeId], references: [staff.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  patient: one(patients, { fields: [notifications.patientId], references: [patients.id] }),
  invoice: one(invoices, { fields: [notifications.invoiceId], references: [invoices.id] }),
}));

export const patientTreatmentProgressRelations = relations(patientTreatmentProgress, ({ one }) => ({
  patient: one(patients, { fields: [patientTreatmentProgress.patientId], references: [patients.id] }),
  phase: one(treatmentPhases, { fields: [patientTreatmentProgress.phaseId], references: [treatmentPhases.id] }),
}));

export const dentalChartsRelations = relations(dentalCharts, ({ one, many }) => ({
  patient: one(patients, { fields: [dentalCharts.patientId], references: [patients.id] }),
  entries: many(dentalChartEntries),
  notes: many(dentalChartNotes),
}));

export const dentalChartEntriesRelations = relations(dentalChartEntries, ({ one }) => ({
  chart: one(dentalCharts, { fields: [dentalChartEntries.chartId], references: [dentalCharts.id] }),
  doctor: one(doctors, { fields: [dentalChartEntries.doctorId], references: [doctors.id] }),
}));

export const dentalChartNotesRelations = relations(dentalChartNotes, ({ one }) => ({
  chart: one(dentalCharts, { fields: [dentalChartNotes.chartId], references: [dentalCharts.id] }),
}));

export const quotationsRelations = relations(quotations, ({ one, many }) => ({
  patient: one(patients, { fields: [quotations.patientId], references: [patients.id] }),
  doctor: one(doctors, { fields: [quotations.doctorId], references: [doctors.id] }),
  items: many(quotationItems),
  convertedInvoice: one(invoices, { fields: [quotations.convertedToInvoiceId], references: [invoices.id] }),
}));

export const quotationItemsRelations = relations(quotationItems, ({ one }) => ({
  quotation: one(quotations, { fields: [quotationItems.quotationId], references: [quotations.id] }),
  treatment: one(treatments, { fields: [quotationItems.treatmentId], references: [treatments.id] }),
}));

export const medicalHistoryRelations = relations(medicalHistory, ({ one }) => ({
  patient: one(patients, { fields: [medicalHistory.patientId], references: [patients.id] }),
}));

export const inventoryProductsRelations = relations(inventoryProducts, ({ one, many }) => ({
  supplier: one(inventorySuppliers, { fields: [inventoryProducts.supplierId], references: [inventorySuppliers.id] }),
  movements: many(inventoryMovements),
}));

export const inventorySuppliersRelations = relations(inventorySuppliers, ({ many }) => ({
  products: many(inventoryProducts),
  expenses: many(expenses),
  purchaseOrders: many(purchaseOrders),
}));

export const inventoryMovementsRelations = relations(inventoryMovements, ({ one }) => ({
  product: one(inventoryProducts, { fields: [inventoryMovements.productId], references: [inventoryProducts.id] }),
}));

export const purchaseOrdersRelations = relations(purchaseOrders, ({ one, many }) => ({
  supplier: one(inventorySuppliers, { fields: [purchaseOrders.supplierId], references: [inventorySuppliers.id] }),
  items: many(purchaseOrderItems),
}));

export const purchaseOrderItemsRelations = relations(purchaseOrderItems, ({ one }) => ({
  order: one(purchaseOrders, { fields: [purchaseOrderItems.orderId], references: [purchaseOrders.id] }),
  product: one(inventoryProducts, { fields: [purchaseOrderItems.productId], references: [inventoryProducts.id] }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  supplier: one(inventorySuppliers, { fields: [expenses.supplierId], references: [inventorySuppliers.id] }),
}));

export const patientDocumentsRelations = relations(patientDocuments, ({ one }) => ({
  patient: one(patients, { fields: [patientDocuments.patientId], references: [patients.id] }),
}));

export const patientImagesRelations = relations(patientImages, ({ one }) => ({
  patient: one(patients, { fields: [patientImages.patientId], references: [patients.id] }),
  dentist: one(doctors, { fields: [patientImages.dentistId], references: [doctors.id] }),
}));

export const signaturesRelations = relations(signatures, ({ one }) => ({
  patient: one(patients, { fields: [signatures.patientId], references: [patients.id] }),
  staff: one(staff, { fields: [signatures.staffId], references: [staff.id] }),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, { fields: [userSessions.userId], references: [users.id] }),
}));

// ─────────────────────────────────────────────
// NEW TABLE RELATIONS
// ─────────────────────────────────────────────

export const patientTreatmentsRelations = relations(patientTreatments, ({ one }) => ({
  patient: one(patients, { fields: [patientTreatments.patientId], references: [patients.id] }),
  treatment: one(treatments, { fields: [patientTreatments.treatmentId], references: [treatments.id] }),
  doctor: one(doctors, { fields: [patientTreatments.doctorId], references: [doctors.id] }),
  assistant: one(staff, { fields: [patientTreatments.assistantId], references: [staff.id] }),
}));

export const prescriptionsRelations = relations(prescriptions, ({ one, many }) => ({
  patient: one(patients, { fields: [prescriptions.patientId], references: [patients.id] }),
  doctor: one(doctors, { fields: [prescriptions.doctorId], references: [doctors.id] }),
  items: many(prescriptionItems),
}));

export const prescriptionItemsRelations = relations(prescriptionItems, ({ one }) => ({
  prescription: one(prescriptions, { fields: [prescriptionItems.prescriptionId], references: [prescriptions.id] }),
}));

export const recallRemindersRelations = relations(recallReminders, ({ one }) => ({
  patient: one(patients, { fields: [recallReminders.patientId], references: [patients.id] }),
  appointment: one(appointments, { fields: [recallReminders.appointmentId], references: [appointments.id] }),
}));

export const doctorSchedulesRelations = relations(doctorSchedules, ({ one }) => ({
  doctor: one(doctors, { fields: [doctorSchedules.doctorId], references: [doctors.id] }),
}));

export const blockedTimesRelations = relations(blockedTimes, ({ one }) => ({
  doctor: one(doctors, { fields: [blockedTimes.doctorId], references: [doctors.id] }),
}));

export const insuranceClaimsRelations = relations(insuranceClaims, ({ one }) => ({
  patient: one(patients, { fields: [insuranceClaims.patientId], references: [patients.id] }),
  invoice: one(invoices, { fields: [insuranceClaims.invoiceId], references: [invoices.id] }),
}));

export const patientStatisticsRelations = relations(patientStatistics, ({ one }) => ({
  patient: one(patients, { fields: [patientStatistics.patientId], references: [patients.id] }),
  preferredDoctor: one(doctors, { fields: [patientStatistics.preferredDoctorId], references: [doctors.id] }),
}));
