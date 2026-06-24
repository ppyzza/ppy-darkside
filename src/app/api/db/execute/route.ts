import { NextResponse } from 'next/server';
import { Client } from 'pg';

export async function POST(req: Request) {
  try {
    const { connectionString, dbConfig, query } = await req.json();
    
    if ((!connectionString && !dbConfig) || !query) {
      return NextResponse.json({ success: false, error: 'connection details and query are required' }, { status: 400 });
    }

    const clientConfig: any = dbConfig ? { ...dbConfig } : { connectionString };
    if (clientConfig.ssl) {
      clientConfig.ssl = { rejectUnauthorized: false };
    }
    const client = new Client(clientConfig);
    await client.connect();

    // Execute the raw SQL string
    const result = await client.query(query);
    await client.end();

    return NextResponse.json({ success: true, rowCount: result.rowCount || 0 });
  } catch (err: any) {
    let msg = err?.message || String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
