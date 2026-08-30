"use client";

import React, { useState, useEffect } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-json";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-python";
import { CodeLocation } from "@/types";
import { Copy, Check, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeSnippetViewerProps {
  location?: CodeLocation;
  title?: string;
  detector?: string;
  severity?: string;
}

export function CodeSnippetViewer({
  location,
  detector,
  severity = "high",
}: CodeSnippetViewerProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Prism.highlightAll();
  }, [location?.snippet]);

  if (!location || !location.snippet) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-xs font-mono text-zinc-500">
        No code snippet available for this finding.
      </div>
    );
  }

  const handleCopy = () => {
    if (location.snippet) {
      navigator.clipboard.writeText(location.snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const lines = location.snippet.split("\n");
  const targetLineNumber = location.line;

  const getLanguage = (filepath?: string) => {
    if (!filepath) return "tsx";
    if (filepath.endsWith(".py")) return "python";
    if (filepath.endsWith(".js") || filepath.endsWith(".jsx")) return "javascript";
    if (filepath.endsWith(".ts")) return "typescript";
    if (filepath.endsWith(".json")) return "json";
    return "tsx";
  };

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden shadow-2xl font-mono text-xs">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-zinc-300">
        <div className="flex items-center gap-2 truncate">
          <FileCode className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-cyan-300 font-bold truncate">
            {location.file}
          </span>
          {targetLineNumber && (
            <span className="text-zinc-500 shrink-0">
              (Line {targetLineNumber}
              {location.column ? `:${location.column}` : ""})
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {detector && (
            <span className="text-[10px] text-zinc-500 hidden sm:inline-block">
              Detector: {detector}
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-[11px] text-zinc-400 hover:text-white"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400 mr-1" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Code Snippet Box with Prism.js Highlighting */}
      <div className="p-4 overflow-x-auto text-zinc-200 leading-relaxed font-mono">
        <pre className={`language-${getLanguage(location.file)} space-y-1 bg-transparent p-0 m-0`}>
          {lines.map((line, idx) => {
            const isOffendingLine =
              line.includes(String(targetLineNumber)) ||
              line.includes("STRIPE_SECRET") ||
              line.includes("sk_live_") ||
              line.includes("redirect(") ||
              line.includes("SELECT * FROM");

            return (
              <div
                key={idx}
                className={`flex items-start px-2 py-0.5 rounded transition-colors ${
                  isOffendingLine
                    ? severity === "critical"
                      ? "bg-rose-500/20 text-rose-300 border-l-2 border-rose-500"
                      : "bg-amber-500/15 text-amber-200 border-l-2 border-amber-500"
                    : "hover:bg-zinc-900/50"
                }`}
              >
                <code>{line}</code>
              </div>
            );
          })}
        </pre>
      </div>
    </div>
  );
}
