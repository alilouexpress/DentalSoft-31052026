import { useEffect, useState } from "react";
import { useUpdatePatientGeneralInfo } from "@/hooks/use-patient-general-info";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { User, MapPin, Stethoscope, FileEdit, ChevronDown, ChevronRight } from "lucide-react";
import type { Patient } from "@shared/schema";

function CollapsibleSection({ title, icon: Icon, defaultOpen = true, children }: { title: string; icon: any; defaultOpen?: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 w-full py-2.5 px-1 cursor-pointer transition-colors hover:bg-muted/50 rounded-md border-0 bg-transparent text-left">
        <Icon className="h-3.5 w-3.5 text-sky-600 shrink-0" />
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex-1">{title}</span>
        {open ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
      </button>
      {open && <div className="pb-3 px-1">{children}</div>}
    </div>
  );
}

interface EditInfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
}

export function EditInfoDialog({ open, onOpenChange, patient }: EditInfoDialogProps) {
  const updateGeneralInfo = useUpdatePatientGeneralInfo();
  const [editForm, setEditForm] = useState({ phone: "", email: "", address: "", bloodType: "", nationalId: "", emergencyContact: "", emergencyPhone: "", insuranceProvider: "", insuranceNumber: "", notes: "" });

  useEffect(() => {
    if (open) {
      setEditForm({
        phone: patient.phone || "",
        email: patient.email || "",
        address: patient.address || "",
        bloodType: patient.bloodType || "",
        nationalId: patient.nationalId || "",
        emergencyContact: patient.emergencyContact || "",
        emergencyPhone: patient.emergencyPhone || "",
        insuranceProvider: patient.insuranceProvider || "",
        insuranceNumber: patient.insuranceNumber || "",
        notes: patient.notes || "",
      });
    }
  }, [open, patient]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Modifier les informations</DialogTitle></DialogHeader>
        <div className="space-y-4 py-2">
          <CollapsibleSection title="Identite" icon={User} defaultOpen={true}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-[10px] font-semibold">Groupe sanguin</Label><Select value={editForm.bloodType || undefined} onValueChange={(v) => setEditForm({ ...editForm, bloodType: v })}><SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selectionner" /></SelectTrigger><SelectContent>{["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => <SelectItem key={b} value={b} className="text-xs">{b}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1"><Label className="text-[10px] font-semibold">National ID</Label><Input value={editForm.nationalId} onChange={(e) => setEditForm({ ...editForm, nationalId: e.target.value })} className="h-8 text-xs" /></div>
            </div>
          </CollapsibleSection>
          <CollapsibleSection title="Contact" icon={MapPin} defaultOpen={true}>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-[10px] font-semibold">Telephone</Label><Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="h-8 text-xs" /></div>
                <div className="space-y-1"><Label className="text-[10px] font-semibold">Email</Label><Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="h-8 text-xs" /></div>
              </div>
              <div className="space-y-1"><Label className="text-[10px] font-semibold">Adresse</Label><Input value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className="h-8 text-xs" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-[10px] font-semibold">Contact urgence</Label><Input value={editForm.emergencyContact} onChange={(e) => setEditForm({ ...editForm, emergencyContact: e.target.value })} className="h-8 text-xs" /></div>
                <div className="space-y-1"><Label className="text-[10px] font-semibold">Tel. urgence</Label><Input value={editForm.emergencyPhone} onChange={(e) => setEditForm({ ...editForm, emergencyPhone: e.target.value })} className="h-8 text-xs" /></div>
              </div>
            </div>
          </CollapsibleSection>
          <CollapsibleSection title="Assurance" icon={Stethoscope} defaultOpen={false}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label className="text-[10px] font-semibold">Assurance</Label><Input value={editForm.insuranceProvider} onChange={(e) => setEditForm({ ...editForm, insuranceProvider: e.target.value })} className="h-8 text-xs" /></div>
              <div className="space-y-1"><Label className="text-[10px] font-semibold">N assurance</Label><Input value={editForm.insuranceNumber} onChange={(e) => setEditForm({ ...editForm, insuranceNumber: e.target.value })} className="h-8 text-xs" /></div>
            </div>
          </CollapsibleSection>
          <CollapsibleSection title="Notes" icon={FileEdit} defaultOpen={false}>
            <Textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} className="min-h-[60px] text-xs resize-none" />
          </CollapsibleSection>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button size="sm" onClick={async () => { try { await updateGeneralInfo.mutateAsync({ id: patient.id, data: editForm as any }); toast.success("Informations mises a jour"); onOpenChange(false); } catch { toast.error("Erreur"); } }} disabled={updateGeneralInfo.isPending}>
            {updateGeneralInfo.isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}