import { db } from "./db";
import {
  treatmentCategories,
  treatments,
  statusConfigs,
  clinicSettings,
  timeSlots,
  users,
  treatmentPhases,
} from "@shared/schema";
import { hashPassword } from "./auth";

async function seed() {
  const existingCats = await db.select().from(treatmentCategories);
  if (existingCats.length > 0) {
    console.log("Reference data already exists. Skipping.");
  } else {
    console.log("Seeding treatment categories...");
  const catRecords = await db.insert(treatmentCategories).values([
    { name: "Soins Généraux", icon: "Stethoscope", color: "bg-emerald-50 text-emerald-600", sortOrder: 0 },
    { name: "Orthodontie", icon: "AlignCenter", color: "bg-blue-50 text-blue-600", sortOrder: 1 },
    { name: "Chirurgie", icon: "Scissors", color: "bg-red-50 text-red-600", sortOrder: 2 },
    { name: "Prothèses", icon: "Brush", color: "bg-amber-50 text-amber-600", sortOrder: 3 },
    { name: "Pédodontie", icon: "Smile", color: "bg-pink-50 text-pink-600", sortOrder: 4 },
  ]).returning();

  console.log("Seeding treatments...");
  await db.insert(treatments).values([
    { categoryId: catRecords[0].id, name: "Détartrage", duration: "30 min", description: "Nettoyage professionnel des dents", sortOrder: 0 },
    { categoryId: catRecords[0].id, name: "Traitement de carie", duration: "45 min", description: "Soins des caries dentaires", sortOrder: 1 },
    { categoryId: catRecords[0].id, name: "Dévitalisation", duration: "60 min", description: "Traitement endodontique", sortOrder: 2 },
    { categoryId: catRecords[0].id, name: "Blanchiment", duration: "60 min", description: "Blanchiment dentaire professionnel", sortOrder: 3 },
    { categoryId: catRecords[1].id, name: "Appareil dentaire", duration: "90 min", description: "Pose d'appareil orthodontique", sortOrder: 0 },
    { categoryId: catRecords[1].id, name: "Gouttière", duration: "45 min", description: "Gouttière orthodontique", sortOrder: 1 },
    { categoryId: catRecords[1].id, name: "Contention", duration: "30 min", description: "Contention post-traitement", sortOrder: 2 },
    { categoryId: catRecords[2].id, name: "Extraction simple", duration: "30 min", description: "Extraction dentaire simple", sortOrder: 0 },
    { categoryId: catRecords[2].id, name: "Extraction complexe", duration: "60 min", description: "Extraction dentaire chirurgicale", sortOrder: 1 },
    { categoryId: catRecords[2].id, name: "Dent de sagesse", duration: "90 min", description: "Extraction des dents de sagesse", sortOrder: 2 },
    { categoryId: catRecords[3].id, name: "Couronne dentaire", duration: "120 min", description: "Pose de couronne dentaire", sortOrder: 0 },
    { categoryId: catRecords[3].id, name: "Pont dentaire", duration: "120 min", description: "Pose de pont dentaire", sortOrder: 1 },
    { categoryId: catRecords[3].id, name: "Facette", duration: "90 min", description: "Pose de facette dentaire", sortOrder: 2 },
    { categoryId: catRecords[4].id, name: "Soins enfant", duration: "30 min", description: "Soins dentaires pour enfants", sortOrder: 0 },
    { categoryId: catRecords[4].id, name: "Scellement", duration: "20 min", description: "Scellement des dents", sortOrder: 1 },
    { categoryId: catRecords[4].id, name: "Extraction enfant", duration: "20 min", description: "Extraction dentaire enfant", sortOrder: 2 },
  ]);

  console.log("Seeding status configs...");
  await db.insert(statusConfigs).values([
    { entityType: "appointment", statusValue: "Scheduled", label: "Planifié", colorClass: "bg-blue-50 text-blue-700 border-blue-200", iconName: "Calendar", sortOrder: 0 },
    { entityType: "appointment", statusValue: "In Progress", label: "En cours", colorClass: "bg-amber-50 text-amber-700 border-amber-200", iconName: "Clock", sortOrder: 1 },
    { entityType: "appointment", statusValue: "Completed", label: "Terminé", colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200", iconName: "CheckCircle", sortOrder: 2 },
    { entityType: "appointment", statusValue: "Cancelled", label: "Annulé", colorClass: "bg-red-50 text-red-700 border-red-200", iconName: "XCircle", sortOrder: 3 },
    { entityType: "patient", statusValue: "Active", label: "Actif", colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200", iconName: "User", sortOrder: 0 },
    { entityType: "patient", statusValue: "Treatment", label: "En traitement", colorClass: "bg-amber-50 text-amber-700 border-amber-200", iconName: "Activity", sortOrder: 1 },
    { entityType: "patient", statusValue: "Inactive", label: "Inactif", colorClass: "bg-gray-50 text-gray-700 border-gray-200", iconName: "UserMinus", sortOrder: 2 },
    { entityType: "invoice", statusValue: "Pending", label: "En attente", colorClass: "bg-amber-50 text-amber-700 border-amber-200", iconName: "Clock", sortOrder: 0 },
    { entityType: "invoice", statusValue: "Paid", label: "Payée", colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200", iconName: "CheckCircle", sortOrder: 1 },
    { entityType: "invoice", statusValue: "Overdue", label: "En retard", colorClass: "bg-red-50 text-red-700 border-red-200", iconName: "AlertCircle", sortOrder: 2 },
    { entityType: "lab", statusValue: "Sent", label: "Envoyé", colorClass: "bg-blue-50 text-blue-700 border-blue-200", iconName: "Send", sortOrder: 0 },
    { entityType: "lab", statusValue: "In Progress", label: "En cours", colorClass: "bg-amber-50 text-amber-700 border-amber-200", iconName: "Clock", sortOrder: 1 },
    { entityType: "lab", statusValue: "Received", label: "Reçu", colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200", iconName: "Package", sortOrder: 2 },
    { entityType: "lab", statusValue: "Delivered", label: "Livré", colorClass: "bg-purple-50 text-purple-700 border-purple-200", iconName: "CheckCheck", sortOrder: 3 },
    { entityType: "task", statusValue: "Pending", label: "À faire", colorClass: "bg-gray-50 text-gray-700 border-gray-200", iconName: "Circle", sortOrder: 0 },
    { entityType: "task", statusValue: "In Progress", label: "En cours", colorClass: "bg-amber-50 text-amber-700 border-amber-200", iconName: "Clock", sortOrder: 1 },
    { entityType: "task", statusValue: "Completed", label: "Terminée", colorClass: "bg-emerald-50 text-emerald-700 border-emerald-200", iconName: "CheckCircle", sortOrder: 2 },
  ]);

  console.log("Seeding default clinic settings...");
  await db.insert(clinicSettings).values([
    { key: "clinicName", value: "Cabinet Dentaire" },
    { key: "clinicHours", value: { mon: "09:00-18:00", tue: "09:00-18:00", wed: "09:00-18:00", thu: "09:00-18:00", fri: "09:00-17:00", sat: "09:00-13:00", sun: null } },
  ]);

  console.log("Seeding default time slots...");
  await db.insert(timeSlots).values([
    { label: "09:00", value: "09:00", sortOrder: 0 },
    { label: "09:30", value: "09:30", sortOrder: 1 },
    { label: "10:00", value: "10:00", sortOrder: 2 },
    { label: "10:30", value: "10:30", sortOrder: 3 },
    { label: "11:00", value: "11:00", sortOrder: 4 },
    { label: "11:30", value: "11:30", sortOrder: 5 },
    { label: "13:00", value: "13:00", sortOrder: 6 },
    { label: "13:30", value: "13:30", sortOrder: 7 },
    { label: "14:00", value: "14:00", sortOrder: 8 },
    { label: "14:30", value: "14:30", sortOrder: 9 },
    { label: "15:00", value: "15:00", sortOrder: 10 },
    { label: "15:30", value: "15:30", sortOrder: 11 },
    { label: "16:00", value: "16:00", sortOrder: 12 },
    { label: "16:30", value: "16:30", sortOrder: 13 },
    { label: "17:00", value: "17:00", sortOrder: 14 },
  ]);
  }

  console.log("Seeding default admin user...");
  const existingUsers = await db.select().from(users);
  if (existingUsers.length === 0) {
    const hashedPwd = await hashPassword("admin123");
    await db.insert(users).values({ username: "admin", password: hashedPwd, role: "admin" });
    console.log("Default admin user created: admin / admin123");
  } else {
    console.log("Users already exist, skipping admin seed.");
  }

  console.log("Seeding treatment phases...");
  const existingPhases = await db.select().from(treatmentPhases);
  if (existingPhases.length === 0) {
    await db.insert(treatmentPhases).values([
      { name: "Diagnostic", sortOrder: 0, colorClass: "bg-blue-100 text-blue-700" },
      { name: "Plan de traitement", sortOrder: 1, colorClass: "bg-indigo-100 text-indigo-700" },
      { name: "En cours", sortOrder: 2, colorClass: "bg-amber-100 text-amber-700" },
      { name: "Terminé", sortOrder: 3, colorClass: "bg-emerald-100 text-emerald-700" },
    ]);
    console.log("Treatment phases created.");
  } else {
    console.log("Treatment phases already exist.");
  }

  console.log("Database seeding completed successfully!");
}

seed()
  .then(() => {
    console.log("Seed script finished");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Error seeding database:", error);
    process.exit(1);
  });
