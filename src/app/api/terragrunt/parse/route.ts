import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Helper to recursively find files
function findFiles(dir: string, pattern: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      // Avoid traversing node_modules or hidden folders to save time
      if (!file.startsWith('.') && file !== 'node_modules') {
        findFiles(filePath, pattern, fileList);
      }
    } else {
      if (filePath.endsWith(pattern)) {
        fileList.push(filePath);
      }
    }
  }

  return fileList;
}

function extractEnvData(hclContent: string, blockStartText: string, isSecret: boolean): Record<string, string> {
  const result: Record<string, string> = {};
  const blockStartIdx = hclContent.indexOf(blockStartText);
  if (blockStartIdx === -1) return result;

  const chunk = hclContent.substring(blockStartIdx, blockStartIdx + 15000);
  let endIdx = chunk.indexOf('\n  service_', 10);
  if (endIdx === -1) endIdx = chunk.indexOf('\n  #################', 10);
  if (endIdx === -1) endIdx = chunk.indexOf('\n}', 10);
  if (endIdx === -1) endIdx = chunk.length;

  const arrayContent = chunk.substring(0, endIdx);

  const objectRegex = /\{([^}]+)\}/g;
  let match;
  while ((match = objectRegex.exec(arrayContent)) !== null) {
    const objStr = match[1];
    
    const nameMatch = /"?name"?\s*[:=]\s*"([^"]+)"/.exec(objStr);
    if (nameMatch) {
      const name = nameMatch[1];
      
      let valueMatch;
      if (isSecret) {
        valueMatch = /"?valueFrom"?\s*[:=]\s*[“"']([^”"']+)[”"']/.exec(objStr);
      } else {
        valueMatch = /"?value"?\s*[:=]\s*[“"']([^”"']+)[”"']/.exec(objStr);
      }
      
      result[name] = valueMatch ? valueMatch[1] : '';
    }
  }

  return result;
}

function extractSpecs(hclContent: string): Record<string, string> {
  const result: Record<string, string> = {};
  const inputsIdx = hclContent.indexOf('inputs = {');
  if (inputsIdx === -1) return result;
  
  const chunk = hclContent.substring(inputsIdx, inputsIdx + 30000);
  
  // Look for `key = value` where value is not `[` (start of array) or `{`
  const specRegex = /\n\s{2}([a-zA-Z0-9_]+)\s*=\s*([^\n\[\{]+)/g;
  let match;
  while ((match = specRegex.exec(chunk)) !== null) {
    const key = match[1];
    let val = match[2].trim();
    
    val = val.replace(/,$/, '').replace(/\s*#.*$/, '');
    val = val.replace(/^[“"'](.*)[”"']$/, '$1');
    
    const skipKeys = ['service_environment', 'service_secrets', 'service_volumes', 'service_mount_points'];
    if (!skipKeys.includes(key)) {
      result[key] = val;
    }
  }
  
  return result;
}

export async function POST(req: Request) {
  try {
    const { files } = await req.json();

    if (!files || !Array.isArray(files) || files.length === 0) {
      return NextResponse.json({ success: false, error: 'Missing files array' }, { status: 400 });
    }

    const environments: Record<string, { service_environment: Record<string, string>, service_secrets: Record<string, string>, specs: Record<string, string>, path: string }> = {};
    const allKeysSet = new Set<string>();

    for (const file of files) {
      if (!fs.existsSync(file)) continue;

      const parts = file.split(path.sep);
      let envName = 'unknown';
      if (parts.length >= 3) {
        envName = parts[parts.length - 3];
      }

      const content = fs.readFileSync(file, 'utf8');

      const envMap = extractEnvData(content, 'service_environment = [', false);
      const secretMap = extractEnvData(content, 'service_secrets = [', true);
      const specsMap = extractSpecs(content);

      Object.keys(envMap).forEach(k => allKeysSet.add(k));
      Object.keys(secretMap).forEach(k => allKeysSet.add(k));
      Object.keys(specsMap).forEach(k => allKeysSet.add(k));

      let serviceName = parts[parts.length - 2];
      let displayEnv = `${envName} (${serviceName})`;

      environments[displayEnv] = {
        service_environment: envMap,
        service_secrets: secretMap,
        specs: specsMap,
        path: file
      };
    }

    const allKeys = Array.from(allKeysSet).sort();

    return NextResponse.json({ 
      success: true, 
      environments,
      allKeys
    });

  } catch (err: any) {
    console.error('Terragrunt parse error:', err);
    return NextResponse.json({ success: false, error: err.message || String(err) }, { status: 500 });
  }
}
