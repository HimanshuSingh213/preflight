"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuditStore } from "@/store/audit-store";
import { ReleaseDecisionBanner } from "@/components/results/ReleaseDecisionBanner";
import { FindingCard } from "@/components/results/FindingCard";
import { FullReportModal } from "@/components/report/FullReportModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  RotateCcw,
  PlusCircle,
  Search,
  ShieldCheck,
  ChevronLeft,
} from "lucide-react";
import { CheckCategory, Finding, CategoryResult, AuditReport } from "@/types";

export default function ResultsPage() {
  const router = useRouter();

  // Atomic Zustand Selectors
  const snapshot = useAuditStore((s) => s.snapshot);
  const report = useAuditStore((s) => s.report);
  const findings = useAuditStore((s) => s.findings);
  const categoryResults = useAuditStore((s) => s.categoryResults);
  const ignoredFindingIds = useAuditStore((s) => s.ignoredFindingIds);

  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);

  // Memoized Report Assembly
  const activeReport = useMemo<AuditReport | null>(() => {
    if (!snapshot) return null;
    return (
      report || {
        id: snapshot.id,
        generatedAt: new Date().toISOString(),
        project: snapshot,
        overallScore: 84,
        releaseStatus: "REVIEW_BEFORE_SHIP",
        blockers: [],
        categoryResults,
        totalFindings: {
          critical: findings.filter((f: Finding) => f.severity === "critical" && !ignoredFindingIds.has(f.id)).length,
          high: findings.filter((f: Finding) => f.severity === "high" && !ignoredFindingIds.has(f.id)).length,
          medium: findings.filter((f: Finding) => f.severity === "medium" && !ignoredFindingIds.has(f.id)).length,
          low: findings.filter((f: Finding) => f.severity === "low" && !ignoredFindingIds.has(f.id)).length,
          info: findings.filter((f: Finding) => f.severity === "info" && !ignoredFindingIds.has(f.id)).length,
        },
        recommendedFixOrder: [],
      }
    );
  }, [snapshot, report, categoryResults, findings, ignoredFindingIds]);

  // Memoized Findings Filtering
  const filteredFindings = useMemo(() => {
    return findings.filter((f: Finding) => {
      if (selectedSeverity !== "all" && f.severity !== selectedSeverity) {
        return false;
      }
      if (selectedCategory !== "all" && f.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchTitle = f.title.toLowerCase().includes(q);
        const matchDesc = f.description.toLowerCase().includes(q);
        const matchFile = f.location?.file?.toLowerCase().includes(q);
        const matchDetector = f.detector.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchFile && !matchDetector) {
          return false;
        }
      }
      return true;
    });
  }, [findings, selectedSeverity, selectedCategory, searchQuery]);

  // Memoized Severities
  const severities = useMemo(() => [
    { label: "All Severities", value: "all", count: findings.length },
    { label: "Critical", value: "critical", count: findings.filter((f: Finding) => f.severity === "critical").length },
    { label: "High", value: "high", count: findings.filter((f: Finding) => f.severity === "high").length },
    { label: "Medium", value: "medium", count: findings.filter((f: Finding) => f.severity === "medium").length },
    { label: "Low", value: "low", count: findings.filter((f: Finding) => f.severity === "low").length },
    { label: "Info", value: "info", count: findings.filter((f: Finding) => f.severity === "info").length },
  ], [findings]);

  // Static Categories List
  const categories = useMemo(() => [
    { label: "All Categories", value: "all" },
    { label: "Code Health", value: "code-health" },
    { label: "Security", value: "security" },
    { label: "Build & Test", value: "build-test" },
    { label: "Runtime & UI", value: "runtime-ui" },
    { label: "Performance", value: "performance" },
  ], []);

  const categoryResultList = useMemo(() => {
    return Object.entries(categoryResults) as [CheckCategory, CategoryResult][];
  }, [categoryResults]);

  // Callbacks
  const handleSeveritySelect = useCallback((val: string) => {
    setSelectedSeverity(val);
  }, []);

  const handleCategorySelect = useCallback((val: string) => {
    setSelectedCategory(val);
  }, []);

  const handleOpenReportModal = useCallback(() => {
    setReportModalOpen(true);
  }, []);

  const handleRerunAudit = useCallback(() => {
    router.push("/audit");
  }, [router]);

  // Auto redirect if no snapshot
  React.useEffect(() => {
    if (!snapshot) {
      router.replace("/");
    }
  }, [snapshot, router]);

  if (!snapshot || !activeReport) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <h2 className="text-2xl font-heading font-bold text-white tracking-tight">
          No Active Audit Loaded
        </h2>
        <p className="text-sm text-zinc-400 max-w-sm font-body">
          Redirecting to project upload page...
        </p>
        <Link href="/">
          <Button variant="cyan" size="sm">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Upload Project
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-cyan-500 selection:text-black relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/project" className="text-zinc-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-white text-base sm:text-lg tracking-tight">
                Audit Results
              </span>
              <span className="text-zinc-600 font-mono">/</span>
              <span className="font-mono text-xs sm:text-sm text-cyan-400 font-bold truncate max-w-[160px] sm:max-w-none">
                {snapshot.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRerunAudit}
              className="text-xs border-zinc-800"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              Re-run Audit
            </Button>

            <Button
              variant="cyan"
              size="sm"
              onClick={handleOpenReportModal}
              className="text-xs"
            >
              <FileText className="w-3.5 h-3.5 mr-1" />
              Full Compliance Report
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Release Decision Hero Banner */}
        <section>
          <ReleaseDecisionBanner
            releaseStatus={activeReport.releaseStatus}
            overallScore={activeReport.overallScore}
            criticalCount={activeReport.totalFindings.critical}
            highCount={activeReport.totalFindings.high}
            mediumCount={activeReport.totalFindings.medium}
            lowCount={activeReport.totalFindings.low}
            projectName={snapshot.name}
          />
        </section>

        {/* Category Scores Sub-Grid */}
        <section className="space-y-4">
          <h3 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
            Safety Scores by Category
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {categoryResultList.map(([catKey, res]) => (
              <div
                key={catKey}
                onClick={() => handleCategorySelect(catKey)}
                className={`bg-zinc-900 border p-4 rounded-xl space-y-1 cursor-pointer transition-all ${
                  selectedCategory === catKey
                    ? "border-cyan-500 bg-zinc-900"
                    : "border-zinc-800 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span className="capitalize">{catKey.replace("-", " ")}</span>
                  <span>{res.findings?.length || 0} issues</span>
                </div>
                <div
                  className={`text-2xl font-mono font-black ${
                    res.score >= 90
                      ? "text-emerald-400"
                      : res.score >= 70
                      ? "text-amber-400"
                      : "text-rose-400"
                  }`}
                >
                  {res.score}
                  <span className="text-xs text-zinc-500 font-normal">/100</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Filters & Search Control Bar */}
        <section className="space-y-4 bg-zinc-900 border border-zinc-800 p-5 rounded-2xl shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter by title, file path, detector..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="text-xs font-mono text-zinc-400">
              Showing <strong className="text-white font-bold">{filteredFindings.length}</strong> of {findings.length} findings
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-800">
            {severities.map((sev) => (
              <button
                key={sev.value}
                onClick={() => handleSeveritySelect(sev.value)}
                className={`px-3 py-1 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  selectedSeverity === sev.value
                    ? "bg-white text-black font-bold shadow-md"
                    : "bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                {sev.label} ({sev.count})
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategorySelect(cat.value)}
                className={`px-3 py-1 rounded-xl text-xs font-heading transition-all cursor-pointer ${
                  selectedCategory === cat.value
                    ? "bg-cyan-500 text-black font-bold shadow-md"
                    : "bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Findings List Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-extrabold text-lg text-white tracking-tight">
              Security & Safety Findings ({filteredFindings.length})
            </h3>
            {ignoredFindingIds.size > 0 && (
              <Badge variant="secondary">
                {ignoredFindingIds.size} finding(s) ignored from safety score
              </Badge>
            )}
          </div>

          {filteredFindings.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-heading font-bold text-white text-lg">
                Zero Matching Findings
              </h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                All checks passed cleanly for your selected filters!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFindings.map((finding: Finding) => (
                <FindingCard key={finding.id} finding={finding} />
              ))}
            </div>
          )}
        </section>

        {/* Bottom Actions Bar */}
        <section className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-zinc-900 border border-zinc-800 rounded-2xl">
          <div className="space-y-1">
            <h4 className="font-heading font-bold text-white text-base">
              Ready to ship or inspect another build?
            </h4>
            <p className="text-xs text-zinc-400">
              Copy the Markdown summary or download the full JSON report.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="outline" size="sm" className="border-zinc-800">
                <PlusCircle className="w-4 h-4 mr-1.5" />
                Audit New Project
              </Button>
            </Link>

            <Button
              variant="cyan"
              size="sm"
              onClick={handleOpenReportModal}
            >
              <FileText className="w-4 h-4 mr-1.5" />
              Full Compliance Report
            </Button>
          </div>
        </section>
      </main>

      {/* Full Report Modal */}
      <FullReportModal
        open={reportModalOpen}
        onOpenChange={setReportModalOpen}
        report={activeReport}
        findings={findings}
      />
    </div>
  );
}
