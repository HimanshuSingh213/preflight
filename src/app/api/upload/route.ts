import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { processProjectInput, ExtractedWorkspace } from '@/lib/engine/extract';
import { createProjectSnapshot } from '@/lib/engine/snapshot';
import { registerProjectSnapshot } from '@/lib/engine/orchestrator';
import { ProjectSnapshot } from '@/types/project.types';

export interface UploadApiResponse {
  success: boolean;
  projectId: string;
  workspace: ExtractedWorkspace;
  snapshot: ProjectSnapshot;
  error?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const contentType = request.headers.get('content-type') || '';
    let input: Buffer | string | null = null;
    let uploadName: string | undefined = undefined;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      
      const file = formData.get('file');
      const folderFiles = formData.getAll('files');
      
      const dirPath = 
        (formData.get('path') as string | null) ||
        (formData.get('directoryPath') as string | null) ||
        (formData.get('workspacePath') as string | null) ||
        (formData.get('directory') as string | null);

      if (file && typeof file === 'object' && 'arrayBuffer' in file) {
        const blob = file as Blob & { name?: string };
        uploadName = blob.name || 'project.zip';
        const arrayBuffer = await blob.arrayBuffer();
        if (arrayBuffer.byteLength > 0) {
          input = Buffer.from(arrayBuffer);
        }
      } else if (folderFiles && folderFiles.length > 0) {
        const firstBlob = folderFiles[0] as Blob & { name?: string };
        const relPath = firstBlob.name || 'folder';
        uploadName = relPath.split('/')[0] || 'uploaded-folder';

        const folderTempId = `pf_folder_${crypto.randomUUID()}`;
        const tempFolderDir = path.join(os.tmpdir(), 'preflight', folderTempId);
        fs.mkdirSync(tempFolderDir, { recursive: true });

        for (const item of folderFiles) {
          if (item && typeof item === 'object' && 'arrayBuffer' in item) {
            const blob = item as Blob & { name?: string };
            const relativeFilePath = blob.name || 'file.txt';
            const targetPath = path.join(tempFolderDir, relativeFilePath);

            fs.mkdirSync(path.dirname(targetPath), { recursive: true });
            const buf = Buffer.from(await blob.arrayBuffer());
            fs.writeFileSync(targetPath, buf);
          }
        }
        input = tempFolderDir;
      }

      if (!input && dirPath && typeof dirPath === 'string' && dirPath.trim().length > 0) {
        input = dirPath.trim();
        uploadName = path.basename(input);
      }
    } else if (contentType.includes('application/json')) {
      const body = await request.json();
      const dirPath = body.path || body.directoryPath || body.workspacePath || body.directory;

      if (dirPath && typeof dirPath === 'string' && dirPath.trim().length > 0) {
        input = dirPath.trim();
        uploadName = path.basename(input);
      } else if (body.fileBuffer && typeof body.fileBuffer === 'string') {
        input = Buffer.from(body.fileBuffer, 'base64');
        uploadName = body.fileName || 'uploaded-project';
      }
    } else {
      const arrayBuffer = await request.arrayBuffer();
      if (arrayBuffer && arrayBuffer.byteLength > 0) {
        input = Buffer.from(arrayBuffer);
        uploadName = 'uploaded-project';
      }
    }

    if (!input) {
      return NextResponse.json(
        {
          success: false,
          error: 'No valid file, folder upload, or directory path provided in request.',
        },
        { status: 400 }
      );
    }

    const workspace = await processProjectInput(input, uploadName);
    const snapshot = createProjectSnapshot(workspace);
    registerProjectSnapshot(snapshot);

    return NextResponse.json(
      {
        success: true,
        projectId: snapshot.id,
        workspace,
        snapshot,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'An unknown error occurred during project processing.',
      },
      { status: 400 }
    );
  }
}
