import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { FDI_TEETH } from "./constants";

interface TreatmentToothFilterProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function TreatmentToothFilter({ value, onValueChange }: TreatmentToothFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-muted-foreground shrink-0">Filtrer par dent:</label>
      <Select value={value || "__all__"} onValueChange={(v) => onValueChange(v === "__all__" ? "" : v)}>
        <SelectTrigger className="h-8 w-[140px] text-xs">
          <SelectValue placeholder="Toutes les dents" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__" className="text-xs">Toutes les dents</SelectItem>
          {FDI_TEETH.map((t) => (
            <SelectItem key={t} value={String(t)} className="text-xs">Dent {t}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value && (
        <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={() => onValueChange("")}>
          <X className="h-3 w-3 mr-1" /> Effacer
        </Button>
      )}
    </div>
  );
}