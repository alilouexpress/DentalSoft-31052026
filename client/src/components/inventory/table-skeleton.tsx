import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeletonRows({ rows, classes }: { rows: number; classes: string[] }) {
  return (
    <div className="flex flex-col gap-4 px-4">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          {classes.map((c, j) => <Skeleton key={j} className={c} />)}
        </div>
      ))}
    </div>
  );
}
