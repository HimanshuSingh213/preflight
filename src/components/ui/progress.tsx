import * as React from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number; // 0 to 100
  indicatorColor?: "cyan" | "emerald" | "amber" | "rose";
}

export function Progress({
  className,
  value = 0,
  indicatorColor = "cyan",
  ...props
}: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  const colorStyles: Record<string, string> = {
    cyan: "bg-cyan-500",
    emerald: "bg-emerald-500",
    amber: "bg-amber-500",
    rose: "bg-rose-500",
  };

  return (
    <div
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-zinc-950 border border-zinc-800",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full rounded-full transition-all duration-300 ease-out",
          colorStyles[indicatorColor] || "bg-cyan-500"
        )}
        style={{ width: `${clampedValue}%` }}
      />
    </div>
  );
}
