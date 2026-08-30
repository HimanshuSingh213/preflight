"use client";

import React from "react";
import Link from "next/link";
import { ProjectUploader } from "@/components/upload/ProjectUploader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Code2,
  Cpu,
  MonitorCheck,
  Zap,
  GitBranch,
  Terminal,
  Lock,
  CheckCircle2,
  Sliders,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-cyan-500 selection:text-black">
      {/* Top Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-950/90 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500 flex items-center justify-center text-black font-bold text-sm">
              PF
            </div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-lg tracking-tight text-white">
                PreFlight
              </span>
              <Badge variant="cyan" className="font-mono text-[10px]">v1.0</Badge>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 transition-colors"
            >
              <GitBranch className="w-3.5 h-3.5" />
              Repository
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-16">
        {/* Hero Section */}
        <section className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono font-semibold bg-zinc-900 text-cyan-400 border border-zinc-800">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            AUTOMATED PRE-DEPLOYMENT RELEASE GATE
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-heading font-black tracking-tight text-white leading-tight">
            Verify Code Integrity <br className="hidden sm:inline" />
            <span className="text-cyan-400">
              Before Shipping to Production
            </span>
          </h1>

          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto font-body leading-relaxed">
            Detect compilation failures, API key leaks, dead code exports, runtime crashes, and accessibility violations in seconds.
          </p>

          {/* Quick Value Props Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Zero Configuration Required
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
              <Lock className="w-3.5 h-3.5 text-cyan-400" />
              In-Memory Local Execution
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
              <Terminal className="w-3.5 h-3.5 text-zinc-400" />
              Real-Time AST Validation
            </div>
          </div>
        </section>

        {/* Project Uploader Component */}
        <section>
          <ProjectUploader />
        </section>

        {/* 5-Category Feature Highlights */}
        <section className="space-y-8 pt-8 border-t border-zinc-800">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-heading font-black text-white tracking-tight">
              5-Point Release Inspection Suite
            </h2>
            <p className="text-sm text-zinc-400 font-body">
              PreFlight executes non-interactive AST static analysis and isolated dynamic check stages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Feature 1 */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 text-emerald-400 flex items-center justify-center">
                <Code2 className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-white text-sm">
                1. Code Health
              </h3>
              <p className="text-xs text-zinc-400 font-body leading-relaxed">
                AST dead code scans, circular imports, and line complexity metrics via ts-morph.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 text-rose-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-white text-sm">
                2. Secrets & Security
              </h3>
              <p className="text-xs text-zinc-400 font-body leading-relaxed">
                Scans API keys, private keys, raw SQL query concatenation, and committed env files.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 text-cyan-400 flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-white text-sm">
                3. Build & Test
              </h3>
              <p className="text-xs text-zinc-400 font-body leading-relaxed">
                Isolated typechecking, error line extraction, and automated test runners.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 text-amber-400 flex items-center justify-center">
                <MonitorCheck className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-white text-sm">
                4. Runtime & UI
              </h3>
              <p className="text-xs text-zinc-400 font-body leading-relaxed">
                Playwright browser navigation, console crash listeners, and WCAG accessibility audits.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 space-y-3">
              <div className="w-9 h-9 rounded-lg bg-zinc-800 border border-zinc-700 text-purple-400 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-white text-sm">
                5. Performance
              </h3>
              <p className="text-xs text-zinc-400 font-body leading-relaxed">
                TTFB response timing, DOM render speed, and static asset weight limits.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/80 bg-zinc-950 py-8 text-xs font-mono text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>PreFlight Engine :: Status Ready</span>
          </div>
          <div>Developer-First Release Quality Gate</div>
        </div>
      </footer>
    </div>
  );
}
