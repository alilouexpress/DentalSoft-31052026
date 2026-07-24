import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ErrorBoundary } from "@/components/error-boundary";
import { LanguageProvider } from "@/i18n/language-context";
import { AuthProvider, useAuth } from "@/auth/auth-context";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Appointments from "@/pages/appointments";
import Patients from "@/pages/patients";
import PatientWorkspacePage from "@/pages/patient-workspace-page";
import Treatments from "@/pages/treatments";
import LabWork from "@/pages/lab-work";
import Billing from "@/pages/billing";
import Debts from "@/pages/debts";
import Reports from "@/pages/reports";
import Tasks from "@/pages/tasks";
import Settings from "@/pages/settings";
import DentalChart from "@/pages/dental-chart";
import Quotations from "@/pages/quotations";
import MedicalHistory from "@/pages/medical-history";
import Inventory from "@/pages/inventory";
import Expenses from "@/pages/expenses";
import AuditLog from "@/pages/audit-log";
import Documents from "@/pages/documents";
import type { ReactNode } from "react";

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;
  if (!isAuthenticated) return <Redirect to="/login" />;
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/"><ProtectedRoute><Dashboard /></ProtectedRoute></Route>
      <Route path="/appointments"><ProtectedRoute><Appointments /></ProtectedRoute></Route>
      <Route path="/patients"><ProtectedRoute><Patients /></ProtectedRoute></Route>
      <Route path="/patients-workspace/:patientId"><ProtectedRoute><PatientWorkspacePage /></ProtectedRoute></Route>
      <Route path="/treatments"><ProtectedRoute><Treatments /></ProtectedRoute></Route>
      <Route path="/lab-work"><ProtectedRoute><LabWork /></ProtectedRoute></Route>
      <Route path="/billing"><ProtectedRoute><Billing /></ProtectedRoute></Route>
      <Route path="/debts"><ProtectedRoute><Debts /></ProtectedRoute></Route>
      <Route path="/reports"><ProtectedRoute><Reports /></ProtectedRoute></Route>
      <Route path="/tasks"><ProtectedRoute><Tasks /></ProtectedRoute></Route>
      <Route path="/settings"><ProtectedRoute><Settings /></ProtectedRoute></Route>
      <Route path="/dental-chart/:patientId"><ProtectedRoute><DentalChart /></ProtectedRoute></Route>
      <Route path="/quotations"><ProtectedRoute><Quotations /></ProtectedRoute></Route>
      <Route path="/medical-history/:patientId"><ProtectedRoute><MedicalHistory /></ProtectedRoute></Route>
      <Route path="/inventory"><ProtectedRoute><Inventory /></ProtectedRoute></Route>
      <Route path="/expenses"><ProtectedRoute><Expenses /></ProtectedRoute></Route>
      <Route path="/audit-log"><ProtectedRoute><AuditLog /></ProtectedRoute></Route>
      <Route path="/documents/:patientId"><ProtectedRoute><Documents /></ProtectedRoute></Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <ErrorBoundary>
              <Router />
              <Toaster richColors position="top-right" closeButton />
            </ErrorBoundary>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </LanguageProvider>
  );
}

export default App;
