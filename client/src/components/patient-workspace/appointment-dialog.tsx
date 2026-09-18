import { useState } from "react";
import { useCreateAppointment, useDoctors } from "@/hooks/use-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

interface AppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
}

export function AppointmentDialog({ open, onOpenChange, patientId }: AppointmentDialogProps) {
  const { data: doctorList = [] } = useDoctors();
  const createAppointment = useCreateAppointment();
  const [rdvForm, setRdvForm] = useState({ doctorId: "", appointmentDate: "", type: "Consultation", notes: "" });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Planifier un rendez-vous</DialogTitle></DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1"><Label className="text-xs">Medecin</Label><Select value={rdvForm.doctorId || undefined} onValueChange={(v) => setRdvForm({ ...rdvForm, doctorId: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selectionner" /></SelectTrigger><SelectContent>{doctorList.map((d: any) => <SelectItem key={d.id} value={d.id} className="text-xs">{d.name}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1"><Label className="text-xs">Date et heure</Label><Input type="datetime-local" value={rdvForm.appointmentDate} onChange={(e) => setRdvForm({ ...rdvForm, appointmentDate: e.target.value })} className="h-8 text-xs" /></div>
          <div className="space-y-1"><Label className="text-xs">Type</Label><Select value={rdvForm.type || undefined} onValueChange={(v) => setRdvForm({ ...rdvForm, type: v })}><SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent>{["Consultation", "Controle", "Urgence", "Detartrage", "Autre"].map((t) => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-1"><Label className="text-xs">Notes</Label><Textarea value={rdvForm.notes} onChange={(e) => setRdvForm({ ...rdvForm, notes: e.target.value })} className="min-h-[50px] text-xs resize-none" placeholder="Notes optionnelles..." /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button size="sm" onClick={async () => { if (!rdvForm.doctorId || !rdvForm.appointmentDate) { toast.error("Medecin et date requis"); return; } try { await createAppointment.mutateAsync({ patientId, doctorId: rdvForm.doctorId, appointmentDate: new Date(rdvForm.appointmentDate), type: rdvForm.type, status: "Scheduled", notes: rdvForm.notes || undefined }); toast.success("Rendez-vous planifie"); onOpenChange(false); setRdvForm({ doctorId: "", appointmentDate: "", type: "Consultation", notes: "" }); } catch { toast.error("Erreur"); } }} disabled={createAppointment.isPending}>
            {createAppointment.isPending ? "Enregistrement..." : "Planifier"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}