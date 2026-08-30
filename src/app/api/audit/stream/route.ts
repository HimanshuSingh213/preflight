import { NextRequest } from 'next/server';
import { runAuditOrchestration, SSEEvent } from '@/lib/engine/orchestrator';
import { CheckCategory } from '@/types/finding.types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId') || searchParams.get('id');
  const checksQuery = searchParams.get('checks');

  if (!projectId) {
    return new Response(JSON.stringify({ error: 'Missing query parameter: projectId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const selectedChecks: CheckCategory[] = checksQuery
    ? (checksQuery.split(',') as CheckCategory[])
    : ['code-health', 'security', 'build-test', 'runtime-ui', 'performance'];

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: SSEEvent) => {
        try {
          const data = `data: ${JSON.stringify(event)}\n\n`;
          controller.enqueue(encoder.encode(data));
        } catch {
          // Ignore stream write errors if client disconnected
        }
      };

      try {
        await runAuditOrchestration(projectId, selectedChecks, sendEvent);
      } catch (err: any) {
        sendEvent({
          type: 'AUDIT_ERROR',
          timestamp: new Date().toISOString(),
          projectId,
          message: err?.message || 'Unexpected failure during orchestration execution.',
          level: 'error',
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
