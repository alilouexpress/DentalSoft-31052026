-- ============================================================================
-- DentalSoft Database Optimization Migration
-- Priorities 1-7: New tables, indexes, constraints, sequences, timestamps, FKs
-- ============================================================================

-- ============================================================================
-- PRIORITY 5 (partial): Create trigger function for auto-updating updated_at
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint

-- ============================================================================
-- PRIORITY 4: Create PostgreSQL sequences for sequential numbering
-- ============================================================================

CREATE SEQUENCE IF NOT EXISTS patient_id_seq START 1 INCREMENT 1;
--> statement-breakpoint
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1001 INCREMENT 1;
--> statement-breakpoint
CREATE SEQUENCE IF NOT EXISTS quote_number_seq START 1 INCREMENT 1;
--> statement-breakpoint
CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1001 INCREMENT 1;
--> statement-breakpoint

-- ============================================================================
-- PRIORITY 1: Create new tables
-- ============================================================================

CREATE TABLE "appointment_types" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "code" text NOT NULL,
  "description" text,
  "default_duration" integer DEFAULT 30 NOT NULL,
  "color" text,
  "is_active" boolean DEFAULT true NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "appointment_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint

CREATE TABLE "rooms" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "code" text NOT NULL,
  "description" text,
  "capacity" integer DEFAULT 1 NOT NULL,
  "equipment" text,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "rooms_code_unique" UNIQUE("code")
);
--> statement-breakpoint

CREATE TABLE "patient_treatments" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "patient_id" varchar NOT NULL,
  "treatment_id" varchar,
  "doctor_id" varchar,
  "assistant_id" varchar,
  "tooth_number" text,
  "surface" text,
  "status" text DEFAULT 'pending' NOT NULL,
  "notes" text,
  "cost" decimal(10, 2) DEFAULT '0.00',
  "started_at" timestamp DEFAULT now() NOT NULL,
  "completed_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE "prescriptions" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "patient_id" varchar NOT NULL,
  "doctor_id" varchar,
  "diagnosis" text,
  "notes" text,
  "status" text DEFAULT 'active' NOT NULL,
  "issued_at" timestamp DEFAULT now() NOT NULL,
  "expires_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE "prescription_items" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "prescription_id" varchar NOT NULL,
  "medication_name" text NOT NULL,
  "dosage" text,
  "frequency" text,
  "duration" text,
  "instructions" text,
  "quantity" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE "recall_reminders" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "patient_id" varchar NOT NULL,
  "appointment_id" varchar,
  "reminder_type" text DEFAULT 'follow_up' NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "due_date" timestamp NOT NULL,
  "status" text DEFAULT 'pending' NOT NULL,
  "notified_at" timestamp,
  "completed_at" timestamp,
  "created_by" varchar,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE "doctor_schedules" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "doctor_id" varchar NOT NULL,
  "day_of_week" integer NOT NULL,
  "start_time" text NOT NULL,
  "end_time" text NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE "blocked_times" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "doctor_id" varchar NOT NULL,
  "title" text NOT NULL,
  "description" text,
  "start_time" timestamp NOT NULL,
  "end_time" timestamp NOT NULL,
  "recurrence" text,
  "created_by" varchar,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE "insurance_claims" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "patient_id" varchar NOT NULL,
  "invoice_id" varchar,
  "insurance_provider" text NOT NULL,
  "policy_number" text,
  "claim_number" text,
  "claim_amount" decimal(10, 2) NOT NULL,
  "approved_amount" decimal(10, 2) DEFAULT '0.00',
  "status" text DEFAULT 'submitted' NOT NULL,
  "submitted_at" timestamp DEFAULT now() NOT NULL,
  "processed_at" timestamp,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE "patient_statistics" (
  "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "patient_id" varchar NOT NULL,
  "total_visits" integer DEFAULT 0 NOT NULL,
  "total_treatments" integer DEFAULT 0 NOT NULL,
  "total_invoiced" decimal(10, 2) DEFAULT '0.00' NOT NULL,
  "total_paid" decimal(10, 2) DEFAULT '0.00' NOT NULL,
  "outstanding_balance" decimal(10, 2) DEFAULT '0.00' NOT NULL,
  "last_visit_date" timestamp,
  "next_appointment_date" timestamp,
  "preferred_doctor_id" varchar,
  "risk_level" text DEFAULT 'low',
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "patient_statistics_patient_unique" UNIQUE("patient_id")
);
--> statement-breakpoint

-- ============================================================================
-- PRIORITY 1: Add foreign keys for new tables
-- ============================================================================

ALTER TABLE "patient_treatments" ADD CONSTRAINT "patient_treatments_patient_id_patients_id_fk"
  FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "patient_treatments" ADD CONSTRAINT "patient_treatments_treatment_id_treatments_id_fk"
  FOREIGN KEY ("treatment_id") REFERENCES "public"."treatments"("id") ON DELETE SET NULL ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "patient_treatments" ADD CONSTRAINT "patient_treatments_doctor_id_doctors_id_fk"
  FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE SET NULL ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "patient_treatments" ADD CONSTRAINT "patient_treatments_assistant_id_staff_id_fk"
  FOREIGN KEY ("assistant_id") REFERENCES "public"."staff"("id") ON DELETE SET NULL ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_patient_id_patients_id_fk"
  FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_doctor_id_doctors_id_fk"
  FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE SET NULL ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "prescription_items" ADD CONSTRAINT "prescription_items_prescription_id_prescriptions_id_fk"
  FOREIGN KEY ("prescription_id") REFERENCES "public"."prescriptions"("id") ON DELETE CASCADE ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "recall_reminders" ADD CONSTRAINT "recall_reminders_patient_id_patients_id_fk"
  FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "recall_reminders" ADD CONSTRAINT "recall_reminders_appointment_id_appointments_id_fk"
  FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE SET NULL ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "doctor_schedules" ADD CONSTRAINT "doctor_schedules_doctor_id_doctors_id_fk"
  FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE CASCADE ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "blocked_times" ADD CONSTRAINT "blocked_times_doctor_id_doctors_id_fk"
  FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE CASCADE ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_patient_id_patients_id_fk"
  FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "insurance_claims" ADD CONSTRAINT "insurance_claims_invoice_id_invoices_id_fk"
  FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE SET NULL ON UPDATE no action;
--> statement-breakpoint

ALTER TABLE "patient_statistics" ADD CONSTRAINT "patient_statistics_patient_id_patients_id_fk"
  FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "patient_statistics" ADD CONSTRAINT "patient_statistics_preferred_doctor_id_doctors_id_fk"
  FOREIGN KEY ("preferred_doctor_id") REFERENCES "public"."doctors"("id") ON DELETE SET NULL ON UPDATE no action;
--> statement-breakpoint

-- ============================================================================
-- PRIORITY 5: Add updated_at columns to existing tables that are missing it
-- ============================================================================

ALTER TABLE "users" ADD COLUMN "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "doctors" ADD COLUMN "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "treatment_categories" ADD COLUMN "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "treatments" ADD COLUMN "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "staff" ADD COLUMN "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "invoice_items" ADD COLUMN "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "treatment_phases" ADD COLUMN "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "patient_treatment_progress" ADD COLUMN "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "payments" ADD COLUMN "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "lab_cases" ADD COLUMN "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "status_configs" ADD COLUMN "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "time_slots" ADD COLUMN "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "patient_documents" ADD COLUMN "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "signatures" ADD COLUMN "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "backups" ADD COLUMN "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "user_sessions" ADD COLUMN "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "inventory_suppliers" ADD COLUMN "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD COLUMN "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD COLUMN "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "dental_chart_entries" ADD COLUMN "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "dental_chart_notes" ADD COLUMN "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "quotation_items" ADD COLUMN "updated_at" timestamp DEFAULT now();
--> statement-breakpoint
ALTER TABLE "clinic_settings" ADD COLUMN "updated_at" timestamp DEFAULT now();
--> statement-breakpoint

-- ============================================================================
-- PRIORITY 5: Create triggers for auto-updating updated_at on existing tables
-- ============================================================================

CREATE TRIGGER set_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "doctors" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "patients" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "appointments" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "treatment_categories" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "treatments" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "staff" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "invoices" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "invoice_items" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "treatment_phases" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "patient_treatment_progress" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "payments" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "lab_cases" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "tasks" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "status_configs" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "time_slots" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "patient_documents" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "signatures" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "backups" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "audit_logs" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "user_sessions" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "inventory_suppliers" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "inventory_movements" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "purchase_order_items" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "dental_chart_entries" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "dental_chart_notes" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "quotation_items" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "clinic_settings" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint

-- Also add triggers for tables that already had updated_at
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "dental_charts" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "medical_history" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "inventory_products" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "purchase_orders" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "quotations" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint
CREATE TRIGGER set_updated_at BEFORE UPDATE ON "notifications" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
--> statement-breakpoint

-- ============================================================================
-- PRIORITY 3: Add CHECK constraints for status/type columns (safe, fixed values)
-- ============================================================================

ALTER TABLE "users" ADD CONSTRAINT "users_role_check"
  CHECK (role IN ('admin', 'doctor', 'assistant', 'staff'));
--> statement-breakpoint

ALTER TABLE "payments" ADD CONSTRAINT "payments_payment_method_check"
  CHECK (payment_method IN ('cash', 'card', 'check', 'transfer'));
--> statement-breakpoint

ALTER TABLE "expenses" ADD CONSTRAINT "expenses_type_check"
  CHECK (type IN ('variable', 'fixed'));
--> statement-breakpoint

ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_type_check"
  CHECK (type IN ('in', 'out', 'adjustment'));
--> statement-breakpoint

ALTER TABLE "backups" ADD CONSTRAINT "backups_status_check"
  CHECK (status IN ('completed', 'failed', 'in_progress'));
--> statement-breakpoint

ALTER TABLE "backups" ADD CONSTRAINT "backups_type_check"
  CHECK (type IN ('manual', 'automatic'));
--> statement-breakpoint

ALTER TABLE "dental_charts" ADD CONSTRAINT "dental_charts_chart_type_check"
  CHECK (chart_type IN ('permanent', 'deciduous', 'mixed'));
--> statement-breakpoint

ALTER TABLE "expenses" ADD CONSTRAINT "expenses_recurring_interval_check"
  CHECK (recurring_interval IS NULL OR recurring_interval IN ('monthly', 'quarterly', 'yearly'));
--> statement-breakpoint

ALTER TABLE "tasks" ADD CONSTRAINT "tasks_priority_check"
  CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent'));
--> statement-breakpoint

ALTER TABLE "tasks" ADD CONSTRAINT "tasks_status_check"
  CHECK (status IN ('Pending', 'In Progress', 'Completed'));
--> statement-breakpoint

ALTER TABLE "patient_statistics" ADD CONSTRAINT "patient_statistics_risk_level_check"
  CHECK (risk_level IN ('low', 'medium', 'high', 'critical'));
--> statement-breakpoint

-- ============================================================================
-- PRIORITY 6: Fix foreign keys - DROP old NO ACTION FKs and recreate with CASCADE/RESTRICT
-- ============================================================================

-- Drop existing FKs first (order matters - drop children before parents)

-- appointment_items and child tables first
ALTER TABLE "invoice_items" DROP CONSTRAINT "invoice_items_invoice_id_invoices_id_fk";
--> statement-breakpoint
ALTER TABLE "payments" DROP CONSTRAINT "payments_invoice_id_invoices_id_fk";
--> statement-breakpoint
ALTER TABLE "quotation_items" DROP CONSTRAINT "quotation_items_quotation_id_quotations_id_fk";
--> statement-breakpoint
ALTER TABLE "quotation_items" DROP CONSTRAINT "quotation_items_treatment_id_treatments_id_fk";
--> statement-breakpoint
ALTER TABLE "dental_chart_entries" DROP CONSTRAINT "dental_chart_entries_chart_id_dental_charts_id_fk";
--> statement-breakpoint
ALTER TABLE "dental_chart_entries" DROP CONSTRAINT "dental_chart_entries_doctor_id_doctors_id_fk";
--> statement-breakpoint
ALTER TABLE "dental_chart_notes" DROP CONSTRAINT "dental_chart_notes_chart_id_dental_charts_id_fk";
--> statement-breakpoint
ALTER TABLE "purchase_order_items" DROP CONSTRAINT "purchase_order_items_order_id_purchase_orders_id_fk";
--> statement-breakpoint
ALTER TABLE "purchase_order_items" DROP CONSTRAINT "purchase_order_items_product_id_inventory_products_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory_movements" DROP CONSTRAINT "inventory_movements_product_id_inventory_products_id_fk";
--> statement-breakpoint
ALTER TABLE "patient_treatment_progress" DROP CONSTRAINT "patient_treatment_progress_patient_id_patients_id_fk";
--> statement-breakpoint
ALTER TABLE "patient_treatment_progress" DROP CONSTRAINT "patient_treatment_progress_phase_id_treatment_phases_id_fk";
--> statement-breakpoint
ALTER TABLE "patient_documents" DROP CONSTRAINT "patient_documents_patient_id_patients_id_fk";
--> statement-breakpoint
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_patient_id_patients_id_fk";
--> statement-breakpoint
ALTER TABLE "notifications" DROP CONSTRAINT "notifications_invoice_id_invoices_id_fk";
--> statement-breakpoint
ALTER TABLE "signatures" DROP CONSTRAINT "signatures_patient_id_patients_id_fk";
--> statement-breakpoint
ALTER TABLE "signatures" DROP CONSTRAINT "signatures_staff_id_staff_id_fk";
--> statement-breakpoint
ALTER TABLE "user_sessions" DROP CONSTRAINT "user_sessions_user_id_users_id_fk";
--> statement-breakpoint

-- Parent tables
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_patient_id_patients_id_fk";
--> statement-breakpoint
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_doctor_id_doctors_id_fk";
--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_patient_id_patients_id_fk";
--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_doctor_id_doctors_id_fk";
--> statement-breakpoint
ALTER TABLE "lab_cases" DROP CONSTRAINT "lab_cases_patient_id_patients_id_fk";
--> statement-breakpoint
ALTER TABLE "lab_cases" DROP CONSTRAINT "lab_cases_doctor_id_doctors_id_fk";
--> statement-breakpoint
ALTER TABLE "quotations" DROP CONSTRAINT "quotations_patient_id_patients_id_fk";
--> statement-breakpoint
ALTER TABLE "quotations" DROP CONSTRAINT "quotations_doctor_id_doctors_id_fk";
--> statement-breakpoint
ALTER TABLE "quotations" DROP CONSTRAINT "quotations_converted_to_invoice_id_invoices_id_fk";
--> statement-breakpoint
ALTER TABLE "dental_charts" DROP CONSTRAINT "dental_charts_patient_id_patients_id_fk";
--> statement-breakpoint
ALTER TABLE "medical_history" DROP CONSTRAINT "medical_history_patient_id_patients_id_fk";
--> statement-breakpoint
ALTER TABLE "treatments" DROP CONSTRAINT "treatments_category_id_treatment_categories_id_fk";
--> statement-breakpoint
ALTER TABLE "inventory_products" DROP CONSTRAINT "inventory_products_supplier_id_inventory_suppliers_id_fk";
--> statement-breakpoint
ALTER TABLE "purchase_orders" DROP CONSTRAINT "purchase_orders_supplier_id_inventory_suppliers_id_fk";
--> statement-breakpoint
ALTER TABLE "expenses" DROP CONSTRAINT "expenses_supplier_id_inventory_suppliers_id_fk";
--> statement-breakpoint
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_assignee_id_staff_id_fk";
--> statement-breakpoint
ALTER TABLE "doctors" DROP CONSTRAINT "doctors_staff_id_staff_id_fk";
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_staff_id_staff_id_fk";
--> statement-breakpoint

-- ============================================================================
-- Recreate FKs with CASCADE/RESTRICT
-- ============================================================================

-- CASCADE: Child data disappears with parent
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_invoices_id_fk"
  FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_invoices_id_fk"
  FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_quotation_id_quotations_id_fk"
  FOREIGN KEY ("quotation_id") REFERENCES "public"."quotations"("id") ON DELETE CASCADE ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "dental_chart_entries" ADD CONSTRAINT "dental_chart_entries_chart_id_dental_charts_id_fk"
  FOREIGN KEY ("chart_id") REFERENCES "public"."dental_charts"("id") ON DELETE CASCADE ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "dental_chart_notes" ADD CONSTRAINT "dental_chart_notes_chart_id_dental_charts_id_fk"
  FOREIGN KEY ("chart_id") REFERENCES "public"."dental_charts"("id") ON DELETE CASCADE ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_order_id_purchase_orders_id_fk"
  FOREIGN KEY ("order_id") REFERENCES "public"."purchase_orders"("id") ON DELETE CASCADE ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "patient_treatment_progress" ADD CONSTRAINT "patient_treatment_progress_patient_id_patients_id_fk"
  FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "patient_documents" ADD CONSTRAINT "patient_documents_patient_id_patients_id_fk"
  FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_patient_id_patients_id_fk"
  FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_invoice_id_invoices_id_fk"
  FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE CASCADE ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "signatures" ADD CONSTRAINT "signatures_patient_id_patients_id_fk"
  FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fk"
  FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "lab_cases" ADD CONSTRAINT "lab_cases_patient_id_patients_id_fk"
  FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_patient_id_patients_id_fk"
  FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "dental_charts" ADD CONSTRAINT "dental_charts_patient_id_patients_id_fk"
  FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "medical_history" ADD CONSTRAINT "medical_history_patient_id_patients_id_fk"
  FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE CASCADE ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "inventory_movements" ADD CONSTRAINT "inventory_movements_product_id_inventory_products_id_fk"
  FOREIGN KEY ("product_id") REFERENCES "public"."inventory_products"("id") ON DELETE CASCADE ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "purchase_order_items" ADD CONSTRAINT "purchase_order_items_product_id_inventory_products_id_fk"
  FOREIGN KEY ("product_id") REFERENCES "public"."inventory_products"("id") ON DELETE CASCADE ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assignee_id_staff_id_fk"
  FOREIGN KEY ("assignee_id") REFERENCES "public"."staff"("id") ON DELETE CASCADE ON UPDATE no action;
--> statement-breakpoint

-- CASCADE: Doctor/staff links (staff deletion cascades)
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_staff_id_staff_id_fk"
  FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE CASCADE ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_staff_id_staff_id_fk"
  FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE CASCADE ON UPDATE no action;
--> statement-breakpoint

-- RESTRICT: Prevent deletion if children exist
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_patient_id_patients_id_fk"
  FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE RESTRICT ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_doctor_id_doctors_id_fk"
  FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE RESTRICT ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_doctors_id_fk"
  FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE RESTRICT ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "lab_cases" ADD CONSTRAINT "lab_cases_doctor_id_doctors_id_fk"
  FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE RESTRICT ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_doctor_id_doctors_id_fk"
  FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE RESTRICT ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_converted_to_invoice_id_invoices_id_fk"
  FOREIGN KEY ("converted_to_invoice_id") REFERENCES "public"."invoices"("id") ON DELETE RESTRICT ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "dental_chart_entries" ADD CONSTRAINT "dental_chart_entries_doctor_id_doctors_id_fk"
  FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE RESTRICT ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "treatments" ADD CONSTRAINT "treatments_category_id_treatment_categories_id_fk"
  FOREIGN KEY ("category_id") REFERENCES "public"."treatment_categories"("id") ON DELETE RESTRICT ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "inventory_products" ADD CONSTRAINT "inventory_products_supplier_id_inventory_suppliers_id_fk"
  FOREIGN KEY ("supplier_id") REFERENCES "public"."inventory_suppliers"("id") ON DELETE RESTRICT ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "purchase_orders" ADD CONSTRAINT "purchase_orders_supplier_id_inventory_suppliers_id_fk"
  FOREIGN KEY ("supplier_id") REFERENCES "public"."inventory_suppliers"("id") ON DELETE RESTRICT ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_supplier_id_inventory_suppliers_id_fk"
  FOREIGN KEY ("supplier_id") REFERENCES "public"."inventory_suppliers"("id") ON DELETE RESTRICT ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "patient_treatment_progress" ADD CONSTRAINT "patient_treatment_progress_phase_id_treatment_phases_id_fk"
  FOREIGN KEY ("phase_id") REFERENCES "public"."treatment_phases"("id") ON DELETE RESTRICT ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "quotation_items" ADD CONSTRAINT "quotation_items_treatment_id_treatments_id_fk"
  FOREIGN KEY ("treatment_id") REFERENCES "public"."treatments"("id") ON DELETE RESTRICT ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_treatment_id_treatments_id_fk"
  FOREIGN KEY ("treatment_id") REFERENCES "public"."treatments"("id") ON DELETE RESTRICT ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "signatures" ADD CONSTRAINT "signatures_staff_id_staff_id_fk"
  FOREIGN KEY ("staff_id") REFERENCES "public"."staff"("id") ON DELETE RESTRICT ON UPDATE no action;
--> statement-breakpoint

-- ============================================================================
-- PRIORITY 2: Add indexes for all foreign keys without indexes
-- ============================================================================

-- Appointments indexes
CREATE INDEX "appointments_patient_id_idx" ON "appointments" USING btree ("patient_id");
--> statement-breakpoint
CREATE INDEX "appointments_doctor_id_idx" ON "appointments" USING btree ("doctor_id");
--> statement-breakpoint
CREATE INDEX "appointments_date_idx" ON "appointments" USING btree ("appointment_date");
--> statement-breakpoint
CREATE INDEX "appointments_status_idx" ON "appointments" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "appointments_patient_date_idx" ON "appointments" USING btree ("patient_id", "appointment_date");
--> statement-breakpoint

-- Invoices indexes
CREATE INDEX "invoices_patient_id_idx" ON "invoices" USING btree ("patient_id");
--> statement-breakpoint
CREATE INDEX "invoices_doctor_id_idx" ON "invoices" USING btree ("doctor_id");
--> statement-breakpoint
CREATE INDEX "invoices_status_idx" ON "invoices" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "invoices_date_idx" ON "invoices" USING btree ("date");
--> statement-breakpoint
CREATE INDEX "invoices_patient_status_idx" ON "invoices" USING btree ("patient_id", "status");
--> statement-breakpoint

-- Invoice items indexes
CREATE INDEX "invoice_items_invoice_id_idx" ON "invoice_items" USING btree ("invoice_id");
--> statement-breakpoint
CREATE INDEX "invoice_items_treatment_id_idx" ON "invoice_items" USING btree ("treatment_id");
--> statement-breakpoint

-- Payments indexes
CREATE INDEX "payments_invoice_id_idx" ON "payments" USING btree ("invoice_id");
--> statement-breakpoint
CREATE INDEX "payments_date_idx" ON "payments" USING btree ("payment_date");
--> statement-breakpoint
CREATE INDEX "payments_method_idx" ON "payments" USING btree ("payment_method");
--> statement-breakpoint

-- Lab cases indexes
CREATE INDEX "lab_cases_patient_id_idx" ON "lab_cases" USING btree ("patient_id");
--> statement-breakpoint
CREATE INDEX "lab_cases_doctor_id_idx" ON "lab_cases" USING btree ("doctor_id");
--> statement-breakpoint
CREATE INDEX "lab_cases_status_idx" ON "lab_cases" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "lab_cases_due_date_idx" ON "lab_cases" USING btree ("due_date");
--> statement-breakpoint

-- Treatments indexes
CREATE INDEX "treatments_category_id_idx" ON "treatments" USING btree ("category_id");
--> statement-breakpoint
CREATE INDEX "treatments_status_idx" ON "treatments" USING btree ("status");
--> statement-breakpoint

-- Patient treatment progress indexes
CREATE INDEX "patient_treatment_progress_patient_id_idx" ON "patient_treatment_progress" USING btree ("patient_id");
--> statement-breakpoint
CREATE INDEX "patient_treatment_progress_phase_id_idx" ON "patient_treatment_progress" USING btree ("phase_id");
--> statement-breakpoint

-- Notifications indexes
CREATE INDEX "notifications_patient_id_idx" ON "notifications" USING btree ("patient_id");
--> statement-breakpoint
CREATE INDEX "notifications_invoice_id_idx" ON "notifications" USING btree ("invoice_id");
--> statement-breakpoint
CREATE INDEX "notifications_status_idx" ON "notifications" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "notifications_is_read_idx" ON "notifications" USING btree ("is_read");
--> statement-breakpoint
CREATE INDEX "notifications_type_idx" ON "notifications" USING btree ("type");
--> statement-breakpoint

-- Quotations indexes
CREATE INDEX "quotations_patient_id_idx" ON "quotations" USING btree ("patient_id");
--> statement-breakpoint
CREATE INDEX "quotations_doctor_id_idx" ON "quotations" USING btree ("doctor_id");
--> statement-breakpoint
CREATE INDEX "quotations_status_idx" ON "quotations" USING btree ("status");
--> statement-breakpoint

-- Quotation items indexes
CREATE INDEX "quotation_items_quotation_id_idx" ON "quotation_items" USING btree ("quotation_id");
--> statement-breakpoint
CREATE INDEX "quotation_items_treatment_id_idx" ON "quotation_items" USING btree ("treatment_id");
--> statement-breakpoint

-- Tasks indexes
CREATE INDEX "tasks_assignee_id_idx" ON "tasks" USING btree ("assignee_id");
--> statement-breakpoint
CREATE INDEX "tasks_status_idx" ON "tasks" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "tasks_priority_idx" ON "tasks" USING btree ("priority");
--> statement-breakpoint
CREATE INDEX "tasks_due_date_idx" ON "tasks" USING btree ("due_date");
--> statement-breakpoint

-- Dental chart entries indexes
CREATE INDEX "dental_chart_entries_doctor_id_idx" ON "dental_chart_entries" USING btree ("doctor_id");
--> statement-breakpoint

-- Signatures indexes
CREATE INDEX "signatures_patient_id_idx" ON "signatures" USING btree ("patient_id");
--> statement-breakpoint
CREATE INDEX "signatures_staff_id_idx" ON "signatures" USING btree ("staff_id");
--> statement-breakpoint

-- Doctors indexes
CREATE INDEX "doctors_staff_id_idx" ON "doctors" USING btree ("staff_id");
--> statement-breakpoint
CREATE INDEX "doctors_status_idx" ON "doctors" USING btree ("status");
--> statement-breakpoint

-- Users indexes
CREATE INDEX "users_staff_id_idx" ON "users" USING btree ("staff_id");
--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");
--> statement-breakpoint

-- Staff indexes
CREATE INDEX "staff_role_idx" ON "staff" USING btree ("role");
--> statement-breakpoint
CREATE INDEX "staff_is_active_idx" ON "staff" USING btree ("is_active");
--> statement-breakpoint

-- Patients indexes
CREATE INDEX "patients_status_idx" ON "patients" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "patients_name_idx" ON "patients" USING btree ("name");
--> statement-breakpoint

-- Purchase orders indexes
CREATE INDEX "purchase_orders_supplier_id_idx" ON "purchase_orders" USING btree ("supplier_id");
--> statement-breakpoint
CREATE INDEX "purchase_orders_status_idx" ON "purchase_orders" USING btree ("status");
--> statement-breakpoint

-- Purchase order items indexes
CREATE INDEX "purchase_order_items_order_id_idx" ON "purchase_order_items" USING btree ("order_id");
--> statement-breakpoint
CREATE INDEX "purchase_order_items_product_id_idx" ON "purchase_order_items" USING btree ("product_id");
--> statement-breakpoint

-- Inventory products indexes
CREATE INDEX "inventory_products_supplier_id_idx" ON "inventory_products" USING btree ("supplier_id");
--> statement-breakpoint
CREATE INDEX "inventory_products_is_active_idx" ON "inventory_products" USING btree ("is_active");
--> statement-breakpoint
CREATE INDEX "inventory_products_stock_idx" ON "inventory_products" USING btree ("current_stock", "minimum_stock");
--> statement-breakpoint

-- Inventory suppliers indexes
CREATE INDEX "inventory_suppliers_is_active_idx" ON "inventory_suppliers" USING btree ("is_active");
--> statement-breakpoint

-- Expenses indexes
CREATE INDEX "expenses_supplier_id_idx" ON "expenses" USING btree ("supplier_id");
--> statement-breakpoint
CREATE INDEX "expenses_type_idx" ON "expenses" USING btree ("type");
--> statement-breakpoint

-- Medical history indexes (already has patient_id and category indexes)
CREATE INDEX "medical_history_is_current_idx" ON "medical_history" USING btree ("is_current");
--> statement-breakpoint

-- Treatment phases indexes
CREATE INDEX "treatment_phases_sort_order_idx" ON "treatment_phases" USING btree ("sort_order");
--> statement-breakpoint

-- Status configs indexes
CREATE INDEX "status_configs_entity_type_idx" ON "status_configs" USING btree ("entity_type");
--> statement-breakpoint

-- Time slots indexes
CREATE INDEX "time_slots_is_active_idx" ON "time_slots" USING btree ("is_active");
--> statement-breakpoint

-- Backups indexes
CREATE INDEX "backups_status_idx" ON "backups" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "backups_created_at_idx" ON "backups" USING btree ("created_at");
--> statement-breakpoint

-- User sessions indexes
CREATE INDEX "user_sessions_expires_at_idx" ON "user_sessions" USING btree ("expires_at");
--> statement-breakpoint

-- New table indexes
CREATE INDEX "patient_treatments_patient_id_idx" ON "patient_treatments" USING btree ("patient_id");
--> statement-breakpoint
CREATE INDEX "patient_treatments_doctor_id_idx" ON "patient_treatments" USING btree ("doctor_id");
--> statement-breakpoint
CREATE INDEX "patient_treatments_status_idx" ON "patient_treatments" USING btree ("status");
--> statement-breakpoint
CREATE INDEX "patient_treatments_treatment_id_idx" ON "patient_treatments" USING btree ("treatment_id");
--> statement-breakpoint

CREATE INDEX "prescriptions_patient_id_idx" ON "prescriptions" USING btree ("patient_id");
--> statement-breakpoint
CREATE INDEX "prescriptions_doctor_id_idx" ON "prescriptions" USING btree ("doctor_id");
--> statement-breakpoint
CREATE INDEX "prescriptions_status_idx" ON "prescriptions" USING btree ("status");
--> statement-breakpoint

CREATE INDEX "prescription_items_prescription_id_idx" ON "prescription_items" USING btree ("prescription_id");
--> statement-breakpoint

CREATE INDEX "recall_reminders_patient_id_idx" ON "recall_reminders" USING btree ("patient_id");
--> statement-breakpoint
CREATE INDEX "recall_reminders_appointment_id_idx" ON "recall_reminders" USING btree ("appointment_id");
--> statement-breakpoint
CREATE INDEX "recall_reminders_due_date_idx" ON "recall_reminders" USING btree ("due_date");
--> statement-breakpoint
CREATE INDEX "recall_reminders_status_idx" ON "recall_reminders" USING btree ("status");
--> statement-breakpoint

CREATE INDEX "doctor_schedules_doctor_id_idx" ON "doctor_schedules" USING btree ("doctor_id");
--> statement-breakpoint
CREATE INDEX "doctor_schedules_day_of_week_idx" ON "doctor_schedules" USING btree ("day_of_week");
--> statement-breakpoint

CREATE INDEX "blocked_times_doctor_id_idx" ON "blocked_times" USING btree ("doctor_id");
--> statement-breakpoint
CREATE INDEX "blocked_times_start_time_idx" ON "blocked_times" USING btree ("start_time");
--> statement-breakpoint
CREATE INDEX "blocked_times_end_time_idx" ON "blocked_times" USING btree ("end_time");
--> statement-breakpoint

CREATE INDEX "insurance_claims_patient_id_idx" ON "insurance_claims" USING btree ("patient_id");
--> statement-breakpoint
CREATE INDEX "insurance_claims_invoice_id_idx" ON "insurance_claims" USING btree ("invoice_id");
--> statement-breakpoint
CREATE INDEX "insurance_claims_status_idx" ON "insurance_claims" USING btree ("status");
--> statement-breakpoint

CREATE INDEX "patient_statistics_preferred_doctor_id_idx" ON "patient_statistics" USING btree ("preferred_doctor_id");
--> statement-breakpoint
CREATE INDEX "patient_statistics_risk_level_idx" ON "patient_statistics" USING btree ("risk_level");
--> statement-breakpoint

-- Global search text indexes (using pg_trgm for ILIKE optimization)
CREATE INDEX "patients_name_text_idx" ON "patients" USING btree ("name" varchar_pattern_ops);
--> statement-breakpoint
CREATE INDEX "patients_phone_text_idx" ON "patients" USING btree ("phone" varchar_pattern_ops);
--> statement-breakpoint
CREATE INDEX "treatments_name_text_idx" ON "treatments" USING btree ("name" varchar_pattern_ops);
--> statement-breakpoint
CREATE INDEX "inventory_products_name_text_idx" ON "inventory_products" USING btree ("name" varchar_pattern_ops);
--> statement-breakpoint
