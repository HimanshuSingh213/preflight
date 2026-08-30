"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuditStore, LogEntry } from "@/store/audit-store";
import { AuditProgressCard } from "@/components/audit/AuditProgressCard";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Terminal,
  XCircle,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { CheckCategory } from "@/types";

const CATEGORY_NAMES: Record<CheckCategory, string> = {
  "code-health": "Code Health & AST Architecture",
  security: "Security & Secret Scanning",
  "build-test": "Build, Lint & Test Runner",
  "runtime-ui": "Runtime, UI & A11y Crawl",
  performance: "Performance & Asset Profiler",
};

export default function AuditExecutionPage() {
  const router = useRouter();

  // Atomic Zustand Store Selectors
  const snapshot = useAuditStore((s) => s.snapshot);
  const selectedChecks = useAuditStore((s) => s.selectedChecks);
  const isAuditing = useAuditStore((s) => s.isAuditing);
  const auditProgress = useAuditStore((s) => s.auditProgress);
  const currentCategory = useAuditStore((s) => s.currentCategory);
  const categoryResults = useAuditStore((s) => s.categoryResults);
  const categoryStatuses = useAuditStore((s) => s.categoryStatuses);
  const logs = useAuditStore((s) => s.logs);
  const startAudit = useAuditStore((s) => s.startAudit);
  const cancelAudit = useAuditStore((s) => s.cancelAudit);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!snapshot) {
      router.push("/");
      return;
    }

    if (!isAuditing && auditProgress < 100) {
      startAudit(() => {
        setTimeout(() => {
          router.push("/results");
        }, 1000);
      });
    }
  }, [snapshot, isAuditing, auditProgress, startAudit, router]);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleSkipToResults = useCallback(() => {
    router.push("/results");
  }, [router]);

  const handleCancel = useCallback(() => {
    cancelAudit();
    router.push("/project");
  }, [cancelAudit, router]);

  if (!snapshot) return null;

  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-cyan-500 selection:text-black relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Top Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-sm">
              <Loader2 className={`w-4 h-4 ${isAuditing ? "animate-spin" : ""}`} />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-white text-base sm:text-lg tracking-tight">
                Execution Suite
              </span>
              <Badge variant="cyan" pulse={isAuditing}>
                {isAuditing ? "ACTIVE STREAM" : "COMPLETED"}
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="text-xs text-zinc-400 hover:text-white border-zinc-800"
              >
                <XCircle className="w-3.5 h-3.5 mr-1" />
                Cancel
              </Button>
            )}
            {(!isAuditing || auditProgress === 100) && (
              <Button
                variant="cyan"
                size="sm"
                onClick={handleSkipToResults}
                className="text-xs font-bold"
              >
                <span>View Results</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Progress Bar Card */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-4 shadow-xl"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
                Target: {snapshot.name} ({snapshot.stack.framework || snapshot.stack.language})
              </span>
              <h2 className="text-xl md:text-2xl font-heading font-black text-white flex items-center gap-2.5">
                {isAuditing ? (
                  <>
                    <span>Running: </span>
                    <span className="text-cyan-400">
                      {currentCategory
                        ? CATEGORY_NAMES[currentCategory as CheckCategory]
                        : "Initializing sandbox environment..."}
                    </span>
                  </>
                ) : (
                  <span className="text-emerald-400">
                    PreFlight Audit Completed (100%)
                  </span>
                )}
              </h2>
            </div>

            <div className="font-mono text-2xl md:text-3xl font-extrabold text-white">
              {auditProgress}%
            </div>
          </div>

          <Progress value={auditProgress} indicatorColor="cyan" className="h-2.5" />
        </motion.section>

        {/* Categories Progress Cards & Live Terminal Feed Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-3">
            <h3 className="text-sm font-mono font-bold text-zinc-400 uppercase tracking-wider px-1">
              Category Execution Stages
            </h3>

            {selectedChecks.map((cat: CheckCategory) => (
              <AuditProgressCard
                key={cat}
                category={cat}
                name={CATEGORY_NAMES[cat] || cat}
                status={categoryStatuses[cat]}
                result={categoryResults[cat]}
                isCurrent={currentCategory === cat}
              />
            ))}
          </div>

          <div className="lg:col-span-5 flex flex-col bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl min-h-[380px] max-h-[560px]">
            <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="font-bold text-white">live-event-stream.log</span>
              </div>
              <span className="text-[10px] font-mono text-zinc-500">
                {logs.length} events
              </span>
            </div>

            <div className="p-4 flex-1 overflow-y-auto space-y-2 font-mono text-xs text-zinc-300">
              <AnimatePresence>
                {logs.length === 0 ? (
                  <div className="text-zinc-600 italic">Waiting for pipeline events...</div>
                ) : (
                  logs.map((log: LogEntry) => {
                    const colorClass =
                      log.level === "error"
                        ? "text-rose-400 bg-rose-950/30 px-2 py-0.5 rounded border border-rose-500/20"
                        : log.level === "warn"
                        ? "text-amber-300 bg-amber-950/30 px-2 py-0.5 rounded border border-amber-500/20"
                        : log.level === "success"
                        ? "text-emerald-400"
                        : "text-zinc-300";

                    return (
                      <motion.div
                        key={log.id}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-2 leading-relaxed"
                      >
                        <span className="text-zinc-600 shrink-0 select-none">
                          [{log.timestamp}]
                        </span>
                        <span className={colorClass}>{log.message}</span>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
              <div ref={terminalEndRef} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
