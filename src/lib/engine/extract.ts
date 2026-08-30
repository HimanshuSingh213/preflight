import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import AdmZip from 'adm-zip';
import glob from 'fast-glob';

export interface ExtractedWorkspace {
  projectId: string;
  originalName: string;
  workspacePath: string;
  totalFiles: number;
  ignoredFiles: number;
  fileList: string[];
  isCodebase: boolean;
}

const IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/.next/**',
  '**/dist/**',
  '**/build/**',
  '**/coverage/**',
  '**/.git/**',
  '**/.cache/**',
  '**/.DS_Store',
  '**/__pycache__/**',
  '**/target/**'
];

const CODEBASE_MANIFESTS = new Set([
  'package.json',
  'pyproject.toml',
  'requirements.txt',
  'Pipfile',
  'go.mod',
  'pom.xml',
  'build.gradle',
  'Cargo.toml',
  'Composer.json',
  'Makefile',
  'CMakeLists.txt'
]);

const CODE_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.py', '.go', '.java',
  '.c', '.cpp', '.h', '.rs', '.php', '.rb', '.html',
  '.css', '.json', '.vue', '.svelte', '.sh'
]);

function validateCodebase(files: string[]): boolean {
  let hasManifest = false;
  let codeFileCount = 0;

  for (const file of files) {
    const filename = path.basename(file);
    if (CODEBASE_MANIFESTS.has(filename)) {
      hasManifest = true;
    }
    const ext = path.extname(file).toLowerCase();
    if (CODE_EXTENSIONS.has(ext)) {
      codeFileCount++;
    }
  }

  return hasManifest || codeFileCount >= 1;
}

function normalizeRootDirectory(targetDir: string): string {
  const entries = fs.readdirSync(targetDir).filter((e) => e !== '__MACOSX' && e !== '.DS_Store');
  if (entries.length === 1) {
    const singlePath = path.join(targetDir, entries[0]);
    if (fs.statSync(singlePath).isDirectory()) {
      return singlePath;
    }
  }
  return targetDir;
}

export async function processProjectInput(
  input: Buffer | string,
  originalFilename?: string
): Promise<ExtractedWorkspace> {
  const projectId = `pf_${crypto.randomUUID()}`;
  const baseTempPath = path.join(os.tmpdir(), 'preflight', projectId);

  fs.mkdirSync(baseTempPath, { recursive: true });

  let targetWorkspace: string;
  let derivedName = originalFilename ? path.basename(originalFilename, path.extname(originalFilename)) : 'workspace';

  if (typeof input === 'string' && fs.existsSync(input) && fs.statSync(input).isDirectory()) {
    targetWorkspace = input;
    derivedName = path.basename(input);
  } else {
    try {
      const zip = new AdmZip(input);
      
      const zipEntries = zip.getEntries();
      for (const entry of zipEntries) {
        const destPath = path.join(baseTempPath, entry.entryName);
        if (!destPath.startsWith(baseTempPath)) {
          throw new Error('Security Error: Zip entry attempts path traversal outside target directory.');
        }
      }

      zip.extractAllTo(baseTempPath, true);
      targetWorkspace = normalizeRootDirectory(baseTempPath);
      
      if (derivedName === 'workspace' && targetWorkspace !== baseTempPath) {
        derivedName = path.basename(targetWorkspace);
      }
    } catch (err: any) {
      cleanupWorkspace(baseTempPath);
      throw new Error(`Failed to extract project archive: ${err.message}`);
    }
  }

  const allFiles = await glob('**/*', {
    cwd: targetWorkspace,
    dot: true,
    onlyFiles: true,
  });

  const validFiles = await glob('**/*', {
    cwd: targetWorkspace,
    ignore: IGNORE_PATTERNS,
    dot: true,
    onlyFiles: true,
  });

  const isCodebase = validateCodebase(validFiles);

  if (!isCodebase) {
    if (targetWorkspace.startsWith(os.tmpdir())) {
      cleanupWorkspace(baseTempPath);
    }
    throw new Error('Invalid project upload: The provided archive or directory does not contain a recognized software codebase.');
  }

  return {
    projectId,
    originalName: derivedName,
    workspacePath: targetWorkspace,
    totalFiles: validFiles.length,
    ignoredFiles: allFiles.length - validFiles.length,
    fileList: validFiles,
    isCodebase: true,
  };
}

export function cleanupWorkspace(workspacePath: string): void {
  if (fs.existsSync(workspacePath)) {
    fs.rmSync(workspacePath, { recursive: true, force: true });
  }
}
