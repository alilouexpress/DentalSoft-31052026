import { useState } from "react";
import { useLanguage } from "@/i18n/language-context";
import { usePrescriptions, useCreatePrescription, useAddPrescriptionItem, useDeletePrescription, useDoctors } from "@/hooks/use-api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { Plus, Trash2, Copy, Printer, Pill, ChevronDown, ChevronUp, Search } from "lucide-react";

const COMMON_MEDICATIONS = [
  "Amoxicilline", "Amoxicilline + Acide clavulanique", "Azithromicine", "Ciprofloxacine",
  "Metronidazole", "Clindamycine", "Cefalexine", "Erythromycine",
  "Ibuprofene", "Paracetamol", "Ketoprofene", "Diclofenaque", "Naproxene",
  "Lidocaine", "Articaine", "Augmentin", "Flagyl", "Klacid",
  "Chlorhexidine 0.12%", "Bain de bouche antiseptique",
  "Vitamine C", "Vitamine D", "Calcium",
];

const FREQUENCIES = [
  "1 fois/jour", "2 fois/jour", "3 fois/jour",
  "4 fois/jour", "Toutes les 6h", "Toutes les 8h",
  "Toutes les 12h", "Au besoin", "Avant le coucher",
];

const DURATIONS = [
  "3 jours", "5 jours", "7 jours", "10 jours",
  "14 jours", "21 jours", "30 jours",
  "2 semaines", "1 mois", "2 mois", "3 mois", "Continu",
];

interface PatientPrescriptionsProps {
  patientId: string;
  patientName: string;
}

export function PatientPrescriptions({ patientId, patientName }: PatientPrescriptionsProps) {
  const { t } = useLanguage();
  const { data: prescriptions = [], isLoading } = usePrescriptions(patientId);
  const { data: doctors = [] } = useDoctors();
  const createPrescription = useCreatePrescription();
  const addItem = useAddPrescriptionItem();
  const deletePrescription = useDeletePrescription();

  const [newOpen, setNewOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [newForm, setNewForm] = useState({ doctorId: "", diagnosis: "", notes: "" });
  const [items, setItems] = useState<{ medicationName: string; dosage: string; frequency: string; duration: string; instructions: string; quantity: number }[]>([]);
  const [medSearch, setMedSearch] = useState("");

  const [addItemOpen, setAddItemOpen] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({ medicationName: "", dosage: "", frequency: "3 fois/jour", duration: "7 jours", instructions: "", quantity: 1 });

  const handleCreate = async () => {
    if (items.length === 0) { toast.error("Ajoutez au moins un medicament"); return; }
    try {
      const rx = await createPrescription.mutateAsync({
        patientId,
        doctorId: newForm.doctorId || undefined,
        diagnosis: newForm.diagnosis || undefined,
        notes: newForm.notes || undefined,
        status: "active",
      });
      for (const item of items) {
        await addItem.mutateAsync({
          prescriptionId: rx.id,
          data: { prescriptionId: rx.id, medicationName: item.medicationName, dosage: item.dosage || undefined, frequency: item.frequency || undefined, duration: item.duration || undefined, instructions: item.instructions || undefined, quantity: item.quantity },
        });
      }
      toast.success("Ordonnance creee");
      setNewOpen(false);
      resetNewForm();
    } catch { toast.error("Erreur lors de la creation"); }
  };

  const handleAddItemToExisting = async (prescriptionId: string) => {
    if (!newItem.medicationName) { toast.error("Nom du medicament requis"); return; }
    try {
      await addItem.mutateAsync({ prescriptionId, data: { ...newItem, prescriptionId } });
      toast.success("Medicament ajoute");
      setAddItemOpen(null);
      setNewItem({ medicationName: "", dosage: "", frequency: "3 fois/jour", duration: "7 jours", instructions: "", quantity: 1 });
    } catch { toast.error("Erreur"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette ordonnance ?")) return;
    try { await deletePrescription.mutateAsync(id); toast.success("Ordonnance supprimee"); } catch { toast.error("Erreur"); }
  };

  const handleDuplicate = (rx: any) => {
    const rxItems: any[] = (rx as any).items || [];
    setNewForm({ doctorId: rx.doctorId || "", diagnosis: rx.diagnosis || "", notes: "" });
    setItems(rxItems.map((i: any) => ({ medicationName: i.medicationName, dosage: i.dosage || "", frequency: i.frequency || "", duration: i.duration || "", instructions: i.instructions || "", quantity: i.quantity || 1 })));
    setNewOpen(true);
  };

  const resetNewForm = () => { setNewForm({ doctorId: "", diagnosis: "", notes: "" }); setItems([]); setMedSearch(""); };
  const addItemToForm = (med: string) => { setItems([...items, { medicationName: med, dosage: "", frequency: "3 fois/jour", duration: "7 jours", instructions: "", quantity: 1 }]); setMedSearch(""); };
  const removeItemFromForm = (idx: number) => { setItems(items.filter((_, i) => i !== idx)); };
  const filteredMeds = COMMON_MEDICATIONS.filter(m => m.toLowerCase().includes(medSearch.toLowerCase()));

  const printRx = (rx: any) => {
    const itemsHtml = ((rx as any).items || []).map((i: any, idx: number) => `<tr><td style="padding:6px;border-bottom:1px solid #ddd">${idx + 1}</td><td style="padding:6px;border-bottom:1px solid #ddd;font-weight:600">${i.medicationName}</td><td style="padding:6px;border-bottom:1px solid #ddd">${i.dosage || "-"}</td><td style="padding:6px;border-bottom:1px solid #ddd">${i.frequency || "-"}</td><td style="padding:6px;border-bottom:1px solid #ddd">${i.duration || "-"}</td><td style="padding:6px;border-bottom:1px solid #ddd">${i.instructions || "-"}</td></tr>`).join("");
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Ordonnance</title></head><body style="font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto"><div style="text-align:center;border-bottom:2px solid #0d9488;padding-bottom:15px;margin-bottom:20px"><h1 style="margin:0;color:#0d9488;font-size:24px">ORDONNANCE MEDICALE</h1><p style="margin:5px 0;color:#666">Cabinet Dentaire</p></div><div style="margin-bottom:15px"><strong>Patient:</strong> ${patientName}<br><strong>Date:</strong> ${format(new Date(rx.issuedAt), "dd/MM/yyyy")}</div>${rx.diagnosis ? `<div style="margin-bottom:15px"><strong>Diagnostic:</strong> ${rx.diagnosis}</div>` : ""}<table style="width:100%;border-collapse:collapse;margin:15px 0"><thead><tr style="background:#f0f0f0"><th style="padding:8px;text-align:left">#</th><th style="padding:8px;text-align:left">Medicament</th><th style="padding:8px;text-align:left">Dosage</th><th style="padding:8px;text-align:left">Frequence</th><th style="padding:8px;text-align:left">Duree</th><th style="padding:8px;text-align:left">Instructions</th></tr></thead><tbody>${itemsHtml}</tbody></table>${rx.notes ? `<div style="margin-top:15px"><strong>Notes:</strong> ${rx.notes}</div>` : ""}<div style="margin-top:40px;text-align:right">Dr. ${rx.doctorName || "________"}</div></body></html>`);
    w.document.close();
    w.print();
  };

  if (isLoading) return <div className="flex items-center justify-center py-12"><div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Pill className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold">Ordonnances</h3>
          <Badge variant="secondary" className="text-[10px]">{prescriptions.length}</Badge>
        </div>
        <Button size="sm" className="h-7 gap-1 text-xs" onClick={() => { resetNewForm(); setNewOpen(true); }}>
          <Plus className="h-3 w-3" /> Nouvelle ordonnance
        </Button>
      </div>

      {prescriptions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Pill className="h-10 w-10 mb-2 text-muted-foreground/30" />
          <p className="text-sm">Aucune ordonnance</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Creez une ordonnance pour ce patient</p>
        </div>
      ) : (
        <div className="space-y-2">
          {prescriptions.map((rx) => {
            const isExpanded = expandedId === rx.id;
            return (
              <Card key={rx.id} className="border-border/40">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">{rx.diagnosis || "Ordonnance"}</span>
                        <Badge variant={rx.status === "active" ? "default" : "secondary"} className="text-[10px]">{rx.status === "active" ? "Active" : rx.status}</Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                        <span>{format(new Date(rx.issuedAt), "dd/MM/yyyy")}</span>
                        {rx.doctorName && <span>Dr. {rx.doctorName}</span>}
                        {(rx as any).items && <span>{(rx as any).items.length} medicament(s)</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setExpandedId(isExpanded ? null : rx.id)}>
                        {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setAddItemOpen(rx.id)}>
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleDuplicate(rx)}>
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => printRx(rx)}>
                        <Printer className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-rose-500" onClick={() => handleDelete(rx.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  {isExpanded && (rx as any).items && (rx as any).items.length > 0 && (
                    <div className="mt-3 border-t pt-3">
                      <div className="space-y-1.5">
                        {(rx as any).items.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-3 text-xs p-2 bg-muted/30 rounded">
                            <span className="font-semibold min-w-[140px]">{item.medicationName}</span>
                            {item.dosage && <span className="text-muted-foreground">{item.dosage}</span>}
                            {item.frequency && <span className="text-muted-foreground">{item.frequency}</span>}
                            {item.duration && <span className="text-muted-foreground">{item.duration}</span>}
                            {item.instructions && <span className="text-muted-foreground/60 italic truncate">{item.instructions}</span>}
                          </div>
                        ))}
                      </div>
                      {rx.notes && <p className="text-xs text-muted-foreground mt-2 italic">{rx.notes}</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* New Prescription Dialog */}
      <Dialog open={newOpen} onOpenChange={(v) => { setNewOpen(v); if (!v) resetNewForm(); }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nouvelle ordonnance</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Medecin</Label>
              <Select value={newForm.doctorId} onValueChange={(v) => setNewForm({ ...newForm, doctorId: v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Selectionner" /></SelectTrigger>
                <SelectContent>
                  {doctors.map((d: any) => <SelectItem key={d.id} value={d.id} className="text-xs">{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Diagnostic</Label>
              <Input value={newForm.diagnosis} onChange={(e) => setNewForm({ ...newForm, diagnosis: e.target.value })} className="h-8 text-xs" placeholder="Ex: Infection dentaire, carie..." />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Ajouter un medicament</Label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input value={medSearch} onChange={(e) => setMedSearch(e.target.value)} className="h-8 text-xs pl-7" placeholder="Rechercher..." />
              </div>
              {medSearch && (
                <div className="border rounded-lg max-h-32 overflow-y-auto">
                  {filteredMeds.length === 0 ? (
                    <button className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted cursor-pointer transition-colors duration-200" onClick={() => addItemToForm(medSearch)}>{medSearch} (personnalise)</button>
                  ) : filteredMeds.map((m) => (
                    <button key={m} className="w-full text-left px-3 py-1.5 text-xs hover:bg-muted cursor-pointer transition-colors duration-200" onClick={() => addItemToForm(m)}>{m}</button>
                  ))}
                </div>
              )}
            </div>
            {items.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs">Medicaments ({items.length})</Label>
                {items.map((item, idx) => (
                  <div key={idx} className="border rounded-lg p-2 space-y-2 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{item.medicationName}</span>
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => removeItemFromForm(idx)} aria-label="Retirer l'article"><Trash2 className="h-3 w-3 text-rose-500" /></Button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input value={item.dosage} onChange={(e) => { const n = [...items]; n[idx].dosage = e.target.value; setItems(n); }} className="h-7 text-xs" placeholder="Dosage (ex: 500mg)" />
                      <Select value={item.frequency} onValueChange={(v) => { const n = [...items]; n[idx].frequency = v; setItems(n); }}>
                        <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Frequence" /></SelectTrigger>
                        <SelectContent>{FREQUENCIES.map((f) => <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>)}</SelectContent>
                      </Select>
                      <Select value={item.duration} onValueChange={(v) => { const n = [...items]; n[idx].duration = v; setItems(n); }}>
                        <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="Duree" /></SelectTrigger>
                        <SelectContent>{DURATIONS.map((d) => <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>)}</SelectContent>
                      </Select>
                      <Input type="number" value={item.quantity} onChange={(e) => { const n = [...items]; n[idx].quantity = parseInt(e.target.value) || 1; setItems(n); }} className="h-7 text-xs" placeholder="Qte" min={1} />
                    </div>
                    <Input value={item.instructions} onChange={(e) => { const n = [...items]; n[idx].instructions = e.target.value; setItems(n); }} className="h-7 text-xs" placeholder="Instructions (ex: apres le repas)" />
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-1">
              <Label className="text-xs">Notes</Label>
              <Textarea value={newForm.notes} onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })} className="min-h-[50px] text-xs resize-none" placeholder="Notes complementaires..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => { setNewOpen(false); resetNewForm(); }}>Annuler</Button>
            <Button size="sm" onClick={handleCreate} disabled={createPrescription.isPending || addItem.isPending}>
              {createPrescription.isPending ? "Creation..." : "Creer l'ordonnance"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Item to Existing Dialog */}
      <Dialog open={!!addItemOpen} onOpenChange={(v) => { if (!v) setAddItemOpen(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Ajouter un medicament</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs">Medicament</Label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input value={newItem.medicationName} onChange={(e) => setNewItem({ ...newItem, medicationName: e.target.value })} className="h-8 text-xs pl-7" placeholder="Nom du medicament" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1"><Label className="text-[10px]">Dosage</Label><Input value={newItem.dosage} onChange={(e) => setNewItem({ ...newItem, dosage: e.target.value })} className="h-7 text-xs" placeholder="500mg" /></div>
              <div className="space-y-1"><Label className="text-[10px]">Frequence</Label><Select value={newItem.frequency} onValueChange={(v) => setNewItem({ ...newItem, frequency: v })}><SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger><SelectContent>{FREQUENCIES.map((f) => <SelectItem key={f} value={f} className="text-xs">{f}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1"><Label className="text-[10px]">Duree</Label><Select value={newItem.duration} onValueChange={(v) => setNewItem({ ...newItem, duration: v })}><SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger><SelectContent>{DURATIONS.map((d) => <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1"><Label className="text-[10px]">Quantite</Label><Input type="number" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })} className="h-7 text-xs" min={1} /></div>
            </div>
            <div className="space-y-1"><Label className="text-[10px]">Instructions</Label><Input value={newItem.instructions} onChange={(e) => setNewItem({ ...newItem, instructions: e.target.value })} className="h-7 text-xs" placeholder="Apres le repas..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAddItemOpen(null)}>Annuler</Button>
            <Button size="sm" onClick={() => addItemOpen && handleAddItemToExisting(addItemOpen)} disabled={addItem.isPending}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
