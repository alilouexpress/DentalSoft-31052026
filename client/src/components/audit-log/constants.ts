export const actionStyles: Record<string, string> = {
  create: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400",
  update: "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-400",
  delete: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400",
  login: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-800",
  logout: "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950/30 dark:text-gray-400 dark:border-gray-800",
  backup: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400",
};

export const actionLabels: Record<string, string> = {
  create: "Création",
  update: "Modification",
  delete: "Suppression",
  login: "Connexion",
  logout: "Déconnexion",
  backup: "Sauvegarde",
};

export const actionLabelsEn: Record<string, string> = {
  create: "Create",
  update: "Update",
  delete: "Delete",
  login: "Login",
  logout: "Logout",
  backup: "Backup",
};

export const entityLabels: Record<string, string> = {
  patient: "Patient",
  appointment: "Rendez-vous",
  invoice: "Facture",
  payment: "Paiement",
  treatment: "Traitement",
  prescription: "Ordonnance",
  lab_case: "Laboratoire",
  task: "Tâche",
  user: "Utilisateur",
  setting: "Paramètre",
  backup: "Sauvegarde",
  document: "Document",
};

export const entityLabelsEn: Record<string, string> = {
  patient: "Patient",
  appointment: "Appointment",
  invoice: "Invoice",
  payment: "Payment",
  treatment: "Treatment",
  prescription: "Prescription",
  lab_case: "Lab Case",
  task: "Task",
  user: "User",
  setting: "Setting",
  backup: "Backup",
  document: "Document",
};

export const entityTypes = [
  "patient", "appointment", "invoice", "payment",
  "treatment", "prescription", "lab_case", "task",
  "user", "setting", "backup", "document",
];

export const actionTypes = ["create", "update", "delete", "login", "logout", "backup"];

export const AUDIT_LOG_LIMIT = 50;

export function getActionLabel(action: string, isFr: boolean): string {
  return (isFr ? actionLabels : actionLabelsEn)[action] || action;
}

export function getEntityLabel(type: string, isFr: boolean): string {
  return (isFr ? entityLabels : entityLabelsEn)[type] || type;
}

export function formatJSON(value: unknown): string {
  if (value === null || value === undefined) return "—";
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

export function formatCellDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}