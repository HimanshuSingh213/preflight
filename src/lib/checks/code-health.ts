import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ProjectSnapshot } from '@/types/project.types';
import { CategoryResult, CheckStatus } from '@/types/audit.types';
import { Finding } from '@/types/finding.types';

/**
 * Robust Multi-Stack Static Code Health Analyzer.
 * Supports TypeScript, JavaScript, Python, Go, and Java projects.
 * Enforces deduplication and file caps to handle large repositories gracefully.
 */
export async function runCodeHealthCheck(snapshot: ProjectSnapshot): Promise<CategoryResult> {
  const startTime = Date.now();
  const findings: Finding[] = [];

  const { files, dependencies, devDependencies } = snapshot;

  // 1. Documentation Audit
  const hasReadme = files.some((f) =>
    path.basename(f.relativePath).toLowerCase().startsWith('readme')
  );
  if (!hasReadme) {
    findings.push({
      id: `ch_${crypto.randomUUID()}`,
      category: 'code-health',
      severity: 'low',
      title: 'Missing README documentation',
      description: 'The project does not include a README file explaining setup or usage.',
      detector: 'PreFlight Static Health',
      recommendation: 'Add a standard README.md file at the project root.',
      isBlocker: false,
    });
  }

  // Filter multi-stack source files
  const codeFiles = files.filter((f) =>
    ['.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.java'].includes(f.extension)
  );

  let aggregatedCodeText = '';

  for (const file of codeFiles) {
    try {
      const content = fs.readFileSync(file.path, 'utf-8');
      aggregatedCodeText += ' ' + content;

      // 2. Large File Check (> 400 lines)
      const lines = content.split('\n');
      if (lines.length > 400) {
        findings.push({
          id: `ch_${crypto.randomUUID()}`,
          category: 'code-health',
          severity: 'medium',
          title: `Oversized source file (${lines.length} lines)`,
          description: `File '${file.relativePath}' exceeds recommended length of 400 lines.`,
          detector: 'PreFlight AST/Line Scanner',
          location: { file: file.relativePath, line: 1 },
          recommendation: 'Refactor module into smaller helper functions or modular sub-components.',
          isBlocker: false,
        });
      }

      // 3. Multi-Stack Debug Statement Scanner (Capped at 2 per file to prevent spam in large projects)
      if (!file.isTestFile) {
        let debugMatchesCount = 0;

        lines.forEach((lineText, idx) => {
          if (debugMatchesCount >= 2) return;
          const trimmed = lineText.trim();
          if (trimmed.startsWith('//') || trimmed.startsWith('#') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
            return;
          }

          let isDebugStatement = false;
          let debugType = '';

          // JS/TS
          if (['.js', '.jsx', '.ts', '.tsx'].includes(file.extension)) {
            if (trimmed.includes('console.log(') || trimmed.includes('console.dir(')) {
              isDebugStatement = true;
              debugType = 'console.log';
            }
          }
          // Python
          else if (file.extension === '.py') {
            if (trimmed.includes('print(') && !trimmed.includes('logger.print')) {
              isDebugStatement = true;
              debugType = 'print statement';
            }
          }
          // Go
          else if (file.extension === '.go') {
            if (trimmed.includes('fmt.Println(') || trimmed.includes('println(')) {
              isDebugStatement = true;
              debugType = 'fmt.Println';
            }
          }
          // Java
          else if (file.extension === '.java') {
            if (trimmed.includes('System.out.println(')) {
              isDebugStatement = true;
              debugType = 'System.out.println';
            }
          }

          if (isDebugStatement) {
            debugMatchesCount++;
            findings.push({
              id: `ch_${crypto.randomUUID()}`,
              category: 'code-health',
              severity: 'low',
              title: `Leftover ${debugType} detected`,
              description: `Debug print statement found in production code.`,
              detector: 'PreFlight Pattern Scanner',
              location: {
                file: file.relativePath,
                line: idx + 1,
                snippet: trimmed.slice(0, 100),
              },
              recommendation: 'Remove debug output before deploying to production.',
              isBlocker: false,
            });
          }
        });
      }

      // 4. Code Nesting Complexity (Capped at 2 per file)
      let nestingMatchesCount = 0;
      lines.forEach((lineText, idx) => {
        if (nestingMatchesCount >= 2) return;
        const indentMatch = lineText.match(/^( {16,}|\t{4,})/);
        if (indentMatch && lineText.trim().length > 0) {
          nestingMatchesCount++;
          findings.push({
            id: `ch_${crypto.randomUUID()}`,
            category: 'code-health',
            severity: 'low',
            title: 'High code nesting complexity',
            description: `Code exceeds 4 levels of indentation at line ${idx + 1}.`,
            detector: 'PreFlight Complexity Analyzer',
            location: {
              file: file.relativePath,
              line: idx + 1,
              snippet: lineText.trim().slice(0, 80),
            },
            recommendation: 'Refactor deeply nested logic into early returns or auxiliary functions.',
            isBlocker: false,
          });
        }
      });
    } catch {
      // Ignore read errors
    }
  }

  // 5. Unused Dependencies Check
  const allDeclaredDeps = Object.keys({ ...dependencies, ...devDependencies });
  const IGNORE_UNUSED_DEPS = new Set([
    'typescript', '@types/node', 'eslint', 'eslint-config-next', 'prettier',
    'tailwindcss', 'postcss', '@tailwindcss/postcss', 'autoprefixer',
    'jest', 'vitest', 'nodemon', 'ts-node', 'rimraf', 'cross-env', 'tsx',
    'tsup', 'esbuild', 'turbo', 'concurrently', 'npm-run-all', 'wait-on',
    'dotenv', 'dotenv-cli', 'prisma', 'drizzle-kit', 'babel-plugin-react-compiler',
    'vite-plugin-svgr', 'vite-tsconfig-paths', '@vitejs/plugin-react',
    '@vitejs/plugin-vue', '@vitejs/plugin-react-swc', '@sveltejs/vite-plugin-svelte'
  ]);

  allDeclaredDeps.forEach((dep) => {
    if (IGNORE_UNUSED_DEPS.has(dep) || dep.startsWith('@types/')) return;
    
    const escapedDep = dep.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const importRegex = new RegExp(`from\\s+['"]${escapedDep}(?:/[^'"]*)?['"]|require\\(['"]${escapedDep}(?:/[^'"]*)?['"]\\)`, 'g');
    if (!importRegex.test(aggregatedCodeText)) {
      findings.push({
        id: `ch_${crypto.randomUUID()}`,
        category: 'code-health',
        severity: 'low',
        title: `Potentially unused dependency: ${dep}`,
        description: `Package '${dep}' is declared in package.json but no explicit import was detected.`,
        detector: 'PreFlight Dependency Scanner',
        recommendation: `Remove '${dep}' if it is no longer required.`,
        isBlocker: false,
      });
    }
  });

  // Score Calculation
  let scoreDeductions = 0;
  findings.forEach((f) => {
    if (f.severity === 'high') scoreDeductions += 15;
    else if (f.severity === 'medium') scoreDeductions += 8;
    else if (f.severity === 'low') scoreDeductions += 3;
  });

  const score = Math.max(0, 100 - scoreDeductions);
  const durationMs = Date.now() - startTime;
  const status: CheckStatus = 'completed';

  return {
    category: 'code-health',
    status,
    score,
    durationMs,
    findings,
    summary: `Analyzed ${codeFiles.length} source files across ${snapshot.stack.language}. Found ${findings.length} code health findings.`,
  };
}
