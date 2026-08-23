import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  Inactive: "bg-slate-50 text-slate-600 border-slate-200/60",
  Treatment: "bg-blue-50 text-blue-700 border-blue-200/60",
  Completed: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  Pending: "bg-amber-50 text-amber-700 border-amber-200/60",
  Cancelled: "bg-red-50 text-red-700 border-red-200/60",
  "In Progress": "bg-indigo-50 text-indigo-700 border-indigo-200/60",
  Scheduled: "bg-sky-50 text-sky-700 border-sky-200/60",
  Planned: "bg-violet-50 text-violet-700 border-violet-200/60",
  ActiveTreatment: "bg-blue-50 text-blue-700 border-blue-200/60",
  Urgent: "bg-red-50 text-red-700 border-red-200/60",
  Low: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  Medium: "bg-amber-50 text-amber-700 border-amber-200/60",
  High: "bg-red-50 text-red-700 border-red-200/60",
  Draft: "bg-slate-50 text-slate-600 border-slate-200/60",
  Submitted: "bg-teal-50 text-teal-700 border-teal-200/60",
  Approved: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  Rejected: "bg-red-50 text-red-700 border-red-200/60",
  Paid: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  Unpaid: "bg-amber-50 text-amber-700 border-amber-200/60",
  Overdue: "bg-red-50 text-red-700 border-red-200/60",
  "Partially Paid": "bg-amber-50 text-amber-700 border-amber-200/60",
  Received: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
  "Low Stock": "bg-amber-50 text-amber-700 border-amber-200/60",
  "Out of Stock": "bg-red-50 text-red-700 border-red-200/60",
  "In Stock": "bg-emerald-50 text-emerald-700 border-emerald-200/60",
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("text-xs font-medium border px-2.5 py-0.5", STATUS_STYLES[status] || "bg-slate-50 text-slate-700 border-slate-200/60", className)}
    >
      {status}
    </Badge>
  );
}
