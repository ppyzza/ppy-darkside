import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

type ChangePayload = {
  filePath: string;
  key: string;
  newValue: string;
  type: 'Env' | 'Secret' | 'Spec';
};

function replaceEnvValue(hcl: string, key: string, newValue: string, isSecret: boolean): string {
  const blockStart = isSecret ? 'service_secrets = [' : 'service_environment = [';
  const blockStartIdx = hcl.indexOf(blockStart);
  if (blockStartIdx === -1) return hcl;

  const chunk = hcl.substring(blockStartIdx, blockStartIdx + 15000);
  let endIdx = chunk.indexOf('\n  service_', 10);
  if (endIdx === -1) endIdx = chunk.indexOf('\n  #################', 10);
  if (endIdx === -1) endIdx = chunk.indexOf('\n}', 10);
  if (endIdx === -1) endIdx = chunk.length;

  const arrayContent = chunk.substring(0, endIdx);

  const objectRegex = /\{([^}]+)\}/g;
  let match;
  let newArrayContent = arrayContent;
  
  while ((match = objectRegex.exec(arrayContent)) !== null) {
    const objStr = match[1];
    const fullObjMatch = match[0];
    
    const nameMatch = /"?name"?\s*[:=]\s*"([^"]+)"/.exec(objStr);
    
    if (nameMatch && nameMatch[1] === key) {
      let newObjStr = objStr;
      if (isSecret) {
        newObjStr = newObjStr.replace(/("?valueFrom"?\s*[:=]\s*)[“"'][^”"']+[”"']/, `$1"${newValue}"`);
      } else {
        newObjStr = newObjStr.replace(/("?value"?\s*[:=]\s*)[“"'][^”"']+[”"']/, `$1"${newValue}"`);
      }
      
      const newFullObj = `{${newObjStr}}`;
      newArrayContent = newArrayContent.replace(fullObjMatch, newFullObj);
      break; // Only replace the first match
    }
  }

  return hcl.substring(0, blockStartIdx) + newArrayContent + hcl.substring(blockStartIdx + endIdx);
}

function replaceSpecValue(hcl: string, key: string, newValue: string): string {
  const inputsIdx = hcl.indexOf('inputs = {');
  if (inputsIdx === -1) return hcl;

  const chunk = hcl.substring(inputsIdx, inputsIdx + 30000);
  const actualChunkLength = Math.min(30000, hcl.length - inputsIdx);
  const actualChunk = hcl.substring(inputsIdx, inputsIdx + actualChunkLength);
  
  const specRegex = new RegExp(`(\\n\\s+${key}\\s*=\\s*)([^\\n]+)`);
  const match = specRegex.exec(actualChunk);
  
  if (match) {
    const oldVal = match[2];
    const hasQuotes = oldVal.trim().startsWith('"') || oldVal.trim().startsWith('“');
    let replacementVal = newValue;
    
    if (hasQuotes) {
      replacementVal = `"${newValue}"`;
    } else if (newValue === 'true' || newValue === 'false' || !isNaN(Number(newValue))) {
      replacementVal = newValue; // unquoted bool/number
    } else {
      replacementVal = `"${newValue}"`; // default to quote if unclear
    }
    
    const newChunk = actualChunk.replace(specRegex, `$1${replacementVal}`);
    return hcl.substring(0, inputsIdx) + newChunk + hcl.substring(inputsIdx + actualChunkLength);
  }
  
  return hcl;
}

export async function POST(req: Request) {
  try {
    const { changes, commitMessage } = await req.json();

    if (!changes || !Array.isArray(changes) || changes.length === 0) {
      return NextResponse.json({ success: false, error: 'No changes provided' }, { status: 400 });
    }
    if (!commitMessage) {
      return NextResponse.json({ success: false, error: 'Commit message is required' }, { status: 400 });
    }

    const modifiedFiles = new Set<string>();

    // 1. Mutate Files
    for (const change of changes as ChangePayload[]) {
      if (!fs.existsSync(change.filePath)) continue;

      let hcl = fs.readFileSync(change.filePath, 'utf8');

      if (change.type === 'Env') {
        hcl = replaceEnvValue(hcl, change.key, change.newValue, false);
      } else if (change.type === 'Secret') {
        hcl = replaceEnvValue(hcl, change.key, change.newValue, true);
      } else if (change.type === 'Spec') {
        hcl = replaceSpecValue(hcl, change.key, change.newValue);
      }

      fs.writeFileSync(change.filePath, hcl, 'utf8');
      modifiedFiles.add(change.filePath);
    }

    if (modifiedFiles.size === 0) {
      return NextResponse.json({ success: false, error: 'No files were modified.' }, { status: 400 });
    }

    // 2. Git Operations
    // Group files by their git root (assuming they could be from different repos, though unlikely)
    const repos = new Map<string, string[]>();
    
    for (const file of Array.from(modifiedFiles)) {
      const fileDir = path.dirname(file);
      try {
        const { stdout } = await execAsync('git rev-parse --show-toplevel', { cwd: fileDir });
        const gitRoot = stdout.trim();
        if (!repos.has(gitRoot)) repos.set(gitRoot, []);
        repos.get(gitRoot)!.push(file);
      } catch (err) {
        console.warn(`Not a git repo: ${fileDir}`);
      }
    }

    // Commit for each repo
    for (const [gitRoot, files] of Array.from(repos.entries())) {
      try {
        // git add
        for (const file of files) {
          await execAsync(`git add "${file}"`, { cwd: gitRoot });
        }
        // git commit
        const safeMessage = commitMessage.replace(/"/g, '\\"');
        await execAsync(`git commit -m "${safeMessage}"`, { cwd: gitRoot });
      } catch (err: any) {
        console.error('Git error:', err);
        return NextResponse.json({ success: false, error: `Git commit failed: ${err.message}` }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: 'Changes applied and committed successfully' });

  } catch (err: any) {
    console.error('Terragrunt edit error:', err);
    return NextResponse.json({ success: false, error: err.message || String(err) }, { status: 500 });
  }
}
