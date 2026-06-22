import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { targetPath } = await req.json();

    if (!targetPath || !path.isAbsolute(targetPath)) {
      return NextResponse.json({ success: false, error: 'Valid absolute path required' }, { status: 400 });
    }

    if (!fs.existsSync(targetPath)) {
      return NextResponse.json({ success: false, error: 'Path does not exist' }, { status: 400 });
    }

    const items = fs.readdirSync(targetPath);
    
    const directories: string[] = [];
    const files: string[] = [];

    for (const item of items) {
      if (item.startsWith('.') || item === 'node_modules') continue;
      
      const fullPath = path.join(targetPath, item);
      try {
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          directories.push(item);
        } else if (stat.isFile() && item.endsWith('.hcl')) {
          files.push(item);
        }
      } catch (err) {
        // Ignore permission errors on specific files
      }
    }

    return NextResponse.json({ 
      success: true, 
      directories: directories.sort(), 
      files: files.sort() 
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
