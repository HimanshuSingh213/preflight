import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter, JetBrains_Mono } from "next/font/google";
import { MonitorCheck, Laptop } from "lucide-react";
import "./globals.css";

const headingFont = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
});

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PreFlight - Pre-Deployment Release Gate",
  description: "Detect code health, security vulnerabilities, broken builds, and runtime issues before production deployment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${headingFont.variable} ${bodyFont.variable} ${monoFont.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col font-body bg-black text-zinc-100 selection:bg-cyan-500 selection:text-black">
        {/* Mobile Viewport Restriction Guard (< 1024px) */}
        <div className="flex lg:hidden min-h-screen w-full bg-black text-zinc-100 flex-col items-center justify-center p-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-cyan-400">
            <Laptop className="w-8 h-8" />
          </div>

          <div className="space-y-2 max-w-sm">
            <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">
              PreFlight Release Gate
            </span>
            <h1 className="text-2xl font-heading font-extrabold text-white tracking-tight">
              Desktop Experience Required
            </h1>
            <p className="text-xs text-zinc-400 font-body leading-relaxed">
              PreFlight is a developer workspace tool engineered specifically for desktop viewports and AST analysis workflows. Please access PreFlight on a desktop browser to inspect repositories and run release safety checks.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
            <MonitorCheck className="w-3.5 h-3.5 text-emerald-400" />
            Optimized for 1024px+ displays
          </div>
        </div>

        {/* Desktop Viewport (>= 1024px) */}
        <div className="hidden lg:block min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
