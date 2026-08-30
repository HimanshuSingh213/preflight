import { NextRequest, NextResponse } from 'next/server';
import { getProjectSnapshot } from '@/lib/engine/orchestrator';
import { CheckCategory } from '@/types/finding.types';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { projectId, selectedChecks } = body as {
      projectId?: string;
      selectedChecks?: CheckCategory[];
    };

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: projectId' },
        { status: 400 }
      );
    }

    const snapshot = getProjectSnapshot(projectId);
    if (!snapshot) {
      return NextResponse.json(
        { success: false, error: `No active workspace found for projectId '${projectId}'.` },
        { status: 404 }
      );
    }

    const checksToRun: CheckCategory[] = selectedChecks && selectedChecks.length > 0
      ? selectedChecks
      : ['code-health', 'security', 'build-test', 'runtime-ui', 'performance'];

    return NextResponse.json(
      {
        success: true,
        projectId,
        selectedChecks: checksToRun,
        streamUrl: `/api/audit/stream?projectId=${encodeURIComponent(projectId)}&checks=${encodeURIComponent(checksToRun.join(','))}`,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to start audit session.' },
      { status: 500 }
    );
  }
}
