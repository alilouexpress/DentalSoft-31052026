import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  insertPatientSchema, insertDoctorSchema, insertAppointmentSchema,
  insertTreatmentCategorySchema, insertTreatmentSchema,
  insertStaffSchema, insertInvoiceSchema, insertInvoiceItemSchema, insertPaymentSchema,
  insertLabCaseSchema, insertTaskSchema, insertStatusConfigSchema, insertTimeSlotSchema,
  insertUserSchema, insertTreatmentPhaseSchema, insertPatientTreatmentProgressSchema,
  insertPatientTreatmentSchema, insertNotificationSchema, insertDentalChartSchema, insertDentalChartEntrySchema,
  insertDentalChartNoteSchema, insertQuotationSchema, insertQuotationItemSchema,
  insertMedicalHistorySchema, insertInventoryProductSchema, insertInventorySupplierSchema,
  insertExpenseSchema,   insertPatientDocumentSchema, insertPatientImageSchema, insertSignatureSchema,
  insertAuditLogSchema, insertInventoryMovementSchema, insertPurchaseOrderSchema,
  insertPurchaseOrderItemSchema, insertPrescriptionSchema, insertPrescriptionItemSchema,
} from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { authMiddleware, requireRole, generateToken, hashPassword, comparePassword } from "./auth";

const uploadsDir = path.join(process.cwd(), "uploads");
const avatarsDir = path.join(uploadsDir, "avatars");
fs.mkdirSync(avatarsDir, { recursive: true });
const upload = multer({ dest: avatarsDir });

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  function wrap(fn: (req: any, res: any) => Promise<void>) {
    return (req: any, res: any) => fn(req, res).catch((err: any) => {
      console.error("Route error:", err);
      res.status(500).json({ error: err.message || "Internal error" });
    });
  }

  // Backfill: sync existing staff (Doctor/Admin) into doctors table
  try {
    const allStaff = await storage.getStaff();
    for (const member of allStaff) {
      if (member.role === "Doctor" || member.role === "Admin") {
        await storage.syncDoctorFromStaff(member);
      }
    }
  } catch (e) {
    console.error("Doctor backfill error (non-fatal):", e);
  }

  // --- Auth ---
  app.post("/api/auth/login", wrap(async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Nom d'utilisateur et mot de passe requis" });
    const user = await storage.getUserByUsername(username);
    if (!user) return res.status(401).json({ error: "Identifiants incorrects" });
    const valid = await comparePassword(password, user.password);
    if (!valid) return res.status(401).json({ error: "Identifiants incorrects" });
    const token = generateToken({ userId: user.id, username: user.username, role: user.role, staffId: user.staffId || null });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, staffId: user.staffId } });
  }));

  app.get("/api/auth/me", authMiddleware, wrap(async (req, res) => {
    const user = (req as any).user;
    const fullUser = await storage.getUser(user.userId);
    if (!fullUser) return res.status(404).json({ error: "Utilisateur non trouvé" });
    res.json({ id: fullUser.id, username: fullUser.username, role: fullUser.role, staffId: fullUser.staffId });
  }));

  // --- Users (admin only) ---
  app.get("/api/users", authMiddleware, requireRole("admin"), wrap(async (req, res) => {
    const users = await storage.getUsers();
    res.json(users.map(u => ({ id: u.id, username: u.username, role: u.role, staffId: u.staffId })));
  }));

  app.post("/api/users", authMiddleware, requireRole("admin"), wrap(async (req, res) => {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const existing = await storage.getUserByUsername(result.data.username);
    if (existing) return res.status(409).json({ error: "Nom d'utilisateur déjà pris" });
    const hashedPassword = await hashPassword(result.data.password);
    const user = await storage.createUser({ ...result.data, password: hashedPassword });
    res.status(201).json({ id: user.id, username: user.username, role: user.role, staffId: user.staffId });
  }));

  app.delete("/api/users/:id", authMiddleware, requireRole("admin"), wrap(async (req, res) => {
    await storage.deleteUser(req.params.id);
    res.status(204).send();
  }));

  // Protect all following routes
  app.use("/api", authMiddleware);

  // --- Patients ---
  app.get("/api/patients", wrap(async (req, res) => {
    const patients = await storage.getPatients();
    res.json(patients);
  }));

  app.get("/api/patients/:id", wrap(async (req, res) => {
    const patient = await storage.getPatient(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(patient);
  }));

  app.post("/api/patients", wrap(async (req, res) => {
    const result = insertPatientSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const patient = await storage.createPatient(result.data);
    res.status(201).json(patient);
  }));

  app.patch("/api/patients/:id", wrap(async (req, res) => {
    const result = insertPatientSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const patient = await storage.updatePatient(req.params.id, result.data);
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(patient);
  }));

  app.delete("/api/patients/:id", wrap(async (req, res) => {
    const success = await storage.deletePatient(req.params.id);
    if (!success) return res.status(404).json({ error: "Patient not found" });
    res.status(204).send();
  }));

  app.post("/api/patients/:id/photo", upload.single("photo"), wrap(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const ext = path.extname(req.file.originalname) || ".jpg";
    const filename = `${req.params.id}${ext}`;
    const destPath = path.join(avatarsDir, filename);
    fs.renameSync(req.file.path, destPath);
    const photoUrl = `/uploads/avatars/${filename}`;
    const updated = await storage.updatePatient(req.params.id, { photoUrl });
    if (!updated) return res.status(404).json({ error: "Patient not found" });
    res.json({ photoUrl });
  }));

  // --- Doctors ---
  app.get("/api/doctors", wrap(async (req, res) => {
    const doctors = await storage.getDoctors();
    res.json(doctors);
  }));

  app.post("/api/doctors", wrap(async (req, res) => {
    const result = insertDoctorSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const doctor = await storage.createDoctor(result.data);
    res.status(201).json(doctor);
  }));

  app.patch("/api/doctors/:id", wrap(async (req, res) => {
    const result = insertDoctorSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const doctor = await storage.updateDoctor(req.params.id, result.data);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    res.json(doctor);
  }));

  app.delete("/api/doctors/:id", wrap(async (req, res) => {
    const success = await storage.deleteDoctor(req.params.id);
    if (!success) return res.status(404).json({ error: "Doctor not found" });
    res.status(204).send();
  }));

  // --- Appointments ---
  app.get("/api/appointments", wrap(async (req, res) => {
    const { date } = req.query;
    let appointments;
    if (date && typeof date === "string") {
      appointments = await storage.getAppointmentsByDate(new Date(date));
    } else {
      appointments = await storage.getAppointments();
    }
    res.json(appointments);
  }));

  app.post("/api/appointments", wrap(async (req, res) => {
    const body = { ...req.body, appointmentDate: req.body.appointmentDate ? new Date(req.body.appointmentDate) : undefined };
    const result = insertAppointmentSchema.safeParse(body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const appointment = await storage.createAppointment(result.data);
    res.status(201).json(appointment);
  }));

  app.patch("/api/appointments/:id", wrap(async (req, res) => {
    const body = { ...req.body, appointmentDate: req.body.appointmentDate ? new Date(req.body.appointmentDate) : undefined };
    const result = insertAppointmentSchema.partial().safeParse(body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const appointment = await storage.updateAppointment(req.params.id, result.data);
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    res.json(appointment);
  }));

  app.delete("/api/appointments/:id", wrap(async (req, res) => {
    const success = await storage.deleteAppointment(req.params.id);
    if (!success) return res.status(404).json({ error: "Appointment not found" });
    res.status(204).send();
  }));

  // --- Treatment Categories ---
  app.get("/api/treatment-categories", wrap(async (req, res) => {
    const categories = await storage.getTreatmentCategories();
    res.json(categories);
  }));

  app.post("/api/treatment-categories", wrap(async (req, res) => {
    const result = insertTreatmentCategorySchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const category = await storage.createTreatmentCategory(result.data);
    res.status(201).json(category);
  }));

  app.delete("/api/treatment-categories/:id", wrap(async (req, res) => {
    const success = await storage.deleteTreatmentCategory(req.params.id);
    if (!success) return res.status(404).json({ error: "Category not found" });
    res.status(204).send();
  }));

  // --- Treatments ---
  app.get("/api/treatments", wrap(async (req, res) => {
    const { categoryId } = req.query;
    let treatments;
    if (categoryId && typeof categoryId === "string") {
      treatments = await storage.getTreatmentsByCategory(categoryId);
    } else {
      treatments = await storage.getTreatments();
    }
    res.json(treatments);
  }));

  app.post("/api/treatments", wrap(async (req, res) => {
    const result = insertTreatmentSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const treatment = await storage.createTreatment(result.data);
    res.status(201).json(treatment);
  }));

  app.patch("/api/treatments/:id", wrap(async (req, res) => {
    const result = insertTreatmentSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const treatment = await storage.updateTreatment(req.params.id, result.data);
    if (!treatment) return res.status(404).json({ error: "Treatment not found" });
    res.json(treatment);
  }));

  app.delete("/api/treatments/:id", wrap(async (req, res) => {
    const success = await storage.deleteTreatment(req.params.id);
    if (!success) return res.status(404).json({ error: "Treatment not found" });
    res.status(204).send();
  }));

  // --- Staff ---
  app.get("/api/staff", wrap(async (req, res) => {
    const staff = await storage.getStaff();
    res.json(staff);
  }));

  app.post("/api/staff", wrap(async (req, res) => {
    const result = insertStaffSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const member = await storage.createStaff(result.data);
    res.status(201).json(member);
  }));

  app.patch("/api/staff/:id", wrap(async (req, res) => {
    const result = insertStaffSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const member = await storage.updateStaff(req.params.id, result.data);
    if (!member) return res.status(404).json({ error: "Staff not found" });
    res.json(member);
  }));

  app.delete("/api/staff/:id", wrap(async (req, res) => {
    const success = await storage.deleteStaff(req.params.id);
    if (!success) return res.status(404).json({ error: "Staff not found" });
    res.status(204).send();
  }));

  app.post("/api/staff/:id/avatar", upload.single("avatar"), wrap(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const ext = path.extname(req.file.originalname) || ".jpg";
    const filename = `${req.params.id}${ext}`;
    const destPath = path.join(avatarsDir, filename);
    fs.renameSync(req.file.path, destPath);
    const photoUrl = `/uploads/avatars/${filename}`;
    const updated = await storage.updateStaff(req.params.id, { photoUrl });
    if (!updated) return res.status(404).json({ error: "Staff not found" });
    res.json({ photoUrl });
  }));

  app.use("/uploads", express.static(uploadsDir));

  // --- Invoices ---
  app.get("/api/invoices", wrap(async (req, res) => {
    const invoices = await storage.getInvoices();
    res.json(invoices);
  }));

  app.post("/api/invoices", wrap(async (req, res) => {
    const body = { ...req.body, date: req.body.date ? new Date(req.body.date) : undefined, dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined };
    const result = insertInvoiceSchema.safeParse(body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const invoice = await storage.createInvoice(result.data);
    res.status(201).json(invoice);
  }));

  app.patch("/api/invoices/:id", wrap(async (req, res) => {
    const result = insertInvoiceSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const invoice = await storage.updateInvoice(req.params.id, result.data);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    res.json(invoice);
  }));

  app.delete("/api/invoices/:id", wrap(async (req, res) => {
    const success = await storage.deleteInvoice(req.params.id);
    if (!success) return res.status(404).json({ error: "Invoice not found" });
    res.status(204).send();
  }));

  // --- Payments ---
  app.get("/api/invoices/:id/payments", wrap(async (req, res) => {
    const payments = await storage.getPaymentsByInvoice(req.params.id);
    res.json(payments);
  }));

  // --- Invoice Detail (for printing) ---
  app.get("/api/invoices/:id/detail", wrap(async (req, res) => {
    const detail = await storage.getInvoiceDetail(req.params.id);
    if (!detail) return res.status(404).json({ error: "Invoice not found" });
    res.json(detail);
  }));

  // --- Invoice Items ---
  app.get("/api/invoices/:id/items", wrap(async (req, res) => {
    const items = await storage.getInvoiceItems(req.params.id);
    res.json(items);
  }));

  app.post("/api/invoices/:id/items", wrap(async (req, res) => {
    const result = insertInvoiceItemSchema.partial().safeParse({ ...req.body, invoiceId: req.params.id });
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const item = await storage.createInvoiceItem(result.data as any);
    res.status(201).json(item);
  }));

  app.delete("/api/invoices/:id/items", wrap(async (req, res) => {
    await storage.deleteInvoiceItems(req.params.id);
    res.status(204).send();
  }));

  app.get("/api/patients/:id/payments", wrap(async (req, res) => {
    const payments = await storage.getPaymentsByPatient(req.params.id);
    res.json(payments);
  }));

  app.get("/api/patients/:id/debt", wrap(async (req, res) => {
    const summary = await storage.getPatientDebtSummary(req.params.id);
    res.json(summary);
  }));

  app.post("/api/payments", wrap(async (req, res) => {
    const body = { ...req.body, paymentDate: req.body.paymentDate ? new Date(req.body.paymentDate) : undefined };
    const result = insertPaymentSchema.safeParse(body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    try {
      const payment = await storage.createPayment(result.data);
      res.status(201).json(payment);
    } catch (err: any) {
      if (err.message?.includes("dépasse le montant")) return res.status(400).json({ error: err.message });
      throw err;
    }
  }));

  app.delete("/api/payments/:id", wrap(async (req, res) => {
    const success = await storage.deletePayment(req.params.id);
    if (!success) return res.status(404).json({ error: "Payment not found" });
    res.status(204).send();
  }));

  app.patch("/api/payments/:id", requireRole("admin"), wrap(async (req, res) => {
    const body = { ...req.body, paymentDate: req.body.paymentDate ? new Date(req.body.paymentDate) : undefined };
    const result = insertPaymentSchema.partial().safeParse(body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const payment = await storage.updatePayment(req.params.id, result.data);
    if (!payment) return res.status(404).json({ error: "Payment not found" });
    res.json(payment);
  }));

  // --- Debts ---
  app.get("/api/debts", wrap(async (req, res) => {
    const debtors = await storage.getDebtorsList();
    res.json(debtors);
  }));

  app.get("/api/debts/overdue", wrap(async (req, res) => {
    const debtors = await storage.getDebtorsList();
    res.json(debtors.filter(d => d.overdueDays > 0));
  }));

  // --- Prescriptions ---
  app.get("/api/patients/:patientId/prescriptions", wrap(async (req, res) => {
    const prescriptions = await storage.getPrescriptions(req.params.patientId);
    res.json(prescriptions);
  }));

  app.get("/api/prescriptions/:id", wrap(async (req, res) => {
    const prescription = await storage.getPrescription(req.params.id);
    if (!prescription) return res.status(404).json({ error: "Prescription not found" });
    res.json(prescription);
  }));

  app.post("/api/prescriptions", wrap(async (req, res) => {
    const result = insertPrescriptionSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const prescription = await storage.createPrescription(result.data);
    res.status(201).json(prescription);
  }));

  app.patch("/api/prescriptions/:id", wrap(async (req, res) => {
    const result = insertPrescriptionSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const prescription = await storage.updatePrescription(req.params.id, result.data);
    if (!prescription) return res.status(404).json({ error: "Prescription not found" });
    res.json(prescription);
  }));

  app.delete("/api/prescriptions/:id", wrap(async (req, res) => {
    const deleted = await storage.deletePrescription(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Prescription not found" });
    res.status(204).send();
  }));

  app.post("/api/prescriptions/:id/items", wrap(async (req, res) => {
    const result = insertPrescriptionItemSchema.safeParse({ ...req.body, prescriptionId: req.params.id });
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const item = await storage.addPrescriptionItem(result.data);
    res.status(201).json(item);
  }));

  // --- Treatment Phases ---
  app.get("/api/treatment-phases", wrap(async (req, res) => {
    const phases = await storage.getTreatmentPhases();
    res.json(phases);
  }));

  app.post("/api/treatment-phases", wrap(async (req, res) => {
    const result = insertTreatmentPhaseSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const phase = await storage.createTreatmentPhase(result.data);
    res.status(201).json(phase);
  }));

  app.delete("/api/treatment-phases/:id", wrap(async (req, res) => {
    const success = await storage.deleteTreatmentPhase(req.params.id);
    if (!success) return res.status(404).json({ error: "Treatment phase not found" });
    res.status(204).send();
  }));

  // --- Patient Treatment Progress ---
  app.get("/api/patients/:id/treatment-progress", wrap(async (req, res) => {
    const progress = await storage.getPatientTreatmentProgress(req.params.id);
    res.json(progress);
  }));

  app.post("/api/patients/:id/treatment-progress", wrap(async (req, res) => {
    const body = { ...req.body, patientId: req.params.id, startedAt: req.body.startedAt ? new Date(req.body.startedAt) : undefined, completedAt: req.body.completedAt ? new Date(req.body.completedAt) : undefined };
    const result = insertPatientTreatmentProgressSchema.safeParse(body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const progress = await storage.upsertPatientTreatmentProgress(result.data);
    res.status(201).json(progress);
  }));

  // --- Patient Treatments (Treatment Plan) ---
  app.get("/api/patients/:id/treatments", wrap(async (req, res) => {
    const treatments = await storage.getPatientTreatments(req.params.id);
    res.json(treatments);
  }));

  app.get("/api/treatments/:id/history", wrap(async (req, res) => {
    const logs = await storage.getAuditLogsByEntity("patient_treatment", req.params.id);
    res.json(logs);
  }));

  app.post("/api/patients/:id/treatments", wrap(async (req, res) => {
    const body = { ...req.body, patientId: req.params.id };
    const result = insertPatientTreatmentSchema.safeParse(body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const treatment = await storage.createPatientTreatment(result.data);
    const user = (req as any).user;
    await storage.createAuditLog({
      userId: user?.userId || null,
      username: user?.username || "system",
      action: "created",
      entityType: "patient_treatment",
      entityId: treatment.id,
      entityName: `Traitement dent ${treatment.toothNumber || "N/A"}`,
      newValue: result.data as any,
    });
    res.status(201).json(treatment);
  }));

  app.patch("/api/patients/treatments/:id", wrap(async (req, res) => {
    const current = await storage.updatePatientTreatment(req.params.id, req.body);
    if (!current) return res.status(404).json({ error: "Patient treatment not found" });
    const user = (req as any).user;
    await storage.createAuditLog({
      userId: user?.userId || null,
      username: user?.username || "system",
      action: "updated",
      entityType: "patient_treatment",
      entityId: current.id,
      entityName: `Traitement dent ${current.toothNumber || "N/A"}`,
      newValue: req.body as any,
    });
    if (req.body.status === "completed" && current.status !== "completed") {
      const patientId = current.patientId;
      const all = await storage.getPatientTreatments(patientId);
      const total = all.length;
      const completed = all.filter((t) => t.status === "completed").length;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      const phases = await storage.getTreatmentPhases();
      const completedPhase = phases.find((p) => p.name.toLowerCase() === "completed") || phases[phases.length - 1];
      await storage.upsertPatientTreatmentProgress({
        patientId,
        phaseId: completedPhase.id,
        percentage: pct,
        isCurrent: pct < 100,
        completedAt: pct >= 100 ? new Date() : undefined,
      });
      await storage.createAuditLog({
        userId: user?.userId || null,
        username: user?.username || "system",
        action: "treatment_progress_updated",
        entityType: "patient_treatment_progress",
        entityId: `${patientId}_${completedPhase.id}`,
        entityName: `Progression traitements ${pct}%`,
        newValue: { percentage: pct, total, completed },
      });
    }
    res.json(current);
  }));

  app.delete("/api/patients/treatments/:id", wrap(async (req, res) => {
    const user = (req as any).user;
    const success = await storage.deletePatientTreatment(req.params.id);
    if (!success) return res.status(404).json({ error: "Patient treatment not found" });
    await storage.createAuditLog({
      userId: user?.userId || null,
      username: user?.username || "system",
      action: "deleted",
      entityType: "patient_treatment",
      entityId: req.params.id,
      entityName: `Traitement supprimé`,
    } as any);
    res.status(204).send();
  }));

  // --- Notifications ---
  app.get("/api/notifications", wrap(async (req, res) => {
    const notifications = await storage.getNotifications();
    res.json(notifications);
  }));

  app.get("/api/notifications/unread-count", wrap(async (req, res) => {
    const count = await storage.getUnreadNotificationCount();
    res.json({ count });
  }));

  app.post("/api/notifications", wrap(async (req, res) => {
    const result = insertNotificationSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const notification = await storage.createNotification(result.data);
    res.status(201).json(notification);
  }));

  app.patch("/api/notifications/:id", wrap(async (req, res) => {
    const result = insertNotificationSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const notification = await storage.updateNotification(req.params.id, result.data);
    if (!notification) return res.status(404).json({ error: "Notification not found" });
    res.json(notification);
  }));

  app.delete("/api/notifications/:id", wrap(async (req, res) => {
    const success = await storage.deleteNotification(req.params.id);
    if (!success) return res.status(404).json({ error: "Notification not found" });
    res.status(204).send();
  }));

  app.post("/api/notifications/auto-overdue", requireRole("admin"), wrap(async (req, res) => {
    await storage.autoCreateOverdueNotifications();
    res.json({ success: true });
  }));

  // --- Lab Cases ---
  app.get("/api/lab-cases", wrap(async (req, res) => {
    const cases = await storage.getLabCases();
    res.json(cases);
  }));

  app.post("/api/lab-cases", wrap(async (req, res) => {
    const body = { ...req.body, dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null };
    const result = insertLabCaseSchema.safeParse(body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const labCase = await storage.createLabCase(result.data);
    res.status(201).json(labCase);
  }));

  app.patch("/api/lab-cases/:id", wrap(async (req, res) => {
    const body = { ...req.body, dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined };
    const result = insertLabCaseSchema.partial().safeParse(body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const labCase = await storage.updateLabCase(req.params.id, result.data);
    if (!labCase) return res.status(404).json({ error: "Lab case not found" });
    res.json(labCase);
  }));

  app.delete("/api/lab-cases/:id", wrap(async (req, res) => {
    const success = await storage.deleteLabCase(req.params.id);
    if (!success) return res.status(404).json({ error: "Lab case not found" });
    res.status(204).send();
  }));

  // --- Tasks ---
  app.get("/api/tasks", wrap(async (req, res) => {
    const tasks = await storage.getTasks();
    res.json(tasks);
  }));

  app.post("/api/tasks", wrap(async (req, res) => {
    const body = { ...req.body, dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null };
    const result = insertTaskSchema.safeParse(body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const task = await storage.createTask(result.data);
    res.status(201).json(task);
  }));

  app.patch("/api/tasks/:id", wrap(async (req, res) => {
    const result = insertTaskSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const task = await storage.updateTask(req.params.id, result.data);
    if (!task) return res.status(404).json({ error: "Task not found" });
    res.json(task);
  }));

  app.delete("/api/tasks/:id", wrap(async (req, res) => {
    const success = await storage.deleteTask(req.params.id);
    if (!success) return res.status(404).json({ error: "Task not found" });
    res.status(204).send();
  }));

  // --- Clinic Settings ---
  app.get("/api/settings/:key", wrap(async (req, res) => {
    const setting = await storage.getClinicSetting(req.params.key);
    if (!setting) return res.status(404).json({ error: "Setting not found" });
    res.json(setting);
  }));

  app.put("/api/settings/:key", wrap(async (req, res) => {
    const setting = await storage.setClinicSetting(req.params.key, req.body.value);
    res.json(setting);
  }));

  // --- Status Configs ---
  app.get("/api/status-configs", wrap(async (req, res) => {
    const { entityType } = req.query;
    const configs = await storage.getStatusConfigs(entityType as string | undefined);
    res.json(configs);
  }));

  app.post("/api/status-configs", wrap(async (req, res) => {
    const result = insertStatusConfigSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const config = await storage.createStatusConfig(result.data);
    res.status(201).json(config);
  }));

  app.delete("/api/status-configs/:id", wrap(async (req, res) => {
    const success = await storage.deleteStatusConfig(req.params.id);
    if (!success) return res.status(404).json({ error: "Status config not found" });
    res.status(204).send();
  }));

  // --- Time Slots ---
  app.get("/api/time-slots", wrap(async (req, res) => {
    const slots = await storage.getTimeSlots();
    res.json(slots);
  }));

  app.post("/api/time-slots", wrap(async (req, res) => {
    const result = insertTimeSlotSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const slot = await storage.createTimeSlot(result.data);
    res.status(201).json(slot);
  }));

  app.delete("/api/time-slots/:id", wrap(async (req, res) => {
    const success = await storage.deleteTimeSlot(req.params.id);
    if (!success) return res.status(404).json({ error: "Time slot not found" });
    res.status(204).send();
  }));

  // --- Dashboard / Reports ---
  app.get("/api/dashboard/stats", wrap(async (req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  }));

  app.get("/api/reports/monthly", wrap(async (req, res) => {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const stats = await storage.getMonthlyStats(year);
    res.json(stats);
  }));

  app.get("/api/reports/treatments", wrap(async (req, res) => {
    const stats = await storage.getTreatmentStats();
    res.json(stats);
  }));

  app.get("/api/reports/status-stats", wrap(async (req, res) => {
    const stats = await storage.getStatusStats();
    res.json(stats);
  }));

  // ════════════════════════════════════════════
  // MODULE 1: DASHBOARD ENHANCEMENTS
  // ════════════════════════════════════════════
  app.get("/api/dashboard/daily-revenue", wrap(async (req, res) => {
    const revenue = await storage.getDailyRevenue();
    res.json({ amount: revenue });
  }));
  app.get("/api/dashboard/weekly-revenue", wrap(async (req, res) => {
    const revenue = await storage.getWeeklyRevenue();
    res.json({ amount: revenue });
  }));
  app.get("/api/dashboard/monthly-revenue", wrap(async (req, res) => {
    const revenue = await storage.getMonthlyRevenue();
    res.json({ amount: revenue });
  }));
  app.get("/api/dashboard/net-profit", wrap(async (req, res) => {
    const profit = await storage.getNetProfit();
    res.json({ amount: profit });
  }));
  app.get("/api/dashboard/active-treatments", wrap(async (req, res) => {
    const count = await storage.getActiveTreatments();
    res.json({ count });
  }));
  app.get("/api/dashboard/critical-alerts", wrap(async (req, res) => {
    const alerts = await storage.getCriticalAlerts();
    res.json(alerts);
  }));
  app.get("/api/dashboard/recent-activities", wrap(async (req, res) => {
    const activities = await storage.getRecentActivities();
    res.json(activities);
  }));
  app.get("/api/dashboard/doctor-productivity", wrap(async (req, res) => {
    const { doctorId, startDate, endDate } = req.query;
    const stats = await storage.getDoctorProductivity(
      doctorId as string | undefined,
      startDate ? new Date(startDate as string) : undefined,
      endDate ? new Date(endDate as string) : undefined,
    );
    res.json(stats);
  }));
  app.get("/api/dashboard/upcoming-appointments", wrap(async (req, res) => {
    const appointments = await storage.getUpcomingAppointments();
    res.json(appointments);
  }));
  app.get("/api/dashboard/lab-alerts", wrap(async (req, res) => {
    const alerts = await storage.getLabAlerts();
    res.json(alerts);
  }));

  // ════════════════════════════════════════════
  // MODULE 2: DENTAL CHART
  // ════════════════════════════════════════════
  app.get("/api/patients/:id/dental-chart", wrap(async (req, res) => {
    let chart = await storage.getDentalChart(req.params.id);
    if (!chart) {
      chart = await storage.createDentalChart({ patientId: req.params.id, chartType: "permanent" });
      chart = await storage.getDentalChart(req.params.id);
    }
    res.json(chart);
  }));
  app.post("/api/patients/:id/dental-chart", wrap(async (req, res) => {
    const existing = await storage.getDentalChart(req.params.id);
    const result = insertDentalChartSchema.safeParse({ ...req.body, patientId: req.params.id });
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    if (existing) {
      const chart = await storage.updateDentalChart(existing.id, result.data);
      res.json(chart);
    } else {
      const chart = await storage.createDentalChart(result.data);
      res.status(201).json(chart);
    }
  }));
  app.post("/api/dental-chart/entries", wrap(async (req, res) => {
    const result = insertDentalChartEntrySchema.safeParse({ ...req.body, treatmentDate: req.body.treatmentDate ? new Date(req.body.treatmentDate) : undefined });
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const entry = await storage.upsertDentalChartEntry(result.data);
    res.status(201).json(entry);
  }));
  app.patch("/api/dental-chart/entries/:id", wrap(async (req, res) => {
    const result = insertDentalChartEntrySchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const entry = await storage.updateDentalChartEntry(req.params.id, result.data);
    if (!entry) return res.status(404).json({ error: "Entry not found" });
    res.json(entry);
  }));
  app.delete("/api/dental-chart/entries/:id", wrap(async (req, res) => {
    const success = await storage.deleteDentalChartEntry(req.params.id);
    if (!success) return res.status(404).json({ error: "Entry not found" });
    res.status(204).send();
  }));
  app.get("/api/dental-chart/:chartId/notes", wrap(async (req, res) => {
    const notes = await storage.getDentalChartNotes(req.params.chartId);
    res.json(notes);
  }));
  app.post("/api/dental-chart/:chartId/notes", wrap(async (req, res) => {
    const result = insertDentalChartNoteSchema.safeParse({ ...req.body, chartId: req.params.chartId });
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const note = await storage.addDentalChartNote(result.data);
    res.status(201).json(note);
  }));

  // ════════════════════════════════════════════
  // MODULE 3: QUOTATIONS
  // ════════════════════════════════════════════
  app.get("/api/quotations", wrap(async (req, res) => {
    const queries = await storage.getQuotations();
    res.json(queries);
  }));
  app.get("/api/quotations/:id", wrap(async (req, res) => {
    const quotation = await storage.getQuotation(req.params.id);
    if (!quotation) return res.status(404).json({ error: "Quotation not found" });
    res.json(quotation);
  }));
  app.post("/api/quotations", wrap(async (req, res) => {
    const body = { ...req.body, validUntil: req.body.validUntil ? new Date(req.body.validUntil) : undefined };
    const result = insertQuotationSchema.safeParse(body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const quotation = await storage.createQuotation(result.data);
    res.status(201).json(quotation);
  }));
  app.patch("/api/quotations/:id", wrap(async (req, res) => {
    const result = insertQuotationSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const quotation = await storage.updateQuotation(req.params.id, result.data);
    if (!quotation) return res.status(404).json({ error: "Quotation not found" });
    res.json(quotation);
  }));
  app.delete("/api/quotations/:id", wrap(async (req, res) => {
    const success = await storage.deleteQuotation(req.params.id);
    if (!success) return res.status(404).json({ error: "Quotation not found" });
    res.status(204).send();
  }));
  app.post("/api/quotations/:id/approve", wrap(async (req, res) => {
    const quotation = await storage.approveQuotation(req.params.id);
    if (!quotation) return res.status(404).json({ error: "Quotation not found" });
    res.json(quotation);
  }));
  app.post("/api/quotations/:id/convert-to-invoice", wrap(async (req, res) => {
    try {
      const invoice = await storage.convertQuotationToInvoice(req.params.id);
      if (!invoice) return res.status(400).json({ error: "Cannot convert: quotation empty or not found" });
      res.status(201).json(invoice);
    } catch (err: any) {
      if (err.message?.includes("déjà été converti")) return res.status(409).json({ error: err.message });
      throw err;
    }
  }));
  app.get("/api/quotations/:id/items", wrap(async (req, res) => {
    const items = await storage.getQuotationItems(req.params.id);
    res.json(items);
  }));
  app.post("/api/quotations/:id/items", wrap(async (req, res) => {
    const result = insertQuotationItemSchema.safeParse({ ...req.body, quotationId: req.params.id });
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const item = await storage.addQuotationItem(result.data);
    res.status(201).json(item);
  }));
  app.delete("/api/quotation-items/:id", wrap(async (req, res) => {
    const success = await storage.deleteQuotationItem(req.params.id);
    if (!success) return res.status(404).json({ error: "Item not found" });
    res.status(204).send();
  }));

  // ════════════════════════════════════════════
  // MODULE 4: MEDICAL HISTORY
  // ════════════════════════════════════════════
  app.get("/api/patients/:id/medical-history", wrap(async (req, res) => {
    const history = await storage.getMedicalHistory(req.params.id);
    res.json(history);
  }));
  app.get("/api/patients/:id/medical-summary", wrap(async (req, res) => {
    const summary = await storage.getMedicalSummary(req.params.id);
    res.json(summary);
  }));
  app.post("/api/patients/:id/medical-history", wrap(async (req, res) => {
    const body = { ...req.body, patientId: req.params.id, startDate: req.body.startDate ? new Date(req.body.startDate) : undefined, endDate: req.body.endDate ? new Date(req.body.endDate) : undefined };
    const result = insertMedicalHistorySchema.safeParse(body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const record = await storage.createMedicalHistory(result.data);
    res.status(201).json(record);
  }));
  app.post("/api/patients/:id/medical-history/batch", wrap(async (req, res) => {
    if (!Array.isArray(req.body.records)) return res.status(400).json({ error: "records array required" });
    const records = await storage.batchCreateMedicalHistory(req.params.id, req.body.records);
    res.status(201).json(records);
  }));
  app.patch("/api/medical-history/:id", wrap(async (req, res) => {
    const result = insertMedicalHistorySchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const record = await storage.updateMedicalHistory(req.params.id, result.data);
    if (!record) return res.status(404).json({ error: "Record not found" });
    res.json(record);
  }));
  app.delete("/api/medical-history/:id", wrap(async (req, res) => {
    const success = await storage.deleteMedicalHistory(req.params.id);
    if (!success) return res.status(404).json({ error: "Record not found" });
    res.status(204).send();
  }));

  // ════════════════════════════════════════════
  // MODULE 5: INVENTORY
  // ════════════════════════════════════════════
  app.get("/api/inventory/products", wrap(async (req, res) => {
    const products = await storage.getInventoryProducts();
    res.json(products);
  }));
  app.get("/api/inventory/products/low-stock", wrap(async (req, res) => {
    const products = await storage.getLowStockProducts();
    res.json(products);
  }));
  app.get("/api/inventory/products/expiring", wrap(async (req, res) => {
    const products = await storage.getExpiringProducts();
    res.json(products);
  }));
  app.post("/api/inventory/products", wrap(async (req, res) => {
    const body = { ...req.body, expirationDate: req.body.expirationDate ? new Date(req.body.expirationDate) : null };
    const result = insertInventoryProductSchema.safeParse(body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const product = await storage.createInventoryProduct(result.data);
    res.status(201).json(product);
  }));
  app.patch("/api/inventory/products/:id", wrap(async (req, res) => {
    const result = insertInventoryProductSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const product = await storage.updateInventoryProduct(req.params.id, result.data);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  }));
  app.delete("/api/inventory/products/:id", wrap(async (req, res) => {
    const success = await storage.deleteInventoryProduct(req.params.id);
    if (!success) return res.status(404).json({ error: "Product not found" });
    res.status(204).send();
  }));
  app.post("/api/inventory/products/:id/adjust-stock", wrap(async (req, res) => {
    const schema = z.object({ quantity: z.number().int().positive(), type: z.enum(["in", "out"]), notes: z.string().optional() });
    const result = schema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const user = (req as any).user;
    const product = await storage.adjustStock(req.params.id, result.data.quantity, result.data.type, user?.userId, result.data.notes);
    res.json(product);
  }));
  app.get("/api/inventory/products/:id/movements", wrap(async (req, res) => {
    const movements = await storage.getInventoryMovements(req.params.id);
    res.json(movements);
  }));
  app.get("/api/inventory/suppliers", wrap(async (req, res) => {
    const suppliers = await storage.getInventorySuppliers();
    res.json(suppliers);
  }));
  app.post("/api/inventory/suppliers", wrap(async (req, res) => {
    const result = insertInventorySupplierSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const supplier = await storage.createInventorySupplier(result.data);
    res.status(201).json(supplier);
  }));
  app.patch("/api/inventory/suppliers/:id", wrap(async (req, res) => {
    const result = insertInventorySupplierSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const supplier = await storage.updateInventorySupplier(req.params.id, result.data);
    if (!supplier) return res.status(404).json({ error: "Supplier not found" });
    res.json(supplier);
  }));
  app.delete("/api/inventory/suppliers/:id", wrap(async (req, res) => {
    const success = await storage.deleteInventorySupplier(req.params.id);
    if (!success) return res.status(404).json({ error: "Supplier not found" });
    res.status(204).send();
  }));
  app.get("/api/inventory/purchase-orders", wrap(async (req, res) => {
    const orders = await storage.getPurchaseOrders();
    res.json(orders);
  }));
  app.post("/api/inventory/purchase-orders", wrap(async (req, res) => {
    const body = { ...req.body, expectedDate: req.body.expectedDate ? new Date(req.body.expectedDate) : null };
    const result = insertPurchaseOrderSchema.safeParse(body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const order = await storage.createPurchaseOrder(result.data);
    res.status(201).json(order);
  }));
  app.patch("/api/inventory/purchase-orders/:id", wrap(async (req, res) => {
    const result = insertPurchaseOrderSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const order = await storage.updatePurchaseOrder(req.params.id, result.data);
    if (!order) return res.status(404).json({ error: "Purchase order not found" });
    res.json(order);
  }));
  app.get("/api/inventory/purchase-orders/:id/items", wrap(async (req, res) => {
    const items = await storage.getPurchaseOrderItems(req.params.id);
    res.json(items);
  }));
  app.post("/api/inventory/purchase-orders/:id/items", wrap(async (req, res) => {
    const result = insertPurchaseOrderItemSchema.safeParse({ ...req.body, orderId: req.params.id });
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const item = await storage.addPurchaseOrderItem(result.data);
    res.status(201).json(item);
  }));

  // ════════════════════════════════════════════
  // MODULE 6: EXPENSES
  // ════════════════════════════════════════════
  app.get("/api/expenses", wrap(async (req, res) => {
    const { startDate, endDate } = req.query;
    let expenses;
    if (startDate && endDate) {
      expenses = await storage.getExpensesByDateRange(new Date(startDate as string), new Date(endDate as string));
    } else {
      expenses = await storage.getExpenses();
    }
    res.json(expenses);
  }));
  app.get("/api/expenses/summary", wrap(async (req, res) => {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate as string) : new Date();
    const summary = await storage.getExpenseSummary(start, end);
    res.json(summary);
  }));
  app.get("/api/expenses/categories", wrap(async (req, res) => {
    const categories = await storage.getExpenseCategories();
    res.json(categories);
  }));
  app.post("/api/expenses", wrap(async (req, res) => {
    const body = { ...req.body, date: req.body.date ? new Date(req.body.date) : undefined };
    const result = insertExpenseSchema.safeParse(body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const expense = await storage.createExpense(result.data);
    res.status(201).json(expense);
  }));
  app.patch("/api/expenses/:id", wrap(async (req, res) => {
    const result = insertExpenseSchema.partial().safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const expense = await storage.updateExpense(req.params.id, result.data);
    if (!expense) return res.status(404).json({ error: "Expense not found" });
    res.json(expense);
  }));
  app.delete("/api/expenses/:id", wrap(async (req, res) => {
    const success = await storage.deleteExpense(req.params.id);
    if (!success) return res.status(404).json({ error: "Expense not found" });
    res.status(204).send();
  }));

  // ════════════════════════════════════════════
  // MODULE 7: PATIENT DOCUMENTS
  // ════════════════════════════════════════════
  const documentsDir = path.join(uploadsDir, "documents");
  fs.mkdirSync(documentsDir, { recursive: true });
  const documentUpload = multer({ dest: documentsDir });
  app.get("/api/patients/:id/documents", wrap(async (req, res) => {
    const docs = await storage.getPatientDocuments(req.params.id);
    res.json(docs);
  }));
  app.post("/api/patients/:id/documents", documentUpload.single("file"), wrap(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const ext = path.extname(req.file.originalname) || "";
    const filename = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const destPath = path.join(documentsDir, filename);
    fs.renameSync(req.file.path, destPath);
    const user = (req as any).user;
    const doc = await storage.createPatientDocument({
      patientId: req.params.id,
      name: req.body.name || req.file.originalname,
      type: req.body.type || "other",
      category: req.body.category || null,
      filePath: `/uploads/documents/${filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      uploadedBy: user?.userId || null,
      notes: req.body.notes || null,
    });
    res.status(201).json(doc);
  }));
  app.delete("/api/documents/:id", wrap(async (req, res) => {
    const doc = await storage.getPatientDocument(req.params.id);
    if (doc) {
      const fullPath = path.join(process.cwd(), doc.filePath);
      try { fs.unlinkSync(fullPath); } catch {}
    }
    const success = await storage.deletePatientDocument(req.params.id);
    if (!success) return res.status(404).json({ error: "Document not found" });
    res.status(204).send();
  }));

  // ════════════════════════════════════════════
  // MODULE 8A: PATIENT IMAGES (Dental Imaging)
  // ════════════════════════════════════════════
  const imagesDir = path.join(uploadsDir, "images");
  fs.mkdirSync(imagesDir, { recursive: true });
  const imageUpload = multer({
    dest: imagesDir,
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      const allowed = ["image/jpeg","image/png","image/gif","image/webp","image/tiff","application/pdf","application/dicom","model/stl","image/x-dicom"];
      if (allowed.includes(file.mimetype) || file.mimetype.startsWith("image/")) return cb(null, true);
      cb(null, true);
    },
  });
  app.get("/api/patients/:id/images", wrap(async (req, res) => {
    const filters = {
      tooth: req.query.tooth as string | undefined,
      type: req.query.type as string | undefined,
      tag: req.query.tag as string | undefined,
      dentistId: req.query.dentistId as string | undefined,
      dateFrom: req.query.dateFrom as string | undefined,
      dateTo: req.query.dateTo as string | undefined,
    };
    const images = await storage.getPatientImages(req.params.id, filters);
    res.json(images);
  }));
  app.post("/api/patients/:id/images", imageUpload.single("file"), wrap(async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const ext = path.extname(req.file.originalname) || "";
    const filename = `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const destPath = path.join(imagesDir, filename);
    fs.renameSync(req.file.path, destPath);
    const user = (req as any).user;
    const img = await storage.createPatientImage({
      patientId: req.params.id,
      imageType: req.body.imageType || "intraoral",
      toothNumbers: req.body.toothNumbers || null,
      dentistId: req.body.dentistId || null,
      clinicalNote: req.body.clinicalNote || null,
      tags: req.body.tags || null,
      date: req.body.date ? new Date(req.body.date) : new Date(),
      filePath: `/uploads/images/${filename}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      fileName: req.file.originalname,
      uploadedBy: user?.userId || null,
    });
    await storage.createAuditLog({
      userId: user?.userId || null,
      username: user?.username || "system",
      action: "image_uploaded",
      entityType: "patient_image",
      entityId: img.id,
      entityName: `${img.imageType} dent ${img.toothNumbers || "N/A"}`,
      newValue: { imageType: img.imageType, toothNumbers: img.toothNumbers },
    });
    res.status(201).json(img);
  }));
  app.patch("/api/patients/images/:id", wrap(async (req, res) => {
    const updated = await storage.updatePatientImage(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: "Image not found" });
    res.json(updated);
  }));
  app.delete("/api/patients/images/:id", wrap(async (req, res) => {
    const img = await storage.getPatientImage(req.params.id);
    if (img) {
      const fullPath = path.join(process.cwd(), img.filePath);
      try { fs.unlinkSync(fullPath); } catch {}
    }
    const success = await storage.deletePatientImage(req.params.id);
    if (!success) return res.status(404).json({ error: "Image not found" });
    res.status(204).send();
  }));

  // ════════════════════════════════════════════
  // MODULE 8: SIGNATURES
  // ════════════════════════════════════════════
  app.post("/api/signatures", wrap(async (req, res) => {
    const result = insertSignatureSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: fromZodError(result.error).toString() });
    const signature = await storage.createSignature(result.data);
    res.status(201).json(signature);
  }));
  app.get("/api/signatures/:documentType/:documentId", wrap(async (req, res) => {
    const signatures = await storage.getSignaturesByDocument(req.params.documentType, req.params.documentId);
    res.json(signatures);
  }));

  // ════════════════════════════════════════════
  // MODULE 10: AUDIT LOGS
  // ════════════════════════════════════════════
  app.get("/api/audit-logs", wrap(async (req, res) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const logs = await storage.getAuditLogs(limit, offset);
    res.json(logs);
  }));
  app.get("/api/audit-logs/:entityType/:entityId", wrap(async (req, res) => {
    const logs = await storage.getAuditLogsByEntity(req.params.entityType, req.params.entityId);
    res.json(logs);
  }));
  app.get("/api/audit-logs/user/:userId", wrap(async (req, res) => {
    const logs = await storage.getAuditLogsByUser(req.params.userId);
    res.json(logs);
  }));

  // ════════════════════════════════════════════
  // MODULE 11: ADVANCED SCHEDULING
  // ════════════════════════════════════════════
  app.get("/api/appointments/range", wrap(async (req, res) => {
    const { startDate, endDate } = req.query;
    if (!startDate || !endDate) return res.status(400).json({ error: "startDate and endDate required" });
    const appointments = await storage.getAppointmentsByDateRange(new Date(startDate as string), new Date(endDate as string));
    res.json(appointments);
  }));

  // ════════════════════════════════════════════
  // MODULE 14: GLOBAL SEARCH
  // ════════════════════════════════════════════
  app.get("/api/search", wrap(async (req, res) => {
    const { q } = req.query;
    if (!q || typeof q !== "string" || q.length < 1) return res.json({ patients: [], appointments: [], treatments: [], invoices: [], labCases: [] });
    const results = await storage.globalSearch(q);
    res.json(results);
  }));

  // ════════════════════════════════════════════
  // MODULE 15: SECURITY / SESSIONS
  // ════════════════════════════════════════════
  app.get("/api/sessions", wrap(async (req, res) => {
    const user = (req as any).user;
    const sessions = await storage.getUserSessions(user.userId);
    res.json(sessions);
  }));
  app.delete("/api/sessions/:id", wrap(async (req, res) => {
    const success = await storage.deleteUserSession(req.params.id);
    if (!success) return res.status(404).json({ error: "Session not found" });
    res.status(204).send();
  }));
  app.post("/api/auth/change-password", wrap(async (req, res) => {
    const user = (req as any).user;
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ error: "currentPassword and newPassword required" });
    const fullUser = await storage.getUser(user.userId);
    if (!fullUser) return res.status(404).json({ error: "User not found" });
    const valid = await comparePassword(currentPassword, fullUser.password);
    if (!valid) return res.status(401).json({ error: "Current password incorrect" });
    const hashed = await hashPassword(newPassword);
    await (storage as any).updateUserPassword(user.userId, hashed);
    res.json({ success: true });
  }));

  // ════════════════════════════════════════════
  // MODULE 9: BACKUPS
  // ════════════════════════════════════════════
  const backupsDir = path.join(process.cwd(), "backups");
  fs.mkdirSync(backupsDir, { recursive: true });
  app.post("/api/backups", requireRole("admin"), wrap(async (req, res) => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `dentalsoft-backup-${timestamp}.sql`;
    const filePath = path.join(backupsDir, filename);
    try {
      const env = process.env;
      const pgDumpCmd = `"C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump" -U postgres -h localhost -d dentalsoft -f "${filePath}"`;
      const { execSync } = require("child_process");
      execSync(pgDumpCmd, { env: { ...process.env, PGPASSWORD: "postgres" }, timeout: 30000 });
      const stats = fs.statSync(filePath);
      const backup = await storage.createBackupEntry({
        filename, filePath, fileSize: stats.size, status: "completed",
        type: req.body.type || "manual", encrypted: true, checksum: null,
      });
      res.status(201).json(backup);
    } catch (err: any) {
      const backup = await storage.createBackupEntry({
        filename, filePath, fileSize: 0, status: "failed",
        type: req.body.type || "manual", encrypted: true, checksum: null,
      });
      res.status(500).json({ error: `Backup failed: ${err.message}` });
    }
  }));
  app.get("/api/backups", wrap(async (req, res) => {
    const backups = await storage.getBackups();
    res.json(backups);
  }));
  app.delete("/api/backups/:id", wrap(async (req, res) => {
    const back = (await storage.getBackups()).find(b => b.id === req.params.id);
    if (back) { try { fs.unlinkSync(back.filePath); } catch {} }
    const result = await (storage as any).deleteBackupEntry(req.params.id);
    if (!result) return res.status(404).json({ error: "Backup not found" });
    res.status(204).send();
  }));

  // ════════════════════════════════════════════
  // PDF ENDPOINTS
  // ════════════════════════════════════════════
  app.get("/api/pdf/invoice/:id", wrap(async (req, res) => {
    const invoice = await storage.getInvoiceForPrint(req.params.id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });
    try {
      const PDFDocument = require("pdfkit");
      const doc = new PDFDocument({ size: "A4", margin: 50 });
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `inline; filename="facture-${invoice.invoiceNumber || invoice.id}.pdf"`);
      doc.pipe(res);
      doc.fontSize(20).text("Cabinet Dentaire", { align: "center" });
      doc.fontSize(10).text("Facture", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`N°: ${invoice.invoiceNumber || invoice.id}`);
      doc.text(`Date: ${invoice.date ? new Date(invoice.date).toLocaleDateString("fr-FR") : ""}`);
      doc.text(`Patient: ${invoice.patientName || ""}`);
      doc.moveDown();
      doc.text(`Montant: ${invoice.amount} DZD`);
      doc.text(`Payé: ${invoice.paidAmount} DZD`);
      doc.text(`Reste: ${(parseFloat(invoice.amount) - parseFloat(invoice.paidAmount)).toFixed(2)} DZD`);
      if (invoice.notes) doc.moveDown().text(`Notes: ${invoice.notes}`);
      doc.end();
    } catch {
      res.status(500).json({ error: "PDF generation failed" });
    }
  }));

  return httpServer;
}

// Add storage method needed by backup endpoint
async function deleteBackupEntry(id: string): Promise<boolean> {
  const { eq } = await import("drizzle-orm");
  const { db } = await import("./db");
  const { backups } = await import("@shared/schema");
  const result = await db.delete(backups).where(eq(backups.id, id));
  return (result.rowCount ?? 0) > 0;
}

// Add storage method for password update
async function updateUserPassword(id: string, password: string): Promise<void> {
  const { eq } = await import("drizzle-orm");
  const { db } = await import("./db");
  const { users } = await import("@shared/schema");
  await db.update(users).set({ password }).where(eq(users.id, id));
}

// Attach to storage for runtime use by routes
(storage as any).deleteBackupEntry = deleteBackupEntry;
(storage as any).updateUserPassword = updateUserPassword;
