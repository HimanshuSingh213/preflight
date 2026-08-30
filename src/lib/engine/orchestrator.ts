import { ProjectSnapshot } from '@/types/project.types';
import { CategoryResult } from '@/types/audit.types';
import { Finding, CheckCategory } from '@/types/finding.types';
import { runCodeHealthCheck } from '@/lib/checks/code-health';
import { runSecurityCheck } from '@/lib/checks/security';
import { runBuildTestCheck } from '@/lib/checks/build-test';
import { runRuntimeUICheck } from '@/lib/checks/runtime-ui';
import { runPerformanceCheck } from '@/lib/checks/performance';
import { calculateReleaseStatus } from '@/lib/engine/release-calculator';

export type SSEEventType =
  | 'AUDIT_STARTED'
  | 'CATEGORY_STARTED'
  | 'CATEGORY_LOG'
  | 'CATEGORY_PROGRESS'
  | 'CATEGORY_FINISHED'
  | 'AUDIT_COMPLETE'
  | 'AUDIT_ERROR';

export interface SSEEvent {
  type: SSEEventType;
  timestamp: string;
  projectId: string;
  category?: CheckCategory;
  progressPercent?: number;
  message?: string;
  level?: 'info' | 'success' | 'warn' | 'error';
  result?: CategoryResult;
  findings?: Finding[];
  report?: unknown;
}

// Global in-memory audit workspace cache attached to globalThis to persist across Next.js requests
const globalForOrchestrator = globalThis as unknown as {
  preflightProjects?: Map<string, ProjectSnapshot>;
};

const ACTIVE_PROJECTS = globalForOrchestrator.preflightProjects || new Map<string, ProjectSnapshot>();
if (!globalForOrchestrator.preflightProjects) {
  globalForOrchestrator.preflightProjects = ACTIVE_PROJECTS;
}

export function registerProjectSnapshot(snapshot: ProjectSnapshot) {
  ACTIVE_PROJECTS.set(snapshot.id, snapshot);
}

export function getProjectSnapshot(projectId: string): ProjectSnapshot | undefined {
  return ACTIVE_PROJECTS.get(projectId);
}

/**
 * Main Audit Orchestrator Engine.
 * Executes requested check categories sequentially, sending live events to an SSE stream controller.
 */
export async function runAuditOrchestration(
  projectId: string,
  selectedChecks: CheckCategory[],
  sendEvent: (event: SSEEvent) => void
): Promise<void> {
  const snapshot = getProjectSnapshot(projectId);

  if (!snapshot) {
    sendEvent({
      type: 'AUDIT_ERROR',
      timestamp: new Date().toISOString(),
      projectId,
      message: `Project workspace '${projectId}' not found or session expired.`,
      level: 'error',
    });
    return;
  }

  const nowIso = () => new Date().toISOString();

  sendEvent({
    type: 'AUDIT_STARTED',
    timestamp: nowIso(),
    projectId,
    progressPercent: 0,
    message: `Initializing PreFlight Audit Engine for ${snapshot.name}...`,
    level: 'info',
  });

  const categoryResults: Partial<Record<CheckCategory, CategoryResult>> = {};
  const allFindings: Finding[] = [];

  const total = selectedChecks.length;

  for (let i = 0; i < total; i++) {
    const category = selectedChecks[i];
    const categoryStartPercent = Math.round((i / total) * 100);

    sendEvent({
      type: 'CATEGORY_STARTED',
      timestamp: nowIso(),
      projectId,
      category,
      progressPercent: categoryStartPercent,
      message: `Starting ${category.toUpperCase()} check suite...`,
      level: 'info',
    });

    sendEvent({
      type: 'CATEGORY_LOG',
      timestamp: nowIso(),
      projectId,
      category,
      message: `Running static and dynamic rules for [${category}]...`,
      level: 'info',
    });

    let catResult: CategoryResult;

    try {
      switch (category) {
        case 'code-health':
          catResult = await runCodeHealthCheck(snapshot);
          break;
        case 'security':
          catResult = await runSecurityCheck(snapshot);
          break;
        case 'build-test':
          catResult = await runBuildTestCheck(snapshot);
          break;
        case 'runtime-ui':
          catResult = await runRuntimeUICheck(snapshot);
          break;
        case 'performance':
          catResult = await runPerformanceCheck(snapshot);
          break;
        default:
          catResult = {
            category,
            status: 'completed',
            score: 100,
            durationMs: 0,
            findings: [],
            summary: `Category ${category} completed.`,
          };
      }
    } catch (err) {
      catResult = {
        category,
        status: 'failed',
        score: 0,
        durationMs: 0,
        findings: [
          {
            id: `err_${Date.now()}`,
            category,
            severity: 'high',
            title: `Execution error in ${category}`,
            description: String(err),
            detector: 'PreFlight Orchestrator',
            recommendation: 'Check server execution permissions and project structure.',
            isBlocker: true,
          },
        ],
        summary: `Error running check ${category}: ${String(err)}`,
      };
    }

    categoryResults[category] = catResult;
    allFindings.push(...catResult.findings);

    const categoryFinishedPercent = Math.round(((i + 1) / total) * 100);

    sendEvent({
      type: 'CATEGORY_FINISHED',
      timestamp: nowIso(),
      projectId,
      category,
      progressPercent: categoryFinishedPercent,
      result: catResult,
      findings: catResult.findings,
      message: `[${category.toUpperCase()}] finished with score ${catResult.score}/100 (${catResult.findings.length} findings).`,
      level: catResult.findings.some((f) => f.severity === 'critical' || f.isBlocker)
        ? 'error'
        : catResult.findings.length > 0
        ? 'warn'
        : 'success',
    });
  }

  // Compile overall report
  const overallReport = calculateReleaseStatus({
    snapshot,
    categoryResults: categoryResults as Record<string, CategoryResult>,
  });

  sendEvent({
    type: 'AUDIT_COMPLETE',
    timestamp: nowIso(),
    projectId,
    progressPercent: 100,
    message: `PreFlight audit complete! Final Decision: ${overallReport.releaseStatus} (Score: ${overallReport.overallScore}/100)`,
    level: 'success',
    report: overallReport,
  });
}
