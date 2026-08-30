import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | "default"
    | "secondary"
    | "outline"
    | "critical"
    | "high"
    | "medium"
    | "low"
    | "info"
    | "ready"
    | "cyan"
    | "purple";
  pulse?: boolean;
}

export function Badge({ className, variant = "default", pulse = false, children, ...props }: BadgeProps) {
  const baseStyles =
    "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold transition-colors";

  const variantStyles: Record<string, string> = {
    default: "bg-zinc-800 text-zinc-200 border border-zinc-700",
    secondary: "bg-zinc-900 text-zinc-400 border border-zinc-800",
    outline: "bg-transparent text-zinc-300 border border-zinc-700",
    critical: "bg-rose-950/40 text-rose-300 border border-rose-500/30",
    high: "bg-rose-950/40 text-rose-300 border border-rose-500/30",
    medium: "bg-amber-950/40 text-amber-300 border border-amber-500/30",
    low: "bg-yellow-950/30 text-yellow-300 border border-yellow-500/20",
    info: "bg-sky-950/40 text-sky-300 border border-sky-500/30",
    ready: "bg-emerald-950/40 text-emerald-300 border border-emerald-500/30",
    cyan: "bg-cyan-950/40 text-cyan-300 border border-cyan-500/30",
    purple: "bg-purple-950/40 text-purple-300 border border-purple-500/30",
  };

  const dotColors: Record<string, string> = {
    critical: "bg-rose-400",
    high: "bg-rose-400",
    medium: "bg-amber-400",
    low: "bg-yellow-400",
    info: "bg-sky-400",
    ready: "bg-emerald-400",
    cyan: "bg-cyan-400",
    purple: "bg-purple-400",
  };

  return (
    <div className={cn(baseStyles, variantStyles[variant], className)} {...props}>
      {pulse && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full animate-pulse",
            dotColors[variant] || "bg-current"
          )}
        />
      )}
      {children}
    </div>
  );
}
