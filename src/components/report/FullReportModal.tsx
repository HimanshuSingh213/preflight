"use client";

import React, { useState, useCallback } from "react";
import { AuditReport, Finding } from "@/types";
import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Download,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileText,
  Sparkles,
} from "lucide-react";

interface FullReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report: AuditReport | null;
  findings: Finding[];
}

export function FullReportModal({
  open,
  onOpenChange,
  report,
  findings,
}: FullReportModalProps) {
  const [copied, setCopied] = useState(false);

  if (!report) return null;

  const handleDownloadJSON = useCallback(() => {
    const jsonPayload = {
      auditReport: {
        id: report.id,
        projectName: report.project.name,
        generatedAt: report.generatedAt,
        releaseStatus: report.releaseStatus,
        overallScore: report.overallScore,
        stackInfo: report.project.stack,
        summary: report.totalFindings,
        recommendedFixOrder: report.recommendedFixOrder,
      },
      findings: findings.map((f) => ({
        id: f.id,
        category: f.category,
        severity: f.severity,
        title: f.title,
        description: f.description,
        location: f.location,
        detector: f.detector,
        recommendation: f.recommendation,
        isBlocker: f.isBlocker,
      })),
      exportedAt: new Date().toISOString(),
    };

    const jsonStr = JSON.stringify(jsonPayload, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `preflight-audit-${report.project.name || "workspace"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [report, findings]);

  const handleCopyMarkdown = useCallback(() => {
    const md = `# PreFlight Release Safety Audit Report - ${report.project.name}

**Generated At:** ${new Date(report.generatedAt).toLocaleString()}  
**Executive Decision:** ${report.releaseStatus}  
**Overall Safety Score:** ${report.overallScore}/100  

---

## 1. Stack & Workspace Metadata
- **Language:** ${report.project.stack.language.toUpperCase()}
- **Framework:** ${report.project.stack.framework || "None"}
- **Package Manager:** ${report.project.stack.packageManager}
- **Analyzed Files:** ${report.project.stack.analyzedFiles} / ${report.project.stack.totalFiles}

---

## 2. Severity Breakdown
- **Critical Blockers:** ${report.totalFindings.critical}
- **High Severity:** ${report.totalFindings.high}
- **Medium Warnings:** ${report.totalFindings.medium}
- **Low / Info:** ${report.totalFindings.low + report.totalFindings.info}

---

## 3. Recommended Release Remediation Order
${report.recommendedFixOrder.map((step, i) => `${i + 1}. ${step}`).join("\n")}

---

## 4. Detected Findings Manifest (${findings.length})

${findings
  .map(
    (f, i) => `### ${i + 1}. [${f.severity.toUpperCase()}] ${f.title}
- **Category:** ${f.category}
- **Detector:** ${f.detector}
- **Location:** \`${f.location?.file || "Global"}\`${f.location?.line ? ` (Line ${f.location.line})` : ""}
- **Description:** ${f.description}
- **Remediation:** ${f.recommendation || "N/A"}
`
  )
  .join("\n")}
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [report, findings]);

  const isReady = report.releaseStatus === "READY_TO_SHIP";
  const isBlocked = report.releaseStatus === "BLOCKED";

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-4xl">
      {/* Modal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <DialogTitle>PreFlight Compliance Audit Report</DialogTitle>
            <p className="text-xs text-zinc-400 font-mono">
              Workspace: {report.project.name} | {new Date(report.generatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Action Buttons: Copy Markdown & Download JSON */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyMarkdown}
            className="text-xs border-zinc-800 bg-zinc-900 text-zinc-200 hover:text-white hover:bg-zinc-800"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                Copied Markdown
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" />
                Copy Markdown
              </>
            )}
          </Button>

          <Button
            variant="cyan"
            size="sm"
            onClick={handleDownloadJSON}
            className="text-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1" />
            Download JSON
          </Button>
        </div>
      </div>

      {/* Report Document Body */}
      <div className="py-6 space-y-8 text-zinc-100">
        {/* Release Status Banner */}
        <div
          className={`p-6 rounded-2xl border ${
            isBlocked
              ? "bg-rose-950/20 border-rose-500/40"
              : isReady
              ? "bg-emerald-950/20 border-emerald-500/40"
              : "bg-amber-950/20 border-amber-500/40"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-400 block mb-1">
                Executive Release Gate Decision
              </span>
              <div className="text-2xl md:text-3xl font-heading font-black text-white flex items-center gap-3">
                {isBlocked ? (
                  <ShieldAlert className="w-7 h-7 text-rose-400 shrink-0" />
                ) : isReady ? (
                  <ShieldCheck className="w-7 h-7 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-7 h-7 text-amber-400 shrink-0" />
                )}
                {report.releaseStatus}
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-zinc-800 sm:pl-6">
              <span className="text-xs font-mono text-zinc-400 block mb-1">
                Safety Score
              </span>
              <div className="text-3xl md:text-4xl font-mono font-black text-white">
                {report.overallScore}
                <span className="text-xs text-zinc-500 font-normal">/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Project Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-xs font-mono">
          <div>
            <span className="text-zinc-500 block mb-0.5">Language</span>
            <span className="text-white font-bold uppercase">
              {report.project.stack.language}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block mb-0.5">Framework</span>
            <span className="text-cyan-400 font-bold">
              {report.project.stack.framework || "None"}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block mb-0.5">Package Manager</span>
            <span className="text-white font-bold">
              {report.project.stack.packageManager}
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block mb-0.5">Analyzed Files</span>
            <span className="text-white font-bold">
              {report.project.stack.analyzedFiles} / {report.project.stack.totalFiles}
            </span>
          </div>
        </div>

        {/* Recommended Fix Order */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
          <h4 className="font-heading font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Recommended Release Fix Order
          </h4>
          <ol className="space-y-2 text-xs font-mono text-zinc-300 list-decimal list-inside">
            {report.recommendedFixOrder.map((step, idx) => (
              <li key={idx} className="p-2 rounded bg-zinc-950 border border-zinc-800">
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Findings Detailed List */}
        <div className="space-y-4">
          <h4 className="font-heading font-bold text-white text-base">
            Detailed Finding Manifest ({findings.length})
          </h4>

          <div className="space-y-3">
            {findings.map((f, i) => (
              <div
                key={f.id}
                className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-2 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-zinc-500 font-bold">#{i + 1}</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        f.severity === "critical"
                          ? "bg-rose-950/40 text-rose-300 border border-rose-500/30"
                          : f.severity === "high"
                          ? "bg-rose-950/40 text-rose-300 border border-rose-500/30"
                          : "bg-amber-950/40 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {f.severity.toUpperCase()}
                    </span>
                    <span className="text-white font-heading font-bold">
                      {f.title}
                    </span>
                  </div>
                  <span className="text-zinc-500 font-mono">
                    {f.location?.file || "Global"}
                    {f.location?.line ? `:${f.location.line}` : ""}
                  </span>
                </div>

                <p className="text-zinc-400 font-body">{f.description}</p>

                {f.recommendation && (
                  <div className="pt-2 text-emerald-400 font-mono">
                    <span className="font-bold text-zinc-500">Fix: </span>
                    {f.recommendation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
