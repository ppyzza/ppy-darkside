import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const fileName = url.searchParams.get('file');
    
    // Security check: ensure path is within legacy-csv-seeds
    const seedsDir = path.join(process.cwd(), 'legacy-csv-seeds');
    
    if (fileName) {
      // Return file content
      const safePath = path.resolve(seedsDir, fileName);
      if (!safePath.startsWith(seedsDir)) {
         return NextResponse.json({ success: false, error: 'Invalid path' }, { status: 403 });
      }
      if (!fs.existsSync(safePath)) {
         return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });
      }
      
      const content = fs.readFileSync(safePath, 'utf8');
      return NextResponse.json({ success: true, content });
    } else {
      // List files recursively
      if (!fs.existsSync(seedsDir)) {
        return NextResponse.json({ success: true, files: [] });
      }
      
      const files: any[] = [];
      function walkDir(currentDir: string) {
        const entries = fs.readdirSync(currentDir);
        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            walkDir(fullPath);
          } else if (entry.endsWith('.csv')) {
            files.push({
              name: path.relative(seedsDir, fullPath),
              sizeKb: (stat.size / 1024).toFixed(1)
            });
          }
        }
      }
      walkDir(seedsDir);
        
      return NextResponse.json({ success: true, files });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
