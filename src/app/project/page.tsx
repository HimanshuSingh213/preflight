"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAuditStore } from "@/store/audit-store";
import { AuditSelector } from "@/components/audit/AuditSelector";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FolderArchive,
  ChevronLeft,
  FileCode,
  Layers,
  Terminal,
  Package,
} from "lucide-react";

export default function ProjectPage() {
  const router = useRouter();
  const snapshot = useAuditStore((s) => s.snapshot);

  React.useEffect(() => {
    if (!snapshot) {
      router.replace("/");
    }
  }, [snapshot, router]);

  if (!snapshot) {
    return (
      <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-cyan-400">
          <FolderArchive className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-heading font-bold text-white tracking-tight">
          No Active Workspace Loaded
        </h2>
        <p className="text-sm text-zinc-400 max-w-sm font-body">
          Redirecting to project upload page...
        </p>
        <Link href="/">
          <Button variant="cyan" size="sm">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Return to Upload
          </Button>
        </Link>
      </div>
    );
  }

  const { stack } = snapshot;

  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-cyan-500 selection:text-black">
      {/* Top Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/90 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-lg text-white tracking-tight">
                PreFlight
              </span>
              <span className="text-zinc-600 font-mono">/</span>
              <span className="font-mono text-sm text-cyan-400 font-bold truncate max-w-[200px] sm:max-w-none">
                {snapshot.name}
              </span>
            </div>
          </div>

          <Link href="/">
            <Button variant="outline" size="sm" className="text-xs border-zinc-800">
              Upload Workspace
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Project Header / Stack Info */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
                  AST Snapshot Extracted
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-heading font-extrabold text-white tracking-tight">
                {snapshot.name}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              <Badge variant="cyan">
                <FileCode className="w-3.5 h-3.5 mr-1" />
                {stack.language.toUpperCase()}
              </Badge>
              {stack.framework && (
                <Badge variant="ready">
                  <Layers className="w-3.5 h-3.5 mr-1" />
                  {stack.framework.toUpperCase()}
                </Badge>
              )}
              <Badge variant="secondary">
                <Package className="w-3.5 h-3.5 mr-1" />
                {stack.packageManager}
              </Badge>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-1 font-mono">
              <span className="text-[11px] text-zinc-500 block uppercase">TOTAL FILES</span>
              <span className="text-xl font-bold text-white">
                {stack.totalFiles}
              </span>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-1 font-mono">
              <span className="text-[11px] text-zinc-500 block uppercase">ANALYZED</span>
              <span className="text-xl font-bold text-cyan-400">
                {stack.analyzedFiles} Files
              </span>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-1 font-mono">
              <span className="text-[11px] text-zinc-500 block uppercase">TEST SUITE</span>
              <span
                className={`text-xl font-bold ${
                  stack.hasTests ? "text-emerald-400" : "text-zinc-500"
                }`}
              >
                {stack.hasTests ? "Detected" : "None"}
              </span>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-xl space-y-1 font-mono">
              <span className="text-[11px] text-zinc-500 block uppercase">TYPE SYSTEM</span>
              <span className="text-xl font-bold text-emerald-400">
                {stack.hasTypeScript ? "TypeScript Strict" : "Standard JS"}
              </span>
            </div>
          </div>

          {/* Scripts Bar */}
          {snapshot.scripts && Object.keys(snapshot.scripts).length > 0 && (
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-zinc-500 flex items-center gap-1.5 mr-2">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                Detected npm scripts:
              </span>
              {Object.entries(snapshot.scripts).map(([cmd, script]) => (
                <span
                  key={cmd}
                  className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-300"
                >
                  <strong className="text-cyan-400">{cmd}:</strong> {String(script)}
                </span>
              ))}
            </div>
          )}
        </motion.section>

        {/* Audit Selection Suite */}
        <section>
          <AuditSelector />
        </section>
      </main>
    </div>
  );
}
