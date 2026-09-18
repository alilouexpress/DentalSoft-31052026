import { Badge } from "@/components/ui/badge";
import { TREATMENT_STATUSES, PRIORITIES } from "./constants";

export function TreatmentStatusBadge({ status }: { status: string }) {
  const s = TREATMENT_STATUSES.find((s) => s.value === status);
  return s ? (
    <Badge variant="outline" className={`${s.color} text-[10px] px-2 py-0`}>{s.label}</Badge>
  ) : (
    <Badge variant="outline" className="text-[10px]">{status}</Badge>
  );
}

export function TreatmentPriorityBadge({ priority }: { priority: string }) {
  const p = PRIORITIES.find((p) => p.value === priority);
  return p ? (
    <Badge variant="outline" className={`${p.color} text-[10px] px-2 py-0 gap-0.5`}>
      {p.icon && <p.icon className="h-2.5 w-2.5" />}
      {p.label}
    </Badge>
  ) : null;
}