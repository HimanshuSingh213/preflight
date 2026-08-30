"use client";

import React from "react";
import { CheckCategory, CheckStatus, CategoryResult } from "@/types";
import { Badge } from "@/components/ui/badge";
import {
  Code2,
  ShieldCheck,
  Cpu,
  MonitorCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  Clock,
} from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface AuditProgressCardProps {
  category: CheckCategory;
  name: string;
  status: CheckStatus;
  result?: CategoryResult;
  isCurrent?: boolean;
}

const CATEGORY_ICONS: Record<CheckCategory, React.ComponentType<{ className?: string }>> = {
  "code-health": Code2,
  security: ShieldCheck,
  "build-test": Cpu,
  "runtime-ui": MonitorCheck,
  performance: Zap,
};

export function AuditProgressCard({
  category,
  name,
  status,
  result,
  isCurrent = false,
}: AuditProgressCardProps) {
  const Icon = CATEGORY_ICONS[category] || Code2;
  const findingsCount = result?.findings?.length || 0;
  const hasBlockers = result?.findings?.some((f) => f.isBlocker || f.severity === "critical");

  const getStatusBadge = () => {
    switch (status) {
      case "running":
        return (
          <Badge variant="cyan" pulse>
            <Loader2 className="w-3 h-3 animate-spin mr-1" />
            RUNNING
          </Badge>
        );
      case "completed":
        if (findingsCount > 0) {
          return (
            <Badge variant="medium">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {findingsCount} WARNING{findingsCount > 1 ? "S" : ""}
            </Badge>
          );
        }
        return (
          <Badge variant="ready">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            PASSED (100%)
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="critical" pulse>
            <XCircle className="w-3 h-3 mr-1" />
            {hasBlockers ? "BLOCKED" : "FAILED"}
          </Badge>
        );
      case "skipped":
        return <Badge variant="secondary">SKIPPED</Badge>;
      default:
        return <Badge variant="secondary">WAITING</Badge>;
    }
  };

  return (
    <div
      className={`rounded-xl border p-5 transition-all ${
        isCurrent
          ? "bg-zinc-900 border-cyan-500 scale-[1.01]"
          : status === "completed"
          ? "bg-zinc-900 border-zinc-800"
          : status === "failed"
          ? "bg-zinc-900 border-rose-500/40"
          : "bg-zinc-900/60 border-zinc-800/80 opacity-70"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Category Header */}
        <div className="flex items-center gap-3.5">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center border transition-all ${
              status === "running"
                ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/40"
                : status === "completed"
                ? findingsCount > 0
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : status === "failed"
                ? "bg-rose-500/15 text-rose-400 border-rose-500/40"
                : "bg-zinc-800 text-zinc-400 border-zinc-700"
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>

          <div>
            <h4 className="font-heading font-bold text-white text-sm md:text-base">
              {name}
            </h4>
            <p className="text-xs text-zinc-400 font-body">
              {result?.summary || "Pending execution queue..."}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-3">
          {result && result.durationMs > 0 && (
            <span className="hidden sm:inline-flex items-center gap-1 text-xs font-mono text-zinc-500">
              <Clock className="w-3 h-3" />
              {formatDuration(result.durationMs)}
            </span>
          )}
          {getStatusBadge()}
        </div>
      </div>

      {/* Mini Active Progress Line if Running */}
      {status === "running" && (
        <div className="mt-4 pt-3 border-t border-zinc-800">
          <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400 rounded-full animate-pulse w-3/4" />
          </div>
        </div>
      )}
    </div>
  );
}
