"use client";

import React, { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuditStore } from "@/store/audit-store";
import { CheckCategory } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Code2,
  ShieldCheck,
  Cpu,
  MonitorCheck,
  Zap,
  Play,
  CheckSquare,
  Square,
  Clock,
  Flame,
} from "lucide-react";

interface CategoryDefinition {
  id: CheckCategory;
  name: string;
  shortDesc: string;
  fullDesc: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  subchecks: string[];
  estimatedDuration: string;
  isRecommended: boolean;
}

const CATEGORY_DEFINITIONS: CategoryDefinition[] = [
  {
    id: "code-health",
    name: "Code Health & Architecture",
    shortDesc: "ts-morph AST analysis, dead code detection & complexity",
    fullDesc: "Traverses TypeScript AST to detect unused exports, functions exceeding complexity limits, circular imports, and duplicate code blocks.",
    icon: Code2,
    accentColor: "text-emerald-400 bg-emerald-950/40 border-emerald-500/20",
    subchecks: ["ts-morph AST", "Dead Code / Exports", "Oversized Functions", "Complexity & Duplication"],
    estimatedDuration: "1.2s",
    isRecommended: true,
  },
  {
    id: "security",
    name: "Security & Secret Scanning",
    shortDesc: "Gitleaks patterns, live API secrets & vulnerable dependencies",
    fullDesc: "Scans repository source code for high-entropy tokens (Stripe, AWS, OpenAI, GitHub), private certificates, raw SQL injection vectors, and known CVEs.",
    icon: ShieldCheck,
    accentColor: "text-rose-400 bg-rose-950/40 border-rose-500/20",
    subchecks: ["Secret Scanner", "Live API Keys (Stripe/AWS)", "SQL Injection Patterns", "npm audit / CVEs"],
    estimatedDuration: "1.8s",
    isRecommended: true,
  },
  {
    id: "build-test",
    name: "Build, Lint & Test Verification",
    shortDesc: "Isolated non-interactive compiler & test runner",
    fullDesc: "Spawns strict tsc typechecking, runs configured test suites with zero-color CI flags, and captures compiler errors and failing unit assertions.",
    icon: Cpu,
    accentColor: "text-cyan-400 bg-cyan-950/40 border-cyan-500/20",
    subchecks: ["tsc --noEmit", "ESLint Diagnostics", "Unit Test Runner", "Build Compilation"],
    estimatedDuration: "3.4s",
    isRecommended: true,
  },
  {
    id: "runtime-ui",
    name: "Runtime, UI & Accessibility",
    shortDesc: "Playwright headless browser crawl & Axe-core WCAG audit",
    fullDesc: "Spins up local ephemeral dev server, executes Playwright headless browser navigation, intercepts runtime JS console errors/404s, and runs automated a11y checks.",
    icon: MonitorCheck,
    accentColor: "text-amber-400 bg-amber-950/40 border-amber-500/20",
    subchecks: ["Playwright Crawl", "Console & Network Errors", "Axe-core WCAG AA", "Route Verification"],
    estimatedDuration: "4.5s",
    isRecommended: false,
  },
  {
    id: "performance",
    name: "Performance & Asset Auditing",
    shortDesc: "TTFB, DOM load latency & heavy bundle assets",
    fullDesc: "Evaluates Navigation Timing APIs, assesses Time to First Byte, flags static images/bundles >1MB, and analyzes Core Web Vital indicators.",
    icon: Zap,
    accentColor: "text-purple-400 bg-purple-950/40 border-purple-500/20",
    subchecks: ["TTFB Timing", "DOM Content Loaded", "Heavy Assets (>1MB)", "Bundle Tree Analysis"],
    estimatedDuration: "2.1s",
    isRecommended: false,
  },
];

export function AuditSelector() {
  const router = useRouter();

  // Atomic Zustand Selectors
  const selectedChecks = useAuditStore((s) => s.selectedChecks);
  const toggleCheckCategory = useAuditStore((s) => s.toggleCheckCategory);
  const selectAllChecks = useAuditStore((s) => s.selectAllChecks);
  const clearAllChecks = useAuditStore((s) => s.clearAllChecks);
  const snapshot = useAuditStore((s) => s.snapshot);

  const handleStart = useCallback(() => {
    if (selectedChecks.length === 0) return;
    router.push("/audit");
  }, [selectedChecks.length, router]);

  const allSelected = selectedChecks.length === CATEGORY_DEFINITIONS.length;

  const sanitizedProjectName = useMemo(() => {
    const raw = snapshot?.name || "Project Workspace";
    if (raw.startsWith("pf_") || raw.includes("pf_folder")) {
      return "Project Workspace";
    }
    return raw;
  }, [snapshot?.name]);

  return (
    <div className="space-y-6">
      {/* Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 border border-zinc-800/40 p-5 rounded-2xl">
        <div className="space-y-1">
          <h3 className="font-heading font-extrabold text-white text-lg flex items-center gap-2 tracking-tight">
            <span>Select Audit Checks</span>
            <Badge variant="cyan">{selectedChecks.length} of 5 Selected</Badge>
          </h3>
          <p className="text-xs text-zinc-400 font-body">
            Customize which automated static and dynamic audit suites run on {sanitizedProjectName}.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {allSelected ? (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllChecks}
              className="text-xs border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
            >
              <Square className="w-3.5 h-3.5 mr-1.5" />
              Clear All
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllChecks}
              className="text-xs border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300"
            >
              <CheckSquare className="w-3.5 h-3.5 mr-1.5" />
              Select All
            </Button>
          )}
        </div>
      </div>

      {/* Categories Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CATEGORY_DEFINITIONS.map((cat) => {
          const isSelected = selectedChecks.includes(cat.id);
          const Icon = cat.icon;

          return (
            <div
              key={cat.id}
              onClick={() => toggleCheckCategory(cat.id)}
              className={`relative rounded-2xl p-5 border transition-all cursor-pointer ${
                isSelected
                  ? "bg-zinc-900/90 border-zinc-700/60 shadow-lg"
                  : "bg-zinc-900/30 border-zinc-800/30 opacity-75 hover:opacity-100 hover:border-zinc-700/50 hover:bg-zinc-900/50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                      isSelected
                        ? cat.accentColor
                        : "bg-zinc-800/50 border-zinc-700/50 text-zinc-400"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-heading font-bold text-white text-base tracking-tight">
                        {cat.name}
                      </h4>
                      {cat.isRecommended && (
                        <span className="flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded-full">
                          <Flame className="w-3 h-3" /> Core
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 font-body leading-relaxed max-w-sm">
                      {cat.shortDesc}
                    </p>
                  </div>
                </div>

                <div onClick={(e) => e.stopPropagation()}>
                  <Switch
                    checked={isSelected}
                    onCheckedChange={() => toggleCheckCategory(cat.id)}
                  />
                </div>
              </div>

              {/* Subcheck Badges (Solid dark fills, no outline box borders) */}
              <div className="mt-4 pt-3 border-t border-zinc-800/40 flex flex-wrap items-center gap-1.5">
                {cat.subchecks.map((sc) => (
                  <span
                    key={sc}
                    className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-zinc-800/50 text-zinc-300 font-medium"
                  >
                    {sc}
                  </span>
                ))}
                <span className="ml-auto text-[11px] font-mono text-zinc-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> ~{cat.estimatedDuration}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer Bar */}
      <div className="bg-zinc-900/60 border border-zinc-800/40 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-sm font-heading font-bold text-white tracking-tight">
            Ready to execute PreFlight audit pipeline?
          </div>
          <div className="text-xs text-zinc-400 font-mono">
            {selectedChecks.length} categories active | Estimated duration: ~
            {(selectedChecks.length * 2.5).toFixed(1)}s
          </div>
        </div>

        <Button
          variant="cyan"
          size="lg"
          disabled={selectedChecks.length === 0}
          onClick={handleStart}
          className="w-full sm:w-auto font-bold"
        >
          <Play className="w-4 h-4 fill-current mr-2" />
          RUN PREFLIGHT AUDIT
        </Button>
      </div>
    </div>
  );
}
