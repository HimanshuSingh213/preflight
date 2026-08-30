# PreFlight - Pre-Deployment Quality & Security Gate

PreFlight is an automated pre-deployment release safety engine designed to evaluate codebase health, secret leaks, compilation integrity, runtime stability, and browser performance before software ships to production.

---

## Technical Overview

PreFlight provides a non-interactive inspection pipeline that extracts software repositories and runs static AST scanning alongside isolated dynamic execution stages.

### Core Capabilities

- **Workspace Extraction & Ingestion**: Processes compressed archive uploads (.zip) and uncompressed project folders, identifying codebase manifests (`package.json`, `pyproject.toml`, `go.mod`, `pom.xml`).
- **Code Health Engine**: Utilizes `ts-morph` abstract syntax tree (AST) traversal to detect unused exports, dead imports, circular dependencies, oversized functions, and high cyclomatic complexity.
- **Security & Secret Scanner**: Executes regex pattern scanning against source code files to intercept exposed live API keys (Stripe, AWS, OpenAI, GitHub), private certificates, JWT tokens, raw SQL query concatenation, and committed environment variables.
- **Build & Test Verification**: Spawns isolated process execution runners (`execa`) to run `tsc` typechecking, linter rules, and automated unit test suites (`jest`, `vitest`, `pytest`) while capturing error output lines.
- **Runtime & UI Navigation**: Launches ephemeral Chromium browser instances (`playwright`) on dynamic TCP ports (`get-port`), crawls top application routes (`/`, `/about`, `/login`, `/dashboard`), captures unhandled console errors and network failures, and executes automated WCAG accessibility rules (`@axe-core/playwright`).
- **Performance Profiling**: Intercepts Navigation Timing API metrics to evaluate Time to First Byte (TTFB), DomContentLoaded latency, and static asset weight boundaries (>1MB).
- **Real-Time Event Streaming**: Connects client state stores (`zustand`) to Next.js Server-Sent Events (SSE) endpoints (`/api/audit/stream`) pushing real-time step progress, execution logs, category scores, and findings.
- **Executive Release Decisions**: Computes overall safety scores (0-100) and categorizes release status into `READY_TO_SHIP`, `REVIEW_BEFORE_SHIP`, or `BLOCKED`.
- **Compliance Export**: Generates printable PDF and JSON audit reports for team review.

---

## Technical Architecture

```text
+-------------------------------------------------------------------+
|                         PreFlight Engine                          |
+-------------------------------------------------------------------+
                                  |
            +---------------------+---------------------+
            |                                           |
+-----------------------+                   +-----------------------+
|  Static Analysis Suite|                   | Dynamic Execution     |
+-----------------------+                   +-----------------------+
| - ts-morph AST Engine |                   | - Process Runner      |
| - Secret Pattern Scan |                   | - Playwright Crawler  |
| - Manifest Detection  |                   | - Axe-core A11y Audit |
+-----------------------+                   +-----------------------+
            |                                           |
            +---------------------+---------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|               Server-Sent Events Stream Orchestrator              |
|                     (/api/audit/stream)                           |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                     Release Status Calculator                     |
|           [ READY_TO_SHIP | REVIEW_BEFORE_SHIP | BLOCKED ]        |
+-------------------------------------------------------------------+
```

---

## Technology Stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, Lucide Icons, Framer Motion
- **State Management**: Zustand
- **Code Analysis**: ts-morph, adm-zip, fast-glob
- **Browser Automation**: Playwright, @axe-core/playwright, get-port
- **Syntax Highlighting**: Prism.js

---

## License

MIT License. Developed for Production Software Engineering Teams.
