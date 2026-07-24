import * as React from "react";
import { cn } from "@/lib/utils";

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glow" | "glass";
}

const variantStyles: Record<string, string> = {
  default: "",
  glow: "relative overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200",
  glass: "bg-white/80 backdrop-blur-xl border-white/20 shadow-xl",
};

function PremiumCard({ className, variant = "default", ...props }: PremiumCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

function PremiumCardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-6 pb-4 border-b border-slate-100", className)} {...props} />;
}

function PremiumCardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-6 pt-4", className)} {...props} />;
}

export { PremiumCard, PremiumCardHeader, PremiumCardContent };
