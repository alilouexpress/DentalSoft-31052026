import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Inactive: "bg-slate-50 text-slate-600 border-slate-200",
  Treatment: "bg-sky-50 text-sky-700 border-sky-200",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Cancelled: "bg-red-50 text-red-700 border-red-200",
  "In Progress": "bg-sky-50 text-sky-700 border-sky-200",
  Scheduled: "bg-sky-50 text-sky-700 border-sky-200",
  Planned: "bg-purple-50 text-purple-700 border-purple-200",
  ActiveTreatment: "bg-sky-50 text-sky-700 border-sky-200",
  Urgent: "bg-red-50 text-red-700 border-red-200",
  Low: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  High: "bg-red-50 text-red-700 border-red-200",
  Draft: "bg-slate-50 text-slate-600 border-slate-200",
  Submitted: "bg-sky-50 text-sky-700 border-sky-200",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Rejected: "bg-red-50 text-red-700 border-red-200",
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Unpaid: "bg-amber-50 text-amber-700 border-amber-200",
  Overdue: "bg-red-50 text-red-700 border-red-200",
  "Partially Paid": "bg-amber-50 text-amber-700 border-amber-200",
  Received: "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Low Stock": "bg-amber-50 text-amber-700 border-amber-200",
  "Out of Stock": "bg-red-50 text-red-700 border-red-200",
  "In Stock": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium", STATUS_STYLES[status] || "bg-slate-50 text-slate-700 border-slate-200", className)}
    >
      {status}
    </Badge>
  );
}
