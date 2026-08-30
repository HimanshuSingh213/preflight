"use client";

import React from "react";
import { ReleaseStatus } from "@/types";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

interface ReleaseDecisionBannerProps {
  releaseStatus: ReleaseStatus;
  overallScore: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  projectName?: string;
}

export function ReleaseDecisionBanner({
  releaseStatus,
  overallScore,
  criticalCount,
  highCount,
  mediumCount,
  lowCount,
  projectName,
}: ReleaseDecisionBannerProps) {
  const isReady = releaseStatus === "READY_TO_SHIP";
  const isReview = releaseStatus === "REVIEW_BEFORE_SHIP";
  const isBlocked = releaseStatus === "BLOCKED";

  const getStatusConfig = () => {
    if (isBlocked) {
      return {
        title: "RELEASE DECISION: BLOCKED",
        badgeText: "BLOCKED",
        badgeClass: "bg-rose-950/40 text-rose-300 border-rose-500/40",
        containerClass: "bg-zinc-900 border-rose-500/40",
        scoreColor: "text-rose-400",
        icon: ShieldAlert,
        description:
          "Critical security leak, SQL injection vector, or broken build compilation detected. Production deployment is strictly blocked.",
      };
    }
    if (isReview) {
      return {
        title: "RELEASE DECISION: REVIEW BEFORE SHIP",
        badgeText: "REVIEW BEFORE SHIP",
        badgeClass: "bg-amber-950/40 text-amber-300 border-amber-500/40",
        containerClass: "bg-zinc-900 border-amber-500/40",
        scoreColor: "text-amber-400",
        icon: AlertTriangle,
        description:
          "High or medium severity warnings, accessibility contrast violations, or unoptimized bundles detected. Review recommended before shipping.",
      };
    }
    return {
      title: "RELEASE DECISION: READY TO SHIP",
      badgeText: "READY TO SHIP",
      badgeClass: "bg-emerald-950/40 text-emerald-300 border-emerald-500/40",
      containerClass: "bg-zinc-900 border-emerald-500/40",
      scoreColor: "text-emerald-400",
      icon: ShieldCheck,
      description:
        "All automated static AST checks, security scanners, build scripts, and runtime tests passed cleanly. Safe for production deployment.",
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <div className={`rounded-2xl border p-6 md:p-8 transition-colors ${config.containerClass}`}>
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Status Info */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold border ${config.badgeClass}`}>
              <span className="w-2 h-2 rounded-full bg-current" />
              {config.badgeText}
            </span>
            {projectName && (
              <span className="text-xs font-mono text-zinc-400">
                Repository: <span className="text-white font-semibold">{projectName}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Icon className={`w-8 h-8 md:w-9 md:h-9 shrink-0 ${config.scoreColor}`} />
            <h2 className="text-2xl md:text-3xl font-heading font-extrabold text-white tracking-tight">
              {config.title}
            </h2>
          </div>

          <p className="text-sm md:text-base text-zinc-300 font-body leading-relaxed">
            {config.description}
          </p>
        </div>

        {/* Right Score & Metrics */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 lg:gap-6 bg-zinc-950 border border-zinc-800 p-5 rounded-xl shrink-0">
          <div className="text-center pr-4 sm:border-r sm:border-zinc-800">
            <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
              Safety Score
            </span>
            <div className={`text-4xl md:text-5xl font-mono font-black ${config.scoreColor}`}>
              {overallScore}
              <span className="text-xs text-zinc-500 font-normal">/100</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-zinc-400">Critical:</span>
              <span className="text-white font-bold">{criticalCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span className="text-zinc-400">High:</span>
              <span className="text-white font-bold">{highCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-zinc-400">Medium:</span>
              <span className="text-white font-bold">{mediumCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-zinc-400" />
              <span className="text-zinc-400">Low:</span>
              <span className="text-white font-bold">{lowCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
