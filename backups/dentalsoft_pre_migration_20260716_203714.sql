--
-- PostgreSQL database dump
--

\restrict E8X7AQNPgX7iHkmUCwrxuITdXXoqtqoYFopu2irjglNWvDXTwLrSg23GbIpQE4x

-- Dumped from database version 18.4
-- Dumped by pg_dump version 18.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appointments (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    patient_id character varying NOT NULL,
    doctor_id character varying NOT NULL,
    appointment_date timestamp without time zone NOT NULL,
    duration integer DEFAULT 45 NOT NULL,
    type text NOT NULL,
    status text DEFAULT 'Scheduled'::text NOT NULL,
    color text,
    room text,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.appointments OWNER TO postgres;

--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying,
    username text,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id character varying,
    entity_name text,
    previous_value jsonb,
    new_value jsonb,
    ip_address text,
    user_agent text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: backups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.backups (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    filename text NOT NULL,
    file_path text NOT NULL,
    file_size integer,
    status text DEFAULT 'completed'::text NOT NULL,
    type text DEFAULT 'manual'::text NOT NULL,
    encrypted boolean DEFAULT true NOT NULL,
    checksum text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.backups OWNER TO postgres;

--
-- Name: clinic_settings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.clinic_settings (
    key text NOT NULL,
    value jsonb NOT NULL
);


ALTER TABLE public.clinic_settings OWNER TO postgres;

--
-- Name: dental_chart_entries; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dental_chart_entries (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    chart_id character varying NOT NULL,
    tooth_number integer NOT NULL,
    surface text,
    status text DEFAULT 'healthy'::text NOT NULL,
    treatment text,
    treatment_date timestamp without time zone,
    doctor_id character varying,
    notes text,
    color text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.dental_chart_entries OWNER TO postgres;

--
-- Name: dental_chart_notes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dental_chart_notes (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    chart_id character varying NOT NULL,
    note text NOT NULL,
    author_id character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.dental_chart_notes OWNER TO postgres;

--
-- Name: dental_charts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dental_charts (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    patient_id character varying NOT NULL,
    chart_type text DEFAULT 'permanent'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.dental_charts OWNER TO postgres;

--
-- Name: doctors; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.doctors (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    specialization text,
    email text,
    phone text,
    status text DEFAULT 'Active'::text NOT NULL,
    staff_id character varying,
    color text DEFAULT '#3b82f6'::text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.doctors OWNER TO postgres;

--
-- Name: expenses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.expenses (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    category text NOT NULL,
    description text NOT NULL,
    amount numeric(10,2) NOT NULL,
    date timestamp without time zone DEFAULT now() NOT NULL,
    type text DEFAULT 'variable'::text NOT NULL,
    recurring boolean DEFAULT false NOT NULL,
    recurring_interval text,
    supplier_id character varying,
    notes text,
    receipt_url text,
    created_by character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.expenses OWNER TO postgres;

--
-- Name: inventory_movements; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_movements (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    product_id character varying NOT NULL,
    type text NOT NULL,
    quantity integer NOT NULL,
    reference text,
    notes text,
    performed_by character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.inventory_movements OWNER TO postgres;

--
-- Name: inventory_products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_products (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    sku text,
    category text,
    description text,
    unit text DEFAULT 'piece'::text NOT NULL,
    purchase_price numeric(10,2) DEFAULT 0.00 NOT NULL,
    selling_price numeric(10,2) DEFAULT 0.00 NOT NULL,
    current_stock integer DEFAULT 0 NOT NULL,
    minimum_stock integer DEFAULT 5 NOT NULL,
    maximum_stock integer DEFAULT 100 NOT NULL,
    supplier_id character varying,
    expiration_date timestamp without time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.inventory_products OWNER TO postgres;

--
-- Name: inventory_suppliers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.inventory_suppliers (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    contact_person text,
    email text,
    phone text,
    address text,
    notes text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.inventory_suppliers OWNER TO postgres;

--
-- Name: invoice_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoice_items (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    invoice_id character varying NOT NULL,
    treatment_id character varying,
    description text NOT NULL,
    tooth_number integer,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(10,2) DEFAULT 0.00 NOT NULL,
    discount numeric(5,2) DEFAULT 0.00 NOT NULL,
    tax numeric(5,2) DEFAULT 0.00 NOT NULL,
    total numeric(10,2) DEFAULT 0.00 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.invoice_items OWNER TO postgres;

--
-- Name: invoices; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.invoices (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    invoice_number text,
    patient_id character varying NOT NULL,
    amount numeric(10,2) NOT NULL,
    paid_amount numeric(10,2) DEFAULT 0.00 NOT NULL,
    doctor_id character varying,
    date timestamp without time zone DEFAULT now() NOT NULL,
    due_date timestamp without time zone,
    status text DEFAULT 'Pending'::text NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.invoices OWNER TO postgres;

--
-- Name: lab_cases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lab_cases (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    patient_id character varying NOT NULL,
    doctor_id character varying NOT NULL,
    lab_name text NOT NULL,
    type text NOT NULL,
    status text DEFAULT 'Sent'::text NOT NULL,
    due_date timestamp without time zone,
    description text,
    cost numeric(10,2) DEFAULT 0.00,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.lab_cases OWNER TO postgres;

--
-- Name: medical_history; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.medical_history (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    patient_id character varying NOT NULL,
    category text NOT NULL,
    value text NOT NULL,
    severity text,
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    notes text,
    is_current boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.medical_history OWNER TO postgres;

--
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    patient_id character varying,
    invoice_id character varying,
    type text NOT NULL,
    severity text DEFAULT 'minor'::text NOT NULL,
    title text NOT NULL,
    description text,
    status text DEFAULT 'active'::text NOT NULL,
    is_read boolean DEFAULT false NOT NULL,
    created_by character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- Name: patient_documents; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient_documents (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    patient_id character varying NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    category text,
    file_path text NOT NULL,
    file_size integer,
    mime_type text,
    uploaded_by character varying,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.patient_documents OWNER TO postgres;

--
-- Name: patient_treatment_progress; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patient_treatment_progress (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    patient_id character varying NOT NULL,
    phase_id character varying NOT NULL,
    percentage integer DEFAULT 0 NOT NULL,
    is_current boolean DEFAULT false NOT NULL,
    started_at timestamp without time zone DEFAULT now() NOT NULL,
    completed_at timestamp without time zone
);


ALTER TABLE public.patient_treatment_progress OWNER TO postgres;

--
-- Name: patients; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.patients (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    patient_id text NOT NULL,
    name text NOT NULL,
    age integer NOT NULL,
    gender text NOT NULL,
    phone text,
    email text,
    address text,
    date_of_birth timestamp without time zone,
    blood_type text,
    national_id text,
    emergency_contact text,
    emergency_phone text,
    insurance_provider text,
    insurance_number text,
    last_visit timestamp without time zone,
    status text DEFAULT 'Active'::text NOT NULL,
    balance numeric(10,2) DEFAULT 0.00 NOT NULL,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.patients OWNER TO postgres;

--
-- Name: payments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payments (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    invoice_id character varying NOT NULL,
    amount numeric(10,2) NOT NULL,
    payment_date timestamp without time zone DEFAULT now() NOT NULL,
    payment_method text DEFAULT 'cash'::text NOT NULL,
    notes text,
    received_by character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.payments OWNER TO postgres;

--
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_order_items (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    order_id character varying NOT NULL,
    product_id character varying NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(10,2) DEFAULT 0.00 NOT NULL,
    total numeric(10,2) DEFAULT 0.00 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.purchase_order_items OWNER TO postgres;

--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.purchase_orders (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    order_number text NOT NULL,
    supplier_id character varying NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    total_amount numeric(10,2) DEFAULT 0.00 NOT NULL,
    expected_date timestamp without time zone,
    received_date timestamp without time zone,
    notes text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.purchase_orders OWNER TO postgres;

--
-- Name: quotation_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quotation_items (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    quotation_id character varying NOT NULL,
    treatment_id character varying,
    description text NOT NULL,
    tooth_number integer,
    quantity integer DEFAULT 1 NOT NULL,
    unit_price numeric(10,2) DEFAULT 0.00 NOT NULL,
    total numeric(10,2) DEFAULT 0.00 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.quotation_items OWNER TO postgres;

--
-- Name: quotations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quotations (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    quote_number text NOT NULL,
    patient_id character varying NOT NULL,
    doctor_id character varying,
    status text DEFAULT 'draft'::text NOT NULL,
    total_amount numeric(10,2) DEFAULT 0.00 NOT NULL,
    discount numeric(10,2) DEFAULT 0.00 NOT NULL,
    tax numeric(10,2) DEFAULT 0.00 NOT NULL,
    final_amount numeric(10,2) DEFAULT 0.00 NOT NULL,
    notes text,
    valid_until timestamp without time zone,
    converted_to_invoice_id character varying,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.quotations OWNER TO postgres;

--
-- Name: signatures; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.signatures (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    patient_id character varying,
    staff_id character varying,
    document_type text NOT NULL,
    document_id character varying,
    signature_data text NOT NULL,
    signed_at timestamp without time zone DEFAULT now() NOT NULL,
    ip_address text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.signatures OWNER TO postgres;

--
-- Name: staff; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.staff (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    role text NOT NULL,
    email text,
    phone text,
    photo_url text,
    specialization text,
    commission_percentage numeric(5,2),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.staff OWNER TO postgres;

--
-- Name: status_configs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.status_configs (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    entity_type text NOT NULL,
    status_value text NOT NULL,
    label text NOT NULL,
    color_class text DEFAULT 'bg-gray-50 text-gray-700 border-gray-200'::text NOT NULL,
    icon_name text,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.status_configs OWNER TO postgres;

--
-- Name: tasks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tasks (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    title text NOT NULL,
    assignee_id character varying,
    priority text DEFAULT 'Medium'::text NOT NULL,
    due_date timestamp without time zone,
    status text DEFAULT 'Pending'::text NOT NULL,
    description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.tasks OWNER TO postgres;

--
-- Name: time_slots; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.time_slots (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    label text NOT NULL,
    value text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.time_slots OWNER TO postgres;

--
-- Name: treatment_categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.treatment_categories (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    icon text DEFAULT 'Stethoscope'::text NOT NULL,
    color text DEFAULT 'bg-emerald-50 text-emerald-600'::text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL
);


ALTER TABLE public.treatment_categories OWNER TO postgres;

--
-- Name: treatment_phases; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.treatment_phases (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    color_class text DEFAULT 'bg-gray-100 text-gray-700'::text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.treatment_phases OWNER TO postgres;

--
-- Name: treatments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.treatments (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    category_id character varying NOT NULL,
    name text NOT NULL,
    duration text DEFAULT '30 min'::text NOT NULL,
    description text,
    price numeric(10,2) DEFAULT 0.00,
    is_active boolean DEFAULT true NOT NULL,
    sort_order integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.treatments OWNER TO postgres;

--
-- Name: user_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_sessions (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    user_id character varying NOT NULL,
    token text NOT NULL,
    ip_address text,
    user_agent text,
    expires_at timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.user_sessions OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id character varying DEFAULT gen_random_uuid() NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    role text DEFAULT 'admin'::text NOT NULL,
    staff_id character varying,
    last_login timestamp without time zone,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Data for Name: appointments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appointments (id, patient_id, doctor_id, appointment_date, duration, type, status, color, room, notes, created_at) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_id, username, action, entity_type, entity_id, entity_name, previous_value, new_value, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: backups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.backups (id, filename, file_path, file_size, status, type, encrypted, checksum, created_at) FROM stdin;
\.


--
-- Data for Name: clinic_settings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.clinic_settings (key, value) FROM stdin;
clinicHours	{"fri": "09:00-17:00", "mon": "09:00-18:00", "sat": "09:00-13:00", "sun": null, "thu": "09:00-18:00", "tue": "09:00-18:00", "wed": "09:00-18:00"}
clinicName	"Dontex dz"
clinicAddress	"Alger — P489+F6P, Bachdjerah 16026"
clinicPhone	"0771 29 40 62"
clinicEmail	""
clinicDoctorName	"Amrani Samir"
\.


--
-- Data for Name: dental_chart_entries; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dental_chart_entries (id, chart_id, tooth_number, surface, status, treatment, treatment_date, doctor_id, notes, color, created_at) FROM stdin;
\.


--
-- Data for Name: dental_chart_notes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dental_chart_notes (id, chart_id, note, author_id, created_at) FROM stdin;
\.


--
-- Data for Name: dental_charts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dental_charts (id, patient_id, chart_type, created_at, updated_at) FROM stdin;
44440381-cd0b-4d8c-9d67-29168ec54ea2	ae188703-7150-4e0c-900c-b942e4594f92	permanent	2026-07-03 02:24:26.977526	2026-07-03 02:24:26.977526
\.


--
-- Data for Name: doctors; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.doctors (id, name, specialization, email, phone, status, staff_id, color, created_at) FROM stdin;
25de92cf-966d-4e7f-92ab-1d20e02d0b2d	amrani samir	\N	\N	\N	Active	763c0be5-7020-42e5-9618-e48a92365615	#3b82f6	2026-07-03 00:54:24.587721
\.


--
-- Data for Name: expenses; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.expenses (id, category, description, amount, date, type, recurring, recurring_interval, supplier_id, notes, receipt_url, created_by, created_at) FROM stdin;
\.


--
-- Data for Name: inventory_movements; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_movements (id, product_id, type, quantity, reference, notes, performed_by, created_at) FROM stdin;
\.


--
-- Data for Name: inventory_products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_products (id, name, sku, category, description, unit, purchase_price, selling_price, current_stock, minimum_stock, maximum_stock, supplier_id, expiration_date, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: inventory_suppliers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.inventory_suppliers (id, name, contact_person, email, phone, address, notes, is_active, created_at) FROM stdin;
\.


--
-- Data for Name: invoice_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoice_items (id, invoice_id, treatment_id, description, tooth_number, quantity, unit_price, discount, tax, total, created_at) FROM stdin;
\.


--
-- Data for Name: invoices; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.invoices (id, invoice_number, patient_id, amount, paid_amount, doctor_id, date, due_date, status, notes, created_at) FROM stdin;
d8a046e3-cf36-46eb-985a-fd2f27b8e547	INV-1001	a6d6e4e5-babc-4101-a421-6e6668eb2f6c	500.00	300.00	\N	2026-07-02 21:07:18.841317	\N	Pending	\N	2026-07-02 21:07:18.841317
2bcfff9c-2d45-45b6-82c6-fe098a5feb67	INV-1003	cb05673f-6ad5-463d-b7c1-5c0a9ca83350	8900.00	0.00	\N	2026-07-02 00:00:00	2026-07-16 00:00:00	Overdue	\N	2026-07-02 23:06:12.548605
c75900a2-c778-413f-8d81-8ff829f6adae	INV-1002	cb05673f-6ad5-463d-b7c1-5c0a9ca83350	300.00	300.00	\N	2026-07-02 21:09:59.827767	\N	Pending	Converted from quote DEV-0001: 	2026-07-02 21:09:59.827767
\.


--
-- Data for Name: lab_cases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lab_cases (id, patient_id, doctor_id, lab_name, type, status, due_date, description, cost, created_at) FROM stdin;
\.


--
-- Data for Name: medical_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.medical_history (id, patient_id, category, value, severity, start_date, end_date, notes, is_current, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, patient_id, invoice_id, type, severity, title, description, status, is_read, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: patient_documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patient_documents (id, patient_id, name, type, category, file_path, file_size, mime_type, uploaded_by, notes, created_at) FROM stdin;
\.


--
-- Data for Name: patient_treatment_progress; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patient_treatment_progress (id, patient_id, phase_id, percentage, is_current, started_at, completed_at) FROM stdin;
\.


--
-- Data for Name: patients; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.patients (id, patient_id, name, age, gender, phone, email, address, date_of_birth, blood_type, national_id, emergency_contact, emergency_phone, insurance_provider, insurance_number, last_visit, status, balance, notes, created_at) FROM stdin;
a6d6e4e5-babc-4101-a421-6e6668eb2f6c	P-001	Test P	30	M	0555000000	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Active	0.00	\N	2026-07-02 21:07:18.780821
cb05673f-6ad5-463d-b7c1-5c0a9ca83350	P-002	Test Q	25	F	0555000001	\N	\N	\N	\N	\N	\N	\N	\N	\N	\N	Active	0.00	\N	2026-07-02 21:07:34.674611
ae188703-7150-4e0c-900c-b942e4594f92	P-003	alilou	45	Male	0660739087		alger	\N	\N	\N	\N	\N	\N	\N	\N	Active	0.00	\N	2026-07-03 00:54:58.338824
\.


--
-- Data for Name: payments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payments (id, invoice_id, amount, payment_date, payment_method, notes, received_by, created_at) FROM stdin;
b77d7932-411b-454c-862d-20a8f9ab52cc	d8a046e3-cf36-46eb-985a-fd2f27b8e547	300.00	2026-07-02 21:07:18.855765	cash	\N	\N	2026-07-02 21:07:18.855765
197458a2-6d95-48ef-ba9e-59ccaf8dc52f	c75900a2-c778-413f-8d81-8ff829f6adae	300.00	2026-07-02 00:00:00	cash	\N	\N	2026-07-03 01:05:26.535846
\.


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_order_items (id, order_id, product_id, quantity, unit_price, total, created_at) FROM stdin;
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.purchase_orders (id, order_number, supplier_id, status, total_amount, expected_date, received_date, notes, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: quotation_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quotation_items (id, quotation_id, treatment_id, description, tooth_number, quantity, unit_price, total, created_at) FROM stdin;
82910d69-7df4-40e4-839d-081f133772d8	81f0ef7c-4cd7-4694-b8ef-0bcc0a6cca17	\N	Test	\N	1	300.00	300.00	2026-07-02 21:09:59.794427
\.


--
-- Data for Name: quotations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.quotations (id, quote_number, patient_id, doctor_id, status, total_amount, discount, tax, final_amount, notes, valid_until, converted_to_invoice_id, created_at, updated_at) FROM stdin;
81f0ef7c-4cd7-4694-b8ef-0bcc0a6cca17	DEV-0001	cb05673f-6ad5-463d-b7c1-5c0a9ca83350	\N	converted	300.00	0.00	0.00	300.00	\N	\N	c75900a2-c778-413f-8d81-8ff829f6adae	2026-07-02 21:09:59.760752	2026-07-02 19:09:59.833
\.


--
-- Data for Name: signatures; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.signatures (id, patient_id, staff_id, document_type, document_id, signature_data, signed_at, ip_address, created_at) FROM stdin;
\.


--
-- Data for Name: staff; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.staff (id, name, role, email, phone, photo_url, specialization, commission_percentage, is_active, created_at) FROM stdin;
763c0be5-7020-42e5-9618-e48a92365615	amrani samir	Admin	\N	\N	\N	\N	\N	t	2026-07-03 00:54:24.587721
\.


--
-- Data for Name: status_configs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.status_configs (id, entity_type, status_value, label, color_class, icon_name, sort_order) FROM stdin;
6d26c075-699d-457a-8953-db231fc0e0ef	appointment	Scheduled	Planifié	bg-blue-50 text-blue-700 border-blue-200	Calendar	0
75b2c96b-d8d1-4b3e-b974-c5c5f8e5c824	appointment	In Progress	En cours	bg-amber-50 text-amber-700 border-amber-200	Clock	1
bd8bf642-3cd2-482e-be65-e83cc8b8edd1	appointment	Completed	Terminé	bg-emerald-50 text-emerald-700 border-emerald-200	CheckCircle	2
484aaa13-1107-4969-9f9e-f86f369e819e	appointment	Cancelled	Annulé	bg-red-50 text-red-700 border-red-200	XCircle	3
0cb09ecd-0c88-4eb1-8feb-ea04421bb2c0	patient	Active	Actif	bg-emerald-50 text-emerald-700 border-emerald-200	User	0
854891d5-0e5f-4f4d-b265-a331aa9c2f33	patient	Treatment	En traitement	bg-amber-50 text-amber-700 border-amber-200	Activity	1
837f3c8f-17b0-4f84-8842-89b2f023079f	patient	Inactive	Inactif	bg-gray-50 text-gray-700 border-gray-200	UserMinus	2
3fcb1e5a-9c9d-41be-b822-5ca1e35a1f42	invoice	Pending	En attente	bg-amber-50 text-amber-700 border-amber-200	Clock	0
508dc6f7-46ac-47f0-b1a8-4474b8f0448b	invoice	Paid	Payée	bg-emerald-50 text-emerald-700 border-emerald-200	CheckCircle	1
5c7817e3-f3ec-4bed-9605-6e8c5bdf1dcf	invoice	Overdue	En retard	bg-red-50 text-red-700 border-red-200	AlertCircle	2
acf10409-c2ba-42fd-93cb-33c57c13c7d8	lab	Sent	Envoyé	bg-blue-50 text-blue-700 border-blue-200	Send	0
95741533-d37a-4335-9393-c583330b4216	lab	In Progress	En cours	bg-amber-50 text-amber-700 border-amber-200	Clock	1
bedcdc67-4054-4502-b1f4-4f2119cb458a	lab	Received	Reçu	bg-emerald-50 text-emerald-700 border-emerald-200	Package	2
012442b8-b6dd-400e-ace5-0af53123a933	lab	Delivered	Livré	bg-purple-50 text-purple-700 border-purple-200	CheckCheck	3
04f37187-ec31-4475-acdb-7f30c155047c	task	Pending	À faire	bg-gray-50 text-gray-700 border-gray-200	Circle	0
3d14d26f-f23a-4594-a191-955ce83811a5	task	In Progress	En cours	bg-amber-50 text-amber-700 border-amber-200	Clock	1
5d62cfb5-0b64-42f9-8487-ce984014027e	task	Completed	Terminée	bg-emerald-50 text-emerald-700 border-emerald-200	CheckCircle	2
\.


--
-- Data for Name: tasks; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tasks (id, title, assignee_id, priority, due_date, status, description, created_at) FROM stdin;
\.


--
-- Data for Name: time_slots; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.time_slots (id, label, value, is_active, sort_order) FROM stdin;
667ff77e-c4da-4aa3-87f2-c747b1ec0fb9	09:00	09:00	t	0
5a6cc8f4-39af-421a-b30b-6ccb337ba18d	09:30	09:30	t	1
f8c26b32-98f3-421d-901f-952548316a38	10:00	10:00	t	2
71deaea3-402e-454d-9641-8f9ed24ebcea	10:30	10:30	t	3
dcbeee76-917d-4424-9541-44d94e62bd7f	11:00	11:00	t	4
3a151c71-d535-4a84-ac2d-ff3468c7f4ac	11:30	11:30	t	5
3dad1099-5e61-47e1-9142-496afb007478	13:00	13:00	t	6
0f330aac-53e0-4e72-aa7c-b6ff17d3cecd	13:30	13:30	t	7
2f4cd34b-a257-40ad-990f-24e46ea310c9	14:00	14:00	t	8
b4d45a8e-5412-4fa7-b54a-2c42fa49e7ab	14:30	14:30	t	9
c44287cd-f747-4a60-9941-367fec8243b3	15:00	15:00	t	10
8746fbce-94c7-4c3e-a152-955cf6772fc2	15:30	15:30	t	11
e5ec9a03-4f43-4fcf-9923-2ffd5fc6401f	16:00	16:00	t	12
107d659e-d354-4aa4-8ae1-e9ab033949d0	16:30	16:30	t	13
1b58848b-f2be-4c68-8004-68b70b7073f7	17:00	17:00	t	14
\.


--
-- Data for Name: treatment_categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.treatment_categories (id, name, icon, color, sort_order) FROM stdin;
2cc72681-c22f-46ce-8a2e-bac89e683652	Soins Généraux	Stethoscope	bg-emerald-50 text-emerald-600	0
8293d481-aa09-4390-b8e7-0be49c3702ad	Orthodontie	AlignCenter	bg-blue-50 text-blue-600	1
a7c759e4-5c94-4c9e-aefe-ab0cf0c80134	Chirurgie	Scissors	bg-red-50 text-red-600	2
8c8b19ab-f941-4279-bd2d-2f93af957a8e	Prothèses	Brush	bg-amber-50 text-amber-600	3
95bc8a8e-c583-46e5-99fe-0c46adb40776	Pédodontie	Smile	bg-pink-50 text-pink-600	4
\.


--
-- Data for Name: treatment_phases; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.treatment_phases (id, name, sort_order, color_class, created_at) FROM stdin;
50cca2bb-70f9-420d-bd62-c5f577b267f1	Diagnostic	0	bg-blue-100 text-blue-700	2026-07-02 20:31:39.125245
7c4a0934-cb5b-4d74-9afb-f249756c2018	Plan de traitement	1	bg-indigo-100 text-indigo-700	2026-07-02 20:31:39.125245
3e89ae2c-a4f6-4043-abd7-e098ef3eb3bf	En cours	2	bg-amber-100 text-amber-700	2026-07-02 20:31:39.125245
d0fdd87d-a310-46a1-8969-92f189eef913	Terminé	3	bg-emerald-100 text-emerald-700	2026-07-02 20:31:39.125245
\.


--
-- Data for Name: treatments; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.treatments (id, category_id, name, duration, description, price, is_active, sort_order, created_at) FROM stdin;
faa3b65b-c6a0-479a-86bd-2372de25a699	2cc72681-c22f-46ce-8a2e-bac89e683652	Détartrage	30 min	Nettoyage professionnel des dents	0.00	t	0	2026-07-02 20:31:38.904694
97602cb2-bbe8-4a94-9825-eab52f312fc5	2cc72681-c22f-46ce-8a2e-bac89e683652	Traitement de carie	45 min	Soins des caries dentaires	0.00	t	1	2026-07-02 20:31:38.904694
1358fc8c-48bb-4024-8e4e-7c3b17d4500c	2cc72681-c22f-46ce-8a2e-bac89e683652	Dévitalisation	60 min	Traitement endodontique	0.00	t	2	2026-07-02 20:31:38.904694
514c64b0-0c91-4620-8c85-d03cdfd4dae7	2cc72681-c22f-46ce-8a2e-bac89e683652	Blanchiment	60 min	Blanchiment dentaire professionnel	0.00	t	3	2026-07-02 20:31:38.904694
e3dcb53e-c379-4d17-80f0-8d2404f6b087	8293d481-aa09-4390-b8e7-0be49c3702ad	Appareil dentaire	90 min	Pose d'appareil orthodontique	0.00	t	0	2026-07-02 20:31:38.904694
6eb8eba7-0ecf-485d-93be-53a6afed6d6f	8293d481-aa09-4390-b8e7-0be49c3702ad	Gouttière	45 min	Gouttière orthodontique	0.00	t	1	2026-07-02 20:31:38.904694
e124ab95-09b7-4434-a624-82a77887fb58	8293d481-aa09-4390-b8e7-0be49c3702ad	Contention	30 min	Contention post-traitement	0.00	t	2	2026-07-02 20:31:38.904694
21c1d74a-2afb-43f9-86a0-f82daaffbbe1	a7c759e4-5c94-4c9e-aefe-ab0cf0c80134	Extraction simple	30 min	Extraction dentaire simple	0.00	t	0	2026-07-02 20:31:38.904694
ac14d5d9-fd8d-4a8f-83df-5c5f10fe420d	a7c759e4-5c94-4c9e-aefe-ab0cf0c80134	Extraction complexe	60 min	Extraction dentaire chirurgicale	0.00	t	1	2026-07-02 20:31:38.904694
18e71505-f834-4a03-81bf-54cfdcbebc9e	a7c759e4-5c94-4c9e-aefe-ab0cf0c80134	Dent de sagesse	90 min	Extraction des dents de sagesse	0.00	t	2	2026-07-02 20:31:38.904694
13e114b2-e277-454c-bf99-22e35d976a70	8c8b19ab-f941-4279-bd2d-2f93af957a8e	Couronne dentaire	120 min	Pose de couronne dentaire	0.00	t	0	2026-07-02 20:31:38.904694
f0181465-2263-4ff5-bf55-96550b9abbe6	8c8b19ab-f941-4279-bd2d-2f93af957a8e	Pont dentaire	120 min	Pose de pont dentaire	0.00	t	1	2026-07-02 20:31:38.904694
e24f9491-05e4-49fa-a7b3-d86189460545	8c8b19ab-f941-4279-bd2d-2f93af957a8e	Facette	90 min	Pose de facette dentaire	0.00	t	2	2026-07-02 20:31:38.904694
28ccc0ec-96e4-4ed0-9342-fc1655f12d6b	95bc8a8e-c583-46e5-99fe-0c46adb40776	Soins enfant	30 min	Soins dentaires pour enfants	0.00	t	0	2026-07-02 20:31:38.904694
e575fa56-9f0e-4a06-ae1e-5b9399782f5b	95bc8a8e-c583-46e5-99fe-0c46adb40776	Scellement	20 min	Scellement des dents	0.00	t	1	2026-07-02 20:31:38.904694
d59093ca-4b64-4ff7-ae47-56c621a1e12b	95bc8a8e-c583-46e5-99fe-0c46adb40776	Extraction enfant	20 min	Extraction dentaire enfant	0.00	t	2	2026-07-02 20:31:38.904694
\.


--
-- Data for Name: user_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_sessions (id, user_id, token, ip_address, user_agent, expires_at, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, role, staff_id, last_login, is_active, created_at) FROM stdin;
9d05877b-2c09-4de5-ae3e-440c8a22293b	admin	$2b$10$oLVXAM6etXQ.57S7KauzAuW.9zpK0e6KablFHDl8OHsoK81i8GH56	admin	\N	\N	t	2026-07-02 20:31:39.115936
\.


--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: backups backups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.backups
    ADD CONSTRAINT backups_pkey PRIMARY KEY (id);


--
-- Name: clinic_settings clinic_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.clinic_settings
    ADD CONSTRAINT clinic_settings_pkey PRIMARY KEY (key);


--
-- Name: dental_chart_entries dental_chart_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dental_chart_entries
    ADD CONSTRAINT dental_chart_entries_pkey PRIMARY KEY (id);


--
-- Name: dental_chart_notes dental_chart_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dental_chart_notes
    ADD CONSTRAINT dental_chart_notes_pkey PRIMARY KEY (id);


--
-- Name: dental_charts dental_charts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dental_charts
    ADD CONSTRAINT dental_charts_pkey PRIMARY KEY (id);


--
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (id);


--
-- Name: expenses expenses_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_pkey PRIMARY KEY (id);


--
-- Name: inventory_movements inventory_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_pkey PRIMARY KEY (id);


--
-- Name: inventory_products inventory_products_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_products
    ADD CONSTRAINT inventory_products_pkey PRIMARY KEY (id);


--
-- Name: inventory_products inventory_products_sku_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_products
    ADD CONSTRAINT inventory_products_sku_unique UNIQUE (sku);


--
-- Name: inventory_suppliers inventory_suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_suppliers
    ADD CONSTRAINT inventory_suppliers_pkey PRIMARY KEY (id);


--
-- Name: invoice_items invoice_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoice_items
    ADD CONSTRAINT invoice_items_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_invoice_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_invoice_number_unique UNIQUE (invoice_number);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: lab_cases lab_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_cases
    ADD CONSTRAINT lab_cases_pkey PRIMARY KEY (id);


--
-- Name: medical_history medical_history_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_history
    ADD CONSTRAINT medical_history_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: patient_documents patient_documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_documents
    ADD CONSTRAINT patient_documents_pkey PRIMARY KEY (id);


--
-- Name: patient_treatment_progress patient_treatment_progress_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_treatment_progress
    ADD CONSTRAINT patient_treatment_progress_pkey PRIMARY KEY (id);


--
-- Name: patients patients_patient_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_patient_id_unique UNIQUE (patient_id);


--
-- Name: patients patients_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patients
    ADD CONSTRAINT patients_pkey PRIMARY KEY (id);


--
-- Name: payments payments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_items purchase_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_order_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_order_number_unique UNIQUE (order_number);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: quotation_items quotation_items_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT quotation_items_pkey PRIMARY KEY (id);


--
-- Name: quotations quotations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_pkey PRIMARY KEY (id);


--
-- Name: quotations quotations_quote_number_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_quote_number_unique UNIQUE (quote_number);


--
-- Name: signatures signatures_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signatures
    ADD CONSTRAINT signatures_pkey PRIMARY KEY (id);


--
-- Name: staff staff_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.staff
    ADD CONSTRAINT staff_pkey PRIMARY KEY (id);


--
-- Name: status_configs status_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.status_configs
    ADD CONSTRAINT status_configs_pkey PRIMARY KEY (id);


--
-- Name: tasks tasks_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_pkey PRIMARY KEY (id);


--
-- Name: time_slots time_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.time_slots
    ADD CONSTRAINT time_slots_pkey PRIMARY KEY (id);


--
-- Name: treatment_categories treatment_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treatment_categories
    ADD CONSTRAINT treatment_categories_pkey PRIMARY KEY (id);


--
-- Name: treatment_phases treatment_phases_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treatment_phases
    ADD CONSTRAINT treatment_phases_pkey PRIMARY KEY (id);


--
-- Name: treatments treatments_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treatments
    ADD CONSTRAINT treatments_pkey PRIMARY KEY (id);


--
-- Name: user_sessions user_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: audit_logs_created_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_created_idx ON public.audit_logs USING btree (created_at);


--
-- Name: audit_logs_entity_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_entity_idx ON public.audit_logs USING btree (entity_type, entity_id);


--
-- Name: audit_logs_user_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX audit_logs_user_idx ON public.audit_logs USING btree (user_id);


--
-- Name: dental_chart_entries_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX dental_chart_entries_unique ON public.dental_chart_entries USING btree (chart_id, tooth_number, surface);


--
-- Name: dental_charts_patient_unique; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX dental_charts_patient_unique ON public.dental_charts USING btree (patient_id);


--
-- Name: expenses_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX expenses_category_idx ON public.expenses USING btree (category);


--
-- Name: expenses_date_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX expenses_date_idx ON public.expenses USING btree (date);


--
-- Name: inventory_movements_product_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_movements_product_idx ON public.inventory_movements USING btree (product_id);


--
-- Name: inventory_products_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX inventory_products_category_idx ON public.inventory_products USING btree (category);


--
-- Name: medical_history_category_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX medical_history_category_idx ON public.medical_history USING btree (category);


--
-- Name: medical_history_patient_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX medical_history_patient_idx ON public.medical_history USING btree (patient_id);


--
-- Name: patient_documents_patient_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX patient_documents_patient_idx ON public.patient_documents USING btree (patient_id);


--
-- Name: user_sessions_user_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_sessions_user_idx ON public.user_sessions USING btree (user_id);


--
-- Name: appointments appointments_doctor_id_doctors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_doctor_id_doctors_id_fk FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: appointments appointments_patient_id_patients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_patient_id_patients_id_fk FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: dental_chart_entries dental_chart_entries_chart_id_dental_charts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dental_chart_entries
    ADD CONSTRAINT dental_chart_entries_chart_id_dental_charts_id_fk FOREIGN KEY (chart_id) REFERENCES public.dental_charts(id);


--
-- Name: dental_chart_entries dental_chart_entries_doctor_id_doctors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dental_chart_entries
    ADD CONSTRAINT dental_chart_entries_doctor_id_doctors_id_fk FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: dental_chart_notes dental_chart_notes_chart_id_dental_charts_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dental_chart_notes
    ADD CONSTRAINT dental_chart_notes_chart_id_dental_charts_id_fk FOREIGN KEY (chart_id) REFERENCES public.dental_charts(id);


--
-- Name: dental_charts dental_charts_patient_id_patients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dental_charts
    ADD CONSTRAINT dental_charts_patient_id_patients_id_fk FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: doctors doctors_staff_id_staff_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_staff_id_staff_id_fk FOREIGN KEY (staff_id) REFERENCES public.staff(id);


--
-- Name: expenses expenses_supplier_id_inventory_suppliers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.expenses
    ADD CONSTRAINT expenses_supplier_id_inventory_suppliers_id_fk FOREIGN KEY (supplier_id) REFERENCES public.inventory_suppliers(id);


--
-- Name: inventory_movements inventory_movements_product_id_inventory_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_product_id_inventory_products_id_fk FOREIGN KEY (product_id) REFERENCES public.inventory_products(id);


--
-- Name: inventory_products inventory_products_supplier_id_inventory_suppliers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.inventory_products
    ADD CONSTRAINT inventory_products_supplier_id_inventory_suppliers_id_fk FOREIGN KEY (supplier_id) REFERENCES public.inventory_suppliers(id);


--
-- Name: invoices invoices_doctor_id_doctors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_doctor_id_doctors_id_fk FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: invoices invoices_patient_id_patients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_patient_id_patients_id_fk FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: lab_cases lab_cases_doctor_id_doctors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_cases
    ADD CONSTRAINT lab_cases_doctor_id_doctors_id_fk FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: lab_cases lab_cases_patient_id_patients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lab_cases
    ADD CONSTRAINT lab_cases_patient_id_patients_id_fk FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: medical_history medical_history_patient_id_patients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.medical_history
    ADD CONSTRAINT medical_history_patient_id_patients_id_fk FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: notifications notifications_invoice_id_invoices_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_invoice_id_invoices_id_fk FOREIGN KEY (invoice_id) REFERENCES public.invoices(id);


--
-- Name: notifications notifications_patient_id_patients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_patient_id_patients_id_fk FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: patient_documents patient_documents_patient_id_patients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_documents
    ADD CONSTRAINT patient_documents_patient_id_patients_id_fk FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: patient_treatment_progress patient_treatment_progress_patient_id_patients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_treatment_progress
    ADD CONSTRAINT patient_treatment_progress_patient_id_patients_id_fk FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: patient_treatment_progress patient_treatment_progress_phase_id_treatment_phases_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.patient_treatment_progress
    ADD CONSTRAINT patient_treatment_progress_phase_id_treatment_phases_id_fk FOREIGN KEY (phase_id) REFERENCES public.treatment_phases(id);


--
-- Name: payments payments_invoice_id_invoices_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payments
    ADD CONSTRAINT payments_invoice_id_invoices_id_fk FOREIGN KEY (invoice_id) REFERENCES public.invoices(id);


--
-- Name: purchase_order_items purchase_order_items_order_id_purchase_orders_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_order_id_purchase_orders_id_fk FOREIGN KEY (order_id) REFERENCES public.purchase_orders(id);


--
-- Name: purchase_order_items purchase_order_items_product_id_inventory_products_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_product_id_inventory_products_id_fk FOREIGN KEY (product_id) REFERENCES public.inventory_products(id);


--
-- Name: purchase_orders purchase_orders_supplier_id_inventory_suppliers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_supplier_id_inventory_suppliers_id_fk FOREIGN KEY (supplier_id) REFERENCES public.inventory_suppliers(id);


--
-- Name: quotation_items quotation_items_quotation_id_quotations_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT quotation_items_quotation_id_quotations_id_fk FOREIGN KEY (quotation_id) REFERENCES public.quotations(id);


--
-- Name: quotation_items quotation_items_treatment_id_treatments_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotation_items
    ADD CONSTRAINT quotation_items_treatment_id_treatments_id_fk FOREIGN KEY (treatment_id) REFERENCES public.treatments(id);


--
-- Name: quotations quotations_converted_to_invoice_id_invoices_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_converted_to_invoice_id_invoices_id_fk FOREIGN KEY (converted_to_invoice_id) REFERENCES public.invoices(id);


--
-- Name: quotations quotations_doctor_id_doctors_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_doctor_id_doctors_id_fk FOREIGN KEY (doctor_id) REFERENCES public.doctors(id);


--
-- Name: quotations quotations_patient_id_patients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quotations
    ADD CONSTRAINT quotations_patient_id_patients_id_fk FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: signatures signatures_patient_id_patients_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signatures
    ADD CONSTRAINT signatures_patient_id_patients_id_fk FOREIGN KEY (patient_id) REFERENCES public.patients(id);


--
-- Name: signatures signatures_staff_id_staff_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.signatures
    ADD CONSTRAINT signatures_staff_id_staff_id_fk FOREIGN KEY (staff_id) REFERENCES public.staff(id);


--
-- Name: tasks tasks_assignee_id_staff_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tasks
    ADD CONSTRAINT tasks_assignee_id_staff_id_fk FOREIGN KEY (assignee_id) REFERENCES public.staff(id);


--
-- Name: treatments treatments_category_id_treatment_categories_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.treatments
    ADD CONSTRAINT treatments_category_id_treatment_categories_id_fk FOREIGN KEY (category_id) REFERENCES public.treatment_categories(id);


--
-- Name: user_sessions user_sessions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_sessions
    ADD CONSTRAINT user_sessions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: users users_staff_id_staff_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_staff_id_staff_id_fk FOREIGN KEY (staff_id) REFERENCES public.staff(id);


--
-- PostgreSQL database dump complete
--

\unrestrict E8X7AQNPgX7iHkmUCwrxuITdXXoqtqoYFopu2irjglNWvDXTwLrSg23GbIpQE4x

