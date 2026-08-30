"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuditStore } from "@/store/audit-store";
import { Button } from "@/components/ui/button";
import {
  UploadCloud,
  FileArchive,
  FolderUp,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Loader2,
  Cpu,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

export function ProjectUploader() {
  const router = useRouter();
  const { setSnapshot, loadSampleProject } = useAuditStore();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>("Analyzing repository AST...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  
  const zipInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!uploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const processZipFile = async (file: File) => {
    if (!file.name.endsWith(".zip")) {
      setErrorMessage("Please upload a valid .zip archive or select a project folder.");
      return;
    }

    setErrorMessage(null);
    setSelectedName(`${file.name} (${formatBytes(file.size)})`);
    setUploading(true);
    setLoadingStep("Reading ZIP archive into local sandbox...");

    // Yield to let React render the loading overlay instantly
    await new Promise((r) => setTimeout(r, 50));

    try {
      const formData = new FormData();
      formData.append("file", file);

      setLoadingStep("Extracting AST manifests and file tree...");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.snapshot) {
          setLoadingStep("Workspace snapshot generated!");
          setSnapshot(data.snapshot);
          setTimeout(() => router.push("/project"), 200);
          return;
        }
      }

      const errData = await res.json().catch(() => ({}));
      setErrorMessage(errData.error || "Failed to parse .zip archive.");
    } catch {
      setErrorMessage("Network error during file upload.");
    } finally {
      setUploading(false);
    }
  };

  const processFolderFiles = async (files: FileList) => {
    if (files.length === 0) return;

    setErrorMessage(null);
    const firstFile = files[0];
    const relativePath = firstFile.webkitRelativePath || firstFile.name;
    const folderName = relativePath.split("/")[0] || "project-folder";
    
    // Set loading state immediately so UI blocks and displays loader
    setSelectedName(`${folderName} (${files.length} files)`);
    setUploading(true);
    setLoadingStep("Indexing directory files...");

    // Yield to let React paint the loader overlay immediately on screen
    await new Promise((r) => setTimeout(r, 50));

    try {
      const formData = new FormData();
      let validCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const pathStr = file.webkitRelativePath || file.name;
        
        // Exclude binary dependencies & git lock bloat
        if (
          !pathStr.includes("node_modules/") &&
          !pathStr.includes(".git/") &&
          !pathStr.includes(".next/") &&
          !pathStr.includes("dist/") &&
          !pathStr.includes("build/")
        ) {
          formData.append("files", file, pathStr);
          validCount++;
        }
      }

      setLoadingStep(`Analyzing ${validCount} source files and dependencies...`);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.snapshot) {
          setLoadingStep("Project AST snapshot created!");
          setSnapshot(data.snapshot);
          setTimeout(() => router.push("/project"), 200);
          return;
        }
      }

      const errData = await res.json().catch(() => ({}));
      setErrorMessage(errData.error || "Failed to process folder workspace.");
    } catch {
      setErrorMessage("Failed to upload folder files.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (uploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const firstFile = e.dataTransfer.files[0];
      if (firstFile.name.endsWith(".zip")) {
        processZipFile(firstFile);
      } else {
        processFolderFiles(e.dataTransfer.files);
      }
    }
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processZipFile(e.target.files[0]);
    }
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFolderFiles(e.target.files);
    }
  };

  const handlePresetSelect = (preset: "saas-starter" | "clean-api" | "vulnerable-app") => {
    if (uploading) return;
    setUploading(true);
    setSelectedName(
      preset === "saas-starter"
        ? "Next.js SaaS Dashboard (Preset)"
        : preset === "clean-api"
        ? "Express Gateway API (Preset)"
        : "E-Commerce Payment Portal (Preset)"
    );
    setLoadingStep("Loading demo AST snapshot into memory...");
    setTimeout(() => {
      loadSampleProject(preset);
      router.push("/project");
    }, 400);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Upload Zone Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-2xl border p-8 md:p-12 text-center transition-all overflow-hidden ${
          isDragging
            ? "border-cyan-500 bg-cyan-950/30 shadow-[0_0_40px_rgba(6,182,212,0.2)]"
            : "border-zinc-800 bg-zinc-900"
        }`}
      >
        {/* Hidden File & Folder Inputs */}
        <input
          ref={zipInputRef}
          type="file"
          accept=".zip,application/zip"
          className="hidden"
          disabled={uploading}
          onChange={handleZipChange}
        />
        <input
          ref={folderInputRef}
          type="file"
          // @ts-expect-error - webkitdirectory is supported in modern browsers
          webkitdirectory=""
          directory=""
          multiple
          className="hidden"
          disabled={uploading}
          onChange={handleFolderChange}
        />

        {/* Full-Card Animated Loader Overlay preventing user interaction during scan */}
        <AnimatePresence>
          {uploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-950/95 z-30 flex flex-col items-center justify-center p-6 space-y-6 backdrop-blur-md pointer-events-auto select-none"
            >
              {/* Spinner & Pulsing Icon */}
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Cpu className="w-8 h-8 animate-pulse text-cyan-400" />
                </div>
                <div className="absolute inset-0 rounded-2xl border border-cyan-500/40 animate-ping opacity-25" />
              </div>

              {/* Step Status Text */}
              <div className="space-y-1.5 text-center max-w-sm">
                <h4 className="font-heading font-extrabold text-white text-base tracking-tight truncate">
                  {selectedName || "Reading Project Workspace"}
                </h4>
                <p className="text-xs font-mono text-cyan-400 font-semibold tracking-wide">
                  {loadingStep}
                </p>
              </div>

              {/* Shimmer Loader Line */}
              <div className="w-full max-w-xs pt-1">
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden relative">
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
                    className="h-full w-2/3 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative z-10 flex flex-col items-center space-y-6">
          <div
            className={`w-16 h-16 rounded-xl flex items-center justify-center transition-all ${
              isDragging
                ? "bg-cyan-500 text-black scale-105"
                : "bg-zinc-800 text-cyan-400 border border-zinc-700"
            }`}
          >
            <UploadCloud className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-md">
            <h3 className="text-xl md:text-2xl font-heading font-extrabold text-white tracking-tight">
              {isDragging ? "Drop workspace here" : "Upload Workspace or Archive"}
            </h3>
            <p className="text-sm text-zinc-400 font-body leading-relaxed">
              Drag & drop a .zip archive or select a project folder from your computer.
            </p>
          </div>

          {errorMessage && (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-rose-950/50 border border-rose-500/30 text-rose-300 text-xs font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              {errorMessage}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Button
              variant="cyan"
              size="sm"
              isLoading={uploading}
              disabled={uploading}
              onClick={() => zipInputRef.current?.click()}
            >
              <FileArchive className="w-4 h-4 mr-2" />
              Upload .ZIP Archive
            </Button>

            <Button
              variant="outline"
              size="sm"
              isLoading={uploading}
              disabled={uploading}
              onClick={() => folderInputRef.current?.click()}
              className="border-zinc-700 text-zinc-200 hover:text-white hover:border-zinc-500"
            >
              <FolderUp className="w-4 h-4 mr-2 text-cyan-400" />
              Select Folder
            </Button>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono text-zinc-500 pt-1">
            <span className="inline-flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Local AST Sandbox
            </span>
            <span>::</span>
            <span>Zero Remote Telemetry</span>
          </div>
        </div>
      </div>

      {/* Preset Demo Workspaces */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-5">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h4 className="font-heading text-base font-bold text-white tracking-tight">
              Instant Demo Workspaces
            </h4>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            Click to test PreFlight Engine
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Preset 1 */}
          <div
            onClick={() => handlePresetSelect("saas-starter")}
            className={`bg-zinc-950 border border-zinc-800 hover:border-amber-500/50 rounded-xl p-5 transition-colors ${
              uploading ? "pointer-events-none opacity-50" : "cursor-pointer"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                REVIEW REQUIRED
              </span>
              <span className="text-xs font-mono text-zinc-500">86 Files</span>
            </div>
            <h5 className="font-heading font-bold text-white text-sm">
              Next.js SaaS Dashboard
            </h5>
            <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
              Next.js 15, TypeScript, Tailwind. Contains unoptimized asset and open redirect warning.
            </p>
            <div className="mt-4 flex items-center justify-between text-xs text-zinc-400 font-heading font-semibold">
              <span>Inspect Workspace</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </div>
          </div>

          {/* Preset 2 */}
          <div
            onClick={() => handlePresetSelect("clean-api")}
            className={`bg-zinc-950 border border-zinc-800 hover:border-emerald-500/50 rounded-xl p-5 transition-colors ${
              uploading ? "pointer-events-none opacity-50" : "cursor-pointer"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                READY TO SHIP
              </span>
              <span className="text-xs font-mono text-zinc-500">52 Files</span>
            </div>
            <h5 className="font-heading font-bold text-white text-sm">
              Express Gateway API
            </h5>
            <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
              Express 4, TypeScript, Jest. 100% clean test suite, zero secrets, ready to ship.
            </p>
            <div className="mt-4 flex items-center justify-between text-xs text-zinc-400 font-heading font-semibold">
              <span>Inspect Workspace</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </div>
          </div>

          {/* Preset 3 */}
          <div
            onClick={() => handlePresetSelect("vulnerable-app")}
            className={`bg-zinc-950 border border-zinc-800 hover:border-rose-500/50 rounded-xl p-5 transition-colors ${
              uploading ? "pointer-events-none opacity-50" : "cursor-pointer"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                CRITICAL BLOCKER
              </span>
              <span className="text-xs font-mono text-zinc-500">140 Files</span>
            </div>
            <h5 className="font-heading font-bold text-white text-sm">
              E-Commerce Payment Portal
            </h5>
            <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
              Contains live Stripe API secret leak, SQL injection vector, and broken TypeScript build.
            </p>
            <div className="mt-4 flex items-center justify-between text-xs text-zinc-400 font-heading font-semibold">
              <span>Inspect Workspace</span>
              <ArrowRight className="w-4 h-4 text-rose-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
